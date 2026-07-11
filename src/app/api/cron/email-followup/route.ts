import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateUnsubscribeToken } from '@/lib/leads/unsubscribe-token'
import { logError, logInfo, logWarn } from '@/lib/log'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'

// Régua de e-mail D+2 e D+7 para leads com e-mail cadastrado.
// TRAVAS DE SEGURANÇA (fail-open com skipped=true, nunca dispara sem estar tudo pronto):
//   - RESEND_FROM: remetente de domínio verificado no Resend
//     (o onboarding@resend.dev só entrega para o dono da conta)
//   - UNSUBSCRIBE_SECRET: sem ele não conseguimos gerar link de opt-out — LGPD
//     obriga o mecanismo, então não enviamos e-mail que ficaria não-compliance.

const SOURCE = 'email-followup'
const WPP_LINK = 'https://wa.me/5548991642332'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

type EtapaEmail = {
  diasMinimos: number
  assunto: (emp: string) => string
  corpo: (nome: string, emp: string) => string
}

const ETAPAS: EtapaEmail[] = [
  {
    diasMinimos: 2,
    assunto: () => 'Por que ninguém te explicou o financiamento sem banco?',
    corpo: (nome, emp) => `
      <p>Olá ${nome},</p>
      <p>A pergunta que mais recebo é sempre a mesma: <strong>"como assim, comprar apartamento sem banco?"</strong></p>
      <p>É mais simples do que parece — e escrevi um guia completo explicando: entrada de 20%, parcelas durante a obra corrigidas pelo CUB/SC, e nenhuma análise bancária no processo.</p>
      <p><a href="https://stivenallan.com.br/guia/financiamento-direto-construtora" style="color:#1A5C3A;font-weight:700">→ Leia o guia do financiamento direto</a></p>
      <p>Se ficou qualquer dúvida sobre o ${emp}, <a href="${WPP_LINK}" style="color:#1A5C3A">me chama no WhatsApp</a> que eu explico com os números do seu caso.</p>
    `,
  },
  {
    diasMinimos: 7,
    assunto: (emp) => `A tabela do ${emp} muda com a obra`,
    corpo: (nome, emp) => `
      <p>Olá ${nome},</p>
      <p>Um aviso honesto antes de eu parar de te escrever: <strong>a tabela do ${emp} é reajustada a cada fase da obra</strong>. As condições que eu te apresentaria hoje não são as mesmas do mês que vem.</p>
      <p>Se o momento não é agora, tudo bem — o link no rodapé te tira desta régua sem compromisso.</p>
      <p><a href="${WPP_LINK}" style="color:#1A5C3A;font-weight:700">→ Ver os números de hoje no WhatsApp</a></p>
    `,
  },
]

// Exportado para permitir teste unitário isolado do URL do opt-out
export function _buildUnsubscribeUrl(leadId: string): string {
  const token = generateUnsubscribeToken(leadId)
  return `${SITE_URL}/api/unsubscribe?lead_id=${encodeURIComponent(leadId)}&token=${token}`
}

export function _montarHtml(corpo: string, unsubUrl: string): string {
  return `
  <div style="background:#F3F2EE;padding:32px 16px;font-family:system-ui,-apple-system,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
      <div style="background:#1A1A1A;padding:20px 24px;text-align:center">
        <p style="color:#F5F2ED;font-size:13px;letter-spacing:0.22em;text-transform:uppercase;margin:0">Stiven Allan</p>
      </div>
      <div style="padding:28px 24px;color:#333;font-size:15px;line-height:1.7">
        ${corpo}
        <p style="margin-top:24px">Um abraço,<br/><strong>Stiven Allan</strong> — CRECI 60.275<br/>
        <a href="https://stivenallan.com.br" style="color:#1A5C3A">stivenallan.com.br</a></p>
      </div>
      <div style="padding:14px 24px;background:#FAFAF8;border-top:1px solid #eee">
        <p style="color:#999;font-size:12px;margin:0">Você recebeu este e-mail porque se cadastrou em stivenallan.com.br. <a href="${unsubUrl}" style="color:#999;text-decoration:underline">Descadastrar</a>.</p>
      </div>
    </div>
  </div>`
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
      // RFC 8058: Gmail/Outlook expõem botão "Cancelar inscrição" nativo quando esses headers estão presentes.
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
  const authHeader = req.headers.get('authorization')
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    return NextResponse.json({
      skipped: true,
      motivo: 'RESEND_FROM não configurado (domínio verificado no Resend)',
    })
  }

  if (!process.env.UNSUBSCRIBE_SECRET) {
    // Sem link de opt-out não enviamos: e-mail sem unsubscribe fere LGPD.
    logWarn(SOURCE, 'skipped: UNSUBSCRIBE_SECRET ausente')
    return NextResponse.json({ skipped: true, motivo: 'UNSUBSCRIBE_SECRET ausente' })
  }

  try {
    const supabase = getSupabase()

    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, nome, email, created_at, email_followup_etapa, property_id, property_name, status')
      .not('email', 'is', null)
      .is('unsubscribed_at', null) // Pula quem já fez opt-out
      .lt('email_followup_etapa', ETAPAS.length)
      .in('status', ['novo', 'ativo'])
      .limit(30)

    if (error) {
      if (error.code === 'PGRST204' || /column/i.test(error.message ?? '')) {
        logWarn(SOURCE, 'migration pendente (0004 ou 0005)', { db_message: error.message ?? '' })
        return NextResponse.json({ skipped: true, motivo: 'migração 0004 ou 0005 pendente' })
      }
      logError(SOURCE, 'db select failed', error)
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
      const unsubUrl = _buildUnsubscribeUrl(lead.id)
      const ok = await enviarEmail(
        lead.email,
        etapa.assunto(nomeEmp),
        _montarHtml(etapa.corpo(primeiroNome, nomeEmp), unsubUrl),
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
    return NextResponse.json(summary)
  } catch (err: unknown) {
    logError(SOURCE, 'run failed', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
