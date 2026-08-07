import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

type Sentimento = 'positivo' | 'neutro' | 'negativo' | 'urgente'

const { agentHolder, evolutionHolder, optoutHolder, limiteHolder, sentimentoHolder } = vi.hoisted(() => ({
  agentHolder: { processarMensagem: vi.fn(async (..._args: unknown[]) => 'resposta da IA') },
  evolutionHolder: {
    enviarMensagem: vi.fn(async (..._args: unknown[]) => true),
    enviarAlertaEscalada: vi.fn(async (..._args: unknown[]) => true),
  },
  optoutHolder: { detectar: vi.fn((_texto: string) => false) },
  limiteHolder: { podeEnviar: vi.fn(async (..._args: unknown[]) => true) },
  sentimentoHolder: { classificar: vi.fn(async (_texto: string): Promise<Sentimento> => 'neutro') },
}))

vi.mock('@/lib/agent', () => ({
  processarMensagem: (...args: unknown[]) => agentHolder.processarMensagem(...args),
}))
vi.mock('@/lib/evolution', () => ({
  enviarMensagem: (...args: unknown[]) => evolutionHolder.enviarMensagem(...args),
  enviarAlertaEscalada: (...args: unknown[]) => evolutionHolder.enviarAlertaEscalada(...args),
}))
vi.mock('@/lib/leads/whatsapp-optout', () => ({
  detectarPalavraChaveOptOut: (texto: string) => optoutHolder.detectar(texto),
  MENSAGEM_CONFIRMACAO_OPTOUT: 'confirmação de opt-out',
}))
vi.mock('@/lib/leads/whatsapp-envio-limite', () => ({
  podeEnviarAutomatico: (...args: unknown[]) => limiteHolder.podeEnviar(...args),
}))
vi.mock('@/lib/leads/sentimento', () => ({
  classificarSentimento: (texto: string) => sentimentoHolder.classificar(texto),
}))
vi.mock('@/lib/leads/notificar-lead-novo', () => ({
  notificarLeadNovo: vi.fn(async () => undefined),
}))

const { supabaseHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

// after() só é válido dentro de um request scope real do Next.js — nos
// testes, executa a callback direto (mesma abordagem já usada em
// registrar-mudanca-estagio.test.ts). importOriginal preserva NextRequest/
// NextResponse reais, que a rota usa de verdade pra construir a resposta.
const { afterHolder } = vi.hoisted(() => ({
  afterHolder: { after: vi.fn((cb: () => unknown) => { cb() }) },
}))
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()
  return { ...actual, after: (cb: () => unknown) => afterHolder.after(cb) }
})

import { POST } from './route'

type MockConfig = {
  lead?: Record<string, unknown>
  leadFreshAtendimentoHumano?: boolean
  // Mids tratados como já reservados ANTES do teste começar — simula uma
  // reentrega horas depois de outra já ter sido processada com sucesso.
  midsJaReservados?: string[]
  // Simula falha (não-duplicata) no upsert do lead / na reserva do mid —
  // usado pra provar que o erro do Postgres não vaza PII no log mesmo
  // quando ele "ecoa" o valor da coluna (comportamento real do Postgres
  // em violações de constraint).
  upsertError?: { code: string; message: string; details?: string }
  reservaError?: { code: string; message: string; details?: string }
}

