// Financiamento direto com a construtora.
//
// As tabelas trazem, no rodapé, a política comercial:
//
//   OPÇÃO 01: FINANCIAMENTO BANCÁRIO
//   OPÇÃO 02: O SALDO DEVEDOR PODERÁ SER PARCELADO DIRETO COM A CONSTRUTORA
//   EM ATÉ 240 MESES, SENDO CORRIGIDO PELO IGPM E ACRESCIDO DE JUROS
//   COMPENSATÓRIOS DE 0,75% A.M.
//
// Isto não é rodapé: é o produto. O site inteiro se apresenta como
// "empreendimentos com financiamento direto" — e a página da unidade mostrava
// só o saldo, como se a única saída fosse o banco. A pergunta que todo cliente
// faz ("quanto fica por mês?") não tinha resposta na tela.

export type PoliticaFinanciamento = {
  /** Prazo máximo em meses. */
  meses: number
  /** Juros compensatórios ao mês, em fração (0.0075 = 0,75% a.m.). */
  jurosAoMes: number
  /** Índice de correção do saldo — normalmente IGPM. */
  indice: string | null
}

export type ParcelaDireta = {
  meses: number
  /** Parcela em moeda de hoje, antes da correção pelo índice. */
  valor: number
  /** Soma das parcelas, também em moeda de hoje. */
  totalPago: number
  /** Quanto de juros, em moeda de hoje. */
  juros: number
}

/**
 * Lê a política do rodapé da tabela.
 *
 * Devolve null quando a tabela não menciona parcelamento direto — melhor não
 * oferecer do que oferecer condição que a construtora não escreveu.
 */
export function lerPoliticaFinanciamento(texto: string): PoliticaFinanciamento | null {
  const t = (texto || '').replace(/\s+/g, ' ')

  const mMeses = t.match(/EM\s+AT[ÉE]\s+(\d{1,3})\s*MESES/i)
  if (!mMeses) return null
  const meses = Number(mMeses[1])
  if (!Number.isFinite(meses) || meses < 1 || meses > 600) return null

  // "0,75% a.m." e "0,75% ao mês" são a MESMA condição, e as tabelas usam as
  // duas grafias: Calliano escreve "A.M", Bellante escreve "ao mês". Aceitar só
  // a primeira devolvia `null` para a política inteira — e o Bellante, que
  // parcela em 240x direto com a construtora, aparecia na tela como se a única
  // saída fosse o banco. Justamente o produto que a casa anuncia.
  const mJuros = t.match(/JUROS[^%]*?(\d{1,2}(?:[.,]\d{1,3})?)\s*%\s*(?:A\.?\s*M|AO\s+M[ÊE]S)/i)
  if (!mJuros) return null
  const jurosAoMes = Number(mJuros[1].replace(',', '.')) / 100
  // Acima de 5% a.m. quase certamente é erro de leitura, não condição real.
  if (!Number.isFinite(jurosAoMes) || jurosAoMes <= 0 || jurosAoMes > 0.05) return null

  // Singular ou plural: "sendo corrigido pelo IGPM" (Calliano) e "os valores
  // remanescentes serão corrigidos pelo IGPM" (Bellante).
  const mIndice = t.match(/CORRIGIDOS?\s+PELO\s+([A-ZÇÃÕ\-]{3,12})/i)

  return { meses, jurosAoMes, indice: mIndice ? mIndice[1].toUpperCase() : null }
}

/**
 * Parcela do saldo devedor pela Tabela Price.
 *
 * PMT = PV × i ÷ (1 − (1+i)^−n)
 *
 * O valor sai em moeda de HOJE. A correção pelo IGPM não entra: ninguém sabe
 * o IGPM dos próximos 20 anos, e estimar seria inventar um número que o
 * cliente levaria como promessa. A tela diz isso com todas as letras.
 */
export function parcelaDireta(
  saldo: number,
  meses: number,
  jurosAoMes: number,
): ParcelaDireta | null {
  if (!(saldo > 0) || !(meses >= 1) || !Number.isFinite(jurosAoMes) || jurosAoMes < 0) return null

  const n = Math.floor(meses)
  const valor = jurosAoMes === 0
    ? saldo / n
    : (saldo * jurosAoMes) / (1 - Math.pow(1 + jurosAoMes, -n))

  if (!Number.isFinite(valor)) return null

  const cent = (x: number) => Math.round(x * 100) / 100
  const totalPago = cent(valor * n)
  return { meses: n, valor: cent(valor), totalPago, juros: cent(totalPago - saldo) }
}

