import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { cookieHolder, supabaseHolder, groqHolder } = vi.hoisted(() => ({
  cookieHolder: { logado: true },
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
  groqHolder: { current: null as unknown as (args: Record<string, unknown>) => Promise<unknown> },
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieHolder.logado && name === 'dashboard_token' ? { value: 'valid-token' } : undefined,
  }),
}))

vi.mock('jose', () => ({ jwtVerify: async () => ({ payload: { adminId: 'admin-1' } }) }))

vi.mock('@supabase/supabase-js', () => ({ createClient: () => supabaseHolder.current }))

vi.mock('openai', () => ({
  default: class {
    chat = { completions: { create: (args: Record<string, unknown>) => groqHolder.current(args) } }
  },
}))

import { POST } from './route'

type Interacao = { direcao: 'entrada' | 'saida'; mensagem: string }

function makeSupabase(cfg: { lead?: Record<string, unknown> | null; interacoes?: Interacao[] } = {}) {
  const chamadas: { tabela: string; filtros: unknown[] }[] = []
  return {
    chamadas,
    from(tabela: string) {
      const filtros: unknown[] = []
      chamadas.push({ tabela, filtros })
      if (tabela === 'leads') {
        return {
          select: () => ({
            eq: (col: string, val: unknown) => {
              filtros.push([col, val])
              return { single: async () => ({ data: cfg.lead ?? null, error: cfg.lead ? null : { message: 'nao encontrado' } }) }
            },
          }),
        }
      }
      if (tabela === 'interacoes') {
        const chain = {
          eq: (col: string, val: unknown) => { filtros.push([col, val]); return chain },
          order: (col: string, opts: unknown) => { filtros.push([col, opts]); return chain },
          limit: async (n: number) => { filtros.push(['limit', n]); return { data: cfg.interacoes ?? [], error: null } },
        }
        return { select: () => chain }
      }
      throw new Error('tabela inesperada no teste: ' + tabela)
    },
  }
}

const respostaOk = `<<<DIRETO>>>
Depende da unidade, Joao. Me diz qual planta te interessa que eu confirmo hoje.
<<<FIRME>>>
Cada unidade tem um valor e as melhores saem primeiro. Consegue me dizer hoje qual planta voce quer?
<<<LEVE>>>
Boa pergunta! Varia conforme a unidade. Quer que eu te mande as opcoes pra ver com calma?`

const groqDevolve = (conteudo: string) => async () => ({ choices: [{ message: { content: conteudo } }] })

const req = (body: unknown) => ({ json: async () => body }) as unknown as NextRequest
const params = { params: Promise.resolve({ id: 'lead-1' }) }

const LEAD = {
  nome: 'Joao Carlos Silva',
  estagio_funil: 'interessado',
  temperatura: 3,
  orcamento_max: 480000,
  empreendimentos: [{ nome: 'Pineto', cidade: 'Criciuma' }],
}

