import { MetadataRoute } from 'next'
import { getVitrineImoveis } from '@/lib/vitrine'
import { SITE_URL } from '@/lib/site'

function cidadeSlug(cidade: string): string {
  return (
    cidade
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-') + '-sc'
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Mesma fonte da vitrine da home: estáticos + properties do banco (ativos/não-ocultos)
  // que ainda não têm página em @/data/imoveis — sem isso, empreendimentos cadastrados
  // só pelo dashboard ficam visíveis no site mas invisíveis para o Google.
  const imoveisVitrine = await getVitrineImoveis()
  const ativos = imoveisVitrine.filter((i) => i.ativo === true)

  // Sem lastModified: nenhuma fonte de dado (imoveis.ts, properties no Supabase)
  // expõe uma data real de última alteração por página. Declarar lastmod com a
  // data do build passaria um sinal falso ao Google — melhor omitir o campo.

  // Rotas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: SITE_URL + '/empreendimentos', changeFrequency: 'weekly', priority: 0.9 },
    { url: SITE_URL + '/sobre', changeFrequency: 'monthly', priority: 0.5 },
    { url: SITE_URL + '/contato', changeFrequency: 'monthly', priority: 0.5 },
    { url: SITE_URL + '/politica-de-privacidade', changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Páginas de cidade (/lancamentos/[cidade]) — cidades com empreendimentos ativos
  const cidades = Array.from(new Set(ativos.map((i) => cidadeSlug(i.cidade))))
  const cidadePages: MetadataRoute.Sitemap = cidades.map((slug) => ({
    url: SITE_URL + '/lancamentos/' + slug,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Páginas de bairro (/lancamentos/[cidade]/[bairro]) — só as combinações
  // cidade+bairro com 2+ empreendimentos reais (ver BAIRROS_POR_CIDADE em
  // src/app/lancamentos/[cidade]/[bairro]/page.tsx), curadoria manual para
  // evitar conteúdo fino em bairros com 1 único empreendimento.
  const bairroCombos = [
    { cidade: 'criciuma-sc', bairro: 'centro' },
    { cidade: 'icara-sc', bairro: 'centro' },
    { cidade: 'balneario-rincao-sc', bairro: 'centro' },
    { cidade: 'laguna-sc', bairro: 'mar-grosso' },
    { cidade: 'sideropolis-sc', bairro: 'centro' },
  ]
  const bairroPages: MetadataRoute.Sitemap = bairroCombos.map(({ cidade, bairro }) => ({
    url: SITE_URL + '/lancamentos/' + cidade + '/' + bairro,
    changeFrequency: 'weekly' as const,
    priority: 0.65,
  }))

  // Indice de guias
  const guiaIndexPage: MetadataRoute.Sitemap = [
    { url: SITE_URL + '/guia', changeFrequency: 'monthly' as const, priority: 0.6 },
  ]

  // Guias SEO
  const guias = [
    'financiamento-direto-construtora',
    'comprar-apartamento-na-planta-criciuma',
    'cub-sc-correcao-parcelas',
    'apartamento-frente-mar-rincao-ou-laguna',
    'financiamento-direto-vs-bancario',
    'apartamento-na-planta-vs-pronto',
    'onde-investir-sul-santa-catarina',
  ]
  const guiaPages: MetadataRoute.Sitemap = guias.map((slug) => ({
    url: SITE_URL + '/guia/' + slug,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Páginas de empreendimento — todos os imóveis ativos (estáticos + properties do
  // banco, incluindo Eraldo caso já tenha migrado pra lá — ver eraldoPages abaixo).
  const empPages: MetadataRoute.Sitemap = ativos.map((i) => ({
    url: SITE_URL + '/empreendimento/' + i.construtora_slug + '/' + i.slug,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Lançamentos Eraldo com página bespoke própria (mesmo padrão do Aura Residence).
  // Mantido como fallback estático para o caso de algum desses slugs ainda não
  // existir em `properties` — o dedupe abaixo evita URL duplicada quando já existir.
  const eraldoSlugs = ['arbor-centro-criciuma-sc', 'gran-michel-criciuma-sc', 'harmony-residence-centro-balneario-rincao-sc', 'gran-palazzo-vila-moema-tubarao-sc', 'horizon-centro-balneario-rincao-sc', 'lessence-home-club-cruzeiro-do-sul-criciuma-sc', 'play-residence-vila-moema-tubarao-sc', 'symphony-mar-grosso-laguna-sc']
  const eraldoPages: MetadataRoute.Sitemap = eraldoSlugs.map((slug) => ({
    url: SITE_URL + '/empreendimento/eraldo/' + slug,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const todasPaginas = [...staticPages, ...guiaIndexPage, ...cidadePages, ...bairroPages, ...guiaPages, ...empPages, ...eraldoPages]

  // Dedupe por URL: `ativos` (Supabase properties) e `eraldoSlugs` (fallback
  // hardcoded) podem gerar a mesma URL quando um empreendimento Eraldo já foi
  // cadastrado no banco — sem isso, o sitemap publica <loc> repetido.
  const vistos = new Set<string>()
  return todasPaginas.filter((pagina) => {
    if (vistos.has(pagina.url)) return false
    vistos.add(pagina.url)
    return true
  })
}
