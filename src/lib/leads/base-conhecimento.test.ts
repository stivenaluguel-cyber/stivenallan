import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buscarConhecimentoRelevante, montarBlocoContexto } from './base-conhecimento'

function fakeSupabase(data: unknown, error: unknown = null) {
  const calls: { method: string; args: unknown[] }[] = []
  const chain: Record<string, unknown> = {}
  ;['select', 'eq', 'textSearch'].forEach((method) => {
    chain[method] = (...args: unknown[]) => {
      calls.push({ method, args })
      return chain
    }
  })
  chain.limit = async (...args: unknown[]) => {
    calls.push({ method: 'limit', args })
    return { data, error }
  }

  return {
    calls,
    supabase: {
      from: () => chain,
    } as unknown as import('@supabase/supabase-js').SupabaseClient,
  }
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('buscarConhecimentoRelevante', () => {
  it('retorna as entradas encontradas', async () => {
    const { supabase } = fakeSupabase([{ id: '1', pergunta: 'Aceita financiamento?', resposta: 'Sim, direto com a construtora.' }])
    const resultado = await buscarConhecimentoRelevante(supabase, 'vocês aceitam financiamento?')
    expect(resultado).toHaveLength(1)
    expect(resultado[0].resposta).toBe('Sim, direto com a construtora.')
  })

  it('filtra só aprovado=true e ativo=true antes de buscar', async () => {
    const { supabase, calls } = fakeSupabase([])
    await buscarConhecimentoRelevante(supabase, 'oi')
    const eqCalls = calls.filter((c) => c.method === 'eq').map((c) => c.args)
    expect(eqCalls).toContainEqual(['aprovado', true])
    expect(eqCalls).toContainEqual(['ativo', true])
  })

  it('mensagem vazia retorna [] sem consultar o banco', async () => {
    const { supabase, calls } = fakeSupabase([{ id: '1', pergunta: 'x', resposta: 'y' }])
    const resultado = await buscarConhecimentoRelevante(supabase, '   ')
    expect(resultado).toEqual([])
    expect(calls).toHaveLength(0)
  })

  it('retorna [] (nunca lança) quando a query dá erro', async () => {
    const { supabase } = fakeSupabase(null, new Error('timeout'))
    const resultado = await buscarConhecimentoRelevante(supabase, 'oi')
    expect(resultado).toEqual([])
  })
})

describe('montarBlocoContexto', () => {
  it('retorna string vazia quando não há entradas', () => {
    expect(montarBlocoContexto([])).toBe('')
  })

  it('monta o bloco numerado com pergunta e resposta', () => {
    const bloco = montarBlocoContexto([
      { id: '1', pergunta: 'Tem vaga de garagem?', resposta: 'Sim, uma vaga inclusa.' },
    ])
    expect(bloco).toContain('CONTEXTO DE ATENDIMENTOS ANTERIORES')
    expect(bloco).toContain('P: Tem vaga de garagem?')
    expect(bloco).toContain('R: Sim, uma vaga inclusa.')
  })
})
