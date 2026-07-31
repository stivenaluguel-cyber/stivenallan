// Importador das tabelas de venda da Construtora Fontana.
//
// As tabelas vivem no Drive como PDF e são a fonte de verdade comercial: preço
// por unidade, entrada, parcela, reforço e o CUB do mês. Digitar 54 unidades à
// mão a cada mês não é opção, e errar uma coluna significa vender pelo preço
// errado.
//
// O que torna este parser seguro é que a tabela tem INVARIANTES ARITMÉTICAS
// exatas — verificadas contra o PDF real do Pineto (Julho/2026), ao centavo:
//
//   1. total_venda            == quantidade_CUB × CUB do mês
//   2. entrada + 40×parcela + 4×reforço == 30% do total
//   3. financiamento          == 70% do total
//
// Ou seja: o parser não precisa "confiar" que acertou as colunas — ele CONFERE.
// Uma coluna deslocada quebra pelo menos uma das três contas, e a linha é
// rejeitada com o motivo em vez de virar preço errado no espelho de vendas.
//
// A regra 2 também corrige uma suposição: os guias do site falam em "entrada de
// 20%" para o plano padrão Fontana, mas no Pineto a entrada é 8% e o que fecha
// 30% até a entrega é entrada + parcelas + reforços. Por isso a validação usa o
// TOTAL de 30%, não a entrada isolada.

/**
 * Como o pagamento está estruturado na tabela.
 *
 * `parcelado` é o do Pineto: entrada + 40 parcelas + 4 reforços somam 30% até
 * as chaves, e 70% financiam na entrega.
 *
 * `entrada_financiamento` é o do Avezzano: entrada única de 15% e 85%
 * financiados, sem parcela nem reforço. Descoberto em 30/07/2026 — até então o
 * importador assumia que toda tabela Fontana era como a do Pineto, e recusava
 * as outras dizendo que as contas não fechavam. Fechavam; era outra conta.
 */
import {
  conferirRodape, lerOpcoesDePagamento, lerPoliticaFinanciamento,
  type OpcaoPagamento, type PoliticaFinanciamento, type SinalDoRodape,
} from './financiamento-direto'

export type FormatoTabela = 'parcelado' | 'entrada_financiamento'

export type UnidadeImportada = {
  formato: FormatoTabela
  /** Quantidades da tabela deste empreendimento, não assumidas. */
  parcelas_qtd: number
  reforcos_qtd: number
  unidade: string
  /** Torre, quando o prédio tem mais de uma. `null` em prédio de bloco único. */
  bloco: string | null
  dormitorios: number
  /** Suítes declaradas no rodapé. Não existe coluna por unidade em tabela nenhuma. */
  suites: number
  andar: number | null
  metragem: number
  box_m2: number | null
  metragem_total: number | null
  box_codigo: string | null
  valor_tabela: number
  valor_entrada_min: number
  parcela_mensal: number
  reforco_anual: number
  saldo_financiamento: number
  cub_fator: number
}

export type LinhaRejeitadaTabela = { unidade: string; motivo: string }

export type CabecalhoTabela = {
  /**
   * Quantas parcelas e reforços a tabela oferece, lidos do cabeçalho.
   *
   * O PDF escreve os multiplicadores como "1 X", "6 X", "72 X" — entrada,
   * reforços, parcelas. Cada empreendimento tem os seus: o Pineto opera em
   * 40 parcelas e 4 reforços; o Tremezzo, em 72 e 6. Assumir 40/4 fazia a
   * validação recusar toda tabela que não fosse a do Pineto.
   */
  parcelas_qtd: number | null
  reforcos_qtd: number | null
  /** Parcelamento direto com a construtora, lido do rodapé. */
  financiamento_direto: PoliticaFinanciamento | null
  /** Todas as formas de pagamento que a tabela oferece, direto na frente. */
  opcoes_pagamento: OpcaoPagamento[]
  cub_valor: number | null
  cub_label: string | null
  vigencia: string | null
  previsao_entrega: string | null
  endereco: string | null
  desconto_a_vista_pct: number | null
  aceita_permuta: boolean | null
}

export type ResultadoTabela = {
  cabecalho: CabecalhoTabela
  unidades: UnidadeImportada[]
  rejeitadas: LinhaRejeitadaTabela[]
  // Divergência entre o CUB impresso na tabela e o que o sistema tem gravado.
  // Não é erro de parse: é aviso de que a tabela pode estar velha (ou o CUB do
  // sistema). Quem decide é o corretor.
  conferenciaCub: { impresso: number | null; sistema: number | null; confere: boolean | null }
  /**
   * Contagem de linhas obtida SEM o fatiador, pela redundância do PDF.
   *
   * `esperado` é null quando a tabela não tem a repetição (nenhuma vista até
   * hoje, mas não dá para garantir). `confere: false` significa que sumiu
   * linha: é bloqueio de importação, não aviso.
   */
  conferenciaLinhas: { esperado: number | null; lidas: number; confere: boolean | null }
  /**
   * Cada número que o rodapé escreve, e se ele chegou em alguma opção.
   * Sinal com `confere: false` = condição comercial que some da tela.
   */
  conferenciaRodape: SinalDoRodape[]
}

