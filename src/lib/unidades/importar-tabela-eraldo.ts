// Importador das tabelas da Construtora Eraldo.
//
// É um parser SEPARADO do da Fontana de propósito. As duas construtoras não
// compartilham nada de estrutura: onde a Fontana escreve "102 3 16S - T" e
// termina a linha com a quantidade de CUB repetida, o Eraldo escreve
// "Apto 304  2 Vagas - …  R$ 981.383,66" e espalha depósito e pavimento em
// linhas vizinhas. Tentar servir as duas com o mesmo código significaria afrouxar o
// reconhecimento — e afrouxar é como se perde unidade em silêncio.
//
// AS NOVE TABELAS NÃO TÊM A MESMA ESTRUTURA DE PAGAMENTO. Conferido nos PDFs
// de julho/2026:
//
//   Gran Michel   10% / 5% em 3 reforços / 15% em 22 mensais / 70% pós-chaves
//   Árbor         20% / 20% em 6 reforços / 60% em 65 mensais
//   Aura          20% / 20% em 6 reforços / 60% em 74 mensais
//   Symphony      20% / 20% em 4 reforços / 60% em 52 mensais
//   Harmony       20% / 40% em 7 reforços / 40% em 80 mensais
//   Gran Palazzo  25% / 5% em 5 mensais / 70% financiamento
//   Horizon       20% / 15% nas chaves / 5% em 4 mensais / 60% em 60x
//   L'Essence     30% / 70% financiamento (120x)
//   Play          30% / 70% financiamento
//
// Por isso NADA de coluna é assumido. O cabeçalho dá os percentuais; a
// aritmética dá as quantidades; e o número de colunas de pagamento é o número
// de percentuais que a tabela declara.
//
// A REDE DE CONFERÊNCIA — e ela existe, ao contrário do que parecia.
//
// A terceira coluna numérica de toda tabela do Eraldo não é área: é a
// QUANTIDADE DE CUB do apartamento ("TOTAL GLOBAL CUB"). Confere em todas as
// nove, ao centavo:
//
//     preço = quantidade de CUB × CUB do mês
//
// É a mesma redundância que sustenta o importador da Fontana, escrita em outro
// lugar da folha. Sem ela a importação do Eraldo dependia de lista declarada;
// com ela, uma coluna lida errado não passa.
//
// Somam-se a essa duas invariantes por linha e uma por tabela:
//
//   - cada coluna de pagamento é uma fração exata do preço (o cabeçalho diz
//     qual);
//   - a quantidade de pagamentos daquela coluna (fatia ÷ valor impresso) dá
//     inteiro;
//   - e é a MESMA em todas as unidades — é a tabela do empreendimento, não do
//     apartamento.

import type { OpcaoPagamento } from './financiamento-direto'

export type PapelColuna = 'entrada' | 'reforcos' | 'mensais' | 'chaves' | 'saldo'

export type ColunaPagamento = {
  papel: PapelColuna
  /** Fração do preço, como o cabeçalho declara. */
  percentual: number
  /** Valor unitário impresso na tabela. */
  valor: number
  /** Quantos pagamentos deste valor — derivado, não lido. */
  quantidade: number
}

export type UnidadeEraldo = {
  unidade: string
  vagas: string | null
  deposito: string | null
  /** Dormitórios, quando a tabela traz a coluna (só o Play traz). */
  dormitorios: number | null
  /** Área privativa. */
  metragem: number
  /** Área global: privativa + garagem + depósito. */
  metragem_global: number
  /** Quantidade de CUB — a coluna que sustenta a conferência. */
  cub_quantidade: number
  /**
   * O preço que sustenta o plano de pagamento: entrada + reforços + mensais
   * somam este valor. Nas tabelas normais é o preço cheio (CUB × quantidade).
   * Quando a construtora publica um preço promocional ao lado do preço cheio
   * (o Árbor, a partir de agosto/2026, com a coluna "PREÇO CAMPANHA"), é o
   * preço promocional — é ele, não o cheio, que as colunas de pagamento
   * fecham contra.
   */
  preco: number
  /**
   * Preço cheio (CUB × quantidade), só quando a tabela também publica um
   * preço promocional ao lado — nesse caso `preco` já é o promocional. Nas
   * tabelas sem campanha fica null (não há dois preços a distinguir).
   */
  preco_cheio: number | null
  colunas: ColunaPagamento[]
}

