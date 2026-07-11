import { describe, expect, it } from 'vitest'
import { normalizeEmail, normalizePhone, normalizeString } from './normalize'

describe('normalizeString', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizeString('  Ana  ')).toBe('Ana')
  })

  it('preserves inner whitespace', () => {
    expect(normalizeString('  Ana Maria  ')).toBe('Ana Maria')
  })

  it('returns null for empty and whitespace-only strings', () => {
    expect(normalizeString('')).toBeNull()
    expect(normalizeString('   ')).toBeNull()
    expect(normalizeString('\t\n')).toBeNull()
  })

  it('returns null for non-string inputs', () => {
    expect(normalizeString(null)).toBeNull()
    expect(normalizeString(undefined)).toBeNull()
    expect(normalizeString(123)).toBeNull()
    expect(normalizeString({})).toBeNull()
    expect(normalizeString([])).toBeNull()
  })
})

describe('normalizePhone', () => {
  it('strips formatting from Brazilian phone numbers', () => {
    expect(normalizePhone('(48) 9 9164-2332')).toBe('48991642332')
    expect(normalizePhone('+55 48 99164-2332')).toBe('5548991642332')
    expect(normalizePhone('48 9 9164 2332')).toBe('48991642332')
  })

  it('preserves already-normalized digits', () => {
    expect(normalizePhone('48991642332')).toBe('48991642332')
  })

  it('returns null when input has no digits', () => {
    expect(normalizePhone('abc')).toBeNull()
    expect(normalizePhone('(  )  -  ')).toBeNull()
  })

  it('returns null for empty and non-string inputs', () => {
    expect(normalizePhone('')).toBeNull()
    expect(normalizePhone('   ')).toBeNull()
    expect(normalizePhone(null)).toBeNull()
    expect(normalizePhone(undefined)).toBeNull()
    expect(normalizePhone(48991642332)).toBeNull()
  })
})

describe('normalizeEmail', () => {
  it('trims and lowercases valid emails', () => {
    expect(normalizeEmail('  A@B.COM ')).toBe('a@b.com')
    expect(normalizeEmail('Stiven.Allan@GMAIL.com')).toBe('stiven.allan@gmail.com')
  })

  it('returns null for empty and non-string inputs', () => {
    expect(normalizeEmail('')).toBeNull()
    expect(normalizeEmail('   ')).toBeNull()
    expect(normalizeEmail(null)).toBeNull()
    expect(normalizeEmail(undefined)).toBeNull()
  })

  it('does not validate format — sanitization only', () => {
    // Contrato antigo do endpoint aceitava "não tenho" ou qualquer string;
    // aqui só normalizamos. Validação de formato fica para uma pilha posterior.
    expect(normalizeEmail('nao-eh-email')).toBe('nao-eh-email')
  })
})
