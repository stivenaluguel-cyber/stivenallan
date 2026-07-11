import { describe, expect, it } from 'vitest'
import {
  aggregate,
  filterLast7Days,
  formatDuration,
  type CronRunRow,
  type CronRunStatus,
} from './cron-stats'

function row(status: CronRunStatus, extras: Partial<CronRunRow> = {}): CronRunRow {
  return {
    id: `run-${Math.random()}`,
    cron_name: 'email-followup',
    started_at: new Date().toISOString(),
    ended_at: null,
    duration_ms: null,
    status,
    motivo: null,
    processados: null,
    enviados: null,
    pulados: null,
    erros_envio: null,
    ...extras,
  }
}

describe('aggregate', () => {
  it('array vazio → tudo zero, successRate 0', () => {
    const s = aggregate([])
    expect(s).toEqual({
      total: 0,
      ok: 0,
      skipped: 0,
      errors: 0,
      running: 0,
      successRate: 0,
      totalEnviados: 0,
      totalErrosEnvio: 0,
    })
  })

  it('só ok → successRate 100', () => {
    const s = aggregate([row('ok'), row('ok'), row('ok')])
    expect(s.total).toBe(3)
    expect(s.ok).toBe(3)
    expect(s.successRate).toBe(100)
  })

  it('mix ok + skipped + error → successRate arredondado', () => {
    // 3 ok + 1 skipped + 1 error → ok/(finished=5) = 60%
    const s = aggregate([row('ok'), row('ok'), row('ok'), row('skipped'), row('error')])
    expect(s.total).toBe(5)
    expect(s.ok).toBe(3)
    expect(s.skipped).toBe(1)
    expect(s.errors).toBe(1)
    expect(s.successRate).toBe(60)
  })

  it('running é excluído do denominador da successRate', () => {
    // 2 ok + 1 running → ok/(finished=2) = 100%
    const s = aggregate([row('ok'), row('ok'), row('running')])
    expect(s.total).toBe(3)
    expect(s.running).toBe(1)
    expect(s.successRate).toBe(100)
  })

  it('soma enviados e erros_envio ignorando nulls', () => {
    const s = aggregate([
      row('ok', { enviados: 5, erros_envio: 0 }),
      row('ok', { enviados: 3, erros_envio: 1 }),
      row('skipped', { enviados: null, erros_envio: null }),
      row('ok', { enviados: 2, erros_envio: 0 }),
    ])
    expect(s.totalEnviados).toBe(10)
    expect(s.totalErrosEnvio).toBe(1)
  })
})

describe('filterLast7Days', () => {
  it('mantém runs dentro da janela e descarta as antigas', () => {
    const now = new Date('2026-01-15T12:00:00.000Z')
    const rows = [
      row('ok', { started_at: new Date('2026-01-15T10:00:00Z').toISOString() }), // hoje
      row('ok', { started_at: new Date('2026-01-10T00:00:00Z').toISOString() }), // 5 dias atrás
      row('ok', { started_at: new Date('2026-01-01T00:00:00Z').toISOString() }), // 14 dias atrás — fora
      row('error', { started_at: new Date('2025-12-20T00:00:00Z').toISOString() }), // muito antigo
    ]
    const filtered = filterLast7Days(rows, now)
    expect(filtered).toHaveLength(2)
  })
})

describe('formatDuration', () => {
  it('null e undefined → "—"', () => {
    expect(formatDuration(null)).toBe('—')
    expect(formatDuration(undefined as unknown as number)).toBe('—')
  })

  it('< 1s → "Nms"', () => {
    expect(formatDuration(450)).toBe('450ms')
    expect(formatDuration(999)).toBe('999ms')
  })

  it('>= 1s → "X.Ys" com 1 casa decimal', () => {
    expect(formatDuration(1000)).toBe('1.0s')
    expect(formatDuration(3500)).toBe('3.5s')
    expect(formatDuration(12345)).toBe('12.3s')
  })
})
