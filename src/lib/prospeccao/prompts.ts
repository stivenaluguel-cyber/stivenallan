import type { PlaceCandidato } from './google-places'

// Duas chamadas de IA por campanha: uma monta o perfil de cliente ideal a
// partir das respostas do corretor (ICP + queries de busca), outra qualifica
// os candidatos que o Google Places devolveu. Separadas porque rodam em
// momentos diferentes — a primeira na criação da campanha, a segunda a cada
// "garimpar" — e testáveis sem rede, igual src/lib/dashboard/socio.ts.

export type RespostasFormulario = {
  produto: string
  publico?: string | null
  problema?: string | null
  localizacao?: string | null
  exemplos?: string | null
}

export type Icp = {
  nomeCampanha: string
  alvo: string
  abordagem: string
  estrategia: string
  criterios: string[]
  queries: string[]
}

const MAX_QUERIES = 4
const MIN_QUERIES = 1

export function montarPromptIcp(respostas: RespostasFormulario): string {
  const { produto, publico, problema, localizacao, exemplos } = respostas

  return `Você é um especialista em prospecção B2B ajudando um corretor de imóveis a montar uma campanha de busca ativa de empresas no Google Maps/Places.

O QUE ELE VENDE
${produto.trim()}

QUEM COSTUMA FECHAR NEGÓCIO COM ELE
${publico?.trim() || '(não informado — infira a partir do produto)'}

PROBLEMA QUE RESOLVE PARA ESSE CLIENTE
${problema?.trim() || '(não informado — infira a partir do produto)'}

ONDE BUSCAR
${localizacao?.trim() || 'Brasil inteiro (não restrinja a uma cidade)'}

CLIENTES QUE JÁ FECHARAM COM ELE (exemplos, se houver)
${exemplos?.trim() || '(nenhum exemplo informado)'}

TAREFA
Monte o perfil de cliente ideal (ICP) para uma busca de empresas no Google Places, e devolva também as buscas de texto que um usuário digitaria no Google Maps para encontrar esse perfil.

REGRAS
- "alvo", "abordagem" e "estrategia" são frases curtas (1-2 frases cada), em português, indo direto ao ponto — sem "com certeza", sem enrolação.
- "criterios" são 3 a 5 características objetivas de uma empresa desse perfil (porte, setor, tempo de mercado, tipo de operação) — não repita o alvo com outras palavras.
- "queries" são ${MIN_QUERIES} a ${MAX_QUERIES} buscas de texto DIFERENTES entre si (setores/ângulos distintos do mesmo alvo), cada uma no formato que funciona bem no Google Maps: "<tipo de negócio> em <cidade/região>". SEMPRE inclua a localização informada em cada query — nunca devolva uma query sem cidade/região quando uma localização foi informada.
- "nomeCampanha" é um nome curto (3-5 palavras) que descreve essa campanha.
- Nunca invente que a localização foi outra além da informada.

Devolva SOMENTE um JSON válido, sem markdown, sem texto antes ou depois, neste formato exato:
{"nomeCampanha":"...","alvo":"...","abordagem":"...","estrategia":"...","criterios":["...","..."],"queries":["...","..."]}`
}

function limparJson(bruto: string): string {
  // Groq às vezes embrulha o JSON num bloco ```json apesar da instrução —
  // tira a cerca antes de tentar parsear.
  return bruto.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
}

/**
 * Interpreta a saída da IA para o ICP. Retorna null (nunca lança) quando o
 * formato vem quebrado — quem chama decide o que fazer (normalmente 502 pro
 * usuário tentar de novo), igual ao padrão de parseSugestoes em socio.ts.
 */
export function parseIcp(bruto: string): Icp | null {
  let obj: unknown
  try {
    obj = JSON.parse(limparJson(bruto))
  } catch {
    return null
  }
  if (!obj || typeof obj !== 'object') return null
  const o = obj as Record<string, unknown>

  const nomeCampanha = typeof o.nomeCampanha === 'string' ? o.nomeCampanha.trim() : ''
  const alvo = typeof o.alvo === 'string' ? o.alvo.trim() : ''
  const abordagem = typeof o.abordagem === 'string' ? o.abordagem.trim() : ''
  const estrategia = typeof o.estrategia === 'string' ? o.estrategia.trim() : ''
  const criterios = Array.isArray(o.criterios) ? o.criterios.filter((c): c is string => typeof c === 'string' && c.trim() !== '') : []
  const queries = Array.isArray(o.queries) ? o.queries.filter((q): q is string => typeof q === 'string' && q.trim() !== '') : []

  if (!nomeCampanha || !alvo || queries.length === 0) return null

  return {
    nomeCampanha,
    alvo,
    abordagem,
    estrategia,
    criterios,
    queries: queries.slice(0, MAX_QUERIES),
  }
}

export type ScoreCandidato = {
  placeId: string
  scoreFit: number
  scorePotencial: number
  scoreAcessibilidade: number
  contexto: string
}

const clamp0a100 = (n: unknown): number => {
  const v = typeof n === 'number' && Number.isFinite(n) ? Math.round(n) : 0
  return Math.min(100, Math.max(0, v))
}

