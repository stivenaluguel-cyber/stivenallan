import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

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
    query = query.eq('empreendimento_id', empreendimentoId)
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const leadsComContadores = (data ?? []).map((lead: Record<string, unknown>) => ({
    ...lead,
    visitas: contadores.get(lead.id as string)?.visitas ?? 0,
    downloads: contadores.get(lead.id as string)?.downloads ?? 0,
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

  const insert: Record<string, unknown> = {
    whatsapp,
    nome: body.nome ?? null,
    email: body.email ?? null,
    origem: body.origem ?? null,
    orcamento_max: body.orcamento_max ?? null,
    estagio_funil: body.estagio_funil ?? 'primeiro_contato',
  }

  const { data, error } = await supabase.from('leads').insert(insert).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