// Uma tabela é feita com o CUB de UM mês; a diferença aceitável entre o valor
// impresso e o do sistema é de centavos por arredondamento, não de reais.
const TOLERANCIA_CUB = 0.5
// As invariantes fecham exatas, mas o PDF arredonda cada célula em 2 casas —
// somar 44 células acumula alguns centavos.
const TOLERANCIA_REAIS = 1.0

function moeda(s: string): number {
  return Number(s.replace(/\./g, '').replace(',', '.'))
}

function parseCabecalho(texto: string): CabecalhoTabela {
  // "CUB06 - Julho - R$ 3.121,62"
  const cub = texto.match(/CUB\d*\s*-\s*([A-Za-zçÇãÃ]+)\s*-\s*R\$\s*([\d.]+,\d{2})/i)
  const vig = texto.match(/Vig[êe]ncia desta tabela:\s*([A-Za-z]+\/\d{4})/i)
  const ent = texto.match(/Previs[ãa]o de entrega:\s*(\d{2}\/\d{2}\/\d{4})/i)
  const end = texto.match(/^\s*Data\s+(.+?)\s+emiss[ãa]o:/i)
  const desc = texto.match(/DESCONTO DE\s*(\d+)%\s*PARA PAGAMENTO [ÀA] VISTA/i)

  const q = lerQuantidades(texto)

  return {
    parcelas_qtd: q.parcelas,
    reforcos_qtd: q.reforcos,
    financiamento_direto: lerPoliticaFinanciamento(texto),
    opcoes_pagamento: lerOpcoesDePagamento(texto),
    cub_valor: cub ? moeda(cub[2]) : null,
    cub_label: cub ? cub[1] : null,
    vigencia: vig ? vig[1] : null,
    previsao_entrega: ent ? ent[1] : null,
    endereco: end ? end[1].trim() : null,
    desconto_a_vista_pct: desc ? Number(desc[1]) : null,
    // Frase explícita nas observações. `null` = a tabela não fala do assunto.
    aceita_permuta: /n[ãa]o aceita permuta/i.test(texto) ? false
      : /aceita permuta/i.test(texto) ? true : null,
  }
}

/**
 * Fatia o bloco de unidades.
 *
 * O texto extraído do PDF vem como UMA linha gigante — não há como quebrar por
 * `\n`. O corte é feito no padrão que só aparece no começo de uma unidade:
 * número da unidade (3–4 dígitos), dormitórios (1 dígito) e o código do box
 * ("91S", "89E").
 */
// Código do box: número seguido de UMA ou DUAS letras.
//
// A legenda das tabelas: S (Simples), D (Duplo), SE (Simples Estendido), DE
// (Duplo Estendido), com sufixo de pavimento — "23D - T", "105SE - 1º Pav".
//
// Aceita TRÊS letras por causa do Villammare 802: "15DLL - T", box de 29,25 m²
// contra 24,00 das outras nove unidades. O "LL" não está na legenda daquela
// tabela e a construtora não foi consultada — o corretor decidiu seguir assim,
// e as invariantes aritméticas mais a conferência de linhas continuam sendo a
// rede. Se o código for lixo de extração, a linha cai nas contas.
//
// Três armadilhas já pagas aqui: restringir a [SE] fazia o fatiador ignorar a
// tabela inteira do Avezzano (código "23D"); exigir UMA letra ignorava a
// unidade 102 do Tremezzo ("105SE"), porque o \b não fecha entre S e E. Nos
// dois casos a tabela voltava vazia em vez de incompatível.
//
// A terceira: prédio com mais de uma torre imprime a letra do BLOCO entre o
// número e os dormitórios — "904 B 2 44S - 2ºSS". Sem o grupo opcional, o
// fatiador não reconhecia nenhuma linha e a tabela do Bosco del Montello
// (Torre B) voltava com zero unidades das três.
const INICIO_DE_UNIDADE = /\b\d{3,4}\s+(?:[A-Z]\d?\s+)?\d\s+\d{1,3}(?:\s*e\s*\d{1,3})?\s*[A-Z]{1,3}\b/

// A quarta: nem toda tabela traz a coluna de dormitórios. O Lavis vai do
// número da unidade direto para o box — "501 63D - T" — e informa "03
// Dormitórios ( 03 Suítes)" uma vez só, no rodapé.
//
// Este padrão NÃO substitui o de cima: ele é a segunda tentativa. Afrouxar
// para todo mundo quebrou a varredura anti-sumiço em 14 testes, porque
// "545 1.701.282,90" (quantidade de CUB seguida do total) passa a parecer
// início de unidade. O formato se decide UMA VEZ por tabela, e cada um usa o
// seu par de expressões.
const INICIO_SEM_DORMITORIOS = /\b\d{3,4}\s+\d{1,3}(?:\s*e\s*\d{1,3})?\s*[A-Z]{1,3}\b/

export type FormatoLinha = 'com_dormitorios' | 'sem_dormitorios'

/**
 * Qual das duas formas a tabela usa.
 *
 * Tenta primeiro a forma com a coluna de dormitórios, que é a da maioria. Só
 * cai na outra quando NENHUMA linha é reconhecida — assim nenhuma tabela que
 * já funciona muda de caminho.
 */
