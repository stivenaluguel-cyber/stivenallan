import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

/**
 * GET /api/admin/leads/parados — fila de leads abertos ordenada pelo maior
 * tempo sem interação. Reaproveita a RPC `leads_parados` (já em produção,
 * criada em 20260729171057_score_anexos_financeiro_metas.sql pro relatório
 * de leads parados) em vez de duplicar a lógica — ela já junta o último
 * evento em leads_interacoes E crm_focus_events, filtra fechado/perdido, e
 * ordena por última movimentação ascendente (mais parado primeiro).
 */
export async function GET(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const diasMin = Number(new URL(req.url).searchParams.get('dias_min') ?? '3')

  const { data, error } = await sb().rpc('leads_parados', {
    p_dias_min: Number.isFinite(diasMin) ? diasMin : 3,
    p_limite: 100,
  })
  if (error) return NextResponse.json({ error: 'Falha ao carregar a fila de leads parados' }, { status: 500 })

  return NextResponse.json({ data: data ?? [] })
}
