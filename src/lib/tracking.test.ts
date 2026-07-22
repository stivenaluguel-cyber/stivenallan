import { afterEach, describe, expect, it, vi } from 'vitest'
import { createHash } from 'node:crypto'

// Mock hoisted do @sentry/nextjs pra observar breadcrumb + captureMessage
const { sentrySpies } = vi.hoisted(() => ({
  sentrySpies: {
    addBreadcrumb: vi.fn(),
    captureMessage: vi.fn(),
    captureException: vi.fn(),
  },
}))

vi.mock('@sentry/nextjs', () => ({
  addBreadcrumb: (...a: unknown[]) => (sentrySpies.addBreadcrumb as unknown as (...x: unknown[]) => unknown)(...a),
  captureMessage: (...a: unknown[]) => (sentrySpies.captureMessage as unknown as (...x: unknown[]) => unknown)(...a),
  captureException: (...a: unknown[]) => (sentrySpies.captureException as unknown as (...x: unknown[]) => unknown)(...a),
}))

import {
  buildEnhancedUserData,
  captureAttribution,
  getAttribution,
  normalizeEmailForHash,
  normalizeFirstNameForHash,
  normalizePhoneForHash,
  sha256Hex,
  trackLeadEvent,
  trackSpaPageView,
  trackViewContent,
  trackWhatsappClick,
  trackWhatsappLinkFallback,
} from './tracking'
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from './consent'

// Referência independente para comparar com o helper (Web Crypto no runtime vs Node crypto no teste)
function sha256HexRef(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

const KEY = 'sa_attrib'

function consentJson(categories: { analytics: boolean; marketing: boolean }): string {
  return JSON.stringify({ version: CONSENT_VERSION, updatedAt: '2026-01-01T00:00:00.000Z', categories })
}

const FULL_CONSENT = consentJson({ analytics: true, marketing: true })

// Stub mínimo de window + storages para rodar em ambiente node (sem jsdom).
// `consent` default liga tudo — os testes de gate passam o cenário negado.
function mountBrowser({
  search,
  session = {},
  consent = FULL_CONSENT,
  fbq,
  gtag,
}: {
  search: string
  session?: Record<string, string>
  consent?: string | null
  fbq?: ReturnType<typeof vi.fn>
  gtag?: ReturnType<typeof vi.fn>
}) {
  const store: Record<string, string> = { ...session }
  const local: Record<string, string> = {}
  if (consent) local[CONSENT_STORAGE_KEY] = consent
  const localStorage = {
    getItem: (k: string) => (k in local ? local[k] : null),
    setItem: (k: string, v: string) => {
      local[k] = v
    },
  }
  vi.stubGlobal('window', {
    location: { search, href: `https://stivenallan.com.br/x${search}`, hostname: 'stivenallan.com.br' },
    localStorage,
    fbq,
    gtag,
  })
  vi.stubGlobal('document', { title: 'Página Teste', cookie: '' })
  vi.stubGlobal('sessionStorage', {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = v
    },
  })
  return store
}

