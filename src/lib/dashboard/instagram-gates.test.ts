import { describe, expect, it } from 'vitest'
import { computeCalendarGates, computeWeeklyGates, type CalendarEntryForGates, type WeeklyMetric } from './instagram-gates'

function week(overrides: Partial<WeeklyMetric> = {}): WeeklyMetric {
  return {
    semana_inicio: '2026-07-13',
    seguidores: 6000,
    novos_seguidores: 100,
    novos_seguidores_locais: 70,
    alcance: 25000,
    alcance_educativo: 15000,
    alcance_imovel: 7000,
    taxa_engajamento: 1.8,
    visitas_perfil: 300,
    cliques_bio: 10,
    leads_qualificados: 4,
    custo_por_visita: null,
    tempo_resposta_medio_min: null,
    ...overrides,
  }
}

describe('computeWeeklyGates — G1 criativo', () => {
  it('alerta quando custo por visita acima de R$0,30', () => {
    const gates = computeWeeklyGates(week({ custo_por_visita: 0.45 }), [])
    const g1 = gates.find((g) => g.codigo === 'G1')
    expect(g1?.severidade).toBe('alerta')
  })

  it('info (campeão) quando custo por visita <= R$0,20', () => {
    const gates = computeWeeklyGates(week({ custo_por_visita: 0.15 }), [])
    const g1 = gates.find((g) => g.codigo === 'G1')
    expect(g1?.severidade).toBe('info')
  })

  it('não dispara na faixa intermediária (0,20 - 0,30)', () => {
    const gates = computeWeeklyGates(week({ custo_por_visita: 0.25 }), [])
    expect(gates.some((g) => g.codigo === 'G1')).toBe(false)
  })

  it('ignora quando não informado', () => {
    const gates = computeWeeklyGates(week({ custo_por_visita: null }), [])
    expect(gates.some((g) => g.codigo === 'G1')).toBe(false)
  })
})

describe('computeWeeklyGates — G8 velocidade de resposta', () => {
  it('dispara quando 2 semanas seguidas acima de 30min', () => {
    const gates = computeWeeklyGates(week({ tempo_resposta_medio_min: 45 }), [week({ tempo_resposta_medio_min: 40 })])
    expect(gates.some((g) => g.codigo === 'G8')).toBe(true)
  })

  it('não dispara numa semana isolada acima de 30min', () => {
    const gates = computeWeeklyGates(week({ tempo_resposta_medio_min: 45 }), [week({ tempo_resposta_medio_min: 10 })])
    expect(gates.some((g) => g.codigo === 'G8')).toBe(false)
  })

  it('não dispara quando dentro da meta', () => {
    const gates = computeWeeklyGates(week({ tempo_resposta_medio_min: 20 }), [week({ tempo_resposta_medio_min: 45 })])
    expect(gates.some((g) => g.codigo === 'G8')).toBe(false)
  })
})

describe('computeWeeklyGates — G2 geografia', () => {
  it('dispara quando % de novos seguidores locais < 50%', () => {
    const gates = computeWeeklyGates(week({ novos_seguidores: 100, novos_seguidores_locais: 30 }), [])
    expect(gates.some((g) => g.codigo === 'G2')).toBe(true)
  })

  it('não dispara quando % local >= 50%', () => {
    const gates = computeWeeklyGates(week({ novos_seguidores: 100, novos_seguidores_locais: 50 }), [])
    expect(gates.some((g) => g.codigo === 'G2')).toBe(false)
  })

  it('ignora quando não há novos seguidores no período', () => {
    const gates = computeWeeklyGates(week({ novos_seguidores: 0, novos_seguidores_locais: 0 }), [])
    expect(gates.some((g) => g.codigo === 'G2')).toBe(false)
  })
})

describe('computeWeeklyGates — G3 mix editorial', () => {
  it('alerta quando razão educativo/imóvel < 1.5', () => {
    const gates = computeWeeklyGates(week({ alcance_educativo: 5000, alcance_imovel: 5000 }), [])
    const g3 = gates.find((g) => g.codigo === 'G3')
    expect(g3?.severidade).toBe('alerta')
  })

  it('info quando razão entre 1.5 e 2', () => {
    const gates = computeWeeklyGates(week({ alcance_educativo: 8000, alcance_imovel: 5000 }), [])
    const g3 = gates.find((g) => g.codigo === 'G3')
    expect(g3?.severidade).toBe('info')
  })

  it('não dispara quando razão >= 2 (padrão-ouro mantido)', () => {
    const gates = computeWeeklyGates(week({ alcance_educativo: 10000, alcance_imovel: 5000 }), [])
    expect(gates.some((g) => g.codigo === 'G3')).toBe(false)
  })
})

describe('computeWeeklyGates — G6 quadrado da conversão', () => {
  it('dispara quando cliques/visitas < 2%', () => {
    const gates = computeWeeklyGates(week({ visitas_perfil: 500, cliques_bio: 5 }), [])
    expect(gates.some((g) => g.codigo === 'G6')).toBe(true)
  })

  it('não dispara quando cliques/visitas >= 2%', () => {
    const gates = computeWeeklyGates(week({ visitas_perfil: 500, cliques_bio: 10 }), [])
    expect(gates.some((g) => g.codigo === 'G6')).toBe(false)
  })
})

