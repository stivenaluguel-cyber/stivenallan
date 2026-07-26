// Wrappers finos de fetch usados só pelo Modo Foco. Nenhum deles reimplementa
// regra de negócio — todos chamam endpoints que já existem no dashboard
// (leads, agenda, propostas); o único endpoint novo consumido aqui é o de
// eventos da sessão (log + pontuação).
import type { FocusActionType } from './focus-scoring'

async function parseJson(res: Response) {
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Falha na requisição (' + res.status + ')')
  return json
}

export async function patchLead(leadId: string, payload: Record<string, unknown>) {
  const res = await fetch('/api/admin/leads/' + leadId, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseJson(res)
}

export async function createAgendaEvento(payload: {
  titulo: string
  data_hora: string
  tipo: string
  lead_id: string
  local?: string | null
  descricao?: string | null
  lembrete_min?: number
  // Idempotência persistente (migration 0016): reenviar o MESMO
  // client_event_id — inclusive depois de um reload de página — nunca cria
  // um segundo compromisso; a rota devolve o que já existe.
  client_event_id?: string
}) {
  const res = await fetch('/api/admin/agenda', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseJson(res)
}

export async function patchAgendaEvento(id: string, payload: Record<string, unknown>) {
  const res = await fetch('/api/admin/agenda', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...payload }),
  })
  return parseJson(res)
}

export async function postFocusEvent(input: {
  sessionId: string
  leadId: string
  actionType: FocusActionType
  previousStage?: string | null
  nextStage?: string | null
  metadata?: Record<string, unknown>
  // Um UUID por INTENÇÃO do usuário — quem chama é responsável por gerar um
  // novo a cada ação legítima e por REAPROVEITAR o mesmo id só quando está
  // de fato re-tentando a mesma requisição (ver useFocusActionRunner).
  clientEventId: string
}) {
  const res = await fetch('/api/admin/focus/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseJson(res) as Promise<{ data: { alreadyProcessed: boolean; points: number } }>
}

type Nota = { data: string; texto: string; clientEventId?: string }

function parseNotas(anotacoesRaw: string | null | undefined): Nota[] {
  if (!anotacoesRaw) return []
  try {
    const parsed = JSON.parse(anotacoesRaw)
    if (Array.isArray(parsed)) return parsed
  } catch {
    if (anotacoesRaw.trim()) return [{ data: '', texto: anotacoesRaw }]
  }
  return []
}

// Mesmo formato {data:[{data,texto}]} usado por LeadModal.parseNotas em
// src/app/dashboard/crm/page.tsx — replicar o shape (não o código) garante
// que a nova anotação apareça corretamente na linha do tempo existente.
// `clientEventId` é um campo extra opcional no objeto da nota — invisível
// pros outros leitores desse JSON (só leem .data/.texto), usado aqui só
// para a checagem de idempotência de salvarNotaIdempotente.
export function appendNota(anotacoesRaw: string | null | undefined, texto: string, clientEventId?: string): string {
  const notas = parseNotas(anotacoesRaw)
  const nova: Nota = { data: new Date().toISOString(), texto }
  if (clientEventId) nova.clientEventId = clientEventId
  return JSON.stringify([nova, ...notas])
}

// Idempotência persistente pra anotações: sem isso, "nota salva → evento de
// pontuação falha → página recarrega → tenta de novo" reexecutaria
// appendNota em cima do valor JÁ ATUALIZADO (a nota já está lá) e
// duplicaria a mesma anotação. Busca o lead FRESCO do servidor (não um
// valor capturado em closure antes do reload) e só acrescenta se uma nota
// com este client_event_id ainda não existir.
export async function salvarNotaIdempotente(leadId: string, texto: string, clientEventId: string): Promise<string> {
  const res = await fetch('/api/admin/leads/' + leadId)
  const json = await parseJson(res)
  const anotacoesAtuais: string | null = json.data?.anotacoes ?? null
  const notas = parseNotas(anotacoesAtuais)
  if (notas.some((n) => n.clientEventId === clientEventId)) {
    return anotacoesAtuais ?? JSON.stringify(notas)
  }
  const novasAnotacoes = appendNota(anotacoesAtuais, texto, clientEventId)
  await patchLead(leadId, { anotacoes: novasAnotacoes })
  return novasAnotacoes
}
