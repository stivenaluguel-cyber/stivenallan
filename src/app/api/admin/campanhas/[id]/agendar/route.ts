import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticado } from '@/lib/dashboard/auth-check'
import { podeAgendar } from '@/lib/campanhas/estados'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

// POST { agendada_para: string | null } — string ISO no futuro agenda o
// envio (status vira 'agendada'); null desagenda de volta pra 'rascunho'.
export async function POST(req: NextRequest, { params }: Params) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = sb()

  const { data: campanha, error: campErr } = await supabase.from('campanhas').select('status').eq('id', id).single()
  if (campErr || !campanha) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
  if (!podeAgendar(campanha.status)) {
    return NextResponse.json({ error: 'Só é possível agendar campanhas em rascunho ou já agendadas.' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const { agendada_para } = body as { agendada_para?: string | null }

  if (agendada_para === null || agendada_para === undefined) {
    const { data, error } = await supabase
      .from('campanhas')
      .update({ status: 'rascunho', agendada_para: null })
      .eq('id', id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  const data_agendada = new Date(agendada_para)
  if (Number.isNaN(data_agendada.getTime())) {
    return NextResponse.json({ error: 'Data de agendamento inválida.' }, { status: 400 })
  }
  if (data_agendada.getTime() <= Date.now()) {
    return NextResponse.json({ error: 'A data de agendamento precisa ser no futuro.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('campanhas')
    .update({ status: 'agendada', agendada_para: data_agendada.toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
