// Regras de financiamento direto Construtora Fontana (tabelas jun/2026)

// CUB/SC jun/2026: R$ 3.096,25 — atualizar mensalmente
export const CUB_ATUAL = 3096.25

// Taxa mensal IGPM estimada para simulação da Parcela B (pós-chaves)
export const IGPM_MENSAL_REF = 0.005 // 0,5% a.m.
export const TAXA_POS_CHAVES_IGPM = 0.0075 // 0,75% a.m. contratual sobre saldo

// CUB mensal estimado para simulação da Parcela B pós-chaves (histórico ~0,6% a.m.)
export const CUB_MENSAL_REF = 0.006 // 0,6% a.m.

export type CorrecaoB = 'igpm' | 'cub'

export type PlanoFinanciamento = {
  tipo: 'obra' | 'pronto' | 'quase_pronto' | 'loteamento'
  entrega: string | null // ISO date; null = pronto
  entradaPct: number // fração do valor total (Parcela A — ato)
  reforcos: number // qtd reforços anuais durante a obra (Parcela A)
  mensais: number // qtd parcelas mensais durante a obra (Parcela A)
  descontoAVistaPct: number // desconto p/ pagamento à vista
  saldoDireto?: { meses: number; correcao: string } // Parcela B — financiamento direto pós-chaves
  politicaExtra?: string
}

const PADRAO_OBRA: Omit<PlanoFinanciamento, 'entrega'> = {
  tipo: 'obra', entradaPct: 0.20, reforcos: 6, mensais: 72, descontoAVistaPct: 0.15,
}

