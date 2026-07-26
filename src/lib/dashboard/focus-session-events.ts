import type { SupabaseClient } from '@supabase/supabase-js'
import { FOCUS_PRIMARY_ACTIONS, FOCUS_SKIP_ACTIONS, pointsForAction, type FocusActionType } from './focus-scoring'

type RecordFocusEventInput = {
  sessionId: string
  leadId: string
  adminId: string | null
  actionType: FocusActionType
  previousStage?: string | null
  nextStage?: string | null
  metadata?: Record<string, unknown>
  // Gerado pelo FRONTEND, um UUID por INTENÇÃO do usuário: um clique = um id;
  // um retry da MESMA requisição (double-click, timeout de rede, "tentar de
  // novo") reaproveita o mesmo id; uma ação nova (mesmo que seja o mesmo
  // action_type no mesmo lead — um segundo follow-up, uma segunda anotação)
  // sempre recebe outro id. É isso, e não mais "sessão+lead+ação", que
  // define o que é duplicata: repetições legítimas nunca são bloqueadas.
  clientEventId: string
}

export type RecordFocusEventResult = { alreadyProcessed: boolean; points: number }

// Núcleo idempotente do Modo Foco: toda ação (do card, do modal de follow-up,
// ou do gancho automático em Propostas) passa por aqui. A gravação do
// evento + o incremento dos contadores da sessão rodam dentro de UMA função
// Postgres (record_focus_event, migration 0014/0015) — uma única
// transação, então o "insert idempotente" e o "UPDATE col = col + x" nunca
// correm risco de lost update entre duas abas/duas requisições concorrentes
// (o que um SELECT-depois-UPDATE feito aqui em JS correria).
export async function recordFocusEvent(
  client: SupabaseClient<any, any, any>,
  input: RecordFocusEventInput,
): Promise<RecordFocusEventResult> {
  const points = pointsForAction(input.actionType, { nextStage: input.nextStage })
  const isSkip = FOCUS_SKIP_ACTIONS.has(input.actionType)
  const isPrimary = FOCUS_PRIMARY_ACTIONS.has(input.actionType)

  const { data, error } = await client.rpc('record_focus_event', {
    p_session_id: input.sessionId,
    p_lead_id: input.leadId,
    p_admin_id: input.adminId,
    p_action_type: input.actionType,
    p_previous_stage: input.previousStage ?? null,
    p_next_stage: input.nextStage ?? null,
    p_points: points,
    p_metadata: input.metadata ?? {},
    p_client_event_id: input.clientEventId,
    p_is_skip: isSkip,
    p_is_primary: isPrimary,
  })

  if (error) throw new Error(error.message)

  return { alreadyProcessed: !!data.alreadyProcessed, points: data.points ?? 0 }
}

// Usado pelo gancho automático em /api/admin/propostas: se o corretor tiver
// uma sessão de Modo Foco ativa no momento em que cria/aceita uma proposta
// (mesmo fora da tela de Modo Foco), a sessão ganha os pontos e o resumo
// final reflete "Propostas geradas" corretamente — sem exigir que o corretor
// volte pro Modo Foco só para registrar isso manualmente.
export async function getActiveFocusSession(client: SupabaseClient<any, any, any>, adminId: string | null) {
  if (!adminId) return null
  const { data } = await client
    .from('crm_focus_sessions')
    .select('id')
    .eq('admin_id', adminId)
    .eq('status', 'ativa')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}
