import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { createHolder, buscaHolder, supabaseFromMock, registrarMudancaEstagioMock } = vi.hoisted(() => ({
  createHolder: vi.fn(),
  buscaHolder: { buscar: vi.fn(async (..._args: unknown[]) => [] as { id: string; pergunta: string; resposta: string }[]) },
  // Estável entre chamadas: getSupabase() em agent.ts cacheia o client uma
  // única vez (lazy singleton), então trocar o objeto inteiro por teste não
  // funcionaria — cada teste reconfigura o comportamento de supabaseFromMock
  // via mockImplementation, igual ao padrão já usado para createHolder acima.
  supabaseFromMock: vi.fn((_table: string): unknown => {
    throw new Error('supabaseFromMock não configurado neste teste')
  }),
  registrarMudancaEstagioMock: vi.fn(async () => {}),
}))

vi.mock('openai', () => ({
  default: class {
    chat = { completions: { create: (...args: unknown[]) => createHolder(...args) } }
  },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: supabaseFromMock }),
}))

vi.mock('@/lib/leads/base-conhecimento', async () => {
  const actual = await vi.importActual<typeof import('./leads/base-conhecimento')>('./leads/base-conhecimento')
  return {
    buscarConhecimentoRelevante: (...args: unknown[]) => buscaHolder.buscar(...args),
    montarBlocoContexto: actual.montarBlocoContexto,
  }
})

vi.mock('@/lib/leads/registrar-mudanca-estagio', () => ({
  registrarMudancaEstagio: registrarMudancaEstagioMock,
}))

beforeEach(() => {
  createHolder.mockReset().mockResolvedValue({
    choices: [{ finish_reason: 'stop', message: { content: 'resposta padrão' } }],
  })
  buscaHolder.buscar.mockReset().mockResolvedValue([])
  supabaseFromMock.mockReset().mockImplementation((_table: string) => {
    throw new Error('supabaseFromMock não configurado neste teste')
  })
  registrarMudancaEstagioMock.mockReset().mockResolvedValue(undefined)
  process.env.OPENAI_API_KEY = 'test-key'
})

afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.OPENAI_API_KEY
})

describe('processarMensagem — integração com a base de conhecimento (RAG leve)', () => {
  it('busca conhecimento relevante usando a mensagem do lead', async () => {
    const { processarMensagem } = await import('./agent')
    await processarMensagem('5548999999999', 'vocês aceitam financiamento direto?')

    expect(buscaHolder.buscar).toHaveBeenCalledTimes(1)
    expect(buscaHolder.buscar.mock.calls[0][1]).toBe('vocês aceitam financiamento direto?')
  })

  it('quando há conhecimento relevante, injeta o bloco de contexto no system prompt SEM substituir o prompt base', async () => {
    buscaHolder.buscar.mockResolvedValue([{ id: '1', pergunta: 'Aceita financiamento?', resposta: 'Sim, direto com a construtora.' }])
    const { processarMensagem } = await import('./agent')
    await processarMensagem('5548999999999', 'aceita financiamento?')

    const chamada = createHolder.mock.calls[0][0] as { messages: Array<{ role: string; content: string }> }
    const systemMsg = chamada.messages.find((m) => m.role === 'system')
    expect(systemMsg?.content).toContain('Voce e Allan IA') // prompt base preservado
    expect(systemMsg?.content).toContain('CONTEXTO DE ATENDIMENTOS ANTERIORES')
    expect(systemMsg?.content).toContain('Sim, direto com a construtora.')
  })

  it('quando não há conhecimento relevante, o system prompt fica igual ao original (sem bloco extra)', async () => {
    buscaHolder.buscar.mockResolvedValue([])
    const { processarMensagem } = await import('./agent')
    await processarMensagem('5548999999999', 'oi')

    const chamada = createHolder.mock.calls[0][0] as { messages: Array<{ role: string; content: string }> }
    const systemMsg = chamada.messages.find((m) => m.role === 'system')
    expect(systemMsg?.content).not.toContain('CONTEXTO DE ATENDIMENTOS ANTERIORES')
  })

  it('retorna a resposta final normalmente quando o modelo não chama nenhuma tool', async () => {
    const { processarMensagem } = await import('./agent')
    const resposta = await processarMensagem('5548999999999', 'oi')
    expect(resposta).toBe('resposta padrão')
  })
})

// ============================================
// Item 9 — executarTool: mass assignment, WhatsApp canônico, erro ≠ sucesso
// Item 10B — executarTool: agendar_visita grava em crm_agenda
// ============================================
type ErroSimulado = { message: string; code?: string }
type Resultado<T> = { data: T; error: ErroSimulado | null }

