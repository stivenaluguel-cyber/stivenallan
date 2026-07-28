import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  verificarAssinaturaMeta,
  resolverDesafioVerificacaoMeta,
  extrairLeadgenIds,
  extrairCamposLeadMeta,
} from '@/lib/leads/meta-leadgen-webhook'
import { upsertAdsLead } from '@/lib/leads/upsert-ads-lead'
import { logError, logInfo, logWarn } from '@/lib/log'

export const dynamic = 'force-dynamic'

const SOURCE = 'webhook/meta-leads'
const GRAPH_VERSION = 'v21.0'

// Handshake de verificação exigido pelo Meta ao cadastrar a URL do webhook
// no App (Meta for Developers > Webhooks > Page > leadgen). Sem isso o
// Meta recusa salvar a assinatura.
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
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN
  if (!appSecret || !pageAccessToken) {
    return NextResponse.json({ error: 'Webhook nao configurado' }, { status: 503 })
  }

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

  const changes = extrairLeadgenIds(payload)
  if (changes.length === 0) return NextResponse.json({ ok: true })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // Processado de forma síncrona (não fire-and-forget): são leads reais e o
  // Meta tolera alguns segundos de resposta — não vale o risco de a função
  // serverless encerrar antes de terminar o insert.
  for (const change of changes) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/${GRAPH_VERSION}/${change.leadgenId}?fields=field_data&access_token=${encodeURIComponent(pageAccessToken)}`,
      )
      if (!res.ok) {
        logWarn(SOURCE, 'graph api retornou erro ao buscar lead', { leadgenId: change.leadgenId, status: res.status })
        continue
      }
      const json = await res.json()
      const campos = extrairCamposLeadMeta(json.field_data)

      const resultado = await upsertAdsLead(supabase, {
        nome: campos.nome,
        whatsapp: campos.whatsapp,
        email: campos.email,
        origem: 'Meta Ads',
        source: `meta_lead_ads:${change.formId ?? 'desconhecido'}`,
      })

      logInfo(SOURCE, 'lead do meta processado', { leadgenId: change.leadgenId, status: resultado.status })
    } catch (err) {
      logError(SOURCE, 'falha ao processar leadgen_id', err, { leadgenId: change.leadgenId })
    }
  }

  return NextResponse.json({ ok: true })
}
