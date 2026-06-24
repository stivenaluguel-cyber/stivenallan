import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.com.br'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const CIDADES = ['criciuma', 'icara', 'nova-veneza', 'forquilhinha', 'cocal-do-sul']
const CIDADES_SITEMAP = ['criciuma-sc', 'icara-sc', 'nova-veneza-sc', 'forquilhinha-sc', 'cocal-do-sul-sc']

const BAIRROS = [
  'centro', 'universitario', 'santa-barbara', 'mina-do-mato',
  'pio-correia', 'comerciario', 'michel', 'nossa-senhora-da-saude',
  'jardim-angélica', 'próspera', 'santa-luzia', 'santo-antonio',
]

const BLOG_SLUGS = [
  'como-comprar-apartamento-criciuma-sc',
  'lancamentos-imobiliarios-sul-catarinense-2025',
  'financiamento-imobiliario-caixa-economica-federal',
  'valorizar-imovel-antes-de-vender',
  'melhor-bairro-para-morar-em-criciuma',
  'o-que-e-creci-corretor-de-imoveis',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas principais
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  // Páginas de cidades (formato com UF para URLs legadas)
  const cidadeRoutes: MetadataRoute.Sitemap = CIDADES_SITEMAP.map((cidade) => ({
    url: `${SITE_URL}/lancamentos/${cidade}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Páginas de bairros por cidade
  const bairroRoutes: MetadataRoute.Sitemap = CIDADES.flatMap((cidade) =>
    BAIRROS.map((bairro) => ({
      url: `${SITE_URL}/lancamentos/${cidade}/${bairro}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  // Blog posts
  const blogRoutes: MetadataRoute.Sitemap = BLOG_SLUGS.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Empreendimentos dinâmicos do Supabase
  let empreendimentoRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data } = await supabase
      .from('empreendimentos')
      .select('slug, updated_at, construtoras(slug)')
      .order('updated_at', { ascending: false })

    if (data) {
      empreendimentoRoutes = data.map((emp: { slug: string; updated_at: string; construtoras: { slug: string } | { slug: string }[] | null }) => {
        const constSlug = Array.isArray(emp.construtoras)
          ? (emp.construtoras[0] as { slug: string } | undefined)?.slug ?? 'construtora'
          : emp.construtoras?.slug ?? 'construtora'
        return {
          url: `${SITE_URL}/empreendimento/${constSlug}/${emp.slug}`,
          lastModified: new Date(emp.updated_at),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        }
      })
    }
  } catch {
    // Silently fail — sitemap still works without Supabase
  }

  return [
    ...staticRoutes,
    ...empreendimentoRoutes,
    ...cidadeRoutes,
    ...bairroRoutes,
    ...blogRoutes,
  ]
}
