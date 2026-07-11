import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { supabaseHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

import { GET, POST } from './route'

type Candidate = { id: string; nome: string | null; whatsapp: string | null }

type MockConfig = {
  selectData?: Candidate[] | null
  selectError?: { message: string } | null
  leadsDeleteError?: { message: string } | null
}

function makeSupabase(cfg: MockConfig = {}) {
  const deletes: Array<{ table: string; filters: Array<[string, unknown]> }> = []
  return {
    deletes,
    from(table: string) {
      return {
        select() {
          return {
            or() {
              return {
                limit: async () => ({ data: cfg.selectData ?? [], error: cfg.selectError ?? null }),
              }
            },
          }
        },
        delete() {
          const entry = { table, filters: [] as Array<[string, unknown]> }
          deletes.push(entry)
          return {
            eq: async (field: string, val: unknown) => {
              entry.filters.push([field, val])
              if (table === 'leads') return { error: cfg.leadsDeleteError ?? null }
              return { error: null }
            },
          }
        },
      }
    },
  }
}

function makeReq(url: string, headers: Record<string, string> = {}): NextRequest {
  return { url, headers: new Headers(headers) } as unknown as NextRequest
}

describe('GET/POST /api/cron/leads-retention', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'cron-secret'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    delete process.env.CRON_SECRET
  })

  describe('GET (dry-run only)', () => {
    it('401 sem Bearer', async () => {
      const res = await GET(makeReq('http://x/api/cron/leads-retention'))
      expect(res.status).toBe(401)
    })

    it('401 com Bearer errado', async () => {
      const res = await GET(makeReq('http://x/api/cron/leads-retention', { authorization: 'Bearer errado' }))
      expect(res.status).toBe(401)
    })

    it('503 sem envs do Supabase', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      const res = await GET(makeReq('http://x/api/cron/leads-retention', { authorization: 'Bearer cron-secret' }))
      expect(res.status).toBe(503)
    })

    it('200 retorna dry_run:true + candidatos, sem apagar nada', async () => {
      const mock = makeSupabase({
        selectData: [{ id: 'l1', nome: 'Ana', whatsapp: '48999' }],
      })
      supabaseHolder.current = mock

      const res = await GET(makeReq('http://x/api/cron/leads-retention', { authorization: 'Bearer cron-secret' }))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.dry_run).toBe(true)
      expect(json.count).toBe(1)
      expect(json.leads).toEqual([{ id: 'l1', nome: 'Ana', whatsapp: '48999' }])
      expect(mock.deletes).toHaveLength(0)
    })

    it('500 quando a query falha', async () => {
      const mock = makeSupabase({ selectError: { message: 'db down' } })
      supabaseHolder.current = mock

      const res = await GET(makeReq('http://x/api/cron/leads-retention', { authorization: 'Bearer cron-secret' }))
      expect(res.status).toBe(500)
    })
  })

  describe('POST', () => {
    it('401 sem Bearer', async () => {
      const res = await POST(makeReq('http://x/api/cron/leads-retention'))
      expect(res.status).toBe(401)
    })

    it('sem ?confirm=true → também roda em dry-run, sem apagar nada', async () => {
      const mock = makeSupabase({
        selectData: [{ id: 'l1', nome: 'Ana', whatsapp: '48999' }],
      })
      supabaseHolder.current = mock

      const res = await POST(makeReq('http://x/api/cron/leads-retention', { authorization: 'Bearer cron-secret' }))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.dry_run).toBe(true)
      expect(json.count).toBe(1)
      expect(mock.deletes).toHaveLength(0)
    })

    it('com ?confirm=true → apaga filhos + lead de cada candidato', async () => {
      const mock = makeSupabase({
        selectData: [
          { id: 'l1', nome: 'Ana', whatsapp: '48999' },
          { id: 'l2', nome: 'Bruno', whatsapp: '48988' },
        ],
      })
      supabaseHolder.current = mock

      const res = await POST(
        makeReq('http://x/api/cron/leads-retention?confirm=true', { authorization: 'Bearer cron-secret' }),
      )
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.dry_run).toBe(false)
      expect(json.candidatos).toBe(2)
      expect(json.deleted).toBe(2)
      expect(json.failed_ids).toEqual([])
      // 2 candidatos × 3 tabelas (lead_eventos, leads_interacoes, leads) = 6 deletes
      expect(mock.deletes).toHaveLength(6)
      expect(mock.deletes.map((d) => d.table)).toEqual([
        'lead_eventos', 'leads_interacoes', 'leads',
        'lead_eventos', 'leads_interacoes', 'leads',
      ])
    })

    it('com ?confirm=true e nenhum candidato → deleted:0, sem chamar delete', async () => {
      const mock = makeSupabase({ selectData: [] })
      supabaseHolder.current = mock

      const res = await POST(
        makeReq('http://x/api/cron/leads-retention?confirm=true', { authorization: 'Bearer cron-secret' }),
      )
      const json = await res.json()

      expect(json.candidatos).toBe(0)
      expect(json.deleted).toBe(0)
      expect(mock.deletes).toHaveLength(0)
    })

    it('com ?confirm=true e falha ao apagar um lead → registra em failed_ids', async () => {
      const mock = makeSupabase({
        selectData: [{ id: 'l1', nome: 'Ana', whatsapp: '48999' }],
        leadsDeleteError: { message: 'fk violation' },
      })
      supabaseHolder.current = mock

      const res = await POST(
        makeReq('http://x/api/cron/leads-retention?confirm=true', { authorization: 'Bearer cron-secret' }),
      )
      const json = await res.json()

      expect(json.deleted).toBe(0)
      expect(json.failed_ids).toEqual(['l1'])
    })

    it('503 sem envs do Supabase', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      const res = await POST(
        makeReq('http://x/api/cron/leads-retention?confirm=true', { authorization: 'Bearer cron-secret' }),
      )
      expect(res.status).toBe(503)
    })

    it('500 quando a query de candidatos falha', async () => {
      const mock = makeSupabase({ selectError: { message: 'db down' } })
      supabaseHolder.current = mock

      const res = await POST(
        makeReq('http://x/api/cron/leads-retention?confirm=true', { authorization: 'Bearer cron-secret' }),
      )
      expect(res.status).toBe(500)
    })
  })
})
