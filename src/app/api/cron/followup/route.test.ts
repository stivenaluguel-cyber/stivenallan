import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { supabaseHolder, evolutionHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
  evolutionHolder: {
    enviarFollowUp: vi.fn(async () => true),
    enviarAlertaEscalada: vi.fn(async () => true),
  },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

vi.mock('@/lib/evolution', () => ({
  // Testes só checam call count e valor de retorno — args não são inspecionados
  enviarFollowUp: () => evolutionHolder.enviarFollowUp(),
  enviarAlertaEscalada: () => evolutionHolder.enviarAlertaEscalada(),
}))

import { GET } from './route'

type MockConfig = {
  leads?: Array<Record<string, unknown>>
  selectError?: { code?: string; message?: string } | null
  cronRunsMissing?: boolean
  automacaoMensagens?: Array<Record<string, unknown>>
  automacaoIntervalos?: Array<Record<string, unknown>>
  // undefined → default wide-open (pausado=false, horário 00:00–23:59, sem
  // limite) pra testes existentes não dependerem da hora real de execução.
  automacaoConfig?: Record<string, unknown> | null
  enviosHojeCount?: number
}

const AUTOMACAO_CONFIG_ABERTA = { pausado: false, horario_inicio: '00:00', horario_fim: '23:59', limite_diario: null }

function makeSupabase(cfg: MockConfig = {}) {
  const cronRunInserts: Record<string, unknown>[] = []
  const cronRunUpdates: Record<string, unknown>[] = []
  const leadsUpdates: Record<string, unknown>[] = []
  const interacoesInserts: Record<string, unknown>[] = []

  const leadsSelectChain = () => {
    const rec = () => () => chain
    const chain = {
      lte: rec(),
      eq: rec(),
      in: rec(),
      not: rec(),
      is: rec(),
      limit: async () => ({ data: cfg.leads ?? [], error: cfg.selectError ?? null }),
    }
    return chain
  }

  return {
    cronRunInserts,
    cronRunUpdates,
    leadsUpdates,
    interacoesInserts,
    from(table: string) {
      if (table === 'leads') {
        return {
          select: () => leadsSelectChain(),
          update: (row: Record<string, unknown>) => {
            leadsUpdates.push(row)
            return { eq: async () => ({ error: null }) }
          },
        }
      }
      if (table === 'interacoes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  gte: async () => ({ count: cfg.enviosHojeCount ?? 0, error: null }),
                }),
              }),
            }),
          }),
          insert: async (row: Record<string, unknown>) => {
            interacoesInserts.push(row)
            return { error: null }
          },
        }
      }
      if (table === 'automacao_config') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: cfg.automacaoConfig !== undefined ? cfg.automacaoConfig : AUTOMACAO_CONFIG_ABERTA, error: null }),
            }),
          }),
        }
      }
      // Config de automação (0011): vazio por padrão nos testes → cron cai
      // no fallback hardcoded, que é o que os testes existentes já esperam.
      if (table === 'automacao_whatsapp_mensagens') {
        return { select: () => ({ order: async () => ({ data: cfg.automacaoMensagens ?? [], error: null }) }) }
      }
      if (table === 'automacao_whatsapp_intervalos') {
        return { select: () => ({ order: async () => ({ data: cfg.automacaoIntervalos ?? [], error: null }) }) }
      }
      if (table === 'properties' || table === 'empreendimentos') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
              single: async () => ({ data: null, error: null }),
            }),
          }),
        }
      }
      if (table === 'cron_runs') {
        return {
          insert: (row: Record<string, unknown>) => {
            cronRunInserts.push(row)
            return {
              select: () => ({
                single: async () => {
                  if (cfg.cronRunsMissing) {
                    return {
                      data: null,
                      error: { code: '42P01', message: 'relation "cron_runs" does not exist' },
                    }
                  }
                  return { data: { id: 'run-mock' }, error: null }
                },
              }),
            }
          },
          update: (row: Record<string, unknown>) => {
            cronRunUpdates.push(row)
            return {
              eq: async (field: string, val: unknown) => {
                cronRunUpdates.push({ __eq: [field, val] })
                return { error: null }
              },
            }
          },
        }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
  }
}

