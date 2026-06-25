import type { MetadataRoute } from 'next'

const BASE = 'https://stivenallan.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()
  
  return [
    // Paginas principais
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: BASE + '/sobre', lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: BASE + '/contato', lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: BASE + '/empreendimentos', lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    
    // Empreendimentos
    { url: BASE + '/empreendimento/fontana/monte-leone-ana-lucia-criciuma-sc', lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: BASE + '/empreendimento/fontana/lavis-residencial-centro-criciuma-sc', lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: BASE + '/empreendimento/fontana/pineto-centro-criciuma-sc', lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: BASE + '/empreendimento/fontana/hub-smart-home-criciuma-sc', lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    
    // Lancamentos por cidade
    { url: BASE + '/lancamentos/criciuma', lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: BASE + '/lancamentos/icara', lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: BASE + '/lancamentos/ararangua', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: BASE + '/lancamentos/tubarao', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: BASE + '/lancamentos/nova-veneza', lastModified: now, changeFrequency: 'weekly', priority: 0.65 },
    { url: BASE + '/lancamentos/forquilhinha', lastModified: now, changeFrequency: 'weekly', priority: 0.65 },
    
    // Blog
    { url: BASE + '/blog', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: BASE + '/blog/guia-comprar-apartamento-na-planta-criciuma', lastModified: now, changeFrequency: 'monthly', priority: 0.65 },
    { url: BASE + '/blog/bairros-valorizar-criciuma-2024', lastModified: now, changeFrequency: 'monthly', priority: 0.65 },
    { url: BASE + '/blog/financiamento-imobiliario-caixa-2024', lastModified: now, changeFrequency: 'monthly', priority: 0.65 },
  ]
}
