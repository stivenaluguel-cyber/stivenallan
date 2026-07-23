import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }

beforeEach(() => {
  vi.resetModules()
  process.env.EVOLUTION_API_URL = 'https://evo.example.com'
  process.env.EVOLUTION_API_KEY = 'test-key'
  process.env.EVOLUTION_INSTANCE = 'stiven'
})

afterEach(() => {
  process.env = { ...originalEnv }
  vi.restoreAllMocks()
})

// Regressão: a Evolution API respondia 400 "instance requires property text"
// porque o body mandava textMessage: { text } em vez de text no nível raiz.
// Esses testes travam o formato exato aceito pela API em produção.
describe('evolution enviarMensagem', () => {
  it('manda "text" no nível raiz do body, não aninhado em textMessage', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' })
    vi.stubGlobal('fetch', fetchMock)

    const { enviarMensagem } = await import('./evolution')
    const ok = await enviarMensagem('5548999999999', 'Olá, tudo bem?')

    expect(ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://evo.example.com/message/sendText/stiven')
    const body = JSON.parse(init.body as string)
    expect(body).toMatchObject({ number: '5548999999999', text: 'Olá, tudo bem?' })
    expect(body.textMessage).toBeUndefined()
  })

  it('retorna false e não lança quando a Evolution API responde erro', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ status: 400, error: 'Bad Request', response: { message: ['instance requires property "text"'] } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { enviarMensagem } = await import('./evolution')
    const ok = await enviarMensagem('5548999999999', 'Olá')

    expect(ok).toBe(false)
  })
})