export const planos: Record<string, PlanoFinanciamento> = {
  // ── Entradas já validadas (preservadas) ──────────────────────────────────
  'monte-leone-centro-criciuma-sc': { ...PADRAO_OBRA, entrega: '2030-08-30' },
  'fidenza-residencial-cruzeiro-do-sul-criciuma-sc': { ...PADRAO_OBRA, entrega: '2027-12-31' },
  'mar-di-nizza-mar-grosso-laguna-sc': { ...PADRAO_OBRA, entrega: '2026-12-31' },
  'thiene-centro-criciuma-sc': { tipo: 'quase_pronto', entrega: '2026-09-30', entradaPct: 0.10, reforcos: 0, mensais: 0, descontoAVistaPct: 0.15, saldoDireto: { meses: 180, correcao: 'IGPM + 0,75% a.m.' }, politicaExtra: '10% de desconto pagando 40% até as chaves (ato mínimo 10%) + saldo em até 180 meses.' },
  'pavia-rio-maina-criciuma-sc': { tipo: 'pronto', entrega: null, entradaPct: 0.15, reforcos: 0, mensais: 0, descontoAVistaPct: 0.05, saldoDireto: { meses: 240, correcao: 'IGPM + 0,75% a.m.' } },

  // ── Empreendimentos com data de entrega confirmada — padrão obra (1x entrada / 6x reforço / 72x mensal) ──
  'lavis-residencial-centro-criciuma-sc': { ...PADRAO_OBRA, entrega: '2030-12-31' },
  'lavis-centro-criciuma-sc': { ...PADRAO_OBRA, entrega: '2030-12-31' },
  'mar-di-atrani-centro-balneario-rincao-sc': { ...PADRAO_OBRA, entrega: '2028-10-30' },
  'mar-di-licata-mar-grosso-laguna-sc': { ...PADRAO_OBRA, entrega: '2027-10-30' },
  'mar-di-arienzo-centro-balneario-rincao-sc': { ...PADRAO_OBRA, entrega: '2030-08-31' },
  'mar-positano-centro-balneario-rincao-sc': { ...PADRAO_OBRA, entrega: '2029-08-31' },
  'pineto-centro-criciuma-sc': { ...PADRAO_OBRA, entrega: '2029-11-30' },
  'tremezzo-residencial-centro-criciuma-sc': { ...PADRAO_OBRA, entrega: '2027-03-31' },
  'villammare-residencial-balneario-rincao-sc': { ...PADRAO_OBRA, entrega: '2029-09-30' },
  'parco-savello-santa-barbara-criciuma-sc': { ...PADRAO_OBRA, entrega: '2028-05-31' },
  'aguas-de-marano-frente-mar-balneario-picarras-sc': { ...PADRAO_OBRA, entrega: '2028-07-31' },

  // ── Bellante: padrão diferente — reforço 2x/ano, mensal 60x ──
  'bellante-comerciario-criciuma-sc': {
    tipo: 'obra', entrega: '2026-11-30', entradaPct: 0.20, reforcos: 2, mensais: 60, descontoAVistaPct: 0.05,
    politicaExtra: 'Financiamento bancário ou até 240 meses direto com construtora, IGPM + 0,75% a.m.',
  },

  // ── Empreendimentos "pronto" — sem previsão de entrega, financiamento direto pós-venda ──
  'avezzano-centro-sideropolis-sc': { tipo: 'pronto', entrega: null, entradaPct: 0.20, reforcos: 0, mensais: 0, descontoAVistaPct: 0, saldoDireto: { meses: 240, correcao: 'IGPM + 0,75% a.m.' } },
  'bosco-del-montello-centro-criciuma-sc': { tipo: 'pronto', entrega: null, entradaPct: 0.20, reforcos: 0, mensais: 0, descontoAVistaPct: 0, saldoDireto: { meses: 180, correcao: 'IGPM + 0,75% a.m.' } },
  'calalzo-di-cadore-michel-criciuma-sc': { tipo: 'pronto', entrega: null, entradaPct: 0.20, reforcos: 0, mensais: 0, descontoAVistaPct: 0, saldoDireto: { meses: 180, correcao: 'IGPM + 0,75% a.m.' } },
  'calliano-centro-criciuma-sc': { tipo: 'pronto', entrega: null, entradaPct: 0.20, reforcos: 0, mensais: 0, descontoAVistaPct: 0, saldoDireto: { meses: 180, correcao: 'IGPM + 0,75% a.m.' } },
  'castellano-centro-icara-sc': { tipo: 'pronto', entrega: null, entradaPct: 0.20, reforcos: 0, mensais: 0, descontoAVistaPct: 0, saldoDireto: { meses: 180, correcao: 'IGPM + 0,75% a.m.' } },
  'due-fratelli-centro-criciuma-sc': { tipo: 'pronto', entrega: null, entradaPct: 0.20, reforcos: 0, mensais: 0, descontoAVistaPct: 0, saldoDireto: { meses: 180, correcao: 'IGPM + 0,75% a.m.' } },
  'pianezze-centro-icara-sc': { tipo: 'pronto', entrega: null, entradaPct: 0.20, reforcos: 0, mensais: 0, descontoAVistaPct: 0, saldoDireto: { meses: 180, correcao: 'IGPM + 0,75% a.m.' } },
  'piazza-castello-centro-icara-sc': { tipo: 'pronto', entrega: null, entradaPct: 0.20, reforcos: 0, mensais: 0, descontoAVistaPct: 0, saldoDireto: { meses: 180, correcao: 'IGPM + 0,75% a.m.' } },
  'rocca-pietore-centro-sideropolis-sc': { tipo: 'pronto', entrega: null, entradaPct: 0.20, reforcos: 0, mensais: 0, descontoAVistaPct: 0, saldoDireto: { meses: 180, correcao: 'IGPM + 0,75% a.m.' } },

  // ── Loteamentos — sem previsão de entrega (venda de terreno), parâmetros próprios ──
  'campos-da-montanha-bom-jardim-da-serra-sc': { tipo: 'loteamento', entrega: null, entradaPct: 0.20, reforcos: 5, mensais: 60, descontoAVistaPct: 0 },
  'villaggio-verde-residenziale-grande-prospera-criciuma-sc': {
    tipo: 'loteamento', entrega: null, entradaPct: 0.253, reforcos: 6, mensais: 72, descontoAVistaPct: 0,
    politicaExtra: 'Correção monetária pelo IPCA (não CUB/SC). Vencimentos dias 05, 10 e 15 de cada mês.',
  },

  // ── Demais entradas preservadas (sem dados novos confirmados) ──
  'hub-smart-home-criciuma-sc': { ...PADRAO_OBRA, entrega: null },
}

