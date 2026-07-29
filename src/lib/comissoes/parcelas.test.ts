import { describe, it, expect } from 'vitest'
import { gerarParcelas, normalizarParcelas, resumirParcelas, somarDias, somarMeses, type Parcela } from './parcelas'

describe('somarMeses', () => {
  it('soma meses preservando o dia', () => {
    expect(somarMeses('2026-01-10', 1)).toBe('2026-02-10')
    expect(somarMeses('2026-01-10', 12)).toBe('2027-01-10')
  })

  it('31 de janeiro + 1 mês vira 28 de fevereiro, não 3 de março', () => {
    // O Date do JavaScript estoura o mês aqui; a parcela cairia em março e o
    // fluxo de caixa mostraria o dinheiro no mês errado.
    expect(somarMeses('2026-01-31', 1)).toBe('2026-02-28')
  })

  it('respeita ano bissexto', () => {
    expect(somarMeses('2028-01-31', 1)).toBe('2028-02-29')
  })

  it('vira o ano corretamente', () => {
    expect(somarMeses('2026-12-15', 1)).toBe('2027-01-15')
  })

  it('data inválida volta inalterada em vez de virar NaN', () => {
    expect(somarMeses('não é data', 3)).toBe('não é data')
  })
})

describe('gerarParcelas', () => {
  it('as parcelas somam exatamente o total mesmo com divisão inexata', () => {
    const p = gerarParcelas(10000, 3, '2026-08-10')
    const soma = p.reduce((s, x) => s + x.valor, 0)
    expect(Number(soma.toFixed(2))).toBe(10000)
    expect(p).toHaveLength(3)
  })

  it('o resto vai inteiro para a última parcela', () => {
    const p = gerarParcelas(10000, 3, '2026-08-10')
    expect(p[0].valor).toBe(3333.33)
    expect(p[1].valor).toBe(3333.33)
    expect(p[2].valor).toBe(3333.34)
  })

  it('parcela única recebe o valor cheio e descrição própria', () => {
    const p = gerarParcelas(7059.2, 1, '2026-08-10')
    expect(p).toHaveLength(1)
    expect(p[0].valor).toBe(7059.2)
    expect(p[0].descricao).toBe('Parcela única')
  })

  it('espaça as datas mês a mês a partir da primeira', () => {
    const p = gerarParcelas(3000, 3, '2026-08-31')
    expect(p.map((x) => x.data_prevista)).toEqual(['2026-08-31', '2026-09-30', '2026-10-31'])
  })

  it('aceita intervalo diferente de um mês', () => {
    const p = gerarParcelas(3000, 3, '2026-08-10', 3)
    expect(p.map((x) => x.data_prevista)).toEqual(['2026-08-10', '2026-11-10', '2027-02-10'])
  })

  it('valor zero ou negativo não gera parcela', () => {
    expect(gerarParcelas(0, 3, '2026-08-10')).toEqual([])
    expect(gerarParcelas(-100, 3, '2026-08-10')).toEqual([])
  })

  it('quantidade zero cai para uma parcela em vez de gerar lista vazia', () => {
    expect(gerarParcelas(1000, 0, '2026-08-10')).toHaveLength(1)
  })

  it('toda parcela nasce prevista e sem data de pagamento', () => {
    for (const p of gerarParcelas(1000, 4, '2026-08-10')) {
      expect(p.status).toBe('prevista')
      expect(p.data_pagamento).toBeNull()
    }
  })
})

