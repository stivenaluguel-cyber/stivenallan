import { describe, expect, it } from 'vitest'
import { specsDeTipologias, getEraldoCardSpecs } from './eraldo-specs'
import type { Tipologia } from '@/data/eraldo/types'

describe('specsDeTipologias', () => {
  it('calcula min/max de área, dormitórios, suítes e vagas', () => {
    const tipologias: Tipologia[] = [
      { nome: 'A', areaPrivativa: 100, dormitorios: 2, suites: 1, vagas: 1 },
      { nome: 'B', areaPrivativa: 150, dormitorios: 3, suites: 3, vagas: 2 },
    ]
    expect(specsDeTipologias(tipologias)).toEqual({
      dormitoriosMin: 2, dormitoriosMax: 3,
      suitesMin: 1, suitesMax: 3,
      areaMin: 100, areaMax: 150,
      vagasMin: 1, vagasMax: 2,
    })
  })

  it('tipologia sem os campos (só observação) não derruba o cálculo nem inventa número', () => {
    const tipologias: Tipologia[] = [
      { nome: 'A', areaPrivativa: 100, dormitorios: 3 },
      { nome: 'Garden', observacao: 'Área não confirmada' },
    ]
    const s = specsDeTipologias(tipologias)
    expect(s.areaMin).toBe(100)
    expect(s.areaMax).toBe(100)
    expect(s.vagasMin).toBeUndefined()
  })

  it('lista vazia não inventa nenhum número', () => {
    expect(specsDeTipologias([])).toEqual({})
  })
})

describe('getEraldoCardSpecs', () => {
  it('acha specs reais de um empreendimento Eraldo conhecido (arbor)', () => {
    const specs = getEraldoCardSpecs('arbor-centro-criciuma-sc')
    expect(specs).toBeDefined()
    expect(specs?.suitesMin).toBe(3)
    expect(specs?.previsaoEntrega).toBe('Outubro de 2028')
  })

  it('slug desconhecido (ex.: Aura, que não tem arquivo de dados) retorna undefined — não inventa', () => {
    expect(getEraldoCardSpecs('aura-residence-centro-criciuma-sc')).toBeUndefined()
    expect(getEraldoCardSpecs('slug-que-nao-existe')).toBeUndefined()
  })
})
