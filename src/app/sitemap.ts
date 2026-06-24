import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.com.br'

export default function sitemap(): MetadataRoute.Sitemap {
  const cidades = ['criciuma-sc', 'icara-sc', 'nova-veneza-sc', 'forquilhinha-sc', 'cocal-do-sul-sc']

  const cidadeRoutes = cidades.map((cidade) => ({
    url: `${SITE_URL}/lancamentos/${cidade}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...cidadeRoutes,
  ]
}
