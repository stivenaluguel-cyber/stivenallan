import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { Database } from '@/types/database.generated'

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'Serviço indisponível' }, { status: 503 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const empreendimentoId = searchParams.get('empreendimento_id')

  let query = supabase
    .from('leads')
    .select('*, empreendimentos(nome, slug, cidade)')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (empreendimentoId) {
    // Item 6A: bug real confirmado pelo tipo oficial (src/types/database.generated.ts,
    // gerado via Supabase CLI) — `leads` nunca teve coluna `empreendimento_id`.
    // A FK real é `empreendimento_interesse` (leads_empreendimento_interesse_fkey,
    // ver supabase/migrations/20260726235000_baseline_schema.sql linha 599).
    // Esse filtro sempre devolvia 400 do PostgREST quando usado (parâmetro de
    // URL segue `empreendimento_id` de propósito — é a query string pública
    // da API, não a coluna do banco; só o `.eq()` estava errado).
    query = query.eq('empreendimento_interesse', empreendimentoId)
  }

  const { data, error } = await query

  const { data: eventosData } = await supabase
    .from('lead_eventos')
    .select('lead_id, tipo')

  const contadores = new Map<string, { visitas: number; downloads: number }>()
  for (const e of eventosData ?? []) {
    if (!e.lead_id) continue
    const c = contadores.get(e.lead_id) ?? { visitas: 0, downloads: 0 }
    if (e.tipo === 'visita') c.visitas++
    if (e.tipo === 'download') c.downloads++
    contadores.set(e.lead_id, c)
  }

  // Interesses por empreendimento (chip "Interesses · N" do Kanban) — mesmo
  // padrão do agregado acima, uma segunda query em lote, sem N+1 por lead.
  const { data: interessesData } = await supabase
    .from('lead_property_interests')
    .select('lead_id, property_id, last_seen_at, properties(nome, slug)')

  type UltimoInteresse = { nome: string | null; slug: string | null; em: string }
  const interesses = new Map<string, { count: number; ultimo: UltimoInteresse | null }>()
  for (const it of interessesData ?? []) {
    if (!it.lead_id) continue
    const atual = interesses.get(it.lead_id) ?? { count: 0, ultimo: null }
    atual.count++
    const propriedade = Array.isArray(it.properties) ? it.properties[0] : it.properties
    if (!atual.ultimo || new Date(it.last_seen_at as string) > new Date(atual.ultimo.em)) {
      atual.ultimo = { nome: propriedade?.nome ?? null, slug: propriedade?.slug ?? null, em: it.last_seen_at as string }
    }
    interesses.set(it.lead_id, atual)
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const leadsComContadores = (data ?? []).map((lead: Record<string, unknown>) => ({
    ...lead,
    visitas: contadores.get(lead.id as string)?.visitas ?? 0,
    downloads: contadores.get(lead.id as string)?.downloads ?? 0,
    interesses_count: interesses.get(lead.id as string)?.count ?? 0,
    ultimo_interesse: interesses.get(lead.id as string)?.ultimo ?? null,
  }))

  return NextResponse.json(leadsComContadores)
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'Serviço indisponível' }, { status: 503 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const whatsapp = typeof body.whatsapp === 'string' ? body.whatsapp.replace(/\D/g, '') : ''
  if (!whatsapp) {
    return NextResponse.json({ error: 'WhatsApp é obrigatório' }, { status: 400 })
  }

  // Tipado contra o schema real (Database['public']['Tables']['leads']['Insert'])
  // — prova a integração: um NOME de coluna incompatível com `leads` seria
  // rejeitado pelo TypeScript aqui. Os valores em si continuam exatamente
  // como body os entregou (cast, não validação nova) — mesmo comportamento
  // de runtime de antes, escopo desta tarefa é tipagem, não validação.
  const insert: Database['public']['Tables']['leads']['Insert'] = {
    whatsapp,
    nome: (body.nome ?? null) as string | null,
    email: (body.email ?? null) as string | null,
    origem: (body.origem ?? null) as string | null,
    orcamento_max: (body.orcamento_max ?? null) as number | null,
    estagio_funil: (body.estagio_funil ?? 'primeiro_contato') as string,
  }

  const { data, error } = await supabase.from('leads').insert(insert).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
