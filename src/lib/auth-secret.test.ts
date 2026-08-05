import { afterEach, describe, expect, it } from 'vitest'
import { getJwtSecret, requireJwtSecret } from './auth-secret'

const ORIGINAL = process.env.JWT_SECRET

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.JWT_SECRET
  else process.env.JWT_SECRET = ORIGINAL
})

describe('JWT_SECRET', () => {
  it('fecha com segurança quando ausente', () => {
    delete process.env.JWT_SECRET
    expect(getJwtSecret()).toBeNull()
    expect(() => requireJwtSecret()).toThrow(/pelo menos 32 caracteres/)
  })

  it('rejeita segredo curto', () => {
    process.env.JWT_SECRET = 'curto'
    expect(getJwtSecret()).toBeNull()
  })

  it('aceita segredo forte sem expor o valor', () => {
    process.env.JWT_SECRET = 'a'.repeat(32)
    expect(getJwtSecret()).toBeInstanceOf(Uint8Array)
    expect(requireJwtSecret()).toHaveLength(32)
  })
})
