import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

type ResultadoProcessamento = { ok: true; enviados: number; erros: number; restantes: number; statusFinal: string | null }

const { supabaseHolder, processarHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
  processarHolder: {
    processarEnvioCampanha: vi.fn(async (_supabase: unknown, _id: string): Promise<ResultadoProcessamento> => ({
      ok: true, enviados: 1, erros: 0, restantes: 0, statusFinal: 'enviada',
    })),
  },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

vi.mock('@/lib/campanhas/processar-envio', () => ({
  // Testes só checam call count e valor de retorno — args não são inspecionados
  processarEnvioCampanha: (_supabase: unknown, id: string) => processarHolder.processarEnvioCampanha(_supabase, id),
}))

import { GET } from './route'

type Row = Record<string, unknown>

function makeSupabase(cfg: { campanhasAgendadas?: Row[]; selectError?: { message: string } | null }) {
  const cronRunInserts: Row[] = []
  const cronRunUpdates: Row[] = []

  const client = {
    from(table: string) {
      if (table === 'cron_runs') {
        return {
          insert: (payload: Row) => ({
            select: () => ({
              single: async () => {
                cronRunInserts.push(payload)
                return { data: { id: 'run-1' }, error: null }
              },
            }),
          }),
          update: (payload: Row) => ({
            eq: async () => {
              cronRunUpdates.push(payload)
              return { data: null, error: null }
            },
          }),
        }
      }
      if (table === 'campanhas') {
        return {
          select: () => ({
            eq: () => ({
              lte: async () => {
                if (cfg.selectError) return { data: null, error: cfg.selectError }
                return { data: cfg.campanhasAgendadas ?? [], error: null }
              },
            }),
          }),
        }
      }
      throw new Error('tabela inesperada: ' + table)
    },
  }
  return { client: client as unknown, cronRunInserts, cronRunUpdates }
}

function makeReq(headers: Record<string, string>): NextRequest {
  return { headers: new Headers(headers) } as unknown as NextRequest
}

describe('GET /api/cron/campanhas-agendadas', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'cron-secret'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    processarHolder.processarEnvioCampanha.mockClear()
    processarHolder.processarEnvioCampanha.mockResolvedValue({ ok: true, enviados: 1, erros: 0, restantes: 0, statusFinal: 'enviada' })
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.restoreAllMocks()
  })

  it('401 sem Bearer token', async () => {
    const res = await GET(makeReq({}))
    expect(res.status).toBe(401)
  })

  it('503 "Cron não configurado" quando CRON_SECRET está ausente — "Bearer undefined" nunca autentica', async () => {
    delete process.env.CRON_SECRET
    const res = await GET(makeReq({ authorization: 'Bearer undefined' }))
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ error: 'Cron não configurado' })
  })

  it('503 quando envs Supabase ausentes', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    expect(res.status).toBe(503)
  })

  it('processados=0 quando nenhuma campanha está due', async () => {
    const mock = makeSupabase({ campanhasAgendadas: [] })
    supabaseHolder.current = mock.client as unknown as ReturnType<typeof makeSupabase>

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    const json = (await res.json()) as { processados: number }

    expect(res.status).toBe(200)
    expect(json.processados).toBe(0)
    expect(processarHolder.processarEnvioCampanha).not.toHaveBeenCalled()
  })

  it('chama processarEnvioCampanha pra cada campanha due e soma enviados/erros', async () => {
    const mock = makeSupabase({ campanhasAgendadas: [{ id: 'c1' }, { id: 'c2' }] })
    supabaseHolder.current = mock.client as unknown as ReturnType<typeof makeSupabase>
    processarHolder.processarEnvioCampanha
      .mockResolvedValueOnce({ ok: true, enviados: 2, erros: 0, restantes: 0, statusFinal: 'enviada' })
      .mockResolvedValueOnce({ ok: true, enviados: 1, erros: 1, restantes: 0, statusFinal: 'enviada' })

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    const json = (await res.json()) as { processados: number; enviados: number; erros_envio: number }

    expect(res.status).toBe(200)
    expect(processarHolder.processarEnvioCampanha).toHaveBeenCalledTimes(2)
    expect(json.processados).toBe(2)
    expect(json.enviados).toBe(3)
    expect(json.erros_envio).toBe(1)
    expect(mock.cronRunUpdates[0]).toMatchObject({ status: 'ok', processados: 2, enviados: 3, erros_envio: 1 })
  })

  it('erro no select da campanhas persiste status=error', async () => {
    const mock = makeSupabase({ selectError: { message: 'db down' } })
    supabaseHolder.current = mock.client as unknown as ReturnType<typeof makeSupabase>

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    expect(res.status).toBe(500)
    expect(mock.cronRunUpdates[0]).toMatchObject({ status: 'error', motivo: 'db down' })
  })
})
