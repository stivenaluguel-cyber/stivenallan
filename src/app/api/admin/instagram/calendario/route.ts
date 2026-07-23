import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computeCalendarGates, type CalendarEntryForGates } from '@/lib/dashboard/instagram-gates'
import { adminIdAutenticado } from '@/lib/dashboard/auth-check'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Roda os gatilhos G4/G5 sobre o calendário inteiro e grava alerta novo em
// crm_notificacoes (dedupe por tipo+gate+data, pra não repetir alerta a cada PATCH).
async function checkAndNotifyGates(adminId: string) {
  const { data: entries } = await sb()
    .from('ig_content_calendar')
    .select('id, data, tipo, status, watch_time_seg')
    .order('data', { ascending: false })

  const gates = computeCalendarGates((entries ?? []) as CalendarEntryForGates[])
  if (gates.length === 0) return

  for (const gate of gates) {
    const { data: existentes } = await sb()
      .from('crm_notificacoes')
      .select('id')
      .eq('tipo', 'instagram_gate')
      .eq('lida', false)
      .contains('metadata', { gate: gate.codigo })
      .limit(1)

    if (existentes && existentes.length > 0) continue

    await sb().from('crm_notificacoes').insert({
      admin_id: adminId,
      tipo: 'instagram_gate',
      titulo: `Instagram — gatilho ${gate.codigo}: ${gate.nome}`,
      corpo: gate.mensagem,
      lida: false,
      link: '/dashboard/instagram/calendario',
      metadata: { gate: gate.codigo, severidade: gate.severidade },
    })
  }
}

export async function GET(req: NextRequest) {
  if (!(await adminIdAutenticado())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const linha = searchParams.get('linha')

  let query = sb().from('ig_content_calendar').select('*').order('data', { ascending: true, nullsFirst: false })
  if (status) query = query.eq('status', status)
  if (linha) query = query.eq('linha', linha)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const adminId = await adminIdAutenticado()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { data: dataAgendada, tipo, linha, titulo, roteiro, observacoes } = body

  if (!tipo || !linha || !titulo) {
    return NextResponse.json({ error: 'tipo, linha e titulo obrigatorios' }, { status: 400 })
  }

  const { data, error } = await sb()
    .from('ig_content_calendar')
    .insert({
      data: dataAgendada || null,
      tipo,
      linha,
      titulo,
      roteiro: roteiro || null,
      observacoes: observacoes || null,
      status: 'planejado',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await checkAndNotifyGates(adminId)
  return NextResponse.json({ data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const adminId = await adminIdAutenticado()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, ...update } = body
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })
  update.updated_at = new Date().toISOString()

  const { data, error } = await sb().from('ig_content_calendar').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await checkAndNotifyGates(adminId)
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  if (!(await adminIdAutenticado())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })
  const { error } = await sb().from('ig_content_calendar').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