function detectarFormatoLinha(texto: string): FormatoLinha {
  const corpo = corpoSemRodapes(texto)
  return INICIO_DE_UNIDADE.test(corpo) ? 'com_dormitorios' : 'sem_dormitorios'
}

const PADROES: Record<FormatoLinha, {
  inicio: RegExp
  perdidas: RegExp
  dormitorios: RegExp | null
  box: RegExp
}> = {
  com_dormitorios: {
    inicio: INICIO_DE_UNIDADE,
    perdidas: /\b(\d{3,4})\s+(?:[A-Z]\d?\s+)?\d\s+\S[^\n]{0,40}?\d[\d.]*,\d{2}/g,
    dormitorios: /^\d{3,4}\s+(?:[A-Z]\d?\s+)?(\d)\s/,
    box: /^\d{3,4}\s+(?:[A-Z]\d?\s+)?\d\s+(\d{1,3}(?:\s*e\s*\d{1,3})?\s*[A-Z]{1,3})/,
  },
  sem_dormitorios: {
    inicio: INICIO_SEM_DORMITORIOS,
    // ATENÇÃO: nesta forma a varredura NÃO tem poder de detecção.
    //
    // O que fazia a varredura funcionar era o dígito de dormitórios: ele é uma
    // âncora redundante, presente na linha de unidade e ausente em qualquer
    // outro lugar. Sem ele, "545 502 64D - T 125,98" — quantidade de CUB
    // seguida da PRÓXIMA unidade — é textualmente idêntico a uma linha de
    // unidade seguida do seu box. Toda tentativa de afrouxar produziu 40
    // rejeições falsas no Lavis, apontando quantidades de CUB como unidades
    // perdidas.
    //
    // Usar o mesmo padrão do fatiador não inventa rejeição — mas também não
    // encontra nada que o fatiador não tenha achado. É honesto e inútil, e
    // está aqui explícito para ninguém supor que esta forma tem a mesma rede
    // que as outras. A redundância que dá para explorar nestas tabelas é
    // outra: cada linha termina com a quantidade de CUB repetida duas vezes
    // depois do total.
    perdidas: /\b(\d{3,4})\s+\d{1,3}(?:\s*e\s*\d{1,3})?\s*[A-Z]{1,3}\b/g,
    // A coluna não existe: o número vem do rodapé.
    dormitorios: null,
    box: /^\d{3,4}\s+(\d{1,3}(?:\s*e\s*\d{1,3})?\s*[A-Z]{1,3})/,
  },
}

/**
 * Dormitórios e suítes declarados no rodapé, para o prédio inteiro.
 *
 * "Nº DORMITÓRIOS UNIDADES 03 Dormitórios ( 03 Suítes)". É a única fonte de
 * suítes em QUALQUER tabela — não existe coluna por unidade —, e a única fonte
 * de dormitórios nas tabelas que não trazem a coluna.
 *
 * Só devolve o número quando o rodapé é uniforme. Monte Leone escreve "Finais
 * 01 e 02 - 04 Dormitórios (Sendo 03 Suítes) Final 03 - 04 Dormitórios (Sendo
 * 04 Suítes)": ali suítes dependem do final da unidade, e chutar um dos dois
 * colocaria número errado em metade do prédio.
 */
export type RegraPorFinal = { finais: string[]; dormitorios: number; suites: number }

/**
 * Regras que o rodapé declara POR FINAL da unidade.
 *
 *   Monte Leone: "Finais 01 e 02 - 04 Dormitórios (Sendo 03 Suítes)
 *                 Final 03 - 04 Dormitórios (Sendo 04 Suítes)"
 *   Calliano:    "Final 1,2,4 e 5 - 03 Dormitórios (01 Suíte)
 *                 Final 3 e 6 - 02 Dormitórios (01 Suíte)"
 *
 * O tamanho do final MUDA de tabela para tabela: Monte Leone escreve dois
 * dígitos (unidades 301/302/303), Calliano escreve um (unidade 305 → final 5).
 * Por isso a comparação é pelos últimos N dígitos, com N igual ao tamanho do
 * token lido — fixar em 2 quebraria o Calliano.
 *
 * O `Dorm[íi]t[óo]rios` tolerante não é frescura: o PDF do Due Fratelli
 * escreve "Dormítórios", com o acento no lugar errado.
 */
export function lerRegrasPorFinal(texto: string): RegraPorFinal[] {
  // `Fina(?:l|is)` e não `Finai?s?`: o segundo NÃO casa "Final" — o "l" fica de
  // fora —, e o Monte Leone perdia a regra do final 03 silenciosamente.
  const re = /Fina(?:l|is)\s*:?\s*([\d]+(?:\s*(?:,|e)\s*\d+)*)\s*[-–]\s*(\d{1,2})\s*Dorm[íi]t[óo]rios?\s*\(\s*(?:Sendo\s*)?(\d{1,2})\s*Su[íi]tes?\s*\)/gi
  const regras: RegraPorFinal[] = []
  for (const m of texto.matchAll(re)) {
    const finais = (m[1].match(/\d+/g) ?? []).filter((f) => f.length <= 2)
    if (finais.length === 0) continue
    regras.push({ finais, dormitorios: Number(m[2]), suites: Number(m[3]) })
  }
  return regras
}

