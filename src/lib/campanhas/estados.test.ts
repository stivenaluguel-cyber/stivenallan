import { describe, expect, it } from 'vitest'
import { classificarEnvioCampanha, editavel, podeAgendar, podeCancelar } from './estados'

describe('classificarEnvioCampanha', () => {
  it('enviada quando não há erros', () => {
    expect(classificarEnvioCampanha({ enviados: 10, erros_envio: 0 })).toBe('enviada')
  })

  it('parcial quando enviou algo mas teve erro — não pode ficar indistinguível de "enviada"', () => {
    expect(classificarEnvioCampanha({ enviados: 7, erros_envio: 3 })).toBe('parcial')
  })

  it('erro quando não enviou nada e teve falha', () => {
    expect(classificarEnvioCampanha({ enviados: 0, erros_envio: 5 })).toBe('erro')
  })
})

describe('editavel', () => {
  it('só rascunho é editável', () => {
    expect(editavel('rascunho')).toBe(true)
    expect(editavel('enviando')).toBe(false)
    expect(editavel('enviada')).toBe(false)
    expect(editavel('agendada')).toBe(false)
  })
})

describe('podeAgendar', () => {
  it('rascunho e agendada permitem alterar o agendamento', () => {
    expect(podeAgendar('rascunho')).toBe(true)
    expect(podeAgendar('agendada')).toBe(true)
    expect(podeAgendar('enviando')).toBe(false)
    expect(podeAgendar('enviada')).toBe(false)
    expect(podeAgendar('cancelada')).toBe(false)
  })
})

describe('podeCancelar', () => {
  it('só antes de começar a enviar de verdade', () => {
    expect(podeCancelar('rascunho')).toBe(true)
    expect(podeCancelar('agendada')).toBe(true)
    expect(podeCancelar('enviando')).toBe(false)
    expect(podeCancelar('enviada')).toBe(false)
    expect(podeCancelar('parcial')).toBe(false)
  })
})
