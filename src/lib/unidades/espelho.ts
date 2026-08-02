// Espelho de vendas.
//
// É o artefato que TODO plantão de incorporadora tem na parede e que nenhum
// CRM de corretor (Habitus, Método C.I.) oferece: a grade de unidades por
// andar, com o status de cada uma. Aqui ele vive em `empreendimentos_unidades`
// — schema que já nasceu com reserva (`reservado_ate`, `lead_id_reserva`) e
// preço em CUB (`cub_fator`), só nunca teve tela nem dado.
//
// Decisões que moldam este módulo:
//
// 1. Reserva expira SOZINHA, sem cron: o status é derivado no momento da
//    leitura ("lazy expiry"). Uma reserva de 48h vencida simplesmente volta a
//    contar como disponível na próxima consulta — não existe estado podre.
// 2. `disponivel = false` significa VENDIDA (permanente). Reserva nunca mexe
//    em `disponivel`; ela só carimba `reservado_ate` no futuro. Assim os dois
//    conceitos não se contaminam.
// 3. O que o público vê é um SUBCONJUNTO explícito (pickPublico): anotações
//    de negociação, lead da reserva e fator CUB são informação interna.

export type UnidadeEspelho = {
  id: string
  bloco: string | null
  unidade: string
  andar: number | null
  metragem: number
  dormitorios: number | null
  suites: number | null
  orientacao: string | null
  valor_tabela: number | null
  valor_promocional: number | null
  valor_entrada_min: number | null
  disponivel: boolean
  reservado_ate: string | null
  lead_id_reserva: string | null
  condicoes_negociacao: string | null
  cub_fator: number | null
  plano_pagamento: unknown
}

export type StatusUnidade = 'disponivel' | 'reservada' | 'vendida'

export const RESERVA_DURACAO_HORAS = 48

export function statusDaUnidade(
  u: Pick<UnidadeEspelho, 'disponivel' | 'reservado_ate'>,
  agora: Date,
): StatusUnidade {
  if (!u.disponivel) return 'vendida'
  if (u.reservado_ate) {
    const t = new Date(u.reservado_ate).getTime()
    // Data inválida no banco não pode travar a unidade como "reservada"
    // eternamente — trata como sem reserva.
    if (Number.isFinite(t) && t > agora.getTime()) return 'reservada'
  }
  return 'disponivel'
}

export function expiraEm(agora: Date, horas = RESERVA_DURACAO_HORAS): string {
  return new Date(agora.getTime() + horas * 3_600_000).toISOString()
}

export type PrecoUnidade = { valor: number | null; promocional: boolean; de: number | null }

/**
 * Preço exibível. Promoção só é promoção quando é MENOR que a tabela —
 * um valor_promocional digitado errado (maior) seria propaganda enganosa
 * renderizada com selo de desconto.
 */
export function precoDaUnidade(
  u: Pick<UnidadeEspelho, 'valor_tabela' | 'valor_promocional'>,
): PrecoUnidade {
  const tabela = numeroOuNull(u.valor_tabela)
  const promo = numeroOuNull(u.valor_promocional)
  if (promo !== null && tabela !== null && promo < tabela) {
    return { valor: promo, promocional: true, de: tabela }
  }
  return { valor: tabela ?? promo, promocional: false, de: null }
}

