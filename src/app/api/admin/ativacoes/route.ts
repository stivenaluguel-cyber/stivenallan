import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { criarAcumuladorParcial } from '@/lib/imoveis/normalizar'
import { origemAtivacaoValida } from '@/lib/instagram/playbooks'
import { statusAtivacaoValido } from '@/lib/instagram/ativacoes'

// CRUD da fila de ativação manual do Instagram (crm_ativacoes_instagram).
// A fila é preenchida à mão ou por importação em lote — a API da Meta não
// entrega listas de seguidores/curtidas/comentários pra isso.

export const dynamic = 'force-dynamic'

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// "@Fulano_SC " → "fulano_sc". O índice único é em (username, origem); sem
// normalizar, "@fulano" e "Fulano" viram duas linhas da mesma pessoa.
function normalizarUsername(v: unknown): string {
  return typeof v === 'string' ? v.trim().replace(/^@+/, '').toLowerCase() : ''
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const status = new URL(req.url).searchParams.get('status')
  if (status !== null && !statusAtivacaoValido(status)) {
    return NextResponse.json({ error: `status inválido: ${status}` }, { status: 400 })
  }

  let query = sb().from('crm_ativacoes_instagram').select('*').order('created_at', { ascending: true }).limit(1000)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

// Criação em LOTE: o operador cola a lista que copiou do app do Instagram.
// Aceita { itens: [{ username, origem, contexto?, nome? }] } ou o array direto.
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)

  const itens: unknown[] = Array.isArray(body) ? body : Array.isArray(body?.itens) ? body.itens : []
  if (itens.length === 0) {
    return NextResponse.json({ error: 'Envie ao menos um item: { itens: [{ username, origem }] }' }, { status: 400 })
  }

  // Valida TUDO antes de tocar no banco — lote meio-inserido é pior que erro.
  const linhas: Record<string, unknown>[] = []
  const vistos = new Set<string>()
  for (const item of itens as Record<string, unknown>[]) {
    const username = normalizarUsername(item?.username)
    const origem = item?.origem
    if (!username) return NextResponse.json({ error: 'username obrigatório em todos os itens' }, { status: 400 })
    if (!origemAtivacaoValida(origem)) {
      return NextResponse.json({ error: `origem inválida: ${String(origem)}` }, { status: 400 })
    }

    // Dedup dentro do próprio lote: o ON CONFLICT do Postgres não aceita a
    // mesma chave duas vezes no mesmo comando.
    const chave = `${username}::${origem}`
    if (vistos.has(chave)) continue
    vistos.add(chave)

    const { row, set } = criarAcumuladorParcial()
    set('username', username)
    set('origem', origem)
    set('nome', typeof item.nome === 'string' && item.nome.trim() ? item.nome.trim() : null)
    set('contexto', typeof item.contexto === 'string' && item.contexto.trim() ? item.contexto.trim() : null)
    linhas.push(row)
  }

  // ignoreDuplicates: reimportar a mesma lista NÃO pode rebaixar pra 'pendente'
  // quem já foi abordado — mesma família do bug de perda de dados que zerou
  // 8 empreendimentos. Quem já existe fica exatamente como está.
  const { data, error } = await sb()
    .from('crm_ativacoes_instagram')
    .upsert(linhas, { onConflict: 'username,origem', ignoreDuplicates: true })
    .select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: data ?? [], inseridos: data?.length ?? 0, recebidos: itens.length }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const id = typeof body?.id === 'string' ? body.id : ''
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  // Update PARCIAL de verdade — mesma lição do bug que zerou 8 empreendimentos:
  // montar a linha inteira com `?? null` apaga tudo que o chamador não enviou,
  // e o Kanban envia só {id, status} ao arrastar um cartão.
  const { row, set } = criarAcumuladorParcial()

  if ('status' in body) {
    if (!statusAtivacaoValido(body.status)) {
      return NextResponse.json({ error: `status inválido: ${body.status}` }, { status: 400 })
    }
    set('status', body.status)
    // Marcar como abordado registra a hora automaticamente — é a base do
    // contador "abordagens hoje" contra a meta diária.
    if (body.status === 'abordado') set('abordado_em', new Date().toISOString())
  }

  if ('origem' in body) {
    if (!origemAtivacaoValida(body.origem)) {
      return NextResponse.json({ error: `origem inválida: ${body.origem}` }, { status: 400 })
    }
    set('origem', body.origem)
  }

  for (const campo of ['nome', 'contexto', 'anotacoes', 'lead_id'] as const) {
    if (campo in body) set(campo, body[campo])
  }

  if (Object.keys(row).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar.' }, { status: 400 })
  }
  row.updated_at = new Date().toISOString()

  const { data, error } = await sb().from('crm_ativacoes_instagram').update(row).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })
  const { error } = await sb().from('crm_ativacoes_instagram').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
