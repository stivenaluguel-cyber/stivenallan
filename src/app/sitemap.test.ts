import { describe, expect, it } from 'vitest'
import sitemap from './sitemap'

// getVitrineImoveis() tenta ler o Supabase via next/headers `cookies()`, que fora de
// um request real do Next.js lança erro — o try/catch de @/lib/vitrine cai pro
// fallback estático. Isso reproduz, sem mock, o mesmo cenário de "Supabase
// indisponível" observado localmente (limitação conhecida, ver
// docs/seo-sprint/2026-07-21/baseline.md) — prova real, não simulada.

describe('sitemap', () => {
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

  it('inclui os 8 empreendimentos Eraldo com dados em src/data/eraldo', async () => {
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    const slugsEsperados = [
      'arbor-centro-criciuma-sc',
      'gran-michel-criciuma-sc',
      'gran-palazzo-vila-moema-tubarao-sc',
      'harmony-residence-centro-balneario-rincao-sc',
      'horizon-centro-balneario-rincao-sc',
      'lessence-home-club-cruzeiro-do-sul-criciuma-sc',
      'play-residence-vila-moema-tubarao-sc',
      'symphony-mar-grosso-laguna-sc',
    ]
    for (const slug of slugsEsperados) {
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
