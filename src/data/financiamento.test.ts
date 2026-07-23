import { describe, expect, it } from 'vitest'
import {
  simular,
  planos,
  resolverLinha,
  resolverSplit,
  tabelaCorbetta,
  tabelaGiassi,
  resolverLinhaPrice,
  construtoras,
  gerarMemoriaCalculo,
  fatorMensal,
  fatorReforco,
  TAXA_PADRAO_JS,
} from './financiamento'

// Slug real com entradaPct=0.20, mensais=72, reforcos=6, entrega='2026-12-31'
// (padrão obra — ver PADRAO_OBRA em financiamento.ts)
const SLUG_OBRA = 'mar-di-nizza-mar-grosso-laguna-sc'

describe('simular — casos-limite de entrada', () => {
  it('valor do imóvel = 0 retorna null', () => {
    expect(simular(SLUG_OBRA, 0)).toBeNull()
  })

  it('valor do imóvel negativo retorna null', () => {
    expect(simular(SLUG_OBRA, -1000)).toBeNull()
  })

  it('slug inexistente retorna null', () => {
    expect(simular('slug-que-nao-existe', 300000)).toBeNull()
  })

  it('entrada = 0 (via opções) zera a entrada e financia o valor cheio', () => {
    const sim = simular(SLUG_OBRA, 300000, { entradaPct: 0 })
    expect(sim).not.toBeNull()
    expect(sim!.parcelaA.entrada).toBe(0)
  })

  it('entrada = 100% do valor do imóvel → saldo financiado zero (mensal e reforço = 0)', () => {
    const sim = simular(SLUG_OBRA, 300000, { entradaPct: 1 })
    expect(sim).not.toBeNull()
    expect(sim!.parcelaA.entrada).toBe(300000)
    expect(sim!.parcelaA.valorMensal).toBe(0)
    expect(sim!.parcelaA.valorReforco).toBe(0)
  })

  it('prazo (mensais) = 0 não quebra — mensal e reforço ficam 0', () => {
    const sim = simular(SLUG_OBRA, 300000, { mensais: 0 })
    expect(sim).not.toBeNull()
    expect(sim!.parcelaA.qtdMensais).toBe(0)
    expect(sim!.parcelaA.valorMensal).toBe(0)
  })

  it('prazo (mensais) negativo não quebra — trata como "sem mensais"', () => {
    const sim = simular(SLUG_OBRA, 300000, { mensais: -12 })
    expect(sim).not.toBeNull()
    expect(sim!.parcelaA.valorMensal).toBe(0)
    expect(Number.isFinite(sim!.parcelaA.valorMensal)).toBe(true)
  })

  it('prazo (mensais) = NaN não quebra — não lança exceção e retorna número finito', () => {
    const sim = simular(SLUG_OBRA, 300000, { mensais: NaN })
    expect(sim).not.toBeNull()
    expect(sim!.parcelaA.valorMensal).toBe(0)
    expect(Number.isNaN(sim!.parcelaA.valorMensal)).toBe(false)
  })
})

describe('simular — datas de entrega passadas ou muito próximas', () => {
  it('entrega já passada (hoje depois da entrega) trunca prazo e reforços para 0 e avisa', () => {
    const hoje = new Date('2027-06-15') // depois de 2026-12-31
    const sim = simular(SLUG_OBRA, 300000, {}, 'igpm', hoje)
    expect(sim).not.toBeNull()
    expect(sim!.parcelaA.qtdMensais).toBe(0)
    expect(sim!.parcelaA.qtdReforcos).toBe(0)
    expect(sim!.avisos.some(a => a.startsWith('Prazo reduzido'))).toBe(true)
  })

  it('entrega muito próxima (1 mês) trunca prazo para os meses restantes', () => {
    const hoje = new Date('2026-11-30') // 1 mês antes de 2026-12-31
    const sim = simular(SLUG_OBRA, 300000, {}, 'igpm', hoje)
    expect(sim).not.toBeNull()
    expect(sim!.parcelaA.qtdMensais).toBeLessThanOrEqual(1)
    expect(sim!.parcelaA.qtdReforcos).toBe(0) // menos de 1 ano completo até a entrega
  })

  it('entrega distante no futuro (hoje bem antes) NÃO trunca — usa o prazo padrão do plano', () => {
    const hoje = new Date('2020-01-01')
    const sim = simular(SLUG_OBRA, 300000, {}, 'igpm', hoje)
    expect(sim).not.toBeNull()
    expect(sim!.parcelaA.qtdMensais).toBe(planos[SLUG_OBRA].mensais)
    expect(sim!.parcelaA.qtdReforcos).toBe(planos[SLUG_OBRA].reforcos)
    expect(sim!.avisos.some(a => a.startsWith('Prazo reduzido'))).toBe(false)
  })
})

