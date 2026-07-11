import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { finishCronRun, startCronRun } from './tracker'

type Call = { table: string; op: string; payload: unknown }

function makeSupabase({
  insertError = null,
  insertData = { id: 'run-1' },
  updateError = null,
}: {
  insertError?: { code?: string; message?: string } | null
  insertData?: { id: string } | null
  updateError?: { code?: string; message?: string } | null
} = {}) {
  const calls: Call[] = []
  const client = {
    from(table: string) {
      return {
        insert(payload: unknown) {
          calls.push({ table, op: 'insert', payload })
          return {
            select: () => ({
              single: async () => ({
                data: insertError ? null : insertData,
                error: insertError,
              }),
            }),
          }
        },
        update(payload: unknown) {
          calls.push({ table, op: 'update', payload })
          return {
            eq: async (field: string, val: unknown) => {
              calls.push({ table, op: 'update.eq', payload: [field, val] })
              return { error: updateError }
            },
          }
        },
      }
    },
  }
  return { client: client as unknown as SupabaseClient, calls }
}

describe('startCronRun', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('insere row com status=running e retorna o id', async () => {
    const { client, calls } = makeSupabase()
    const { runId, startedAt } = await startCronRun(client, 'email-followup')

    expect(runId).toBe('run-1')
    expect(startedAt.toISOString()).toBe('2026-01-01T12:00:00.000Z')
    expect(calls[0]).toEqual({
      table: 'cron_runs',
      op: 'insert',
      payload: {
        cron_name: 'email-followup',
        started_at: '2026-01-01T12:00:00.000Z',
        status: 'running',
      },
    })
  })

  it('fail-open quando tabela cron_runs não existe (0006 pendente)', async () => {
    const { client } = makeSupabase({
      insertError: { code: '42P01', message: 'relation "cron_runs" does not exist' },
    })
    const { runId, startedAt } = await startCronRun(client, 'email-followup')

    expect(runId).toBeNull()
    expect(startedAt).toBeInstanceOf(Date)
  })

  it('fail-open em qualquer erro genérico do supabase', async () => {
    const { client } = makeSupabase({
      insertError: { code: 'XYZ', message: 'network down' },
    })
    const { runId } = await startCronRun(client, 'x')
    expect(runId).toBeNull()
  })
})

describe('finishCronRun', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('early return quando runId é null — não chama supabase', async () => {
    const { client, calls } = makeSupabase()
    await finishCronRun(client, null, new Date(), { status: 'ok' })
    expect(calls).toHaveLength(0)
  })

  it('atualiza row com status, ended_at, duration_ms e contadores', async () => {
    const { client, calls } = makeSupabase()
    const startedAt = new Date('2026-01-01T12:00:00.000Z')
    // Simula 3.5s de execução
    vi.setSystemTime(new Date('2026-01-01T12:00:03.500Z'))

    await finishCronRun(client, 'run-1', startedAt, {
      status: 'ok',
      processados: 5,
      enviados: 3,
      pulados: 2,
      erros_envio: 0,
    })

    expect(calls[0]).toMatchObject({
      table: 'cron_runs',
      op: 'update',
      payload: {
        ended_at: '2026-01-01T12:00:03.500Z',
        duration_ms: 3500,
        status: 'ok',
        motivo: null,
        processados: 5,
        enviados: 3,
        pulados: 2,
        erros_envio: 0,
        details: null,
      },
    })
    expect(calls[1]).toEqual({
      table: 'cron_runs',
      op: 'update.eq',
      payload: ['id', 'run-1'],
    })
  })

  it('grava motivo em skipped/error', async () => {
    const { client, calls } = makeSupabase()
    await finishCronRun(client, 'run-2', new Date(), {
      status: 'skipped',
      motivo: 'RESEND_FROM ausente',
    })
    expect((calls[0].payload as { status: string; motivo: string }).status).toBe('skipped')
    expect((calls[0].payload as { motivo: string }).motivo).toBe('RESEND_FROM ausente')
  })

  it('engole erro do update — cron não pode cair aqui', async () => {
    const { client } = makeSupabase({
      updateError: { code: 'XYZ', message: 'timeout' },
    })
    await expect(
      finishCronRun(client, 'run-3', new Date(), { status: 'ok' }),
    ).resolves.toBeUndefined()
  })
})