function selectBuilder<T>(resultado: Resultado<T>) {
  const b = {
    eq(..._a: unknown[]) { return b },
    ilike(..._a: unknown[]) { return b },
    lte(..._a: unknown[]) { return b },
    gte(..._a: unknown[]) { return b },
    limit(..._a: unknown[]) { return Promise.resolve(resultado) },
    maybeSingle() { return Promise.resolve(resultado) },
    single() { return Promise.resolve(resultado) },
    // Thenable direto (sem .limit()) — espelha o postgrest-js real, onde a
    // query é awaitable em qualquer ponto da cadeia. Necessário desde que
    // buscar_empreendimentos passou a dar `await query` sem `.limit()`
    // quando precisa filtrar suítes em memória (busca o lote inteiro).
    then(onFulfilled: (v: Resultado<T>) => void) { onFulfilled(resultado) },
  }
  return b
}

function configurarSupabase(cfg: {
  properties?: Resultado<unknown>
  // Resultado da query de validação de UMA property (agendar_visita, select
  // por slug + maybeSingle). Cai pra `properties` se ausente.
  propriedade?: Resultado<unknown>
  leadsSelect?: Resultado<unknown>
  leadsUpdate?: { error: ErroSimulado | null }
  leadsInsert?: { error: ErroSimulado | null }
  agendamentosInsert?: { error: ErroSimulado | null }
  // Uma entrada por chamada CONSECUTIVA de crm_agenda.select(...).eq('client_event_id', ...).
  // A 1a é o pré-check de idempotência; se o INSERT devolver 23505, a 2a
  // (se existir) é a tentativa de recuperação da linha. Índice trava no
  // último item se houver menos entradas que chamadas.
  agendaSelectSequencia?: Resultado<unknown>[]
  agendaInsert?: { data: unknown; error: ErroSimulado | null }
}) {
  const leadsUpdatePayloads: Record<string, unknown>[] = []
  const leadsInsertPayloads: Record<string, unknown>[] = []
  const agendamentosInsertPayloads: Record<string, unknown>[] = []
  const crmAgendaInsertPayloads: Record<string, unknown>[] = []
  const agendaSelectSequencia = cfg.agendaSelectSequencia ?? [{ data: null, error: null }]
  let agendaSelectChamada = 0

  supabaseFromMock.mockImplementation((table: string) => {
    if (table === 'properties') {
      return { select: (..._a: unknown[]) => selectBuilder(cfg.propriedade ?? cfg.properties ?? { data: [], error: null }) }
    }
    if (table === 'leads') {
      return {
        select: (..._a: unknown[]) => selectBuilder(cfg.leadsSelect ?? { data: null, error: null }),
        update: (payload: Record<string, unknown>) => {
          leadsUpdatePayloads.push(payload)
          return { eq: (..._a: unknown[]) => Promise.resolve(cfg.leadsUpdate ?? { error: null }) }
        },
        insert: (payload: Record<string, unknown>) => {
          leadsInsertPayloads.push(payload)
          return Promise.resolve(cfg.leadsInsert ?? { error: null })
        },
      }
    }
    if (table === 'crm_agenda') {
      return {
        select: (..._a: unknown[]) => {
          const idx = Math.min(agendaSelectChamada, agendaSelectSequencia.length - 1)
          agendaSelectChamada++
          return selectBuilder(agendaSelectSequencia[idx])
        },
        insert: (payload: Record<string, unknown>) => {
          crmAgendaInsertPayloads.push(payload)
          return {
            select: (..._a: unknown[]) => ({
              single: () => Promise.resolve(cfg.agendaInsert ?? { data: null, error: { message: 'agendaInsert não configurado neste teste' } }),
            }),
          }
        },
      }
    }
    if (table === 'agendamentos') {
      return {
        insert: (payload: Record<string, unknown>) => {
          agendamentosInsertPayloads.push(payload)
          return Promise.resolve(cfg.agendamentosInsert ?? { error: null })
        },
      }
    }
    throw new Error(`tabela inesperada no teste: ${table}`)
  })

  return { leadsUpdatePayloads, leadsInsertPayloads, agendamentosInsertPayloads, crmAgendaInsertPayloads }
}

const WHATSAPP_CANONICO = '5548911112222'

describe('maximoSuitesTexto (helper puro)', () => {
  it.each([
    ['2', 2],
    ['1 a 2', 2],
    ['1 e 2', 2],
    ['1/2', 2],
    ['2 suítes', 2],
    ['2 suites', 2],
    ['2 (1 master)', 2],
  ])('"%s" → máximo %i', async (texto, esperado) => {
    const { maximoSuitesTexto } = await import('./agent')
    expect(maximoSuitesTexto(texto)).toBe(esperado)
  })

  it.each([
    [null, 'null'],
    ['', 'string vazia'],
    ['sob consulta', 'texto sem número'],
  ])('%s (%s) → desconhecido (undefined)', async (texto, _rotulo) => {
    const { maximoSuitesTexto } = await import('./agent')
    expect(maximoSuitesTexto(texto)).toBeUndefined()
  })
})

