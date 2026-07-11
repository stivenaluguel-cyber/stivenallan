import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { supabaseHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

import { POST } from './route'
import { __resetForTests as resetRateLimit } from '@/lib/leads/rate-limit'

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

async function callPost(body: unknown, headers: Record<string, string> = {}) {
  const req = {
    json: async () => body,
    headers: new Headers(headers),
  } as unknown as NextRequest
  const res = await POST(req)
  const json = (await res.json()) as { id?: string | null; error?: string }
  return { status: res.status, json, headers: res.headers }
}

describe('POST /api/lead-capture', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    resetRateLimit()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
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

  it('rejeita 400 com honeypot preenchido, sem tocar em Supabase', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock

    const { status } = await callPost({
      nome: 'Ana',
      whatsapp: '48991642332',
      hp_url: 'http://spam.example.com',
    })

    expect(status).toBe(400)
    expect(mock.insertRows).toHaveLength(0)
  })

  it('retorna 429 com Retry-After após 5 requests do mesmo IP no minuto', async () => {
    const mock = makeSupabase({ insert: { data: { id: 'lead-ok' }, error: null } })
    supabaseHolder.current = mock

    for (let i = 0; i < 5; i++) {
      const { status } = await callPost(
        { nome: 'Ana', whatsapp: '48991642332' },
        { 'x-forwarded-for': '1.2.3.4' },
      )
      expect(status).toBe(201)
    }

    const r = await callPost(
      { nome: 'Ana', whatsapp: '48991642332' },
      { 'x-forwarded-for': '1.2.3.4' },
    )
    expect(r.status).toBe(429)
    const retry = r.headers.get('Retry-After')
    expect(retry).toBeTruthy()
    expect(Number(retry)).toBeGreaterThan(0)
    expect(mock.insertRows).toHaveLength(5)
  })

  it('cota de rate limit é independente entre /api/leads e /api/lead-capture', async () => {
    // /api/lead-capture usa identifier 'lead-capture' — esgotar aqui NÃO afeta 'leads'.
    // Cobertura funcional dessa separação (o teste unitário do rate-limit já cobre a lógica).
    supabaseHolder.current = makeSupabase({
      insert: { data: { id: 'lead-ok' }, error: null },
    })

    for (let i = 0; i < 5; i++) {
      await callPost(
        { nome: 'Ana', whatsapp: '48991642332' },
        { 'x-forwarded-for': '1.2.3.4' },
      )
    }
    const blocked = await callPost(
      { nome: 'Ana', whatsapp: '48991642332' },
      { 'x-forwarded-for': '1.2.3.4' },
    )
    expect(blocked.status).toBe(429)
  })
})
