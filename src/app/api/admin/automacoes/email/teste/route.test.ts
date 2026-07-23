import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { authHolder } = vi.hoisted(() => ({
  authHolder: { autenticado: true },
}))

vi.mock('@/lib/dashboard/auth-check', () => ({
  autenticado: async () => authHolder.autenticado,
}))

import { POST } from './route'

function makeReq(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest
}

describe('POST /api/admin/automacoes/email/teste', () => {
  beforeEach(() => {
    authHolder.autenticado = true
    process.env.RESEND_API_KEY = 'resend-key'
    process.env.RESEND_FROM = 'onboarding@example.com'
  })
  afterEach(() => {
    delete process.env.RESEND_API_KEY
    delete process.env.RESEND_FROM
    vi.restoreAllMocks()
  })

  it('401 se não autenticado', async () => {
    authHolder.autenticado = false
    const res = await POST(makeReq({ email: 'a@a.com', assunto: 'Oi', corpo_html: '<p>Oi</p>' }))
    expect(res.status).toBe(401)
  })

  it('503 quando Resend não está configurado', async () => {
    delete process.env.RESEND_FROM
    const res = await POST(makeReq({ email: 'a@a.com', assunto: 'Oi', corpo_html: '<p>Oi</p>' }))
    expect(res.status).toBe(503)
  })

  it('400 quando e-mail é inválido', async () => {
    const res = await POST(makeReq({ email: 'nao-e-email', assunto: 'Oi', corpo_html: '<p>Oi</p>' }))
    expect(res.status).toBe(400)
  })

  it('400 quando assunto ou corpo_html vêm vazios', async () => {
    const res = await POST(makeReq({ email: 'a@a.com', assunto: '', corpo_html: '<p>Oi</p>' }))
    expect(res.status).toBe(400)
  })

  it('envia com assunto prefixado [TESTE] e placeholders substituídos', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'msg-1' }), { status: 200 }),
    )
    const res = await POST(makeReq({ email: 'a@a.com', assunto: 'Oi {nome}', corpo_html: '<p>{empreendimento}</p>' }))
    expect(res.status).toBe(200)

    const [, opts] = fetchSpy.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(opts.body as string)
    expect(body.subject).toBe('[TESTE] Oi Teste')
    expect(body.html).toContain('nosso empreendimento')
  })

  it('502 quando o Resend recusa o envio', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response('erro', { status: 422 }))
    const res = await POST(makeReq({ email: 'a@a.com', assunto: 'Oi', corpo_html: '<p>Oi</p>' }))
    expect(res.status).toBe(502)
  })
})
