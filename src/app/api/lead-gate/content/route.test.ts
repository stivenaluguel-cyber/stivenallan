import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  lookup: vi.fn(),
  getConteudo: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({}) }))
vi.mock('@/lib/lead-gate/session-lookup', () => ({ lookupSessionByToken: mocks.lookup }))
vi.mock('@/lib/lead-gate/conteudo-restrito', () => ({
  getConteudoRestrito: mocks.getConteudo,
}))

import { GET } from './route'
import { __resetForTests as resetRateLimit } from '@/lib/leads/rate-limit'

const SLUG = 'parco-savello-santa-barbara-criciuma-sc'

function request(slug: string, bloco = 'plantas', token?: string) {
  const headers = token ? { cookie: `sa_session=${token}` } : undefined
  return new NextRequest(`http://localhost/api/lead-gate/content?slug=${slug}&bloco=${bloco}`, { headers })
}

describe('GET /api/lead-gate/content', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    process.env.LEAD_GATE_ENABLED = 'true'
    process.env.LEAD_GATE_SLUGS = SLUG
    resetRateLimit()
    mocks.lookup.mockReset()
    mocks.getConteudo.mockReset()
    mocks.getConteudo.mockReturnValue([{ src: 'https://example.invalid/planta.jpg' }])
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sem cookie responde 401 e nunca consulta conteúdo', async () => {
    const response = await GET(request(SLUG))
    expect(response.status).toBe(401)
    expect(mocks.lookup).not.toHaveBeenCalled()
    expect(mocks.getConteudo).not.toHaveBeenCalled()
  })

  it('cookie inválido recebe o mesmo 401 para slug válido e inválido', async () => {
    mocks.lookup.mockResolvedValue({ status: 'invalid' })
    const valido = await GET(request(SLUG, 'plantas', 'token-lixo-1'))
    const invalido = await GET(request('slug-que-nao-existe', 'plantas', 'token-lixo-2'))
    expect(valido.status).toBe(401)
    expect(invalido.status).toBe(401)
    expect(await valido.json()).toEqual(await invalido.json())
    expect(mocks.getConteudo).not.toHaveBeenCalled()
  })

  it('só diferencia slug depois de autenticar a sessão', async () => {
    mocks.lookup.mockResolvedValue({ status: 'valid', sessionId: 's1', leadId: 'l1', lastSeenAt: new Date().toISOString() })
    const response = await GET(request('slug-que-nao-existe', 'plantas', 'token-valido'))
    expect(response.status).toBe(404)
    expect(mocks.lookup).toHaveBeenCalledTimes(1)
  })

  it('sessão válida recebe conteúdo privado sem cache compartilhado', async () => {
    mocks.lookup.mockResolvedValue({ status: 'valid', sessionId: 's1', leadId: 'l1', lastSeenAt: new Date().toISOString() })
    const response = await GET(request(SLUG, 'plantas', 'token-valido'))
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('private')
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(response.headers.get('vary')).toContain('Cookie')
    expect((await response.json()).itens).toHaveLength(1)
  })
})
