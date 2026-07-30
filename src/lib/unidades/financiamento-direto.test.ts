import { describe, expect, it } from 'vitest'
import {
  lerPoliticaFinanciamento, parcelaDireta, parcelaDiretaComReforcos,
  prazosSugeridos, reforcoMaximo, lerOpcoesDePagamento,
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