/**
 * Prazos que valem mostrar, do mais curto ao máximo da política.
 *
 * Só múltiplos redondos, e nunca acima do teto: oferecer 240x quando o
 * contrato permite 180 seria prometer o que não existe.
 */
export function prazosSugeridos(maximo: number): number[] {
  return [60, 120, 180, 240, 300, 360].filter((m) => m <= maximo)
}

/**
 * Fator de valor presente de n parcelas mensais: a(n,i) = (1 − (1+i)^−n) / i.
 */
function fatorPrice(meses: number, i: number): number {
  return i === 0 ? meses : (1 - Math.pow(1 + i, -meses)) / i
}

/**
 * Fator de valor presente dos reforços anuais dentro do prazo.
 *
 * Um reforço a cada 12 meses, K = floor(n/12) deles. Cada um descontado a
 * (1+i)^(−12k) — soma geométrica de razão v = (1+i)^(−12).
 */
function fatorReforcos(meses: number, i: number): number {
  const K = Math.floor(meses / 12)
  if (K < 1) return 0
  if (i === 0) return K
  const v = Math.pow(1 + i, -12)
  return (v * (1 - Math.pow(v, K))) / (1 - v)
}

/** Quanto de reforço anual o saldo comporta antes de zerar a mensal. */
export function reforcoMaximo(saldo: number, meses: number, jurosAoMes: number): number {
  const fr = fatorReforcos(meses, jurosAoMes)
  if (!(saldo > 0) || fr <= 0) return 0
  return Math.floor(saldo / fr)
}

/**
 * Teto do reforço pela regra de contrato: até `multiplo` vezes a parcela.
 *
 * É a mesma regra que já limita o simulador de entrada — "cada reforço
 * equivale a até 5 vezes o valor da parcela mensal". Faltava aqui: o slider do
 * saldo ia até o limite matemático (o que zera a mensal), e um reforço de
 * R$ 50 mil com parcela de R$ 3.976 dá 12,6× — plano que a construtora não
 * assina.
 *
 * A conta se resolve de uma vez porque a parcela DEPENDE do reforço:
 *
 *   R = m × PMT(R) = m × (PV − R×fr) / fp
 *   R × fp = m×PV − m×R×fr
 *   R = m×PV / (fp + m×fr)
 */
export function reforcoMaximoContratual(
  saldo: number,
  meses: number,
  jurosAoMes: number,
  multiplo: number,
): number {
  if (!(saldo > 0) || !(meses >= 12) || !(multiplo > 0)) return 0
  const fr = fatorReforcos(meses, jurosAoMes)
  const fp = fatorPrice(meses, jurosAoMes)
  if (fr <= 0 || fp <= 0) return 0
  const teto = (multiplo * saldo) / (fp + multiplo * fr)
  if (!Number.isFinite(teto) || teto <= 0) return 0
  // Piso em mil reais para o slider parar num número que se fala em voz alta.
  return Math.floor(Math.min(teto, reforcoMaximo(saldo, meses, jurosAoMes)) / 1000) * 1000
}

export type ParcelaComReforco = ParcelaDireta & {
  reforcosQtd: number
  reforcoValor: number
  /** Reforço em múltiplos da parcela. Teto contratual: 5. */
  reforcoEmParcelas: number
}

/**
 * Parcela mensal quando o cliente também paga reforços anuais.
 *
 * PV = PMT × a(n,i) + R × Σ  →  PMT = (PV − R × Σ) / a(n,i)
 *
 * Serve para o comprador que recebe 13º, bônus ou safra: joga um valor por ano
 * e derruba a mensal. É a mesma lógica dos reforços da tabela do Pineto, só que
 * aplicada ao saldo parcelado direto.
 */
export function parcelaDiretaComReforcos(
  saldo: number,
  meses: number,
  jurosAoMes: number,
  reforcoAnual: number,
): ParcelaComReforco | null {
  if (!(saldo > 0) || !(meses >= 1) || !Number.isFinite(jurosAoMes) || jurosAoMes < 0) return null
  if (!Number.isFinite(reforcoAnual) || reforcoAnual < 0) return null

  const n = Math.floor(meses)
  const K = Math.floor(n / 12)
  const fr = fatorReforcos(n, jurosAoMes)
  const fp = fatorPrice(n, jurosAoMes)
  if (fp <= 0) return null

  // Reforço que sozinho quitaria o saldo deixaria a mensal negativa — o que
  // apareceria na tela como desconto, não como plano impossível.
  const reforco = K > 0 ? Math.min(reforcoAnual, saldo / fr) : 0
  const valor = (saldo - reforco * fr) / fp
  if (!Number.isFinite(valor) || valor < 0) return null

  const cent = (x: number) => Math.round(x * 100) / 100
  const totalPago = cent(valor * n + reforco * K)
  return {
    meses: n,
    valor: cent(valor),
    totalPago,
    juros: cent(totalPago - saldo),
    reforcosQtd: K,
    reforcoValor: cent(reforco),
    reforcoEmParcelas: valor > 0 ? Math.round((reforco / valor) * 100) / 100 : 0,
  }
}

