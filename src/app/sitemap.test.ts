import { describe, expect, it } from 'vitest'
import sitemap, { buildSitemap } from './sitemap'
import type { ImovelVitrine } from '@/lib/vitrine'

function fixtureEraldo(overrides: Partial<ImovelVitrine> & Pick<ImovelVitrine, 'slug'>): ImovelVitrine {
  return {
    id: 'sb-' + overrides.slug,
    nome: overrides.slug,
    construtora_slug: 'eraldo',
    construtora: 'Eraldo Construções',
    bairro: 'Centro',
    cidade: 'Criciúma',
    uf: 'SC',
    status: 'em obras',
    exibir_preco: false,
    preco: null,
    frase: '',
    img: '',
    ativo: true,
    ...overrides,
  }
}

// Fixture que simula o cenário real de produção: os 8 empreendimentos Eraldo que já
// têm arquivo de dados estático (src/data/eraldo/*.ts, sempre incluídos por
// buildSitemap independente do parâmetro) TAMBÉM aparecendo em `ativos` — ou seja,
// como se já tivessem sido cadastrados no Supabase, igual ao que a auditoria SEO
// 2026-07-21 encontrou em produção (achado B1-2: mesmas 8 URLs vindas de duas
// fontes). Inclui também Aura Residence "vindo do Supabase" — ela não tem arquivo
// de dados próprio, então sem isso ela só apareceria via `auraPages` (fallback).
const ATIVOS_COM_ERALDO_DUPLICADO_DO_SUPABASE: ImovelVitrine[] = [
  fixtureEraldo({ slug: 'arbor-centro-criciuma-sc' }),
  fixtureEraldo({ slug: 'gran-michel-criciuma-sc' }),
  fixtureEraldo({ slug: 'gran-palazzo-vila-moema-tubarao-sc', cidade: 'Tubarão' }),
  fixtureEraldo({ slug: 'harmony-residence-centro-balneario-rincao-sc', cidade: 'Balneário Rincão' }),
  fixtureEraldo({ slug: 'horizon-centro-balneario-rincao-sc', cidade: 'Balneário Rincão' }),
  fixtureEraldo({ slug: 'lessence-home-club-cruzeiro-do-sul-criciuma-sc', bairro: 'Cruzeiro do Sul' }),
  fixtureEraldo({ slug: 'play-residence-vila-moema-tubarao-sc', cidade: 'Tubarão' }),
  fixtureEraldo({ slug: 'symphony-mar-grosso-laguna-sc', cidade: 'Laguna' }),
  fixtureEraldo({ slug: 'aura-residence-centro-criciuma-sc' }),
]

const ERALDO_SLUGS_COM_DADOS_PROPRIOS = [
  'arbor-centro-criciuma-sc',
  'gran-michel-criciuma-sc',
  'gran-palazzo-vila-moema-tubarao-sc',
  'harmony-residence-centro-balneario-rincao-sc',
  'horizon-centro-balneario-rincao-sc',
  'lessence-home-club-cruzeiro-do-sul-criciuma-sc',
  'play-residence-vila-moema-tubarao-sc',
  'symphony-mar-grosso-laguna-sc',
]

describe('buildSitemap — fixture combinada (Eraldo estático + mesmos registros do Supabase + Tubarão + Aura)', () => {
  it('cada URL Eraldo aparece uma única vez, mesmo com as duas fontes (estático + Supabase) coexistindo', () => {
    const entries = buildSitemap(ATIVOS_COM_ERALDO_DUPLICADO_DO_SUPABASE)
    const urls = entries.map((e) => e.url)

    for (const slug of ERALDO_SLUGS_COM_DADOS_PROPRIOS) {
      const url = `https://stivenallan.com.br/empreendimento/eraldo/${slug}`
      const ocorrencias = urls.filter((u) => u === url).length
      expect(ocorrencias, `esperava exatamente 1 ocorrência de ${url}, achou ${ocorrencias}`).toBe(1)
    }

    // Aura: mesmo caso, mas ela só existe via auraPages (fallback estático próprio)
    // + a entrada simulada do Supabase na fixture — as duas fontes coexistindo.
    const auraUrl = 'https://stivenallan.com.br/empreendimento/eraldo/aura-residence-centro-criciuma-sc'
    expect(urls.filter((u) => u === auraUrl).length).toBe(1)
  })

  it('nenhuma URL do sitemap final está duplicada (checagem geral, não só Eraldo)', () => {
    const entries = buildSitemap(ATIVOS_COM_ERALDO_DUPLICADO_DO_SUPABASE)
    const urls = entries.map((e) => e.url)
    expect(new Set(urls).size).toBe(urls.length)
  })

  it('Tubarão aparece no sitemap (cidade só-Eraldo, via Gran Palazzo e Play Residence)', () => {
    const entries = buildSitemap(ATIVOS_COM_ERALDO_DUPLICADO_DO_SUPABASE)
    const urls = entries.map((e) => e.url)
    expect(urls).toContain('https://stivenallan.com.br/lancamentos/tubarao-sc')
  })
})

