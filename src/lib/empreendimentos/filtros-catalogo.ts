// Filtros do catálogo público (/empreendimentos) — mesmo padrão de
// src/lib/imoveis/filtros.ts (usado no painel), adaptado ao vocabulário da
// vitrine pública: sem preço (estratégia é "sob consulta", não mostramos
// valor no card), com status de obra, dormitórios e faixa de área — os
// campos que a auditoria de UX pediu e que a ficha técnica real suporta.
import type { Empreendimento, StatusObra } from '@/lib/empreendimentos'

export type FiltrosCatalogo = {
  busca?: string
  cidades?: string[]
  bairros?: string[]
  construtoras?: string[]
  status?: StatusObra[]
  dormitorios?: number[]
  areaMin?: number
  areaMax?: number
}

function normalizarTexto(v: string): string {
  return v.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function contemFaixa(faixaMin: number | undefined, faixaMax: number | undefined, alvo: number): boolean {
  if (faixaMin === undefined) return false
  const max = faixaMax ?? faixaMin
  return alvo >= faixaMin && alvo <= max
}

// Só é chamada quando o filtro de área já está confirmado ativo (ver
// chamador) — por isso, se o empreendimento não tem área cadastrada
// (min2 undefined), a resposta correta é "não casa", não "deixa passar".
//
// Semântica do filtro (min1/max1 — o que o usuário digitou):
//   só mínimo  -> [min1, +Infinity)
//   só máximo  -> (-Infinity, max1]
//   os dois    -> [min1, max1]
// BUG CORRIGIDO (revisão 93cf1e8, achado P1-2): a versão anterior fazia
// `max1 ?? min1 ?? Infinity` — na ausência de teto, o limite superior do
// filtro caía pro PRÓPRIO piso em vez de +Infinity, colapsando "a partir de
// 100 m²" num intervalo fechado [100,100] e excluindo qualquer imóvel maior
// que 100. `?? Infinity` direto (sem o `?? min1` no meio) resolve.
function faixasSeCruzam(min1: number | undefined, max1: number | undefined, min2?: number, max2?: number): boolean {
  if (min2 === undefined) return false // imóvel sem área cadastrada nunca casa com um filtro de área ativo
  const filtroMin = min1 ?? -Infinity
  const filtroMax = max1 ?? Infinity
  const imovelMin = min2
  const imovelMax = max2 ?? min2 // imóvel com um único valor cadastrado (sem faixa) vira um ponto
  return filtroMin <= imovelMax && imovelMin <= filtroMax
}

export function passaNosFiltrosCatalogo(emp: Empreendimento, filtros: FiltrosCatalogo): boolean {
  if (filtros.busca?.trim()) {
    const alvo = normalizarTexto(filtros.busca)
    const nomeMatch = normalizarTexto(emp.nome).includes(alvo)
    const bairroMatch = emp.bairro ? normalizarTexto(emp.bairro).includes(alvo) : false
    const cidadeMatch = normalizarTexto(emp.cidade).includes(alvo)
    if (!nomeMatch && !bairroMatch && !cidadeMatch) return false
  }

  if (filtros.cidades?.length) {
    const alvo = filtros.cidades.map(normalizarTexto)
    if (!alvo.includes(normalizarTexto(emp.cidade))) return false
  }

  if (filtros.bairros?.length) {
    const alvo = filtros.bairros.map(normalizarTexto)
    if (!emp.bairro || !alvo.includes(normalizarTexto(emp.bairro))) return false
  }

  if (filtros.construtoras?.length) {
    const alvo = filtros.construtoras.map(normalizarTexto)
    const nomeConstrutora = emp.construtoraNome || emp.construtoraSlug
    if (!alvo.includes(normalizarTexto(nomeConstrutora))) return false
  }

  if (filtros.status?.length) {
    if (!emp.statusObra || !filtros.status.includes(emp.statusObra)) return false
  }

  // Dormitórios: casa se ALGUM dos valores selecionados cai dentro da faixa
  // do empreendimento (empreendimentos com uma única planta têm min=max).
  if (filtros.dormitorios?.length) {
    const casa = filtros.dormitorios.some((n) => contemFaixa(emp.dormitoriosMin, emp.dormitoriosMax, n))
    if (!casa) return false
  }

  if (typeof filtros.areaMin === 'number' || typeof filtros.areaMax === 'number') {
    if (!faixasSeCruzam(filtros.areaMin, filtros.areaMax, emp.areaMin, emp.areaMax)) return false
  }

  return true
}

export function filtrarEmpreendimentos(lista: Empreendimento[], filtros: FiltrosCatalogo): Empreendimento[] {
  return lista.filter((e) => passaNosFiltrosCatalogo(e, filtros))
}

function listaDeTexto(v: string | null): string[] | undefined {
  if (!v?.trim()) return undefined
  const itens = v.split(',').map((s) => s.trim()).filter(Boolean)
  return itens.length ? itens : undefined
}

function listaDeNumeros(v: string | null): number[] | undefined {
  const itens = listaDeTexto(v)?.map(Number).filter((n) => Number.isFinite(n) && n > 0)
  return itens?.length ? itens : undefined
}

function numeroOpcional(v: string | null): number | undefined {
  if (!v) return undefined
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

const STATUS_VALIDOS: readonly StatusObra[] = ['na planta', 'em obras', 'pronto', 'entregue']

// Achado P1-4 da revisão independente: cidade/bairro/construtora/dormitórios
// eram lidos da URL sem checar se o valor ainda existe no inventário atual —
// um link salvo/compartilhado com um valor que saiu de catálogo (imóvel
// vendido, faixa de dormitórios que não existe mais) deixava o filtro real
// ativo (excluindo tudo) enquanto o <select> mostrava "Qualquer"/"Todas",
// uma contradição visível entre o que a UI diz e o que ela faz. Como a UI é
// de selects simples (um valor por vez), a normalização certa não é só
// "descartar inválido" — é também "manter só o primeiro válido", igual já
// era feito para status.
//
// Retorna o valor CANÔNICO da lista de disponíveis (não o texto cru da URL)
// pra garantir que bata exatamente com o que `passaNosFiltrosCatalogo` compara.
function primeiroValorValido<T extends string>(v: string | null, validos: readonly T[]): T | undefined {
  const itens = listaDeTexto(v)
  if (!itens || !validos.length) return undefined
  const porChaveNormalizada = new Map(validos.map((val) => [normalizarTexto(val), val]))
  for (const item of itens) {
    const achado = porChaveNormalizada.get(normalizarTexto(item))
    if (achado !== undefined) return achado
  }
  return undefined
}

function primeiroNumeroValido(v: string | null, validos: readonly number[]): number | undefined {
  const itens = listaDeNumeros(v)
  if (!itens || !validos.length) return undefined
  const validosSet = new Set(validos)
  return itens.find((n) => validosSet.has(n))
}

/** Inventário atual contra o qual a URL é validada — normalmente derivado dos
 * mesmos dados já carregados pro catálogo (cidades/bairros/construtoras
 * presentes na vitrine, faixas de dormitórios com pelo menos um imóvel). */
export type OpcoesDisponiveis = {
  cidades: readonly string[]
  bairros: readonly string[]
  construtoras: readonly string[]
  dormitorios: readonly number[]
}

export function filtrosDaQueryString(params: URLSearchParams, disponiveis: OpcoesDisponiveis): FiltrosCatalogo {
  const cidade = primeiroValorValido(params.get('cidade'), disponiveis.cidades)
  const bairro = primeiroValorValido(params.get('bairro'), disponiveis.bairros)
  const construtora = primeiroValorValido(params.get('construtora'), disponiveis.construtoras)
  const dorms = primeiroNumeroValido(params.get('dorms'), disponiveis.dormitorios)
  // status: mantém a validação existente (contra STATUS_VALIDOS), só
  // normalizando pra um único valor pra bater com o <select> simples — igual
  // às outras 4 dimensões, ver comentário acima.
  const status = primeiroValorValido(params.get('status'), STATUS_VALIDOS)

  return {
    busca: params.get('q') || undefined,
    cidades: cidade ? [cidade] : undefined,
    bairros: bairro ? [bairro] : undefined,
    construtoras: construtora ? [construtora] : undefined,
    status: status ? [status] : undefined,
    dormitorios: dorms !== undefined ? [dorms] : undefined,
    areaMin: numeroOpcional(params.get('areaMin')),
    areaMax: numeroOpcional(params.get('areaMax')),
  }
}

export function queryStringDosFiltros(filtros: FiltrosCatalogo): string {
  const params = new URLSearchParams()
  if (filtros.busca?.trim()) params.set('q', filtros.busca.trim())
  if (filtros.cidades?.length) params.set('cidade', filtros.cidades.join(','))
  if (filtros.bairros?.length) params.set('bairro', filtros.bairros.join(','))
  if (filtros.construtoras?.length) params.set('construtora', filtros.construtoras.join(','))
  if (filtros.status?.length) params.set('status', filtros.status.join(','))
  if (filtros.dormitorios?.length) params.set('dorms', filtros.dormitorios.join(','))
  if (typeof filtros.areaMin === 'number') params.set('areaMin', String(filtros.areaMin))
  if (typeof filtros.areaMax === 'number') params.set('areaMax', String(filtros.areaMax))
  return params.toString()
}

export function contarFiltrosAtivos(f: FiltrosCatalogo): number {
  let n = 0
  if (f.busca?.trim()) n++
  if (f.cidades?.length) n++
  if (f.bairros?.length) n++
  if (f.construtoras?.length) n++
  if (f.status?.length) n++
  if (f.dormitorios?.length) n++
  if (typeof f.areaMin === 'number' || typeof f.areaMax === 'number') n++
  return n
}
