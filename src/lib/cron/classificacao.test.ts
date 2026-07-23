import { describe, expect, it } from 'vitest'
import { classificarExecucao, motivoResumido } from './classificacao'

describe('classificarExecucao', () => {
  it('classifica como ok quando não há nenhum erro de envio', () => {
    expect(classificarExecucao({ enviados: 5, erros_envio: 0 })).toBe('ok')
  })

  it('classifica como ok quando a run não processou nada (0 tentativas)', () => {
    expect(classificarExecucao({ enviados: 0, erros_envio: 0 })).toBe('ok')
  })

  it('classifica como partial quando enviou algo mas também teve erro — reproduz o bug relatado', () => {
    // "status ok, zero enviados, dois erros" e "100% sucesso com 10 erros" eram
    // exatamente esse caso: enviados>0 e erros_envio>0 marcados como 'ok'.
    expect(classificarExecucao({ enviados: 3, erros_envio: 2 })).toBe('partial')
  })

  it('classifica como error quando todos os envios falharam', () => {
    expect(classificarExecucao({ enviados: 0, erros_envio: 2 })).toBe('error')
  })

  it('classifica como error mesmo com um único erro e zero sucesso', () => {
    expect(classificarExecucao({ enviados: 0, erros_envio: 1 })).toBe('error')
  })
})

describe('motivoResumido', () => {
  it('não gera motivo quando status é ok', () => {
    expect(motivoResumido('ok', { enviados: 5, erros_envio: 0 })).toBeUndefined()
  })

  it('resume parcial com contagem de falhas sobre o total', () => {
    expect(motivoResumido('partial', { enviados: 3, erros_envio: 2 })).toBe('2 de 5 envio(s) falharam')
  })

  it('resume falha total', () => {
    expect(motivoResumido('error', { enviados: 0, erros_envio: 4 })).toBe('todos os 4 envio(s) falharam')
  })
})
