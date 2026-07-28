import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function auth(): Promise<string | null> {
  const s = await cookies(); const t = s.get('dashboard_token')?.value; if (!t) return null
  try {
    const { payload } = await jwtVerify(t, new TextEncoder().encode(process.env.JWT_SECRET!))
    return (payload.adminId as string) ?? null
  } catch { return null }
}

type Params = { params: Promise<{ id: string }> }

// Detalhamento por tipo de ação — usado só na tela de resumo final da
// sessão (contadores como "Follow-ups agendados"/"Visitas"/"Perdidos" não
// são colunas próprias em crm_focus_sessions; são derivados aqui a partir
// do log de eventos, que é a fonte de verdade auditável).
export async function GET(_req: NextRequest, { params }: Params) {
  const adminId = await auth()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const client = sb()

  const { data: sessao, error: sessaoError } = await client.from('crm_focus_sessions').select('*').eq('id', id).single()
  if (sessaoError || !sessao || sessao.admin_id !== adminId) {
    return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
  }

  const { data: eventos, error: eventosError } = await client
    .from('crm_focus_events')
    .select('action_type, next_stage')
    .eq('session_id', id)
  if (eventosError) return NextResponse.json({ error: eventosError.message }, { status: 500 })

  const porTipo: Record<string, number> = {}
  for (const ev of eventos ?? []) porTipo[ev.action_type] = (porTipo[ev.action_type] ?? 0) + 1

  return NextResponse.json({
    data: sessao,
    breakdown: {
      followupsAgendados: porTipo['followup_agendado'] ?? 0,
      visitas: (porTipo['visita_agendada'] ?? 0) + (porTipo['visita_concluida'] ?? 0),
      mudancasDeEtapa: porTipo['etapa_alterada'] ?? 0,
      perdidos: porTipo['perdido'] ?? 0,
      propostas: porTipo['proposta_enviada'] ?? 0,
      contatosConfirmados: porTipo['contato_confirmado'] ?? 0,
    },
  })
}

// Só encerra (concluída/abandonada) — os contadores (processed_leads,
// skipped_leads, earned_points) nunca são aceitos aqui vindos do corpo da
// requisição: eles só avançam via /api/admin/focus/events, sempre
// recalculados no servidor. Isso é o que impede o frontend de "inflar" a
// pontuação da sessão só chamando PATCH direto.
export async function PATCH(req: NextRequest, { params }: Params) {
  const adminId = await auth()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const status = body.status

  if (status !== 'concluida' && status !== 'abandonada') {
    return NextResponse.json({ error: "status deve ser 'concluida' ou 'abandonada'" }, { status: 400 })
  }

  const client = sb()
  const { data: sessao } = await client.from('crm_focus_sessions').select('admin_id').eq('id', id).single()
  if (!sessao || sessao.admin_id !== adminId) {
    return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
  }

  const { data, error } = await client
    .from('crm_focus_sessions')
    .update({ status, finished_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
