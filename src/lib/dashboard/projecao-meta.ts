/**
 * "Quanto falta fechar para bater a meta?"
 *
 * A barra de progresso responde quanto já foi feito. Ela não responde o que
 * fazer com o que sobrou do mês — e é essa a pergunta que muda a agenda da
 * semana. Aqui o corretor mexe em três variáveis que ele controla (ticket
 * médio, quantidade de vendas e o percentual de comissão do negócio) e vê o
 * VGV e a comissão que aquilo produz, contra a meta.
 *
 * A conta é deliberadamente simples — ticket × volume — porque a incerteza
 * está nas premissas, não na fórmula. Sofisticar o cálculo daria falsa
 * precisão a um chute.
 */

export type EntradaProjecao = {
  ticketMedio: number
  volume: number
  percentualComissao: number
  metaVgv: number
  realizadoVgv: number
}

export type Projecao = {
  vgvProjetado: number
  comissaoProjetada: number
  /** Realizado + projetado, que é o que fecha o mês se a simulação acontecer. */
  vgvTotalNoMes: number
  percentualDaMeta: number
  bate: boolean
  /** O que ainda falta de VGV depois do que já foi realizado. */
  faltaVgv: number
  /**
   * Quantas vendas do ticket escolhido ainda faltam. É o número que vira
   * tarefa: "faltam 2 vendas de R$ 450 mil".
   */
  vendasFaltantes: number
}

const arredondar = (v: number): number => Math.round(v * 100) / 100
const naoNegativo = (v: unknown): number => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function projetar(entrada: EntradaProjecao): Projecao {
  const ticketMedio = naoNegativo(entrada.ticketMedio)
  const volume = Math.floor(naoNegativo(entrada.volume))
  const percentual = naoNegativo(entrada.percentualComissao)
  const metaVgv = naoNegativo(entrada.metaVgv)
  const realizadoVgv = naoNegativo(entrada.realizadoVgv)

  const vgvProjetado = arredondar(ticketMedio * volume)
  const vgvTotalNoMes = arredondar(realizadoVgv + vgvProjetado)

  const faltaVgv = arredondar(Math.max(0, metaVgv - realizadoVgv))

  return {
    vgvProjetado,
    comissaoProjetada: arredondar(vgvProjetado * (percentual / 100)),
    vgvTotalNoMes,
    // Sem meta definida não existe "percentual da meta" — devolver 0 é mais
    // honesto do que 100% ou Infinity, e a tela esconde o comparativo.
    percentualDaMeta: metaVgv > 0 ? Math.round((vgvTotalNoMes / metaVgv) * 100) : 0,
    bate: metaVgv > 0 && vgvTotalNoMes >= metaVgv,
    faltaVgv,
    // Arredonda para CIMA: 1,2 venda não existe, e sugerir 1 deixaria a meta
    // sem bater por pouco — o que é pior do que sugerir uma venda a mais.
    vendasFaltantes: ticketMedio > 0 ? Math.ceil(faltaVgv / ticketMedio) : 0,
  }
}

/**
 * Chute inicial dos sliders.
 *
 * Abrir a ferramenta zerada obriga a inventar três números antes de ver
 * qualquer coisa. O ticket sai do que a meta do próprio corretor já implica
 * (meta ÷ vendas planejadas); sem meta, de um piso plausível para a região.
 */
export function palpiteInicial(metaVgv: number, metaVendas: number, ticketRealizado = 0): {
  ticketMedio: number
  volume: number
} {
  if (ticketRealizado > 0) {
    return {
      ticketMedio: Math.round(ticketRealizado),
      volume: Math.max(1, Math.ceil(metaVgv > 0 ? metaVgv / ticketRealizado : 1)),
    }
  }
  if (metaVgv > 0 && metaVendas > 0) {
    return { ticketMedio: Math.round(metaVgv / metaVendas), volume: metaVendas }
  }
  return { ticketMedio: 400_000, volume: 1 }
}
