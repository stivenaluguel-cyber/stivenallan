import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Recebe o PushSubscription.toJSON() do browser: { endpoint, keys: { p256dh, auth } }.
// Upsert por endpoint — reinstalar o app no mesmo aparelho gera o mesmo
// endpoint (o navegador reaproveita), então isso nunca duplica assinatura.
export async function POST(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const endpoint = body?.endpoint
  const p256dh = body?.keys?.p256dh
  const authKey = body?.keys?.auth
  if (typeof endpoint !== 'string' || typeof p256dh !== 'string' || typeof authKey !== 'string') {
    return NextResponse.json({ error: 'Assinatura invalida' }, { status: 400 })
  }

  const { error } = await sb().from('crm_push_subscriptions').upsert(
    {
      admin_id: adminId,
      endpoint,
      p256dh,
      auth: authKey,
      user_agent: req.headers.get('user-agent') ?? null,
    },
    { onConflict: 'endpoint' },
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// Chamado quando o corretor desativa notificações manualmente (ou o
// browser invalida a assinatura) — remove só a linha desse endpoint.
export async function DELETE(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const endpoint = body?.endpoint
  if (typeof endpoint !== 'string') return NextResponse.json({ error: 'endpoint obrigatorio' }, { status: 400 })

  await sb().from('crm_push_subscriptions').delete().eq('endpoint', endpoint)
  return NextResponse.json({ ok: true })
}
