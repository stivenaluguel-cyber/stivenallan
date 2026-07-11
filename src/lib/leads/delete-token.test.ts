import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { generateDeleteToken, verifyDeleteToken } from './delete-token'
import { generateUnsubscribeToken } from './unsubscribe-token'

const LEAD = '11111111-2222-3333-4444-555555555555'
const OTHER = '99999999-8888-7777-6666-555555555555'

describe('delete-token', () => {
  beforeEach(() => {
    process.env.UNSUBSCRIBE_SECRET = 'test-secret-please-do-not-use-in-prod'
  })

  afterEach(() => {
    delete process.env.UNSUBSCRIBE_SECRET
  })

  describe('generateDeleteToken', () => {
    it('retorna string hex de 32 chars', () => {
      const t = generateDeleteToken(LEAD)
      expect(t).toHaveLength(32)
      expect(t).toMatch(/^[0-9a-f]{32}$/)
    })

    it('é determinístico — mesmo input, mesmo output', () => {
      expect(generateDeleteToken(LEAD)).toBe(generateDeleteToken(LEAD))
    })

    it('produz tokens diferentes para lead_ids diferentes', () => {
      expect(generateDeleteToken(LEAD)).not.toBe(generateDeleteToken(OTHER))
    })

    it('produz tokens diferentes para secrets diferentes', () => {
      const t1 = generateDeleteToken(LEAD)
      process.env.UNSUBSCRIBE_SECRET = 'other-secret'
      const t2 = generateDeleteToken(LEAD)
      expect(t1).not.toBe(t2)
    })

    it('lança quando UNSUBSCRIBE_SECRET está ausente', () => {
      delete process.env.UNSUBSCRIBE_SECRET
      expect(() => generateDeleteToken(LEAD)).toThrow(/UNSUBSCRIBE_SECRET/)
    })

    it('SEGURANÇA: nunca coincide com o token de unsubscribe do mesmo lead (mesmo secret)', () => {
      // Um link de descadastro vazado (que aparece em TODO e-mail da régua) não pode
      // também servir como token de exclusão de dados — são propósitos distintos.
      expect(generateDeleteToken(LEAD)).not.toBe(generateUnsubscribeToken(LEAD))
    })
  })

  describe('verifyDeleteToken', () => {
    it('aceita token gerado pelo próprio helper', () => {
      const t = generateDeleteToken(LEAD)
      expect(verifyDeleteToken(LEAD, t)).toBe(true)
    })

    it('rejeita token forjado (1 char alterado)', () => {
      const t = generateDeleteToken(LEAD)
      const tampered = t.slice(0, -1) + (t.slice(-1) === '0' ? '1' : '0')
      expect(verifyDeleteToken(LEAD, tampered)).toBe(false)
    })

    it('rejeita token válido de OUTRO lead (cross-lead)', () => {
      const tForOther = generateDeleteToken(OTHER)
      expect(verifyDeleteToken(LEAD, tForOther)).toBe(false)
    })

    it('rejeita o token de UNSUBSCRIBE do mesmo lead como se fosse delete token', () => {
      const unsubToken = generateUnsubscribeToken(LEAD)
      expect(verifyDeleteToken(LEAD, unsubToken)).toBe(false)
    })

    it('rejeita empty, null, undefined sem lançar', () => {
      expect(verifyDeleteToken(LEAD, '')).toBe(false)
      expect(verifyDeleteToken(LEAD, null)).toBe(false)
      expect(verifyDeleteToken(LEAD, undefined)).toBe(false)
    })

    it('rejeita token de tamanho errado (< 32 ou > 32)', () => {
      expect(verifyDeleteToken(LEAD, 'a'.repeat(31))).toBe(false)
      expect(verifyDeleteToken(LEAD, 'a'.repeat(33))).toBe(false)
    })

    it('rejeita quando UNSUBSCRIBE_SECRET ausente — sem lançar', () => {
      const t = generateDeleteToken(LEAD)
      delete process.env.UNSUBSCRIBE_SECRET
      expect(verifyDeleteToken(LEAD, t)).toBe(false)
    })
  })
})
