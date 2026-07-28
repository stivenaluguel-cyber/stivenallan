// Metas diárias do corretor.
//
// A diferença em relação a como isso costuma ser feito: aqui o corretor NÃO
// digita quantos contatos, follow-ups e visitas fez — o sistema já registra
// isso em crm_focus_events e crm_agenda. Só sobra registro manual para o que
// acontece fora do sistema (vídeo publicado, reunião presencial).

export const ATIVIDADES = [
  { chave: 'novos_contatos', label: 'Novos contatos', origem: 'automatica' },
  { chave: 'followups', label: 'Follow-ups', origem: 'automatica' },
  { chave: 'visitas', label: 'Visitas a imóveis', origem: 'automatica' },
  { chave: 'conteudos', label: 'Conteúdo publicado', origem: 'manual' },
  { chave: 'reunioes', label: 'Reunião presencial', origem: 'manual' },
] as const

export type ChaveAtividade = (typeof ATIVIDADES)[number]['chave']
export type OrigemAtividade = 'automatica' | 'manual'

export type MetasDiarias = Record<ChaveAtividade, number>
export type ResumoDia = Record<ChaveAtividade, number>

export const METAS_PADRAO: MetasDiarias = {
  novos_contatos: 20,
  followups: 10,
  visitas: 2,
  conteudos: 1,
  reunioes: 1,
}

export type ProgressoAtividade = {
  chave: ChaveAtividade
  label: string
  origem: OrigemAtividade
  feito: number
  meta: number
  percentual: number
  cumprida: boolean
}

export type ProgressoDia = {
  itens: ProgressoAtividade[]
  percentualGeral: number
  cumpridas: number
  total: number
  diaCompleto: boolean
}

// Metas em 0 significam "não acompanho isso" — a atividade some do painel
// em vez de aparecer eternamente como 0/0 cumprida.
export function calcularProgresso(resumo: ResumoDia, metas: MetasDiarias): ProgressoDia {
  const itens: ProgressoAtividade[] = ATIVIDADES.filter((a) => (metas[a.chave] ?? 0) > 0).map((a) => {
    const meta = metas[a.chave]
    const feito = Math.max(0, resumo[a.chave] ?? 0)
    return {
      chave: a.chave,
      label: a.label,
      origem: a.origem,
      feito,
      meta,
      // Limitado a 100: fazer 40 contatos não compensa não ter feito visita
      // nenhuma — o painel é sobre cumprir a rotina, não sobre somar pontos.
      percentual: Math.min(100, Math.round((feito / meta) * 100)),
      cumprida: feito >= meta,
    }
  })

  const cumpridas = itens.filter((i) => i.cumprida).length
  const percentualGeral = itens.length === 0 ? 0 : Math.round(itens.reduce((s, i) => s + i.percentual, 0) / itens.length)

  return { itens, percentualGeral, cumpridas, total: itens.length, diaCompleto: itens.length > 0 && cumpridas === itens.length }
}

// Um empurrão só quando ainda dá tempo de agir: depois das 18h, com algo
// pendente. Nada de alerta às 8h da manhã cobrando o dia que mal começou.
export function mensagemDoDia(progresso: ProgressoDia, horaLocal: number): string | null {
  if (progresso.total === 0) return null
  if (progresso.diaCompleto) return 'Rotina do dia completa.'
  if (horaLocal < 18) return null

  const faltando = progresso.itens.filter((i) => !i.cumprida)
  const resumo = faltando
    .map((i) => `${i.meta - i.feito} ${i.label.toLowerCase()}`)
    .join(' · ')
  return `Faltam para fechar o dia: ${resumo}`
}

export function normalizarMetas(bruto: Partial<Record<ChaveAtividade, unknown>> | null | undefined): MetasDiarias {
  const out = { ...METAS_PADRAO }
  if (!bruto) return out
  for (const { chave } of ATIVIDADES) {
    const cru = bruto[chave]
    // null/undefined/'' significam "não informado" → mantém o padrão.
    // Zero EXPLÍCITO é diferente: desliga o acompanhamento da atividade.
    // Sem esta distinção, Number(null) === 0 zeraria a meta silenciosamente.
    if (cru === null || cru === undefined || cru === '') continue
    const v = Number(cru)
    if (Number.isFinite(v) && v >= 0) out[chave] = Math.floor(v)
  }
  return out
}

export function normalizarResumo(bruto: Partial<Record<ChaveAtividade, unknown>> | null | undefined): ResumoDia {
  const out: ResumoDia = { novos_contatos: 0, followups: 0, visitas: 0, conteudos: 0, reunioes: 0 }
  if (!bruto) return out
  for (const { chave } of ATIVIDADES) {
    const v = Number(bruto[chave])
    if (Number.isFinite(v) && v > 0) out[chave] = Math.floor(v)
  }
  return out
}
