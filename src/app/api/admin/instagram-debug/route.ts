import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

// Diagnóstico temporário do token de produção (META_PAGE_ACCESS_TOKEN).
//
// Tentativa anterior assumia Facebook Login for Business (Página → conta IG
// vinculada, /me/subscribed_apps). Errou: "/me?fields=instagram_business_account"
// devolveu "campo não existe" — sintoma de token do fluxo Instagram Login
// (Business Login direto na conta, sem Página no meio), onde "me" já É a
// conta Instagram (nó ig_user), não uma Página. Nesse fluxo:
//   - a inscrição de webhook é só o toggle no App Dashboard (já feito) —
//     não existe um /subscribed_apps por conta pra chamar aqui;
//   - o que decide se `comments` funciona de verdade é se o TOKEN ATUAL foi
//     emitido com o escopo instagram_manage_comments — um escopo novo
//     liberado no App não se aplica retroativamente a um token já emitido.
//
// debug_token (App Access Token = app_id|app_secret) devolve exatamente os
// escopos que esse token carrega hoje — não expõe o token em si, só metadados.

const GRAPH_VERSION = 'v21.0'
const GRAPH_FB = `https://graph.facebook.com/${GRAPH_VERSION}`
const GRAPH_IG = `https://graph.instagram.com/${GRAPH_VERSION}`
const META_APP_ID = '1050885054000074'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = process.env.META_PAGE_ACCESS_TOKEN
  const appSecret = process.env.META_APP_SECRET
  if (!token || !appSecret) return NextResponse.json({ error: 'META_PAGE_ACCESS_TOKEN ou META_APP_SECRET nao configurado' }, { status: 503 })

  const appToken = `${META_APP_ID}|${appSecret}`

  const [contaRes, scopesRes] = await Promise.all([
    fetch(`${GRAPH_IG}/me?fields=id,username,name,account_type&access_token=${encodeURIComponent(token)}`),
    fetch(`${GRAPH_FB}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(appToken)}`),
  ])

  const [conta, scopes] = await Promise.all([contaRes.json().catch(() => null), scopesRes.json().catch(() => null)])

  const escopos: string[] = scopes?.data?.scopes ?? []

  return NextResponse.json({
    conta_instagram: conta,
    token_info: {
      tipo: scopes?.data?.type,
      valido: scopes?.data?.is_valid,
      expira_em: scopes?.data?.expires_at,
      escopos,
      tem_instagram_manage_comments: escopos.includes('instagram_manage_comments'),
      tem_instagram_manage_messages: escopos.includes('instagram_manage_messages'),
    },
    debug_token_bruto: scopes,
  })
}
