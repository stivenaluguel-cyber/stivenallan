import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { normalizarPatchProposta } from '@/lib/propostas/normalizar-proposta'
import { logError } from '@/lib/log'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const SOURCE = 'api/admin/propostas/[id]'

type Params = { params: Promise<{ id: string }> }

// A tela do Financeiro já chamava PATCH e DELETE nesta URL — a rota
// simplesmente não existia. As duas chamadas iam para 404 dentro de um
// try/catch que caía em localStorage, então editar e excluir venda "funcionava"
// só no navegador de quem clicou.

export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const { data, error } = await sb()
    .from('crm_propostas')
    .select('*, leads(nome, whatsapp, email), empreendimentos(nome, slug)')
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })

  const normalizado = normalizarPatchProposta(body)
  if (!normalizado.ok) return NextResponse.json({ error: normalizado.erro }, { status: 400 })

  const { data, error } = await sb()
    .from('crm_propostas')
    .update({ ...normalizado.update, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const client = sb()

  // Comissão referencia a proposta com ON DELETE SET NULL: a comissão
  // sobreviveria órfã, sem venda que a justifique, e continuaria contando no
  // relatório de caixa. Melhor recusar e deixar a decisão explícita.
  const { data: comissao } = await client
    .from('crm_comissoes')
    .select('id')
    .eq('proposta_id', id)
    .maybeSingle()

  if (comissao) {
    return NextResponse.json(
      { error: 'Esta venda tem comissão lançada. Exclua a comissão antes.' },
      { status: 409 },
    )
  }

  const { error } = await client.from('crm_propostas').delete().eq('id', id)
  if (error) {
    logError(SOURCE, 'falha ao excluir proposta', error, { propostaId: id })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
