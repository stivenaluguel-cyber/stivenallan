import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verificarAssinaturaMeta, resolverDesafioVerificacaoMeta } from '@/lib/leads/meta-leadgen-webhook'
import { extrairMensagensInstagram } from '@/lib/leads/instagram-dm-webhook'
import { resolveOrCreateInstagramLead, mensagemInstagramJaProcessada, registrarInteracaoInstagram } from '@/lib/leads/upsert-instagram-lead'
import { notificarLeadNovo } from '@/lib/leads/notificar-lead-novo'
import { logError, logInfo, logWarn } from '@/lib/log'

export const dynamic = 'force-dynamic'

const SOURCE = 'webhook/instagram'
const GRAPH_VERSION = 'v21.0'

// Mesmo handshake de verificação do webhook de Lead Ads (mesmo App, mesmo
// Verify Token — Meta permite múltiplas assinaturas de campo/objeto no
// mesmo App usando o mesmo token).
export async function GET(req: NextRequest) {
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN
  if (!verifyToken) return NextResponse.json({ error: 'Webhook nao configurado' }, { status: 503 })

  const { searchParams } = new URL(req.url)
  const challenge = resolverDesafioVerificacaoMeta({
    verifyTokenEsperado: verifyToken,
    mode: searchParams.get('hub.mode'),
    verifyTokenRecebido: searchParams.get('hub.verify_token'),
    challenge: searchParams.get('hub.challenge'),
  })

  if (!challenge) return NextResponse.json({ error: 'Verificacao invalida' }, { status: 403 })
  return new NextResponse(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } })
}

// Best-effort: nome/usuário do perfil pra não deixar o lead só com o IGSID
// numérico no Kanban. Nunca bloqueia a criação do lead se falhar.
async function buscarNomeInstagram(igsid: string, pageAccessToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${igsid}?fields=name,username&access_token=${encodeURIComponent(pageAccessToken)}`,
    )
    if (!res.ok) return null
    const json = await res.json()
    return (typeof json.name === 'string' && json.name) || (typeof json.username === 'string' && json.username) || null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const appSecret = process.env.META_APP_SECRET
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN
  if (!appSecret || !pageAccessToken) {
    return NextResponse.json({ error: 'Webhook nao configurado' }, { status: 503 })
  }

  const rawBody = await req.text()
  const assinaturaHeader = req.headers.get('x-hub-signature-256')
  const valido = verificarAssinaturaMeta({ appSecret, assinaturaHeader, rawBody })
  if (!valido) return NextResponse.json({ error: 'Assinatura invalida' }, { status: 401 })

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  const mensagens = extrairMensagensInstagram(payload)
  if (mensagens.length === 0) return NextResponse.json({ ok: true })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  for (const msg of mensagens) {
    try {
      // Idempotência: a Meta reenvia a mesma entrega em timeout/resposta
      // não-2xx. Ver mensagemInstagramJaProcessada em upsert-instagram-lead.ts.
      if (msg.mid && (await mensagemInstagramJaProcessada(supabase, msg.mid))) {
        logInfo(SOURCE, 'mensagem ja processada, ignorando redelivery', { senderId: msg.senderId, mid: msg.mid })
        continue
      }

      const nomeSugerido = await buscarNomeInstagram(msg.senderId, pageAccessToken)
      const resultado = await resolveOrCreateInstagramLead(supabase, { igsid: msg.senderId, nomeSugerido })

      if (resultado.status === 'skipped') {
        logWarn(SOURCE, 'lead nao resolvido, mensagem nao registrada', { senderId: msg.senderId, motivo: resultado.motivo })
        continue
      }

      const registro = await registrarInteracaoInstagram(supabase, { leadId: resultado.id, mid: msg.mid, texto: msg.texto })

      logInfo(SOURCE, 'mensagem do instagram processada', { senderId: msg.senderId, leadStatus: resultado.status, registro })
      if (resultado.status === 'created') {
        notificarLeadNovo(supabase, { id: resultado.id, nome: nomeSugerido, origem: 'Instagram DM' }).catch((err) =>
          logError(SOURCE, 'falha ao notificar lead novo (push)', err),
        )
      }
    } catch (err) {
      logError(SOURCE, 'falha ao processar mensagem do instagram', err, { senderId: msg.senderId })
    }
  }

  return NextResponse.json({ ok: true })
}
