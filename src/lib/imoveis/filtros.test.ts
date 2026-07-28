import { describe, expect, it } from 'vitest'
import {
  passaNosFiltros, filtrarImoveis, agruparBairrosPorCidade,
  filtrosDaQueryString, contarFiltrosAtivos, type ImovelFiltravel,
} from './filtros'

function imovel(over: Partial<ImovelFiltravel> = {}): ImovelFiltravel {
  return {
    id: 'i1', nome: 'Residencial Teste', cidade: 'Criciúma', bairro: 'Centro',
    preco_a_partir_de: 500000, aceita_financiamento: false, aceita_permuta: false,
    parcelamento_construtora: false, mobilia: null, comodidades: [], corretor_captador_id: null,
    ...over,
  }
}

describe('passaNosFiltros — condições comerciais', () => {
  it('filtro desmarcado significa "tanto faz", não "não aceita"', () => {
    expect(passaNosFiltros(imovel({ aceita_permuta: false }), {})).toBe(true)
    expect(passaNosFiltros(imovel({ aceita_permuta: true }), {})).toBe(true)
  })

  it('aceita_permuta marcado só deixa passar quem aceita', () => {
    expect(passaNosFiltros(imovel({ aceita_permuta: true }), { aceitaPermuta: true })).toBe(true)
    expect(passaNosFiltros(imovel({ aceita_permuta: false }), { aceitaPermuta: true })).toBe(false)
  })

  it('parcelamento direto da construtora filtra corretamente', () => {
    expect(passaNosFiltros(imovel({ parcelamento_construtora: true }), { parcelamentoConstrutora: true })).toBe(true)
    expect(passaNosFiltros(imovel({ parcelamento_construtora: false }), { parcelamentoConstrutora: true })).toBe(false)
  })

  it('combina várias condições ao mesmo tempo', () => {
    const bom = imovel({ aceita_financiamento: true, aceita_permuta: true })
    expect(passaNosFiltros(bom, { aceitaFinanciamento: true, aceitaPermuta: true })).toBe(true)
    expect(passaNosFiltros(imovel({ aceita_financiamento: true }), { aceitaFinanciamento: true, aceitaPermuta: true })).toBe(false)
  })
})

describe('passaNosFiltros — localização', () => {
  it('ignora acento e caixa na cidade', () => {
    expect(passaNosFiltros(imovel({ cidade: 'Criciúma' }), { cidades: ['criciuma'] })).toBe(true)
    expect(passaNosFiltros(imovel({ cidade: 'criciuma' }), { cidades: ['CRICIÚMA'] })).toBe(true)
  })

  it('cidade fora da lista é excluída', () => {
    expect(passaNosFiltros(imovel({ cidade: 'Içara' }), { cidades: ['Criciúma'] })).toBe(false)
  })

  it('aceita múltiplas cidades', () => {
    expect(passaNosFiltros(imovel({ cidade: 'Içara' }), { cidades: ['Criciúma', 'Içara'] })).toBe(true)
  })

  it('imóvel sem cidade não passa quando há filtro de cidade', () => {
    expect(passaNosFiltros(imovel({ cidade: null }), { cidades: ['Criciúma'] })).toBe(false)
  })
})

describe('passaNosFiltros — preço', () => {
  it('respeita piso e teto', () => {
    expect(passaNosFiltros(imovel({ preco_a_partir_de: 500000 }), { valorMin: 400000, valorMax: 600000 })).toBe(true)
    expect(passaNosFiltros(imovel({ preco_a_partir_de: 300000 }), { valorMin: 400000 })).toBe(false)
    expect(passaNosFiltros(imovel({ preco_a_partir_de: 700000 }), { valorMax: 600000 })).toBe(false)
  })

  it('imóvel sem preço some no piso mas sobrevive ao teto', () => {
    // Sem preço cadastrado, não dá pra afirmar que custa menos que o teto —
    // mas também não faz sentido escondê-lo de quem só limitou o máximo.
    expect(passaNosFiltros(imovel({ preco_a_partir_de: null }), { valorMin: 400000 })).toBe(false)
    expect(passaNosFiltros(imovel({ preco_a_partir_de: null }), { valorMax: 600000 })).toBe(true)
  })
})

