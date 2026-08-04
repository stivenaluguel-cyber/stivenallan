import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const GATILHOS_VALIDOS = new Set(['estagio_parado_dias', 'score_acima', 'sem_resposta_dias'])
const ACOES_VALIDAS = new Set(['mover_estagio', 'notificar_stiven', 'enviar_whatsapp'])

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await sb()
    .from('automacao_regras')
    .select('id, nome, ativo, gatilho_tipo, gatilho_params, filtro_estagio, acao_tipo, acao_params, created_at, updated_at')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ regras: data ?? [] })
}

// Regra nova SEMPRE nasce pausada (ativo: false), mesmo que o corpo mande
// ativo: true — replica o padrão "automação nova começa pausada" adotado
// no resto do motor de regras; ativar é um passo explícito e separado.
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })

  const { nome, gatilho_tipo, gatilho_params, filtro_estagio, acao_tipo, acao_params } = body as Record<string, unknown>

  if (typeof nome !== 'string' || !nome.trim()) {
    return NextResponse.json({ error: 'nome é obrigatório' }, { status: 400 })
  }
  if (typeof gatilho_tipo !== 'string' || !GATILHOS_VALIDOS.has(gatilho_tipo)) {
    return NextResponse.json({ error: 'gatilho_tipo inválido' }, { status: 400 })
  }
  if (typeof acao_tipo !== 'string' || !ACOES_VALIDAS.has(acao_tipo)) {
    return NextResponse.json({ error: 'acao_tipo inválido' }, { status: 400 })
  }

  const { data, error } = await sb()
    .from('automacao_regras')
    .insert({
      nome: nome.trim(),
      ativo: false,
      gatilho_tipo,
      gatilho_params: gatilho_params ?? {},
      filtro_estagio: Array.isArray(filtro_estagio) && filtro_estagio.length > 0 ? filtro_estagio : null,
      acao_tipo,
      acao_params: acao_params ?? {},
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id }, { status: 201 })
}

// Edição parcial por id — cobre tanto o toggle ativo/pausar quanto ajustar
// parâmetros. Cada PATCH manda só os campos que mudaram.
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object' || typeof (body as Record<string, unknown>).id !== 'string') {
    return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
  }

  const { id, ...campos } = body as Record<string, unknown>
  const permitido: Record<string, unknown> = {}
  if (typeof campos.nome === 'string') permitido.nome = campos.nome.trim()
  if (typeof campos.ativo === 'boolean') permitido.ativo = campos.ativo
  if (typeof campos.gatilho_tipo === 'string' && GATILHOS_VALIDOS.has(campos.gatilho_tipo)) permitido.gatilho_tipo = campos.gatilho_tipo
  if (campos.gatilho_params && typeof campos.gatilho_params === 'object') permitido.gatilho_params = campos.gatilho_params
  if (campos.filtro_estagio === null || Array.isArray(campos.filtro_estagio)) permitido.filtro_estagio = campos.filtro_estagio
  if (typeof campos.acao_tipo === 'string' && ACOES_VALIDAS.has(campos.acao_tipo)) permitido.acao_tipo = campos.acao_tipo
  if (campos.acao_params && typeof campos.acao_params === 'object') permitido.acao_params = campos.acao_params

  if (Object.keys(permitido).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo válido pra atualizar' }, { status: 400 })
  }
  permitido.updated_at = new Date().toISOString()

  const { error } = await sb().from('automacao_regras').update(permitido).eq('id', id as string)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })

  const { error } = await sb().from('automacao_regras').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
