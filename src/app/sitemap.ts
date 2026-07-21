import { MetadataRoute } from 'next'
import { getVitrineImoveis, type ImovelVitrine } from '@/lib/vitrine'
import { SITE_URL } from '@/lib/site'
import { arbor } from '@/data/eraldo/arbor'
import { granMichel } from '@/data/eraldo/gran-michel'
import { granPalazzo } from '@/data/eraldo/gran-palazzo'
import { harmony } from '@/data/eraldo/harmony'
import { horizon } from '@/data/eraldo/horizon'
import { lessence } from '@/data/eraldo/lessence'
import { play } from '@/data/eraldo/play'
import { symphony } from '@/data/eraldo/symphony'

function cidadeSlug(cidade: string): string {
  return (
    cidade
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-') + '-sc'
  )
}

// Lançamentos Eraldo com página bespoke própria e arquivo de dados real em
// src/data/eraldo/*.ts (não vêm de `properties`/`imoveis.ts`). Slugs derivados
// diretamente desses arquivos — não hardcoded como string solta — pra não
// depender do Supabase pra aparecer no sitemap, e pra um 9º empreendimento novo
// em src/data/eraldo/ entrar automaticamente sem precisar editar este arquivo.
const ERALDO_COM_DADOS_PROPRIOS = [arbor, granMichel, granPalazzo, harmony, horizon, lessence, play, symphony]

// Lógica pura de montagem do sitemap — recebe `ativos` já resolvido (Fontana
// estático + properties do Supabase) em vez de buscar os dados ela mesma, pra
// poder ser testada com fixtures (ver src/app/sitemap.test.ts) sem precisar mockar
// Supabase/next-headers. O único ponto de I/O do módulo é o `sitemap()` no final.
export function buildSitemap(ativos: ImovelVitrine[]): MetadataRoute.Sitemap {
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

  // Páginas de cidade (/lancamentos/[cidade]) — união de cidades com empreendimentos
  // reais em 3 fontes: Fontana estático + properties do Supabase (`ativos`, que já
  // mescla as duas) e Eraldo estático (src/data/eraldo/*.ts, que não passa por
  // `ativos` porque não vem de @/data/imoveis nem depende do Supabase). Sem essa
  // união, uma cidade só-Eraldo (ex.: Tubarão) nunca apareceria no sitemap local,
  // mesmo a página já tendo conteúdo real — achado da auditoria SEO 2026-07-21.
  const cidadesFontanaOuSupabase = ativos.map((i) => cidadeSlug(i.cidade))
  const cidadesEraldoEstatico = ERALDO_COM_DADOS_PROPRIOS.map((e) => cidadeSlug(e.cidade))
  const cidades = Array.from(new Set([...cidadesFontanaOuSupabase, ...cidadesEraldoEstatico]))
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

  const eraldoPages: MetadataRoute.Sitemap = ERALDO_COM_DADOS_PROPRIOS.map((emp) => ({
    url: SITE_URL + '/empreendimento/' + emp.construtoraSlug + '/' + emp.slug,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Aura Residence: página bespoke Eraldo mais antiga, anterior ao padrão
  // src/data/eraldo/*.ts (não tem arquivo de dados próprio — conteúdo fica direto
  // no page.tsx, como as páginas estáticas Fontana). Por isso não entra na lista
  // acima; precisa da própria entrada estática pra não depender do Supabase pra
  // aparecer no sitemap — achado da auditoria SEO 2026-07-21 (antes ficava de fora
  // do sitemap local e só aparecia via `ativos`/Supabase em produção).
  const auraPages: MetadataRoute.Sitemap = [
    { url: SITE_URL + '/empreendimento/eraldo/aura-residence-centro-criciuma-sc', changeFrequency: 'weekly' as const, priority: 0.8 },
  ]

  const todasPaginas = [...staticPages, ...guiaIndexPage, ...cidadePages, ...bairroPages, ...guiaPages, ...empPages, ...eraldoPages, ...auraPages]

  // Dedupe por URL: `ativos` (Supabase properties) pode conter os mesmos slugs
  // Eraldo que `ERALDO_COM_DADOS_PROPRIOS`/`auraPages` já geram (quando um
  // empreendimento Eraldo é migrado pro banco) — sem isso, o sitemap publica <loc>
  // repetido. Mantém a primeira ocorrência (a de `empPages`, que reflete `ativos`
  // com prioridade sobre o fallback estático quando ambos existirem).
  const vistos = new Set<string>()
  return todasPaginas.filter((pagina) => {
    if (vistos.has(pagina.url)) return false
    vistos.add(pagina.url)
    return true
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Mesma fonte da vitrine da home: estáticos + properties do banco (ativos/não-ocultos)
  // que ainda não têm página em @/data/imoveis — sem isso, empreendimentos cadastrados
  // só pelo dashboard ficam visíveis no site mas invisíveis para o Google.
  const imoveisVitrine = await getVitrineImoveis()
  const ativos = imoveisVitrine.filter((i) => i.ativo === true)
  return buildSitemap(ativos)
}
