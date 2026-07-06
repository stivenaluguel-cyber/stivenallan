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

// Remonta o shape que o formulario do Dashboard espera, a partir de uma linha de properties
function toFormShape(p: any) {
  return {
    id: p.id,
    nome: p.nome,
    slug: p.slug,
    construtora: p.construtora_slug,
    cidade: p.cidade,
    uf: p.uf,
    bairro: p.bairro,
    endereco: p.endereco,
    descricao_curta: p.descricao_curta,
    descricao_completa: p.descricao,
    status_obra: p.status,
    status_venda: p.status,
    exibir_preco: p.exibir_preco,
    preco_a_partir: p.preco,
    preco_a_partir_de: p.preco,
    whatsapp: null,
    video_url: p.video_url,
    imagens_urls: p.galeria || [],
    imagem_capa_url: p.cover_image_url,
    cor_acento: p.cor_acento,
    dormitorios: p.dormitorios,
    suites: p.suites,
    vagas: p.vagas,
    metragem: p.metragem,
    previsao_entrega: p.previsao_entrega,
    faq: p.faq || [],
    diferenciais: (p.diferenciais || []).map((d: any) => ({ descricao: d })),
    oculto: p.oculto,
    ativo: p.ativo,
    tipologias: [],
  }
}

export async function GET(request: NextRequest) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('ordem', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const mapped = (data || []).map(toFormShape)
  return NextResponse.json({ data: mapped })
}

export async function POST(request: NextRequest) {
  const auth = await checkAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const supabase = getSupabase()

  const { tipologias, diferenciais, ...form } = body

  const t0 = Array.isArray(tipologias) && tipologias.length ? tipologias[0] : null

  const row: any = {
    slug: form.slug,
    construtora_slug: form.construtora ?? form.construtora_slug ?? null,
    nome: form.nome ?? null,
    descricao: form.descricao_completa ?? null,
    descricao_curta: form.descricao_curta ?? null,
    cidade: form.cidade ?? null,
    uf: form.uf ?? null,
    bairro: form.bairro ?? null,
    endereco: form.endereco ?? null,
    cor_acento: form.cor_acento ?? null,
    video_url: form.video_url ?? null,
    galeria: Array.isArray(form.imagens_urls) ? form.imagens_urls : [],
    diferenciais: Array.isArray(diferenciais)
      ? diferenciais.map((d: any) => (typeof d === 'string' ? d : d?.descricao)).filter(Boolean)
      : [],
    faq: Array.isArray(form.faq) ? form.faq : [],
    dormitorios: form.dormitorios ?? (t0 ? String(t0.dormitorios ?? '') : null) || null,
    suites: form.suites ?? (t0 ? String(t0.suites ?? '') : null) || null,
    vagas: form.vagas ?? (t0 ? String(t0.vagas ?? '') : null) || null,
    metragem: form.metragem ?? (t0 ? String(t0.area_privativa_m2 ?? '') : null) || null,
    previsao_entrega: form.previsao_entrega ?? null,
    status: form.status_venda ?? form.status_obra ?? null,
    exibir_preco: form.exibir_preco ?? false,
    preco: form.preco_a_partir_de ?? form.preco_a_partir ?? null,
    oculto: form.oculto ?? false,
    ativo: form.ativo ?? true,
    origem: 'dashboard',
  }
  if (form.imagem_capa_url) row.cover_image_url = form.imagem_capa_url
  Object.keys(row).forEach((k) => { if (row[k] === undefined) delete row[k] })

  const { data: emp, error: empError } = await supabase
    .from('properties')
    .upsert(row, { onConflict: 'slug' })
    .select()
    .single()
  if (empError) return NextResponse.json({ error: empError.message }, { status: 500 })

  return NextResponse.json({ data: toFormShape(emp) })
}
