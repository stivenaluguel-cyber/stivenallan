import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { montarPromptIcp, parseIcp } from '@/lib/prospeccao/prompts'
import { logInfo } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/prospeccao/campanhas'

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb()
    .from('prospeccao_campanhas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ campanhas: data ?? [] })
}

/**
 * Cria a campanha a partir das respostas do formulário — a IA já monta o
 * ICP (alvo/abordagem/estratégia/critérios) e as queries de busca do Google
 * Places nesta chamada, pra próxima tela (a prévia) só exibir, sem esperar
 * de novo. A busca em si (que consome cota do Places) só roda quando o
 * corretor confirma em POST /campanhas/[id]/buscar.
 */
export async function POST(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY nao configurada' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const produto = typeof body?.produto === 'string' ? body.produto.trim() : ''
  if (!produto) return NextResponse.json({ error: 'Descreva o que você vende.' }, { status: 400 })

  const respostas = {
    produto,
    publico: typeof body?.publico === 'string' ? body.publico.trim() || null : null,
    problema: typeof body?.problema === 'string' ? body.problema.trim() || null : null,
    localizacao: typeof body?.localizacao === 'string' ? body.localizacao.trim() || null : null,
    exemplos: typeof body?.exemplos === 'string' ? body.exemplos.trim() || null : null,
  }

  const groq = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' })

  let bruto = ''
  try {
    const resposta = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: montarPromptIcp(respostas) }],
      max_tokens: 800,
      temperature: 0.5,
    })
    bruto = resposta.choices[0]?.message?.content ?? ''
    // Groq (llama-3.3-70b) tem teto diário de tokens no plano gratuito —
    // este log é o jeito de saber quanto cada operação consome sem precisar
    // adivinhar (ver get_runtime_logs da Vercel pra somar o dia).
    logInfo(SOURCE, 'ICP gerado', { operacao: 'icp', tokens: resposta.usage?.total_tokens ?? null })
  } catch {
    return NextResponse.json({ error: 'Falha ao falar com a IA. Tente de novo.' }, { status: 502 })
  }

  const icp = parseIcp(bruto)
  if (!icp) {
    return NextResponse.json({ error: 'A IA respondeu fora do formato esperado. Tente de novo.' }, { status: 502 })
  }

  const { data, error } = await sb()
    .from('prospeccao_campanhas')
    .insert({
      admin_id: adminId,
      nome: icp.nomeCampanha,
      produto: respostas.produto,
      publico: respostas.publico,
      problema: respostas.problema,
      localizacao: respostas.localizacao,
      exemplos: respostas.exemplos,
      alvo: icp.alvo,
      abordagem: icp.abordagem,
      estrategia: icp.estrategia,
      criterios: icp.criterios,
      queries_busca: icp.queries,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ campanha: data })
}
