import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('leads')
    .select('*, empreendimentos(nome, slug, cidade)')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getSupabaseAdmin()
  const body = await req.json()

  const allowedFields = ['status', 'anotacoes', 'atendido_em']
  const updateData: Record<string, unknown> = {}

  for (const field of allowedFields) {
    if (field in body) {
      updateData[field] = body[field]
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
  }

  updateData.updated_at = new Date().toISOString()

  // Auto-set atendido_em when status changes from novo
  if (body.status && body.status !== 'novo' && !updateData.atendido_em) {
    const { data: existing } = await supabase
      .from('leads')
      .select('status, atendido_em')
      .eq('id', id)
      .single()

    if (existing && existing.status === 'novo' && !existing.atendido_em) {
      updateData.atendido_em = new Date().toISOString()
    }
  }

  const { data, error } = await supabase
    .from('leads')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
