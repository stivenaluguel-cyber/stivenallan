// Funções puras de busca/filtro/ordenação/paginação da listagem de
// Empreendimentos (src/app/dashboard/empreendimentos/empreendimentos-view.tsx).
// Extraídas do componente pra serem testáveis sem precisar montar React —
// 36 empreendimentos hoje não justificam paginação/filtro no servidor, então
// tudo roda client-side sobre a lista já carregada pela API.

export type EmpreendimentoFiltravel = {
  nome: string
  construtora: string
  cidade: string
  status_obra: string
  status_venda: string
  preco_a_partir: number | null
  created_at?: string
}

export type OrdemEmpreendimentos = 'nome_asc' | 'recentes' | 'preco_asc'

export type FiltrosEmpreendimentos = {
  busca?: string
  construtora?: string
  cidade?: string
  statusObra?: string
  statusVenda?: string
}

/** Remove acentuação e normaliza caixa, pra comparação case/acento-insensível. */
export function normalizarTexto(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function filtrarEmpreendimentos<T extends EmpreendimentoFiltravel>(
  lista: T[],
  filtros: FiltrosEmpreendimentos,
): T[] {
  const busca = normalizarTexto(filtros.busca ?? '').trim()
  return lista.filter((emp) => {
    if (filtros.construtora && emp.construtora !== filtros.construtora) return false
    if (filtros.cidade && emp.cidade !== filtros.cidade) return false
    if (filtros.statusObra && emp.status_obra !== filtros.statusObra) return false
    if (filtros.statusVenda && emp.status_venda !== filtros.statusVenda) return false
    if (!busca) return true
    const alvo = normalizarTexto(`${emp.nome} ${emp.construtora} ${emp.cidade}`)
    return alvo.includes(busca)
  })
}

export function ordenarEmpreendimentos<T extends EmpreendimentoFiltravel>(
  lista: T[],
  ordem: OrdemEmpreendimentos,
): T[] {
  const copia = [...lista]
  if (ordem === 'nome_asc') {
    return copia.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }
  if (ordem === 'recentes') {
    return copia.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
  }
  // preco_asc — nulls sempre por último, independente da direção.
  return copia.sort((a, b) => {
    if (a.preco_a_partir == null && b.preco_a_partir == null) return 0
    if (a.preco_a_partir == null) return 1
    if (b.preco_a_partir == null) return -1
    return a.preco_a_partir - b.preco_a_partir
  })
}

export function paginar<T>(lista: T[], pagina: number, porPagina: number): { itens: T[]; totalPaginas: number } {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina))
  const paginaValida = Math.min(Math.max(1, pagina), totalPaginas)
  const inicio = (paginaValida - 1) * porPagina
  return { itens: lista.slice(inicio, inicio + porPagina), totalPaginas }
}

/** Valores únicos (não vazios), ordenados alfabeticamente — para popular dropdowns de filtro. */
export function valoresUnicos<T extends Record<string, unknown>>(lista: T[], campo: keyof T): string[] {
  const set = new Set<string>()
  lista.forEach((item) => {
    const v = item[campo]
    if (typeof v === 'string' && v.trim()) set.add(v)
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
}
