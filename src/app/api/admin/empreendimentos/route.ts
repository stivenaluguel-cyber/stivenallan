import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { agruparBairrosPorCidade, contarFiltrosAtivos, filtrarImoveis, filtrosDaQueryString } from '@/lib/imoveis/filtros'
import {
  criarAcumuladorParcial,
  montarConstrutoraSlug,
  normalizarStatusObra,
  normalizarStatusVenda,
  slugificar,
} from '@/lib/imoveis/normalizar'
import { resolverFaq } from '@/lib/imoveis/faq-padrao'

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
    // `status` = andamento da OBRA; `status_venda` = situação COMERCIAL.
    // Eram a mesma coluna até a migration 20260728210000 — por isso o seletor
    // Ativo/Pausado da listagem apagava o status de obra do empreendimento.
    status: p.status,
    tipo: p.status,
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
    tipologias: [],
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('ordem', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filtragem em memória: são ~36 imóveis, e a mesma função pura roda no
  // servidor e nos testes, sem duplicar a regra em SQL.
  const filtros = filtrosDaQueryString(new URL(request.url).searchParams)
  const filtrados = filtrarImoveis(data ?? [], filtros)

  return NextResponse.json({
    data: filtrados.map(toFormShape),
    total: filtrados.length,
    totalSemFiltro: (data ?? []).length,
    // Alimenta o seletor de bairro agrupado por cidade — calculado sobre a
    // lista COMPLETA, senão as opções sumiriam conforme o filtro aperta.
    bairrosPorCidade: agruparBairrosPorCidade(data ?? []),
    filtrosAtivos: contarFiltrosAtivos(filtros),
  })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const supabase = getSupabase()

  const { tipologias, diferenciais, ...form } = body

  const t0 = Array.isArray(tipologias) && tipologias.length ? tipologias[0] : null

  const slug = slugificar(form.slug)
  const construtoraSlug = montarConstrutoraSlug(form)
  if (!slug) return NextResponse.json({ error: 'Slug (URL) é obrigatório.' }, { status: 400 })
  if (!construtoraSlug) return NextResponse.json({ error: 'Construtora é obrigatória.' }, { status: 400 })

  // Mesmo acumulador parcial do PUT: este endpoint faz upsert por slug, então
  // recadastrar um slug existente ATUALIZA a linha. Com o `?? null` de antes,
  // isso apagava tudo que não viesse no corpo — o mesmo estrago do PUT.
  const { row, set } = criarAcumuladorParcial()

  set('slug', slug)
  set('construtora_slug', construtoraSlug)
  set('nome', form.nome)
  set('descricao', form.descricao_completa)
  set('descricao_curta', form.descricao_curta)
  set('cidade', form.cidade)
  set('uf', form.uf)
  set('bairro', form.bairro)
  set('endereco', form.endereco)
  set('cor_acento', form.cor_acento)
  set('video_url', form.video_url)
  set('frase', form.frase)
  if (Array.isArray(form.imagens_urls)) set('galeria', form.imagens_urls)
  if (Array.isArray(form.plantas)) set('plantas', form.plantas)
  if (Array.isArray(form.lazer)) set('lazer', form.lazer)
  if (Array.isArray(diferenciais)) {
    set('diferenciais', diferenciais.map((d: any) => (typeof d === 'string' ? d : d?.descricao)).filter(Boolean))
  }
  set('dormitorios', form.dormitorios_min || form.dormitorios || (t0 && t0.dormitorios != null ? String(t0.dormitorios) : undefined))
  set('suites', form.suites ?? (t0 && t0.suites != null ? String(t0.suites) : undefined))
  set('vagas', form.vagas ?? (t0 && t0.vagas != null ? String(t0.vagas) : undefined))
  set('metragem', form.area_privativa_m2 || form.metragem || (t0 && t0.area_privativa_m2 != null ? String(t0.area_privativa_m2) : undefined))
  set('previsao_entrega', form.previsao_entrega)
  set('status', normalizarStatusObra(form.status_obra) ?? undefined)
  // Depois de dormitorios/metragem/status, porque o FAQ gerado usa esses
  // valores já normalizados. FAQ escrito à mão vence; sem ele, geramos a partir
  // dos dados — assim nenhuma página nasce sem FAQPage no JSON-LD.
  set('faq', resolverFaq(form.faq, {
    nome: form.nome, cidade: form.cidade, uf: form.uf, bairro: form.bairro, endereco: form.endereco,
    dormitorios: row.dormitorios as string, suites: row.suites as string,
    vagas: row.vagas as string, metragem: row.metragem as string,
    status: row.status as string, previsao_entrega: form.previsao_entrega,
  }))
  set('status_venda', normalizarStatusVenda(form.status_venda) ?? undefined)
  set('exibir_preco', form.exibir_preco)
  set('preco', form.preco_a_partir_de ?? form.preco_a_partir)
  set('oculto', form.oculto)
  set('ativo', form.ativo)
  set('origem', 'dashboard')
  // Capa: explícita se informada, senão a primeira foto da galeria. Sem capa o
  // empreendimento é filtrado fora de /empreendimentos (o catálogo exige
  // imagem) e o card social sai vazio — não faz sentido exigir que o corretor
  // repita a mesma URL que já colou na galeria.
  const _capa = form.imagem_principal || form.imagem_capa_url ||
    (Array.isArray(form.imagens_urls) ? form.imagens_urls.find((u: unknown) => typeof u === 'string' && u.trim()) : undefined)
  if (_capa) set('cover_image_url', _capa)

  const { data: emp, error: empError } = await supabase
    .from('properties')
    .upsert(row, { onConflict: 'slug' })
    .select()
    .single()
  if (empError) return NextResponse.json({ error: empError.message }, { status: 500 })

  return NextResponse.json({ data: toFormShape(emp) })
}
