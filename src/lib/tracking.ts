const KEY_ATTRIB = 'sa_attrib'

const ATTRIB_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
] as const

export type Attribution = Partial<Record<(typeof ATTRIB_PARAMS)[number], string>>

// Captura UTMs/click-ids da URL de entrada e persiste na sessão (first-touch da sessão)
export function captureAttribution() {
  if (typeof window === 'undefined') return
  try {
    const params = new URLSearchParams(window.location.search)
    const found: Attribution = {}
    for (const key of ATTRIB_PARAMS) {
      const value = params.get(key)
      if (value) found[key] = value.slice(0, 255)
    }
    if (Object.keys(found).length === 0) return
    const existing = getAttribution()
    sessionStorage.setItem(KEY_ATTRIB, JSON.stringify({ ...existing, ...found }))
  } catch {}
}

export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(sessionStorage.getItem(KEY_ATTRIB) ?? '{}')
  } catch {
    return {}
  }
}

type FbqFn = (...args: unknown[]) => void
type GtagFn = (...args: unknown[]) => void

function fbq(): FbqFn | null {
  if (typeof window === 'undefined') return null
  const fn = (window as unknown as { fbq?: FbqFn }).fbq
  return typeof fn === 'function' ? fn : null
}

function gtag(): GtagFn | null {
  if (typeof window === 'undefined') return null
  const fn = (window as unknown as { gtag?: GtagFn }).gtag
  return typeof fn === 'function' ? fn : null
}

// Dispara Lead no Pixel (com eventID p/ deduplicar com a CAPI) + GA4 + conversão Google Ads
export function trackLeadEvent(contentName: string, eventId: string) {
  fbq()?.('track', 'Lead', { content_name: contentName }, { eventID: eventId })
  gtag()?.('event', 'generate_lead', { method: 'form', content: contentName })
  const gadsConversion = process.env.NEXT_PUBLIC_GADS_CONVERSION
  if (gadsConversion) gtag()?.('event', 'conversion', { send_to: gadsConversion })
}

export function trackViewContent(slug: string) {
  fbq()?.('track', 'ViewContent', { content_name: slug, content_type: 'product' })
  gtag()?.('event', 'view_item', { items: [{ item_id: slug }] })
}

export function trackSpaPageView(path: string) {
  fbq()?.('track', 'PageView')
  gtag()?.('event', 'page_view', { page_path: path })
}

// Reenvio server-side (Meta CAPI) — fire-and-forget, noop se env não configurada no servidor
export function sendLeadToCapi(payload: {
  event_id: string
  nome: string
  telefone: string
  email?: string | null
  content_name: string
}) {
  if (typeof window === 'undefined') return
  const attrib = getAttribution()
  fetch('/api/meta-capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      fbclid: attrib.fbclid || null,
      url: window.location.href,
    }),
    keepalive: true,
  }).catch(() => {})
}
