import { describe, it, expect } from 'vitest'
import { gerarRegua, calcularResumo, type NotaFiscal } from './regua'

function nota(competencia: string, numero: string, valor: number): NotaFiscal {
  return { id: `${competencia}-${numero}`, competencia, numero, valor, storagePath: `x/${numero}.pdf`, criadoEm: '2026-01-01T00:00:00Z' }
}

describe('gerarRegua', () => {
  it('sem notas: régua vazia (não existe "primeiro mês" de referência)', () => {
    expect(gerarRegua([], '2026-08-05')).toEqual([])
  })

  it('uma nota no mês corrente: régua com 1 item, não pendente', () => {
    const r = gerarRegua([nota('2026-08-01', '123', 1000)], '2026-08-05')
    expect(r).toHaveLength(1)
    expect(r[0].competencia).toBe('2026-08-01')
    expect(r[0].pendente).toBe(false)
  })

  it('gera TODOS os meses entre a primeira nota e o mês corrente, marcando os sem nota como pendentes', () => {
    // nota só em maio; hoje é agosto -> mai, jun, jul, ago (jun/jul pendentes)
    const r = gerarRegua([nota('2026-05-01', '1', 500)], '2026-08-15')
    expect(r.map((m) => m.competencia)).toEqual(['2026-08-01', '2026-07-01', '2026-06-01', '2026-05-01'])
    expect(r.find((m) => m.competencia === '2026-05-01')!.pendente).toBe(false)
    expect(r.find((m) => m.competencia === '2026-06-01')!.pendente).toBe(true)
    expect(r.find((m) => m.competencia === '2026-07-01')!.pendente).toBe(true)
    expect(r.find((m) => m.competencia === '2026-08-01')!.pendente).toBe(true) // sem nota ainda em agosto
  })

  it('ordem cronológica decrescente (mês corrente primeiro)', () => {
    const r = gerarRegua([nota('2026-01-01', '1', 100)], '2026-04-10')
    expect(r.map((m) => m.competencia)).toEqual(['2026-04-01', '2026-03-01', '2026-02-01', '2026-01-01'])
  })

  it('atravessa virada de ano corretamente (dezembro -> janeiro)', () => {
    const r = gerarRegua([nota('2025-11-01', '1', 100)], '2026-02-10')
    expect(r.map((m) => m.competencia)).toEqual(['2026-02-01', '2026-01-01', '2025-12-01', '2025-11-01'])
  })

  it('múltiplas notas na mesma competência: todas aparecem, mês não conta como pendente', () => {
    const r = gerarRegua([nota('2026-08-01', '1', 100), nota('2026-08-01', '2', 200)], '2026-08-20')
    expect(r).toHaveLength(1)
    expect(r[0].notas).toHaveLength(2)
    expect(r[0].pendente).toBe(false)
  })

  it('notas dentro do mesmo mês vêm ordenadas por número', () => {
    const r = gerarRegua([nota('2026-08-01', '10', 100), nota('2026-08-01', '2', 200)], '2026-08-20')
    expect(r[0].notas.map((n) => n.numero)).toEqual(['2', '10'])
  })

  it('nota mais antiga que a primeira registrada não gera régua invertida (dado futuro/relógio adiantado)', () => {
    const r = gerarRegua([nota('2026-12-01', '1', 100)], '2026-08-05')
    // "hoje" (agosto) é ANTES da nota (dezembro) — régua vira só o mês da nota, não quebra.
    expect(r).toEqual([{ competencia: '2026-12-01', notas: expect.any(Array), pendente: false }])
  })
})

describe('calcularResumo', () => {
  it('soma só as notas do ano corrente, ignorando anos anteriores', () => {
    const regua = gerarRegua(
      [nota('2025-12-01', '1', 1000), nota('2026-01-01', '2', 500), nota('2026-02-01', '3', 300)],
      '2026-02-10',
    )
    const resumo = calcularResumo(regua, 2026)
    expect(resumo.totalAnoCorrente).toBe(800) // só jan+fev/2026, não dez/2025
  })

  it('conta meses pendentes na régua inteira, não só no ano corrente', () => {
    // nota em nov/2025, hoje fev/2026 -> nov,dez,jan,fev = 4 meses, 3 pendentes (dez,jan,fev)
    const regua = gerarRegua([nota('2025-11-01', '1', 100)], '2026-02-15')
    const resumo = calcularResumo(regua, 2026)
    expect(resumo.mesesPendentes).toBe(3)
  })

  it('nenhum mês pendente quando toda a régua tem nota', () => {
    const regua = gerarRegua(
      [nota('2026-06-01', '1', 1), nota('2026-07-01', '2', 1), nota('2026-08-01', '3', 1)],
      '2026-08-10',
    )
    expect(calcularResumo(regua, 2026).mesesPendentes).toBe(0)
  })

  it('régua vazia -> resumo zerado', () => {
    expect(calcularResumo([], 2026)).toEqual({ totalAnoCorrente: 0, mesesPendentes: 0 })
  })
})