/** A regra que se aplica a esta unidade, pelos últimos dígitos do número. */
export function regraDaUnidade(unidade: string, regras: RegraPorFinal[]): RegraPorFinal | null {
  for (const r of regras) {
    for (const f of r.finais) {
      if (unidade.length >= f.length && unidade.slice(-f.length) === f) return r
    }
  }
  return null
}

export function lerDormitoriosDoRodape(texto: string): { dormitorios: number | null; suites: number | null } {
  const achados = [...texto.matchAll(/(\d{1,2})\s*Dorm[íi]t[óo]rios?\s*\(\s*(?:Sendo\s*)?(\d{1,2})\s*Su[íi]tes?\s*\)/gi)]
  if (achados.length === 0) return { dormitorios: null, suites: null }
  const uniforme = (vals: number[]) => (new Set(vals).size === 1 ? vals[0] : null)
  return {
    dormitorios: uniforme(achados.map((m) => Number(m[1]))),
    suites: uniforme(achados.map((m) => Number(m[2]))),
  }
}

/**
 * Multiplicadores do cabeçalho: "1 X" (entrada), "6 X" (reforços), "72 X"
 * (parcelas).
 *
 * Só olha o trecho ANTES da primeira linha de unidade — depois dela, "X" não
 * aparece, mas números soltos sim, e um falso positivo aqui inventaria uma
 * condição comercial.
 *
 * A ordem é sempre crescente no PDF; o maior é o número de parcelas mensais e
 * o do meio, o de reforços anuais. O 1 da entrada é ignorado.
 */
function lerQuantidades(texto: string): { parcelas: number | null; reforcos: number | null } {
  const corte = texto.search(INICIO_DE_UNIDADE)
  const cabeca = corte > 0 ? texto.slice(0, corte) : texto
  const nums = [...cabeca.matchAll(/\b(\d{1,3})\s*X\b/gi)]
    .map((m) => Number(m[1]))
    .filter((n) => n > 1 && n <= 360)
  if (nums.length === 0) return { parcelas: null, reforcos: null }
  const ordenado = [...new Set(nums)].sort((a, b) => a - b)
  const parcelas = ordenado[ordenado.length - 1]
  const reforcos = ordenado.length > 1 ? ordenado[0] : null
  return { parcelas, reforcos }
}

/**
 * A tabela imprime a PARCELA MENSAL antes do REFORÇO ANUAL?
 *
 * A maioria escreve o reforço primeiro ("REFORÇO ... ANUAL ... MENSAL", com os
 * multiplicadores "6 X 72 X"), e o parser sempre assumiu essa ordem. Mar di
 * Atrani e Villammare invertem — "MENSAL ... ANUAL", "60 X 5 X" — e as duas
 * entravam com parcela e reforço TROCADOS em todas as unidades.
 *
 * O Villammare denunciou porque com 60 parcelas e 5 reforços a soma não
 * tolerou a troca e uma linha foi rejeitada. O Mar di Atrani, com 72 e 6,
 * passou inteiro: 9 unidades, zero rejeitadas, conferência de linhas 9/9. A
 * troca some dentro da própria equação quando as quantidades se combinam — as
 * invariantes NÃO pegam. Na tela viraria "72 parcelas de R$ 132 mil" no lugar
 * de "72 de R$ 26 mil".
 *
 * Detecta por `MENSAL` vs `ANUAL`, que são os rótulos que sempre aparecem —
 * as palavras "PARCELA" e "REFORÇO" nem sempre sobrevivem à extração.
 *
 * Não confundir com o Bellante: lá o reforço (R$ 14.284,53) é MENOR que a
 * parcela (R$ 28.569,07) e está correto — entrega em 4 meses, 4 parcelas e 2
 * reforços. Por isso a detecção é pela ordem no cabeçalho, e não por comparar
 * os valores: "reforço ≥ parcela" recusaria o Bellante.
 */
function parcelaVemAntesDoReforco(texto: string): boolean {
  const corte = texto.search(INICIO_DE_UNIDADE)
  const cabeca = corte > 0 ? texto.slice(0, corte) : texto
  const mensal = cabeca.search(/\bMENSAL\b/i)
  const anual = cabeca.search(/\bANUAL\b/i)
  if (mensal < 0 || anual < 0) return false
  return mensal < anual
}

/**
 * Remove os blocos de rodapé, preservando as unidades entre eles.
 *
 * Antes era `texto.split(/Observações:/)[0]` — truncar no primeiro. Funciona
 * quando há um rodapé só, que é o caso de 12 das 13 tabelas.
 *
 * O Pavia junta T1, T2 e T3 num arquivo e repete "Observações:" uma vez por
 * torre. Truncar no primeiro fazia T2 e T3 desaparecerem — e o pior: a
 * conferência de linhas usava o mesmo corte, então contava 6, achava 6 e
 * APROVAVA. Unidade sumindo com todas as redes dizendo que está bem.
 *
 * Aqui cada rodapé é removido de "Observações:" até a próxima linha de
 * unidade (ou até o fim). Em tabela de rodapé único não há unidade depois
 * dele, então a remoção vai até o fim — o mesmo que o corte antigo fazia.
 */
