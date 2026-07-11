import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { generateUnsubscribeToken, verifyUnsubscribeToken } from './unsubscribe-token'

const LEAD = '11111111-2222-3333-4444-555555555555'
const OTHER = '99999999-8888-7777-6666-555555555555'

describe('unsubscribe-token', () => {
  beforeEach(() => {
    process.env.UNSUBSCRIBE_SECRET = 'test-secret-please-do-not-use-in-prod'
  })

  afterEach(() => {
    delete process.env.UNSUBSCRIBE_SECRET
  })

  describe('generateUnsubscribeToken', () => {
    it('retorna string hex de 32 chars', () => {
      const t = generateUnsubscribeToken(LEAD)
      expect(t).toHaveLength(32)
      expect(t).toMatch(/^[0-9a-f]{32}$/)
    })

    it('é determinístico — mesmo input, mesmo output', () => {
      expect(generateUnsubscribeToken(LEAD)).toBe(generateUnsubscribeToken(LEAD))
    })

    it('produz tokens diferentes para lead_ids diferentes', () => {
      expect(generateUnsubscribeToken(LEAD)).not.toBe(generateUnsubscribeToken(OTHER))
    })

    it('produz tokens diferentes para secrets diferentes', () => {
      const t1 = generateUnsubscribeToken(LEAD)
      process.env.UNSUBSCRIBE_SECRET = 'other-secret'
      const t2 = generateUnsubscribeToken(LEAD)
      expect(t1).not.toBe(t2)
    })

    it('lança quando UNSUBSCRIBE_SECRET está ausente', () => {
      delete process.env.UNSUBSCRIBE_SECRET
      expect(() => generateUnsubscribeToken(LEAD)).toThrow(/UNSUBSCRIBE_SECRET/)
    })
  })

  describe('verifyUnsubscribeToken', () => {
    it('aceita token gerado pelo próprio helper', () => {
      const t = generateUnsubscribeToken(LEAD)
      expect(verifyUnsubscribeToken(LEAD, t)).toBe(true)
    })

    it('rejeita token forjado (1 char alterado)', () => {
      const t = generateUnsubscribeToken(LEAD)
      const tampered = t.slice(0, -1) + (t.slice(-1) === '0' ? '1' : '0')
      expect(verifyUnsubscribeToken(LEAD, tampered)).toBe(false)
    })

    it('rejeita token válido de OUTRO lead (cross-lead)', () => {
      const tForOther = generateUnsubscribeToken(OTHER)
      expect(verifyUnsubscribeToken(LEAD, tForOther)).toBe(false)
    })

    it('rejeita empty, null, undefined sem lançar', () => {
      expect(verifyUnsubscribeToken(LEAD, '')).toBe(false)
      expect(verifyUnsubscribeToken(LEAD, null)).toBe(false)
      expect(verifyUnsubscribeToken(LEAD, undefined)).toBe(false)
    })

    it('rejeita token de tamanho errado (< 32 ou > 32)', () => {
      expect(verifyUnsubscribeToken(LEAD, 'a'.repeat(31))).toBe(false)
      expect(verifyUnsubscribeToken(LEAD, 'a'.repeat(33))).toBe(false)
    })

    it('rejeita quando UNSUBSCRIBE_SECRET ausente — sem lançar', () => {
      const t = generateUnsubscribeToken(LEAD)
      delete process.env.UNSUBSCRIBE_SECRET
      expect(verifyUnsubscribeToken(LEAD, t)).toBe(false)
    })
  })
})
