import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { montarResumoSessao } from '@/lib/dashboard/focus-summary'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const client = sb()

  const { data: sessao, error: sessaoError } = await client.from('crm_focus_sessions').select('*').eq('id', id).single()
  if (sessaoError || !sessao || sessao.admin_id !== adminId) {
    return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
  }

  const [{ data: eventos, error: eventosError }, { count: leadsUnicos }] = await Promise.all([
    client.from('crm_focus_events').select('action_type, next_stage, lead_id').eq('session_id', id),
    client.from('crm_focus_session_leads').select('lead_id', { count: 'exact', head: true })
      .eq('session_id', id).in('status', ['processado', 'pulado']),
  ])
  if (eventosError) return NextResponse.json({ error: eventosError.message }, { status: 500 })

  return NextResponse.json({
    data: sessao,
    breakdown: montarResumoSessao(sessao, eventos ?? [], leadsUnicos ?? 0),
  })
}

// Encerra a sessão. Idempotente e restrito a sessão ATIVA: chamar duas vezes
// (duas abas, retry de rede) devolve a sessão já encerrada em vez de
// reescrever finished_at ou dar erro. Os contadores nunca vêm do corpo da
// requisição — só avançam via /api/admin/focus/events.
export async function PATCH(req: NextRequest, { params }: Params) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const status = body.status

  if (status !== 'concluida' && status !== 'abandonada') {
    return NextResponse.json({ error: "status deve ser 'concluida' ou 'abandonada'" }, { status: 400 })
  }

  const client = sb()
  const { data: sessao } = await client.from('crm_focus_sessions').select('*').eq('id', id).single()
  if (!sessao || sessao.admin_id !== adminId) {
    return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
  }
  if (sessao.status !== 'ativa') {
    return NextResponse.json({ data: sessao, alreadyFinished: true })
  }

  // Uma sessão só pode ser CONCLUÍDA quando o servidor confirma que não há
  // mais item pendente. Antes, a tela decidia isso sozinha a partir de uma
  // fila local vazia — então um filtro que não devolvia nada, ou uma falha
  // de rede no carregamento, encerravam a sessão como se o trabalho tivesse
  // acabado. "Abandonada" (pausar/sair) não passa por essa checagem.
  if (status === 'concluida') {
    const agora = new Date().toISOString()
    const { count: pendentes } = await client
      .from('crm_focus_session_leads')
      .select('lead_id', { count: 'exact', head: true })
      .eq('session_id', id)
      .in('status', ['pendente', 'adiado'])
      .or('snoozed_until.is.null,snoozed_until.lte.' + agora)

    if ((pendentes ?? 0) > 0) {
      return NextResponse.json(
        { error: 'Ainda há leads pendentes nesta sessão', pendentes, data: sessao },
        { status: 409 },
      )
    }
  }

  const { data, error } = await client
    .from('crm_focus_sessions')
    .update({ status, finished_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'ativa')
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, alreadyFinished: false })
}
