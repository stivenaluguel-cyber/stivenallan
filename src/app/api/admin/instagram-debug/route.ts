import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

// Diagnóstico temporário: confirma, a partir do META_PAGE_ACCESS_TOKEN já em
// produção (o mesmo usado pelo webhook de DM que já funciona), qual Página e
// qual conta Instagram esse token realmente enxerga, e se o campo `comments`
// está de fato inscrito na assinatura da Página — sem precisar caçar a Página
// certa manualmente no Graph API Explorer (o token de usuário logado no
// navegador pode não ser admin da Página certa; este token já é o certo,
// porque é o que o webhook usa pra valer). Nunca devolve o token em si.

const GRAPH_VERSION = 'v21.0'
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = process.env.META_PAGE_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: 'META_PAGE_ACCESS_TOKEN nao configurado' }, { status: 503 })

  const [pageRes, subsRes] = await Promise.all([
    fetch(`${GRAPH}/me?fields=id,name,instagram_business_account{id,username}&access_token=${encodeURIComponent(token)}`),
    fetch(`${GRAPH}/me/subscribed_apps?access_token=${encodeURIComponent(token)}`),
  ])

  const [page, subscribedApps] = await Promise.all([pageRes.json().catch(() => null), subsRes.json().catch(() => null)])

  return NextResponse.json({ page, subscribed_apps: subscribedApps })
}