describe('executarTool — buscar_empreendimentos', () => {
  it('A) suites_min=2 filtra corretamente mesmo com "suites" armazenado como texto', async () => {
    const { executarTool } = await import('./agent')
    configurarSupabase({
      properties: {
        data: [
          { nome: 'Studio X', slug: 'studio-x', cidade: 'Criciuma', bairro: 'Centro', preco: 300000, exibir_preco: true, dormitorios: '1', suites: '1', metragem: '40', status: 'disponivel' },
          { nome: 'Duplex Y', slug: 'duplex-y', cidade: 'Criciuma', bairro: 'Centro', preco: 900000, exibir_preco: true, dormitorios: '3', suites: '3', metragem: '120', status: 'disponivel' },
        ],
        error: null,
      },
    })

    const resultado = await executarTool('buscar_empreendimentos', { suites_min: 2 }, WHATSAPP_CANONICO)

    expect(resultado).toContain('Duplex Y')
    expect(resultado).not.toContain('Studio X')
  })

  it('A2) suites_min=2 + suites="1 a 2" (faixa): inclui', async () => {
    const { executarTool } = await import('./agent')
    configurarSupabase({
      properties: {
        data: [{ nome: 'Flex Z', slug: 'flex-z', cidade: 'Criciuma', bairro: 'Centro', preco: 400000, exibir_preco: true, dormitorios: '2', suites: '1 a 2', metragem: '60', status: 'disponivel' }],
        error: null,
      },
    })

    const resultado = await executarTool('buscar_empreendimentos', { suites_min: 2 }, WHATSAPP_CANONICO)
    expect(resultado).toContain('Flex Z')
  })

  it('A3) suites_min=3 + suites="1 a 2" (faixa): exclui', async () => {
    const { executarTool } = await import('./agent')
    configurarSupabase({
      properties: {
        data: [{ nome: 'Flex Z', slug: 'flex-z', cidade: 'Criciuma', bairro: 'Centro', preco: 400000, exibir_preco: true, dormitorios: '2', suites: '1 a 2', metragem: '60', status: 'disponivel' }],
        error: null,
      },
    })

    const resultado = await executarTool('buscar_empreendimentos', { suites_min: 3 }, WHATSAPP_CANONICO)
    expect(resultado).not.toContain('Flex Z')
    expect(resultado).toBe('Nenhum empreendimento encontrado com esses filtros.')
  })

  it('A4) suites_min=2 + suites=null: exclui (suíte desconhecida não satisfaz filtro > 0)', async () => {
    const { executarTool } = await import('./agent')
    configurarSupabase({
      properties: {
        data: [{ nome: 'Sem Info', slug: 'sem-info', cidade: 'Criciuma', bairro: 'Centro', preco: 400000, exibir_preco: true, dormitorios: '2', suites: null, metragem: '60', status: 'disponivel' }],
        error: null,
      },
    })

    const resultado = await executarTool('buscar_empreendimentos', { suites_min: 2 }, WHATSAPP_CANONICO)
    expect(resultado).not.toContain('Sem Info')
  })

  it('A5) suites_min=0 + suites=null: NÃO exclui só por esse filtro', async () => {
    const { executarTool } = await import('./agent')
    configurarSupabase({
      properties: {
        data: [{ nome: 'Sem Info', slug: 'sem-info', cidade: 'Criciuma', bairro: 'Centro', preco: 400000, exibir_preco: true, dormitorios: '2', suites: null, metragem: '60', status: 'disponivel' }],
        error: null,
      },
    })

    const resultado = await executarTool('buscar_empreendimentos', { suites_min: 0 }, WHATSAPP_CANONICO)
    expect(resultado).toContain('Sem Info')
  })

  it('B) suites_min ausente não filtra nada além dos padrões (ativo/oculto)', async () => {
    const { executarTool } = await import('./agent')
    configurarSupabase({
      properties: {
        data: [
          { nome: 'Studio X', slug: 'studio-x', cidade: 'Criciuma', bairro: 'Centro', preco: 300000, exibir_preco: true, dormitorios: '1', suites: '1', metragem: '40', status: 'disponivel' },
        ],
        error: null,
      },
    })

    const resultado = await executarTool('buscar_empreendimentos', {}, WHATSAPP_CANONICO)
    expect(resultado).toContain('Studio X')
  })

  it('C) erro real do Supabase NÃO retorna "Nenhum empreendimento encontrado..."', async () => {
    const { executarTool } = await import('./agent')
    configurarSupabase({ properties: { data: null, error: { message: 'connection refused' } } })

    const resultado = await executarTool('buscar_empreendimentos', {}, WHATSAPP_CANONICO)

    expect(resultado).not.toContain('Nenhum empreendimento encontrado')
    expect(resultado.toLowerCase()).not.toContain('connection refused')
  })
})

