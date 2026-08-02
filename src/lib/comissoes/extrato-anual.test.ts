import { describe, expect, it } from 'vitest'
import { montarExtratoAnual, parteDoCorretor, type LinhaComissao } from './extrato-anual'

const linha = (over: Partial<LinhaComissao> = {}): LinhaComissao => ({
  id: 'c1', status: 'recebida', valor_comissao: 30_000,
  data_recebimento: '2026-03-10', data_venda: '2026-02-01',
  ...over,
})

describe('montarExtratoAnual', () => {
  it('aloca pelo mês do RECEBIMENTO, não da venda', () => {
    // Vendido em dezembro, pago em fevereiro: é receita de fevereiro do ano
    // seguinte. É a linha que mais fura declaração feita de memória.
    const e = montarExtratoAnual(
      [linha({ data_venda: '2025-12-20', data_recebimento: '2026-02-05' })],
      2026,
    )
    expect(e.meses[1].total).toBe(30_000)
    expect(e.meses[11].total).toBe(0)
  })

  it('só entra o que foi recebido — previsto e confirmado não são receita', () => {
    const e = montarExtratoAnual([
      linha({ id: 'a', status: 'prevista' }),
      linha({ id: 'b', status: 'confirmada' }),
      linha({ id: 'c', status: 'recebida' }),
    ], 2026)
    expect(e.quantidade).toBe(1)
    expect(e.total).toBe(30_000)
  })

  it('cancelada fica de fora', () => {
    const e = montarExtratoAnual([linha({ status: 'cancelada' })], 2026)
    expect(e.total).toBe(0)
  })

  it('ignora outros anos', () => {
    const e = montarExtratoAnual([
      linha({ id: 'a', data_recebimento: '2025-06-01' }),
      linha({ id: 'b', data_recebimento: '2026-06-01' }),
    ], 2026)
    expect(e.total).toBe(30_000)
    expect(e.anosDisponiveis).toEqual([2026, 2025])
  })

  it('recebida sem data não é chutada para nenhum mês', () => {
    const e = montarExtratoAnual([linha({ data_recebimento: null })], 2026)
    expect(e.total).toBe(0)
    expect(e.semDataRecebimento).toEqual({ quantidade: 1, total: 30_000 })
  })

  it('soma dos meses fecha com o total do ano', () => {
    const e = montarExtratoAnual([
      linha({ id: 'a', data_recebimento: '2026-01-15', valor_comissao: 10_000 }),
      linha({ id: 'b', data_recebimento: '2026-01-28', valor_comissao: 5_000 }),
      linha({ id: 'c', data_recebimento: '2026-07-02', valor_comissao: 20_000 }),
    ], 2026)
    expect(e.meses.reduce((s, m) => s + m.total, 0)).toBe(e.total)
    expect(e.total).toBe(35_000)
    expect(e.meses[0].quantidade).toBe(2)
  })

  it('sempre devolve os 12 meses, inclusive os zerados', () => {
    const e = montarExtratoAnual([linha()], 2026)
    expect(e.meses).toHaveLength(12)
    expect(e.meses[0].label).toBe('Janeiro')
  })
})

describe('parteDoCorretor', () => {
  it('sem divisão, a comissão inteira é dele', () => {
    expect(parteDoCorretor(linha(), 'eu')).toBe(30_000)
  })

  it('com divisão, só a fatia dele — o repasse não é receita própria', () => {
    // Declarar o bruto como receita inflaria a base de cálculo do imposto.
    const l = linha({
      participantes: [
        { corretor_id: 'eu', percentual: 60 },
        { corretor_id: null, percentual: 40 }, // imobiliária
      ],
    })
    expect(parteDoCorretor(l, 'eu')).toBe(18_000)
  })

  it('soma as várias linhas dele no mesmo negócio', () => {
    const l = linha({
      participantes: [
        { corretor_id: 'eu', percentual: 40 },
        { corretor_id: 'eu', percentual: 20 },
        { corretor_id: 'outro', percentual: 40 },
      ],
    })
    expect(parteDoCorretor(l, 'eu')).toBe(18_000)
  })

  it('sem saber quem é "eu", devolve o bruto em vez de zerar o extrato', () => {
    const l = linha({ participantes: [{ corretor_id: 'alguem', percentual: 100 }] })
    expect(parteDoCorretor(l, null)).toBe(30_000)
  })

  it('negócio em que ele não entrou dá zero para ele', () => {
    const l = linha({ participantes: [{ corretor_id: 'outro', percentual: 100 }] })
    expect(parteDoCorretor(l, 'eu')).toBe(0)
  })
})
