import { describe, expect, it } from 'vitest'
import { vgvPorEstagio, type LeadStageRow } from './funil-stats'

describe('vgvPorEstagio', () => {
  it('soma orcamento_max por estágio, não conta leads', () => {
    const leads: LeadStageRow[] = [
      { id: '1', estagio_funil: 'qualificado', orcamento_max: 300_000 },
      { id: '2', estagio_funil: 'qualificado', orcamento_max: 500_000 },
      { id: '3', estagio_funil: 'proposta_enviada', orcamento_max: 800_000 },
    ]
    const resultado = vgvPorEstagio(leads)

    expect(resultado.find((r) => r.key === 'qualificado')?.vgv).toBe(800_000)
    expect(resultado.find((r) => r.key === 'proposta_enviada')?.vgv).toBe(800_000)
  })

  it('lead sem orcamento_max conta como zero, não quebra a soma', () => {
    const leads: LeadStageRow[] = [
      { id: '1', estagio_funil: 'qualificado', orcamento_max: null },
      { id: '2', estagio_funil: 'qualificado' },
    ]
    const resultado = vgvPorEstagio(leads)
    expect(resultado.find((r) => r.key === 'qualificado')?.vgv).toBe(0)
  })

  it('estagio_funil desconhecido cai em "outros", não desaparece nem quebra', () => {
    const leads: LeadStageRow[] = [{ id: '1', estagio_funil: 'estagio_que_nao_existe', orcamento_max: 100_000 }]
    const resultado = vgvPorEstagio(leads)
    expect(resultado.find((r) => r.key === 'outros')?.vgv).toBe(100_000)
  })

  it('calcula pct sobre o total de VGV, não sobre contagem de leads', () => {
    const leads: LeadStageRow[] = [
      { id: '1', estagio_funil: 'qualificado', orcamento_max: 750_000 },
      { id: '2', estagio_funil: 'proposta_enviada', orcamento_max: 250_000 },
    ]
    const resultado = vgvPorEstagio(leads)
    expect(resultado.find((r) => r.key === 'qualificado')?.pct).toBe(75)
    expect(resultado.find((r) => r.key === 'proposta_enviada')?.pct).toBe(25)
  })

  it('sem nenhum lead, todos os estágios ficam com vgv e pct zero (sem NaN)', () => {
    const resultado = vgvPorEstagio([])
    expect(resultado.every((r) => r.vgv === 0 && r.pct === 0)).toBe(true)
  })

  it('inclui todos os 7 estágios do funil, mesmo os que não têm lead nenhum', () => {
    const resultado = vgvPorEstagio([{ id: '1', estagio_funil: 'fechado', orcamento_max: 100 }])
    expect(resultado.map((r) => r.key)).toContain('primeiro_contato')
    expect(resultado.map((r) => r.key)).toContain('negociacao')
  })
})
