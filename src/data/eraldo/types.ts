// Tipos do inventário de empreendimentos Eraldo Construções.
// Cada empreendimento vive em seu próprio arquivo (./arbor.ts, ./gran-michel.ts, ...)
// e é consumido por EmpreendimentoTemplate — nenhum dado comercial fica hardcoded
// dentro do template ou de componentes compartilhados.

export type StatusEmpreendimento = 'lancamento' | 'em_construcao' | 'entregue'

export type ItemDiferencial = { ico: string; title: string; desc: string }
export type GrupoDiferenciais = { titulo: string; itens: ItemDiferencial[] }

export type Tipologia = {
  nome: string
  areaPrivativa?: number
  areaTotal?: number
  dormitorios?: number
  suites?: number
  vagas?: number
  observacao?: string
}

// categoria: livre por empreendimento (ex. 'tipo' | 'duplex' | 'garden' | 'comum') —
// só usada para agrupar a exibição das plantas. Ficha técnica (area/quartos/suites/
// vagas) só aparece na UI quando o campo vier preenchido — nunca inventar.
export type PlantaItem = {
  categoria: string
  src: string
  alt: string
  label: string
  area?: number
  quartos?: number
  suites?: number
  vagas?: number
}

export type GrupoPlantas = { titulo: string; categoria: string }

export type GaleriaItem = { src: string; alt: string; label: string }

export type CondicaoComercial = { titulo: string; texto: string }

// Política comercial real da tabela vigente daquele empreendimento — nunca genérica.
// Se um empreendimento não tiver tabela confirmada, deixar politicaComercial null no
// registro (o template cai para o texto neutro "condições sob consulta").
export type PoliticaComercial = {
  condicoes: CondicaoComercial[]
  correcaoCub: boolean // só true quando a tabela específica indicar correção pelo CUB
  cubValor?: number
  cubReferencia?: string // ex. "Julho/2026"
  observacao?: string
}

export type FaqItem = { pergunta: string; resposta: string }

// Rastreabilidade exigida: de onde veio o dado, qual documento, e a vigência da
// condição comercial (que é o dado mais perecível de todos).
export type Fontes = {
  siteUrl: string
  catalogoArquivo?: string
  tabelaArquivo?: string
  tabelaVigencia?: string // data da tabela, ex. "2026-07-06"
  materiaisApoioPasta?: string
}

export type Empreendimento = {
  slug: string
  nome: string
  construtoraSlug: 'eraldo'
  cidade: string
  uf: string
  bairro?: string
  endereco?: string
  cep?: string
  status: StatusEmpreendimento

  // cronograma — campos opcionais e ocultáveis; a UI só renderiza o que existir
  inicioObra?: string
  previsaoEntrega?: string // usado quando status !== 'entregue'
  dataConclusao?: string // usado quando status === 'entregue'
  registroIncorporacao?: string

  pavimentos?: number
  totalUnidades?: number
  unidadesPorAndar?: number

  // conteúdo narrativo (texto próprio, não reaproveitado de outro empreendimento)
  eyebrow: string
  heroTitulo: string
  heroSubtitulo: string
  heroImg: string
  heroImgAlt: string

  conceitoTitulo: string[] // linhas, template junta com <br/>
  conceitoTextoDestaque: string
  conceitoTexto: string
  conceitoChips: { ico: string; label: string }[]
  conceitoImg: string
  conceitoImgAlt: string
  conceitoStatusLabel: string

  metricas: { val: string; label: string }[]
  metricasExtras: { n: string; label: string }[]

  diferenciaisGrupos: GrupoDiferenciais[]
  fichaTecnicaExtra: string[]

  galeriaTitulo: string
  galeriaTexto: string
  galeria: GaleriaItem[]

  tipologias: Tipologia[]
  plantasTitulo: string
  plantasTexto: string
  plantas: PlantaItem[] // [] = seção de plantas fica oculta
  plantasGrupos: GrupoPlantas[]

  lazerTitulo: string
  lazerTexto: string
  lazerImg: string
  lazerImgAlt: string
  lazer: string[]

  localizacaoTitulo: string
  localizacaoTexto: string
  mapsQuery: string

  politicaComercial: PoliticaComercial | null

  ctaFinalTitulo: string
  ctaFinalTexto: string

  faq: FaqItem[]

  fontes: Fontes
}