describe('captureAttribution — semântica first-touch', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('preserva o valor existente quando um novo param chega (first-touch vence)', () => {
    const store = mountBrowser({
      search: '?utm_source=facebook',
      session: { [KEY]: JSON.stringify({ utm_source: 'google' }) },
    })
    captureAttribution()
    expect(JSON.parse(store[KEY])).toEqual({ utm_source: 'google' })
  })

  it('adiciona chave nova sem sobrescrever as já existentes', () => {
    const store = mountBrowser({
      search: '?utm_campaign=x',
      session: { [KEY]: JSON.stringify({ utm_source: 'google' }) },
    })
    captureAttribution()
    expect(JSON.parse(store[KEY])).toEqual({ utm_source: 'google', utm_campaign: 'x' })
  })

  it('grava atribuição fresca quando sessionStorage está vazio', () => {
    const store = mountBrowser({
      search: '?utm_source=y&fbclid=abc',
    })
    captureAttribution()
    const stored = JSON.parse(store[KEY])
    // fbclid_ts é auto-adicionado quando fbclid é novo — E8
    expect(stored).toMatchObject({ utm_source: 'y', fbclid: 'abc' })
    expect(typeof stored.fbclid_ts).toBe('string')
    expect(Number(stored.fbclid_ts)).toBeGreaterThan(0)
  })

  it('ignora params que não fazem parte de ATTRIB_PARAMS', () => {
    const store = mountBrowser({
      search: '?debug=1&ref=partner',
      session: { [KEY]: JSON.stringify({ utm_source: 'google' }) },
    })
    captureAttribution()
    // Sem mudança — nenhum param válido veio na URL.
    expect(JSON.parse(store[KEY])).toEqual({ utm_source: 'google' })
  })

  it('trunca valores longos em 255 chars', () => {
    const longValue = 'x'.repeat(500)
    const store = mountBrowser({ search: `?utm_campaign=${longValue}` })
    captureAttribution()
    const stored = JSON.parse(store[KEY])
    expect(stored.utm_campaign.length).toBe(255)
  })

  it('não lança nem grava quando window é undefined (SSR)', () => {
    // Sem mountBrowser: window continua undefined no ambiente node.
    expect(() => captureAttribution()).not.toThrow()
  })

  it('grava fbclid_ts quando fbclid é NOVO na sessão (E8)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01T12:00:00.000Z'))
    const fixedTs = String(Date.now())

    const store = mountBrowser({ search: '?fbclid=abc123' })
    captureAttribution()
    const stored = JSON.parse(store[KEY])
    expect(stored.fbclid).toBe('abc123')
    expect(stored.fbclid_ts).toBe(fixedTs)

    vi.useRealTimers()
  })

  it('NÃO sobrescreve fbclid_ts quando fbclid já existia na sessão (first-touch preservado)', () => {
    const originalTs = '1700000000000'
    const store = mountBrowser({
      search: '?fbclid=novoclick',
      session: { [KEY]: JSON.stringify({ fbclid: 'antigoclick', fbclid_ts: originalTs }) },
    })
    captureAttribution()
    const stored = JSON.parse(store[KEY])
    // fbclid antigo preservado (first-touch)
    expect(stored.fbclid).toBe('antigoclick')
    // fbclid_ts do click original preservado — não vira Date.now()
    expect(stored.fbclid_ts).toBe(originalTs)
  })
})

describe('getAttribution', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('retorna {} quando window é undefined', () => {
    expect(getAttribution()).toEqual({})
  })

  it('retorna o objeto parseado do sessionStorage', () => {
    mountBrowser({
      search: '',
      session: { [KEY]: JSON.stringify({ utm_source: 'x', fbclid: 'y' }) },
    })
    expect(getAttribution()).toEqual({ utm_source: 'x', fbclid: 'y' })
  })

  it('retorna {} quando o storage está vazio', () => {
    mountBrowser({ search: '' })
    expect(getAttribution()).toEqual({})
  })

  it('retorna {} quando o valor é JSON inválido', () => {
    mountBrowser({ search: '', session: { [KEY]: 'not-json{' } })
    expect(getAttribution()).toEqual({})
  })
})

// --- Enhanced Conversions helpers ---

describe('sha256Hex', () => {
  it('produz mesmo hash que a implementação de referência do Node', async () => {
    const value = 'test-input'
    expect(await sha256Hex(value)).toBe(sha256HexRef(value))
  })

  it('é determinístico', async () => {
    expect(await sha256Hex('abc')).toBe(await sha256Hex('abc'))
  })
})

describe('normalizeEmailForHash', () => {
  it('trim + lowercase', () => {
    expect(normalizeEmailForHash('  A@B.COM ')).toBe('a@b.com')
    expect(normalizeEmailForHash('Stiven.Allan@GMAIL.com')).toBe('stiven.allan@gmail.com')
  })
})

