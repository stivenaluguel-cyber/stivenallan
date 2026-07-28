// Configuração única de pontuação do Modo Foco — mude os pesos aqui, nada
// mais no código depende de valores hardcoded. Pontos nunca são calculados
// ou confiados a partir do frontend: toda chamada passa por pointsForAction,
// executada no backend (rota /api/admin/focus/events), a partir apenas do
// action_type + metadata que o próprio servidor valida.
export const FOCUS_POINTS = {
  contato_confirmado: 5,
  anotacao: 3,
  followup_agendado: 8,
  visita_agendada: 15,
  visita_concluida: 20,
  visita_nao_ocorreu: 0, // sem peso definido no briefing original; ajuste aqui se quiser premiar o registro
  proposta_enviada: 25,
  fechado: 100,
  perdido: 2,
  pular: 0,
  adiado: 0, // adiar organiza a fila, não é trabalho comercial — nunca pontua
  etapa_alterada: 0, // mudança de etapa "neutra" — quando o destino é 'fechado', ver regra especial abaixo
} as const

// Ações que o frontend NUNCA pode registrar direto pelo endpoint público de
// eventos: elas só valem se existir o registro real correspondente no banco
// (uma linha em crm_propostas), e por isso são disparadas apenas pelo fluxo
// que cria esse registro (/api/admin/propostas). Sem esta lista, bastava um
// POST manual em /api/admin/focus/events com actionType='proposta_enviada'
// pra ganhar 25 pontos sem proposta nenhuma.
export const FOCUS_ACTIONS_SOMENTE_SERVIDOR = new Set<FocusActionType>(['proposta_enviada'])

export type FocusActionType = keyof typeof FOCUS_POINTS

// Ações que avançam a fila automaticamente (contam como "lead processado" ou
// "lead pulado" no resumo da sessão). Ações secundárias (anotação, contato
// confirmado, mudança de etapa avulsa, proposta) registram pontos mas não
// mexem no ponteiro da fila — o corretor continua no mesmo card.
export const FOCUS_PRIMARY_ACTIONS = new Set<FocusActionType>([
  'pular',
  'perdido',
  'followup_agendado',
  'visita_agendada',
  'visita_concluida',
  'visita_nao_ocorreu',
  'adiado',
])

export const FOCUS_SKIP_ACTIONS = new Set<FocusActionType>(['pular'])

// Status que o item da fila assume depois de cada ação primária. 'adiado'
// volta pra fila depois de snoozed_until; os demais saem de vez da sessão.
export function targetStatusForAction(actionType: FocusActionType): 'processado' | 'pulado' | 'adiado' | null {
  if (actionType === 'pular') return 'pulado'
  if (actionType === 'adiado') return 'adiado'
  return FOCUS_PRIMARY_ACTIONS.has(actionType) ? 'processado' : null
}

type ScoringMetadata = { nextStage?: string | null }

// 'fechado' não é um action_type próprio — é uma etapa_alterada cujo destino
// é o estágio 'fechado' do funil (mesmo vocabulário de ESTAGIOS_FUNIL). Isso
// evita duplicar a lógica de mudança de estágio só para dar pontos extras.
export function pointsForAction(actionType: FocusActionType, metadata?: ScoringMetadata): number {
  if (actionType === 'etapa_alterada' && metadata?.nextStage === 'fechado') {
    return FOCUS_POINTS.fechado
  }
  return FOCUS_POINTS[actionType] ?? 0
}

// Fronteira de confiança usada pela rota POST /api/admin/focus/events: o
// nextStage informado pelo CLIENTE nunca decide sozinho os 100 pontos do
// bônus de "fechado" — sem isso, uma chamada direta ao endpoint (sem nunca
// ter passado por PATCH /api/admin/leads/{id}) poderia reivindicar os
// pontos de um lead fechado sem o lead ter sido fechado de verdade. Para
// 'etapa_alterada', a rota substitui o nextStage recebido pelo
// estagio_funil ATUAL do lead (lido do banco na hora); para as demais
// ações, o valor do cliente é só informativo (a pontuação delas não
// depende de nextStage) e é mantido como veio.
export function resolveTrustedNextStage(
  actionType: FocusActionType,
  leadEstagioFunilAtual: string | null,
  clientNextStage: string | null,
): string | null {
  return actionType === 'etapa_alterada' ? leadEstagioFunilAtual : clientNextStage
}
