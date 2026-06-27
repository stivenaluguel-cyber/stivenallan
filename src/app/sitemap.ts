import { MetadataRoute } from 'next';
import { getEmpreendimentosVisiveis } from '@/lib/empreendimentos';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app';

function cidadeSlug(cidade: string): string {
  return (
    cidade
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-') + '-sc'
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: SITE_URL + '/sobre', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: SITE_URL + '/contato', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Páginas de cidade — apenas cidades que possuem empreendimentos visíveis.
  const cidades = Array.from(
    new Set(getEmpreendimentosVisiveis().map((e) => cidadeSlug(e.cidade))),
  );
  const cidadePages: MetadataRoute.Sitemap = cidades.map((slug) => ({
    url: SITE_URL + '/lancamentos/' + slug,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Páginas de detalhe — todos os empreendimentos visíveis.
  const empPages: MetadataRoute.Sitemap = getEmpreendimentosVisiveis().map((e) => ({
    url: SITE_URL + '/empreendimento/' + e.construtoraSlug + '/' + e.slug,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...cidadePages, ...empPages];
}
