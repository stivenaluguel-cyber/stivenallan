import type { FocusQueueFilters } from './focus-queue'

const TEMPERATURAS = new Set(['quente', 'morno', 'frio'])

// Normalização única dos filtros, usada tanto na criação da sessão quanto
// na leitura da fila. Uma sessão guarda os filtros JÁ normalizados em
// `filtros`, e é dali que a retomada os restaura — nunca do localStorage,
// que pode ter sido alterado depois de a sessão começar.
export function normalizarFiltrosFoco(raw: unknown): FocusQueueFilters {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const input = raw as Record<string, unknown>
  const out: FocusQueueFilters = {}

  if (typeof input.temperatura === 'string' && TEMPERATURAS.has(input.temperatura)) {
    out.temperatura = input.temperatura as FocusQueueFilters['temperatura']
  }
  if (typeof input.estagioFunil === 'string' && input.estagioFunil) out.estagioFunil = input.estagioFunil
  if (typeof input.origem === 'string' && input.origem) out.origem = input.origem
  if (input.apenasFollowupVencido === true || input.apenasFollowupVencido === 'true') out.apenasFollowupVencido = true

  const dias = Number(input.semAcaoDias)
  if (Number.isFinite(dias) && dias > 0) out.semAcaoDias = Math.floor(dias)

  return out
}

export function filtrosDaQueryString(params: URLSearchParams): FocusQueueFilters {
  return normalizarFiltrosFoco({
    temperatura: params.get('temperatura'),
    estagioFunil: params.get('estagioFunil'),
    origem: params.get('origem'),
    apenasFollowupVencido: params.get('apenasFollowupVencido'),
    semAcaoDias: params.get('semAcaoDias'),
  })
}

export const PRESETS_FOCO: { key: string; label: string; descricao: string; filtros: FocusQueueFilters }[] = [
  { key: 'followups_vencidos', label: 'Follow-ups vencidos', descricao: 'Quem já passou do prazo de retorno', filtros: { apenasFollowupVencido: true } },
  { key: 'quentes_sem_contato', label: 'Leads quentes sem contato', descricao: 'Temperatura alta e ainda sem contato registrado', filtros: { temperatura: 'quente' } },
  { key: 'parados', label: 'Leads parados há 7 dias', descricao: 'Sem nenhuma ação na última semana', filtros: { semAcaoDias: 7 } },
  { key: 'todos', label: 'Fila completa', descricao: 'Todos os leads elegíveis, na ordem de prioridade', filtros: {} },
]
