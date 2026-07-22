// Consentimento LGPD de cookies/rastreamento.
//
// Modelo: 3 categorias — "necessários" (sempre ativos: sessão, radar de visitas
// first-party, formulários), "analytics" (GA4) e "marketing" (Meta Pixel/CAPI e
// Google Ads). GA4/Pixel NÃO carregam nem disparam antes do aceite da categoria
// correspondente — o gate fica em dois níveis: AnalyticsScripts (carga do script)
// e os helpers fbq()/gtag de src/lib/tracking.ts (disparo de evento).
//
// Google Consent Mode v2: o default "denied" das 4 flags é setado por script
// inline no <head> (layout.tsx) antes de qualquer gtag.js; este módulo emite o
// gtag('consent','update') quando o visitante decide ou revoga.

export type ConsentCategories = {
  analytics: boolean
  marketing: boolean
}

export type ConsentState = {
  version: number
  updatedAt: string
  categories: ConsentCategories
}

// Bump da versão força o banner a reaparecer pra todo mundo (usar quando a
// política/categorias mudarem de escopo).
export const CONSENT_VERSION = 1
export const CONSENT_STORAGE_KEY = 'sa_consent'
export const CONSENT_CHANGED_EVENT = 'sa:consent-changed'
export const CONSENT_OPEN_EVENT = 'sa:consent-open'

function isValidState(value: unknown): value is ConsentState {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  const cats = v.categories as Record<string, unknown> | undefined
  return (
    v.version === CONSENT_VERSION &&
    typeof v.updatedAt === 'string' &&
    !!cats &&
    typeof cats.analytics === 'boolean' &&
    typeof cats.marketing === 'boolean'
  )
}

// null = visitante ainda não decidiu (banner deve aparecer; tudo negado).
export function getConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return isValidState(parsed) ? parsed : null
  } catch {
    return null
  }
}

// Estado inicial dos toggles do painel de preferências: visitante que nunca
// decidiu vê tudo DESLIGADO (caixa pré-marcada = consentimento fraco, padrão
// Planet49/GDPR que a ANPD segue); quem já decidiu vê exatamente o que salvou.
export function defaultPrefsCategories(stored: ConsentState | null): ConsentCategories {
  return stored
    ? { analytics: stored.categories.analytics, marketing: stored.categories.marketing }
    : { analytics: false, marketing: false }
}

export function hasAnalyticsConsent(): boolean {
  return getConsent()?.categories.analytics === true
}

export function hasMarketingConsent(): boolean {
  return getConsent()?.categories.marketing === true
}

type GtagFn = (...args: unknown[]) => void
type FbqFn = (...args: unknown[]) => void

function rawGtag(): GtagFn | null {
  if (typeof window === 'undefined') return null
  const fn = (window as unknown as { gtag?: GtagFn }).gtag
  return typeof fn === 'function' ? fn : null
}

function rawFbq(): FbqFn | null {
  if (typeof window === 'undefined') return null
  const fn = (window as unknown as { fbq?: FbqFn }).fbq
  return typeof fn === 'function' ? fn : null
}

export function consentModeParams(categories: ConsentCategories) {
  return {
    analytics_storage: categories.analytics ? 'granted' : 'denied',
    ad_storage: categories.marketing ? 'granted' : 'denied',
    ad_user_data: categories.marketing ? 'granted' : 'denied',
    ad_personalization: categories.marketing ? 'granted' : 'denied',
  }
}

// Best-effort: expira os cookies dos vendors quando a categoria é revogada.
// O consent update já faz GA/Meta pararem de gravar; isto remove o resíduo.
function clearVendorCookies(categories: ConsentCategories) {
  if (typeof document === 'undefined') return
  try {
    const names: string[] = []
    if (!categories.analytics) {
      for (const c of document.cookie.split(';')) {
        const name = c.split('=')[0]?.trim()
        if (name && (name === '_ga' || name.startsWith('_ga_'))) names.push(name)
      }
    }
    if (!categories.marketing) {
      names.push('_fbp', '_fbc', '_gcl_au', '_gcl_aw')
    }
    const host = window.location.hostname
    const parent = host.split('.').slice(-2).join('.')
    for (const name of names) {
      for (const domain of ['', `; domain=${host}`, `; domain=.${parent}`]) {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domain}`
      }
    }
  } catch {
    // cookie inacessível (ambiente de teste/SSR) — silêncio
  }
}

function applyVendorConsent(categories: ConsentCategories) {
  // gtag existe sempre (stub do script inline no <head>) — o update entra na
  // dataLayer mesmo antes do gtag.js carregar e é aplicado quando ele chegar.
  rawGtag()?.('consent', 'update', consentModeParams(categories))
  // Pixel só existe se já carregou (marketing concedido antes) — revoke/grant
  // cobre o caso de revogação com o script já em memória.
  rawFbq()?.('consent', categories.marketing ? 'grant' : 'revoke')
  clearVendorCookies(categories)
}

export function saveConsent(categories: ConsentCategories): ConsentState {
  const state: ConsentState = {
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
    categories: { analytics: categories.analytics, marketing: categories.marketing },
  }
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage cheio/bloqueado: segue sem persistir — o update de consent ainda vale pra sessão
  }
  applyVendorConsent(state.categories)
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: state }))
  }
  return state
}

export function acceptAllConsent(): ConsentState {
  return saveConsent({ analytics: true, marketing: true })
}

export function rejectNonEssentialConsent(): ConsentState {
  return saveConsent({ analytics: false, marketing: false })
}

// Reabre o gerenciador de preferências (link "Preferências de cookies" no rodapé).
export function openConsentPreferences() {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') return
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))
}

export function onConsentChange(cb: (state: ConsentState) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<ConsentState>).detail
    if (detail) cb(detail)
  }
  window.addEventListener(CONSENT_CHANGED_EVENT, handler)
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handler)
}