describe('simular — reforços: total do contrato, não recalculado por ano', () => {
  it('qtdReforcos retornado é o total configurado no plano (passthrough), não uma cadência recalculada', () => {
    const hoje = new Date('2020-01-01') // bem antes da entrega — sem truncamento
    const sim = simular(SLUG_OBRA, 300000, {}, 'igpm', hoje)
    expect(sim!.parcelaA.qtdReforcos).toBe(planos[SLUG_OBRA].reforcos) // 6 (PADRAO_OBRA)
  })

  it('opcoes.reforcos sobrescreve o total do plano diretamente (sem recálculo)', () => {
    const hoje = new Date('2020-01-01')
    const sim = simular(SLUG_OBRA, 300000, { reforcos: 3 }, 'igpm', hoje)
    expect(sim!.parcelaA.qtdReforcos).toBe(3)
  })
})

describe('simular — diferentes taxas / sistemas entre construtoras', () => {
  it('Fontana (SPC-JS, 0,75% a.m. simples) e Giassi (Price, 9,5% a.a. compostos) produzem parcelas diferentes para o mesmo saldo/prazo', () => {
    const saldo = 200000
    const prazo = 120
    const fontana = resolverLinha(saldo, prazo, 'sem_reforco', construtoras.fontana.taxaMensal)
    const giassi = resolverLinhaPrice(saldo, prazo, construtoras.giassi.taxaMensal)

    expect(construtoras.fontana.taxaMensal).toBeCloseTo(0.0075, 6)
    expect(construtoras.giassi.taxaMensal).toBeCloseTo(Math.pow(1.095, 1 / 12) - 1, 10)
    expect(fontana.mensal).not.toBeCloseTo(giassi.mensal, 2)
  })

  it('tabelaGiassi nunca tem reforço (qtdReforcos e reforcoAnual sempre 0)', () => {
    const tabela = tabelaGiassi(100000)
    for (const row of tabela) {
      expect(row.semReforco.qtdReforcos).toBe(0)
      expect(row.semReforco.reforcoAnual).toBe(0)
      expect(row.mensalFixa).toBeNull()
      expect(row.reforcoFixo).toBeNull()
    }
  })
})

describe('tabelaCorbetta — prazos de 12 a 240 meses', () => {
  const saldo = 150000
  const prazosEsperados = [12, 24, 120, 180, 240]

  it('contém exatamente 20 linhas, de 12 em 12 meses até 240', () => {
    const tabela = tabelaCorbetta(saldo)
    expect(tabela).toHaveLength(20)
    expect(tabela[0].prazoMeses).toBe(12)
    expect(tabela[19].prazoMeses).toBe(240)
  })

  it.each(prazosEsperados)('prazo de %i meses gera mensal positiva e totalPago > saldo (juros embutidos > 0)', (prazo) => {
    const linha = resolverLinha(saldo, prazo, 'sem_reforco', TAXA_PADRAO_JS)
    expect(linha.mensal).toBeGreaterThan(0)
    expect(linha.totalPago).toBeGreaterThan(saldo)
    expect(linha.jurosEmbutidos).toBeGreaterThan(0)
  })
})

