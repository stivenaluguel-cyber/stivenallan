import { describe, expect, it, vi } from 'vitest'
import { applyGtagConfigs, newGtagConfigured } from './gtag-config'

const IDS = { ga4: 'G-TEST', gads: 'AW-TEST' }

function configCalls(spy: ReturnType<typeof vi.fn>): string[] {
  return spy.mock.calls.filter((c) => c[0] === 'config').map((c) => c[1] as string)
}

function jsCalls(spy: ReturnType<typeof vi.fn>): number {
  return spy.mock.calls.filter((c) => c[0] === 'js').length
}

describe('applyGtagConfigs — configs 1x por produto por pageload', () => {
  it('só analytics: gtag(js) + config GA4, nada de Ads', () => {
    const g = vi.fn()
    const state = newGtagConfigured()
    const applied = applyGtagConfigs(g, { analytics: true, marketing: false }, state, IDS)
    expect(applied).toEqual({ ga4: true, gads: false })
    expect(jsCalls(g)).toBe(1)
    expect(configCalls(g)).toEqual(['G-TEST'])
  })

  it('UPGRADE na mesma sessão (analytics → +marketing): aplica SÓ a config do Ads, sem repetir GA4 (sem page_view duplicado) nem js', () => {
    const g = vi.fn()
    const state = newGtagConfigured()
    applyGtagConfigs(g, { analytics: true, marketing: false }, state, IDS)
    const applied = applyGtagConfigs(g, { analytics: true, marketing: true }, state, IDS)
    expect(applied).toEqual({ ga4: false, gads: true })
    // config GA4 exatamente 1x no pageload inteiro → exatamente 1 page_view inicial
    expect(configCalls(g)).toEqual(['G-TEST', 'AW-TEST'])
    expect(jsCalls(g)).toBe(1)
  })

  it('caminho inverso (marketing → +analytics): config GA4 chega na hora, sem repetir Ads', () => {
    const g = vi.fn()
    const state = newGtagConfigured()
    applyGtagConfigs(g, { analytics: false, marketing: true }, state, IDS)
    expect(configCalls(g)).toEqual(['AW-TEST'])
    const applied = applyGtagConfigs(g, { analytics: true, marketing: true }, state, IDS)
    expect(applied).toEqual({ ga4: true, gads: false })
    expect(configCalls(g)).toEqual(['AW-TEST', 'G-TEST'])
    expect(jsCalls(g)).toBe(1)
  })

  it('revogação: nenhuma chamada; reconceder na mesma sessão NÃO reconfigura (config repetida duplicaria page_view)', () => {
    const g = vi.fn()
    const state = newGtagConfigured()
    applyGtagConfigs(g, { analytics: true, marketing: true }, state, IDS)
    g.mockClear()
    // revoga tudo — quem bloqueia hits é o consent update; aqui não pode haver config
    applyGtagConfigs(g, { analytics: false, marketing: false }, state, IDS)
    expect(g).not.toHaveBeenCalled()
    // reconcede — produtos já configurados neste pageload não reconfiguram
    applyGtagConfigs(g, { analytics: true, marketing: true }, state, IDS)
    expect(g).not.toHaveBeenCalled()
  })

  it('re-render com o mesmo estado é no-op (idempotente)', () => {
    const g = vi.fn()
    const state = newGtagConfigured()
    applyGtagConfigs(g, { analytics: true, marketing: false }, state, IDS)
    g.mockClear()
    applyGtagConfigs(g, { analytics: true, marketing: false }, state, IDS)
    expect(g).not.toHaveBeenCalled()
  })

  it('sem NEXT_PUBLIC_GADS_ID: marketing aceito não gera config de Ads (nem js à toa)', () => {
    const g = vi.fn()
    const state = newGtagConfigured()
    const applied = applyGtagConfigs(g, { analytics: false, marketing: true }, state, { ga4: 'G-TEST', gads: '' })
    expect(applied).toEqual({ ga4: false, gads: false })
    expect(g).not.toHaveBeenCalled()
  })
})