export type RejeitadaEraldo = { unidade: string; motivo: string }

export type CabecalhoEraldo = {
  cub_valor: number | null
  /** Uma fração por coluna de pagamento, na ordem em que aparecem. */
  percentuais: number[] | null
  /** Prazo máximo do saldo financiado. */
  pos_chaves_meses: number | null
  /** Juros ao mês do saldo, quando impresso ("0,75% + IGPM"). */
  juros_ao_mes: number | null
  indice: string | null
  endereco: string | null
  /** A última coluna é saldo financiado (pós-chaves / bancário / direto). */
  tem_financiamento: boolean
  /** Do rodapé: "Prazo de entrega Junho de 2028". */
  previsao_entrega: string | null
  /** Condições comerciais do rodapé — os descontos de 5%, 7% e 10%. */
  opcoes_pagamento: OpcaoPagamento[]
  /** Observação que o corretor pediu em destaque, quando a tabela traz. */
  pe_direito: string | null
}

export type ResultadoEraldo = {
  cabecalho: CabecalhoEraldo
  unidades: UnidadeEraldo[]
  rejeitadas: RejeitadaEraldo[]
  /** Quantidades por coluna, iguais em todas as unidades. */
  quantidades: number[] | null
  conferencia: {
    /** Quantas unidades o texto anuncia — independente do que o parser leu. */
    aptos_no_texto: number
    /**
     * Linhas com a assinatura de uma linha de valores (preço + uma coluna por
     * percentual) que o fatiador NÃO consumiu. Cada uma é uma unidade caindo
     * fora em silêncio.
     */
    linhas_de_valor_orfas: string[]
    /** aptos_no_texto === unidades + rejeitadas, e nenhuma linha órfã. */
    confere: boolean
  }
}

// O PDF arredonda cada célula; somar 22 mensais acumula centavos.
const TOLERANCIA = 3.0
// A quantidade de CUB é impressa com duas casas, então o preço reconstruído
// erra no máximo meia casa de CUB — cerca de R$ 16 com o CUB de julho/2026.
const TOLERANCIA_CUB = 0.006

const moeda = (s: string) => Number(s.replace(/\./g, '').replace(',', '.'))

/** "Apto 304", já sem o lixo que o PDF injeta no meio do identificador. */
const APTO = /\bApto\s+(\d{3,4})\b/i

/**
 * "(Diferenciado)" ocupa uma caixa de várias linhas no PDF e parte ao meio: o
 * "(Diferenciad" fica na linha de dados e o "o)" vaza colado no "Apto" da
 * unidade seguinte, produzindo "Apto o) 1205". Limpar antes de qualquer coisa
 * evita que o número da unidade fique inalcançável — inclusive para a
 * contagem, que precisa enxergar as mesmas unidades que o parser.
 */
const limpar = (l: string) =>
  l.replace(/\bApto\s+o\)\s+/i, 'Apto ').replace(/\(Diferenciad\b\)?/gi, '').trim()