// ─── Motor SPC-JS (Sistema de Parcelas Constantes a Juros Simples) ──────────

// Taxa padrão: 0,75% a.m.
export const TAXA_PADRAO_JS = 0.0075

/**
 * Fator de valor presente das mensais — juros simples, somatório exato.
 * FM(n) = Σ[k=1..n] 1/(1 + i·k)
 */
export function fatorMensal(n: number, i = TAXA_PADRAO_JS): number {
  let s = 0
  for (let k = 1; k <= n; k++) s += 1 / (1 + i * k)
  return s
}

/**
 * Fator de VP dos reforços anuais (pagos nos meses 12, 24, ..., 12m).
 * FR(m) = Σ[j=1..m] 1/(1 + i·12·j)
 */
export function fatorReforco(m: number, i = TAXA_PADRAO_JS): number {
  let s = 0
  for (let j = 1; j <= m; j++) s += 1 / (1 + i * 12 * j)
  return s
}

export type ModoSimulacao = 'sem_reforco' | 'mensal_fixa' | 'reforco_fixo' | 'maximo' | 'split_fixo'

export type LinhaSimulacao = {
  prazoMeses: number
  qtdReforcos: number // reforços anuais que cabem no prazo: floor(prazo/12)
  mensal: number
  reforcoAnual: number
  totalPago: number // mensal*prazo + reforcoAnual*qtdReforcos
  jurosEmbutidos: number // totalPago - saldo
}

/**
 * Resolve uma linha da tabela estilo Corbetta para um prazo dado.
 * Usa VP a juros simples: VP = valor / (1 + i·t)
 */
export function resolverLinha(
  saldo: number,
  prazoMeses: number,
  modo: ModoSimulacao,
  i = TAXA_PADRAO_JS,
  valorFixo = 0
): LinhaSimulacao {
  const m = Math.floor(prazoMeses / 12)
  const FM = fatorMensal(prazoMeses, i)
  const FR = fatorReforco(m, i)

  let mensal = 0
  let reforcoAnual = 0

  if (modo === 'sem_reforco') {
    mensal = saldo / FM
  } else if (modo === 'mensal_fixa') {
    mensal = valorFixo
    reforcoAnual = m > 0 ? (saldo - mensal * FM) / FR : 0
  } else if (modo === 'reforco_fixo') {
    reforcoAnual = valorFixo
    mensal = (saldo - reforcoAnual * FR) / FM
  } else {
    // 'maximo': reforço = 5× mensal — validado para Fontana, NÃO alterar
    mensal = saldo / (FM + 5 * FR)
    reforcoAnual = mensal * 5
  }

  const totalPago = mensal * prazoMeses + reforcoAnual * m
  return {
    prazoMeses,
    qtdReforcos: m,
    mensal,
    reforcoAnual,
    totalPago,
    jurosEmbutidos: totalPago - saldo,
  }
}

/**
 * Modo Split Fixo — modelo específico da Corbetta (engenharia reversa da planilha real).
 * Divide o saldo em duas parcelas independentes amortizadas pelo seu próprio fator de VP:
 *   Mensal  = saldo × proporcaoMensal / FM
 *   Reforço = saldo × (1 - proporcaoMensal) / FR
 * Validado: saldo=72077.75, prazo=12, proporcao=0.715 → mensal≈4501,86 / reforço≈22.391
 */
export function resolverSplit(
  saldo: number,
  prazoMeses: number,
  proporcaoMensal: number, // 0 a 1, ex: 0.715
  i = TAXA_PADRAO_JS
): LinhaSimulacao {
  const m = Math.floor(prazoMeses / 12)
  const FM = fatorMensal(prazoMeses, i)
  const FR = fatorReforco(m, i)

  const mensal = (saldo * proporcaoMensal) / FM
  const reforcoAnual = m > 0 && FR > 0 ? (saldo * (1 - proporcaoMensal)) / FR : 0

  const totalPago = mensal * prazoMeses + reforcoAnual * m
  return {
    prazoMeses,
    qtdReforcos: m,
    mensal,
    reforcoAnual,
    totalPago,
    jurosEmbutidos: totalPago - saldo,
  }
}

