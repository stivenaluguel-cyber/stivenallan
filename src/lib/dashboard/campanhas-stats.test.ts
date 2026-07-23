import { describe, expect, it } from 'vitest'
import { aggregateCampanhaEventos, statsParaGrafico } from './campanhas-stats'

describe('aggregateCampanhaEventos', () => {
  it('conta cada tipo conhecido', () => {
    const rows = [{ tipo: 'aberto' }, { tipo: 'aberto' }, { tipo: 'clicado' }, { tipo: 'bounce' }]
    expect(aggregateCampanhaEventos(rows)).toEqual({ entregue: 0, aberto: 2, clicado: 1, bounce: 1, reclamado: 0 })
  })

  it('ignora tipos desconhecidos sem lançar', () => {
    const rows = [{ tipo: 'aberto' }, { tipo: 'lixo-desconhecido' }]
    expect(aggregateCampanhaEventos(rows)).toEqual({ entregue: 0, aberto: 1, clicado: 0, bounce: 0, reclamado: 0 })
  })

  it('array vazio retorna todos zerados', () => {
    expect(aggregateCampanhaEventos([])).toEqual({ entregue: 0, aberto: 0, clicado: 0, bounce: 0, reclamado: 0 })
  })
})

describe('statsParaGrafico', () => {
  it('mapeia pra formato de gráfico com 5 categorias, labels e cores', () => {
    const stats = { entregue: 5, aberto: 3, clicado: 1, bounce: 0, reclamado: 0 }
    const grafico = statsParaGrafico(stats)
    expect(grafico).toHaveLength(5)
    expect(grafico[0]).toMatchObject({ key: 'entregue', label: 'Entregues', total: 5 })
    expect(grafico.every((g) => typeof g.cor === 'string' && g.cor.startsWith('#'))).toBe(true)
  })
})
