// Meta mensal de resultado + calendário de metas batidas.
//
// As metas DIÁRIAS já existiam (contatos, follow-ups, visitas) e medem
// rotina. Faltavam duas coisas:
//
// 1. A meta de RESULTADO do mês — VGV, vendas e propostas. Rotina cumprida
//    sem venda continua sendo mês perdido, e o painel não dizia isso.
// 2. O HISTÓRICO. Saber que hoje foi 80% não vale nada sozinho; o que muda
//    comportamento é ver a sequência de dias batidos e onde ela quebrou.
//
// Sobre o histórico haver um dia "selado": ver o comentário da tabela
// crm_metas_dia_historico na migration. Em resumo — o dia encerrado congela
// com a meta que valia naquele dia, senão baixar a meta pintaria de verde
// meses inteiros retroativamente.

import type { ChaveAtividade, MetasDiarias, ResumoDia } from './metas-diarias'
import { calcularProgresso } from './metas-diarias'

export type MetasMensais = {
  meta_vgv: number
  meta_vendas: number
  meta_propostas: number
}

export const METAS_MENSAIS_PADRAO: MetasMensais = {
  meta_vgv: 0,
  meta_vendas: 0,
  meta_propostas: 0,
}

/** Normaliza qualquer data para o primeiro dia do mês (a competência). */
export function competenciaDe(data: string | Date): string {
  const s = typeof data === 'string' ? data : data.toISOString().slice(0, 10)
  const m = /^(\d{4})-(\d{2})/.exec(s)
  if (!m) return s
  return `${m[1]}-${m[2]}-01`
}

export function diasNoMes(competencia: string): number {
  const m = /^(\d{4})-(\d{2})/.exec(competencia)
  if (!m) return 30
  return new Date(Date.UTC(Number(m[1]), Number(m[2]), 0)).getUTCDate()
}

export function normalizarMetasMensais(bruto: Partial<Record<keyof MetasMensais, unknown>> | null | undefined): MetasMensais {
  const out = { ...METAS_MENSAIS_PADRAO }
  if (!bruto) return out
  for (const chave of Object.keys(METAS_MENSAIS_PADRAO) as (keyof MetasMensais)[]) {
    const cru = bruto[chave]
    // Mesma regra das metas diárias: null/undefined/'' é "não informado" e
    // mantém o padrão. Number(null) === 0 zeraria a meta em silêncio.
    if (cru === null || cru === undefined || cru === '') continue
    const v = typeof cru === 'string' ? Number(cru.replace(/\./g, '').replace(',', '.')) : Number(cru)
    if (Number.isFinite(v) && v >= 0) out[chave] = chave === 'meta_vgv' ? v : Math.floor(v)
  }
  return out
}

export type RealizadoMensal = { vgv: number; vendas: number; propostas: number }

export type ItemProgressoMensal = {
  chave: 'vgv' | 'vendas' | 'propostas'
  label: string
  feito: number
  meta: number
  percentual: number
  cumprida: boolean
  formato: 'moeda' | 'inteiro'
}

export type ProgressoMensal = {
  itens: ItemProgressoMensal[]
  percentualGeral: number
  // Quanto de VGV ainda falta por dia útil restante. É o número que responde
  // "dá para virar o mês?" — sem ele a barra de progresso só informa o
  // estrago sem sugerir o esforço.
  vgvFaltante: number
  diasUteisRestantes: number
  vgvPorDiaUtil: number
  noRitmo: boolean
}

const rotulos: Record<'vgv' | 'vendas' | 'propostas', string> = {
  vgv: 'VGV',
  vendas: 'Vendas',
  propostas: 'Propostas',
}

