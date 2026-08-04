import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const [{ data: campanha, error: erroCampanha }, { data: leads, error: erroLeads }] = await Promise.all([
    sb().from('prospeccao_campanhas').select('*').eq('id', id).single(),
    sb().from('prospeccao_leads').select('*').eq('campanha_id', id).order('score', { ascending: false, nullsFirst: false }),
  ])

  if (erroCampanha || !campanha) return NextResponse.json({ error: 'Campanha nao encontrada' }, { status: 404 })
  if (erroLeads) return NextResponse.json({ error: erroLeads.message }, { status: 500 })

  return NextResponse.json({ campanha, leads: leads ?? [] })
}
