import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { enviarFollowUp, enviarAlertaEscalada } from '@/lib/evolution'
import { logError, logInfo, logWarn } from '@/lib/log'
import { existeExecucaoEmAndamento, finishCronRun, notificarFalhaCron, startCronRun, type CronRunFinal } from '@/lib/cron/tracker'
import { classificarExecucao, motivoResumido } from '@/lib/cron/classificacao'
import { MENSAGENS_FOLLOWUP_FALLBACK, INTERVALOS_FALLBACK } from '@/lib/cron/fallback-defaults'
import { dentroDoHorarioPermitido } from '@/lib/automacoes/horario'

export const dynamic = 'force-dynamic'

// Cron de follow-up por WhatsApp (Evolution API). Igual ao email-followup:
// guards operacionais (Evolution) ficam DENTRO do try pra que dias pulados
// por env ausente apareçam no histórico como status='skipped'.

const SOURCE = 'followup'
const CRON_NAME = 'followup'

type ConfigFollowUp = { mensagens: Record<string, string[]>; intervalos: number[] }

// Config global de segurança (automacao_config, migration 0015) — pausar
// tudo, janela de horário permitido, limite diário de envios. Fail-open: se
// a tabela ainda não existe ou a leitura falhar, usa o mesmo default que a
// rota /api/admin/automacoes/config expõe pro dashboard.
type AutomacaoConfig = { pausado: boolean; horario_inicio: string; horario_fim: string; limite_diario: number | null }
const AUTOMACAO_CONFIG_DEFAULT: AutomacaoConfig = { pausado: false, horario_inicio: '08:00', horario_fim: '20:00', limite_diario: null }

async function carregarAutomacaoConfig(supabase: SupabaseClient): Promise<AutomacaoConfig> {
  try {
    const { data, error } = await supabase.from('automacao_config').select('*').eq('id', true).maybeSingle()
    if (error || !data) return AUTOMACAO_CONFIG_DEFAULT
    return {
      pausado: Boolean(data.pausado),
      horario_inicio: data.horario_inicio ?? AUTOMACAO_CONFIG_DEFAULT.horario_inicio,
      horario_fim: data.horario_fim ?? AUTOMACAO_CONFIG_DEFAULT.horario_fim,
      limite_diario: data.limite_diario ?? null,
    }
  } catch {
    return AUTOMACAO_CONFIG_DEFAULT
  }
}