/**
 * Tabela completa estilo Corbetta: prazos de 12 a 240 meses (de 12 em 12).
 */
export function tabelaCorbetta(
  saldo: number,
  i = TAXA_PADRAO_JS,
  mensalFixa = 0,
  reforcoFixo = 0
) {
  const prazos = Array.from({ length: 20 }, (_, k) => (k + 1) * 12)
  return prazos.map(p => ({
    prazoMeses: p,
    semReforco: resolverLinha(saldo, p, 'sem_reforco', i),
    mensalFixa: mensalFixa > 0 ? resolverLinha(saldo, p, 'mensal_fixa', i, mensalFixa) : null,
    reforcoFixo: reforcoFixo > 0 ? resolverLinha(saldo, p, 'reforco_fixo', i, reforcoFixo) : null,
    maximo: resolverLinha(saldo, p, 'maximo', i),
  }))
}

/**
 * Tabela split — usa resolverSplit() para cada prazo.
 * Modelo específico Corbetta: cada track amortizado pelo seu próprio fator de VP.
 */
export function tabelaSplit(
  saldo: number,
  proporcaoMensal: number,
  i = TAXA_PADRAO_JS
) {
  const prazos = Array.from({ length: 20 }, (_, k) => (k + 1) * 12)
  return prazos.map(p => resolverSplit(saldo, p, proporcaoMensal, i))
}

/** Presets de construtoras da região */
export const construtoras = {
  fontana: { nome: 'Fontana', taxaMensal: 0.0075, sistema: 'juros_simples' as const },
  corbetta: { nome: 'Corbetta', taxaMensal: 0.0075, sistema: 'juros_simples' as const, proporcaoMensalPadrao: 0.715 },
  locks: { nome: 'Locks', taxaMensal: 0.0075, sistema: 'juros_simples' as const },
  giassi: { nome: 'Giassi', taxaMensal: Math.pow(1.095, 1/12) - 1, sistema: 'juros_compostos' as const, obs: '9,5% a.a.' },
  perego: { nome: 'Perego', taxaMensal: 0.0075, sistema: 'price_sac' as const },
} as const

// ─── Tipos legados (compatibilidade com simulador/page.tsx) ─────────────────

export type OpcoesParcela = {
  entradaPct?: number
  reforcos?: number
  mensais?: number
}

export type ParcelaB = {
  meses: number
  taxaMensal: number
  correcaoLabel: string
  parcelaMensal: number // Price (juros compostos) — estimativa
  parcelaSAC1: number
  parcelaSACn: number
  saldoDevedor: number
  // SPC-JS (juros simples) — adicionado
  spcMensal?: number // sem_reforco SPC-JS
}

export type Simulacao = {
  valorImovel: number
  parcelaA: {
    entrada: number
    qtdMensais: number
    valorMensal: number
    qtdReforcos: number
    valorReforco: number
  }
  valorAVista: number
  descontoAVista: number
  parcelaB: ParcelaB | null
  avisos: string[]
}

// ─── função principal ────────────────────────────────────────────────────────

