import { describe, expect, it } from 'vitest'
import { buildFocusQueue, isEligibleForFocusQueue, type FocusQueueLead } from './focus-queue'

const NOW = new Date('2026-07-26T12:00:00Z')

function lead(overrides: Partial<FocusQueueLead> & { id: string }): FocusQueueLead {
  return {
    nome: 'Lead ' + overrides.id,
    whatsapp: '5548999990000',
    estagio_funil: 'primeiro_contato',
    status: 'novo',
    temperatura: 1,
    lead_score: 0,
    requer_atencao: false,
    proximo_followup: null,
    ultimo_contato: null,
    created_at: '2026-07-01T12:00:00Z',
    ...overrides,
  }
}

describe('isEligibleForFocusQueue', () => {
  it('exclui leads fechados', () => {
    expect(isEligibleForFocusQueue(lead({ id: '1', estagio_funil: 'fechado' }))).toBe(false)
  })

  it('exclui leads perdidos', () => {
    expect(isEligibleForFocusQueue(lead({ id: '1', estagio_funil: 'perdido' }))).toBe(false)
  })

  it('inclui leads em qualquer outro estágio do funil', () => {
    expect(isEligibleForFocusQueue(lead({ id: '1', estagio_funil: 'negociacao' }))).toBe(true)
  })
})

describe('buildFocusQueue — exclusão', () => {
  it('nunca inclui fechados/perdidos na fila resultante, mesmo que passem os filtros', () => {
    const leads = [
      lead({ id: 'fechado', estagio_funil: 'fechado' }),
      lead({ id: 'perdido', estagio_funil: 'perdido' }),
      lead({ id: 'ativo', estagio_funil: 'qualificado' }),
    ]
    const fila = buildFocusQueue(leads, { now: NOW })
    expect(fila.map((e) => e.lead.id)).toEqual(['ativo'])
  })
})

describe('buildFocusQueue — priorização em camadas', () => {
  it('follow-up vencido vem antes de tudo, mesmo perdendo em score/temperatura', () => {
    const leads = [
      lead({ id: 'quente-sem-followup', temperatura: 3, lead_score: 90 }),
      lead({ id: 'frio-followup-vencido', temperatura: 1, lead_score: 0, proximo_followup: '2026-07-20T00:00:00Z' }),
    ]
    const fila = buildFocusQueue(leads, { now: NOW })
    expect(fila[0].lead.id).toBe('frio-followup-vencido')
  })

  it('requer_atencao supera agenda vencida e leads quentes', () => {
    const leads = [
      lead({ id: 'quente', temperatura: 3 }),
      lead({ id: 'atencao', requer_atencao: true }),
    ]
    const fila = buildFocusQueue(leads, { now: NOW })
    expect(fila[0].lead.id).toBe('atencao')
  })

  it('agenda vencida (via agendaPorLead) supera nunca-contatado', () => {
    const leads = [
      lead({ id: 'nunca-contatado', ultimo_contato: null }),
      lead({ id: 'agenda-atrasada', ultimo_contato: '2026-07-25T00:00:00Z' }),
    ]
    const fila = buildFocusQueue(leads, {
      now: NOW,
      agendaPorLead: { 'agenda-atrasada': { vencidoCount: 1 } },
    })
    expect(fila[0].lead.id).toBe('agenda-atrasada')
  })

  it('quente supera dias-sem-contato quando os tiers anteriores empatam', () => {
    const leads = [
      lead({ id: 'frio-muito-tempo', temperatura: 1, ultimo_contato: '2026-01-01T00:00:00Z' }),
      lead({ id: 'quente-recente', temperatura: 3, ultimo_contato: '2026-07-25T00:00:00Z' }),
    ]
    const fila = buildFocusQueue(leads, { now: NOW })
    expect(fila[0].lead.id).toBe('quente-recente')
  })

  it('entre dois leads iguais nos tiers principais, o que está há mais dias sem contato vem primeiro', () => {
    const leads = [
      lead({ id: 'recente', ultimo_contato: '2026-07-24T00:00:00Z' }),
      lead({ id: 'antigo', ultimo_contato: '2026-06-01T00:00:00Z' }),
    ]
    const fila = buildFocusQueue(leads, { now: NOW })
    expect(fila[0].lead.id).toBe('antigo')
  })

  it('estágio mais avançado do funil desempata antes do score', () => {
    const leads = [
      lead({ id: 'score-alto-inicio', estagio_funil: 'primeiro_contato', lead_score: 95, ultimo_contato: '2026-07-25T00:00:00Z' }),
      lead({ id: 'estagio-avancado', estagio_funil: 'negociacao', lead_score: 10, ultimo_contato: '2026-07-25T00:00:00Z' }),
    ]
    const fila = buildFocusQueue(leads, { now: NOW })
    expect(fila[0].lead.id).toBe('estagio-avancado')
  })

  it('created_at mais antigo é o desempate final', () => {
    const leads = [
      lead({ id: 'novo', created_at: '2026-07-20T00:00:00Z' }),
      lead({ id: 'antigo', created_at: '2026-01-01T00:00:00Z' }),
    ]
    const fila = buildFocusQueue(leads, { now: NOW })
    expect(fila[0].lead.id).toBe('antigo')
  })
})

describe('buildFocusQueue — filtros', () => {
  const leads = [
    lead({ id: 'quente-instagram', temperatura: 3, origem: 'Instagram' }),
    lead({ id: 'morno-site', temperatura: 2, origem: 'Site' }),
    lead({ id: 'frio-instagram', temperatura: 1, origem: 'Instagram' }),
  ]

  it('filtra por temperatura', () => {
    const fila = buildFocusQueue(leads, { now: NOW, filters: { temperatura: 'quente' } })
    expect(fila.map((e) => e.lead.id)).toEqual(['quente-instagram'])
  })

  it('filtra por origem', () => {
    const fila = buildFocusQueue(leads, { now: NOW, filters: { origem: 'Instagram' } })
    expect(fila.map((e) => e.lead.id).sort()).toEqual(['frio-instagram', 'quente-instagram'])
  })

  it('filtra por follow-up vencido', () => {
    const comFollowup = [
      lead({ id: 'vencido', proximo_followup: '2026-07-01T00:00:00Z' }),
      lead({ id: 'em-dia', proximo_followup: '2026-08-01T00:00:00Z' }),
      lead({ id: 'sem-followup' }),
    ]
    const fila = buildFocusQueue(comFollowup, { now: NOW, filters: { apenasFollowupVencido: true } })
    expect(fila.map((e) => e.lead.id)).toEqual(['vencido'])
  })

  it('filtra por dias sem ação', () => {
    const comContato = [
      lead({ id: 'recente', ultimo_contato: '2026-07-25T00:00:00Z' }),
      lead({ id: 'antigo', ultimo_contato: '2026-06-01T00:00:00Z' }),
    ]
    const fila = buildFocusQueue(comContato, { now: NOW, filters: { semAcaoDias: 10 } })
    expect(fila.map((e) => e.lead.id)).toEqual(['antigo'])
  })
})
