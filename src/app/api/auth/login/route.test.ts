import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { bcryptHolder } = vi.hoisted(() => ({
  bcryptHolder: { compare: vi.fn(async (..._args: unknown[]) => true) },
}))
vi.mock('bcryptjs', () => ({
  default: { compare: (...args: unknown[]) => bcryptHolder.compare(...args) },
}))

// JWT/cookie não são o alvo desta tarefa (rate limit) — createToken mockado
// evita depender de JWT_SECRET real nos testes, sem alterar o comportamento
// de produção (a rota real continua usando @/lib/auth como está). Hoisted
// pra poder asserir "createToken NÃO foi chamado" em erro real de Supabase.
const { authHolder } = vi.hoisted(() => ({
  authHolder: { createToken: vi.fn(async (..._args: unknown[]) => 'token-de-teste') },
}))
vi.mock('@/lib/auth', () => ({
  createToken: (...args: unknown[]) => authHolder.createToken(...args),
}))

const { supabaseHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

import { POST } from './route'
import * as rateLimitModule from '@/lib/leads/rate-limit'
const { __resetForTests: resetRateLimit } = rateLimitModule

type AdminRow = { id: string; nome: string; senha_hash: string }

function makeSupabase(cfg: { admin?: AdminRow | null; dbError?: { code: string; message: string } } = {}) {
  return {
    from(table: string) {
      if (table === 'admin_users') {
        return {
          select: () => ({
            eq: () => ({
              // maybeSingle() real: zero linhas → { data: null, error: null }
              // (NUNCA um erro); erro real/múltiplas linhas → { data: null,
              // error: {...} }. Mock reflete exatamente esse contrato.
              maybeSingle: async () => {
                if (cfg.dbError) return { data: null, error: cfg.dbError }
                return { data: cfg.admin ?? null, error: null }
              },
            }),
          }),
        }
      }
      throw new Error('Unexpected table: ' + table)
    },
  }
}

const ADMIN_PADRAO: AdminRow = { id: 'admin-1', nome: 'Stiven', senha_hash: 'hash-fake' }

async function callPost(body: unknown, headers: Record<string, string> = { 'x-forwarded-for': '203.0.113.1' }) {
  const req = { json: async () => body, headers: new Headers(headers) } as unknown as NextRequest
  const res = await POST(req)
  const json = (await res.json().catch(() => ({}))) as { error?: string; success?: boolean; nome?: string }
  return { status: res.status, json, res }
}

describe('POST /api/auth/login — rate limit', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    resetRateLimit()
    bcryptHolder.compare.mockReset().mockResolvedValue(true)
    authHolder.createToken.mockClear()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.restoreAllMocks()
  })

  // 1) primeira tentativa válida passa pelo limiter
  it('primeira tentativa com credencial válida passa pelo limiter e retorna 200', async () => {
    supabaseHolder.current = makeSupabase({ admin: ADMIN_PADRAO })
    const { status, json } = await callPost(
      { email: 'admin@stivenallan.com.br', senha: 'correta' },
      { 'x-forwarded-for': '1.1.1.1' },
    )
    expect(status).toBe(200)
    expect(json.success).toBe(true)
  })

  // 2) credencial inválida ainda retorna resposta genérica
  it('senha errada retorna 401 com mensagem genérica', async () => {
    supabaseHolder.current = makeSupabase({ admin: ADMIN_PADRAO })
    bcryptHolder.compare.mockResolvedValue(false)
    const { status, json } = await callPost(
      { email: 'admin@stivenallan.com.br', senha: 'errada' },
      { 'x-forwarded-for': '1.1.2.1' },
    )
    expect(status).toBe(401)
    expect(json.error).toBe('Credenciais invalidas')
  })

  // 10) limiter não revela se o usuário existe — mesma mensagem pra email
  // inexistente e senha errada de email existente
  it('email inexistente retorna a MESMA resposta genérica que senha errada', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    const { status, json } = await callPost(
      { email: 'nao-existe@x.com', senha: 'qualquer' },
      { 'x-forwarded-for': '1.1.3.1' },
    )
    expect(status).toBe(401)
    expect(json.error).toBe('Credenciais invalidas')
  })

  // 3) várias tentativas ultrapassam o limite por IP → 429 (emails diferentes
  // a cada chamada, pra isolar o limite de IP do limite de IP+email)
  it('429 depois de exceder o limite por IP (10 tentativas/5min)', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    const headers = { 'x-forwarded-for': '2.2.2.2' }
    for (let i = 0; i < 10; i++) {
      const { status } = await callPost({ email: `user${i}@x.com`, senha: 'x' }, headers)
      expect(status).toBe(401)
    }
    const { status } = await callPost({ email: 'user-11@x.com', senha: 'x' }, headers)
    expect(status).toBe(429)
  })

  // 3) várias tentativas ultrapassam o limite por IP+email → 429 (mesmo IP
  // e mesmo email a cada chamada — limite mais apertado, 5/15min)
  it('429 depois de exceder o limite por IP+email (5 tentativas/15min)', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    const headers = { 'x-forwarded-for': '3.3.3.3' }
    const body = { email: 'alvo@x.com', senha: 'errada' }
    for (let i = 0; i < 5; i++) {
      const { status } = await callPost(body, headers)
      expect(status).toBe(401)
    }
    const { status } = await callPost(body, headers)
    expect(status).toBe(429)
  })

  // 4) após bloqueio, bcrypt/consulta cara não é executada
  it('depois de bloqueado, bcrypt.compare e a consulta ao Supabase NÃO são chamados', async () => {
    const supa = makeSupabase({ admin: ADMIN_PADRAO })
    const fromSpy = vi.spyOn(supa, 'from')
    supabaseHolder.current = supa
    const headers = { 'x-forwarded-for': '4.4.4.4' }
    const body = { email: 'alvo2@x.com', senha: 'x' }
    for (let i = 0; i < 5; i++) await callPost(body, headers)

    bcryptHolder.compare.mockClear()
    fromSpy.mockClear()

    const { status } = await callPost(body, headers)
    expect(status).toBe(429)
    expect(bcryptHolder.compare).not.toHaveBeenCalled()
    expect(fromSpy).not.toHaveBeenCalled()
  })

  // 5) e-mails com diferença de maiúsculas/minúsculas usam a mesma identidade
  it('email com maiúsculas/minúsculas diferentes compartilha o mesmo limite IP+email', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    const headers = { 'x-forwarded-for': '5.5.5.5' }
    for (let i = 0; i < 5; i++) {
      await callPost({ email: 'Alvo@X.com', senha: 'x' }, headers)
    }
    const { status } = await callPost({ email: 'ALVO@x.COM', senha: 'x' }, headers)
    expect(status).toBe(429)
  })

  // 6) espaços nas bordas do e-mail usam a mesma identidade
  it('espaços nas bordas do email compartilham o mesmo limite IP+email', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    const headers = { 'x-forwarded-for': '5.5.5.6' }
    for (let i = 0; i < 5; i++) {
      await callPost({ email: '  alvo3@x.com  ', senha: 'x' }, headers)
    }
    const { status } = await callPost({ email: 'alvo3@x.com', senha: 'x' }, headers)
    expect(status).toBe(429)
  })

  // 7) IP diferente não deve compartilhar indevidamente a combinação IP+e-mail
  it('mesmo email de IP diferente NÃO compartilha o limite IP+email', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    const body = { email: 'compartilhado@x.com', senha: 'x' }
    for (let i = 0; i < 5; i++) await callPost(body, { 'x-forwarded-for': '6.6.6.6' })
    const bloqueado = await callPost(body, { 'x-forwarded-for': '6.6.6.6' })
    expect(bloqueado.status).toBe(429)

    // Mesmo email, IP novo — combinação IP+email é outra, ainda não deveria bloquear.
    const outroIp = await callPost(body, { 'x-forwarded-for': '7.7.7.7' })
    expect(outroIp.status).not.toBe(429)
  })

  // 8) senha nunca aparece em logs
  it('senha nunca aparece em nenhum log', async () => {
    const logSpy = vi.spyOn(console, 'log')
    const warnSpy = vi.spyOn(console, 'warn')
    const errorSpy = vi.spyOn(console, 'error')
    supabaseHolder.current = makeSupabase({ admin: ADMIN_PADRAO })
    bcryptHolder.compare.mockResolvedValue(false)

    await callPost(
      { email: 'x@x.com', senha: 'SenhaSecretaUltraSigilosa123' },
      { 'x-forwarded-for': '8.8.8.8' },
    )

    const textoLogado = [...logSpy.mock.calls, ...warnSpy.mock.calls, ...errorSpy.mock.calls]
      .flat().map(String).join(' | ')
    expect(textoLogado).not.toContain('SenhaSecretaUltraSigilosa123')
  })

  // 9) e-mail completo não aparece em logs de bloqueio
  it('email completo não aparece em log quando a resposta é 429', async () => {
    const logSpy = vi.spyOn(console, 'log')
    const warnSpy = vi.spyOn(console, 'warn')
    const errorSpy = vi.spyOn(console, 'error')
    supabaseHolder.current = makeSupabase({ admin: null })
    const body = { email: 'nao-deve-vazar@dominio-sensivel.com', senha: 'x' }
    const headers = { 'x-forwarded-for': '9.9.9.9' }
    for (let i = 0; i < 5; i++) await callPost(body, headers)

    const res = await callPost(body, headers)
    expect(res.status).toBe(429)

    const textoLogado = [...logSpy.mock.calls, ...warnSpy.mock.calls, ...errorSpy.mock.calls]
      .flat().map(String).join(' | ')
    expect(textoLogado).not.toContain('nao-deve-vazar@dominio-sensivel.com')
  })

  // 10) (complemento) a resposta de bloqueio tem o MESMO shape independente
  // de o email existir ou não — não dá pra distinguir pelo 429
  it('resposta 429 é idêntica independente de o email existir', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    const bodyInexistente = { email: 'naoexiste2@x.com', senha: 'x' }
    const headers1 = { 'x-forwarded-for': '10.10.10.10' }
    for (let i = 0; i < 5; i++) await callPost(bodyInexistente, headers1)
    const bloqueadoInexistente = await callPost(bodyInexistente, headers1)

    supabaseHolder.current = makeSupabase({ admin: ADMIN_PADRAO })
    const bodyExistente = { email: 'existe2@x.com', senha: 'x' }
    const headers2 = { 'x-forwarded-for': '11.11.11.11' }
    for (let i = 0; i < 5; i++) await callPost(bodyExistente, headers2)
    const bloqueadoExistente = await callPost(bodyExistente, headers2)

    expect(bloqueadoInexistente.status).toBe(429)
    expect(bloqueadoExistente.status).toBe(429)
    expect(bloqueadoInexistente.json).toEqual(bloqueadoExistente.json)
  })

  // 11) login válido abaixo do limite continua funcionando
  it('login válido continua funcionando na 3ª tentativa (abaixo do limite)', async () => {
    supabaseHolder.current = makeSupabase({ admin: ADMIN_PADRAO })
    const headers = { 'x-forwarded-for': '12.12.12.12' }
    const body = { email: 'user3@x.com', senha: 'errada' }

    bcryptHolder.compare.mockResolvedValue(false)
    await callPost(body, headers)
    await callPost(body, headers)

    bcryptHolder.compare.mockResolvedValue(true)
    const { status } = await callPost({ ...body, senha: 'certa' }, headers)
    expect(status).toBe(200)
  })

  // 12) ausência dos envs do Upstash usa o fallback já definido em
  // rate-limit.ts (in-memory) — sem essas envs, checkRateLimit nem chega a
  // instanciar o cliente Redis (getUpstashRedis() retorna null), então não
  // há chamada de rede nenhuma; o bloqueio abaixo só é possível pelo
  // fallback in-memory de fato funcionando.
  it('sem envs do Upstash configuradas, o fallback in-memory ainda bloqueia corretamente', async () => {
    expect(process.env.UPSTASH_REDIS_REST_URL).toBeUndefined()
    expect(process.env.UPSTASH_REDIS_REST_TOKEN).toBeUndefined()
    supabaseHolder.current = makeSupabase({ admin: null })
    const headers = { 'x-forwarded-for': '13.13.13.13' }
    const body = { email: 'fallback@x.com', senha: 'x' }
    for (let i = 0; i < 5; i++) await callPost(body, headers)
    const { status } = await callPost(body, headers)
    expect(status).toBe(429)
  })

  // Retry-After
  it('resposta 429 inclui header Retry-After numérico e positivo', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    const headers = { 'x-forwarded-for': '14.14.14.14' }
    const body = { email: 'retryafter@x.com', senha: 'x' }
    for (let i = 0; i < 5; i++) await callPost(body, headers)

    const { status, res } = await callPost(body, headers)
    expect(status).toBe(429)
    const retryAfter = res.headers.get('Retry-After')
    expect(retryAfter).not.toBeNull()
    expect(Number(retryAfter)).toBeGreaterThan(0)
  })

  // Campos ausentes continuam validados ANTES do rate limit (comportamento preexistente preservado)
  it('email ou senha ausentes continuam retornando 400, sem consumir o limiter', async () => {
    const { status } = await callPost({ email: '', senha: '' }, { 'x-forwarded-for': '15.15.15.15' })
    expect(status).toBe(400)
  })
})

