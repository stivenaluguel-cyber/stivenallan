import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { recalcularBaseAtiva, recalcularScores } from '@/lib/leads/score-server'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// POST /api/admin/leads/score
//   { leadIds: [...] }  → recalcula só esses
//   { todos: true }     → recalcula a base ativa inteira
//
// Existe para o botão "recalcular" da tela e para conferência manual depois
// de importar leads. O recálculo automático acontece nos pontos de mutação e
// no cron diário — este endpoint não é o caminho normal.
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const client = sb()

  if (body?.todos === true) {
    const r = await recalcularBaseAtiva(client)
    return NextResponse.json({ processados: r.processados, escopo: 'base_ativa' })
  }

  const leadIds = Array.isArray(body?.leadIds) ? body.leadIds.filter((x: unknown) => typeof x === 'string') : []
  if (leadIds.length === 0) {
    return NextResponse.json({ error: 'Informe leadIds ou { todos: true }' }, { status: 400 })
  }

  const aplicados = await recalcularScores(client, leadIds)
  return NextResponse.json({ processados: aplicados.length, data: aplicados, escopo: 'selecao' })
}
