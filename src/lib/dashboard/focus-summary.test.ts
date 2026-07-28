import { describe, expect, it } from 'vitest'
import { montarResumoSessao } from './focus-summary'

const sessao = {
  total_leads: 10,
  earned_points: 43,
  started_at: '2026-07-28T12:00:00Z',
  finished_at: '2026-07-28T12:30:00Z',
}

describe('montarResumoSessao', () => {
  it('NÃO soma visita agendada + realizada como se fossem duas visitas', () => {
    // Mesma visita: agendada e depois marcada como realizada. O resumo
    // antigo mostrava "visitas: 2".
    const r = montarResumoSessao(sessao, [
      { action_type: 'visita_agendada' },
      { action_type: 'visita_concluida' },
    ], 2)

    expect(r.visitasAgendadas).toBe(1)
    expect(r.visitasRealizadas).toBe(1)
    expect(r.visitasNaoOcorreram).toBe(0)
    expect(r).not.toHaveProperty('visitas')
  })

  it('separa cada tipo de ação no resumo', () => {
    const r = montarResumoSessao(sessao, [
      { action_type: 'followup_agendado' },
      { action_type: 'followup_agendado' },
      { action_type: 'contato_confirmado' },
      { action_type: 'etapa_alterada' },
      { action_type: 'perdido' },
      { action_type: 'pular' },
      { action_type: 'adiado' },
      { action_type: 'anotacao' },
      { action_type: 'visita_nao_ocorreu' },
    ], 6)

    expect(r.followupsAgendados).toBe(2)
    expect(r.contatosConfirmados).toBe(1)
    expect(r.mudancasDeEtapa).toBe(1)
    expect(r.perdidos).toBe(1)
    expect(r.pulados).toBe(1)
    expect(r.adiados).toBe(1)
    expect(r.anotacoes).toBe(1)
    expect(r.visitasNaoOcorreram).toBe(1)
  })

  it('leads processados vem da contagem de itens únicos, não do número de eventos', () => {
    // 4 eventos no mesmo lead (uma ação primária + 3 secundárias) = 1 lead.
    const r = montarResumoSessao(sessao, [
      { action_type: 'followup_agendado', lead_id: 'l1' },
      { action_type: 'anotacao', lead_id: 'l1' },
      { action_type: 'anotacao', lead_id: 'l1' },
      { action_type: 'contato_confirmado', lead_id: 'l1' },
    ], 1)
    expect(r.leadsProcessadosUnicos).toBe(1)
  })

  it('calcula duração, percentual da fila e ritmo', () => {
    const r = montarResumoSessao(sessao, [{ action_type: 'pular' }], 5)
    expect(r.duracaoMinutos).toBe(30)
    expect(r.percentualDaFila).toBe(50) // 5 de 10
    expect(r.itensPorMinuto).toBeCloseTo(0.17, 2)
  })

  it('sessão ainda em andamento (sem finished_at) usa "agora" sem quebrar', () => {
    const iniciadaHaDezMinutos = new Date(Date.now() - 10 * 60_000).toISOString()
    const r = montarResumoSessao({ ...sessao, started_at: iniciadaHaDezMinutos, finished_at: null }, [], 0)
    expect(r.duracaoMinutos).toBeGreaterThan(9)
  })

  it('fila vazia não gera divisão por zero', () => {
    const r = montarResumoSessao({ ...sessao, total_leads: 0 }, [], 0)
    expect(r.percentualDaFila).toBeNull()
  })

  it('pontos vêm do contador da sessão (servidor), não de recontagem local', () => {
    const r = montarResumoSessao(sessao, [{ action_type: 'pular' }], 1)
    expect(r.pontos).toBe(43)
  })
})
