import { describe, expect, it } from 'vitest'
import { planejarEnvioWhatsapp, type LeadDaFila } from './fila'

function lead(overrides: Partial<LeadDaFila> = {}): LeadDaFila {
  return { id: 'lead-1', status: 'novo', score: 50, ...overrides }
}

describe('planejarEnvioWhatsapp', () => {
  it('avança pro próximo lead "novo" de maior score, pulando o lead atual', () => {
    const atual = lead({ id: 'atual', score: 90 })
    const leads = [
      atual,
      lead({ id: 'baixo', score: 40 }),
      lead({ id: 'alto', score: 75 }),
      lead({ id: 'medio', score: 60 }),
    ]

    const plano = planejarEnvioWhatsapp(leads, atual)

    expect(plano.avancar).toBe(true)
    expect(plano).toMatchObject({ avancar: true, proximoLead: { id: 'alto' } })
  })

  it('ignora leads que não estão "novo" ao escolher o próximo', () => {
    const atual = lead({ id: 'atual' })
    const leads = [
      atual,
      lead({ id: 'contatado', score: 100, status: 'contatado' }),
      lead({ id: 'ignorado', score: 99, status: 'ignorado' }),
      lead({ id: 'promovido', score: 98, status: 'promovido' }),
      lead({ id: 'unico-novo', score: 10, status: 'novo' }),
    ]

    const plano = planejarEnvioWhatsapp(leads, atual)

    expect(plano).toMatchObject({ avancar: true, proximoLead: { id: 'unico-novo' } })
  })

  it('trata score null como 0 — mesma regra de ordenação da coluna do Kanban', () => {
    const atual = lead({ id: 'atual' })
    const leads = [atual, lead({ id: 'sem-score', score: null }), lead({ id: 'score-baixo', score: 1 })]

    const plano = planejarEnvioWhatsapp(leads, atual)

    expect(plano).toMatchObject({ avancar: true, proximoLead: { id: 'score-baixo' } })
  })

  it('fila zerada: sem nenhum outro lead "novo", devolve proximoLead null (quem chama fecha o modal)', () => {
    const atual = lead({ id: 'atual' })
    const leads = [atual, lead({ id: 'contatado', status: 'contatado' })]

    const plano = planejarEnvioWhatsapp(leads, atual)

    expect(plano).toEqual({ avancar: true, proximoLead: null })
  })

  it('fila zerada quando o lead atual é o único da campanha', () => {
    const atual = lead({ id: 'atual' })

    const plano = planejarEnvioWhatsapp([atual], atual)

    expect(plano).toEqual({ avancar: true, proximoLead: null })
  })

  it('lead atual não está "novo" (reaberto da coluna Contatado, por exemplo) — não avança', () => {
    const atual = lead({ id: 'atual', status: 'contatado' })
    const leads = [atual, lead({ id: 'outro-novo', score: 100 })]

    const plano = planejarEnvioWhatsapp(leads, atual)

    expect(plano).toEqual({ avancar: false })
  })
})
