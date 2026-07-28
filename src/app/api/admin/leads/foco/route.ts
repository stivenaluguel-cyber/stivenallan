import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import { buildFocusQueue, type AgendaOverdueInfo, type FocusQueueFilters } from '@/lib/dashboard/focus-queue'
import { explainFocusPriority, recommendFocusAction } from '@/lib/dashboard/focus-guidance'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function auth() {
  const s = await cookies(); const t = s.get('dashboard_token')?.value; if (!t) return false
  try { await jwtVerify(t, new TextEncoder().encode(process.env.JWT_SECRET!)); return true } catch { return false }
}

// Monta a fila priorizada do Modo Foco a partir dos MESMOS dados que o CRM
// e o dashboard já usam (leads + empreendimentos), sem endpoint de
// agregação novo — só acrescenta o cruzamento com crm_agenda (pra saber
// quem tem compromisso atrasado) e delega toda a regra de prioridade/
// exclusão pro serviço puro e testado em src/lib/dashboard/focus-queue.ts.
export async function GET(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const client = sb()
  const { searchParams } = new URL(req.url)

  const filters: FocusQueueFilters = {}
  const temperatura = searchParams.get('temperatura')
  if (temperatura === 'quente' || temperatura === 'morno' || temperatura === 'frio') filters.temperatura = temperatura
  const estagioFunil = searchParams.get('estagioFunil')
  if (estagioFunil) filters.estagioFunil = estagioFunil
  const origem = searchParams.get('origem')
  if (origem) filters.origem = origem
  if (searchParams.get('apenasFollowupVencido') === 'true') filters.apenasFollowupVencido = true
  const semAcaoDias = searchParams.get('semAcaoDias')
  if (semAcaoDias) filters.semAcaoDias = Number(semAcaoDias)

  const [{ data: leads, error: leadsError }, { data: agenda, error: agendaError }] = await Promise.all([
    client.from('leads').select('*, empreendimentos(nome, slug, cidade)').order('created_at', { ascending: false }),
    client.from('crm_agenda').select('id, lead_id, titulo, inicio, tipo, status').eq('status', 'agendado').not('lead_id', 'is', null),
  ])

  if (leadsError) return NextResponse.json({ error: leadsError.message }, { status: 500 })
  if (agendaError) return NextResponse.json({ error: agendaError.message }, { status: 500 })

  const now = new Date()
  const agendaPorLead: Record<string, AgendaOverdueInfo> = {}
  // Próxima visita pendente por lead (a mais próxima no tempo, atrasada ou
  // não) — é sobre ela que o VisitModal age ao "marcar como realizada" ou
  // "registrar que não ocorreu", sem precisar de uma segunda consulta.
  const proximaVisitaPorLead: Record<string, { id: string; titulo: string; inicio: string } | undefined> = {}
  for (const ev of agenda ?? []) {
    if (!ev.lead_id) continue
    const info = agendaPorLead[ev.lead_id] ?? { vencidoCount: 0, proximoEvento: null }
    const vencido = new Date(ev.inicio).getTime() < now.getTime()
    if (vencido) {
      info.vencidoCount += 1
    } else if (!info.proximoEvento || new Date(ev.inicio) < new Date(info.proximoEvento.inicio)) {
      info.proximoEvento = { titulo: ev.titulo, inicio: ev.inicio, tipo: ev.tipo }
    }
    agendaPorLead[ev.lead_id] = info

    if (ev.tipo === 'visita') {
      const atual = proximaVisitaPorLead[ev.lead_id]
      if (!atual || new Date(ev.inicio) < new Date(atual.inicio)) {
        proximaVisitaPorLead[ev.lead_id] = { id: ev.id, titulo: ev.titulo, inicio: ev.inicio }
      }
    }
  }

  const entries = buildFocusQueue(leads ?? [], { now, filters, agendaPorLead })

  const data = entries.map((e) => ({
    lead: e.lead,
    followupVencido: e.followupVencido,
    requerAtencao: e.requerAtencao,
    agendaVencida: e.agendaVencida,
    nuncaContatado: e.nuncaContatado,
    quente: e.quente,
    diasSemContato: Number.isFinite(e.diasSemContato) ? Math.round(e.diasSemContato) : null,
    prioridade: explainFocusPriority(e),
    recomendacao: recommendFocusAction(e),
    proximoEvento: agendaPorLead[e.lead.id]?.proximoEvento ?? null,
    proximaVisita: proximaVisitaPorLead[e.lead.id] ?? null,
  }))

  return NextResponse.json({ data, total: data.length })
}
