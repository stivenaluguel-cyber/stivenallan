import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHash } from 'node:crypto'

const originalEnv = { ...process.env }

beforeEach(() => {
  process.env.META_CAPI_TOKEN = 'test-token'
  process.env.NEXT_PUBLIC_META_PIXEL_ID = '111222333'
  delete process.env.META_TEST_EVENT_CODE
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  process.env = { ...originalEnv }
  vi.restoreAllMocks()
})

function sha256(v: string) {
  return createHash('sha256').update(v).digest('hex')
}

// timeout de 15s nestes testes: o primeiro import de ./meta-capi no processo
// carrega @/lib/log -> @sentry/nextjs, que é lento pra inicializar (mais ainda
// sob a suíte inteira rodando em paralelo) e passa do timeout padrão de 5s.
describe('sendMetaCapiEvent', () => {
  it('retorna skipped sem chamar a Graph API quando META_CAPI_TOKEN não está setado', async () => {
    delete process.env.META_CAPI_TOKEN
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { sendMetaCapiEvent } = await import('./meta-capi')

    const result = await sendMetaCapiEvent({ eventName: 'Lead', eventId: 'evt-1', nome: 'Ana Silva', telefone: '48999999999' })

    expect(result).toEqual({ ok: false, skipped: true })
    expect(fetchMock).not.toHaveBeenCalled()
  }, 15000)

  it('monta o payload com event_name repassado e dados hasheados, e chama a URL correta', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    const { sendMetaCapiEvent } = await import('./meta-capi')

    const result = await sendMetaCapiEvent({
      eventName: 'Schedule',
      eventId: 'evt-2',
      nome: 'Ana Silva',
      telefone: '48999999999',
      email: 'ana@example.com',
      contentName: 'Monte Leone',
    })

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://graph.facebook.com/v21.0/111222333/events?access_token=test-token')
    const body = JSON.parse(init.body as string)
    const event = body.data[0]
    expect(event.event_name).toBe('Schedule')
    expect(event.event_id).toBe('evt-2')
    expect(event.custom_data).toEqual({ content_name: 'Monte Leone' })
    expect(event.user_data.ph).toEqual([sha256('5548999999999')])
    expect(event.user_data.fn).toEqual([sha256('ana')])
    expect(event.user_data.ln).toEqual([sha256('silva')])
    expect(event.user_data.em).toEqual([sha256('ana@example.com')])
  }, 15000)

  it('sintetiza fbc a partir do fbclid quando não há cookie _fbc', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    const { sendMetaCapiEvent } = await import('./meta-capi')

    await sendMetaCapiEvent({
      eventName: 'Contact',
      eventId: 'evt-3',
      nome: 'Ana',
      telefone: '48999999999',
      fbclid: 'abc123',
      fbclidTs: 1700000000000,
    })

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body.data[0].user_data.fbc).toBe('fb.1.1700000000000.abc123')
  }, 15000)

  it('retorna ok:false com erro (sem lançar) quando a Graph API responde erro', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 400, text: async () => 'bad request' })
    vi.stubGlobal('fetch', fetchMock)
    const { sendMetaCapiEvent } = await import('./meta-capi')

    const result = await sendMetaCapiEvent({ eventName: 'Lead', eventId: 'evt-4', nome: 'Ana', telefone: '48999999999' })

    expect(result).toEqual({ ok: false, error: 'CAPI falhou' })
  }, 15000)
})

// Regressão: existia um PIXEL_ID fixo como fallback ('364836344657445') que não
// pertence a nenhum pixel da conta do Stiven (auditoria 28/07/2026). Com token
// configurado e pixel ausente, os eventos — que carregam dados pessoais
// hasheados dos leads — iriam para um pixel de terceiro, sem aviso nenhum.
describe('meta capi — pixel obrigatório', () => {
  it('pula o envio quando o ID do pixel não está configurado', async () => {
    delete process.env.NEXT_PUBLIC_META_PIXEL_ID
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.resetModules()

    const { sendMetaCapiEvent } = await import('./meta-capi')
    const r = await sendMetaCapiEvent({
      eventName: 'Lead', eventId: 'e1', nome: 'Ana Silva', telefone: '48999999999',
    })

    expect(r).toEqual({ ok: false, skipped: true })
    expect(fetchMock, 'não pode chamar a Graph API sem pixel definido').not.toHaveBeenCalled()
  })

  it('nunca usa um ID de pixel embutido no código', async () => {
    delete process.env.NEXT_PUBLIC_META_PIXEL_ID
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    vi.stubGlobal('fetch', fetchMock)
    vi.resetModules()

    const { sendMetaCapiEvent } = await import('./meta-capi')
    await sendMetaCapiEvent({ eventName: 'Lead', eventId: 'e2', nome: 'Bruno', telefone: '48988888888' })

    const urlsChamadas = fetchMock.mock.calls.map((c) => String(c[0])).join(' ')
    expect(urlsChamadas).not.toContain('364836344657445')
  })
})
