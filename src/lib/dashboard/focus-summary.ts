// Resumo da sessão derivado do log de eventos (fonte auditável), não de
// contadores paralelos que poderiam divergir.

export type FocusSessionResumo = {
  visitasAgendadas: number
  visitasRealizadas: number
  visitasNaoOcorreram: number
  followupsAgendados: number
  contatosConfirmados: number
  mudancasDeEtapa: number
  propostas: number
  perdidos: number
  pulados: number
  adiados: number
  anotacoes: number
  pontos: number
  duracaoMinutos: number | null
  leadsProcessadosUnicos: number
  percentualDaFila: number | null
  itensPorMinuto: number | null
}

type EventoResumo = { action_type: string; next_stage?: string | null; lead_id?: string }
type SessaoResumo = {
  total_leads: number
  earned_points: number
  started_at: string
  finished_at?: string | null
}

export function montarResumoSessao(
  sessao: SessaoResumo,
  eventos: EventoResumo[],
  leadsProcessadosUnicos: number,
): FocusSessionResumo {
  const porTipo: Record<string, number> = {}
  for (const ev of eventos) porTipo[ev.action_type] = (porTipo[ev.action_type] ?? 0) + 1

  const fim = sessao.finished_at ? new Date(sessao.finished_at) : new Date()
  const duracaoMs = fim.getTime() - new Date(sessao.started_at).getTime()
  const duracaoMinutos = duracaoMs > 0 ? duracaoMs / 60_000 : null

  const concluidos = leadsProcessadosUnicos

  return {
    // Agendada, realizada e não-ocorrida são coisas DIFERENTES e ficam
    // separadas. O resumo antigo somava agendadas + realizadas num único
    // número "visitas" — então agendar uma visita e depois marcá-la como
    // realizada aparecia como se fossem duas visitas distintas.
    visitasAgendadas: porTipo['visita_agendada'] ?? 0,
    visitasRealizadas: porTipo['visita_concluida'] ?? 0,
    visitasNaoOcorreram: porTipo['visita_nao_ocorreu'] ?? 0,
    followupsAgendados: porTipo['followup_agendado'] ?? 0,
    contatosConfirmados: porTipo['contato_confirmado'] ?? 0,
    mudancasDeEtapa: porTipo['etapa_alterada'] ?? 0,
    propostas: porTipo['proposta_enviada'] ?? 0,
    perdidos: porTipo['perdido'] ?? 0,
    pulados: porTipo['pular'] ?? 0,
    adiados: porTipo['adiado'] ?? 0,
    anotacoes: porTipo['anotacao'] ?? 0,
    pontos: sessao.earned_points,
    duracaoMinutos: duracaoMinutos ? Math.round(duracaoMinutos * 10) / 10 : null,
    leadsProcessadosUnicos: concluidos,
    percentualDaFila: sessao.total_leads > 0 ? Math.round((concluidos / sessao.total_leads) * 100) : null,
    // Ritmo real de trabalho. Não inventamos taxa de conversão — nada aqui
    // afirma resultado comercial que os dados não comprovam.
    itensPorMinuto: duracaoMinutos && duracaoMinutos > 0 ? Math.round((concluidos / duracaoMinutos) * 100) / 100 : null,
  }
}
