import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'
import type { PlaceCandidato } from '@/lib/prospeccao/google-places'

const { cookieHolder, supabaseHolder, groqHolder, placesHolder } = vi.hoisted(() => ({
  cookieHolder: { logado: true },
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
  groqHolder: { current: null as unknown as (args: Record<string, unknown>) => Promise<unknown> },
  placesHolder: { current: null as unknown as (...args: unknown[]) => Promise<unknown> },
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
vi.mock('@/lib/prospeccao/google-places', () => ({
  buscarPlacesMultiplas: (...args: unknown[]) => placesHolder.current(...args),
}))

import { POST } from './route'

type Campanha = {
  id: string
  produto: string
  alvo: string
  criterios: string[]
  queries_busca: string[]
  leads_solicitados: number
  leads_entregues: number
}

function makeSupabase(cfg: { campanha?: Campanha | null; existentes?: string[]; insertOk?: boolean } = {}) {
  const inseridos: Record<string, unknown>[] = []
  const updates: Record<string, unknown>[] = []
  return {
    inseridos,
    updates,
    from(tabela: string) {
      if (tabela === 'prospeccao_campanhas') {
        return {
          select: () => ({ eq: () => ({ single: async () => ({ data: cfg.campanha ?? null, error: cfg.campanha ? null : { message: 'nao encontrada' } }) }) }),
          update: (row: Record<string, unknown>) => {
            updates.push(row)
            return { eq: async () => ({ error: null }) }
          },
        }
      }
      if (tabela === 'prospeccao_leads') {
        return {
          select: () => ({
            eq: async () => ({ data: (cfg.existentes ?? []).map((place_id) => ({ place_id })), error: null }),
          }),
          insert: (rows: Record<string, unknown>[]) => {
            if (cfg.insertOk === false) return { select: async () => ({ data: null, error: { message: 'falha ao inserir' } }) }
            inseridos.push(...rows)
            return { select: async () => ({ data: rows.map((r, i) => ({ id: 'lead-' + i, ...r })), error: null }) }
          },
        }
      }
      throw new Error('tabela inesperada: ' + tabela)
    },
  }
}

const candidato = (over: Partial<PlaceCandidato> = {}): PlaceCandidato => ({
  placeId: 'place-1',
  nome: 'Transportes Natal',
  endereco: 'Av. X, 260 - Criciúma - SC',
  telefone: '(48) 3431-0600',
  site: 'https://transnatal.com.br',
  rating: 4.5,
  ratingCount: 37,
  tipos: ['moving_company'],
  ...over,
})

const CAMPANHA_BASE: Campanha = {
  id: 'campanha-1',
  produto: 'Apartamento na planta',
  alvo: 'Donos de empresa de médio porte',
  criterios: ['Porte médio'],
  queries_busca: ['transportadoras em Criciúma SC'],
  leads_solicitados: 0,
  leads_entregues: 0,
}

const scoringOk = (placeIds: string[]) =>
  JSON.stringify(placeIds.map((id, i) => ({ id, scoreFit: 90 - i, scorePotencial: 90 - i, scoreAcessibilidade: 90 - i, contexto: 'ok' })))

const groqDevolve = (conteudo: string) => async () => ({ choices: [{ message: { content: conteudo } }] })
const req = (body: unknown) => ({ json: async () => body }) as unknown as NextRequest
const params = { params: Promise.resolve({ id: 'campanha-1' }) }

describe('POST /api/admin/prospeccao/campanhas/[id]/buscar', () => {
  beforeEach(() => {
    cookieHolder.logado = true
    process.env.OPENAI_API_KEY = 'chave-de-teste'
    process.env.GOOGLE_PLACES_API_KEY = 'chave-places'
    supabaseHolder.current = makeSupabase({ campanha: CAMPANHA_BASE })
    placesHolder.current = async () => ({ ok: true, candidatos: [candidato()] })
    groqHolder.current = groqDevolve(scoringOk(['place-1']))
  })
  afterEach(() => {
    delete process.env.OPENAI_API_KEY
    delete process.env.GOOGLE_PLACES_API_KEY
  })

  it('sem sessao admin devolve 401', async () => {
    cookieHolder.logado = false
    const res = await POST(req({}), params)
    expect(res.status).toBe(401)
  })

  it('sem GOOGLE_PLACES_API_KEY devolve 503', async () => {
    delete process.env.GOOGLE_PLACES_API_KEY
    const res = await POST(req({}), params)
    expect(res.status).toBe(503)
  })

  it('sem OPENAI_API_KEY devolve 503', async () => {
    delete process.env.OPENAI_API_KEY
    const res = await POST(req({}), params)
    expect(res.status).toBe(503)
  })

  it('campanha inexistente devolve 404', async () => {
    supabaseHolder.current = makeSupabase({ campanha: null })
    const res = await POST(req({}), params)
    expect(res.status).toBe(404)
  })

  it('campanha sem queries_busca devolve 400', async () => {
    supabaseHolder.current = makeSupabase({ campanha: { ...CAMPANHA_BASE, queries_busca: [] } })
    const res = await POST(req({}), params)
    expect(res.status).toBe(400)
  })

  it('Places sem chave configurada (skipped) devolve 503', async () => {
    placesHolder.current = async () => ({ ok: false, skipped: true })
    const res = await POST(req({}), params)
    expect(res.status).toBe(503)
  })

  it('erro do Places devolve 502', async () => {
    placesHolder.current = async () => ({ ok: false, skipped: false, error: 'Google Places recusou a busca' })
    const res = await POST(req({}), params)
    expect(res.status).toBe(502)
  })

  it('todos os candidatos já existentes na campanha: devolve 0 entregues sem chamar a IA', async () => {
    supabaseHolder.current = makeSupabase({ campanha: CAMPANHA_BASE, existentes: ['place-1'] })
    const chamouGroq = vi.fn()
    groqHolder.current = chamouGroq as never
    const res = await POST(req({}), params)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ analisados: 1, entregues: 0, leads: [] })
    expect(chamouGroq).not.toHaveBeenCalled()
  })

  it('queda da IA de scoring devolve 502', async () => {
    groqHolder.current = async () => { throw new Error('ECONNRESET') }
    const res = await POST(req({}), params)
    expect(res.status).toBe(502)
  })

  it('scoring fora do formato devolve 502', async () => {
    groqHolder.current = groqDevolve('não é json')
    const res = await POST(req({}), params)
    expect(res.status).toBe(502)
  })

  it('caminho feliz: insere os leads qualificados e soma nos contadores da campanha', async () => {
    const res = await POST(req({ quantidade: 20 }), params)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.entregues).toBe(1)
    expect(body.leads[0].nome).toBe('Transportes Natal')
    expect(body.leads[0].score).toBe(90)
    expect(body.leads[0].classificacao).toBe('EXCELENTE')

    const sb = supabaseHolder.current as ReturnType<typeof makeSupabase>
    expect(sb.updates[0]).toMatchObject({ leads_solicitados: 20, leads_entregues: 1 })
  })

  it('ordena por score e corta no tamanho pedido — não insere além da quantidade', async () => {
    const placeIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']
    placesHolder.current = async () => ({ ok: true, candidatos: placeIds.map((placeId) => candidato({ placeId })) })
    // p1 é o pior (score 50) — com 6 candidatos e quantidade=5, ele é o único descartado.
    groqHolder.current = groqDevolve(
      JSON.stringify(
        placeIds.map((id, i) => ({
          id,
          scoreFit: i === 0 ? 50 : 90 - i,
          scorePotencial: i === 0 ? 50 : 90 - i,
          scoreAcessibilidade: i === 0 ? 50 : 90 - i,
          contexto: 'ctx',
        })),
      ),
    )
    const res = await POST(req({ quantidade: 5 }), params)
    const body = await res.json()
    expect(body.entregues).toBe(5)
    expect(body.leads.map((l: { place_id: string }) => l.place_id)).not.toContain('p1')
    expect(body.leads).toHaveLength(5)
  })

  it('quantidade fora da faixa é limitada a 5-50, e ausente cai em 20', async () => {
    await POST(req({ quantidade: 999 }), params)
    let sb = supabaseHolder.current as ReturnType<typeof makeSupabase>
    expect(sb.updates[0].leads_solicitados).toBe(50)

    supabaseHolder.current = makeSupabase({ campanha: CAMPANHA_BASE })
    await POST(req({ quantidade: 1 }), params)
    sb = supabaseHolder.current as ReturnType<typeof makeSupabase>
    expect(sb.updates[0].leads_solicitados).toBe(5)

    supabaseHolder.current = makeSupabase({ campanha: CAMPANHA_BASE })
    await POST(req({}), params)
    sb = supabaseHolder.current as ReturnType<typeof makeSupabase>
    expect(sb.updates[0].leads_solicitados).toBe(20)
  })

  it('falha ao inserir no banco devolve 500', async () => {
    supabaseHolder.current = makeSupabase({ campanha: CAMPANHA_BASE, insertOk: false })
    const res = await POST(req({}), params)
    expect(res.status).toBe(500)
  })
})
