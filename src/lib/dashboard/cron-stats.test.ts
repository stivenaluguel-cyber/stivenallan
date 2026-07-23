import { describe, expect, it } from 'vitest'
import {
  aggregate,
  aggregateByDay,
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
    details: null,
    ...extras,
  }
}

describe('aggregate', () => {
  it('array vazio → tudo zero, successRate 0, taxaEntrega 0', () => {
    const s = aggregate([])
    expect(s).toEqual({
      total: 0,
      ok: 0,
      partial: 0,
      skipped: 0,
      errors: 0,
      running: 0,
      successRate: 0,
      totalEnviados: 0,
      totalErrosEnvio: 0,
      taxaEntrega: 0,
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

  it('partial NÃO conta como sucesso na successRate — reproduz o bug relatado', () => {
    // 1 ok + 1 partial → ok/(finished=2) = 50%, mesmo a run partial tendo enviado a maioria
    const s = aggregate([
      row('ok', { enviados: 5, erros_envio: 0 }),
      row('partial', { enviados: 8, erros_envio: 2 }),
    ])
    expect(s.ok).toBe(1)
    expect(s.partial).toBe(1)
    expect(s.successRate).toBe(50)
    // mas a taxa de ENTREGA reflete que a maioria das mensagens saiu (13 de 15)
    expect(s.taxaEntrega).toBe(87)
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

  it('taxaEntrega é 0 quando não houve nenhuma tentativa de envio', () => {
    const s = aggregate([row('skipped'), row('skipped')])
    expect(s.taxaEntrega).toBe(0)
  })

  it('taxaEntrega e successRate são métricas independentes — status ok com zero enviados e zero erros não derruba nenhuma das duas', () => {
    const s = aggregate([row('ok', { enviados: 0, erros_envio: 0 })])
    expect(s.successRate).toBe(100)
    expect(s.taxaEntrega).toBe(0)
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

describe('aggregateByDay', () => {
  const now = new Date('2026-07-11T15:00:00Z')

  it('array vazio → N dias de zeros', () => {
    const result = aggregateByDay([], 7, now)
    expect(result).toHaveLength(7)
    for (const b of result) {
      expect(b.ok).toBe(0)
      expect(b.skipped).toBe(0)
      expect(b.errors).toBe(0)
      expect(b.running).toBe(0)
    }
  })

  it('agrupa runs no mesmo dia por status', () => {
    // Usar 12:00Z pra ficar longe da meia-noite local (evita bug de fuso na comparação)
    const dayStart = new Date('2026-07-11T12:00:00Z').toISOString()
    const rows = [
      row('ok', { started_at: dayStart }),
      row('ok', { started_at: dayStart }),
      row('partial', { started_at: dayStart }),
      row('skipped', { started_at: dayStart }),
      row('error', { started_at: dayStart }),
    ]
    const result = aggregateByDay(rows, 7, now)
    const today = result[result.length - 1]
    expect(today.ok).toBe(2)
    expect(today.partial).toBe(1)
    expect(today.skipped).toBe(1)
    expect(today.errors).toBe(1)
    expect(today.running).toBe(0)
  })

  it('runs fora da janela são descartados', () => {
    const veryOld = new Date('2020-01-01T12:00:00Z').toISOString()
    const rows = [row('ok', { started_at: veryOld })]
    const result = aggregateByDay(rows, 7, now)
    expect(result).toHaveLength(7)
    for (const b of result) expect(b.ok).toBe(0)
  })

  it('retorna dias em ordem cronológica (mais antigo → mais recente)', () => {
    const result = aggregateByDay([], 3, now)
    expect(result.map((b) => b.day)).toEqual(['2026-07-09', '2026-07-10', '2026-07-11'])
  })
})
