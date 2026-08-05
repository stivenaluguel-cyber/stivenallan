import { afterEach, describe, expect, it } from 'vitest'
import { isLeadGateEnabledForSlug, isPropertyHistoryEnabledForSlug } from './flags'

const ORIGINAL = {
  LEAD_GATE_ENABLED: process.env.LEAD_GATE_ENABLED,
  LEAD_GATE_SLUGS: process.env.LEAD_GATE_SLUGS,
  LEAD_PROPERTY_HISTORY_ENABLED: process.env.LEAD_PROPERTY_HISTORY_ENABLED,
}

afterEach(() => {
  process.env.LEAD_GATE_ENABLED = ORIGINAL.LEAD_GATE_ENABLED
  process.env.LEAD_GATE_SLUGS = ORIGINAL.LEAD_GATE_SLUGS
  process.env.LEAD_PROPERTY_HISTORY_ENABLED = ORIGINAL.LEAD_PROPERTY_HISTORY_ENABLED
})

describe('isLeadGateEnabledForSlug', () => {
  it('false quando a flag global esta desligada, mesmo com o slug na lista', () => {
    process.env.LEAD_GATE_ENABLED = 'false'
    process.env.LEAD_GATE_SLUGS = 'parco-savello-santa-barbara-criciuma-sc'
    expect(isLeadGateEnabledForSlug('parco-savello-santa-barbara-criciuma-sc')).toBe(false)
  })

  it('false quando a flag esta ausente (default seguro)', () => {
    delete process.env.LEAD_GATE_ENABLED
    process.env.LEAD_GATE_SLUGS = 'parco-savello-santa-barbara-criciuma-sc'
    expect(isLeadGateEnabledForSlug('parco-savello-santa-barbara-criciuma-sc')).toBe(false)
  })

  it('true so pro slug explicitamente listado', () => {
    process.env.LEAD_GATE_ENABLED = 'true'
    process.env.LEAD_GATE_SLUGS = 'parco-savello-santa-barbara-criciuma-sc, monte-leone-centro-criciuma-sc'
    expect(isLeadGateEnabledForSlug('parco-savello-santa-barbara-criciuma-sc')).toBe(true)
    expect(isLeadGateEnabledForSlug('monte-leone-centro-criciuma-sc')).toBe(true)
    expect(isLeadGateEnabledForSlug('aura-residence-centro-criciuma-sc')).toBe(false)
  })

  it('lista vazia/ausente nunca habilita nenhum slug mesmo com a flag true', () => {
    process.env.LEAD_GATE_ENABLED = 'true'
    delete process.env.LEAD_GATE_SLUGS
    expect(isLeadGateEnabledForSlug('parco-savello-santa-barbara-criciuma-sc')).toBe(false)
  })
})

describe('isPropertyHistoryEnabledForSlug', () => {
  it('independente da flag do gate — so depende de LEAD_PROPERTY_HISTORY_ENABLED', () => {
    process.env.LEAD_GATE_ENABLED = 'false'
    process.env.LEAD_PROPERTY_HISTORY_ENABLED = 'true'
    process.env.LEAD_GATE_SLUGS = 'parco-savello-santa-barbara-criciuma-sc'
    expect(isPropertyHistoryEnabledForSlug('parco-savello-santa-barbara-criciuma-sc')).toBe(true)
    expect(isLeadGateEnabledForSlug('parco-savello-santa-barbara-criciuma-sc')).toBe(false)
  })
})
