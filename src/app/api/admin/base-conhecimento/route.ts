import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb()
    .from('base_conhecimento')
    .select('id, pergunta, resposta, origem, aprovado, ativo, lead_id_origem, created_at')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entradas: data ?? [] })
}

// Só cria entrada MANUAL — origem/aprovado nunca vêm do client. A sugestão
// automática (origem='ia_sugerida') só nasce pelo cron
// (base-conhecimento-auto-sugestao.ts); essa rota é exclusivamente pro
// corretor cadastrar/editar conhecimento já revisado por ele mesmo.
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const pergunta = typeof body?.pergunta === 'string' ? body.pergunta.trim() : ''
  const resposta = typeof body?.resposta === 'string' ? body.resposta.trim() : ''

  if (!pergunta || !resposta) {
    return NextResponse.json({ error: 'pergunta e resposta são obrigatórias' }, { status: 400 })
  }

  const { data, error } = await sb()
    .from('base_conhecimento')
    .insert({ pergunta, resposta, origem: 'manual', aprovado: true, ativo: true })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id }, { status: 201 })
}

// Cobre aprovar/rejeitar sugestão, editar texto, e ativar/desativar —
// tudo por id, campos parciais.
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
  }

  const permitido: Record<string, unknown> = {}
  if (typeof body.pergunta === 'string' && body.pergunta.trim()) permitido.pergunta = body.pergunta.trim()
  if (typeof body.resposta === 'string' && body.resposta.trim()) permitido.resposta = body.resposta.trim()
  if (typeof body.aprovado === 'boolean') permitido.aprovado = body.aprovado
  if (typeof body.ativo === 'boolean') permitido.ativo = body.ativo

  if (Object.keys(permitido).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo válido pra atualizar' }, { status: 400 })
  }
  permitido.updated_at = new Date().toISOString()

  const { error } = await sb().from('base_conhecimento').update(permitido).eq('id', body.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })

  const { error } = await sb().from('base_conhecimento').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
