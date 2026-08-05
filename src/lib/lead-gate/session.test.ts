import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  generateSessionToken,
  hashSessionToken,
  tokensMatch,
  sessionExpiresAt,
  sessionCookieOptions,
  SESSION_COOKIE_NAME,
  SESSION_TTL_DAYS,
} from './session'

describe('generateSessionToken', () => {
  it('gera token com entropia suficiente (256 bits -> string longa, nunca vazia)', () => {
    const token = generateSessionToken()
    expect(token.length).toBeGreaterThanOrEqual(40)
  })

  it('nunca repete entre chamadas', () => {
    const tokens = new Set(Array.from({ length: 50 }, () => generateSessionToken()))
    expect(tokens.size).toBe(50)
  })
})

describe('hashSessionToken', () => {
  it('e deterministico (mesmo token -> mesmo hash)', () => {
    const token = generateSessionToken()
    expect(hashSessionToken(token)).toBe(hashSessionToken(token))
  })

  it('tokens diferentes produzem hashes diferentes', () => {
    const a = hashSessionToken('token-a')
    const b = hashSessionToken('token-b')
    expect(a).not.toBe(b)
  })

  it('nunca devolve o token em claro', () => {
    const token = 'token-secreto-de-teste'
    expect(hashSessionToken(token)).not.toContain(token)
  })
})

describe('tokensMatch', () => {
  it('true para hashes iguais', () => {
    const h = hashSessionToken('x')
    expect(tokensMatch(h, h)).toBe(true)
  })

  it('false para hashes diferentes', () => {
    expect(tokensMatch(hashSessionToken('a'), hashSessionToken('b'))).toBe(false)
  })

  it('false para comprimentos diferentes, sem lancar excecao', () => {
    expect(tokensMatch('abc', 'abcdef')).toBe(false)
  })
})

describe('sessionExpiresAt', () => {
  it('soma 180 dias a partir da data informada', () => {
    const base = new Date('2026-01-01T00:00:00Z')
    const expires = sessionExpiresAt(base)
    const diffDias = (expires.getTime() - base.getTime()) / (24 * 60 * 60 * 1000)
    expect(diffDias).toBe(SESSION_TTL_DAYS)
  })
})

describe('sessionCookieOptions', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('httpOnly, sameSite=lax, path=/ sempre', () => {
    const opts = sessionCookieOptions()
    expect(opts.httpOnly).toBe(true)
    expect(opts.sameSite).toBe('lax')
    expect(opts.path).toBe('/')
    expect(opts.maxAge).toBe(SESSION_TTL_DAYS * 24 * 60 * 60)
  })

  it('secure=true em producao', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(sessionCookieOptions().secure).toBe(true)
  })

  it('secure=false fora de producao (dev local sem https)', () => {
    vi.stubEnv('NODE_ENV', 'test')
    expect(sessionCookieOptions().secure).toBe(false)
  })
})

it('nome do cookie e estavel (nao muda sem migracao coordenada)', () => {
  expect(SESSION_COOKIE_NAME).toBe('sa_session')
})
