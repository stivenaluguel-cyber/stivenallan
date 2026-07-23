import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { logError, logInfo, logWarn } from '@/lib/log'
import { finishCronRun, startCronRun, type CronRunFinal } from '@/lib/cron/tracker'
import { buildUnsubscribeUrl, montarHtml } from '@/lib/cron/email-followup-helpers'

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
const WPP_LINK = 'https://wa.me/5548991642332'

// Fonte de verdade agora é o banco (automacao_email_passos, editável em
// /dashboard/automacoes) — ETAPAS_FALLBACK abaixo só é usado se a leitura
// falhar ou vier vazia. Placeholders {nome}/{empreendimento}, mesma convenção
// já usada no cron de WhatsApp.
type EtapaEmail = { diasMinimos: number; assunto: string; corpoHtml: string }

const ETAPAS_FALLBACK: EtapaEmail[] = [
  {
    diasMinimos: 2,
    assunto: 'Por que ninguém te explicou o financiamento sem banco?',
    corpoHtml: `
      <p>Olá {nome},</p>
      <p>A pergunta que mais recebo é sempre a mesma: <strong>"como assim, comprar apartamento sem banco?"</strong></p>
      <p>É mais simples do que parece — e escrevi um guia completo explicando: entrada de 20%, parcelas durante a obra corrigidas pelo CUB/SC, e nenhuma análise bancária no processo.</p>
      <p><a href="https://stivenallan.com.br/guia/financiamento-direto-construtora" style="color:#1A5C3A;font-weight:700">→ Leia o guia do financiamento direto</a></p>
      <p>Se ficou qualquer dúvida sobre o {empreendimento}, <a href="${WPP_LINK}" style="color:#1A5C3A">me chama no WhatsApp</a> que eu explico com os números do seu caso.</p>
    `,
  },
  {
    diasMinimos: 7,
    assunto: 'A tabela do {empreendimento} muda com a obra',
    corpoHtml: `
      <p>Olá {nome},</p>
      <p>Um aviso honesto antes de eu parar de te escrever: <strong>a tabela do {empreendimento} é reajustada a cada fase da obra</strong>. As condições que eu te apresentaria hoje não são as mesmas do mês que vem.</p>
      <p>Se o momento não é agora, tudo bem — o link no rodapé te tira desta régua sem compromisso.</p>
      <p><a href="${WPP_LINK}" style="color:#1A5C3A;font-weight:700">→ Ver os números de hoje no WhatsApp</a></p>
    `,
  },
]

async function carregarConfigEmail(supabase: SupabaseClient): Promise<EtapaEmail[]> {
  const { data, error } = await supabase
    .from('automacao_email_passos')
    .select('ordem, dias_minimos, assunto, corpo_html')
    .order('ordem', { ascending: true })

  if (error) {
    logWarn(SOURCE, 'automacao_email_passos indisponivel, usando fallback hardcoded', { db_message: error.message })
    return ETAPAS_FALLBACK
  }
  if (!data || data.length === 0) return ETAPAS_FALLBACK
  return (data as { dias_minimos: number; assunto: string; corpo_html: string }[]).map((r) => ({
    diasMinimos: r.dias_minimos,
    assunto: r.assunto,
    corpoHtml: r.corpo_html,
  }))
}

function substituirPlaceholders(txt: string, nome: string, empreendimento: string): string {
  return txt.replace(/{nome}/g, nome).replace(/{empreendimento}/g, empreendimento)
}

async function enviarEmail(para: string, assunto: string, html: string, unsubUrl: string): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM,
      to: [para],
      subject: assunto,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }),
  })
  if (!res.ok) {
    logError(SOURCE, 'resend send failed', new Error(`status=${res.status} body=${await res.text()}`))
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

  // 3) Client + start do rastreio
  const supabase = createClient(supabaseUrl, serviceRoleKey)
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

    const ETAPAS = await carregarConfigEmail(supabase)

    const { data: leads, error } = await supabase
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

    const agora = Date.now()
    const resultados: Array<{ id: string; acao: string }> = []

    for (const lead of leads ?? []) {
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
    logInfo(SOURCE, 'run summary', summary)
    result = { status: 'ok', ...summary }
    return NextResponse.json(summary)
  } catch (err: unknown) {
    logError(SOURCE, 'run failed', err)
    result = { status: 'error', motivo: err instanceof Error ? err.message : String(err) }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  } finally {
    if (result) {
      await finishCronRun(supabase, runId, startedAt, result)
    }
  }
}
