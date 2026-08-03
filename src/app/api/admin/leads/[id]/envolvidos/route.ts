import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { normalizarEnvolvido } from '@/lib/leads/envolvidos'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const SELECT = 'id, nome, papel, whatsapp, email, observacoes, created_at'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  const { data, error } = await sb()
    .from('crm_lead_envolvidos')
    .select(SELECT)
    .eq('lead_id', id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })

  const normalizado = normalizarEnvolvido(body)
  if (!normalizado.ok) return NextResponse.json({ error: normalizado.erro }, { status: 400 })

  const { data, error } = await sb()
    .from('crm_lead_envolvidos')
    .insert({ lead_id: id, ...normalizado.envolvido })
    .select(SELECT)
    .single()

  if (error) {
    // Lead apagado entre abrir a tela e salvar: a FK acusa, e "erro 500" não
    // diria ao corretor o que aconteceu.
    if (error.code === '23503') return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  const envolvidoId = new URL(req.url).searchParams.get('envolvidoId')
  if (!envolvidoId) return NextResponse.json({ error: 'envolvidoId obrigatório' }, { status: 400 })

  // Filtra por lead_id junto: sem isso, um id de outro lead apagaria o
  // envolvido dele a partir desta tela.
  const { error } = await sb()
    .from('crm_lead_envolvidos')
    .delete()
    .eq('id', envolvidoId)
    .eq('lead_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
