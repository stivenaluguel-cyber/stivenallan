/**
 * Extrato anual de comissões — o que a declaração de imposto pede.
 *
 * Corretor autônomo declara pelo REGIME DE CAIXA: o que importa é o mês em
 * que o dinheiro entrou, não o mês da venda nem o da assinatura. Por isso
 * este extrato só olha comissões com status "recebida" e as aloca pela
 * data_recebimento. Uma venda fechada em dezembro e paga em fevereiro é
 * receita de fevereiro, do ano seguinte — e é exatamente esse tipo de linha
 * que fura a declaração feita de memória.
 *
 * Comissão marcada como recebida sem data de recebimento não é jogada em
 * mês nenhum: ela vai para um balde separado que a tela mostra em vez de
 * esconder. Chutar o mês seria inventar competência num documento fiscal.
 */

export type LinhaComissao = {
  id: string
  status: string
  valor_comissao: number | string | null
  data_recebimento: string | null
  data_venda: string | null
  leads?: { nome: string | null } | null
  empreendimentos?: { nome: string } | null
  participantes?: { corretor_id?: string | null; percentual: number | string }[] | null
}

export type MesExtrato = {
  mes: number
  label: string
  total: number
  minhaParte: number
  quantidade: number
}

export type ExtratoAnual = {
  ano: number
  meses: MesExtrato[]
  total: number
  minhaParteTotal: number
  quantidade: number
  /** Recebidas sem data — ficam fora dos meses e a tela avisa. */
  semDataRecebimento: { quantidade: number; total: number }
  /** True quando alguma linha tem divisão detalhada; a coluna "sua parte" só faz sentido aí. */
  temRepasse: boolean
  anosDisponiveis: number[]
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const numero = (v: unknown): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const arredondar = (v: number): number => Math.round(v * 100) / 100

/**
 * Quanto desta comissão é do próprio corretor.
 *
 * Sem divisão detalhada, tudo. Com divisão, só a fatia das linhas que apontam
 * para ele — o que foi para a imobiliária ou para o parceiro entrou e saiu, e
 * declarar o bruto como receita própria inflaria a base de cálculo.
 *
 * Sem saber qual corretor é "eu" (nenhum cadastro ligado ao admin), devolve o
 * total: é melhor mostrar o bruto e dizer isso na tela do que zerar o extrato.
 */
export function parteDoCorretor(linha: LinhaComissao, meuCorretorId: string | null): number {
  const total = numero(linha.valor_comissao)
  const participantes = linha.participantes ?? []
  if (participantes.length === 0 || !meuCorretorId) return total

  const meuPercentual = participantes
    .filter((p) => p.corretor_id === meuCorretorId)
    .reduce((s, p) => s + numero(p.percentual), 0)

  return arredondar(total * (meuPercentual / 100))
}

export function montarExtratoAnual(
  linhas: LinhaComissao[],
  ano: number,
  meuCorretorId: string | null = null,
): ExtratoAnual {
  const recebidas = linhas.filter((l) => l.status === 'recebida')

  const anosDisponiveis = [
    ...new Set(
      recebidas
        .map((l) => (l.data_recebimento ?? '').slice(0, 4))
        .filter((a) => /^\d{4}$/.test(a))
        .map(Number),
    ),
  ].sort((a, b) => b - a)

  const doAno = recebidas.filter((l) => (l.data_recebimento ?? '').slice(0, 4) === String(ano))

  const meses: MesExtrato[] = MESES.map((label, i) => ({
    mes: i + 1, label, total: 0, minhaParte: 0, quantidade: 0,
  }))

  let total = 0
  let minhaParteTotal = 0
  let temRepasse = false

  for (const l of doAno) {
    const mes = Number((l.data_recebimento ?? '').slice(5, 7))
    if (!(mes >= 1 && mes <= 12)) continue
    const valor = numero(l.valor_comissao)
    const minha = parteDoCorretor(l, meuCorretorId)
    if ((l.participantes?.length ?? 0) > 0) temRepasse = true

    const alvo = meses[mes - 1]
    alvo.total = arredondar(alvo.total + valor)
    alvo.minhaParte = arredondar(alvo.minhaParte + minha)
    alvo.quantidade++
    total = arredondar(total + valor)
    minhaParteTotal = arredondar(minhaParteTotal + minha)
  }

  const orfas = recebidas.filter((l) => !l.data_recebimento)

  return {
    ano,
    meses,
    total,
    minhaParteTotal,
    quantidade: doAno.length,
    semDataRecebimento: {
      quantidade: orfas.length,
      total: arredondar(orfas.reduce((s, l) => s + numero(l.valor_comissao), 0)),
    },
    temRepasse,
    anosDisponiveis,
  }
}
