import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { openaiHolder } = vi.hoisted(() => ({
  openaiHolder: { create: vi.fn() },
}))

vi.mock('@/lib/agent', () => ({
  getOpenAI: () => ({ chat: { completions: { create: openaiHolder.create } } }),
}))

beforeEach(() => {
  openaiHolder.create.mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('classificarSentimento', () => {
  it('retorna o sentimento classificado pelo modelo', async () => {
    openaiHolder.create.mockResolvedValue({ choices: [{ message: { content: 'urgente' } }] })
    const { classificarSentimento } = await import('./sentimento')

    expect(await classificarSentimento('preciso de resposta AGORA, já é a terceira vez que pergunto')).toBe('urgente')
  })

  it('aceita a resposta do modelo com espaço/maiúscula/pontuação ao redor', async () => {
    openaiHolder.create.mockResolvedValue({ choices: [{ message: { content: ' Positivo.\n' } }] })
    const { classificarSentimento } = await import('./sentimento')

    expect(await classificarSentimento('adorei o apartamento, vamos fechar!')).toBe('positivo')
  })

  it('cai em neutro quando o modelo devolve algo fora da lista esperada', async () => {
    openaiHolder.create.mockResolvedValue({ choices: [{ message: { content: 'nao sei' } }] })
    const { classificarSentimento } = await import('./sentimento')

    expect(await classificarSentimento('oi')).toBe('neutro')
  })

  it('cai em neutro quando a chamada ao modelo falha — nunca derruba o fluxo principal', async () => {
    openaiHolder.create.mockRejectedValue(new Error('timeout'))
    const { classificarSentimento } = await import('./sentimento')

    expect(await classificarSentimento('mensagem qualquer')).toBe('neutro')
  })

  it('mensagem vazia retorna neutro sem chamar o modelo', async () => {
    const { classificarSentimento } = await import('./sentimento')

    expect(await classificarSentimento('   ')).toBe('neutro')
    expect(openaiHolder.create).not.toHaveBeenCalled()
  })
})
