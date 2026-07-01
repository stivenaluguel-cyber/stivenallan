// Regras de financiamento direto Construtora Fontana (tabelas jun/2026)

// CUB/SC jun/2026: R$ 3.096,25 — atualizar mensalmente

export const CUB_ATUAL = 3096.25

export type PlanoFinanciamento = {
  tipo: 'obra' | 'pronto' | 'quase_pronto' | 'loteamento'
  entrega: string | null           // ISO date; null = pronto
  entradaPct: number               // fração do valor total
  reforcos: number                 // qtd reforços anuais (plano padrão)
  mensais: number                  // qtd parcelas mensais (plano padrão)
  descontoAVistaPct: number        // desconto p/ pagamento à vista
  saldoDireto?: { meses: number; correcao: string }  // financiamento direto pós-chaves
  politicaExtra?: string
}

// Regra geral Fontana: reforço anual = 5x a parcela mensal.
// Durante a obra: correção CUB/SC. Pós-chaves: IGPM + 0,75% a.m. OU CUB/SC.

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

export type Simulacao = {
  valorImovel: number
  entrada: number
  qtdMensais: number
  valorMensal: number
  qtdReforcos: number
  valorReforco: number
  valorAVista: number
  descontoAVista: number
  saldoDireto: { meses: number; valorParcela: number; correcao: string } | null
  avisos: string[]
}

export function simular(slug: string, valorImovel: number, hoje = new Date()): Simulacao | null {
  const plano = planos[slug]
  if (!plano || valorImovel <= 0) return null

  const avisos: string[] = []

  const entrada = valorImovel * plano.entradaPct
  const descontoAVista = valorImovel * plano.descontoAVistaPct
  const valorAVista = valorImovel - descontoAVista

  let qtdMensais = plano.mensais
  let qtdReforcos = plano.reforcos

  // Parcela A dinâmica: prazo limitado pela entrega
  if (plano.entrega) {
    const entrega = new Date(plano.entrega)
    const mesesAteEntrega = Math.max(0,
      (entrega.getFullYear() - hoje.getFullYear()) * 12 + (entrega.getMonth() - hoje.getMonth()))
    if (mesesAteEntrega < plano.mensais) {
      qtdMensais = mesesAteEntrega
      avisos.push(`Prazo reduzido: restam ${mesesAteEntrega} meses até a entrega (${entrega.toLocaleDateString('pt-BR')}).`)
    }
    const anosAteEntrega = Math.floor(mesesAteEntrega / 12)
    if (anosAteEntrega < plano.reforcos) {
      qtdReforcos = anosAteEntrega
      avisos.push(`Reforços anuais reduzidos para ${anosAteEntrega} (prazo até a entrega).`)
    }
  }

  // Saldo a parcelar = total - entrada; reforço = 5x mensal (regra Fontana)
  const saldo = valorImovel - entrada
  let valorMensal = 0
  let valorReforco = 0
  if (qtdMensais > 0) {
    // saldo = mensal*qtdMensais + (5*mensal)*qtdReforcos
    valorMensal = saldo / (qtdMensais + 5 * qtdReforcos)
    valorReforco = valorMensal * 5
  }

  const saldoDireto = plano.saldoDireto
    ? { meses: plano.saldoDireto.meses, valorParcela: saldo / plano.saldoDireto.meses, correcao: plano.saldoDireto.correcao }
    : null

  avisos.push('Parcelas e reforços corrigidos mensalmente pelo CUB/Sinduscon-SC durante a obra.')
  if (plano.entrega) avisos.push('Pós-entrega: correção IGPM + 0,75% a.m. ou CUB/SC, à escolha do comprador.')
  avisos.push('Valores estimados com base na tabela vigente — sujeitos a alteração sem aviso prévio.')

  return { valorImovel, entrada, qtdMensais, valorMensal, qtdReforcos, valorReforco, valorAVista, descontoAVista, saldoDireto, avisos }
}
