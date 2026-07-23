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

// Cada avanço de estágio no Kanban vira um evento de conversão pro Meta CAPI
// (src/lib/meta-capi.ts), pra o algoritmo de anúncios otimizar por lead que
// avança de verdade, não só por quem preenche formulário. Usa eventos padrão
// do Meta quando existe um encaixe semântico direto; nome customizado quando
// não existe. 'fechado' não usa 'Purchase' de propósito — o site é "sob
// consulta" (sem preço exibido), então não há valor/moeda confiável pra
// declarar numa venda, e um Purchase sem value distorce o ROAS reportado.
export const ESTAGIO_META_EVENT: Record<(typeof ESTAGIOS_FUNIL)[number]['key'], string> = {
  primeiro_contato: 'Lead',
  qualificado: 'Contact',
  interessado: 'InterestConfirmed',
  proposta_enviada: 'SubmitApplication',
  visita_agendada: 'Schedule',
  negociacao: 'Negotiation',
  fechado: 'CompleteRegistration',
}
