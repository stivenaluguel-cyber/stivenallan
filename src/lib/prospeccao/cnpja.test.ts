import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }

beforeEach(() => {
  process.env.CNPJA_API_KEY = 'test-key'
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  process.env = { ...originalEnv }
  vi.restoreAllMocks()
})

const respostaBusca = (taxIds: string[]) => ({
  ok: true,
  status: 200,
  json: async () => ({ data: taxIds.map((taxId) => ({ taxId })) }),
})

const respostaDetalhe = (over: Record<string, unknown> = {}) => ({
  ok: true,
  status: 200,
  json: async () => ({
    taxId: '37335118000180',
    company: {
      name: 'DUDA IMOVEIS LTDA',
      members: [
        { person: { name: 'MARIA DUDA SILVA' }, role: { text: 'Sócia-Administradora' } },
      ],
    },
    status: { text: 'Ativa' },
    phones: [{ area: '48', number: '34310600' }],
    emails: [{ address: 'contato@dudaimoveis.com.br' }],
    ...over,
  }),
})

// timeout 15s: primeiro import carrega @/lib/log -> @sentry/nextjs (mesmo
// motivo documentado em google-places.test.ts e meta-capi.test.ts).
describe('buscarCnpjPorNome', () => {
  it('retorna skipped sem chamar a API quando CNPJA_API_KEY não está setada', async () => {
    delete process.env.CNPJA_API_KEY
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { buscarCnpjPorNome } = await import('./cnpja')

    const r = await buscarCnpjPorNome('Duda Imóveis')

    expect(r).toEqual({ ok: false, skipped: true })
    expect(fetchMock).not.toHaveBeenCalled()
  }, 15000)

  it('chama a busca por nome com names.in e depois o detalhe do CNPJ encontrado', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(respostaBusca(['37335118000180']))
      .mockResolvedValueOnce(respostaDetalhe())
    vi.stubGlobal('fetch', fetchMock)
    const { buscarCnpjPorNome } = await import('./cnpja')

    const r = await buscarCnpjPorNome('Duda Imóveis')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const [urlBusca, optsBusca] = fetchMock.mock.calls[0]
    expect(urlBusca).toContain('/office?names.in=')
    expect(decodeURIComponent(urlBusca)).toContain('Duda Imóveis')
    expect(optsBusca.headers.Authorization).toBe('test-key')
    const [urlDetalhe] = fetchMock.mock.calls[1]
    expect(urlDetalhe).toBe('https://api.cnpja.com/office/37335118000180')

    expect(r).toEqual({
      ok: true,
      skipped: false,
      dados: {
        cnpj: '37335118000180',
        razaoSocial: 'DUDA IMOVEIS LTDA',
        situacao: 'Ativa',
        telefone: '(48) 34310600',
        email: 'contato@dudaimoveis.com.br',
        socios: [{ nome: 'MARIA DUDA SILVA', cargo: 'Sócia-Administradora' }],
      },
    })
  }, 15000)

  it('nenhuma empresa encontrada: dados null com ok true, não é erro', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respostaBusca([])))
    const { buscarCnpjPorNome } = await import('./cnpja')

    const r = await buscarCnpjPorNome('Empresa Que Não Existe De Jeito Nenhum')

    expect(r).toEqual({ ok: true, skipped: false, dados: null })
  }, 15000)

  it('empresa sem sócios cadastrados devolve lista vazia, não quebra', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(respostaBusca(['37335118000180']))
      .mockResolvedValueOnce(respostaDetalhe({ company: { name: 'EMPRESA SEM QSA LTDA', members: [] } }))
    vi.stubGlobal('fetch', fetchMock)
    const { buscarCnpjPorNome } = await import('./cnpja')

    const r = await buscarCnpjPorNome('Empresa Sem Qsa')

    expect(r).toEqual({ ok: true, skipped: false, dados: expect.objectContaining({ socios: [] }) })
  }, 15000)

  it('membro sem nome (representante legal de outra pessoa jurídica) é descartado, não vira sócio vazio', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(respostaBusca(['37335118000180']))
      .mockResolvedValueOnce(
        respostaDetalhe({
          company: {
            name: 'EMPRESA LTDA',
            members: [{ person: { name: 'MARIA' }, role: { text: 'Sócia' } }, { person: {}, role: { text: 'Representante' } }],
          },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)
    const { buscarCnpjPorNome } = await import('./cnpja')

    const r = await buscarCnpjPorNome('Empresa')

    expect(r.ok && !r.skipped && r.dados?.socios).toEqual([{ nome: 'MARIA', cargo: 'Sócia' }])
  }, 15000)

  it('sem telefone/e-mail cadastrado, devolve null em vez de quebrar', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(respostaBusca(['37335118000180']))
      .mockResolvedValueOnce(respostaDetalhe({ phones: [], emails: [] }))
    vi.stubGlobal('fetch', fetchMock)
    const { buscarCnpjPorNome } = await import('./cnpja')

    const r = await buscarCnpjPorNome('Empresa')

    expect(r.ok && !r.skipped && r.dados).toMatchObject({ telefone: null, email: null })
  }, 15000)

  it('erro na busca por nome devolve erro tipado sem chamar o detalhe', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => 'chave inválida' })
    vi.stubGlobal('fetch', fetchMock)
    const { buscarCnpjPorNome } = await import('./cnpja')

    const r = await buscarCnpjPorNome('Empresa')

    expect(r).toEqual({ ok: false, skipped: false, error: 'cnpja.com recusou a busca (status 401)' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  }, 15000)

  it('erro no detalhe do CNPJ (segunda chamada) devolve erro tipado', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(respostaBusca(['37335118000180']))
      .mockResolvedValueOnce({ ok: false, status: 429, text: async () => 'sem créditos' })
    vi.stubGlobal('fetch', fetchMock)
    const { buscarCnpjPorNome } = await import('./cnpja')

    const r = await buscarCnpjPorNome('Empresa')

    expect(r).toEqual({ ok: false, skipped: false, error: 'cnpja.com recusou o detalhe (status 429)' })
  }, 15000)

  it('falha de rede devolve erro tipado em vez de estourar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNRESET')))
    const { buscarCnpjPorNome } = await import('./cnpja')

    const r = await buscarCnpjPorNome('Empresa')

    expect(r).toEqual({ ok: false, skipped: false, error: 'Falha de rede ao consultar o cnpja.com' })
  }, 15000)
})
