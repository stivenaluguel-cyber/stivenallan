import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { evolutionHolder } = vi.hoisted(() => ({
  evolutionHolder: {
    enviarMensagem: vi.fn(async (..._args: unknown[]) => true),
    enviarAlertaEscalada: vi.fn(async (..._args: unknown[]) => undefined),
  },
}))

vi.mock('@/lib/evolution', () => ({
  enviarMensagem: (para: string, texto: string) => evolutionHolder.enviarMensagem(para, texto),
  enviarAlertaEscalada: (whatsapp: string, nome: string | null, score: number) =>
    evolutionHolder.enviarAlertaEscalada(whatsapp, nome, score),
}))

import { executarAcao, leadCasaNaRegra, type ContextoAcao, type LeadParaRegra, type RegraAutomacao } from './regras'

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

function fakeSupabase(cfg: { interacoesCount24h?: number } = {}) {
  const leadsUpdates: Record<string, unknown>[] = []
  const leadsInteracoesInserts: Record<string, unknown>[] = []
  const interacoesInserts: Record<string, unknown>[] = []
  return {
    leadsUpdates,
    leadsInteracoesInserts,
    interacoesInserts,
    from(table: string) {
      if (table === 'interacoes') {
        return {
          select: () => {
            const chain = { eq: () => chain, gte: async () => ({ count: cfg.interacoesCount24h ?? 0, error: null }) }
            return chain
          },
          insert: async (row: Record<string, unknown>) => {
            interacoesInserts.push(row)
            return { error: null }
          },
        }
      }
      if (table === 'leads') {
        return {
          update: (row: Record<string, unknown>) => {
            leadsUpdates.push(row)
            return { eq: async () => ({ error: null }) }
          },
        }
      }
      if (table === 'leads_interacoes') {
        return {
          insert: async (row: Record<string, unknown>) => {
            leadsInteracoesInserts.push(row)
            return { error: null }
          },
        }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
  }
}

// Cast só na fronteira de chamada (não no retorno de fakeSupabase) — assim o
// tipo inferido de `supabase` nos testes continua sendo o objeto rico (com
// interacoesInserts/leadsUpdates), não SupabaseClient, e as asserções abaixo
// não precisam recastear.
function comoSupabaseClient(mock: ReturnType<typeof fakeSupabase>) {
  return mock as unknown as import('@supabase/supabase-js').SupabaseClient
}

function ctxBase(overrides: Partial<ContextoAcao> = {}): ContextoAcao {
  return { leadId: 'lead-1', whatsapp: '48991642332', nome: 'Ana', leadScore: 50, ...overrides }
}

describe('executarAcao — enviar_whatsapp — trava da automação proativa', () => {
  const originalFlag = process.env.FOLLOWUP_AUTOMATICO_ATIVO

  beforeEach(() => {
    evolutionHolder.enviarMensagem.mockClear()
    evolutionHolder.enviarAlertaEscalada.mockClear()
  })

  afterEach(() => {
    if (originalFlag === undefined) delete process.env.FOLLOWUP_AUTOMATICO_ATIVO
    else process.env.FOLLOWUP_AUTOMATICO_ATIVO = originalFlag
  })

  it('bloqueia e não chama enviarMensagem quando FOLLOWUP_AUTOMATICO_ATIVO está ausente', async () => {
    delete process.env.FOLLOWUP_AUTOMATICO_ATIVO
    const regra = regraBase({ acao_tipo: 'enviar_whatsapp', acao_params: { mensagem: 'Oi {nome}!' } })
    const supabase = fakeSupabase()

    const ok = await executarAcao(comoSupabaseClient(supabase), ctxBase(), regra)

    expect(ok).toBe(false)
    expect(evolutionHolder.enviarMensagem).not.toHaveBeenCalled()
  })

  it('envia e loga a interação quando a flag está ligada e dentro do teto diário', async () => {
    process.env.FOLLOWUP_AUTOMATICO_ATIVO = 'true'
    const regra = regraBase({ id: 'regra-envio', nome: 'Score alto', acao_tipo: 'enviar_whatsapp', acao_params: { mensagem: 'Oi {nome}!' } })
    const supabase = fakeSupabase({ interacoesCount24h: 0 })

    const ok = await executarAcao(comoSupabaseClient(supabase), ctxBase({ nome: 'Ana Paula' }), regra)

    expect(ok).toBe(true)
    expect(evolutionHolder.enviarMensagem).toHaveBeenCalledTimes(1)
    expect(evolutionHolder.enviarMensagem).toHaveBeenCalledWith('48991642332', 'Oi Ana!')
    expect(supabase.interacoesInserts).toHaveLength(1)
  })

  it('continua respeitando o teto diário mesmo com a automação ligada', async () => {
    process.env.FOLLOWUP_AUTOMATICO_ATIVO = 'true'
    const regra = regraBase({ acao_tipo: 'enviar_whatsapp', acao_params: { mensagem: 'Oi {nome}!' } })
    const supabase = fakeSupabase({ interacoesCount24h: 8 })

    const ok = await executarAcao(comoSupabaseClient(supabase), ctxBase(), regra)

    expect(ok).toBe(false)
    expect(evolutionHolder.enviarMensagem).not.toHaveBeenCalled()
  })

  it('mover_estagio funciona normalmente com a automação desligada — não manda mensagem pra lead', async () => {
    delete process.env.FOLLOWUP_AUTOMATICO_ATIVO
    const regra = regraBase({ acao_tipo: 'mover_estagio', acao_params: { estagio_funil: 'qualificado' } })
    const supabase = fakeSupabase()

    const ok = await executarAcao(comoSupabaseClient(supabase), ctxBase(), regra)

    expect(ok).toBe(true)
    expect(supabase.leadsUpdates).toHaveLength(1)
    expect(evolutionHolder.enviarMensagem).not.toHaveBeenCalled()
  })

  it('notificar_stiven funciona normalmente com a automação desligada — alerta é pro corretor, não pro lead', async () => {
    delete process.env.FOLLOWUP_AUTOMATICO_ATIVO
    const regra = regraBase({ acao_tipo: 'notificar_stiven', acao_params: {} })
    const supabase = fakeSupabase()

    const ok = await executarAcao(comoSupabaseClient(supabase), ctxBase(), regra)

    expect(ok).toBe(true)
    expect(evolutionHolder.enviarAlertaEscalada).toHaveBeenCalledTimes(1)
  })
})
