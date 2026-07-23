import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { logError, logInfo, logWarn } from '@/lib/log'
import { existeExecucaoEmAndamento, finishCronRun, notificarFalhaCron, startCronRun, type CronRunFinal } from '@/lib/cron/tracker'
import { classificarExecucao, motivoResumido } from '@/lib/cron/classificacao'
import { buildUnsubscribeUrl, montarHtml } from '@/lib/cron/email-followup-helpers'
import { enviarEmailResend } from '@/lib/email/resend'
import { ETAPAS_EMAIL_FALLBACK, type EtapaEmailFallback } from '@/lib/cron/fallback-defaults'
import { dentroDoHorarioPermitido } from '@/lib/automacoes/horario'

export const dynamic = 'force-dynamic'

// Régua de e-mail D+2 e D+7 para leads com e-mail cadastrado.
// TRAVAS DE SEGURANÇA (skipped=true, nunca dispara sem estar tudo pronto):
//   - RESEND_FROM: remetente de domínio verificado no Resend
//   - UNSUBSCRIBE_SECRET: sem ele não conseguimos gerar link de opt-out (LGPD)
//
// Histórico de execuções persistido em cron_runs (Pilha D). Guards de envs
// operacionais (RESEND/UNSUBSCRIBE_SECRET) ficam DENTRO do try pra que dias
// pulados por env ausente também apareçam no histórico como status='skipped'.

const SOURCE = 'email-followup'
const CRON_NAME = 'email-followup'

// Fonte de verdade agora é o banco (automacao_email_passos, editável em
// /dashboard/automacoes) — ETAPAS_EMAIL_FALLBACK (src/lib/cron/fallback-defaults.ts)
// só é usado se a leitura falhar ou vier vazia. Placeholders
// {nome}/{empreendimento}, mesma convenção já usada no cron de WhatsApp.
type EtapaEmail = EtapaEmailFallback

async function carregarConfigEmail(supabase: SupabaseClient): Promise<EtapaEmail[]> {
  const { data, error } = await supabase
    .from('automacao_email_passos')
    .select('ordem, dias_minimos, assunto, corpo_html')
    .order('ordem', { ascending: true })

  if (error) {
    logWarn(SOURCE, 'automacao_email_passos indisponivel, usando fallback hardcoded', { db_message: error.message })
    return ETAPAS_EMAIL_FALLBACK
  }
  if (!data || data.length === 0) return ETAPAS_EMAIL_FALLBACK
  return (data as { dias_minimos: number; assunto: string; corpo_html: string }[]).map((r) => ({
    diasMinimos: r.dias_minimos,
    assunto: r.assunto,
    corpoHtml: r.corpo_html,
  }))
}

// Config global de segurança (automacao_config, migration 0015) — mesmo
// helper conceitual do cron de WhatsApp (src/app/api/cron/followup/route.ts),
// duplicado aqui em vez de extraído pra lib porque cada cron já tem seu
// próprio SOURCE de log e o helper é pequeno o bastante pra não justificar
// mais um arquivo compartilhado.
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