function corpoSemRodapes(texto: string): string {
  const re = new RegExp(
    `Observa[çc][õo]es\\s*:[\\s\\S]*?(?=${INICIO_DE_UNIDADE.source}|$)`,
    'gi',
  )
  return texto.replace(re, ' ')
}

function fatiarUnidades(texto: string, forma: FormatoLinha): string[] {
  const corpo = corpoSemRodapes(texto)
  const inicio = PADROES[forma].inicio
  const partes = corpo.split(new RegExp(`(?=${inicio.source})`))
  const comeca = new RegExp(`^${inicio.source.replace(/^\\b/, '')}`)
  return partes.filter((p) => comeca.test(p.trim()))
}

/**
 * Números de unidade que o fatiador NÃO capturou.
 *
 * Existe porque a falha mais perigosa deste importador não é rejeitar uma
 * linha — é perder uma sem avisar. Já aconteceu três vezes, sempre pelo mesmo
 * motivo: um código de box fora do padrão esperado ("23D", "105SE",
 * "09 e 16S"). A prévia mostrava 13 de 14 unidades, com zero rejeitadas, e
 * parecia correta.
 *
 * A varredura procura qualquer "NNN D " seguido de valores monetários — o
 * formato de uma linha de unidade — e reporta o que ficou de fora, para virar
 * rejeição visível em vez de sumiço.
 */
function unidadesPerdidas(texto: string, capturadas: Set<string>, forma: FormatoLinha): string[] {
  const corpo = corpoSemRodapes(texto)
  const perdidas: string[] = []
  for (const m of corpo.matchAll(PADROES[forma].perdidas)) {
    const n = m[1]
    if (!capturadas.has(n) && !perdidas.includes(n)) perdidas.push(n)
  }
  return perdidas
}

/**
 * Conta as linhas de unidade SEM usar o fatiador.
 *
 * Toda tabela Fontana — nas quatro formas já vistas — termina cada linha de
 * unidade com a quantidade de CUB repetida duas vezes, logo depois do total:
 *
 *   Pineto   … 489.470,02 224 699.242,88 224 224
 *   Lavis    … 13.343,26 545 1.701.282,90 545 545
 *   M. Leone … 29.183,78 1.192 3.720.971,04 1.192 1.192
 *
 * Dois inteiros idênticos e adjacentes não aparecem em nenhum outro ponto do
 * corpo da tabela, e o par fica no FIM da linha — longe do código do box, que
 * é o que costuma quebrar o reconhecimento. Isso dá um número de linhas que
 * não depende de nada que o fatiador enxerga.
 *
 * É a rede que substitui a varredura de `unidadesPerdidas` nas tabelas sem
 * coluna de dormitórios, onde aquela heurística não tem âncora e fica inerte.
 */
export function contarLinhasPelaRepeticaoDoCub(texto: string): number | null {
  const corpo = corpoSemRodapes(texto)
  // Os `(?<![\d.,])` e `(?![\d.,])` não são zelo: sem eles, os CENTAVOS de um
  // valor colam no começo do próximo e inventam um par. No Lavis,
  // "1.863.607,14 14.616,37" virava "14 14" — duas vezes —, e a conferência
  // acusava 57 linhas onde há 55, bloqueando uma importação correta.
  // O par tem que ser de inteiros soltos, não de pedaços de decimal.
  const pares = [...corpo.matchAll(/(?<![\d.,])(\d{1,3}(?:\.\d{3})*)(?![\d.,])\s+\1(?![\d.,])/g)]
  return pares.length > 0 ? pares.length : null
}

/** Andar pela convenção predial: 102 → 1º, 1505 → 15º. */
function andarDe(unidade: string): number | null {
  const d = unidade.replace(/\D/g, '')
  if (d.length < 3) return null
  const a = Math.floor(Number(d) / 100)
  return Number.isFinite(a) && a > 0 ? a : null
}

