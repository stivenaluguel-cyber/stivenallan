import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { supabaseHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

import { POST } from './route'
import { generateDeleteToken } from '@/lib/leads/delete-token'
import { generateUnsubscribeToken } from '@/lib/leads/unsubscribe-token'

const LEAD = 'lead-uuid-1'

type MockConfig = {
  leadsDeleteError?: { code?: string; message?: string } | null
}

function makeSupabase(cfg: MockConfig = {}) {
  const deletes: Array<{ table: string; filters: Array<[string, unknown]> }> = []
  return {
    deletes,
    from(table: string) {
      if (!['lead_eventos', 'leads_interacoes', 'leads'].includes(table)) {
        throw new Error(`Unexpected table: ${table}`)
      }
      return {
        delete() {
          const entry: { table: string; filters: Array<[string, unknown]> } = { table, filters: [] }
          deletes.push(entry)
          const chain = {
            eq(field: string, val: unknown) {
              entry.filters.push([field, val])
              if (table === 'leads') {
                return Promise.resolve({ error: cfg.leadsDeleteError ?? null })
              }
              return Promise.resolve({ error: null })
            },
          }
          return chain
        },
      }
    },
  }
}

function makeReq({
  url,
  contentType,
  body,
}: {
  url: string
  contentType?: string
  body?: string
}): NextRequest {
  return {
    url,
    method: 'POST',
    headers: new Headers(contentType ? { 'content-type': contentType } : {}),
    formData: async () => {
      const params = new URLSearchParams(body ?? '')
      return { get: (k: string) => params.get(k) } as unknown as FormData
    },
    json: async () => JSON.parse(body ?? '{}'),
  } as unknown as NextRequest
}

async function callPost(
  id: string,
  args: Parameters<typeof makeReq>[0],
): Promise<{ status: number; html: string }> {
  const req = makeReq(args)
  const res = await POST(req, { params: Promise.resolve({ id }) })
  const html = await res.text()
  return { status: res.status, html }
}

describe('POST /api/leads/[id]/delete', () => {
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

  it('token válido na query → 200 "Dados excluídos" + apaga filhos antes do lead', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock
    const token = generateDeleteToken(LEAD)

    const { status, html } = await callPost(LEAD, {
      url: `http://x/api/leads/${LEAD}/delete?token=${token}`,
    })

    expect(status).toBe(200)
    expect(html).toContain('Dados excluídos')
    expect(mock.deletes.map((d) => d.table)).toEqual(['lead_eventos', 'leads_interacoes', 'leads'])
    expect(mock.deletes[2].filters).toEqual([['id', LEAD]])
  })

  it('token válido no body JSON também funciona', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock
    const token = generateDeleteToken(LEAD)

    const { status } = await callPost(LEAD, {
      url: `http://x/api/leads/${LEAD}/delete`,
      contentType: 'application/json',
      body: JSON.stringify({ token }),
    })

    expect(status).toBe(200)
    expect(mock.deletes).toHaveLength(3)
  })

  it('token válido no body form-urlencoded também funciona', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock
    const token = generateDeleteToken(LEAD)

    const { status } = await callPost(LEAD, {
      url: `http://x/api/leads/${LEAD}/delete`,
      contentType: 'application/x-www-form-urlencoded',
      body: `token=${token}`,
    })

    expect(status).toBe(200)
    expect(mock.deletes).toHaveLength(3)
  })

  it('token inválido (forjado) → 400 sem apagar nada', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock

    const { status, html } = await callPost(LEAD, {
      url: `http://x/api/leads/${LEAD}/delete?token=${'a'.repeat(32)}`,
    })

    expect(status).toBe(400)
    expect(html).toContain('Link inválido')
    expect(mock.deletes).toHaveLength(0)
  })

  it('SEGURANÇA: token de unsubscribe do mesmo lead não funciona aqui → 400', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock
    const unsubToken = generateUnsubscribeToken(LEAD)

    const { status } = await callPost(LEAD, {
      url: `http://x/api/leads/${LEAD}/delete?token=${unsubToken}`,
    })

    expect(status).toBe(400)
    expect(mock.deletes).toHaveLength(0)
  })

  it('token ausente → 400 sem chamar Supabase', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock

    const { status } = await callPost(LEAD, {
      url: `http://x/api/leads/${LEAD}/delete`,
    })

    expect(status).toBe(400)
    expect(mock.deletes).toHaveLength(0)
  })

  it('envs Supabase ausentes → 503 mesmo com token válido', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    const mock = makeSupabase()
    supabaseHolder.current = mock
    const token = generateDeleteToken(LEAD)

    const { status } = await callPost(LEAD, {
      url: `http://x/api/leads/${LEAD}/delete?token=${token}`,
    })

    expect(status).toBe(503)
    expect(mock.deletes).toHaveLength(0)
  })

  it('erro do Supabase ao apagar o lead → 500', async () => {
    const mock = makeSupabase({ leadsDeleteError: { code: 'XYZ', message: 'connection refused' } })
    supabaseHolder.current = mock
    const token = generateDeleteToken(LEAD)

    const { status } = await callPost(LEAD, {
      url: `http://x/api/leads/${LEAD}/delete?token=${token}`,
    })

    expect(status).toBe(500)
  })
})
