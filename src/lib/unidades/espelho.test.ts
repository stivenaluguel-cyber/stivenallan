import { describe, it, expect } from 'vitest'
import {
  agruparEspelho,
  andarDaUnidade,
  expiraEm,
  pickPublico,
  precoDaUnidade,
  resolverEmpreendimentoPorNome,
  resumoEspelho,
  statusDaUnidade,
  type UnidadeEspelho,
} from './espelho'

const AGORA = new Date('2026-07-29T15:00:00Z')

function unidade(sobre: Partial<UnidadeEspelho>): UnidadeEspelho {
  return {
    id: 'u-' + (sobre.unidade ?? 'x'),
    bloco: null,
    unidade: '101',
    andar: null,
    metragem: 60,
    dormitorios: 2,
    suites: 1,
    orientacao: null,
    valor_tabela: 450000,
    valor_promocional: null,
    valor_entrada_min: null,
    disponivel: true,
    reservado_ate: null,
    lead_id_reserva: null,
    condicoes_negociacao: null,
    cub_fator: null,
    ...sobre,
  }
}

describe('statusDaUnidade — a máquina de estados inteira', () => {
  it('disponivel=false é vendida, ponto final', () => {
    expect(statusDaUnidade(unidade({ disponivel: false }), AGORA)).toBe('vendida')
  })

  it('vendida vence reserva futura (venda é permanente)', () => {
    const u = unidade({ disponivel: false, reservado_ate: '2026-07-31T00:00:00Z' })
    expect(statusDaUnidade(u, AGORA)).toBe('vendida')
  })

  it('reserva no futuro é reservada', () => {
    expect(statusDaUnidade(unidade({ reservado_ate: '2026-07-30T15:00:00Z' }), AGORA)).toBe('reservada')
  })

  it('reserva vencida volta a disponível SEM cron — lazy expiry', () => {
    expect(statusDaUnidade(unidade({ reservado_ate: '2026-07-29T14:59:00Z' }), AGORA)).toBe('disponivel')
  })

  it('reservado_ate inválido não trava a unidade como reservada eterna', () => {
    expect(statusDaUnidade(unidade({ reservado_ate: 'não é data' }), AGORA)).toBe('disponivel')
  })
})

describe('expiraEm', () => {
  it('padrão de 48h a partir de agora', () => {
    expect(expiraEm(AGORA)).toBe('2026-07-31T15:00:00.000Z')
  })
})

describe('precoDaUnidade', () => {
  it('promoção menor que a tabela vira o preço, com o "de" preservado', () => {
    const p = precoDaUnidade(unidade({ valor_tabela: 450000, valor_promocional: 420000 }))
    expect(p).toEqual({ valor: 420000, promocional: true, de: 450000 })
  })

  it('promoção MAIOR que a tabela é ignorada — nunca vender desconto falso', () => {
    const p = precoDaUnidade(unidade({ valor_tabela: 450000, valor_promocional: 480000 }))
    expect(p.valor).toBe(450000)
    expect(p.promocional).toBe(false)
  })

  it('sem tabela, promoção sozinha vale como preço simples', () => {
    const p = precoDaUnidade(unidade({ valor_tabela: null, valor_promocional: 400000 }))
    expect(p).toEqual({ valor: 400000, promocional: false, de: null })
  })

  it('sem nenhum valor devolve null (sob consulta)', () => {
    expect(precoDaUnidade(unidade({ valor_tabela: null }))).toEqual({ valor: null, promocional: false, de: null })
  })
})

describe('andarDaUnidade', () => {
  it('coluna andar preenchida vence a derivação', () => {
    expect(andarDaUnidade(unidade({ andar: 7, unidade: '302' }))).toBe(7)
  })

  it('deriva pela convenção predial: 302 → 3º, 1204 → 12º', () => {
    expect(andarDaUnidade(unidade({ unidade: '302' }))).toBe(3)
    expect(andarDaUnidade(unidade({ unidade: '1204' }))).toBe(12)
  })

  it('loja e garden sem número interpretável ficam sem andar', () => {
    expect(andarDaUnidade(unidade({ unidade: 'L1' }))).toBeNull()
    expect(andarDaUnidade(unidade({ unidade: 'G2' }))).toBeNull()
  })
})

describe('agruparEspelho', () => {
  it('andares do topo para baixo, unidades em ordem, sem-andar no fim', () => {
    const grade = agruparEspelho([
      unidade({ unidade: '102' }), unidade({ unidade: '1201' }),
      unidade({ unidade: '101' }), unidade({ unidade: 'L1' }),
    ])
    expect(grade).toHaveLength(1)
    const andares = grade[0].andares
    expect(andares.map((a) => a.andar)).toEqual([12, 1, null])
    expect(andares[1].unidades.map((u) => u.unidade)).toEqual(['101', '102'])
  })

  it('separa por bloco em ordem alfabética', () => {
    const grade = agruparEspelho([
      unidade({ bloco: 'B', unidade: '101' }),
      unidade({ bloco: 'A', unidade: '101' }),
    ])
    expect(grade.map((b) => b.bloco)).toEqual(['A', 'B'])
  })

  it('lista vazia devolve grade vazia sem quebrar', () => {
    expect(agruparEspelho([])).toEqual([])
  })
})

