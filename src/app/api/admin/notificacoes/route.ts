import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticado } from '@/lib/dashboard/auth-check'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  if (!(await autenticado())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo')
  const apenasNaoLidas = searchParams.get('lida') === 'false'

  let query = sb().from('crm_notificacoes').select('*').order('created_at', { ascending: false }).limit(50)
  if (tipo) query = query.eq('tipo', tipo)
  if (apenasNaoLidas) query = query.eq('lida', false)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  if (!(await autenticado())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, lida } = body
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })

  const { data, error } = await sb().from('crm_notificacoes').update({ lida: lida ?? true }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
