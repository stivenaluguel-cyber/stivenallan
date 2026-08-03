import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { registrarMudancaEstagio } from '@/lib/leads/registrar-mudanca-estagio'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { recalcularScoreLead } from '@/lib/leads/score-server'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { data, error } = await sb().from('leads').select('*, empreendimentos(nome, slug), leads_interacoes(*)').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Lead nao encontrado' }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  body.updated_at = new Date().toISOString()
  if (body.estagio_funil) {
    const { data: lead } = await sb().from('leads').select('estagio_funil').eq('id', id).single()
    if (lead && lead.estagio_funil !== body.estagio_funil) {
      await registrarMudancaEstagio(sb(), id, lead.estagio_funil, body.estagio_funil)
    }
  }
  const { data, error } = await sb().from('leads').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  // `lead_score` saiu da lista: quem escreve nele agora é o motor em
  // src/lib/leads/score.ts. Aceitar valor manual aqui só criaria um número
  // que o próximo recálculo apaga sem avisar.
  //
  // Os campos comerciais (entrada, prazo, perfil, faixa) entraram porque
  // passaram a ser editáveis no card — e são o que mais pesa no score de
  // financiamento direto.
  const allowed = ['estagio_funil','requer_atencao','notas','temperatura','kanban_ordem','anotacoes','nome','whatsapp','email','origem','orcamento_min','orcamento_max','atendimento_humano_ativo','proximo_followup','ultimo_contato','entrada_disponivel','faixa_investimento','prazo_compra','perfil','cidade_interesse','motivacao','primeiro_atendimento_em','permuta_descricao','permuta_valor']
  // Loga a transição de estágio (mesma lógica do PUT acima) — o Kanban
  // arrasta-e-solta usa PATCH, então sem isso o relatório de funil nunca
  // teria histórico de mudança de estágio.
  if (body.estagio_funil) {
    const { data: lead } = await sb().from('leads').select('estagio_funil').eq('id', id).single()
    if (lead && lead.estagio_funil !== body.estagio_funil) {
      await registrarMudancaEstagio(sb(), id, lead.estagio_funil, body.estagio_funil)
    }
  }
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const k of allowed) { if (k in body) update[k] = body[k] }
  const { data, error } = await sb().from('leads').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Editar entrada, orçamento ou prazo muda o score na hora — esperar o cron
  // da manhã seguinte faria o corretor ver o número velho logo depois de
  // qualificar o lead. recalcularScoreLead nunca lança.
  const score = await recalcularScoreLead(sb(), id)
  return NextResponse.json({ data: score ? { ...data, lead_score: score.score } : data, score })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await sb().from('leads').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
