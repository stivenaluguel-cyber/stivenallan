import { afterEach, describe, expect, it, vi } from 'vitest'

const { createBrowserClientMock } = vi.hoisted(() => ({
  createBrowserClientMock: vi.fn(() => ({ __client: true })),
}))

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: createBrowserClientMock,
}))

import { createClient } from './client'

describe('lib/supabase/client', () => {
  const ORIGINAL_ENV = { ...process.env }

  afterEach(() => {
    vi.clearAllMocks()
    process.env = { ...ORIGINAL_ENV }
  })

  it('cria o browser client com a URL e a anon key publicas', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://exemplo.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-fake'

    createClient()

    expect(createBrowserClientMock).toHaveBeenCalledWith('https://exemplo.supabase.co', 'anon-key-fake')
  })

  it('sem env publica: repassa undefined ao @supabase/ssr (comportamento atual, sem guarda defensiva)', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    createClient()

    expect(createBrowserClientMock).toHaveBeenCalledWith(undefined, undefined)
  })
})
