// Gera (ou recupera) um client_event_id que sobrevive a um RELOAD DA PÁGINA
// — o gap que a auditoria encontrou: o cache anterior (`umaVezPorTentativa`)
// vivia só em memória (um Map em page.tsx), então "Agenda criada → evento
// de pontuação falha → página recarrega → usuário tenta de novo" gerava um
// client_event_id NOVO (a memória se perdeu) e duplicava o compromisso na
// Agenda, mesmo com o backend já protegido contra duplo-clique/retry sem
// reload.
//
// Usa sessionStorage (não localStorage): o escopo é "esta aba, esta
// tentativa pendente" — não faz sentido, nem é seguro, uma tentativa
// pendente vazar entre abas diferentes ou sobreviver além da sessão do
// navegador. Cada `key` deve identificar uma intenção específica do
// usuário (ex.: "followup:{leadId}") — repetições LEGÍTIMAS continuam
// recebendo um id novo porque `clear(key)` é chamado assim que a tentativa
// anterior é confirmada bem-sucedida, liberando a chave.
const PREFIX = 'modo-foco-pending:'

function storageDisponivel(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function getOrCreateDurableEventId(key: string, generateId: () => string): string {
  const storage = storageDisponivel()
  if (!storage) return generateId()
  const storageKey = PREFIX + key
  const existente = storage.getItem(storageKey)
  if (existente) return existente
  const novo = generateId()
  storage.setItem(storageKey, novo)
  return novo
}

export function clearDurableEventId(key: string): void {
  const storage = storageDisponivel()
  if (!storage) return
  storage.removeItem(PREFIX + key)
}
