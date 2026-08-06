import { describe, it, expect } from 'vitest'
import { executarComLimiteConcorrencia } from './pool'

function tarefaComContador() {
  let atual = 0
  let pico = 0
  const fn = async (item: number) => {
    atual++
    pico = Math.max(pico, atual)
    await new Promise((r) => setTimeout(r, 5))
    atual--
    return item * 2
  }
  return { fn, pico: () => pico }
}

describe('executarComLimiteConcorrencia', () => {
  it('nunca roda mais tarefas simultâneas do que o limite configurado', async () => {
    const { fn, pico } = tarefaComContador()
    await executarComLimiteConcorrencia([1, 2, 3, 4, 5, 6, 7, 8], 3, fn)
    expect(pico()).toBeLessThanOrEqual(3)
    expect(pico()).toBeGreaterThan(1) // prova que rodou em paralelo, não sequencial
  })

  it('satura até o limite quando há itens suficientes', async () => {
    const { fn, pico } = tarefaComContador()
    await executarComLimiteConcorrencia(Array.from({ length: 20 }, (_, i) => i), 4, fn)
    expect(pico()).toBe(4)
  })

  it('com menos itens que o limite, roda no máximo len(itens) em paralelo', async () => {
    const { fn, pico } = tarefaComContador()
    await executarComLimiteConcorrencia([1, 2], 10, fn)
    expect(pico()).toBe(2)
  })

  it('devolve os resultados na mesma ordem dos itens de entrada, mesmo terminando fora de ordem', async () => {
    const atrasos = [30, 5, 20, 1]
    const r = await executarComLimiteConcorrencia(atrasos, 4, async (ms, i) => {
      await new Promise((res) => setTimeout(res, ms))
      return i
    })
    expect(r).toEqual([0, 1, 2, 3])
  })

  it('lista vazia não quebra e devolve lista vazia', async () => {
    const r = await executarComLimiteConcorrencia<number, number>([], 5, async (x) => x)
    expect(r).toEqual([])
  })

  it('limite <= 0 ainda processa (piso de 1 trabalhador), não trava', async () => {
    const r = await executarComLimiteConcorrencia([1, 2, 3], 0, async (x) => x * 10)
    expect(r).toEqual([10, 20, 30])
  })
})