// ─────────────────────────────────────────────────────────────────────
// Opções de pagamento, uma lista por empreendimento.
//
// Cada tabela escreve a sua política. O Avezzano oferece banco OU 240x direto;
// o Pineto tem o 30/70 com 40 parcelas e reforços. Fixar um modelo no código
// obrigaria a mentir em todos os outros — por isso a lista sai do PDF.
//
// A ordem de exibição privilegia o financiamento direto (é o diferencial da
// casa), mas o bancário NUNCA some: quem já tem crédito aprovado precisa ver
// que é aceito.
// ─────────────────────────────────────────────────────────────────────

export type TipoOpcao = 'direto' | 'bancario' | 'a_vista' | 'outro'

export type OpcaoPagamento = {
  tipo: TipoOpcao
  /** Texto como a construtora escreveu, para o corretor conferir. */
  descricao: string
  /** Preenchido quando é parcelamento direto. */
  meses?: number
  jurosAoMes?: number
  indice?: string | null
  /** Desconto sobre o valor total, à vista ou como condição da opção. */
  descontoPct?: number
  /**
   * Quanto precisa estar quitado até a entrega das chaves, nesta opção.
   *
   * O Tremezzo tem tabela de 100% até as chaves, mas a opção 2 refaz o
   * negócio inteiro: 10% de desconto, 40% até as chaves e 60% parcelados em
   * 180 meses. Sem este campo a página mostraria só o plano da tabela e
   * esconderia, num parágrafo de rodapé, a condição que costuma ser a melhor
   * para o comprador.
   */
  ateAsChavesPct?: number
  /** Entrada mínima no ato, em % do valor da venda. */
  atoMinimoPct?: number
  /** `false` quando a opção diz explicitamente que não aceita permuta. */
  aceitaPermuta?: boolean
}

const PESO: Record<TipoOpcao, number> = { direto: 0, a_vista: 1, bancario: 2, outro: 3 }

/**
 * Onde o rodapé do PDF deixa de ser condição comercial.
 *
 * A última opção da lista não termina em `;` nem é seguida de outro item
 * numerado — então o bloco corria até o fim do texto e engolia o rodapé
 * inteiro. A `descricao` da opção 2 do Tremezzo terminava em "LEGENDAS: 1º Pav
 * - 1º Pavimento … Nº DORMITÓRIOS UNIDADES 03 Dormitórios (1 Suíte) Data
 * emissão: 01/07/2026 16:36:28" — tudo isso na tela, no bloco que o corretor
 * lê para repetir a condição ao cliente.
 *
 * Estes marcadores são gráficos do PDF, nunca parte da condição.
 */
// A lista de abreviações nem sempre vem anunciada por "LEGENDAS:". O rodapé do
// Lavis emenda "SS - Subsolo T - Térreo Pav Gar - …" logo depois da condição, e
// isso entrava na `descricao` que o corretor lê na tela.
const FIM_DO_RODAPE = /(?:LEGENDAS?\s*:|VISITE\s+NOSSO\s+SITE|N[ºO°]?\s*DORMIT[ÓO]RIOS?\b|N[ÚU]MERO\s+DORMIT[ÓO]RIOS?\b|Data\s+emiss[ãa]o\s*:|Observa[çc][õo]es\s*:|SS\s*-\s*Subsolo|T\s*-\s*T[ée]rreo|S\s*-\s*Simples)/i

