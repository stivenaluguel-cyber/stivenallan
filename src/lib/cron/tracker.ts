import type { SupabaseClient } from '@supabase/supabase-js'
import { logError, logWarn } from '@/lib/log'

// Persistência das execuções de cron. Fail-open em ambas as pontas:
// se a tabela cron_runs não existe (0006 pendente) ou a rede falha,
// os crons continuam rodando — só ficamos sem histórico daquele run.

const SOURCE = 'cron/tracker'

// Uma run "running" com mais de 30min é considerada morta pra fins de
// detecção de concorrência (nunca bloqueia por causa de uma row travada
// por uma invocação anterior que morreu sem chamar finishCronRun).
const CONCORRENCIA_JANELA_MS = 30 * 60 * 1000

export type CronRunFinal = {
  status: 'ok' | 'partial' | 'skipped' | 'error'
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

// Chame ANTES de startCronRun. Se retornar true, a rota deve responder
// {skipped:true, motivo:'execução concorrente'} sem inserir uma nova row —
// já existe uma execução do mesmo cron em andamento (proteção contra duas
// invocações simultâneas processarem/enviarem pro mesmo lead em paralelo).
export async function existeExecucaoEmAndamento(supabase: SupabaseClient, cronName: string): Promise<boolean> {
  try {
    const cutoff = new Date(Date.now() - CONCORRENCIA_JANELA_MS).toISOString()
    const { data, error } = await supabase
      .from('cron_runs')
      .select('id')
      .eq('cron_name', cronName)
      .eq('status', 'running')
      .gte('started_at', cutoff)
      .limit(1)
    if (error) return false // fail-open — leitura falhando não pode travar o cron
    return (data?.length ?? 0) > 0
  } catch {
    return false
  }
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

// Insere um alerta no sino (crm_notificacoes) quando uma run termina 'partial'
// ou 'error' — sem isso o sino nunca soube que um cron tinha falhado, e o
// operador só descobria entrando manualmente em /dashboard/cron. Dedupe: não
// insere de novo enquanto já existir uma notificação não lida para o MESMO
// cron (evita spam a cada execução enquanto o problema não é resolvido).
export async function notificarFalhaCron(
  supabase: SupabaseClient,
  cronName: string,
  result: CronRunFinal,
): Promise<void> {
  if (result.status !== 'partial' && result.status !== 'error') return

  try {
    const { data: existentes } = await supabase
      .from('crm_notificacoes')
      .select('id')
      .eq('tipo', 'cron_falha')
      .eq('lida', false)
      .contains('metadata', { cron_name: cronName })
      .limit(1)

    if (existentes && existentes.length > 0) return

    const rotulo = result.status === 'error' ? 'falhou' : 'parcial'
    await supabase.from('crm_notificacoes').insert({
      tipo: 'cron_falha',
      titulo: `Cron "${cronName}" ${rotulo}`,
      corpo: result.motivo ?? `${result.erros_envio ?? 0} erro(s) de envio nesta execução.`,
      lida: false,
      link: '/dashboard/cron',
      metadata: { cron_name: cronName, status: result.status },
    })
  } catch (err) {
    logError(SOURCE, 'notificarFalhaCron failed', err, { cronName })
  }
}
