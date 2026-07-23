import { describe, expect, it } from 'vitest'
import { dentroDoHorarioPermitido } from './horario'

// 12:00 em America/Sao_Paulo (UTC-3, sem horário de verão desde 2019) → 15:00Z
const MEIO_DIA_BR = new Date('2026-07-23T15:00:00.000Z')
// 03:00 em America/Sao_Paulo → 06:00Z
const MADRUGADA_BR = new Date('2026-07-23T06:00:00.000Z')
// 23:30 em America/Sao_Paulo → 02:30Z do dia seguinte
const NOITE_BR = new Date('2026-07-24T02:30:00.000Z')

describe('dentroDoHorarioPermitido', () => {
  it('meio-dia está dentro da janela padrão 08:00–20:00', () => {
    expect(dentroDoHorarioPermitido(MEIO_DIA_BR, '08:00', '20:00')).toBe(true)
  })

  it('madrugada está fora da janela padrão 08:00–20:00', () => {
    expect(dentroDoHorarioPermitido(MADRUGADA_BR, '08:00', '20:00')).toBe(false)
  })

  it('nos limites exatos (início e fim) conta como dentro', () => {
    expect(dentroDoHorarioPermitido(MEIO_DIA_BR, '12:00', '20:00')).toBe(true)
    expect(dentroDoHorarioPermitido(MEIO_DIA_BR, '08:00', '12:00')).toBe(true)
  })

  it('janela que atravessa a meia-noite (ex. 22:00–06:00)', () => {
    expect(dentroDoHorarioPermitido(NOITE_BR, '22:00', '06:00')).toBe(true)
    expect(dentroDoHorarioPermitido(MADRUGADA_BR, '22:00', '06:00')).toBe(true)
    expect(dentroDoHorarioPermitido(MEIO_DIA_BR, '22:00', '06:00')).toBe(false)
  })
})
