import { afterEach, describe, expect, it, vi } from 'vitest'
import { captureAttribution, getAttribution } from './tracking'

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
    expect(JSON.parse(store[KEY])).toEqual({ utm_source: 'y', fbclid: 'abc' })
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
