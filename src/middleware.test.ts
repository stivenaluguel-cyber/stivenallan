import { describe, expect, it } from 'vitest'
import type { NextRequest } from 'next/server'
import { middleware } from './middleware'

function makeRequest(pathname: string): NextRequest {
  return {
    nextUrl: { pathname },
    cookies: { get: () => undefined },
  } as unknown as NextRequest
}

// As 9 URLs abaixo são unidades confirmadas como descontinuadas (dado de negócio +
// evidência de Search Console, auditoria SEO 2026-07-21 — ver
// docs/seo-sprint/2026-07-21/redirects.csv). Precisam responder 410 real, nunca
// mais o redirect em massa pra /empreendimentos que existia antes.
const GONE_PATHS = [
  '/imovel/residencial-sordello-lancamento-ao-lado-do-combo-atacadista-em-criciuma-194/AP0110-194',
  '/imovel/residencial-volpago-del-montello-conforto-e-praticidade-em-criciuma-200/AP0115-200',
  '/imovel/belfiore-residencial-conforto-e-sofisticacao-no-bairro-michel-criciuma-176/AP0095-176',
  '/imovel/hexa-prime-residence-conforto-e-modernidade-em-um-so-lugar-173/AP0094-173',
  '/imovel/longarone-residencial-alto-padrao-da-construtora-fontana-em-criciuma-185/AP0103-185',
  '/imovel/casa-alto-padrao-no-bairro-santa-barbara-criciuma-sc-3-suites-piscina-e-localizacao-privilegiada-174/CA0012-174',
  '/imovel/apartamento-a-venda-em-criciuma-centro-com-3-quartos-169-38m',
  '/imovel/loteamento-murialdo-terrenos-de-163m-a-partir-de-rs-163-000-em-orleans-sc-com-vista-deslumbrante-da-serra-catarinense-169/TE0014-169',
  '/imovel/terrenos-em-condominio-fechado-de-alto-padrao-no-bairro-sao-simao-criciuma-sc-161/TE0006-161',
]

describe('middleware — 410 para unidades descontinuadas confirmadas', () => {
  it.each(GONE_PATHS)('retorna 410 para %s', async (path) => {
    const res = await middleware(makeRequest(path))
    expect(res.status).toBe(410)
  })

  it('não retorna 410 para uma URL de empreendimento válida', async () => {
    const res = await middleware(makeRequest('/empreendimento/fontana/calliano-centro-criciuma-sc'))
    expect(res.status).not.toBe(410)
  })

  it('não retorna 410 para a home', async () => {
    const res = await middleware(makeRequest('/'))
    expect(res.status).not.toBe(410)
  })
})