// Terceira dimensão: limite por CONTA (accountKey, sem IP) — fecha a lacuna
// de um atacante rotacionando IPs contra o mesmo e-mail, mandando poucas
// tentativas por IP (abaixo do teto de IP+conta) pra nunca disparar os
// outros dois limiters isoladamente.
describe('POST /api/auth/login — terceira dimensão (account limiter)', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    resetRateLimit()
    bcryptHolder.compare.mockReset().mockResolvedValue(true)
    authHolder.createToken.mockClear()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.restoreAllMocks()
  })

  // Helper: N IPs distintos x M tentativas cada, todos abaixo do teto de IP
  // (10) e de IP+conta (5) — só a soma total pode bater o teto de conta (20).
  async function bombardearComIpsRotativos(body: unknown, prefixoIp: string, ips: number, porIp: number) {
    for (let ipIdx = 0; ipIdx < ips; ipIdx++) {
      for (let tentativa = 0; tentativa < porIp; tentativa++) {
        await callPost(body, { 'x-forwarded-for': `${prefixoIp}.${ipIdx}` })
      }
    }
  }

  // Teste novo 1: mesmo email + vários IPs diferentes eventualmente bloqueia
  // pelo account limiter, apesar de nenhum IP individual exceder sua cota.
  it('mesmo email de vários IPs diferentes eventualmente bloqueia pelo account limiter', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    const body = { email: 'alvo-distribuido@x.com', senha: 'x' }

    // 5 IPs x 4 tentativas = 20 tentativas totais contra a conta — cada IP
    // isoladamente bem abaixo do teto de IP (10) e de IP+conta (5).
    await bombardearComIpsRotativos(body, '20.20.20', 5, 4)

    // 21ª tentativa, de um 6º IP nunca visto antes (também sob os limites
    // de IP e IP+conta) — só o limite GLOBAL da conta pode bloquear aqui.
    const { status } = await callPost(body, { 'x-forwarded-for': '20.20.20.99' })
    expect(status).toBe(429)
  })

  // Teste novo 2: emails diferentes NÃO compartilham account limiter.
  it('emails diferentes não compartilham o account limiter', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    await bombardearComIpsRotativos({ email: 'email-a@x.com', senha: 'x' }, '21.21.21', 5, 4)

    const { status } = await callPost(
      { email: 'email-b@x.com', senha: 'x' },
      { 'x-forwarded-for': '21.21.21.99' },
    )
    expect(status).not.toBe(429)
  })

  // Teste novo 3: variações de maiúsculas/espaços do mesmo email usam o
  // mesmo accountKey (mesmo bucket) — complementa os testes 5/6 já
  // existentes, agora batendo o teto da CONTA (não só o de IP+conta).
  it('Admin@Email.com, admin@email.com e " admin@email.com " usam o mesmo accountKey', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    const variantes = ['Admin@Email.com', 'admin@email.com', '  admin@email.com  ']
    for (let ipIdx = 0; ipIdx < 5; ipIdx++) {
      for (let tentativa = 0; tentativa < 4; tentativa++) {
        const email = variantes[(ipIdx * 4 + tentativa) % variantes.length]
        await callPost({ email, senha: 'x' }, { 'x-forwarded-for': `22.22.22.${ipIdx}` })
      }
    }
    const { status } = await callPost(
      { email: variantes[1], senha: 'x' },
      { 'x-forwarded-for': '22.22.22.99' },
    )
    expect(status).toBe(429)
  })

  // Teste novo 4: nenhuma chave passada ao rate limiter contém o email
  // literal — só IP puro ou o digest SHA-256 da conta.
  it('nenhuma chave passada ao checkRateLimit contém o email literal', async () => {
    const spy = vi.spyOn(rateLimitModule, 'checkRateLimit')
    supabaseHolder.current = makeSupabase({ admin: null })

    await callPost(
      { email: 'literal-nao-pode-vazar@x.com', senha: 'x' },
      { 'x-forwarded-for': '23.23.23.23' },
    )

    expect(spy).toHaveBeenCalledTimes(3) // IP, IP+conta, conta
    for (const call of spy.mock.calls) {
      const chave = call[0]
      expect(chave).not.toContain('literal-nao-pode-vazar@x.com')
      expect(chave).not.toContain('literal-nao-pode-vazar')
      expect(chave).not.toContain('@')
    }
  })

  // Teste novo 5: email completo continua ausente dos logs mesmo quando é
  // especificamente o ACCOUNT limiter (rotação de IP) que bloqueia.
  it('email completo não aparece em log quando o account limiter bloqueia (rotação de IP)', async () => {
    const logSpy = vi.spyOn(console, 'log')
    const warnSpy = vi.spyOn(console, 'warn')
    const errorSpy = vi.spyOn(console, 'error')
    supabaseHolder.current = makeSupabase({ admin: null })
    const body = { email: 'nao-pode-vazar-rotacao@dominio.com', senha: 'x' }

    await bombardearComIpsRotativos(body, '24.24.24', 5, 4)
    const res = await callPost(body, { 'x-forwarded-for': '24.24.24.99' })
    expect(res.status).toBe(429)

    const textoLogado = [...logSpy.mock.calls, ...warnSpy.mock.calls, ...errorSpy.mock.calls]
      .flat().map(String).join(' | ')
    expect(textoLogado).not.toContain('nao-pode-vazar-rotacao@dominio.com')
  })

  // Teste novo 6: quando o account limiter bloqueia, Supabase e bcrypt NÃO
  // são chamados, e a resposta 429 é a mesma genérica de sempre.
  it('quando o account limiter bloqueia, Supabase e bcrypt NÃO são chamados', async () => {
    const supa = makeSupabase({ admin: ADMIN_PADRAO })
    const fromSpy = vi.spyOn(supa, 'from')
    supabaseHolder.current = supa
    const body = { email: 'alvo-conta-bloqueio@x.com', senha: 'x' }

    await bombardearComIpsRotativos(body, '25.25.25', 5, 4)

    bcryptHolder.compare.mockClear()
    fromSpy.mockClear()

    const { status, json } = await callPost(body, { 'x-forwarded-for': '25.25.25.99' })
    expect(status).toBe(429)
    expect(json.error).toBe('Muitas tentativas. Tente novamente em instantes.')
    expect(bcryptHolder.compare).not.toHaveBeenCalled()
    expect(fromSpy).not.toHaveBeenCalled()
  })

  // Teste novo 7: login válido continua funcionando estando abaixo dos três
  // limites simultaneamente (IP, IP+conta e conta).
  it('login válido continua funcionando quando está abaixo dos três limites', async () => {
    supabaseHolder.current = makeSupabase({ admin: ADMIN_PADRAO })
    const body = { email: 'multi-dimensao@x.com', senha: 'errada' }

    bcryptHolder.compare.mockResolvedValue(false)
    await callPost(body, { 'x-forwarded-for': '26.26.26.1' })
    await callPost(body, { 'x-forwarded-for': '26.26.26.2' })

    bcryptHolder.compare.mockResolvedValue(true)
    const { status } = await callPost({ ...body, senha: 'certa' }, { 'x-forwarded-for': '26.26.26.3' })
    expect(status).toBe(200)
  })
})