describe('normalizePhoneForHash', () => {
  it('adiciona prefix +55 pra 10-11 dígitos (E.164 completo, com "+")', () => {
    expect(normalizePhoneForHash('(48) 9 9164-2332')).toBe('+5548991642332') // 11 dígitos
    expect(normalizePhoneForHash('(48) 3222-1010')).toBe('+554832221010') // 10 dígitos
  })

  it('não duplica country code, mas SEMPRE prefixa "+"', () => {
    expect(normalizePhoneForHash('5548991642332')).toBe('+5548991642332')
    expect(normalizePhoneForHash('+55 48 99164-2332')).toBe('+5548991642332')
  })

  it('remove qualquer não-dígito antes de aplicar prefix', () => {
    expect(normalizePhoneForHash('48 9 9164 2332')).toBe('+5548991642332')
  })

  it('vazio ou só símbolos → string vazia (não hasheia lixo)', () => {
    expect(normalizePhoneForHash('')).toBe('')
    expect(normalizePhoneForHash('()---')).toBe('')
  })
})

describe('normalizeFirstNameForHash', () => {
  it('só primeiro nome, sem acento, lowercase', () => {
    expect(normalizeFirstNameForHash('Ana Maria Silva')).toBe('ana')
    expect(normalizeFirstNameForHash('Ána Márcia')).toBe('ana')
    expect(normalizeFirstNameForHash('  JOSÉ Carlos  ')).toBe('jose')
  })
})

describe('buildEnhancedUserData', () => {
  it('constrói objeto Google Ads (email + phone E.164 com "+" + address como objeto)', async () => {
    const data = await buildEnhancedUserData({
      email: '  A@B.COM ',
      telefone: '(48) 9 9164-2332',
      nome: 'Ana Maria',
    })
    expect(data.sha256_email_address).toBe(sha256HexRef('a@b.com'))
    // Hash é do "+5548991642332" (E.164 completo) — sem o "+", match rate = 0
    expect(data.sha256_phone_number).toBe(sha256HexRef('+5548991642332'))
    // gtag espera address como OBJETO, não array
    expect(data.address).toEqual({ sha256_first_name: sha256HexRef('ana') })
  })

  it('omite campos null/empty (não hasheia string vazia)', async () => {
    const data = await buildEnhancedUserData({
      email: null,
      telefone: '',
      nome: '   ',
    })
    expect(data).toEqual({})
  })

  it('constrói só o que tem — não força shape completo', async () => {
    const data = await buildEnhancedUserData({ email: 'a@b.com' })
    expect(Object.keys(data)).toEqual(['sha256_email_address'])
  })
})

describe('trackLeadEvent + Enhanced Conversions no gtag', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.NEXT_PUBLIC_GADS_CONVERSION
  })

  it('não chama conversion event quando NEXT_PUBLIC_GADS_CONVERSION ausente', async () => {
    const gtagSpy = vi.fn()
    mountBrowser({ search: '', gtag: gtagSpy })
    delete process.env.NEXT_PUBLIC_GADS_CONVERSION

    await trackLeadEvent('Monte Leone', 'evt-1', { email: 'a@b.com' })

    // generate_lead ainda pode ter sido chamado, mas 'conversion' NÃO
    const conversionCall = gtagSpy.mock.calls.find(
      (call) => call[0] === 'event' && call[1] === 'conversion',
    )
    expect(conversionCall).toBeUndefined()
  })

  it('injeta user_data hasheado no conversion event quando userData é passado', async () => {
    const gtagSpy = vi.fn()
    mountBrowser({ search: '', gtag: gtagSpy })
    process.env.NEXT_PUBLIC_GADS_CONVERSION = 'AW-123/abc'

    await trackLeadEvent('Monte Leone', 'evt-1', {
      email: 'a@b.com',
      telefone: '(48) 9 9164-2332',
      nome: 'Ana Maria',
    })

    const conversionCall = gtagSpy.mock.calls.find(
      (call) => call[0] === 'event' && call[1] === 'conversion',
    )
    expect(conversionCall).toBeDefined()
    const [, , params] = conversionCall as [string, string, Record<string, unknown>]
    expect(params.send_to).toBe('AW-123/abc')
    const userData = params.user_data as Record<string, unknown>
    expect(userData.sha256_email_address).toBe(sha256HexRef('a@b.com'))
    expect(userData.sha256_phone_number).toBe(sha256HexRef('+5548991642332'))
    expect(userData.address).toEqual({ sha256_first_name: sha256HexRef('ana') })
  })

  it('dispara conversion sem user_data quando userData não é passado (retro-compat)', async () => {
    const gtagSpy = vi.fn()
    mountBrowser({ search: '', gtag: gtagSpy })
    process.env.NEXT_PUBLIC_GADS_CONVERSION = 'AW-999'

    await trackLeadEvent('Book Empreendimento', 'evt-2')

    const conversionCall = gtagSpy.mock.calls.find(
      (call) => call[0] === 'event' && call[1] === 'conversion',
    )
    expect(conversionCall).toBeDefined()
    const [, , params] = conversionCall as [string, string, Record<string, unknown>]
    expect(params).toEqual({ send_to: 'AW-999' })
    expect(params.user_data).toBeUndefined()
  })

  it('propaga empreendimento/position padronizados pro Pixel e pro GA4', async () => {
    const gtagSpy = vi.fn()
    const fbqSpy = vi.fn()
    mountBrowser({ search: '', gtag: gtagSpy, fbq: fbqSpy })

    await trackLeadEvent('Monte Leone', 'evt-ctx', undefined, {
      empreendimento: 'monte-leone-centro-criciuma-sc',
      position: 'contact_form',
    })

    const expected = {
      content_name: 'Monte Leone',
      method: 'form',
      empreendimento: 'monte-leone-centro-criciuma-sc',
      position: 'contact_form',
    }
    expect(fbqSpy).toHaveBeenCalledWith('track', 'Lead', expected, { eventID: 'evt-ctx' })
    expect(gtagSpy).toHaveBeenCalledWith('event', 'generate_lead', expected)
  })
})

