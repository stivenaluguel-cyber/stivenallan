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

  // Regressão de PII: `mensagem` (texto real do lead) vai no corpo da
  // chamada pro LLM externo — um erro de validação de conteúdo de uma API
  // OpenAI-compatível pode ecoar um trecho do que foi enviado na mensagem
  // do erro. O log não pode repassar isso, só o tipo do erro.
  it('erro da API externa ecoando o conteúdo enviado: não vaza o texto do lead no log, só o tipo do erro', async () => {
    const errorSpy = vi.spyOn(console, 'error')
    const mensagem = 'Meu CPF é 123.456.789-00 e quero o apartamento'
    openaiHolder.create.mockRejectedValue(new Error(`content policy violation for input: "${mensagem}"`))
    const { classificarSentimento } = await import('./sentimento')

    const resultado = await classificarSentimento(mensagem)

    expect(resultado).toBe('neutro')
    const textoLogado = errorSpy.mock.calls.flat().map(String).join(' | ')
    expect(textoLogado).not.toContain(mensagem)
    expect(textoLogado).not.toContain('123.456.789-00')
    expect(textoLogado).toContain('"errorTipo":"Error"')
    expect(textoLogado).toContain('"mensagemLength":' + mensagem.length)
  })
})
