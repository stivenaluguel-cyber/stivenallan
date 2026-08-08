import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { buildLeadTimeline } from '@/lib/dashboard/lead-timeline'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

type Params = { params: Promise<{ id: string }> }

// Linha do tempo única do lead. Antes, cada fonte vivia numa tela diferente
// (ou em nenhuma): mudanças de etapa e propostas existiam em leads_interacoes
// mas nunca eram exibidas, compromissos e ações do Modo Foco não apareciam
// no modal do Kanban, e mensagens do Instagram ficavam invisíveis porque o
// painel de conversa filtrava canal='whatsapp'.
export async function GET(_req: NextRequest, { params }: Params) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: leadId } = await params
  const client = sb()

  const [lead, interacoesLead, mensagens, agenda, eventosFoco] = await Promise.all([
    client.from('leads').select('anotacoes').eq('id', leadId).maybeSingle(),
    client.from('leads_interacoes').select('id, tipo, descricao, estagio_de, estagio_para, created_at')
      .eq('lead_id', leadId).order('created_at', { ascending: false }).limit(100),
    client.from('interacoes').select('id, canal, direcao, mensagem, created_at, processado_por_ia, sentimento')
      .eq('lead_id', leadId).order('created_at', { ascending: false }).limit(100),
    client.from('crm_agenda').select('id, titulo, tipo, inicio, status, properties(nome)')
      .eq('lead_id', leadId).order('inicio', { ascending: false }).limit(50),
    client.from('crm_focus_events').select('id, action_type, created_at, metadata')
      .eq('lead_id', leadId).order('created_at', { ascending: false }).limit(100),
  ])

  // isOneToOne:false no schema oficial tipa o embed `properties(nome)` como
  // array mesmo sendo, na prática, "um compromisso aponta pra no máximo um
  // imóvel" — mesmo padrão defensivo já usado em outras rotas (ex.:
  // src/app/api/admin/leads/route.ts). Normaliza pra `property_nome` antes
  // de entregar a buildLeadTimeline(), que é puro e não conhece o shape do
  // Supabase.
  const agendaNormalizada = (agenda.data ?? []).map((ev) => {
    const propriedade = Array.isArray(ev.properties) ? ev.properties[0] : ev.properties
    return { id: ev.id, titulo: ev.titulo, tipo: ev.tipo, inicio: ev.inicio, status: ev.status, property_nome: propriedade?.nome ?? null }
  })

  const timeline = buildLeadTimeline({
    anotacoesLegadas: lead.data?.anotacoes ?? null,
    interacoesLead: interacoesLead.data ?? [],
    mensagens: mensagens.data ?? [],
    agenda: agendaNormalizada,
    eventosFoco: eventosFoco.data ?? [],
  })

  return NextResponse.json({ data: timeline })
}
