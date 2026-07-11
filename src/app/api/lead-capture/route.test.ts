import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { supabaseHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

import { POST } from './route'

type MockConfig = {
  insert?: { data: { id: string } | null; error: unknown }
  insertRetry?: { data: { id: string } | null; error: unknown } | null
}

function makeSupabase(cfg: MockConfig = {}) {
  const insertRows: Record<string, unknown>[] = []
  let insertN = 0
  return {
    insertRows,
    from(table: string) {
      if (table !== 'leads') throw new Error(`Unexpected table: ${table}`)
      return {
        insert(row: Record<string, unknown>) {
          insertRows.push(row)
          insertN++
          return {
            select: () => ({
              single: async () => {
                if (insertN === 1) return cfg.insert ?? { data: { id: 'uuid-1' }, error: null }
                return cfg.insertRetry ?? cfg.insert ?? { data: { id: 'uuid-1' }, error: null }
              },
            }),
          }
        },
      }
    },
  }
}

async function callPost(body: unknown) {
  const req = { json: async () => body } as unknown as NextRequest
  const res = await POST(req)
  const json = (await res.json()) as { id?: string | null; error?: string }
  return { status: res.status, json }
}

describe('POST /api/lead-capture', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
  })

  it('retorna 503 quando envs do Supabase estão ausentes', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    const { status } = await callPost({ nome: 'Ana', whatsapp: '48991642332' })
    expect(status).toBe(503)
  })

  it('retorna 400 quando nome é whitespace-only', async () => {
    supabaseHolder.current = makeSupabase()
    const { status } = await callPost({ nome: '   ', whatsapp: '48991642332' })
    expect(status).toBe(400)
  })

  it('retorna 400 quando whatsapp não tem dígitos', async () => {
    supabaseHolder.current = makeSupabase()
    const { status } = await callPost({ nome: 'Ana', whatsapp: 'abc' })
    expect(status).toBe(400)
  })

  it('retorna 201 com { id } no sucesso', async () => {
    const mock = makeSupabase({ insert: { data: { id: 'uuid-abc' }, error: null } })
    supabaseHolder.current = mock

    const { status, json } = await callPost({
      nome: 'Ana',
      whatsapp: '48991642332',
      property_id: 'prop-1',
      property_name: 'Empreendimento X',
    })

    expect(status).toBe(201)
    expect(json).toEqual({ id: 'uuid-abc' })
  })

  it('normaliza nome, whatsapp, email e campos de propriedade', async () => {
    const mock = makeSupabase({ insert: { data: { id: 'uuid-x' }, error: null } })
    supabaseHolder.current = mock

    await callPost({
      nome: '  Ana Maria  ',
      whatsapp: '(48) 9 9164-2332',
      email: '  A@B.COM ',
      property_id: '  prop-1  ',
      property_name: '  Empreendimento X  ',
    })

    expect(mock.insertRows[0]).toMatchObject({
      nome: 'Ana Maria',
      whatsapp: '48991642332',
      email: 'a@b.com',
      property_id: 'prop-1',
      property_name: 'Empreendimento X',
    })
  })

  it('preserva UTMs no primeiro insert e cai no fallback quando coluna falta', async () => {
    const mock = makeSupabase({
      insert: {
        data: null,
        error: { code: 'PGRST204', message: 'column "utm_source" does not exist' },
      },
      insertRetry: { data: { id: 'lead-2' }, error: null },
    })
    supabaseHolder.current = mock

    const { status, json } = await callPost({
      nome: 'Ana',
      whatsapp: '48991642332',
      utm_source: 'google',
      utm_campaign: 'summer',
    })

    expect(status).toBe(201)
    expect(json.id).toBe('lead-2')
    expect(mock.insertRows).toHaveLength(2)
    expect(mock.insertRows[0]).toMatchObject({ utm_source: 'google', utm_campaign: 'summer' })
    expect(mock.insertRows[1]).not.toHaveProperty('utm_source')
  })

  it('retorna 500 quando o Supabase erra sem ser missing-column', async () => {
    const mock = makeSupabase({
      insert: { data: null, error: { code: 'XYZ', message: 'connection refused' } },
    })
    supabaseHolder.current = mock

    const { status } = await callPost({ nome: 'Ana', whatsapp: '48991642332' })
    expect(status).toBe(500)
  })
})
