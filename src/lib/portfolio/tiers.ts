// Distribuição do portfólio publicado por faixa de preço (tiers). Não é o
// mesmo conceito da Diversificação do Score de Operação (aquilo mede
// empreendimentos com LEAD; isto mede cobertura de PORTFÓLIO por faixa de
// preço) — os dois coexistem, cada um respondendo uma pergunta diferente.
//
// Diferença deliberada em relação ao modelo de referência (Tijolo.IA, que
// usa metas fixas tipo "Baixo 0/20"): aqui os tiers vêm de TERCIS reais da
// distribuição de preço, não de uma cota numérica inventada. Uma meta fixa
// fazia sentido numa base de até 50 imóveis cadastrados um a um; numa base
// de 36 empreendimentos importados de uma vez, uma meta fixa seria
// arbitrária — o corte tem que vir dos dados, não de um número chutado.
//
// Função pura: recebe a lista já buscada (preço de referência + flag
// ativo de cada empreendimento) e devolve os 3 tiers com contagens. Sem
// I/O, sem RPC aqui dentro — só matemática, testável sem banco.

export type ItemPortfolio = {
  id: string
  /** Preço de referência do empreendimento (ver lib que busca isso — não é definido aqui). */
  preco: number
  ativo: boolean
}

export type Tier = 'baixo' | 'medio' | 'alto'

export type ResultadoTier = {
  tier: Tier
  label: string
  /** Quantos empreendimentos têm preço nessa faixa, ativos + inativos. */
  total: number
  /** Desses, quantos estão ativo. */
  ativos: number
  /** Alerta REAL: tier tem inventário (total>0) mas nenhum ativo. Diferente de tier vazio (total=0 — ausência de inventário, não gap). */
  gap: boolean
  precoMin: number | null
  precoMax: number | null
}

export type ResultadoPortfolioTiers =
  | { aplicavel: true; tiers: ResultadoTier[]; temGap: boolean }
  | { aplicavel: false; motivo: string; amostra: number }

/** Abaixo disso, segmentar em 3 faixas não significa nada — a amostra é a própria mensagem. */
export const AMOSTRA_MINIMA = 9

const LABELS: Record<Tier, string> = { baixo: 'Baixo padrão', medio: 'Médio padrão', alto: 'Alto padrão' }

/**
 * Percentil por interpolação linear (mesma convenção do numpy/Excel
 * PERCENTILE.INC) sobre um array JÁ ORDENADO ascendente. `p` em [0,1].
 */
function percentil(ordenados: number[], p: number): number {
  const n = ordenados.length
  if (n === 1) return ordenados[0]
  const idx = p * (n - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return ordenados[lo]
  const frac = idx - lo
  return ordenados[lo] + (ordenados[hi] - ordenados[lo]) * frac
}

/**
 * Tercis calculados sobre TODOS os itens recebidos (ativos + inativos) —
 * de propósito: se o corte considerasse só os ativos, publicar ou
 * despublicar um empreendimento deslocaria a fronteira dos tiers toda
 * hora, e "Baixo padrão" de hoje deixaria de significar a mesma faixa de
 * preço amanhã sem nada ter mudado de preço de verdade.
 *
 * Classificação por FAIXA DE VALOR (percentil 33/66 do preço), não por
 * posição/contagem no ranking — a diferença importa: com corte por
 * posição, cada tier sempre tem pelo menos ⌊n/3⌋ itens por construção, e
 * "tier vazio" nunca aconteceria mesmo numa distribuição patologicamente
 * concentrada. Com corte por VALOR, um tier pode legitimamente ficar sem
 * nenhum item se a distribuição de preço estiver toda concentrada fora
 * daquela faixa — esse caso é real (ausência de inventário naquela faixa),
 * diferente de gap (tem inventário, zero publicado). Fronteira inclusiva
 * pra baixo: preço == p33 fica no tier Baixo, preço == p66 fica no Médio.
 */
export function calcularTiers(itens: ItemPortfolio[]): ResultadoPortfolioTiers {
  if (itens.length < AMOSTRA_MINIMA) {
    return {
      aplicavel: false,
      motivo: `Apenas ${itens.length} empreendimento${itens.length === 1 ? '' : 's'} com preço de referência utilizável — amostra pequena demais pra uma segmentação em 3 faixas significar algo.`,
      amostra: itens.length,
    }
  }

  const precosOrdenados = itens.map((i) => i.preco).sort((a, b) => a - b)
  const p33 = percentil(precosOrdenados, 1 / 3)
  const p66 = percentil(precosOrdenados, 2 / 3)

  function tierDe(preco: number): Tier {
    if (preco <= p33) return 'baixo'
    if (preco <= p66) return 'medio'
    return 'alto'
  }

  const grupos: Record<Tier, ItemPortfolio[]> = { baixo: [], medio: [], alto: [] }
  for (const item of itens) grupos[tierDe(item.preco)].push(item)

  const tiers: ResultadoTier[] = (['baixo', 'medio', 'alto'] as Tier[]).map((tier) => {
    const grupo = grupos[tier]
    const precos = grupo.map((i) => i.preco)
    const ativos = grupo.filter((i) => i.ativo).length
    return {
      tier,
      label: LABELS[tier],
      total: grupo.length,
      ativos,
      gap: grupo.length > 0 && ativos === 0,
      precoMin: precos.length > 0 ? Math.min(...precos) : null,
      precoMax: precos.length > 0 ? Math.max(...precos) : null,
    }
  })

  return { aplicavel: true, tiers, temGap: tiers.some((t) => t.gap) }
}
