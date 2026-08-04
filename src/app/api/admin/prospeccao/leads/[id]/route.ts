import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

const STATUS_VALIDOS = ['novo', 'contatado', 'ignorado']

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const status = typeof body?.status === 'string' ? body.status : ''
  if (!STATUS_VALIDOS.includes(status)) {
    return NextResponse.json({ error: 'status precisa ser um de: ' + STATUS_VALIDOS.join(', ') }, { status: 400 })
  }

  const { data, error } = await sb().from('prospeccao_leads').update({ status }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ lead: data })
}
