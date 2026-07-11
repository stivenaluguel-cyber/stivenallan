// Agregações puras sobre rows de cron_runs — testáveis 100% sem DB.

export type CronRunStatus = 'running' | 'ok' | 'skipped' | 'error'

export type CronRunRow = {
  id: string
  cron_name: string
  started_at: string
  ended_at: string | null
  duration_ms: number | null
  status: CronRunStatus
  motivo: string | null
  processados: number | null
  enviados: number | null
  pulados: number | null
  erros_envio: number | null
}

export type CronStats = {
  total: number
  ok: number
  skipped: number
  errors: number
  running: number
  // Taxa considera runs que terminaram (exclui running). Skipped conta como
  // "não sucesso" — se dois dias seguidos vieram skipped por env faltando,
  // a taxa desce e o operador vê que tem coisa quebrada.
  successRate: number
  totalEnviados: number
  totalErrosEnvio: number
}

export function aggregate(rows: CronRunRow[]): CronStats {
  const total = rows.length
  const ok = rows.filter((r) => r.status === 'ok').length
  const skipped = rows.filter((r) => r.status === 'skipped').length
  const errors = rows.filter((r) => r.status === 'error').length
  const running = rows.filter((r) => r.status === 'running').length
  const finished = ok + skipped + errors
  const successRate = finished === 0 ? 0 : Math.round((ok / finished) * 100)
  const totalEnviados = rows.reduce((sum, r) => sum + (r.enviados ?? 0), 0)
  const totalErrosEnvio = rows.reduce((sum, r) => sum + (r.erros_envio ?? 0), 0)
  return {
    total,
    ok,
    skipped,
    errors,
    running,
    successRate,
    totalEnviados,
    totalErrosEnvio,
  }
}

export function filterLast7Days(rows: CronRunRow[], now: Date = new Date()): CronRunRow[] {
  const cutoffMs = now.getTime() - 7 * 24 * 60 * 60 * 1000
  return rows.filter((r) => new Date(r.started_at).getTime() >= cutoffMs)
}

export function formatDuration(ms: number | null): string {
  if (ms === null || ms === undefined) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}
