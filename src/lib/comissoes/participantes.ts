/**
 * Divisão da comissão entre quantos envolvidos o negócio tiver.
 *
 * O modelo antigo (captador × vendedor, somando 100) resolve a venda de dois
 * corretores e mais nada. Na rede de parceiros o negócio passa por três ou
 * quatro mãos — vendedor, captador, imobiliária, gerente, parceiro de
 * co-corretagem — e cada uma tem seu pedaço.
 *
 * Duas regras que parecem detalhe e não são:
 *
 * - Acima de 100% é ERRO: estaria prometendo mais comissão do que existe.
 * - Abaixo de 100% é AVISO, não erro. Dividir 60/20 e deixar 20 para decidir
 *   depois é situação real; travar isso obrigaria a inventar um participante
 *   fantasma só para fechar a conta.
 */

export const PAPEIS_COMISSAO = [
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'captador', label: 'Captador' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'imobiliaria', label: 'Imobiliária' },
  { value: 'parceiro', label: 'Parceiro (co-corretagem)' },
  { value: 'outro', label: 'Outro' },
] as const

export type PapelComissao = (typeof PAPEIS_COMISSAO)[number]['value']

const PAPEIS_VALIDOS = new Set<string>(PAPEIS_COMISSAO.map((p) => p.value))

export const ROTULO_PAPEL: Record<string, string> = Object.fromEntries(
  PAPEIS_COMISSAO.map((p) => [p.value, p.label]),
)

export type ParticipanteEntrada = {
  corretor_id?: string | null
  nome?: string | null
  papel: string
  percentual: number | string
  observacoes?: string | null
}

export type ParticipanteNormalizado = {
  corretor_id: string | null
  nome: string | null
  papel: PapelComissao
  percentual: number
  observacoes: string | null
}

export type DivisaoParticipante = ParticipanteNormalizado & {
  /** Quanto cabe a este envolvido, em reais. */
  valor: number
  rotuloPapel: string
}

export type ResumoDivisao = {
  itens: DivisaoParticipante[]
  somaPercentual: number
  /** Percentual ainda não atribuído a ninguém. Negativo é impossível: acima de 100 vira erro antes. */
  sobraPercentual: number
  valorNaoAtribuido: number
  /** Passou de 100% — a tela avisa e a API recusa. */
  excedeu: boolean
}

const arredondar = (v: number): number => Math.round(v * 100) / 100

const numero = (v: unknown): number => {
  if (typeof v === 'string') {
    const limpo = v.replace(/\./g, '').replace(',', '.')
    const n = Number(limpo)
    return Number.isFinite(n) ? n : NaN
  }
  const n = Number(v)
  return Number.isFinite(n) ? n : NaN
}

const texto = (v: unknown, max = 200): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null

export type ResultadoParticipantes =
  | { ok: true; participantes: ParticipanteNormalizado[] }
  | { ok: false; erro: string }

export function normalizarParticipantes(bruto: unknown): ResultadoParticipantes {
  if (bruto === undefined || bruto === null) return { ok: true, participantes: [] }
  if (!Array.isArray(bruto)) return { ok: false, erro: 'participantes deve ser uma lista' }

  const participantes: ParticipanteNormalizado[] = []

  for (const [i, cru] of bruto.entries()) {
    const linha = i + 1
    if (!cru || typeof cru !== 'object') return { ok: false, erro: `envolvido ${linha}: formato inválido` }
    const item = cru as ParticipanteEntrada

    const papel = typeof item.papel === 'string' ? item.papel.trim() : ''
    if (!PAPEIS_VALIDOS.has(papel)) return { ok: false, erro: `envolvido ${linha}: papel inválido` }

    const corretorId = texto(item.corretor_id, 64)
    const nome = texto(item.nome, 120)
    // Sem corretor e sem nome a linha não diz de quem é o dinheiro.
    if (!corretorId && !nome) return { ok: false, erro: `envolvido ${linha}: informe o corretor ou o nome` }

    const percentual = numero(item.percentual)
    if (!Number.isFinite(percentual) || percentual <= 0 || percentual > 100) {
      return { ok: false, erro: `envolvido ${linha}: percentual deve ficar entre 0 e 100` }
    }

    participantes.push({
      corretor_id: corretorId,
      nome,
      papel: papel as PapelComissao,
      percentual: arredondar(percentual),
      observacoes: texto(item.observacoes, 500),
    })
  }

  const soma = arredondar(participantes.reduce((s, p) => s + p.percentual, 0))
  if (soma > 100) {
    return { ok: false, erro: `a soma dos percentuais é ${soma}%, acima de 100%` }
  }

  return { ok: true, participantes }
}

/**
 * Converte percentuais em reais.
 *
 * O último participante recebe a diferença em vez do próprio cálculo, para a
 * soma dos valores bater exatamente com o que foi distribuído — três
 * envolvidos com 33,33% cada arredondariam para menos e sumiriam com um
 * centavo que existe de verdade na conta bancária.
 */
export function dividirComissao(
  valorComissao: number,
  participantes: ParticipanteNormalizado[],
): ResumoDivisao {
  const somaPercentual = arredondar(participantes.reduce((s, p) => s + p.percentual, 0))
  const valorDistribuido = arredondar(valorComissao * (Math.min(somaPercentual, 100) / 100))

  let acumulado = 0
  const itens = participantes.map((p, i) => {
    const ultimo = i === participantes.length - 1
    const valor = ultimo
      ? arredondar(valorDistribuido - acumulado)
      : arredondar(valorComissao * (p.percentual / 100))
    acumulado = arredondar(acumulado + valor)
    return { ...p, valor, rotuloPapel: ROTULO_PAPEL[p.papel] ?? p.papel }
  })

  const sobraPercentual = arredondar(Math.max(0, 100 - somaPercentual))

  return {
    itens,
    somaPercentual,
    sobraPercentual,
    valorNaoAtribuido: arredondar(valorComissao * (sobraPercentual / 100)),
    excedeu: somaPercentual > 100,
  }
}
