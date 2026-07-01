// Regras de financiamento direto Construtora Fontana (tabelas jun/2026)

// CUB/SC jun/2026: R$ 3.096,25 — atualizar mensalmente
export const CUB_ATUAL = 3096.25

// Taxa mensal IGPM estimada para simulação da Parcela B (pós-chaves)
// IGPM real varia; usar 0,5% a.m. como referência conservadora + 0,75% a.m. contratual = 1,25% a.m.
export const IGPM_MENSAL_REF = 0.005    // 0,5% a.m.
export const TAXA_POS_CHAVES_IGPM = 0.0075 // 0,75% a.m. contratual sobre saldo

// CUB mensal estimado para simulação da Parcela B pós-chaves (histórico ~0,6% a.m.)
export const CUB_MENSAL_REF = 0.006     // 0,6% a.m.

export type CorrecaoB = 'igpm' | 'cub'

export type PlanoFinanciamento = {
  tipo: 'obra' | 'pronto' | 'quase_pronto' | 'loteamento'
  entrega: string | null           // ISO date; null = pronto
  entradaPct: number               // fração do valor total (Parcela A — ato)
  reforcos: number                 // qtd reforços anuais durante a obra (Parcela A)
  mensais: number                  // qtd parcelas mensais durante a obra (Parcela A)
  descontoAVistaPct: number        // desconto p/ pagamento à vista
  saldoDireto?: { meses: number; correcao: string }  // Parcela B — financiamento direto pós-chaves
  politicaExtra?: string
}

// Regra geral Fontana: reforço anual = 5x a parcela mensal.
// Parcela A (durante a obra): correção CUB/SC.
// Parcela B (pós-chaves / saldo direto): IGPM + 0,75% a.m. OU CUB/SC, à escolha do comprador.

const PADRAO_OBRA: Omit<PlanoFinanciamento, 'entrega'> = {
  tipo: 'obra', entradaPct: 0.20, reforcos: 6, mensais: 72, descontoAVistaPct: 0.15,
}

export const planos: Record<string, PlanoFinanciamento> = {
  'monte-leone-centro-criciuma-sc':        { ...PADRAO_OBRA, entrega: '2030-08-30' },
  'fidenza-residencial-cruzeiro-do-sul-criciuma-sc': { ...PADRAO_OBRA, entrega: '2027-12-31' },
  'mar-di-nizza-mar-grosso-laguna-sc':     { ...PADRAO_OBRA, entrega: '2026-12-31' },
  'thiene-centro-criciuma-sc':             { tipo: 'quase_pronto', entrega: '2026-09-30', entradaPct: 0.10, reforcos: 0, mensais: 0, descontoAVistaPct: 0.15, saldoDireto: { meses: 180, correcao: 'IGPM + 0,75% a.m.' }, politicaExtra: '10% de desconto pagando 40% até as chaves (ato mínimo 10%) + saldo em até 180 meses.' },
  'pavia-rio-maina-criciuma-sc':           { tipo: 'pronto', entrega: null, entradaPct: 0.15, reforcos: 0, mensais: 0, descontoAVistaPct: 0.05, saldoDireto: { meses: 240, correcao: 'IGPM + 0,75% a.m.' } },
  // Demais empreendimentos: padrão obra — CONFIRMAR data de entrega na tabela de vendas
  'lavis-residencial-centro-criciuma-sc':  { ...PADRAO_OBRA, entrega: null },
  'aguas-de-marano-frente-mar-balneario-picarras-sc': { ...PADRAO_OBRA, entrega: null },
  'tremezzo-residencial-centro-criciuma-sc': { ...PADRAO_OBRA, entrega: null },
  'parco-savello-santa-barbara-criciuma-sc': { ...PADRAO_OBRA, entrega: null },
  'avezzano-centro-sideropolis-sc':        { ...PADRAO_OBRA, entrega: null },
  'bellante-comerciario-criciuma-sc':      { ...PADRAO_OBRA, entrega: null },
  'bosco-del-montello-centro-criciuma-sc': { ...PADRAO_OBRA, entrega: null },
  'calalzo-di-cadore-michel-criciuma-sc':  { ...PADRAO_OBRA, entrega: null },
  'calliano-centro-criciuma-sc':           { ...PADRAO_OBRA, entrega: null },
  'campos-da-montanha-bom-jardim-da-serra-sc': { ...PADRAO_OBRA, entrega: null },
  'castellano-centro-icara-sc':            { ...PADRAO_OBRA, entrega: null },
  'due-fratelli-centro-criciuma-sc':       { ...PADRAO_OBRA, entrega: null },
  'hub-smart-home-criciuma-sc':            { ...PADRAO_OBRA, entrega: null },
  'lavis-centro-criciuma-sc':              { ...PADRAO_OBRA, entrega: null },
  'mar-di-arienzo-centro-balneario-rincao-sc': { ...PADRAO_OBRA, entrega: null },
  'mar-di-atrani-centro-balneario-rincao-sc': { ...PADRAO_OBRA, entrega: null },
  'mar-di-licata-mar-grosso-laguna-sc':    { ...PADRAO_OBRA, entrega: null },
  'mar-positano-centro-balneario-rincao-sc': { ...PADRAO_OBRA, entrega: null },
  'pianezze-centro-icara-sc':              { ...PADRAO_OBRA, entrega: null },
  'piazza-castello-centro-icara-sc':       { ...PADRAO_OBRA, entrega: null },
  'pineto-centro-criciuma-sc':             { ...PADRAO_OBRA, entrega: null },
  'rocca-pietore-centro-sideropolis-sc':   { ...PADRAO_OBRA, entrega: null },
  'villaggio-verde-residenziale-grande-prospera-criciuma-sc': { tipo: 'loteamento', entrega: null, entradaPct: 0.25, reforcos: 4, mensais: 48, descontoAVistaPct: 0.05 },
  'villammare-residencial-balneario-rincao-sc': { ...PADRAO_OBRA, entrega: null },
}