// Item 5B: equalização estrutural de timing entre "conta não existe" e
// "conta existe + senha errada" — os dois caminhos agora executam
// exatamente UM bcrypt.compare cada (contra o hash real ou um hash dummy
// estático), em vez de o caminho "não existe" retornar sem pagar o custo
// do bcrypt.
describe('POST /api/auth/login — equalização de timing (dummy hash)', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    resetRateLimit()
    bcryptHolder.compare.mockReset().mockResolvedValue(true)
    authHolder.createToken.mockClear()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.restoreAllMocks()
  })

  // 1) conta existente + senha errada: bcrypt.compare 1x, hash REAL
  it('conta existente + senha errada: bcrypt.compare chamado 1x contra o hash real', async () => {
    supabaseHolder.current = makeSupabase({ admin: ADMIN_PADRAO })
    bcryptHolder.compare.mockResolvedValue(false)
    const { status, json } = await callPost(
      { email: 'admin@x.com', senha: 'errada' },
      { 'x-forwarded-for': '30.30.30.1' },
    )
    expect(status).toBe(401)
    expect(json.error).toBe('Credenciais invalidas')
    expect(bcryptHolder.compare).toHaveBeenCalledTimes(1)
    expect(bcryptHolder.compare).toHaveBeenCalledWith('errada', ADMIN_PADRAO.senha_hash)
  })

  // 2) conta inexistente: bcrypt.compare 1x, hash DUMMY (nunca o real, nunca vazio)
  it('conta inexistente: bcrypt.compare chamado 1x contra um hash dummy (nunca o real, nunca vazio)', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    const { status, json } = await callPost(
      { email: 'nao-existe@x.com', senha: 'qualquer' },
      { 'x-forwarded-for': '30.30.30.2' },
    )
    expect(status).toBe(401)
    expect(json.error).toBe('Credenciais invalidas')
    expect(bcryptHolder.compare).toHaveBeenCalledTimes(1)
    const [senhaPassada, hashPassado] = bcryptHolder.compare.mock.calls[0] as [string, string]
    expect(senhaPassada).toBe('qualquer')
    expect(hashPassado).not.toBe(ADMIN_PADRAO.senha_hash)
    expect(hashPassado).toBeTruthy()
    expect(hashPassado).toMatch(/^\$2[aby]\$10\$/) // bcrypt válido, cost factor 10 (mesmo dos hashes reais)
  })

  it('o hash dummy é sempre o mesmo valor entre requisições diferentes (constante estática, não gerado por request)', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    await callPost({ email: 'inexistente-1@x.com', senha: 'x' }, { 'x-forwarded-for': '30.30.30.3' })
    const hash1 = bcryptHolder.compare.mock.calls[0][1]

    bcryptHolder.compare.mockClear()
    await callPost({ email: 'inexistente-2@x.com', senha: 'x' }, { 'x-forwarded-for': '30.30.30.4' })
    const hash2 = bcryptHolder.compare.mock.calls[0][1]

    expect(hash1).toBe(hash2)
  })

  // 3) os dois caminhos inválidos retornam exatamente o mesmo status e body
  it('conta inexistente e senha errada retornam exatamente o mesmo status e body', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    const inexistente = await callPost({ email: 'x1@x.com', senha: 'a' }, { 'x-forwarded-for': '30.30.30.5' })

    supabaseHolder.current = makeSupabase({ admin: ADMIN_PADRAO })
    bcryptHolder.compare.mockResolvedValue(false)
    const senhaErrada = await callPost({ email: 'x2@x.com', senha: 'a' }, { 'x-forwarded-for': '30.30.30.6' })

    expect(inexistente.status).toBe(senhaErrada.status)
    expect(inexistente.json).toEqual(senhaErrada.json)
  })

  // 4) login válido: bcrypt 1x, hash real, continua 200
  it('login válido: bcrypt.compare chamado 1x contra o hash real, continua retornando 200', async () => {
    supabaseHolder.current = makeSupabase({ admin: ADMIN_PADRAO })
    bcryptHolder.compare.mockResolvedValue(true)
    const { status, json } = await callPost(
      { email: 'admin@x.com', senha: 'correta' },
      { 'x-forwarded-for': '30.30.30.7' },
    )
    expect(status).toBe(200)
    expect(json.success).toBe(true)
    expect(bcryptHolder.compare).toHaveBeenCalledTimes(1)
    expect(bcryptHolder.compare).toHaveBeenCalledWith('correta', ADMIN_PADRAO.senha_hash)
  })

  // 5) bloqueado por rate limit: bcrypt ZERO vezes
  it('bloqueado por rate limit: bcrypt.compare NÃO é chamado', async () => {
    supabaseHolder.current = makeSupabase({ admin: ADMIN_PADRAO })
    const body = { email: 'bloqueado-timing@x.com', senha: 'x' }
    const headers = { 'x-forwarded-for': '30.30.30.8' }
    for (let i = 0; i < 5; i++) await callPost(body, headers)
    bcryptHolder.compare.mockClear()
    const { status } = await callPost(body, headers)
    expect(status).toBe(429)
    expect(bcryptHolder.compare).not.toHaveBeenCalled()
  })

  // 6) campos ausentes/inválidos: bcrypt ZERO vezes
  it('campos ausentes: bcrypt.compare NÃO é chamado', async () => {
    const { status } = await callPost({ email: '', senha: '' }, { 'x-forwarded-for': '30.30.30.9' })
    expect(status).toBe(400)
    expect(bcryptHolder.compare).not.toHaveBeenCalled()
  })

  // 7) senha nunca aparece em log mesmo no caminho do hash dummy
  it('senha nunca aparece em log mesmo no caminho do hash dummy', async () => {
    const logSpy = vi.spyOn(console, 'log')
    const warnSpy = vi.spyOn(console, 'warn')
    const errorSpy = vi.spyOn(console, 'error')
    supabaseHolder.current = makeSupabase({ admin: null })
    await callPost(
      { email: 'inexistente-log@x.com', senha: 'SenhaSuperSecretaTimingTest456' },
      { 'x-forwarded-for': '30.30.30.10' },
    )
    const textoLogado = [...logSpy.mock.calls, ...warnSpy.mock.calls, ...errorSpy.mock.calls]
      .flat().map(String).join(' | ')
    expect(textoLogado).not.toContain('SenhaSuperSecretaTimingTest456')
  })

  // 8) e-mail completo nunca aparece em log no caminho do hash dummy
  it('email completo nunca aparece em log no caminho do hash dummy', async () => {
    const logSpy = vi.spyOn(console, 'log')
    const warnSpy = vi.spyOn(console, 'warn')
    const errorSpy = vi.spyOn(console, 'error')
    supabaseHolder.current = makeSupabase({ admin: null })
    await callPost(
      { email: 'email-completo-nao-pode-vazar@dominio.com', senha: 'x' },
      { 'x-forwarded-for': '30.30.30.11' },
    )
    const textoLogado = [...logSpy.mock.calls, ...warnSpy.mock.calls, ...errorSpy.mock.calls]
      .flat().map(String).join(' | ')
    expect(textoLogado).not.toContain('email-completo-nao-pode-vazar@dominio.com')
  })

  // 9) dummy hash nunca é retornado ao cliente
  it('dummy hash nunca aparece no corpo ou nos headers da resposta ao cliente', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    const { json, res } = await callPost(
      { email: 'nao-existe-resposta@x.com', senha: 'x' },
      { 'x-forwarded-for': '30.30.30.12' },
    )
    const corpoBruto = JSON.stringify(json)
    expect(corpoBruto).not.toContain('$2a$10$')
    expect(corpoBruto).not.toContain('senha_hash')
    const headersTexto = JSON.stringify([...res.headers.entries()])
    expect(headersTexto).not.toContain('$2a$10$')
  })

  // 10) nenhum teste deste describe toca Supabase real, Redis real ou rede —
  // @supabase/supabase-js está mockado (linha ~21) e UPSTASH_REDIS_REST_URL/
  // _TOKEN são deletadas no beforeEach, então checkRateLimit nem instancia o
  // client Redis (ver rate-limit.ts: getUpstashRedis() retorna null sem as
  // envs). Propriedade estrutural do arquivo, não um assert único.
})

