import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verificarAssinaturaResend, MAPA_TIPO_EVENTO } from '@/lib/campanhas/resend-webhook'

export const dynamic = 'force-dynamic'

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type ResendEvento = {
  type?: string
  data?: { email_id?: string; click?: { link?: string } }
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Webhook nao configurado' }, { status: 503 })

  // Corpo RAW obrigatório — a assinatura quebra se o body for reserializado,
  // então lemos como texto antes de qualquer JSON.parse.
  const rawBody = await req.text()
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Headers de assinatura ausentes' }, { status: 400 })
  }

  const valido = verificarAssinaturaResend({ secret, svixId, svixTimestamp, svixSignature, rawBody })
  if (!valido) return NextResponse.json({ error: 'Assinatura invalida' }, { status: 401 })

  let evento: ResendEvento
  try {
    evento = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  const tipo = evento.type ? MAPA_TIPO_EVENTO[evento.type] : undefined
  // Tipo fora do mapa (email.sent, email.delivery_delayed, email.failed,
  // email.received, etc.) — reconhece e não faz nada.
  if (!tipo) return NextResponse.json({ ok: true })

  const messageId = evento.data?.email_id
  if (!messageId) return NextResponse.json({ ok: true })

  const supabase = sb()
  const { data: destinatario } = await supabase
    .from('campanha_destinatarios')
    .select('campanha_id, lead_id')
    .eq('resend_message_id', messageId)
    .maybeSingle()

  // Evento de e-mail fora de uma campanha (ex: régua automática ou
  // recuperação de senha) — não é o que este webhook cobre, ignora.
  if (!destinatario) return NextResponse.json({ ok: true })

  await supabase.from('campanha_eventos').insert({
    campanha_id: destinatario.campanha_id,
    lead_id: destinatario.lead_id,
    tipo,
    metadata: evento.data?.click?.link ? { link: evento.data.click.link } : null,
  })

  if (destinatario.lead_id) {
    if (tipo === 'aberto' || tipo === 'clicado') {
      const bump = tipo === 'clicado' ? 15 : 5
      const { data: lead } = await supabase.from('leads').select('lead_score').eq('id', destinatario.lead_id).maybeSingle()
      const novoScore = Math.min(100, (lead?.lead_score ?? 0) + bump)
      await supabase.from('leads').update({ lead_score: novoScore }).eq('id', destinatario.lead_id)
    } else if (tipo === 'bounce' || tipo === 'reclamado') {
      // Suprime o mesmo jeito que um descadastro manual (unsubscribed_at já
      // é respeitado pelo cron de régua e pela resolução de audiência das
      // campanhas) — só o motivo distingue "endereço ruim" de "opt-out".
      await supabase.from('leads').update({
        unsubscribed_at: new Date().toISOString(),
        unsubscribe_motivo: tipo === 'bounce' ? 'bounce' : 'reclamacao',
      }).eq('id', destinatario.lead_id)
    }
  }

  return NextResponse.json({ ok: true })
}
