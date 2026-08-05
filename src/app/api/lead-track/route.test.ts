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

const FUTURE = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()

type MockConfig = {
  session?: Record<string, unknown> | null
  property?: { id: string } | null
}

function makeSupabase(cfg: MockConfig = {}) {
  const rpcCalls: { fn: string; args: unknown }[] = []
  const inserts: { table: string; payload: unknown }[] = []
  return {
    rpcCalls,
    inserts,
    from(table: string) {
      if (table === 'lead_access_sessions') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: cfg.session ?? null, error: cfg.session ? null : { message: 'not found' } }) }) }) }
      }
      if (table === 'properties') {
        return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: cfg.property ?? null }) }) }) }) }
      }
      if (table === 'lead_eventos') {
        return { upsert(payload: unknown) { inserts.push({ table, payload }); return Promise.resolve({ data: null, error: null }) } }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
    rpc(fn: string, args: unknown) {
      rpcCalls.push({ fn, args })
      return Promise.resolve({ data: null, error: null })
    },
  }
}

const VALID_SESSION = { id: 'sess-1', lead_id: 'lead-1', expires_at: FUTURE, revoked_at: null, last_seen_at: new Date().toISOString() }
const VALID_BODY = { propertyId: 'prop-1', propertySlug: 'parco-savello-santa-barbara-criciuma-sc', eventType: 'gallery_view' }

async function callPost(body: unknown, cookieValue: string | undefined, headers: Record<string, string> = {}) {
  const req = {
    json: async () => body,
    headers: new Headers(headers),
    cookies: { get: (name: string) => (name === 'sa_session' && cookieValue ? { value: cookieValue } : undefined) },
  } as unknown as NextRequest
  const res = await POST(req)
  const json = await res.json()
  return { status: res.status, json }
}

describe('POST /api/lead-track', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    resetRateLimit()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
  })

  it('401 sem cookie de sessao, sem tocar o banco', async () => {
    const mock = makeSupabase({ session: VALID_SESSION, property: { id: 'prop-1' } })
    supabaseHolder.current = mock
    const { status } = await callPost(VALID_BODY, undefined)
    expect(status).toBe(401)
    expect(mock.rpcCalls).toHaveLength(0)
  })

  it('401 com sessao invalida/expirada', async () => {
    supabaseHolder.current = makeSupabase({ session: null })
    const { status } = await callPost(VALID_BODY, 'token-qualquer')
    expect(status).toBe(401)
  })

  it('400 com eventType fora da lista permitida', async () => {
    supabaseHolder.current = makeSupabase({ session: VALID_SESSION, property: { id: 'prop-1' } })
    const { status } = await callPost({ ...VALID_BODY, eventType: 'inventado' }, 'token-valido')
    expect(status).toBe(400)
  })

  it('400 quando property_id nao bate com o slug', async () => {
    supabaseHolder.current = makeSupabase({ session: VALID_SESSION, property: null })
    const { status } = await callPost(VALID_BODY, 'token-valido')
    expect(status).toBe(400)
  })

  it('200 registrado: chama record_property_interest com o leadId da SESSAO, nunca do body', async () => {
    const mock = makeSupabase({ session: VALID_SESSION, property: { id: 'prop-1' } })
    supabaseHolder.current = mock
    const { status, json } = await callPost({ ...VALID_BODY, leadId: 'lead-forjado-pelo-cliente' }, 'token-valido')
    expect(status).toBe(200)
    expect(json).toEqual({ recorded: true })

    const call = mock.rpcCalls.find((c) => c.fn === 'record_property_interest')!
    expect((call.args as Record<string, unknown>).p_lead_id).toBe('lead-1')
  })

  it("mapeia eventType 'view' pro tipo 'visita' na timeline (compatibilidade com VisitTracker)", async () => {
    const mock = makeSupabase({ session: VALID_SESSION, property: { id: 'prop-1' } })
    supabaseHolder.current = mock
    await callPost({ ...VALID_BODY, eventType: 'view' }, 'token-valido')
    const evento = mock.inserts.find((i) => i.table === 'lead_eventos')!
    expect((evento.payload as Record<string, unknown>).tipo).toBe('visita')
  })

  it('outros eventTypes usam o proprio nome como tipo na timeline', async () => {
    const mock = makeSupabase({ session: VALID_SESSION, property: { id: 'prop-1' } })
    supabaseHolder.current = mock
    await callPost({ ...VALID_BODY, eventType: 'catalog_download' }, 'token-valido')
    const evento = mock.inserts.find((i) => i.table === 'lead_eventos')!
    expect((evento.payload as Record<string, unknown>).tipo).toBe('catalog_download')
  })

  it('429 apos 30 tentativas do mesmo IP', async () => {
    supabaseHolder.current = makeSupabase({ session: VALID_SESSION, property: { id: 'prop-1' } })
    for (let i = 0; i < 30; i++) {
      const { status } = await callPost(VALID_BODY, 'token-valido', { 'x-forwarded-for': '1.2.3.4' })
      expect(status).toBe(200)
    }
    const { status } = await callPost(VALID_BODY, 'token-valido', { 'x-forwarded-for': '1.2.3.4' })
    expect(status).toBe(429)
  })
})
