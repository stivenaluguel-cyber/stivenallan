// Vocabulário e tipos da fila de ativação manual do Instagram.
// Fica fora de route.ts porque rotas do Next só podem exportar handlers,
// e o Kanban de /dashboard/ativacao precisa do mesmo vocabulário.

import type { OrigemAtivacao } from './playbooks'

export const STATUS_ATIVACAO = ['pendente', 'abordado', 'respondeu', 'virou_lead', 'ignorado'] as const
export type StatusAtivacao = (typeof STATUS_ATIVACAO)[number]

export function statusAtivacaoValido(v: unknown): v is StatusAtivacao {
  return typeof v === 'string' && (STATUS_ATIVACAO as readonly string[]).includes(v)
}

// Colunas do Kanban, na ordem do funil.
export const COLUNAS_ATIVACAO: { key: StatusAtivacao; label: string; cor: string }[] = [
  { key: 'pendente', label: 'Pendente', cor: '#9CA3AF' },
  { key: 'abordado', label: 'Abordado', cor: '#F59E0B' },
  { key: 'respondeu', label: 'Respondeu', cor: '#3B82F6' },
  { key: 'virou_lead', label: 'Virou lead', cor: '#16A34A' },
  { key: 'ignorado', label: 'Ignorado', cor: '#6B7280' },
]

export type Ativacao = {
  id: string
  username: string
  nome: string | null
  origem: OrigemAtivacao
  contexto: string | null
  status: StatusAtivacao
  lead_id: string | null
  anotacoes: string | null
  abordado_em: string | null
  created_at: string
  updated_at: string
}

// "Hoje" no fuso do operador (America/Sao_Paulo), não em UTC — às 22h de
// Criciúma o UTC já virou o dia e o contador zeraria mais cedo.
export function ehHojeEmSaoPaulo(iso: string | null, agora: Date = new Date()): boolean {
  if (!iso) return false
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  return fmt(new Date(iso)) === fmt(agora)
}

/** Quantas ativações passaram a 'abordado' hoje (fuso de São Paulo). */
export function contarAbordagensHoje(itens: Pick<Ativacao, 'abordado_em'>[], agora: Date = new Date()): number {
  return itens.filter((i) => ehHojeEmSaoPaulo(i.abordado_em, agora)).length
}
