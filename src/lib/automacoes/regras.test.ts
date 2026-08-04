import { describe, expect, it } from 'vitest'
import { leadCasaNaRegra, type LeadParaRegra, type RegraAutomacao } from './regras'

function regraBase(overrides: Partial<RegraAutomacao> = {}): RegraAutomacao {
  return {
    id: 'r1',
    nome: 'Regra de teste',
    ativo: true,
    gatilho_tipo: 'score_acima',
    gatilho_params: { score: 70 },
    filtro_estagio: null,
    acao_tipo: 'notificar_stiven',
    acao_params: {},
    ...overrides,
  }
}

function leadBase(overrides: Partial<LeadParaRegra> = {}): LeadParaRegra {
  return {
    id: 'lead-1',
    estagio_funil: 'qualificado',
    lead_score: 50,
    diasNoEstagioAtual: null,
    diasSemResposta: null,
    ...overrides,
  }
}

describe('leadCasaNaRegra — score_acima', () => {
  it('casa quando o score é maior ou igual ao mínimo', () => {
    const regra = regraBase({ gatilho_tipo: 'score_acima', gatilho_params: { score: 70 } })
    expect(leadCasaNaRegra(leadBase({ lead_score: 70 }), regra)).toBe(true)
    expect(leadCasaNaRegra(leadBase({ lead_score: 90 }), regra)).toBe(true)
  })

  it('não casa quando o score é menor que o mínimo', () => {
    const regra = regraBase({ gatilho_tipo: 'score_acima', gatilho_params: { score: 70 } })
    expect(leadCasaNaRegra(leadBase({ lead_score: 69 }), regra)).toBe(false)
  })

  it('não casa quando lead_score é null (dado desconhecido)', () => {
    const regra = regraBase({ gatilho_tipo: 'score_acima', gatilho_params: { score: 70 } })
    expect(leadCasaNaRegra(leadBase({ lead_score: null }), regra)).toBe(false)
  })

  it('não casa quando o parâmetro da regra está malformado', () => {
    const regra = regraBase({ gatilho_tipo: 'score_acima', gatilho_params: { score: 'oitenta' } })
    expect(leadCasaNaRegra(leadBase({ lead_score: 90 }), regra)).toBe(false)
  })
})

describe('leadCasaNaRegra — estagio_parado_dias', () => {
  it('casa quando dias parado >= mínimo configurado', () => {
    const regra = regraBase({ gatilho_tipo: 'estagio_parado_dias', gatilho_params: { dias: 3 } })
    expect(leadCasaNaRegra(leadBase({ diasNoEstagioAtual: 3 }), regra)).toBe(true)
    expect(leadCasaNaRegra(leadBase({ diasNoEstagioAtual: 10 }), regra)).toBe(true)
  })

  it('não casa quando ainda não passou o mínimo de dias', () => {
    const regra = regraBase({ gatilho_tipo: 'estagio_parado_dias', gatilho_params: { dias: 3 } })
    expect(leadCasaNaRegra(leadBase({ diasNoEstagioAtual: 2 }), regra)).toBe(false)
  })
})

describe('leadCasaNaRegra — sem_resposta_dias', () => {
  it('casa quando dias sem resposta >= mínimo', () => {
    const regra = regraBase({ gatilho_tipo: 'sem_resposta_dias', gatilho_params: { dias: 5 } })
    expect(leadCasaNaRegra(leadBase({ diasSemResposta: 5 }), regra)).toBe(true)
  })

  it('não casa quando o dado ainda não foi calculado (null)', () => {
    const regra = regraBase({ gatilho_tipo: 'sem_resposta_dias', gatilho_params: { dias: 5 } })
    expect(leadCasaNaRegra(leadBase({ diasSemResposta: null }), regra)).toBe(false)
  })
})

describe('leadCasaNaRegra — filtro_estagio', () => {
  it('restringe a regra aos estágios listados', () => {
    const regra = regraBase({
      gatilho_tipo: 'score_acima',
      gatilho_params: { score: 0 },
      filtro_estagio: ['proposta_enviada', 'negociacao'],
    })
    expect(leadCasaNaRegra(leadBase({ estagio_funil: 'qualificado', lead_score: 100 }), regra)).toBe(false)
    expect(leadCasaNaRegra(leadBase({ estagio_funil: 'proposta_enviada', lead_score: 100 }), regra)).toBe(true)
  })

  it('filtro_estagio vazio ou null não restringe nada', () => {
    const regra = regraBase({ gatilho_tipo: 'score_acima', gatilho_params: { score: 0 }, filtro_estagio: [] })
    expect(leadCasaNaRegra(leadBase({ estagio_funil: 'qualquer_coisa', lead_score: 100 }), regra)).toBe(true)
  })
})
