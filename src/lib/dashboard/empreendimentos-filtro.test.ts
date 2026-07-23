import { describe, expect, it } from 'vitest'
import {
  filtrarEmpreendimentos,
  normalizarTexto,
  ordenarEmpreendimentos,
  paginar,
  valoresUnicos,
  type EmpreendimentoFiltravel,
} from './empreendimentos-filtro'

function emp(overrides: Partial<EmpreendimentoFiltravel> = {}): EmpreendimentoFiltravel {
  return {
    nome: 'Monte Leone', construtora: 'Fontana', cidade: 'Criciúma',
    status_obra: 'em_obras', status_venda: 'ativo', preco_a_partir: 500000,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('normalizarTexto', () => {
  it('ignora acentuação e caixa', () => {
    expect(normalizarTexto('Criciúma')).toBe(normalizarTexto('criciuma'))
    expect(normalizarTexto('AVEZZANO')).toBe(normalizarTexto('avezzano'))
  })
})

describe('filtrarEmpreendimentos', () => {
  const lista = [
    emp({ nome: 'Monte Leone', construtora: 'Fontana', cidade: 'Criciúma' }),
    emp({ nome: 'Avezzano', construtora: 'Eraldo', cidade: 'Içara' }),
    emp({ nome: 'Bosco Del Montello', construtora: 'Fontana', cidade: 'Criciúma', status_venda: 'pausado' }),
  ]

  it('busca por texto ignora acento e é case-insensitive (nome/construtora/cidade)', () => {
    expect(filtrarEmpreendimentos(lista, { busca: 'criciuma' })).toHaveLength(2)
    expect(filtrarEmpreendimentos(lista, { busca: 'AVEZZANO' })).toHaveLength(1)
    expect(filtrarEmpreendimentos(lista, { busca: 'içara' })).toHaveLength(1)
  })

  it('filtra por construtora exata', () => {
    expect(filtrarEmpreendimentos(lista, { construtora: 'Fontana' })).toHaveLength(2)
  })

  it('filtra por status de venda', () => {
    expect(filtrarEmpreendimentos(lista, { statusVenda: 'pausado' })).toHaveLength(1)
  })

  it('combina múltiplos filtros', () => {
    const res = filtrarEmpreendimentos(lista, { construtora: 'Fontana', statusVenda: 'pausado' })
    expect(res).toHaveLength(1)
    expect(res[0].nome).toBe('Bosco Del Montello')
  })

  it('sem filtros retorna a lista inteira', () => {
    expect(filtrarEmpreendimentos(lista, {})).toHaveLength(3)
  })
})

describe('ordenarEmpreendimentos', () => {
  it('nome_asc ordena alfabeticamente (locale pt-BR)', () => {
    const lista = [emp({ nome: 'Zeta' }), emp({ nome: 'Avezzano' }), emp({ nome: 'Monte Leone' })]
    expect(ordenarEmpreendimentos(lista, 'nome_asc').map((e) => e.nome)).toEqual(['Avezzano', 'Monte Leone', 'Zeta'])
  })

  it('recentes ordena created_at desc', () => {
    const lista = [
      emp({ nome: 'A', created_at: '2026-01-01T00:00:00Z' }),
      emp({ nome: 'B', created_at: '2026-06-01T00:00:00Z' }),
      emp({ nome: 'C', created_at: '2026-03-01T00:00:00Z' }),
    ]
    expect(ordenarEmpreendimentos(lista, 'recentes').map((e) => e.nome)).toEqual(['B', 'C', 'A'])
  })

  it('preco_asc ordena por preço crescente com nulls sempre por último', () => {
    const lista = [
      emp({ nome: 'Caro', preco_a_partir: 900000 }),
      emp({ nome: 'SemPreco', preco_a_partir: null }),
      emp({ nome: 'Barato', preco_a_partir: 300000 }),
    ]
    expect(ordenarEmpreendimentos(lista, 'preco_asc').map((e) => e.nome)).toEqual(['Barato', 'Caro', 'SemPreco'])
  })

  it('não muta a lista original', () => {
    const lista = [emp({ nome: 'Zeta' }), emp({ nome: 'Avezzano' })]
    const original = [...lista]
    ordenarEmpreendimentos(lista, 'nome_asc')
    expect(lista).toEqual(original)
  })
})

describe('paginar', () => {
  const lista = Array.from({ length: 30 }, (_, i) => emp({ nome: `Emp ${i + 1}` }))

  it('divide em páginas de tamanho fixo', () => {
    const { itens, totalPaginas } = paginar(lista, 1, 12)
    expect(itens).toHaveLength(12)
    expect(totalPaginas).toBe(3)
    expect(itens[0].nome).toBe('Emp 1')
  })

  it('última página traz o resto (menos que o tamanho de página)', () => {
    const { itens } = paginar(lista, 3, 12)
    expect(itens).toHaveLength(6)
  })

  it('página fora do intervalo é clampada pro máximo válido', () => {
    const { itens } = paginar(lista, 99, 12)
    expect(itens).toHaveLength(6) // mesma coisa que a última página real
  })

  it('lista vazia: totalPaginas nunca é zero', () => {
    expect(paginar([], 1, 12).totalPaginas).toBe(1)
  })
})

describe('valoresUnicos', () => {
  it('extrai valores únicos e ordenados, ignorando vazios', () => {
    const lista = [emp({ construtora: 'Fontana' }), emp({ construtora: 'Eraldo' }), emp({ construtora: 'Fontana' }), emp({ construtora: '' })]
    expect(valoresUnicos(lista, 'construtora')).toEqual(['Eraldo', 'Fontana'])
  })
})
