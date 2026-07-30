import { describe, expect, it } from 'vitest'
import { normalizarCelularBR, normalizeEmail, normalizePhone, normalizeString, temWhatsappReal } from './normalize'

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

describe('temWhatsappReal', () => {
  it('aceita numeros normalizados normais', () => {
    expect(temWhatsappReal('5548991642332')).toBe(true)
  })

  it('rejeita o placeholder de lead vindo de DM do Instagram', () => {
    expect(temWhatsappReal('ig:17841400000000000')).toBe(false)
  })

  it('rejeita ausencia de valor', () => {
    expect(temWhatsappReal(null)).toBe(false)
    expect(temWhatsappReal(undefined)).toBe(false)
    expect(temWhatsappReal('')).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────
// normalizarCelularBR
//
// `normalizePhone` só tira o que não é dígito. No espelho de vendas isso
// deixou entrar um "48999924724234" de 14 dígitos vindo do formulário — um
// lead que nunca poderia ser contatado, ocupando o índice único de
// leads.whatsapp.
// ─────────────────────────────────────────────────────────────────────
describe('normalizarCelularBR', () => {
  it('aceita celular de 11 dígitos, com ou sem formatação', () => {
    expect(normalizarCelularBR('(48) 99999-8888')).toBe('48999998888')
    expect(normalizarCelularBR('48999998888')).toBe('48999998888')
  })

  it('aceita fixo de 10 dígitos', () => {
    expect(normalizarCelularBR('4834334455')).toBe('4834334455')
  })

  it('remove o 55 do país', () => {
    expect(normalizarCelularBR('5548999998888')).toBe('48999998888')
  })

  it('RECUSA o número de 14 dígitos que passou em produção', () => {
    expect(normalizarCelularBR('48999924724234')).toBeNull()
  })

  it('recusa número curto demais para ter DDD', () => {
    expect(normalizarCelularBR('99998888')).toBeNull()
    expect(normalizarCelularBR('123')).toBeNull()
  })

  it('recusa texto sem dígito e valores vazios', () => {
    expect(normalizarCelularBR('meu zap')).toBeNull()
    expect(normalizarCelularBR('')).toBeNull()
    expect(normalizarCelularBR(null)).toBeNull()
  })
})