describe('computeWeeklyGates — G7 leads', () => {
  it('dispara quando soma das últimas 4 semanas < 10', () => {
    const history = [week({ leads_qualificados: 1 }), week({ leads_qualificados: 1 }), week({ leads_qualificados: 1 })]
    const gates = computeWeeklyGates(week({ leads_qualificados: 2 }), history)
    expect(gates.some((g) => g.codigo === 'G7')).toBe(true)
  })

  it('não dispara com menos de 4 semanas de histórico (amostra insuficiente)', () => {
    const gates = computeWeeklyGates(week({ leads_qualificados: 0 }), [week({ leads_qualificados: 0 })])
    expect(gates.some((g) => g.codigo === 'G7')).toBe(false)
  })

  it('não dispara quando soma >= 10', () => {
    const history = [week({ leads_qualificados: 3 }), week({ leads_qualificados: 3 }), week({ leads_qualificados: 3 })]
    const gates = computeWeeklyGates(week({ leads_qualificados: 3 }), history)
    expect(gates.some((g) => g.codigo === 'G7')).toBe(false)
  })
})

describe('computeWeeklyGates — G9 regressão de engajamento', () => {
  it('dispara quando 2 semanas seguidas abaixo do baseline 1.34%', () => {
    const gates = computeWeeklyGates(week({ taxa_engajamento: 1.1 }), [week({ taxa_engajamento: 1.2 })])
    expect(gates.some((g) => g.codigo === 'G9')).toBe(true)
  })

  it('não dispara numa semana isolada abaixo do baseline', () => {
    const gates = computeWeeklyGates(week({ taxa_engajamento: 1.1 }), [week({ taxa_engajamento: 1.5 })])
    expect(gates.some((g) => g.codigo === 'G9')).toBe(false)
  })

  it('não dispara quando acima do baseline', () => {
    const gates = computeWeeklyGates(week({ taxa_engajamento: 2.0 }), [week({ taxa_engajamento: 1.1 })])
    expect(gates.some((g) => g.codigo === 'G9')).toBe(false)
  })
})

function entry(overrides: Partial<CalendarEntryForGates> = {}): CalendarEntryForGates {
  return {
    id: 'x',
    data: '2026-07-13',
    tipo: 'reel_educativo',
    status: 'planejado',
    watch_time_seg: null,
    ...overrides,
  }
}

describe('computeCalendarGates — G4 anti-canibalização', () => {
  it('dispara quando 2 posts de feed caem no mesmo dia', () => {
    const gates = computeCalendarGates([
      entry({ id: '1', data: '2026-07-13', tipo: 'reel_educativo' }),
      entry({ id: '2', data: '2026-07-13', tipo: 'reel_imovel' }),
    ])
    expect(gates.some((g) => g.codigo === 'G4')).toBe(true)
  })

  it('não dispara quando os posts de feed estão em dias diferentes', () => {
    const gates = computeCalendarGates([
      entry({ id: '1', data: '2026-07-13', tipo: 'reel_educativo' }),
      entry({ id: '2', data: '2026-07-15', tipo: 'reel_educativo' }),
    ])
    expect(gates.some((g) => g.codigo === 'G4')).toBe(false)
  })

  it('ignora stories ao checar canibalização de feed', () => {
    const gates = computeCalendarGates([
      entry({ id: '1', data: '2026-07-13', tipo: 'reel_educativo' }),
      entry({ id: '2', data: '2026-07-13', tipo: 'story' }),
    ])
    expect(gates.some((g) => g.codigo === 'G4')).toBe(false)
  })

  it('ignora entradas de reserva sem data', () => {
    const gates = computeCalendarGates([
      entry({ id: '1', data: null, tipo: 'reel_educativo' }),
      entry({ id: '2', data: null, tipo: 'reel_imovel' }),
    ])
    expect(gates.some((g) => g.codigo === 'G4')).toBe(false)
  })
})

describe('computeCalendarGates — G5 gancho de reel', () => {
  it('dispara quando os 2 últimos reels publicados têm watch time < 5s', () => {
    const gates = computeCalendarGates([
      entry({ id: '1', data: '2026-07-13', status: 'publicado', watch_time_seg: 3 }),
      entry({ id: '2', data: '2026-07-15', status: 'publicado', watch_time_seg: 2.5 }),
    ])
    expect(gates.some((g) => g.codigo === 'G5')).toBe(true)
  })

  it('não dispara quando pelo menos um dos 2 últimos está acima de 5s', () => {
    const gates = computeCalendarGates([
      entry({ id: '1', data: '2026-07-13', status: 'publicado', watch_time_seg: 8.5 }),
      entry({ id: '2', data: '2026-07-15', status: 'publicado', watch_time_seg: 2.5 }),
    ])
    expect(gates.some((g) => g.codigo === 'G5')).toBe(false)
  })

  it('ignora reels não publicados ou sem watch time', () => {
    const gates = computeCalendarGates([
      entry({ id: '1', data: '2026-07-13', status: 'planejado', watch_time_seg: 2 }),
      entry({ id: '2', data: '2026-07-15', status: 'publicado', watch_time_seg: null }),
    ])
    expect(gates.some((g) => g.codigo === 'G5')).toBe(false)
  })
})
