import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

// Diagnóstico temporário do token de produção (META_PAGE_ACCESS_TOKEN).
//
// Duas tentativas anteriores erraram o tipo de token: não é Página (Facebook
// Login for Business) nem login direto no Instagram — debug_token revelou
// type: SYSTEM_USER (token de Usuário do Sistema do Business Manager, o
// jeito estável de automatizar sem depender de login de uma pessoa). Pra um
// token de Usuário do Sistema, a identidade certa vem de /me/accounts (lista
// as Páginas que esse usuário do sistema tem acesso, com a conta Instagram
// vinculada a cada uma) — não de /me em graph.instagram.com, que é só pro
// fluxo de login direto na conta.
//
// O que decide se `comments` funciona de verdade é se o TOKEN ATUAL foi
// emitido com o escopo instagram_manage_comments — escopo liberado no App
// não se aplica retroativamente a um token de Usuário do Sistema já gerado
// antes disso; precisa gerar um token novo pro mesmo Usuário do Sistema.
//
// debug_token (App Access Token = app_id|app_secret) devolve exatamente os
// escopos que esse token carrega hoje — não expõe o token em si, só metadados.

const GRAPH_VERSION = 'v21.0'
const GRAPH_FB = `https://graph.facebook.com/${GRAPH_VERSION}`
const META_APP_ID = '1050885054000074'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = process.env.META_PAGE_ACCESS_TOKEN
  const appSecret = process.env.META_APP_SECRET
  if (!token || !appSecret) return NextResponse.json({ error: 'META_PAGE_ACCESS_TOKEN ou META_APP_SECRET nao configurado' }, { status: 503 })

  const appToken = `${META_APP_ID}|${appSecret}`

  const [contaRes, scopesRes] = await Promise.all([
    fetch(`${GRAPH_FB}/me/accounts?fields=id,name,instagram_business_account{id,username}&access_token=${encodeURIComponent(token)}`),
    fetch(`${GRAPH_FB}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(appToken)}`),
  ])

  const [conta, scopes] = await Promise.all([contaRes.json().catch(() => null), scopesRes.json().catch(() => null)])

  const escopos: string[] = scopes?.data?.scopes ?? []

  return NextResponse.json({
    paginas_e_contas_instagram: conta,
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
