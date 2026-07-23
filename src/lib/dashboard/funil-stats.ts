// Agregações puras sobre leads + leads_interacoes — testáveis 100% sem DB.
//
// ATENÇÃO ESTAGIO_FUNIL: este arquivo é a 4ª cópia do array de estágios do
// Kanban (as outras 3: src/app/dashboard/page.tsx, src/app/dashboard/crm/page.tsx,
// src/app/dashboard/leads/page.tsx — nenhuma delas importa de um lugar
// compartilhado). Existe TAMBÉM um 3º vocabulário incompatível de estagio_funil
// na tool atualizar_lead da IA (src/lib/agent.ts) que não bate com nenhum dos 7
// valores abaixo — leads que a IA marcar com esses valores caem no bucket
// "outros" em vez de quebrar o relatório ou desaparecer silenciosamente.

export type LeadStageRow = {
  id: string
  estagio_funil: string | null
}

export type StageTransitionRow = {
  lead_id: string
  estagio_de: string | null
  estagio_para: string | null
  created_at: string
}

export const ESTAGIOS_FUNIL = [
  { key: 'primeiro_contato', label: 'Novo Contato', cor: '#6b7280' },
  { key: 'qualificado', label: 'Qualificado', cor: '#3b82f6' },
  { key: 'interessado', label: 'Interessado', cor: '#8b5cf6' },
  { key: 'proposta_enviada', label: 'Proposta Enviada', cor: '#f59e0b' },
  { key: 'visita_agendada', label: 'Visita Agendada', cor: '#ec4899' },
  { key: 'negociacao', label: 'Em Negociação', cor: '#D24E22' },
  { key: 'fechado', label: 'Fechado', cor: '#22c55e' },
] as const

const OUTROS = { key: 'outros', label: 'Outros / não mapeado', cor: '#a1a1aa' } as const

export type StageSnapshot = {
  key: string
  label: string
  cor: string
  total: number
  pct: number
  // % de leads que chegaram ATÉ esta etapa ou além, em relação ao total —
  // uma cascata de distribuição atual, NÃO uma taxa de conversão de coorte
  // real (não temos histórico completo de todas as transições passadas).
  cascataPct: number
}

export function snapshotPorEstagio(leads: LeadStageRow[]): StageSnapshot[] {
  const total = leads.length
  const known = new Set<string>(ESTAGIOS_FUNIL.map((e) => e.key))
  const contagem: Record<string, number> = {}
  for (const e of ESTAGIOS_FUNIL) contagem[e.key] = 0
  contagem[OUTROS.key] = 0

  for (const l of leads) {
    const k = l.estagio_funil && known.has(l.estagio_funil) ? l.estagio_funil : OUTROS.key
    contagem[k] = (contagem[k] ?? 0) + 1
  }

  const ordem = [...ESTAGIOS_FUNIL, OUTROS]
  let acumulado = 0
  const semOutros = total - contagem[OUTROS.key]

  return ordem.map((e) => {
    const n = contagem[e.key] ?? 0
    if (e.key !== OUTROS.key) acumulado += n
    const base = e.key === OUTROS.key ? total : semOutros
    return {
      key: e.key,
      label: e.label,
      cor: e.cor,
      total: n,
      pct: total === 0 ? 0 : Math.round((n / total) * 100),
      cascataPct: e.key === OUTROS.key || base === 0 ? 0 : Math.round((acumulado / base) * 100),
    }
  })
}

export type TempoMedioEstagio = {
  estagio: string
  label: string
  amostras: number
  mediaDias: number | null
}

// Tempo médio no estágio X = diferença entre quando o lead ENTROU em X
// (estagio_para = X numa transição anterior) e quando SAIU (próxima
// transição daquele mesmo lead). Amostra pequena no início — o log de
// transição só existe a partir do deploy que adicionou isso ao handler PATCH.
export function tempoMedioPorEstagio(transicoes: StageTransitionRow[]): TempoMedioEstagio[] {
  const porLead = new Map<string, StageTransitionRow[]>()
  for (const t of transicoes) {
    const arr = porLead.get(t.lead_id) ?? []
    arr.push(t)
    porLead.set(t.lead_id, arr)
  }

  const duracoesPorEstagio = new Map<string, number[]>()

  for (const arr of porLead.values()) {
    const ordenado = [...arr].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    for (let i = 0; i < ordenado.length - 1; i++) {
      const entrada = ordenado[i]
      const saida = ordenado[i + 1]
      const estagio = entrada.estagio_para
      if (!estagio) continue
      const dias = (new Date(saida.created_at).getTime() - new Date(entrada.created_at).getTime()) / 86400000
      if (dias < 0) continue
      const lista = duracoesPorEstagio.get(estagio) ?? []
      lista.push(dias)
      duracoesPorEstagio.set(estagio, lista)
    }
  }

  const labelPorKey = new Map<string, string>([...ESTAGIOS_FUNIL, OUTROS].map((e) => [e.key, e.label]))

  return [...ESTAGIOS_FUNIL].map((e) => {
    const lista = duracoesPorEstagio.get(e.key) ?? []
    const mediaDias = lista.length === 0 ? null : Math.round((lista.reduce((s, d) => s + d, 0) / lista.length) * 10) / 10
    return { estagio: e.key, label: labelPorKey.get(e.key) ?? e.key, amostras: lista.length, mediaDias }
  })
}
