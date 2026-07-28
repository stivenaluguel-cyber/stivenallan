// Normalização da linha do tempo de um lead. Puro (sem SupabaseClient) para
// ser testável sem banco — a rota busca as fontes e chama daqui.
//
// Fontes hoje existentes e até agora NUNCA exibidas juntas: anotações
// legadas (JSON em leads.anotacoes), anotações novas + mudanças de etapa +
// propostas (leads_interacoes), mensagens (interacoes), compromissos
// (crm_agenda) e as ações do Modo Foco (crm_focus_events).

export type TimelineKind =
  | 'anotacao' | 'mudanca_etapa' | 'proposta' | 'mensagem'
  | 'compromisso' | 'acao_foco' | 'contato' | 'perdido' | 'simulacao'

export type TimelineItem = {
  id: string
  kind: TimelineKind
  data: string
  titulo: string
  descricao?: string | null
  origem: string
}

type NotaLegada = { data?: string; texto?: string; clientEventId?: string }

export function parseAnotacoesLegadas(raw: string | null | undefined): NotaLegada[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch {
    if (raw.trim()) return [{ data: '', texto: raw }]
  }
  return []
}

const LABEL_ACAO_FOCO: Record<string, string> = {
  pular: 'Lead pulado no Modo Foco',
  perdido: 'Marcado como perdido',
  followup_agendado: 'Follow-up agendado',
  visita_agendada: 'Visita agendada',
  visita_concluida: 'Visita realizada',
  visita_nao_ocorreu: 'Visita não ocorreu',
  contato_confirmado: 'Contato confirmado',
  anotacao: 'Anotação registrada',
  etapa_alterada: 'Etapa alterada',
  proposta_enviada: 'Proposta enviada',
  adiado: 'Lead adiado',
}

// Eventos do Modo Foco que JÁ aparecem na timeline por outra fonte, com mais
// detalhe: a anotação vira uma linha de leads_interacoes, a mudança de etapa
// também, a proposta idem, o compromisso vira uma linha de crm_agenda. Sem
// esta exclusão, cada uma dessas ações apareceria duas vezes na tela — o
// requisito explícito de "não duplicar visualmente o mesmo evento
// registrado em duas fontes". As ações que sobram (pular/adiado/contato
// confirmado/visita não ocorrida) só existem no log do Modo Foco.
const ACOES_FOCO_JA_COBERTAS = new Set([
  'anotacao', 'etapa_alterada', 'proposta_enviada', 'followup_agendado', 'visita_agendada', 'visita_concluida',
])

export type TimelineSources = {
  anotacoesLegadas?: string | null
  interacoesLead?: { id: string; tipo: string; descricao: string; estagio_de?: string | null; estagio_para?: string | null; created_at: string }[]
  mensagens?: { id: string; canal: string | null; direcao: string; mensagem: string; created_at: string }[]
  agenda?: { id: string; titulo: string; tipo: string | null; inicio: string; status: string | null }[]
  eventosFoco?: { id: string; action_type: string; created_at: string; metadata?: Record<string, unknown> | null }[]
}

export function buildLeadTimeline(sources: TimelineSources): TimelineItem[] {
  const itens: TimelineItem[] = []

  parseAnotacoesLegadas(sources.anotacoesLegadas).forEach((n, i) => {
    if (!n.texto) return
    itens.push({
      id: 'legado:' + i,
      kind: 'anotacao',
      data: n.data || '',
      titulo: 'Anotação',
      descricao: n.texto,
      origem: 'Anotação (histórico antigo)',
    })
  })

  for (const it of sources.interacoesLead ?? []) {
    const ehEtapa = it.tipo === 'status_change'
    const ehProposta = it.tipo === 'proposta' || it.tipo === 'proposta_aceita'
    const ehSimulacao = it.tipo === 'simulacao'
    itens.push({
      id: 'interacao:' + it.id,
      kind: ehEtapa ? 'mudanca_etapa' : ehProposta ? 'proposta' : ehSimulacao ? 'simulacao' : 'anotacao',
      data: it.created_at,
      titulo: ehEtapa ? 'Mudança de etapa' : ehProposta ? 'Proposta' : ehSimulacao ? 'Simulação' : 'Anotação',
      descricao: it.descricao,
      origem: ehEtapa ? 'CRM' : ehProposta ? 'Propostas' : ehSimulacao ? 'Simulador' : 'Anotação',
    })
  }

  for (const m of sources.mensagens ?? []) {
    const canal = m.canal === 'instagram' ? 'Instagram' : m.canal === 'email' ? 'E-mail' : 'WhatsApp'
    itens.push({
      id: 'mensagem:' + m.id,
      kind: 'mensagem',
      data: m.created_at,
      titulo: (m.direcao === 'entrada' ? 'Recebida' : 'Enviada') + ' · ' + canal,
      descricao: m.mensagem,
      origem: canal,
    })
  }

  for (const ev of sources.agenda ?? []) {
    itens.push({
      id: 'agenda:' + ev.id,
      kind: 'compromisso',
      data: ev.inicio,
      titulo: ev.titulo,
      descricao: 'Situação: ' + (ev.status ?? 'agendado'),
      origem: 'Agenda',
    })
  }

  for (const ev of sources.eventosFoco ?? []) {
    if (ACOES_FOCO_JA_COBERTAS.has(ev.action_type)) continue
    itens.push({
      id: 'foco:' + ev.id,
      kind: ev.action_type === 'perdido' ? 'perdido' : ev.action_type === 'contato_confirmado' ? 'contato' : 'acao_foco',
      data: ev.created_at,
      titulo: LABEL_ACAO_FOCO[ev.action_type] ?? ev.action_type,
      descricao: typeof ev.metadata?.motivo === 'string' ? String(ev.metadata.motivo).replace(/_/g, ' ') : null,
      origem: 'Modo Foco',
    })
  }

  // Mais recente primeiro; itens sem data (anotações legadas antigas, que
  // nunca tiveram timestamp) vão para o fim em vez de bagunçar a ordem.
  return itens.sort((a, b) => {
    if (!a.data && !b.data) return 0
    if (!a.data) return 1
    if (!b.data) return -1
    return b.data.localeCompare(a.data)
  })
}
