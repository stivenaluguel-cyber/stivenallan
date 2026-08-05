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
  property?: { id: string; nome: string } | null
  rpcResolve?: { data: unknown; error: { message: string } | null }
  sessionInsertError?: { message: string } | null
}

function makeSupabase(cfg: MockConfig = {}) {
  const inserts: { table: string; payload: unknown }[] = []
  const rpcCalls: { fn: string; args: unknown }[] = []
  return {
    inserts,
    rpcCalls,
    from(table: string) {
      if (table === 'properties') {
        return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: cfg.property ?? null }) }) }) }) }
      }
      if (table === 'lead_access_sessions') {
        return {
          insert(payload: unknown) {
            inserts.push({ table, payload })
            return Promise.resolve({ data: null, error: cfg.sessionInsertError ?? null })
          },
        }
      }
      if (table === 'lead_eventos') {
        return { upsert(payload: unknown) { inserts.push({ table, payload }); return Promise.resolve({ data: null, error: null }) } }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
    rpc(fn: string, args: unknown) {
      rpcCalls.push({ fn, args })
      if (fn === 'resolve_lead_for_gate') {
        return Promise.resolve(cfg.rpcResolve ?? { data: { leadId: 'lead-1', created: true, conflito: false }, error: null })
      }
      if (fn === 'record_property_interest') {
        return Promise.resolve({ data: null, error: null })
      }
      throw new Error(`Unexpected rpc: ${fn}`)
    },
  }
}

const VALID_BODY = {
  nome: 'Ana Maria',
  whatsapp: '48991642332',
  email: 'ana@example.com',
  faixaInvestimento: 'R$ 900 mil a R$ 1,2 milhão',
  prazoCompra: '3 a 6 meses',
  entradaDisponivel: '20% a 29%',
  propertyId: 'prop-1',
  propertySlug: 'parco-savello-santa-barbara-criciuma-sc',
  consentimento: true,
}

async function callPost(body: unknown, headers: Record<string, string> = {}) {
  const req = { json: async () => body, headers: new Headers(headers) } as unknown as NextRequest
  const res = await POST(req)
  const json = (await res.json()) as { unlocked?: boolean; error?: string }
  return { status: res.status, json, res }
}

describe('POST /api/lead-gate/unlock', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    process.env.LEAD_GATE_ENABLED = 'true'
    process.env.LEAD_GATE_SLUGS = 'parco-savello-santa-barbara-criciuma-sc'
    resetRateLimit()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.unstubAllEnvs()
  })

  it('404 quando o gate nao esta habilitado pro slug', async () => {
    process.env.LEAD_GATE_SLUGS = 'outro-slug'
    supabaseHolder.current = makeSupabase({ property: { id: 'prop-1', nome: 'Parco Savello' } })
    const { status } = await callPost(VALID_BODY)
    expect(status).toBe(404)
  })

  it('400 quando falta campo obrigatorio (nunca return silencioso)', async () => {
    supabaseHolder.current = makeSupabase()
    const { status, json } = await callPost({ ...VALID_BODY, email: '' })
    expect(status).toBe(400)
    expect(json.error).toMatch(/e-mail/i)
  })

  it('400 quando consentimento nao foi marcado', async () => {
    supabaseHolder.current = makeSupabase()
    const { status, json } = await callPost({ ...VALID_BODY, consentimento: false })
    expect(status).toBe(400)
    expect(json.error).toMatch(/concordar/i)
  })

  it('400 com honeypot preenchido, sem chamar supabase', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock
    const { status } = await callPost({ ...VALID_BODY, hp_url: 'spam' })
    expect(status).toBe(400)
    expect(mock.rpcCalls).toHaveLength(0)
  })

  it('400 quando property_id nao bate com o slug', async () => {
    supabaseHolder.current = makeSupabase({ property: null })
    const { status } = await callPost(VALID_BODY)
    expect(status).toBe(400)
  })

  it('201 com { unlocked: true } e seta cookie HttpOnly no sucesso (lead novo)', async () => {
    supabaseHolder.current = makeSupabase({ property: { id: 'prop-1', nome: 'Parco Savello' } })
    const { status, json, res } = await callPost(VALID_BODY)
    expect(status).toBe(201)
    expect(json).toEqual({ unlocked: true })

    const cookie = res.cookies.get('sa_session')
    expect(cookie?.value).toBeTruthy()
  })

  it('201 com o MESMO shape para lead existente (anti-enumeracao)', async () => {
    supabaseHolder.current = makeSupabase({
      property: { id: 'prop-1', nome: 'Parco Savello' },
      rpcResolve: { data: { leadId: 'lead-existente', created: false, conflito: false }, error: null },
    })
    const { status, json } = await callPost(VALID_BODY)
    expect(status).toBe(201)
    expect(json).toEqual({ unlocked: true })
  })

  it('201 com o MESMO shape mesmo em conflito de identidade (nunca vaza conflito)', async () => {
    supabaseHolder.current = makeSupabase({
      property: { id: 'prop-1', nome: 'Parco Savello' },
      rpcResolve: { data: { leadId: 'lead-do-telefone', created: false, conflito: true }, error: null },
    })
    const { status, json } = await callPost(VALID_BODY)
    expect(status).toBe(201)
    expect(json).toEqual({ unlocked: true })
    expect(JSON.stringify(json)).not.toMatch(/conflit/i)
  })

  it('grava lead_property_interests (unlock) e lead_eventos no sucesso', async () => {
    const mock = makeSupabase({ property: { id: 'prop-1', nome: 'Parco Savello' } })
    supabaseHolder.current = mock
    await callPost(VALID_BODY)

    const rpc = mock.rpcCalls.find((c) => c.fn === 'record_property_interest')
    expect(rpc).toBeTruthy()
    expect((rpc!.args as Record<string, unknown>).p_event_type).toBe('unlock')

    const evento = mock.inserts.find((i) => i.table === 'lead_eventos')
    expect(evento).toBeTruthy()
    expect((evento!.payload as Record<string, unknown>).tipo).toBe('unlock')
  })

  it('500 quando resolve_lead_for_gate falha', async () => {
    supabaseHolder.current = makeSupabase({
      property: { id: 'prop-1', nome: 'Parco Savello' },
      rpcResolve: { data: null, error: { message: 'db indisponivel' } },
    })
    const { status } = await callPost(VALID_BODY)
    expect(status).toBe(500)
  })

  it('500 quando a criacao da sessao falha', async () => {
    supabaseHolder.current = makeSupabase({
      property: { id: 'prop-1', nome: 'Parco Savello' },
      sessionInsertError: { message: 'insert falhou' },
    })
    const { status } = await callPost(VALID_BODY)
    expect(status).toBe(500)
  })

  it('429 apos 5 tentativas do mesmo IP', async () => {
    supabaseHolder.current = makeSupabase({ property: { id: 'prop-1', nome: 'Parco Savello' } })
    for (let i = 0; i < 5; i++) {
      const { status } = await callPost(VALID_BODY, { 'x-forwarded-for': '1.2.3.4' })
      expect(status).toBe(201)
    }
    const { status } = await callPost(VALID_BODY, { 'x-forwarded-for': '1.2.3.4' })
    expect(status).toBe(429)
  })
})
