import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const busca = searchParams.get('busca') || searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit
  let query = sb().from('crm_clientes').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1)
  if (busca) query = query.or('nome.ilike.%' + busca + '%,email.ilike.%' + busca + '%,telefone.ilike.%' + busca + '%')
  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count, page, limit, pages: Math.ceil((count ?? 0) / limit) })
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  if (!body.nome || !body.telefone) return NextResponse.json({ error: 'nome e telefone obrigatorios' }, { status: 400 })
  const { data, error } = await sb().from('crm_clientes').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, ...update } = body
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })
  update.updated_at = new Date().toISOString()
  const { data, error } = await sb().from('crm_clientes').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })
  const client = sb()

  // Proposta, compromisso e lead ligados ao cliente são `on delete set null`:
  // não impedem a exclusão, apenas perdem o dono em silêncio. Uma proposta sem
  // cliente é um documento que ninguém consegue mais rastrear — então avisa
  // antes, e só apaga quando a pessoa confirma sabendo o que se desfaz.
  const contar = async (tabela: string, coluna: string) => {
    const { count } = await client.from(tabela).select('id', { count: 'exact', head: true }).eq(coluna, id)
    return count ?? 0
  }
  const [propostas, agenda, leads] = await Promise.all([
    contar('crm_propostas', 'cliente_id'),
    contar('crm_agenda', 'cliente_id'),
    contar('leads', 'cliente_id'),
  ])

  if (!searchParams.get('forcar') && (propostas > 0 || agenda > 0 || leads > 0)) {
    return NextResponse.json({ error: 'vinculos', vinculos: { propostas, agenda, leads } }, { status: 409 })
  }

  const { error } = await client.from('crm_clientes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, desvinculado: { propostas, agenda, leads } })
}
