// Meta diária de follow-ups: "3/5 follow-ups hoje", fita semanal e streak.
//
// Usa a MESMA definição de follow-up do componente Frequência do Score
// (src/lib/score/interacoes.ts) — é o que o briefing pede ("Meta diária e
// Frequência precisam contar exatamente a mesma coisa"). Este módulo não
// sabe nada de leads_interacoes: recebe uma contagem por dia já agregada
// (uma RPC no banco, mesmo padrão de lib/score/operacao.ts) e só faz a
// matemática de calendário/streak. Função pura, testável sem banco.
//
// Todo corte de dia/semana é em America/Sao_Paulo (ver
// src/lib/dashboard/timezone-sp.ts) — sem isso, o servidor rodando em UTC
// vira o dia 3h antes da meia-noite real do corretor.

import { hojeEmSaoPaulo } from '@/lib/dashboard/timezone-sp'

export type EstadoDia = 'nao_iniciado' | 'em_andamento' | 'meta_batida'

export type ProgressoHoje = {
  feitos: number
  meta: number
  percentual: number
  estado: EstadoDia
}

export type DiaFita = {
  /** "YYYY-MM-DD" */
  data: string
  diaSemanaLabel: string
  ehHoje: boolean
  ehFuturo: boolean
  /** `null` quando o dia ainda não chegou — a UI renderiza "—", nunca 0. */
  feitos: number | null
  metaBatida: boolean
}

export type FitaSemanal = {
  dias: DiaFita[]
  inicioSemana: string
  fimSemana: string
}

export type ResolucaoSemana = {
  hoje: string
  inicioSemana: string
  fimSemana: string
}

const DIAS_SEMANA_LABEL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function addDaysToDateString(dataStr: string, dias: number): string {
  const d = new Date(dataStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

function diaDaSemana(dataStr: string): number {
  return new Date(dataStr + 'T00:00:00Z').getUTCDay()
}

// Segunda-feira (ISO) da semana que contém `hoje`. dow: 0=dom..6=sáb.
export function inicioSemana(hoje: string): string {
  const dow = diaDaSemana(hoje)
  const offset = dow === 0 ? -6 : 1 - dow
  return addDaysToDateString(hoje, offset)
}

/** Resolve "hoje" e a semana corrente (seg-dom) em America/Sao_Paulo a partir de um instante qualquer. */
export function resolverHojeESemana(baseDate: Date = new Date()): ResolucaoSemana {
  const hoje = hojeEmSaoPaulo(baseDate)
  const inicio = inicioSemana(hoje)
  return { hoje, inicioSemana: inicio, fimSemana: addDaysToDateString(inicio, 6) }
}

export function calcularEstadoDia(feitos: number, meta: number): EstadoDia {
  if (meta <= 0 || feitos <= 0) return 'nao_iniciado'
  if (feitos >= meta) return 'meta_batida'
  return 'em_andamento'
}

export function calcularProgressoHoje(feitosHoje: number, meta: number): ProgressoHoje {
  const percentual = meta > 0 ? Math.min(100, Math.round((feitosHoje / meta) * 100)) : 0
  return { feitos: feitosHoje, meta, percentual, estado: calcularEstadoDia(feitosHoje, meta) }
}

/**
 * contagemPorDia: mapa "YYYY-MM-DD" → follow-ups naquele dia. Só precisa
 * cobrir dias passados/hoje com follow-up real; dia ausente conta como 0
 * (dia sem nenhum registro é um zero MEDIDO, diferente de dia futuro, que
 * não tem valor nenhum ainda — por isso `feitos: null` só em `ehFuturo`).
 */
export function calcularFitaSemanal(hoje: string, meta: number, contagemPorDia: Record<string, number>): FitaSemanal {
  const inicio = inicioSemana(hoje)
  const dias: DiaFita[] = []
  for (let i = 0; i < 7; i++) {
    const data = addDaysToDateString(inicio, i)
    const ehFuturo = data > hoje
    const feitos = ehFuturo ? null : contagemPorDia[data] ?? 0
    dias.push({
      data,
      diaSemanaLabel: DIAS_SEMANA_LABEL[diaDaSemana(data)],
      ehHoje: data === hoje,
      ehFuturo,
      feitos,
      metaBatida: feitos !== null && meta > 0 && feitos >= meta,
    })
  }
  return { dias, inicioSemana: inicio, fimSemana: addDaysToDateString(inicio, 6) }
}

/**
 * Dias consecutivos com meta batida, terminando ONTEM, mais HOJE se hoje já
 * bateu. Um dia sem meta batida (inclusive ausente do mapa = 0) ZERA a
 * sequência ali — não pula o buraco.
 *
 * `meta` é aplicada retroativamente a todo o histórico: este sistema não
 * guarda qual era a meta em cada dia passado (só o valor atual em
 * crm_preferencias), então mudar a meta hoje recalcula a sequência inteira
 * contra o valor novo. É o único comportamento honesto sem uma tabela de
 * histórico de metas — melhor que fingir que dias antigos foram avaliados
 * contra uma meta que não existe mais.
 */
export function calcularStreak(hoje: string, meta: number, contagemPorDia: Record<string, number>, limiteDias = 365): number {
  if (meta <= 0) return 0

  const feitosHoje = contagemPorDia[hoje] ?? 0
  let streak = 0
  let cursor = hoje

  if (feitosHoje >= meta) {
    streak = 1
  }
  cursor = addDaysToDateString(hoje, -1)

  for (let i = 0; i < limiteDias; i++) {
    const feitos = contagemPorDia[cursor] ?? 0
    if (feitos < meta) break
    streak++
    cursor = addDaysToDateString(cursor, -1)
  }

  return streak
}

export type ResultadoMetaDiaria = {
  hoje: string
  meta: number
  progressoHoje: ProgressoHoje
  fita: FitaSemanal
  streak: number
}

/** Junta os três cálculos num resultado só, pronto pra API/UI. */
export function calcularMetaDiaria(hoje: string, meta: number, contagemPorDia: Record<string, number>): ResultadoMetaDiaria {
  return {
    hoje,
    meta,
    progressoHoje: calcularProgressoHoje(contagemPorDia[hoje] ?? 0, meta),
    fita: calcularFitaSemanal(hoje, meta, contagemPorDia),
    streak: calcularStreak(hoje, meta, contagemPorDia),
  }
}
