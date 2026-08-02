import { describe, expect, it } from 'vitest'
import { dividirComissao, normalizarParticipantes, type ParticipanteNormalizado } from './participantes'

const p = (papel: string, percentual: number, nome = 'Fulano'): ParticipanteNormalizado => ({
  corretor_id: null, nome, papel: papel as ParticipanteNormalizado['papel'], percentual, observacoes: null,
})

describe('normalizarParticipantes', () => {
  it('lista vazia é válida — comissão pode não ter divisão', () => {
    expect(normalizarParticipantes(undefined)).toEqual({ ok: true, participantes: [] })
    expect(normalizarParticipantes([])).toEqual({ ok: true, participantes: [] })
  })

  it('recusa soma acima de 100% dizendo quanto deu', () => {
    const r = normalizarParticipantes([
      { papel: 'vendedor', percentual: 60, nome: 'A' },
      { papel: 'imobiliaria', percentual: 50, nome: 'B' },
    ])
    expect(r.ok).toBe(false)
    expect(r.ok === false && r.erro).toContain('110')
  })

  it('aceita soma abaixo de 100% — sobra é decisão pendente, não erro', () => {
    const r = normalizarParticipantes([
      { papel: 'vendedor', percentual: 60, nome: 'A' },
      { papel: 'captador', percentual: 20, nome: 'B' },
    ])
    expect(r.ok).toBe(true)
  })

  it('exige corretor ou nome — linha anônima não diz de quem é o dinheiro', () => {
    const r = normalizarParticipantes([{ papel: 'parceiro', percentual: 10 }])
    expect(r.ok).toBe(false)
    expect(r.ok === false && r.erro).toContain('envolvido 1')
  })

  it('recusa papel fora da lista', () => {
    const r = normalizarParticipantes([{ papel: 'sindico', percentual: 10, nome: 'A' }])
    expect(r.ok).toBe(false)
  })

  it('recusa percentual zerado — participante com 0% é ruído', () => {
    const r = normalizarParticipantes([{ papel: 'vendedor', percentual: 0, nome: 'A' }])
    expect(r.ok).toBe(false)
  })

  it('aceita percentual digitado com vírgula', () => {
    const r = normalizarParticipantes([{ papel: 'vendedor', percentual: '33,33', nome: 'A' }])
    expect(r.ok && r.participantes[0].percentual).toBe(33.33)
  })

  it('aponta a linha errada quando há várias', () => {
    const r = normalizarParticipantes([
      { papel: 'vendedor', percentual: 50, nome: 'A' },
      { papel: 'captador', percentual: 200, nome: 'B' },
    ])
    expect(r.ok === false && r.erro).toContain('envolvido 2')
  })
})

describe('dividirComissao', () => {
  it('converte percentual em reais por envolvido', () => {
    const r = dividirComissao(45000, [p('vendedor', 60), p('captador', 20), p('imobiliaria', 20)])
    expect(r.itens.map((i) => i.valor)).toEqual([27000, 9000, 9000])
    expect(r.somaPercentual).toBe(100)
    expect(r.sobraPercentual).toBe(0)
  })

  it('centavo de arredondamento não some — a soma bate com o distribuído', () => {
    // 3 × 33,33% de 1.000: o cálculo direto daria 333,30 três vezes = 999,90.
    const r = dividirComissao(1000, [p('vendedor', 33.33), p('captador', 33.33), p('parceiro', 33.34)])
    const soma = r.itens.reduce((s, i) => s + i.valor, 0)
    expect(Math.round(soma * 100) / 100).toBe(1000)
  })

  it('mostra o que ainda não tem dono', () => {
    const r = dividirComissao(10000, [p('vendedor', 60), p('captador', 20)])
    expect(r.sobraPercentual).toBe(20)
    expect(r.valorNaoAtribuido).toBe(2000)
    expect(r.itens.reduce((s, i) => s + i.valor, 0)).toBe(8000)
  })

  it('traz o rótulo do papel pronto para a tela', () => {
    const r = dividirComissao(1000, [p('imobiliaria', 100)])
    expect(r.itens[0].rotuloPapel).toBe('Imobiliária')
  })

  it('sem participantes, nada é distribuído e tudo fica em aberto', () => {
    const r = dividirComissao(5000, [])
    expect(r.itens).toEqual([])
    expect(r.sobraPercentual).toBe(100)
    expect(r.valorNaoAtribuido).toBe(5000)
  })

  it('sinaliza excesso em vez de distribuir mais do que existe', () => {
    const r = dividirComissao(1000, [p('vendedor', 70), p('captador', 70)])
    expect(r.excedeu).toBe(true)
    // Mesmo com 140% declarado, não sai mais dinheiro do que a comissão tem.
    expect(r.itens.reduce((s, i) => s + i.valor, 0)).toBeLessThanOrEqual(1000)
  })
})