// Revisão final: troca de .single() por .maybeSingle() na consulta a
// admin_users, pra distinguir de verdade "zero linhas" (não é erro) de
// "erro real / múltiplas linhas" (é erro) — evita mascarar indisponibilidade
// do Supabase como "credencial inválida".
describe('POST /api/auth/login — tratamento de erro real do Supabase (maybeSingle)', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    resetRateLimit()
    bcryptHolder.compare.mockReset().mockResolvedValue(true)
    authHolder.createToken.mockClear()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.restoreAllMocks()
  })

  // 1) zero rows: admin null, SEM erro — bcrypt 1x com dummy hash, 401 genérico
  it('zero rows (maybeSingle sem erro): bcrypt 1x com dummy hash, 401 genérico', async () => {
    supabaseHolder.current = makeSupabase({ admin: null })
    const { status, json } = await callPost(
      { email: 'zero-rows@x.com', senha: 'x' },
      { 'x-forwarded-for': '31.31.31.1' },
    )
    expect(status).toBe(401)
    expect(json.error).toBe('Credenciais invalidas')
    expect(bcryptHolder.compare).toHaveBeenCalledTimes(1)
    const [, hashPassado] = bcryptHolder.compare.mock.calls[0] as [string, string]
    expect(hashPassado).not.toBe(ADMIN_PADRAO.senha_hash)
  })

  // 2) uma row + senha errada: bcrypt 1x com hash real, mesmo 401
  it('uma row + senha errada: bcrypt 1x com hash real, mesmo 401 genérico', async () => {
    supabaseHolder.current = makeSupabase({ admin: ADMIN_PADRAO })
    bcryptHolder.compare.mockResolvedValue(false)
    const { status, json } = await callPost(
      { email: 'uma-row@x.com', senha: 'errada' },
      { 'x-forwarded-for': '31.31.31.2' },
    )
    expect(status).toBe(401)
    expect(json.error).toBe('Credenciais invalidas')
    expect(bcryptHolder.compare).toHaveBeenCalledTimes(1)
    expect(bcryptHolder.compare).toHaveBeenCalledWith('errada', ADMIN_PADRAO.senha_hash)
  })

  // 3) uma row + senha correta: 200
  it('uma row + senha correta: 200', async () => {
    supabaseHolder.current = makeSupabase({ admin: ADMIN_PADRAO })
    bcryptHolder.compare.mockResolvedValue(true)
    const { status, json } = await callPost(
      { email: 'uma-row-ok@x.com', senha: 'certa' },
      { 'x-forwarded-for': '31.31.31.3' },
    )
    expect(status).toBe(200)
    expect(json.success).toBe(true)
  })

  // 4) erro real do Supabase: 500 genérico, bcrypt ZERO vezes, createToken ZERO vezes
  it('erro real do Supabase (timeout/rede): 500 genérico, bcrypt e createToken NÃO chamados', async () => {
    supabaseHolder.current = makeSupabase({ dbError: { code: '57014', message: 'canceling statement due to statement timeout' } })
    const { status, json } = await callPost(
      { email: 'erro-real@x.com', senha: 'x' },
      { 'x-forwarded-for': '31.31.31.4' },
    )
    expect(status).toBe(500)
    expect(json.error).toBe('Erro interno')
    expect(bcryptHolder.compare).not.toHaveBeenCalled()
    expect(authHolder.createToken).not.toHaveBeenCalled()
  })

  // 5) múltiplas rows (PGRST116 via maybeSingle): 500, não autentica
  it('múltiplas rows inesperadas (PGRST116 do maybeSingle): 500, não autentica', async () => {
    supabaseHolder.current = makeSupabase({
      dbError: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' },
    })
    const { status, json } = await callPost(
      { email: 'multiplas-rows@x.com', senha: 'x' },
      { 'x-forwarded-for': '31.31.31.5' },
    )
    expect(status).toBe(500)
    expect(json.error).toBe('Erro interno')
    expect(bcryptHolder.compare).not.toHaveBeenCalled()
    expect(authHolder.createToken).not.toHaveBeenCalled()
    expect(json.success).toBeUndefined()
  })

  // 6) log do erro real: nunca email, senha, dummy hash ou hash real
  it('log do erro real de Supabase nunca contém email, senha, dummy hash ou hash real', async () => {
    const logSpy = vi.spyOn(console, 'log')
    const warnSpy = vi.spyOn(console, 'warn')
    const errorSpy = vi.spyOn(console, 'error')
    supabaseHolder.current = makeSupabase({
      dbError: { code: '57014', message: 'canceling statement due to statement timeout' },
    })

    await callPost(
      { email: 'log-erro-nao-pode-vazar@dominio.com', senha: 'SenhaSecretaDoErro789' },
      { 'x-forwarded-for': '31.31.31.6' },
    )

    const textoLogado = [...logSpy.mock.calls, ...warnSpy.mock.calls, ...errorSpy.mock.calls]
      .flat().map(String).join(' | ')
    expect(textoLogado).not.toContain('log-erro-nao-pode-vazar@dominio.com')
    expect(textoLogado).not.toContain('SenhaSecretaDoErro789')
    expect(textoLogado).not.toContain('$2a$10$') // nem dummy nem hash real (nenhum bcrypt rodou)
    expect(textoLogado).toContain('57014') // código categórico, seguro, presente
  })

  // 7) os testes de rate limit e timing (describes anteriores) continuam
  // passando sem alteração — verificado rodando o arquivo inteiro (33
  // testes pré-existentes + estes novos), não repetido aqui individualmente.
})
