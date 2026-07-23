import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticado } from '@/lib/dashboard/auth-check'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const data_ini = searchParams.get('data_ini') || new Date().toISOString().slice(0,10)
  const data_fim = searchParams.get('data_fim') || data_ini

  const { data, error } = await sb()
    .from('crm_agenda')
    .select(`*, leads(nome, telefone, whatsapp)`)
    .gte('data_hora', data_ini + 'T00:00:00')
    .lte('data_hora', data_fim + 'T23:59:59')
    .order('data_hora', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { titulo, data_hora, tipo, lead_id, local, descricao, lembrete_min } = body

  if (!titulo || !data_hora) return NextResponse.json({ error: 'titulo e data_hora obrigatorios' }, { status: 400 })

  const { data, error } = await sb().from('crm_agenda').insert({
    titulo, data_hora, tipo: tipo || 'reuniao',
    lead_id: lead_id || null, local: local || null,
    descricao: descricao || null,
    lembrete_min: lembrete_min ?? 30,
    status: 'agendado'
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, ...update } = body
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })
  update.updated_at = new Date().toISOString()
  const { data, error } = await sb().from('crm_agenda').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })
  const { error } = await sb().from('crm_agenda').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
