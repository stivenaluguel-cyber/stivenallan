import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

import { GET } from './route'

function makeSupabase(rows: Record<string, unknown>[], error: { message: string } | null = null) {
  return {
    from(table: string) {
      if (table !== 'lead_property_interests') throw new Error(`Unexpected table: ${table}`)
      return { select: () => ({ eq: () => ({ order: async () => ({ data: error ? null : rows, error }) }) }) }
    },
  }
}

function callGet(id: string) {
  const req = {} as unknown as NextRequest
  return GET(req, { params: Promise.resolve({ id }) })
}

describe('GET /api/admin/leads/[id]/interesses', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    process.env.JWT_SECRET = 'segredo-de-teste-com-32-caracteres-minimos'
    cookieHolder.logado = true
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
  })

  it('401 sem admin autenticado, sem tocar o banco', async () => {
    cookieHolder.logado = false
    supabaseHolder.current = makeSupabase([])
    const res = await callGet('lead-1')
    expect(res.status).toBe(401)
  })

  it('lista interesses ordenados, com nome do empreendimento resolvido via join', async () => {
    supabaseHolder.current = makeSupabase([
      {
        property_id: 'p2', property_slug: 'parco-savello', first_seen_at: '2026-08-04T10:00:00Z',
        last_seen_at: '2026-08-04T14:32:00Z', view_count: 1, unlocked_at: '2026-08-04T10:00:00Z',
        whatsapp_clicked_at: null, catalog_downloaded_at: null, floorplan_viewed_at: null,
        gallery_viewed_at: null, availability_viewed_at: null, source: null, utm_source: null, utm_campaign: null,
        properties: { nome: 'Parco Savello Residencial' },
      },
      {
        property_id: 'p1', property_slug: 'monte-leone', first_seen_at: '2026-07-12T09:00:00Z',
        last_seen_at: '2026-07-20T09:00:00Z', view_count: 3, unlocked_at: null,
        whatsapp_clicked_at: null, catalog_downloaded_at: '2026-07-20T09:00:00Z', floorplan_viewed_at: null,
        gallery_viewed_at: '2026-07-15T09:00:00Z', availability_viewed_at: null, source: null, utm_source: null, utm_campaign: null,
        properties: { nome: 'Monte Leone Residencial' },
      },
    ])
    const res = await callGet('lead-1')
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.interesses).toHaveLength(2)
    expect(json.interesses[0].property_nome).toBe('Parco Savello Residencial')
    expect(json.interesses[0]).not.toHaveProperty('properties')
    expect(json.interesses[1].property_nome).toBe('Monte Leone Residencial')
    expect(json.interesses[1].view_count).toBe(3)
    expect(json.interesses[1].catalog_downloaded_at).toBe('2026-07-20T09:00:00Z')
  })

  it('array vazio quando o lead nao tem interesses registrados', async () => {
    supabaseHolder.current = makeSupabase([])
    const res = await callGet('lead-sem-interesse')
    const json = await res.json()
    expect(json).toEqual({ interesses: [] })
  })

  it('500 quando a consulta falha', async () => {
    supabaseHolder.current = makeSupabase([], { message: 'db indisponivel' })
    const res = await callGet('lead-1')
    expect(res.status).toBe(500)
  })
})