export function calcularProgressoMensal(
  metas: MetasMensais,
  realizado: RealizadoMensal,
  hoje: string,
): ProgressoMensal {
  const pares: { chave: 'vgv' | 'vendas' | 'propostas'; meta: number; feito: number; formato: 'moeda' | 'inteiro' }[] = [
    { chave: 'vgv', meta: metas.meta_vgv, feito: realizado.vgv, formato: 'moeda' },
    { chave: 'vendas', meta: metas.meta_vendas, feito: realizado.vendas, formato: 'inteiro' },
    { chave: 'propostas', meta: metas.meta_propostas, feito: realizado.propostas, formato: 'inteiro' },
  ]

  // Meta zero = "não acompanho isso", igual às diárias: some do painel em vez
  // de ficar eternamente como 0/0.
  const itens: ItemProgressoMensal[] = pares
    .filter((p) => p.meta > 0)
    .map((p) => ({
      chave: p.chave,
      label: rotulos[p.chave],
      feito: p.feito,
      meta: p.meta,
      percentual: Math.min(100, Math.round((p.feito / p.meta) * 100)),
      cumprida: p.feito >= p.meta,
      formato: p.formato,
    }))

  const percentualGeral = itens.length === 0
    ? 0
    : Math.round(itens.reduce((s, i) => s + i.percentual, 0) / itens.length)

  const vgvFaltante = Math.max(0, metas.meta_vgv - realizado.vgv)
  const diasUteisRestantes = diasUteisRestantesNoMes(hoje)

  // "No ritmo" compara o realizado com o proporcional já decorrido do mês.
  // Comparar com a meta cheia acusaria atraso todo dia 2.
  const decorrido = fracaoDecorridaDoMes(hoje)
  const esperado = metas.meta_vgv * decorrido

  return {
    itens,
    percentualGeral,
    vgvFaltante,
    diasUteisRestantes,
    vgvPorDiaUtil: diasUteisRestantes > 0 ? Math.round(vgvFaltante / diasUteisRestantes) : vgvFaltante,
    noRitmo: metas.meta_vgv === 0 ? true : realizado.vgv >= esperado,
  }
}

function partes(dataIso: string): { ano: number; mes: number; dia: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataIso)
  return m ? { ano: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]) } : null
}

/** Dias úteis (seg–sex) do dia de hoje até o fim do mês, hoje incluído. */
export function diasUteisRestantesNoMes(hoje: string): number {
  const p = partes(hoje)
  if (!p) return 0
  const ultimo = new Date(Date.UTC(p.ano, p.mes, 0)).getUTCDate()
  let n = 0
  for (let d = p.dia; d <= ultimo; d++) {
    const diaSemana = new Date(Date.UTC(p.ano, p.mes - 1, d)).getUTCDay()
    if (diaSemana !== 0 && diaSemana !== 6) n++
  }
  return n
}

function fracaoDecorridaDoMes(hoje: string): number {
  const p = partes(hoje)
  if (!p) return 1
  const ultimo = new Date(Date.UTC(p.ano, p.mes, 0)).getUTCDate()
  return p.dia / ultimo
}

// ─────────────────────────────────────────────────────────────────────
// Calendário de metas batidas
// ─────────────────────────────────────────────────────────────────────

export type StatusDia = 'completo' | 'parcial' | 'zerado' | 'futuro' | 'fim_de_semana'

export type DiaCalendario = {
  data: string
  dia: number
  diaSemana: number
  status: StatusDia
  cumpridas: number
  total: number
  percentual: number
  selado: boolean
  detalhe: Partial<Record<ChaveAtividade, { feito: number; meta: number }>>
}

export type Calendario = {
  competencia: string
  dias: DiaCalendario[]
  // Deslocamento da primeira célula da grade (0 = domingo), para a tela
  // desenhar o mês alinhado sem recalcular a data de novo.
  offsetInicial: number
  diasBatidos: number
  diasComAtividade: number
  diasAvaliados: number
  percentualDoMes: number
  sequenciaAtual: number
  melhorSequencia: number
}

export type RegistroSelado = {
  data: string
  cumpridas: number
  total: number
  percentual: number
  dia_completo: boolean
  metas?: Partial<MetasDiarias> | null
  resumo?: Partial<ResumoDia> | null
}

/**
 * Monta a grade do mês.
 *
 * Para cada dia: usa o registro SELADO quando existe (verdade histórica,
 * congelada com a meta da época) e cai para o cálculo ao vivo quando não
 * existe — o que cobre o dia de hoje e qualquer dia ainda não visitado.
 */
