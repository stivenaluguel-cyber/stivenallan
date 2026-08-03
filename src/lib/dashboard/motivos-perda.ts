/**
 * Fonte única dos motivos de perda — o modal do Modo Foco oferece esta lista
 * e o relatório traduz os códigos gravados usando ela. Manter os rótulos aqui
 * (e não dentro do componente) evita a duplicação que já mordeu o enum de
 * estágios, e permite que o servidor leia os rótulos sem importar React.
 */
export const MOTIVOS_PERDA = [
  { value: 'sem_interesse', label: 'Sem interesse' },
  { value: 'sem_retorno', label: 'Sem retorno' },
  { value: 'orcamento_incompativel', label: 'Orçamento incompatível' },
  { value: 'comprou_com_outro', label: 'Comprou com outro corretor' },
  { value: 'cadastro_invalido', label: 'Cadastro inválido' },
  { value: 'outro', label: 'Outro' },
] as const

/**
 * Por que os leads estão sendo perdidos.
 *
 * O motivo já era coletado desde que o Modo Foco existe — toda vez que um
 * lead é marcado como perdido, o modal obriga a escolher um motivo e ele vai
 * para o metadata do evento. O que faltava era alguém ler: o dado estava
 * gravado e nunca virava pergunta respondida ("perdi 8 por orçamento" muda o
 * anúncio; "perdi 8 sem retorno" muda o follow-up).
 *
 * A contagem é de EVENTOS, não de leads: o mesmo lead pode ser perdido,
 * recuperado e perdido de novo, e as duas perdas contam — foram dois
 * negócios que não fecharam.
 */

export type EventoPerda = {
  metadata: { motivo?: unknown; detalhe?: unknown } | null
  created_at: string
  lead_id: string | null
}

export type MotivoAgregado = {
  motivo: string
  label: string
  total: number
  pct: number
  detalhes: string[]
}

const ROTULOS: Record<string, string> = Object.fromEntries(
  MOTIVOS_PERDA.map((m) => [m.value, m.label]),
)

// Perdas anteriores ao modal, ou gravadas por outro caminho, chegam sem
// motivo. Some-las a "Outro" mentiria: "outro" é uma escolha do corretor,
// isto aqui é ausência de escolha.
export const SEM_MOTIVO = 'nao_informado'

const textoDe = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

export function agruparMotivos(eventos: EventoPerda[]): {
  total: number
  porMotivo: MotivoAgregado[]
} {
  const acumulado = new Map<string, { total: number; detalhes: string[] }>()

  for (const e of eventos) {
    const motivo = textoDe(e.metadata?.motivo) || SEM_MOTIVO
    const atual = acumulado.get(motivo) ?? { total: 0, detalhes: [] }
    atual.total++
    const detalhe = textoDe(e.metadata?.detalhe)
    // O detalhe só interessa em "outro" e quando o corretor escreveu algo —
    // é ali que aparece o motivo que ainda não virou opção da lista.
    if (detalhe) atual.detalhes.push(detalhe)
    acumulado.set(motivo, atual)
  }

  const total = eventos.length

  return {
    total,
    porMotivo: [...acumulado.entries()]
      .map(([motivo, { total: n, detalhes }]) => ({
        motivo,
        label: ROTULOS[motivo] ?? (motivo === SEM_MOTIVO ? 'Sem motivo registrado' : motivo),
        total: n,
        pct: total > 0 ? Math.round((n / total) * 1000) / 10 : 0,
        detalhes: detalhes.slice(0, 5),
      }))
      // Maior primeiro: a tela existe para responder "qual é o meu maior
      // ralo", e ele tem que estar na primeira linha.
      .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, 'pt-BR')),
  }
}