export function parsearTabelaFontana(
  texto: string,
  cubDoSistema?: number | null,
): ResultadoTabela {
  const cabecalho = parseCabecalho(texto)
  const forma = detectarFormatoLinha(texto)
  const doRodape = lerDormitoriosDoRodape(texto)
  const regrasPorFinal = lerRegrasPorFinal(texto)
  const colunasTrocadas = parcelaVemAntesDoReforco(texto)
  const unidades: UnidadeImportada[] = []
  const rejeitadas: LinhaRejeitadaTabela[] = []

  for (const bruto of fatiarUnidades(texto, forma)) {
    const chunk = bruto.trim()
    const unidade = chunk.match(/^(\d{3,4})/)?.[1] ?? '?'
    // Letra da torre, quando o prédio tem mais de uma ("904 B 2 44S" → "B").
    // Vai para a coluna `bloco`, que é como o espelho agrupa a grade.
    // Uma ou duas posições: o Bosco escreve "904 B 2 44S" e o Pavia,
    // "101 T1 3 166D". Prédio de várias torres repete o número do apartamento,
    // e é o bloco que os distingue na chave.
    const bloco = chunk.match(/^\d{3,4}\s+([A-Z]\d?)\s+\d\s/)?.[1] ?? null
    // Sem coluna de dormitórios, o número vem do rodapé — é o que a
    // construtora declara para o prédio inteiro.
    const padrao = PADROES[forma]
    const dormitorios = padrao.dormitorios
      ? Number(chunk.match(padrao.dormitorios)?.[1] ?? 0)
      : (regraDaUnidade(unidade, regrasPorFinal)?.dormitorios ?? doRodape.dormitorios ?? 0)
    // Só o código, sem o sufixo de pavimento ("89E", não "89E - 3º"): o andar
    // já sai do número da unidade.
    const boxCodigo = chunk.match(padrao.box)?.[1] ?? null

    // Tokeniza a PARTIR do primeiro decimal. Antes dele só há ruído numérico
    // ("91S", "3º Pav") que confundiria a contagem de colunas.
    const primeiroDecimal = chunk.search(/\d[\d.]*,\d{2}/)
    if (primeiroDecimal < 0) {
      rejeitadas.push({ unidade, motivo: 'nenhum valor numérico na linha' })
      continue
    }
    const cauda = chunk.slice(primeiroDecimal)

    const decimais = [...cauda.matchAll(/\d[\d.]*,\d{2}/g)].map((m) => moeda(m[0]))
    // O fator CUB é o primeiro inteiro solto depois dos decimais começarem.
    //
    // Acima de mil o PDF escreve a quantidade com separador de milhar —
    // "1.192", não "1192". Casar só 2–4 dígitos seguidos capturava o pedaço
    // DEPOIS do ponto: 1.192 virava 192, 1.068 virava 68. A invariante
    // `total = quantidade × CUB` derrubava a linha, e o Monte Leone (todas as
    // 26 unidades passam de 1.000 CUBs) voltava 26 de 26 rejeitadas.
    //
    // A forma com separador vem primeiro: 4 dígitos corridos ainda casam pela
    // segunda alternativa, então tabela sem separador continua igual.
    const inteiro = cauda.replace(/\d[\d.]*,\d{2}/g, ' ').match(/\b(\d{1,3}(?:\.\d{3})+|\d{2,4})\b/)
    const cubFator = inteiro ? Number(inteiro[1].replace(/\./g, '')) : null

    // Ordem das colunas no PDF: área, box, total m², entrada, total venda,
    // reforço, (total repetido), parcela, (total), financiamento, (total).
    // 7 colunas basta para o formato simples (área, box, total m², entrada,
    // total, financiamento e o total repetido); o parcelado precisa de 10.
    if (decimais.length < 7 || cubFator === null) {
      rejeitadas.push({ unidade, motivo: `colunas insuficientes (${decimais.length} valores, fator ${cubFator})` })
      continue
    }

    const [metragem, boxM2, totalM2, entrada, total] = decimais

    // Qual formato é esta linha? A pergunta se responde pela aritmética, não
    // por um rótulo no PDF: no formato simples, entrada + o valor seguinte
    // fecham o total exato.
    // Colunas do formato simples: área, box, total m², entrada, total,
    // FINANCIAMENTO, total repetido. O financiamento é o índice 5.
    const ehSimples =
      decimais.length < 10 &&
      decimais[5] !== undefined &&
      Math.abs(entrada + decimais[5] - total) <= TOLERANCIA_REAIS

    const formato: FormatoTabela = ehSimples ? 'entrada_financiamento' : 'parcelado'
    // Qual das duas colunas é qual depende do cabeçalho desta tabela.
    const reforco = ehSimples ? 0 : (colunasTrocadas ? decimais[7] : decimais[5])
    const parcela = ehSimples ? 0 : (colunasTrocadas ? decimais[5] : decimais[7])

    // O financiamento é DERIVADO, não lido por posição.
    //
    // Antes vinha de `decimais[9]`, e o Tremezzo quebrou isso: a tabela dele
    // não tem coluna de financiamento, porque são 100% até as chaves em 72
    // parcelas — o índice 9 nem existe. Derivar do que sobra e depois conferir
    // contra as colunas do PDF vale para os dois casos e não depende da ordem.
    const npCab = cabecalho.parcelas_qtd ?? 40
    const nrCab = cabecalho.reforcos_qtd ?? 4
    const ateChavesCalc = entrada + npCab * parcela + nrCab * reforco
    const restante = Math.round((total - ateChavesCalc) * 100) / 100

    // O valor DERIVADO diz o que procurar; o IMPRESSO é o que vale. Multiplicar
    // 40 parcelas arredondadas em centavos não reconstrói o total exato: no
    // Pineto a derivação dá 489.470,09 e o PDF imprime 489.470,02. Sete
    // centavos que iriam para o contrato do cliente.
    const impressoProximo = decimais.find((d) => Math.abs(d - restante) <= TOLERANCIA_REAIS)
    const financiamento = ehSimples
      ? decimais[5]
      : Math.abs(restante) <= TOLERANCIA_REAIS
        ? 0
        : (impressoProximo ?? restante)

    // ── As invariantes ────────────────────────────────────────────────
    const problemas: string[] = []

    // Antes de qualquer comparação: número que faltou vira NaN, e TODA
    // comparação com NaN é falsa — `Math.abs(NaN - x) > tolerancia` dá false.
    // Sem esta guarda, uma linha com coluna faltando passava por todas as
    // invariantes sem disparar nenhuma e entrava como válida.
    const numeros = { entrada, total, financiamento, parcela, reforco }
    for (const [nome, v] of Object.entries(numeros)) {
      if (!Number.isFinite(v)) problemas.push(`${nome} ausente ou ilegível`)
    }

    if (cabecalho.cub_valor) {
      const esperado = cubFator * cabecalho.cub_valor
      if (Math.abs(esperado - total) > TOLERANCIA_REAIS) {
        problemas.push(`total ${total.toFixed(2)} ≠ ${cubFator} × CUB ${cabecalho.cub_valor.toFixed(2)} = ${esperado.toFixed(2)}`)
      }
    }

    if (formato === 'parcelado') {
      // Quantidades da PRÓPRIA tabela. O Pineto é 40 parcelas + 4 reforços
      // fechando 30% até as chaves, com 70% financiados; o Tremezzo é 72 + 6
      // fechando 100%, sem financiamento nenhum. Fixar 40/4 e 30/70 recusava
      // tudo que não fosse o Pineto.
      if (!(parcela > 0) || !(reforco > 0)) {
        problemas.push('parcela ou reforço zerado numa tabela parcelada')
      }

      // Quando há saldo a financiar, o valor derivado tem que APARECER entre
      // as colunas do PDF. É o que impede a conta de fechar por construção:
      // se o número não está impresso na tabela, alguma coluna foi lida errado.
      if (financiamento > 0 && impressoProximo === undefined) {
        problemas.push(
          `saldo de ${restante.toFixed(2)} não aparece na linha — entrada+${npCab}p+${nrCab}r não bate com as colunas`,
        )
      }
    } else {
      // Aqui a conta é uma só, e tem que fechar no centavo: quem entra na
      // entrada mais quem financia é o imóvel inteiro.
      if (Math.abs(entrada + financiamento - total) > TOLERANCIA_REAIS) {
        problemas.push(`entrada ${entrada.toFixed(2)} + financiamento ${financiamento.toFixed(2)} ≠ total ${total.toFixed(2)}`)
      }
      if (!(entrada > 0) || !(financiamento > 0)) {
        problemas.push('entrada ou financiamento zerado')
      }
    }

    if (problemas.length > 0) {
      rejeitadas.push({ unidade, motivo: problemas.join(' · ') })
      continue
    }

    unidades.push({
      formato,
      parcelas_qtd: formato === 'parcelado' ? (cabecalho.parcelas_qtd ?? 40) : 0,
      reforcos_qtd: formato === 'parcelado' ? (cabecalho.reforcos_qtd ?? 4) : 0,
      unidade,
      bloco,
      dormitorios,
      // O rodapé é a ÚNICA fonte de suítes. Antes ia 1 fixo, herdado do
      // Pineto — e ficava errado no Fidenza (3), Parco Savello (2) e Monte
      // Leone (3). Rodapé que varia por final devolve null e mantém o 1.
      // Por final primeiro: o Monte Leone dá 3 suítes nos finais 01 e 02 e 4 no
      // final 03. Só depois o valor uniforme; e 1 como último recurso.
      suites: regraDaUnidade(unidade, regrasPorFinal)?.suites ?? doRodape.suites ?? 1,
      andar: andarDe(unidade),
      metragem,
      box_m2: boxM2 ?? null,
      metragem_total: totalM2 ?? null,
      box_codigo: boxCodigo,
      valor_tabela: total,
      valor_entrada_min: entrada,
      parcela_mensal: parcela,
      reforco_anual: reforco,
      saldo_financiamento: financiamento,
      cub_fator: cubFator,
    })
  }

  // Nada pode sumir em silêncio: o que a varredura encontrou e o fatiador não
  // capturou vira rejeição explícita, com o motivo.
  const capturadas = new Set(unidades.map((u) => u.unidade))
  for (const r of rejeitadas) capturadas.add(r.unidade)
  for (const n of unidadesPerdidas(texto, capturadas, forma)) {
    rejeitadas.push({
      unidade: n,
      motivo: 'linha não reconhecida — código de box fora do padrão (ex.: "09 e 16S")',
    })
  }

  // Lidas = o que virou registro MAIS o que foi recusado com motivo. As duas
  // coisas são visíveis; o que não pode existir é linha que não caiu em
  // nenhuma das duas.
  const lidas = unidades.length + rejeitadas.length
  const esperadoPelaRepeticao = contarLinhasPelaRepeticaoDoCub(texto)

  const impresso = cabecalho.cub_valor
  const sistema = cubDoSistema ?? null
  return {
    cabecalho,
    unidades,
    rejeitadas,
    conferenciaCub: {
      impresso,
      sistema,
      confere: impresso === null || sistema === null ? null : Math.abs(impresso - sistema) <= TOLERANCIA_CUB,
    },
    conferenciaRodape: conferirRodape(texto, cabecalho.opcoes_pagamento, cabecalho.financiamento_direto),
    conferenciaLinhas: {
      esperado: esperadoPelaRepeticao,
      lidas,
      confere: esperadoPelaRepeticao === null ? null : esperadoPelaRepeticao === lidas,
    },
  }
}

