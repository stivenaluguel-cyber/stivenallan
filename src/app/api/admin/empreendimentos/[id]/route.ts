import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { autenticado } from '@/lib/dashboard/auth-check';

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
    // status (obra) e status_venda são colunas INDEPENDENTES desde a
    // migration 0017 — antes eram a mesma coluna `status` disfarçada de duas
    // (bug real: editar um empreendimento sempre zerava o status de obra,
    // porque o form de edição nunca mandava status_venda).
    status: p.status,
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
    created_at: p.created_at,
    tipologias: [],
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await autenticado()
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
  const auth = await autenticado()
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  const supabase = getSupabase()
  const { tipologias, diferenciais, ...form } = body

  const t0 = Array.isArray(tipologias) && tipologias.length ? tipologias[0] : null

  // Atualização PARCIAL de verdade: um campo só entra no update se o
  // chamador realmente o enviou. Antes cada campo tinha fallback `?? null`
  // incondicional — uma chamada que mandasse só {status_venda} (o seletor
  // rápido da listagem de empreendimentos) zerava nome/cidade/descrição/
  // vídeo/preço/etc pra null, porque esses ficavam `null` mesmo sem o
  // chamador ter enviado nada sobre eles. BUG REAL JÁ CONFIRMADO: 8
  // empreendimentos em produção perderam o status de obra por causa desse
  // mesmo padrão (ver migration 0017 — a tela de editar nunca mandava
  // status_venda/status_obra, então status sempre virava null no save).
  const row: Record<string, unknown> = {}
  const set = (key: string, value: unknown) => { if (value !== undefined) row[key] = value }

  set('slug', form.slug)
  set('construtora_slug', form.construtora ?? form.construtora_slug)
  set('nome', form.nome)
  set('descricao', form.descricao_completa)
  set('descricao_curta', form.descricao_curta)
  set('cidade', form.cidade)
  set('uf', form.uf)
  set('bairro', form.bairro)
  set('endereco', form.endereco)
  set('cor_acento', form.cor_acento)
  set('video_url', form.video_url)
  if (Array.isArray(form.imagens_urls)) row.galeria = form.imagens_urls
  if (Array.isArray(diferenciais)) {
    row.diferenciais = diferenciais.map((d: any) => (typeof d === 'string' ? d : d?.descricao)).filter(Boolean)
  }
  if (Array.isArray(form.faq)) row.faq = form.faq
  set('dormitorios', form.dormitorios_min || form.dormitorios || (t0 && t0.dormitorios != null ? String(t0.dormitorios) : undefined))
  set('suites', form.suites ?? (t0 && t0.suites != null ? String(t0.suites) : undefined))
  set('vagas', form.vagas ?? (t0 && t0.vagas != null ? String(t0.vagas) : undefined))
  set('metragem', form.area_privativa_m2 || form.metragem || (t0 && t0.area_privativa_m2 != null ? String(t0.area_privativa_m2) : undefined))
  set('previsao_entrega', form.previsao_entrega)
  // status (obra) e status_venda são colunas independentes — nunca mais uma
  // sobrescrevendo a outra via fallback encadeado.
  set('status', form.status_obra)
  set('status_venda', form.status_venda)
  set('exibir_preco', form.exibir_preco)
  set('preco', form.preco_a_partir_de ?? form.preco_a_partir)
  set('oculto', form.oculto)
  set('ativo', form.ativo)
  const capa = form.imagem_principal || form.imagem_capa_url
  if (capa) row.cover_image_url = capa

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
  const auth = await autenticado()
  if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  const supabase = getSupabase()
  // Soft delete: a IA do WhatsApp (src/lib/agent.ts) já filtra
  // .eq('ativo', true).eq('oculto', false) pra decidir o que pode oferecer,
  // então marcar ativo=false/oculto=true já tira o empreendimento de
  // circulação sem destruir a linha (leads, unidades e histórico ligados a
  // ela via FK continuam íntegros — hard delete apagaria tudo isso junto).
  const { error } = await supabase
    .from('properties')
    .update({ ativo: false, oculto: true })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
