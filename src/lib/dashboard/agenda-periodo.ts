/**
 * Recortes da agenda: dia, semana e mês.
 *
 * A tela nasceu carregando um dia por vez, o que responde "o que tenho hoje?"
 * e nenhuma outra pergunta. "Que dia da semana ainda tem buraco para encaixar
 * uma visita?" e "esse mês está cheio ou vazio?" exigem ver o bloco inteiro —
 * e a API já aceitava data_ini/data_fim, só ninguém pedia mais de um dia.
 *
 * Toda conta de data ancora ao MEIO-DIA. Somar dias em cima de meia-noite
 * erra na virada de horário de verão: 00:00 + 1 dia pode cair em 23:00 do
 * mesmo dia e a semana volta com seis dias.
 */

import { toSaoPauloDateString } from './timezone-sp'

export const VISTAS = [
  { value: 'dia', label: 'Dia' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
] as const

export type Vista = (typeof VISTAS)[number]['value']

const aoMeioDia = (data: string): Date => new Date(data + 'T12:00:00')
const paraTexto = (d: Date): string => {
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export type Intervalo = { ini: string; fim: string }

/** Domingo a sábado — é como o calendário impresso brasileiro é lido. */
export function intervaloDaVista(vista: Vista, referencia: string): Intervalo {
  const d = aoMeioDia(referencia)

  if (vista === 'dia') return { ini: referencia, fim: referencia }

  if (vista === 'semana') {
    const inicio = new Date(d)
    inicio.setDate(inicio.getDate() - inicio.getDay())
    const fim = new Date(inicio)
    fim.setDate(fim.getDate() + 6)
    return { ini: paraTexto(inicio), fim: paraTexto(fim) }
  }

  const inicio = new Date(d.getFullYear(), d.getMonth(), 1, 12)
  // Dia 0 do mês seguinte é o último dia deste — evita a tabela de 28/30/31
  // e acerta fevereiro bissexto sem caso especial.
  const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0, 12)
  return { ini: paraTexto(inicio), fim: paraTexto(fim) }
}

/** Anterior/próximo anda na unidade da vista, não sempre de um dia. */
export function deslocar(vista: Vista, referencia: string, passo: number): string {
  const d = aoMeioDia(referencia)
  if (vista === 'dia') d.setDate(d.getDate() + passo)
  else if (vista === 'semana') d.setDate(d.getDate() + passo * 7)
  else d.setMonth(d.getMonth() + passo)
  return paraTexto(d)
}

export function rotuloDoPeriodo(vista: Vista, referencia: string, hoje: string): string {
  if (vista === 'dia') {
    const diff = Math.round(
      (aoMeioDia(referencia).getTime() - aoMeioDia(hoje).getTime()) / 86_400_000,
    )
    if (diff === 0) return 'Hoje'
    if (diff === 1) return 'Amanhã'
    if (diff === -1) return 'Ontem'
    return aoMeioDia(referencia).toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  }

  const { ini, fim } = intervaloDaVista(vista, referencia)

  if (vista === 'mes') {
    const texto = aoMeioDia(ini).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    return texto.charAt(0).toUpperCase() + texto.slice(1)
  }

  const curto = (s: string) => aoMeioDia(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  return `${curto(ini)} – ${curto(fim)}`
}

/**
 * Agrupa por dia mantendo os dias na ordem do calendário.
 *
 * Sem isto, semana e mês virariam uma lista corrida de eventos em que não dá
 * para ver onde estão os buracos — que é justamente o que se procura ao abrir
 * a semana.
 */
export function agruparPorDia<T extends { data_hora: string }>(eventos: T[]): { data: string; eventos: T[] }[] {
  const mapa = new Map<string, T[]>()

  for (const ev of eventos) {
    // Os getters locais (getFullYear/getMonth/getDate) leem no fuso do
    // PROCESSO, não de São Paulo — corretos só numa máquina configurada pra
    // SP; na Vercel e no CI (UTC) jogam evento das 21h de SP pro dia
    // seguinte. Precisa do conversor explícito de fuso.
    const dia = toSaoPauloDateString(ev.data_hora)
    const lista = mapa.get(dia) ?? []
    lista.push(ev)
    mapa.set(dia, lista)
  }

  return [...mapa.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([data, lista]) => ({
      data,
      eventos: lista.sort((a, b) => a.data_hora.localeCompare(b.data_hora)),
    }))
}

/** Link de navegação a partir do texto livre do campo "local". */
export function linksDeNavegacao(local: string): { maps: string; waze: string } | null {
  const consulta = local.trim()
  if (!consulta) return null
  const q = encodeURIComponent(consulta)
  return {
    maps: `https://www.google.com/maps/search/?api=1&query=${q}`,
    waze: `https://waze.com/ul?q=${q}&navigate=yes`,
  }
}