export function montarCalendario(params: {
  competencia: string
  hoje: string
  metasAtuais: MetasDiarias
  resumoPorDia: Record<string, ResumoDia>
  selados: RegistroSelado[]
}): Calendario {
  const { competencia, hoje, metasAtuais, resumoPorDia, selados } = params
  const comp = competenciaDe(competencia)
  const p = partes(comp)
  if (!p) {
    return {
      competencia: comp, dias: [], offsetInicial: 0, diasBatidos: 0, diasComAtividade: 0,
      diasAvaliados: 0, percentualDoMes: 0, sequenciaAtual: 0, melhorSequencia: 0,
    }
  }

  const seladoPorData = new Map(selados.map((s) => [s.data, s]))
  const total = diasNoMes(comp)
  const offsetInicial = new Date(Date.UTC(p.ano, p.mes - 1, 1)).getUTCDay()

  const dias: DiaCalendario[] = []

  for (let d = 1; d <= total; d++) {
    const data = `${comp.slice(0, 7)}-${String(d).padStart(2, '0')}`
    const diaSemana = new Date(Date.UTC(p.ano, p.mes - 1, d)).getUTCDay()
    const selado = seladoPorData.get(data)

    if (data > hoje) {
      dias.push({ data, dia: d, diaSemana, status: 'futuro', cumpridas: 0, total: 0, percentual: 0, selado: false, detalhe: {} })
      continue
    }

    let cumpridas: number
    let totalMetas: number
    let percentual: number
    const detalhe: DiaCalendario['detalhe'] = {}

    if (selado) {
      cumpridas = selado.cumpridas
      totalMetas = selado.total
      percentual = selado.percentual
      // O selado guarda metas e resumo da época; sem eles o tooltip não teria
      // o que mostrar, mas o status continua válido.
      const metasDoDia = selado.metas ?? {}
      const resumoDoDia = selado.resumo ?? {}
      for (const chave of Object.keys(metasDoDia) as ChaveAtividade[]) {
        const meta = Number(metasDoDia[chave] ?? 0)
        if (meta > 0) detalhe[chave] = { feito: Number(resumoDoDia[chave] ?? 0), meta }
      }
    } else {
      const resumo = resumoPorDia[data] ?? { novos_contatos: 0, followups: 0, visitas: 0, conteudos: 0, reunioes: 0 }
      const progresso = calcularProgresso(resumo, metasAtuais)
      cumpridas = progresso.cumpridas
      totalMetas = progresso.total
      percentual = progresso.percentualGeral
      for (const item of progresso.itens) detalhe[item.chave] = { feito: item.feito, meta: item.meta }
    }

    // Fim de semana sem nenhuma atividade não é um dia falhado: corretor
    // autônomo também descansa, e pintar sábado e domingo de vermelho todo
    // mês tornaria o calendário inútil. Fim de semana COM trabalho é avaliado
    // normalmente e conta para a sequência.
    const semAtividade = percentual === 0
    const ehFimDeSemana = diaSemana === 0 || diaSemana === 6

    const status: StatusDia =
      ehFimDeSemana && semAtividade ? 'fim_de_semana'
        : totalMetas > 0 && cumpridas === totalMetas ? 'completo'
          : semAtividade ? 'zerado'
            : 'parcial'

    dias.push({ data, dia: d, diaSemana, status, cumpridas, total: totalMetas, percentual, selado: !!selado, detalhe })
  }

  const avaliados = dias.filter((d) => d.status !== 'futuro' && d.status !== 'fim_de_semana')
  const batidos = avaliados.filter((d) => d.status === 'completo').length

  return {
    competencia: comp,
    dias,
    offsetInicial,
    diasBatidos: batidos,
    diasComAtividade: dias.filter((d) => d.percentual > 0).length,
    diasAvaliados: avaliados.length,
    percentualDoMes: avaliados.length === 0 ? 0 : Math.round((batidos / avaliados.length) * 100),
    ...calcularSequencias(dias),
  }
}

/**
 * Sequência de dias batidos.
 *
 * Fim de semana sem atividade é PULADO em vez de quebrar a sequência — bater
 * a meta na sexta e na segunda é uma sequência de dois, não duas de um.
 * A sequência atual é contada de trás para frente e ignora o dia de hoje
 * enquanto ele ainda não fechou, para o contador não zerar às 8 da manhã.
 */
function calcularSequencias(dias: DiaCalendario[]): { sequenciaAtual: number; melhorSequencia: number } {
  let melhor = 0
  let corrente = 0
  for (const d of dias) {
    if (d.status === 'futuro') break
    if (d.status === 'fim_de_semana') continue
    if (d.status === 'completo') { corrente++; melhor = Math.max(melhor, corrente) }
    else corrente = 0
  }

  const passados = dias.filter((d) => d.status !== 'futuro')
  let atual = 0
  for (let i = passados.length - 1; i >= 0; i--) {
    const d = passados[i]
    if (d.status === 'fim_de_semana') continue
    // O último dia da lista é hoje: se ainda não fechou, não conta contra.
    if (i === passados.length - 1 && d.status !== 'completo') continue
    if (d.status === 'completo') atual++
    else break
  }

  return { sequenciaAtual: atual, melhorSequencia: melhor }
}
