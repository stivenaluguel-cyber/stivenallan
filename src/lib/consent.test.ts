import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CONSENT_CHANGED_EVENT,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  acceptAllConsent,
  consentModeParams,
  defaultPrefsCategories,
  getConsent,
  hasAnalyticsConsent,
  hasMarketingConsent,
  onConsentChange,
  rejectNonEssentialConsent,
  saveConsent,
  type ConsentState,
} from './consent'

// Stub de browser em ambiente node (sem jsdom), com localStorage + eventos +
// gtag/fbq observáveis e document.cookie gravável (pra testar a limpeza).
function mountBrowser({
  stored,
  gtag,
  fbq,
  cookies = '',
}: {
  stored?: string
  gtag?: ReturnType<typeof vi.fn>
  fbq?: ReturnType<typeof vi.fn>
  cookies?: string
} = {}) {
  const local: Record<string, string> = {}
  if (stored) local[CONSENT_STORAGE_KEY] = stored
  const listeners: Record<string, ((e: Event) => void)[]> = {}
  const win = {
    localStorage: {
      getItem: (k: string) => (k in local ? local[k] : null),
      setItem: (k: string, v: string) => {
        local[k] = v
      },
    },
    location: { hostname: 'stivenallan.com.br' },
    gtag,
    fbq,
    addEventListener: (type: string, cb: (e: Event) => void) => {
      ;(listeners[type] ??= []).push(cb)
    },
    removeEventListener: (type: string, cb: (e: Event) => void) => {
      listeners[type] = (listeners[type] ?? []).filter((l) => l !== cb)
    },
    dispatchEvent: (e: Event) => {
      for (const cb of listeners[(e as { type: string }).type] ?? []) cb(e)
      return true
    },
  }
  const cookieWrites: string[] = []
  const doc = {
    get cookie() {
      return cookies
    },
    set cookie(v: string) {
      cookieWrites.push(v)
    },
  }
  vi.stubGlobal('window', win)
  vi.stubGlobal('document', doc)
  // saveConsent usa CustomEvent — stub simples que preserva type + detail.
  vi.stubGlobal(
    'CustomEvent',
    class {
      type: string
      detail: unknown
      constructor(type: string, init?: { detail?: unknown }) {
        this.type = type
        this.detail = init?.detail
      }
    },
  )
  return { local, cookieWrites, listeners }
}

function validStored(categories: { analytics: boolean; marketing: boolean }) {
  return JSON.stringify({ version: CONSENT_VERSION, updatedAt: '2026-01-01T00:00:00.000Z', categories })
}

afterEach(() => vi.unstubAllGlobals())

describe('getConsent', () => {
  it('null quando window indisponível (SSR)', () => {
    expect(getConsent()).toBeNull()
  })

  it('null quando nada salvo — banner deve aparecer e tudo fica negado', () => {
    mountBrowser()
    expect(getConsent()).toBeNull()
    expect(hasAnalyticsConsent()).toBe(false)
    expect(hasMarketingConsent()).toBe(false)
  })

  it('devolve o estado salvo válido', () => {
    mountBrowser({ stored: validStored({ analytics: true, marketing: false }) })
    expect(getConsent()?.categories).toEqual({ analytics: true, marketing: false })
    expect(hasAnalyticsConsent()).toBe(true)
    expect(hasMarketingConsent()).toBe(false)
  })

  it('descarta JSON inválido e versão diferente (re-pergunta)', () => {
    mountBrowser({ stored: 'not-json{' })
    expect(getConsent()).toBeNull()
    mountBrowser({
      stored: JSON.stringify({ version: CONSENT_VERSION + 1, updatedAt: 'x', categories: { analytics: true, marketing: true } }),
    })
    expect(getConsent()).toBeNull()
  })
})

describe('saveConsent', () => {
  it('persiste, aplica gtag consent update (Consent Mode v2) e emite evento', () => {
    const gtag = vi.fn()
    const { local } = mountBrowser({ gtag })
    const received: unknown[] = []
    const off = onConsentChange((s) => received.push(s))

    const state = saveConsent({ analytics: true, marketing: false })

    expect(JSON.parse(local[CONSENT_STORAGE_KEY]).categories).toEqual({ analytics: true, marketing: false })
    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    expect(received).toHaveLength(1)
    expect((received[0] as { categories: unknown }).categories).toEqual(state.categories)
    off()
  })

  it('acceptAll / rejectNonEssential são atalhos coerentes', () => {
    const gtag = vi.fn()
    mountBrowser({ gtag })
    expect(acceptAllConsent().categories).toEqual({ analytics: true, marketing: true })
    expect(rejectNonEssentialConsent().categories).toEqual({ analytics: false, marketing: false })
  })

  it('revogação de marketing chama fbq consent revoke e expira cookies dos vendors', () => {
    const gtag = vi.fn()
    const fbq = vi.fn()
    const { cookieWrites } = mountBrowser({ gtag, fbq, cookies: '_ga=GA1.1; _ga_ABC=1; outro=2' })

    saveConsent({ analytics: false, marketing: false })

    expect(fbq).toHaveBeenCalledWith('consent', 'revoke')
    const all = cookieWrites.join('\n')
    expect(all).toContain('_ga=;')
    expect(all).toContain('_ga_ABC=;')
    expect(all).toContain('_fbp=;')
    expect(all).toContain('_fbc=;')
    // cookie alheio não é tocado
    expect(all).not.toContain('outro=;')
  })

  it('concessão de marketing chama fbq consent grant e NÃO expira _fbp', () => {
    const fbq = vi.fn()
    const { cookieWrites } = mountBrowser({ gtag: vi.fn(), fbq })
    saveConsent({ analytics: true, marketing: true })
    expect(fbq).toHaveBeenCalledWith('consent', 'grant')
    expect(cookieWrites.join('\n')).not.toContain('_fbp=;')
  })

  it('não explode sem gtag/fbq no window (scripts nunca carregados)', () => {
    mountBrowser()
    expect(() => saveConsent({ analytics: true, marketing: true })).not.toThrow()
  })
})

describe('defaultPrefsCategories — estado inicial dos toggles do painel', () => {
  it('visitante sem decisão salva: toggles DESLIGADOS (nunca pré-marcados)', () => {
    expect(defaultPrefsCategories(null)).toEqual({ analytics: false, marketing: false })
  })

  it('consentimento salvo: reflete exatamente os valores persistidos', () => {
    const stored: ConsentState = {
      version: CONSENT_VERSION,
      updatedAt: '2026-01-01T00:00:00.000Z',
      categories: { analytics: true, marketing: false },
    }
    expect(defaultPrefsCategories(stored)).toEqual({ analytics: true, marketing: false })
    stored.categories = { analytics: false, marketing: true }
    expect(defaultPrefsCategories(stored)).toEqual({ analytics: false, marketing: true })
  })
})

describe('consentModeParams', () => {
  it('mapeia categorias → 4 flags do Consent Mode v2', () => {
    expect(consentModeParams({ analytics: false, marketing: true })).toEqual({
      analytics_storage: 'denied',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    })
  })
})

describe('onConsentChange', () => {
  it('unsubscribe para de receber', () => {
    mountBrowser({ gtag: vi.fn() })
    const received: unknown[] = []
    const off = onConsentChange((s) => received.push(s))
    saveConsent({ analytics: true, marketing: true })
    off()
    saveConsent({ analytics: false, marketing: false })
    expect(received).toHaveLength(1)
  })

  it('evento carrega o estado no detail (nome estável)', () => {
    expect(CONSENT_CHANGED_EVENT).toBe('sa:consent-changed')
  })
})
