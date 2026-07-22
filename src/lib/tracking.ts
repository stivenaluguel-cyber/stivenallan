import { hasAnalyticsConsent, hasMarketingConsent } from './consent'
import { imoveis } from '@/data/imoveis'

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

// Log de desenvolvimento: cada evento disparado (ou bloqueado por consentimento)
// aparece no console SÓ em `next dev` — o branch é eliminado no build de produção.
function devLog(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[tracking]', ...args)
  }
}

// Captura UTMs/click-ids da URL de entrada e persiste na sessão (first-touch da sessão).
// Armazenamento first-party pra fins de atendimento/CRM — só é COMPARTILHADO com
// plataformas de anúncio (CAPI) mediante consentimento de marketing.
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

// Meta Pixel: exige consentimento de MARKETING além do script carregado.
function fbq(): FbqFn | null {
  if (typeof window === 'undefined') return null
  if (!hasMarketingConsent()) return null
  const fn = (window as unknown as { fbq?: FbqFn }).fbq
  return typeof fn === 'function' ? fn : null
}

// GA4: exige consentimento de ANALYTICS. O stub global de gtag existe sempre
// (script inline do layout, que também seta o Consent Mode default deny) —
// eventos entram na dataLayer e só são processados se/quando o gtag.js
// carregar, o que também é condicionado ao consentimento (AnalyticsScripts).
function gtagAnalytics(): GtagFn | null {
  if (typeof window === 'undefined') return null
  if (!hasAnalyticsConsent()) return null
  const fn = (window as unknown as { gtag?: GtagFn }).gtag
  return typeof fn === 'function' ? fn : null
}

