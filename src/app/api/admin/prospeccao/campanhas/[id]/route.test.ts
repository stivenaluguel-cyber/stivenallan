import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { cookieHolder, supabaseHolder } = vi.hoisted(() => ({
  cookieHolder: { logado: true },
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (cookieHolder.logado && name === 'dashboard_token' ? { value: 'valid-token' } : undefined),
  }),
}))
vi.mock('jose', () => ({ jwtVerify: async () => ({ payload: { adminId: 'admin-1' } }) }))
vi.mock('@supabase/supabase-js', () => ({ createClient: () => supabaseHolder.current }))

import { GET } from './route'

function makeSupabase(cfg: { campanha?: Record<string, unknown> | null; leads?: Record<string, unknown>[] } = {}) {
  return {
    from(tabela: string) {
      if (tabela === 'prospeccao_campanhas') {
        return { select: () => ({ eq: () => ({ single: async () => ({ data: cfg.campanha ?? null, error: cfg.campanha ? null : { message: 'nao encontrada' } }) }) }) }
      }
      if (tabela === 'prospeccao_leads') {
        return { select: () => ({ eq: () => ({ order: async () => ({ data: cfg.leads ?? [], error: null }) }) }) }
      }
      throw new Error('tabela inesperada: ' + tabela)
    },
  }
}

const params = { params: Promise.resolve({ id: 'campanha-1' }) }

describe('GET /api/admin/prospeccao/campanhas/[id]', () => {
  beforeEach(() => { cookieHolder.logado = true })

  it('sem sessao admin devolve 401', async () => {
    cookieHolder.logado = false
    supabaseHolder.current = makeSupabase()
    const res = await GET({} as unknown as NextRequest, params)
    expect(res.status).toBe(401)
  })

  it('campanha inexistente devolve 404', async () => {
    supabaseHolder.current = makeSupabase({ campanha: null })
    const res = await GET({} as unknown as NextRequest, params)
    expect(res.status).toBe(404)
  })

  it('devolve a campanha com seus leads ordenados', async () => {
    supabaseHolder.current = makeSupabase({
      campanha: { id: 'campanha-1', nome: 'Investidores PJ' },
      leads: [{ id: 'l1', score: 96 }],
    })
    const res = await GET({} as unknown as NextRequest, params)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.campanha.nome).toBe('Investidores PJ')
    expect(body.leads).toEqual([{ id: 'l1', score: 96 }])
  })
})
