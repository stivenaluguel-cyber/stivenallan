import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticado } from '@/lib/dashboard/auth-check'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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
    // status (obra) e status_venda são colunas independentes desde a
    // migration 0017 (antes status_venda não existia de verdade — era só um
    // alias do mesmo `status`, e por isso as duas coisas se sobrescreviam).
    status: p.status,
    status_obra: p.status,
    status_venda: p.status_venda ?? 'ativo',
    exibir_preco: p.exibir_preco,
    preco_a_partir: p.preco,
    preco_a_partir_de: p.preco,
    preco_ate: '',
    whatsapp: null,
    video_url: p.video_url,
    // imagens: emitir ambos os vocabularios
    imagens_urls: p.galeria || [],
    imagem_capa_url: p.cover_image_url,
    imagem_principal: p.cover_image_url,
    cor_acento: p.cor_acento,
    // dormitorios/metragem: mapear para os campos do form
    dormitorios: p.dormitorios,
    dormitorios_min: p.dormitorios,
    dormitorios_max: '',
    suites: p.suites,
    vagas: p.vagas,
    metragem: p.metragem,
    area_privativa_m2: p.metragem,
    area_total_m2: '',
    previsao_entrega: p.previsao_entrega,
    faq: p.faq || [],
    diferenciais: (p.diferenciais || []).map((d: any) => ({ descricao: d })),
    oculto: p.oculto,
    ativo: p.ativo,
    created_at: p.created_at,
    tipologias: [],
  };
}

export async function GET(request: NextRequest) {
  const auth = await autenticado()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getSupabase()
  // Soft delete (ver DELETE em [id]/route.ts): por padrão a listagem
  // principal esconde os "excluídos" (ativo=false). ?incluirExcluidos=true
  // deixa o filtro passar pra um caso de uso futuro de ver/restaurar
  // excluídos — não filtra nada além da tabela toda.
  const incluirExcluidos = new URL(request.url).searchParams.get('incluirExcluidos') === 'true'
  let query = supabase.from('properties').select('*').order('ordem', { ascending: true })
  if (!incluirExcluidos) query = query.eq('ativo', true)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const mapped = (data || []).map(toFormShape)
  return NextResponse.json({ data: mapped })
}

export async function POST(request: NextRequest) {
  const auth = await autenticado()
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
    dormitorios: form.dormitorios_min || form.dormitorios || (t0 && t0.dormitorios != null ? String(t0.dormitorios) : null),
    suites: form.suites ?? (t0 && t0.suites != null ? String(t0.suites) : null),
    vagas: form.vagas ?? (t0 && t0.vagas != null ? String(t0.vagas) : null),
    metragem: form.area_privativa_m2 || form.metragem || (t0 && t0.area_privativa_m2 != null ? String(t0.area_privativa_m2) : null),
    previsao_entrega: form.previsao_entrega ?? null,
    // status (obra) e status_venda: colunas independentes — ver migration 0017.
    status: form.status_obra ?? null,
    status_venda: form.status_venda ?? 'ativo',
    exibir_preco: form.exibir_preco ?? false,
    preco: form.preco_a_partir_de ?? form.preco_a_partir ?? null,
    oculto: form.oculto ?? false,
    ativo: form.ativo ?? true,
    origem: 'dashboard',
  }
    const _capa = form.imagem_principal || form.imagem_capa_url; if (_capa) row.cover_image_url = _capa;
  Object.keys(row).forEach((k) => { if (row[k] === undefined) delete row[k] })

  const { data: emp, error: empError } = await supabase
    .from('properties')
    .upsert(row, { onConflict: 'slug' })
    .select()
    .single()
  if (empError) return NextResponse.json({ error: empError.message }, { status: 500 })

  return NextResponse.json({ data: toFormShape(emp) })
}
