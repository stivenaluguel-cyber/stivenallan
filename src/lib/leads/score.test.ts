import { describe, it, expect } from 'vitest'
import { calcularScore, detalheParaPersistir, MAXIMOS, type LeadParaScore, type SinaisLead } from './score'

const AGORA = new Date('2026-07-29T12:00:00Z')

const leadVazio: LeadParaScore = {}

const leadPerfeito: LeadParaScore = {
  nome: 'Roberto Lima',
  email: 'roberto@email.com',
  entrada_disponivel: 'R$ 60.000',
  orcamento_max: 450000,
  prazo_compra: 'imediato',
  cidade_interesse: 'Criciúma',
  origem: 'indicacao',
  ultimo_contato: '2026-07-28T12:00:00Z',
}

const sinaisPerfeitos: SinaisLead = {
  interacoes_total: 9,
  interacoes_30d: 5,
  ultima_interacao: '2026-07-28T12:00:00Z',
  eventos_total: 12,
  eventos_comerciais: 6,
  simulacoes: 2,
  propostas: 1,
  anexos: 4,
  visitas_realizadas: 1,
}

describe('calcularScore — faixas', () => {
  it('lead sem nenhum dado fica em zero e classificado como frio', () => {
    const r = calcularScore(leadVazio, null, AGORA)
    expect(r.score).toBe(0)
    expect(r.classificacao).toBe('frio')
  })

  it('lead completo com ação comercial provada chega a 100 e fica quente', () => {
    const r = calcularScore(leadPerfeito, sinaisPerfeitos, AGORA)
    expect(r.score).toBe(100)
    expect(r.classificacao).toBe('quente')
  })

  it('cada dimensão respeita o próprio teto', () => {
    const r = calcularScore(leadPerfeito, sinaisPerfeitos, AGORA)
    for (const d of r.dimensoes) {
      expect(d.pontos).toBeLessThanOrEqual(d.maximo)
      expect(d.pontos).toBeGreaterThanOrEqual(0)
    }
    expect(r.dimensoes.reduce((s, d) => s + d.maximo, 0)).toBe(100)
  })

  it('as quatro dimensões somadas batem com o score', () => {
    const r = calcularScore(leadPerfeito, sinaisPerfeitos, AGORA)
    expect(r.dimensoes.reduce((s, d) => s + d.pontos, 0)).toBe(r.score)
  })

  it('o score nunca passa de 100 mesmo com sinais exagerados', () => {
    const r = calcularScore(leadPerfeito, {
      ...sinaisPerfeitos,
      interacoes_total: 500,
      propostas: 40,
      anexos: 90,
      visitas_realizadas: 30,
    }, AGORA)
    expect(r.score).toBe(100)
  })
})

describe('calcularScore — pesos do financiamento direto', () => {
  it('entrada declarada vale mais que qualquer outro campo isolado de perfil', () => {
    const comEntrada = calcularScore({ entrada_disponivel: 'R$ 50.000' }, null, AGORA)
    const comOrcamento = calcularScore({ orcamento_max: 450000 }, null, AGORA)
    const comCidade = calcularScore({ cidade_interesse: 'Criciúma' }, null, AGORA)
    expect(comEntrada.score).toBeGreaterThan(comOrcamento.score)
    expect(comOrcamento.score).toBeGreaterThan(comCidade.score)
  })

  it('proposta enviada pesa mais que simulação apresentada', () => {
    const comProposta = calcularScore(leadVazio, { propostas: 1 }, AGORA)
    const comSimulacao = calcularScore(leadVazio, { simulacoes: 1 }, AGORA)
    expect(comProposta.score).toBeGreaterThan(comSimulacao.score)
  })

  it('documentos anexados pontuam de forma escalonada', () => {
    const um = calcularScore(leadVazio, { anexos: 1 }, AGORA).score
    const tres = calcularScore(leadVazio, { anexos: 3 }, AGORA).score
    expect(tres).toBeGreaterThan(um)
    expect(um).toBeGreaterThan(0)
  })

  it('origem de indicação pontua mais que tráfego pago, que pontua mais que a origem padrão', () => {
    const indicacao = calcularScore({ origem: 'indicacao' }, null, AGORA).score
    const meta = calcularScore({ origem: 'meta_ads' }, null, AGORA).score
    const whatsapp = calcularScore({ origem: 'whatsapp' }, null, AGORA).score
    expect(indicacao).toBeGreaterThan(meta)
    expect(meta).toBeGreaterThan(whatsapp)
  })

  it('faixa_investimento substitui orçamento numérico quando ele falta', () => {
    const comFaixa = calcularScore({ faixa_investimento: 'R$ 300 a 500 mil' }, null, AGORA)
    const comNumero = calcularScore({ orcamento_max: 450000 }, null, AGORA)
    expect(comFaixa.score).toBe(comNumero.score)
    expect(comFaixa.negativos).not.toContain('Sem orçamento ou faixa de investimento')
  })

  it('orcamento_min serve de alternativa quando orcamento_max está vazio', () => {
    const r = calcularScore({ orcamento_min: 200000 }, null, AGORA)
    expect(r.negativos).not.toContain('Sem orçamento ou faixa de investimento')
  })
})

