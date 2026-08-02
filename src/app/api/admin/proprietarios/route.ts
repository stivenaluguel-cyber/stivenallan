import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { criarAcumuladorParcial } from '@/lib/imoveis/normalizar'
import { estagioCaptacaoValido, intencaoValida, tipoImovelValido } from '@/lib/proprietarios/pipeline'

export const dynamic = 'force-dynamic'

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb()
    .from('crm_proprietarios')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const nome = typeof body?.nome === 'string' ? body.nome.trim() : ''
  const whatsapp = typeof body?.whatsapp === 'string' ? body.whatsapp.replace(/\D/g, '') : ''
  if (!nome || !whatsapp) {
    return NextResponse.json({ error: 'nome e whatsapp são obrigatórios' }, { status: 400 })
  }

  const { row, set } = criarAcumuladorParcial()
  set('nome', nome)
  set('whatsapp', whatsapp)
  set('email', body.email || null)
  set('intencao', intencaoValida(body.intencao) ? body.intencao : 'vender')
  set('tipo_imovel', tipoImovelValido(body.tipo_imovel) ? body.tipo_imovel : null)
  set('cidade', body.cidade || null)
  set('bairro', body.bairro || null)
  set('endereco', body.endereco || null)
  set('metragem', body.metragem || null)
  set('dormitorios', body.dormitorios || null)
  set('valor_pretendido', typeof body.valor_pretendido === 'number' ? body.valor_pretendido : null)
  set('origem', body.origem || 'cadastro_manual')
  set('anotacoes', body.anotacoes || null)
  set('estagio', estagioCaptacaoValido(body.estagio) ? body.estagio : 'novo')

  const { data, error } = await sb().from('crm_proprietarios').upsert(row, { onConflict: 'whatsapp' }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const id = typeof body?.id === 'string' ? body.id : ''
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  // Update PARCIAL de verdade — mesma lição do bug que zerou 8 empreendimentos:
  // montar a linha inteira com `?? null` apaga tudo que o chamador não enviou,
  // e o Kanban envia só {id, estagio} ao arrastar um cartão.
  const { row, set } = criarAcumuladorParcial()

  if ('estagio' in body) {
    if (!estagioCaptacaoValido(body.estagio)) {
      return NextResponse.json({ error: `estágio inválido: ${body.estagio}` }, { status: 400 })
    }
    set('estagio', body.estagio)
    // Publicar registra a data automaticamente — é a base do indicador
    // "tempo entre captação e publicação".
    if (body.estagio === 'publicado') set('publicado_em', new Date().toISOString())
  }
  if ('intencao' in body) {
    if (!intencaoValida(body.intencao)) return NextResponse.json({ error: 'intenção inválida' }, { status: 400 })
    set('intencao', body.intencao)
  }
  if ('tipo_imovel' in body) {
    if (body.tipo_imovel !== null && !tipoImovelValido(body.tipo_imovel)) {
      return NextResponse.json({ error: 'tipo de imóvel inválido' }, { status: 400 })
    }
    set('tipo_imovel', body.tipo_imovel)
  }

  for (const campo of [
    'nome', 'email', 'cidade', 'bairro', 'endereco', 'metragem', 'dormitorios',
    'valor_pretendido', 'valor_acordado', 'autorizacao', 'exclusividade',
    'motivo_perda', 'anotacoes', 'ultimo_contato', 'proximo_contato',
    'link_anuncio', 'property_id', 'origem',
  ] as const) {
    if (campo in body) set(campo, body[campo])
  }

  if (Object.keys(row).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar.' }, { status: 400 })
  }
  row.updated_at = new Date().toISOString()

  const { data, error } = await sb().from('crm_proprietarios').update(row).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })
  const { error } = await sb().from('crm_proprietarios').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
