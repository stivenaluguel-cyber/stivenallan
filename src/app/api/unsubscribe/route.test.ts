import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { supabaseHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

import { GET, POST } from './route'
import { generateUnsubscribeToken } from '@/lib/leads/unsubscribe-token'

const LEAD = 'lead-uuid-1'

type MockConfig = {
  updateError?: { code?: string; message?: string } | null
}

function makeSupabase(cfg: MockConfig = {}) {
  const updates: Record<string, unknown>[] = []
  const filters: Array<{ op: string; args: unknown[] }> = []
  return {
    updates,
    filters,
    from(table: string) {
      if (table !== 'leads') throw new Error(`Unexpected table: ${table}`)
      return {
        update(row: Record<string, unknown>) {
          updates.push(row)
          return {
            eq(field: string, val: unknown) {
              filters.push({ op: 'eq', args: [field, val] })
              return {
                is(field2: string, val2: unknown) {
                  filters.push({ op: 'is', args: [field2, val2] })
                  return Promise.resolve({ error: cfg.updateError ?? null })
                },
              }
            },
          }
        },
      }
    },
  }
}

function makeReq({
  url,
  method = 'GET',
  contentType,
  body,
}: {
  url: string
  method?: 'GET' | 'POST'
  contentType?: string
  body?: string
}) {
  return {
    url,
    method,
    headers: new Headers(contentType ? { 'content-type': contentType } : {}),
    formData: async () => {
      const params = new URLSearchParams(body ?? '')
      return { get: (k: string) => params.get(k) } as unknown as FormData
    },
    json: async () => JSON.parse(body ?? '{}'),
  } as unknown as NextRequest
}

async function callHandler(
  handler: typeof GET,
  args: Parameters<typeof makeReq>[0],
): Promise<{ status: number; html: string; contentType: string | null }> {
  const req = makeReq(args)
  const res = await handler(req)
  const html = await res.text()
  return { status: res.status, html, contentType: res.headers.get('Content-Type') }
}

describe('POST/GET /api/unsubscribe', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    process.env.UNSUBSCRIBE_SECRET = 'test-secret-fixed'
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    delete process.env.UNSUBSCRIBE_SECRET
  })

  it('GET com token válido → 200 HTML "Descadastrado" + supabase update chamado', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock

    const token = generateUnsubscribeToken(LEAD)
    const { status, html, contentType } = await callHandler(GET, {
      url: `http://x/api/unsubscribe?lead_id=${LEAD}&token=${token}`,
    })

    expect(status).toBe(200)
    expect(contentType).toContain('text/html')
    expect(html).toContain('Descadastrado com sucesso')
    expect(mock.updates).toHaveLength(1)
    expect(mock.updates[0]).toHaveProperty('unsubscribed_at')
    // Filtros: eq('id', LEAD) + is('unsubscribed_at', null) — garante idempotência
    expect(mock.filters).toEqual([
      { op: 'eq', args: ['id', LEAD] },
      { op: 'is', args: ['unsubscribed_at', null] },
    ])
  })

  it('POST na query string funciona igual GET (RFC 8058)', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock
    const token = generateUnsubscribeToken(LEAD)

    const { status, html } = await callHandler(POST, {
      url: `http://x/api/unsubscribe?lead_id=${LEAD}&token=${token}`,
      method: 'POST',
    })

    expect(status).toBe(200)
    expect(html).toContain('Descadastrado')
    expect(mock.updates).toHaveLength(1)
  })

  it('POST com body form-urlencoded (Gmail one-click) funciona', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock
    const token = generateUnsubscribeToken(LEAD)

    const { status } = await callHandler(POST, {
      url: 'http://x/api/unsubscribe',
      method: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      body: `lead_id=${LEAD}&token=${token}`,
    })

    expect(status).toBe(200)
    expect(mock.updates).toHaveLength(1)
  })

  it('POST com body JSON também funciona', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock
    const token = generateUnsubscribeToken(LEAD)

    const { status } = await callHandler(POST, {
      url: 'http://x/api/unsubscribe',
      method: 'POST',
      contentType: 'application/json',
      body: JSON.stringify({ lead_id: LEAD, token }),
    })

    expect(status).toBe(200)
    expect(mock.updates).toHaveLength(1)
  })

  it('token inválido → 400 HTML "Link inválido" sem chamar Supabase', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock

    const { status, html } = await callHandler(GET, {
      url: `http://x/api/unsubscribe?lead_id=${LEAD}&token=${'a'.repeat(32)}`,
    })

    expect(status).toBe(400)
    expect(html).toContain('Link inválido')
    expect(mock.updates).toHaveLength(0)
  })

  it('lead_id ausente → 400 sem chamar Supabase', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock

    const { status } = await callHandler(GET, {
      url: 'http://x/api/unsubscribe?token=abc',
    })

    expect(status).toBe(400)
    expect(mock.updates).toHaveLength(0)
  })

  it('token ausente → 400 sem chamar Supabase', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock

    const { status } = await callHandler(GET, {
      url: `http://x/api/unsubscribe?lead_id=${LEAD}`,
    })

    expect(status).toBe(400)
    expect(mock.updates).toHaveLength(0)
  })

  it('envs Supabase ausentes → 503 (mesmo com token válido)', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    const mock = makeSupabase()
    supabaseHolder.current = mock

    const token = generateUnsubscribeToken(LEAD)
    const { status } = await callHandler(GET, {
      url: `http://x/api/unsubscribe?lead_id=${LEAD}&token=${token}`,
    })

    expect(status).toBe(503)
    expect(mock.updates).toHaveLength(0)
  })

  it('coluna unsubscribed_at ausente (0005 pendente) → 200 mesmo assim (compliance-safe)', async () => {
    const mock = makeSupabase({
      updateError: { code: 'PGRST204', message: 'column "unsubscribed_at" does not exist' },
    })
    supabaseHolder.current = mock

    const token = generateUnsubscribeToken(LEAD)
    const { status, html } = await callHandler(GET, {
      url: `http://x/api/unsubscribe?lead_id=${LEAD}&token=${token}`,
    })

    expect(status).toBe(200)
    expect(html).toContain('Descadastrado com sucesso')
  })

  it('erro genérico do Supabase (não missing-column) → 500', async () => {
    const mock = makeSupabase({
      updateError: { code: 'XYZ', message: 'connection refused' },
    })
    supabaseHolder.current = mock

    const token = generateUnsubscribeToken(LEAD)
    const { status, html } = await callHandler(GET, {
      url: `http://x/api/unsubscribe?lead_id=${LEAD}&token=${token}`,
    })

    expect(status).toBe(500)
    expect(html).toContain('Link inválido') // Página genérica de erro
  })
})
