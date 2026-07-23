import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticado } from '@/lib/dashboard/auth-check'
import { registrarMudancaEstagio } from '@/lib/leads/registrar-mudanca-estagio'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const lead_id = searchParams.get('lead_id')
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  let q = sb().from('crm_propostas').select(`
    *,
    leads(nome, telefone, email),
    empreendimentos(nome, slug),
    empreendimentos_unidades(tipologia, metragem, valor_base)
  `, { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  if (lead_id) q = q.eq('lead_id', lead_id)
  if (status) q = q.eq('status', status)

  const { data, error, count } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, count, page, limit })
}

export async function POST(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { lead_id, empreendimento_id, unidade_id, valor_proposto, entrada, parcelas_qtd, parcelas_valor, baloes, observacoes } = body

  if (!lead_id || !empreendimento_id || !valor_proposto) {
    return NextResponse.json({ error: 'lead_id, empreendimento_id e valor_proposto sao obrigatorios' }, { status: 400 })
  }

  const { data, error } = await sb().from('crm_propostas').insert({
    lead_id, empreendimento_id, unidade_id: unidade_id || null,
    valor_proposto, entrada: entrada || null,
    parcelas_qtd: parcelas_qtd || null, parcelas_valor: parcelas_valor || null,
    baloes: baloes || null, observacoes: observacoes || null,
    status: 'pendente', versao: 1
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Atualiza estagio do lead para Proposta Enviada — usa o vocabulário
  // CANÔNICO (src/lib/dashboard/estagios.ts). Antes gravava 'proposta', um
  // valor que não existe em nenhuma coluna do Kanban: o lead sumia
  // visualmente de todas as colunas em /dashboard/crm e /dashboard/leads e
  // caía num bucket "não mapeado" no relatório de funil.
  const { data: leadAtual } = await sb().from('leads').select('estagio_funil').eq('id', lead_id).single()
  await sb().from('leads').update({ estagio_funil: 'proposta_enviada', updated_at: new Date().toISOString() }).eq('id', lead_id)
  if (leadAtual && leadAtual.estagio_funil !== 'proposta_enviada') {
    await registrarMudancaEstagio(lead_id, leadAtual.estagio_funil, 'proposta_enviada', sb())
  }
  await sb().from('leads_interacoes').insert({ lead_id, tipo: 'proposta', descricao: 'Proposta criada no valor de R$ ' + Number(valor_proposto).toLocaleString('pt-BR') })

  return NextResponse.json({ data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  if (!await autenticado()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, ...update } = body
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })

  update.updated_at = new Date().toISOString()

  if (update.status === 'aceita') {
    const { data: prop } = await sb().from('crm_propostas').select('lead_id, valor_proposto').eq('id', id).single()
    if (prop) {
      // 'fechado' é o valor canônico (era 'fechamento', que não existe em
      // nenhuma coluna do Kanban — mesmo bug do POST acima).
      const { data: leadAtual } = await sb().from('leads').select('estagio_funil').eq('id', prop.lead_id).single()
      await sb().from('leads').update({ estagio_funil: 'fechado', updated_at: new Date().toISOString() }).eq('id', prop.lead_id)
      if (leadAtual && leadAtual.estagio_funil !== 'fechado') {
        await registrarMudancaEstagio(prop.lead_id, leadAtual.estagio_funil, 'fechado', sb())
      }
      await sb().from('leads_interacoes').insert({ lead_id: prop.lead_id, tipo: 'proposta_aceita', descricao: 'Proposta aceita: R$ ' + Number(prop.valor_proposto).toLocaleString('pt-BR') })
    }
  }

  const { data, error } = await sb().from('crm_propostas').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
