import { describe, expect, it } from 'vitest'
import { contarAbordagensHoje, ehHojeEmSaoPaulo, statusAtivacaoValido } from './ativacoes'

describe('ehHojeEmSaoPaulo', () => {
  // Às 23h de Criciúma o UTC já virou o dia — o contador não pode zerar cedo.
  it('23h de São Paulo (02h UTC do dia seguinte) ainda conta como hoje', () => {
    const agora = new Date('2026-07-31T02:30:00Z') // 30/07 23:30 em SP
    expect(ehHojeEmSaoPaulo('2026-07-30T18:00:00Z', agora)).toBe(true) // 30/07 15h SP
    expect(ehHojeEmSaoPaulo('2026-07-30T01:00:00Z', agora)).toBe(false) // 29/07 22h SP
  })

  it('null não conta', () => {
    expect(ehHojeEmSaoPaulo(null)).toBe(false)
  })
})

describe('contarAbordagensHoje', () => {
  it('conta só quem foi abordado hoje', () => {
    const agora = new Date('2026-07-30T18:00:00Z')
    const itens = [
      { abordado_em: '2026-07-30T12:00:00Z' },
      { abordado_em: '2026-07-29T12:00:00Z' },
      { abordado_em: null },
    ]
    expect(contarAbordagensHoje(itens, agora)).toBe(1)
  })
})

describe('statusAtivacaoValido', () => {
  it('aceita o vocabulário e recusa o resto', () => {
    for (const s of ['pendente', 'abordado', 'respondeu', 'virou_lead', 'ignorado']) {
      expect(statusAtivacaoValido(s)).toBe(true)
    }
    expect(statusAtivacaoValido('lead')).toBe(false)
    expect(statusAtivacaoValido(undefined)).toBe(false)
  })
})
