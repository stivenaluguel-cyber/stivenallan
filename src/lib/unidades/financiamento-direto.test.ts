import { describe, expect, it } from 'vitest'
import {
  lerPoliticaFinanciamento, parcelaDireta, parcelaDiretaComReforcos,
  prazosSugeridos, reforcoMaximo, reforcoMaximoContratual, lerOpcoesDePagamento,
  planoDaOpcao, mesesAteAEntrega, distribuirAteAsChaves,
} from './financiamento-direto'

// Rodapé real da tabela do Avezzano, julho/2026.
const RODAPE = `Observações:
1) POLITICA COMERCIAL:
OPÇÃO 01: FINANCIAMENTO BANCÁRIO
OPÇÃO 02: O SALDO DEVEDOR PODERÁ SER PARCELADO DIRETO COM A CONSTRUTORA EM ATÉ 240 MESES, SENDO CORRIGIDO PELO IGPM E ACRESCIDO DE JUROS COMPENSATÓRIOS DE 0,75% A.M;
2) O vencimento das parcelas e reforços ocorrerão nos dias 10, 15, 20, 25 e 27 de cada mês.`

describe('lerPoliticaFinanciamento', () => {
  it('lê prazo, juros e índice do rodapé real', () => {
    const p = lerPoliticaFinanciamento(RODAPE)!
    expect(p.meses).toBe(240)
    expect(p.jurosAoMes).toBeCloseTo(0.0075, 6)
    expect(p.indice).toBe('IGPM')
  })

  it('sobrevive à quebra de linha do PDF', () => {
    const quebrado = RODAPE.replace('EM ATÉ 240 MESES', 'EM ATÉ\n240\nMESES')
    expect(lerPoliticaFinanciamento(quebrado)?.meses).toBe(240)
  })

  it('tabela sem parcelamento direto devolve null, em vez de inventar', () => {
    // Melhor não oferecer do que oferecer condição que a construtora não escreveu.
    expect(lerPoliticaFinanciamento('Observações: 1) Financiamento bancário.')).toBeNull()
    expect(lerPoliticaFinanciamento('')).toBeNull()
  })

  it('recusa juros absurdos — é erro de leitura, não condição', () => {
    expect(lerPoliticaFinanciamento(RODAPE.replace('0,75%', '75%'))).toBeNull()
  })

  it('aceita ponto no lugar da vírgula', () => {
    expect(lerPoliticaFinanciamento(RODAPE.replace('0,75', '0.75'))?.jurosAoMes).toBeCloseTo(0.0075, 6)
  })
})

describe('parcelaDireta', () => {
  // Unidade 101 do Avezzano: saldo de R$ 886.227,92 depois da entrada de 15%.
  const SALDO = 886227.92

  it('calcula a Price de 240x a 0,75% a.m.', () => {
    const p = parcelaDireta(SALDO, 240, 0.0075)!
    expect(p.valor).toBeCloseTo(7973.71, 0)
    expect(p.meses).toBe(240)
  })

  it('prazo menor encarece a parcela e barateia o total', () => {
    const curto = parcelaDireta(SALDO, 120, 0.0075)!
    const longo = parcelaDireta(SALDO, 240, 0.0075)!
    expect(curto.valor).toBeGreaterThan(longo.valor)
    expect(curto.totalPago).toBeLessThan(longo.totalPago)
  })

  it('os juros são o que se paga além do saldo', () => {
    const p = parcelaDireta(SALDO, 240, 0.0075)!
    expect(p.juros).toBeCloseTo(p.totalPago - SALDO, 2)
    expect(p.juros).toBeGreaterThan(0)
  })

  it('juros zero é divisão simples, sem dividir por zero', () => {
    const p = parcelaDireta(120000, 12, 0)!
    expect(p.valor).toBe(10000)
    expect(p.juros).toBe(0)
  })

  it('entrada inválida devolve null em vez de NaN na tela', () => {
    expect(parcelaDireta(0, 240, 0.0075)).toBeNull()
    expect(parcelaDireta(-1, 240, 0.0075)).toBeNull()
    expect(parcelaDireta(SALDO, 0, 0.0075)).toBeNull()
    expect(parcelaDireta(SALDO, 240, Number.NaN)).toBeNull()
  })
})

