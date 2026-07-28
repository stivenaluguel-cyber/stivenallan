import { describe, expect, it } from 'vitest'
import {
  FOCUS_POINTS,
  FOCUS_ACTIONS_SOMENTE_SERVIDOR,
  FOCUS_PRIMARY_ACTIONS,
  FOCUS_SKIP_ACTIONS,
  pointsForAction,
  resolveTrustedNextStage,
  targetStatusForAction,
} from './focus-scoring'

describe('pointsForAction', () => {
  it('retorna o peso configurado para cada ação simples', () => {
    expect(pointsForAction('pular')).toBe(0)
    expect(pointsForAction('perdido')).toBe(FOCUS_POINTS.perdido)
    expect(pointsForAction('followup_agendado')).toBe(FOCUS_POINTS.followup_agendado)
    expect(pointsForAction('visita_concluida')).toBe(FOCUS_POINTS.visita_concluida)
  })

  it('etapa_alterada não pontua quando o destino não é fechado', () => {
    expect(pointsForAction('etapa_alterada', { nextStage: 'negociacao' })).toBe(0)
    expect(pointsForAction('etapa_alterada')).toBe(0)
  })

  it('etapa_alterada pontua como "fechado" quando o destino é o estágio fechado', () => {
    expect(pointsForAction('etapa_alterada', { nextStage: 'fechado' })).toBe(FOCUS_POINTS.fechado)
  })
})

describe('resolveTrustedNextStage — fronteira de confiança contra pontuação sem persistência', () => {
  it('para etapa_alterada, IGNORA o nextStage do cliente e usa o estagio_funil real do lead', () => {
    // Um cliente malicioso/comprometido tenta afirmar nextStage='fechado'
    // sem o lead ter sido fechado de verdade (estagio_funil real ainda é
    // 'negociacao') — a função deve devolver o valor REAL, não o forjado.
    expect(resolveTrustedNextStage('etapa_alterada', 'negociacao', 'fechado')).toBe('negociacao')
  })

  it('para etapa_alterada, quando o lead REALMENTE está fechado no banco, confirma fechado', () => {
    expect(resolveTrustedNextStage('etapa_alterada', 'fechado', 'fechado')).toBe('fechado')
  })

  it('para etapa_alterada, mesmo se o cliente mentir sobre outro estágio, o real prevalece', () => {
    expect(resolveTrustedNextStage('etapa_alterada', 'qualificado', 'fechado')).toBe('qualificado')
  })

  it('para outras ações (perdido, followup_agendado...), o valor do cliente é só informativo e é mantido', () => {
    expect(resolveTrustedNextStage('perdido', 'negociacao', 'perdido')).toBe('perdido')
    expect(resolveTrustedNextStage('followup_agendado', 'qualificado', null)).toBeNull()
  })

  it('composição com pointsForAction: forjar nextStage não rende os 100 pontos de fechado', () => {
    const nextStageConfiavel = resolveTrustedNextStage('etapa_alterada', 'negociacao', 'fechado')
    expect(pointsForAction('etapa_alterada', { nextStage: nextStageConfiavel })).toBe(0)
  })
})

describe('ações restritas ao fluxo real (sem pontuação avulsa)', () => {
  it('proposta_enviada não pode ser registrada pelo endpoint público de eventos', () => {
    // 25 pontos só valem se existir uma proposta de verdade — o registro
    // vem do fluxo que cria a proposta, nunca de um POST direto.
    expect(FOCUS_ACTIONS_SOMENTE_SERVIDOR.has('proposta_enviada')).toBe(true)
  })

  it('as demais ações continuam disponíveis pela tela', () => {
    for (const acao of ['pular', 'perdido', 'anotacao', 'followup_agendado', 'adiado'] as const) {
      expect(FOCUS_ACTIONS_SOMENTE_SERVIDOR.has(acao)).toBe(false)
    }
  })
})

describe('targetStatusForAction', () => {
  it('mapeia cada ação primária para o status certo do item na fila', () => {
    expect(targetStatusForAction('pular')).toBe('pulado')
    expect(targetStatusForAction('adiado')).toBe('adiado')
    expect(targetStatusForAction('followup_agendado')).toBe('processado')
    expect(targetStatusForAction('perdido')).toBe('processado')
    expect(targetStatusForAction('visita_concluida')).toBe('processado')
  })

  it('ação secundária não altera o status do item', () => {
    expect(targetStatusForAction('anotacao')).toBeNull()
    expect(targetStatusForAction('contato_confirmado')).toBeNull()
    expect(targetStatusForAction('etapa_alterada')).toBeNull()
  })
})

describe('adiar', () => {
  it('é ação primária (tira o lead da fila) mas não conta como "pulado" nem pontua', () => {
    expect(FOCUS_PRIMARY_ACTIONS.has('adiado')).toBe(true)
    expect(FOCUS_SKIP_ACTIONS.has('adiado')).toBe(false)
    expect(pointsForAction('adiado')).toBe(0)
  })
})
