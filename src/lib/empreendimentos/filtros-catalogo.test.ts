import { describe, expect, it } from 'vitest'
import {
  passaNosFiltrosCatalogo, filtrarEmpreendimentos, filtrosDaQueryString,
  queryStringDosFiltros, contarFiltrosAtivos, type OpcoesDisponiveis,
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

  // Casos exigidos pela revisão independente (achado P1-2): a versão anterior
  // fazia `max1 ?? min1 ?? Infinity`, colapsando "só mínimo" num intervalo
  // fechado [min,min] e excluindo silenciosamente qualquer imóvel maior.
  it('só mínimo preenchido: imóvel maior que o mínimo casa (era o bug — regressão P1-2)', () => {
    expect(passaNosFiltrosCatalogo(emp({ areaMin: 150, areaMax: 200 }), { areaMin: 100 })).toBe(true)
  })

  it('só mínimo preenchido: imóvel menor que o mínimo não casa', () => {
    expect(passaNosFiltrosCatalogo(emp({ areaMin: 80, areaMax: 90 }), { areaMin: 100 })).toBe(false)
  })

  it('só máximo preenchido: imóvel menor que o máximo casa', () => {
    expect(passaNosFiltrosCatalogo(emp({ areaMin: 50, areaMax: 80 }), { areaMax: 100 })).toBe(true)
  })

  it('só máximo preenchido: imóvel maior que o máximo não casa', () => {
    expect(passaNosFiltrosCatalogo(emp({ areaMin: 120, areaMax: 150 }), { areaMax: 100 })).toBe(false)
  })

  it('mínimo e máximo preenchidos: casa quando as faixas se sobrepõem, mesmo parcialmente', () => {
    expect(passaNosFiltrosCatalogo(emp({ areaMin: 140, areaMax: 200 }), { areaMin: 100, areaMax: 150 })).toBe(true)
  })

  it('imóvel sem nenhum dado de área não casa com filtro de área ativo', () => {
    expect(passaNosFiltrosCatalogo(emp({ areaMin: undefined, areaMax: undefined }), { areaMin: 50 })).toBe(false)
  })

  it('limites exatamente iguais (fronteira inclusiva) casam', () => {
    expect(passaNosFiltrosCatalogo(emp({ areaMin: 100, areaMax: 100 }), { areaMin: 100, areaMax: 100 })).toBe(true)
    // fronteira tocando no extremo oposto também deve casar (inclusivo dos dois lados)
    expect(passaNosFiltrosCatalogo(emp({ areaMin: 100, areaMax: 150 }), { areaMin: 50, areaMax: 100 })).toBe(true)
  })

  it('faixas realmente separadas (sem sobreposição) não casam', () => {
    expect(passaNosFiltrosCatalogo(emp({ areaMin: 50, areaMax: 90 }), { areaMin: 100, areaMax: 150 })).toBe(false)
    expect(passaNosFiltrosCatalogo(emp({ areaMin: 200, areaMax: 250 }), { areaMin: 100, areaMax: 150 })).toBe(false)
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

// Inventário de referência pros testes de validação (achado P1-4) — imita o
// que a página do catálogo calcula de verdade a partir dos dados carregados.
const DISPONIVEIS: OpcoesDisponiveis = {
  cidades: ['Criciúma', 'Içara'],
  bairros: ['Centro', 'Michel'],
  construtoras: ['Construtora Fontana', 'Eraldo Construções'],
  dormitorios: [2, 3, 4],
}

describe('URL <-> filtros — round-trip com um único valor por dimensão', () => {
  it('round-trip preserva os filtros quando cada dimensão já tem um único valor válido', () => {
    const original = {
      busca: 'centro', cidades: ['Criciúma'], construtoras: ['Construtora Fontana'],
      status: ['em obras' as const], dormitorios: [3], areaMin: 80, areaMax: 150,
    }
    const qs = queryStringDosFiltros(original)
    const voltou = filtrosDaQueryString(new URLSearchParams(qs), DISPONIVEIS)
    expect(voltou).toEqual(original)
  })

  it('query string vazia não seta nenhum filtro', () => {
    expect(filtrosDaQueryString(new URLSearchParams(''), DISPONIVEIS)).toEqual({
      busca: undefined, cidades: undefined, bairros: undefined, construtoras: undefined,
      status: undefined, dormitorios: undefined, areaMin: undefined, areaMax: undefined,
    })
  })
})

// Achado P1-4 da revisão independente: valor da URL que não bate com o
// inventário atual deixava um filtro "invisível" ativo (o <select> mostra
// "Qualquer"/"Todas" mas o resultado continua filtrado). Estes testes cobrem
// exatamente os cenários pedidos.
describe('filtrosDaQueryString — validação contra o inventário disponível (P1-4)', () => {
  it('valor válido: mantém o filtro', () => {
    const params = new URLSearchParams('cidade=Içara')
    expect(filtrosDaQueryString(params, DISPONIVEIS).cidades).toEqual(['Içara'])
  })

  it('valor inválido (nunca existiu): descarta o filtro em vez de deixá-lo invisível', () => {
    const params = new URLSearchParams('cidade=Atlantis')
    expect(filtrosDaQueryString(params, DISPONIVEIS).cidades).toBeUndefined()
  })

  it('valor antigo que não existe mais no inventário atual: descarta (não trava o catálogo vazio)', () => {
    // simula um link salvo há tempos com uma cidade que hoje não tem mais nenhum imóvel
    const disponiveisAtualizado: OpcoesDisponiveis = { ...DISPONIVEIS, cidades: ['Criciúma'] }
    const params = new URLSearchParams('cidade=Içara') // válida antes, não existe mais agora
    expect(filtrosDaQueryString(params, disponiveisAtualizado).cidades).toBeUndefined()
  })

  it('dormitórios: valor válido passa, valor fora do inventário é descartado', () => {
    expect(filtrosDaQueryString(new URLSearchParams('dorms=3'), DISPONIVEIS).dormitorios).toEqual([3])
    expect(filtrosDaQueryString(new URLSearchParams('dorms=7'), DISPONIVEIS).dormitorios).toBeUndefined()
  })

  it('bairro e construtora seguem a mesma regra de validação', () => {
    expect(filtrosDaQueryString(new URLSearchParams('bairro=Centro'), DISPONIVEIS).bairros).toEqual(['Centro'])
    expect(filtrosDaQueryString(new URLSearchParams('bairro=Bairro-Que-Nao-Existe'), DISPONIVEIS).bairros).toBeUndefined()
    expect(filtrosDaQueryString(new URLSearchParams('construtora=Eraldo Construções'), DISPONIVEIS).construtoras).toEqual(['Eraldo Construções'])
  })

  it('status: mantém a validação existente contra STATUS_VALIDOS, ignorando lixo', () => {
    const params = new URLSearchParams('status=lixo,pronto')
    expect(filtrosDaQueryString(params, DISPONIVEIS).status).toEqual(['pronto'])
  })

  it('parâmetro repetido (múltiplos valores separados por vírgula): normaliza pro primeiro válido, não pros dois', () => {
    // a UI é de <select> simples — não há como exibir "Criciúma e Içara" ao mesmo tempo,
    // então a política é manter só o primeiro valor válido em vez de aplicar um filtro
    // que o <select> não consegue representar (era o resto do achado P1-4).
    const params = new URLSearchParams('cidade=Criciúma,Içara')
    expect(filtrosDaQueryString(params, DISPONIVEIS).cidades).toEqual(['Criciúma'])
  })

  it('parâmetro repetido onde o primeiro é inválido: pula pro próximo válido da lista', () => {
    const params = new URLSearchParams('cidade=Atlantis,Içara')
    expect(filtrosDaQueryString(params, DISPONIVEIS).cidades).toEqual(['Içara'])
  })

  it('URL compartilhada (vários filtros de uma vez, alguns inválidos): só os válidos sobrevivem', () => {
    const params = new URLSearchParams('cidade=Içara&bairro=Bairro-Fantasma&dorms=99&status=pronto')
    const filtros = filtrosDaQueryString(params, DISPONIVEIS)
    expect(filtros.cidades).toEqual(['Içara'])
    expect(filtros.bairros).toBeUndefined()
    expect(filtros.dormitorios).toBeUndefined()
    expect(filtros.status).toEqual(['pronto'])
  })

  it('inventário vazio (catálogo sem itens carregados): nenhum valor pode ser considerado válido', () => {
    const vazio: OpcoesDisponiveis = { cidades: [], bairros: [], construtoras: [], dormitorios: [] }
    const params = new URLSearchParams('cidade=Criciúma&dorms=3')
    const filtros = filtrosDaQueryString(params, vazio)
    expect(filtros.cidades).toBeUndefined()
    expect(filtros.dormitorios).toBeUndefined()
  })

  it('validação ignora acento/caixa (mesma normalização usada no predicado de filtro)', () => {
    const params = new URLSearchParams('cidade=icara') // sem acento, minúsculo
    // retorna a forma CANÔNICA da lista de disponíveis, não o texto cru da URL
    expect(filtrosDaQueryString(params, DISPONIVEIS).cidades).toEqual(['Içara'])
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
