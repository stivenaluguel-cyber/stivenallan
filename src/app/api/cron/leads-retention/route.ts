import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { deleteLeadCascade } from '@/lib/leads/delete-lead'
import { logError, logInfo } from '@/lib/log'

// Política de retenção de leads. NÃO agendado como cron ainda (rodar manualmente
// via curl com o CRON_SECRET) — pode virar entrada em vercel.json quando fizer sentido.
//
// Critério de "funil morto" (dois grupos, um OU o outro):
//   A) unsubscribed_at preenchido há mais de 90 dias (opt-out antigo)
//   B) created_at há mais de 2 anos E email_followup_etapa >= 2 (nunca avançou no funil)
//
// GET  = dry-run: retorna quantos/quais leads seriam apagados, SEM apagar nada.
// POST = execução real: exige ?confirm=true, senão também roda em dry-run por segurança.

export const dynamic = 'force-dynamic'

const SOURCE = 'api/cron/leads-retention'
const UNSUB_DAYS = 90
const OLD_YEARS = 2

type CandidateLead = {
  id: string
  nome: string | null
  whatsapp: string | null
  unsubscribed_at: string | null
  created_at: string | null
  email_followup_etapa: number | null
}

function buildFilter(): string {
  const unsubCutoff = new Date(Date.now() - UNSUB_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const oldCutoff = new Date(Date.now() - OLD_YEARS * 365 * 24 * 60 * 60 * 1000).toISOString()
  return (
    `and(unsubscribed_at.not.is.null,unsubscribed_at.lt.${unsubCutoff}),` +
    `and(created_at.lt.${oldCutoff},email_followup_etapa.gte.2)`
  )
}

async function findCandidates(
  supabase: SupabaseClient<any, any, any>,
): Promise<{ data: CandidateLead[] | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from('leads')
    .select('id, nome, whatsapp, unsubscribed_at, created_at, email_followup_etapa')
    .or(buildFilter())
    .limit(500)
  return { data: (data as CandidateLead[] | null) ?? null, error }
}

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
  const { data, error } = await findCandidates(supabase)

  if (error) {
    logError(SOURCE, 'dry-run query failed', error)
    return NextResponse.json({ error: 'Erro ao consultar leads' }, { status: 500 })
  }

  return NextResponse.json({
    dry_run: true,
    count: data?.length ?? 0,
    leads: (data ?? []).map((l) => ({ id: l.id, nome: l.nome, whatsapp: l.whatsapp })),
  })
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const confirmed = url.searchParams.get('confirm') === 'true'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Configuracao incompleta' }, { status: 503 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { data, error } = await findCandidates(supabase)

  if (error) {
    logError(SOURCE, 'query failed', error)
    return NextResponse.json({ error: 'Erro ao consultar leads' }, { status: 500 })
  }

  const candidates = data ?? []

  // Sem ?confirm=true, POST também roda em dry-run — evita apagar dados por engano
  // (ex: um curl copiado errado, ou um bookmark clicado sem querer).
  if (!confirmed) {
    return NextResponse.json({
      dry_run: true,
      motivo: 'Adicione ?confirm=true para executar a exclusão de verdade.',
      count: candidates.length,
      leads: candidates.map((l) => ({ id: l.id, nome: l.nome, whatsapp: l.whatsapp })),
    })
  }

  let deleted = 0
  const failures: string[] = []
  for (const lead of candidates) {
    const { error: delError } = await deleteLeadCascade(supabase, lead.id)
    if (delError) {
      failures.push(lead.id)
    } else {
      deleted++
    }
  }

  logInfo(SOURCE, 'retention run summary', { candidatos: candidates.length, deleted, failures: failures.length })

  return NextResponse.json({
    dry_run: false,
    candidatos: candidates.length,
    deleted,
    failed_ids: failures,
  })
}
