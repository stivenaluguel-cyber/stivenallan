import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function auth(): Promise<string | null> {
  const s = await cookies(); const t = s.get('dashboard_token')?.value; if (!t) return null
  try {
    const { payload } = await jwtVerify(t, new TextEncoder().encode(process.env.JWT_SECRET!))
    return (payload.adminId as string) ?? null
  } catch { return null }
}

async function pontosDoMes(client: ReturnType<typeof sb>, adminId: string): Promise<number> {
  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)
  const { data } = await client
    .from('crm_focus_events')
    .select('points')
    .eq('admin_id', adminId)
    .gte('created_at', inicioMes.toISOString())
  return (data ?? []).reduce((soma, ev) => soma + (ev.points ?? 0), 0)
}

// GET ?active=true — usado ao entrar em /dashboard/crm/foco: se já existir
// uma sessão 'ativa' deste admin, o front retoma o progresso em vez de
// começar do zero (satisfaz "atualizar a página não apaga o progresso").
// Sempre inclui monthPoints (gamificação mensal, exibida no cabeçalho).
export async function GET(req: NextRequest) {
  const adminId = await auth()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const client = sb()
  const monthPoints = await pontosDoMes(client, adminId)

  if (searchParams.get('active') === 'true') {
    const { data, error } = await client
      .from('crm_focus_sessions')
      .select('*')
      .eq('admin_id', adminId)
      .eq('status', 'ativa')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data, monthPoints })
  }

  const { data, error } = await client
    .from('crm_focus_sessions')
    .select('*')
    .eq('admin_id', adminId)
    .order('started_at', { ascending: false })
    .limit(30)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, monthPoints })
}

export async function POST(req: NextRequest) {
  const adminId = await auth()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const { totalLeads, filtros } = body

  // Uma sessão ativa por admin — se já existir uma, reaproveita em vez de
  // criar uma segunda (evita duas sessões "ativa" competindo pela mesma
  // fila caso o corretor clique em "Modo Foco" duas vezes/duas abas).
  const { data: existente } = await sb()
    .from('crm_focus_sessions')
    .select('*')
    .eq('admin_id', adminId)
    .eq('status', 'ativa')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (existente) return NextResponse.json({ data: existente })

  const { data, error } = await sb()
    .from('crm_focus_sessions')
    .insert({
      admin_id: adminId,
      status: 'ativa',
      total_leads: typeof totalLeads === 'number' ? totalLeads : 0,
      filtros: filtros ?? {},
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
