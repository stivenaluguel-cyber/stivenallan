import type { OpcaoPagamento } from './financiamento-direto'
// Simulação de pagamento de uma unidade.
//
// É o degrau que faltava no espelho. O único botão era "Reservar 48h" — pedido
// alto para quem acabou de abrir a página. O que move a conversa no
// financiamento direto não é o preço, é o COMO PAGA: quanto de entrada, quanto
// por mês, quanto sobra para o fim.
//
// Duas regras que separam simulação honesta de simulação de vitrine:
//
// 1. O plano da construtora é o PADRÃO, não uma sugestão nossa. Quando o
//    cliente não mexe em nada, o que aparece é exatamente a tabela vigente.
// 2. Mexer na entrada NÃO muda o preço nem o prazo — redistribui. Entrada
//    maior derruba a parcela; entrada menor sobe. Nada de "desconto" que a
//    construtora não deu.

export type PlanoPagamento = {
  entrada: number
  parcelas_qtd: number
  parcela_valor: number
  reforcos_qtd: number
  reforco_valor: number
  saldo_financiamento: number
  cub_quantidade?: number | null
  /** Parcelamento direto do saldo, quando a tabela oferece. */
  financiamento_direto?: { meses: number; jurosAoMes: number; indice: string | null } | null
  /** Formas de pagamento da tabela daquele empreendimento. */
  opcoes_pagamento?: OpcaoPagamento[] | null
  percentual_ate_chaves?: number | null
  /** Entrega no formato do PDF ("31/03/2027"). Base para os meses que faltam. */
  previsao_entrega?: string | null
}

export type Simulacao = {
  valorTotal: number
  entrada: number
  entradaPercentual: number
  parcelasQtd: number
  parcelaValor: number
  reforcosQtd: number
  reforcoValor: number
  /** Total quitado até a entrega das chaves (entrada + parcelas + reforços). */
  ateAsChaves: number
  ateAsChavesPercentual: number
  saldoFinanciamento: number
  /** true quando é exatamente o plano da tabela, sem ajuste do cliente. */
  padraoDaTabela: boolean
  /** Reforço em múltiplos da parcela. Teto contratual: 5. */
  reforcoEmParcelas: number
}

/**
 * Teto contratual do reforço: até 5 vezes a parcela mensal.
 *
 * É regra da Fontana, documentada nos guias do próprio site ("cada reforço
 * equivale a 5 vezes o valor da parcela mensal"). O Pineto opera em 3,75×,
 * dentro do teto.
 *
 * Importa aqui porque a primeira versão desta simulação mantinha o reforço
 * FIXO e só derrubava a parcela: com entrada de R$ 120 mil na unidade 102, o
 * reforço virava 8,77× a parcela — um plano que a construtora não assinaria.
 */
export const REFORCO_MAXIMO_EM_PARCELAS = 5

const cent = (n: number) => Math.round(n * 100) / 100

/**
 * Simula com a entrada que o cliente informar.
 *
 * `entradaDesejada` ausente = plano da tabela, intacto.
 *
 * A conta: o montante que precisa estar quitado até as chaves é fixo (é
 * condição contratual da construtora, não escolha). Mudar a entrada só muda
 * quanto sobra para dividir nas parcelas — os reforços e o prazo ficam como
 * estão, porque são a estrutura do contrato.
 */
