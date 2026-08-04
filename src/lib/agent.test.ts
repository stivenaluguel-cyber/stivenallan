import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { createHolder, buscaHolder } = vi.hoisted(() => ({
  createHolder: vi.fn(),
  buscaHolder: { buscar: vi.fn(async (..._args: unknown[]) => [] as { id: string; pergunta: string; resposta: string }[]) },
}))

vi.mock('openai', () => ({
  default: class {
    chat = { completions: { create: (...args: unknown[]) => createHolder(...args) } }
  },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({}),
}))

vi.mock('@/lib/leads/base-conhecimento', async () => {
  const actual = await vi.importActual<typeof import('./leads/base-conhecimento')>('./leads/base-conhecimento')
  return {
    buscarConhecimentoRelevante: (...args: unknown[]) => buscaHolder.buscar(...args),
    montarBlocoContexto: actual.montarBlocoContexto,
  }
})

beforeEach(() => {
  createHolder.mockReset().mockResolvedValue({
    choices: [{ finish_reason: 'stop', message: { content: 'resposta padrão' } }],
  })
  buscaHolder.buscar.mockReset().mockResolvedValue([])
  process.env.OPENAI_API_KEY = 'test-key'
})

afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.OPENAI_API_KEY
})

describe('processarMensagem — integração com a base de conhecimento (RAG leve)', () => {
  it('busca conhecimento relevante usando a mensagem do lead', async () => {
    const { processarMensagem } = await import('./agent')
    await processarMensagem('5548999999999', 'vocês aceitam financiamento direto?')

    expect(buscaHolder.buscar).toHaveBeenCalledTimes(1)
    expect(buscaHolder.buscar.mock.calls[0][1]).toBe('vocês aceitam financiamento direto?')
  })

  it('quando há conhecimento relevante, injeta o bloco de contexto no system prompt SEM substituir o prompt base', async () => {
    buscaHolder.buscar.mockResolvedValue([{ id: '1', pergunta: 'Aceita financiamento?', resposta: 'Sim, direto com a construtora.' }])
    const { processarMensagem } = await import('./agent')
    await processarMensagem('5548999999999', 'aceita financiamento?')

    const chamada = createHolder.mock.calls[0][0] as { messages: Array<{ role: string; content: string }> }
    const systemMsg = chamada.messages.find((m) => m.role === 'system')
    expect(systemMsg?.content).toContain('Voce e Allan IA') // prompt base preservado
    expect(systemMsg?.content).toContain('CONTEXTO DE ATENDIMENTOS ANTERIORES')
    expect(systemMsg?.content).toContain('Sim, direto com a construtora.')
  })

  it('quando não há conhecimento relevante, o system prompt fica igual ao original (sem bloco extra)', async () => {
    buscaHolder.buscar.mockResolvedValue([])
    const { processarMensagem } = await import('./agent')
    await processarMensagem('5548999999999', 'oi')

    const chamada = createHolder.mock.calls[0][0] as { messages: Array<{ role: string; content: string }> }
    const systemMsg = chamada.messages.find((m) => m.role === 'system')
    expect(systemMsg?.content).not.toContain('CONTEXTO DE ATENDIMENTOS ANTERIORES')
  })

  it('retorna a resposta final normalmente quando o modelo não chama nenhuma tool', async () => {
    const { processarMensagem } = await import('./agent')
    const resposta = await processarMensagem('5548999999999', 'oi')
    expect(resposta).toBe('resposta padrão')
  })
})
