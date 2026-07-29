import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { gerarParcelas, normalizarParcelas, resumirParcelas, STATUS_PARCELA, type StatusParcela } from '@/lib/comissoes/parcelas'
import { hojeEmSaoPaulo } from '@/lib/dashboard/timezone-sp'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

// GET — parcelas da comissão + resumo de caixa
export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const { data, error } = await sb()
    .from('crm_comissao_parcelas')
    .select('*')
    .eq('comissao_id', id)
    .order('numero', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const parcelas = (data ?? []).map((p) => ({ ...p, valor: Number(p.valor) }))
  return NextResponse.json({ data: parcelas, resumo: resumirParcelas(parcelas, hojeEmSaoPaulo()) })
}

// POST — define o plano de parcelamento.
//   { quantidade, primeiraData, intervaloMeses }  → gera automaticamente
//   { parcelas: [...] }                           → plano montado à mão
//
// Substitui o plano anterior por inteiro: editar parcela a parcela abriria
// espaço para um plano que não fecha com o valor da comissão.
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })

  const client = sb()
  const { data: comissao } = await client
    .from('crm_comissoes')
    .select('id, valor_comissao, data_venda')
    .eq('id', id)
    .maybeSingle()

  if (!comissao) return NextResponse.json({ error: 'Comissão não encontrada' }, { status: 404 })

  const valorComissao = Number(comissao.valor_comissao)

  const parcelasBrutas = Array.isArray(body.parcelas) && body.parcelas.length > 0
    ? body.parcelas
    : gerarParcelas(
        valorComissao,
        Number(body.quantidade ?? 1),
        // Sem primeira data explícita, o parcelamento começa na data da
        // venda; sem ela, hoje.
        typeof body.primeiraData === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.primeiraData)
          ? body.primeiraData
          : (comissao.data_venda as string | null) ?? hojeEmSaoPaulo(),
        Number(body.intervaloMeses ?? 1),
      )

  const normalizado = normalizarParcelas(id, valorComissao, parcelasBrutas)
  if (!normalizado.ok) return NextResponse.json({ error: normalizado.erro }, { status: 400 })

  // Parcela já recebida não pode ser apagada por um replanejamento: o
  // dinheiro entrou e o histórico de caixa tem que continuar batendo.
  const { data: recebidas } = await client
    .from('crm_comissao_parcelas')
    .select('id')
    .eq('comissao_id', id)
    .eq('status', 'recebida')

  if ((recebidas ?? []).length > 0) {
    return NextResponse.json(
      { error: 'Esta comissão já tem parcela recebida. Cancele ou ajuste as parcelas individualmente.' },
      { status: 409 },
    )
  }

  const { error: erroDelete } = await client.from('crm_comissao_parcelas').delete().eq('comissao_id', id)
  if (erroDelete) return NextResponse.json({ error: erroDelete.message }, { status: 500 })

  const { data, error } = await client
    .from('crm_comissao_parcelas')
    .insert(normalizado.inserts)
    .select()
    .order('numero', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const parcelas = (data ?? []).map((p) => ({ ...p, valor: Number(p.valor) }))
  return NextResponse.json({ data: parcelas, resumo: resumirParcelas(parcelas, hojeEmSaoPaulo()) }, { status: 201 })
}

// PATCH — baixa de uma parcela: { parcelaId, status, data_pagamento }
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await req.json().catch(() => null)
  const parcelaId = typeof body?.parcelaId === 'string' ? body.parcelaId : null
  if (!parcelaId) return NextResponse.json({ error: 'parcelaId obrigatório' }, { status: 400 })

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (body.status !== undefined) {
    if (!(STATUS_PARCELA as readonly string[]).includes(body.status)) {
      return NextResponse.json({ error: 'status inválido' }, { status: 400 })
    }
    update.status = body.status as StatusParcela
    // Marcar como recebida sem data deixaria o fluxo de caixa sem saber em
    // que mês o dinheiro entrou.
    if (body.status === 'recebida' && !body.data_pagamento) update.data_pagamento = hojeEmSaoPaulo()
    if (body.status === 'prevista') update.data_pagamento = null
  }

  if (body.data_pagamento !== undefined && body.data_pagamento !== null) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.data_pagamento))) {
      return NextResponse.json({ error: 'data_pagamento deve estar no formato AAAA-MM-DD' }, { status: 400 })
    }
    update.data_pagamento = body.data_pagamento
  }

  const client = sb()
  // O filtro por comissao_id impede que um parcelaId de outra comissão seja
  // alterado passando o id errado na URL.
  const { error } = await client
    .from('crm_comissao_parcelas')
    .update(update)
    .eq('id', parcelaId)
    .eq('comissao_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = await client
    .from('crm_comissao_parcelas')
    .select('*')
    .eq('comissao_id', id)
    .order('numero', { ascending: true })

  const parcelas = (data ?? []).map((p) => ({ ...p, valor: Number(p.valor) }))
  const resumo = resumirParcelas(parcelas, hojeEmSaoPaulo())

  // A comissão vira "recebida" quando a última parcela cai — senão o
  // relatório mostraria comissão pendente com tudo já pago.
  if (resumo.quantidade > 0 && resumo.aReceber === 0) {
    await client.from('crm_comissoes')
      .update({ status: 'recebida', data_recebimento: hojeEmSaoPaulo(), updated_at: new Date().toISOString() })
      .eq('id', id)
  }

  return NextResponse.json({ data: parcelas, resumo })
}
