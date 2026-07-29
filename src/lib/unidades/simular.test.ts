import { describe, it, expect } from 'vitest'
import { faixaDeEntrada, planoDoJson, REFORCO_MAXIMO_EM_PARCELAS, simular, type PlanoPagamento } from './simular'

// Plano REAL da unidade 102 do Pineto (tabela Fontana, Julho/2026).
// Conferido contra o PDF: entrada + 40 parcelas + 4 reforços = 30% do total,
// e o saldo financiado é exatamente 70%.
const TOTAL_102 = 699242.88
const PLANO_102: PlanoPagamento = {
  entrada: 55939.43,
  parcelas_qtd: 40,
  parcela_valor: 2796.97,
  reforcos_qtd: 4,
  reforco_valor: 10488.64,
  saldo_financiamento: 489470.02,
  cub_quantidade: 224,
  percentual_ate_chaves: 30,
}

describe('simular — plano da tabela, sem o cliente mexer', () => {
  const s = simular(TOTAL_102, PLANO_102)!

  it('devolve exatamente a tabela da construtora', () => {
    expect(s.entrada).toBe(55939.43)
    expect(s.parcelasQtd).toBe(40)
    expect(s.parcelaValor).toBe(2796.97)
    expect(s.reforcosQtd).toBe(4)
    expect(s.reforcoValor).toBe(10488.64)
    expect(s.padraoDaTabela).toBe(true)
  })

  it('o total até as chaves fecha os 30% do contrato', () => {
    expect(s.ateAsChaves).toBeCloseTo(TOTAL_102 * 0.3, 0)
    expect(s.ateAsChavesPercentual).toBe(30)
  })

  it('a entrada da tabela é 8% — não os 20% do plano padrão dos guias', () => {
    expect(s.entradaPercentual).toBe(8)
  })

  it('o saldo financiado é 70% do total', () => {
    expect(s.saldoFinanciamento / s.valorTotal).toBeCloseTo(0.7, 4)
  })
})

describe('simular — cliente ajusta a entrada', () => {
  it('entrada maior derruba a parcela, sem mexer no preço', () => {
    const s = simular(TOTAL_102, PLANO_102, 100000)!
    expect(s.entrada).toBe(100000)
    expect(s.parcelaValor).toBeLessThan(PLANO_102.parcela_valor)
    expect(s.valorTotal).toBe(TOTAL_102)
    expect(s.padraoDaTabela).toBe(false)
  })

  it('a conta continua fechando: entrada + parcelas + reforços = mesmo montante', () => {
    const s = simular(TOTAL_102, PLANO_102, 100000)!
    const soma = s.entrada + s.parcelasQtd * s.parcelaValor + s.reforcosQtd * s.reforcoValor
    expect(soma).toBeCloseTo(s.ateAsChaves, 0)
  })

  it('o saldo financiado NÃO muda — a entrada só redistribui o que vem antes das chaves', () => {
    const padrao = simular(TOTAL_102, PLANO_102)!
    const maior = simular(TOTAL_102, PLANO_102, 150000)!
    expect(maior.saldoFinanciamento).toBe(padrao.saldoFinanciamento)
    expect(maior.ateAsChaves).toBe(padrao.ateAsChaves)
  })

  it('a QUANTIDADE de parcelas e reforços fica intacta — é estrutura do contrato', () => {
    const s = simular(TOTAL_102, PLANO_102, 120000)!
    expect(s.parcelasQtd).toBe(40)
    expect(s.reforcosQtd).toBe(4)
  })

  it('o VALOR do reforço acompanha a parcela, para não estourar o teto de 5x', () => {
    // Esta asserção antes exigia reforço fixo em 10.488,64 — era o bug:
    // com parcela de 1.195,46 aquilo dava 8,77x o limite contratual.
    const s = simular(TOTAL_102, PLANO_102, 120000)!
    expect(s.reforcoValor).toBeLessThan(PLANO_102.reforco_valor)
    expect(s.reforcoValor / s.parcelaValor).toBeCloseTo(3.75, 2)
  })

  it('entrada igual à da tabela é tratada como padrão, não como ajuste', () => {
    expect(simular(TOTAL_102, PLANO_102, 55939.43)!.padraoDaTabela).toBe(true)
  })
})

describe('simular — limites', () => {
  it('entrada negativa vira zero em vez de inflar a parcela', () => {
    const s = simular(TOTAL_102, PLANO_102, -50000)!
    expect(s.entrada).toBe(0)
    expect(s.parcelaValor).toBeGreaterThan(PLANO_102.parcela_valor)
  })

  it('entrada acima do necessário até as chaves é limitada ao teto', () => {
    const s = simular(TOTAL_102, PLANO_102, 999999)!
    expect(s.entrada).toBe(s.ateAsChaves)
    expect(s.parcelaValor).toBe(0)
  })

  it('quando os reforços já cobrem o restante, a parcela zera em vez de negativar', () => {
    const s = simular(TOTAL_102, PLANO_102, 200000)!
    expect(s.parcelaValor).toBeGreaterThanOrEqual(0)
  })

  it('total zero ou plano ausente devolve null', () => {
    expect(simular(0, PLANO_102)).toBeNull()
    expect(simular(TOTAL_102, null as unknown as PlanoPagamento)).toBeNull()
  })

  it('plano sem parcelas não divide por zero', () => {
    const s = simular(TOTAL_102, { ...PLANO_102, parcelas_qtd: 0 }, 60000)!
    expect(Number.isFinite(s.parcelaValor)).toBe(true)
  })
})

