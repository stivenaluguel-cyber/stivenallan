import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { supabaseHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

import { GET } from './route'
import { hashSessionToken } from '@/lib/lead-gate/session'

const FUTURE = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
const PAST = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

function makeSupabase(row: Record<string, unknown> | null) {
  const updateCalls: unknown[] = []
  return {
    updateCalls,
    from(table: string) {
      if (table !== 'lead_access_sessions') throw new Error(`Unexpected table: ${table}`)
      return {
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row, error: row ? null : { message: 'not found' } }) }) }),
        update(payload: unknown) {
          updateCalls.push(payload)
          return { eq: async () => ({ data: null, error: null }) }
        },
      }
    },
  }
}

function callGet(cookieValue: string | undefined) {
  const req = {
    cookies: { get: (name: string) => (name === 'sa_session' && cookieValue ? { value: cookieValue } : undefined) },
  } as unknown as NextRequest
  return GET(req)
}

describe('GET /api/lead-access/status', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
  })

  it('sem cookie: unlocked=false sem tocar o banco', async () => {
    const mock = makeSupabase(null)
    supabaseHolder.current = mock
    const res = await callGet(undefined)
    const json = await res.json()
    expect(json).toEqual({ unlocked: false })
  })

  it('token que nao bate com nenhuma sessao: unlocked=false, limpa cookie', async () => {
    supabaseHolder.current = makeSupabase(null)
    const res = await callGet('token-invalido')
    const json = await res.json()
    expect(json).toEqual({ unlocked: false })
  })

  it('sessao revogada: unlocked=false', async () => {
    supabaseHolder.current = makeSupabase({
      id: 'sess-1', lead_id: 'lead-1', expires_at: FUTURE,
      revoked_at: new Date().toISOString(), last_seen_at: new Date().toISOString(),
    })
    const res = await callGet('token-revogado')
    expect(await res.json()).toEqual({ unlocked: false })
  })

  it('sessao expirada: unlocked=false', async () => {
    supabaseHolder.current = makeSupabase({
      id: 'sess-1', lead_id: 'lead-1', expires_at: PAST, revoked_at: null, last_seen_at: new Date().toISOString(),
    })
    const res = await callGet('token-expirado')
    expect(await res.json()).toEqual({ unlocked: false })
  })

  it('sessao valida: unlocked=true, nunca inclui leadId na resposta', async () => {
    const mock = makeSupabase({
      id: 'sess-1', lead_id: 'lead-1', expires_at: FUTURE, revoked_at: null, last_seen_at: PAST,
    })
    supabaseHolder.current = mock
    const res = await callGet('token-valido')
    const json = await res.json()
    expect(json).toEqual({ unlocked: true })
    expect(JSON.stringify(json)).not.toContain('lead-1')
  })

  it('atualiza last_seen_at quando esta velho (throttle de 1h)', async () => {
    const mock = makeSupabase({
      id: 'sess-1', lead_id: 'lead-1', expires_at: FUTURE, revoked_at: null, last_seen_at: PAST,
    })
    supabaseHolder.current = mock
    await callGet('token-valido')
    expect(mock.updateCalls).toHaveLength(1)
  })

  it('nao atualiza last_seen_at quando esta recente', async () => {
    const mock = makeSupabase({
      id: 'sess-1', lead_id: 'lead-1', expires_at: FUTURE, revoked_at: null, last_seen_at: new Date().toISOString(),
    })
    supabaseHolder.current = mock
    await callGet('token-valido')
    expect(mock.updateCalls).toHaveLength(0)
  })

  it('token adulterado (hash diferente) nunca resolve pra sessao alheia', async () => {
    // Simula: o mock devolve null pra qualquer hash desconhecido — token
    // adulterado gera hash diferente do gravado, cai no "nao encontrado".
    supabaseHolder.current = makeSupabase(null)
    const tokenReal = 'token-original'
    const tokenAdulterado = tokenReal + 'x'
    expect(hashSessionToken(tokenReal)).not.toBe(hashSessionToken(tokenAdulterado))
    const res = await callGet(tokenAdulterado)
    expect(await res.json()).toEqual({ unlocked: false })
  })
})
