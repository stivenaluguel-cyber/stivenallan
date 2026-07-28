import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

// Anotação = uma LINHA nova em leads_interacoes, nunca um append ao JSON
// inteiro de leads.anotacoes. É isso que elimina o lost update: dois
// corretores (ou duas abas) salvando ao mesmo tempo geram duas linhas
// independentes, em vez de a segunda sobrescrever o array da primeira.
// Retry da mesma intenção reusa client_event_id e cai no índice único.
export async function POST(req: NextRequest, { params }: Params) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: leadId } = await params
  const body = await req.json().catch(() => null)
  const texto = typeof body?.texto === 'string' ? body.texto.trim() : ''
  const clientEventId = typeof body?.clientEventId === 'string' ? body.clientEventId : null

  if (!texto) return NextResponse.json({ error: 'texto obrigatorio' }, { status: 400 })

  const client = sb()
  const { data, error } = await client
    .from('leads_interacoes')
    .insert({
      lead_id: leadId,
      admin_id: adminId,
      tipo: 'nota',
      descricao: texto.slice(0, 5000),
      client_event_id: clientEventId,
    })
    .select('id, created_at, descricao')
    .single()

  // 23505 = mesma intenção reenviada (retry de rede, duplo clique). Devolve
  // a anotação que já existe em vez de criar uma segunda igual.
  if (error?.code === '23505' && clientEventId) {
    const { data: existente } = await client
      .from('leads_interacoes')
      .select('id, created_at, descricao')
      .eq('client_event_id', clientEventId)
      .maybeSingle()
    return NextResponse.json({ data: existente, alreadyExists: true })
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, alreadyExists: false }, { status: 201 })
}
