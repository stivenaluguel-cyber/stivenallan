import { describe, expect, it } from 'vitest'
import { extrairFaixaNumerica, extrairInteiro } from './specs'

describe('extrairFaixaNumerica', () => {
  it('extrai min e max de uma faixa "93 a 94"', () => {
    expect(extrairFaixaNumerica('93 a 94')).toEqual({ min: 93, max: 94 })
  })

  it('lida com separador de milhar BR ("850 a 1.369")', () => {
    expect(extrairFaixaNumerica('850 a 1.369')).toEqual({ min: 850, max: 1369 })
  })

  it('valor único vira min=max', () => {
    expect(extrairFaixaNumerica('172')).toEqual({ min: 172, max: 172 })
  })

  it('string vazia ou nula não inventa número', () => {
    expect(extrairFaixaNumerica(undefined)).toEqual({})
    expect(extrairFaixaNumerica(null)).toEqual({})
    expect(extrairFaixaNumerica('')).toEqual({})
  })

  it('texto sem número não inventa número', () => {
    expect(extrairFaixaNumerica('sob consulta')).toEqual({})
  })
})

describe('extrairInteiro', () => {
  it('pega o primeiro número de uma string', () => {
    expect(extrairInteiro('3')).toBe(3)
    expect(extrairInteiro('2 vagas')).toBe(2)
  })

  it('ausente não inventa número', () => {
    expect(extrairInteiro(undefined)).toBeUndefined()
    expect(extrairInteiro('')).toBeUndefined()
  })
})
