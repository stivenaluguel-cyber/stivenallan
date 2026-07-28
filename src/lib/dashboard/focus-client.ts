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
  // Só para 'adiado': quando o lead volta pra fila.
  snoozedUntil?: string | null
}) {
  const res = await fetch('/api/admin/focus/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  // `session` traz os contadores AUTORITATIVOS pós-gravação — o chamador
  // substitui o estado local por eles em vez de somar um delta otimista.
  return parseJson(res) as Promise<{
    data: {
      alreadyProcessed: boolean
      points: number
      sessionLeadStatus?: string | null
      session?: { processed_leads: number; skipped_leads: number; earned_points: number; total_leads: number } | null
    }
  }>
}

// Anotação atômica: uma linha nova, nunca um append ao JSON inteiro.
//
// A versão anterior (GET do lead → append no array → PATCH do array
// inteiro) tinha uma janela de lost update: entre o GET e o PATCH, uma nota
// criada em outra aba/por outro corretor era sobrescrita e perdida
// silenciosamente. Reler antes de escrever reduzia a janela, mas não
// eliminava — só o INSERT de uma linha própria elimina.
//
// A idempotência agora é do banco (índice único em client_event_id), não de
// uma checagem otimista em JS.
export async function salvarNota(leadId: string, texto: string, clientEventId: string) {
  const res = await fetch('/api/admin/leads/' + leadId + '/anotacoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto, clientEventId }),
  })
  return parseJson(res) as Promise<{ data: { id: string; created_at: string; descricao: string } | null; alreadyExists: boolean }>
}
