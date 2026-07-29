// Motor de lead score.
//
// A coluna `leads.lead_score` já existia, já aparecia em quatro telas e já
// ordenava a fila do Modo Foco — mas o único ponto do sistema que escrevia
// nela era o webhook do Resend somando pontos por abertura de e-mail. Na
// prática a fila vinha ordenada por zero.
//
// Duas decisões que mudam o resultado:
//
// 1. O score é EXPLICADO. Um "87" sozinho não diz o que fazer; o que move a
//    venda é saber que faltam documentos e que o lead sumiu há 12 dias. Por
//    isso devolvemos dimensões, fatores positivos, o que falta e a próxima
//    ação de maior alavancagem.
// 2. Os pesos são de financiamento DIRETO, não de venda com banco. Aqui quem
//    aprova o crédito é o corretor: entrada disponível e documento em mãos
//    valem mais do que qualquer sinal de engajamento.
//
// Função pura: recebe `agora` de fora para o teste não depender do relógio.

export type LeadParaScore = {
  nome?: string | null
  email?: string | null
  perfil?: string | null
  orcamento_min?: number | string | null
  orcamento_max?: number | string | null
  entrada_disponivel?: string | null
  faixa_investimento?: string | null
  prazo_compra?: string | null
  cidade_interesse?: string | null
  origem?: string | null
  ultimo_contato?: string | null
  created_at?: string | null
}

export type SinaisLead = {
  interacoes_total?: number | null
  interacoes_30d?: number | null
  ultima_interacao?: string | null
  eventos_total?: number | null
  eventos_comerciais?: number | null
  simulacoes?: number | null
  propostas?: number | null
  anexos?: number | null
  visitas_realizadas?: number | null
}

export type ChaveDimensao = 'perfil' | 'engajamento' | 'comportamento' | 'timing'

export type DimensaoScore = {
  chave: ChaveDimensao
  label: string
  pontos: number
  maximo: number
}

export type FatorScore = { rotulo: string; pontos: number }

export type Classificacao = 'quente' | 'morno' | 'frio'

export type ResultadoScore = {
  score: number
  classificacao: Classificacao
  dimensoes: DimensaoScore[]
  positivos: FatorScore[]
  negativos: string[]
  proximaAcao: string | null
  calculadoEm: string
}

export const MAXIMOS: Record<ChaveDimensao, number> = {
  perfil: 30,
  engajamento: 25,
  comportamento: 25,
  timing: 20,
}

const LABELS: Record<ChaveDimensao, string> = {
  perfil: 'Perfil',
  engajamento: 'Engajamento',
  comportamento: 'Comportamento',
  timing: 'Timing',
}

// Um lead só é "quente" quando tem perfil E ação comercial provada. Os
// cortes são altos de propósito: uma fila em que tudo é quente não prioriza
// nada.
export const CORTE_QUENTE = 70
export const CORTE_MORNO = 40

// Qualidade da origem. Indicação e busca orgânica chegam decididos; tráfego
// pago chega curioso; `whatsapp` é o default do sistema e não diz nada sobre
// intenção, então vale pouco.
const ORIGEM_ALTA = new Set(['indicacao', 'indicação', 'site', 'organico', 'orgânico', 'busca_organica'])
const ORIGEM_MEDIA = new Set(['meta_ads', 'facebook', 'facebook_ads', 'instagram', 'google_ads', 'google', 'campanha', 'email'])