describe('gates de consentimento (LGPD)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.NEXT_PUBLIC_GADS_CONVERSION
  })

  it('sem consentimento salvo: nenhum evento sai (Pixel, GA4 e Ads bloqueados)', async () => {
    const gtagSpy = vi.fn()
    const fbqSpy = vi.fn()
    mountBrowser({ search: '', consent: null, gtag: gtagSpy, fbq: fbqSpy })
    process.env.NEXT_PUBLIC_GADS_CONVERSION = 'AW-123/abc'

    await trackLeadEvent('Monte Leone', 'evt-1', { email: 'a@b.com' })
    trackWhatsappClick({ content_name: 'WhatsApp' })
    trackViewContent('monte-leone-centro-criciuma-sc')
    trackSpaPageView('/empreendimentos')

    expect(fbqSpy).not.toHaveBeenCalled()
    expect(gtagSpy).not.toHaveBeenCalled()
  })

  it('só analytics: GA4 recebe, Pixel e conversão Ads não', async () => {
    const gtagSpy = vi.fn()
    const fbqSpy = vi.fn()
    mountBrowser({
      search: '',
      consent: consentJson({ analytics: true, marketing: false }),
      gtag: gtagSpy,
      fbq: fbqSpy,
    })
    process.env.NEXT_PUBLIC_GADS_CONVERSION = 'AW-123/abc'

    await trackLeadEvent('Monte Leone', 'evt-1')

    expect(fbqSpy).not.toHaveBeenCalled()
    expect(gtagSpy).toHaveBeenCalledWith('event', 'generate_lead', expect.objectContaining({ content_name: 'Monte Leone' }))
    const conversionCall = gtagSpy.mock.calls.find((c) => c[0] === 'event' && c[1] === 'conversion')
    expect(conversionCall).toBeUndefined()
  })

  it('só marketing: Pixel e conversão Ads recebem, GA4 não', async () => {
    const gtagSpy = vi.fn()
    const fbqSpy = vi.fn()
    mountBrowser({
      search: '',
      consent: consentJson({ analytics: false, marketing: true }),
      gtag: gtagSpy,
      fbq: fbqSpy,
    })
    process.env.NEXT_PUBLIC_GADS_CONVERSION = 'AW-123/abc'

    await trackLeadEvent('Monte Leone', 'evt-1')

    expect(fbqSpy).toHaveBeenCalledWith(
      'track',
      'Lead',
      expect.objectContaining({ content_name: 'Monte Leone' }),
      { eventID: 'evt-1' },
    )
    const generateLead = gtagSpy.mock.calls.find((c) => c[0] === 'event' && c[1] === 'generate_lead')
    expect(generateLead).toBeUndefined()
    const conversionCall = gtagSpy.mock.calls.find((c) => c[0] === 'event' && c[1] === 'conversion')
    expect(conversionCall).toBeDefined()
  })

  it('consentimento de versão antiga é tratado como não decidido (bloqueia tudo)', () => {
    const gtagSpy = vi.fn()
    const fbqSpy = vi.fn()
    mountBrowser({
      search: '',
      consent: JSON.stringify({ version: 0, updatedAt: 'x', categories: { analytics: true, marketing: true } }),
      gtag: gtagSpy,
      fbq: fbqSpy,
    })
    trackSpaPageView('/x')
    trackWhatsappClick({ content_name: 'WhatsApp' })
    expect(gtagSpy).not.toHaveBeenCalled()
    expect(fbqSpy).not.toHaveBeenCalled()
  })
})

