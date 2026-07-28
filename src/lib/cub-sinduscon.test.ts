import { afterEach, describe, expect, it, vi } from 'vitest'
import { buscarCub } from './cub-sinduscon'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('buscarCub', () => {
  it('extrai valor, competência e online:true quando o scraping funciona', async () => {
    const html = '<html><body>Referência: Junho/2026 para ser usado em: Julho/2026 <span>R$ 3.121,62</span> <span>R$ 3.297,09</span></body></html>'
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, text: async () => html })))

    const r = await buscarCub()

    expect(r.valor_m2).toBe(3121.62)
    expect(r.comercial_m2).toBe(3297.09)
    expect(r.competencia).toBe('2026-07')
    expect(r.online).toBe(true)
  })

  it('cai no fallback com online:false quando o fetch falha', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('timeout') }))

    const r = await buscarCub()

    expect(r.online).toBe(false)
    expect(r.valor_m2).toBe(3096.25)
  })

  it('cai no fallback com online:false quando a resposta não é ok', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503 })))

    const r = await buscarCub()

    expect(r.online).toBe(false)
  })
})
