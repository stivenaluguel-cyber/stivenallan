import type { SupabaseClient } from '@supabase/supabase-js'
import { buildFocusQueue, type AgendaEventoRef, type AgendaOverdueInfo, type FocusQueueFilters } from './focus-queue'

// Colunas explícitas em vez de select('*'): a fila não precisa (e não deve
// mandar pro cliente) campos como observacoes_ia, utm_*/gclid/fbclid,
// tokens ou qualquer coisa que só existe pra automação interna.
export const LEAD_COLUNAS_FILA =
  'id, nome, whatsapp, email, estagio_funil, status, origem, temperatura, lead_score, requer_atencao, orcamento_max, proximo_followup, ultimo_contato, created_at, property_name, anotacoes, empreendimentos(nome, slug, cidade)'

export type AgendaRow = { id: string; lead_id: string | null; titulo: string; inicio: string; tipo: string; status: string }

// Cruza crm_agenda com os leads, separando o que JÁ PASSOU do que ainda vai
// acontecer. Visita vencida e visita futura ficam em campos distintos de
// propósito — só a vencida pode ser marcada como realizada.
export function cruzarAgenda(agenda: AgendaRow[], now: Date = new Date()) {
  const agendaPorLead: Record<string, AgendaOverdueInfo> = {}
  const visitaVencidaPorLead: Record<string, AgendaEventoRef | undefined> = {}
  const visitaFuturaPorLead: Record<string, AgendaEventoRef | undefined> = {}

  for (const ev of agenda) {
    if (!ev.lead_id) continue
    const info = agendaPorLead[ev.lead_id] ?? { vencidoCount: 0, proximoEvento: null, compromissoVencido: null }
    const ref: AgendaEventoRef = { id: ev.id, titulo: ev.titulo, inicio: ev.inicio, tipo: ev.tipo, status: ev.status }

    if (new Date(ev.inicio).getTime() < now.getTime()) {
      info.vencidoCount += 1
      // O compromisso vencido "exato" é o MAIS ATRASADO — o que está
      // esperando resposta há mais tempo.
      if (!info.compromissoVencido || new Date(ev.inicio) < new Date(info.compromissoVencido.inicio)) {
        info.compromissoVencido = ref
      }
      if (ev.tipo === 'visita') {
        const atual = visitaVencidaPorLead[ev.lead_id]
        if (!atual || new Date(ev.inicio) < new Date(atual.inicio)) visitaVencidaPorLead[ev.lead_id] = ref
      }
    } else {
      if (!info.proximoEvento || new Date(ev.inicio) < new Date(info.proximoEvento.inicio)) {
        info.proximoEvento = { titulo: ev.titulo, inicio: ev.inicio, tipo: ev.tipo }
      }
      if (ev.tipo === 'visita') {
        const atual = visitaFuturaPorLead[ev.lead_id]
        if (!atual || new Date(ev.inicio) < new Date(atual.inicio)) visitaFuturaPorLead[ev.lead_id] = ref
      }
    }
    agendaPorLead[ev.lead_id] = info
  }

  return { agendaPorLead, visitaVencidaPorLead, visitaFuturaPorLead }
}

// Leads adiados para uma data futura em QUALQUER sessão. Sem isso, "Adiar"
// só valeria dentro da sessão em que foi feito: bastava encerrar e iniciar
// outra pro lead reaparecer no mesmo dia — o que esvazia o sentido da ação.
export async function leadsAdiadosAtivos(client: SupabaseClient<any, any, any>): Promise<Set<string>> {
  const { data } = await client
    .from('crm_focus_session_leads')
    .select('lead_id')
    .eq('status', 'adiado')
    .gt('snoozed_until', new Date().toISOString())
  return new Set((data ?? []).map((r: { lead_id: string }) => r.lead_id))
}

// Ordem da fila decidida no SERVIDOR, com a mesma regra pura e testada
// (buildFocusQueue) usada em todo lugar. Devolve só os ids, na ordem — é
// esse array que vira o snapshot da sessão.
export async function montarFilaServidor(
  client: SupabaseClient<any, any, any>,
  filtros: FocusQueueFilters,
): Promise<string[]> {
  const [{ data: leads }, { data: agenda }, adiados] = await Promise.all([
    client.from('leads').select(LEAD_COLUNAS_FILA).order('created_at', { ascending: false }),
    client.from('crm_agenda').select('id, lead_id, titulo, inicio, tipo, status').eq('status', 'agendado').not('lead_id', 'is', null),
    leadsAdiadosAtivos(client),
  ])

  const now = new Date()
  const { agendaPorLead } = cruzarAgenda((agenda ?? []) as AgendaRow[], now)
  return buildFocusQueue((leads ?? []) as never[], { now, filters: filtros, agendaPorLead })
    .filter((e) => !adiados.has(e.lead.id))
    .map((e) => e.lead.id)
}
