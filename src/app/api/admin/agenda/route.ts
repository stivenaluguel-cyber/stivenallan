import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function auth() {
  const s = await cookies(); const t = s.get('dashboard_token')?.value; if (!t) return false
  try { await jwtVerify(t, new TextEncoder().encode(process.env.JWT_SECRET!)); return true } catch { return false }
}

// O schema real de crm_agenda usa `inicio`/`fim` (timestamptz), nao `data_hora`
// — a tabela foi criada direto no Supabase sem migration versionada, e o
// codigo desta rota (e o de dashboard/agenda/page.tsx) ficou escrito contra
// um nome de coluna que nunca existiu (`data_hora`), o que fazia todo INSERT/
// SELECT falhar silenciosamente do ponto de vista do usuario (a tela sempre
// aparecia vazia). Mantemos `data_hora` como o nome de campo na API JSON
// (zero mudanca de contrato pro frontend) e mapeamos para `inicio` na
// query/insert/update, que e a coluna que de fato existe.
export async function GET(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const data_ini = searchParams.get('data_ini') || new Date().toISOString().slice(0,10)
  const data_fim = searchParams.get('data_fim') || data_ini

  const { data, error } = await sb()
    .from('crm_agenda')
    .select(`*, leads(nome, whatsapp)`)
    .gte('inicio', data_ini + 'T00:00:00')
    .lte('inicio', data_fim + 'T23:59:59')
    .order('inicio', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const mapped = (data ?? []).map((ev) => ({ ...ev, data_hora: ev.inicio }))
  return NextResponse.json({ data: mapped })
}

// client_event_id (opcional) é a chave de idempotência persistente do Modo
// Foco: um UUID por intenção do usuário, com unique index parcial no banco
// (migration 0016). Sem isso, um "tentar de novo" depois de recarregar a
// página (memória do frontend perdida) reenviaria este POST e duplicaria o
// compromisso — o cache anterior só protegia contra retry SEM reload. A
// tela de Agenda humana não manda esse campo e continua funcionando igual.
export async function POST(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { titulo, data_hora, tipo, lead_id, local, descricao, lembrete_min, client_event_id } = body

  if (!titulo || !data_hora) return NextResponse.json({ error: 'titulo e data_hora obrigatorios' }, { status: 400 })

  const client = sb()

  if (client_event_id) {
    const { data: existente } = await client.from('crm_agenda').select('*').eq('client_event_id', client_event_id).maybeSingle()
    if (existente) return NextResponse.json({ data: { ...existente, data_hora: existente.inicio } })
  }

  const { data, error } = await client.from('crm_agenda').insert({
    titulo, inicio: data_hora, tipo: tipo || 'reuniao',
    lead_id: lead_id || null, local: local || null,
    descricao: descricao || null,
    lembrete_min: lembrete_min ?? 30,
    status: 'agendado',
    client_event_id: client_event_id || null,
  }).select().single()

  if (error) {
    // 23505 = unique_violation — corrida rara entre duas requisições com o
    // MESMO client_event_id (ex.: dois fetches quase simultâneos antes do
    // primeiro terminar). Em vez de devolver erro, devolve o compromisso
    // que a outra requisição já criou — nunca duplica.
    if (error.code === '23505' && client_event_id) {
      const { data: existente } = await client.from('crm_agenda').select('*').eq('client_event_id', client_event_id).maybeSingle()
      if (existente) return NextResponse.json({ data: { ...existente, data_hora: existente.inicio } })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ data: data ? { ...data, data_hora: data.inicio } : data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, data_hora, ...update } = body
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })
  if (data_hora) update.inicio = data_hora
  update.updated_at = new Date().toISOString()
  const { data, error } = await sb().from('crm_agenda').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ? { ...data, data_hora: data.inicio } : data })
}

export async function DELETE(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })
  const { error } = await sb().from('crm_agenda').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
