import { describe, expect, it } from 'vitest'
import { leadCorrespondeSegmento, filtrarLeadsPorSegmento, parseSegmento, type LeadParaSegmento } from './segmento'

function lead(overrides: Partial<LeadParaSegmento> = {}): LeadParaSegmento {
  return {
    id: 'lead-1',
    email: 'a@example.com',
    estagio_funil: 'primeiro_contato',
    temperatura: 2,
    origem: 'Site',
    cidade_interesse: 'Criciuma',
    unsubscribed_at: null,
    ...overrides,
  }
}

describe('leadCorrespondeSegmento', () => {
  it('segmento vazio corresponde a qualquer lead com email e sem descadastro', () => {
    expect(leadCorrespondeSegmento(lead(), {})).toBe(true)
  })

  it('exclui lead descadastrado mesmo com segmento vazio', () => {
    expect(leadCorrespondeSegmento(lead({ unsubscribed_at: '2026-01-01T00:00:00Z' }), {})).toBe(false)
  })

  it('exclui lead sem e-mail', () => {
    expect(leadCorrespondeSegmento(lead({ email: null }), {})).toBe(false)
  })

  it('filtra por estagio_funil', () => {
    const segmento = { estagio_funil: ['qualificado'] }
    expect(leadCorrespondeSegmento(lead({ estagio_funil: 'qualificado' }), segmento)).toBe(true)
    expect(leadCorrespondeSegmento(lead({ estagio_funil: 'primeiro_contato' }), segmento)).toBe(false)
  })

  it('filtra por temperatura', () => {
    const segmento = { temperatura: [3] }
    expect(leadCorrespondeSegmento(lead({ temperatura: 3 }), segmento)).toBe(true)
    expect(leadCorrespondeSegmento(lead({ temperatura: 1 }), segmento)).toBe(false)
  })

  it('filtra por origem', () => {
    const segmento = { origem: ['Instagram'] }
    expect(leadCorrespondeSegmento(lead({ origem: 'Instagram' }), segmento)).toBe(true)
    expect(leadCorrespondeSegmento(lead({ origem: 'Site' }), segmento)).toBe(false)
  })

  it('filtra por cidade_interesse', () => {
    const segmento = { cidade_interesse: ['Icara'] }
    expect(leadCorrespondeSegmento(lead({ cidade_interesse: 'Icara' }), segmento)).toBe(true)
    expect(leadCorrespondeSegmento(lead({ cidade_interesse: 'Criciuma' }), segmento)).toBe(false)
  })

  it('combina múltiplos filtros como E, não OU', () => {
    const segmento = { estagio_funil: ['qualificado'], origem: ['Instagram'] }
    expect(leadCorrespondeSegmento(lead({ estagio_funil: 'qualificado', origem: 'Instagram' }), segmento)).toBe(true)
    expect(leadCorrespondeSegmento(lead({ estagio_funil: 'qualificado', origem: 'Site' }), segmento)).toBe(false)
  })
})

describe('filtrarLeadsPorSegmento', () => {
  it('retorna só os leads correspondentes, preservando ordem', () => {
    const leads = [lead({ id: '1', temperatura: 3 }), lead({ id: '2', temperatura: 1 }), lead({ id: '3', temperatura: 3 })]
    const resultado = filtrarLeadsPorSegmento(leads, { temperatura: [3] })
    expect(resultado.map((l) => l.id)).toEqual(['1', '3'])
  })

  it('lista vazia retorna vazio', () => {
    expect(filtrarLeadsPorSegmento([], { temperatura: [3] })).toEqual([])
  })
})

describe('parseSegmento', () => {
  it('retorna objeto vazio para input inválido', () => {
    expect(parseSegmento(null)).toEqual({})
    expect(parseSegmento(undefined)).toEqual({})
    expect(parseSegmento('string')).toEqual({})
    expect(parseSegmento(42)).toEqual({})
  })

  it('filtra tipos errados dentro dos arrays', () => {
    const resultado = parseSegmento({ estagio_funil: ['a', 1, 'b'], temperatura: [1, 'x', 2] })
    expect(resultado.estagio_funil).toEqual(['a', 'b'])
    expect(resultado.temperatura).toEqual([1, 2])
  })

  it('campos ausentes viram undefined, não quebram', () => {
    expect(parseSegmento({})).toEqual({ estagio_funil: undefined, temperatura: undefined, origem: undefined, cidade_interesse: undefined })
  })
})
