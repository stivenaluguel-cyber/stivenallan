import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { registrarMudancaEstagio } from '@/lib/leads/registrar-mudanca-estagio'
import { getActiveFocusSession, recordFocusEvent } from '@/lib/dashboard/focus-session-events'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function auth(): Promise<string | null> {
  const s = await cookies(); const t = s.get('dashboard_token')?.value; if (!t) return null
  try {
    const { payload } = await jwtVerify(t, new TextEncoder().encode(process.env.JWT_SECRET!))
    return (payload.adminId as string) ?? null
  } catch { return null }
}

export async function GET(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
  const adminId = await auth()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { lead_id, empreendimento_id, unidade_id, valor_proposto, entrada, parcelas_qtd, parcelas_valor, baloes, observacoes } = body

  if (!lead_id || !empreendimento_id || !valor_proposto) {
    return NextResponse.json({ error: 'lead_id, empreendimento_id e valor_proposto sao obrigatorios' }, { status: 400 })
  }

  const client = sb()
  const { data, error } = await client.from('crm_propostas').insert({
    lead_id, empreendimento_id, unidade_id: unidade_id || null,
    valor_proposto, entrada: entrada || null,
    parcelas_qtd: parcelas_qtd || null, parcelas_valor: parcelas_valor || null,
    baloes: baloes || null, observacoes: observacoes || null,
    status: 'pendente', versao: 1
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Avança o estágio do lead para "Proposta Enviada" — usando o vocabulário
  // de ESTAGIOS_FUNIL (fonte única do funil) e o mesmo helper compartilhado
  // que o Kanban usa, para logar em leads_interacoes e disparar Meta/Google
  // Ads corretamente. Correção de um bug pré-existente: este código usava
  // 'proposta'/'fechamento', valores que não batem nem com ESTAGIOS_FUNIL
  // nem com o CHECK constraint de leads.estagio_funil no banco — o update
  // sempre falhava silenciosamente (erro nunca era verificado) e o lead
  // jamais avançava de fato no funil ao gerar uma proposta.
  const { data: leadAtual } = await client.from('leads').select('estagio_funil').eq('id', lead_id).single()
  if (leadAtual && leadAtual.estagio_funil !== 'proposta_enviada') {
    await registrarMudancaEstagio(client, lead_id, leadAtual.estagio_funil, 'proposta_enviada')
  }
  await client.from('leads').update({ estagio_funil: 'proposta_enviada', updated_at: new Date().toISOString() }).eq('id', lead_id)
  await client.from('leads_interacoes').insert({ lead_id, tipo: 'proposta', descricao: 'Proposta criada no valor de R$ ' + Number(valor_proposto).toLocaleString('pt-BR') })

  // Se houver uma sessão de Modo Foco ativa deste corretor, a proposta conta
  // pontos e entra no resumo da sessão ("Propostas geradas") mesmo tendo
  // sido criada pelo módulo de Propostas, não pelo card do Modo Foco.
  // clientEventId gerado no servidor (não é um clique do usuário passível de
  // retry): cada POST bem-sucedido cria exatamente UMA linha nova em
  // crm_propostas, então um UUID fresco aqui nunca colide com nada.
  const sessaoAtiva = await getActiveFocusSession(client, adminId)
  if (sessaoAtiva) {
    await recordFocusEvent(client, { sessionId: sessaoAtiva.id, leadId: lead_id, adminId, actionType: 'proposta_enviada', clientEventId: randomUUID() })
  }

  return NextResponse.json({ data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const adminId = await auth()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, ...update } = body
  if (!id) return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })

  update.updated_at = new Date().toISOString()
  const client = sb()

  if (update.status === 'aceita') {
    const { data: prop } = await client.from('crm_propostas').select('lead_id, valor_proposto').eq('id', id).single()
    if (prop) {
      const { data: leadAtual } = await client.from('leads').select('estagio_funil').eq('id', prop.lead_id).single()
      if (leadAtual && leadAtual.estagio_funil !== 'fechado') {
        await registrarMudancaEstagio(client, prop.lead_id, leadAtual.estagio_funil, 'fechado')
      }
      await client.from('leads').update({ estagio_funil: 'fechado', updated_at: new Date().toISOString() }).eq('id', prop.lead_id)
      await client.from('leads_interacoes').insert({ lead_id: prop.lead_id, tipo: 'proposta_aceita', descricao: 'Proposta aceita: R$ ' + Number(prop.valor_proposto).toLocaleString('pt-BR') })

      const sessaoAtiva = await getActiveFocusSession(client, adminId)
      if (sessaoAtiva && leadAtual) {
        await recordFocusEvent(client, {
          sessionId: sessaoAtiva.id, leadId: prop.lead_id, adminId,
          actionType: 'etapa_alterada', previousStage: leadAtual.estagio_funil, nextStage: 'fechado',
          clientEventId: randomUUID(),
        })
      }
    }
  }

  const { data, error } = await client.from('crm_propostas').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
