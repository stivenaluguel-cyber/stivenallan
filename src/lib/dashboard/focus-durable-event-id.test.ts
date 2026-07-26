import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearDurableEventId, getOrCreateDurableEventId } from './focus-durable-event-id'

// vitest.config.ts roda em ambiente 'node' (sem window/sessionStorage reais)
// — simulamos sessionStorage com um Map, o suficiente pra testar a
// persistência entre "montagens" (reload = nova chamada, mesmo storage).
function fakeSessionStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v) },
    removeItem: (k: string) => { store.delete(k) },
    store,
  }
}

describe('getOrCreateDurableEventId', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { sessionStorage: fakeSessionStorage() })
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('gera um id novo na primeira chamada para uma chave', () => {
    const gen = vi.fn(() => 'id-1')
    const id = getOrCreateDurableEventId('followup:lead-1', gen)
    expect(id).toBe('id-1')
    expect(gen).toHaveBeenCalledTimes(1)
  })

  it('retry sem reload: chamadas seguintes com a MESMA chave reaproveitam o mesmo id', () => {
    const gen = vi.fn(() => 'id-1')
    const primeira = getOrCreateDurableEventId('followup:lead-1', gen)
    const segunda = getOrCreateDurableEventId('followup:lead-1', gen)
    expect(segunda).toBe(primeira)
    expect(gen).toHaveBeenCalledTimes(1) // não gerou de novo
  })

  it('retry APÓS "reconstrução do runner" (nova chamada simulando reload): reaproveita o id persistido', () => {
    // Simula: usuário clica "Follow-up" (gera id-1, sessionStorage grava) →
    // a chamada falha → a página RECARREGA (o "runner" em memória é
    // recriado do zero, mas sessionStorage sobrevive) → usuário clica de
    // novo. Como não há nenhum estado em memória aqui, isso é literalmente
    // uma chamada "fria" à função — e ainda assim ela recupera o id certo.
    const genOriginal = () => 'id-original'
    getOrCreateDurableEventId('followup:lead-1', genOriginal)

    const genPosReload = vi.fn(() => 'id-novo-pos-reload')
    const idReutilizado = getOrCreateDurableEventId('followup:lead-1', genPosReload)

    expect(idReutilizado).toBe('id-original')
    expect(genPosReload).not.toHaveBeenCalled()
  })

  it('mesma ação legítima realizada de novo, após clear(), recebe um UUID novo', () => {
    const gen1 = () => 'id-1'
    getOrCreateDurableEventId('nota:lead-1', gen1)
    clearDurableEventId('nota:lead-1') // ação anterior confirmada com sucesso

    const gen2 = vi.fn(() => 'id-2')
    const novoId = getOrCreateDurableEventId('nota:lead-1', gen2)
    expect(novoId).toBe('id-2')
    expect(gen2).toHaveBeenCalledTimes(1)
  })

  it('chaves diferentes (leads ou ações diferentes) nunca colidem', () => {
    const idA = getOrCreateDurableEventId('followup:lead-1', () => 'id-a')
    const idB = getOrCreateDurableEventId('followup:lead-2', () => 'id-b')
    const idC = getOrCreateDurableEventId('perdido:lead-1', () => 'id-c')
    expect(new Set([idA, idB, idC]).size).toBe(3)
  })

  it('sem window (SSR) cai para gerar um id novo sempre, sem quebrar', () => {
    vi.unstubAllGlobals() // remove o window fake, simulando ambiente sem DOM
    const gen = vi.fn(() => 'ssr-id')
    expect(getOrCreateDurableEventId('followup:lead-1', gen)).toBe('ssr-id')
  })
})