describe('calcularScore — recência e timing', () => {
  it('lead contatado hoje pontua mais em timing que o de duas semanas atrás', () => {
    const hoje = calcularScore({ ultimo_contato: '2026-07-29T09:00:00Z' }, null, AGORA)
    const antigo = calcularScore({ ultimo_contato: '2026-07-15T09:00:00Z' }, null, AGORA)
    const t = (r: typeof hoje) => r.dimensoes.find((d) => d.chave === 'timing')!.pontos
    expect(t(hoje)).toBeGreaterThan(t(antigo))
  })

  it('acima de 30 dias a recência não pontua e vira fator negativo', () => {
    const r = calcularScore({ ultimo_contato: '2026-05-01T12:00:00Z' }, null, AGORA)
    expect(r.dimensoes.find((d) => d.chave === 'timing')!.pontos).toBe(0)
    expect(r.negativos.some((n) => n.startsWith('Sem contato há'))).toBe(true)
  })

  it('usa a data mais recente entre ultimo_contato e a última interação real', () => {
    // O campo do lead está velho, mas houve interação ontem: não pode ser
    // tratado como lead abandonado.
    const r = calcularScore(
      { ultimo_contato: '2026-06-01T12:00:00Z' },
      { ultima_interacao: '2026-07-28T12:00:00Z' },
      AGORA,
    )
    expect(r.dimensoes.find((d) => d.chave === 'timing')!.pontos).toBeGreaterThan(0)
    expect(r.negativos.some((n) => n.startsWith('Sem contato há'))).toBe(false)
  })

  it('data futura não gera pontuação de recência maior que hoje', () => {
    const futuro = calcularScore({ ultimo_contato: '2027-01-01T12:00:00Z' }, null, AGORA)
    const hoje = calcularScore({ ultimo_contato: '2026-07-29T11:00:00Z' }, null, AGORA)
    expect(futuro.score).toBe(hoje.score)
  })

  it('data inválida é tratada como ausência de contato, não como erro', () => {
    const r = calcularScore({ ultimo_contato: 'não é data' }, null, AGORA)
    expect(r.score).toBe(0)
    expect(r.negativos).toContain('Nunca foi contatado')
  })
})