describe('executarTool — atualizar_lead', () => {
  it('D) args tentando enviar outro whatsapp é ignorado — banco sempre usa o WhatsApp canônico da conversa', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: { data: { id: 'lead-1' }, error: null } })

    await executarTool('atualizar_lead', { whatsapp: '5599999999999', nome: 'Ana' }, WHATSAPP_CANONICO)

    expect(sb.leadsUpdatePayloads[0]).not.toHaveProperty('whatsapp')
  })

  it('E) campos arbitrários/server-owned (id, created_at, lead_score, alguma_coisa) nunca entram no payload', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: { data: { id: 'lead-1' }, error: null } })

    await executarTool('atualizar_lead', {
      id: 'outro-id',
      created_at: '2020-01-01T00:00:00Z',
      lead_score: 100,
      alguma_coisa: 'valor qualquer',
      nome: 'Ana',
    }, WHATSAPP_CANONICO)

    const sent = sb.leadsUpdatePayloads[0]
    expect(sent).not.toHaveProperty('id')
    expect(sent).not.toHaveProperty('created_at')
    expect(sent).not.toHaveProperty('lead_score')
    expect(sent).not.toHaveProperty('alguma_coisa')
    expect(sent.nome).toBe('Ana')
  })

  it('F) campos legítimos entram corretamente no payload', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: { data: { id: 'lead-1' }, error: null } })

    await executarTool('atualizar_lead', {
      nome: 'Ana',
      perfil: 'investidor',
      orcamento_min: 200000,
      orcamento_max: 500000,
      prazo_compra: '6_meses',
      estagio_funil: 'qualificado',
      observacoes_ia: 'cliente interessado em cobertura',
    }, WHATSAPP_CANONICO)

    expect(sb.leadsUpdatePayloads[0]).toMatchObject({
      nome: 'Ana',
      perfil: 'investidor',
      orcamento_min: 200000,
      orcamento_max: 500000,
      prazo_compra: '6_meses',
      estagio_funil: 'qualificado',
      observacoes_ia: 'cliente interessado em cobertura',
    })
  })

  it('F2) empreendimento_interesse enviado manualmente em args é ignorado — não existe fonte legítima (FK pra tabela legada, sem ligação com properties)', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: { data: { id: 'lead-1' }, error: null } })

    const resultado = await executarTool('atualizar_lead', {
      empreendimento_interesse: 'qualquer-coisa',
      nome: 'Ana',
    }, WHATSAPP_CANONICO)

    const sent = sb.leadsUpdatePayloads[0]
    expect(sent).not.toHaveProperty('empreendimento_interesse')
    expect(sent.nome).toBe('Ana')
    expect(resultado).toBe('Lead atualizado no CRM.')
  })

  it('G) erro real no SELECT não tenta insert e não retorna sucesso', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: { data: null, error: { message: 'timeout' } } })

    const resultado = await executarTool('atualizar_lead', { nome: 'Ana' }, WHATSAPP_CANONICO)

    expect(sb.leadsInsertPayloads).toHaveLength(0)
    expect(sb.leadsUpdatePayloads).toHaveLength(0)
    expect(resultado).not.toContain('Lead atualizado no CRM.')
    expect(resultado).not.toContain('Lead criado no CRM.')
  })

  it('H) update falha não retorna "Lead atualizado no CRM."', async () => {
    const { executarTool } = await import('./agent')
    configurarSupabase({
      leadsSelect: { data: { id: 'lead-1' }, error: null },
      leadsUpdate: { error: { message: 'db down' } },
    })

    const resultado = await executarTool('atualizar_lead', { nome: 'Ana' }, WHATSAPP_CANONICO)
    expect(resultado).not.toBe('Lead atualizado no CRM.')
  })

  it('I) insert falha não retorna "Lead criado no CRM."', async () => {
    const { executarTool } = await import('./agent')
    configurarSupabase({
      leadsSelect: { data: null, error: null },
      leadsInsert: { error: { message: 'unique_violation' } },
    })

    const resultado = await executarTool('atualizar_lead', { nome: 'Ana' }, WHATSAPP_CANONICO)
    expect(resultado).not.toBe('Lead criado no CRM.')
  })

  it('J) insert de lead novo: created_at/updated_at/ultimo_contato são definidos pelo servidor', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: { data: null, error: null } })

    const antesMs = Date.now()
    const resultado = await executarTool('atualizar_lead', { nome: 'Ana' }, WHATSAPP_CANONICO)

    expect(resultado).toBe('Lead criado no CRM.')
    const sent = sb.leadsInsertPayloads[0]
    expect(sent.whatsapp).toBe(WHATSAPP_CANONICO)
    expect(typeof sent.created_at).toBe('string')
    expect(typeof sent.updated_at).toBe('string')
    expect(typeof sent.ultimo_contato).toBe('string')
    expect(new Date(sent.created_at as string).getTime()).toBeGreaterThanOrEqual(antesMs)
  })
})