describe('faixaDeEntrada', () => {
  it('o mínimo é a entrada da tabela — nunca oferecer menos que a construtora dá', () => {
    expect(faixaDeEntrada(PLANO_102).min).toBe(55939.43)
  })

  it('o máximo para no montante até as chaves', () => {
    const f = faixaDeEntrada(PLANO_102)
    expect(f.max).toBeCloseTo(TOTAL_102 * 0.3, 0)
    expect(f.max).toBeGreaterThan(f.min)
  })

  it('passo de mil, para a conversa ser em número redondo', () => {
    expect(faixaDeEntrada(PLANO_102).passo).toBe(1000)
  })
})

describe('planoDoJson', () => {
  it('lê o jsonb como veio do banco', () => {
    const p = planoDoJson({ ...PLANO_102 })
    expect(p).toMatchObject({ entrada: 55939.43, parcelas_qtd: 40, cub_quantidade: 224 })
  })

  it('null, string ou objeto vazio devolvem null em vez de plano zerado', () => {
    expect(planoDoJson(null)).toBeNull()
    expect(planoDoJson('{}')).toBeNull()
    expect(planoDoJson({})).toBeNull()
  })

  it('plano sem entrada E sem parcela é lixo, não plano', () => {
    expect(planoDoJson({ entrada: 0, parcela_valor: 0, saldo_financiamento: 100 })).toBeNull()
  })

  it('campos faltando viram zero sem quebrar', () => {
    const p = planoDoJson({ entrada: 50000 })
    expect(p?.entrada).toBe(50000)
    expect(p?.parcelas_qtd).toBe(0)
    expect(p?.cub_quantidade).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────
// Teto do reforço: até 5× a parcela mensal.
//
// Regra da Fontana, documentada nos guias do próprio site ("cada reforço
// equivale a 5 vezes o valor da parcela mensal"). O Pineto opera em 3,75×.
//
// A primeira versão desta simulação mantinha o reforço FIXO e só derrubava a
// parcela — com entrada de R$ 120 mil na unidade 102 o reforço virava 8,77×
// da parcela, um plano que a construtora não assinaria.
// ─────────────────────────────────────────────────────────────────────
describe('simular — teto contratual do reforço', () => {
  it('o plano da tabela já respeita o teto (Pineto opera em 3,75x)', () => {
    const s = simular(TOTAL_102, PLANO_102)!
    expect(s.reforcoEmParcelas).toBe(3.75)
    expect(s.reforcoEmParcelas).toBeLessThanOrEqual(REFORCO_MAXIMO_EM_PARCELAS)
  })

  it('entrada alta NÃO estoura o teto — o bug que isso corrige', () => {
    const s = simular(TOTAL_102, PLANO_102, 120000)!
    expect(s.reforcoValor / s.parcelaValor).toBeLessThanOrEqual(REFORCO_MAXIMO_EM_PARCELAS)
    // Antes: reforço ficava em 10.488,64 com parcela de 1.195,46 → 8,77x.
    expect(s.reforcoValor).toBeLessThan(PLANO_102.reforco_valor)
  })

  it('parcela e reforço caem JUNTOS, preservando a proporção da tabela', () => {
    for (const entrada of [70000, 100000, 120000, 180000]) {
      const s = simular(TOTAL_102, PLANO_102, entrada)!
      expect(s.reforcoEmParcelas, `entrada ${entrada}`).toBeCloseTo(3.75, 2)
    }
  })

  it('a fórmula reproduz a própria tabela — prova de que o modelo está certo', () => {
    // Aplicando a redistribuição com a entrada DA TABELA, a parcela derivada
    // tem que bater com a parcela impressa no PDF.
    const s = simular(TOTAL_102, PLANO_102, PLANO_102.entrada + 0.02)!
    expect(s.padraoDaTabela).toBe(false) // forçou o caminho do recálculo
    expect(s.parcelaValor).toBeCloseTo(PLANO_102.parcela_valor, 1)
    expect(s.reforcoValor).toBeCloseTo(PLANO_102.reforco_valor, 1)
  })

  it('a conta continua fechando com os dois recalculados', () => {
    const s = simular(TOTAL_102, PLANO_102, 120000)!
    const soma = s.entrada + s.parcelasQtd * s.parcelaValor + s.reforcosQtd * s.reforcoValor
    expect(soma).toBeCloseTo(s.ateAsChaves, 0)
  })

  it('tabela com razão acima de 5 é GRAMPEADA no teto, não propagada', () => {
    // Plano hipotético fora da regra: reforço de 8x a parcela.
    const fora = { ...PLANO_102, parcela_valor: 1000, reforco_valor: 8000 }
    const s = simular(TOTAL_102, fora, 100000)!
    expect(s.reforcoEmParcelas).toBe(REFORCO_MAXIMO_EM_PARCELAS)
    expect(s.reforcoValor / s.parcelaValor).toBeCloseTo(5, 2)
  })

  it('plano sem reforço nenhum não quebra a divisão', () => {
    const semReforco = { ...PLANO_102, reforcos_qtd: 0, reforco_valor: 0 }
    const s = simular(TOTAL_102, semReforco, 100000)!
    expect(s.reforcoValor).toBe(0)
    expect(Number.isFinite(s.parcelaValor)).toBe(true)
    expect(s.entrada + s.parcelasQtd * s.parcelaValor).toBeCloseTo(s.ateAsChaves, 0)
  })
})