/**
 * Converte para o formato de `empreendimentos_unidades`.
 *
 * `condicoes_negociacao` recebe o plano de pagamento em texto legível: é o que
 * o corretor lê na tela ao abrir a unidade, e o que ele repete no WhatsApp.
 */
export function paraUnidadeDoBanco(
  u: UnidadeImportada,
  empreendimentoId: string,
  politica?: PoliticaFinanciamento | null,
  opcoes?: OpcaoPagamento[],
  previsaoEntrega?: string | null,
) {
  const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  // Quantidades vêm do FORMATO da linha, não fixas. Gravar 40 parcelas para
  // uma tabela de entrada única inventaria um plano que a construtora não
  // ofereceu — e a página pública o repetiria ao cliente.
  const parcelasQtd = u.formato === 'parcelado' ? u.parcelas_qtd : 0
  const reforcosQtd = u.formato === 'parcelado' ? u.reforcos_qtd : 0
  const ateAsChaves =
    u.valor_entrada_min + parcelasQtd * u.parcela_mensal + reforcosQtd * u.reforco_anual

  return {
    empreendimento_id: empreendimentoId,
    unidade: u.unidade,
    bloco: u.bloco,
    andar: u.andar,
    metragem: u.metragem,
    dormitorios: u.dormitorios,
    // O plano estruturado alimenta a simulação pública. Vai em jsonb porque
    // cada empreendimento tem forma diferente (Pineto 8%+40+4, Thiene 10% com
    // condição especial, Aura 40/60) — coluna fixa só caberia no plano de hoje.
    plano_pagamento: {
      entrada: u.valor_entrada_min,
      parcelas_qtd: parcelasQtd,
      parcela_valor: u.parcela_mensal,
      reforcos_qtd: reforcosQtd,
      reforco_valor: u.reforco_anual,
      // O saldo não é só "problema do banco": a construtora parcela direto.
      // É o produto que o site anuncia — precisa chegar estruturado na tela.
      financiamento_direto: politica ?? null,
      // Cada empreendimento tem a sua política. Guardar a lista inteira deixa
      // a tela mostrar o que aquela tabela realmente oferece — inclusive o
      // bancário, que nunca deve sumir.
      opcoes_pagamento: opcoes ?? [],
      saldo_financiamento: u.saldo_financiamento,
      // A entrega já vinha lida no cabeçalho e parava ali. A tela precisa dela
      // para responder a pergunta que a tabela não responde: a opção diz
      // "40% até as chaves, ato mínimo de 10%" e cala sobre em quantas vezes
      // se paga o resto. Sem a data não há quantos meses faltam, e o bloco
      // vira número solto.
      previsao_entrega: previsaoEntrega ?? null,
      // A quantidade de CUBs vive aqui: `cub_fator` é numeric(6,4) e não
      // comporta 210–264.
      cub_quantidade: u.cub_fator,
      percentual_ate_chaves: Math.round((ateAsChaves / u.valor_tabela) * 100),
    },
    // A tabela do Pineto diz "02 Dormitórios (01 Suíte)" no rodapé, para todas
    // as unidades — não há coluna por unidade.
    suites: u.suites,
    valor_tabela: u.valor_tabela,
    valor_entrada_min: u.valor_entrada_min,
    // NUNCA a quantidade de CUBs aqui. A coluna é numeric(6,4) — teto 99,9999
    // — e as quantidades reais vão de 210 (Pineto) a 372 (Avezzano). Gravar
    // aqui derruba a importação inteira com "numeric field overflow", que foi
    // o que aconteceu na primeira tentativa de importar o Avezzano.
    //
    // A quantidade vive em `plano_pagamento.cub_quantidade`, logo acima. As 54
    // unidades do Pineto já estão assim: cub_fator nulo, quantidade no jsonb.
    cub_fator: null,
    disponivel: true,
    condicoes_negociacao: [
      u.formato === 'parcelado'
        ? `Entrada ${brl(u.valor_entrada_min)} + ${parcelasQtd}x ${brl(u.parcela_mensal)} + ${reforcosQtd} reforços anuais de ${brl(u.reforco_anual)} (${Math.round((ateAsChaves / u.valor_tabela) * 100)}% até as chaves).`
        : `Entrada única de ${brl(u.valor_entrada_min)} (${Math.round((u.valor_entrada_min / u.valor_tabela) * 100)}%).`,
      politica
        ? `Saldo de ${brl(u.saldo_financiamento)} financiado ou parcelado em até ${politica.meses}x direto com a construtora${politica.indice ? `, corrigido pelo ${politica.indice}` : ''} + ${(politica.jurosAoMes * 100).toLocaleString('pt-BR')}% a.m.`
        : `Saldo de ${brl(u.saldo_financiamento)} financiado.`,
      `Valor equivale a ${u.cub_fator} CUB.`,
    ].filter(Boolean).join(' '),
  }
}
