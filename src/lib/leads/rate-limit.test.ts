import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { __resetForTests, checkRateLimit } from './rate-limit'

const CFG = { identifier: 'test', limit: 3, windowSeconds: 60 }

describe('checkRateLimit', () => {
  beforeEach(() => {
    __resetForTests()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests up to the limit', () => {
    expect(checkRateLimit('1.2.3.4', CFG).allowed).toBe(true)
    expect(checkRateLimit('1.2.3.4', CFG).allowed).toBe(true)
    expect(checkRateLimit('1.2.3.4', CFG).allowed).toBe(true)
  })

  it('denies the (limit + 1)th request with retryAfter > 0', () => {
    for (let i = 0; i < CFG.limit; i++) checkRateLimit('1.2.3.4', CFG)
    const r = checkRateLimit('1.2.3.4', CFG)
    expect(r.allowed).toBe(false)
    expect(r.retryAfter).toBeGreaterThan(0)
    expect(r.retryAfter).toBeLessThanOrEqual(60)
  })

  it('resets the counter after the window expires', () => {
    for (let i = 0; i < CFG.limit; i++) checkRateLimit('1.2.3.4', CFG)
    expect(checkRateLimit('1.2.3.4', CFG).allowed).toBe(false)
    // avança para além da janela
    vi.advanceTimersByTime(CFG.windowSeconds * 1000 + 1)
    expect(checkRateLimit('1.2.3.4', CFG).allowed).toBe(true)
  })

  it('keeps buckets separate per IP', () => {
    for (let i = 0; i < CFG.limit; i++) checkRateLimit('1.2.3.4', CFG)
    expect(checkRateLimit('1.2.3.4', CFG).allowed).toBe(false)
    expect(checkRateLimit('5.6.7.8', CFG).allowed).toBe(true)
  })

  it('keeps buckets separate per identifier', () => {
    for (let i = 0; i < CFG.limit; i++) checkRateLimit('1.2.3.4', CFG)
    expect(checkRateLimit('1.2.3.4', CFG).allowed).toBe(false)
    expect(
      checkRateLimit('1.2.3.4', { ...CFG, identifier: 'outra-rota' }).allowed,
    ).toBe(true)
  })

  it('always allows when ip is "unknown"', () => {
    for (let i = 0; i < CFG.limit + 5; i++) {
      expect(checkRateLimit('unknown', CFG).allowed).toBe(true)
    }
  })

  it('retryAfter is at least 1 second even close to the reset boundary', () => {
    for (let i = 0; i < CFG.limit; i++) checkRateLimit('1.2.3.4', CFG)
    // Avança pra ~500ms antes do reset — Math.ceil(0.5) = 1, e o Math.max(1, ...) blindaria zero também
    vi.advanceTimersByTime(CFG.windowSeconds * 1000 - 500)
    const r = checkRateLimit('1.2.3.4', CFG)
    expect(r.allowed).toBe(false)
    expect(r.retryAfter).toBe(1)
  })

  it('__resetForTests clears all buckets', () => {
    for (let i = 0; i < CFG.limit; i++) checkRateLimit('1.2.3.4', CFG)
    expect(checkRateLimit('1.2.3.4', CFG).allowed).toBe(false)
    __resetForTests()
    expect(checkRateLimit('1.2.3.4', CFG).allowed).toBe(true)
  })

  it('does not blow up under many unique IPs (eviction path)', () => {
    // Não valida o LRU exato — só confirma que não trava/lança sob carga acima de MAX_BUCKETS.
    for (let i = 0; i < 5100; i++) {
      const ip = `10.0.${(i >> 8) & 255}.${i & 255}`
      const r = checkRateLimit(ip, { ...CFG, identifier: 'evict' })
      expect(r.allowed).toBe(true)
    }
  })
})
