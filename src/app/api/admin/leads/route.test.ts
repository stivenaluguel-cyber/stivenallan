import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { supabaseHolder, requireAdminHolder, getSupabaseAdminMock } = vi.hoisted(() => {
  const supabaseHolder = { current: null as unknown as ReturnType<typeof makeSupabase> | null }
  const requireAdminHolder = { current: async () => 'admin-1' as string | null }
  const getSupabaseAdminMock = vi.fn(() => supabaseHolder.current)
  return { supabaseHolder, requireAdminHolder, getSupabaseAdminMock }
})

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: getSupabaseAdminMock,
}))

vi.mock('@/lib/dashboard/admin-auth', () => ({
  requireAdmin: () => requireAdminHolder.current(),
}))

import { GET, POST } from './route'

type Lead = { id: string; nome: string }

function makeSupabase(cfg: {
  leads?: Lead[]
  eventos?: { lead_id: string; tipo: string }[]
  interesses?: { lead_id: string; property_id: string; last_seen_at: string; properties: { nome: string; slug: string } | null }[]
}) {
  const eqCalls: [string, unknown][] = []
  return {
    eqCalls,
    from(table: string) {
      if (table === 'leads') {
        return {
          select: () => ({
            order: () => {
              // Builder encadeável e "thenable" em qualquer ponto — espelha o
              // query builder real do postgrest-js, onde `.eq()` pode ser
              // chamado 0, 1 ou 2x (status, empreendimento_interesse) antes
              // do `await query` final em route.ts.
              const b = {
                eq(col: string, val: unknown) {
                  eqCalls.push([col, val])
                  return b
                },
                then(resolve: (v: { data: Lead[]; error: null }) => void) {
                  resolve({ data: cfg.leads ?? [], error: null })
                },
              }
              return b
            },
          }),
        }
      }
      if (table === 'lead_eventos') {
        return { select: () => Promise.resolve({ data: cfg.eventos ?? [], error: null }) }
      }
      if (table === 'lead_property_interests') {
        return { select: () => Promise.resolve({ data: cfg.interesses ?? [], error: null }) }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
  }
}

function makeReq(url = 'http://test/api/admin/leads') {
  return { url } as unknown as NextRequest
}

function makePostReq(body: unknown, url = 'http://test/api/admin/leads') {
  return { url, json: async () => body } as unknown as NextRequest
}

describe('GET /api/admin/leads', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    supabaseHolder.current = null
    requireAdminHolder.current = async () => 'admin-1'
    getSupabaseAdminMock.mockClear()
  })

  it('Item 8: sem sessao admin, GET retorna 401 e nunca chama getSupabaseAdmin()', async () => {
    requireAdminHolder.current = async () => null
    const res = await GET(makeReq())
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
    expect(getSupabaseAdminMock).not.toHaveBeenCalled()
  })

  it('503 quando o supabase admin nao esta configurado', async () => {
    supabaseHolder.current = null
    const res = await GET(makeReq())
    expect(res.status).toBe(503)
  })

  it('mantem visitas/downloads existentes (agregado de lead_eventos)', async () => {
    supabaseHolder.current = makeSupabase({
      leads: [{ id: 'lead-1', nome: 'Ana' }],
      eventos: [
        { lead_id: 'lead-1', tipo: 'visita' },
        { lead_id: 'lead-1', tipo: 'visita' },
        { lead_id: 'lead-1', tipo: 'download' },
      ],
    })
    const res = await GET(makeReq())
    const json = await res.json()
    expect(json[0]).toMatchObject({ visitas: 2, downloads: 1 })
  })

  it('adiciona interesses_count e ultimo_interesse (chip do Kanban)', async () => {
    supabaseHolder.current = makeSupabase({
      leads: [{ id: 'lead-1', nome: 'Ana' }],
      interesses: [
        { lead_id: 'lead-1', property_id: 'p1', last_seen_at: '2026-08-01T10:00:00Z', properties: { nome: 'Monte Leone', slug: 'monte-leone' } },
        { lead_id: 'lead-1', property_id: 'p2', last_seen_at: '2026-08-04T14:32:00Z', properties: { nome: 'Parco Savello', slug: 'parco-savello' } },
      ],
    })
    const res = await GET(makeReq())
    const json = await res.json()
    expect(json[0].interesses_count).toBe(2)
    expect(json[0].ultimo_interesse).toEqual({ nome: 'Parco Savello', slug: 'parco-savello', em: '2026-08-04T14:32:00Z' })
  })

  it('interesses_count=0 e ultimo_interesse=null quando o lead nao tem nenhum', async () => {
    supabaseHolder.current = makeSupabase({ leads: [{ id: 'lead-1', nome: 'Ana' }] })
    const res = await GET(makeReq())
    const json = await res.json()
    expect(json[0].interesses_count).toBe(0)
    expect(json[0].ultimo_interesse).toBeNull()
  })

  it('leads diferentes tem contadores de interesse independentes', async () => {
    supabaseHolder.current = makeSupabase({
      leads: [{ id: 'lead-1', nome: 'Ana' }, { id: 'lead-2', nome: 'Bia' }],
      interesses: [
        { lead_id: 'lead-1', property_id: 'p1', last_seen_at: '2026-08-01T10:00:00Z', properties: { nome: 'Monte Leone', slug: 'monte-leone' } },
      ],
    })
    const res = await GET(makeReq())
    const json = await res.json()
    const lead1 = json.find((l: { id: string }) => l.id === 'lead-1')
    const lead2 = json.find((l: { id: string }) => l.id === 'lead-2')
    expect(lead1.interesses_count).toBe(1)
    expect(lead2.interesses_count).toBe(0)
  })

  it('Item 6A: filtro ?empreendimento_id= usa .eq("empreendimento_interesse", ...), nunca .eq("empreendimento_id", ...)', async () => {
    const sb = makeSupabase({ leads: [{ id: 'lead-1', nome: 'Ana' }] })
    supabaseHolder.current = sb
    const res = await GET(makeReq('http://test/api/admin/leads?empreendimento_id=emp-123'))
    expect(res.status).toBe(200)
    expect(sb.eqCalls).toContainEqual(['empreendimento_interesse', 'emp-123'])
    expect(sb.eqCalls.some(([col]) => col === 'empreendimento_id')).toBe(false)
  })

  it('Item 6A: filtro ?status= continua chamando .eq("status", ...) sem regressão de comportamento', async () => {
    const sb = makeSupabase({ leads: [{ id: 'lead-1', nome: 'Ana' }] })
    supabaseHolder.current = sb
    const res = await GET(makeReq('http://test/api/admin/leads?status=novo'))
    expect(res.status).toBe(200)
    expect(sb.eqCalls).toContainEqual(['status', 'novo'])
  })

  it('Item 6A: status + empreendimento_id combinados aplicam os dois filtros, cada um na coluna certa', async () => {
    const sb = makeSupabase({ leads: [{ id: 'lead-1', nome: 'Ana' }] })
    supabaseHolder.current = sb
    const res = await GET(makeReq('http://test/api/admin/leads?status=novo&empreendimento_id=emp-9'))
    expect(res.status).toBe(200)
    expect(sb.eqCalls).toContainEqual(['status', 'novo'])
    expect(sb.eqCalls).toContainEqual(['empreendimento_interesse', 'emp-9'])
    expect(sb.eqCalls.length).toBe(2)
  })
})

