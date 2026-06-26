import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function auth() {
  const s = await cookies(); const t = s.get('dashboard_token')?.value; if (!t) return false
  try { await jwtVerify(t, new TextEncoder().encode(process.env.JWT_SECRET!)); return true } catch { return false }
}

export async function GET(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 40
  const offset = (page - 1) * limit
  let query = sb().from('crm_clientes').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1)
  if (q) query = query.or('nome.ilike.%' + q + '%,email.ilike.%' + q + '%,telefone.ilike.%' + q + '%')
  if (status) query = query.eq('status', status)
  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, total: count, page, pages: Math.ceil((count ?? 0) / limit) })
}

export async function POST(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  if (!body.nome) return NextResponse.json({ error: 'nome obrigatorio' }, { status: 400 })
  const { data, error } = await sb().from('crm_clientes').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