describe('resumoEspelho', () => {
  it('conta cada status com a mesma régua do statusDaUnidade', () => {
    const r = resumoEspelho([
      unidade({}),
      unidade({ reservado_ate: '2026-07-30T00:00:00Z' }),
      unidade({ reservado_ate: '2026-07-01T00:00:00Z' }), // vencida → disponível
      unidade({ disponivel: false }),
    ], AGORA)
    expect(r).toEqual({ total: 4, disponiveis: 2, reservadas: 1, vendidas: 1, percentualVendido: 25 })
  })

  it('espelho vazio não divide por zero', () => {
    expect(resumoEspelho([], AGORA).percentualVendido).toBe(0)
  })
})

describe('resolverEmpreendimentoPorNome — contra os nomes REAIS de produção', () => {
  // Estes são os 5 nomes exatos da tabela `empreendimentos` em produção.
  const EMPS = [
    { id: 'fidenza', nome: 'Fidenza Residencial' },
    { id: 'hub', nome: 'Hub Smart Home' },
    { id: 'lavis', nome: 'Lavis Residencial' },
    { id: 'monte', nome: 'Monte Leone Residencial' },
    { id: 'pineto', nome: 'Pineto Residencial' },
  ]

  it('resolve os 5 pares reais property→empreendimento', () => {
    expect(resolverEmpreendimentoPorNome('Pineto Residencial', EMPS)).toBe('pineto')
    expect(resolverEmpreendimentoPorNome('Lavis Residencial', EMPS)).toBe('lavis')
    expect(resolverEmpreendimentoPorNome('Monte Leone Residencial', EMPS)).toBe('monte')
    expect(resolverEmpreendimentoPorNome('Fidenza Residencial', EMPS)).toBe('fidenza')
    expect(resolverEmpreendimentoPorNome('Hub Smart Home', EMPS)).toBe('hub')
  })

  it('ignora o sufixo Residencial e acentos na comparação', () => {
    expect(resolverEmpreendimentoPorNome('PINETO', EMPS)).toBe('pineto')
    expect(resolverEmpreendimentoPorNome('Pinéto residencial', EMPS)).toBe('pineto')
  })

  it('property de outra construtora sem unidades devolve null, não chute', () => {
    expect(resolverEmpreendimentoPorNome('Avezzano', EMPS)).toBeNull()
    expect(resolverEmpreendimentoPorNome('Bosco Del Montello Residencial', EMPS)).toBeNull()
  })

  it('match EXATO pós-normalização vence um parcial concorrente', () => {
    const comTower = [...EMPS, { id: 'pineto2', nome: 'Pineto Tower' }]
    // "Pineto" e "Pineto Residencial" canonicalizam para a MESMA chave (o
    // sufixo sai da comparação) — é exato e único; "Pineto Tower" fica de fora.
    expect(resolverEmpreendimentoPorNome('Pineto', comTower)).toBe('pineto')
  })

  it('ambiguidade REAL (duas chaves canônicas iguais) devolve null', () => {
    const duplicados = [...EMPS, { id: 'pineto2', nome: 'Pineto' }]
    // 'Pineto Residencial' e 'Pineto' viram a mesma chave: dois exatos → recusa.
    expect(resolverEmpreendimentoPorNome('Pineto', duplicados)).toBeNull()
  })

  it('nome curto demais (<4) não arrisca match parcial — recusa', () => {
    // "hub" ≠ "hubsmarthome" no exato, e o parcial exige 4+ caracteres dos
    // dois lados. Melhor nenhum espelho do que o espelho errado.
    expect(resolverEmpreendimentoPorNome('Hub', EMPS)).toBeNull()
  })
})

describe('pickPublico — o que vaza e o que não vaza', () => {
  const interna = unidade({
    condicoes_negociacao: 'aceita carro na entrada',
    lead_id_reserva: 'lead-secreto',
    cub_fator: 2.27,
    valor_entrada_min: 45000,
  })

  it('nunca expõe condições de negociação, lead da reserva nem cub_fator', () => {
    const pub = pickPublico(interna, true, AGORA) as unknown as Record<string, unknown>
    expect(pub.condicoes_negociacao).toBeUndefined()
    expect(pub.lead_id_reserva).toBeUndefined()
    expect(pub.cub_fator).toBeUndefined()
  })

  it('com exibir_preco desligado, preço e entrada saem null', () => {
    const pub = pickPublico(interna, false, AGORA)
    expect(pub.preco).toBeNull()
    expect(pub.entrada_min).toBeNull()
    expect(pub.status).toBe('disponivel')
  })

  it('com exibir_preco ligado, preço e entrada mínima aparecem', () => {
    const pub = pickPublico(interna, true, AGORA)
    expect(pub.preco?.valor).toBe(450000)
    expect(pub.entrada_min).toBe(45000)
  })
})