export function lerOpcoesDePagamento(texto: string): OpcaoPagamento[] {
  const t = (texto || '').replace(/\s+/g, ' ')
  const opcoes: OpcaoPagamento[] = []

  // "OPÇÃO 01: ... OPÇÃO 02: ..." — cada bloco vai até a próxima opção ou até
  // o próximo item numerado das observações.
  // O `;` fecha o bloco: `[^;]` já para nele, então ele precisa estar entre os
  // terminadores aceitos — senão a última opção da lista nunca casa.
  const blocos = [...t.matchAll(
    new RegExp(`OP[ÇC][ÃA]O\\s*\\d+\\s*:\\s*([^;]+?)\\s*(?=OP[ÇC][ÃA]O\\s*\\d+\\s*:|\\s\\d\\)|;|${FIM_DO_RODAPE.source}|$)`, 'gi'),
  )]

  for (const b of blocos) {
    const desc = b[1].trim().replace(/[;.\s]+$/, '')
    if (!desc) continue
    opcoes.push(classificar(desc))
  }

  // Desconto à vista costuma vir fora da lista de opções.
  const aVista = t.match(/DESCONTO DE\s*(\d{1,2})\s*%\s*PARA PAGAMENTO [ÀA] VISTA/i)
  if (aVista && !opcoes.some((o) => o.tipo === 'a_vista')) {
    opcoes.push({
      tipo: 'a_vista',
      descricao: `Pagamento à vista com ${aVista[1]}% de desconto`,
      descontoPct: Number(aVista[1]),
    })
  }

  return opcoes.sort((a, b) => PESO[a.tipo] - PESO[b.tipo])
}

function classificar(desc: string): OpcaoPagamento {
  // Os números saem da opção INDEPENDENTE do tipo. Antes só `direto` e
  // `a_vista` os liam, e uma opção que declarasse desconto e percentual até as
  // chaves sem mencionar banco nem construtora caía em `outro` e perdia tudo —
  // some da tela, porque o bloco só renderiza quando há desconto ou percentual.
  // Nenhuma tabela de julho cai nesse caso, mas a perda seria silenciosa.
  const numeros = numerosDaOpcao(desc)
  const politica = lerPoliticaFinanciamento(desc)
  if (politica && /DIRETO|CONSTRUTORA|INCORPORADORA/i.test(desc)) {
    return { tipo: 'direto', descricao: desc, ...politica, ...numeros }
  }
  if (/BANC[ÁA]RI|CAIXA|BANCO/i.test(desc)) return { tipo: 'bancario', descricao: desc, ...numeros }
  if (/[ÀA]\s*VISTA/i.test(desc)) return { tipo: 'a_vista', descricao: desc, ...numeros }
  return { tipo: 'outro', descricao: desc, ...numeros }
}

/**
 * Números que uma opção comercial pode carregar além do prazo.
 *
 * Exemplo real, opção 2 do Tremezzo: "DESCONTO DE 10% SOBRE O VALOR TOTAL,
 * PAGANDO 40% ATÉ AS CHAVES, COM ATO MÍNIMO DE 10% DO VALOR DA VENDA".
 */
function numerosDaOpcao(desc: string): Partial<OpcaoPagamento> {
  const out: Partial<OpcaoPagamento> = {}
  const desconto = desc.match(/DESCONTO DE\s*(\d{1,2})\s*%/i)
  if (desconto) out.descontoPct = Number(desconto[1])

  // O percentual e "até as chaves" nem sempre são vizinhos. Tremezzo e Parco
  // Savello escrevem "PAGANDO 40% ATÉ AS CHAVES"; o Lavis escreve "PAGAMENTO
  // DE 40% DO VALOR TOTAL ATÉ AS CHAVES". Exigir adjacência deixava o Lavis
  // sem `ateAsChavesPct` — e como a tela só mostra o bloco da opção quando há
  // desconto OU percentual até as chaves, as 55 unidades ficaram no ar sem
  // exibir a condição comercial que é o produto.
  //
  // O `[^%]` é o que segura o alcance: impede atravessar OUTRO percentual, de
  // modo que em "DESCONTO DE 10% SOBRE O VALOR TOTAL, PAGANDO 40% ATÉ AS
  // CHAVES" o 40 vence e o 10 não é confundido com o valor até as chaves.
  const chaves = desc.match(/(\d{1,3})\s*%[^%]{0,30}?AT[ÉE]\s*AS?\s*CHAVES/i)
  if (chaves) {
    const v = Number(chaves[1])
    if (v > 0 && v <= 100) out.ateAsChavesPct = v
  }

  const ato = desc.match(/ATO\s*M[ÍI]NIMO\s*DE\s*(\d{1,2})\s*%/i)
  if (ato) out.atoMinimoPct = Number(ato[1])

  if (/N[ÃA]O\s+(SER[ÁA]\s+)?ACEIT[OA]?\s+PERMUTA/i.test(desc)) out.aceitaPermuta = false

  return out
}

