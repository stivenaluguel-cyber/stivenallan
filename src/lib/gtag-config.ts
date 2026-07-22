import type { ConsentCategories } from './consent'

// Orquestração das chamadas gtag('config', …) por categoria de consentimento.
//
// Motivo de existir: next/script deduplica por `id` e NÃO re-executa conteúdo
// inline atualizado — um upgrade de consentimento na mesma sessão (ex.: aceita
// analytics, depois adiciona marketing pelo rodapé) nunca aplicaria a config do
// produto recém-liberado até o próximo pageload. Aqui a config é imperativa e
// idempotente: cada produto é configurado NO MÁXIMO 1x por pageload (o que
// também garante no máximo 1 page_view inicial do GA4 — config repetida
// re-dispararia page_view), e revogar+reconceder na mesma sessão não reconfigura.

export type GtagFn = (...args: unknown[]) => void

export type GtagConfigured = {
  // gtag('js', new Date()) já foi emitido neste pageload
  js: boolean
  ga4: boolean
  gads: boolean
}

export function newGtagConfigured(): GtagConfigured {
  return { js: false, ga4: false, gads: false }
}

// Aplica as configs pendentes para o estado atual de consentimento.
// Muta `configured` (estado por-pageload) e retorna o que foi aplicado agora.
export function applyGtagConfigs(
  gtag: GtagFn,
  categories: ConsentCategories,
  configured: GtagConfigured,
  ids: { ga4: string; gads: string },
): { ga4: boolean; gads: boolean } {
  const applied = { ga4: false, gads: false }

  const wantGa4 = categories.analytics && Boolean(ids.ga4) && !configured.ga4
  const wantGads = categories.marketing && Boolean(ids.gads) && !configured.gads
  if (!wantGa4 && !wantGads) return applied

  if (!configured.js) {
    configured.js = true
    gtag('js', new Date())
  }
  if (wantGa4) {
    configured.ga4 = true
    applied.ga4 = true
    gtag('config', ids.ga4)
  }
  if (wantGads) {
    configured.gads = true
    applied.gads = true
    gtag('config', ids.gads)
  }
  return applied
}
