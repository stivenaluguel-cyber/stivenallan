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
import { __resetForTests as resetRateLimit } from '@/lib/leads/rate-limit'

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

async function callPost(body: unknown, headers: Record<string, string> = {}) {
  const req = {
    json: async () => body,
    headers: new Headers(headers),
  } as unknown as NextRequest
  const res = await POST(req)
  const json = (await res.json()) as { success?: boolean; id?: string | null; error?: string }
  return { status: res.status, json, headers: res.headers }
}

describe('POST /api/leads', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    resetRateLimit()
    // Silencia logs estruturados nos paths de erro esperados
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
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

  it('rejeita 400 com honeypot preenchido, sem tocar em Supabase', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock

    const { status } = await callPost({
      nome: 'Ana',
      telefone: '48991642332',
      hp_url: 'http://spam.example.com',
    })

    expect(status).toBe(400)
    expect(mock.insertRows).toHaveLength(0)
  })

  it('honeypot é checado antes do rate limit (bot não consome cota)', async () => {
    const mock = makeSupabase({ insert: { data: { id: 'lead-hp' }, error: null } })
    supabaseHolder.current = mock

    // 3 tentativas de bot do mesmo IP — todas 400, não devem afetar o rate limit
    for (let i = 0; i < 3; i++) {
      const { status } = await callPost(
        { nome: 'Ana', telefone: '48991642332', hp_url: 'x' },
        { 'x-forwarded-for': '9.9.9.9' },
      )
      expect(status).toBe(400)
    }

    // Mesmo IP ainda tem os 5 tickets disponíveis
    for (let i = 0; i < 5; i++) {
      const { status } = await callPost(
        { nome: 'Ana', telefone: '48991642332' },
        { 'x-forwarded-for': '9.9.9.9' },
      )
      expect(status).toBe(201)
    }
  })

  it('retorna 429 com Retry-After após 5 requests do mesmo IP no minuto', async () => {
    const mock = makeSupabase({ insert: { data: { id: 'lead-ok' }, error: null } })
    supabaseHolder.current = mock

    for (let i = 0; i < 5; i++) {
      const { status } = await callPost(
        { nome: 'Ana', telefone: '48991642332' },
        { 'x-forwarded-for': '1.2.3.4' },
      )
      expect(status).toBe(201)
    }

    const r = await callPost(
      { nome: 'Ana', telefone: '48991642332' },
      { 'x-forwarded-for': '1.2.3.4' },
    )
    expect(r.status).toBe(429)
    const retry = r.headers.get('Retry-After')
    expect(retry).toBeTruthy()
    expect(Number(retry)).toBeGreaterThan(0)
    // A 6ª request não gravou
    expect(mock.insertRows).toHaveLength(5)
  })

  it('IPs diferentes têm cotas de rate limit independentes', async () => {
    supabaseHolder.current = makeSupabase({
      insert: { data: { id: 'lead-any' }, error: null },
    })

    for (let i = 0; i < 5; i++) {
      await callPost(
        { nome: 'Ana', telefone: '48991642332' },
        { 'x-forwarded-for': '1.2.3.4' },
      )
    }
    const blocked = await callPost(
      { nome: 'Ana', telefone: '48991642332' },
      { 'x-forwarded-for': '1.2.3.4' },
    )
    expect(blocked.status).toBe(429)

    const other = await callPost(
      { nome: 'Ana', telefone: '48991642332' },
      { 'x-forwarded-for': '5.6.7.8' },
    )
    expect(other.status).toBe(201)
  })

  it('sem header de IP (unknown) o rate limit passa sempre — honeypot cobre', async () => {
    supabaseHolder.current = makeSupabase({
      insert: { data: { id: 'lead-noip' }, error: null },
    })

    for (let i = 0; i < 8; i++) {
      const { status } = await callPost({ nome: 'Ana', telefone: '48991642332' })
      expect(status).toBe(201)
    }
  })
})
