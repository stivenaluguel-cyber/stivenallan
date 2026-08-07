import { describe, expect, it, vi, afterEach } from 'vitest'
import { performDashboardLogout } from './layout'

afterEach(() => vi.restoreAllMocks())

describe('performDashboardLogout', () => {
  it('sucesso: chama POST /api/auth/logout, limpa sessionStorage e navega para /dashboard/login', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(null, { status: 200 }))))
    const push = vi.fn()

    const result = await performDashboardLogout({ push })

    expect(fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
    expect(push).toHaveBeenCalledWith('/dashboard/login')
    expect(result).toEqual({ ok: true })
  })

  it('erro de rede: NAO limpa sessao, NAO redireciona e reporta falha para permitir nova tentativa', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network error'))))
    const push = vi.fn()

    const result = await performDashboardLogout({ push })

    expect(push).not.toHaveBeenCalled()
    expect(result.ok).toBe(false)
    expect(result.ok === false && result.erro).toBeTruthy()
  })

  it('resposta HTTP nao-2xx (ex.: 500): trata como falha, NAO considera logout concluido', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(null, { status: 500 }))))
    const push = vi.fn()

    const result = await performDashboardLogout({ push })

    expect(push).not.toHaveBeenCalled()
    expect(result.ok).toBe(false)
    expect(result.ok === false && result.erro).toBeTruthy()
  })

  it('resposta HTTP 401: trata como falha, NAO considera logout concluido', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(null, { status: 401 }))))
    const push = vi.fn()

    const result = await performDashboardLogout({ push })

    expect(push).not.toHaveBeenCalled()
    expect(result.ok).toBe(false)
  })
})