describe('trackViewContent — enriquecimento pelo catálogo', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('slug do catálogo → item completo (nome, construtora, cidade, status), SEM preço', () => {
    const gtagSpy = vi.fn()
    const fbqSpy = vi.fn()
    mountBrowser({ search: '', gtag: gtagSpy, fbq: fbqSpy })

    const sent = trackViewContent('monte-leone-centro-criciuma-sc')

    expect(sent).toEqual({ meta: true, ga4: true })
    expect(fbqSpy).toHaveBeenCalledWith('track', 'ViewContent', expect.objectContaining({
      content_ids: ['monte-leone-centro-criciuma-sc'],
      content_name: 'Monte Leone Residencial',
      content_type: 'product',
      content_category: 'Criciúma',
      construtora: 'Construtora Fontana',
    }))
    const [, , ga4Params] = gtagSpy.mock.calls.find((c) => c[1] === 'view_item') as [string, string, Record<string, unknown>]
    const item = (ga4Params.items as Record<string, unknown>[])[0]
    expect(item).toMatchObject({
      item_id: 'monte-leone-centro-criciuma-sc',
      item_name: 'Monte Leone Residencial',
      item_brand: 'Construtora Fontana',
      item_category: 'Criciúma',
    })
    // Preço "sob consulta" nunca vira value/currency
    expect(ga4Params.value).toBeUndefined()
    expect(ga4Params.currency).toBeUndefined()
  })

  it('slug fora do catálogo → fallback slug-only', () => {
    const fbqSpy = vi.fn()
    mountBrowser({ search: '', fbq: fbqSpy, gtag: vi.fn() })
    trackViewContent('slug-so-do-banco-xyz')
    expect(fbqSpy).toHaveBeenCalledWith('track', 'ViewContent', expect.objectContaining({
      content_ids: ['slug-so-do-banco-xyz'],
      content_name: 'slug-so-do-banco-xyz',
    }))
  })

  it('canais seletivos: dispara só o canal pedido e reporta o que saiu', () => {
    const gtagSpy = vi.fn()
    const fbqSpy = vi.fn()
    mountBrowser({ search: '', gtag: gtagSpy, fbq: fbqSpy })

    const sent = trackViewContent('monte-leone-centro-criciuma-sc', { meta: false, ga4: true })

    expect(sent).toEqual({ meta: false, ga4: true })
    expect(fbqSpy).not.toHaveBeenCalled()
    expect(gtagSpy).toHaveBeenCalled()
  })

  it('reporta canal como não-enviado quando o script ainda não carregou (fbq ausente)', () => {
    const gtagSpy = vi.fn()
    mountBrowser({ search: '', gtag: gtagSpy, fbq: undefined })
    const sent = trackViewContent('monte-leone-centro-criciuma-sc')
    expect(sent).toEqual({ meta: false, ga4: true })
  })
})