describe('resolverSplit — oráculo validado (comentário financiamento.ts:157)', () => {
  // "Validado: saldo=72077.75, prazo=12, proporcao=0.715 → mensal≈4501,86 / reforço≈22.391"
  // Recalculado precisamente a partir da própria fórmula (fonte de verdade):
  // mensal = 4501.2497... / reforço = 22390.9530... — a menos de R$0,61 e R$0,05
  // do valor aproximado ("≈") do comentário, respectivamente. Tolerância abaixo
  // reflete isso: valor exato como oráculo primário, comentário como checagem
  // de sanidade solta (diferenças de poucos reais são esperadas do "≈").
  it('reproduz exatamente o cenário comentado e bate com os valores de referência', () => {
    const linha = resolverSplit(72077.75, 12, 0.715)
    expect(linha.mensal).toBeCloseTo(4501.2497, 3)
    expect(linha.reforcoAnual).toBeCloseTo(22390.953, 2)
    expect(linha.qtdReforcos).toBe(1)
    // sanidade solta contra o valor aproximado citado no comentário do código
    expect(Math.abs(linha.mensal - 4501.86)).toBeLessThan(1)
    expect(Math.abs(linha.reforcoAnual - 22391)).toBeLessThan(1)
  })
})

describe('arredondamento monetário — consistência entre parcelas e saldo', () => {
  it('a soma das parcelas (arredondadas a centavos) bate com o totalPago dentro de poucos centavos', () => {
    const linha = resolverSplit(72077.75, 12, 0.715)
    const mensalCentavos = Math.round(linha.mensal * 100) / 100
    const reforcoCentavos = Math.round(linha.reforcoAnual * 100) / 100
    const totalArredondado = mensalCentavos * 12 + reforcoCentavos * linha.qtdReforcos
    // Tolerância de poucos centavos por conta do arredondamento de 12 parcelas + 1 reforço
    expect(Math.abs(totalArredondado - linha.totalPago)).toBeLessThan(0.2)
  })

  it('resolverLinha "maximo" (reforço = 5x mensal) mantém a soma nominal consistente com totalPago', () => {
    const linha = resolverLinha(72077.75, 24, 'maximo', TAXA_PADRAO_JS)
    expect(linha.reforcoAnual).toBeCloseTo(linha.mensal * 5, 6)
    const somaNominal = linha.mensal * linha.prazoMeses + linha.reforcoAnual * linha.qtdReforcos
    expect(somaNominal).toBeCloseTo(linha.totalPago, 6)
  })
})

describe('gerarMemoriaCalculo — cronograma mês a mês da Parcela A', () => {
  it('qtdMensais = 0 retorna array vazio', () => {
    expect(gerarMemoriaCalculo(100000, 0, 0, 0, 0)).toEqual([])
  })

  it('qtdMensais negativo ou NaN retorna array vazio (sem lançar erro)', () => {
    expect(gerarMemoriaCalculo(100000, -5, 1000, 0, 0)).toEqual([])
    expect(gerarMemoriaCalculo(100000, NaN, 1000, 0, 0)).toEqual([])
  })

  it('gera uma linha por mês, com reforço marcado exatamente nos múltiplos de 12 até qtdReforcos', () => {
    const linhas = gerarMemoriaCalculo(72077.75, 24, 4501.25, 2, 22390.95)
    expect(linhas).toHaveLength(24)
    expect(linhas[11].mes).toBe(12)
    expect(linhas[11].isReforco).toBe(true)
    expect(linhas[11].valorReforco).toBeCloseTo(22390.95, 2)
    expect(linhas[23].isReforco).toBe(true)
    // meses que não são múltiplos de 12 não têm reforço
    expect(linhas[0].isReforco).toBe(false)
    expect(linhas[10].isReforco).toBe(false)
  })

  it('saldo devedor estimado decresce mês a mês e nunca fica negativo (nominal, não descontado)', () => {
    const linhas = gerarMemoriaCalculo(50000, 12, 4501.25, 0, 0)
    for (let i = 1; i < linhas.length; i++) {
      expect(linhas[i].saldoDevedorEstimado).toBeLessThanOrEqual(linhas[i - 1].saldoDevedorEstimado)
    }
    expect(linhas[linhas.length - 1].saldoDevedorEstimado).toBeGreaterThanOrEqual(0)
  })
})

describe('fatorMensal / fatorReforco — sanidade das funções de valor presente', () => {
  it('fatorMensal(0) = 0 (nenhum termo no somatório)', () => {
    expect(fatorMensal(0)).toBe(0)
  })

  it('fatorReforco(0) = 0 (nenhum reforço)', () => {
    expect(fatorReforco(0)).toBe(0)
  })

  it('fatorMensal é sempre menor que n (cada termo é < 1 para i > 0)', () => {
    expect(fatorMensal(120, TAXA_PADRAO_JS)).toBeLessThan(120)
  })
})