function makeInsertSupabase(cfg: { insertedRow?: Record<string, unknown>; error?: { message: string } | null } = {}) {
  const inserts: Record<string, unknown>[] = []
  return {
    inserts,
    from(table: string) {
      if (table === 'leads') {
        return {
          insert: (row: Record<string, unknown>) => {
            inserts.push(row)
            return {
              select: () => ({
                single: () => Promise.resolve(
                  cfg.error
                    ? { data: null, error: cfg.error }
                    : { data: cfg.insertedRow ?? { id: 'lead-novo', ...row }, error: null }
                ),
              }),
            }
          },
        }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
  }
}

describe('POST /api/admin/leads', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    supabaseHolder.current = null
    requireAdminHolder.current = async () => 'admin-1'
    getSupabaseAdminMock.mockClear()
  })

  it('Item 8: sem sessao admin, POST retorna 401, nunca chama getSupabaseAdmin() nem parseia o body', async () => {
    requireAdminHolder.current = async () => null
    let bodyLido = false
    const req = { url: 'http://test/api/admin/leads', json: async () => { bodyLido = true; return {} } } as unknown as NextRequest
    const res = await POST(req)
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
    expect(getSupabaseAdminMock).not.toHaveBeenCalled()
    expect(bodyLido).toBe(false)
  })

  it('503 quando o supabase admin nao esta configurado (com sessao valida)', async () => {
    supabaseHolder.current = null
    const res = await POST(makePostReq({ whatsapp: '48999999999' }))
    expect(res.status).toBe(503)
  })

  it('whatsapp continua obrigatorio: 400 quando ausente', async () => {
    const sb = makeInsertSupabase()
    supabaseHolder.current = sb as unknown as ReturnType<typeof makeSupabase>
    const res = await POST(makePostReq({ nome: 'Ana' }))
    expect(res.status).toBe(400)
    expect(sb.inserts).toHaveLength(0)
  })

  it('sanitiza whatsapp para digitos e insere com os campos permitidos', async () => {
    const sb = makeInsertSupabase()
    supabaseHolder.current = sb as unknown as ReturnType<typeof makeSupabase>
    const res = await POST(makePostReq({ whatsapp: '(48) 99999-9999', nome: 'Ana', email: 'ana@ex.com', origem: 'Site', orcamento_max: 500000 }))
    expect(res.status).toBe(201)
    expect(sb.inserts[0]).toMatchObject({
      whatsapp: '48999999999',
      nome: 'Ana',
      email: 'ana@ex.com',
      origem: 'Site',
      orcamento_max: 500000,
    })
  })

  it('201 no sucesso, devolvendo o registro inserido', async () => {
    const sb = makeInsertSupabase({ insertedRow: { id: 'lead-1', whatsapp: '48999999999' } })
    supabaseHolder.current = sb as unknown as ReturnType<typeof makeSupabase>
    const res = await POST(makePostReq({ whatsapp: '48999999999' }))
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ id: 'lead-1', whatsapp: '48999999999' })
  })
})
