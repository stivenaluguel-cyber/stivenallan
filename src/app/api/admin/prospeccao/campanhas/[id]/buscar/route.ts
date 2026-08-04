import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { buscarPlacesMultiplas, type PlaceCandidato } from '@/lib/prospeccao/google-places'
import { chunk, classificacaoPorScore, montarPromptScoring, parseScoring, scoreFinal, TAMANHO_LOTE_SCORING } from '@/lib/prospeccao/prompts'
import { logInfo } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/prospeccao/buscar'

type Params = { params: Promise<{ id: string }> }

const QUANTIDADE_PADRAO = 20
const QUANTIDADE_MIN = 5
const QUANTIDADE_MAX = 50
// Teto de candidatos brutos admitidos por busca (antes de qualificar). A
// qualificação em si roda em lotes de TAMANHO_LOTE_SCORING (ver prompts.ts)
// — esse teto existe pra limitar quantas chamadas de IA em paralelo uma
// única busca dispara, não pra caber numa resposta só.
const MAX_CANDIDATOS_PARA_SCORING = 60

export async function POST(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ error: 'GOOGLE_PLACES_API_KEY nao configurada' }, { status: 503 })
  }
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY nao configurada' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const quantidadeBruta = typeof body?.quantidade === 'number' ? Math.round(body.quantidade) : QUANTIDADE_PADRAO
  const quantidade = Math.min(Math.max(quantidadeBruta, QUANTIDADE_MIN), QUANTIDADE_MAX)

  const client = sb()
  const { data: campanha } = await client.from('prospeccao_campanhas').select('*').eq('id', id).single()
  if (!campanha) return NextResponse.json({ error: 'Campanha nao encontrada' }, { status: 404 })

  const queries: string[] = Array.isArray(campanha.queries_busca) ? campanha.queries_busca : []
  if (queries.length === 0) {
    return NextResponse.json({ error: 'Campanha sem queries de busca — recrie a campanha.' }, { status: 400 })
  }

  const busca = await buscarPlacesMultiplas(queries, 20)
  if (!busca.ok) {
    if (busca.skipped) return NextResponse.json({ error: 'GOOGLE_PLACES_API_KEY nao configurada' }, { status: 503 })
    return NextResponse.json({ error: busca.error }, { status: 502 })
  }

  const { data: existentes } = await client.from('prospeccao_leads').select('place_id').eq('campanha_id', id)
  const placeIdsExistentes = new Set((existentes ?? []).map((r: { place_id: string }) => r.place_id))
  const novos = busca.candidatos.filter((c) => !placeIdsExistentes.has(c.placeId))

  if (novos.length === 0) {
    return NextResponse.json({ analisados: busca.candidatos.length, entregues: 0, leads: [] })
  }

  const paraScoring = novos.slice(0, MAX_CANDIDATOS_PARA_SCORING)
  const criterios: string[] = Array.isArray(campanha.criterios) ? campanha.criterios : []

  const groq = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' })

  // Em lotes: 60 candidatos numa chamada só de IA excedia o limite de
  // tokens da resposta em produção (JSON de 60 objetos cortado no meio,
  // rejeitado inteiro pelo parser — bug real encontrado testando com uma
  // busca de imobiliárias em Criciúma que trouxe 60 candidatos únicos).
  // Cada lote roda numa chamada independente, em paralelo; um lote falhando
  // não derruba os outros — mesma filosofia de parseScoring, agora um nível
  // acima.
  const lotes = chunk(paraScoring, TAMANHO_LOTE_SCORING)
  const resultadosPorLote = await Promise.all(
    lotes.map(async (lote) => {
      try {
        const resposta = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: montarPromptScoring({ produto: campanha.produto, alvo: campanha.alvo, criterios, candidatos: lote }) }],
          max_tokens: 4000,
          temperature: 0.3,
        })
        return { scores: parseScoring(resposta.choices[0]?.message?.content ?? '', lote), tokens: resposta.usage?.total_tokens ?? 0 }
      } catch {
        return { scores: [], tokens: 0 }
      }
    }),
  )
  const scores = resultadosPorLote.flatMap((r) => r.scores)
  // Mesmo log de campanhas/route.ts — teto diário de tokens no plano
  // gratuito da Groq é o limite real (ver mensagem ao usuário sobre quantos
  // ciclos/dia cabem). candidatosPorLote ajuda a explicar o custo variar
  // entre buscas: campanha nova sempre gera até 3 lotes, "Garimpar mais"
  // pode gerar menos se já tiver poucos candidatos novos.
  logInfo(SOURCE, 'scoring concluído', {
    operacao: 'scoring',
    lotes: lotes.length,
    candidatosPorLote: lotes.map((l) => l.length),
    tokens: resultadosPorLote.reduce((soma, r) => soma + r.tokens, 0),
  })

  if (scores.length === 0) {
    return NextResponse.json({ error: 'A IA respondeu fora do formato esperado ao qualificar os candidatos. Tente de novo.' }, { status: 502 })
  }

  const porPlaceId = new Map<string, PlaceCandidato>(paraScoring.map((c) => [c.placeId, c]))
  const combinados = scores
    .map((s) => {
      const candidato = porPlaceId.get(s.placeId)
      if (!candidato) return null
      const score = scoreFinal(s)
      return { candidato, score, ...s }
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, quantidade)

  if (combinados.length === 0) {
    return NextResponse.json({ analisados: paraScoring.length, entregues: 0, leads: [] })
  }

  const linhas = combinados.map((c) => ({
    campanha_id: id,
    place_id: c.candidato.placeId,
    nome: c.candidato.nome,
    endereco: c.candidato.endereco,
    telefone: c.candidato.telefone,
    site: c.candidato.site,
    rating: c.candidato.rating,
    rating_count: c.candidato.ratingCount,
    tipos: c.candidato.tipos,
    score: c.score,
    score_fit: c.scoreFit,
    score_potencial: c.scorePotencial,
    score_acessibilidade: c.scoreAcessibilidade,
    classificacao: classificacaoPorScore(c.score),
    contexto_ia: c.contexto,
  }))

  const { data: inseridos, error: erroInsert } = await client.from('prospeccao_leads').insert(linhas).select()
  if (erroInsert) return NextResponse.json({ error: erroInsert.message }, { status: 500 })

  await client
    .from('prospeccao_campanhas')
    .update({
      leads_solicitados: (campanha.leads_solicitados ?? 0) + quantidade,
      leads_entregues: (campanha.leads_entregues ?? 0) + (inseridos?.length ?? 0),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  return NextResponse.json({ analisados: paraScoring.length, entregues: inseridos?.length ?? 0, leads: inseridos ?? [] })
}
