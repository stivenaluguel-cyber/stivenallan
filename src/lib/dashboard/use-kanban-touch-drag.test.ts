import { describe, expect, it } from 'vitest'
import { passoAutoscroll, virouRolagem } from './use-kanban-touch-drag'

describe('virouRolagem', () => {
  it('tremor do dedo parado não cancela o toque longo', () => {
    // Ninguém segura o dedo imóvel. Se 3px cancelassem, o arraste por toque
    // quase nunca começaria.
    expect(virouRolagem({ x: 100, y: 200 }, { x: 103, y: 197 })).toBe(false)
  })

  it('deslize vertical é rolagem da lista de cards', () => {
    expect(virouRolagem({ x: 100, y: 200 }, { x: 101, y: 240 })).toBe(true)
  })

  it('deslize horizontal é rolagem das colunas', () => {
    expect(virouRolagem({ x: 100, y: 200 }, { x: 160, y: 202 })).toBe(true)
  })
})

describe('passoAutoscroll', () => {
  const borda = { left: 0, right: 390 } // largura útil de um iPhone

  it('no meio da tela as colunas ficam paradas', () => {
    expect(passoAutoscroll(195, borda)).toBe(0)
  })

  it('dedo na borda esquerda traz as colunas anteriores', () => {
    expect(passoAutoscroll(20, borda)).toBeLessThan(0)
  })

  it('dedo na borda direita traz as colunas seguintes', () => {
    expect(passoAutoscroll(370, borda)).toBeGreaterThan(0)
  })

  it('a margem é medida a partir da borda do scroller, não da janela', () => {
    // O Kanban não começa em x=0 no desktop (a sidebar ocupa 236px). Medir
    // pela janela faria o auto-scroll disparar com o dedo no meio da lista.
    const deslocado = { left: 236, right: 1280 }
    expect(passoAutoscroll(250, deslocado)).toBeLessThan(0)
    expect(passoAutoscroll(250, borda)).toBe(0)
  })
})
