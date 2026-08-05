import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

export const dynamic = 'force-dynamic'

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

// POST { agendada_para: string | null } — string ISO agenda (ou reagenda) o
// envio automático pelo cron; null remove o agendamento e volta pra
// 'rascunho'. Só permitido a partir de 'rascunho' ou 'agendada' — depois que
// o cron/clique manual já começou a processar (status='enviando' em diante)
// não dá mais pra voltar atrás por aqui.
export async function POST(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = sb()

  const { data: atual, error: atualErr } = await supabase.from('campanhas').select('status').eq('id', id).single()
  if (atualErr || !atual) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
  if (atual.status !== 'rascunho' && atual.status !== 'agendada') {
    return NextResponse.json({ error: 'Só é possível agendar campanhas em rascunho.' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const agendadaPara = body.agendada_para

  if (agendadaPara === null) {
    const { data, error } = await supabase
      .from('campanhas')
      .update({ status: 'rascunho', agendada_para: null })
      .eq('id', id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  if (typeof agendadaPara !== 'string' || Number.isNaN(Date.parse(agendadaPara))) {
    return NextResponse.json({ error: 'agendada_para precisa ser uma data ISO válida ou null.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('campanhas')
    .update({ status: 'agendada', agendada_para: agendadaPara })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
