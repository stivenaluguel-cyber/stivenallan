import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { automacaoProativaAtiva, podeEnviarAutomatico } from './whatsapp-envio-limite'

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

describe('automacaoProativaAtiva', () => {
  const original = process.env.FOLLOWUP_AUTOMATICO_ATIVO

  afterEach(() => {
    if (original === undefined) delete process.env.FOLLOWUP_AUTOMATICO_ATIVO
    else process.env.FOLLOWUP_AUTOMATICO_ATIVO = original
  })

  it('desligada quando a env var está ausente — fail-closed por padrão', () => {
    delete process.env.FOLLOWUP_AUTOMATICO_ATIVO
    expect(automacaoProativaAtiva()).toBe(false)
  })

  it('ligada só com a string exata "true"', () => {
    process.env.FOLLOWUP_AUTOMATICO_ATIVO = 'true'
    expect(automacaoProativaAtiva()).toBe(true)
  })

  it('qualquer outro valor conta como desligado (typo não liga por acidente)', () => {
    for (const valor of ['1', 'TRUE', 'yes', 'false', '']) {
      process.env.FOLLOWUP_AUTOMATICO_ATIVO = valor
      expect(automacaoProativaAtiva()).toBe(false)
    }
  })
})
