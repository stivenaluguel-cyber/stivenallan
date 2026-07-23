import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { authHolder, supabaseHolder } = vi.hoisted(() => ({
  authHolder: { autenticado: true },
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))

vi.mock('@/lib/dashboard/auth-check', () => ({
  autenticado: async () => authHolder.autenticado,
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

import { GET, PUT } from './route'

const CONFIG_PADRAO = { id: true, pausado: false, horario_inicio: '08:00', horario_fim: '20:00', limite_diario: null, atualizado_em: '2026-01-01T00:00:00.000Z' }

type MockConfig = {
  configRow?: Record<string, unknown> | null
  configError?: { message?: string } | null
  updateError?: { message?: string } | null
  historicoInsertShouldThrow?: boolean
}

function makeSupabase(cfg: MockConfig = {}) {
  const historicoInserts: Record<string, unknown>[] = []
  const updatePayloads: Record<string, unknown>[] = []

  return {
    historicoInserts,
    updatePayloads,
    from(table: string) {
      if (table === 'automacao_config') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: cfg.configRow !== undefined ? cfg.configRow : CONFIG_PADRAO,
                error: cfg.configError ?? null,
              }),
            }),
          }),
          update: (payload: Record<string, unknown>) => {
            updatePayloads.push(payload)
            return {
              eq: () => ({
                select: () => ({
                  single: async () => {
                    if (cfg.updateError) return { data: null, error: cfg.updateError }
                    return { data: { ...CONFIG_PADRAO, ...payload }, error: null }
                  },
                }),
              }),
            }
          },
        }
      }
      if (table === 'automacao_historico') {
        return {
          insert: async (row: Record<string, unknown>) => {
            if (cfg.historicoInsertShouldThrow) throw new Error('historico insert failed')
            historicoInserts.push(row)
            return { error: null }
          },
        }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
  }
}

function makeReq(body?: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest
}

describe('GET /api/admin/automacoes/config', () => {
  beforeEach(() => {
    authHolder.autenticado = true
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.restoreAllMocks()
  })

  it('401 se não autenticado', async () => {
    authHolder.autenticado = false
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('retorna a linha existente sem marcar migracao_pendente', async () => {
    supabaseHolder.current = makeSupabase({
      configRow: { id: true, pausado: true, horario_inicio: '09:00', horario_fim: '18:00', limite_diario: 10 },
    })
    const res = await GET()
    const json = (await res.json()) as { pausado: boolean; limite_diario: number | null; migracao_pendente?: boolean }
    expect(json.pausado).toBe(true)
    expect(json.limite_diario).toBe(10)
    expect(json.migracao_pendente).toBeUndefined()
  })

  it('fail-open com default quando a tabela não existe (migration 0015 pendente)', async () => {
    supabaseHolder.current = makeSupabase({ configError: { message: 'relation "automacao_config" does not exist' } })
    const res = await GET()
    const json = (await res.json()) as { migracao_pendente?: boolean; pausado: boolean; horario_inicio: string; horario_fim: string; limite_diario: number | null }
    expect(json.migracao_pendente).toBe(true)
    expect(json.pausado).toBe(false)
    expect(json.horario_inicio).toBe('08:00')
    expect(json.horario_fim).toBe('20:00')
    expect(json.limite_diario).toBeNull()
  })
})

describe('PUT /api/admin/automacoes/config', () => {
  beforeEach(() => {
    authHolder.autenticado = true
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.restoreAllMocks()
  })

  it('401 se não autenticado', async () => {
    authHolder.autenticado = false
    const res = await PUT(makeReq({}))
    expect(res.status).toBe(401)
  })

  it('rejeita horario_inicio fora do formato HH:MM', async () => {
    const res = await PUT(makeReq({ horario_inicio: '8:00' }))
    expect(res.status).toBe(400)
  })

  it('rejeita horario_fim inválido', async () => {
    const res = await PUT(makeReq({ horario_fim: '25:00' }))
    expect(res.status).toBe(400)
  })

  it('rejeita limite_diario negativo ou zero', async () => {
    const res = await PUT(makeReq({ limite_diario: 0 }))
    expect(res.status).toBe(400)
  })

  it('rejeita limite_diario não-inteiro', async () => {
    const res = await PUT(makeReq({ limite_diario: 3.5 }))
    expect(res.status).toBe(400)
  })

  it('aceita limite_diario null (sem limite)', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock
    const res = await PUT(makeReq({ limite_diario: null }))
    expect(res.status).toBe(200)
    expect(mock.updatePayloads[0]).toMatchObject({ limite_diario: null })
  })

  it('rejeita corpo sem nenhum campo válido', async () => {
    const res = await PUT(makeReq({}))
    expect(res.status).toBe(400)
  })

  it('atualiza pausado e grava historico com antes/depois', async () => {
    const mock = makeSupabase({ configRow: { ...CONFIG_PADRAO, pausado: false } })
    supabaseHolder.current = mock
    const res = await PUT(makeReq({ pausado: true }))
    expect(res.status).toBe(200)
    const json = (await res.json()) as { data: { pausado: boolean } }
    expect(json.data.pausado).toBe(true)
    expect(mock.historicoInserts).toHaveLength(1)
    expect(mock.historicoInserts[0]).toMatchObject({
      tipo: 'config',
      payload_antes: { pausado: false },
      payload_depois: { pausado: true },
    })
  })

  it('historico insert falhando não quebra a resposta de sucesso (fail-open)', async () => {
    const mock = makeSupabase({ historicoInsertShouldThrow: true })
    supabaseHolder.current = mock
    const res = await PUT(makeReq({ pausado: true }))
    expect(res.status).toBe(200)
  })

  it('500 se o update falhar', async () => {
    const mock = makeSupabase({ updateError: { message: 'db error' } })
    supabaseHolder.current = mock
    const res = await PUT(makeReq({ pausado: true }))
    expect(res.status).toBe(500)
  })
})