describe('prazosSugeridos', () => {
  it('nunca oferece acima do teto do contrato', () => {
    expect(prazosSugeridos(240)).toEqual([60, 120, 180, 240])
    expect(prazosSugeridos(180)).toEqual([60, 120, 180])
  })

  it('teto curto ainda devolve algo utilizável', () => {
    expect(prazosSugeridos(60)).toEqual([60])
    expect(prazosSugeridos(36)).toEqual([])
  })
})

describe('parcelaDiretaComReforcos', () => {
  const SALDO = 886227.92 // unidade 101 do Avezzano

  it('sem reforço, é idêntico ao cálculo simples', () => {
    const a = parcelaDiretaComReforcos(SALDO, 240, 0.0075, 0)!
    const b = parcelaDireta(SALDO, 240, 0.0075)!
    expect(a.valor).toBeCloseTo(b.valor, 2)
    expect(a.reforcoValor).toBe(0)
  })

  it('reforço anual derruba a mensal', () => {
    const sem = parcelaDiretaComReforcos(SALDO, 240, 0.0075, 0)!
    const com = parcelaDiretaComReforcos(SALDO, 240, 0.0075, 20000)!
    expect(com.valor).toBeLessThan(sem.valor)
    expect(com.reforcosQtd).toBe(20) // 240 meses = 20 reforços anuais
  })

  it('o plano fecha: parcelas + reforços trazidos a valor presente = saldo', () => {
    const i = 0.0075, n = 240, R = 20000
    const p = parcelaDiretaComReforcos(SALDO, n, i, R)!
    let vp = 0
    for (let m = 1; m <= n; m++) {
      vp += p.valor / Math.pow(1 + i, m)
      if (m % 12 === 0) vp += p.reforcoValor / Math.pow(1 + i, m)
    }
    expect(vp).toBeCloseTo(SALDO, 0)
  })

  it('reforço grande demais é limitado, e a mensal nunca fica negativa', () => {
    // Sem o teto, um reforço absurdo viraria parcela negativa — desconto na
    // tela em vez de plano impossível.
    const p = parcelaDiretaComReforcos(SALDO, 240, 0.0075, 10_000_000)!
    expect(p.valor).toBeGreaterThanOrEqual(0)
    expect(p.reforcoValor).toBeLessThanOrEqual(reforcoMaximo(SALDO, 240, 0.0075) + 1)
  })

  it('prazo menor que um ano não tem reforço para dar', () => {
    const p = parcelaDiretaComReforcos(120000, 6, 0.0075, 5000)!
    expect(p.reforcosQtd).toBe(0)
    expect(p.reforcoValor).toBe(0)
  })

  it('entrada inválida devolve null', () => {
    expect(parcelaDiretaComReforcos(0, 240, 0.0075, 1000)).toBeNull()
    expect(parcelaDiretaComReforcos(SALDO, 240, 0.0075, -5)).toBeNull()
  })
})

