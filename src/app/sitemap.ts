import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'

function getSupabase() {
    return createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
}

/** Converte nome da construtora para slug (igual ao usado na rota canônica) */
function toSlug(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
      { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
      { url: `${SITE_URL}/lancamentos/criciuma-sc`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
      { url: `${SITE_URL}/lancamentos/icara-sc`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${SITE_URL}/lancamentos/nova-veneza-sc`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
      { url: `${SITE_URL}/lancamentos/forquilhinha-sc`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
      { url: `${SITE_URL}/lancamentos/cocal-do-sul-sc`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        ]

  try {
        const sb = getSupabase()
        const { data } = await sb
          .from('empreendimentos')
          .select('slug, construtora, updated_at')
          .eq('status_venda', 'ativo')

      // Somente a rota canônica /empreendimento/[construtora]/[slug]
      const empPages: MetadataRoute.Sitemap = (data || [])
          .filter((emp: any) => !!emp.construtora)
          .map((emp: any) => ({
                    url: `${SITE_URL}/empreendimento/${toSlug(emp.construtora)}/${emp.slug}`,
                    lastModified: emp.updated_at ? new Date(emp.updated_at) : new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.95,
          }))

      return [...staticPages, ...empPages]
  } catch {
        return staticPages
  }
}