describe('buildSitemap — Tubarão sem nenhum dado do Supabase/Fontana', () => {
  it('Tubarão continua aparecendo no sitemap só com a fonte estática Eraldo (ativos vazio)', () => {
    const entries = buildSitemap([])
    const urls = entries.map((e) => e.url)
    expect(urls).toContain('https://stivenallan.com.br/lancamentos/tubarao-sc')
    // Os 2 empreendimentos reais de Tubarão continuam presentes também.
    expect(urls).toContain('https://stivenallan.com.br/empreendimento/eraldo/gran-palazzo-vila-moema-tubarao-sc')
    expect(urls).toContain('https://stivenallan.com.br/empreendimento/eraldo/play-residence-vila-moema-tubarao-sc')
  })

  it('sem lastModified e sem duplicatas mesmo com ativos vazio', () => {
    const entries = buildSitemap([])
    expect(entries.length).toBeGreaterThan(0)
    for (const entry of entries) {
      expect(entry).not.toHaveProperty('lastModified')
    }
    const urls = entries.map((e) => e.url)
    expect(new Set(urls).size).toBe(urls.length)
  })
})

// getVitrineImoveis() tenta ler o Supabase via next/headers `cookies()`, que fora de
// um request real do Next.js lança erro — o try/catch de @/lib/vitrine cai pro
// fallback estático. Isso reproduz, sem mock, o mesmo cenário de "Supabase
// indisponível" observado localmente (limitação conhecida, ver
// docs/seo-sprint/2026-07-21/baseline.md) — prova real, não simulada, de que o
// wrapper `sitemap()` (I/O) chama `buildSitemap` corretamente.
describe('sitemap (wrapper com I/O real, ambiente sem Supabase)', () => {
  it('não tem lastModified fabricado em nenhuma entrada', async () => {
    const entries = await sitemap()
    expect(entries.length).toBeGreaterThan(0)
    for (const entry of entries) {
      expect(entry).not.toHaveProperty('lastModified')
    }
  })

  it('não tem URLs duplicadas', async () => {
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    expect(new Set(urls).size).toBe(urls.length)
  })

  it('inclui o Aura Residence mesmo com Supabase indisponível (fonte estática própria)', async () => {
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    expect(urls).toContain('https://stivenallan.com.br/empreendimento/eraldo/aura-residence-centro-criciuma-sc')
  })

  it('inclui Tubarão mesmo com Supabase indisponível', async () => {
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    expect(urls).toContain('https://stivenallan.com.br/lancamentos/tubarao-sc')
  })

  it('inclui os 8 empreendimentos Eraldo com dados em src/data/eraldo', async () => {
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    for (const slug of ERALDO_SLUGS_COM_DADOS_PROPRIOS) {
      expect(urls).toContain(`https://stivenallan.com.br/empreendimento/eraldo/${slug}`)
    }
  })

  it('não inclui URLs legadas (/imovel, /agendar-visita, /imoveis) nem paths de redirect/410', async () => {
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    for (const url of urls) {
      expect(url).not.toMatch(/\/imovel\//)
      expect(url).not.toMatch(/\/agendar-visita\//)
      expect(url).not.toMatch(/^https:\/\/stivenallan\.com\.br\/imoveis(\/|$|\?)/)
    }
  })

  it('todas as URLs estão no domínio canônico, sem www e sem vercel.app', async () => {
    const entries = await sitemap()
    for (const entry of entries) {
      expect(entry.url.startsWith('https://stivenallan.com.br')).toBe(true)
      expect(entry.url).not.toMatch(/vercel\.app/)
      expect(entry.url).not.toMatch(/www\.stivenallan/)
    }
  })
})
