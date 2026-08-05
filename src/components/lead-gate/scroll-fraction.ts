// Funções puras extraídas pro mesmo padrão de testabilidade de
// CtaFixoEmpreendimento.tsx (Vitest roda em environment:'node', sem jsdom —
// nada aqui pode depender de DOM real).

export type LeadAccessStatus = 'loading' | 'locked' | 'unlocked'

// Fração calculada sobre a ALTURA TOTAL DO DOCUMENTO (não da viewport, ao
// contrário de CtaFixoEmpreendimento) — é o que permite o mesmo componente se
// auto-posicionar entre 25%-40% em qualquer um dos 3 formatos de página sem
// conhecer a estrutura interna de cada uma.
export function computeScrollFraction(scrollY: number, documentScrollHeight: number, viewportHeight: number): number {
  const scrollable = documentScrollHeight - viewportHeight
  if (scrollable <= 0) return 0 // página mais curta que a viewport — nunca mostra o gate cedo
  return scrollY / scrollable
}

export function shouldShowEarlyGate(fraction: number, dismissed: boolean, status: LeadAccessStatus): boolean {
  if (dismissed) return false
  if (status !== 'locked') return false
  return fraction >= 0.25 && fraction <= 0.4
}
