import { describe, expect, it } from 'vitest'
import { palpiteInicial, projetar } from './projecao-meta'

const base = { ticketMedio: 400_000, volume: 2, percentualComissao: 6, metaVgv: 1_000_000, realizadoVgv: 0 }

describe('projetar', () => {
  it('multiplica ticket por volume e aplica a comissão', () => {
    const r = projetar(base)
    expect(r.vgvProjetado).toBe(800_000)
    expect(r.comissaoProjetada).toBe(48_000)
  })

  it('soma o que já foi realizado — a simulação não recomeça o mês', () => {
    const r = projetar({ ...base, realizadoVgv: 300_000 })
    expect(r.vgvTotalNoMes).toBe(1_100_000)
    expect(r.bate).toBe(true)
    expect(r.percentualDaMeta).toBe(110)
  })

  it('diz quantas vendas do ticket escolhido ainda faltam', () => {
    const r = projetar({ ...base, realizadoVgv: 200_000 })
    // Faltam 800 mil; a 400 mil por venda, são 2 vendas.
    expect(r.faltaVgv).toBe(800_000)
    expect(r.vendasFaltantes).toBe(2)
  })

  it('arredonda vendas faltantes para cima — 1,2 venda não existe', () => {
    // Faltam 500 mil com ticket de 400 mil = 1,25 → 2. Sugerir 1 deixaria a
    // meta sem bater por 100 mil.
    const r = projetar({ ...base, realizadoVgv: 500_000 })
    expect(r.vendasFaltantes).toBe(2)
  })

  it('meta já batida não pede mais nenhuma venda', () => {
    const r = projetar({ ...base, realizadoVgv: 1_200_000 })
    expect(r.faltaVgv).toBe(0)
    expect(r.vendasFaltantes).toBe(0)
    expect(r.bate).toBe(true)
  })

  it('sem meta definida não inventa percentual', () => {
    const r = projetar({ ...base, metaVgv: 0 })
    expect(r.percentualDaMeta).toBe(0)
    expect(r.bate).toBe(false)
    expect(r.vgvProjetado).toBe(800_000)
  })

  it('ticket zerado não divide por zero', () => {
    const r = projetar({ ...base, ticketMedio: 0 })
    expect(r.vendasFaltantes).toBe(0)
    expect(r.vgvProjetado).toBe(0)
  })

  it('volume fracionado é truncado — não se vende meio apartamento', () => {
    expect(projetar({ ...base, volume: 2.9 }).vgvProjetado).toBe(800_000)
  })

  it('entrada negativa vira zero em vez de subtrair da meta', () => {
    const r = projetar({ ...base, volume: -5, realizadoVgv: -100 })
    expect(r.vgvProjetado).toBe(0)
    expect(r.vgvTotalNoMes).toBe(0)
  })
})

describe('palpiteInicial', () => {
  it('usa o ticket realizado quando existe', () => {
    const r = palpiteInicial(1_000_000, 3, 250_000)
    expect(r.ticketMedio).toBe(250_000)
    expect(r.volume).toBe(4)
  })

  it('sem realizado, deriva o ticket da própria meta', () => {
    expect(palpiteInicial(900_000, 3)).toEqual({ ticketMedio: 300_000, volume: 3 })
  })

  it('sem meta e sem realizado, abre com um piso plausível em vez de zero', () => {
    const r = palpiteInicial(0, 0)
    expect(r.ticketMedio).toBeGreaterThan(0)
    expect(r.volume).toBeGreaterThan(0)
  })
})
