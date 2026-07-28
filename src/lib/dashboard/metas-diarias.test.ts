import { describe, expect, it } from 'vitest'
import { calcularProgresso, mensagemDoDia, normalizarMetas, normalizarResumo, METAS_PADRAO } from './metas-diarias'

const metas = { novos_contatos: 20, followups: 10, visitas: 2, conteudos: 1, reunioes: 1 }
const zerado = { novos_contatos: 0, followups: 0, visitas: 0, conteudos: 0, reunioes: 0 }

describe('calcularProgresso', () => {
  it('marca cumprida quando atinge a meta', () => {
    const p = calcularProgresso({ ...zerado, visitas: 2 }, metas)
    expect(p.itens.find((i) => i.chave === 'visitas')?.cumprida).toBe(true)
    expect(p.itens.find((i) => i.chave === 'followups')?.cumprida).toBe(false)
  })

  it('percentual não passa de 100 mesmo excedendo a meta', () => {
    const p = calcularProgresso({ ...zerado, visitas: 10 }, metas)
    expect(p.itens.find((i) => i.chave === 'visitas')?.percentual).toBe(100)
  })

  it('dia completo só quando TODAS as atividades batem a meta', () => {
    expect(calcularProgresso({ novos_contatos: 20, followups: 10, visitas: 2, conteudos: 1, reunioes: 1 }, metas).diaCompleto).toBe(true)
    expect(calcularProgresso({ novos_contatos: 20, followups: 10, visitas: 2, conteudos: 1, reunioes: 0 }, metas).diaCompleto).toBe(false)
  })

  it('excesso numa atividade não compensa outra zerada', () => {
    const p = calcularProgresso({ ...zerado, novos_contatos: 200 }, metas)
    expect(p.diaCompleto).toBe(false)
    expect(p.percentualGeral).toBeLessThan(100)
  })

  it('meta 0 tira a atividade do painel em vez de mostrar 0/0', () => {
    const p = calcularProgresso(zerado, { ...metas, reunioes: 0, conteudos: 0 })
    expect(p.itens.map((i) => i.chave)).not.toContain('reunioes')
    expect(p.itens.map((i) => i.chave)).not.toContain('conteudos')
    expect(p.total).toBe(3)
  })

  it('todas as metas em 0 não quebra nem divide por zero', () => {
    const p = calcularProgresso(zerado, { novos_contatos: 0, followups: 0, visitas: 0, conteudos: 0, reunioes: 0 })
    expect(p.total).toBe(0)
    expect(p.percentualGeral).toBe(0)
    expect(p.diaCompleto).toBe(false)
  })

  it('identifica quais atividades vêm do sistema e quais são manuais', () => {
    const p = calcularProgresso(zerado, metas)
    const auto = p.itens.filter((i) => i.origem === 'automatica').map((i) => i.chave)
    const manual = p.itens.filter((i) => i.origem === 'manual').map((i) => i.chave)
    expect(auto).toEqual(['novos_contatos', 'followups', 'visitas'])
    expect(manual).toEqual(['conteudos', 'reunioes'])
  })

  it('valor negativo vindo do banco é tratado como zero', () => {
    const p = calcularProgresso({ ...zerado, visitas: -5 }, metas)
    expect(p.itens.find((i) => i.chave === 'visitas')?.feito).toBe(0)
  })
})

describe('mensagemDoDia', () => {
  it('não cobra nada antes das 18h', () => {
    expect(mensagemDoDia(calcularProgresso(zerado, metas), 9)).toBeNull()
    expect(mensagemDoDia(calcularProgresso(zerado, metas), 17)).toBeNull()
  })

  it('a partir das 18h lista o que falta', () => {
    const msg = mensagemDoDia(calcularProgresso({ ...zerado, visitas: 1 }, metas), 19)
    expect(msg).toContain('Faltam')
    expect(msg).toContain('1 visitas a imóveis')
  })

  it('dia completo é reconhecido em qualquer horário', () => {
    const p = calcularProgresso({ novos_contatos: 20, followups: 10, visitas: 2, conteudos: 1, reunioes: 1 }, metas)
    expect(mensagemDoDia(p, 10)).toBe('Rotina do dia completa.')
  })

  it('sem metas configuradas não gera mensagem', () => {
    const p = calcularProgresso(zerado, { novos_contatos: 0, followups: 0, visitas: 0, conteudos: 0, reunioes: 0 })
    expect(mensagemDoDia(p, 22)).toBeNull()
  })
})

describe('normalização de entrada', () => {
  it('metas ausentes caem no padrão', () => {
    expect(normalizarMetas(null)).toEqual(METAS_PADRAO)
    expect(normalizarMetas({ visitas: 5 }).visitas).toBe(5)
    expect(normalizarMetas({ visitas: 5 }).followups).toBe(METAS_PADRAO.followups)
  })

  it('metas inválidas são ignoradas em vez de virar NaN', () => {
    const m = normalizarMetas({ visitas: 'abc', followups: -3, conteudos: null })
    expect(m.visitas).toBe(METAS_PADRAO.visitas)
    expect(m.followups).toBe(METAS_PADRAO.followups)
    expect(m.conteudos).toBe(METAS_PADRAO.conteudos)
  })

  it('meta zero é respeitada (desliga o acompanhamento)', () => {
    expect(normalizarMetas({ reunioes: 0 }).reunioes).toBe(0)
  })

  it('resumo ausente vira tudo zero', () => {
    expect(normalizarResumo(null)).toEqual(zerado)
    expect(normalizarResumo({ visitas: 3 }).visitas).toBe(3)
  })
})
