import type { SupabaseClient } from '@supabase/supabase-js'
import { logError, logWarn } from '@/lib/log'

// Persistência das execuções de cron. Fail-open em ambas as pontas:
// se a tabela cron_runs não existe (0006 pendente) ou a rede falha,
// os crons continuam rodando — só ficamos sem histórico daquele run.

const SOURCE = 'cron/tracker'

export type CronRunFinal = {
  status: 'ok' | 'skipped' | 'error'
  motivo?: string
  processados?: number
  enviados?: number
  pulados?: number
  erros_envio?: number
  details?: Record<string, unknown>
}

export type StartResult = {
  runId: string | null
  startedAt: Date
}

export async function startCronRun(
  supabase: SupabaseClient,
  cronName: string,
): Promise<StartResult> {
  const startedAt = new Date()
  try {
    const { data, error } = await supabase
      .from('cron_runs')
      .insert({
        cron_name: cronName,
        started_at: startedAt.toISOString(),
        status: 'running',
      })
      .select('id')
      .single()
    if (error) throw error
    return { runId: (data?.id as string | undefined) ?? null, startedAt }
  } catch (err) {
    logWarn(SOURCE, 'startCronRun failed — migration 0006 pendente?', {
      cron: cronName,
      error: err instanceof Error ? err.message : err,
    })
    return { runId: null, startedAt }
  }
}

export async function finishCronRun(
  supabase: SupabaseClient,
  runId: string | null,
  startedAt: Date,
  result: CronRunFinal,
): Promise<void> {
  // Se startCronRun não persistiu (0006 pendente), silêncio total no finish.
  if (runId === null) return

  const endedAt = new Date()
  const durationMs = endedAt.getTime() - startedAt.getTime()

  try {
    const { error } = await supabase
      .from('cron_runs')
      .update({
        ended_at: endedAt.toISOString(),
        duration_ms: durationMs,
        status: result.status,
        motivo: result.motivo ?? null,
        processados: result.processados ?? null,
        enviados: result.enviados ?? null,
        pulados: result.pulados ?? null,
        erros_envio: result.erros_envio ?? null,
        details: result.details ?? null,
      })
      .eq('id', runId)
    if (error) throw error
  } catch (err) {
    // Não relança — cron não pode cair por causa de best-effort logging.
    logError(SOURCE, 'finishCronRun failed', err, { runId })
  }
}