function makeSupabase(cfg: MockConfig = {}) {
  const leadsUpdates: Record<string, unknown>[] = []
  const interacoesInserts: Record<string, unknown>[] = []
  const interacoesUpdates: Record<string, unknown>[] = []
  let leadReadCount = 0
  // Estado real de "quem já reservou esse mid" — compartilhado entre
  // chamadas concorrentes de insert() porque é o MESMO objeto `mock`
  // (supabaseHolder.current) usado por todas as invocações de
  // processarEResponder no teste. O check-e-marca é síncrono (nenhum
  // await entre ler e escrever no Set), igual ao unique index do Postgres
  // resolveria a corrida de verdade — sem isso o mock não provaria nada
  // sobre concorrência real.
  const midsReservados = new Set<string>(cfg.midsJaReservados ?? [])

  const leadPadrao = {
    id: 'lead-1', nome: 'Ana', requer_atencao: false, lead_score: 10,
    atendimento_humano_ativo: false, origem: 'whatsapp', created_at: '2020-01-01T00:00:00Z',
  }

  return {
    leadsUpdates,
    interacoesInserts,
    interacoesUpdates,
    from(table: string) {
      if (table === 'leads') {
        return {
          upsert: () => ({
            select: () => ({
              single: async () =>
                cfg.upsertError
                  ? { data: null, error: cfg.upsertError }
                  : { data: { ...leadPadrao, ...cfg.lead }, error: null },
            }),
          }),
          update: (row: Record<string, unknown>) => {
            leadsUpdates.push(row)
            return { eq: async () => ({ error: null }) }
          },
          select: () => ({
            eq: () => ({
              single: async () => {
                leadReadCount++
                return { data: { atendimento_humano_ativo: cfg.leadFreshAtendimentoHumano ?? false }, error: null }
              },
            }),
          }),
        }
      }
      if (table === 'interacoes') {
        return {
          // Só serve mais o histórico (.eq().eq().order().limit()) — não existe
          // mais um SELECT prévio de idempotência; a reserva é o próprio insert().
          select: () => {
            const chain = {
              eq: () => chain,
              order: () => ({ limit: async () => ({ data: [], error: null }) }),
            }
            return chain
          },
          // Síncrono de propósito (não `async (row) => {...}`): o check-e-marca
          // do mid precisa acontecer no exato instante em que insert() é
          // chamado, sem nenhum await no meio — é isso que faz duas chamadas
          // concorrentes reais (Promise.all) resolverem a corrida de forma
          // determinística no teste, do mesmo jeito que o unique index faz de
          // verdade no Postgres no instante do INSERT.
          insert: (row: Record<string, unknown>) => {
            const mid = typeof row.mid === 'string' ? row.mid : null
            const duplicado = mid !== null && midsReservados.has(mid)
            if (mid !== null && !duplicado) midsReservados.add(mid)
            interacoesInserts.push(row)
            return {
              select: () => ({
                single: async () => {
                  if (duplicado) {
                    return {
                      data: null,
                      error: { code: '23505', message: 'duplicate key value violates unique constraint "interacoes_mid_key"' },
                    }
                  }
                  if (cfg.reservaError) {
                    return { data: null, error: cfg.reservaError }
                  }
                  return { data: { id: 'interacao-' + interacoesInserts.length }, error: null }
                },
              }),
            }
          },
          update: (row: Record<string, unknown>) => {
            interacoesUpdates.push(row)
            return { eq: async () => ({ error: null }) }
          },
        }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
    _leadReadCount: () => leadReadCount,
  }
}

const SECRET_VALIDO = 'segredo-de-teste-evolution'

// Por padrão já manda o Authorization correto — a maioria dos testes aqui
// não é sobre autenticação, e sem isso todo teste existente quebraria com
// 401. O describe de autenticação abaixo sobrescreve headers explicitamente.
function makeReq(body: unknown, headers: Record<string, string> = { authorization: `Bearer ${SECRET_VALIDO}` }) {
  return {
    headers: new Headers(headers),
    json: async () => body,
  } as unknown as NextRequest
}

const EVENTO_MENSAGEM = (texto: string, mid = 'MID-PADRAO-TESTE', telefone = '5548999999999') => ({
  event: 'messages.upsert',
  instance: 'stiven',
  data: {
    key: { remoteJid: `${telefone}@s.whatsapp.net`, fromMe: false, id: mid },
    message: { conversation: texto },
  },
})

// Aggrega tudo que foi passado pros três níveis de console (log/warn/error)
// numa única string — é assim que logInfo/logWarn/logError acabam saindo
// (log.ts chama console.* por baixo), então isso cobre tanto os console.*
// antigos remanescentes quanto qualquer chamada feita via logger estruturado.
function textoDeTodosOsLogs(spies: { log: ReturnType<typeof vi.spyOn>; warn: ReturnType<typeof vi.spyOn>; error: ReturnType<typeof vi.spyOn> }): string {
  return [...spies.log.mock.calls, ...spies.warn.mock.calls, ...spies.error.mock.calls]
    .flat()
    .map((v) => (typeof v === 'string' ? v : JSON.stringify(v)))
    .join(' | ')
}

async function aguardarProcessamentoAssincrono() {
  // processarEResponder roda fire-and-forget (.catch(err => logError(...))) —
  // dá uma volta no microtask queue pra deixar as promises internas
  // resolverem antes de inspecionar os mocks.
  await new Promise((r) => setTimeout(r, 0))
  await new Promise((r) => setTimeout(r, 0))
  await new Promise((r) => setTimeout(r, 0))
}

describe('POST /api/webhook/whatsapp', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    process.env.EVOLUTION_WEBHOOK_SECRET = SECRET_VALIDO
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    afterHolder.after.mockClear()
    agentHolder.processarMensagem.mockClear().mockResolvedValue('resposta da IA')
    evolutionHolder.enviarMensagem.mockClear().mockResolvedValue(true)
    evolutionHolder.enviarAlertaEscalada.mockClear().mockResolvedValue(true)
    optoutHolder.detectar.mockClear().mockReturnValue(false)
    limiteHolder.podeEnviar.mockClear().mockResolvedValue(true)
    sentimentoHolder.classificar.mockClear().mockResolvedValue('neutro')
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.restoreAllMocks()
  })

  it('ignora eventos que não são messages.upsert', async () => {
    const res = await POST(makeReq({ event: 'connection.update' }))
    expect((await res.json())).toEqual({ ok: true, ignorado: true })
    expect(agentHolder.processarMensagem).not.toHaveBeenCalled()
  })

  it('fluxo normal: responde, loga saída como processado_por_ia e grava sentimento', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock

    await POST(makeReq(EVENTO_MENSAGEM('Oi, quero saber mais')))
    await aguardarProcessamentoAssincrono()

    expect(agentHolder.processarMensagem).toHaveBeenCalledTimes(1)
    expect(evolutionHolder.enviarMensagem).toHaveBeenCalledWith('5548999999999', 'resposta da IA')
    expect(mock.interacoesInserts.some((i) => i.direcao === 'saida' && i.processado_por_ia === true)).toBe(true)
    expect(mock.interacoesUpdates).toContainEqual({ sentimento: 'neutro' })
  })

  it('opt-out: manda confirmação fixa, marca whatsapp_optout_at e NÃO chama a IA', async () => {
    optoutHolder.detectar.mockReturnValue(true)
    const mock = makeSupabase()
    supabaseHolder.current = mock

    await POST(makeReq(EVENTO_MENSAGEM('parar')))
    await aguardarProcessamentoAssincrono()

    expect(agentHolder.processarMensagem).not.toHaveBeenCalled()
    expect(evolutionHolder.enviarMensagem).toHaveBeenCalledWith('5548999999999', 'confirmação de opt-out')
    expect(mock.leadsUpdates.some((u) => 'whatsapp_optout_at' in u)).toBe(true)
  })

  it('atendimento_humano_ativo: não chama a IA nem envia nada', async () => {
    const mock = makeSupabase({ lead: { atendimento_humano_ativo: true } })
    supabaseHolder.current = mock

    await POST(makeReq(EVENTO_MENSAGEM('oi')))
    await aguardarProcessamentoAssincrono()

    expect(agentHolder.processarMensagem).not.toHaveBeenCalled()
    expect(evolutionHolder.enviarMensagem).not.toHaveBeenCalled()
  })

  it('teto diário atingido: gera a resposta mas NÃO envia (fica pendente pro painel)', async () => {
    limiteHolder.podeEnviar.mockResolvedValue(false)
    const mock = makeSupabase()
    supabaseHolder.current = mock

    await POST(makeReq(EVENTO_MENSAGEM('oi')))
    await aguardarProcessamentoAssincrono()

    expect(agentHolder.processarMensagem).toHaveBeenCalledTimes(1)
    expect(evolutionHolder.enviarMensagem).not.toHaveBeenCalled()
  })

  it('sentimento negativo/urgente aciona a escalada existente mesmo com requer_atencao=false', async () => {
    sentimentoHolder.classificar.mockResolvedValue('urgente')
    const mock = makeSupabase()
    supabaseHolder.current = mock

    await POST(makeReq(EVENTO_MENSAGEM('isso é um absurdo, quero resposta AGORA')))
    await aguardarProcessamentoAssincrono()

    expect(evolutionHolder.enviarAlertaEscalada).toHaveBeenCalledTimes(1)
    expect(mock.leadsUpdates.some((u) => u.requer_atencao === true)).toBe(true)
    expect(mock.leadsUpdates.some((u) => u.requer_atencao === false)).toBe(true)
  })
})

