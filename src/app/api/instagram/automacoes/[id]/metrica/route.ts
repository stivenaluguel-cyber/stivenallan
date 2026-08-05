import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

export const dynamic = 'force-dynamic'

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Métricas agregadas de uma automação: execuções (comentários que bateram na
// regra), DMs entregues, cliques nos botões e CTR = cliques / DMs entregues.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const supabase = sb()
  const [execucoesRes, cliquesRes] = await Promise.all([
    supabase.from('ig_comment_automacao_execucoes').select('dm_status').eq('automacao_id', id),
    supabase.from('ig_comment_automacao_cliques').select('id', { count: 'exact', head: true }).eq('automacao_id', id),
  ])

  if (execucoesRes.error) return NextResponse.json({ error: execucoesRes.error.message }, { status: 500 })
  if (cliquesRes.error) return NextResponse.json({ error: cliquesRes.error.message }, { status: 500 })

  const execucoes = execucoesRes.data ?? []
  const dmsEnviados = execucoes.filter((e) => e.dm_status === 'sent').length
  const cliques = cliquesRes.count ?? 0

  return NextResponse.json({
    data: {
      execucoes: execucoes.length,
      dms_enviados: dmsEnviados,
      aguardando_seguir: execucoes.filter((e) => e.dm_status === 'awaiting_follow').length,
      erros: execucoes.filter((e) => e.dm_status === 'error').length,
      cliques,
      ctr: dmsEnviados > 0 ? Math.round((cliques / dmsEnviados) * 1000) / 10 : null,
    },
  })
}