// Opções customizáveis para simulação da Parcela A
export type OpcoesParcela = {
  entradaPct?: number    // sobrescreve plano.entradaPct
  reforcos?: number      // sobrescreve plano.reforcos
  mensais?: number       // sobrescreve plano.mensais
}

export type ParcelaB = {
  meses: number
  taxaMensal: number          // taxa efetiva usada (IGPM ref + 0,75% ou CUB ref)
  correcaoLabel: string       // ex: "IGPM + 0,75% a.m." ou "CUB/SC"
  // Parcela Price (juros compostos) — estimativa
  parcelaMensal: number       // valor da parcela Price sobre o saldo devedor B
  // Parcela SAC — estimativa (1ª parcela / maior)
  parcelaSAC1: number
  // Parcela SAC — estimativa (última parcela / menor)
  parcelaSACn: number
  saldoDevedor: number        // saldo B = valorImovel - entrada (pré-chaves)
}

export type Simulacao = {
  valorImovel: number
  // Parcela A — durante a obra
  parcelaA: {
    entrada: number
    qtdMensais: number
    valorMensal: number
    qtdReforcos: number
    valorReforco: number
  }
  // À vista
  valorAVista: number
  descontoAVista: number
  // Parcela B — pós-chaves (saldo direto); null se não aplicável
  parcelaB: ParcelaB | null
  avisos: string[]
}

// ─── função principal ───────────────────────────────────────────────────────

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

  // ── Parcela A ──────────────────────────────────────────────────────────────
  const entradaPct  = opcoes.entradaPct ?? plano.entradaPct
  let qtdMensais    = opcoes.mensais    ?? plano.mensais
  let qtdReforcos   = opcoes.reforcos   ?? plano.reforcos

  const entrada      = valorImovel * entradaPct
  const saldoA       = valorImovel - entrada   // saldo a pagar durante a obra

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

  // Cálculo da mensalidade (reforço = 5x mensal, regra Fontana)
  // saldoA = mensal × qtdMensais + (5 × mensal) × qtdReforcos
  let valorMensal  = 0
  let valorReforco = 0
  if (qtdMensais > 0) {
    valorMensal  = saldoA / (qtdMensais + 5 * qtdReforcos)
    valorReforco = valorMensal * 5
  }

  // ── À vista ────────────────────────────────────────────────────────────────
  const descontoAVista = valorImovel * plano.descontoAVistaPct
  const valorAVista    = valorImovel - descontoAVista

  // ── Parcela B (pós-chaves / saldo direto) ──────────────────────────────────
  let parcelaB: ParcelaB | null = null
  if (plano.saldoDireto) {
    const mesesB = plano.saldoDireto.meses
    // saldoB: imóveis em obra = saldo remanescente pós-chaves (aqui consideramos
    // que a Parcela A quita o valor durante a obra; para pronto/quase_pronto
    // o saldo B é o valor total menos a entrada paga no ato)
    const saldoB = valorImovel - entrada

    // Taxa efetiva mensal para Parcela B
    let taxaMensal: number
    let correcaoLabel: string
    if (correcaoB === 'cub') {
      taxaMensal    = CUB_MENSAL_REF
      correcaoLabel = 'CUB/SC (ref. ' + (CUB_MENSAL_REF * 100).toFixed(2) + '% a.m.)'
    } else {
      // IGPM + 0,75% a.m. — soma simples de taxas (simplificação contratual)
      taxaMensal    = IGPM_MENSAL_REF + TAXA_POS_CHAVES_IGPM
      correcaoLabel = 'IGPM + 0,75% a.m. (ref. ' + (taxaMensal * 100).toFixed(2) + '% a.m.)'
    }

    // Parcela Price: PMT = PV × i / (1 − (1+i)^−n)
    let parcelaMensal: number
    if (taxaMensal === 0 || mesesB === 0) {
      parcelaMensal = mesesB > 0 ? saldoB / mesesB : 0
    } else {
      parcelaMensal = saldoB * taxaMensal / (1 - Math.pow(1 + taxaMensal, -mesesB))
    }

    // Parcela SAC: amortização constante = saldoB / mesesB; juros decrescem
    const amortSAC  = mesesB > 0 ? saldoB / mesesB : 0
    const parcelaSAC1 = amortSAC + saldoB * taxaMensal              // maior (1ª)
    const parcelaSACn = amortSAC + amortSAC * taxaMensal            // menor (última)

    parcelaB = { meses: mesesB, taxaMensal, correcaoLabel, parcelaMensal, parcelaSAC1, parcelaSACn, saldoDevedor: saldoB }
  }

  // ── Avisos ─────────────────────────────────────────────────────────────────
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
