import { describe, expect, it } from 'vitest'
import { computeScrollFraction, shouldShowEarlyGate } from './scroll-fraction'

describe('computeScrollFraction', () => {
  it('0 no topo da pagina', () => {
    expect(computeScrollFraction(0, 17000, 800)).toBe(0)
  })

  it('1 no fim da pagina', () => {
    const scrollable = 17000 - 800
    expect(computeScrollFraction(scrollable, 17000, 800)).toBe(1)
  })

  it('pagina mais curta que a viewport nunca divide por zero/negativo — retorna 0', () => {
    expect(computeScrollFraction(0, 500, 800)).toBe(0)
    expect(computeScrollFraction(100, 800, 800)).toBe(0)
  })
})

describe('shouldShowEarlyGate', () => {
  it('0.24 nao mostra (abaixo do limite)', () => {
    expect(shouldShowEarlyGate(0.24, false, 'locked')).toBe(false)
  })

  it('0.25 mostra (limite inferior inclusive)', () => {
    expect(shouldShowEarlyGate(0.25, false, 'locked')).toBe(true)
  })

  it('0.40 mostra (limite superior inclusive)', () => {
    expect(shouldShowEarlyGate(0.4, false, 'locked')).toBe(true)
  })

  it('0.41 nao mostra (acima do limite)', () => {
    expect(shouldShowEarlyGate(0.41, false, 'locked')).toBe(false)
  })

  it('nunca mostra se ja foi dispensado', () => {
    expect(shouldShowEarlyGate(0.3, true, 'locked')).toBe(false)
  })

  it('nunca mostra se ja esta unlocked', () => {
    expect(shouldShowEarlyGate(0.3, false, 'unlocked')).toBe(false)
  })

  it('nunca mostra enquanto o status ainda esta loading', () => {
    expect(shouldShowEarlyGate(0.3, false, 'loading')).toBe(false)
  })
})
