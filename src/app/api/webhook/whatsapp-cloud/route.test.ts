import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'
import { GET, POST } from './route'

const VERIFY_TOKEN = 'verify-token-de-teste'
const APP_SECRET = 'app-secret-de-teste'
const BASE_URL = 'https://stivenallan.com.br/api/webhook/whatsapp-cloud'

function assinar(rawBody: string, secret = APP_SECRET): string {
  return 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex')
}

function makeGetReq(params: Record<string, string>): NextRequest {
  const url = new URL(BASE_URL)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return { url: url.toString() } as unknown as NextRequest
}

function makePostReq(rawBody: string, headers: Record<string, string> = {}): NextRequest {
  return {
    headers: new Headers(headers),
    text: async () => rawBody,
  } as unknown as NextRequest
}

const PAYLOAD_MENSAGEM = JSON.stringify({
  entry: [
    {
      id: '102290129340398',
      changes: [
        {
          value: {
            metadata: { phone_number_id: '106540352242922' },
            messages: [{ from: '16315551234', id: 'wamid.ABC123', timestamp: '1603059201', type: 'text', text: { body: 'Olá, tudo bem?' } }],
          },
          field: 'messages',
        },
      ],
    },
  ],
})

describe('GET /api/webhook/whatsapp-cloud — handshake', () => {
  beforeEach(() => {
    process.env.META_WEBHOOK_VERIFY_TOKEN = VERIFY_TOKEN
  })
  afterEach(() => {
    delete process.env.META_WEBHOOK_VERIFY_TOKEN
  })

  it('200 e devolve o hub.challenge quando mode e verify_token batem', async () => {
    const res = await GET(makeGetReq({ 'hub.mode': 'subscribe', 'hub.verify_token': VERIFY_TOKEN, 'hub.challenge': 'desafio-123' }))
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('desafio-123')
  })

  it('403 quando o verify_token não bate', async () => {
    const res = await GET(makeGetReq({ 'hub.mode': 'subscribe', 'hub.verify_token': 'token-errado', 'hub.challenge': 'desafio-123' }))
    expect(res.status).toBe(403)
  })

  it('403 quando hub.mode não é "subscribe"', async () => {
    const res = await GET(makeGetReq({ 'hub.mode': 'unsubscribe', 'hub.verify_token': VERIFY_TOKEN, 'hub.challenge': 'desafio-123' }))
    expect(res.status).toBe(403)
  })

  it('503 quando META_WEBHOOK_VERIFY_TOKEN não está configurado', async () => {
    delete process.env.META_WEBHOOK_VERIFY_TOKEN
    const res = await GET(makeGetReq({ 'hub.mode': 'subscribe', 'hub.verify_token': 'qualquer', 'hub.challenge': 'x' }))
    expect(res.status).toBe(503)
  })
})

describe('POST /api/webhook/whatsapp-cloud — assinatura e log', () => {
  beforeEach(() => {
    process.env.META_APP_SECRET = APP_SECRET
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    delete process.env.META_APP_SECRET
    vi.restoreAllMocks()
  })

  it('200 e loga a mensagem recebida quando a assinatura é válida', async () => {
    const logSpy = vi.spyOn(console, 'log')
    const res = await POST(makePostReq(PAYLOAD_MENSAGEM, { 'x-hub-signature-256': assinar(PAYLOAD_MENSAGEM) }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(logSpy).toHaveBeenCalledTimes(1)
    const linhaLogada = logSpy.mock.calls[0][0] as string
    const log = JSON.parse(linhaLogada)
    expect(log).toMatchObject({ source: 'webhook/whatsapp-cloud', wamid: 'wamid.ABC123', phoneNumberId: '106540352242922', textoLength: 14 })
  })

  it('nunca loga o telefone (from) nem o texto da mensagem — só ids opacos e contagens', async () => {
    const logSpy = vi.spyOn(console, 'log')
    await POST(makePostReq(PAYLOAD_MENSAGEM, { 'x-hub-signature-256': assinar(PAYLOAD_MENSAGEM) }))

    const textoLogado = logSpy.mock.calls.flat().map(String).join(' | ')
    expect(textoLogado).not.toContain('16315551234')
    expect(textoLogado).not.toContain('Olá, tudo bem?')
  })

  it('401 quando a assinatura é inválida — não processa nem loga a mensagem', async () => {
    const logSpy = vi.spyOn(console, 'log')
    const res = await POST(makePostReq(PAYLOAD_MENSAGEM, { 'x-hub-signature-256': 'sha256=' + 'a'.repeat(64) }))

    expect(res.status).toBe(401)
    expect(logSpy).not.toHaveBeenCalled()
  })

  it('401 quando o header x-hub-signature-256 está ausente', async () => {
    const res = await POST(makePostReq(PAYLOAD_MENSAGEM, {}))
    expect(res.status).toBe(401)
  })

  it('401 quando o corpo foi alterado depois de assinado', async () => {
    const assinatura = assinar(PAYLOAD_MENSAGEM)
    const res = await POST(makePostReq(PAYLOAD_MENSAGEM + 'x', { 'x-hub-signature-256': assinatura }))
    expect(res.status).toBe(401)
  })

  it('400 quando o corpo (já com assinatura válida) não é JSON válido', async () => {
    const rawBody = 'nao-e-json'
    const res = await POST(makePostReq(rawBody, { 'x-hub-signature-256': assinar(rawBody) }))
    expect(res.status).toBe(400)
  })

  it('200 sem log quando o payload é válido mas não traz mensagem de texto (ex: callback de status)', async () => {
    const payloadStatus = JSON.stringify({
      entry: [{ id: 'x', changes: [{ value: { metadata: { phone_number_id: '106540352242922' }, statuses: [{ id: 'wamid.STATUS', status: 'delivered' }] }, field: 'messages' }] }],
    })
    const logSpy = vi.spyOn(console, 'log')
    const res = await POST(makePostReq(payloadStatus, { 'x-hub-signature-256': assinar(payloadStatus) }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(logSpy).not.toHaveBeenCalled()
  })

  it('503 quando META_APP_SECRET não está configurado', async () => {
    delete process.env.META_APP_SECRET
    const res = await POST(makePostReq(PAYLOAD_MENSAGEM, { 'x-hub-signature-256': assinar(PAYLOAD_MENSAGEM) }))
    expect(res.status).toBe(503)
  })
})
