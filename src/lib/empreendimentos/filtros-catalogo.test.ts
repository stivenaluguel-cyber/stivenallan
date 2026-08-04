import { describe, expect, it } from 'vitest'
import {
  passaNosFiltrosCatalogo, filtrarEmpreendimentos, filtrosDaQueryString,
  queryStringDosFiltros, contarFiltrosAtivos,
} from './filtros-catalogo'
import type { Empreendimento } from '@/lib/empreendimentos'

function emp(over: Partial<Empreendimento> = {}): Empreendimento {
  return {
    slug: 'teste-centro-criciuma-sc', nome: 'Residencial Teste', construtoraSlug: 'fontana',
    construtoraNome: 'Construtora Fontana', cidade: 'Criciúma', bairro: 'Centro', uf: 'SC',
    imagem: 'https://example.com/img.jpg', statusObra: 'em obras',
    ...over,
  }
}

describe('passaNosFiltrosCatalogo — sem filtros', () => {
  it('sem nenhum filtro, tudo passa', () => {
    expect(passaNosFiltrosCatalogo(emp(), {})).toBe(true)
  })
})

describe('passaNosFiltrosCatalogo — busca textual', () => {
  it('acha por nome, ignorando acento e caixa', () => {
    expect(passaNosFiltrosCatalogo(emp({ nome: 'Piazza Castello' }), { busca: 'castelo' })).toBe(false)
    expect(passaNosFiltrosCatalogo(emp({ nome: 'Piazza Castello' }), { busca: 'castello' })).toBe(true)
    expect(passaNosFiltrosCatalogo(emp({ nome: 'Águas de Marano' }), { busca: 'aguas' })).toBe(true)
  })

  it('também acha por bairro e cidade', () => {
    expect(passaNosFiltrosCatalogo(emp({ bairro: 'Michel' }), { busca: 'michel' })).toBe(true)
    expect(passaNosFiltrosCatalogo(emp({ cidade: 'Balneário Rincão' }), { busca: 'rincao' })).toBe(true)
  })
})

describe('passaNosFiltrosCatalogo — localização e construtora', () => {
  it('filtra por cidade', () => {
    expect(passaNosFiltrosCatalogo(emp({ cidade: 'Içara' }), { cidades: ['Criciúma'] })).toBe(false)
    expect(passaNosFiltrosCatalogo(emp({ cidade: 'Içara' }), { cidades: ['Içara'] })).toBe(true)
  })

  it('filtra por construtora pelo nome de exibição', () => {
    expect(passaNosFiltrosCatalogo(emp({ construtoraNome: 'Eraldo Construções' }), { construtoras: ['Construtora Fontana'] })).toBe(false)
    expect(passaNosFiltrosCatalogo(emp({ construtoraNome: 'Eraldo Construções' }), { construtoras: ['Eraldo Construções'] })).toBe(true)
  })
})

describe('passaNosFiltrosCatalogo — status de obra', () => {
  it('filtra por status', () => {
    expect(passaNosFiltrosCatalogo(emp({ statusObra: 'pronto' }), { status: ['entregue'] })).toBe(false)
    expect(passaNosFiltrosCatalogo(emp({ statusObra: 'pronto' }), { status: ['pronto', 'entregue'] })).toBe(true)
  })
})

describe('passaNosFiltrosCatalogo — dormitórios', () => {
  it('casa quando o número pedido está dentro da faixa do empreendimento', () => {
    const e = emp({ dormitoriosMin: 2, dormitoriosMax: 4 })
    expect(passaNosFiltrosCatalogo(e, { dormitorios: [3] })).toBe(true)
    expect(passaNosFiltrosCatalogo(e, { dormitorios: [5] })).toBe(false)
  })

  it('empreendimento sem dado de dormitórios não casa com filtro ativo (não inventa)', () => {
    expect(passaNosFiltrosCatalogo(emp(), { dormitorios: [3] })).toBe(false)
  })
})

describe('passaNosFiltrosCatalogo — faixa de área', () => {
  it('casa quando as faixas se cruzam', () => {
    const e = emp({ areaMin: 90, areaMax: 110 })
    expect(passaNosFiltrosCatalogo(e, { areaMin: 100, areaMax: 150 })).toBe(true)
    expect(passaNosFiltrosCatalogo(e, { areaMin: 200, areaMax: 300 })).toBe(false)
  })

  it('empreendimento sem área cadastrada não casa com filtro de área ativo', () => {
    expect(passaNosFiltrosCatalogo(emp(), { areaMin: 50, areaMax: 100 })).toBe(false)
  })
})

describe('filtrarEmpreendimentos', () => {
  it('mantém só quem passa em todos os filtros combinados', () => {
    const lista = [
      emp({ slug: 'a', cidade: 'Criciúma', statusObra: 'pronto' }),
      emp({ slug: 'b', cidade: 'Criciúma', statusObra: 'em obras' }),
      emp({ slug: 'c', cidade: 'Içara', statusObra: 'pronto' }),
    ]
    const resultado = filtrarEmpreendimentos(lista, { cidades: ['Criciúma'], status: ['pronto'] })
    expect(resultado.map((e) => e.slug)).toEqual(['a'])
  })
})

describe('URL <-> filtros', () => {
  it('round-trip completo preserva os filtros', () => {
    const original = {
      busca: 'centro', cidades: ['Criciúma', 'Içara'], construtoras: ['Construtora Fontana'],
      status: ['em obras' as const], dormitorios: [3, 4], areaMin: 80, areaMax: 150,
    }
    const qs = queryStringDosFiltros(original)
    const voltou = filtrosDaQueryString(new URLSearchParams(qs))
    expect(voltou).toEqual(original)
  })

  it('ignora valor de status desconhecido em vez de propagar pra query', () => {
    const params = new URLSearchParams('status=lixo,pronto')
    expect(filtrosDaQueryString(params).status).toEqual(['pronto'])
  })

  it('query string vazia não seta nenhum filtro', () => {
    expect(filtrosDaQueryString(new URLSearchParams(''))).toEqual({
      busca: undefined, cidades: undefined, bairros: undefined, construtoras: undefined,
      status: undefined, dormitorios: undefined, areaMin: undefined, areaMax: undefined,
    })
  })
})

describe('contarFiltrosAtivos', () => {
  it('conta zero quando nada está setado', () => {
    expect(contarFiltrosAtivos({})).toBe(0)
  })
  it('conta cada dimensão de filtro uma vez', () => {
    expect(contarFiltrosAtivos({ busca: 'x', cidades: ['Criciúma'], areaMin: 50 })).toBe(3)
  })
})
