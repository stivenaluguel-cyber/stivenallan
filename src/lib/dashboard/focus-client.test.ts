import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { appendNota, salvarNotaIdempotente } from './focus-client'

describe('appendNota', () => {
  it('prepend uma nota nova, preservando as anteriores', () => {
    const anteriores = JSON.stringify([{ data: '2026-01-01T00:00:00.000Z', texto: 'nota antiga' }])
    const resultado = JSON.parse(appendNota(anteriores, 'nota nova'))
    expect(resultado).toHaveLength(2)
    expect(resultado[0].texto).toBe('nota nova')
    expect(resultado[1].texto).toBe('nota antiga')
  })

  it('embute clientEventId na nota quando fornecido, sem quebrar o shape esperado por outros leitores', () => {
    const resultado = JSON.parse(appendNota(null, 'texto', 'evt-1'))
    expect(resultado[0]).toMatchObject({ texto: 'texto', clientEventId: 'evt-1' })
    expect(typeof resultado[0].data).toBe('string')
  })
})

describe('salvarNotaIdempotente', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  function mockGetLead(anotacoes: string | null) {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: string, init?: RequestInit) => {
      if (!init || init.method === undefined) {
        // GET /api/admin/leads/{id}
        return { ok: true, json: async () => ({ data: { id: 'lead-1', anotacoes } }) }
      }
      // PATCH /api/admin/leads/{id}
      return { ok: true, json: async () => ({ data: { id: 'lead-1' } }) }
    })
  }

  it('busca o lead FRESCO do servidor e acrescenta a nota quando o client_event_id ainda não existe', async () => {
    mockGetLead(null)
    const resultado = await salvarNotaIdempotente('lead-1', 'primeira nota', 'evt-1')
    const notas = JSON.parse(resultado)
    expect(notas).toHaveLength(1)
    expect(notas[0]).toMatchObject({ texto: 'primeira nota', clientEventId: 'evt-1' })

    // Confirma que o PATCH foi de fato chamado (persistiu).
    const patchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(patchCall).toBeTruthy()
  })

  it('retry após reload: se uma nota com este client_event_id JÁ existe (persistida antes da falha seguinte), não duplica', async () => {
    const anotacoesComNotaJaSalva = JSON.stringify([{ data: '2026-07-26T10:00:00.000Z', texto: 'nota que já foi salva', clientEventId: 'evt-1' }])
    mockGetLead(anotacoesComNotaJaSalva)

    const resultado = await salvarNotaIdempotente('lead-1', 'nota que já foi salva', 'evt-1')
    const notas = JSON.parse(resultado)
    expect(notas).toHaveLength(1) // não duplicou

    // Não deve ter chamado PATCH — a nota já estava lá, nada a persistir de novo.
    const patchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(patchCall).toBeUndefined()
  })

  it('repetição legítima: uma SEGUNDA nota real (client_event_id diferente) é acrescentada normalmente', async () => {
    const anotacoesComPrimeiraNota = JSON.stringify([{ data: '2026-07-26T10:00:00.000Z', texto: 'primeira nota', clientEventId: 'evt-1' }])
    mockGetLead(anotacoesComPrimeiraNota)

    const resultado = await salvarNotaIdempotente('lead-1', 'segunda nota, de verdade nova', 'evt-2')
    const notas = JSON.parse(resultado)
    expect(notas).toHaveLength(2)
    expect(notas[0]).toMatchObject({ texto: 'segunda nota, de verdade nova', clientEventId: 'evt-2' })
    expect(notas[1]).toMatchObject({ texto: 'primeira nota', clientEventId: 'evt-1' })
  })
})
