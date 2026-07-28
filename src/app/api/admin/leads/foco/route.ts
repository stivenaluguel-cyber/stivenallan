import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/dashboard/admin-auth'
import { buildFocusQueue } from '@/lib/dashboard/focus-queue'
import { explainFocusPriority, recommendFocusAction } from '@/lib/dashboard/focus-guidance'
import { filtrosDaQueryString } from '@/lib/dashboard/focus-filters'
import { cruzarAgenda, LEAD_COLUNAS_FILA, leadsAdiadosAtivos, type AgendaRow } from '@/lib/dashboard/focus-queue-server'

export const dynamic = 'force-dynamic'
const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Tamanho de lote da fila. A posição autoritativa continua no servidor
// (crm_focus_session_leads.position) — isto é só quanto vem por vez.
const TAMANHO_LOTE = 20

// Dois modos:
//
// 1. ?sessionId=... — fila REAL de uma sessão: lê o snapshot persistido
//    (só itens pendentes/adiados já disponíveis), na ordem gravada no
//    início. É isso que garante que um lead já tratado não volta depois de
//    um reload e que mudar filtro não troca a fila por baixo da sessão.
//
// 2. sem sessionId — prévia da tela de preparação: calcula ao vivo pra
//    mostrar "quantos leads entrariam com estes filtros", sem criar nada.
export async function GET(req: NextRequest) {
  const adminId = await requireAdmin()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const client = sb()
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')

  if (sessionId) return filaDaSessao(client, adminId, sessionId, Number(searchParams.get('offset') ?? 0))
  return previaDaFila(client, searchParams)
}

async function filaDaSessao(client: ReturnType<typeof sb>, adminId: string, sessionId: string, offset: number) {
  const { data: sessao } = await client
    .from('crm_focus_sessions')
    .select('id, admin_id, status, filtros, total_leads, processed_leads, skipped_leads, earned_points')
    .eq('id', sessionId)
    .maybeSingle()
  if (!sessao || sessao.admin_id !== adminId) return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })

  const agora = new Date().toISOString()
  const { data: itens, error: itensError } = await client
    .from('crm_focus_session_leads')
    .select('lead_id, position, status, snoozed_until')
    .eq('session_id', sessionId)
    .in('status', ['pendente', 'adiado'])
    .or('snoozed_until.is.null,snoozed_until.lte.' + agora)
    .order('position', { ascending: true })
    .range(offset, offset + TAMANHO_LOTE - 1)
  if (itensError) return NextResponse.json({ error: itensError.message }, { status: 500 })

  // Quantos ainda faltam no total (não só neste lote) — o front usa isso
  // pra saber se a sessão realmente acabou, sem inferir de uma página vazia.
  const { count: pendentesTotal } = await client
    .from('crm_focus_session_leads')
    .select('lead_id', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .in('status', ['pendente', 'adiado'])
    .or('snoozed_until.is.null,snoozed_until.lte.' + agora)

  const leadIds = (itens ?? []).map((i) => i.lead_id)
  if (leadIds.length === 0) {
    return NextResponse.json({ data: [], total: 0, pendentesTotal: pendentesTotal ?? 0, sessao })
  }

  const [{ data: leads }, { data: agenda }] = await Promise.all([
    client.from('leads').select(LEAD_COLUNAS_FILA).in('id', leadIds),
    client.from('crm_agenda').select('id, lead_id, titulo, inicio, tipo, status').eq('status', 'agendado').in('lead_id', leadIds),
  ])

  const { agendaPorLead, visitaVencidaPorLead, visitaFuturaPorLead } = cruzarAgenda((agenda ?? []) as AgendaRow[])
  const entriesPorId = new Map(
    buildFocusQueue(leads ?? [], { now: new Date(), agendaPorLead }).map((e) => [e.lead.id, e]),
  )

  // Ordem = a posição gravada no snapshot, NÃO a reordenação ao vivo. Um
  // lead que ficou mais/menos urgente durante a sessão não pula de lugar.
  const data = (itens ?? [])
    .map((item) => {
      const e = entriesPorId.get(item.lead_id)
      if (!e) return null // lead excluído no meio da sessão — some da fila sem travar
      return {
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
        compromissoVencido: agendaPorLead[e.lead.id]?.compromissoVencido ?? null,
        visitaVencida: visitaVencidaPorLead[e.lead.id] ?? null,
        visitaFutura: visitaFuturaPorLead[e.lead.id] ?? null,
        posicao: item.position,
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  return NextResponse.json({ data, total: data.length, pendentesTotal: pendentesTotal ?? 0, sessao })
}

// Só conta quantos leads entrariam — nada é persistido aqui.
async function previaDaFila(client: ReturnType<typeof sb>, searchParams: URLSearchParams) {
  const filtros = filtrosDaQueryString(searchParams)
  const [{ data: leads }, { data: agenda }, adiados] = await Promise.all([
    client.from('leads').select(LEAD_COLUNAS_FILA).order('created_at', { ascending: false }),
    client.from('crm_agenda').select('id, lead_id, titulo, inicio, tipo, status').eq('status', 'agendado').not('lead_id', 'is', null),
    leadsAdiadosAtivos(client),
  ])
  const { agendaPorLead } = cruzarAgenda((agenda ?? []) as AgendaRow[])
  // Mesma exclusão de adiados que montarFilaServidor aplica — a prévia tem
  // que prometer exatamente a fila que a sessão vai receber.
  const entries = buildFocusQueue((leads ?? []) as never[], { now: new Date(), filters: filtros, agendaPorLead })
    .filter((e) => !adiados.has(e.lead.id))
  return NextResponse.json({ preview: true, total: entries.length, filtros })
}
