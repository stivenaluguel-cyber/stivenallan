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

import { PATCH } from './route'

function makeSupabase() {
  const updates: Record<string, unknown>[] = []
  return {
    updates,
    from: () => ({
      update: (row: Record<string, unknown>) => {
        updates.push(row)
        return { eq: () => ({ select: () => ({ single: async () => ({ data: { id: 'pl-1', ...row }, error: null }) }) }) }
      },
    }),
  }
}

const req = (body: unknown) => ({ json: async () => body }) as unknown as NextRequest
const params = { params: Promise.resolve({ id: 'pl-1' }) }

describe('PATCH /api/admin/prospeccao/leads/[id]', () => {
  beforeEach(() => {
    cookieHolder.logado = true
    supabaseHolder.current = makeSupabase()
  })

  it('sem sessao admin devolve 401', async () => {
    cookieHolder.logado = false
    const res = await PATCH(req({ status: 'contatado' }), params)
    expect(res.status).toBe(401)
  })

  it('status fora da lista permitida devolve 400', async () => {
    const res = await PATCH(req({ status: 'fechado_ganho' }), params)
    expect(res.status).toBe(400)
  })

  it('atualiza para um status válido', async () => {
    const res = await PATCH(req({ status: 'contatado' }), params)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.lead.status).toBe('contatado')
  })

  it('body sem status devolve 400 em vez de gravar undefined', async () => {
    const res = await PATCH(req({}), params)
    expect(res.status).toBe(400)
  })
})
