import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }

beforeEach(() => {
  vi.resetModules()
  process.env.META_WHATSAPP_PHONE_NUMBER_ID = '106540352242922'
  process.env.META_WHATSAPP_TOKEN = 'test-token'
  process.env.VERCEL_ENV = 'production'
})

afterEach(() => {
  process.env = { ...originalEnv }
  vi.restoreAllMocks()
})

describe('enviarTextoWhatsappCloud', () => {
  it('manda type "text" pro endpoint /messages com Authorization Bearer', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' })
    vi.stubGlobal('fetch', fetchMock)

    const { enviarTextoWhatsappCloud } = await import('./whatsapp-cloud')
    const ok = await enviarTextoWhatsappCloud('5548999999999', 'Olá, tudo bem?')

    expect(ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://graph.facebook.com/v21.0/106540352242922/messages')
    expect(init.headers['Authorization']).toBe('Bearer test-token')
    expect(init.headers['Content-Type']).toBe('application/json')
    const body = JSON.parse(init.body as string)
    expect(body).toEqual({
      messaging_product: 'whatsapp',
      to: '5548999999999',
      type: 'text',
      text: { body: 'Olá, tudo bem?' },
    })
  })

  it('retorna false e não lança quando a Graph API responde erro', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ error: { message: 'Message failed to send because more than 24 hours have passed' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { enviarTextoWhatsappCloud } = await import('./whatsapp-cloud')
    const ok = await enviarTextoWhatsappCloud('5548999999999', 'oi')

    expect(ok).toBe(false)
  })

  it('retorna false sem lançar quando o fetch falha (rede/timeout)', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('fetch failed'))
    vi.stubGlobal('fetch', fetchMock)

    const { enviarTextoWhatsappCloud } = await import('./whatsapp-cloud')
    const ok = await enviarTextoWhatsappCloud('5548999999999', 'oi')

    expect(ok).toBe(false)
  })
})

describe('enviarTemplateWhatsappCloud', () => {
  it('monta type "template" com nome/idioma/parâmetros recebidos por argumento — nada hardcoded', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' })
    vi.stubGlobal('fetch', fetchMock)

    const { enviarTemplateWhatsappCloud } = await import('./whatsapp-cloud')
    const ok = await enviarTemplateWhatsappCloud('5548999999999', 'primeiro_contato', 'pt_BR', ['Ana', 'Monte Leone'])

    expect(ok).toBe(true)
    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(init.body as string)
    expect(body).toEqual({
      messaging_product: 'whatsapp',
      to: '5548999999999',
      type: 'template',
      template: {
        name: 'primeiro_contato',
        language: { code: 'pt_BR' },
        components: [
          { type: 'body', parameters: [{ type: 'text', text: 'Ana' }, { type: 'text', text: 'Monte Leone' }] },
        ],
      },
    })
  })

  it('sem parâmetros, não manda "components" na chamada', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' })
    vi.stubGlobal('fetch', fetchMock)

    const { enviarTemplateWhatsappCloud } = await import('./whatsapp-cloud')
    await enviarTemplateWhatsappCloud('5548999999999', 'boas_vindas', 'pt_BR')

    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(init.body as string)
    expect(body.template.components).toBeUndefined()
  })

  it('retorna false quando a Graph API rejeita o template (ex: não aprovado)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => JSON.stringify({ error: { message: 'Template name does not exist' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { enviarTemplateWhatsappCloud } = await import('./whatsapp-cloud')
    const ok = await enviarTemplateWhatsappCloud('5548999999999', 'inexistente', 'pt_BR')

    expect(ok).toBe(false)
  })
})

describe('whatsapp-cloud — guard de envs ausentes', () => {
  it('bloqueia e não chama fetch quando META_WHATSAPP_PHONE_NUMBER_ID está ausente', async () => {
    delete process.env.META_WHATSAPP_PHONE_NUMBER_ID
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { enviarTextoWhatsappCloud } = await import('./whatsapp-cloud')
    const ok = await enviarTextoWhatsappCloud('5548999999999', 'oi')

    expect(ok).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('bloqueia e não chama fetch quando META_WHATSAPP_TOKEN está ausente', async () => {
    delete process.env.META_WHATSAPP_TOKEN
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { enviarTextoWhatsappCloud } = await import('./whatsapp-cloud')
    const ok = await enviarTextoWhatsappCloud('5548999999999', 'oi')

    expect(ok).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('mesmo guard vale pro envio de template', async () => {
    delete process.env.META_WHATSAPP_TOKEN
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { enviarTemplateWhatsappCloud } = await import('./whatsapp-cloud')
    const ok = await enviarTemplateWhatsappCloud('5548999999999', 'boas_vindas', 'pt_BR')

    expect(ok).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

// Trava fail-closed: mesmo padrão de src/lib/evolution.ts — preview/dev não
// podem mandar mensagem real.
describe('whatsapp-cloud — trava de ambiente (VERCEL_ENV)', () => {
  it('bloqueia e não chama fetch quando VERCEL_ENV está ausente', async () => {
    delete process.env.VERCEL_ENV
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { enviarTextoWhatsappCloud } = await import('./whatsapp-cloud')
    const ok = await enviarTextoWhatsappCloud('5548999999999', 'oi')

    expect(ok).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('bloqueia quando VERCEL_ENV="preview"', async () => {
    process.env.VERCEL_ENV = 'preview'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { enviarTextoWhatsappCloud } = await import('./whatsapp-cloud')
    const ok = await enviarTextoWhatsappCloud('5548999999999', 'oi')

    expect(ok).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('bloqueia quando VERCEL_ENV="development"', async () => {
    process.env.VERCEL_ENV = 'development'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { enviarTextoWhatsappCloud } = await import('./whatsapp-cloud')
    const ok = await enviarTextoWhatsappCloud('5548999999999', 'oi')

    expect(ok).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('permite quando VERCEL_ENV="production"', async () => {
    process.env.VERCEL_ENV = 'production'
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' })
    vi.stubGlobal('fetch', fetchMock)

    const { enviarTextoWhatsappCloud } = await import('./whatsapp-cloud')
    const ok = await enviarTextoWhatsappCloud('5548999999999', 'oi')

    expect(ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
