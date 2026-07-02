import { MetadataRoute } from 'next'
import { imoveis } from '@/data/imoveis'
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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const ativos = imoveis.filter((i) => i.ativo === true)

  // Rotas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: SITE_URL + '/empreendimentos', lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: SITE_URL + '/sobre', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: SITE_URL + '/contato', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Páginas de cidade (/lancamentos/[cidade]) — cidades com empreendimentos ativos
  const cidades = Array.from(new Set(ativos.map((i) => cidadeSlug(i.cidade))))
  const cidadePages: MetadataRoute.Sitemap = cidades.map((slug) => ({
    url: SITE_URL + '/lancamentos/' + slug,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Guias SEO
  const guias = [
    'financiamento-direto-construtora',
    'comprar-apartamento-na-planta-criciuma',
    'cub-sc-correcao-parcelas',
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

  return [...staticPages, ...cidadePages, ...guiaPages, ...empPages]
}