/**
 * Meses cheios entre hoje e a entrega ("31/03/2027" do cabeçalho do PDF).
 *
 * `null` quando a data não veio na tabela ou já passou — nesse caso não há o
 * que distribuir, e a tela precisa calar em vez de dividir por zero.
 */
export function mesesAteAEntrega(previsaoEntrega: string | null | undefined, hoje: Date): number | null {
  const m = (previsaoEntrega || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const [, d, mes, ano] = m
  const entrega = new Date(Number(ano), Number(mes) - 1, Number(d))
  if (!Number.isFinite(entrega.getTime())) return null

  const meses =
    (entrega.getFullYear() - hoje.getFullYear()) * 12 +
    (entrega.getMonth() - hoje.getMonth()) -
    (entrega.getDate() < hoje.getDate() ? 1 : 0)

  return meses >= 1 ? meses : null
}

export type AteAsChavesParcelado = {
  ato: number
  /** Quantas mensais cabem entre hoje e a entrega. */
  meses: number
  /** O que sobra depois do ato, dividido pelos meses restantes. */
  parcela: number
  restante: number
}

/**
 * Como pagar o "até as chaves" de uma opção comercial.
 *
 * A opção 2 do Tremezzo diz quanto (40%) e quanto no ato (10%), mas NÃO diz em
 * quantas vezes o resto se paga. A tabela é omissa de propósito: isso se
 * negocia. O que dá para responder com honestidade é a aritmética — sobra
 * tanto, faltam tantos meses até a entrega, então dá tanto por mês.
 *
 * Sem juros: até as chaves a correção é pelo CUB, e a tabela não escreve juros
 * nesse trecho. Inventar uma taxa aqui seria pior que não dividir.
 *
 * Quem chama TEM que rotular o resultado como sugestão — é conta nossa, não
 * condição assinada pela construtora.
 */
export function distribuirAteAsChaves(
  ateAsChaves: number,
  ato: number | null,
  mesesRestantes: number | null,
): AteAsChavesParcelado | null {
  if (!(ateAsChaves > 0) || !mesesRestantes || mesesRestantes < 1) return null
  const entrada = ato ?? 0
  if (entrada < 0 || entrada > ateAsChaves) return null

  const cent = (n: number) => Math.round(n * 100) / 100
  const restante = cent(ateAsChaves - entrada)
  if (restante <= 0) return null

  return {
    ato: cent(entrada),
    meses: mesesRestantes,
    parcela: cent(restante / mesesRestantes),
    restante,
  }
}

export type PlanoDaOpcao = {
  /** Valor já com o desconto da opção aplicado. */
  valorComDesconto: number
  descontoEmReais: number
  /** Entrada mínima no ato, quando a opção exige. */
  ato: number | null
  /** Quanto precisa estar quitado até as chaves. */
  ateAsChaves: number
  /** O que sobra para financiar ou parcelar depois da entrega. */
  saldo: number
}

/**
 * Traduz uma opção comercial em dinheiro, para a unidade escolhida.
 *
 * A opção 2 do Tremezzo, num apartamento de R$ 1.329.810,12: 10% de desconto
 * levam a R$ 1.196.829,11; 40% até as chaves são R$ 478.731,64, com ato mínimo
 * de R$ 119.682,91; sobram R$ 718.097,47 para 180 meses.
 *
 * Os percentuais incidem sobre o valor JÁ DESCONTADO — é o que a frase diz
 * ("desconto de 10% SOBRE O VALOR TOTAL, pagando 40% até as chaves"): o
 * negócio passa a ser pelo valor novo.
 */
export function planoDaOpcao(valorTotal: number, opcao: OpcaoPagamento): PlanoDaOpcao | null {
  if (!(valorTotal > 0)) return null
  if (opcao.ateAsChavesPct === undefined && opcao.descontoPct === undefined) return null

  const cent = (n: number) => Math.round(n * 100) / 100
  const desconto = opcao.descontoPct ?? 0
  const valorComDesconto = cent(valorTotal * (1 - desconto / 100))
  const pctChaves = opcao.ateAsChavesPct ?? 100
  const ateAsChaves = cent(valorComDesconto * (pctChaves / 100))

  return {
    valorComDesconto,
    descontoEmReais: cent(valorTotal - valorComDesconto),
    ato: opcao.atoMinimoPct ? cent(valorComDesconto * (opcao.atoMinimoPct / 100)) : null,
    ateAsChaves,
    saldo: cent(valorComDesconto - ateAsChaves),
  }
}
