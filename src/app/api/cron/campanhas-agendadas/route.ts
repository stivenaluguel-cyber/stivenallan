import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logError, logInfo } from '@/lib/log'
import { finishCronRun, startCronRun, type CronRunFinal } from '@/lib/cron/tracker'
import { processarEnvioCampanha } from '@/lib/campanhas/processar-envio'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SOURCE = 'campanhas-agendadas'
const CRON_NAME = 'campanhas-agendadas'

// Promove campanhas com status='agendada' e agendada_para<=agora pra
// processamento (mesma função de envio usada pelo clique manual de "Enviar
// agora" — processarEnvioCampanha já resolve a transição de status de forma
// atômica, então não há corrida entre este cron e um clique manual
// simultâneo). Roda 1x/dia às 11:00 UTC / 08:00 BRT (vercel.json) — limite
// do plano Hobby da Vercel só permite crons diários. Isso significa que uma
// campanha agendada pra qualquer horário do dia só sai no próximo 08:00 BRT
// (até ~18h de atraso) — o aviso disso está na UI de agendamento
// (dashboard/campanhas/[id]/page.tsx). Cada campanha due processa só o
// primeiro lote de 50 pendentes por invocação, igual ao envio manual; se
// sobrar pendente, a próxima invocação do cron (no dia seguinte) continua
// sozinha — ou o operador clica "Continuar envio" pra não esperar.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Configuracao incompleta' }, { status: 503 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { runId, startedAt } = await startCronRun(supabase, CRON_NAME)

  let result: CronRunFinal | undefined

  try {
    const { data: due, error } = await supabase
      .from('campanhas')
      .select('id')
      .eq('status', 'agendada')
      .lte('agendada_para', new Date().toISOString())

    if (error) {
      result = { status: 'error', motivo: error.message }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let enviados = 0
    let erros_envio = 0
    const processadas: string[] = []

    for (const campanha of due ?? []) {
      const r = await processarEnvioCampanha(supabase, campanha.id)
      processadas.push(campanha.id)
      if (r.ok) {
        enviados += r.enviados
        erros_envio += r.erros
      } else {
        erros_envio += 1
        logError(SOURCE, 'falha ao processar campanha agendada', null, { campanhaId: campanha.id, motivo: r.error })
      }
    }

    const summary = { processados: processadas.length, enviados, erros_envio }
    logInfo(SOURCE, 'run summary', summary)
    result = { status: erros_envio > 0 && enviados === 0 ? 'error' : 'ok', ...summary }
    return NextResponse.json({ message: 'Campanhas agendadas processadas.', ...summary, campanhas: processadas })
  } catch (err: unknown) {
    logError(SOURCE, 'run failed', err)
    result = { status: 'error', motivo: err instanceof Error ? err.message : String(err) }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  } finally {
    if (result) await finishCronRun(supabase, runId, startedAt, result)
  }
}
