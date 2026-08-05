import { describe, it, expect, afterEach, vi } from 'vitest'

// tracking-config lê process.env no topo do módulo (obrigatório: NEXT_PUBLIC_*
// precisa ser referência estática pro Next inlinar no build). Então cada caso
// tem que limpar o cache de módulos e reimportar.
async function carregarConfig(valor?: string) {
  vi.resetModules()
  if (valor === undefined) vi.stubEnv('NEXT_PUBLIC_ANALYTICS_DISABLED', '')
  else vi.stubEnv('NEXT_PUBLIC_ANALYTICS_DISABLED', valor)
  return import('./tracking-config')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('tracking-config — interruptor NEXT_PUBLIC_ANALYTICS_DISABLED', () => {
  it('ausente mantém produção ligada, com os fallbacks reais', async () => {
    const cfg = await carregarConfig(undefined)
    expect(cfg.ANALYTICS_DISABLED).toBe(false)
    // Produção hoje NÃO declara NEXT_PUBLIC_GA4_ID na Vercel — depende deste
    // fallback. Se este teste quebrar, a mensuração de produção parou junto.
    expect(cfg.GA4_ID).toBe('G-5TWF0JTG8H')
    expect(cfg.META_PIXEL_ID).toBe('364836344657445')
    expect(cfg.PAGE_META_PIXEL_IDS['/casa-guaiba-park']).toBe('1796321424680587')
  })

  it('"false" e "0" também mantêm ligado', async () => {
    for (const valor of ['false', 'FALSE', '0', '  false  ']) {
      const cfg = await carregarConfig(valor)
      expect(cfg.ANALYTICS_DISABLED, `valor: ${valor}`).toBe(false)
      expect(cfg.GA4_ID, `valor: ${valor}`).toBe('G-5TWF0JTG8H')
    }
  })

  it('"true" zera TODOS os ids, inclusive o pixel por página', async () => {
    const cfg = await carregarConfig('true')
    expect(cfg.ANALYTICS_DISABLED).toBe(true)
    expect(cfg.GA4_ID).toBe('')
    expect(cfg.META_PIXEL_ID).toBe('')
    expect(cfg.GADS_ID).toBe('')
    // O pixel do Casa Guaíba Park é hardcoded no dicionário — precisa sumir
    // junto, senão /casa-guaiba-park continuaria inicializando pixel real.
    expect(cfg.PAGE_META_PIXEL_IDS).toEqual({})
  })

  it('valor inesperado desliga (fail-safe: typo não pode virar coleta real)', async () => {
    for (const valor of ['1', 'yes', 'sim', 'TRUE', 'desligado', 'x']) {
      const cfg = await carregarConfig(valor)
      expect(cfg.ANALYTICS_DISABLED, `valor: ${valor}`).toBe(true)
      expect(cfg.GA4_ID, `valor: ${valor}`).toBe('')
      expect(cfg.META_PIXEL_ID, `valor: ${valor}`).toBe('')
    }
  })

  it('desligado vence env de id explícita — ambiente errado não coleta nem com id próprio', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA4_ID', 'G-OUTRO123')
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '999999999999')
    vi.stubEnv('NEXT_PUBLIC_GADS_ID', 'AW-123')
    const cfg = await carregarConfig('true')
    expect(cfg.GA4_ID).toBe('')
    expect(cfg.META_PIXEL_ID).toBe('')
    expect(cfg.GADS_ID).toBe('')
  })

  it('ligado respeita env explícita por cima do fallback', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA4_ID', 'G-OUTRO123')
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '999999999999')
    const cfg = await carregarConfig(undefined)
    expect(cfg.GA4_ID).toBe('G-OUTRO123')
    expect(cfg.META_PIXEL_ID).toBe('999999999999')
  })
})
