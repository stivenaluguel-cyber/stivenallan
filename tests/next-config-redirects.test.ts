import { describe, expect, it } from 'vitest'
import { nextConfig } from '../next.config'

// Auditoria SEO 2026-07-21 (achado B1-4): o wildcard `/imovel/:path*` e
// `/agendar-visita/:path*` → /empreendimentos redirecionava em massa qualquer URL
// legada não mapeada, inclusive as unidades confirmadas como descontinuadas — sem
// equivalência real. Removido em favor de 410 real (src/middleware.ts) pras
// descontinuadas, e 404 padrão pro resto. Estes testes travam essa regressão.

describe('next.config redirects', () => {
  it('mantém os 7 redirects legados 1:1 com destino real', async () => {
    const redirects = await nextConfig.redirects!()
    const esperados = [
      ['/imovel/residencial-bosco-del-montello-pronto-para-morar-no-centro-de-criciuma-178/AP0097', '/empreendimento/fontana/bosco-del-montello-centro-criciuma-sc'],
      ['/imovel/residencial-calalzo-di-cadore-modernidade-e-conforto-no-bairro-michel-criciuma-179/AP0098-179', '/empreendimento/fontana/calalzo-di-cadore-michel-criciuma-sc'],
      ['/imovel/residencial-fidenza-grande-lancamento-no-centro-de-criciuma-182/AP0101-182', '/empreendimento/fontana/fidenza-residencial-cruzeiro-do-sul-criciuma-sc'],
      ['/imovel/residencial-parco-savello-alto-padrao-no-bairro-santa-barbara-criciuma-sc-192/AP0108', '/empreendimento/fontana/parco-savello-santa-barbara-criciuma-sc'],
      ['/imovel/residencial-parco-savello-alto-padrao-no-bairro-santa-barbara-criciuma-sc-192/AP0108-192', '/empreendimento/fontana/parco-savello-santa-barbara-criciuma-sc'],
      ['/imovel/thiene-residencial-sofisticacao-e-conforto-no-centro-de-criciuma-195/AP0111-195', '/empreendimento/fontana/thiene-centro-criciuma-sc'],
      ['/agendar-visita/thiene-residencial-sofisticacao-e-conforto-no-centro-de-criciuma-195', '/empreendimento/fontana/thiene-centro-criciuma-sc'],
    ]
    for (const [source, destination] of esperados) {
      const entry = redirects.find((r) => r.source === source)
      expect(entry, `redirect ausente para ${source}`).toBeDefined()
      expect(entry!.destination).toBe(destination)
      expect(entry!.permanent).toBe(true)
    }
  })

  it('não tem mais o wildcard de redirect em massa /imovel/:path* ou /agendar-visita/:path*', async () => {
    const redirects = await nextConfig.redirects!()
    const sources = redirects.map((r) => r.source)
    expect(sources).not.toContain('/imovel/:path*')
    expect(sources).not.toContain('/agendar-visita/:path*')
  })

  it('mantém o redirect de listagem /imoveis → /empreendimentos (equivalência real de tipo de página)', async () => {
    const redirects = await nextConfig.redirects!()
    const entry = redirects.find((r) => r.source === '/imoveis')
    expect(entry).toBeDefined()
    expect(entry!.destination).toBe('/empreendimentos')
  })
})
