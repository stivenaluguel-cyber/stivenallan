import { describe, expect, it } from 'vitest'
import { normalizarSimulacao, descreverSimulacao } from './normalizar-simulacao'

const base = { lead_id: 'lead-1', valor_imovel: 500000 }

describe('normalizarSimulacao — validação', () => {
  it('exige lead_id (a simulação só faz sentido presa a um lead)', () => {
    const r = normalizarSimulacao({ valor_imovel: 500000 }, 'admin-1')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toContain('lead_id')
  })

  it('exige valor_imovel maior que zero', () => {
    expect(normalizarSimulacao({ lead_id: 'l1' }, 'a').ok).toBe(false)
    expect(normalizarSimulacao({ lead_id: 'l1', valor_imovel: 0 }, 'a').ok).toBe(false)
    expect(normalizarSimulacao({ lead_id: 'l1', valor_imovel: -10 }, 'a').ok).toBe(false)
  })

  it('recusa entrada maior que o valor do imóvel', () => {
    const r = normalizarSimulacao({ ...base, entrada: 600000 }, 'a')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toContain('entrada')
  })

  it('aceita entrada igual ao valor (compra à vista)', () => {
    expect(normalizarSimulacao({ ...base, entrada: 500000 }, 'a').ok).toBe(true)
  })
})

describe('normalizarSimulacao — conversão', () => {
  it('aceita valores em formato brasileiro vindos do formulário', () => {
    const r = normalizarSimulacao({ ...base, valor_imovel: '500.000,50', entrada: '100.000,00' }, 'a')
    if (!r.ok) throw new Error('deveria normalizar')
    expect(r.insert.valor_imovel).toBeCloseTo(500000.5, 2)
    expect(r.insert.entrada).toBe(100000)
  })

  it('campos ausentes viram null em vez de NaN', () => {
    const r = normalizarSimulacao(base, 'a')
    if (!r.ok) throw new Error('deveria normalizar')
    expect(r.insert.entrada).toBeNull()
    expect(r.insert.parcelas_qtd).toBeNull()
    expect(r.insert.chaves_valor).toBeNull()
  })

  it('correção desconhecida é descartada em vez de ir crua pro banco', () => {
    expect(normalizarSimulacao({ ...base, correcao: 'inventado' }, 'a').ok).toBe(true)
    const r = normalizarSimulacao({ ...base, correcao: 'inventado' }, 'a')
    if (!r.ok) throw new Error('x')
    expect(r.insert.correcao).toBeNull()
  })

  it('aceita as correções conhecidas, normalizando maiúsculas', () => {
    const r = normalizarSimulacao({ ...base, correcao: 'IGPM' }, 'a')
    if (!r.ok) throw new Error('x')
    expect(r.insert.correcao).toBe('igpm')
  })

  it('parcelas viram inteiro', () => {
    const r = normalizarSimulacao({ ...base, parcelas_qtd: '60.7' }, 'a')
    if (!r.ok) throw new Error('x')
    expect(r.insert.parcelas_qtd).toBe(60)
  })

  it('detalhes só aceita objeto — array ou string viram {}', () => {
    const comArray = normalizarSimulacao({ ...base, detalhes: [1, 2] }, 'a')
    const comString = normalizarSimulacao({ ...base, detalhes: 'texto' }, 'a')
    const comObjeto = normalizarSimulacao({ ...base, detalhes: { prazos: [36, 60] } }, 'a')
    if (!comArray.ok || !comString.ok || !comObjeto.ok) throw new Error('x')
    expect(comArray.insert.detalhes).toEqual({})
    expect(comString.insert.detalhes).toEqual({})
    expect(comObjeto.insert.detalhes).toEqual({ prazos: [36, 60] })
  })

  it('guarda o admin que fez a simulação', () => {
    const r = normalizarSimulacao(base, 'admin-42')
    if (!r.ok) throw new Error('x')
    expect(r.insert.admin_id).toBe('admin-42')
  })
})

describe('descreverSimulacao', () => {
  it('monta uma linha legível para a timeline', () => {
    const texto = descreverSimulacao({
      empreendimento_nome: 'Residencial Exemplo', valor_imovel: 500000,
      entrada: 100000, parcelas_qtd: 60, parcelas_valor: 5000,
    })
    expect(texto).toContain('Residencial Exemplo')
    expect(texto).toContain('60x')
    expect(texto).toContain('entrada')
  })

  it('funciona só com o valor do imóvel', () => {
    const texto = descreverSimulacao({ empreendimento_nome: null, valor_imovel: 300000, entrada: null, parcelas_qtd: null, parcelas_valor: null })
    expect(texto).toContain('300.000')
    expect(texto).not.toContain('entrada')
  })
})
