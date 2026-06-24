import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'Serviço indisponível' }, { status: 503 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const empreendimentoId = searchParams.get('empreendimento_id')

  let query = supabase
    .from('leads')
    .select('*, empreendimentos(nome, slug, cidade)')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (empreendimentoId) {
    query = query.eq('empreendimento_id', empreendimentoId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
