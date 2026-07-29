// Comissão parcelada.
//
// `crm_comissoes` trata a comissão como valor único com uma data de
// recebimento — o modelo de quem vende com banco, onde o repasse sai de uma
// vez depois da assinatura.
//
// No financiamento direto não é assim: a comissão acompanha o recebimento da
// incorporadora e sai por etapa (assinatura, entrada quitada, N parcelas
// pagas). Sem parcela não dá para responder a única pergunta financeira que
// importa para o corretor autônomo: "quanto eu tenho a receber nos próximos
// 90 dias".

export const STATUS_PARCELA = ['prevista', 'recebida', 'cancelada'] as const
export type StatusParcela = (typeof STATUS_PARCELA)[number]

export type Parcela = {
  id?: string
  numero: number
  descricao?: string | null
  valor: number
  data_prevista: string
  data_pagamento?: string | null
  status: StatusParcela
}

const centavos = (n: number) => Math.round(n * 100)
const doCentavo = (n: number) => Math.round(n) / 100

/**
 * Divide um valor em N parcelas mensais.
 *
 * A divisão é feita em centavos e o RESTO vai para a última parcela. Dividir
 * R$ 10.000 em 3 dá 3.333,333…: arredondar cada uma isoladamente produziria
 * R$ 9.999,99 e a comissão nunca fecharia com o total. Aqui a soma das
 * parcelas é sempre exatamente o valor total.
 */
export function gerarParcelas(
  valorTotal: number,
  quantidade: number,
  primeiraData: string,
  intervaloMeses = 1,
): Parcela[] {
  if (!(valorTotal > 0)) return []
  const n = Math.max(1, Math.floor(quantidade))

  const totalCent = centavos(valorTotal)
  const base = Math.floor(totalCent / n)
  const resto = totalCent - base * n

  return Array.from({ length: n }, (_, i) => ({
    numero: i + 1,
    descricao: n === 1 ? 'Parcela única' : `Parcela ${i + 1}/${n}`,
    // O resto inteiro na última, não espalhado: é o que o corretor confere
    // contra o extrato da incorporadora.
    valor: doCentavo(i === n - 1 ? base + resto : base),
    data_prevista: somarMeses(primeiraData, i * Math.max(1, Math.floor(intervaloMeses))),
    data_pagamento: null,
    status: 'prevista' as StatusParcela,
  }))
}

/**
 * Soma meses a uma data AAAA-MM-DD sem passar por Date.
 *
 * `new Date('2026-01-31')` + 1 mês em JavaScript vira 03/03 (o mês estoura
 * para março), o que colocaria a parcela no mês errado do fluxo de caixa.
 * Aqui o dia é grampeado no último dia válido do mês de destino.
 */
export function somarMeses(dataIso: string, meses: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataIso)
  if (!m) return dataIso
  const ano = Number(m[1])
  const mes = Number(m[2])
  const dia = Number(m[3])

  const totalMeses = (ano * 12 + (mes - 1)) + meses
  const anoDestino = Math.floor(totalMeses / 12)
  const mesDestino = (totalMeses % 12) + 1
  const ultimoDia = new Date(Date.UTC(anoDestino, mesDestino, 0)).getUTCDate()
  const diaDestino = Math.min(dia, ultimoDia)

  return `${String(anoDestino).padStart(4, '0')}-${String(mesDestino).padStart(2, '0')}-${String(diaDestino).padStart(2, '0')}`
}

export type ResumoParcelas = {
  total: number
  recebido: number
  aReceber: number
  vencido: number
  proximos90Dias: number
  quantidade: number
  quantidadeRecebidas: number
  quantidadeVencidas: number
  percentualRecebido: number
  proximaParcela: Parcela | null
}

/**
 * Fotografia do fluxo de caixa das parcelas.
 *
 * "Vencido" é parcela prevista com data no passado — dinheiro que era para
 * ter entrado e não entrou. É o número que dispara cobrança, e por isso sai
 * separado de "a receber" em vez de somado nele.
 */
