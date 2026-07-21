import { describe, expect, it } from 'vitest'
import { generateMetadata, default as LancamentosCidadePage } from './page'

// Serializa a árvore de elementos React retornada pelo componente pra poder
// procurar texto sem precisar de um renderer de DOM (sem dependência nova). Alguns
// componentes importados (next/link, next/image) têm referências circulares em seus
// módulos internos — o replacer corta ciclos em vez de tentar evitar tocar neles.
function serialize(node: unknown): string {
  const seen = new WeakSet()
  return JSON.stringify(node, (_key, value) => {
    if (typeof value === 'function') return undefined
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]'
      seen.add(value)
    }
    return value
  })
}

// Achado da auditoria SEO 2026-07-21: /lancamentos/tubarao-sc aparecia no sitemap de
// produção (2 empreendimentos Eraldo reais na Vila Moema) mas a página não tinha
// "tubarao"/"tubarao-sc" no dicionário CIDADES — caía num fallback que retornava
// HTTP 200 com "Cidade não encontrada" e title/canonical genéricos da home.

describe('lancamentos/[cidade] — Tubarão', () => {
  it('generateMetadata: title e canonical reais para tubarao-sc', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ cidade: 'tubarao-sc' }) })
    expect(metadata.title).toContain('Tubarão')
    expect(metadata.alternates?.canonical).toBe('https://stivenallan.com.br/lancamentos/tubarao-sc')
  })

  it('página renderiza os 2 empreendimentos reais de Tubarão (Gran Palazzo e Play Residence), sem "Cidade não encontrada"', async () => {
    const element = await LancamentosCidadePage({ params: Promise.resolve({ cidade: 'tubarao-sc' }) })
    const html = serialize(element)
    expect(html).toContain('Gran Palazzo')
    expect(html).toContain('Play Residence')
    expect(html).not.toContain('Cidade não encontrada')
  })
})

describe('lancamentos/[cidade] — cidade sem dados reais', () => {
  it('generateMetadata retorna vazio (não finge title/canonical)', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ cidade: 'cidade-inexistente-999' }) })
    expect(metadata).toEqual({})
  })

  it('a página dispara notFound() — 404 real, nunca mais 200 com "Cidade não encontrada"', async () => {
    await expect(
      LancamentosCidadePage({ params: Promise.resolve({ cidade: 'cidade-inexistente-999' }) })
    ).rejects.toThrow()
  })
})
