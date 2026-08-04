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
function faixasSeCruzam(min1: number | undefined, max1: number | undefined, min2?: number, max2?: number): boolean {
  if (min2 === undefined) return false
  const a1 = max1 ?? min1 ?? Infinity
  const b1 = min1 ?? -Infinity
  const a2 = max2 ?? min2
  return b1 <= a2 && a1 >= min2
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

export function filtrosDaQueryString(params: URLSearchParams): FiltrosCatalogo {
  const status = listaDeTexto(params.get('status'))?.filter((s): s is StatusObra =>
    (STATUS_VALIDOS as readonly string[]).includes(s)
  )
  return {
    busca: params.get('q') || undefined,
    cidades: listaDeTexto(params.get('cidade')),
    bairros: listaDeTexto(params.get('bairro')),
    construtoras: listaDeTexto(params.get('construtora')),
    status: status?.length ? status : undefined,
    dormitorios: listaDeNumeros(params.get('dorms')),
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
