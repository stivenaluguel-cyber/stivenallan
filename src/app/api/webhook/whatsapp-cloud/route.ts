import { NextRequest, NextResponse } from 'next/server'
import { verificarAssinaturaMeta, resolverDesafioVerificacaoMeta } from '@/lib/leads/meta-leadgen-webhook'
import { extrairMensagensWhatsappCloud } from '@/lib/leads/whatsapp-cloud-webhook'
import { logInfo } from '@/lib/log'

export const dynamic = 'force-dynamic'

const SOURCE = 'webhook/whatsapp-cloud'

// Webhook de ENTRADA da WhatsApp Cloud API. Por enquanto só valida
// assinatura e loga a mensagem recebida (log estruturado, sem PII) — NÃO
// cria lead, NÃO chama a IA, NÃO grava em `interacoes`. Essa integração
// fica pra um prompt seguinte, depois que META_WHATSAPP_PHONE_NUMBER_ID/
// _TOKEN estiverem configurados de verdade e a Meta confirmar que está
// entregando webhook nesta rota. Cliente de saída em
// src/lib/whatsapp-cloud.ts; Evolution API (src/lib/evolution.ts) e o
// webhook em src/app/api/webhook/whatsapp/route.ts continuam intactos e em
// produção enquanto essa migração não é decidida.

// Handshake de verificação — mesmo App/Verify Token do webhook do
// Instagram e do Lead Ads (ver webhook/instagram/route.ts): a Meta permite
// múltiplas assinaturas de objeto (whatsapp_business_account, page, ...) no
// mesmo App usando o mesmo token.
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

export async function POST(req: NextRequest) {
  const appSecret = process.env.META_APP_SECRET
  if (!appSecret) return NextResponse.json({ error: 'Webhook nao configurado' }, { status: 503 })

  // Corpo RAW obrigatório — a assinatura quebra se o body for reserializado.
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

  const mensagens = extrairMensagensWhatsappCloud(payload)
  for (const msg of mensagens) {
    // Nunca logar `from` (telefone) nem o texto da mensagem — convenção de
    // PII de src/lib/log.ts ("nunca inclua PII... só ids opacos + status/
    // counts"). wamid e phone_number_id são ids opacos, seguros de logar.
    logInfo(SOURCE, 'mensagem recebida (nao processada — integracao pendente)', {
      wamid: msg.wamid,
      phoneNumberId: msg.phoneNumberId,
      textoLength: msg.texto.length,
    })
  }

  return NextResponse.json({ ok: true })
}
