import { describe, expect, it } from 'vitest'
import { INITIAL_RUNNER_STATE, applyFailure, applySuccess, beginRetryKey } from './focus-action-runner'

describe('beginRetryKey', () => {
  it('retorna null quando não há falha pendente', () => {
    expect(beginRetryKey(INITIAL_RUNNER_STATE)).toBeNull()
  })

  it('retorna a key da última falha registrada', () => {
    const state = applyFailure('followup:lead-1')
    expect(beginRetryKey(state)).toBe('followup:lead-1')
  })
})

describe('fluxo completo: falha -> retry -> sucesso -> nova ação', () => {
  it('sucesso limpa o estado de retry pendente', () => {
    let state = applyFailure('perdido:lead-1')
    expect(beginRetryKey(state)).toBe('perdido:lead-1')

    state = applySuccess()
    expect(beginRetryKey(state)).toBeNull()
  })

  it('uma nova falha substitui a key pendente anterior', () => {
    let state = applyFailure('nota:lead-1')
    state = applyFailure('nota:lead-2')
    expect(beginRetryKey(state)).toBe('nota:lead-2')
  })
})