describe('POST /api/webhook/whatsapp — autenticação', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    process.env.EVOLUTION_WEBHOOK_SECRET = SECRET_VALIDO
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    afterHolder.after.mockClear()
    agentHolder.processarMensagem.mockClear().mockResolvedValue('resposta da IA')
    evolutionHolder.enviarMensagem.mockClear().mockResolvedValue(true)
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.restoreAllMocks()
  })

  it('401 sem header Authorization', async () => {
    const res = await POST(makeReq(EVENTO_MENSAGEM('oi'), {}))
    await aguardarProcessamentoAssincrono()

    expect(res.status).toBe(401)
    expect(agentHolder.processarMensagem).not.toHaveBeenCalled()
  })

  it('401 com segredo incorreto', async () => {
    const res = await POST(makeReq(EVENTO_MENSAGEM('oi'), { authorization: 'Bearer segredo-errado' }))
    await aguardarProcessamentoAssincrono()

    expect(res.status).toBe(401)
    expect(agentHolder.processarMensagem).not.toHaveBeenCalled()
  })

  it('401 com header Authorization sem o prefixo Bearer', async () => {
    const res = await POST(makeReq(EVENTO_MENSAGEM('oi'), { authorization: SECRET_VALIDO }))
    expect(res.status).toBe(401)
  })

  it('401 quando EVOLUTION_WEBHOOK_SECRET não está configurado — fail-closed, não "aceita tudo"', async () => {
    delete process.env.EVOLUTION_WEBHOOK_SECRET
    const res = await POST(makeReq(EVENTO_MENSAGEM('oi')))
    await aguardarProcessamentoAssincrono()

    expect(res.status).toBe(401)
    expect(agentHolder.processarMensagem).not.toHaveBeenCalled()
  })

  it('200 e processa normalmente com o segredo correto', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock

    const res = await POST(makeReq(EVENTO_MENSAGEM('oi')))
    await aguardarProcessamentoAssincrono()

    expect(res.status).toBe(200)
    expect(agentHolder.processarMensagem).toHaveBeenCalledTimes(1)
  })

  it('não loga o segredo esperado nem o header recebido, nem em caso de rejeição', async () => {
    const logSpy = vi.spyOn(console, 'warn')
    await POST(makeReq(EVENTO_MENSAGEM('oi'), { authorization: 'Bearer segredo-errado-para-o-teste' }))

    const textoLogado = logSpy.mock.calls.flat().map(String).join(' | ')
    expect(textoLogado).not.toContain('segredo-errado-para-o-teste')
    expect(textoLogado).not.toContain(SECRET_VALIDO)
  })
})

