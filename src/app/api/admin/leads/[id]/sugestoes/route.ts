import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import {
  MAX_HISTORICO, MAX_MENSAGEM, montarPromptSocio, parseSugestoes, ultimaMensagemDoLead,
  type MensagemSocio,
} from '@/lib/dashboard/socio'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

// String literal única de propósito: o tipo do `.select()` do supabase-js é
// inferido a partir do literal, e uma concatenação em runtime derruba a
// inferência para GenericStringError.
const CAMPOS_LEAD = 'nome, estagio_funil, temperatura, perfil, motivacao, prazo_compra, cidade_interesse, orcamento_max, faixa_investimento, entrada_disponivel, anotacoes, property_name, empreendimentos(nome, cidade)'

/**
 * Gera três caminhos de resposta pra mensagem que o lead mandou.
 *
 * A rota NÃO envia nada — devolve texto pro corretor revisar. Follow-up neste
 * projeto é manual por decisão, então nenhum fluxo novo dispara WhatsApp
 * sozinho.
 *
 * `mensagem` no body é opcional: sem ela, usa a última fala do lead já
 * registrada em `interacoes`. Colar serve pro caso da conversa ter acontecido
 * fora do painel (WhatsApp do celular).
 */
export async function POST(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY nao configurada' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const colada = typeof body?.mensagem === 'string' ? body.mensagem.trim().slice(0, MAX_MENSAGEM) : ''

  const client = sb()
  const [{ data: lead }, { data: recentes }] = await Promise.all([
    client.from('leads').select(CAMPOS_LEAD).eq('id', id).single(),
    client
      .from('interacoes')
      .select('direcao, mensagem')
      .eq('lead_id', id)
      .eq('canal', 'whatsapp')
      .order('created_at', { ascending: false })
      .limit(MAX_HISTORICO),
  ])

  if (!lead) return NextResponse.json({ error: 'Lead nao encontrado' }, { status: 404 })

  // A query vem em ordem decrescente (pra pegar as N mais RECENTES); o prompt
  // precisa da conversa em ordem de leitura.
  const historico = ((recentes ?? []) as MensagemSocio[]).slice().reverse()
  const mensagem = colada || ultimaMensagemDoLead(historico)
  if (!mensagem) {
    return NextResponse.json(
      { error: 'Nao ha mensagem do lead registrada aqui. Cole a resposta dele para o Socio ler.' },
      { status: 400 },
    )
  }

  const groq = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' })

  let bruto = ''
  try {
    const resposta = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: montarPromptSocio({ lead, mensagem, historico }) }],
      max_tokens: 700,
      temperature: 0.6,
    })
    bruto = resposta.choices[0]?.message?.content ?? ''
  } catch {
    return NextResponse.json({ error: 'Falha ao falar com a IA. Tente de novo.' }, { status: 502 })
  }

  const sugestoes = parseSugestoes(bruto)
  if (!sugestoes.length) {
    return NextResponse.json({ error: 'A IA respondeu fora do formato esperado. Tente de novo.' }, { status: 502 })
  }

  return NextResponse.json({
    sugestoes,
    mensagem_base: mensagem,
    origem: colada ? 'colada' : 'historico',
  })
}
