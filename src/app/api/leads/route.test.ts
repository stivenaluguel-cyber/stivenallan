import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

// Holder mutável precisa ser hoisted junto com vi.mock (que também é hoisted).
const { supabaseHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

// Import DEPOIS do vi.mock (o mock é hoistado para cima do bloco de imports).
import { POST } from './route'

type MockConfig = {
  property?: { id: string; nome: string | null } | null
  insert?: { data: { id: string } | null; error: unknown }
  insertRetry?: { data: { id: string } | null; error: unknown } | null
}

function makeSupabase(cfg: MockConfig = {}) {
  const insertRows: Record<string, unknown>[] = []
  let insertN = 0
  return {
    insertRows,
    from(table: string) {
      if (table === 'properties') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: cfg.property ?? null, error: null }),
            }),
          }),
        }
      }
      if (table === 'leads') {
        return {
          insert(row: Record<string, unknown>) {
            insertRows.push(row)
            insertN++
            return {
              select: () => ({
                single: async () => {
                  if (insertN === 1) {
                    return cfg.insert ?? { data: { id: 'uuid-1' }, error: null }
                  }
                  return cfg.insertRetry ?? cfg.insert ?? { data: { id: 'uuid-1' }, error: null }
                },
              }),
            }
          },
        }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
  }
}

async function callPost(body: unknown) {
  const req = { json: async () => body } as unknown as NextRequest
  const res = await POST(req)
  const json = (await res.json()) as { success?: boolean; id?: string | null; error?: string }
  return { status: res.status, json }
}

describe('POST /api/leads', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    // Silencia console.error nos paths de erro esperados
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
  })

  it('retorna 503 quando envs do Supabase estão ausentes', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    const { status } = await callPost({ nome: 'Ana', telefone: '48991642332' })
    expect(status).toBe(503)
  })

  it('retorna 400 quando nome está vazio (whitespace-only)', async () => {
    supabaseHolder.current = makeSupabase()
    const { status } = await callPost({ nome: '   ', telefone: '48991642332' })
    expect(status).toBe(400)
  })

  it('retorna 400 quando telefone não tem dígitos', async () => {
    supabaseHolder.current = makeSupabase()
    const { status } = await callPost({ nome: 'Ana', telefone: 'abc' })
    expect(status).toBe(400)
  })

  it('retorna 201 com { success, id } no sucesso', async () => {
    const mock = makeSupabase({ insert: { data: { id: 'uuid-abc' }, error: null } })
    supabaseHolder.current = mock

    const { status, json } = await callPost({
      nome: 'Ana Maria',
      telefone: '48991642332',
    })

    expect(status).toBe(201)
    expect(json).toEqual({ success: true, id: 'uuid-abc' })
  })

  it('normaliza nome, telefone e email antes de gravar', async () => {
    const mock = makeSupabase({ insert: { data: { id: 'uuid-x' }, error: null } })
    supabaseHolder.current = mock

    await callPost({
      nome: '  Ana Maria  ',
      telefone: '(48) 9 9164-2332',
      email: '  A@B.COM ',
    })

    expect(mock.insertRows[0]).toMatchObject({
      nome: 'Ana Maria',
      whatsapp: '48991642332',
      email: 'a@b.com',
    })
  })

  it('resolve property_id e property_name a partir de property_slug', async () => {
    const mock = makeSupabase({
      property: { id: 'prop-1', nome: 'Empreendimento X' },
      insert: { data: { id: 'lead-1' }, error: null },
    })
    supabaseHolder.current = mock

    const { status, json } = await callPost({
      nome: 'Ana',
      telefone: '48991642332',
      property_slug: 'empreendimento-x',
    })

    expect(status).toBe(201)
    expect(json.id).toBe('lead-1')
    expect(mock.insertRows[0]).toMatchObject({
      property_id: 'prop-1',
      property_name: 'Empreendimento X',
    })
  })

  it('cai no fallback base-sem-extras quando colunas de growth não existem', async () => {
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
      telefone: '48991642332',
      utm_source: 'google',
    })

    expect(status).toBe(201)
    expect(json.id).toBe('lead-2')
    expect(mock.insertRows).toHaveLength(2)
    expect(mock.insertRows[0]).toHaveProperty('utm_source', 'google')
    expect(mock.insertRows[1]).not.toHaveProperty('utm_source')
  })

  it('retorna 500 quando o Supabase erra sem ser missing-column', async () => {
    const mock = makeSupabase({
      insert: { data: null, error: { code: 'XYZ', message: 'connection refused' } },
    })
    supabaseHolder.current = mock

    const { status } = await callPost({ nome: 'Ana', telefone: '48991642332' })
    expect(status).toBe(500)
  })

  it('não força lookup em properties quando nenhum id/slug foi enviado', async () => {
    const mock = makeSupabase({ insert: { data: { id: 'lead-3' }, error: null } })
    supabaseHolder.current = mock

    await callPost({ nome: 'Ana', telefone: '48991642332' })

    expect(mock.insertRows[0]).toMatchObject({ property_id: null })
    expect(mock.insertRows[0]).not.toHaveProperty('property_name')
  })

  it('preserva property_id vindo do body sem sobrescrever com lookup', async () => {
    const mock = makeSupabase({
      property: { id: 'should-not-be-used', nome: 'nope' },
      insert: { data: { id: 'lead-4' }, error: null },
    })
    supabaseHolder.current = mock

    await callPost({
      nome: 'Ana',
      telefone: '48991642332',
      property_id: 'given-uuid',
      property_slug: 'ignored-when-id-present',
    })

    expect(mock.insertRows[0]).toMatchObject({ property_id: 'given-uuid' })
    expect(mock.insertRows[0]).not.toHaveProperty('property_name')
  })
})