describe('lerOpcoesDePagamento', () => {
  it('lê as duas opções do Avezzano, com o direto na frente', () => {
    const o = lerOpcoesDePagamento(RODAPE)
    expect(o).toHaveLength(2)
    // O financiamento direto é o diferencial da casa: aparece primeiro.
    expect(o[0].tipo).toBe('direto')
    expect(o[0].meses).toBe(240)
    expect(o[0].jurosAoMes).toBeCloseTo(0.0075, 6)
    // Mas o bancário nunca some: quem já tem crédito aprovado precisa ver.
    expect(o[1].tipo).toBe('bancario')
  })

  it('guarda o texto como a construtora escreveu', () => {
    const o = lerOpcoesDePagamento(RODAPE)
    expect(o.find(x => x.tipo === 'bancario')!.descricao).toMatch(/FINANCIAMENTO BANC/i)
  })

  it('desconto à vista entra mesmo fora da lista de opções', () => {
    const t = RODAPE + ' 3) DESCONTO DE 12% PARA PAGAMENTO À VISTA.'
    const o = lerOpcoesDePagamento(t)
    const av = o.find(x => x.tipo === 'a_vista')!
    expect(av.descontoPct).toBe(12)
  })

  it('tabela sem política devolve lista vazia, não uma opção inventada', () => {
    expect(lerOpcoesDePagamento('Observações: 1) Tabela sujeita a alteração.')).toEqual([])
  })

  it('não classifica como direto o que não menciona a construtora', () => {
    const t = 'OPÇÃO 01: PARCELADO EM ATÉ 240 MESES COM JUROS DE 0,75% A.M PELO BANCO;'
    expect(lerOpcoesDePagamento(t)[0].tipo).toBe('bancario')
  })
})

// ─────────────────────────────────────────────────────────────────────
// Prova de que o reforço também paga juros.
//
// O extrato mês a mês é a verificação que não deixa dúvida: se o reforço
// entrasse "por fora", sem incidência de juros, o saldo não zeraria no último
// mês — sobraria ou faltaria dinheiro.
// ─────────────────────────────────────────────────────────────────────
describe('extrato de amortização', () => {
  const SALDO = 886227.92
  const I = 0.0075

  function simularExtrato(n: number, reforcoAnual: number) {
    const p = parcelaDiretaComReforcos(SALDO, n, I, reforcoAnual)!
    let saldo = SALDO
    let jurosAcumulado = 0
    for (let m = 1; m <= n; m++) {
      const juros = saldo * I          // juros do mês sobre o saldo devedor
      jurosAcumulado += juros
      saldo = saldo + juros - p.valor  // a parcela abate depois dos juros
      if (m % 12 === 0) saldo -= p.reforcoValor // e o reforço, no aniversário
    }
    return { saldoFinal: saldo, jurosAcumulado, p }
  }

  // A parcela é arredondada em centavos, e 240 pagamentos acumulam essa
  // sobra: até 1 centavo por parcela. Exigir zero absoluto seria exigir que a
  // construtora cobrasse fração de centavo.
  const residuoAceitavel = (n: number) => n * 0.01

  it('240x sem reforço: o saldo zera no último mês', () => {
    const { saldoFinal } = simularExtrato(240, 0)
    expect(Math.abs(saldoFinal)).toBeLessThan(residuoAceitavel(240))
  })

  it('240x com reforço de 20 mil: o saldo também zera', () => {
    // Se o reforço entrasse "por fora", sem juros, sobraria saldo aqui — muito
    // acima do resíduo de centavos.
    const { saldoFinal } = simularExtrato(240, 20000)
    expect(Math.abs(saldoFinal)).toBeLessThan(residuoAceitavel(240))
  })

  it('reforço sem juros deixaria saldo — é o que este modelo evita', () => {
    // Controle: se o plano fosse montado ignorando que o reforço rende juros,
    // o erro seria de dezenas de milhares, não de centavos.
    const p = parcelaDiretaComReforcos(SALDO, 240, I, 20000)!
    const ingenuo = (SALDO - 20 * p.reforcoValor) * I / (1 - Math.pow(1 + I, -240))
    expect(Math.abs(ingenuo - p.valor)).toBeGreaterThan(500)
  })

  it('o reforço derruba a mensal, mas o total nominal sobe — não é almoço grátis', () => {
    // Contraintuitivo e importante: os dois planos têm o MESMO valor presente
    // (ambos quitam o saldo a 0,75%), mas o do reforço concentra dinheiro uma
    // vez por ano em vez de espalhar pelos 12 meses. Dinheiro que entra mais
    // tarde soma mais em valor nominal.
    //
    // A tela precisa dizer isso: quem escolhe reforço para aliviar o mês não
    // pode ser levado a acreditar que está pagando menos no fim.
    const sem = simularExtrato(240, 0)
    const com = simularExtrato(240, 20000)
    expect(com.p.valor).toBeLessThan(sem.p.valor)
    expect(com.p.totalPago).toBeGreaterThan(sem.p.totalPago)
    expect(com.jurosAcumulado).toBeGreaterThan(sem.jurosAcumulado)
  })

  it('vale para outros prazos e valores de reforço', () => {
    for (const n of [60, 120, 180]) {
      for (const r of [0, 5000, 30000]) {
        expect(Math.abs(simularExtrato(n, r).saldoFinal)).toBeLessThan(residuoAceitavel(n))
      }
    }
  })
})

