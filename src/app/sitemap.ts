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
  const now = new Date()
  // Mesma fonte da vitrine da home: estáticos + properties do banco (ativos/não-ocultos)
  // que ainda não têm página em @/data/imoveis — sem isso, empreendimentos cadastrados
  // só pelo dashboard ficam visíveis no site mas invisíveis para o Google.
  const imoveisVitrine = await getVitrineImoveis()
  const ativos = imoveisVitrine.filter((i) => i.ativo === true)

  // Rotas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: SITE_URL + '/empreendimentos', lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: SITE_URL + '/sobre', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: SITE_URL + '/contato', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: SITE_URL + '/politica-de-privacidade', lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Páginas de cidade (/lancamentos/[cidade]) — cidades com empreendimentos ativos
  const cidades = Array.from(new Set(ativos.map((i) => cidadeSlug(i.cidade))))
  const cidadePages: MetadataRoute.Sitemap = cidades.map((slug) => ({
    url: SITE_URL + '/lancamentos/' + slug,
    lastModified: now,
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
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.65,
  }))

    // Indice de guias
      const guiaIndexPage: MetadataRoute.Sitemap = [
          { url: SITE_URL + '/guia', lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 },
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
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Páginas de empreendimento — todos os imóveis ativos
  const empPages: MetadataRoute.Sitemap = ativos.map((i) => ({
    url: SITE_URL + '/empreendimento/' + i.construtora_slug + '/' + i.slug,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Lançamentos Eraldo com página bespoke própria (mesmo padrão do Aura Residence)
  // que ainda não têm registro em `properties` — entrada estática evita depender
  // do cadastro no banco só para aparecer no sitemap.
  const eraldoSlugs = ['arbor-centro-criciuma-sc', 'gran-michel-criciuma-sc', 'harmony-residence-centro-balneario-rincao-sc', 'gran-palazzo-vila-moema-tubarao-sc', 'horizon-centro-balneario-rincao-sc', 'lessence-home-club-cruzeiro-do-sul-criciuma-sc', 'play-residence-vila-moema-tubarao-sc', 'symphony-mar-grosso-laguna-sc']
  const eraldoPages: MetadataRoute.Sitemap = eraldoSlugs.map((slug) => ({
    url: SITE_URL + '/empreendimento/eraldo/' + slug,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...guiaIndexPage, ...cidadePages, ...bairroPages, ...guiaPages, ...empPages, ...eraldoPages]
}
