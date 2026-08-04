import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }

beforeEach(() => {
  vi.resetModules()
  process.env.EVOLUTION_API_URL = 'https://evo.example.com'
  process.env.EVOLUTION_API_KEY = 'test-key'
  process.env.EVOLUTION_INSTANCE = 'stiven'
  // Testes de enviarMensagem abaixo verificam o comportamento do envio em si
  // (formato do body, jitter, tratamento de erro) — a trava de ambiente tem
  // describe próprio logo abaixo, então aqui simula produção pra não
  // interferir nesses testes já existentes.
  process.env.VERCEL_ENV = 'production'
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

  it('varia o delay de digitação (jitter) em vez de um valor fixo — higiene anti-banimento', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' })
    vi.stubGlobal('fetch', fetchMock)

    const { enviarMensagem } = await import('./evolution')
    const delays = new Set<number>()
    for (let i = 0; i < 20; i++) {
      await enviarMensagem('5548999999999', 'oi')
      const body = JSON.parse(fetchMock.mock.calls[i][1].body as string)
      expect(body.options.delay).toBeGreaterThanOrEqual(900)
      expect(body.options.delay).toBeLessThanOrEqual(2600)
      delays.add(body.options.delay)
    }
    // Com 20 amostras num intervalo de 1700ms, praticamente impossível dar
    // sempre o mesmo valor se o jitter estiver de fato ativo.
    expect(delays.size).toBeGreaterThan(1)
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

// Trava fail-closed: preview/development compartilham as mesmas credenciais
// Evolution de produção na Vercel (Preview tem os mesmos EVOLUTION_API_URL/
// _KEY/_INSTANCE), então sem isso todo deploy de PR mandaria WhatsApp real.
describe('evolution enviarMensagem — trava de ambiente (VERCEL_ENV)', () => {
  it('bloqueia e não chama fetch quando VERCEL_ENV está ausente', async () => {
    delete process.env.VERCEL_ENV
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { enviarMensagem } = await import('./evolution')
    const ok = await enviarMensagem('5548999999999', 'oi')

    expect(ok).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('bloqueia quando VERCEL_ENV="preview"', async () => {
    process.env.VERCEL_ENV = 'preview'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { enviarMensagem } = await import('./evolution')
    const ok = await enviarMensagem('5548999999999', 'oi')

    expect(ok).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('bloqueia quando VERCEL_ENV="development"', async () => {
    process.env.VERCEL_ENV = 'development'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { enviarMensagem } = await import('./evolution')
    const ok = await enviarMensagem('5548999999999', 'oi')

    expect(ok).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('permite quando VERCEL_ENV="production"', async () => {
    process.env.VERCEL_ENV = 'production'
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' })
    vi.stubGlobal('fetch', fetchMock)

    const { enviarMensagem } = await import('./evolution')
    const ok = await enviarMensagem('5548999999999', 'oi')

    expect(ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

// Regressão: a instância desconectou do servidor Evolution em produção (sessão
// do WhatsApp caiu) e o cron de follow-up só descobriu dias depois, por gerar
// o mesmo erro genérico repetido por lead. verificarInstancia() existia mas
// nunca era chamada — agora o cron a chama uma vez, no início, com motivo
// legível persistido no histórico.
describe('evolution verificarInstancia', () => {
  it('retorna ok:true quando a instância está com state "open"', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ instance: { state: 'open' } }) })
    vi.stubGlobal('fetch', fetchMock)

    const { verificarInstancia } = await import('./evolution')
    const status = await verificarInstancia()

    expect(status).toEqual({ ok: true, state: 'open' })
    expect(fetchMock.mock.calls[0][0]).toBe('https://evo.example.com/instance/connectionState/stiven')
  })

  it('retorna ok:false com motivo legível quando a API responde 404 (instância removida do servidor)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => JSON.stringify({ status: 'error', code: 404, message: 'Application not found' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { verificarInstancia } = await import('./evolution')
    const status = await verificarInstancia()

    expect(status.ok).toBe(false)
    expect((status as { ok: false; reason: string }).reason).toMatch(/HTTP 404.*Application not found/)
  })

  it('retorna ok:false quando a instância existe mas não está "open" (ex: desconectada)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ instance: { state: 'close' } }) })
    vi.stubGlobal('fetch', fetchMock)

    const { verificarInstancia } = await import('./evolution')
    const status = await verificarInstancia()

    expect(status.ok).toBe(false)
    expect((status as { ok: false; reason: string }).reason).toMatch(/"close"/)
  })

  it('retorna ok:false sem lançar quando o fetch falha (rede/timeout)', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('fetch failed'))
    vi.stubGlobal('fetch', fetchMock)

    const { verificarInstancia } = await import('./evolution')
    const status = await verificarInstancia()

    expect(status).toEqual({ ok: false, reason: 'fetch failed' })
  })
})