function numeroOuNull(v: unknown): number | null {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

/**
 * Andar da unidade. Usa a coluna quando preenchida; senão deriva do número
 * ("302" → 3º, "1204" → 12º), que é a convenção de numeração predial
 * brasileira. Unidade sem número interpretável (loja "L01", garden "G2")
 * fica sem andar e cai no grupo "Térreo / outros".
 */
export function andarDaUnidade(u: Pick<UnidadeEspelho, 'andar' | 'unidade'>): number | null {
  if (u.andar !== null && u.andar !== undefined && Number.isFinite(Number(u.andar))) {
    return Number(u.andar)
  }
  const digitos = (u.unidade ?? '').replace(/\D/g, '')
  if (digitos.length >= 3) return Math.floor(Number(digitos) / 100)
  return null
}

export type AndarAgrupado = { andar: number | null; unidades: UnidadeEspelho[] }
export type BlocoAgrupado = { bloco: string | null; andares: AndarAgrupado[] }

/**
 * Monta a grade do espelho: blocos em ordem alfabética, andares do TOPO para
 * baixo (como no espelho de parede do plantão — cobertura em cima), unidades
 * em ordem numérica dentro do andar.
 */
export function agruparEspelho(unidades: UnidadeEspelho[]): BlocoAgrupado[] {
  const porBloco = new Map<string, UnidadeEspelho[]>()
  for (const u of unidades) {
    const chave = u.bloco?.trim() || ''
    if (!porBloco.has(chave)) porBloco.set(chave, [])
    porBloco.get(chave)!.push(u)
  }

  const blocos: BlocoAgrupado[] = []
  for (const [chave, lista] of [...porBloco.entries()].sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))) {
    const porAndar = new Map<string, UnidadeEspelho[]>()
    for (const u of lista) {
      const a = andarDaUnidade(u)
      const k = a === null ? 'null' : String(a)
      if (!porAndar.has(k)) porAndar.set(k, [])
      porAndar.get(k)!.push(u)
    }

    const andares: AndarAgrupado[] = [...porAndar.entries()]
      .map(([k, us]) => ({
        andar: k === 'null' ? null : Number(k),
        unidades: us.sort((x, y) => ordenavel(x.unidade) - ordenavel(y.unidade)),
      }))
      // Topo primeiro; o grupo sem andar (lojas/garden) vai para o fim.
      .sort((x, y) => (y.andar ?? -1) - (x.andar ?? -1))

    blocos.push({ bloco: chave || null, andares })
  }
  return blocos
}

function ordenavel(unidade: string): number {
  const d = (unidade ?? '').replace(/\D/g, '')
  return d ? Number(d) : Number.MAX_SAFE_INTEGER
}

export type ResumoEspelho = {
  total: number
  disponiveis: number
  reservadas: number
  vendidas: number
  percentualVendido: number
}

export function resumoEspelho(unidades: UnidadeEspelho[], agora: Date): ResumoEspelho {
  let disponiveis = 0
  let reservadas = 0
  let vendidas = 0
  for (const u of unidades) {
    const s = statusDaUnidade(u, agora)
    if (s === 'vendida') vendidas++
    else if (s === 'reservada') reservadas++
    else disponiveis++
  }
  const total = unidades.length
  return {
    total,
    disponiveis,
    reservadas,
    vendidas,
    percentualVendido: total === 0 ? 0 : Math.round((vendidas / total) * 100),
  }
}

// ─────────────────────────────────────────────────────────────────────
// Resolução property → empreendimento.
//
// As unidades apontam para `empreendimentos` (5 linhas), mas o site público
// navega por `properties` (36 linhas) — e os slugs DIVERGEM entre as duas
// tabelas ("pineto-centro-criciuma-sc" vs "pineto-..." do site). O nome é o
// único elo confiável. A resolução exige match ÚNICO: na dúvida, devolve
// null e o espelho simplesmente não aparece — nunca mostra as unidades do
// empreendimento errado.
// ─────────────────────────────────────────────────────────────────────

