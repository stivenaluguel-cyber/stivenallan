import { describe, expect, it } from 'vitest'
import { validarCadenciaEmail, validarCadenciaWhatsapp } from './validacao'

describe('validarCadenciaWhatsapp', () => {
  it('sem erros quando tudo preenchido corretamente', () => {
    const erros = validarCadenciaWhatsapp(
      [{ ordem: 0, dias: 1 }],
      [{ estagio_funil: 'primeiro_contato', ordem: 0, mensagem: 'Oi {nome}!' }],
    )
    expect(erros).toEqual([])
  })

  it('array de intervalos ou mensagens vazio — erro único, cron pararia de enviar', () => {
    expect(validarCadenciaWhatsapp([], [{ estagio_funil: 'x', ordem: 0, mensagem: 'oi' }])).toHaveLength(1)
    expect(validarCadenciaWhatsapp([{ ordem: 0, dias: 1 }], [])).toHaveLength(1)
  })

  it('mensagem individual vazia é rejeitada mesmo com o array não-vazio — bug original', () => {
    const erros = validarCadenciaWhatsapp(
      [{ ordem: 0, dias: 1 }],
      [
        { estagio_funil: 'qualificado', ordem: 0, mensagem: 'Oi {nome}' },
        { estagio_funil: 'qualificado', ordem: 1, mensagem: '   ' }, // só espaço
      ],
    )
    expect(erros.some((e) => e.includes('Mensagem 1'))).toBe(true)
  })

  it('intervalo menor que 1 dia é rejeitado', () => {
    const erros = validarCadenciaWhatsapp(
      [{ ordem: 0, dias: 0 }],
      [{ estagio_funil: 'x', ordem: 0, mensagem: 'oi' }],
    )
    expect(erros.some((e) => e.includes('Passo 0'))).toBe(true)
  })
})

describe('validarCadenciaEmail', () => {
  it('sem erros quando tudo preenchido', () => {
    const erros = validarCadenciaEmail([{ ordem: 0, dias_minimos: 2, assunto: 'Oi', corpo_html: '<p>Oi</p>' }])
    expect(erros).toEqual([])
  })

  it('array vazio — erro único', () => {
    expect(validarCadenciaEmail([])).toHaveLength(1)
  })

  it('assunto ou corpo vazio em um passo específico é rejeitado', () => {
    const erros = validarCadenciaEmail([
      { ordem: 0, dias_minimos: 2, assunto: '', corpo_html: '<p>Oi</p>' },
      { ordem: 1, dias_minimos: 7, assunto: 'Oi', corpo_html: '   ' },
    ])
    expect(erros.some((e) => e.includes('Passo 0') && e.includes('assunto'))).toBe(true)
    expect(erros.some((e) => e.includes('Passo 1') && e.includes('corpo'))).toBe(true)
  })

  it('dias_minimos negativo é rejeitado', () => {
    const erros = validarCadenciaEmail([{ ordem: 0, dias_minimos: -1, assunto: 'Oi', corpo_html: '<p>Oi</p>' }])
    expect(erros.some((e) => e.includes('dias mínimos'))).toBe(true)
  })
})