describe('paraInstanteUtcAgendamento (helper puro — Item 10B)', () => {
  it('N) 14:30 em São Paulo (UTC-03:00) equivale a 17:30 UTC', async () => {
    const { paraInstanteUtcAgendamento } = await import('./agent')
    const instanteMs = paraInstanteUtcAgendamento('2026-08-10', '14:30')
    expect(instanteMs).toBeDefined()
    expect(new Date(instanteMs!).toISOString()).toBe('2026-08-10T17:30:00.000Z')
  })

  it('O) data impossível (31 de fevereiro) retorna undefined', async () => {
    const { paraInstanteUtcAgendamento } = await import('./agent')
    expect(paraInstanteUtcAgendamento('2026-02-31', '10:00')).toBeUndefined()
  })

  it('O2) mês 13 retorna undefined', async () => {
    const { paraInstanteUtcAgendamento } = await import('./agent')
    expect(paraInstanteUtcAgendamento('2026-13-10', '10:00')).toBeUndefined()
  })

  it('O3) dia 00 retorna undefined', async () => {
    const { paraInstanteUtcAgendamento } = await import('./agent')
    expect(paraInstanteUtcAgendamento('2026-08-00', '10:00')).toBeUndefined()
  })

  it('O4) 29 de fevereiro em ano bissexto (2028) é válido', async () => {
    const { paraInstanteUtcAgendamento } = await import('./agent')
    expect(paraInstanteUtcAgendamento('2028-02-29', '10:00')).toBeDefined()
  })

  it('O5) 29 de fevereiro em ano NÃO bissexto (2026) retorna undefined', async () => {
    const { paraInstanteUtcAgendamento } = await import('./agent')
    expect(paraInstanteUtcAgendamento('2026-02-29', '10:00')).toBeUndefined()
  })

  it('P) hora 25 retorna undefined', async () => {
    const { paraInstanteUtcAgendamento } = await import('./agent')
    expect(paraInstanteUtcAgendamento('2026-08-10', '25:00')).toBeUndefined()
  })

  it('P2) minuto 60 retorna undefined', async () => {
    const { paraInstanteUtcAgendamento } = await import('./agent')
    expect(paraInstanteUtcAgendamento('2026-08-10', '14:60')).toBeUndefined()
  })

  it('horário 23:30 (legítimo, vira o dia seguinte em UTC) continua válido', async () => {
    const { paraInstanteUtcAgendamento } = await import('./agent')
    const instanteMs = paraInstanteUtcAgendamento('2026-08-10', '23:30')
    expect(instanteMs).toBeDefined()
    expect(new Date(instanteMs!).toISOString()).toBe('2026-08-11T02:30:00.000Z')
  })
})

describe('paraDataHoraAgendamento (helper puro — Item 10B) — rejeita passado', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-08T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('Q) instante no passado retorna undefined', async () => {
    const { paraDataHoraAgendamento } = await import('./agent')
    expect(paraDataHoraAgendamento('2026-08-01', '10:00')).toBeUndefined()
  })

  it('instante futuro retorna ISO UTC válido', async () => {
    const { paraDataHoraAgendamento } = await import('./agent')
    expect(paraDataHoraAgendamento('2026-08-10', '14:30')).toBe('2026-08-10T17:30:00.000Z')
  })
})

