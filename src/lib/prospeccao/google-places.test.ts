import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }

beforeEach(() => {
  process.env.GOOGLE_PLACES_API_KEY = 'test-key'
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  process.env = { ...originalEnv }
  vi.restoreAllMocks()
})

const respostaOk = (nomes: string[]) => ({
  ok: true,
  status: 200,
  json: async () => ({
    places: nomes.map((nome, i) => ({
      id: 'place-' + i,
      displayName: { text: nome },
      formattedAddress: 'Rua Teste, ' + i + ' - Criciúma - SC',
      nationalPhoneNumber: '(48) 3431-060' + i,
      websiteUri: 'https://' + nome.toLowerCase() + '.com.br/',
      rating: 4.5,
      userRatingCount: 30 + i,
      types: ['moving_company', 'point_of_interest'],
      businessStatus: 'OPERATIONAL',
    })),
  }),
})

// timeout 15s: primeiro import de ./google-places carrega @/lib/log ->
// @sentry/nextjs, lento pra inicializar sob a suíte inteira em paralelo
// (mesmo motivo documentado em meta-capi.test.ts).
describe('buscarPlaces', () => {
  it('retorna skipped sem chamar a API quando GOOGLE_PLACES_API_KEY não está setada', async () => {
    delete process.env.GOOGLE_PLACES_API_KEY
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { buscarPlaces } = await import('./google-places')

    const r = await buscarPlaces('transportadoras em Criciúma SC')

    expect(r).toEqual({ ok: false, skipped: true })
    expect(fetchMock).not.toHaveBeenCalled()
  }, 15000)

  it('chama o endpoint certo com a api key e o field mask no header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respostaOk(['Transportes Natal']))
    vi.stubGlobal('fetch', fetchMock)
    const { buscarPlaces } = await import('./google-places')

    await buscarPlaces('transportadoras em Criciúma SC', 10)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('https://places.googleapis.com/v1/places:searchText')
    expect(opts.headers['X-Goog-Api-Key']).toBe('test-key')
    expect(opts.headers['X-Goog-FieldMask']).toContain('places.nationalPhoneNumber')
    const body = JSON.parse(opts.body)
    expect(body.textQuery).toBe('transportadoras em Criciúma SC')
    expect(body.regionCode).toBe('BR')
    expect(body.maxResultCount).toBe(10)
  }, 15000)

  it('mapeia o resultado da API pro formato interno', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respostaOk(['Transportes Natal'])))
    const { buscarPlaces } = await import('./google-places')

    const r = await buscarPlaces('transportadoras')

    expect(r.ok).toBe(true)
    if (!r.ok) throw new Error('esperava ok')
    expect(r.candidatos).toEqual([
      {
        placeId: 'place-0',
        nome: 'Transportes Natal',
        endereco: 'Rua Teste, 0 - Criciúma - SC',
        telefone: '(48) 3431-0600',
        site: 'https://transportes natal.com.br/',
        rating: 4.5,
        ratingCount: 30,
        tipos: ['moving_company', 'point_of_interest'],
      },
    ])
  }, 15000)

  it('preenche null nos campos opcionais ausentes, sem quebrar', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ places: [{ id: 'p1', displayName: { text: 'Empresa Sem Telefone' } }] }),
      }),
    )
    const { buscarPlaces } = await import('./google-places')

    const r = await buscarPlaces('empresas')

    expect(r.ok).toBe(true)
    if (!r.ok) throw new Error('esperava ok')
    expect(r.candidatos[0]).toEqual({
      placeId: 'p1',
      nome: 'Empresa Sem Telefone',
      endereco: null,
      telefone: null,
      site: null,
      rating: null,
      ratingCount: null,
      tipos: [],
    })
  }, 15000)

  it('descarta place sem id ou sem nome — payload não usável', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          places: [{ id: 'p1' }, { displayName: { text: 'Sem Id' } }, { id: 'p2', displayName: { text: 'Válido' } }],
        }),
      }),
    )
    const { buscarPlaces } = await import('./google-places')

    const r = await buscarPlaces('empresas')

    expect(r.ok).toBe(true)
    if (!r.ok) throw new Error('esperava ok')
    expect(r.candidatos.map((c) => c.nome)).toEqual(['Válido'])
  }, 15000)

  it('descarta place fechado (businessStatus diferente de OPERATIONAL)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          places: [{ id: 'p1', displayName: { text: 'Fechada' }, businessStatus: 'CLOSED_PERMANENTLY' }],
        }),
      }),
    )
    const { buscarPlaces } = await import('./google-places')

    const r = await buscarPlaces('empresas')

    expect(r.ok).toBe(true)
    if (!r.ok) throw new Error('esperava ok')
    expect(r.candidatos).toEqual([])
  }, 15000)

  it('devolve erro tipado quando a API responde status de erro', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403, text: async () => 'API key inválida' }))
    const { buscarPlaces } = await import('./google-places')

    const r = await buscarPlaces('empresas')

    expect(r).toEqual({ ok: false, skipped: false, error: 'Google Places recusou a busca (status 403)' })
  }, 15000)

  it('devolve erro tipado em vez de estourar quando o fetch falha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNRESET')))
    const { buscarPlaces } = await import('./google-places')

    const r = await buscarPlaces('empresas')

    expect(r).toEqual({ ok: false, skipped: false, error: 'Falha de rede ao consultar o Google Places' })
  }, 15000)
})

