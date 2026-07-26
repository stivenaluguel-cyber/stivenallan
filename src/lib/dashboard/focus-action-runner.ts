// Núcleo puro (sem React) de "qual tentativa está pendente de retry".
//
// Não guarda mais o client_event_id diretamente — desde que a geração do id
// virou responsabilidade de focus-durable-event-id.ts (persistida em
// sessionStorage, sobrevive a reload), o id sempre pode ser
// RE-DERIVADO a partir da `key` da ação. Aqui só rastreamos: existe uma
// tentativa com esta key que falhou e ainda não foi confirmada com sucesso?
//
// - Uma ação NOVA usa sua própria `key` (ex.: "followup:{leadId}") — nunca
//   depende do estado anterior.
// - Um RETRY usa a `key` da última falha para re-derivar o MESMO
//   client_event_id (via getOrCreateDurableEventId).
// - Sucesso limpa o estado (nada mais pendente pra essa key).
export type RunnerState = { lastFailedKey: string | null }

export const INITIAL_RUNNER_STATE: RunnerState = { lastFailedKey: null }

// null quando não há nenhuma tentativa falha pra retentar.
export function beginRetryKey(state: RunnerState): string | null {
  return state.lastFailedKey
}

export function applyFailure(key: string): RunnerState {
  return { lastFailedKey: key }
}

export function applySuccess(): RunnerState {
  return { lastFailedKey: null }
}
