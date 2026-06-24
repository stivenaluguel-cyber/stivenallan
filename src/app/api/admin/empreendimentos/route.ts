import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: listar empreendimentos
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const destaque = searchParams.get('destaque')

    let query = supabase
      .from('empreendimentos')
      .select(`
        id, nome, slug, cidade, uf, status, destaque, ativo, publicado, created_at,
        construtoras ( id, nome, slug )
      `)
      .order('created_at', { ascending: false })

    if (destaque === 'true') {
      query = query.eq('destaque', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST: criar empreendimento
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
    }

    const body = await request.json()

    // Validações básicas
    if (!body.nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }
    if (!body.slug?.trim()) {
      return NextResponse.json({ error: 'Slug é obrigatório' }, { status: 400 })
    }

    // Verificar se slug já existe
    const { data: existing } = await supabase
      .from('empreendimentos')
      .select('id')
      .eq('slug', body.slug)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Este slug já está em uso. Escolha outro.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('empreendimentos')
      .insert({
        nome: body.nome.trim(),
        slug: body.slug.trim().toLowerCase(),
        construtora_id: body.construtora_id || null,
        cidade: body.cidade || 'Criciúma',
        uf: body.uf || 'SC',
        bairro: body.bairro || null,
        endereco: body.endereco || null,
        descricao: body.descricao || null,
        status: body.status || 'lancamento',
        dorms_min: body.dorms_min || null,
        dorms_max: body.dorms_max || null,
        area_min: body.area_min || null,
        area_max: body.area_max || null,
        preco_a_partir: body.preco_a_partir || null,
        preco_min: body.preco_min || null,
        destaque: body.destaque || false,
        ativo: body.ativo !== undefined ? body.ativo : true,
        publicado: body.publicado !== undefined ? body.publicado : true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
