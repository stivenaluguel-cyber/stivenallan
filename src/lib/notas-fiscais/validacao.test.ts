import { describe, it, expect } from 'vitest'
import {
  validarCompetencia, competenciaParaData, dataParaCompetencia,
  validarValor, validarNumero, validarArquivoPdf, TAMANHO_MAXIMO_PDF_BYTES,
} from './validacao'

describe('validarCompetencia', () => {
  it('aceita YYYY-MM válido', () => {
    expect(validarCompetencia('2026-08').ok).toBe(true)
  })
  it('rejeita formato errado', () => {
    expect(validarCompetencia('08/2026').ok).toBe(false)
    expect(validarCompetencia('2026-8').ok).toBe(false)
    expect(validarCompetencia('').ok).toBe(false)
  })
  it('rejeita mês inválido', () => {
    expect(validarCompetencia('2026-00').ok).toBe(false)
    expect(validarCompetencia('2026-13').ok).toBe(false)
  })
  it('rejeita ano fora de faixa razoável', () => {
    expect(validarCompetencia('1999-01').ok).toBe(false)
  })
})

describe('conversão de competência', () => {
  it('YYYY-MM vira YYYY-MM-01 e volta', () => {
    expect(competenciaParaData('2026-08')).toBe('2026-08-01')
    expect(dataParaCompetencia('2026-08-01')).toBe('2026-08')
  })
})

describe('validarValor', () => {
  it('aceita positivo', () => { expect(validarValor(0.01).ok).toBe(true) })
  it('rejeita zero, negativo, NaN, infinito', () => {
    expect(validarValor(0).ok).toBe(false)
    expect(validarValor(-10).ok).toBe(false)
    expect(validarValor(NaN).ok).toBe(false)
    expect(validarValor(Infinity).ok).toBe(false)
  })
})

describe('validarNumero', () => {
  it('rejeita vazio/só espaço', () => {
    expect(validarNumero('').ok).toBe(false)
    expect(validarNumero('   ').ok).toBe(false)
  })
  it('aceita número normal', () => { expect(validarNumero('NF-001').ok).toBe(true) })
})

describe('validarArquivoPdf', () => {
  it('aceita PDF dentro do limite', () => {
    expect(validarArquivoPdf('application/pdf', 1000).ok).toBe(true)
  })
  it('rejeita mime que não é PDF', () => {
    expect(validarArquivoPdf('image/png', 1000).ok).toBe(false)
  })
  it('rejeita acima de 10MB, aceita exatamente no limite', () => {
    expect(validarArquivoPdf('application/pdf', TAMANHO_MAXIMO_PDF_BYTES + 1).ok).toBe(false)
    expect(validarArquivoPdf('application/pdf', TAMANHO_MAXIMO_PDF_BYTES).ok).toBe(true)
  })
  it('rejeita arquivo vazio', () => {
    expect(validarArquivoPdf('application/pdf', 0).ok).toBe(false)
  })
})
