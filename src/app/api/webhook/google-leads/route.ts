import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verificarChaveGoogle, extrairCamposLeadGoogle, type PayloadLeadGoogle } from '@/lib/leads/google-leads-webhook'
import { upsertAdsLead } from '@/lib/leads/upsert-ads-lead'
import { notificarLeadNovo } from '@/lib/leads/notificar-lead-novo'
import { logError, logInfo } from '@/lib/log'

export const dynamic = 'force-dynamic'

const SOURCE = 'webhook/google-leads'

// Entrega automática de leads do Google Ads (Ferramentas > Ativos de leads
// > Configurações de download de leads > Webhook) — POST único por lead,
// sem etapa de handshake (diferente do Meta).
export async function POST(req: NextRequest) {
  const chaveEsperada = process.env.GOOGLE_LEADS_WEBHOOK_KEY
  if (!chaveEsperada) return NextResponse.json({ error: 'Webhook nao configurado' }, { status: 503 })

  let payload: PayloadLeadGoogle
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  if (!verificarChaveGoogle({ chaveEsperada, payload })) {
    return NextResponse.json({ error: 'Chave invalida' }, { status: 401 })
  }

  // Leads de teste (botão "Testar formulário" no Google Ads) não devem
  // poluir o Kanban de leads reais.
  if (payload.is_test === true) {
    return NextResponse.json({ ok: true, ignorado: 'lead de teste' })
  }

  const campos = extrairCamposLeadGoogle(payload)
  const formId = typeof payload.form_id === 'string' ? payload.form_id : 'desconhecido'

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    const resultado = await upsertAdsLead(supabase, {
      nome: campos.nome,
      whatsapp: campos.whatsapp,
      email: campos.email,
      origem: 'Google Ads',
      source: `google_lead_ads:${formId}`,
    })
    logInfo(SOURCE, 'lead do google processado', { leadId: payload.lead_id, status: resultado.status })
    if (resultado.status === 'created') {
      notificarLeadNovo(supabase, { id: resultado.id, nome: campos.nome, origem: 'Google Ads' }).catch((err) =>
        logError(SOURCE, 'falha ao notificar lead novo (push)', err),
      )
    }
  } catch (err) {
    logError(SOURCE, 'falha ao processar lead do google', err, { leadId: payload.lead_id })
  }

  return NextResponse.json({ ok: true })
}