function numero(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'string' ? Number(v.replace(/\./g, '').replace(',', '.')) : Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

function preenchido(v: unknown): boolean {
  return typeof v === 'string' ? v.trim().length > 0 : v !== null && v !== undefined
}

function inteiro(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

function diasDesde(iso: string | null | undefined, agora: Date): number | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return null
  // Data futura conta como "hoje" em vez de virar número negativo e ganhar
  // pontuação de recência indevida.
  return Math.max(0, Math.floor((agora.getTime() - t) / 86_400_000))
}

// Prazo declarado. O texto vem de formulário e de conversa, então casamos por
// trecho em vez de igualdade exata.
function pontosPrazo(prazo: string | null | undefined): { pontos: number; rotulo: string | null } {
  const p = (prazo ?? '').toLowerCase().trim()
  if (!p) return { pontos: 0, rotulo: null }
  if (/imediat|urgent|agora|30 dias|1 m[êe]s|este m[êe]s/.test(p)) return { pontos: 10, rotulo: 'Compra imediata' }
  if (/3 m[êe]s|trimestr|60 dias|90 dias/.test(p)) return { pontos: 7, rotulo: 'Compra em até 3 meses' }
  if (/6 m[êe]s|semestr|180 dias/.test(p)) return { pontos: 4, rotulo: 'Compra em até 6 meses' }
  if (/ano|12 m[êe]s|longo|futuro|pesquisando|sem pressa/.test(p)) return { pontos: 1, rotulo: 'Compra de longo prazo' }
  return { pontos: 3, rotulo: 'Prazo declarado' }
}

function pontosOrigem(origem: string | null | undefined): { pontos: number; rotulo: string | null } {
  const o = (origem ?? '').toLowerCase().trim()
  if (!o) return { pontos: 0, rotulo: null }
  if (ORIGEM_ALTA.has(o)) return { pontos: 4, rotulo: `Origem de alta qualidade: ${origem}` }
  if (ORIGEM_MEDIA.has(o)) return { pontos: 3, rotulo: `Origem de qualidade média: ${origem}` }
  return { pontos: 1, rotulo: `Origem: ${origem}` }
}

// Máximo 14 e não 10: somado ao excedente do prazo (6), fecha exatamente os
// 20 pontos da dimensão. Sem isso o timing teria teto inalcançável e nenhum
// lead conseguiria 100.
function pontosRecencia(dias: number | null): { pontos: number; rotulo: string | null } {
  if (dias === null) return { pontos: 0, rotulo: null }
  if (dias <= 3) return { pontos: 14, rotulo: 'Contato nos últimos 3 dias' }
  if (dias <= 7) return { pontos: 10, rotulo: 'Contato na última semana' }
  if (dias <= 15) return { pontos: 6, rotulo: 'Contato nos últimos 15 dias' }
  if (dias <= 30) return { pontos: 3, rotulo: 'Contato no último mês' }
  return { pontos: 0, rotulo: null }
}

export function calcularScore(
  lead: LeadParaScore,
  sinais: SinaisLead | null | undefined,
  agora: Date = new Date(),
): ResultadoScore {
  const s = sinais ?? {}
  const positivos: FatorScore[] = []
  const negativos: string[] = []
  const add = (rotulo: string | null, pontos: number) => {
    if (rotulo && pontos > 0) positivos.push({ rotulo, pontos })
    return pontos
  }

  // ── Perfil (30) — quem é e se cabe no financiamento direto ────────────
  let perfil = 0

  // Entrada é o campo que mais decide venda no direto: sem entrada não há
  // contrato, por mais quente que o lead pareça.
  if (preenchido(lead.entrada_disponivel)) perfil += add('Entrada disponível declarada', 9)
  else negativos.push('Não declarou entrada disponível')

  const orcamento = numero(lead.orcamento_max) ?? numero(lead.orcamento_min)
  if (orcamento) {
    perfil += add(
      `Orçamento até ${orcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}`,
      7,
    )
  } else if (preenchido(lead.faixa_investimento)) {
    perfil += add(`Faixa de investimento: ${lead.faixa_investimento}`, 7)
  } else {
    negativos.push('Sem orçamento ou faixa de investimento')
  }

  const prazo = pontosPrazo(lead.prazo_compra)
  if (prazo.pontos > 0) perfil += add(prazo.rotulo, Math.min(4, prazo.pontos))
  else negativos.push('Sem prazo de compra declarado')

  const origem = pontosOrigem(lead.origem)
  perfil += add(origem.rotulo, origem.pontos)

  if (preenchido(lead.nome)) perfil += 2
  else negativos.push('Sem nome')

  if (preenchido(lead.email)) perfil += 2
  else negativos.push('Sem e-mail')

  if (preenchido(lead.cidade_interesse)) perfil += 2
  perfil = Math.min(MAXIMOS.perfil, perfil)

  // ── Engajamento (25) — quanto ele responde ────────────────────────────
  let engajamento = 0
  const interacoes = inteiro(s.interacoes_total)
  if (interacoes >= 6) engajamento += add(`${interacoes} interações registradas`, 12)
  else if (interacoes >= 3) engajamento += add(`${interacoes} interações registradas`, 9)
  else if (interacoes >= 1) engajamento += add(`${interacoes} interação(ões) registrada(s)`, 5)
  else negativos.push('Nenhuma interação registrada')

  const recentes = inteiro(s.interacoes_30d)
  if (recentes >= 3) engajamento += add('Ativo no último mês', 8)
  else if (recentes >= 1) engajamento += add('Teve movimentação no último mês', 5)

  const visitas = inteiro(s.visitas_realizadas)
  if (visitas >= 1) engajamento += add(`${visitas} visita(s) realizada(s)`, 5)
  engajamento = Math.min(MAXIMOS.engajamento, engajamento)

  // ── Comportamento (25) — ação comercial PROVADA ───────────────────────
  // Só conta o que deixou rastro no sistema. "Achei que ele estava
  // interessado" não pontua.
  let comportamento = 0
  const propostas = inteiro(s.propostas)
  const simulacoes = inteiro(s.simulacoes)
  const anexos = inteiro(s.anexos)

  if (propostas >= 1) comportamento += add(`${propostas} proposta(s) enviada(s)`, 10)
  else negativos.push('Nenhuma proposta enviada')

  if (simulacoes >= 1) comportamento += add(`${simulacoes} simulação(ões) apresentada(s)`, 7)
  else negativos.push('Nenhuma simulação apresentada')

  if (anexos >= 3) comportamento += add(`${anexos} documentos anexados`, 8)
  else if (anexos >= 1) comportamento += add(`${anexos} documento(s) anexado(s)`, 5)
  else negativos.push('Sem documentos anexados')

  comportamento = Math.min(MAXIMOS.comportamento, comportamento)

  // ── Timing (20) — está esfriando? ─────────────────────────────────────
  let timing = 0
  // O contato mais recente entre o campo do lead e a última interação real:
  // atualizar só um dos dois é comum e usar apenas um deles envelheceria o
  // lead sem motivo.
  const diasUltimoContato = diasDesde(lead.ultimo_contato, agora)
  const diasUltimaInteracao = diasDesde(s.ultima_interacao, agora)
  const dias =
    diasUltimoContato === null ? diasUltimaInteracao
      : diasUltimaInteracao === null ? diasUltimoContato
        : Math.min(diasUltimoContato, diasUltimaInteracao)

  const recencia = pontosRecencia(dias)
  timing += add(recencia.rotulo, recencia.pontos)
  if (dias !== null && dias > 15) negativos.push(`Sem contato há ${dias} dias`)
  if (dias === null) negativos.push('Nunca foi contatado')

  timing += prazo.pontos > 4 ? prazo.pontos - 4 : 0 // o excedente do prazo pesa em timing
  if (prazo.pontos === 10) positivos.push({ rotulo: 'Prazo curto de decisão', pontos: 6 })
  timing = Math.min(MAXIMOS.timing, timing)

  const score = Math.max(0, Math.min(100, Math.round(perfil + engajamento + comportamento + timing)))

  const dimensoes: DimensaoScore[] = [
    { chave: 'perfil', label: LABELS.perfil, pontos: perfil, maximo: MAXIMOS.perfil },
    { chave: 'engajamento', label: LABELS.engajamento, pontos: engajamento, maximo: MAXIMOS.engajamento },
    { chave: 'comportamento', label: LABELS.comportamento, pontos: comportamento, maximo: MAXIMOS.comportamento },
    { chave: 'timing', label: LABELS.timing, pontos: timing, maximo: MAXIMOS.timing },
  ]

  return {
    score,
    classificacao: score >= CORTE_QUENTE ? 'quente' : score >= CORTE_MORNO ? 'morno' : 'frio',
    dimensoes,
    // Maior contribuição primeiro: é o que o corretor lê em dois segundos.
    positivos: positivos.sort((a, b) => b.pontos - a.pontos),
    negativos,
    proximaAcao: proximaAcao({ dias, anexos, simulacoes, propostas, lead }),
    calculadoEm: agora.toISOString(),
  }
}

// A única recomendação que importa: a de maior alavancagem agora. Listar
// cinco pendências de uma vez é o mesmo que não recomendar nada.
//
// A ordem é a do funil de financiamento direto — não adianta pedir documento
// de quem sumiu, nem mandar proposta para quem nunca viu uma simulação.
function proximaAcao(ctx: {
  dias: number | null
  anexos: number
  simulacoes: number
  propostas: number
  lead: LeadParaScore
}): string | null {
  const { dias, anexos, simulacoes, propostas, lead } = ctx

  if (dias === null) return 'Fazer o primeiro contato'
  if (dias > 15) return `Retomar contato — parado há ${dias} dias`
  if (!preenchido(lead.entrada_disponivel)) return 'Descobrir quanto ele tem de entrada'
  if (simulacoes === 0) return 'Apresentar uma simulação de parcelamento'
  if (anexos === 0) return 'Pedir os documentos para análise de crédito'
  if (propostas === 0) return 'Enviar a proposta'
  if (anexos < 3) return 'Completar a documentação para fechar a análise'
  return 'Fechar a venda'
}

// Formato gravado em `leads.lead_score_detalhe`. Só o que a tela precisa —
// o resultado inteiro tem redundância que não vale espaço no jsonb.
export function detalheParaPersistir(r: ResultadoScore) {
  return {
    classificacao: r.classificacao,
    dimensoes: r.dimensoes.map((d) => ({ chave: d.chave, pontos: d.pontos, maximo: d.maximo })),
    positivos: r.positivos.slice(0, 6),
    negativos: r.negativos.slice(0, 6),
    proxima_acao: r.proximaAcao,
    calculado_em: r.calculadoEm,
  }
}
