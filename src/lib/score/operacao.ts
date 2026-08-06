// Score de Operação: um único índice (0-100) que resume o quão ativa está a
// operação do corretor e o que fazer para subir. Função pura — recebe os
// agregados já calculados (uma RPC no banco, ver
// supabase/migrations/*_score_operacao_agregados.sql) e devolve o resultado
// pronto pra UI. Nenhuma chamada de rede aqui, só matemática, pra poder ser
// testada sem banco.
//
// Dos 5 componentes do briefing original (Frequência, Portfólio,
// Diversificação, Velocidade de resposta, Perfil), 2 ficaram de fora.
// Ambos redistribuem o peso proporcionalmente entre os componentes que
// sobram — ver `COMPONENTES_OMITIDOS` abaixo:
//
// - Perfil (10 pts): sem tabela pra foto/CRECI/WhatsApp/bio/Instagram do
//   corretor — hoje é texto fixo no código do site público.
// - Portfólio (25 pts): removido na recalibração de ago/2026. `disponivel`
//   em empreendimentos_unidades só distingue vendida/não-vendida, não
//   "publicada/ativada pelo corretor" — as 578 unidades entraram todas num
//   único import em lote e ficam permanentemente disponivel=true. Sem
//   nenhuma coluna de publicação/destaque em empreendimentos_unidades nem
//   em empreendimentos (a única, `properties.ativo/oculto`, é uma tabela
//   sem FK pra unidades — ligar as duas seria inventar uma equivalência que
//   não existe), o componente ficava saturado pra sempre (25/25 fixo) e não
//   media esforço nenhum do corretor.

export type ChaveComponente = 'frequencia' | 'diversificacao' | 'velocidade'

export type Componente = {
  chave: ChaveComponente
  label: string
  /** Pontos ganhos neste componente, no teto ORIGINAL (30/20/15). `null` = não aplicável nesta apuração (ex.: zero leads no período). */
  pontos: number | null
  /** Teto original do componente, antes de qualquer redistribuição. */
  maximo: number
  /** Texto curto com o dado bruto por trás do ponto, pra exibir junto da barra. */
  detalhe: string
}

export type Faixa = 'frio' | 'morno' | 'aquecido' | 'quente'

export type Missao = {
  chave: ChaveComponente
  texto: string
  ganhoEstimado: number
  href: string
}

export type ResultadoScoreOperacao = {
  total: number
  faixa: Faixa
  faixaLabel: string
  /** Pontos que faltam pra próxima faixa; `null` quando já está na faixa máxima. */
  faltamProximaFaixa: number | null
  proximaFaixaLabel: string | null
  componentes: Componente[]
  missoes: Missao[]
  /** Componentes do briefing original que não têm fonte de dado real e por isso não entram no cálculo. */
  omitidos: { chave: string; motivo: string }[]
  /** true quando a conta é nova de verdade (zero leads e zero unidades desde sempre) — a UI deve mostrar "sem dados suficientes" em vez do card de score. */
  contaNova: boolean
}

export const COMPONENTES_OMITIDOS: { chave: string; motivo: string }[] = [
  {
    chave: 'perfil',
    motivo:
      'Sem tabela no banco com foto/CRECI/WhatsApp/bio/Instagram do corretor — esses campos hoje são texto fixo no código do site público, não um registro editável.',
  },
  {
    chave: 'portfolio',
    motivo:
      'Sem coluna de publicação/destaque em empreendimentos_unidades — "disponivel" só distingue vendida/não-vendida, e as 578 unidades entraram num único import em lote (permanecem 25/25 pra sempre). Removido na recalibração de ago/2026 em vez de manter saturado.',
  },
]

const FAIXAS: { chave: Faixa; label: string; min: number; max: number }[] = [
  { chave: 'frio', label: 'Frio', min: 0, max: 30 },
  { chave: 'morno', label: 'Morno', min: 31, max: 60 },
  { chave: 'aquecido', label: 'Aquecido', min: 61, max: 85 },
  { chave: 'quente', label: 'Quente', min: 86, max: 100 },
]

export type AgregadosScoreOperacao = {
  /** Follow-ups ativos (ver src/lib/score/interacoes.ts) registrados nos últimos 7 dias. */
  followups7d: number
  /** Empreendimentos distintos que geraram pelo menos um lead (leads.empreendimento_interesse) nos últimos 90 dias. */
  empreendimentosComLead90d: number
  /** Leads criados nos últimos 30 dias. */
  leads30dTotal: number
  /** Desses, quantos tiveram primeiro_atendimento_em registrado em menos de 1h após created_at. */
  leads30dAtendidos1h: number
  /** Leads com requer_atencao=true agora — usado pra dar um número real na missão de Frequência. */
  leadsParados: number
  /** Total de leads desde sempre — usado só pra detectar conta nova. */
  leadsTotal: number
  /** Total de unidades desde sempre — usado só pra detectar conta nova. */
  unidadesTotal: number
}