describe('POST /api/webhook/whatsapp — idempotência', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    process.env.EVOLUTION_WEBHOOK_SECRET = SECRET_VALIDO
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    afterHolder.after.mockClear()
    agentHolder.processarMensagem.mockClear().mockResolvedValue('resposta da IA')
    evolutionHolder.enviarMensagem.mockClear().mockResolvedValue(true)
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.restoreAllMocks()
  })

  it('mid ausente no payload: ignora sem processar (200, sem side effect)', async () => {
    const evento = EVENTO_MENSAGEM('oi')
    delete (evento.data.key as { id?: string }).id

    const res = await POST(makeReq(evento))
    await aguardarProcessamentoAssincrono()

    expect(await res.json()).toEqual({ ok: true })
    expect(agentHolder.processarMensagem).not.toHaveBeenCalled()
  })

  it('reentrega horas depois (mid já reservado de um processamento anterior): responde 200 sem reprocessar', async () => {
    const mock = makeSupabase({ midsJaReservados: ['MID-PADRAO-TESTE'] })
    supabaseHolder.current = mock

    const res = await POST(makeReq(EVENTO_MENSAGEM('oi')))
    await aguardarProcessamentoAssincrono()

    expect(res.status).toBe(200)
    expect(agentHolder.processarMensagem).not.toHaveBeenCalled()
    expect(evolutionHolder.enviarMensagem).not.toHaveBeenCalled()
    // A tentativa de reserva acontece de qualquer forma (não existe mais um
    // SELECT prévio pra "adivinhar" — é o insert() que descobre o 23505),
    // mas não vira uma segunda linha de verdade nem dispara nenhum efeito.
    const tentativas = mock.interacoesInserts.filter((i) => i.mid === 'MID-PADRAO-TESTE')
    expect(tentativas).toHaveLength(1)
  })

  it('concorrência REAL: duas requisições em paralelo pro mesmo mid — só a vencedora executa os efeitos, as duas terminam 200', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock

    const evento = EVENTO_MENSAGEM('oi', 'MID-CONCORRENTE')
    // Promise.all dispara as duas POST() de verdade em paralelo — não é uma
    // chamada configurada pra simular derrota, é a mesma corrida que duas
    // reentregas simultâneas da Evolution fariam contra o servidor real.
    const [res1, res2] = await Promise.all([
      POST(makeReq(evento)),
      POST(makeReq(evento)),
    ])
    await aguardarProcessamentoAssincrono()

    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)
    expect(agentHolder.processarMensagem).toHaveBeenCalledTimes(1)
    expect(evolutionHolder.enviarMensagem).toHaveBeenCalledTimes(1)
    // Só uma reserva desse mid existe — a segunda tentativa de insert
    // aconteceu (perdeu a corrida), mas nenhuma "atividade" nova foi criada
    // além da reserva vencedora + a resposta de saída dela.
    const reservasDoMid = mock.interacoesInserts.filter((i) => i.mid === 'MID-CONCORRENTE')
    expect(reservasDoMid).toHaveLength(1)
    const totalInteracoesCriadas = mock.interacoesInserts.filter((i) => i.direcao === 'entrada' || i.direcao === 'saida')
    expect(totalInteracoesCriadas).toHaveLength(2) // 1 entrada (a reserva) + 1 saída (a resposta da IA)
  })

  it('mids diferentes não são tratados como duplicata um do outro', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock

    await POST(makeReq(EVENTO_MENSAGEM('primeira mensagem', 'MID-1')))
    await aguardarProcessamentoAssincrono()
    await POST(makeReq(EVENTO_MENSAGEM('segunda mensagem', 'MID-2')))
    await aguardarProcessamentoAssincrono()

    expect(agentHolder.processarMensagem).toHaveBeenCalledTimes(2)
  })
})