export function montarPromptScoring(params: { produto: string; alvo: string; criterios: string[]; candidatos: PlaceCandidato[] }): string {
  const { produto, alvo, criterios, candidatos } = params
  const lista = candidatos
    .map(
      (c, i) =>
        `${i + 1}. id="${c.placeId}" | nome="${c.nome}" | endereço="${c.endereco ?? 'não informado'}" | tipos=${JSON.stringify(c.tipos)} | avaliação=${c.rating ?? 'sem nota'} (${c.ratingCount ?? 0} avaliações) | tem telefone=${c.telefone ? 'sim' : 'não'} | tem site=${c.site ? 'sim' : 'não'}`,
    )
    .join('\n')

  return `Você está qualificando candidatos a lead para um corretor de imóveis, um por um, contra o perfil de cliente ideal (ICP) abaixo.

O QUE ELE VENDE
${produto.trim()}

PERFIL DE CLIENTE IDEAL (ICP)
${alvo}

CRITÉRIOS
${criterios.length ? criterios.map((c) => '- ' + c).join('\n') : '(nenhum critério adicional além do ICP acima)'}

CANDIDATOS (dados reais do Google Places — não invente nada além do que está aqui)
${lista}

Para CADA candidato, dê três notas de 0 a 100:
- scoreFit: o quanto o tipo/nome/dados da empresa batem com o ICP.
- scorePotencial: o quanto essa empresa parece ter porte/capacidade para o negócio (avaliações, presença digital, tipo de operação).
- scoreAcessibilidade: o quanto dá pra chegar nela (tem telefone? tem site? é o tipo de empresa que atende ligação fria?).

E um "contexto": 1-2 frases explicando por que esse candidato encaixa (ou não) — sem inventar fato que não está nos dados acima.

Devolva SOMENTE um JSON válido, um array com um objeto por candidato, na mesma ordem, sem markdown, sem texto antes ou depois, neste formato exato:
[{"id":"...","scoreFit":0,"scorePotencial":0,"scoreAcessibilidade":0,"contexto":"..."}]`
}

// Quantos candidatos vão em CADA chamada de qualificação. Existe porque uma
// campanha de 20 leads pedidos já pode gerar 60 candidatos brutos (3 queries
// x 20 resultados cada, ver MAX_CANDIDATOS_PARA_SCORING na rota) — mandar
// os 60 numa chamada só de IA estourou o limite de tokens da resposta em
// produção (JSON de 60 objetos cortado no meio, rejeitado inteiro pelo
// parser). Em lotes de 20, cada resposta cabe folgada no mesmo max_tokens
// que antes cobria (mal) os 60 juntos.
export const TAMANHO_LOTE_SCORING = 20

/**
 * Divide um array em pedaços de até `tamanho` itens, na ordem original.
 * Último pedaço pode vir menor. tamanho <= 0 devolve o array inteiro como
 * pedaço único, em vez de entrar em loop infinito.
 */
export function chunk<T>(itens: T[], tamanho: number): T[][] {
  if (tamanho <= 0) return itens.length ? [itens] : []
  const out: T[][] = []
  for (let i = 0; i < itens.length; i += tamanho) out.push(itens.slice(i, i + tamanho))
  return out
}

/**
 * Interpreta a saída da IA para o scoring em lote.
 *
 * Filtra por `id` batendo com um candidato real da lista enviada — nunca
 * confia cegamente no array devolvido (a IA pode inventar um id, repetir um
 * id, ou pular um candidato). Candidato sem entrada válida simplesmente não
 * aparece no resultado — melhor entregar 15 de 20 scores confiáveis do que
 * derrubar a campanha inteira por um item malformado.
 */
export function parseScoring(bruto: string, candidatosEnviados: PlaceCandidato[]): ScoreCandidato[] {
  let arr: unknown
  try {
    arr = JSON.parse(limparJson(bruto))
  } catch {
    return []
  }
  if (!Array.isArray(arr)) return []

  const idsValidos = new Set(candidatosEnviados.map((c) => c.placeId))
  const vistos = new Set<string>()
  const out: ScoreCandidato[] = []

  for (const item of arr) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const id = typeof o.id === 'string' ? o.id : ''
    if (!id || !idsValidos.has(id) || vistos.has(id)) continue
    vistos.add(id)
    out.push({
      placeId: id,
      scoreFit: clamp0a100(o.scoreFit),
      scorePotencial: clamp0a100(o.scorePotencial),
      scoreAcessibilidade: clamp0a100(o.scoreAcessibilidade),
      contexto: typeof o.contexto === 'string' ? o.contexto.trim().slice(0, 600) : '',
    })
  }

  return out
}

/**
 * Score final = média das três notas. Faixa segue a nomenclatura que já
 * aparece no dashboard pro corretor reconhecer de cara (mesmo vocabulário do
 * concorrente que inspirou a feature, não coincidência de nomes).
 */
export function scoreFinal(s: Pick<ScoreCandidato, 'scoreFit' | 'scorePotencial' | 'scoreAcessibilidade'>): number {
  return Math.round((s.scoreFit + s.scorePotencial + s.scoreAcessibilidade) / 3)
}

export function classificacaoPorScore(score: number): string {
  if (score >= 90) return 'EXCELENTE'
  if (score >= 80) return 'MUITO FORTE'
  if (score >= 70) return 'FORTE'
  if (score >= 55) return 'BOM'
  return 'FRACO'
}