function chaveNome(s: string): string {
  return (s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    // "Residencial"/"Residenziale" são sufixo decorativo que uma tabela usa e
    // a outra não — fora da chave de comparação.
    .replace(/\b(residencial|residenziale|residenze)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
}

/**
 * `empreendimentos` tem linhas DUPLICADAS com o nome idêntico.
 *
 * "Lavis Residencial" e "Monte Leone Residencial" existem duas vezes cada: uma
 * com as unidades importadas e outra vazia, sobra de cadastro. Exigir match
 * único fazia os dois caírem em `null` — e o Lavis (55 unidades) e o Monte
 * Leone (26, de R$ 3,3 a 4,6 milhões) ficaram no ar com a seção de
 * disponibilidade escondida, sem erro em lugar nenhum.
 *
 * O desempate é ter unidade. Duas linhas com o mesmo nome e só uma com estoque
 * não é ambiguidade: é a linha certa e a sobra. Continua devolvendo `null`
 * quando o empate é real — mostrar as unidades do prédio errado seria pior que
 * não mostrar nada.
 */
export function resolverEmpreendimentoPorNome(
  nomeProperty: string,
  empreendimentos: { id: string; nome: string }[],
  comUnidades?: ReadonlySet<string>,
): string | null {
  const alvo = chaveNome(nomeProperty)
  if (!alvo) return null

  const desempatar = (cands: { id: string; nome: string }[]): string | null => {
    if (cands.length === 1) return cands[0].id
    if (cands.length === 0 || !comUnidades) return null
    const comEstoque = cands.filter((e) => comUnidades.has(e.id))
    return comEstoque.length === 1 ? comEstoque[0].id : null
  }

  const exatos = empreendimentos.filter((e) => chaveNome(e.nome) === alvo)
  if (exatos.length > 0) return desempatar(exatos)

  // Fallback por continência (um nome contém o outro), ainda exigindo
  // unicidade. Pega "Lavis" ↔ "Lavis Residencial Centro".
  const parciais = empreendimentos.filter((e) => {
    const k = chaveNome(e.nome)
    return k.length >= 4 && alvo.length >= 4 && (k.includes(alvo) || alvo.includes(k))
  })
  return desempatar(parciais)
}

// ─────────────────────────────────────────────────────────────────────
// Recorte público
// ─────────────────────────────────────────────────────────────────────

export type UnidadePublica = {
  id: string
  bloco: string | null
  unidade: string
  andar: number | null
  metragem: number
  dormitorios: number | null
  suites: number | null
  orientacao: string | null
  status: StatusUnidade
}

// O que NÃO está aqui é o ponto: preço por unidade e plano de pagamento saíram
// do payload anônimo.
//
// A tabela da Fontana formatada e sempre atualizada era a melhor moeda de
// troca da página — e estava de graça para qualquer concorrente que abrisse o
// site. Agora ela vem por `/api/espelho/simular`, depois que a pessoa se
// identifica. O que continua público é o que gera escassez sem entregar a
// tabela: disponibilidade, metragem, andar e um "a partir de" no topo.
//
// O gate é de SERVIDOR: o preço não sai no JSON. Esconder no CSS seria teatro.

/**
 * O que sai para o site anônimo: identidade da unidade e status. Nada de
 * dinheiro.
 */
export function pickPublico(u: UnidadeEspelho, agora: Date): UnidadePublica {
  return {
    id: u.id,
    bloco: u.bloco,
    unidade: u.unidade,
    andar: andarDaUnidade(u),
    metragem: Number(u.metragem),
    dormitorios: u.dormitorios,
    suites: u.suites,
    orientacao: u.orientacao,
    status: statusDaUnidade(u, agora),
  }
}

/**
 * O "a partir de" da seção — âncora de preço sem entregar a tabela.
 *
 * Calculado só sobre as unidades DISPONÍVEIS: anunciar o menor preço do
 * empreendimento quando essa unidade já foi vendida é anunciar o que não se
 * pode vender.
 */
export function precoMinimoDisponivel(unidades: UnidadeEspelho[], agora: Date): number | null {
  const valores = unidades
    .filter((u) => statusDaUnidade(u, agora) === 'disponivel')
    .map((u) => precoDaUnidade(u).valor)
    .filter((v): v is number => v !== null)
  return valores.length ? Math.min(...valores) : null
}
