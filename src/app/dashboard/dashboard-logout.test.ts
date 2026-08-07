import { describe, expect, it, vi, afterEach } from 'vitest'
import { performDashboardLogout } from './layout'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

// Vitest roda sem jsdom aqui (ambiente Node puro) — `window`/`sessionStorage`
// nao existem como globals por padrao. performDashboardLogout le esses
// identificadores soltos (resolvidos via globalThis), entao precisamos
// instalar stubs minimos pra exercitar o `sessionStorage.clear()` real e
// poder afirmar quando ele e (ou nao e) chamado.
function stubBrowserGlobals() {
  const sessionStorageMock = { clear: vi.fn() }
  vi.stubGlobal('window', {})
  vi.stubGlobal('sessionStorage', sessionStorageMock)
  return sessionStorageMock
}

describe('performDashboardLogout', () => {
  it('sucesso: chama POST /api/auth/logout, limpa sessionStorage exatamente uma vez e navega para /dashboard/login', async () => {
    const sessionStorageMock = stubBrowserGlobals()
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(null, { status: 200 }))))
    const push = vi.fn()

    const result = await performDashboardLogout({ push })

    expect(fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
    expect(sessionStorageMock.clear).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledWith('/dashboard/login')
    expect(result).toEqual({ ok: true })
  })

  it('erro de rede: NAO limpa sessao, NAO redireciona e reporta falha para permitir nova tentativa', async () => {
    const sessionStorageMock = stubBrowserGlobals()
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network error'))))
    const push = vi.fn()

    const result = await performDashboardLogout({ push })

    expect(sessionStorageMock.clear).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
    expect(result.ok).toBe(false)
    expect(result.ok === false && result.erro).toBeTruthy()
  })

  it('resposta HTTP nao-2xx (ex.: 500): trata como falha, NAO considera logout concluido', async () => {
    const sessionStorageMock = stubBrowserGlobals()
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(null, { status: 500 }))))
    const push = vi.fn()

    const result = await performDashboardLogout({ push })

    expect(sessionStorageMock.clear).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
    expect(result.ok).toBe(false)
    expect(result.ok === false && result.erro).toBeTruthy()
  })

  it('resposta HTTP 401: trata como falha, NAO considera logout concluido', async () => {
    const sessionStorageMock = stubBrowserGlobals()
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(null, { status: 401 }))))
    const push = vi.fn()

    const result = await performDashboardLogout({ push })

    expect(sessionStorageMock.clear).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
    expect(result.ok).toBe(false)
  })
})