// Ver comentário no ponto de uso: `leads.email_followup_em` como proxy de
// "e-mails de follow-up enviados hoje" (não existe log de envio separado).
async function contarEnviosEmailHoje(supabase: SupabaseClient): Promise<number> {
  try {
    const inicioHoje = new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z'
    const { count, error } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('email_followup_em', inicioHoje)
    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}

function substituirPlaceholders(txt: string, nome: string, empreendimento: string): string {
  return txt.replace(/{nome}/g, nome).replace(/{empreendimento}/g, empreendimento)
}

async function enviarEmail(para: string, assunto: string, html: string, unsubUrl: string): Promise<boolean> {
  const resultado = await enviarEmailResend({
    to: para,
    subject: assunto,
    html,
    headers: {
      'List-Unsubscribe': `<${unsubUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })
  if (!resultado.ok) {
    logError(SOURCE, 'resend send failed', new Error(resultado.error))
    return false
  }
  return true
}

export async function GET(req: NextRequest) {
  // 1) Auth — sem persist (supabase pode nem estar disponível)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2) Envs Supabase — sem persist (obviamente)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Configuracao incompleta' }, { status: 503 })
  }

  // 3) Client + guarda de concorrência — se já tem uma execução rodando pra
  // este cron, não inicia outra em paralelo (evita processar/enviar o mesmo
  // lead duas vezes se o cron for disparado manualmente enquanto o agendado roda)
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  if (await existeExecucaoEmAndamento(supabase, CRON_NAME)) {
    return NextResponse.json({ skipped: true, motivo: 'já existe uma execução deste cron em andamento' })
  }
  const { runId, startedAt } = await startCronRun(supabase, CRON_NAME)

  // 4) Result acumulado — sempre setado em cada return path, finally usa
  let result: CronRunFinal | undefined

  try {
    // Guards operacionais dentro do try: dias pulados por env ausente aparecem no histórico
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
      result = { status: 'skipped', motivo: 'RESEND_FROM não configurado (domínio verificado no Resend)' }
      return NextResponse.json({ skipped: true, motivo: result.motivo })
    }

    if (!process.env.UNSUBSCRIBE_SECRET) {
      logWarn(SOURCE, 'skipped: UNSUBSCRIBE_SECRET ausente')
      result = { status: 'skipped', motivo: 'UNSUBSCRIBE_SECRET ausente' }
      return NextResponse.json({ skipped: true, motivo: result.motivo })
    }

    // Trava manual (/dashboard/automacoes) — mesma lógica do cron de WhatsApp
    // (src/app/api/cron/followup/route.ts): pausar tudo ou restringir a
    // janela de horário permitido, checada antes de carregar leads.
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

    const ETAPAS = await carregarConfigEmail(supabase)

    const { data: leadsBrutos, error } = await supabase
      .from('leads')
      .select('id, nome, email, created_at, email_followup_etapa, property_id, property_name, status')
      .not('email', 'is', null)
      .is('unsubscribed_at', null)
      .lt('email_followup_etapa', ETAPAS.length)
      .in('status', ['novo', 'ativo'])
      .limit(30)

    if (error) {
      if (error.code === 'PGRST204' || /column/i.test(error.message ?? '')) {
        logWarn(SOURCE, 'migration pendente (0004 ou 0005)', { db_message: error.message ?? '' })
        result = { status: 'skipped', motivo: 'migração 0004 ou 0005 pendente' }
        return NextResponse.json({ skipped: true, motivo: result.motivo })
      }
      logError(SOURCE, 'db select failed', error)
      result = { status: 'error', motivo: error.message ?? 'DB error' }
      return NextResponse.json({ error: 'DB error', details: error.message }, { status: 500 })
    }

    // Limite diário (opcional) — corta a lista ANTES do loop, mesmo padrão do
    // cron de WhatsApp. Simplificação documentada: não existe uma tabela de
    // log de envio de e-mail separada, então usamos `leads.email_followup_em`
    // (atualizado a cada envio bem-sucedido, logo abaixo no loop) como proxy
    // de "e-mails de follow-up enviados hoje" — meia-noite UTC como proxy do
    // início do dia em São Paulo, mesma aproximação aceitável do cron de WhatsApp.
    let leads = leadsBrutos ?? []
    let cortadosPorLimiteDiario = 0
    if (automacaoConfig.limite_diario !== null) {
      const enviadosHoje = await contarEnviosEmailHoje(supabase)
      const restam = Math.max(0, automacaoConfig.limite_diario - enviadosHoje)
      if (leads.length > restam) {
        cortadosPorLimiteDiario = leads.length - restam
        leads = leads.slice(0, restam)
      }
    }

    const agora = Date.now()
    const resultados: Array<{ id: string; acao: string }> = []

    for (const lead of leads) {
      const etapaAtual: number = lead.email_followup_etapa ?? 0
      const etapa = ETAPAS[etapaAtual]
      if (!etapa) continue

      const idadeDias = (agora - new Date(lead.created_at).getTime()) / 86400000
      if (idadeDias < etapa.diasMinimos) {
        resultados.push({ id: lead.id, acao: 'aguardando' })
        continue
      }

      let nomeEmp = lead.property_name || 'nosso empreendimento'
      if (!lead.property_name && lead.property_id) {
        const { data: prop } = await supabase
          .from('properties')
          .select('nome')
          .eq('id', lead.property_id)
          .maybeSingle()
        if (prop?.nome) nomeEmp = prop.nome
      }

      const primeiroNome = (lead.nome ?? '').split(' ')[0] || 'tudo bem'
      const unsubUrl = buildUnsubscribeUrl(lead.id)
      const ok = await enviarEmail(
        lead.email,
        substituirPlaceholders(etapa.assunto, primeiroNome, nomeEmp),
        montarHtml(substituirPlaceholders(etapa.corpoHtml, primeiroNome, nomeEmp), unsubUrl),
        unsubUrl,
      )

      if (ok) {
        await supabase
          .from('leads')
          .update({
            email_followup_etapa: etapaAtual + 1,
            email_followup_em: new Date().toISOString(),
          })
          .eq('id', lead.id)
        resultados.push({ id: lead.id, acao: `enviado_etapa_${etapaAtual + 1}` })
      } else {
        resultados.push({ id: lead.id, acao: 'erro_envio' })
      }

      await new Promise((r) => setTimeout(r, 600))
    }

    const enviados = resultados.filter((r) => r.acao.startsWith('enviado')).length
    const pulados = resultados.filter((r) => r.acao === 'aguardando').length
    const erros_envio = resultados.filter((r) => r.acao === 'erro_envio').length
    const summary = { processados: resultados.length, enviados, pulados, erros_envio }
    const status = classificarExecucao({ enviados, erros_envio })
    logInfo(SOURCE, 'run summary', { ...summary, status, cortados_por_limite_diario: cortadosPorLimiteDiario })
    result = {
      status,
      motivo: motivoResumido(status, { enviados, erros_envio }),
      ...summary,
      details: { cortados_por_limite_diario: cortadosPorLimiteDiario },
    }
    return NextResponse.json({ ...summary, status, cortados_por_limite_diario: cortadosPorLimiteDiario })
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
