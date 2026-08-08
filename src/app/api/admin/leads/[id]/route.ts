import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { registrarMudancaEstagio } from '@/lib/leads/registrar-mudanca-estagio'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { recalcularScoreLead } from '@/lib/leads/score-server'
import type { Database } from '@/types/database.generated'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }
type LeadUpdate = Database['public']['Tables']['leads']['Update']

// Campos que o card do CRM legitimamente edita (mesma superfície do PATCH
// abaixo — é o mesmo recurso, mesma UI). `satisfies` garante em tempo de
// compilação que cada nome aqui é uma coluna real de `leads`; um typo ou uma
// coluna inexistente (como "notas", que nunca existiu) não compila.
// Deliberadamente FORA: id, created_at, updated_at (server-owned),
// lead_score/lead_score_atualizado_em/lead_score_detalhe (dono é o motor de
// score em src/lib/leads/score.ts), cliente_id/empreendimento_interesse/
// property_id/property_name (vínculos, não edição de campo solto),
// utm_*/fbclid/gclid/source (atribuição de marketing capturada na criação,
// trilha de auditoria), status/contacted/alerta_sem_atendimento/
// tentativas_followup/email_followup_*/unsubscribe*/whatsapp_optout_*
// (mantidos por crons/automações), observacoes_ia (gerado por IA).
const LEAD_PUT_ALLOWED_FIELDS = [
  'estagio_funil', 'requer_atencao', 'temperatura', 'kanban_ordem', 'anotacoes',
  'nome', 'whatsapp', 'email', 'origem', 'orcamento_min', 'orcamento_max',
  'atendimento_humano_ativo', 'proximo_followup', 'ultimo_contato',
  'entrada_disponivel', 'faixa_investimento', 'prazo_compra', 'perfil',
  'cidade_interesse', 'motivacao', 'primeiro_atendimento_em',
  'permuta_descricao', 'permuta_valor',
] as const satisfies readonly (keyof LeadUpdate)[]

// Fronteira de JSON externo -> tipo interno: `body` vem de `req.json()`
// (unknown por natureza), então cada campo aceito passa por um cast pontual
// pro tipo exato daquela coluna — igual ao padrão já usado no POST desta
// mesma rota (Database['public']['Tables']['leads']['Insert']). Nunca um
// `as any`/`as never`/`unknown as`. K generico (em vez de indexar
// diretamente com o tipo união do loop) é o que faz o TS distribuir o tipo
// por campo em vez de colapsar pra `undefined`.
function setLeadField<K extends keyof LeadUpdate>(update: LeadUpdate, campo: K, valor: unknown) {
  update[campo] = valor as LeadUpdate[K]
}

function buildLeadUpdate(body: Record<string, unknown>): LeadUpdate {
  const update: LeadUpdate = { updated_at: new Date().toISOString() }
  for (const campo of LEAD_PUT_ALLOWED_FIELDS) {
    if (campo in body) {
      setLeadField(update, campo, body[campo])
    }
  }
  return update
}

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

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const update = buildLeadUpdate(body)

  if (update.estagio_funil) {
    const { data: lead } = await sb().from('leads').select('estagio_funil').eq('id', id).single()
    if (lead && lead.estagio_funil !== update.estagio_funil) {
      await registrarMudancaEstagio(sb(), id, lead.estagio_funil, update.estagio_funil)
    }
  }
  const { data, error } = await sb().from('leads').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }
  // `lead_score` saiu da lista: quem escreve nele agora é o motor em
  // src/lib/leads/score.ts. Aceitar valor manual aqui só criaria um número
  // que o próximo recálculo apaga sem avisar.
  //
  // Os campos comerciais (entrada, prazo, perfil, faixa) entraram porque
  // passaram a ser editáveis no card — e são o que mais pesa no score de
  // financiamento direto.
  const allowed = ['estagio_funil','requer_atencao','temperatura','kanban_ordem','anotacoes','nome','whatsapp','email','origem','orcamento_min','orcamento_max','atendimento_humano_ativo','proximo_followup','ultimo_contato','entrada_disponivel','faixa_investimento','prazo_compra','perfil','cidade_interesse','motivacao','primeiro_atendimento_em','permuta_descricao','permuta_valor'] as const satisfies readonly (keyof LeadUpdate)[]
  const update: LeadUpdate = { updated_at: new Date().toISOString() }
  for (const k of allowed) { if (k in body) setLeadField(update, k, body[k]) }

  // Loga a transição de estágio (mesma lógica do PUT acima) — o Kanban
  // arrasta-e-solta usa PATCH, então sem isso o relatório de funil nunca
  // teria histórico de mudança de estágio. Olha o valor já sanitizado
  // (`update`), não o body bruto — mesmo princípio do PUT.
  if (update.estagio_funil) {
    const { data: lead } = await sb().from('leads').select('estagio_funil').eq('id', id).single()
    if (lead && lead.estagio_funil !== update.estagio_funil) {
      await registrarMudancaEstagio(sb(), id, lead.estagio_funil, update.estagio_funil)
    }
  }
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