describe('resumirParcelas', () => {
  const HOJE = '2026-07-29'

  const parcelas: Parcela[] = [
    { numero: 1, valor: 1000, data_prevista: '2026-05-10', status: 'recebida', data_pagamento: '2026-05-11' },
    { numero: 2, valor: 1000, data_prevista: '2026-07-10', status: 'prevista' },   // vencida
    { numero: 3, valor: 1000, data_prevista: '2026-08-10', status: 'prevista' },   // dentro de 90d
    { numero: 4, valor: 1000, data_prevista: '2027-01-10', status: 'prevista' },   // fora de 90d
  ]

  it('separa recebido, a receber e vencido', () => {
    const r = resumirParcelas(parcelas, HOJE)
    expect(r.recebido).toBe(1000)
    expect(r.aReceber).toBe(3000)
    expect(r.vencido).toBe(1000)
  })

  it('vencido não é somado duas vezes dentro de a receber', () => {
    const r = resumirParcelas(parcelas, HOJE)
    expect(r.total).toBe(4000)
    expect(r.recebido + r.aReceber).toBe(r.total)
  })

  it('próximos 90 dias inclui o que está vencido, porque ainda é caixa esperado', () => {
    const r = resumirParcelas(parcelas, HOJE)
    expect(r.proximos90Dias).toBe(2000) // a vencida (1000) + a de agosto (1000)
  })

  it('parcela cancelada some de todos os totais', () => {
    const r = resumirParcelas([...parcelas, { numero: 5, valor: 9999, data_prevista: '2026-08-01', status: 'cancelada' }], HOJE)
    expect(r.total).toBe(4000)
    expect(r.quantidade).toBe(4)
  })

  it('a próxima parcela é a mais antiga ainda não vencida', () => {
    const r = resumirParcelas(parcelas, HOJE)
    expect(r.proximaParcela?.numero).toBe(3)
  })

  it('sem parcela futura, proximaParcela é null em vez de apontar para a vencida', () => {
    const r = resumirParcelas([{ numero: 1, valor: 500, data_prevista: '2026-01-01', status: 'prevista' }], HOJE)
    expect(r.proximaParcela).toBeNull()
    expect(r.vencido).toBe(500)
  })

  it('percentual recebido é sobre o total não cancelado', () => {
    expect(resumirParcelas(parcelas, HOJE).percentualRecebido).toBe(25)
  })

  it('lista vazia devolve zeros sem dividir por zero', () => {
    const r = resumirParcelas([], HOJE)
    expect(r.total).toBe(0)
    expect(r.percentualRecebido).toBe(0)
    expect(r.proximaParcela).toBeNull()
  })

  it('parcela que vence exatamente hoje não conta como vencida', () => {
    const r = resumirParcelas([{ numero: 1, valor: 500, data_prevista: HOJE, status: 'prevista' }], HOJE)
    expect(r.vencido).toBe(0)
    expect(r.proximaParcela?.numero).toBe(1)
  })
})

describe('somarDias', () => {
  it('atravessa a virada de mês', () => {
    expect(somarDias('2026-07-29', 90)).toBe('2026-10-27')
  })

  it('data inválida volta inalterada', () => {
    expect(somarDias('xx', 10)).toBe('xx')
  })
})

describe('normalizarParcelas', () => {
  const ID = 'com-1'

  it('aceita um plano que fecha com o valor da comissão', () => {
    const r = normalizarParcelas(ID, 3000, [
      { numero: 1, valor: 1000, data_prevista: '2026-08-10' },
      { numero: 2, valor: 1000, data_prevista: '2026-09-10' },
      { numero: 3, valor: 1000, data_prevista: '2026-10-10' },
    ])
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.inserts).toHaveLength(3)
  })

  it('recusa plano cuja soma não bate com a comissão', () => {
    const r = normalizarParcelas(ID, 3000, [{ numero: 1, valor: 500, data_prevista: '2026-08-10' }])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toMatch(/somam/)
  })

  it('tolera um centavo de diferença de arredondamento', () => {
    const r = normalizarParcelas(ID, 10000, gerarParcelas(10000, 3, '2026-08-10'))
    expect(r.ok).toBe(true)
  })

  it('recusa número de parcela repetido', () => {
    const r = normalizarParcelas(ID, 2000, [
      { numero: 1, valor: 1000, data_prevista: '2026-08-10' },
      { numero: 1, valor: 1000, data_prevista: '2026-09-10' },
    ])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toMatch(/repetida/)
  })

  it('recusa data em formato diferente de AAAA-MM-DD', () => {
    const r = normalizarParcelas(ID, 1000, [{ numero: 1, valor: 1000, data_prevista: '10/08/2026' }])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toMatch(/AAAA-MM-DD/)
  })

  it('recusa valor zero ou negativo', () => {
    expect(normalizarParcelas(ID, 1000, [{ numero: 1, valor: 0, data_prevista: '2026-08-10' }]).ok).toBe(false)
    expect(normalizarParcelas(ID, 1000, [{ numero: 1, valor: -5, data_prevista: '2026-08-10' }]).ok).toBe(false)
  })

  it('recusa lista vazia', () => {
    expect(normalizarParcelas(ID, 1000, []).ok).toBe(false)
  })

  it('parcela cancelada não entra na conferência da soma', () => {
    const r = normalizarParcelas(ID, 1000, [
      { numero: 1, valor: 1000, data_prevista: '2026-08-10' },
      { numero: 2, valor: 500, data_prevista: '2026-09-10', status: 'cancelada' },
    ])
    expect(r.ok).toBe(true)
  })

  it('devolve as parcelas ordenadas por número', () => {
    const r = normalizarParcelas(ID, 2000, [
      { numero: 2, valor: 1000, data_prevista: '2026-09-10' },
      { numero: 1, valor: 1000, data_prevista: '2026-08-10' },
    ])
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.inserts.map((p) => p.numero)).toEqual([1, 2])
  })

  it('recusa status inventado', () => {
    const r = normalizarParcelas(ID, 1000, [{ numero: 1, valor: 1000, data_prevista: '2026-08-10', status: 'quitada' }])
    expect(r.ok).toBe(false)
  })
})
