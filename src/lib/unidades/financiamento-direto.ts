// Financiamento direto com a construtora.
//
// As tabelas trazem, no rodapé, a política comercial:
//
//   OPÇÃO 01: FINANCIAMENTO BANCÁRIO
//   OPÇÃO 02: O SALDO DEVEDOR PODERÁ SER PARCELADO DIRETO COM A CONSTRUTORA
//   EM ATÉ 240 MESES, SENDO CORRIGIDO PELO IGPM E ACRESCIDO DE JUROS
//   COMPENSATÓRIOS DE 0,75% A.M.
//
// Isto não é rodapé: é o produto. O site inteiro se apresenta como
// "empreendimentos com financiamento direto" — e a página da unidade mostrava
// só o saldo, como se a única saída fosse o banco. A pergunta que todo cliente
// faz ("quanto fica por mês?") não tinha resposta na tela.

export type PoliticaFinanciamento = {
  /** Prazo máximo em meses. */
  meses: number
  /** Juros compensatórios ao mês, em fração (0.0075 = 0,75% a.m.). */
  jurosAoMes: number
  /** Índice de correção do saldo — normalmente IGPM. */
  indice: string | null
}

export type ParcelaDireta = {
  meses: number
  /** Parcela em moeda de hoje, antes da correção pelo índice. */
  valor: number
  /** Soma das parcelas, também em moeda de hoje. */
  totalPago: number
  /** Quanto de juros, em moeda de hoje. */
  juros: number
}

/**
 * Lê a política do rodapé da tabela.
 *
 * Devolve null quando a tabela não menciona parcelamento direto — melhor não
 * oferecer do que oferecer condição que a construtora não escreveu.
 */
export function lerPoliticaFinanciamento(texto: string): PoliticaFinanciamento | null {
  const t = (texto || '').replace(/\s+/g, ' ')

  const mMeses = t.match(/EM\s+AT[ÉE]\s+(\d{1,3})\s*MESES/i)
  if (!mMeses) return null
  const meses = Number(mMeses[1])
  if (!Number.isFinite(meses) || meses < 1 || meses > 600) return null

  const mJuros = t.match(/JUROS[^%]*?(\d{1,2}(?:[.,]\d{1,3})?)\s*%\s*A\.?\s*M/i)
  if (!mJuros) return null
  const jurosAoMes = Number(mJuros[1].replace(',', '.')) / 100
  // Acima de 5% a.m. quase certamente é erro de leitura, não condição real.
  if (!Number.isFinite(jurosAoMes) || jurosAoMes <= 0 || jurosAoMes > 0.05) return null

  const mIndice = t.match(/CORRIGIDO\s+PELO\s+([A-ZÇÃÕ\-]{3,12})/i)

  return { meses, jurosAoMes, indice: mIndice ? mIndice[1].toUpperCase() : null }
}

/**
 * Parcela do saldo devedor pela Tabela Price.
 *
 * PMT = PV × i ÷ (1 − (1+i)^−n)
 *
 * O valor sai em moeda de HOJE. A correção pelo IGPM não entra: ninguém sabe
 * o IGPM dos próximos 20 anos, e estimar seria inventar um número que o
 * cliente levaria como promessa. A tela diz isso com todas as letras.
 */
export function parcelaDireta(
  saldo: number,
  meses: number,
  jurosAoMes: number,
): ParcelaDireta | null {
  if (!(saldo > 0) || !(meses >= 1) || !Number.isFinite(jurosAoMes) || jurosAoMes < 0) return null

  const n = Math.floor(meses)
  const valor = jurosAoMes === 0
    ? saldo / n
    : (saldo * jurosAoMes) / (1 - Math.pow(1 + jurosAoMes, -n))

  if (!Number.isFinite(valor)) return null

  const cent = (x: number) => Math.round(x * 100) / 100
  const totalPago = cent(valor * n)
  return { meses: n, valor: cent(valor), totalPago, juros: cent(totalPago - saldo) }
}

/**
 * Prazos que valem mostrar, do mais curto ao máximo da política.
 *
 * Só múltiplos redondos, e nunca acima do teto: oferecer 240x quando o
 * contrato permite 180 seria prometer o que não existe.
 */
export function prazosSugeridos(maximo: number): number[] {
  return [60, 120, 180, 240, 300, 360].filter((m) => m <= maximo)
}
