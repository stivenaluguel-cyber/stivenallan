import type { SupabaseClient } from '@supabase/supabase-js'
import { FOCUS_PRIMARY_ACTIONS, FOCUS_SKIP_ACTIONS, pointsForAction, targetStatusForAction, type FocusActionType } from './focus-scoring'
import { marcarPrimeiroAtendimento } from '@/lib/leads/marcar-atendimento'

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
  // Só para 'adiado': quando o lead volta pra fila.
  snoozedUntil?: string | null
}

export type RecordFocusEventResult = {
  alreadyProcessed: boolean
  points: number
  sessionLeadStatus?: string | null
  error?: string
  // Contadores AUTORITATIVOS lidos da sessão depois da gravação — o
  // frontend substitui o estado local por eles em vez de somar um delta
  // otimista (que dessincroniza entre abas e recontava depois de um
  // alreadyProcessed).
  session?: { processed_leads: number; skipped_leads: number; earned_points: number; total_leads: number } | null
}

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

  // advance_focus_session_lead envolve record_focus_event: além da
  // idempotência por client_event_id (que já existia), ela trava a linha do
  // item na fila e recusa a ação se ele já foi processado. Isso é o que
  // resolve DUAS ABAS agindo no mesmo lead com client_event_ids diferentes
  // — caso em que a idempotência sozinha deixaria as duas passarem como
  // ações novas e legítimas, contando o lead duas vezes.
  const { data, error } = await client.rpc('advance_focus_session_lead', {
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
    p_target_status: targetStatusForAction(input.actionType),
    p_snoozed_until: input.snoozedUntil ?? null,
  })

  if (error) throw new Error(error.message)
  if (data?.error) return { alreadyProcessed: false, points: 0, error: data.error }

  // Ação comercial no Modo Foco também é atendimento. Só as PRIMÁRIAS contam:
  // pular ou adiar um lead não é atender ninguém, e carimbar nesses casos
  // faria o cronômetro de SLA parar sem que houvesse contato de verdade.
  if (isPrimary) await marcarPrimeiroAtendimento(client, input.leadId)

  // Contadores autoritativos numa leitura só, depois da gravação.
  const { data: sessao } = await client
    .from('crm_focus_sessions')
    .select('processed_leads, skipped_leads, earned_points, total_leads')
    .eq('id', input.sessionId)
    .maybeSingle()

  return {
    alreadyProcessed: !!data.alreadyProcessed,
    points: data.points ?? 0,
    sessionLeadStatus: data.sessionLeadStatus ?? null,
    session: sessao ?? null,
  }
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
