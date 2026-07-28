import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { normalizarFiltrosFoco } from '@/lib/dashboard/focus-filters'
import { montarFilaServidor } from '@/lib/dashboard/focus-queue-server'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function pontosDoMes(client: ReturnType<typeof sb>, adminId: string): Promise<number> {
  // Agregado no banco (função sum_focus_points_month), não carregando todos
  // os eventos do mês no JS. A fronteira do mês é calculada em
  // America/Sao_Paulo — o servidor roda em UTC, então perto da virada do mês
  // o cálculo antigo (new Date() local do processo) mudava o resultado.
  const { data } = await client.rpc('sum_focus_points_month', { p_admin_id: adminId })
  return typeof data === 'number' ? data : 0
}

export async function GET(req: NextRequest) {
  const adminId = await requireAdmin()
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

// Início de sessão: o servidor monta a fila, calcula total_leads e grava o
// snapshot — tudo numa RPC atômica. O `totalLeads` que o frontend mandava
// antes era aceito como verdade (dava pra inflar o denominador do progresso
// só mandando outro número) e não existia snapshot nenhum: a fila era
// recalculada ao vivo a cada carga, então um lead tratado voltava a aparecer
// se o estado dele mudasse, e filtros alterados no meio da sessão trocavam a
// fila por baixo do corretor.
export async function POST(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const filtros = normalizarFiltrosFoco(body.filtros)

  const client = sb()
  const leadIds = await montarFilaServidor(client, filtros)

  const { data, error } = await client.rpc('start_focus_session', {
    p_admin_id: adminId,
    p_filtros: filtros,
    p_lead_ids: leadIds,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: data.session, reused: data.reused === true }, { status: data.reused ? 200 : 201 })
}