function parseCabecalho(texto: string): CabecalhoEraldo {
  const cub = texto.match(/CUB\b[^\n]{0,40}?R\$\s*([\d.]+,\d{2})/i)

  // Os percentuais saem SÓ do cabeçalho — o pedaço antes da primeira unidade.
  // O rodapé descreve as outras condições comerciais em texto corrido, e a
  // condição 4 do Aura ("10% de entrada, 10% em 3 reforços anuais, 20% em
  // parcelas mensais e 60% após a entrega") também fecha em 100%: procurando
  // no documento inteiro, a estrutura da condição 4 vencia a da tabela e as 29
  // unidades voltavam rejeitadas por número de colunas.
  const corte = texto.search(APTO)
  const cabecalho = corte > 0 ? texto.slice(0, corte) : texto.slice(0, 600)

  // Percentual de JURO não é estrutura de pagamento. O Horizon escreve
  // "CUB (0,75% + IGPM)" e o "75" era lido como se fosse uma fatia do preço.
  // Descartar o que vem precedido de vírgula elimina isso sem heurística.
  const pcts = [...cabecalho.matchAll(/(?<![,.])\b(\d{1,2})%/g)].map((m) => Number(m[1]) / 100)

  // A estrutura é a primeira JANELA de percentuais que soma 100%. Fixar "os
  // quatro primeiros" não serve: o Árbor repete 20% antes da linha da
  // estrutura, e o Play tem só DOIS (30/70). Procurar a janela que fecha
  // encontra a estrutura real de cada tabela, seja ela de 2, 3 ou 4 colunas.
  const janela = (() => {
    for (let n = 4; n >= 2; n--) {
      for (let i = 0; i + n <= pcts.length; i++) {
        const w = pcts.slice(i, i + n)
        if (Math.abs(w.reduce((a, b) => a + b, 0) - 1) < 0.001) return w
      }
    }
    return null
  })()

  // Só o CABEÇALHO decide se a última coluna é saldo financiado. O rodapé fala
  // de financiamento em todas as tabelas ("Condição 2 - … financiamento
  // bancário"), inclusive nas que não têm essa coluna.
  const tem_financiamento = /P[ÓO]S\s*CHAVES|FINANC|FIN\.|BANC[ÁA]RI|DIRETO\s+CONSTR/i.test(cabecalho)

  const meses = texto.match(/AT[ÉE]\s*(\d{1,3})\s*(?:X|PARCELAS)/i)
  // O rodapé do Gran Michel escreve "IGPM + 075% ao mês" — sem a vírgula. Um
  // juro de 75% ao mês não existe; dois dígitos sem separador são centésimos.
  const juros = texto.match(/(\d{1,3}(?:,\d{1,2})?)\s*%\s*(?:a\.?m\.?|ao m[êe]s)|(\d{1,3}(?:,\d{1,2})?)\s*%\s*\+\s*IGPM|IGPM\s*\+\s*(\d{1,3}(?:,\d{1,2})?)\s*%/i)
  const jurosBruto = juros ? moeda(juros[1] ?? juros[2] ?? juros[3]) : null
  const juros_ao_mes = jurosBruto === null ? null : jurosBruto >= 10 ? jurosBruto / 100 : jurosBruto

  const end = texto.match(/(?:LAN[ÇC]AMENTO|OBRA)\s*-\s*(.+?)(?:\n|$)/i)
  // "Prazo de entrega dos aptos decorados" é a data do decorado, não do
  // prédio: o Play só tem essa linha, e gravá-la diria que o prédio ficou
  // pronto em out/2025.
  const entrega = texto.match(
    /(?:(?:Prazo|Previs[ãa]o)\s+de\s+entrega(?!\s+dos\s+aptos)|Conclus[ãa]o\s+da\s+obra)\s*:?\s*(.+?)(?:\.\s|\.$|\n|$)/i,
  )

  return {
    cub_valor: cub ? moeda(cub[1]) : null,
    percentuais: janela && janela.length >= 2 ? janela : null,
    pos_chaves_meses: meses ? Number(meses[1]) : null,
    juros_ao_mes,
    indice: /IGPM/i.test(texto) ? 'IGPM' : null,
    endereco: end ? end[1].trim() : null,
    tem_financiamento,
    previsao_entrega: entrega ? entrega[1].trim() : null,
    // Preenchidos depois, quando se sabe onde termina a última unidade.
    opcoes_pagamento: [],
    // O corretor pediu destaque para isto: está escrito na tabela do Gran
    // Michel ("Os apartamentos 'Diferenciados' possuem pé direito 4,70m"),
    // não é suposição nossa.
    pe_direito: texto.match(/p[ée]\s*direito\s*(?:de\s*)?([\d,]+\s*m)/i)?.[1].replace(/\s+/g, '') ?? null,
  }
}

/**
 * Fatia por "Apto NNN", costurando as linhas vizinhas que não são unidade.
 *
 * O depósito é do apartamento da linha do meio e fica na garagem do subsolo —
 * confirmado pelo corretor. As linhas soltas antes e depois pertencem a ele.
 */
