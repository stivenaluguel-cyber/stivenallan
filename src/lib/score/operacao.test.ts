import { describe, it, expect } from 'vitest'
import { calcularScoreOperacao, type AgregadosScoreOperacao } from './operacao'

const ZERADO: AgregadosScoreOperacao = {
  followups7d: 0,
  empreendimentosComLead90d: 0,
  leads30dTotal: 0,
  leads30dAtendidos1h: 0,
  leadsParados: 0,
  leadsTotal: 0,
  unidadesTotal: 0,
}

const COMPLETO: AgregadosScoreOperacao = {
  followups7d: 25,
  empreendimentosComLead90d: 10,
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
      followups7d: 10, // metade do teto de 20 -> 15/30
      empreendimentosComLead90d: 4, // 5 + (4-1)/7*15 = 11.42 -> 11
      leads30dTotal: 4,
      leads30dAtendidos1h: 2, // 50% de 15 -> 7.5 -> 8
      leadsParados: 6,
      leadsTotal: 12,
      unidadesTotal: 200,
    }
    const r = calcularScoreOperacao(agregados)

    const porChave = Object.fromEntries(r.componentes.map((c) => [c.chave, c]))
    expect(porChave.frequencia.pontos).toBe(15)
    expect(porChave.diversificacao.pontos).toBe(11)
    expect(porChave.velocidade.pontos).toBe(8)

    // total = round(100 * (15+11+8) / (30+20+15)) = round(100*34/65)
    expect(r.total).toBe(52)
    expect(r.faixa).toBe('morno')
    expect(r.contaNova).toBe(false)
  })

  it('gera até 3 missões ordenadas pelos pontos perdidos, com número real de leads parados', () => {
    const agregados: AgregadosScoreOperacao = {
      followups7d: 0,
      empreendimentosComLead90d: 8,
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

  it('concorda no singular quando só 1 lead parado', () => {
    const r = calcularScoreOperacao({ ...ZERADO, leadsParados: 1, leadsTotal: 1, unidadesTotal: 1 })
    expect(r.missoes[0].texto).toBe('Registre follow-up em 1 lead que precisa de atenção')
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

describe('calcularScoreOperacao — componentes ausentes (Perfil e Portfólio) e redistribuição de peso', () => {
  it('Perfil e Portfólio nunca aparecem nos componentes calculados e vêm reportados em omitidos', () => {
    const r = calcularScoreOperacao(ZERADO)
    const chaves = r.componentes.map((c) => c.chave)
    expect(chaves).toEqual(['frequencia', 'diversificacao', 'velocidade'])
    expect(r.omitidos.map((o) => o.chave).sort()).toEqual(['perfil', 'portfolio'])
  })

  it('com só Frequência no teto, o total considera peso base 65 (sem Perfil nem Portfólio), não 100', () => {
    const agregados: AgregadosScoreOperacao = {
      ...ZERADO,
      followups7d: 20, // 30/30
      leads30dTotal: 1, // mantém Velocidade aplicável (0/1) pra isolar só a ausência de Perfil/Portfólio
      leadsTotal: 1,
      unidadesTotal: 1,
    }
    const r = calcularScoreOperacao(agregados)
    // round(100 * 30 / 65) = 46, não 30 (que seria o caso se o denominador fosse 100)
    expect(r.total).toBe(46)
  })

  it('com Velocidade também não-aplicável, o denominador cai pra 50 (só Frequência + Diversificação)', () => {
    const agregados: AgregadosScoreOperacao = {
      ...ZERADO,
      followups7d: 20, // 30/30
      leads30dTotal: 0, // velocidade não-aplicável
      leadsTotal: 1,
      unidadesTotal: 1,
    }
    const r = calcularScoreOperacao(agregados)
    // round(100 * 30 / 50) = 60
    expect(r.total).toBe(60)
  })
})

describe('calcularScoreOperacao — diversificação (teto em 8 empreendimentos)', () => {
  it('0 empreendimentos = 0 pts', () => {
    const r = calcularScoreOperacao({ ...ZERADO, empreendimentosComLead90d: 0, leadsTotal: 1, unidadesTotal: 1 })
    expect(r.componentes.find((c) => c.chave === 'diversificacao')!.pontos).toBe(0)
  })

  it('1 empreendimento = 5 pts (piso)', () => {
    const r = calcularScoreOperacao({ ...ZERADO, empreendimentosComLead90d: 1, leadsTotal: 1, unidadesTotal: 1 })
    expect(r.componentes.find((c) => c.chave === 'diversificacao')!.pontos).toBe(5)
  })

  it('8 ou mais empreendimentos = 20 pts (teto)', () => {
    const r8 = calcularScoreOperacao({ ...ZERADO, empreendimentosComLead90d: 8, leadsTotal: 1, unidadesTotal: 1 })
    const r20 = calcularScoreOperacao({ ...ZERADO, empreendimentosComLead90d: 20, leadsTotal: 1, unidadesTotal: 1 })
    expect(r8.componentes.find((c) => c.chave === 'diversificacao')!.pontos).toBe(20)
    expect(r20.componentes.find((c) => c.chave === 'diversificacao')!.pontos).toBe(20)
  })
})

describe('calcularScoreOperacao — arredondamento', () => {
  it('arredonda cada componente e o total de forma consistente (.5 pra cima)', () => {
    const agregados: AgregadosScoreOperacao = {
      ...ZERADO,
      followups7d: 7, // 7/20*30 = 10.5 -> 11
      leadsTotal: 1,
      unidadesTotal: 1,
    }
    const r = calcularScoreOperacao(agregados)
    const freq = r.componentes.find((c) => c.chave === 'frequencia')!
    expect(freq.pontos).toBe(11)
  })

  it('nunca deixa um componente aplicável passar do próprio teto por causa do arredondamento', () => {
    const r = calcularScoreOperacao({ ...COMPLETO, followups7d: 999, empreendimentosComLead90d: 999 })
    for (const c of r.componentes) {
      if (c.pontos !== null) {
        expect(c.pontos).toBeLessThanOrEqual(c.maximo)
        expect(c.pontos).toBeGreaterThanOrEqual(0)
      }
    }
  })
})
