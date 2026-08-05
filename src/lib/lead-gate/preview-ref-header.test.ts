import { afterEach, describe, expect, it } from 'vitest'
import { PREVIEW_SUPABASE_REF_HEADER, previewSupabaseRefHeaders } from './preview-ref-header'

const ORIGINAL = {
  VERCEL_ENV: process.env.VERCEL_ENV,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
}

afterEach(() => {
  process.env.VERCEL_ENV = ORIGINAL.VERCEL_ENV
  process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL.NEXT_PUBLIC_SUPABASE_URL
})

describe('previewSupabaseRefHeaders', () => {
  it('expoe somente o project ref quando VERCEL_ENV=preview', () => {
    process.env.VERCEL_ENV = 'preview'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://pauvicgtaqgulwdxwcgf.supabase.co'
    const headers = previewSupabaseRefHeaders()
    expect(headers).toEqual({ [PREVIEW_SUPABASE_REF_HEADER]: 'pauvicgtaqgulwdxwcgf' })
    expect(Object.values(headers).join('')).not.toContain('supabase.co')
  })

  it('nunca inclui o header fora de preview, mesmo com URL valida', () => {
    process.env.VERCEL_ENV = 'production'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://xpkznaqgctfkoonqpcye.supabase.co'
    expect(previewSupabaseRefHeaders()).toEqual({})
  })

  it('nunca inclui o header quando VERCEL_ENV esta ausente (dev local)', () => {
    delete process.env.VERCEL_ENV
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://pauvicgtaqgulwdxwcgf.supabase.co'
    expect(previewSupabaseRefHeaders()).toEqual({})
  })

  it('URL ausente em preview nao lanca erro e nao inclui o header', () => {
    process.env.VERCEL_ENV = 'preview'
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    expect(() => previewSupabaseRefHeaders()).not.toThrow()
    expect(previewSupabaseRefHeaders()).toEqual({})
  })

  it('URL invalida em preview nao lanca erro e nao inclui o header', () => {
    process.env.VERCEL_ENV = 'preview'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'nao-e-uma-url'
    expect(() => previewSupabaseRefHeaders()).not.toThrow()
    expect(previewSupabaseRefHeaders()).toEqual({})
  })

  it('nunca retorna a anon key nem a service role, so o ref', () => {
    process.env.VERCEL_ENV = 'preview'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://pauvicgtaqgulwdxwcgf.supabase.co'
    const headers = previewSupabaseRefHeaders()
    const values = Object.values(headers)
    expect(values).toHaveLength(1)
    expect(values[0]).toBe('pauvicgtaqgulwdxwcgf')
  })
})