describe('buscarPlacesMultiplas', () => {
  it('roda as queries em paralelo e remove placeId duplicado entre elas', async () => {
    const fetchMock = vi.fn().mockImplementation(async (_url, opts) => {
      const body = JSON.parse(opts.body)
      if (body.textQuery === 'transportadoras em Criciúma SC') {
        return respostaOk(['Transportes Natal', 'Empresa Comum'])
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          places: [
            { id: 'place-0', displayName: { text: 'Empresa Comum' }, businessStatus: 'OPERATIONAL' }, // mesmo place-0 da outra query
            { id: 'place-metal', displayName: { text: 'Metalúrgica X' }, businessStatus: 'OPERATIONAL' },
          ],
        }),
      }
    })
    vi.stubGlobal('fetch', fetchMock)
    const { buscarPlacesMultiplas } = await import('./google-places')

    const r = await buscarPlacesMultiplas(['transportadoras em Criciúma SC', 'metalúrgicas em Criciúma SC'])

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(r.ok).toBe(true)
    if (!r.ok) throw new Error('esperava ok')
    expect(r.candidatos.map((c) => c.placeId).sort()).toEqual(['place-0', 'place-1', 'place-metal'])
  }, 15000)

  it('uma query falhando não derruba as outras — segue com o que deu certo', async () => {
    const fetchMock = vi.fn().mockImplementation(async (_url, opts) => {
      const body = JSON.parse(opts.body)
      if (body.textQuery === 'query ruim') return { ok: false, status: 500, text: async () => 'erro' }
      return respostaOk(['Empresa Boa'])
    })
    vi.stubGlobal('fetch', fetchMock)
    const { buscarPlacesMultiplas } = await import('./google-places')

    const r = await buscarPlacesMultiplas(['query ruim', 'query boa'])

    expect(r.ok).toBe(true)
    if (!r.ok) throw new Error('esperava ok')
    expect(r.candidatos.map((c) => c.nome)).toEqual(['Empresa Boa'])
  }, 15000)

  it('devolve erro só quando NENHUMA query rendeu candidato', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'erro' }))
    const { buscarPlacesMultiplas } = await import('./google-places')

    const r = await buscarPlacesMultiplas(['a', 'b'])

    expect(r).toEqual({ ok: false, skipped: false, error: 'Google Places recusou a busca (status 500)' })
  }, 15000)

  it('skipped quando falta a chave, sem chamar fetch nenhuma vez', async () => {
    delete process.env.GOOGLE_PLACES_API_KEY
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { buscarPlacesMultiplas } = await import('./google-places')

    const r = await buscarPlacesMultiplas(['a', 'b'])

    expect(r).toEqual({ ok: false, skipped: true })
    expect(fetchMock).not.toHaveBeenCalled()
  }, 15000)
})
