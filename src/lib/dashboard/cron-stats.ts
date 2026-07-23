// Agregações puras sobre rows de cron_runs — testáveis 100% sem DB.

export type CronRunStatus = 'running' | 'ok' | 'partial' | 'skipped' | 'error'

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
  details: Record<string, unknown> | null
}

export type CronStats = {
  total: number
  ok: number
  partial: number
  skipped: number
  errors: number
  running: number
  // Taxa de EXECUÇÃO (o job terminou sem nenhum erro) — considera runs que
  // terminaram (exclui running). 'partial' NÃO conta como sucesso: enviou
  // alguma coisa mas teve erro no meio não é a mesma coisa que 100% ok.
  // Skipped também conta como "não sucesso" — se dois dias seguidos vierem
  // skipped por env faltando, a taxa desce e o operador vê que tem algo quebrado.
  successRate: number
  totalEnviados: number
  totalErrosEnvio: number
  // Taxa de ENTREGA (das mensagens tentadas, quantas realmente saíram) —
  // métrica DISTINTA de successRate: uma run pode ser 'ok' (rodou até o fim)
  // mesmo em um dia com poucos envios, e uma run 'partial' ainda assim entrega
  // a maioria das mensagens. Antes só existia successRate, que mistura as duas coisas.
  taxaEntrega: number
}

export function aggregate(rows: CronRunRow[]): CronStats {
  const total = rows.length
  const ok = rows.filter((r) => r.status === 'ok').length
  const partial = rows.filter((r) => r.status === 'partial').length
  const skipped = rows.filter((r) => r.status === 'skipped').length
  const errors = rows.filter((r) => r.status === 'error').length
  const running = rows.filter((r) => r.status === 'running').length
  const finished = ok + partial + skipped + errors
  const successRate = finished === 0 ? 0 : Math.round((ok / finished) * 100)
  const totalEnviados = rows.reduce((sum, r) => sum + (r.enviados ?? 0), 0)
  const totalErrosEnvio = rows.reduce((sum, r) => sum + (r.erros_envio ?? 0), 0)
  const totalTentativas = totalEnviados + totalErrosEnvio
  const taxaEntrega = totalTentativas === 0 ? 0 : Math.round((totalEnviados / totalTentativas) * 100)
  return {
    total,
    ok,
    partial,
    skipped,
    errors,
    running,
    successRate,
    totalEnviados,
    totalErrosEnvio,
    taxaEntrega,
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

export type DayBucket = {
  day: string // YYYY-MM-DD
  ok: number
  partial: number
  skipped: number
  errors: number
  running: number
}

// Agrupa runs por dia local (fuso do server). Retorna N dias (mais antigo → mais recente),
// incluindo dias vazios pra que o chart não pule buracos temporais.
export function aggregateByDay(rows: CronRunRow[], days: number = 7, now: Date = new Date()): DayBucket[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const buckets: Record<string, DayBucket> = {}
  const order: string[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    buckets[key] = { day: key, ok: 0, partial: 0, skipped: 0, errors: 0, running: 0 }
    order.push(key)
  }

  for (const r of rows) {
    const d = new Date(r.started_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const bucket = buckets[key]
    if (!bucket) continue // fora da janela
    if (r.status === 'ok') bucket.ok++
    else if (r.status === 'partial') bucket.partial++
    else if (r.status === 'skipped') bucket.skipped++
    else if (r.status === 'error') bucket.errors++
    else if (r.status === 'running') bucket.running++
  }

  return order.map((k) => buckets[k])
}
