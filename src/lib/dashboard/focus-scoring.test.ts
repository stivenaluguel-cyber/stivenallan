import { describe, expect, it } from 'vitest'
import { FOCUS_POINTS, pointsForAction, resolveTrustedNextStage } from './focus-scoring'

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
