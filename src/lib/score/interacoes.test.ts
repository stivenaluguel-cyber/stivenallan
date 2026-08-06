import { describe, it, expect } from 'vitest'
import { isFollowUpAtivo, TIPOS_FOLLOWUP_ATIVO } from './interacoes'

describe('isFollowUpAtivo', () => {
  it('conta nota e proposta', () => {
    expect(isFollowUpAtivo('nota')).toBe(true)
    expect(isFollowUpAtivo('proposta')).toBe(true)
  })

  it('não conta simulação, reserva, mudança de estágio automática ou proposta aceita', () => {
    expect(isFollowUpAtivo('simulacao')).toBe(false)
    expect(isFollowUpAtivo('reserva')).toBe(false)
    expect(isFollowUpAtivo('status_change')).toBe(false)
    expect(isFollowUpAtivo('proposta_aceita')).toBe(false)
  })

  it('trata tipo desconhecido como não-contato (allowlist, não denylist)', () => {
    expect(isFollowUpAtivo('qualquer_coisa_nova')).toBe(false)
  })

  it('TIPOS_FOLLOWUP_ATIVO é a lista canônica usada nas RPCs', () => {
    expect(TIPOS_FOLLOWUP_ATIVO).toEqual(['nota', 'proposta'])
  })
})
