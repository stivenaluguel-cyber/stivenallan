import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { supabaseHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

import { GET } from './route'
import { buildUnsubscribeUrl, montarHtml } from '@/lib/cron/email-followup-helpers'
import { verifyUnsubscribeToken } from '@/lib/leads/unsubscribe-token'

// ---- Unit tests dos helpers puros ----

describe('buildUnsubscribeUrl', () => {
  beforeEach(() => {
    process.env.UNSUBSCRIBE_SECRET = 'test-secret-cron'
  })
  afterEach(() => {
    delete process.env.UNSUBSCRIBE_SECRET
  })

  it('constrói URL com SITE_URL + query lead_id + token válido (round-trip com verify)', () => {
    const url = buildUnsubscribeUrl('lead-1')
    expect(url).toContain('/api/unsubscribe?lead_id=lead-1&token=')
    const token = new URL(url).searchParams.get('token')
    expect(verifyUnsubscribeToken('lead-1', token)).toBe(true)
  })

  it('URL-encoda o lead_id (defesa em profundidade)', () => {
    const url = buildUnsubscribeUrl('lead com espaço')
    expect(url).toContain('lead%20com%20espa%C3%A7o')
  })
})

describe('montarHtml', () => {
  it('inclui o corpo passado + link de descadastro na URL fornecida', () => {
    const html = montarHtml('<p>corpo teste</p>', 'https://example.com/api/unsubscribe?x=1')
    expect(html).toContain('<p>corpo teste</p>')
    expect(html).toContain('href="https://example.com/api/unsubscribe?x=1"')
    expect(html).toContain('Descadastrar')
  })
})

// ---- Integration test do GET ----

type MockConfig = {
  leads?: Array<{
    id: string
    nome: string
    email: string
    created_at: string
    email_followup_etapa: number
    property_id?: string | null
    property_name?: string | null
    status: string
  }>
  selectError?: { code?: string; message?: string } | null
  cronRunsMissing?: boolean // simula tabela cron_runs ausente (migration 0006 pendente)
  automacaoEmailPassos?: Array<Record<string, unknown>>
}

function makeSupabase(cfg: MockConfig = {}) {
  const filters: Array<{ op: string; args: unknown[] }> = []
  const updates: Record<string, unknown>[] = []
  const cronRunInserts: Record<string, unknown>[] = []
  const cronRunUpdates: Record<string, unknown>[] = []
  const selectData = cfg.leads ?? []

  const selectChain = () => {
    const rec = (op: string) => (...args: unknown[]) => {
      filters.push({ op, args })
      return chain
    }
    const chain = {
      not: rec('not'),
      is: rec('is'),
      lt: rec('lt'),
      in: rec('in'),
      eq: rec('eq'),
      limit: async () => ({ data: selectData, error: cfg.selectError ?? null }),
    }
    return chain
  }

  const updateChain = () => ({
    eq: async (field: string, val: unknown) => {
      filters.push({ op: 'update-eq', args: [field, val] })
      return { error: null }
    },
  })

  return {
    filters,
    updates,
    cronRunInserts,
    cronRunUpdates,
    from(table: string) {
      if (table === 'leads') {
        return {
          select: () => selectChain(),
          update: (row: Record<string, unknown>) => {
            updates.push(row)
            return updateChain()
          },
        }
      }
      if (table === 'properties') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        }
      }
      // Config de automação (0011): vazio por padrão → cron cai no fallback
      // hardcoded, que é o que os testes existentes já esperam.
      if (table === 'automacao_email_passos') {
        return { select: () => ({ order: async () => ({ data: cfg.automacaoEmailPassos ?? [], error: null }) }) }
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

describe('GET /api/cron/email-followup', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    process.env.CRON_SECRET = 'cron-secret'
    process.env.RESEND_API_KEY = 'resend-key'
    process.env.RESEND_FROM = 'onboarding@example.com'
    process.env.UNSUBSCRIBE_SECRET = 'unsub-secret'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
    warnSpy.mockRestore()
    errSpy.mockRestore()
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.restoreAllMocks()
  })

  it('401 sem Bearer token válido', async () => {
    const res = await GET(makeReq({}))
    expect(res.status).toBe(401)
  })

  it('skipped quando RESEND_FROM ausente', async () => {
    delete process.env.RESEND_FROM
    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    const json = (await res.json()) as { skipped?: boolean }
    expect(json.skipped).toBe(true)
  })

  it('skipped quando UNSUBSCRIBE_SECRET ausente (LGPD guard)', async () => {
    delete process.env.UNSUBSCRIBE_SECRET
    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    const json = (await res.json()) as { skipped?: boolean; motivo?: string }
    expect(json.skipped).toBe(true)
    expect(json.motivo).toMatch(/UNSUBSCRIBE_SECRET/)
  })

  it('skipped quando coluna 0005 ausente no schema', async () => {
    const mock = makeSupabase({
      selectError: { code: 'PGRST204', message: 'column "unsubscribed_at" does not exist' },
    })
    supabaseHolder.current = mock

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    const json = (await res.json()) as { skipped?: boolean }
    expect(json.skipped).toBe(true)
    // Filtro .is('unsubscribed_at', null) tentou ser aplicado (foi enviado ao query builder)
    expect(mock.filters.some((f) => f.op === 'is' && f.args[0] === 'unsubscribed_at')).toBe(true)
  })

  it('envia e-mail com List-Unsubscribe header + summary log ao final', async () => {
    const mock = makeSupabase({
      leads: [
        {
          id: 'lead-1',
          nome: 'Ana Maria',
          email: 'ana@example.com',
          created_at: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 dias atrás
          email_followup_etapa: 0,
          property_name: 'Monte Leone',
          status: 'novo',
        },
      ],
    })
    supabaseHolder.current = mock

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'msg-1' }), { status: 200 }),
    )

    // Fake timers pra pular o setTimeout(600) do throttle
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const p = GET(makeReq({ authorization: 'Bearer cron-secret' }))
    await vi.runAllTimersAsync()
    const res = await p
    vi.useRealTimers()

    expect(res.status).toBe(200)
    const json = (await res.json()) as { enviados: number; processados: number }
    expect(json.enviados).toBe(1)
    expect(json.processados).toBe(1)

    // fetch chamou Resend com header List-Unsubscribe apontando pra /api/unsubscribe
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [, opts] = fetchSpy.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(opts.body as string)
    expect(body.headers['List-Unsubscribe']).toMatch(/api\/unsubscribe\?lead_id=lead-1&token=/)
    expect(body.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click')
    // Body do e-mail contém link visível de descadastro
    expect(body.html).toContain('Descadastrar')

    // Summary log foi emitido
    const summaryLine = (logSpy.mock.calls as unknown[][])
      .map((c: unknown[]) => c[0] as string)
      .find((s: string) => typeof s === 'string' && s.includes('"run summary"'))
    expect(summaryLine).toBeTruthy()
    const parsed = JSON.parse(summaryLine as string) as { enviados: number; processados: number }
    expect(parsed.enviados).toBe(1)
    expect(parsed.processados).toBe(1)
  })

  it('leads muito novos (idade < diasMinimos) contam como pulados sem enviar', async () => {
    const mock = makeSupabase({
      leads: [
        {
          id: 'lead-new',
          nome: 'Bia',
          email: 'bia@example.com',
          created_at: new Date().toISOString(), // agora — < 2 dias
          email_followup_etapa: 0,
          property_name: 'X',
          status: 'novo',
        },
      ],
    })
    supabaseHolder.current = mock

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(new Response('', { status: 200 }))

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    const json = (await res.json()) as { enviados: number; pulados: number; processados: number }

    expect(res.status).toBe(200)
    expect(json.enviados).toBe(0)
    expect(json.pulados).toBe(1)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  // ---- Pilha D: persistência em cron_runs ----

  it('persiste run OK: insert running + update ok com contadores', async () => {
    const mock = makeSupabase({ leads: [] })
    supabaseHolder.current = mock

    await GET(makeReq({ authorization: 'Bearer cron-secret' }))

    // 1 insert (start) + 1 update payload + 1 update .eq
    expect(mock.cronRunInserts).toHaveLength(1)
    expect(mock.cronRunInserts[0]).toMatchObject({
      cron_name: 'email-followup',
      status: 'running',
    })
    expect(mock.cronRunUpdates).toHaveLength(2) // update() + .eq()
    expect(mock.cronRunUpdates[0]).toMatchObject({
      status: 'ok',
      processados: 0,
      enviados: 0,
      pulados: 0,
      erros_envio: 0,
    })
    expect(mock.cronRunUpdates[1]).toEqual({ __eq: ['id', 'run-mock'] })
  })

  it('persiste run skipped quando UNSUBSCRIBE_SECRET ausente', async () => {
    delete process.env.UNSUBSCRIBE_SECRET
    const mock = makeSupabase()
    supabaseHolder.current = mock

    await GET(makeReq({ authorization: 'Bearer cron-secret' }))

    expect(mock.cronRunInserts[0]).toMatchObject({ status: 'running' })
    expect(mock.cronRunUpdates[0]).toMatchObject({
      status: 'skipped',
      motivo: expect.stringMatching(/UNSUBSCRIBE_SECRET/),
    })
  })

  it('persiste run skipped quando migration 0005 pendente', async () => {
    const mock = makeSupabase({
      selectError: { code: 'PGRST204', message: 'column "unsubscribed_at" does not exist' },
    })
    supabaseHolder.current = mock

    await GET(makeReq({ authorization: 'Bearer cron-secret' }))

    expect(mock.cronRunInserts[0]).toMatchObject({ status: 'running' })
    expect(mock.cronRunUpdates[0]).toMatchObject({
      status: 'skipped',
      motivo: expect.stringMatching(/migração 0004 ou 0005/),
    })
  })

  it('cron_runs ausente (0006 pendente) — cron continua funcionando (fail-open)', async () => {
    const mock = makeSupabase({ leads: [], cronRunsMissing: true })
    supabaseHolder.current = mock

    const res = await GET(makeReq({ authorization: 'Bearer cron-secret' }))
    const json = (await res.json()) as { processados: number }

    expect(res.status).toBe(200)
    expect(json.processados).toBe(0)
    // Insert foi tentado mas errou; finishCronRun early-return (runId=null)
    expect(mock.cronRunInserts).toHaveLength(1)
    expect(mock.cronRunUpdates).toHaveLength(0)
  })
})
