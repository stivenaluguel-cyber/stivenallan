import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import { computeWeeklyGates, type WeeklyMetric } from '@/lib/dashboard/instagram-gates'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function auth(): Promise<string | null> {
  const s = await cookies()
  const t = s.get('dashboard_token')?.value
  if (!t) return null
  try {
    const { payload } = await jwtVerify(t, new TextEncoder().encode(process.env.JWT_SECRET!))
    return (payload.adminId as string) ?? null
  } catch {
    return null
  }
}

// Roda os gatilhos G2/G3/G6/G7/G9 pro snapshot recém-salvo contra o histórico
// anterior, e grava alerta novo em crm_notificacoes (dedupe por gate+semana).
async function checkAndNotifyGates(adminId: string, semanaInicio: string) {
  const { data: history } = await sb()
    .from('ig_metricas_semanais')
    .select('*')
    .lte('semana_inicio', semanaInicio)
    .order('semana_inicio', { ascending: false })
    .limit(6)

  const rows = (history ?? []) as WeeklyMetric[]
  const current = rows.find((r) => r.semana_inicio === semanaInicio)
  if (!current) return
  const anteriores = rows.filter((r) => r.semana_inicio !== semanaInicio)

  const gates = computeWeeklyGates(current, anteriores)
  if (gates.length === 0) return

  for (const gate of gates) {
    const { data: existentes } = await sb()
      .from('crm_notificacoes')
      .select('id')
      .eq('tipo', 'instagram_gate')
      .eq('lida', false)
      .contains('metadata', { gate: gate.codigo, semana_inicio: semanaInicio })
      .limit(1)

    if (existentes && existentes.length > 0) continue

    await sb().from('crm_notificacoes').insert({
      admin_id: adminId,
      tipo: 'instagram_gate',
      titulo: `Instagram — gatilho ${gate.codigo}: ${gate.nome}`,
      corpo: gate.mensagem,
      lida: false,
      link: '/dashboard/instagram',
      metadata: { gate: gate.codigo, severidade: gate.severidade, semana_inicio: semanaInicio },
    })
  }
}

export async function GET(req: NextRequest) {
  if (!(await auth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '12')

  const { data, error } = await sb()
    .from('ig_metricas_semanais')
    .select('*')
    .order('semana_inicio', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const adminId = await auth()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { semana_inicio } = body
  if (!semana_inicio) return NextResponse.json({ error: 'semana_inicio obrigatorio' }, { status: 400 })

  const { data, error } = await sb().from('ig_metricas_semanais').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await checkAndNotifyGates(adminId, semana_inicio)
  return NextResponse.json({ data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const adminId = await auth()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, ...update } = body
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })
  update.updated_at = new Date().toISOString()

  const { data, error } = await sb().from('ig_metricas_semanais').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (data?.semana_inicio) await checkAndNotifyGates(adminId, data.semana_inicio)
  return NextResponse.json({ data })
}
