// Fluxo "enviar e avançar" do modal de detalhe (LeadDetalheModal): clicar em
// WhatsApp marca o lead como contatado e pula pro próximo da fila sozinho,
// pra economizar cliques do fluxo manual (não é automação de envio — quem
// manda a mensagem continua sendo o corretor, abrindo a aba do wa.me).
//
// Lógica pura e sem DOM de propósito: o projeto não tem jsdom/Testing
// Library (vitest.config.ts roda em environment 'node'), então o jeito de
// testar esse comportamento de verdade é isolar a decisão do clique — o
// componente só executa o plano que sai daqui.

export type LeadDaFila = { id: string; status: string; score: number | null }

export type PlanoEnvioWhatsapp<T extends LeadDaFila> =
  // Lead clicado não estava 'novo' (reabriu um card já contatado, por
  // exemplo) — só abre o link, sem mexer em status nem pular de card.
  | { avancar: false }
  // Tinha próximo lead 'novo' na fila — vira o próximo card do modal.
  | { avancar: true; proximoLead: T }
  // Fila zerada — quem chama fecha o modal e mostra a mensagem de fila vazia.
  | { avancar: true; proximoLead: null }

/**
 * Decide o que fazer quando o corretor clica em WhatsApp dentro do modal.
 * Não muda status nem estado — só calcula. Mesma ordenação por score da
 * coluna "Novo" do Kanban (ver renderização das colunas em
 * src/app/dashboard/prospeccao/[id]/page.tsx), pulando o lead que acabou
 * de ser marcado como contatado.
 */
export function planejarEnvioWhatsapp<T extends LeadDaFila>(leads: T[], leadAtual: T): PlanoEnvioWhatsapp<T> {
  if (leadAtual.status !== 'novo') return { avancar: false }

  const restantes = leads
    .filter((l) => l.status === 'novo' && l.id !== leadAtual.id)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

  return { avancar: true, proximoLead: restantes[0] ?? null }
}