export function simular(
  valorTotal: number,
  plano: PlanoPagamento,
  entradaDesejada?: number | null,
): Simulacao | null {
  if (!(valorTotal > 0) || !plano) return null

  // Zero parcelas é um plano legítimo, não um dado faltando: no formato
  // "entrada + financiamento" (Avezzano) o comprador paga a entrada e financia
  // o resto na entrega, sem parcelar nada com a construtora. Forçar mínimo de
  // 1 aqui, como antes, imprimiria "1x R$ 0,00" na página pública.
  const semParcelamento = !(plano.parcelas_qtd > 0)
  const parcelasQtd = semParcelamento ? 0 : Math.floor(plano.parcelas_qtd)
  const reforcosQtd = Math.max(0, Math.floor(plano.reforcos_qtd || 0))

  // Montante até as chaves, tirado do próprio plano da tabela — não de um
  // percentual chutado.
  const ateAsChavesPadrao =
    plano.entrada + parcelasQtd * plano.parcela_valor + reforcosQtd * plano.reforco_valor

  const usaPadrao =
    // Sem parcelas não há o que redistribuir: mexer na entrada mudaria o
    // saldo financiado, que é decisão do banco, não da construtora.
    semParcelamento ||
    entradaDesejada === null ||
    entradaDesejada === undefined ||
    !Number.isFinite(entradaDesejada) ||
    Math.abs(entradaDesejada - plano.entrada) < 0.01

  if (usaPadrao) {
    return {
      valorTotal: cent(valorTotal),
      entrada: cent(plano.entrada),
      entradaPercentual: pct(plano.entrada, valorTotal),
      parcelasQtd,
      parcelaValor: cent(plano.parcela_valor),
      reforcosQtd,
      reforcoValor: cent(plano.reforco_valor),
      ateAsChaves: cent(ateAsChavesPadrao),
      ateAsChavesPercentual: pct(ateAsChavesPadrao, valorTotal),
      saldoFinanciamento: cent(plano.saldo_financiamento),
      padraoDaTabela: true,
      reforcoEmParcelas: plano.parcela_valor > 0
        ? Math.round((plano.reforco_valor / plano.parcela_valor) * 100) / 100 : 0,
    }
  }

  // Entrada dentro de limites que fazem sentido: nunca negativa, nunca maior
  // que o que precisa estar quitado até as chaves (acima disso já não é
  // entrada, é quitação — outra conversa, com desconto à vista).
  const entrada = Math.min(Math.max(entradaDesejada, 0), ateAsChavesPadrao)

  // Parcela e reforço caem JUNTOS, preservando a proporção da tabela.
  //
  // Manter o reforço fixo e só derrubar a parcela — como esta função fazia
  // antes — inflava a razão reforço/parcela e estourava o teto contratual de
  // 5×: entrada de R$ 120 mil na unidade 102 do Pineto produzia 8,77×.
  //
  // A prova de que a proporção é o modelo certo: aplicando esta mesma fórmula
  // com a entrada da tabela, a parcela derivada bate ao centavo com a parcela
  // impressa no PDF.
  const razaoTabela =
    plano.parcela_valor > 0 ? plano.reforco_valor / plano.parcela_valor : 0
  const razao = Math.min(razaoTabela, REFORCO_MAXIMO_EM_PARCELAS)

  const restante = ateAsChavesPadrao - entrada
  const divisor = parcelasQtd + reforcosQtd * razao
  const parcelaValor = restante > 0 && divisor > 0 ? restante / divisor : 0
  const reforcoValor = parcelaValor * razao

  return {
    valorTotal: cent(valorTotal),
    entrada: cent(entrada),
    entradaPercentual: pct(entrada, valorTotal),
    parcelasQtd,
    parcelaValor: cent(parcelaValor),
    reforcosQtd,
    reforcoValor: cent(reforcoValor),
    ateAsChaves: cent(ateAsChavesPadrao),
    ateAsChavesPercentual: pct(ateAsChavesPadrao, valorTotal),
    // O saldo financiado não muda: é o que sobra depois das chaves, e a
    // entrada só redistribui o que vem ANTES delas.
    saldoFinanciamento: cent(plano.saldo_financiamento),
    padraoDaTabela: false,
    reforcoEmParcelas: Math.round(razao * 100) / 100,
  }
}

function pct(parte: number, total: number): number {
  return total > 0 ? Math.round((parte / total) * 1000) / 10 : 0
}

/**
 * Faixa de entrada que a interface pode oferecer.
 *
 * O mínimo é o da tabela — oferecer menos seria prometer condição que a
 * construtora não dá. O máximo para no que precisa estar quitado até as
 * chaves.
 */
export function faixaDeEntrada(plano: PlanoPagamento): { min: number; max: number; passo: number } {
  const ateAsChaves =
    plano.entrada + plano.parcelas_qtd * plano.parcela_valor + plano.reforcos_qtd * plano.reforco_valor
  const min = cent(plano.entrada)
  const max = cent(Math.max(ateAsChaves, min))
  // Passo de mil reais arredonda a conversa para números que se fala em voz
  // alta ("cinquenta mil"), em vez de R$ 55.939,43.
  return { min, max, passo: 1000 }
}

export function planoDoJson(v: unknown): PlanoPagamento | null {
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  const n = (k: string) => {
    const x = Number(o[k])
    return Number.isFinite(x) ? x : 0
  }
  const plano: PlanoPagamento = {
    entrada: n('entrada'),
    parcelas_qtd: n('parcelas_qtd'),
    parcela_valor: n('parcela_valor'),
    reforcos_qtd: n('reforcos_qtd'),
    reforco_valor: n('reforco_valor'),
    saldo_financiamento: n('saldo_financiamento'),
    cub_quantidade: o.cub_quantidade === undefined || o.cub_quantidade === null ? null : n('cub_quantidade'),
    financiamento_direto: politicaDoJson(o.financiamento_direto),
    opcoes_pagamento: Array.isArray(o.opcoes_pagamento) ? (o.opcoes_pagamento as OpcaoPagamento[]) : null,
    percentual_ate_chaves:
      o.percentual_ate_chaves === undefined || o.percentual_ate_chaves === null ? null : n('percentual_ate_chaves'),
    previsao_entrega: typeof o.previsao_entrega === 'string' ? o.previsao_entrega : null,
  }
  // Plano sem entrada nem parcela não é plano — é jsonb sujo. Melhor a
  // interface não mostrar nada do que mostrar zeros.
  if (plano.entrada <= 0 && plano.parcela_valor <= 0) return null
  return plano
}

/** Lê a política de parcelamento direto gravada no jsonb, se estiver íntegra. */
function politicaDoJson(v: unknown): PlanoPagamento['financiamento_direto'] {
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  const meses = Number(o.meses)
  const jurosAoMes = Number(o.jurosAoMes)
  if (!Number.isFinite(meses) || meses < 1) return null
  if (!Number.isFinite(jurosAoMes) || jurosAoMes < 0) return null
  return { meses: Math.floor(meses), jurosAoMes, indice: typeof o.indice === 'string' ? o.indice : null }
}
