// Score de Operação: um único índice (0-100) que resume o quão ativa está a
// operação do corretor e o que fazer para subir. Função pura — recebe os
// agregados já calculados (uma RPC no banco, ver
// supabase/migrations/*_score_operacao_agregados.sql) e devolve o resultado
// pronto pra UI. Nenhuma chamada de rede aqui, só matemática, pra poder ser
// testada sem banco.
//
// Os 5 componentes do briefing original (Frequência, Portfólio,
// Diversificação, Velocidade de resposta, Perfil) viraram 4: o schema não
// tem NENHUMA coluna pra foto/CRECI/WhatsApp/bio/Instagram do corretor
// (esses dados hoje são texto fixo no código do site público, não um
// registro editável). Sem tabela pra consultar, "Perfil" ficou de fora — o
// peso dele (10 pts) é redistribuído proporcionalmente entre os outros 4,
// que somam 90 em vez de 100. Ver `COMPONENTE_PERFIL_OMITIDO` abaixo.

export type ChaveComponente = 'frequencia' | 'portfolio' | 'diversificacao' | 'velocidade'

export type Componente = {
  chave: ChaveComponente
  label: string
  /** Pontos ganhos neste componente, no teto ORIGINAL (30/25/20/15). `null` = não aplicável nesta apuração (ex.: zero leads no período). */
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

export const COMPONENTE_PERFIL_OMITIDO = {
  chave: 'perfil',
  motivo:
    'Sem tabela no banco com foto/CRECI/WhatsApp/bio/Instagram do corretor — esses campos hoje são texto fixo no código do site público, não um registro editável. Peso (10 pts) redistribuído entre os outros 4 componentes.',
}

const FAIXAS: { chave: Faixa; label: string; min: number; max: number }[] = [
  { chave: 'frio', label: 'Frio', min: 0, max: 30 },
  { chave: 'morno', label: 'Morno', min: 31, max: 60 },
  { chave: 'aquecido', label: 'Aquecido', min: 61, max: 85 },
  { chave: 'quente', label: 'Quente', min: 86, max: 100 },
]

export type AgregadosScoreOperacao = {
  /** Linhas em leads_interacoes criadas nos últimos 7 dias — follow-ups/notas/mudanças de estágio registrados. */
  interacoes7d: number
  /** Unidades em empreendimentos_unidades com disponivel=true (ainda não vendidas). */
  unidadesAtivas: number
  /** Empreendimentos distintos com pelo menos uma unidade disponivel=true. */
  empreendimentosDistintos: number
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

// 0 empreendimentos = 0 pts; 1 = 5 pts; 5+ = 20 pts; linear entre 1 e 5.
// (Só o trecho 1→5 é linear por definição do briefing — 0 é caso especial,
// senão a reta 0→5pts em n=1 não bateria com a reta 1→20pts em n=5.)
function diversificacaoPontos(n: number): number {
  if (n <= 0) return 0
  if (n >= 5) return 20
  return Math.round(5 + ((n - 1) / 4) * 15)
}

function faixaDe(total: number): Faixa {
  return (FAIXAS.find((f) => total >= f.min && total <= f.max) ?? FAIXAS[FAIXAS.length - 1]).chave
}

export function calcularScoreOperacao(a: AgregadosScoreOperacao): ResultadoScoreOperacao {
  const contaNova = a.leadsTotal === 0 && a.unidadesTotal === 0

  const freqPontos = linear(a.interacoes7d, 20, 30)
  const portPontos = linear(a.unidadesAtivas, 10, 25)
  const diversPontos = diversificacaoPontos(a.empreendimentosDistintos)
  const respAplicavel = a.leads30dTotal > 0
  const respPontos = respAplicavel ? Math.round((a.leads30dAtendidos1h / a.leads30dTotal) * 15) : null

  const componentes: Componente[] = [
    {
      chave: 'frequencia',
      label: 'Frequência',
      pontos: freqPontos,
      maximo: 30,
      detalhe: `${a.interacoes7d} interaç${a.interacoes7d === 1 ? 'ão' : 'ões'} nos últimos 7 dias`,
    },
    {
      chave: 'portfolio',
      label: 'Portfólio',
      pontos: portPontos,
      maximo: 25,
      detalhe: `${a.unidadesAtivas} unidade${a.unidadesAtivas === 1 ? '' : 's'} ativa${a.unidadesAtivas === 1 ? '' : 's'}`,
    },
    {
      chave: 'diversificacao',
      label: 'Diversificação',
      pontos: diversPontos,
      maximo: 20,
      detalhe: `${a.empreendimentosDistintos} empreendimento${a.empreendimentosDistintos === 1 ? '' : 's'} com unidade ativa`,
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
    omitidos: [COMPONENTE_PERFIL_OMITIDO],
    contaNova,
  }
}

const HREFS: Record<ChaveComponente, string> = {
  frequencia: '/dashboard/crm/foco',
  portfolio: '/dashboard/espelho',
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
        ? `Registre follow-up em ${a.leadsParados} lead${a.leadsParados === 1 ? '' : 's'} que precisam de atenção`
        : 'Registre follow-ups no CRM para reativar a prospecção'
    case 'portfolio':
      return `Importe mais unidades no espelho de vendas — hoje ${a.unidadesAtivas} ativa${a.unidadesAtivas === 1 ? '' : 's'}`
    case 'diversificacao':
      return `Cadastre unidades de mais empreendimentos — hoje você atua em ${a.empreendimentosDistintos}`
    case 'velocidade':
      return `Responda leads novos em até 1h — hoje só ${a.leads30dAtendidos1h} de ${a.leads30dTotal} chegam nesse tempo`
  }
}
