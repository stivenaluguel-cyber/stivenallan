import { describe, expect, it } from 'vitest'
import { cruzarPermuta, situacaoPermuta, type UnidadeParaPermuta } from './permutas'

const unidade = (over: Partial<UnidadeParaPermuta> = {}): UnidadeParaPermuta => ({
  id: 'u1',
  identificador: '302',
  empreendimento_nome: 'Parco Savello',
  valor_tabela: 800_000,
  valor_entrada_min: 160_000,
  plano_pagamento: { entrada: 160_000, opcoes_pagamento: [{ tipo: 'direto' }] },
  status: 'disponivel',
  ...over,
})

describe('situacaoPermuta', () => {
  it('tabela que não fala em permuta não vira "aceita"', () => {
    // O parser só sabe dizer NÃO. Quem confirma permuta é a construtora, e um
    // rótulo "aceita" faria o corretor prometer o que não pode.
    expect(situacaoPermuta({ opcoes_pagamento: [{ tipo: 'direto' }] })).toBe('nao_mencionada')
  })

  it('todas as condições excluindo é negócio impossível', () => {
    expect(situacaoPermuta({
      opcoes_pagamento: [{ aceitaPermuta: false }, { aceitaPermuta: false }],
    })).toBe('todas_excluem')
  })

  it('uma condição excluindo ainda deixa caminho pelas outras', () => {
    expect(situacaoPermuta({
      opcoes_pagamento: [{ aceitaPermuta: false }, { tipo: 'a_vista' }],
    })).toBe('alguma_exclui')
  })

  it('unidade sem plano não quebra', () => {
    expect(situacaoPermuta(null)).toBe('nao_mencionada')
    expect(situacaoPermuta({ opcoes_pagamento: [] })).toBe('nao_mencionada')
  })
})

describe('cruzarPermuta', () => {
  it('permuta que cobre a entrada inteira aparece como tal', () => {
    const [c] = cruzarPermuta(200_000, [unidade()])
    expect(c.cobertura).toBe('cobre_entrada')
    expect(c.percentualDaEntrada).toBe(125)
    expect(c.excedente).toBe(40_000)
  })

  it('permuta menor cobre parte e diz quanto', () => {
    const [c] = cruzarPermuta(80_000, [unidade()])
    expect(c.cobertura).toBe('cobre_parte')
    expect(c.percentualDaEntrada).toBe(50)
    expect(c.excedente).toBe(0)
  })

  it('unidade que exclui permuta em todas as condições fica de fora', () => {
    const excluida = unidade({
      id: 'u2',
      plano_pagamento: { entrada: 100_000, opcoes_pagamento: [{ aceitaPermuta: false }] },
    })
    const r = cruzarPermuta(200_000, [unidade(), excluida])
    expect(r.map((c) => c.unidadeId)).toEqual(['u1'])
  })

  it('unidade vendida não é oportunidade', () => {
    const r = cruzarPermuta(200_000, [unidade({ status: 'vendida' })])
    expect(r).toHaveLength(0)
  })

  it('quem cobre a entrada vem antes de quem cobre só parte', () => {
    const cara = unidade({ id: 'cara', valor_entrada_min: 400_000, plano_pagamento: { entrada: 400_000, opcoes_pagamento: [] } })
    const barata = unidade({ id: 'barata', valor_entrada_min: 90_000, plano_pagamento: { entrada: 90_000, opcoes_pagamento: [] } })
    const r = cruzarPermuta(150_000, [cara, barata])
    expect(r[0].unidadeId).toBe('barata')
    expect(r[0].cobertura).toBe('cobre_entrada')
  })

  it('entre as que cobrem, a de entrada maior aproveita melhor a permuta', () => {
    const a = unidade({ id: 'entrada80', valor_entrada_min: 80_000, plano_pagamento: { entrada: 80_000, opcoes_pagamento: [] } })
    const b = unidade({ id: 'entrada140', valor_entrada_min: 140_000, plano_pagamento: { entrada: 140_000, opcoes_pagamento: [] } })
    const r = cruzarPermuta(150_000, [a, b])
    expect(r[0].unidadeId).toBe('entrada140')
  })

  it('entre as que não cobrem, a mais perto de fechar vem antes', () => {
    const longe = unidade({ id: 'longe', valor_entrada_min: 500_000, plano_pagamento: { entrada: 500_000, opcoes_pagamento: [] } })
    const perto = unidade({ id: 'perto', valor_entrada_min: 120_000, plano_pagamento: { entrada: 120_000, opcoes_pagamento: [] } })
    const r = cruzarPermuta(100_000, [longe, perto])
    expect(r[0].unidadeId).toBe('perto')
  })

  it('entrada desconhecida não vira zero — seria "cobre tudo" mentiroso', () => {
    const semEntrada = unidade({ valor_entrada_min: null, plano_pagamento: { opcoes_pagamento: [] } })
    const [c] = cruzarPermuta(50_000, [semEntrada])
    expect(c.cobertura).toBe('sem_entrada_conhecida')
    expect(c.percentualDaEntrada).toBeNull()
  })

  it('permuta sem valor não devolve combinação nenhuma', () => {
    expect(cruzarPermuta(0, [unidade()])).toEqual([])
    expect(cruzarPermuta(Number.NaN, [unidade()])).toEqual([])
  })
})