describe('trackSpaPageView / trackWhatsappClick — parâmetros', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('page_view manda page_path + page_location + page_title', () => {
    const gtagSpy = vi.fn()
    mountBrowser({ search: '?utm_source=x', gtag: gtagSpy })
    trackSpaPageView('/empreendimentos')
    expect(gtagSpy).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/empreendimentos',
      page_location: 'https://stivenallan.com.br/x?utm_source=x',
      page_title: 'Página Teste',
    })
  })

  it('contact_whatsapp usa os mesmos nomes de parâmetro do Lead', () => {
    const gtagSpy = vi.fn()
    const fbqSpy = vi.fn()
    mountBrowser({ search: '', gtag: gtagSpy, fbq: fbqSpy })
    trackWhatsappClick({ content_name: 'Monte Leone', empreendimento: 'monte-leone-centro-criciuma-sc', position: 'hero' })
    const expected = {
      content_name: 'Monte Leone',
      method: 'whatsapp',
      empreendimento: 'monte-leone-centro-criciuma-sc',
      position: 'hero',
    }
    expect(fbqSpy).toHaveBeenCalledWith('track', 'Contact', expected)
    expect(gtagSpy).toHaveBeenCalledWith('event', 'contact_whatsapp', expected)
  })

  it('fallback de link wa.me sem data-wpp: deriva slug do path e nome do catálogo', () => {
    const fbqSpy = vi.fn()
    mountBrowser({ search: '', fbq: fbqSpy, gtag: vi.fn() })
    trackWhatsappLinkFallback('/empreendimento/fontana/monte-leone-centro-criciuma-sc')
    expect(fbqSpy).toHaveBeenCalledWith('track', 'Contact', {
      content_name: 'Monte Leone Residencial',
      method: 'whatsapp',
      empreendimento: 'monte-leone-centro-criciuma-sc',
      position: 'link_whatsapp',
    })
  })

  it('fallback fora de página de empreendimento: content_name genérico, sem slug', () => {
    const fbqSpy = vi.fn()
    mountBrowser({ search: '', fbq: fbqSpy, gtag: vi.fn() })
    trackWhatsappLinkFallback('/')
    expect(fbqSpy).toHaveBeenCalledWith('track', 'Contact', {
      content_name: 'WhatsApp',
      method: 'whatsapp',
      position: 'link_whatsapp',
    })
  })
})

describe('trackLeadEvent — sinal pro Sentry (F-Match-Verify)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.NEXT_PUBLIC_GADS_CONVERSION
    sentrySpies.addBreadcrumb.mockClear()
    sentrySpies.captureMessage.mockClear()
  })

  it('adiciona breadcrumb Sentry quando enhanced conversion sobe com hashes válidos', async () => {
    mountBrowser({ search: '', gtag: vi.fn() })
    process.env.NEXT_PUBLIC_GADS_CONVERSION = 'AW-123/abc'

    await trackLeadEvent('Monte Leone', 'evt-1', {
      email: 'a@b.com',
      telefone: '(48) 9 9164-2332',
      nome: 'Ana',
    })

    expect(sentrySpies.addBreadcrumb).toHaveBeenCalledTimes(1)
    const [args] = sentrySpies.addBreadcrumb.mock.calls[0]
    expect(args).toMatchObject({
      category: 'gads',
      message: 'enhanced conversion fired',
      level: 'info',
    })
    // Não deve alarmar
    expect(sentrySpies.captureMessage).not.toHaveBeenCalled()
  })

  it('captura warning Sentry quando userData veio mas nada hasheou (bug do form)', async () => {
    mountBrowser({ search: '', gtag: vi.fn() })
    process.env.NEXT_PUBLIC_GADS_CONVERSION = 'AW-123/abc'

    // Tudo empty/null — nada vai hashear
    await trackLeadEvent('Book X', 'evt-3', {
      email: null,
      telefone: '',
      nome: '   ',
    })

    expect(sentrySpies.captureMessage).toHaveBeenCalledTimes(1)
    const [msg, options] = sentrySpies.captureMessage.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ]
    expect(msg).toMatch(/produced no hashes/)
    expect(options.level).toBe('warning')
    expect((options.tags as Record<string, unknown>).check).toBe('match-verify')
    // Breadcrumb não é adicionado nesse path
    expect(sentrySpies.addBreadcrumb).not.toHaveBeenCalled()
  })
})
