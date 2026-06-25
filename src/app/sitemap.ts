import type { MetadataRoute } from 'next'
import { getSupabaseClient } from '@/lib/supabase'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: SITE_URL + '/sobre', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: SITE_URL + '/contato', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: SITE_URL + '/lancamentos/criciuma-sc', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: SITE_URL + '/lancamentos/icara-sc', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: SITE_URL + '/lancamentos/nova-veneza-sc', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: SITE_URL + '/lancamentos/forquilhinha-sc', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: SITE_URL + '/lancamentos/cocal-do-sul-sc', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: SITE_URL + '/blog', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: SITE_URL + '/empreendimento/fontana/monte-leone-centro-criciuma-sc', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: SITE_URL + '/empreendimento/fontana/lavis-centro-criciuma-sc', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: SITE_URL + '/empreendimento/fontana/pineto-centro-criciuma-sc', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: SITE_URL + '/empreendimento/fontana/hub-smart-home-criciuma-sc', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
  ]

  try {
    const supabase = getSupabaseClient()
    if (!supabase) return staticPages

    const { data } = await supabase
      .from('empreendimentos')
      .select('slug, construtora, updated_at')
      .eq('status_venda', 'ativo')

    if (!data) return staticPages

    const dynamicPages: MetadataRoute.Sitemap = data.map((emp: any) => {
      const slug = emp.slug as string
      const construtora = emp.construtora
        ? (emp.construtora as string).toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        : 'construtora'
      return {
        url: SITE_URL + '/empreendimento/' + construtora + '/' + slug,
        lastModified: new Date(emp.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }
    })

    return [...staticPages, ...dynamicPages]
  } catch {
    return staticPages
  }
}
