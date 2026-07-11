import { afterEach, describe, expect, it, vi } from 'vitest'
import { createHash } from 'node:crypto'
import {
  buildEnhancedUserData,
  captureAttribution,
  getAttribution,
  normalizeEmailForHash,
  normalizeFirstNameForHash,
  normalizePhoneForHash,
  sha256Hex,
  trackLeadEvent,
} from './tracking'

// Referência independente para comparar com o helper (Web Crypto no runtime vs Node crypto no teste)
function sha256HexRef(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

const KEY = 'sa_attrib'

// Stub mínimo de window + sessionStorage para rodar em ambiente node (sem jsdom).
function mountBrowser({ search, session = {} }: { search: string; session?: Record<string, string> }) {
  const store: Record<string, string> = { ...session }
  vi.stubGlobal('window', { location: { search } })
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
    vi.stubGlobal('window', { fbq: undefined, gtag: gtagSpy })
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
    vi.stubGlobal('window', { fbq: undefined, gtag: gtagSpy })
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
    vi.stubGlobal('window', { fbq: undefined, gtag: gtagSpy })
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
})
