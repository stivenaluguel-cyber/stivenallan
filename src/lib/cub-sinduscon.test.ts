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

// ─────────────────────────────────────────────────────────────────────
// Guarda de sanidade do valor raspado (validarCubColetado).
//
// O scraper pega o primeiro "R$ x,xx" da homepage. Um banner de evento com
// preço na frente do CUB faria o site exibir R$ 199,90/m² como índice — e,
// com o espelho de vendas derivando preço de CUB, o estrago viraria
// financeiro. A guarda é a diferença entre "indicador atrasado um mês" e
// "tabela de preços derretida".
// ─────────────────────────────────────────────────────────────────────
import { validarCubColetado } from './cub-sinduscon'

describe('validarCubColetado', () => {
  it('aceita valor plausível com variação mensal normal', () => {
    expect(validarCubColetado(3127.4, 3096.25).ok).toBe(true)
  })

  it('rejeita preço de banner (fora da faixa dura)', () => {
    const r = validarCubColetado(199.9, 3096.25)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.motivo).toMatch(/faixa/)
  })

  it('rejeita valor absurdamente alto (erro de parse de milhar)', () => {
    expect(validarCubColetado(309625, 3096.25).ok).toBe(false)
  })

  it('rejeita salto acima de 5% num mês mesmo dentro da faixa', () => {
    const r = validarCubColetado(3500, 3096.25) // +13%
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.motivo).toMatch(/variação/)
  })

  it('sem valor anterior, só a faixa dura decide', () => {
    expect(validarCubColetado(5500, null).ok).toBe(true)
    expect(validarCubColetado(1500, undefined).ok).toBe(false)
  })

  it('NaN e zero são rejeitados antes de qualquer conta', () => {
    expect(validarCubColetado(NaN, 3096).ok).toBe(false)
    expect(validarCubColetado(0, 3096).ok).toBe(false)
  })

  it('variação de exatamente 5% ainda passa; acima, não', () => {
    expect(validarCubColetado(3096.25 * 1.05, 3096.25).ok).toBe(true)
    expect(validarCubColetado(3096.25 * 1.056, 3096.25).ok).toBe(false)
  })
})
