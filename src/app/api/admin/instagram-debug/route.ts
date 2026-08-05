import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

// Diagnóstico (+ correção opcional) temporário: confirma, a partir do
// META_PAGE_ACCESS_TOKEN já em produção (o mesmo usado pelo webhook de DM que
// já funciona), qual Página e qual conta Instagram esse token realmente
// enxerga, e se o campo `comments` está de fato inscrito na assinatura da
// Página — sem precisar caçar a Página certa manualmente no Graph API
// Explorer (o token de usuário logado no navegador pode não ser admin da
// Página certa; este token já é o certo, porque é o que o webhook usa pra
// valer). Nunca devolve o token em si.
//
// GET             — só diagnostica.
// GET ?fix=1      — se "comments" não estiver em subscribed_fields, reescreve
//                   a assinatura da Página incluindo os campos já existentes
//                   + comments (nunca remove um campo que já funcionava).

const GRAPH_VERSION = 'v21.0'
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`
const CAMPOS_DESEJADOS = ['messages', 'comments', 'messaging_postbacks']

async function diagnosticar(token: string) {
  const [pageRes, subsRes] = await Promise.all([
    fetch(`${GRAPH}/me?fields=id,name,instagram_business_account{id,username}&access_token=${encodeURIComponent(token)}`),
    fetch(`${GRAPH}/me/subscribed_apps?access_token=${encodeURIComponent(token)}`),
  ])
  const [page, subscribedApps] = await Promise.all([pageRes.json().catch(() => null), subsRes.json().catch(() => null)])
  const camposAtuais: string[] = subscribedApps?.data?.[0]?.subscribed_fields ?? []
  return { page, subscribedApps, camposAtuais }
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = process.env.META_PAGE_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: 'META_PAGE_ACCESS_TOKEN nao configurado' }, { status: 503 })

  const antes = await diagnosticar(token)
  const querFix = new URL(req.url).searchParams.get('fix') === '1'
  const faltando = CAMPOS_DESEJADOS.filter((c) => !antes.camposAtuais.includes(c))

  if (!querFix || faltando.length === 0) {
    return NextResponse.json({ page: antes.page, subscribed_apps: antes.subscribedApps, faltando })
  }

  const novosCampos = Array.from(new Set([...antes.camposAtuais, ...CAMPOS_DESEJADOS]))
  const fixRes = await fetch(
    `${GRAPH}/me/subscribed_apps?subscribed_fields=${encodeURIComponent(novosCampos.join(','))}&access_token=${encodeURIComponent(token)}`,
    { method: 'POST' },
  )
  const fixBody = await fixRes.json().catch(() => ({}))

  const depois = await diagnosticar(token)

  return NextResponse.json({
    fix_aplicado: fixRes.ok,
    fix_resposta: fixBody,
    campos_antes: antes.camposAtuais,
    campos_depois: depois.camposAtuais,
    page: depois.page,
  })
}