export function simular(
  slug: string,
  valorImovel: number,
  opcoes: OpcoesParcela = {},
  correcaoB: CorrecaoB = 'igpm',
  hoje = new Date()
): Simulacao | null {
  const plano = planos[slug]
  if (!plano || valorImovel <= 0) return null

  const avisos: string[] = []

  // ── Parcela A ────────────────────────────────────────────────────────────
  const entradaPct = opcoes.entradaPct ?? plano.entradaPct
  let qtdMensais = opcoes.mensais ?? plano.mensais
  let qtdReforcos = opcoes.reforcos ?? plano.reforcos

  const entrada = valorImovel * entradaPct
  const saldoA = valorImovel - entrada

  // Limitar prazo pelo tempo restante até a entrega
  if (plano.entrega) {
    const entrega = new Date(plano.entrega)
    const mesesAteEntrega = Math.max(0,
      (entrega.getFullYear() - hoje.getFullYear()) * 12 + (entrega.getMonth() - hoje.getMonth()))
    if (mesesAteEntrega < qtdMensais) {
      qtdMensais = mesesAteEntrega
      avisos.push(`Prazo reduzido: restam ${mesesAteEntrega} meses até a entrega (${entrega.toLocaleDateString('pt-BR')}).`)
    }
    const anosAteEntrega = Math.floor(mesesAteEntrega / 12)
    if (anosAteEntrega < qtdReforcos) {
      qtdReforcos = anosAteEntrega
      avisos.push(`Reforços anuais reduzidos para ${anosAteEntrega} (prazo até a entrega).`)
    }
  }

  // Cálculo SPC-JS da Parcela A (reforço = 5× mensal, regra Fontana/Corbetta)
  // saldoA = mensal·FM + reforco·FR = mensal·(FM + 5·FR)
  let valorMensal = 0
  let valorReforco = 0
  if (qtdMensais > 0) {
    const FM = fatorMensal(qtdMensais, TAXA_PADRAO_JS)
    const FR = qtdReforcos > 0 ? fatorReforco(qtdReforcos, TAXA_PADRAO_JS) : 0
    valorMensal = saldoA / (FM + 5 * FR)
    valorReforco = valorMensal * 5
  }

  // ── À vista ──────────────────────────────────────────────────────────────
  const descontoAVista = valorImovel * plano.descontoAVistaPct
  const valorAVista = valorImovel - descontoAVista

  // ── Parcela B (pós-chaves / saldo direto) ─────────────────────────────────
  let parcelaB: ParcelaB | null = null
  if (plano.saldoDireto) {
    const mesesB = plano.saldoDireto.meses
    const saldoB = valorImovel - entrada

    // Taxa efetiva mensal para Parcela B
    let taxaMensal: number
    let correcaoLabel: string
    if (correcaoB === 'cub') {
      taxaMensal = CUB_MENSAL_REF
      correcaoLabel = 'CUB/SC (ref. ' + (CUB_MENSAL_REF * 100).toFixed(2) + '% a.m.)'
    } else {
      taxaMensal = IGPM_MENSAL_REF + TAXA_POS_CHAVES_IGPM
      correcaoLabel = 'IGPM + 0,75% a.m. (ref. ' + (taxaMensal * 100).toFixed(2) + '% a.m.)'
    }

    // Parcela B SPC-JS (juros simples, sem reforço)
    const spcMensal = resolverLinha(saldoB, mesesB, 'sem_reforco', taxaMensal).mensal

    // Parcela Price (juros compostos) — mantida como alternativa (Perego/bancos)
    let parcelaMensal: number
    if (taxaMensal === 0 || mesesB === 0) {
      parcelaMensal = mesesB > 0 ? saldoB / mesesB : 0
    } else {
      parcelaMensal = saldoB * taxaMensal / (1 - Math.pow(1 + taxaMensal, -mesesB))
    }

    // Parcela SAC
    const amortSAC = mesesB > 0 ? saldoB / mesesB : 0
    const parcelaSAC1 = amortSAC + saldoB * taxaMensal
    const parcelaSACn = amortSAC + amortSAC * taxaMensal

    parcelaB = { meses: mesesB, taxaMensal, correcaoLabel, parcelaMensal, parcelaSAC1, parcelaSACn, saldoDevedor: saldoB, spcMensal }
  }

  // ── Avisos ────────────────────────────────────────────────────────────────
  avisos.push('Parcela A corrigida mensalmente pelo CUB/Sinduscon-SC durante a obra.')
  if (parcelaB) {
    avisos.push(`Parcela B (${parcelaB.correcaoLabel}): estimativa — taxa real varia conforme índice contratual.`)
  }
  if (plano.politicaExtra) avisos.push(plano.politicaExtra)
  avisos.push('Valores estimados com base na tabela vigente — sujeitos a alteração sem aviso prévio.')

  return {
    valorImovel,
    parcelaA: { entrada, qtdMensais, valorMensal, qtdReforcos, valorReforco },
    valorAVista,
    descontoAVista,
    parcelaB,
    avisos,
  }
}
