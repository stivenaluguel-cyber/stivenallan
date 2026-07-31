// Importador das tabelas da Construtora Eraldo.
//
// É um parser SEPARADO do da Fontana de propósito. As duas construtoras não
// compartilham nada de estrutura: onde a Fontana escreve "102 3 16S - T" e
// termina a linha com a quantidade de CUB repetida, o Eraldo escreve
// "Apto 304  2 Vagas - …  R$ 981.383,66" e espalha depósito e pavimento em
// linhas vizinhas. Tentar servir as duas com o mesmo código significaria afrouxar o
// reconhecimento — e afrouxar é como se perde unidade em silêncio.
//
// O que dá segurança aqui é a mesma ideia: a tabela tem invariantes exatas.
// Conferidas nas 20 unidades do Gran Michel (julho/2026), ao centavo:
//
//   entrada    = 10% do preço
//   3 reforços =  5%
//   22 mensais = 15%
//   pós-chaves = 70%   (parcelado em até 180x)
//                ────
//                 100%
//
// Os percentuais saem do cabeçalho. As QUANTIDADES (3 e 22) são derivadas da
// aritmética, não lidas: na extração elas caem numa linha solta
// ("VAGAS (m²) CUB (R$) 3 22") fácil de confundir com outra coisa. Derivar e
// exigir que o mesmo par valha para TODAS as unidades é mais forte que ler.

export type UnidadeEraldo = {
  unidade: string
  vagas: string | null
  deposito: string | null
  metragem: number
  metragem_garagem_deposito: number
  metragem_total: number
  preco: number
  entrada: number
  reforco: number
  reforcos_qtd: number
  mensal: number
  mensais_qtd: number
  pos_chaves: number
}

export type RejeitadaEraldo = { unidade: string; motivo: string }

export type CabecalhoEraldo = {
  cub_valor: number | null
  /** [entrada, reforços, mensais, pós-chaves] como fração. */
  percentuais: number[] | null
  /** Prazo máximo do pós-chaves. */
  pos_chaves_meses: number | null
  endereco: string | null
}

export type ResultadoEraldo = {
  cabecalho: CabecalhoEraldo
  unidades: UnidadeEraldo[]
  rejeitadas: RejeitadaEraldo[]
  /** Quantidades derivadas, iguais em todas as unidades. */
  quantidades: { reforcos: number | null; mensais: number | null }
}

// O PDF arredonda cada célula; somar 22 mensais acumula centavos.
const TOLERANCIA = 3.0

const moeda = (s: string) => Number(s.replace(/\./g, '').replace(',', '.'))

function parseCabecalho(texto: string): CabecalhoEraldo {
  const cub = texto.match(/CUB\s*\([^)]*\)\s*\D{0,4}\s*R\$\s*([\d.]+,\d{2})/i)
  const pcts = [...texto.matchAll(/\b(\d{1,2})%/g)].map((m) => Number(m[1]) / 100)
  // Os quatro primeiros percentuais do cabeçalho são a estrutura de pagamento.
  const quatro = pcts.slice(0, 4)
  const meses = texto.match(/AT[ÉE]\s*(\d{1,3})\s*X/i)
  const end = texto.match(/(?:LAN[ÇC]AMENTO|OBRA)\s*-\s*(.+?)(?:\n|$)/i)
  return {
    cub_valor: cub ? moeda(cub[1]) : null,
    percentuais: quatro.length === 4 && Math.abs(quatro.reduce((a, b) => a + b, 0) - 1) < 0.001 ? quatro : null,
    pos_chaves_meses: meses ? Number(meses[1]) : null,
    endereco: end ? end[1].trim() : null,
  }
}

/**
 * Fatia por "Apto NNN", costurando as linhas vizinhas que não são unidade.
 *
 * O depósito é do apartamento da linha do meio e fica na garagem do subsolo —
 * confirmado pelo corretor. As linhas soltas antes e depois pertencem a ele.
 */
