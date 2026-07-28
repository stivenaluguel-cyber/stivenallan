import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import {
  criarAcumuladorParcial,
  montarConstrutoraSlug,
  normalizarStatusObra,
  normalizarStatusVenda,
} from '@/lib/imoveis/normalizar'

export const dynamic = 'force-dynamic';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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
    status: p.status,
    tipo: p.status,
    // Colunas independentes: `status` é o andamento da OBRA (na planta / em
    // obras / pronto / entregue) e `status_venda` é o comercial (ativo /
    // pausado / encerrado). Antes as duas saíam da mesma coluna, o que fazia
    // o seletor da listagem gravar por cima do status de obra.
    status_obra: p.status,
    status_venda: p.status_venda ?? 'ativo',
    exibir_preco: p.exibir_preco,
    preco_a_partir: p.preco,
    preco_a_partir_de: p.preco,
    preco_ate: '',
    whatsapp: null,
    video_url: p.video_url,
    imagens_urls: p.galeria || [],
    imagem_capa_url: p.cover_image_url,
    imagem_principal: p.cover_image_url,
    cor_acento: p.cor_acento,
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data: toFormShape(data) })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  const supabase = getSupabase()
  const { tipologias, diferenciais, ...form } = body

  const t0 = Array.isArray(tipologias) && tipologias.length ? tipologias[0] : null

  // Update PARCIAL de verdade — ver criarAcumuladorParcial() para o histórico
  // do bug (uma chamada com só {status_venda} zerava a linha inteira).
  const { row, set } = criarAcumuladorParcial()

  set('slug', form.slug)
  // Slugificado: o valor vai direto pra URL pública. Sem isso, "Acme Construções"
  // gerava /empreendimento/Acme Construções/... e a página respondia 404.
  set('construtora_slug', montarConstrutoraSlug(form))
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
  if (Array.isArray(form.faq)) set('faq', form.faq)
  set('dormitorios', form.dormitorios_min || form.dormitorios || (t0 && t0.dormitorios != null ? String(t0.dormitorios) : undefined))
  set('suites', form.suites ?? (t0 && t0.suites != null ? String(t0.suites) : undefined))
  set('vagas', form.vagas ?? (t0 && t0.vagas != null ? String(t0.vagas) : undefined))
  set('metragem', form.area_privativa_m2 || form.metragem || (t0 && t0.area_privativa_m2 != null ? String(t0.area_privativa_m2) : undefined))
  set('previsao_entrega', form.previsao_entrega)
  // status (obra) e status_venda são colunas independentes — uma nunca mais
  // sobrescreve a outra. normalizar* devolve undefined quando não dá pra
  // mapear, e aí o campo simplesmente não entra no update.
  set('status', normalizarStatusObra(form.status_obra) ?? undefined)
  set('status_venda', normalizarStatusVenda(form.status_venda) ?? undefined)
  set('exibir_preco', form.exibir_preco)
  set('preco', form.preco_a_partir_de ?? form.preco_a_partir)
  set('oculto', form.oculto)
  set('ativo', form.ativo)
  const _capa = form.imagem_principal || form.imagem_capa_url
  if (_capa) set('cover_image_url', _capa)

  if (Object.keys(row).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar.' }, { status: 400 })
  }

  const { data: emp, error: empError } = await supabase
    .from('properties')
    .update(row)
    .eq('id', id)
    .select()
    .single()

  if (empError) return NextResponse.json({ error: empError.message }, { status: 500 })
  return NextResponse.json({ data: toFormShape(emp) })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  const supabase = getSupabase()
  const { error } = await supabase.from('properties').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
