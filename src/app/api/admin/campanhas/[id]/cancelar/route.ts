import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticado } from '@/lib/dashboard/auth-check'
import { podeCancelar } from '@/lib/campanhas/estados'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = sb()

  const { data: campanha, error: campErr } = await supabase.from('campanhas').select('status').eq('id', id).single()
  if (campErr || !campanha) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
  if (!podeCancelar(campanha.status)) {
    return NextResponse.json({ error: 'Só é possível cancelar campanhas em rascunho ou agendadas — o envio já começou.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('campanhas')
    .update({ status: 'cancelada', cancelada_em: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
