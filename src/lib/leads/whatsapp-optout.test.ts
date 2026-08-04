import { describe, expect, it } from 'vitest'
import { detectarPalavraChaveOptOut } from './whatsapp-optout'

describe('detectarPalavraChaveOptOut', () => {
  it.each(['parar', 'PARAR', 'Pare', 'stop', 'Stop!', 'sair', 'cancelar', 'chega'])(
    'detecta "%s" como pedido de opt-out',
    (texto) => {
      expect(detectarPalavraChaveOptOut(texto)).toBe(true)
    },
  )

  it('detecta com acento e pontuação', () => {
    expect(detectarPalavraChaveOptOut('pára.')).toBe(true)
  })

  it('NÃO detecta a palavra dentro de uma frase longa (falso positivo)', () => {
    expect(detectarPalavraChaveOptOut('não quero parar de ver os apartamentos, me manda mais')).toBe(false)
  })

  it('NÃO detecta mensagem comum de interesse', () => {
    expect(detectarPalavraChaveOptOut('Oi, gostaria de saber mais sobre o empreendimento')).toBe(false)
  })

  it('NÃO detecta string vazia', () => {
    expect(detectarPalavraChaveOptOut('')).toBe(false)
    expect(detectarPalavraChaveOptOut('   ')).toBe(false)
  })

  it('detecta frase curta de opt-out com múltiplas palavras', () => {
    expect(detectarPalavraChaveOptOut('não quero mais')).toBe(true)
  })
})
