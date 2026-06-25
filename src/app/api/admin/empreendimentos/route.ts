import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function checkAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('dashboard_token')?.value
  if (!token) return false
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('empreendimentos')
    .select(`
      id, nome, construtora, cidade, uf, slug, status_obra, status_venda,
      descricao_curta, preco_a_partir, preco_a_partir_de, whatsapp, imagens_urls, video_url,
      bairro, endereco, descricao_completa, created_at,
      tipologias(id, dormitorios, suites, vagas, area_privativa_m2, area_total_m2, preco_a_partir_de, preco_ate),
      diferenciais_empreendimento(id, icone, descricao, categoria)
    `)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const supabase = getSupabase()

  const { tipologias, diferenciais, ...empreendimentoData } = body

  // Normaliza campo de preço
  if (empreendimentoData.preco_a_partir && !empreendimentoData.preco_a_partir_de) {
    empreendimentoData.preco_a_partir_de = empreendimentoData.preco_a_partir
  }

  // Gera slug automaticamente se não fornecido
  if (!empreendimentoData.slug && empreendimentoData.nome && empreendimentoData.cidade && empreendimentoData.uf) {
    const base = `${empreendimentoData.nome} ${empreendimentoData.cidade} ${empreendimentoData.uf}`
    empreendimentoData.slug = base
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const { data: emp, error: empError } = await supabase
    .from('empreendimentos')
    .insert(empreendimentoData)
    .select()
    .single()

  if (empError) return NextResponse.json({ error: empError.message }, { status: 500 })

  // Insere tipologias
  if (tipologias && tipologias.length > 0) {
    const tiposData = tipologias.map((t: any) => ({ ...t, empreendimento_id: emp.id }))
    await supabase.from('tipologias').insert(tiposData)
  }

  // Insere diferenciais
  if (diferenciais && diferenciais.length > 0) {
    const difData = diferenciais.map((d: any) => ({ ...d, empreendimento_id: emp.id }))
    await supabase.from('diferenciais_empreendimento').insert(difData)
  }

  return NextResponse.json({ data: emp }, { status: 201 })
}
