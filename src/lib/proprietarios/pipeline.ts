// Fonte única do pipeline de CAPTAÇÃO DE IMÓVEIS (proprietários que querem
// vender ou alugar) — deliberadamente separado de ESTAGIOS_FUNIL, que é o
// funil de COMPRADORES em src/lib/dashboard/estagios.ts.
//
// Por que dois pipelines e não um só com um campo "tipo":
// misturar os dois arruína a leitura de métrica. "Custo por lead" de um
// comprador e de um proprietário medem negócios diferentes — um gera comissão
// de venda, o outro gera estoque. Um CPL de proprietário baixo sem avaliação
// agendada não é resultado; um CPL de comprador baixo sem visita também não,
// mas as taxas intermediárias não são comparáveis entre si. Somados na mesma
// coluna, os dois viram uma média que não descreve nenhum dos dois.

export const ESTAGIOS_CAPTACAO = [
  { key: 'novo', label: 'Novo Proprietário', cor: '#6b7280' },
  { key: 'contato_feito', label: 'Contato Feito', cor: '#3b82f6' },
  { key: 'pre_qualificado', label: 'Pré-Qualificado', cor: '#8b5cf6' },
  { key: 'avaliacao_agendada', label: 'Avaliação Agendada', cor: '#ec4899' },
  { key: 'visita_realizada', label: 'Visita Realizada', cor: '#f59e0b' },
  { key: 'autorizacao', label: 'Autorização', cor: '#D24E22' },
  { key: 'fotos_documentos', label: 'Fotos e Documentos', cor: '#0ea5e9' },
  { key: 'publicado', label: 'Publicado', cor: '#22c55e' },
  { key: 'concluido', label: 'Vendido / Alugado', cor: '#15803d' },
  { key: 'perdido', label: 'Perdido', cor: '#991b1b' },
] as const

export type EstagioCaptacao = (typeof ESTAGIOS_CAPTACAO)[number]['key']

const CHAVES = new Set<string>(ESTAGIOS_CAPTACAO.map((e) => e.key))

export function estagioCaptacaoValido(valor: unknown): valor is EstagioCaptacao {
  return typeof valor === 'string' && CHAVES.has(valor)
}

export function rotuloEstagioCaptacao(chave: string): string {
  return ESTAGIOS_CAPTACAO.find((e) => e.key === chave)?.label ?? chave
}

/** Estágios em que o imóvel ainda NÃO virou estoque publicável. */
export const ESTAGIOS_EM_ANDAMENTO: readonly EstagioCaptacao[] = [
  'novo', 'contato_feito', 'pre_qualificado', 'avaliacao_agendada', 'visita_realizada', 'autorizacao', 'fotos_documentos',
]

/** Encerrados: não entram em fila de trabalho nem contam como pendência. */
export const ESTAGIOS_ENCERRADOS: readonly EstagioCaptacao[] = ['concluido', 'perdido']

export const INTENCOES = ['vender', 'alugar'] as const
export type Intencao = (typeof INTENCOES)[number]

export function intencaoValida(valor: unknown): valor is Intencao {
  return typeof valor === 'string' && (INTENCOES as readonly string[]).includes(valor)
}

export const TIPOS_IMOVEL = ['apartamento', 'casa', 'terreno', 'comercial', 'outro'] as const
export type TipoImovel = (typeof TIPOS_IMOVEL)[number]

export function tipoImovelValido(valor: unknown): valor is TipoImovel {
  return typeof valor === 'string' && (TIPOS_IMOVEL as readonly string[]).includes(valor)
}

/**
 * "Captado" tem definição operacional, não é sentimento: só conta quando existe
 * autorização do proprietário. Sem isso, o corretor não pode anunciar — então
 * contar como captação antes disso infla a métrica e esconde o gargalo real,
 * que costuma ser justamente conseguir a assinatura.
 */
export function foiCaptado(p: { estagio?: string | null; autorizacao?: boolean | null }): boolean {
  if (!p.autorizacao) return false
  return p.estagio === 'autorizacao' || p.estagio === 'fotos_documentos' || p.estagio === 'publicado' || p.estagio === 'concluido'
}

export type MetricasCaptacao = {
  total: number
  emAndamento: number
  contatados: number
  avaliacoesAgendadas: number
  avaliacoesRealizadas: number
  captados: number
  publicados: number
  concluidos: number
  perdidos: number
  /** Percentual de quem saiu de "novo" — mede se o SLA de contato funciona. */
  taxaContato: number
  /** Percentual dos contatados que aceitaram avaliação. */
  taxaAvaliacao: number
  /** Percentual das visitas realizadas que viraram autorização assinada. */
  taxaAutorizacao: number
}

type LinhaMetrica = { estagio?: string | null; autorizacao?: boolean | null }

// Ordem do pipeline: permite responder "chegou pelo menos até X" sem uma
// cascata de comparações espalhada pelas telas.
const ORDEM: Record<string, number> = Object.fromEntries(
  ESTAGIOS_CAPTACAO.map((e, i) => [e.key, i]),
)

function alcancou(estagio: string | null | undefined, alvo: EstagioCaptacao): boolean {
  if (!estagio || estagio === 'perdido') return false
  const a = ORDEM[estagio]
  const b = ORDEM[alvo]
  return a !== undefined && b !== undefined && a >= b
}

function pct(parte: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((parte / total) * 100)
}

export function calcularMetricasCaptacao(linhas: LinhaMetrica[]): MetricasCaptacao {
  const total = linhas.length
  const emAndamento = linhas.filter((l) => ESTAGIOS_EM_ANDAMENTO.includes(l.estagio as EstagioCaptacao)).length
  const contatados = linhas.filter((l) => alcancou(l.estagio, 'contato_feito')).length
  const avaliacoesAgendadas = linhas.filter((l) => alcancou(l.estagio, 'avaliacao_agendada')).length
  const avaliacoesRealizadas = linhas.filter((l) => alcancou(l.estagio, 'visita_realizada')).length
  const captados = linhas.filter((l) => foiCaptado(l)).length
  const publicados = linhas.filter((l) => alcancou(l.estagio, 'publicado')).length
  const concluidos = linhas.filter((l) => l.estagio === 'concluido').length
  const perdidos = linhas.filter((l) => l.estagio === 'perdido').length

  return {
    total,
    emAndamento,
    contatados,
    avaliacoesAgendadas,
    avaliacoesRealizadas,
    captados,
    publicados,
    concluidos,
    perdidos,
    taxaContato: pct(contatados, total),
    taxaAvaliacao: pct(avaliacoesAgendadas, contatados),
    taxaAutorizacao: pct(captados, avaliacoesRealizadas),
  }
}