function fatiar(linhas: string[]): { linha: string; volta: string[]; valoresEm: number }[] {
  const ehApto = (l: string) => /^Apto\s+\d{3,4}\b/i.test(l)
  const temValor = (l: string) => /R\$\s*[\d.]+,\d{2}/.test(l)

  const out: { linha: string; volta: string[]; valoresEm: number }[] = []
  for (let i = 0; i < linhas.length; i++) {
    if (!ehApto(linhas[i])) continue

    // Caso normal: "Apto 304 2 Vagas - 93,20 … R$ 981.383,66" numa linha só.
    if (temValor(linhas[i])) {
      const volta: string[] = []
      if (i > 0 && !ehApto(linhas[i - 1])) volta.push(linhas[i - 1])
      if (i + 1 < linhas.length && !ehApto(linhas[i + 1]) && !temValor(linhas[i + 1])) volta.push(linhas[i + 1])
      out.push({ linha: linhas[i], volta, valoresEm: i })
      continue
    }

    // Caso do 1204: o identificador ficou SOZINHO e os valores vieram abaixo,
    // depois do depósito. Junta os dois, absorvendo o que estiver no meio.
    //
    // A própria linha do identificador entra na volta: no Gran Palazzo e no
    // Horizon o depósito é escrito ao lado do número ("Apto 302 Dep. 50
    // V93A/B") e, sem isto, ficava de fora — o apartamento entrava sem
    // depósito nem vaga.
    const volta: string[] = [linhas[i].replace(APTO, '').trim()]
    let j = i + 1
    while (j < linhas.length && !temValor(linhas[j]) && !ehApto(linhas[j])) {
      volta.push(linhas[j])
      j++
    }
    if (j < linhas.length && temValor(linhas[j]) && !ehApto(linhas[j])) {
      if (j + 1 < linhas.length && !ehApto(linhas[j + 1]) && !temValor(linhas[j + 1])) volta.push(linhas[j + 1])
      out.push({ linha: `${linhas[i]} ${linhas[j]}`, volta, valoresEm: j })
      i = j
    }
  }
  return out
}

/**
 * Dá nome às colunas de pagamento.
 *
 * A primeira é sempre a entrada e a última é o saldo quando o CABEÇALHO diz
 * que existe financiamento. Das do meio, uma que se paga UMA vez é pagamento
 * nas chaves (só o Horizon tem); havendo duas parceladas, a de menos parcelas
 * é o reforço e a de mais é a mensal — que é como as sete tabelas com as duas
 * colunas escrevem, sem exceção.
 */
function nomearColunas(quantidades: number[], temFinanciamento: boolean): PapelColuna[] {
  const n = quantidades.length
  const papeis: (PapelColuna | null)[] = new Array(n).fill(null)
  papeis[0] = 'entrada'
  const ultima = temFinanciamento && n >= 2 ? n - 1 : -1
  if (ultima > 0) papeis[ultima] = 'saldo'

  const meio = quantidades.map((q, i) => ({ q, i })).filter(({ i }) => papeis[i] === null)
  const parceladas = meio.filter(({ q }) => q > 1).sort((a, b) => a.q - b.q)
  for (const { i } of meio.filter(({ q }) => q === 1)) papeis[i] = 'chaves'
  if (parceladas.length >= 2) {
    papeis[parceladas[0].i] = 'reforcos'
    for (const { i } of parceladas.slice(1)) papeis[i] = 'mensais'
  } else {
    for (const { i } of parceladas) papeis[i] = 'mensais'
  }
  return papeis as PapelColuna[]
}