// Google Ads (conversões): categoria MARKETING.
function gtagAds(): GtagFn | null {
  if (typeof window === 'undefined') return null
  if (!hasMarketingConsent()) return null
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

// Contexto padronizado dos eventos de conversão — permite comparar WhatsApp
// (Contact/contact_whatsapp) e formulário (Lead/generate_lead) por
// empreendimento (slug), posição do CTA e campanha, com os MESMOS nomes de
// parâmetro nas duas plataformas. Nunca incluir dados pessoais aqui.
export type LeadEventContext = {
  // Slug do empreendimento (ex.: monte-leone-centro-criciuma-sc)
  empreendimento?: string | null
  // Posição/origem do CTA (ex.: contact_form, catalog_modal, hero, float, footer)
  position?: string | null
}

// Dispara Lead no Pixel (com eventID p/ deduplicar com a CAPI) + GA4 + conversão Google Ads.
// CHAMAR SOMENTE APÓS SUCESSO REAL DA API (res.ok) — nunca no submit otimista.
// Se `userData` vier, sobe Enhanced Conversions no evento de conversão do Ads.
// F-Match-Verify: emite sinal pro Sentry quando o Enhanced Conversions degrada.
export async function trackLeadEvent(
  contentName: string,
  eventId: string,
  userData?: EnhancedUserData,
  context?: LeadEventContext,
) {
  const shared: Record<string, unknown> = { content_name: contentName, method: 'form' }
  if (context?.empreendimento) shared.empreendimento = context.empreendimento
  if (context?.position) shared.position = context.position

  fbq()?.('track', 'Lead', shared, { eventID: eventId })
  gtagAnalytics()?.('event', 'generate_lead', shared)
  devLog('Lead/generate_lead', { eventId, ...shared })

  // Lido no momento da chamada (não const de módulo): o Next inline-a
  // process.env.NEXT_PUBLIC_* no build do client de qualquer forma, e os testes
  // manipulam a env em runtime.
  const gadsConversion = process.env.NEXT_PUBLIC_GADS_CONVERSION
  if (!gadsConversion) return
  const ads = gtagAds()
  if (!ads) return

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
  ads('event', 'conversion', params)
}

// Clique em CTA de WhatsApp (delegado via [data-wpp] no TrackingProvider).
// Mesmos nomes de parâmetro do Lead — comparável por empreendimento/posição.
export function trackWhatsappClick(params: {
  content_name: string
  empreendimento?: string | null
  position?: string | null
}) {
  const shared: Record<string, unknown> = { content_name: params.content_name, method: 'whatsapp' }
  if (params.empreendimento) shared.empreendimento = params.empreendimento
  if (params.position) shared.position = params.position
  fbq()?.('track', 'Contact', shared)
  gtagAnalytics()?.('event', 'contact_whatsapp', shared)
  devLog('Contact/contact_whatsapp', shared)
}

// Fallback pra links wa.me SEM [data-wpp] (várias páginas de empreendimento não
// anotam os CTAs): deriva o empreendimento do pathname e o nome do catálogo.
// position 'link_whatsapp' distingue esses cliques dos CTAs anotados.
export function trackWhatsappLinkFallback(path: string) {
  const m = path.match(/^\/empreendimento\/[^/]+\/([^/]+)/)
  const slug = m?.[1] ?? null
  const info = slug ? lookupItem(slug) : null
  trackWhatsappClick({
    content_name: info?.item_name ?? 'WhatsApp',
    empreendimento: slug,
    position: 'link_whatsapp',
  })
}

// Catálogo estático → enriquece view_item/ViewContent sem custo de rede.
// Páginas só-do-banco (rota dinâmica sem pasta literal) caem no fallback slug-only.
type ItemInfo = {
  item_id: string
  item_name?: string
  construtora?: string
  cidade?: string
  bairro?: string
  status?: string
}

// Preço NUNCA é enviado: estratégia do site é "sob consulta" (exibir_preco=false
// em todo o catálogo) — valor não confiável não entra em value/currency.
function lookupItem(slug: string): ItemInfo {
  const found = imoveis.find((i) => i.slug === slug)
  if (!found) return { item_id: slug }
  return {
    item_id: slug,
    item_name: found.nome,
    construtora: found.construtora,
    cidade: found.cidade,
    bairro: found.bairro || undefined,
    status: found.status,
  }
}

export type ViewContentChannels = { meta: boolean; ga4: boolean }

// Abertura de página de empreendimento. `channels` permite ao TrackingProvider
// disparar por canal (ex.: consentimento concedido depois do load) sem duplicar
// no canal que já recebeu. Retorna o que foi de fato despachado.
export function trackViewContent(
  slug: string,
  channels: ViewContentChannels = { meta: true, ga4: true },
): ViewContentChannels {
  const info = lookupItem(slug)
  const sent: ViewContentChannels = { meta: false, ga4: false }

  if (channels.meta) {
    const f = fbq()
    if (f) {
      f('track', 'ViewContent', {
        content_ids: [info.item_id],
        content_name: info.item_name ?? info.item_id,
        content_type: 'product',
        content_category: info.cidade,
        empreendimento: info.item_id,
        construtora: info.construtora,
        status: info.status,
      })
      sent.meta = true
    }
  }
  if (channels.ga4) {
    const g = gtagAnalytics()
    if (g) {
      g('event', 'view_item', {
        items: [
          {
            item_id: info.item_id,
            item_name: info.item_name,
            item_brand: info.construtora,
            item_category: info.cidade,
            item_category2: info.bairro,
            item_category3: info.status,
          },
        ],
      })
      sent.ga4 = true
    }
  }
  devLog('ViewContent/view_item', slug, sent)
  return sent
}

// page_view manual de navegação SPA (App Router). O page_view INICIAL vem da
// config do gtag.js / PageView do Pixel quando os scripts montam — aqui só as
// navegações client-side seguintes (TrackingProvider pula o primeiro render).
// IMPORTANTE: manter "Alterações de página por histórico do navegador" DESLIGADO
// no Enhanced Measurement do GA4, senão cada navegação conta duas vezes
// (ver docs/growth/tracking.md).
export function trackSpaPageView(path: string) {
  fbq()?.('track', 'PageView')
  gtagAnalytics()?.('event', 'page_view', {
    page_path: path,
    page_location: typeof window !== 'undefined' ? window.location.href : path,
    page_title: typeof document !== 'undefined' ? document.title : undefined,
  })
  devLog('page_view', path)
}

// --- Micro-conversões da jornada (funil pré-lead) ---
// GA4 apenas: o pipeline de conversão real (Lead + CAPI + Enhanced Conversions)
// já vive isolado em trackLeadEvent/sendLeadToCapi acima — não duplicar aqui.
// O clique em links de WhatsApp usa outro mecanismo (data-wpp, delegado no
// TrackingProvider) porque já existe um evento Contact/contact_whatsapp sitewide.

type FunilParams = { empreendimento: string; content_name: string }
// form_type distingue, no GA4, qual formulário gerou o evento — nunca incluir
// nome/telefone/e-mail ou qualquer dado pessoal nestes params.
type FormParams = FunilParams & { form_type: 'catalog_modal' | 'contact_form' }

export function trackCatalogClick(params: FormParams) {
  gtagAnalytics()?.('event', 'catalog_click', params)
}

export function trackPlantaOpen(label: string, params: FunilParams) {
  gtagAnalytics()?.('event', 'planta_open', { label, ...params })
}

export function trackFormOpen(params: FormParams) {
  gtagAnalytics()?.('event', 'form_open', params)
}

export function trackFormStart(params: FormParams) {
  gtagAnalytics()?.('event', 'form_start', params)
}

export function trackFormSubmit(params: FormParams) {
  gtagAnalytics()?.('event', 'form_submit', params)
}

// Reenvio server-side (Meta CAPI) — fire-and-forget, noop se env não configurada
// no servidor. Gated por consentimento de MARKETING: sem aceite, nem fbclid nem
// dados de contato (mesmo que depois hasheados) saem do browser rumo à Meta.
export function sendLeadToCapi(payload: {
  event_id: string
  nome: string
  telefone: string
  email?: string | null
  content_name: string
}) {
  if (typeof window === 'undefined') return
  if (!hasMarketingConsent()) {
    devLog('CAPI bloqueada: sem consentimento de marketing')
    return
  }
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
