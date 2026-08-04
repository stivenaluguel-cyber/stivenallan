import { describe, expect, it } from 'vitest'
import { podeEnviarAutomatico } from './whatsapp-envio-limite'

function fakeSupabase(count: number | null, error: unknown = null) {
  return {
    from: () => ({
      select: () => ({
        eq: function () { return this },
        gte: async () => ({ count, error }),
      }),
    }),
  } as unknown as import('@supabase/supabase-js').SupabaseClient
}

describe('podeEnviarAutomatico', () => {
  it('permite quando a contagem das últimas 24h está abaixo do limite', async () => {
    const supabase = fakeSupabase(3)
    expect(await podeEnviarAutomatico(supabase, 'lead-1', 8)).toBe(true)
  })

  it('bloqueia quando a contagem atinge o limite', async () => {
    const supabase = fakeSupabase(8)
    expect(await podeEnviarAutomatico(supabase, 'lead-1', 8)).toBe(false)
  })

  it('bloqueia quando a contagem passa do limite', async () => {
    const supabase = fakeSupabase(12)
    expect(await podeEnviarAutomatico(supabase, 'lead-1', 8)).toBe(false)
  })

  it('falha aberta (permite) quando a query dá erro — não pode travar atendimento real', async () => {
    const supabase = fakeSupabase(null, new Error('timeout'))
    expect(await podeEnviarAutomatico(supabase, 'lead-1', 8)).toBe(true)
  })

  it('count nulo sem erro conta como zero — permite', async () => {
    const supabase = fakeSupabase(null)
    expect(await podeEnviarAutomatico(supabase, 'lead-1', 8)).toBe(true)
  })
})
