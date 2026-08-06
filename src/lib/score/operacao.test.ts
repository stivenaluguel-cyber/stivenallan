import { describe, it, expect } from 'vitest'
import { calcularScoreOperacao, type AgregadosScoreOperacao } from './operacao'

const ZERADO: AgregadosScoreOperacao = {
  interacoes7d: 0,
  unidadesAtivas: 0,
  empreendimentosDistintos: 0,
  leads30dTotal: 0,
  leads30dAtendidos1h: 0,
  leadsParados: 0,
  leadsTotal: 0,
  unidadesTotal: 0,
}

const COMPLETO: AgregadosScoreOperacao = {
  interacoes7d: 25,
  unidadesAtivas: 15,
  empreendimentosDistintos: 7,
  leads30dTotal: 10,
  leads30dAtendidos1h: 10,
  leadsParados: 0,
  leadsTotal: 40,
  unidadesTotal: 600,
}

describe('calcularScoreOperacao — conta zerada', () => {
  it('score 0 e faixa fria quando não há nenhum sinal', () => {
    const r = calcularScoreOperacao(ZERADO)
    expect(r.total).toBe(0)
    expect(r.faixa).toBe('frio')
    expect(r.faltamProximaFaixa).toBe(31)
    expect(r.proximaFaixaLabel).toBe('Morno')
  })

  it('marca contaNova quando não há lead nem unidade desde sempre', () => {
    const r = calcularScoreOperacao(ZERADO)
    expect(r.contaNova).toBe(true)
  })

  it('velocidade fica não-aplicável (null) e sai do denominador quando não há leads no período', () => {
    const r = calcularScoreOperacao(ZERADO)
    const velocidade = r.componentes.find((c) => c.chave === 'velocidade')!
    expect(velocidade.pontos).toBeNull()
  })
})

describe('calcularScoreOperacao — conta parcial', () => {
  it('cada componente respeita o teto original e o total soma proporcional ao peso aplicável', () => {
    const agregados: AgregadosScoreOperacao = {
      interacoes7d: 10, // metade do teto de 20 -> 15/30
      unidadesAtivas: 5, // metade do teto de 10 -> 12.5/25 -> 13
      empreendimentosDistintos: 3, // 5 + (3-1)/4*15 = 12.5 -> 13
      leads30dTotal: 4,
      leads30dAtendidos1h: 2, // 50% de 15 -> 7.5 -> 8
      leadsParados: 6,
      leadsTotal: 12,
      unidadesTotal: 200,
    }
    const r = calcularScoreOperacao(agregados)

    const porChave = Object.fromEntries(r.componentes.map((c) => [c.chave, c]))
    expect(porChave.frequencia.pontos).toBe(15)
    expect(porChave.portfolio.pontos).toBe(13)
    expect(porChave.diversificacao.pontos).toBe(13)
    expect(porChave.velocidade.pontos).toBe(8)

    // total = round(100 * (15+13+13+8) / (30+25+20+15)) = round(100*49/90)
    expect(r.total).toBe(54)
    expect(r.faixa).toBe('morno')
    expect(r.contaNova).toBe(false)
  })

  it('gera até 3 missões ordenadas pelos pontos perdidos, com número real de leads parados', () => {
    const agregados: AgregadosScoreOperacao = {
      interacoes7d: 0,
      unidadesAtivas: 10,
      empreendimentosDistintos: 5,
      leads30dTotal: 5,
      leads30dAtendidos1h: 5,
      leadsParados: 6,
      leadsTotal: 12,
      unidadesTotal: 200,
    }
    const r = calcularScoreOperacao(agregados)
    expect(r.missoes).toHaveLength(1)
    expect(r.missoes[0].chave).toBe('frequencia')
    expect(r.missoes[0].texto).toContain('6 leads')
    expect(r.missoes[0].ganhoEstimado).toBe(30)
    expect(r.missoes[0].href).toBe('/dashboard/crm/foco')
  })
})

describe('calcularScoreOperacao — conta completa', () => {
  it('score 100, faixa quente e sem próxima faixa', () => {
    const r = calcularScoreOperacao(COMPLETO)
    expect(r.total).toBe(100)
    expect(r.faixa).toBe('quente')
    expect(r.faltamProximaFaixa).toBeNull()
    expect(r.proximaFaixaLabel).toBeNull()
  })

  it('não gera missões quando nenhum componente aplicável perdeu pontos', () => {
    const r = calcularScoreOperacao(COMPLETO)
    expect(r.missoes).toHaveLength(0)
  })
})

describe('calcularScoreOperacao — componente ausente (Perfil) e redistribuição de peso', () => {
  it('Perfil nunca aparece nos componentes calculados e vem reportado em omitidos', () => {
    const r = calcularScoreOperacao(ZERADO)
    expect(r.componentes.some((c) => (c as { chave: string }).chave === 'perfil')).toBe(false)
    expect(r.omitidos).toHaveLength(1)
    expect(r.omitidos[0].chave).toBe('perfil')
  })

  it('com só Frequência no teto, o total considera peso base 90 (sem Perfil), não 100', () => {
    const agregados: AgregadosScoreOperacao = {
      ...ZERADO,
      interacoes7d: 20, // 30/30
      leads30dTotal: 1, // mantém Velocidade aplicável (0/1) pra isolar só a ausência do Perfil
      leadsTotal: 1,
      unidadesTotal: 1,
    }
    const r = calcularScoreOperacao(agregados)
    // round(100 * 30 / 90) = 33, não 30 (que seria o caso se o denominador fosse 100)
    expect(r.total).toBe(33)
  })

  it('com Velocidade também não-aplicável, o denominador cai pra 75 (sem Perfil nem Velocidade)', () => {
    const agregados: AgregadosScoreOperacao = {
      ...ZERADO,
      interacoes7d: 20, // 30/30
      leads30dTotal: 0, // velocidade não-aplicável
      leadsTotal: 1,
      unidadesTotal: 1,
    }
    const r = calcularScoreOperacao(agregados)
    // round(100 * 30 / 75) = 40
    expect(r.total).toBe(40)
  })
})

describe('calcularScoreOperacao — arredondamento', () => {
  it('arredonda cada componente e o total de forma consistente (.5 pra cima)', () => {
    const agregados: AgregadosScoreOperacao = {
      ...ZERADO,
      interacoes7d: 7, // 7/20*30 = 10.5 -> 11
      leadsTotal: 1,
      unidadesTotal: 1,
    }
    const r = calcularScoreOperacao(agregados)
    const freq = r.componentes.find((c) => c.chave === 'frequencia')!
    expect(freq.pontos).toBe(11)
  })

  it('nunca deixa um componente aplicável passar do próprio teto por causa do arredondamento', () => {
    const r = calcularScoreOperacao({ ...COMPLETO, interacoes7d: 999, unidadesAtivas: 999 })
    for (const c of r.componentes) {
      if (c.pontos !== null) {
        expect(c.pontos).toBeLessThanOrEqual(c.maximo)
        expect(c.pontos).toBeGreaterThanOrEqual(0)
      }
    }
  })
})
