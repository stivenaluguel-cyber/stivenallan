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

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { data, error } = await sb().from('leads').select('*, empreendimentos(nome, slug), leads_interacoes(*)').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Lead nao encontrado' }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  body.updated_at = new Date().toISOString()
  if (body.estagio_funil) {
    const { data: lead } = await sb().from('leads').select('estagio_funil').eq('id', id).single()
    if (lead && lead.estagio_funil !== body.estagio_funil) {
      await sb().from('leads_interacoes').insert({ lead_id: id, tipo: 'status_change', descricao: 'Movido de ' + lead.estagio_funil + ' para ' + body.estagio_funil, estagio_de: lead.estagio_funil, estagio_para: body.estagio_funil })
    }
  }
  const { data, error } = await sb().from('leads').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const allowed = ['estagio_funil','lead_score','requer_atencao','notas','temperatura','kanban_ordem','anotacoes','nome','whatsapp','email','origem','orcamento_max','atendimento_humano_ativo']
  // Loga a transição de estágio (mesma lógica do PUT abaixo) — o Kanban
  // arrasta-e-solta usa PATCH, então sem isso o relatório de funil nunca
  // teria histórico de mudança de estágio.
  if (body.estagio_funil) {
    const { data: lead } = await sb().from('leads').select('estagio_funil').eq('id', id).single()
    if (lead && lead.estagio_funil !== body.estagio_funil) {
      await sb().from('leads_interacoes').insert({ lead_id: id, tipo: 'status_change', descricao: 'Movido de ' + lead.estagio_funil + ' para ' + body.estagio_funil, estagio_de: lead.estagio_funil, estagio_para: body.estagio_funil })
    }
  }
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const k of allowed) { if (k in body) update[k] = body[k] }
  const { data, error } = await sb().from('leads').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await sb().from('leads').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
