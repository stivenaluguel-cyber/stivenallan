// Fonte única das colunas do Kanban de vendas. Antes copiada em
// dashboard/page.tsx, crm/page.tsx e leads/page.tsx (+ um 4º array parcial
// em funil-stats.ts) — a mesma classe de duplicação que já causou um bug
// real (o enum da tool atualizar_lead da IA, em src/lib/agent.ts, ficou
// fora de sincronia por anos sem ninguém notar).
export const ESTAGIOS_FUNIL = [
  { key: 'primeiro_contato', label: 'Novo Contato', cor: '#6b7280' },
  { key: 'qualificado', label: 'Qualificado', cor: '#3b82f6' },
  { key: 'interessado', label: 'Interessado', cor: '#8b5cf6' },
  { key: 'proposta_enviada', label: 'Proposta Enviada', cor: '#f59e0b' },
  { key: 'visita_agendada', label: 'Visita Agendada', cor: '#ec4899' },
  { key: 'negociacao', label: 'Em Negociação', cor: '#D24E22' },
  { key: 'fechado', label: 'Fechado', cor: '#22c55e' },
] as const