function makeReq(headers: Record<string, string> = {}) {
  return { headers: new Headers(headers) } as unknown as NextRequest
}

describe('GET /api/cron/followup', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'cron-secret'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    process.env.EVOLUTION_API_URL = 'http://evo.local'
    process.env.EVOLUTION_API_KEY = 'evo-key'
    process.env.EVOLUTION_INSTANCE = 'stiven'
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    evolutionHolder.enviarFollowUp.mockClear()
    evolutionHolder.enviarAlertaEscalada.mockClear()
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.restoreAllMocks()
  })

  it('401 sem Bearer token', async () => {
    const res = await GET(makeReq({}))
    expect(res.status).toBe(401)
  })

  it('503 quando envs Supabase ausentes (não crasha mais)', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    expect(res.status).toBe(503)
  })

  it('persiste skipped quando EVOLUTION_API_URL ausente', async () => {
    delete process.env.EVOLUTION_API_URL
    const mock = makeSupabase()
    supabaseHolder.current = mock

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    const json = (await res.json()) as { skipped?: boolean; motivo?: string }

    expect(json.skipped).toBe(true)
    expect(json.motivo).toMatch(/EVOLUTION/)
    expect(mock.cronRunInserts[0]).toMatchObject({ cron_name: 'followup', status: 'running' })
    expect(mock.cronRunUpdates[0]).toMatchObject({
      status: 'skipped',
      motivo: expect.stringMatching(/EVOLUTION/),
    })
    expect(evolutionHolder.enviarFollowUp).not.toHaveBeenCalled()
  })

  it('persiste ok com processados=0 quando não há leads elegíveis', async () => {
    const mock = makeSupabase({ leads: [] })
    supabaseHolder.current = mock

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    const json = (await res.json()) as { processados: number }

    expect(res.status).toBe(200)
    expect(json.processados).toBe(0)
    expect(mock.cronRunUpdates[0]).toMatchObject({
      status: 'ok',
      processados: 0,
      enviados: 0,
      erros_envio: 0,
    })
  })

  it('persiste ok com counters quando processa lead com sucesso', async () => {
    evolutionHolder.enviarFollowUp.mockResolvedValueOnce(true)
    const mock = makeSupabase({
      leads: [
        {
          id: 'lead-1',
          nome: 'Ana',
          whatsapp: '48991642332',
          estagio_funil: 'primeiro_contato',
          tentativas_followup: 0,
          property_name: 'Monte Leone',
          lead_score: 50,
        },
      ],
    })
    supabaseHolder.current = mock

    // Fake timers pra pular o setTimeout(2000) entre envios
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const p = GET(makeReq({ authorization: 'Bearer cron-secret' }))
    await vi.runAllTimersAsync()
    const res = await p
    vi.useRealTimers()

    const json = (await res.json()) as { processados: number; enviados: number }
    expect(json.processados).toBe(1)
    expect(json.enviados).toBe(1)
    expect(evolutionHolder.enviarFollowUp).toHaveBeenCalledTimes(1)
    expect(mock.cronRunUpdates[0]).toMatchObject({
      status: 'ok',
      processados: 1,
      enviados: 1,
    })
  })

  it('cron_runs ausente (0006 pendente) — cron continua funcionando (fail-open)', async () => {
    const mock = makeSupabase({ leads: [], cronRunsMissing: true })
    supabaseHolder.current = mock

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    expect(res.status).toBe(200)
    expect(mock.cronRunInserts).toHaveLength(1)
    expect(mock.cronRunUpdates).toHaveLength(0) // runId=null → finish é no-op
  })

  // ---- automacao_config (migration 0015): pausar / janela de horário / limite diário ----

  it('skipped quando automacao_config.pausado=true — nenhum lead é processado', async () => {
    const mock = makeSupabase({
      leads: [{ id: 'lead-1', nome: 'Ana', whatsapp: '48991642332', estagio_funil: 'primeiro_contato', tentativas_followup: 0 }],
      automacaoConfig: { pausado: true, horario_inicio: '00:00', horario_fim: '23:59', limite_diario: null },
    })
    supabaseHolder.current = mock

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    const json = (await res.json()) as { skipped?: boolean; motivo?: string }

    expect(json.skipped).toBe(true)
    expect(json.motivo).toMatch(/pausadas manualmente/)
    expect(evolutionHolder.enviarFollowUp).not.toHaveBeenCalled()
    expect(mock.cronRunUpdates[0]).toMatchObject({ status: 'skipped', motivo: expect.stringMatching(/pausadas manualmente/) })
  })

  it('skipped quando o horário atual está fora da janela permitida', async () => {
    // 12:00 UTC = 09:00 América/São_Paulo (UTC-3, sem horário de verão) — fora de 10:00–11:00.
    vi.useFakeTimers({ now: new Date('2026-07-23T12:00:00.000Z') })
    const mock = makeSupabase({
      leads: [{ id: 'lead-1', nome: 'Ana', whatsapp: '48991642332', estagio_funil: 'primeiro_contato', tentativas_followup: 0 }],
      automacaoConfig: { pausado: false, horario_inicio: '10:00', horario_fim: '11:00', limite_diario: null },
    })
    supabaseHolder.current = mock

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    const json = (await res.json()) as { skipped?: boolean; motivo?: string }
    vi.useRealTimers()

    expect(json.skipped).toBe(true)
    expect(json.motivo).toMatch(/fora do horário permitido/)
    expect(evolutionHolder.enviarFollowUp).not.toHaveBeenCalled()
  })

  it('limite_diario corta a lista de leads antes do loop e reporta cortados_por_limite_diario', async () => {
    evolutionHolder.enviarFollowUp.mockResolvedValue(true)
    const mock = makeSupabase({
      leads: [
        { id: 'lead-1', nome: 'Ana', whatsapp: '48991642332', estagio_funil: 'primeiro_contato', tentativas_followup: 0 },
        { id: 'lead-2', nome: 'Beto', whatsapp: '48991642333', estagio_funil: 'primeiro_contato', tentativas_followup: 0 },
      ],
      automacaoConfig: { pausado: false, horario_inicio: '00:00', horario_fim: '23:59', limite_diario: 1 },
      enviosHojeCount: 0,
    })
    supabaseHolder.current = mock

    vi.useFakeTimers({ shouldAdvanceTime: true })
    const p = GET(makeReq({ authorization: 'Bearer cron-secret' }))
    await vi.runAllTimersAsync()
    const res = await p
    vi.useRealTimers()

    const json = (await res.json()) as { processados: number; enviados: number; cortados_por_limite_diario: number }
    expect(json.processados).toBe(1)
    expect(json.enviados).toBe(1)
    expect(json.cortados_por_limite_diario).toBe(1)
    expect(evolutionHolder.enviarFollowUp).toHaveBeenCalledTimes(1)
  })

  it('limite_diario já atingido hoje — nenhum lead processado, sem erro', async () => {
    const mock = makeSupabase({
      leads: [{ id: 'lead-1', nome: 'Ana', whatsapp: '48991642332', estagio_funil: 'primeiro_contato', tentativas_followup: 0 }],
      automacaoConfig: { pausado: false, horario_inicio: '00:00', horario_fim: '23:59', limite_diario: 5 },
      enviosHojeCount: 5,
    })
    supabaseHolder.current = mock

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    const json = (await res.json()) as { processados: number }

    expect(res.status).toBe(200)
    expect(json.processados).toBe(0)
    expect(evolutionHolder.enviarFollowUp).not.toHaveBeenCalled()
    expect(mock.cronRunUpdates[0]).toMatchObject({ status: 'ok', processados: 0 })
  })
})
