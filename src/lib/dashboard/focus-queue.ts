// Regra de composição e priorização da fila do Modo Foco — centralizada aqui
// (nem no componente, nem espalhada em múltiplas rotas) para ser testável
// sem banco e para nunca dessincronizar entre o card, o resumo da sessão e
// o CRM. Entrada e saída são objetos simples (sem SupabaseClient), então
// qualquer rota só precisa buscar os dados e chamar buildFocusQueue.

import { ESTAGIOS_FUNIL } from './estagios'

export type FocusQueueLead = {
  id: string
  nome?: string | null
  whatsapp: string
  estagio_funil: string | null
  status?: string | null
  origem?: string | null
  temperatura?: number | null
  lead_score?: number | null
  requer_atencao?: boolean | null
  proximo_followup?: string | null
  ultimo_contato?: string | null
  created_at: string
}

export type FocusQueueFilters = {
  temperatura?: 'quente' | 'morno' | 'frio'
  estagioFunil?: string
  origem?: string
  apenasFollowupVencido?: boolean
  semAcaoDias?: number
}

// Leads fechados ou perdidos não fazem parte de nenhuma fila de atendimento
// ativo — 'perdido' é um valor válido de estagio_funil (mesma coluna que o
// Kanban usa, restrito pelo CHECK constraint do banco), então marcar um lead
// como perdido no Modo Foco automaticamente o remove do funil ativo e desta
// fila, sem precisar de uma coluna de soft-delete separada.
//
// Aceita só { estagio_funil } (não o FocusQueueLead inteiro) de propósito:
// o botão "Modo Foco · N leads" do CRM reaproveita esta mesma função sobre
// o tipo Lead local daquela página (que tem outros campos opcionais), sem
// precisar moldar o objeto inteiro no shape completo da fila.
export function isEligibleForFocusQueue(lead: { estagio_funil: string | null | undefined }): boolean {
  return lead.estagio_funil !== 'fechado' && lead.estagio_funil !== 'perdido'
}

function diasDesde(iso: string | null | undefined, now: number): number {
  if (!iso) return Number.POSITIVE_INFINITY
  return (now - new Date(iso).getTime()) / 86_400_000
}

function estagioIndex(estagio: string | null): number {
  const idx = ESTAGIOS_FUNIL.findIndex((e) => e.key === estagio)
  return idx === -1 ? 0 : idx
}

export type AgendaEventoRef = { id: string; titulo: string; inicio: string; tipo: string; status: string }

export type AgendaOverdueInfo = {
  vencidoCount: number
  proximoEvento?: { titulo: string; inicio: string; tipo: string } | null
  // O compromisso vencido EXATO (o mais atrasado), não uma contagem solta —
  // é sobre ele que a UI age. Antes só existia vencidoCount, e a UI acabava
  // agindo sobre "a visita mais próxima no tempo", que podia ser uma visita
  // FUTURA (bug: modal abria em "marcar realizada" pra visita que ainda não
  // aconteceu).
  compromissoVencido?: AgendaEventoRef | null
}

export type FocusQueueOptions = {
  now?: Date
  filters?: FocusQueueFilters
  agendaPorLead?: Record<string, AgendaOverdueInfo | undefined>
  // "sem nenhuma ação recente" (tier 4) = nunca teve um contato humano
  // registrado (ultimo_contato nulo). É a leitura mais direta e auditável
  // que temos hoje — não existe hoje uma contagem central de "todas as
  // interações" barata o suficiente para calcular aqui sem N+1 queries.
}

function passesFilters(lead: FocusQueueLead, now: number, filters?: FocusQueueFilters): boolean {
  if (!filters) return true
  if (filters.temperatura) {
    const alvo = filters.temperatura === 'quente' ? 3 : filters.temperatura === 'morno' ? 2 : 1
    if ((lead.temperatura ?? 1) !== alvo) return false
  }
  if (filters.estagioFunil && lead.estagio_funil !== filters.estagioFunil) return false
  if (filters.origem && lead.origem !== filters.origem) return false
  if (filters.apenasFollowupVencido) {
    const vencido = !!lead.proximo_followup && new Date(lead.proximo_followup).getTime() < now
    if (!vencido) return false
  }
  if (typeof filters.semAcaoDias === 'number') {
    const dias = diasDesde(lead.ultimo_contato ?? lead.created_at, now)
    if (dias < filters.semAcaoDias) return false
  }
  return true
}

export type FocusQueueEntry = {
  lead: FocusQueueLead
  followupVencido: boolean
  requerAtencao: boolean
  agendaVencida: boolean
  nuncaContatado: boolean
  quente: boolean
  diasSemContato: number
  // Tipo do compromisso vencido, quando há um. Um follow-up atrasado
  // (tipo 'ligacao'/'outro') não deve abrir o fluxo de visita — antes,
  // agendaVencida era um booleano cego que tratava os dois igual.
  compromissoVencidoTipo?: string | null
}

// Prioridade em CAMADAS (não uma média ponderada): a camada 1 sempre vence a
// camada 2, que sempre vence a camada 3, etc. — exatamente a semântica de
// uma lista numerada de critérios, e não um "score" combinado onde um lead
// quente pudesse compensar um follow-up vencido de outro lead.
function sortKey(entry: FocusQueueEntry): number[] {
  return [
    entry.followupVencido ? 0 : 1,
    entry.requerAtencao ? 0 : 1,
    entry.agendaVencida ? 0 : 1,
    entry.nuncaContatado ? 0 : 1,
    entry.quente ? 0 : 1,
    -entry.diasSemContato,
    -estagioIndex(entry.lead.estagio_funil),
    -(entry.lead.lead_score ?? 0),
    new Date(entry.lead.created_at).getTime(),
  ]
}

function compareKeys(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i]
  }
  return 0
}

export function buildFocusQueue(leads: FocusQueueLead[], options: FocusQueueOptions = {}): FocusQueueEntry[] {
  const now = (options.now ?? new Date()).getTime()
  const agendaPorLead = options.agendaPorLead ?? {}

  const entries: FocusQueueEntry[] = leads
    .filter(isEligibleForFocusQueue)
    .filter((lead) => passesFilters(lead, now, options.filters))
    .map((lead) => {
      const agenda = agendaPorLead[lead.id]
      return {
        lead,
        followupVencido: !!lead.proximo_followup && new Date(lead.proximo_followup).getTime() < now,
        requerAtencao: !!lead.requer_atencao,
        agendaVencida: (agenda?.vencidoCount ?? 0) > 0,
        nuncaContatado: !lead.ultimo_contato,
        quente: lead.temperatura === 3,
        diasSemContato: diasDesde(lead.ultimo_contato ?? lead.created_at, now),
        compromissoVencidoTipo: agenda?.compromissoVencido?.tipo ?? null,
      }
    })

  return entries.sort((a, b) => compareKeys(sortKey(a), sortKey(b)))
}