function fatiar(texto: string): { linha: string; volta: string[] }[] {
  // "(Diferenciado)" ocupa uma caixa de várias linhas no PDF e parte ao meio:
  // o "(Diferenciad" fica na linha de dados e o "o)" vaza colado no "Apto" da
  // unidade seguinte, produzindo "Apto o) 1205". Limpar antes de fatiar evita
  // que o número da unidade fique inalcançável.
  const limpar = (l: string) =>
    l.replace(/\bApto\s+o\)\s+/i, 'Apto ').replace(/\(Diferenciad\b\)?/gi, '').trim()

  const linhas = texto.split('\n').map(limpar).filter(Boolean)
  const ehApto = (l: string) => /^Apto\s+\d{3,4}\b/i.test(l)
  const temValor = (l: string) => /R\$\s*[\d.]+,\d{2}/.test(l)

  const out: { linha: string; volta: string[] }[] = []
  for (let i = 0; i < linhas.length; i++) {
    if (!ehApto(linhas[i])) continue

    // Caso normal: "Apto 304 2 Vagas - 93,20 … R$ 981.383,66" numa linha só.
    if (temValor(linhas[i])) {
      const volta: string[] = []
      if (i > 0 && !ehApto(linhas[i - 1])) volta.push(linhas[i - 1])
      if (i + 1 < linhas.length && !ehApto(linhas[i + 1]) && !temValor(linhas[i + 1])) volta.push(linhas[i + 1])
      out.push({ linha: linhas[i], volta })
      continue
    }

    // Caso do 1204: o identificador ficou SOZINHO e os valores vieram abaixo,
    // depois do depósito. Junta os dois, absorvendo o que estiver no meio.
    const volta: string[] = []
    let j = i + 1
    while (j < linhas.length && !temValor(linhas[j]) && !ehApto(linhas[j])) {
      volta.push(linhas[j])
      j++
    }
    if (j < linhas.length && temValor(linhas[j]) && !ehApto(linhas[j])) {
      if (j + 1 < linhas.length && !ehApto(linhas[j + 1]) && !temValor(linhas[j + 1])) volta.push(linhas[j + 1])
      out.push({ linha: `${linhas[i]} ${linhas[j]}`, volta })
      i = j
    }
  }
  return out
}

export function parsearTabelaEraldo(texto: string): ResultadoEraldo {
  const cabecalho = parseCabecalho(texto)
  const unidades: UnidadeEraldo[] = []
  const rejeitadas: RejeitadaEraldo[] = []
  const pct = cabecalho.percentuais

  for (const { linha, volta } of fatiar(texto)) {
    const unidade = linha.match(/^Apto\s+(\d{3,4})/i)?.[1] ?? '?'
    const reais = [...linha.matchAll(/R\$\s*([\d.]+,\d{2})/g)].map((m) => moeda(m[1]))
    // As áreas são os decimais ANTES do primeiro R$.
    const antes = linha.split(/R\$/)[0]
    const areas = [...antes.matchAll(/(\d[\d.]*,\d{2})/g)].map((m) => moeda(m[0]))

    if (reais.length < 5 || areas.length < 3) {
      rejeitadas.push({ unidade, motivo: `colunas insuficientes (${areas.length} áreas, ${reais.length} valores)` })
      continue
    }

    const [preco, entrada, reforco, mensal, posChaves] = reais
    const problemas: string[] = []
    for (const [nome, v] of Object.entries({ preco, entrada, reforco, mensal, posChaves })) {
      if (!Number.isFinite(v)) problemas.push(`${nome} ausente`)
    }

    if (!pct) {
      problemas.push('percentuais do cabeçalho não lidos')
    } else {
      if (Math.abs(entrada - preco * pct[0]) > TOLERANCIA) {
        problemas.push(`entrada ${entrada.toFixed(2)} ≠ ${pct[0] * 100}% de ${preco.toFixed(2)}`)
      }
      if (Math.abs(posChaves - preco * pct[3]) > TOLERANCIA) {
        problemas.push(`pós-chaves ${posChaves.toFixed(2)} ≠ ${pct[3] * 100}% de ${preco.toFixed(2)}`)
      }
    }

    // Quantidades DERIVADAS: quantos reforços/mensais são precisos para cobrir
    // a fatia do percentual. Têm que dar inteiro redondo.
    const nRef = pct && reforco > 0 ? (preco * pct[1]) / reforco : NaN
    const nMen = pct && mensal > 0 ? (preco * pct[2]) / mensal : NaN
    const inteiro = (x: number) => Number.isFinite(x) && Math.abs(x - Math.round(x)) < 0.02 && Math.round(x) > 0
    if (!inteiro(nRef)) problemas.push(`reforços não dão inteiro (${nRef.toFixed(3)})`)
    if (!inteiro(nMen)) problemas.push(`mensais não dão inteiro (${nMen.toFixed(3)})`)

    if (problemas.length > 0) {
      rejeitadas.push({ unidade, motivo: problemas.join(' · ') })
      continue
    }

    const dep = volta.map((v) => v.replace(/\s+/g, ' ').trim()).filter((v) => /Dep\.|Subsolo|\(G\d/i.test(v)).join(' ')
    unidades.push({
      unidade,
      vagas: linha.match(/(\d+\s*Vagas?)/i)?.[1] ?? null,
      deposito: dep || null,
      metragem: areas[0],
      metragem_garagem_deposito: areas[1],
      metragem_total: areas[2],
      preco, entrada, reforco, mensal, pos_chaves: posChaves,
      reforcos_qtd: Math.round(nRef),
      mensais_qtd: Math.round(nMen),
    })
  }

  // As quantidades têm que ser as MESMAS em todas as unidades — é a tabela do
  // empreendimento, não do apartamento. Divergir significa leitura errada.
  const refs = [...new Set(unidades.map((u) => u.reforcos_qtd))]
  const mens = [...new Set(unidades.map((u) => u.mensais_qtd))]
  return {
    cabecalho,
    unidades,
    rejeitadas,
    quantidades: { reforcos: refs.length === 1 ? refs[0] : null, mensais: mens.length === 1 ? mens[0] : null },
  }
}
