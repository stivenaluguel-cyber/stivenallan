// Filtros de imóvel no vocabulário do mercado local.
//
// "Aceita permuta" e "parcelamento direto da construtora" são exatamente o
// diferencial que este negócio vende — e até agora não dava para filtrar
// por eles. Bairro vem agrupado por cidade porque "Centro" existe em
// Criciúma, Içara e Balneário Rincão ao mesmo tempo.

export const COMODIDADES = [
  { valor: 'academia', label: 'Academia' },
  { valor: 'elevador', label: 'Elevador' },
  { valor: 'piscina', label: 'Piscina' },
  { valor: 'playground', label: 'Playground' },
  { valor: 'salao_festas', label: 'Salão de festas' },
  { valor: 'churrasqueira_carvao', label: 'Sacada com churrasqueira a carvão' },
  { valor: 'churrasqueira_ponto', label: 'Sacada com ponto de churrasqueira' },
] as const

export const MOBILIAS = [
  { valor: 'sem_mobilia', label: 'Sem mobília' },
  { valor: 'planejados', label: 'Com planejados' },
  { valor: 'mobiliado', label: 'Mobiliado' },
] as const

export type Comodidade = (typeof COMODIDADES)[number]['valor']
export type Mobilia = (typeof MOBILIAS)[number]['valor']

const COMODIDADES_VALIDAS = new Set<string>(COMODIDADES.map((c) => c.valor))
const MOBILIAS_VALIDAS = new Set<string>(MOBILIAS.map((m) => m.valor))

export type FiltrosImovel = {
  cidades?: string[]
  bairros?: string[]
  valorMin?: number
  valorMax?: number
  aceitaFinanciamento?: boolean
  aceitaPermuta?: boolean
  parcelamentoConstrutora?: boolean
  mobilia?: Mobilia
  comodidades?: Comodidade[]
  corretorId?: string
  // "Só os meus" — o inverso é o inventário inteiro da rede.
  apenasMeus?: boolean
}

export type ImovelFiltravel = {
  id: string
  nome: string
  cidade: string | null
  bairro: string | null
  preco_a_partir_de: number | null
  aceita_financiamento?: boolean | null
  aceita_permuta?: boolean | null
  parcelamento_construtora?: boolean | null
  mobilia?: string | null
  comodidades?: string[] | null
  corretor_captador_id?: string | null
  status_venda?: string | null
}

function normalizarTexto(v: string): string {
  return v.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// Só os booleanos marcados restringem: "aceita permuta" desmarcado significa
// "tanto faz", não "não aceita permuta". Marcar todos os filtros por engano
// não deve zerar a lista.
export function passaNosFiltros(imovel: ImovelFiltravel, filtros: FiltrosImovel): boolean {
  if (filtros.cidades?.length) {
    const alvo = filtros.cidades.map(normalizarTexto)
    if (!imovel.cidade || !alvo.includes(normalizarTexto(imovel.cidade))) return false
  }

  if (filtros.bairros?.length) {
    const alvo = filtros.bairros.map(normalizarTexto)
    if (!imovel.bairro || !alvo.includes(normalizarTexto(imovel.bairro))) return false
  }

  // Imóvel sem preço cadastrado não é escondido por engano quando só o teto
  // é informado — some apenas quando existe piso mínimo a respeitar.
  if (typeof filtros.valorMin === 'number') {
    if (imovel.preco_a_partir_de === null || imovel.preco_a_partir_de < filtros.valorMin) return false
  }
  if (typeof filtros.valorMax === 'number' && imovel.preco_a_partir_de !== null) {
    if (imovel.preco_a_partir_de > filtros.valorMax) return false
  }

  if (filtros.aceitaFinanciamento && !imovel.aceita_financiamento) return false
  if (filtros.aceitaPermuta && !imovel.aceita_permuta) return false
  if (filtros.parcelamentoConstrutora && !imovel.parcelamento_construtora) return false

  if (filtros.mobilia && imovel.mobilia !== filtros.mobilia) return false

  // Todas as comodidades pedidas precisam existir (E, não OU): quem procura
  // elevador E piscina não quer ver prédio que só tem um dos dois.
  if (filtros.comodidades?.length) {
    const tem = new Set(imovel.comodidades ?? [])
    if (!filtros.comodidades.every((c) => tem.has(c))) return false
  }

  if (filtros.corretorId && imovel.corretor_captador_id !== filtros.corretorId) return false

  return true
}

export function filtrarImoveis(imoveis: ImovelFiltravel[], filtros: FiltrosImovel): ImovelFiltravel[] {
  return imoveis.filter((i) => passaNosFiltros(i, filtros))
}

// Bairros agrupados sob a cidade a que pertencem — sem isso, "Centro"
// apareceria três vezes solto na lista, sem dizer de qual cidade.
export function agruparBairrosPorCidade(imoveis: ImovelFiltravel[]): { cidade: string; bairros: string[] }[] {
  const mapa = new Map<string, Set<string>>()
  for (const i of imoveis) {
    if (!i.cidade) continue
    const cidade = i.cidade.trim()
    if (!mapa.has(cidade)) mapa.set(cidade, new Set())
    if (i.bairro?.trim()) mapa.get(cidade)!.add(i.bairro.trim())
  }
  return [...mapa.entries()]
    .map(([cidade, bairros]) => ({ cidade, bairros: [...bairros].sort((a, b) => a.localeCompare(b, 'pt-BR')) }))
    .sort((a, b) => a.cidade.localeCompare(b.cidade, 'pt-BR'))
}

function listaDeTexto(v: unknown): string[] | undefined {
  if (typeof v !== 'string' || !v.trim()) return undefined
  const itens = v.split(',').map((s) => s.trim()).filter(Boolean)
  return itens.length ? itens : undefined
}

function numeroOpcional(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

// Query string → filtros. Valores desconhecidos são descartados em vez de
// irem crus para a consulta.
export function filtrosDaQueryString(params: URLSearchParams): FiltrosImovel {
  const comodidades = listaDeTexto(params.get('comodidades'))?.filter((c): c is Comodidade => COMODIDADES_VALIDAS.has(c))
  const mobiliaBruta = params.get('mobilia')
  const corretorId = params.get('corretorId')

  return {
    cidades: listaDeTexto(params.get('cidades')),
    bairros: listaDeTexto(params.get('bairros')),
    valorMin: numeroOpcional(params.get('valorMin')),
    valorMax: numeroOpcional(params.get('valorMax')),
    aceitaFinanciamento: params.get('aceitaFinanciamento') === 'true' || undefined,
    aceitaPermuta: params.get('aceitaPermuta') === 'true' || undefined,
    parcelamentoConstrutora: params.get('parcelamentoConstrutora') === 'true' || undefined,
    mobilia: mobiliaBruta && MOBILIAS_VALIDAS.has(mobiliaBruta) ? (mobiliaBruta as Mobilia) : undefined,
    comodidades: comodidades?.length ? comodidades : undefined,
    corretorId: corretorId || undefined,
    apenasMeus: params.get('apenasMeus') === 'true' || undefined,
  }
}

export function contarFiltrosAtivos(f: FiltrosImovel): number {
  let n = 0
  if (f.cidades?.length) n++
  if (f.bairros?.length) n++
  if (typeof f.valorMin === 'number') n++
  if (typeof f.valorMax === 'number') n++
  if (f.aceitaFinanciamento) n++
  if (f.aceitaPermuta) n++
  if (f.parcelamentoConstrutora) n++
  if (f.mobilia) n++
  if (f.comodidades?.length) n++
  if (f.corretorId || f.apenasMeus) n++
  return n
}
