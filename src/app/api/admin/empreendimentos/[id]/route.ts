import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('empreendimentos')
    .select('*, construtoras(id, nome, slug)')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Empreendimento não encontrado' }, { status: 404 })
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

  const {
    nome, slug, descricao, cidade, bairro, uf, tipo, status,
    preco_min, preco_max, area_min, area_max,
    quartos_min, quartos_max, vagas,
    construtora_id, destaque, fotos, video_url,
    meta_title, meta_description,
  } = body

  // Check slug uniqueness (excluding current)
  if (slug) {
    const { data: existing } = await supabase
      .from('empreendimentos')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Este slug já está em uso por outro empreendimento' }, { status: 409 })
    }
  }

  const { data, error } = await supabase
    .from('empreendimentos')
    .update({
      nome, slug, descricao, cidade, bairro, uf, tipo, status,
      preco_min, preco_max, area_min, area_max,
      quartos_min, quartos_max, vagas,
      construtora_id, destaque, fotos, video_url,
      meta_title, meta_description,
      updated_at: new Date().toISOString(),
    })
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
    .from('empreendimentos')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