describe('calcularScore — explicação', () => {
  it('lista os fatores positivos em ordem decrescente de peso', () => {
    const r = calcularScore(leadPerfeito, sinaisPerfeitos, AGORA)
    const pontos = r.positivos.map((p) => p.pontos)
    expect(pontos).toEqual([...pontos].sort((a, b) => b - a))
    expect(r.positivos.length).toBeGreaterThan(0)
  })

  it('nomeia o que está faltando em vez de só devolver um número baixo', () => {
    const r = calcularScore(leadVazio, null, AGORA)
    expect(r.negativos).toContain('Não declarou entrada disponível')
    expect(r.negativos).toContain('Sem documentos anexados')
    expect(r.negativos).toContain('Nenhuma proposta enviada')
  })

  it('a próxima ação segue o funil do financiamento direto', () => {
    const semContato = calcularScore(leadVazio, null, AGORA)
    expect(semContato.proximaAcao).toBe('Fazer o primeiro contato')

    const parado = calcularScore({ ultimo_contato: '2026-06-01T12:00:00Z' }, null, AGORA)
    expect(parado.proximaAcao).toMatch(/^Retomar contato/)

    const semEntrada = calcularScore({ ultimo_contato: '2026-07-28T12:00:00Z' }, null, AGORA)
    expect(semEntrada.proximaAcao).toBe('Descobrir quanto ele tem de entrada')

    const semSimulacao = calcularScore(
      { ultimo_contato: '2026-07-28T12:00:00Z', entrada_disponivel: '50 mil' }, null, AGORA)
    expect(semSimulacao.proximaAcao).toBe('Apresentar uma simulação de parcelamento')

    const semDocs = calcularScore(
      { ultimo_contato: '2026-07-28T12:00:00Z', entrada_disponivel: '50 mil' }, { simulacoes: 1 }, AGORA)
    expect(semDocs.proximaAcao).toBe('Pedir os documentos para análise de crédito')

    const semProposta = calcularScore(
      { ultimo_contato: '2026-07-28T12:00:00Z', entrada_disponivel: '50 mil' },
      { simulacoes: 1, anexos: 3 }, AGORA)
    expect(semProposta.proximaAcao).toBe('Enviar a proposta')

    const pronto = calcularScore(leadPerfeito, sinaisPerfeitos, AGORA)
    expect(pronto.proximaAcao).toBe('Fechar a venda')
  })

  it('não sugere pedir documento de lead que sumiu — retomar contato vem antes', () => {
    const r = calcularScore(
      { ultimo_contato: '2026-06-01T12:00:00Z', entrada_disponivel: '50 mil' },
      { simulacoes: 1, anexos: 0 },
      AGORA,
    )
    expect(r.proximaAcao).toMatch(/^Retomar contato/)
  })
})

describe('calcularScore — classificação', () => {
  it('quente a partir de 70, morno a partir de 40, frio abaixo disso', () => {
    const quente = calcularScore(leadPerfeito, sinaisPerfeitos, AGORA)
    expect(quente.score).toBeGreaterThanOrEqual(70)
    expect(quente.classificacao).toBe('quente')

    const frio = calcularScore({ nome: 'Alguém' }, null, AGORA)
    expect(frio.score).toBeLessThan(40)
    expect(frio.classificacao).toBe('frio')

    const morno = calcularScore(
      { nome: 'Alguém', email: 'a@b.com', entrada_disponivel: '30 mil', orcamento_max: 300000,
        prazo_compra: '3 meses', origem: 'meta_ads', ultimo_contato: '2026-07-28T12:00:00Z' },
      { interacoes_total: 3, interacoes_30d: 1 },
      AGORA,
    )
    expect(morno.classificacao).toBe('morno')
  })
})

describe('detalheParaPersistir', () => {
  it('limita listas a 6 itens para não inflar o jsonb', () => {
    const d = detalheParaPersistir(calcularScore(leadPerfeito, sinaisPerfeitos, AGORA))
    expect(d.positivos.length).toBeLessThanOrEqual(6)
    expect(d.negativos.length).toBeLessThanOrEqual(6)
  })

  it('guarda classificação, dimensões e próxima ação', () => {
    const d = detalheParaPersistir(calcularScore(leadPerfeito, sinaisPerfeitos, AGORA))
    expect(d.classificacao).toBe('quente')
    expect(d.dimensoes).toHaveLength(4)
    expect(d.proxima_acao).toBe('Fechar a venda')
    expect(d.calculado_em).toBe(AGORA.toISOString())
  })
})

describe('MAXIMOS', () => {
  it('os tetos somam exatamente 100', () => {
    expect(Object.values(MAXIMOS).reduce((s, n) => s + n, 0)).toBe(100)
  })
})
