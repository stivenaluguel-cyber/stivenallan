/**
 * Cruzamento de permutas: quem oferece imóvel na troca × onde ele cabe.
 *
 * Os dois lados já existiam separados. A tabela de preços diz quando uma
 * condição NÃO aceita permuta — o parser marca `aceitaPermuta: false` quando
 * o PDF escreve isso ("NESSA OPÇÃO NÃO SERÁ ACEITO PERMUTA"). E o cliente que
 * oferece um imóvel na troca agora tem campo no lead. O que ninguém fazia era
 * juntar: "o Márcio tem um apartamento de R$ 280 mil, onde isso entra?" era
 * pergunta respondida de memória, olhando PDF por PDF.
 *
 * Uma honestidade importante sobre o dado: o parser só sabe dizer NÃO. A
 * tabela raramente escreve "aceita permuta" — ela só avisa quando alguma
 * condição exclui. Então a ausência da marca não é "aceita", é "a tabela não
 * exclui". A diferença importa porque quem confirma permuta é a construtora,
 * não o PDF, e um rótulo "aceita" faria o corretor prometer o que não pode.
 */

export type OpcaoPagamento = { aceitaPermuta?: boolean; descricao?: string; tipo?: string }

export type PlanoUnidade = {
  entrada?: number | null
  opcoes_pagamento?: OpcaoPagamento[] | null
} | null

export type UnidadeParaPermuta = {
  id: string
  identificador: string
  empreendimento_slug?: string | null
  empreendimento_nome?: string | null
  valor_tabela: number | null
  valor_entrada_min: number | null
  plano_pagamento: PlanoUnidade
  status?: string | null
}

/** O que a tabela de preços diz sobre permuta nesta unidade. */
export type SituacaoPermuta = 'todas_excluem' | 'alguma_exclui' | 'nao_mencionada'

export function situacaoPermuta(plano: PlanoUnidade): SituacaoPermuta {
  const opcoes = plano?.opcoes_pagamento ?? []
  if (opcoes.length === 0) return 'nao_mencionada'

  const excluem = opcoes.filter((o) => o.aceitaPermuta === false).length
  if (excluem === 0) return 'nao_mencionada'
  // Toda condição da unidade exclui permuta: aqui não há negócio de troca.
  return excluem === opcoes.length ? 'todas_excluem' : 'alguma_exclui'
}

/**
 * Quanto da entrada o imóvel do cliente cobre.
 *
 * A entrada é a referência, e não o valor do apartamento, porque é ali que a
 * permuta entra no financiamento direto: o imóvel dado na troca abate o ato,
 * não o total. Comparar com o valor cheio da unidade produziria "cobre 12%" —
 * verdadeiro e inútil.
 */
export type Cobertura = 'cobre_entrada' | 'cobre_parte' | 'sem_entrada_conhecida'

export type Combinacao = {
  unidadeId: string
  identificador: string
  empreendimento: string
  valorTabela: number | null
  entrada: number | null
  cobertura: Cobertura
  percentualDaEntrada: number | null
  /** Sobra do imóvel do cliente depois de cobrir a entrada; 0 quando não cobre. */
  excedente: number
  situacao: SituacaoPermuta
}

const arredondar = (v: number): number => Math.round(v * 100) / 100

function entradaDaUnidade(u: UnidadeParaPermuta): number | null {
  // valor_entrada_min é o campo da tabela; o plano carrega a entrada
  // calculada. Um dos dois costuma estar preenchido.
  const candidatos = [u.valor_entrada_min, u.plano_pagamento?.entrada]
  for (const c of candidatos) {
    const n = Number(c)
    if (Number.isFinite(n) && n > 0) return n
  }
  return null
}

/**
 * Combinações possíveis para um imóvel de `valorPermuta`.
 *
 * Unidades cujas condições TODAS excluem permuta ficam de fora — não é
 * ordenação ruim, é negócio impossível. As demais entram ordenadas por quanto
 * a permuta resolve da entrada.
 */
export function cruzarPermuta(
  valorPermuta: number,
  unidades: UnidadeParaPermuta[],
): Combinacao[] {
  const valor = Number(valorPermuta)
  if (!Number.isFinite(valor) || valor <= 0) return []

  const combinacoes: Combinacao[] = []

  for (const u of unidades) {
    // Vendida não é oportunidade.
    if (u.status && u.status !== 'disponivel') continue

    const situacao = situacaoPermuta(u.plano_pagamento)
    if (situacao === 'todas_excluem') continue

    const entrada = entradaDaUnidade(u)
    const cobertura: Cobertura = entrada === null
      ? 'sem_entrada_conhecida'
      : valor >= entrada ? 'cobre_entrada' : 'cobre_parte'

    combinacoes.push({
      unidadeId: u.id,
      identificador: u.identificador,
      empreendimento: u.empreendimento_nome ?? u.empreendimento_slug ?? '—',
      valorTabela: u.valor_tabela === null ? null : Number(u.valor_tabela),
      entrada,
      cobertura,
      percentualDaEntrada: entrada ? Math.round((valor / entrada) * 100) : null,
      excedente: entrada && valor > entrada ? arredondar(valor - entrada) : 0,
      situacao,
    })
  }

  return combinacoes.sort((a, b) => {
    // Quem cobre a entrada inteira primeiro: é o negócio que fecha sem o
    // cliente tirar dinheiro do bolso no ato.
    const peso = (c: Combinacao) => (c.cobertura === 'cobre_entrada' ? 0 : c.cobertura === 'cobre_parte' ? 1 : 2)
    const d = peso(a) - peso(b)
    if (d !== 0) return d
    // Dentro do mesmo grupo, o que aproveita melhor a permuta: entre duas que
    // cobrem, a de entrada maior desperdiça menos; entre duas que não cobrem,
    // a de percentual maior está mais perto.
    if (a.cobertura === 'cobre_entrada') return (a.entrada ?? 0) - (b.entrada ?? 0) > 0 ? -1 : 1
    return (b.percentualDaEntrada ?? 0) - (a.percentualDaEntrada ?? 0)
  })
}

export const ROTULO_COBERTURA: Record<Cobertura, string> = {
  cobre_entrada: 'Cobre a entrada inteira',
  cobre_parte: 'Cobre parte da entrada',
  sem_entrada_conhecida: 'Entrada não informada na tabela',
}

export const ROTULO_SITUACAO: Record<SituacaoPermuta, string> = {
  todas_excluem: 'Tabela exclui permuta',
  alguma_exclui: 'Uma das condições exclui permuta',
  nao_mencionada: 'Tabela não menciona permuta',
}
