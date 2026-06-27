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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
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