// Regressão de PII: o webhook antigo logava `console.log('[webhook]
// processando:', whatsapp, '|', texto.substring(0, 80))` — telefone completo
// e um trecho real da mensagem do lead. Payload sintético igual ao usado na
// auditoria de segurança: telefone que não pode aparecer em log nenhum, e
// mensagem com dado sensível (CPF) que também não pode.
describe('POST /api/webhook/whatsapp — PII nunca vai pro log', () => {
  const TELEFONE = '5511999999999'
  const MENSAGEM_COM_CPF = 'Meu CPF é 123.456.789-00 e quero o apartamento'
  const TRECHO_CPF = '123.456.789-00'

  let logSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    process.env.EVOLUTION_WEBHOOK_SECRET = SECRET_VALIDO
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    afterHolder.after.mockClear()
    agentHolder.processarMensagem.mockClear().mockResolvedValue('resposta da IA')
    evolutionHolder.enviarMensagem.mockClear().mockResolvedValue(true)
    evolutionHolder.enviarAlertaEscalada.mockClear().mockResolvedValue(true)
    optoutHolder.detectar.mockClear().mockReturnValue(false)
    limiteHolder.podeEnviar.mockClear().mockResolvedValue(true)
    sentimentoHolder.classificar.mockClear().mockResolvedValue('neutro')
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.restoreAllMocks()
  })

  it('fluxo normal: nenhum log contém o telefone, a mensagem ou o CPF — mas mid/textoLength continuam aparecendo', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock

    await POST(makeReq(EVENTO_MENSAGEM(MENSAGEM_COM_CPF, 'MID-PII-1', TELEFONE)))
    await aguardarProcessamentoAssincrono()

    const textoLogado = textoDeTodosOsLogs({ log: logSpy, warn: warnSpy, error: errorSpy })
    expect(textoLogado).not.toContain(TELEFONE)
    expect(textoLogado).not.toContain(MENSAGEM_COM_CPF)
    expect(textoLogado).not.toContain('Meu CPF')
    expect(textoLogado).not.toContain(TRECHO_CPF)

    // Observabilidade preservada: id opaco e metadado seguro continuam logados.
    expect(textoLogado).toContain('MID-PII-1')
    expect(textoLogado).toContain('"textoLength":' + MENSAGEM_COM_CPF.length)
    expect(textoLogado).toContain('"source":"webhook/whatsapp"')
  })

  it('lead sem nome: nome não é logado (quando aplicável, só ids opacos)', async () => {
    const mock = makeSupabase({ lead: { nome: 'Fulano de Tal Sobrenome Completo' } })
    supabaseHolder.current = mock

    await POST(makeReq(EVENTO_MENSAGEM('oi tudo bem', 'MID-PII-NOME', TELEFONE)))
    await aguardarProcessamentoAssincrono()

    const textoLogado = textoDeTodosOsLogs({ log: logSpy, warn: warnSpy, error: errorSpy })
    expect(textoLogado).not.toContain('Fulano de Tal Sobrenome Completo')
  })

  it('falha ao resolver o lead (erro do Postgres ecoando o telefone): nem o telefone nem a mensagem completa do erro vazam — só o code', async () => {
    const mock = makeSupabase({
      upsertError: {
        code: '23505',
        message: `duplicate key value violates unique constraint "leads_whatsapp_key"`,
        details: `Key (whatsapp)=(${TELEFONE}) already exists.`,
      },
    })
    supabaseHolder.current = mock

    await POST(makeReq(EVENTO_MENSAGEM(MENSAGEM_COM_CPF, 'MID-PII-2', TELEFONE)))
    await aguardarProcessamentoAssincrono()

    const textoLogado = textoDeTodosOsLogs({ log: logSpy, warn: warnSpy, error: errorSpy })
    expect(textoLogado).not.toContain(TELEFONE)
    expect(textoLogado).not.toContain(MENSAGEM_COM_CPF)
    expect(textoLogado).not.toContain('already exists')
    expect(textoLogado).toContain('"errorCode":"23505"')
    expect(agentHolder.processarMensagem).not.toHaveBeenCalled()
  })

  it('falha ao reservar o mid (erro do Postgres ecoando a mensagem): não vaza telefone nem o texto — só o code', async () => {
    const mock = makeSupabase({
      reservaError: {
        code: '23514',
        message: `new row for relation "interacoes" violates check constraint`,
        details: `Failing row contains (..., ${MENSAGEM_COM_CPF}, ...).`,
      },
    })
    supabaseHolder.current = mock

    await POST(makeReq(EVENTO_MENSAGEM(MENSAGEM_COM_CPF, 'MID-PII-3', TELEFONE)))
    await aguardarProcessamentoAssincrono()

    const textoLogado = textoDeTodosOsLogs({ log: logSpy, warn: warnSpy, error: errorSpy })
    expect(textoLogado).not.toContain(TELEFONE)
    expect(textoLogado).not.toContain(MENSAGEM_COM_CPF)
    expect(textoLogado).not.toContain('Failing row')
    expect(textoLogado).toContain('"errorCode":"23514"')
    expect(agentHolder.processarMensagem).not.toHaveBeenCalled()
  })

  it('exceção inesperada no meio do processamento: não vaza telefone; leadId e mid aparecem pra correlação', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock
    agentHolder.processarMensagem.mockRejectedValueOnce(new Error(`falha ao processar "${MENSAGEM_COM_CPF}"`))

    await POST(makeReq(EVENTO_MENSAGEM(MENSAGEM_COM_CPF, 'MID-PII-4', TELEFONE)))
    await aguardarProcessamentoAssincrono()

    const textoLogado = textoDeTodosOsLogs({ log: logSpy, warn: warnSpy, error: errorSpy })
    expect(textoLogado).not.toContain(TELEFONE)
    expect(textoLogado).not.toContain(MENSAGEM_COM_CPF)
    expect(textoLogado).toContain('MID-PII-4')
    expect(textoLogado).toContain('"leadId":"lead-1"')
    expect(textoLogado).toContain('"errorTipo":"Error"')
  })

  it('nunca loga EVOLUTION_WEBHOOK_SECRET nem EVOLUTION_API_KEY, mesmo em erro', async () => {
    const mock = makeSupabase({
      upsertError: { code: 'XX000', message: 'erro interno do banco' },
    })
    supabaseHolder.current = mock
    process.env.EVOLUTION_API_KEY = 'chave-api-super-secreta'

    await POST(makeReq(EVENTO_MENSAGEM('oi', 'MID-PII-5', TELEFONE)))
    await aguardarProcessamentoAssincrono()

    const textoLogado = textoDeTodosOsLogs({ log: logSpy, warn: warnSpy, error: errorSpy })
    expect(textoLogado).not.toContain(SECRET_VALIDO)
    expect(textoLogado).not.toContain('chave-api-super-secreta')

    delete process.env.EVOLUTION_API_KEY
  })
})