describe('gerarClientEventIdAgendaIA (helper puro — Item 10B)', () => {
  it('J) produz um UUID válido', async () => {
    const { gerarClientEventIdAgendaIA } = await import('./agent')
    const id = gerarClientEventIdAgendaIA('lead-1', 'prop-1', '2026-08-10T17:30:00.000Z')
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('K) mesma tripla lead/property/início produz sempre o mesmo UUID', async () => {
    const { gerarClientEventIdAgendaIA } = await import('./agent')
    const a = gerarClientEventIdAgendaIA('lead-1', 'prop-1', '2026-08-10T17:30:00.000Z')
    const b = gerarClientEventIdAgendaIA('lead-1', 'prop-1', '2026-08-10T17:30:00.000Z')
    expect(a).toBe(b)
  })

  it('L) horário diferente produz UUID diferente', async () => {
    const { gerarClientEventIdAgendaIA } = await import('./agent')
    const a = gerarClientEventIdAgendaIA('lead-1', 'prop-1', '2026-08-10T17:30:00.000Z')
    const b = gerarClientEventIdAgendaIA('lead-1', 'prop-1', '2026-08-10T18:30:00.000Z')
    expect(a).not.toBe(b)
  })

  it('M) property diferente produz UUID diferente', async () => {
    const { gerarClientEventIdAgendaIA } = await import('./agent')
    const a = gerarClientEventIdAgendaIA('lead-1', 'prop-1', '2026-08-10T17:30:00.000Z')
    const b = gerarClientEventIdAgendaIA('lead-1', 'prop-2', '2026-08-10T17:30:00.000Z')
    expect(a).not.toBe(b)
  })

  it('lead diferente produz UUID diferente', async () => {
    const { gerarClientEventIdAgendaIA } = await import('./agent')
    const a = gerarClientEventIdAgendaIA('lead-1', 'prop-1', '2026-08-10T17:30:00.000Z')
    const b = gerarClientEventIdAgendaIA('lead-2', 'prop-1', '2026-08-10T17:30:00.000Z')
    expect(a).not.toBe(b)
  })
})

describe('executarTool — agendar_visita (Item 10B: crm_agenda)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-08T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const argsValidos = { empreendimento_slug: 'monte-leone', data_preferencia: '2026-08-10', horario_preferencia: '14:30' }
  const INICIO_ESPERADO = '2026-08-10T17:30:00.000Z'
  const propriedadeAtiva = {
    data: { id: 'prop-1', nome: 'Monte Leone', slug: 'monte-leone', endereco: 'Rua das Flores, 100', bairro: 'Centro', cidade: 'Criciúma' },
    error: null,
  }
  const leadQualificado = { data: { id: 'lead-1', estagio_funil: 'qualificado' }, error: null }
  const agendaInsertadaOk = { data: { id: 'agenda-1', status: 'agendado', property_id: 'prop-1', lead_id: 'lead-1', inicio: INICIO_ESPERADO }, error: null }

  it('A) agenda visita nova: insere em crm_agenda', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: leadQualificado, propriedade: propriedadeAtiva, agendaInsert: agendaInsertadaOk })

    const resultado = await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)

    expect(resultado).toContain('Visita registrada')
    expect(sb.crmAgendaInsertPayloads).toHaveLength(1)
  })

  it('B) zero INSERT na tabela legada agendamentos', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: leadQualificado, propriedade: propriedadeAtiva, agendaInsert: agendaInsertadaOk })

    await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)
    expect(sb.agendamentosInsertPayloads).toHaveLength(0)
  })

  it('C/D/E/F) payload contém lead_id, property_id, status=agendado, tipo=visita', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: leadQualificado, propriedade: propriedadeAtiva, agendaInsert: agendaInsertadaOk })

    await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)

    const payload = sb.crmAgendaInsertPayloads[0]
    expect(payload.lead_id).toBe('lead-1')
    expect(payload.property_id).toBe('prop-1')
    expect(payload.status).toBe('agendado')
    expect(payload.tipo).toBe('visita')
    expect(payload.inicio).toBe(INICIO_ESPERADO)
  })

  it('G) título contém o nome da property', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: leadQualificado, propriedade: propriedadeAtiva, agendaInsert: agendaInsertadaOk })

    await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)
    expect(sb.crmAgendaInsertPayloads[0].titulo).toContain('Monte Leone')
  })

  it('H) local usa o endereço da property quando disponível', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: leadQualificado, propriedade: propriedadeAtiva, agendaInsert: agendaInsertadaOk })

    await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)
    expect(sb.crmAgendaInsertPayloads[0].local).toBe('Rua das Flores, 100')
  })

  it('I) sem endereço, local cai no fallback bairro/cidade', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({
      leadsSelect: leadQualificado,
      propriedade: { data: { id: 'prop-1', nome: 'Monte Leone', slug: 'monte-leone', endereco: null, bairro: 'Centro', cidade: 'Criciúma' }, error: null },
      agendaInsert: agendaInsertadaOk,
    })

    await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)
    expect(sb.crmAgendaInsertPayloads[0].local).toBe('Centro, Criciúma')
  })

  it('J) client_event_id gravado é um UUID válido', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: leadQualificado, propriedade: propriedadeAtiva, agendaInsert: agendaInsertadaOk })

    await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)
    expect(sb.crmAgendaInsertPayloads[0].client_event_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('O) data impossível: não cria agenda', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({})
    const resultado = await executarTool('agendar_visita', { ...argsValidos, data_preferencia: '2026-02-31' }, WHATSAPP_CANONICO)
    expect(sb.crmAgendaInsertPayloads).toHaveLength(0)
    expect(resultado).not.toContain('Visita registrada')
  })

  it('P) horário impossível: não cria agenda', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({})
    const resultado = await executarTool('agendar_visita', { ...argsValidos, horario_preferencia: '25:00' }, WHATSAPP_CANONICO)
    expect(sb.crmAgendaInsertPayloads).toHaveLength(0)
    expect(resultado).not.toContain('Visita registrada')
  })

  it('Q) instante no passado: não cria agenda', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({})
    const resultado = await executarTool('agendar_visita', { ...argsValidos, data_preferencia: '2026-08-01' }, WHATSAPP_CANONICO)
    expect(sb.crmAgendaInsertPayloads).toHaveLength(0)
    expect(resultado).not.toContain('Visita registrada')
  })

  it('args tentando outro lead_whatsapp é ignorado — busca usa exclusivamente o WhatsApp canônico', async () => {
    const { executarTool } = await import('./agent')
    let whatsappUsadoNoEq: unknown
    supabaseFromMock.mockImplementation((table: string) => {
      if (table === 'leads') {
        return {
          select: () => ({
            eq: (_col: string, val: unknown) => {
              whatsappUsadoNoEq = val
              return { maybeSingle: () => Promise.resolve(leadQualificado) }
            },
          }),
          update: () => ({ eq: () => Promise.resolve({ error: null }) }),
        }
      }
      if (table === 'properties') return { select: () => selectBuilder(propriedadeAtiva) }
      if (table === 'crm_agenda') {
        return {
          select: () => selectBuilder({ data: null, error: null }),
          insert: () => ({ select: () => ({ single: () => Promise.resolve(agendaInsertadaOk) }) }),
        }
      }
      throw new Error(`tabela inesperada: ${table}`)
    })

    await executarTool('agendar_visita', { ...argsValidos, lead_whatsapp: '5599999999999' }, WHATSAPP_CANONICO)

    expect(whatsappUsadoNoEq).toBe(WHATSAPP_CANONICO)
    expect(whatsappUsadoNoEq).not.toBe('5599999999999')
  })

  it('lead não existe: não cria agendamento', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: { data: null, error: null } })

    const resultado = await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)

    expect(sb.crmAgendaInsertPayloads).toHaveLength(0)
    expect(resultado.toLowerCase()).toContain('não encontrado')
  })

  it('erro ao buscar lead: não cria agendamento e não retorna sucesso', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: { data: null, error: { message: 'timeout' } } })

    const resultado = await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)

    expect(sb.crmAgendaInsertPayloads).toHaveLength(0)
    expect(resultado).not.toContain('Visita registrada')
  })

  it('empreendimento inexistente/inativo: não agenda', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: leadQualificado, propriedade: { data: null, error: null } })

    const resultado = await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)

    expect(sb.crmAgendaInsertPayloads).toHaveLength(0)
    expect(resultado).not.toContain('Visita registrada')
  })

  it('R) evento idempotente já existente/agendado: zero insert, handoff pode ser concluído', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({
      leadsSelect: leadQualificado,
      propriedade: propriedadeAtiva,
      agendaSelectSequencia: [{ data: { id: 'agenda-existente', status: 'agendado', property_id: 'prop-1', lead_id: 'lead-1', inicio: INICIO_ESPERADO }, error: null }],
    })

    const resultado = await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)

    expect(sb.crmAgendaInsertPayloads).toHaveLength(0)
    expect(resultado).toContain('Visita registrada')
  })

  it('evento existente com status inativo (cancelado) NÃO é reaproveitado como nova visita', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({
      leadsSelect: leadQualificado,
      propriedade: propriedadeAtiva,
      agendaSelectSequencia: [{ data: { id: 'agenda-cancelada', status: 'cancelado', property_id: 'prop-1', lead_id: 'lead-1', inicio: INICIO_ESPERADO }, error: null }],
    })

    const resultado = await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)

    expect(sb.crmAgendaInsertPayloads).toHaveLength(0)
    expect(resultado).not.toContain('Visita registrada')
  })

  it('S) erro no SELECT de idempotência: zero insert, zero stage update', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({
      leadsSelect: leadQualificado,
      propriedade: propriedadeAtiva,
      agendaSelectSequencia: [{ data: null, error: { message: 'timeout' } }],
    })

    const resultado = await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)

    expect(sb.crmAgendaInsertPayloads).toHaveLength(0)
    expect(sb.leadsUpdatePayloads).toHaveLength(0)
    expect(resultado).not.toContain('Visita registrada')
  })

  it('T) INSERT sucesso: stage + handoff', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: leadQualificado, propriedade: propriedadeAtiva, agendaInsert: agendaInsertadaOk })

    await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)

    expect(sb.leadsUpdatePayloads[0]).toMatchObject({ estagio_funil: 'visita_agendada', atendimento_humano_ativo: true })
  })

  it('U) INSERT erro comum: zero stage/handoff', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({ leadsSelect: leadQualificado, propriedade: propriedadeAtiva, agendaInsert: { data: null, error: { message: 'db down' } } })

    const resultado = await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)

    expect(sb.leadsUpdatePayloads).toHaveLength(0)
    expect(resultado).not.toContain('Visita registrada')
    expect(registrarMudancaEstagioMock).not.toHaveBeenCalled()
  })

  it('V) INSERT 23505 + recuperação da linha: zero duplicação, prossegue para handoff', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({
      leadsSelect: leadQualificado,
      propriedade: propriedadeAtiva,
      agendaSelectSequencia: [
        { data: null, error: null },
        { data: { id: 'agenda-race', status: 'agendado', property_id: 'prop-1', lead_id: 'lead-1', inicio: INICIO_ESPERADO }, error: null },
      ],
      agendaInsert: { data: null, error: { message: 'duplicate key', code: '23505' } },
    })

    const resultado = await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)

    expect(sb.crmAgendaInsertPayloads).toHaveLength(1)
    expect(resultado).toContain('Visita registrada')
    expect(sb.leadsUpdatePayloads[0]).toMatchObject({ estagio_funil: 'visita_agendada' })
  })

  it('W) INSERT 23505 + recuperação falha: não retorna sucesso', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({
      leadsSelect: leadQualificado,
      propriedade: propriedadeAtiva,
      agendaSelectSequencia: [
        { data: null, error: null },
        { data: null, error: { message: 'timeout na recuperação' } },
      ],
      agendaInsert: { data: null, error: { message: 'duplicate key', code: '23505' } },
    })

    const resultado = await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)

    expect(resultado).not.toContain('Visita registrada')
    expect(sb.leadsUpdatePayloads).toHaveLength(0)
  })

  it('X) agenda persistida + stage update falha: falha parcial honesta', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({
      leadsSelect: leadQualificado,
      propriedade: propriedadeAtiva,
      agendaInsert: agendaInsertadaOk,
      leadsUpdate: { error: { message: 'db down' } },
    })

    const resultado = await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)

    expect(sb.crmAgendaInsertPayloads).toHaveLength(1)
    expect(resultado).not.toContain('Visita registrada')
    expect(resultado.toLowerCase()).toContain('escalad')
    expect(registrarMudancaEstagioMock).not.toHaveBeenCalled()
  })

  it('Y) retry depois de falha parcial: encontra agenda existente, não reinsere, conclui stage/handoff', async () => {
    const { executarTool } = await import('./agent')
    const sb = configurarSupabase({
      leadsSelect: leadQualificado,
      propriedade: propriedadeAtiva,
      agendaSelectSequencia: [{ data: { id: 'agenda-1', status: 'agendado', property_id: 'prop-1', lead_id: 'lead-1', inicio: INICIO_ESPERADO }, error: null }],
    })

    const resultado = await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)

    expect(sb.crmAgendaInsertPayloads).toHaveLength(0)
    expect(resultado).toContain('Visita registrada')
    expect(sb.leadsUpdatePayloads[0]).toMatchObject({ estagio_funil: 'visita_agendada' })
  })

  it('Z) estágio já é visita_agendada: histórico não duplica', async () => {
    const { executarTool } = await import('./agent')
    configurarSupabase({
      leadsSelect: { data: { id: 'lead-1', estagio_funil: 'visita_agendada' }, error: null },
      propriedade: propriedadeAtiva,
      agendaInsert: agendaInsertadaOk,
    })

    await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)
    expect(registrarMudancaEstagioMock).not.toHaveBeenCalled()
  })

  it('AA) estágio muda: registrarMudancaEstagio chamado exatamente 1x', async () => {
    const { executarTool } = await import('./agent')
    configurarSupabase({ leadsSelect: leadQualificado, propriedade: propriedadeAtiva, agendaInsert: agendaInsertadaOk })

    await executarTool('agendar_visita', argsValidos, WHATSAPP_CANONICO)

    expect(registrarMudancaEstagioMock).toHaveBeenCalledTimes(1)
    expect(registrarMudancaEstagioMock).toHaveBeenCalledWith(expect.anything(), 'lead-1', 'qualificado', 'visita_agendada')
  })
})
