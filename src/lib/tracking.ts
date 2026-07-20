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

export type Attribution = Partial<Record<(typeof ATTRIB_PARAMS)[number], string>> & {
  // Timestamp (millis stringificados) do momento em que o `fbclid` entrou na sessão.
  // Usado pra sintetizar `_fbc` no server com timestamp do CLICK, não do submit.
  fbclid_ts?: string
}

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
    // fbclid_ts é gravado APENAS quando o fbclid é novo na sessão — assim o
    // first-touch preserva o momento real do click original (não sobrescreve
    // com Date.now() de uma nova landing na mesma sessão).
    const foundWithTs: Attribution = { ...found }
    if (found.fbclid && !existing.fbclid) {
      foundWithTs.fbclid_ts = String(Date.now())
    }
    // First-touch: chaves já gravadas vencem — `existing` vem por último no spread para sobrescrever `foundWithTs`.
    sessionStorage.setItem(KEY_ATTRIB, JSON.stringify({ ...foundWithTs, ...existing }))
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

// --- Enhanced Conversions (Google Ads) ---
// Hashes SHA-256 client-side seguindo as normas de normalização do Google Ads.
// Passar hashes junto do conversion event sobe match rate ~30% em campanhas.

export type EnhancedUserData = {
  email?: string | null
  telefone?: string | null
  nome?: string | null
}

export async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function normalizeEmailForHash(email: string): string {
  return email.trim().toLowerCase()
}

// Normaliza pra E.164 com "+" — obrigatório: sem o "+", o hash não bate com o
// que o Google normaliza no lado deles e o Enhanced Conversions match cai a 0%.
// Regra: strip não-dígitos → prefix 55 se faltar country code → prefixa "+".
export function normalizePhoneForHash(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length >= 12) return '+' + digits
  if (digits.length === 10 || digits.length === 11) return '+55' + digits
  return '+' + digits
}

// Só primeiro nome, sem acentos, lowercase, trim.
export function normalizeFirstNameForHash(nome: string): string {
  return nome
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .split(/\s+/)[0]
}

export async function buildEnhancedUserData(data: EnhancedUserData): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {}
  try {
    if (data.email) {
      const normalized = normalizeEmailForHash(data.email)
      if (normalized) out.sha256_email_address = await sha256Hex(normalized)
    }
    if (data.telefone) {
      const normalized = normalizePhoneForHash(data.telefone)
      if (normalized) out.sha256_phone_number = await sha256Hex(normalized)
    }
    if (data.nome) {
      const firstName = normalizeFirstNameForHash(data.nome)
      // gtag Enhanced Conversions espera `address` como objeto (não array).
      // Formato array é da Google Ads REST API — aqui viraria noop silencioso.
      if (firstName) out.address = { sha256_first_name: await sha256Hex(firstName) }
    }
  } catch {
    // crypto.subtle indisponível → devolve o que conseguiu construir
  }
  return out
}

// Dispara Lead no Pixel (com eventID p/ deduplicar com a CAPI) + GA4 + conversão Google Ads.
// Se `userData` vier, sobe Enhanced Conversions no evento de conversão do Ads.
// F-Match-Verify: emite sinal pro Sentry quando o Enhanced Conversions degrada.
export async function trackLeadEvent(
  contentName: string,
  eventId: string,
  userData?: EnhancedUserData,
) {
  fbq()?.('track', 'Lead', { content_name: contentName }, { eventID: eventId })
  gtag()?.('event', 'generate_lead', { method: 'form', content: contentName })

  const gadsConversion = process.env.NEXT_PUBLIC_GADS_CONVERSION
  if (!gadsConversion) return

  const params: Record<string, unknown> = { send_to: gadsConversion }
  if (userData) {
    const enhanced = await buildEnhancedUserData(userData)
    const hashedFields = Object.keys(enhanced)
    if (hashedFields.length > 0) {
      params.user_data = enhanced
      // Breadcrumb: aparece no Sentry se houver erro subsequente + no dashboard
      // de performance como contexto do span da conversão.
      try {
        const Sentry = await import('@sentry/nextjs')
        Sentry.addBreadcrumb({
          category: 'gads',
          message: 'enhanced conversion fired',
          level: 'info',
          data: { fields: hashedFields, content_name: contentName },
        })
      } catch {
        // Sentry indisponível — silêncio, breadcrumb é nice-to-have.
      }
    } else {
      // userData veio mas nada hasheou — form está mandando shape errado.
      // Warning pro Sentry pra você ver quantos casos + quais inputs.
      try {
        const Sentry = await import('@sentry/nextjs')
        Sentry.captureMessage('gads: userData provided but produced no hashes', {
          level: 'warning',
          tags: { source: 'tracking', check: 'match-verify' },
          extra: {
            content_name: contentName,
            inputKeys: Object.keys(userData).filter((k) => Boolean((userData as Record<string, unknown>)[k])),
          },
        })
      } catch {
        // idem
      }
    }
  }
  gtag()?.('event', 'conversion', params)
}

export function trackViewContent(slug: string) {
  fbq()?.('track', 'ViewContent', { content_name: slug, content_type: 'product' })
  gtag()?.('event', 'view_item', { items: [{ item_id: slug }] })
}

export function trackSpaPageView(path: string) {
  fbq()?.('track', 'PageView')
  gtag()?.('event', 'page_view', { page_path: path })
}

// --- Micro-conversões da jornada (funil pré-lead) ---
// GA4 apenas: o pipeline de conversão real (Lead + CAPI + Enhanced Conversions)
// já vive isolado em trackLeadEvent/sendLeadToCapi acima — não duplicar aqui.
// O clique em links de WhatsApp usa outro mecanismo (data-wpp, delegado em
// layout.tsx) porque já existe um evento Contact/contact_whatsapp sitewide.

type FunilParams = { empreendimento: string; content_name: string }
// form_type distingue, no GA4, qual formulário gerou o evento — nunca incluir
// nome/telefone/e-mail ou qualquer dado pessoal nestes params.
type FormParams = FunilParams & { form_type: 'catalog_modal' | 'contact_form' }

export function trackCatalogClick(params: FormParams) {
  gtag()?.('event', 'catalog_click', params)
}

export function trackPlantaOpen(label: string, params: FunilParams) {
  gtag()?.('event', 'planta_open', { label, ...params })
}

export function trackFormOpen(params: FormParams) {
  gtag()?.('event', 'form_open', params)
}

export function trackFormStart(params: FormParams) {
  gtag()?.('event', 'form_start', params)
}

export function trackFormSubmit(params: FormParams) {
  gtag()?.('event', 'form_submit', params)
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
      fbclid_ts: attrib.fbclid_ts ?? null,
      url: window.location.href,
    }),
    keepalive: true,
  }).catch(() => {})
}
