import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { cookieHolder, supabaseHolder, groqHolder } = vi.hoisted(() => ({
  cookieHolder: { logado: true },
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
  groqHolder: { current: null as unknown as (args: Record<string, unknown>) => Promise<unknown> },
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (cookieHolder.logado && name === 'dashboard_token' ? { value: 'valid-token' } : undefined),
  }),
}))
vi.mock('jose', () => ({ jwtVerify: async () => ({ payload: { adminId: 'admin-1' } }) }))
vi.mock('@supabase/supabase-js', () => ({ createClient: () => supabaseHolder.current }))
vi.mock('openai', () => ({
  default: class {
    chat = { completions: { create: (args: Record<string, unknown>) => groqHolder.current(args) } }
  },
}))

import { GET, POST } from './route'

function makeSupabase(cfg: { campanhas?: Record<string, unknown>[]; inseridaOk?: boolean } = {}) {
  const inseridas: Record<string, unknown>[] = []
  return {
    inseridas,
    from(tabela: string) {
      if (tabela !== 'prospeccao_campanhas') throw new Error('tabela inesperada: ' + tabela)
      return {
        select: () => ({
          order: async () => ({ data: cfg.campanhas ?? [], error: null }),
        }),
        insert: (row: Record<string, unknown>) => {
          inseridas.push(row)
          return {
            select: () => ({
              single: async () =>
                cfg.inseridaOk === false
                  ? { data: null, error: { message: 'falha ao inserir' } }
                  : { data: { id: 'campanha-1', ...row }, error: null },
            }),
          }
        },
      }
    },
  }
}

const icpOk = JSON.stringify({
  nomeCampanha: 'Investidores PJ Criciúma',
  alvo: 'Donos de empresas de médio porte',
  abordagem: 'Consultiva',
  estrategia: 'Aproveitar solidez local',
  criterios: ['Porte médio'],
  queries: ['transportadoras em Criciúma SC'],
})

const groqDevolve = (conteudo: string) => async () => ({ choices: [{ message: { content: conteudo } }] })
const req = (body: unknown) => ({ json: async () => body }) as unknown as NextRequest

describe('POST /api/admin/prospeccao/campanhas', () => {
  beforeEach(() => {
    cookieHolder.logado = true
    process.env.OPENAI_API_KEY = 'chave-de-teste'
    supabaseHolder.current = makeSupabase()
    groqHolder.current = groqDevolve(icpOk)
  })
  afterEach(() => { delete process.env.OPENAI_API_KEY })

  it('sem sessao admin devolve 401 sem chamar a IA', async () => {
    cookieHolder.logado = false
    const chamouGroq = vi.fn()
    groqHolder.current = chamouGroq as never
    const res = await POST(req({ produto: 'Apartamento na planta' }))
    expect(res.status).toBe(401)
    expect(chamouGroq).not.toHaveBeenCalled()
  })

  it('sem OPENAI_API_KEY devolve 503', async () => {
    delete process.env.OPENAI_API_KEY
    const res = await POST(req({ produto: 'Apartamento na planta' }))
    expect(res.status).toBe(503)
  })

  it('sem produto devolve 400', async () => {
    const res = await POST(req({ produto: '   ' }))
    expect(res.status).toBe(400)
  })

  it('cria a campanha com o ICP que a IA devolveu', async () => {
    const res = await POST(req({ produto: 'Apartamento na planta como investimento', localizacao: 'Criciúma, SC' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.campanha.nome).toBe('Investidores PJ Criciúma')
    expect(body.campanha.alvo).toBe('Donos de empresas de médio porte')
    expect(body.campanha.queries_busca).toEqual(['transportadoras em Criciúma SC'])
    const [linha] = (supabaseHolder.current as ReturnType<typeof makeSupabase>).inseridas
    expect(linha.admin_id).toBe('admin-1')
    expect(linha.produto).toBe('Apartamento na planta como investimento')
  })

  it('resposta da IA fora do formato devolve 502', async () => {
    groqHolder.current = groqDevolve('não é json')
    const res = await POST(req({ produto: 'x' }))
    expect(res.status).toBe(502)
  })

  it('queda da IA devolve 502 em vez de derrubar a rota', async () => {
    groqHolder.current = async () => { throw new Error('ECONNRESET') }
    const res = await POST(req({ produto: 'x' }))
    expect(res.status).toBe(502)
  })

  it('falha ao inserir no banco devolve 500', async () => {
    supabaseHolder.current = makeSupabase({ inseridaOk: false })
    const res = await POST(req({ produto: 'x' }))
    expect(res.status).toBe(500)
  })
})

describe('GET /api/admin/prospeccao/campanhas', () => {
  beforeEach(() => {
    cookieHolder.logado = true
    supabaseHolder.current = makeSupabase({ campanhas: [{ id: 'c1', nome: 'Campanha 1' }] })
  })

  it('sem sessao admin devolve 401', async () => {
    cookieHolder.logado = false
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('lista as campanhas', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.campanhas).toEqual([{ id: 'c1', nome: 'Campanha 1' }])
  })
})