describe('POST /api/admin/leads/[id]/sugestoes', () => {
  beforeEach(() => {
    cookieHolder.logado = true
    process.env.OPENAI_API_KEY = 'chave-de-teste'
    supabaseHolder.current = makeSupabase({ lead: LEAD, interacoes: [] })
    groqHolder.current = groqDevolve(respostaOk)
  })
  afterEach(() => { delete process.env.OPENAI_API_KEY })

  it('sem sessao admin devolve 401 e nao toca no banco nem na IA', async () => {
    cookieHolder.logado = false
    const chamouGroq = vi.fn()
    groqHolder.current = chamouGroq as never
    const res = await POST(req({ mensagem: 'oi' }), params)
    expect(res.status).toBe(401)
    expect(chamouGroq).not.toHaveBeenCalled()
    expect(supabaseHolder.current.chamadas).toHaveLength(0)
  })

  it('sem OPENAI_API_KEY devolve 503 em vez de estourar', async () => {
    delete process.env.OPENAI_API_KEY
    const res = await POST(req({ mensagem: 'oi' }), params)
    expect(res.status).toBe(503)
    expect((await res.json()).error).toMatch(/OPENAI_API_KEY/)
  })

  it('lead inexistente devolve 404', async () => {
    supabaseHolder.current = makeSupabase({ lead: null })
    const res = await POST(req({ mensagem: 'oi' }), params)
    expect(res.status).toBe(404)
  })

  it('sem mensagem colada e sem fala do lead devolve 400 pedindo pra colar', async () => {
    supabaseHolder.current = makeSupabase({ lead: LEAD, interacoes: [{ direcao: 'saida', mensagem: 'Oi!' }] })
    const res = await POST(req({}), params)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/[Cc]ole a resposta/)
  })

  it('mensagem colada gera as tres sugestoes', async () => {
    const res = await POST(req({ mensagem: 'quanto fica a entrada?' }), params)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.sugestoes.map((s: { tom: string }) => s.tom)).toEqual(['direto', 'firme', 'leve'])
    expect(body.origem).toBe('colada')
    expect(body.mensagem_base).toBe('quanto fica a entrada?')
  })

  it('sem colar, usa a ultima fala do lead e devolve a conversa na ordem certa pro prompt', async () => {
    // A query pede order desc + limit; a rota tem que reverter antes de montar
    // o prompt, senao a conversa chega de tras pra frente.
    supabaseHolder.current = makeSupabase({
      lead: LEAD,
      interacoes: [
        { direcao: 'entrada', mensagem: 'quanto fica a entrada?' },
        { direcao: 'saida', mensagem: 'Claro, te mando os detalhes.' },
        { direcao: 'entrada', mensagem: 'queria saber do Pineto' },
      ],
    })
    let prompt = ''
    groqHolder.current = async (args) => {
      prompt = (args.messages as { content: string }[])[0].content
      return { choices: [{ message: { content: respostaOk } }] }
    }
    const res = await POST(req({}), params)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.origem).toBe('historico')
    expect(body.mensagem_base).toBe('quanto fica a entrada?')
    expect(prompt.indexOf('queria saber do Pineto')).toBeLessThan(prompt.indexOf('Claro, te mando os detalhes'))
  })

  it('leva o contexto comercial do lead pro prompt', async () => {
    let prompt = ''
    groqHolder.current = async (args) => {
      prompt = (args.messages as { content: string }[])[0].content
      return { choices: [{ message: { content: respostaOk } }] }
    }
    await POST(req({ mensagem: 'oi' }), params)
    expect(prompt).toContain('Primeiro nome: Joao')
    expect(prompt).toContain('Estagio no funil: Interessado'.replace('Estagio', 'Estágio'))
    expect(prompt).toContain('Empreendimento de interesse: Pineto')
    expect(prompt).toContain('R$ 480.000')
    expect(prompt).toContain('NUNCA invente preço')
  })

  it('paste gigante e cortado antes de virar prompt', async () => {
    let prompt = ''
    groqHolder.current = async (args) => {
      prompt = (args.messages as { content: string }[])[0].content
      return { choices: [{ message: { content: respostaOk } }] }
    }
    await POST(req({ mensagem: 'x'.repeat(9000) }), params)
    expect(prompt.length).toBeLessThan(6000)
  })

  it('resposta fora do formato devolve 502 em vez de lista vazia', async () => {
    groqHolder.current = groqDevolve('Desculpe, nao posso ajudar com isso.')
    const res = await POST(req({ mensagem: 'oi' }), params)
    expect(res.status).toBe(502)
  })

  it('queda da Groq devolve 502 em vez de derrubar a rota', async () => {
    groqHolder.current = async () => { throw new Error('ECONNRESET') }
    const res = await POST(req({ mensagem: 'oi' }), params)
    expect(res.status).toBe(502)
    expect((await res.json()).error).toMatch(/Tente de novo/)
  })

  it('body invalido nao derruba a rota', async () => {
    const quebrado = { json: async () => { throw new Error('nao e json') } } as unknown as NextRequest
    const res = await POST(quebrado, params)
    // Sem body util, cai no caminho do historico — que aqui esta vazio.
    expect(res.status).toBe(400)
  })
})
