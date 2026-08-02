import { describe, expect, it } from 'vitest'
import {
  calcularMetricasCaptacao,
  estagioCaptacaoValido,
  ESTAGIOS_CAPTACAO,
  foiCaptado,
  intencaoValida,
  rotuloEstagioCaptacao,
  tipoImovelValido,
} from './pipeline'
import { ESTAGIOS_FUNIL } from '@/lib/dashboard/estagios'

describe('pipeline de captação — vocabulário', () => {
  it('valida só os estágios que existem', () => {
    expect(estagioCaptacaoValido('avaliacao_agendada')).toBe(true)
    expect(estagioCaptacaoValido('publicado')).toBe(true)
    expect(estagioCaptacaoValido('inventado')).toBe(false)
    expect(estagioCaptacaoValido(null)).toBe(false)
    expect(estagioCaptacaoValido(3)).toBe(false)
  })

  // A separação dos dois funis é a decisão central deste módulo: se um estágio
  // de comprador passasse a valer aqui, a métrica dos dois viraria uma média
  // que não descreve nenhum.
  it('não aceita estágio do funil de COMPRADORES', () => {
    for (const e of ESTAGIOS_FUNIL) {
      expect(estagioCaptacaoValido(e.key), `"${e.key}" é de comprador, não de captação`).toBe(false)
    }
  })

  it('todo estágio tem rótulo legível', () => {
    for (const e of ESTAGIOS_CAPTACAO) {
      expect(rotuloEstagioCaptacao(e.key)).toBe(e.label)
      expect(e.label.trim().length).toBeGreaterThan(0)
    }
  })

  it('rótulo de chave desconhecida devolve a própria chave em vez de quebrar', () => {
    expect(rotuloEstagioCaptacao('xpto')).toBe('xpto')
  })

  it('valida intenção e tipo de imóvel', () => {
    expect(intencaoValida('vender')).toBe(true)
    expect(intencaoValida('alugar')).toBe(true)
    expect(intencaoValida('trocar')).toBe(false)
    expect(tipoImovelValido('apartamento')).toBe(true)
    expect(tipoImovelValido('iate')).toBe(false)
  })
})

describe('foiCaptado — definição operacional', () => {
  // O gargalo real da captação é conseguir a assinatura. Contar antes disso
  // infla a métrica e esconde exatamente onde o processo trava.
  it('exige autorização, não basta o estágio', () => {
    expect(foiCaptado({ estagio: 'publicado', autorizacao: false })).toBe(false)
    expect(foiCaptado({ estagio: 'autorizacao', autorizacao: false })).toBe(false)
  })

  it('conta a partir da autorização', () => {
    expect(foiCaptado({ estagio: 'autorizacao', autorizacao: true })).toBe(true)
    expect(foiCaptado({ estagio: 'fotos_documentos', autorizacao: true })).toBe(true)
    expect(foiCaptado({ estagio: 'publicado', autorizacao: true })).toBe(true)
    expect(foiCaptado({ estagio: 'concluido', autorizacao: true })).toBe(true)
  })

  it('estágio anterior à autorização não conta, mesmo com o campo marcado', () => {
    expect(foiCaptado({ estagio: 'visita_realizada', autorizacao: true })).toBe(false)
    expect(foiCaptado({ estagio: 'novo', autorizacao: true })).toBe(false)
  })

  it('perdido nunca conta como captado', () => {
    expect(foiCaptado({ estagio: 'perdido', autorizacao: true })).toBe(false)
  })
})

describe('calcularMetricasCaptacao', () => {
  it('lista vazia não divide por zero', () => {
    const m = calcularMetricasCaptacao([])
    expect(m.total).toBe(0)
    expect(m.taxaContato).toBe(0)
    expect(m.taxaAvaliacao).toBe(0)
    expect(m.taxaAutorizacao).toBe(0)
  })

  it('conta acumulado: quem chegou em visita também passou por contato', () => {
    const m = calcularMetricasCaptacao([
      { estagio: 'visita_realizada', autorizacao: false },
    ])
    expect(m.contatados).toBe(1)
    expect(m.avaliacoesAgendadas).toBe(1)
    expect(m.avaliacoesRealizadas).toBe(1)
    expect(m.captados).toBe(0)
  })

  it('quem está em "novo" não conta como contatado', () => {
    const m = calcularMetricasCaptacao([{ estagio: 'novo' }, { estagio: 'novo' }])
    expect(m.contatados).toBe(0)
    expect(m.taxaContato).toBe(0)
    expect(m.emAndamento).toBe(2)
  })

  it('perdido sai do acumulado — não infla taxa de contato', () => {
    const m = calcularMetricasCaptacao([{ estagio: 'perdido' }])
    expect(m.perdidos).toBe(1)
    expect(m.contatados).toBe(0)
    expect(m.emAndamento).toBe(0)
  })

  it('taxas são calculadas sobre a base correta, não sobre o total', () => {
    // 4 registros: 1 em novo, 3 contatados; desses 3, 2 agendaram avaliação.
    const m = calcularMetricasCaptacao([
      { estagio: 'novo' },
      { estagio: 'contato_feito' },
      { estagio: 'avaliacao_agendada' },
      { estagio: 'visita_realizada' },
    ])
    expect(m.total).toBe(4)
    expect(m.contatados).toBe(3)
    expect(m.taxaContato).toBe(75) // 3/4
    expect(m.avaliacoesAgendadas).toBe(2)
    expect(m.taxaAvaliacao).toBe(67) // 2/3 dos contatados, não 2/4
  })

  it('taxa de autorização mede sobre visitas realizadas', () => {
    const m = calcularMetricasCaptacao([
      { estagio: 'visita_realizada', autorizacao: false },
      { estagio: 'autorizacao', autorizacao: true },
    ])
    expect(m.avaliacoesRealizadas).toBe(2)
    expect(m.captados).toBe(1)
    expect(m.taxaAutorizacao).toBe(50)
  })

  it('cenário completo bate em todos os contadores', () => {
    const m = calcularMetricasCaptacao([
      { estagio: 'novo' },
      { estagio: 'contato_feito' },
      { estagio: 'pre_qualificado' },
      { estagio: 'avaliacao_agendada' },
      { estagio: 'visita_realizada' },
      { estagio: 'autorizacao', autorizacao: true },
      { estagio: 'fotos_documentos', autorizacao: true },
      { estagio: 'publicado', autorizacao: true },
      { estagio: 'concluido', autorizacao: true },
      { estagio: 'perdido' },
    ])
    expect(m.total).toBe(10)
    expect(m.perdidos).toBe(1)
    expect(m.concluidos).toBe(1)
    expect(m.publicados).toBe(2) // publicado + concluido
    expect(m.captados).toBe(4)
    expect(m.emAndamento).toBe(7)
  })
})