function linear(valor: number, teto: number, maximo: number): number {
  if (teto <= 0) return 0
  return Math.round((Math.min(Math.max(valor, 0), teto) / teto) * maximo)
}

// 0 empreendimentos = 0 pts; 1 = 5 pts; 8+ = 20 pts; linear entre 1 e 8.
// (Só o trecho 1→8 é linear por definição do briefing — 0 é caso especial,
// senão a reta 0→5pts em n=1 não bateria com a reta 1→20pts em n=8.)
function diversificacaoPontos(n: number): number {
  if (n <= 0) return 0
  if (n >= 8) return 20
  return Math.round(5 + ((n - 1) / 7) * 15)
}

function faixaDe(total: number): Faixa {
  return (FAIXAS.find((f) => total >= f.min && total <= f.max) ?? FAIXAS[FAIXAS.length - 1]).chave
}

export function calcularScoreOperacao(a: AgregadosScoreOperacao): ResultadoScoreOperacao {
  const contaNova = a.leadsTotal === 0 && a.unidadesTotal === 0

  const freqPontos = linear(a.followups7d, 20, 30)
  const diversPontos = diversificacaoPontos(a.empreendimentosComLead90d)
  const respAplicavel = a.leads30dTotal > 0
  const respPontos = respAplicavel ? Math.round((a.leads30dAtendidos1h / a.leads30dTotal) * 15) : null

  const componentes: Componente[] = [
    {
      chave: 'frequencia',
      label: 'Frequência',
      pontos: freqPontos,
      maximo: 30,
      detalhe: `${a.followups7d} follow-up${a.followups7d === 1 ? '' : 's'} nos últimos 7 dias`,
    },
    {
      chave: 'diversificacao',
      label: 'Diversificação',
      pontos: diversPontos,
      maximo: 20,
      detalhe: `${a.empreendimentosComLead90d} empreendimento${a.empreendimentosComLead90d === 1 ? '' : 's'} com lead nos últimos 90 dias`,
    },
    {
      chave: 'velocidade',
      label: 'Velocidade de resposta',
      pontos: respPontos,
      maximo: 15,
      detalhe: respAplicavel
        ? `${a.leads30dAtendidos1h} de ${a.leads30dTotal} leads atendidos em até 1h (30 dias)`
        : 'Sem leads novos nos últimos 30 dias',
    },
  ]

  const aplicaveis = componentes.filter((c): c is Componente & { pontos: number } => c.pontos !== null)
  const pesoBase = aplicaveis.reduce((s, c) => s + c.maximo, 0)
  const pontosGanhos = aplicaveis.reduce((s, c) => s + c.pontos, 0)
  const total = pesoBase > 0 ? Math.round((pontosGanhos / pesoBase) * 100) : 0

  const faixa = faixaDe(total)
  const faixaInfo = FAIXAS.find((f) => f.chave === faixa)!
  const idxFaixa = FAIXAS.findIndex((f) => f.chave === faixa)
  const proximaFaixa = idxFaixa < FAIXAS.length - 1 ? FAIXAS[idxFaixa + 1] : null

  const missoes = gerarMissoes(componentes, a)

  return {
    total,
    faixa,
    faixaLabel: faixaInfo.label,
    faltamProximaFaixa: proximaFaixa ? proximaFaixa.min - total : null,
    proximaFaixaLabel: proximaFaixa ? proximaFaixa.label : null,
    componentes,
    missoes,
    omitidos: COMPONENTES_OMITIDOS,
    contaNova,
  }
}

const HREFS: Record<ChaveComponente, string> = {
  frequencia: '/dashboard/crm/foco',
  diversificacao: '/dashboard/espelho',
  velocidade: '/dashboard/crm/foco',
}

function gerarMissoes(componentes: Componente[], a: AgregadosScoreOperacao): Missao[] {
  const candidatas = componentes
    .filter((c) => c.pontos !== null)
    .map((c) => ({ c, perdido: c.maximo - (c.pontos as number) }))
    .filter(({ perdido }) => perdido > 0)
    .sort((x, y) => y.perdido - x.perdido)
    .slice(0, 3)

  return candidatas.map(({ c, perdido }) => ({
    chave: c.chave,
    texto: textoMissao(c.chave, a),
    ganhoEstimado: perdido,
    href: HREFS[c.chave],
  }))
}

function textoMissao(chave: ChaveComponente, a: AgregadosScoreOperacao): string {
  switch (chave) {
    case 'frequencia':
      return a.leadsParados > 0
        ? `Registre follow-up em ${a.leadsParados} lead${a.leadsParados === 1 ? '' : 's'} que precisa${a.leadsParados === 1 ? '' : 'm'} de atenção`
        : 'Registre follow-ups no CRM para reativar a prospecção'
    case 'diversificacao':
      return `Cadastre unidades de mais empreendimentos — hoje você tem lead em ${a.empreendimentosComLead90d}`
    case 'velocidade':
      return `Responda leads novos em até 1h — hoje só ${a.leads30dAtendidos1h} de ${a.leads30dTotal} chegam nesse tempo`
  }
}
