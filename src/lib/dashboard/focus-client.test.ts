import { afterEach, describe, expect, it, vi } from 'vitest'
import { salvarNota } from './focus-client'

afterEach(() => { vi.restoreAllMocks() })

describe('salvarNota — anotação atômica (sem lost update)', () => {
  it('faz UM POST de inserção, sem ler-e-reescrever o histórico inteiro', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'n1', created_at: '2026-07-28T12:00:00Z', descricao: 'nota nova' }, alreadyExists: false }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await salvarNota('lead-1', 'nota nova', '00000000-0000-4000-8000-000000000001')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/leads/lead-1/anotacoes')
    expect(init.method).toBe('POST')
    // A garantia central: o corpo carrega só o texto da nota nova — nunca o
    // array inteiro de anotações. É isso que impede sobrescrever a nota que
    // outra aba criou entre a leitura e a escrita.
    const body = JSON.parse(init.body)
    expect(body).toEqual({ texto: 'nota nova', clientEventId: '00000000-0000-4000-8000-000000000001' })
  })

  it('nota concorrente de outra aba não é perdida: cada uma é um POST independente', async () => {
    const recebidos: string[] = []
    const fetchMock = vi.fn().mockImplementation((_url: string, init: { body: string }) => {
      recebidos.push(JSON.parse(init.body).texto)
      return Promise.resolve({ ok: true, json: async () => ({ data: { id: 'x' }, alreadyExists: false }) })
    })
    vi.stubGlobal('fetch', fetchMock)

    await Promise.all([
      salvarNota('lead-1', 'nota da aba A', '00000000-0000-4000-8000-00000000000a'),
      salvarNota('lead-1', 'nota da aba B', '00000000-0000-4000-8000-00000000000b'),
    ])

    expect(recebidos).toHaveLength(2)
    expect(recebidos).toContain('nota da aba A')
    expect(recebidos).toContain('nota da aba B')
  })

  it('retry com o mesmo clientEventId devolve alreadyExists sem criar duplicata', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'n1', created_at: '2026-07-28T12:00:00Z', descricao: 'nota' }, alreadyExists: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const r = await salvarNota('lead-1', 'nota', '00000000-0000-4000-8000-000000000001')
    expect(r.alreadyExists).toBe(true)
  })

  it('propaga erro do servidor em vez de fingir sucesso', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({ error: 'falhou' }) }))
    await expect(salvarNota('lead-1', 'nota', '00000000-0000-4000-8000-000000000001')).rejects.toThrow('falhou')
  })
})