// Item 4: o processamento pesado (IA, Supabase, Evolution) sai do caminho
// síncrono da resposta HTTP e passa a rodar dentro de after() — a Vercel
// mantém a invocação viva até o callback terminar, em vez de um
// fire-and-forget "solto" que podia ser congelado assim que a resposta HTTP
// saísse (comportamento não garantido em runtime serverless).
describe('POST /api/webhook/whatsapp — lifecycle pós-resposta (after())', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    process.env.EVOLUTION_WEBHOOK_SECRET = SECRET_VALIDO
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    afterHolder.after.mockClear()
    agentHolder.processarMensagem.mockClear().mockResolvedValue('resposta da IA')
    evolutionHolder.enviarMensagem.mockClear().mockResolvedValue(true)
    evolutionHolder.enviarAlertaEscalada.mockClear().mockResolvedValue(true)
    optoutHolder.detectar.mockClear().mockReturnValue(false)
    limiteHolder.podeEnviar.mockClear().mockResolvedValue(true)
    sentimentoHolder.classificar.mockClear().mockResolvedValue('neutro')
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.restoreAllMocks()
  })

  it('1) webhook válido responde 200 SEM esperar o processamento pesado (IA) terminar', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock

    let liberarIA: (v: string) => void = () => {}
    agentHolder.processarMensagem.mockImplementation(
      () => new Promise<string>((resolve) => { liberarIA = resolve }),
    )

    // Se a resposta esperasse a IA, este await travaria pra sempre (a
    // promise da IA nunca é liberada antes daqui) — o teste em si é a prova.
    const res = await POST(makeReq(EVENTO_MENSAGEM('oi')))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })

    // Libera a IA só depois de já ter a resposta, pra não deixar promise pendurada.
    liberarIA('resposta da IA (liberada depois)')
    await aguardarProcessamentoAssincrono()
  })

  it('2) mensagem válida agenda o processamento via after() — mecanismo pós-resposta oficial', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock

    await POST(makeReq(EVENTO_MENSAGEM('oi')))
    await aguardarProcessamentoAssincrono()

    expect(afterHolder.after).toHaveBeenCalledTimes(1)
    expect(afterHolder.after).toHaveBeenCalledWith(expect.any(Function))
    // O agendamento acontece antes do processamento em si terminar — after()
    // recebeu a call, e só depois (mesma invocação, pós-resposta) a IA roda.
    expect(agentHolder.processarMensagem).toHaveBeenCalledTimes(1)
  })

  it('3) autenticação inválida NÃO agenda processamento (after() não é chamado)', async () => {
    const res = await POST(makeReq(EVENTO_MENSAGEM('oi'), { authorization: 'Bearer segredo-errado' }))
    await aguardarProcessamentoAssincrono()

    expect(res.status).toBe(401)
    expect(afterHolder.after).not.toHaveBeenCalled()
    expect(agentHolder.processarMensagem).not.toHaveBeenCalled()
  })

  it('4) evento ignorado (não é messages.upsert) NÃO agenda processamento', async () => {
    const res = await POST(makeReq({ event: 'connection.update' }))
    await aguardarProcessamentoAssincrono()

    expect(await res.json()).toEqual({ ok: true, ignorado: true })
    expect(afterHolder.after).not.toHaveBeenCalled()
  })

  it('4b) mensagem de grupo / status@broadcast / fromMe também NÃO agenda processamento', async () => {
    const evtGrupo = EVENTO_MENSAGEM('oi')
    evtGrupo.data.key.remoteJid = '123456-group@g.us'
    await POST(makeReq(evtGrupo))

    const evtFromMe = EVENTO_MENSAGEM('oi')
    evtFromMe.data.key.fromMe = true
    await POST(makeReq(evtFromMe))

    await aguardarProcessamentoAssincrono()
    expect(afterHolder.after).not.toHaveBeenCalled()
  })

  it('5) mensagem sem mid NÃO agenda processamento', async () => {
    const evento = EVENTO_MENSAGEM('oi')
    delete (evento.data.key as { id?: string }).id

    const res = await POST(makeReq(evento))
    await aguardarProcessamentoAssincrono()

    expect(await res.json()).toEqual({ ok: true })
    expect(afterHolder.after).not.toHaveBeenCalled()
  })

  it('6) falha no processamento posterior NÃO altera a resposta 200 já devolvida', async () => {
    const mock = makeSupabase()
    supabaseHolder.current = mock
    agentHolder.processarMensagem.mockRejectedValue(new Error('falha simulada da IA'))

    const res = await POST(makeReq(EVENTO_MENSAGEM('oi')))
    // A resposta já foi construída e devolvida ANTES do after() rodar até o fim.
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })

    // Só agora o trabalho de fundo (que vai falhar) termina de rodar.
    await aguardarProcessamentoAssincrono()
  })

  it('7) falha posterior gera log seguro (mid + tipo do erro, sem PII) via after()', async () => {
    const errorSpy = vi.spyOn(console, 'error')
    const mock = makeSupabase()
    supabaseHolder.current = mock
    agentHolder.processarMensagem.mockRejectedValue(new Error('falha simulada da IA'))

    await POST(makeReq(EVENTO_MENSAGEM('oi', 'MID-LIFECYCLE-7')))
    await aguardarProcessamentoAssincrono()

    const textoLogado = errorSpy.mock.calls.flat().map(String).join(' | ')
    expect(textoLogado).toContain('MID-LIFECYCLE-7')
    expect(textoLogado).toContain('"errorTipo":"Error"')
    expect(textoLogado).not.toContain('5548999999999')
  })

  // 8) idempotência: não há teste novo aqui de propósito — processarEResponder
  // não mudou, só passou a ser chamado de dentro de after() em vez de um
  // .catch() solto. As reservas de mid (describe "idempotência" acima, ex.:
  // "reentrega horas depois", "concorrência REAL", "mids diferentes não são
  // duplicata") continuam passando sem alteração, provando que o
  // comportamento de dedup por mid não foi afetado pela troca do mecanismo
  // de disparo.
})