// ─────────────────────────────────────────────────────────────────────
// Teto contratual do reforço no saldo parcelado.
//
// Mesma regra que já limita o simulador de entrada: o reforço vai até 5x a
// parcela mensal. Sem isso, o slider oferecia R$ 50 mil com parcela de
// R$ 3.976 — 12,6x, um plano que a construtora não assina.
// ─────────────────────────────────────────────────────────────────────
describe('reforcoMaximoContratual', () => {
  const SALDO = 886227.92
  const I = 0.0075

  it('o teto respeita exatamente o múltiplo pedido', () => {
    const teto = reforcoMaximoContratual(SALDO, 240, I, 5)
    const p = parcelaDiretaComReforcos(SALDO, 240, I, teto)!
    expect(p.reforcoEmParcelas).toBeLessThanOrEqual(5)
    expect(p.reforcoEmParcelas).toBeGreaterThan(4.5)
  })

  it('um passo além do teto já estoura a regra', () => {
    const teto = reforcoMaximoContratual(SALDO, 240, I, 5)
    const p = parcelaDiretaComReforcos(SALDO, 240, I, teto + 5000)!
    expect(p.reforcoEmParcelas).toBeGreaterThan(5)
  })

  it('é bem menor que o limite matemático', () => {
    // O limite matemático é o que zera a mensal; o contratual para muito antes.
    expect(reforcoMaximoContratual(SALDO, 240, I, 5))
      .toBeLessThan(reforcoMaximo(SALDO, 240, I))
  })

  it('múltiplo menor aperta mais', () => {
    const a = reforcoMaximoContratual(SALDO, 240, I, 3.75)
    const b = reforcoMaximoContratual(SALDO, 240, I, 5)
    expect(a).toBeLessThan(b)
    const p = parcelaDiretaComReforcos(SALDO, 240, I, a)!
    expect(p.reforcoEmParcelas).toBeLessThanOrEqual(3.75)
  })

  it('vale para qualquer prazo com pelo menos um reforço', () => {
    for (const n of [60, 120, 180, 240]) {
      const teto = reforcoMaximoContratual(SALDO, n, I, 5)
      const p = parcelaDiretaComReforcos(SALDO, n, I, teto)!
      expect(p.reforcoEmParcelas).toBeLessThanOrEqual(5)
    }
  })

  it('prazo sem reforço nenhum devolve zero', () => {
    expect(reforcoMaximoContratual(SALDO, 6, I, 5)).toBe(0)
    expect(reforcoMaximoContratual(0, 240, I, 5)).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────
// Opção comercial completa — texto real da opção 2 do Tremezzo.
//
// Não é "financiamento direto do saldo": é outro negócio. Desconto de 10%,
// 40% até as chaves em vez dos 100% da tabela, ato mínimo de 10% e o saldo em
// 180 meses. Sem modelar isso, a página mostraria só o plano da tabela e
// esconderia num parágrafo a condição que costuma ser a melhor do PDF.
// ─────────────────────────────────────────────────────────────────────
const TREMEZZO_POLITICA = `6) POLITICA COMERCIAL:
OPÇÃO 1: SERÁ CONCEDIDO DESCONTO DE 15% PARA PAGAMENTO À VISTA, SEM PERMUTA.
OPÇÃO 2: SERÁ CONCEDIDO DESCONTO DE 10% SOBRE O VALOR TOTAL, PAGANDO 40% ATÉ AS CHAVES, COM ATO MÍNIMO DE 10% DO VALOR DA VENDA. APÓS A CONCLUSÃO DO EMPREENDIMENTO, O SALDO DEVEDOR DEVERÁ SER QUITADO VIA FINANCIAMENTO BANCÁRIO OU DIRETO COM A CONSTRUTORA EM ATÉ 180 MESES, SENDO CORRIGIDO PELO IGPM E ACRESCIDO DE JUROS COMPENSATÓRIOS DE 0,75% a.m. ( NESSA OPÇÃO NÃO SERÁ ACEITO PERMUTA).`

describe('opção comercial com desconto e percentual até as chaves', () => {
  const ops = lerOpcoesDePagamento(TREMEZZO_POLITICA)
  const direto = ops.find(o => o.tipo === 'direto')!
  const aVista = ops.find(o => o.tipo === 'a_vista')!

  it('lê os quatro números da opção 2', () => {
    expect(direto.descontoPct).toBe(10)
    expect(direto.ateAsChavesPct).toBe(40)
    expect(direto.atoMinimoPct).toBe(10)
    expect(direto.meses).toBe(180)
  })

  it('registra que a opção não aceita permuta', () => {
    expect(direto.aceitaPermuta).toBe(false)
  })

  it('a opção 1 é o desconto à vista de 15%', () => {
    expect(aVista.descontoPct).toBe(15)
  })

  it('traduz a opção em dinheiro para a unidade', () => {
    // Unidade 102 do Tremezzo: R$ 1.329.810,12.
    const p = planoDaOpcao(1329810.12, direto)!
    expect(p.valorComDesconto).toBeCloseTo(1196829.11, 2)
    expect(p.descontoEmReais).toBeCloseTo(132981.01, 2)
    expect(p.ateAsChaves).toBeCloseTo(478731.64, 2)
    expect(p.ato).toBeCloseTo(119682.91, 2)
    expect(p.saldo).toBeCloseTo(718097.47, 2)
  })

  it('as partes somam o valor com desconto', () => {
    const p = planoDaOpcao(1329810.12, direto)!
    expect(p.ateAsChaves + p.saldo).toBeCloseTo(p.valorComDesconto, 2)
  })

  it('opção sem números não vira plano inventado', () => {
    expect(planoDaOpcao(1000000, { tipo: 'bancario', descricao: 'FINANCIAMENTO BANCÁRIO' })).toBeNull()
    expect(planoDaOpcao(0, direto)).toBeNull()
  })

  it('opção só com desconto trata 100% até as chaves', () => {
    const p = planoDaOpcao(1000000, aVista)!
    expect(p.valorComDesconto).toBe(850000)
    expect(p.ateAsChaves).toBe(850000)
    expect(p.saldo).toBe(0)
  })
})

describe('juros escritos por extenso — "ao mês"', () => {
  // Bellante (julho/2026). A mesma condição do Calliano, escrita de outro
  // jeito: "juros compensatórios de 0,75% ao mês" em vez de "0,75% A.M". A
  // política voltava null inteira, e o parcelamento em 240x direto com a
  // construtora sumia da tela — sobrava só o financiamento bancário.
  const BELLANTE = `2) Até a entrega de conclusão do empreendimento, 30% do valor do mesmo deverá estar quitado, sendo que o restante deverá ser liquidado mediante financiamento bancário ou em até 240 meses, diretamente com a construtora. Os valores remanescentes serão corrigidos pelo IGPM e acrescidos de juros compensatórios de 0,75% ao mês.`

  it('lê prazo, juros e índice na grafia por extenso', () => {
    expect(lerPoliticaFinanciamento(BELLANTE)).toEqual({
      meses: 240,
      jurosAoMes: 0.0075,
      indice: 'IGPM',
    })
  })

  it('continua lendo a grafia abreviada', () => {
    const calliano = 'O SALDO DEVEDOR PODERÁ SER PARCELADO DIRETO COM A CONSTRUTORA EM ATÉ 180 MESES, SENDO CORRIGIDO PELO IGPM E ACRESCIDO DE JUROS COMPENSATÓRIOS DE 0,75% A.M;'
    expect(lerPoliticaFinanciamento(calliano)).toEqual({
      meses: 180,
      jurosAoMes: 0.0075,
      indice: 'IGPM',
    })
  })

  it('tabela que não fala de parcelamento direto continua devolvendo null', () => {
    expect(lerPoliticaFinanciamento('OPÇÃO 01: FINANCIAMENTO BANCÁRIO')).toBeNull()
  })
})

describe('a descrição da opção termina onde a condição termina', () => {
  // Rodapé REAL do Tremezzo (julho/2026). A opção 2 é a última da lista e não
  // termina em ";" — o bloco corria até o fim do texto e a `descricao` gravada
  // no plano_pagamento levava junto legendas, "Nº DORMITÓRIOS" e a hora da
  // emissão do PDF. É o texto que o corretor lê para repetir a condição.
  const RODAPE_TREMEZZO = `6) POLÍTICA COMERCIAL: OPÇÃO 1: SERÁ CONCEDIDO DESCONTO DE 15% PARA PAGAMENTO À VISTA, SEM PERMUTA; OPÇÃO 2: SERÁ CONCEDIDO DESCONTO DE 10% SOBRE O VALOR TOTAL, PAGANDO 40% ATÉ AS CHAVES, COM ATO MÍNIMO DE 10% DO VALOR DA VENDA. APÓS A CONCLUSÃO DO EMPREENDIMENTO, O SALDO DEVEDOR DEVERÁ SER QUITADO VIA FINANCIAMENTO BANCÁRIO OU DIRETO COM A CONSTRUTORA EM ATÉ 180 MESES, SENDO CORRIGIDO PELO IGPM E ACRESCIDO DE JUROS COMPENSATÓRIOS DE 0,75% a.m. ( NESSA OPÇÃO NÃO SERÁ ACEITO PERMUTA). LEGENDAS: 1º Pav - 1º Pavimento T - Térreo SS - Subsolo S - Simples SE - Simples Estendido D - Duplo DE - Duplo Estendido Nº DORMITÓRIOS UNIDADES 03 Dormitórios ( 1 Suíte) Data emissão: 01/07/2026 16:36:28`

  const opcoes = lerOpcoesDePagamento(RODAPE_TREMEZZO)
  const direto = opcoes.find(o => o.tipo === 'direto')!

  it('corta em LEGENDAS e não leva o rodapé gráfico junto', () => {
    expect(direto.descricao).not.toMatch(/LEGENDAS/i)
    expect(direto.descricao).not.toMatch(/DORMIT[ÓO]RIOS/i)
    expect(direto.descricao).not.toMatch(/Data emiss/i)
    expect(direto.descricao).not.toMatch(/1º Pavimento/i)
  })

  it('mantém a condição inteira, até a ressalva da permuta', () => {
    expect(direto.descricao).toMatch(/^SERÁ CONCEDIDO DESCONTO DE 10%/)
    expect(direto.descricao).toMatch(/NÃO SERÁ ACEITO PERMUTA\)$/)
  })

  it('os números da opção continuam saindo certos', () => {
    expect(direto).toMatchObject({
      meses: 180, jurosAoMes: 0.0075, indice: 'IGPM',
      descontoPct: 10, ateAsChavesPct: 40, atoMinimoPct: 10, aceitaPermuta: false,
    })
    expect(opcoes.find(o => o.tipo === 'a_vista')?.descontoPct).toBe(15)
  })

  it('corta também quando o rodapé começa por VISITE NOSSO SITE', () => {
    const t = 'OPÇÃO 02: O SALDO DEVEDOR PODERÁ SER PARCELADO DIRETO COM A CONSTRUTORA EM ATÉ 180 MESES, SENDO CORRIGIDO PELO IGPM E ACRESCIDO DE JUROS COMPENSATÓRIOS DE 0,75% A.M VISITE NOSSO SITE www.estilofontana.com.br'
    expect(lerOpcoesDePagamento(t)[0].descricao).not.toMatch(/VISITE|estilofontana/i)
  })
})

describe('como pagar o "até as chaves"', () => {
  const HOJE = new Date(2026, 6, 30) // 30/07/2026

  it('conta os meses cheios até a entrega', () => {
    expect(mesesAteAEntrega('31/03/2027', HOJE)).toBe(8)
    expect(mesesAteAEntrega('30/09/2026', HOJE)).toBe(2)
  })

  it('entrega no passado ou data ausente não vira parcelamento', () => {
    expect(mesesAteAEntrega('31/03/2026', HOJE)).toBeNull()
    expect(mesesAteAEntrega(null, HOJE)).toBeNull()
    expect(mesesAteAEntrega('', HOJE)).toBeNull()
    expect(mesesAteAEntrega('marco/2027', HOJE)).toBeNull()
  })

  it('divide o que sobra depois do ato pelos meses que faltam', () => {
    // Tremezzo 102, opção 2: total 1.329.810,12 → −10% = 1.196.829,11.
    // 40% até as chaves = 478.731,64, ato mínimo 10% = 119.682,91.
    const r = distribuirAteAsChaves(478731.64, 119682.91, 8)!
    expect(r.ato).toBe(119682.91)
    expect(r.restante).toBe(359048.73)
    expect(r.meses).toBe(8)
    expect(r.parcela).toBeCloseTo(44881.09, 2)
    // A conta tem que fechar: ato + as mensais devolvem o até-as-chaves.
    expect(r.ato + r.parcela * r.meses).toBeCloseTo(478731.64, 1)
  })

  it('sem meses restantes não inventa parcela', () => {
    expect(distribuirAteAsChaves(478731.64, 119682.91, null)).toBeNull()
    expect(distribuirAteAsChaves(478731.64, 119682.91, 0)).toBeNull()
  })

  it('ato que já cobre tudo não vira parcela de zero', () => {
    expect(distribuirAteAsChaves(100000, 100000, 8)).toBeNull()
    expect(distribuirAteAsChaves(100000, 150000, 8)).toBeNull()
  })

  it('sem ato mínimo, distribui o valor inteiro', () => {
    const r = distribuirAteAsChaves(80000, null, 8)!
    expect(r.ato).toBe(0)
    expect(r.parcela).toBe(10000)
  })
})

describe('opção à vista não vira parcelamento', () => {
  // `planoDaOpcao` assume 100% até as chaves quando a opção não diz outra
  // coisa — o que é certo para o cálculo, e armadilha para quem consome.
  // A opção à vista do Tremezzo (15% de desconto, sem ateAsChavesPct) chegava
  // na tela com "No ato R$ 0 + 8x até a entrega R$ 141.292": um parcelamento
  // oferecido em cima de uma condição que existe justamente para ser à vista.
  // Quem desenha a tela tem que checar `ateAsChavesPct` antes de distribuir.
  const A_VISTA = { tipo: 'a_vista' as const, descricao: 'À VISTA', descontoPct: 15 }

  it('o plano da opção à vista cobre o valor inteiro até as chaves', () => {
    const p = planoDaOpcao(1329810.12, A_VISTA)!
    expect(p.valorComDesconto).toBeCloseTo(1130338.6, 2)
    expect(p.ateAsChaves).toBeCloseTo(p.valorComDesconto, 2)
    expect(p.saldo).toBe(0)
    // Sem ato mínimo declarado: não há o que dar de entrada.
    expect(p.ato).toBeNull()
  })

  it('a opção escalonada continua declarando o que distribuir', () => {
    const escalonada = {
      tipo: 'direto' as const, descricao: 'OPÇÃO 2', descontoPct: 10,
      ateAsChavesPct: 40, atoMinimoPct: 10, meses: 180, jurosAoMes: 0.0075,
    }
    const p = planoDaOpcao(1329810.12, escalonada)!
    expect(escalonada.ateAsChavesPct).toBeTruthy()
    expect(p.ato).toBeCloseTo(119682.91, 1)
    expect(p.saldo).toBeCloseTo(718097.47, 1)
  })
})

describe('percentual até as chaves com texto no meio (Lavis)', () => {
  // Rodapé REAL do Lavis. As 55 unidades entraram em produção em 30/07 sem
  // exibir esta condição: o `40%` não era capturado, e a tela só mostra o
  // bloco da opção quando há desconto OU percentual até as chaves.
  const LAVIS = '7) POLITICA COMERCIAL: OPÇÃO 1: PAGAMENTO DE 40% DO VALOR TOTAL ATÉ AS CHAVES, COM ATO MÍNIMO DE 10% DO VALOR DA VENDA. APÓS A CONCLUSÃO DO EMPREENDIMENTO, O SALDO DEVEDOR DEVERÁ SER QUITADO VIA FINANCIAMENTO BANCÁRIO OU DIRETO COM A CONSTRUTORA EM ATÉ 240 MESES, SENDO CORRIGIDO PELO IGPM E ACRESCIDO DE JUROS COMPENSATÓRIOS DE 0,75% a.m. ( NESSA OPÇÃO NÃO SERÁ ACEITO PERMUTA). SS - Subsolo T - Térreo Pav Gar - Pavimento Garagem S - Simples E - Estendido D - Duplo'

  const opcao = lerOpcoesDePagamento(LAVIS)[0]

  it('captura os 40% mesmo com "DO VALOR TOTAL" no meio', () => {
    expect(opcao).toMatchObject({
      tipo: 'direto', ateAsChavesPct: 40, atoMinimoPct: 10,
      meses: 240, jurosAoMes: 0.0075, indice: 'IGPM', aceitaPermuta: false,
    })
  })

  it('a lista de abreviações não entra na descrição, mesmo sem "LEGENDAS:"', () => {
    expect(opcao.descricao).not.toMatch(/Subsolo|Térreo|Pavimento Garagem/i)
    expect(opcao.descricao).toMatch(/NÃO SERÁ ACEITO PERMUTA\)$/)
  })

  it('o plano em dinheiro passa a existir para o Lavis', () => {
    // Antes, sem ateAsChavesPct, `planoDaOpcao` não tinha o que calcular.
    const p = planoDaOpcao(1701282.90, opcao)!
    expect(p.ateAsChaves).toBeCloseTo(680513.16, 2)  // 40%
    expect(p.ato).toBeCloseTo(170128.29, 2)          // 10%
    expect(p.saldo).toBeCloseTo(1020769.74, 2)       // 60% → 240x
  })

  it('não confunde o desconto com o percentual até as chaves', () => {
    // Tremezzo: "DESCONTO DE 10% SOBRE O VALOR TOTAL, PAGANDO 40% ATÉ AS
    // CHAVES". O `[^%]` impede atravessar outro percentual — se atravessasse,
    // o 10 do desconto viraria o valor até as chaves.
    const t = 'OPÇÃO 2: SERÁ CONCEDIDO DESCONTO DE 10% SOBRE O VALOR TOTAL, PAGANDO 40% ATÉ AS CHAVES, COM ATO MÍNIMO DE 10% DO VALOR DA VENDA;'
    expect(lerOpcoesDePagamento(t)[0]).toMatchObject({ descontoPct: 10, ateAsChavesPct: 40, atoMinimoPct: 10 })
  })

  it('opção sem percentual até as chaves continua sem inventar um', () => {
    const t = 'OPÇÃO 01: FINANCIAMENTO BANCÁRIO; OPÇÃO 02: SERÁ CONCEDIDO DESCONTO DE 15% PARA PAGAMENTO À VISTA;'
    for (const o of lerOpcoesDePagamento(t)) expect(o.ateAsChavesPct).toBeUndefined()
  })
})
