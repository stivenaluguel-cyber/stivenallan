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

let errorSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

function textoLogado(): string {
  return errorSpy.mock.calls.flat().map(String).join(' | ')
}

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

  // Regressão de PII: `pergunta` (texto do lead) vira o termo de um
  // tsquery — em caso de erro de sintaxe, o Postgres pode ecoar o termo
  // recebido na mensagem/details do erro. O log não pode repassar isso.
  it('erro do Postgres ecoando o termo de busca (tsquery malformado): não vaza o texto do lead, só o code', async () => {
    const mensagem = 'Meu CPF é 123.456.789-00 e quero o apartamento'
    const { supabase } = fakeSupabase(null, {
      code: '42601',
      message: `syntax error in tsquery: "${mensagem}"`,
      details: null,
    })

    const resultado = await buscarConhecimentoRelevante(supabase, mensagem)

    expect(resultado).toEqual([])
    expect(textoLogado()).not.toContain(mensagem)
    expect(textoLogado()).not.toContain('123.456.789-00')
    expect(textoLogado()).toContain('42601')
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