// Quantos follow-ups de WhatsApp já foram enviados HOJE, pra respeitar
// limite_diario. Simplificação documentada: usamos meia-noite UTC como proxy
// do início do dia em São Paulo (em vez de calcular o offset exato do
// timezone) — na pior das hipóteses a janela de contagem erra por até 3h
// (o offset de Brasília), o que é aceitável para um limite diário aproximado
// e evita complexidade extra de fuso horário só para essa contagem.
async function contarEnviosWhatsappHoje(supabase: SupabaseClient): Promise<number> {
  try {
    const inicioHoje = new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z'
    const { count, error } = await supabase
      .from('interacoes')
      .select('id', { count: 'exact', head: true })
      .eq('canal', 'whatsapp')
      .eq('direcao', 'saida')
      .eq('processado_por_ia', true)
      .gte('created_at', inicioHoje)
    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}

async function carregarConfigFollowUp(supabase: SupabaseClient): Promise<ConfigFollowUp> {
  const [{ data: msgsRows, error: msgsErr }, { data: intRows, error: intErr }] = await Promise.all([
    supabase.from('automacao_whatsapp_mensagens').select('estagio_funil, ordem, mensagem').order('ordem', { ascending: true }),
    supabase.from('automacao_whatsapp_intervalos').select('ordem, dias').order('ordem', { ascending: true }),
  ])

  let mensagens = MENSAGENS_FOLLOWUP_FALLBACK
  if (!msgsErr && msgsRows && msgsRows.length > 0) {
    const agrupado: Record<string, string[]> = {}
    for (const r of msgsRows as { estagio_funil: string; ordem: number; mensagem: string }[]) {
      agrupado[r.estagio_funil] = agrupado[r.estagio_funil] ?? []
      agrupado[r.estagio_funil].push(r.mensagem)
    }
    mensagens = agrupado
  } else if (msgsErr) {
    logWarn(SOURCE, 'automacao_whatsapp_mensagens indisponivel, usando fallback hardcoded', { db_message: msgsErr.message })
  }

  let intervalos = INTERVALOS_FALLBACK
  if (!intErr && intRows && intRows.length > 0) {
    intervalos = (intRows as { ordem: number; dias: number }[]).map((r) => r.dias)
  } else if (intErr) {
    logWarn(SOURCE, 'automacao_whatsapp_intervalos indisponivel, usando fallback hardcoded', { db_message: intErr.message })
  }

  return { mensagens, intervalos }
}

function getMensagemFollowUp(mensagens: Record<string, string[]>, estagio: string, tentativa: number, nome: string, empreendimento: string): string | null {
  const msgs = mensagens[estagio]
  if (!msgs || tentativa >= msgs.length) return null
  return msgs[tentativa]
    .replace(/{nome}/g, nome.split(' ')[0])
    .replace(/{empreendimento}/g, empreendimento)
}

type LeadRow = {
  id: string
  nome: string | null
  whatsapp: string
  estagio_funil: string
  tentativas_followup?: number | null
  empreendimento_interesse?: string | null
  property_id?: string | null
  property_name?: string | null
  lead_score?: number | null
}

async function processarLeadFollowUp(supabase: SupabaseClient, lead: LeadRow, config: ConfigFollowUp) {
  const {
    id,
    nome,
    whatsapp,
    estagio_funil,
    tentativas_followup = 0,
    empreendimento_interesse,
    property_id,
    property_name,
    lead_score = 0,
  } = lead

  let nomeEmpreendimento = property_name || 'nosso empreendimento'
  if (!property_name && property_id) {
    const { data: prop } = await supabase
      .from('properties')
      .select('nome')
      .eq('id', property_id)
      .maybeSingle()
    if (prop?.nome) nomeEmpreendimento = prop.nome
  } else if (!property_name && !property_id && empreendimento_interesse) {
    const { data: emp } = await supabase
      .from('empreendimentos')
      .select('nome')
      .eq('id', empreendimento_interesse)
      .single()
    if (emp) nomeEmpreendimento = emp.nome
  }

  const mensagem = getMensagemFollowUp(config.mensagens, estagio_funil, tentativas_followup ?? 0, nome ?? 'amigo', nomeEmpreendimento)

  // Sem mais mensagens — escalar para Stiven
  if (!mensagem) {
    await enviarAlertaEscalada(whatsapp, nome, lead_score ?? 0)
    await supabase.from('leads').update({
      requer_atencao: true,
      status: 'cold',
      observacoes_ia: 'Sequencia de follow-up esgotada sem resposta. Encaminhado para avaliacao manual.',
    }).eq('id', id)
    return { id, acao: 'escalado' as const }
  }

  const enviado = await enviarFollowUp(whatsapp, mensagem)

  if (!enviado) {
    logError(SOURCE, 'evolution send failed', null, { leadId: id })
    return { id, acao: 'erro' as const }
  }

  const idxIntervalo = Math.min((tentativas_followup ?? 0) + 1, config.intervalos.length - 1)
  const proximoIntervalo = config.intervalos[idxIntervalo]
  const proximoFollowup = new Date()
  proximoFollowup.setDate(proximoFollowup.getDate() + proximoIntervalo)

  await supabase.from('interacoes').insert({
    lead_id: id,
    canal: 'whatsapp',
    direcao: 'saida',
    mensagem,
    processado_por_ia: true,
    intencao_detectada: 'follow_up_automatico',
  })

  await supabase.from('leads').update({
    tentativas_followup: (tentativas_followup ?? 0) + 1,
    ultimo_contato: new Date().toISOString(),
    proximo_followup: proximoFollowup.toISOString(),
  }).eq('id', id)

  return { id, acao: 'mensagem_enviada' as const }
}

export async function GET(req: NextRequest) {
  // 1) Auth — sem persist
  const authHeader = req.headers.get('authorization')
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2) Envs Supabase — sem persist (não temos como)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Configuracao incompleta' }, { status: 503 })
  }

  // 3) Client + guarda de concorrência (mesmo padrão do email-followup)
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  if (await existeExecucaoEmAndamento(supabase, CRON_NAME)) {
    return NextResponse.json({ skipped: true, motivo: 'já existe uma execução deste cron em andamento' })
  }
  const { runId, startedAt } = await startCronRun(supabase, CRON_NAME)

  let result: CronRunFinal | undefined

  try {
    // Guards Evolution — dias pulados por env ausente aparecem no histórico
    if (!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_API_KEY || !process.env.EVOLUTION_INSTANCE) {
      logWarn(SOURCE, 'skipped: envs Evolution ausentes')
      result = { status: 'skipped', motivo: 'EVOLUTION_API_URL / _API_KEY / _INSTANCE ausente' }
      return NextResponse.json({ skipped: true, motivo: result.motivo })
    }

    // Trava manual (/dashboard/automacoes) — pausar tudo ou restringir a
    // janela de horário permitido. Checada ANTES de carregar leads pra não
    // gastar uma query à toa quando a resposta já é "não processa nada".
    const automacaoConfig = await carregarAutomacaoConfig(supabase)
    if (automacaoConfig.pausado) {
      result = { status: 'skipped', motivo: 'automações pausadas manualmente em /dashboard/automacoes' }
      return NextResponse.json({ skipped: true, motivo: result.motivo })
    }
    if (!dentroDoHorarioPermitido(new Date(), automacaoConfig.horario_inicio, automacaoConfig.horario_fim)) {
      result = {
        status: 'skipped',
        motivo: `fora do horário permitido (${automacaoConfig.horario_inicio}–${automacaoConfig.horario_fim}, America/Sao_Paulo)`,
      }
      return NextResponse.json({ skipped: true, motivo: result.motivo })
    }

    const config = await carregarConfigFollowUp(supabase)

    const agora = new Date().toISOString()
    const { data: leadsBrutos, error } = await supabase
      .from('leads')
      .select('id, nome, whatsapp, estagio_funil, tentativas_followup, empreendimento_interesse, property_id, property_name, lead_score')
      .lte('proximo_followup', agora)
      .eq('requer_atencao', false)
      .in('status', ['novo', 'ativo', 'qualificado'])
      .not('whatsapp', 'is', null)
      .is('unsubscribed_at', null)
      .limit(50)

    if (error) {
      logError(SOURCE, 'db select failed', error)
      result = { status: 'error', motivo: error.message ?? 'DB error' }
      return NextResponse.json({ error: 'DB error', details: error.message }, { status: 500 })
    }

    if (!leadsBrutos || leadsBrutos.length === 0) {
      const summary = { processados: 0, enviados: 0, escalados: 0, erros_envio: 0 }
      logInfo(SOURCE, 'run summary', { ...summary, status: 'ok' })
      result = { status: 'ok', ...summary }
      return NextResponse.json({ message: 'Nenhum lead para follow-up.', processados: 0 })
    }

    // Limite diário (opcional) — corta a lista ANTES do loop de processamento.
    // É um corte intencional (não uma falha), então não afeta o status final.
    let leads = leadsBrutos as LeadRow[]
    let cortadosPorLimiteDiario = 0
    if (automacaoConfig.limite_diario !== null) {
      const enviadosHoje = await contarEnviosWhatsappHoje(supabase)
      const restam = Math.max(0, automacaoConfig.limite_diario - enviadosHoje)
      if (leads.length > restam) {
        cortadosPorLimiteDiario = leads.length - restam
        leads = leads.slice(0, restam)
      }
    }

    if (leads.length === 0) {
      const summary = { processados: 0, enviados: 0, escalados: 0, erros_envio: 0 }
      logInfo(SOURCE, 'run summary', { ...summary, status: 'ok', cortados_por_limite_diario: cortadosPorLimiteDiario })
      result = { status: 'ok', ...summary, details: { escalados: 0, cortados_por_limite_diario: cortadosPorLimiteDiario } }
      return NextResponse.json({ message: 'Limite diário de WhatsApp atingido.', processados: 0 })
    }

    const resultados: Array<{ id: string; acao: 'mensagem_enviada' | 'escalado' | 'erro' }> = []
    for (const lead of leads) {
      const resultado = await processarLeadFollowUp(supabase, lead, config)
      resultados.push(resultado)
      await new Promise((r) => setTimeout(r, 2000))
    }

    const enviados = resultados.filter((r) => r.acao === 'mensagem_enviada').length
    const escalados = resultados.filter((r) => r.acao === 'escalado').length
    const erros_envio = resultados.filter((r) => r.acao === 'erro').length
    const summary = { processados: leads.length, enviados, escalados, erros_envio }
    const status = classificarExecucao({ enviados, erros_envio })
    logInfo(SOURCE, 'run summary', { ...summary, status, cortados_por_limite_diario: cortadosPorLimiteDiario })
    result = {
      status,
      motivo: motivoResumido(status, { enviados, erros_envio }),
      processados: leads.length,
      enviados,
      erros_envio,
      details: { escalados, cortados_por_limite_diario: cortadosPorLimiteDiario },
    }
    return NextResponse.json({ message: 'Follow-ups processados.', ...summary, status, cortados_por_limite_diario: cortadosPorLimiteDiario })
  } catch (err: unknown) {
    logError(SOURCE, 'run failed', err)
    result = { status: 'error', motivo: err instanceof Error ? err.message : String(err) }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  } finally {
    if (result) {
      await finishCronRun(supabase, runId, startedAt, result)
      await notificarFalhaCron(supabase, CRON_NAME, result)
    }
  }
}