export function parsearTabelaEraldo(texto: string): ResultadoEraldo {
  const cabecalho = parseCabecalho(texto)
  const pct = cabecalho.percentuais
  const cub = cabecalho.cub_valor
  const linhas = texto.split('\n').map(limpar).filter(Boolean)

  // Contagem independente do parser: quantas vezes o texto anuncia um
  // apartamento. Não passa pelo fatiador, então não repete o erro do Pavia, em
  // que a conferência usava o mesmo corte que estava errando e aprovava.
  const aptosNoTexto = linhas.reduce((n, l) => n + (APTO.test(l) ? 1 : 0), 0)

  // Só o Play traz dormitórios; nas outras a metragem é a única fonte. O
  // rótulo quebra em duas linhas ("Nº Nº VAGAS" / "DORM. CARROS GARAGEM"), por
  // isso procurar "Nº DORM" junto não acha nada.
  const corteUnidades = texto.search(APTO)
  const temDormitorios = /\bDORM/i.test(texto.slice(0, corteUnidades > 0 ? corteUnidades : 600))

  type Bruta = { unidade: string; u: Omit<UnidadeEraldo, 'colunas'>; valores: number[]; qtds: number[] }
  const brutas: Bruta[] = []
  const rejeitadas: RejeitadaEraldo[] = []

  const fatias = fatiar(linhas)
  const consumidas = new Set(fatias.map((f) => f.valoresEm))

  for (const { linha, volta } of fatias) {
    const unidade = linha.match(APTO)?.[1] ?? '?'
    const reais = [...linha.matchAll(/R\$\s*([\d.]+,\d{2})/g)].map((m) => moeda(m[1]))
    // As áreas são os decimais ANTES do primeiro R$.
    const antes = linha.split(/R\$/)[0]
    const areas = [...antes.matchAll(/(\d[\d.]*,\d{2})/g)].map((m) => moeda(m[0]))

    const problemas: string[] = []
    if (!pct) {
      rejeitadas.push({ unidade, motivo: 'percentuais do cabeçalho não lidos' })
      continue
    }
    // Uma coluna de preço + uma por percentual. Nem mais nem menos — SALVO
    // quando a construtora publica um preço promocional ao lado do preço
    // cheio ("PREÇO CAMPANHA", visto no Árbor a partir de agosto/2026): aí
    // entra mais uma coluna de preço antes das fatias. Nem mais nem menos que
    // isso: valor sobrando é linha colada de outra unidade, valor faltando é
    // coluna que não foi lida.
    const temCampanha = reais.length === pct.length + 2
    if ((reais.length !== pct.length + 1 && !temCampanha) || areas.length < 3) {
      rejeitadas.push({
        unidade,
        motivo: `colunas fora do esperado (${areas.length} áreas, ${reais.length} valores; esperados 3 e ${pct.length + 1}, ou ${pct.length + 2} com preço campanha)`,
      })
      continue
    }

    // Com campanha, a ORDEM impressa é [preço cheio, preço campanha, fatias...].
    // As fatias de entrada/reforços/mensais fecham contra o preço campanha, não
    // contra o cheio — conferido nas 21 unidades do Árbor de agosto/2026: 20%
    // do preço cheio não bate com a entrada impressa, 20% do preço campanha
    // bate ao centavo.
    const precoCheio = temCampanha ? reais[0] : null
    const [preco, ...fatiasValores] = temCampanha ? reais.slice(1) : reais
    const cubQtd = areas[2]
    if (!Number.isFinite(preco) || preco <= 0) problemas.push('preço ausente')

    // A conferência do Eraldo: o preço CHEIO (antes de campanha, se houver)
    // tem que ser a quantidade de CUB impressa vezes o CUB do mês. O preço
    // campanha já sai descontado e não fecharia contra o CUB — por isso a
    // conferência usa sempre o cheio.
    const precoParaCub = precoCheio ?? preco
    if (cub === null) {
      problemas.push('CUB do cabeçalho não lido')
    } else if (Math.abs(precoParaCub / cub - cubQtd) > TOLERANCIA_CUB) {
      problemas.push(`CUB não fecha: ${(precoParaCub / cub).toFixed(2)} calculado ≠ ${cubQtd.toFixed(2)} impresso`)
    }

    const qtds: number[] = []
    for (let j = 0; j < fatiasValores.length; j++) {
      const alvo = preco * pct[j]
      const v = fatiasValores[j]
      if (!Number.isFinite(v) || v <= 0) { problemas.push(`coluna ${j + 1} ausente`); qtds.push(NaN); continue }
      const q = alvo / v
      if (Math.abs(q - Math.round(q)) > 0.02 || Math.round(q) < 1) {
        problemas.push(`coluna ${j + 1} (${(pct[j] * 100).toFixed(0)}%) não dá inteiro (${q.toFixed(3)})`)
      }
      // Pagamento único tem que bater com a fatia ao centavo; parcelado tem o
      // arredondamento de cada parcela.
      if (Math.abs(q - 1) < 0.02 && Math.abs(v - alvo) > TOLERANCIA) {
        problemas.push(`coluna ${j + 1}: ${v.toFixed(2)} ≠ ${(pct[j] * 100).toFixed(0)}% de ${preco.toFixed(2)}`)
      }
      qtds.push(Math.round(q))
    }

    if (problemas.length > 0) {
      rejeitadas.push({ unidade, motivo: problemas.join(' · ') })
      continue
    }

    const dep = volta.map((v) => v.replace(/\s+/g, ' ').trim()).filter((v) => /Dep\.|Subsolo|\(G\d/i.test(v)).join(' ')
    // Só o Play tem as colunas "Nº DORM." e "Nº VAGAS CARROS", e as escreve
    // como inteiros soltos antes das áreas ("Apto 301 2 1 - 61,18 …").
    //
    // Ancorar no número da unidade não serve: nas unidades 1004 e 1101 o
    // identificador ficou numa linha e a vaga entrou no meio ("Apto 1004 V332
    // 2 1 - 61,60"), e as duas entravam sem dormitório. Ancorar na primeira
    // área pega os dois casos.
    const contagens = temDormitorios ? antes.match(/(\d)\s+(\d)\s*-?\s*(?=[\d.]+,\d{2})/) : null
    const dorm = contagens ? Number(contagens[1]) : NaN
    const vagasNum = contagens ? Number(contagens[2]) : NaN

    brutas.push({
      unidade,
      valores: fatiasValores,
      qtds,
      u: {
        unidade,
        vagas: linha.match(/(\d+\s*Vagas?)/i)?.[1]
          ?? (Number.isFinite(vagasNum) ? `${vagasNum} ${vagasNum === 1 ? 'Vaga' : 'Vagas'}` : null),
        deposito: dep || null,
        dormitorios: Number.isFinite(dorm) ? dorm : null,
        metragem: areas[0],
        metragem_global: areas[1],
        cub_quantidade: cubQtd,
        preco,
        preco_cheio: precoCheio,
      },
    })
  }

  // As quantidades têm que ser as MESMAS em todas as unidades — é a tabela do
  // empreendimento, não do apartamento. Divergir significa leitura errada.
  const nCol = pct?.length ?? 0
  let quantidades: number[] | null = null
  if (brutas.length > 0 && nCol > 0) {
    const cols: number[] = []
    for (let j = 0; j < nCol; j++) {
      const vistos = [...new Set(brutas.map((b) => b.qtds[j]))]
      if (vistos.length !== 1) { quantidades = null; cols.length = 0; break }
      cols.push(vistos[0])
    }
    if (cols.length === nCol) quantidades = cols
  }

  const papeis = quantidades ? nomearColunas(quantidades, cabecalho.tem_financiamento) : null
  const unidades: UnidadeEraldo[] = papeis && quantidades && pct
    ? brutas.map((b) => ({
        ...b.u,
        colunas: papeis.map((papel, j) => ({
          papel,
          percentual: pct[j],
          valor: b.valores[j],
          quantidade: quantidades[j],
        })),
      }))
    : []

  // Sem nome de coluna não há plano; as linhas viram rejeitadas para que a
  // contagem continue fechando e o motivo apareça.
  if (!papeis && brutas.length > 0) {
    for (const b of brutas) {
      rejeitadas.push({ unidade: b.unidade, motivo: 'quantidades divergem entre as unidades — alguma coluna foi lida errado' })
    }
  }

  // Segunda rede, ortogonal à contagem de "Apto": toda linha com a assinatura
  // de uma linha de valores tem que ter sido consumida pelo fatiador.
  //
  // Foi ela que achou a segunda tabela do Symphony — sete SALAS comerciais
  // (R$ 651 mil a R$ 3,19 milhões) impressas depois do rodapé dos
  // apartamentos, com estrutura própria (20/40/40, 2 reforços, 24 mensais).
  // A contagem de "Apto" fechava 29 de 29 e não via nada: as salas não são
  // "Apto". Contar só o que o parser sabe procurar é a cegueira do Pavia
  // outra vez, com outro nome.
  const minValores = Math.min(3, (pct?.length ?? 2) + 1)
  const linhasOrfas = linhas
    .map((l, i) => ({ l, i }))
    .filter(({ l, i }) => !consumidas.has(i) && [...l.matchAll(/R\$\s*[\d.]+,\d{2}/g)].length >= minValores)
    .map(({ l }) => l)

  // O rodapé começa depois da última linha de unidade consumida.
  const ultimaUnidade = fatias.length > 0 ? Math.max(...fatias.map((f) => f.valoresEm)) : -1
  cabecalho.opcoes_pagamento = ultimaUnidade >= 0 ? lerOpcoesEraldo(linhas, ultimaUnidade) : []

  return {
    cabecalho,
    unidades,
    rejeitadas,
    quantidades,
    conferencia: {
      aptos_no_texto: aptosNoTexto,
      linhas_de_valor_orfas: linhasOrfas,
      confere: aptosNoTexto === unidades.length + rejeitadas.length && linhasOrfas.length === 0,
    },
  }
}

/**
 * Onde o rodapé deixa de ser condição comercial e vira observação de obra.
 *
 * "ATENÇÃO: O período máximo de intervalo entre os reforços será de 12 meses"
 * e a lista numerada ("1 - Os valores expressos…", "3 - Obra iniciada…") não
 * são condição de pagamento e não devem entrar na descrição que o corretor lê
 * na tela para repetir ao cliente.
 */
const FIM_DAS_CONDICOES =
  /ATEN[ÇC][ÃA]O\s*:|^\s*\d{1,2}\s*-\s*(?:Os\s+valores|Esta\s+tabela|Obra|In[íi]cio|Previs[ãa]o|Prazo|Incorpora|R\.\d)|Incorpora[çc][ãa]o\s+Imobili[áa]ria/im

/**
 * Lê a política comercial do rodapé das tabelas da Eraldo.
 *
 * O leitor da Fontana não serve: lá o rodapé escreve "OPÇÃO 01: DESCONTO DE
 * 10% SOBRE O VALOR TOTAL, PAGANDO 40% ATÉ AS CHAVES"; aqui é
 *
 *     Condição 2 - 5% de desconto
 *     - Parcela A (70% até as chaves) - 10% de entrada, 20% em reforços…
 *     - Parcela B - 30% em até 180 parcelas mensais corrigidas pelo IGPM…
 *
 * — título numerado, detalhe em linhas de "Parcela A/B", e o percentual do
 * desconto ANTES da palavra "desconto", não depois. Nenhum dos dois padrões
 * casa com o outro, e o resultado era `opcoes_pagamento` vazio nas nove
 * tabelas: os descontos de 5%, 7% e 10% existiam no PDF e não chegavam na
 * tela. É a mesma classe de defeito do Lavis.
 *
 * Três tabelas (Gran Palazzo, Horizon, L'Essence) não têm lista de condições —
 * o desconto à vista aparece solto na lista numerada de observações, e é lido
 * de lá.
 *
 * `ate` é o índice da última linha de unidade: o rodapé começa depois dela. No
 * Symphony isso é o que impede a condição das SALAS comerciais (20/40/40 em
 * 24x, outro negócio) de ser oferecida como se fosse dos apartamentos.
 */
export function lerOpcoesEraldo(linhas: string[], ate: number): OpcaoPagamento[] {
  // Um segundo bloco de tabela começa com a sua própria linha de estrutura
  // ("PRIVAT. TOTAL 20% 40% 40%"). Somar 100% não basta para reconhecê-la: a
  // condição 3 do Gran Michel é "20% de entrada 20% em reforços até as chaves
  // 60% em 22 parcelas mensais", que também fecha em 100 e cortava o rodapé
  // ali — as condições 3 e 4, entre elas o desconto de 10% à vista, sumiam.
  // A linha de estrutura é um RÓTULO: fora os percentuais, quase não tem letra.
  const ehLinhaDeEstrutura = (l: string) => {
    const p = [...l.matchAll(/(?<![,.])\b(\d{1,2})%/g)].map((m) => Number(m[1]))
    if (p.length < 2 || Math.abs(p.reduce((a, b) => a + b, 0) - 100) > 0.5) return false
    return l.replace(/(?<![,.])\b\d{1,2}%/g, '').replace(/[^A-Za-zÀ-ÿ]/g, '').length <= 20
  }
  const fim = (() => {
    for (let i = ate + 1; i < linhas.length; i++) if (ehLinhaDeEstrutura(linhas[i])) return i
    return linhas.length
  })()
  // O PDF do Aura repete a linha da condição 2 com as letras comidas —
  // "C di ã 2 P é h (5% d d )" — e ela entrava na descrição que o corretor lê
  // na tela. Linha em que a maioria das palavras tem uma letra só é sujeira de
  // extração, não texto.
  const ehLixo = (l: string) => {
    const w = l.trim().split(/\s+/)
    return w.length >= 5 && w.filter((x) => x.replace(/[^A-Za-zÀ-ÿ]/g, '').length <= 1).length / w.length > 0.6
  }
  const rodape = linhas.slice(ate + 1, fim).filter((l) => !ehLixo(l)).join('\n')

  const opcoes: OpcaoPagamento[] = []
  const blocos = [...rodape.matchAll(/Condi[çc][ãa]o\s*(\d+)\s*[-–]\s*([\s\S]*?)(?=Condi[çc][ãa]o\s*\d+\s*[-–]|$)/gi)]

  for (const b of blocos) {
    // Cada bloco vai até onde as observações de obra começam.
    const corte = b[2].search(FIM_DAS_CONDICOES)
    const bruto = (corte >= 0 ? b[2].slice(0, corte) : b[2])
      .replace(/^\s*-+>?\s*/gm, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[;.\s]+$/, '')
    if (!bruto) continue

    const desc = `Condição ${b[1]} — ${bruto}`
    const opcao: OpcaoPagamento = { tipo: classificarEraldo(bruto), descricao: desc, ...numerosEraldo(bruto) }
    // Duas linhas idênticas por engano de digitação: a condição 3 do Gran
    // Michel repete a "Parcela A" no lugar da "Parcela B".
    if (!opcoes.some((o) => o.descricao === opcao.descricao)) opcoes.push(opcao)
  }

  // Desconto à vista solto na lista numerada de observações.
  const aVista = rodape.match(/(\d{1,2})\s*%\s*de\s*desconto\s*(?:para\s*)?(?:pagamento\s*)?[àáa]\s*vista/i)
  if (aVista && !opcoes.some((o) => o.tipo === 'a_vista')) {
    opcoes.push({
      tipo: 'a_vista',
      descricao: `Pagamento à vista com ${aVista[1]}% de desconto`,
      descontoPct: Number(aVista[1]),
    })
  }

  return opcoes
}

function classificarEraldo(desc: string): OpcaoPagamento['tipo'] {
  if (/[àáa]\s*vista/i.test(desc)) return 'a_vista'
  if (/construtora|direto/i.test(desc)) return 'direto'
  if (/banc[áa]ri/i.test(desc)) return 'bancario'
  return 'outro'
}

function numerosEraldo(desc: string): Partial<OpcaoPagamento> {
  const out: Partial<OpcaoPagamento> = {}

  // "5% de desconto" — o percentual vem ANTES da palavra, ao contrário da
  // Fontana ("DESCONTO DE 10%").
  const desconto = desc.match(/(\d{1,2})\s*%\s*de\s*desconto/i)
  if (desconto) out.descontoPct = Number(desconto[1])

  // Quanto precisa estar quitado até a entrega. Três formas, nesta ordem — e
  // NENHUMA delas é "o primeiro percentual perto da palavra chaves".
  //
  // Essa forma solta parecia funcionar e mentia: a condição 1 do Gran Michel
  // diz "5% em reforços até as chaves" (a fatia do reforço, não o total, que é
  // 30%) e a condição 3 diz "20% em reforços até as chaves" quando o negócio
  // inteiro é quitado antes da entrega. Melhor não afirmar do que afirmar 5%.
  const entreParenteses = desc.match(/\((\d{1,3})\s*%\s*at[ée]\s*as?\s*chaves\)/i)
  const aposEntrega = desc.match(/(\d{1,3})\s*%\s*ap[óo]s\s*a\s*entrega/i)
  if (entreParenteses) {
    out.ateAsChavesPct = Number(entreParenteses[1])
  } else if (aposEntrega) {
    // "60% após a entrega das chaves" (condição 40/60 do Aura) — o resto é o
    // que se paga antes.
    out.ateAsChavesPct = 100 - Number(aposEntrega[1])
  } else if (/pagamento\s+at[ée]\s+as?\s+chaves|at[ée]\s+as?\s+chaves\s*\(/i.test(desc)) {
    out.ateAsChavesPct = 100
  }

  const entrada = desc.match(/(\d{1,2})\s*%\s*de\s*entrada/i)
  if (entrada) out.atoMinimoPct = Number(entrada[1])

  // "em até 180 parcelas mensais corrigidas pelo IGPM + 075% ao mês"
  const meses = desc.match(/at[ée]\s*(\d{1,3})\s*parcelas/i)
  if (meses) out.meses = Number(meses[1])
  const juros = desc.match(/IGPM\s*\+\s*0?(\d{1,3}(?:,\d{1,2})?)\s*%|(\d{1,3}(?:,\d{1,2})?)\s*%\s*ao\s*m[êe]s/i)
  if (juros) {
    const bruto = Number((juros[1] ?? juros[2]).replace(',', '.'))
    out.jurosAoMes = bruto >= 10 ? bruto / 100 : bruto
  }
  if (/IGPM/i.test(desc)) out.indice = 'IGPM'
  else if (/CUB/i.test(desc)) out.indice = 'CUB'

  return out
}

/** Atalho de leitura: a coluna daquele papel, quando a tabela tem. */
export const coluna = (u: UnidadeEraldo, papel: PapelColuna) =>
  u.colunas.find((c) => c.papel === papel) ?? null
