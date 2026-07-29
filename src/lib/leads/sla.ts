// SLA de primeiro atendimento.
//
// Lead de tráfego pago que não é atendido nos primeiros minutos esfria — ele
// mandou mensagem para mais três corretores no mesmo intervalo. O sistema já
// tinha `leads.primeiro_atendimento_em` e `alerta_sem_atendimento` sem nada
// que dissesse contra qual prazo comparar; o alvo agora vive em
// crm_metas_diarias.sla_primeiro_atendimento_min.
//
// Função pura, `agora` injetado, para o teste não depender do relógio.

export type EstadoSla = 'atendido' | 'ok' | 'atencao' | 'estourado'

export type LeadParaSla = {
  created_at?: string | null
  primeiro_atendimento_em?: string | null
}

export type ResultadoSla = {
  estado: EstadoSla
  /** Minutos restantes; negativo quando já estourou. Null se não se aplica. */
  restanteMin: number | null
  /** Rótulo curto para o card. */
  texto: string
  /** Só é urgente quando ainda dá para agir — depois de atendido, não é. */
  urgente: boolean
}

export const SLA_PADRAO_MIN = 15

function ms(iso: string | null | undefined): number | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  return Number.isFinite(t) ? t : null
}

function formatarDuracao(minutos: number): string {
  const total = Math.abs(Math.round(minutos * 60))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Estado do SLA de um lead.
 *
 * Sem `created_at` utilizável não há de quando contar, e inventar um marco
 * ("assume que chegou agora") mostraria um cronômetro cheio para um lead
 * antigo — pior que não mostrar nada.
 */
export function statusSla(
  lead: LeadParaSla,
  slaMin: number = SLA_PADRAO_MIN,
  agora: Date = new Date(),
): ResultadoSla {
  // Atendido vence tudo: o cronômetro parou quando o corretor respondeu, e
  // seguir contando transformaria um lead já trabalhado em alarme permanente.
  if (lead.primeiro_atendimento_em) {
    return { estado: 'atendido', restanteMin: null, texto: 'Atendido', urgente: false }
  }

  const nascimento = ms(lead.created_at)
  const limite = Number.isFinite(slaMin) && slaMin > 0 ? slaMin : SLA_PADRAO_MIN
  if (nascimento === null) {
    return { estado: 'atendido', restanteMin: null, texto: '', urgente: false }
  }

  const restanteMin = (nascimento + limite * 60_000 - agora.getTime()) / 60_000

  if (restanteMin < 0) {
    return {
      estado: 'estourado',
      restanteMin,
      texto: `SLA vencido há ${formatarDuracao(restanteMin)}`,
      urgente: true,
    }
  }

  // Metade do prazo é o ponto em que ainda dá para responder com calma; daí
  // para baixo o card precisa gritar.
  const estado: EstadoSla = restanteMin <= limite / 2 ? 'atencao' : 'ok'
  return { estado, restanteMin, texto: `${formatarDuracao(restanteMin)} restantes`, urgente: estado === 'atencao' }
}

/** Cor do selo por estado — os quatro casos, para a tela não decidir sozinha. */
export const CORES_SLA: Record<EstadoSla, { fundo: string; texto: string }> = {
  atendido: { fundo: 'rgba(34,197,94,0.12)', texto: '#15803d' },
  ok: { fundo: 'rgba(59,130,246,0.12)', texto: '#1d4ed8' },
  atencao: { fundo: 'rgba(245,158,11,0.16)', texto: '#b45309' },
  estourado: { fundo: 'rgba(239,68,68,0.14)', texto: '#b91c1c' },
}