export function resumirParcelas(parcelas: Parcela[], hoje: string): ResumoParcelas {
  const limite90 = somarDias(hoje, 90)

  let total = 0
  let recebido = 0
  let aReceber = 0
  let vencido = 0
  let proximos90 = 0
  let qtdRecebidas = 0
  let qtdVencidas = 0
  let quantidade = 0
  let proxima: Parcela | null = null

  for (const p of parcelas) {
    // Parcela cancelada não é dívida nem receita: sai de todos os totais,
    // inclusive do denominador do percentual.
    if (p.status === 'cancelada') continue
    quantidade++
    total += p.valor

    if (p.status === 'recebida') {
      recebido += p.valor
      qtdRecebidas++
      continue
    }

    aReceber += p.valor
    if (p.data_prevista < hoje) {
      vencido += p.valor
      qtdVencidas++
    } else if (p.data_prevista <= limite90) {
      proximos90 += p.valor
    }

    // A próxima é a prevista mais antiga ainda não vencida — a que o corretor
    // deve estar esperando cair.
    if (p.data_prevista >= hoje && (!proxima || p.data_prevista < proxima.data_prevista)) {
      proxima = p
    }
  }

  return {
    total: doCentavo(centavos(total)),
    recebido: doCentavo(centavos(recebido)),
    aReceber: doCentavo(centavos(aReceber)),
    vencido: doCentavo(centavos(vencido)),
    // Vencido conta como "próximos 90 dias" para efeito de expectativa de
    // caixa: é dinheiro que ainda deve entrar, só que atrasado.
    proximos90Dias: doCentavo(centavos(proximos90 + vencido)),
    quantidade,
    quantidadeRecebidas: qtdRecebidas,
    quantidadeVencidas: qtdVencidas,
    percentualRecebido: total > 0 ? Math.round((recebido / total) * 100) : 0,
    proximaParcela: proxima,
  }
}

export function somarDias(dataIso: string, dias: number): string {
  const t = Date.parse(`${dataIso}T00:00:00Z`)
  if (!Number.isFinite(t)) return dataIso
  return new Date(t + dias * 86_400_000).toISOString().slice(0, 10)
}

export type ParcelaInsert = {
  comissao_id: string
  numero: number
  descricao: string | null
  valor: number
  data_prevista: string
  status: StatusParcela
}

export type ResultadoNormalizacaoParcela =
  | { ok: true; inserts: ParcelaInsert[] }
  | { ok: false; erro: string }

const EH_DATA = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)

/**
 * Valida o plano de parcelamento antes de gravar.
 *
 * A soma das parcelas é conferida contra o valor da comissão com tolerância
 * de um centavo: passar disso significa que alguém editou os valores à mão de
 * um jeito que não fecha, e o relatório de caixa mentiria em silêncio.
 */
export function normalizarParcelas(
  comissaoId: string,
  valorComissao: number,
  parcelas: unknown,
): ResultadoNormalizacaoParcela {
  if (!Array.isArray(parcelas) || parcelas.length === 0) {
    return { ok: false, erro: 'Informe ao menos uma parcela' }
  }
  if (parcelas.length > 240) {
    return { ok: false, erro: 'Máximo de 240 parcelas' }
  }

  const inserts: ParcelaInsert[] = []
  const numerosVistos = new Set<number>()
  let soma = 0

  for (const [i, bruto] of parcelas.entries()) {
    const p = bruto as Record<string, unknown>
    const numero = Number(p.numero ?? i + 1)
    if (!Number.isInteger(numero) || numero < 1) {
      return { ok: false, erro: `Parcela ${i + 1}: número inválido` }
    }
    if (numerosVistos.has(numero)) {
      return { ok: false, erro: `Parcela ${numero} está repetida` }
    }
    numerosVistos.add(numero)

    const valor = Number(p.valor)
    if (!Number.isFinite(valor) || valor <= 0) {
      return { ok: false, erro: `Parcela ${numero}: valor deve ser maior que zero` }
    }

    if (!EH_DATA(p.data_prevista)) {
      return { ok: false, erro: `Parcela ${numero}: data_prevista deve estar no formato AAAA-MM-DD` }
    }

    const status = typeof p.status === 'string' ? p.status : 'prevista'
    if (!(STATUS_PARCELA as readonly string[]).includes(status)) {
      return { ok: false, erro: `Parcela ${numero}: status inválido` }
    }

    if (status !== 'cancelada') soma += valor

    inserts.push({
      comissao_id: comissaoId,
      numero,
      descricao: typeof p.descricao === 'string' && p.descricao.trim() ? p.descricao.trim().slice(0, 200) : null,
      valor: doCentavo(centavos(valor)),
      data_prevista: p.data_prevista,
      status: status as StatusParcela,
    })
  }

  if (Math.abs(centavos(soma) - centavos(valorComissao)) > 1) {
    return {
      ok: false,
      erro: `As parcelas somam ${soma.toFixed(2)} e a comissão é ${valorComissao.toFixed(2)}.`,
    }
  }

  return { ok: true, inserts: inserts.sort((a, b) => a.numero - b.numero) }
}
