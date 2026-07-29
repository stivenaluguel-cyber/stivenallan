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

export type UnidadeImportada = {
  unidade: string
  dormitorios: number
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

  return {
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
function fatiarUnidades(texto: string): string[] {
  const corpo = texto.split(/Observa[çc][õo]es\s*:/i)[0]
  const partes = corpo.split(/(?=\b\d{3,4}\s+\d\s+\d{1,3}[SE]\b)/)
  return partes.filter((p) => /^\d{3,4}\s+\d\s+\d{1,3}[SE]\b/.test(p.trim()))
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
  const unidades: UnidadeImportada[] = []
  const rejeitadas: LinhaRejeitadaTabela[] = []

  for (const bruto of fatiarUnidades(texto)) {
    const chunk = bruto.trim()
    const unidade = chunk.match(/^(\d{3,4})/)?.[1] ?? '?'
    const dormitorios = Number(chunk.match(/^\d{3,4}\s+(\d)/)?.[1] ?? 0)
    const boxCodigo = chunk.match(/^\d{3,4}\s+\d\s+(\d{1,3}[SE])/)?.[1] ?? null

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
    const inteiro = cauda.replace(/\d[\d.]*,\d{2}/g, ' ').match(/\b(\d{2,4})\b/)
    const cubFator = inteiro ? Number(inteiro[1]) : null

    // Ordem das colunas no PDF: área, box, total m², entrada, total venda,
    // reforço, (total repetido), parcela, (total), financiamento, (total).
    if (decimais.length < 10 || cubFator === null) {
      rejeitadas.push({ unidade, motivo: `colunas insuficientes (${decimais.length} valores, fator ${cubFator})` })
      continue
    }

    const [metragem, boxM2, totalM2, entrada, total, reforco] = decimais
    const parcela = decimais[7]
    const financiamento = decimais[9]

    // ── As três invariantes ───────────────────────────────────────────
    const problemas: string[] = []

    if (cabecalho.cub_valor) {
      const esperado = cubFator * cabecalho.cub_valor
      if (Math.abs(esperado - total) > TOLERANCIA_REAIS) {
        problemas.push(`total ${total.toFixed(2)} ≠ ${cubFator} × CUB ${cabecalho.cub_valor.toFixed(2)} = ${esperado.toFixed(2)}`)
      }
    }

    const soma30 = entrada + 40 * parcela + 4 * reforco
    if (Math.abs(soma30 - total * 0.3) > TOLERANCIA_REAIS) {
      problemas.push(`entrada+40p+4r = ${soma30.toFixed(2)} ≠ 30% de ${total.toFixed(2)}`)
    }

    if (Math.abs(financiamento - total * 0.7) > TOLERANCIA_REAIS) {
      problemas.push(`financiamento ${financiamento.toFixed(2)} ≠ 70% de ${total.toFixed(2)}`)
    }

    if (problemas.length > 0) {
      rejeitadas.push({ unidade, motivo: problemas.join(' · ') })
      continue
    }

    unidades.push({
      unidade,
      dormitorios,
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
  }
}

/**
 * Converte para o formato de `empreendimentos_unidades`.
 *
 * `condicoes_negociacao` recebe o plano de pagamento em texto legível: é o que
 * o corretor lê na tela ao abrir a unidade, e o que ele repete no WhatsApp.
 */
export function paraUnidadeDoBanco(u: UnidadeImportada, empreendimentoId: string) {
  const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  return {
    empreendimento_id: empreendimentoId,
    unidade: u.unidade,
    andar: u.andar,
    metragem: u.metragem,
    dormitorios: u.dormitorios,
    // A tabela do Pineto diz "02 Dormitórios (01 Suíte)" no rodapé, para todas
    // as unidades — não há coluna por unidade.
    suites: 1,
    valor_tabela: u.valor_tabela,
    valor_entrada_min: u.valor_entrada_min,
    cub_fator: u.cub_fator,
    disponivel: true,
    condicoes_negociacao:
      `Entrada ${brl(u.valor_entrada_min)} + 40x ${brl(u.parcela_mensal)} + 4 reforços anuais de ` +
      `${brl(u.reforco_anual)} (30% até as chaves). Saldo de ${brl(u.saldo_financiamento)} ` +
      `financiado ou em até 240x direto com a construtora. Valor equivale a ${u.cub_fator} CUB.`,
  }
}
