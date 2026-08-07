import { afterEach, describe, expect, it } from 'vitest'
import { autenticarCron, verificarAutenticacaoCron } from './auth'

const ORIGINAL = process.env.CRON_SECRET

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = ORIGINAL
})

const SECRET = 'cron-secret-de-teste-bem-forte'

describe('autenticarCron', () => {
  it('1) CRON_SECRET ausente + Authorization ausente → rejeita (missing_secret)', () => {
    delete process.env.CRON_SECRET
    expect(autenticarCron(null)).toEqual({ ok: false, reason: 'missing_secret' })
  })

  it('2) CRON_SECRET ausente + "Bearer undefined" → rejeita (missing_secret, nunca autentica)', () => {
    delete process.env.CRON_SECRET
    expect(autenticarCron('Bearer undefined')).toEqual({ ok: false, reason: 'missing_secret' })
  })

  it('3) CRON_SECRET vazio → rejeita (missing_secret)', () => {
    process.env.CRON_SECRET = ''
    expect(autenticarCron('Bearer qualquer-coisa')).toEqual({ ok: false, reason: 'missing_secret' })
  })

  it('4) CRON_SECRET apenas espaços → rejeita (missing_secret)', () => {
    process.env.CRON_SECRET = '   '
    expect(autenticarCron('Bearer    ')).toEqual({ ok: false, reason: 'missing_secret' })
  })

  it('5) secret configurado + header ausente → rejeita (unauthorized)', () => {
    process.env.CRON_SECRET = SECRET
    expect(autenticarCron(null)).toEqual({ ok: false, reason: 'unauthorized' })
  })

  it('6) secret configurado + Bearer errado → rejeita (unauthorized)', () => {
    process.env.CRON_SECRET = SECRET
    expect(autenticarCron('Bearer segredo-errado')).toEqual({ ok: false, reason: 'unauthorized' })
  })

  it('7) secret configurado + Bearer correto → aceita', () => {
    process.env.CRON_SECRET = SECRET
    expect(autenticarCron(`Bearer ${SECRET}`)).toEqual({ ok: true })
  })

  it('8) prefixo diferente de Bearer → rejeita (unauthorized)', () => {
    process.env.CRON_SECRET = SECRET
    expect(autenticarCron(`Basic ${SECRET}`)).toEqual({ ok: false, reason: 'unauthorized' })
    expect(autenticarCron(SECRET)).toEqual({ ok: false, reason: 'unauthorized' })
  })

  it('9) segredo parcialmente correto (prefixo/sufixo) → rejeita, sem lançar exceção', () => {
    process.env.CRON_SECRET = SECRET
    expect(autenticarCron(`Bearer ${SECRET.slice(0, -1)}`)).toEqual({ ok: false, reason: 'unauthorized' })
    expect(autenticarCron(`Bearer ${SECRET}extra`)).toEqual({ ok: false, reason: 'unauthorized' })
  })

  it('10) comprimentos bem diferentes não lançam exceção (RangeError do timingSafeEqual)', () => {
    process.env.CRON_SECRET = SECRET
    expect(() => autenticarCron('Bearer x')).not.toThrow()
    expect(autenticarCron('Bearer x')).toEqual({ ok: false, reason: 'unauthorized' })
    expect(() => autenticarCron(`Bearer ${'x'.repeat(500)}`)).not.toThrow()
  })

  it('"Bearer " sem nada depois → rejeita mesmo com secret configurado', () => {
    process.env.CRON_SECRET = SECRET
    expect(autenticarCron('Bearer ')).toEqual({ ok: false, reason: 'unauthorized' })
  })

  it('CRON_SECRET com espaços nas bordas é tolerado (trim), igual ao valor "limpo"', () => {
    process.env.CRON_SECRET = `  ${SECRET}  `
    expect(autenticarCron(`Bearer ${SECRET}`)).toEqual({ ok: true })
  })
})

function makeReq(authorization: string | null): { headers: { get(name: string): string | null } } {
  return { headers: { get: (name: string) => (name.toLowerCase() === 'authorization' ? authorization : null) } }
}

describe('verificarAutenticacaoCron', () => {
  it('devolve 503 "Cron não configurado" quando CRON_SECRET está ausente', async () => {
    delete process.env.CRON_SECRET
    const res = verificarAutenticacaoCron(makeReq('Bearer undefined'))
    expect(res).not.toBeNull()
    expect(res!.status).toBe(503)
    expect(await res!.json()).toEqual({ error: 'Cron não configurado' })
  })

  it('devolve 401 "Unauthorized" quando o secret está configurado mas o header está errado', async () => {
    process.env.CRON_SECRET = SECRET
    const res = verificarAutenticacaoCron(makeReq('Bearer errado'))
    expect(res).not.toBeNull()
    expect(res!.status).toBe(401)
    expect(await res!.json()).toEqual({ error: 'Unauthorized' })
  })

  it('devolve null (segue o fluxo) quando a credencial está correta', () => {
    process.env.CRON_SECRET = SECRET
    const res = verificarAutenticacaoCron(makeReq(`Bearer ${SECRET}`))
    expect(res).toBeNull()
  })
})
