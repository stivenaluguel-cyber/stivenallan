import { afterEach, describe, expect, it, vi } from 'vitest'

// Tipo local minimo do 3o argumento de createServerClient (as opcoes de
// cookies) so pra dar ao mock a mesma assinatura de 3 parametros do real —
// sem isso o TS infere um mock sem args e `.mock.calls[0]` vira uma tupla
// vazia.
type ServerClientCookieOptions = {
  cookies: {
    getAll: () => { name: string; value: string }[]
    setAll: (cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) => void
  }
}

const { createServerClientMock, cookieStoreMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn((_url: string, _key: string, _options: ServerClientCookieOptions) => ({ __client: true })),
  cookieStoreMock: {
    getAll: vi.fn(() => [{ name: 'sb-token', value: 'abc' }]),
    set: vi.fn(),
  },
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: createServerClientMock,
}))

vi.mock('next/headers', () => ({
  cookies: async () => cookieStoreMock,
}))

import { createClient } from './server'

describe('lib/supabase/server', () => {
  const ORIGINAL_ENV = { ...process.env }

  afterEach(() => {
    vi.clearAllMocks()
    cookieStoreMock.set.mockReset()
    process.env = { ...ORIGINAL_ENV }
  })

  it('cria o server client com URL/anon key publicas e getAll delega ao cookie store', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://exemplo.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-fake'

    await createClient()

    expect(createServerClientMock).toHaveBeenCalledTimes(1)
    const [url, key, options] = createServerClientMock.mock.calls[0]
    expect(url).toBe('https://exemplo.supabase.co')
    expect(key).toBe('anon-key-fake')

    expect(options.cookies.getAll()).toEqual([{ name: 'sb-token', value: 'abc' }])
    expect(cookieStoreMock.getAll).toHaveBeenCalledTimes(1)
  })

  it('setAll grava cada cookie recebido no cookie store, com nome/valor/options corretos', async () => {
    await createClient()

    const options = createServerClientMock.mock.calls.at(-1)![2]
    options.cookies.setAll([
      { name: 'a', value: '1', options: {} },
      { name: 'b', value: '2', options: { path: '/' } },
    ])

    expect(cookieStoreMock.set).toHaveBeenCalledWith('a', '1', {})
    expect(cookieStoreMock.set).toHaveBeenCalledWith('b', '2', { path: '/' })
  })

  it('setAll engole erro de cookieStore.set (Server Component sem permissão de escrita) sem lançar', async () => {
    cookieStoreMock.set.mockImplementation(() => {
      throw new Error('cannot set cookies in a Server Component')
    })

    await createClient()

    const options = createServerClientMock.mock.calls.at(-1)![2]
    expect(() => options.cookies.setAll([{ name: 'a', value: '1', options: {} }])).not.toThrow()
  })
})