describe('passaNosFiltros — comodidades', () => {
  it('exige TODAS as comodidades pedidas, não qualquer uma', () => {
    const completo = imovel({ comodidades: ['elevador', 'piscina', 'academia'] })
    expect(passaNosFiltros(completo, { comodidades: ['elevador', 'piscina'] })).toBe(true)
    expect(passaNosFiltros(imovel({ comodidades: ['elevador'] }), { comodidades: ['elevador', 'piscina'] })).toBe(false)
  })

  it('imóvel sem comodidades cadastradas não quebra', () => {
    expect(passaNosFiltros(imovel({ comodidades: null }), { comodidades: ['elevador'] })).toBe(false)
    expect(passaNosFiltros(imovel({ comodidades: null }), {})).toBe(true)
  })

  it('churrasqueira a carvão é distinta de ponto de churrasqueira', () => {
    const carvao = imovel({ comodidades: ['churrasqueira_carvao'] })
    expect(passaNosFiltros(carvao, { comodidades: ['churrasqueira_carvao'] })).toBe(true)
    expect(passaNosFiltros(carvao, { comodidades: ['churrasqueira_ponto'] })).toBe(false)
  })
})

describe('passaNosFiltros — corretor (inventário da rede)', () => {
  it('filtra pelo corretor captador', () => {
    expect(passaNosFiltros(imovel({ corretor_captador_id: 'c1' }), { corretorId: 'c1' })).toBe(true)
    expect(passaNosFiltros(imovel({ corretor_captador_id: 'c2' }), { corretorId: 'c1' })).toBe(false)
  })

  it('sem filtro de corretor, mostra o inventário inteiro', () => {
    expect(passaNosFiltros(imovel({ corretor_captador_id: 'c2' }), {})).toBe(true)
    expect(passaNosFiltros(imovel({ corretor_captador_id: null }), {})).toBe(true)
  })
})

describe('agruparBairrosPorCidade', () => {
  it('agrupa por cidade, resolvendo o "Centro" ambíguo', () => {
    const grupos = agruparBairrosPorCidade([
      imovel({ cidade: 'Criciúma', bairro: 'Centro' }),
      imovel({ cidade: 'Içara', bairro: 'Centro' }),
      imovel({ cidade: 'Criciúma', bairro: 'Santa Bárbara' }),
    ])
    expect(grupos).toHaveLength(2)
    const criciuma = grupos.find((g) => g.cidade === 'Criciúma')
    expect(criciuma?.bairros).toEqual(['Centro', 'Santa Bárbara'])
    expect(grupos.find((g) => g.cidade === 'Içara')?.bairros).toEqual(['Centro'])
  })

  it('não duplica bairro repetido e ignora imóvel sem cidade', () => {
    const grupos = agruparBairrosPorCidade([
      imovel({ cidade: 'Criciúma', bairro: 'Centro' }),
      imovel({ cidade: 'Criciúma', bairro: 'Centro' }),
      imovel({ cidade: null, bairro: 'Qualquer' }),
    ])
    expect(grupos).toHaveLength(1)
    expect(grupos[0].bairros).toEqual(['Centro'])
  })
})

describe('filtrosDaQueryString', () => {
  it('lê listas separadas por vírgula', () => {
    const f = filtrosDaQueryString(new URLSearchParams('cidades=Criciúma,Içara&comodidades=elevador,piscina'))
    expect(f.cidades).toEqual(['Criciúma', 'Içara'])
    expect(f.comodidades).toEqual(['elevador', 'piscina'])
  })

  it('descarta comodidade e mobília desconhecidas', () => {
    const f = filtrosDaQueryString(new URLSearchParams('comodidades=elevador,heliponto&mobilia=inventada'))
    expect(f.comodidades).toEqual(['elevador'])
    expect(f.mobilia).toBeUndefined()
  })

  it('booleanos só ativam com "true" explícito', () => {
    expect(filtrosDaQueryString(new URLSearchParams('aceitaPermuta=true')).aceitaPermuta).toBe(true)
    expect(filtrosDaQueryString(new URLSearchParams('aceitaPermuta=false')).aceitaPermuta).toBeUndefined()
    expect(filtrosDaQueryString(new URLSearchParams('')).aceitaPermuta).toBeUndefined()
  })

  it('valor negativo é descartado', () => {
    expect(filtrosDaQueryString(new URLSearchParams('valorMin=-100')).valorMin).toBeUndefined()
  })
})

describe('filtrarImoveis e contarFiltrosAtivos', () => {
  it('filtra a lista inteira', () => {
    const lista = [
      imovel({ id: 'a', aceita_permuta: true }),
      imovel({ id: 'b', aceita_permuta: false }),
    ]
    expect(filtrarImoveis(lista, { aceitaPermuta: true }).map((i) => i.id)).toEqual(['a'])
  })

  it('conta quantos filtros estão ativos (para o badge da UI)', () => {
    expect(contarFiltrosAtivos({})).toBe(0)
    expect(contarFiltrosAtivos({ cidades: ['Criciúma'], aceitaPermuta: true, valorMax: 600000 })).toBe(3)
  })
})
