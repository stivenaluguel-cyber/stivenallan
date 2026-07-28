// Comissão de venda dividida entre quem captou o imóvel e quem vendeu.
//
// É a peça que faltava para a rede de corretores parceiros: hoje a venda
// vira uma linha solta, sem registrar quanto cabe a cada lado nem se já foi
// pago. O percentual total é da operação (6% por padrão); a divisão
// captador/vendedor é interna a ele, não somada por cima.

export const STATUS_COMISSAO = ['prevista', 'confirmada', 'recebida', 'cancelada'] as const
export type StatusComissao = (typeof STATUS_COMISSAO)[number]

export const PERCENTUAL_PADRAO = 6
const STATUS_VALIDOS = new Set<string>(STATUS_COMISSAO)

export type DivisaoComissao = {
  valorComissao: number
  valorCaptador: number
  valorVendedor: number
  percentualCaptador: number
  percentualVendedor: number
}

export type EntradaCalculo = {
  valorVenda: number
  percentualTotal?: number
  percentualCaptador?: number
  temCaptador?: boolean
  temVendedor?: boolean
}

function arredondar(v: number): number {
  return Math.round(v * 100) / 100
}

// Quando só existe um corretor no negócio, ele fica com 100% — dividir 50/50
// com ninguém deixaria metade da comissão sem dono no relatório.
export function calcularDivisao(entrada: EntradaCalculo): DivisaoComissao {
  const percentualTotal = entrada.percentualTotal ?? PERCENTUAL_PADRAO
  const valorComissao = arredondar(entrada.valorVenda * (percentualTotal / 100))

  const temCaptador = entrada.temCaptador ?? true
  const temVendedor = entrada.temVendedor ?? true

  let pctCaptador: number
  if (temCaptador && temVendedor) {
    const bruto = entrada.percentualCaptador ?? 50
    pctCaptador = Math.min(100, Math.max(0, bruto))
  } else if (temCaptador) {
    pctCaptador = 100
  } else if (temVendedor) {
    pctCaptador = 0
  } else {
    pctCaptador = 0
  }

  const pctVendedor = 100 - pctCaptador
  const valorCaptador = arredondar(valorComissao * (pctCaptador / 100))

  return {
    valorComissao,
    valorCaptador,
    // Subtrai em vez de recalcular: garante que as duas partes somem
    // exatamente o total, sem sobrar centavo por arredondamento.
    valorVendedor: arredondar(valorComissao - valorCaptador),
    percentualCaptador: pctCaptador,
    percentualVendedor: pctVendedor,
  }
}

export type ComissaoRegistro = {
  status: string
  valor_comissao: number | string | null
  valor_venda: number | string | null
  corretor_captador_id?: string | null
  corretor_vendedor_id?: string | null
  percentual_captador?: number | string | null
}

export type ResumoComissoes = {
  previsto: number
  confirmado: number
  recebido: number
  totalVendas: number
  quantidade: number
  porCorretor: { corretorId: string; valor: number }[]
}

const numero = (v: unknown): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

// Canceladas ficam fora de qualquer soma — inclusive do total de vendas.
export function resumirComissoes(registros: ComissaoRegistro[]): ResumoComissoes {
  const porCorretor = new Map<string, number>()
  let previsto = 0, confirmado = 0, recebido = 0, totalVendas = 0, quantidade = 0

  for (const r of registros) {
    if (r.status === 'cancelada') continue
    const comissao = numero(r.valor_comissao)
    quantidade++
    totalVendas += numero(r.valor_venda)

    if (r.status === 'prevista') previsto += comissao
    else if (r.status === 'confirmada') confirmado += comissao
    else if (r.status === 'recebida') recebido += comissao

    const pctCap = r.percentual_captador === null || r.percentual_captador === undefined ? 50 : numero(r.percentual_captador)
    const valorCap = comissao * (pctCap / 100)
    if (r.corretor_captador_id) {
      porCorretor.set(r.corretor_captador_id, (porCorretor.get(r.corretor_captador_id) ?? 0) + valorCap)
    }
    if (r.corretor_vendedor_id) {
      porCorretor.set(r.corretor_vendedor_id, (porCorretor.get(r.corretor_vendedor_id) ?? 0) + (comissao - valorCap))
    }
  }

  return {
    previsto: arredondar(previsto),
    confirmado: arredondar(confirmado),
    recebido: arredondar(recebido),
    totalVendas: arredondar(totalVendas),
    quantidade,
    porCorretor: [...porCorretor.entries()]
      .map(([corretorId, valor]) => ({ corretorId, valor: arredondar(valor) }))
      .sort((a, b) => b.valor - a.valor),
  }
}

export type ComissaoInsert = {
  proposta_id: string | null
  lead_id: string | null
  empreendimento_id: string | null
  valor_venda: number
  percentual_total: number
  valor_comissao: number
  corretor_captador_id: string | null
  corretor_vendedor_id: string | null
  percentual_captador: number
  percentual_vendedor: number
  status: StatusComissao
  data_venda: string | null
  observacoes: string | null
}

export type ResultadoNormalizacao =
  | { ok: true; insert: ComissaoInsert }
  | { ok: false; erro: string }

const texto = (v: unknown, max = 200): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null

export function normalizarComissao(body: Record<string, unknown>): ResultadoNormalizacao {
  const valorVenda = numero(body.valor_venda)
  if (!(valorVenda > 0)) return { ok: false, erro: 'valor_venda deve ser maior que zero' }

  const percentualTotal = body.percentual_total === undefined || body.percentual_total === null
    ? PERCENTUAL_PADRAO
    : numero(body.percentual_total)
  if (percentualTotal < 0 || percentualTotal > 100) {
    return { ok: false, erro: 'percentual_total deve estar entre 0 e 100' }
  }

  const captadorId = texto(body.corretor_captador_id, 64)
  const vendedorId = texto(body.corretor_vendedor_id, 64)
  if (!captadorId && !vendedorId) {
    return { ok: false, erro: 'informe ao menos um corretor (captador ou vendedor)' }
  }

  const divisao = calcularDivisao({
    valorVenda,
    percentualTotal,
    percentualCaptador: body.percentual_captador === undefined ? undefined : numero(body.percentual_captador),
    temCaptador: !!captadorId,
    temVendedor: !!vendedorId,
  })

  const statusBruto = texto(body.status, 20) ?? 'prevista'
  if (!STATUS_VALIDOS.has(statusBruto)) {
    return { ok: false, erro: 'status inválido' }
  }

  const dataVenda = texto(body.data_venda, 10)
  if (dataVenda && !/^\d{4}-\d{2}-\d{2}$/.test(dataVenda)) {
    return { ok: false, erro: 'data_venda deve estar no formato AAAA-MM-DD' }
  }

  return {
    ok: true,
    insert: {
      proposta_id: texto(body.proposta_id, 64),
      lead_id: texto(body.lead_id, 64),
      empreendimento_id: texto(body.empreendimento_id, 64),
      valor_venda: valorVenda,
      percentual_total: percentualTotal,
      valor_comissao: divisao.valorComissao,
      corretor_captador_id: captadorId,
      corretor_vendedor_id: vendedorId,
      percentual_captador: divisao.percentualCaptador,
      percentual_vendedor: divisao.percentualVendedor,
      status: statusBruto as StatusComissao,
      data_venda: dataVenda,
      observacoes: texto(body.observacoes, 1000),
    },
  }
}
