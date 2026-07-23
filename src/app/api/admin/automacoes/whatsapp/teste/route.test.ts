import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { authHolder, evolutionHolder } = vi.hoisted(() => ({
  authHolder: { autenticado: true },
  evolutionHolder: {
    enviarFollowUp: vi.fn(async (para: string, texto: string) => {
      void para; void texto
      return true
    }),
  },
}))

vi.mock('@/lib/dashboard/auth-check', () => ({
  autenticado: async () => authHolder.autenticado,
}))

vi.mock('@/lib/evolution', () => ({
  enviarFollowUp: (para: string, texto: string) => evolutionHolder.enviarFollowUp(para, texto),
}))

import { POST } from './route'

function makeReq(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest
}

describe('POST /api/admin/automacoes/whatsapp/teste', () => {
  beforeEach(() => {
    authHolder.autenticado = true
    process.env.EVOLUTION_API_URL = 'http://evo.local'
    process.env.EVOLUTION_API_KEY = 'evo-key'
    process.env.EVOLUTION_INSTANCE = 'stiven'
    evolutionHolder.enviarFollowUp.mockClear()
  })
  afterEach(() => {
    delete process.env.EVOLUTION_API_URL
    delete process.env.EVOLUTION_API_KEY
    delete process.env.EVOLUTION_INSTANCE
    vi.restoreAllMocks()
  })

  it('401 se não autenticado', async () => {
    authHolder.autenticado = false
    const res = await POST(makeReq({ numero: '48999999999', mensagem: 'oi' }))
    expect(res.status).toBe(401)
  })

  it('503 quando a Evolution API não está configurada', async () => {
    delete process.env.EVOLUTION_API_URL
    const res = await POST(makeReq({ numero: '48999999999', mensagem: 'oi' }))
    expect(res.status).toBe(503)
    expect(evolutionHolder.enviarFollowUp).not.toHaveBeenCalled()
  })

  it('400 quando numero ou mensagem vêm vazios', async () => {
    const res = await POST(makeReq({ numero: '', mensagem: 'oi' }))
    expect(res.status).toBe(400)
  })

  it('substitui os placeholders e envia via enviarFollowUp', async () => {
    const res = await POST(makeReq({ numero: '48999999999', mensagem: 'Oi {nome}, veja o {empreendimento}!' }))
    expect(res.status).toBe(200)
    expect(evolutionHolder.enviarFollowUp).toHaveBeenCalledWith('48999999999', 'Oi Teste, veja o nosso empreendimento!')
  })

  it('502 quando o envio falha', async () => {
    evolutionHolder.enviarFollowUp.mockResolvedValueOnce(false)
    const res = await POST(makeReq({ numero: '48999999999', mensagem: 'oi' }))
    expect(res.status).toBe(502)
  })
})
