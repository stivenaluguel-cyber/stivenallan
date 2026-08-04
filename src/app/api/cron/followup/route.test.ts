import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { supabaseHolder, evolutionHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
  evolutionHolder: {
    enviarFollowUp: vi.fn(async () => true),
    enviarAlertaEscalada: vi.fn(async () => true),
    verificarInstancia: vi.fn(async () => ({ ok: true, state: 'open' }) as { ok: true; state: string } | { ok: false; reason: string }),
  },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

vi.mock('@/lib/evolution', () => ({
  // Testes só checam call count e valor de retorno — args não são inspecionados
  enviarFollowUp: () => evolutionHolder.enviarFollowUp(),
  enviarAlertaEscalada: () => evolutionHolder.enviarAlertaEscalada(),
  verificarInstancia: () => evolutionHolder.verificarInstancia(),
}))

// Motor de regras e auto-sugestão de conhecimento (itens 2 e 5) chamam
// getOpenAI() de @/lib/agent por baixo — sem mock, isso dispararia uma
// chamada de rede real num teste unitário. Resposta vazia por padrão faz
// gerarParConhecimento() devolver null (nenhuma sugestão), o que já é o
// comportamento esperado nos testes existentes deste arquivo.
vi.mock('@/lib/agent', () => ({
  getOpenAI: () => ({
    chat: { completions: { create: async () => ({ choices: [{ message: { content: '{"pergunta":"","resposta":""}' } }] }) } },
  }),
}))

import { GET } from './route'

type MockConfig = {
  leads?: Array<Record<string, unknown>>
  selectError?: { code?: string; message?: string } | null
  cronRunsMissing?: boolean
  automacaoMensagens?: Array<Record<string, unknown>>
  automacaoIntervalos?: Array<Record<string, unknown>>
  interacoesCount24h?: number
  automacaoRegras?: Array<Record<string, unknown>>
  mudancasEstagio?: Array<Record<string, unknown>>
  baseConhecimentoExistente?: number
  interacoesTranscricao?: Array<Record<string, unknown>>
}

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

  // interacoes.select() serve DUAS consultas: a contagem de envio automático
  // nas últimas 24h (whatsapp-envio-limite.ts, termina em .gte() com count) e
  // a transcrição pra auto-sugestão de conhecimento (item 2, termina em
  // .order().limit() com a lista de mensagens). Por padrão ambas vazias/zero
  // — os testes existentes do fluxo de follow-up não esperam nenhuma delas.
  const interacoesCountChain = () => {
    const rec = () => () => chain
    const chain = {
      eq: rec(),
      gte: async () => ({ count: cfg.interacoesCount24h ?? 0, error: null }),
      order: rec(),
      limit: async () => ({ data: cfg.interacoesTranscricao ?? [], error: null }),
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
          insert: async (row: Record<string, unknown>) => {
            interacoesInserts.push(row)
            return { error: null }
          },
          select: () => interacoesCountChain(),
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
      // Motor de regras (item 5): vazio por padrão — os testes existentes do
      // fluxo de follow-up não devem ser afetados por ele.
      if (table === 'automacao_regras') {
        return { select: () => ({ eq: async () => ({ data: cfg.automacaoRegras ?? [], error: null }) }) }
      }
      if (table === 'automacao_regras_execucoes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                gte: async () => ({ count: 0, error: null }),
              }),
            }),
          }),
          insert: async () => ({ error: null }),
        }
      }
      // leads_interacoes serve DUAS consultas bem diferentes aqui:
      // calcularDiasNoEstagioAtual (item 5) termina em .order().limit().maybeSingle(),
      // e sugerirConhecimentoDeConversasResolvidas (item 2) termina em
      // .in().gte().limit() aguardado direto. O mock distingue pelo .in() —
      // só a segunda consulta chama esse método.
      if (table === 'leads_interacoes') {
        return {
          select: () => {
            const chain = {
              eq: () => chain,
              in: () => ({ ...chain, gte: () => ({ limit: async () => ({ data: cfg.mudancasEstagio ?? [], error: null }) }) }),
              order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
            }
            return chain
          },
          insert: async () => ({ error: null }),
        }
      }
      if (table === 'base_conhecimento') {
        return {
          select: () => ({ eq: async () => ({ count: cfg.baseConhecimentoExistente ?? 0, error: null }) }),
          insert: async () => ({ error: null }),
        }
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
    evolutionHolder.verificarInstancia.mockClear()
    evolutionHolder.verificarInstancia.mockResolvedValue({ ok: true, state: 'open' })
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

  it('persiste skipped com motivo claro quando a instância Evolution está desconectada', async () => {
    evolutionHolder.verificarInstancia.mockResolvedValue({ ok: false, reason: 'HTTP 404: Application not found' })
    const mock = makeSupabase()
    supabaseHolder.current = mock

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    const json = (await res.json()) as { skipped?: boolean; motivo?: string }

    expect(json.skipped).toBe(true)
    expect(json.motivo).toMatch(/instância Evolution indisponível.*Application not found/i)
    expect(mock.cronRunUpdates[0]).toMatchObject({
      status: 'skipped',
      motivo: expect.stringMatching(/instância Evolution indisponível/i),
    })
    // Falha rápido, antes de processar qualquer lead — não gera N erros repetidos.
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

  it('pula o envio quando o lead já atingiu o teto diário de mensagens automáticas', async () => {
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
      interacoesCount24h: 8, // igual ao limite padrão (8) — já esgotado
    })
    supabaseHolder.current = mock

    vi.useFakeTimers({ shouldAdvanceTime: true })
    const p = GET(makeReq({ authorization: 'Bearer cron-secret' }))
    await vi.runAllTimersAsync()
    const res = await p
    vi.useRealTimers()

    const json = (await res.json()) as { processados: number; enviados: number; limite_atingido: number }
    expect(json.processados).toBe(1)
    expect(json.enviados).toBe(0)
    expect(json.limite_atingido).toBe(1)
    expect(evolutionHolder.enviarFollowUp).not.toHaveBeenCalled()
  })

  it('motor de regras roda mesmo sem leads pra follow-up e sem candidatos, sem quebrar o cron', async () => {
    const mock = makeSupabase({
      leads: [], // nenhum lead elegível pro follow-up NEM candidato de regra (mesmo mock de tabela)
      automacaoRegras: [{
        id: 'regra-1', nome: 'Score alto sem contato', ativo: true,
        gatilho_tipo: 'score_acima', gatilho_params: { score: 80 },
        filtro_estagio: null, acao_tipo: 'notificar_stiven', acao_params: {},
      }],
    })
    supabaseHolder.current = mock

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    const json = (await res.json()) as { regras?: { avaliados: number; executados: number } }

    expect(res.status).toBe(200)
    expect(json.regras).toEqual({ avaliados: 0, executados: 0 })
  })

  it('auto-sugestão de conhecimento roda junto e aparece no resumo, mesmo sem leads pra follow-up', async () => {
    const mock = makeSupabase({
      leads: [],
      mudancasEstagio: [{ lead_id: 'lead-9', created_at: '2026-08-03T10:00:00Z' }],
      baseConhecimentoExistente: 0,
      interacoesTranscricao: [
        { direcao: 'entrada', mensagem: 'tem vaga de garagem?' },
        { direcao: 'saida', mensagem: 'sim, uma vaga inclusa' },
      ],
    })
    supabaseHolder.current = mock

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    const json = (await res.json()) as { baseConhecimento?: { avaliados: number; sugeridos: number } }

    expect(res.status).toBe(200)
    expect(json.baseConhecimento?.avaliados).toBe(1)
  })

  it('cron_runs ausente (0006 pendente) — cron continua funcionando (fail-open)', async () => {
    const mock = makeSupabase({ leads: [], cronRunsMissing: true })
    supabaseHolder.current = mock

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    expect(res.status).toBe(200)
    expect(mock.cronRunInserts).toHaveLength(1)
    expect(mock.cronRunUpdates).toHaveLength(0) // runId=null → finish é no-op
  })
})
