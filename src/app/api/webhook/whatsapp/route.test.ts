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

import { POST } from './route'

type MockConfig = {
  lead?: Record<string, unknown>
  leadFreshAtendimentoHumano?: boolean
  midJaExiste?: boolean
  midConflitoNoInsert?: string
}

function makeSupabase(cfg: MockConfig = {}) {
  const leadsUpdates: Record<string, unknown>[] = []
  const interacoesInserts: Record<string, unknown>[] = []
  const interacoesUpdates: Record<string, unknown>[] = []
  let leadReadCount = 0

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
              single: async () => ({ data: { ...leadPadrao, ...cfg.lead }, error: null }),
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
          // Serve duas consultas bem diferentes: o histórico (.eq().eq().order().limit())
          // e o check de idempotência por mid (.eq('mid', mid).maybeSingle()). Como
          // .eq() sempre devolve a própria chain, os dois caminhos convivem no mesmo objeto.
          select: () => {
            const chain = {
              eq: () => chain,
              order: () => ({ limit: async () => ({ data: [], error: null }) }),
              maybeSingle: async () => ({ data: cfg.midJaExiste ? { id: 'interacao-existente' } : null, error: null }),
            }
            return chain
          },
          insert: (row: Record<string, unknown>) => {
            interacoesInserts.push(row)
            if (cfg.midConflitoNoInsert && row.mid === cfg.midConflitoNoInsert) {
              return {
                select: () => ({
                  single: async () => ({
                    data: null,
                    error: { code: '23505', message: 'duplicate key value violates unique constraint "interacoes_mid_key"' },
                  }),
                }),
              }
            }
            return {
              select: () => ({
                single: async () => ({ data: { id: 'interacao-' + interacoesInserts.length }, error: null }),
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

const EVENTO_MENSAGEM = (texto: string, mid = 'MID-PADRAO-TESTE') => ({
  event: 'messages.upsert',
  instance: 'stiven',
  data: {
    key: { remoteJid: '5548999999999@s.whatsapp.net', fromMe: false, id: mid },
    message: { conversation: texto },
  },
})

async function aguardarProcessamentoAssincrono() {
  // processarEResponder roda fire-and-forget (.catch(console.error)) — dá
  // uma volta no microtask queue pra deixar as promises internas resolverem
  // antes de inspecionar os mocks.
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

  it('reentrega (mid já existe em interacoes): responde 200 sem duplicar mensagem, chamar IA ou enviar de novo', async () => {
    const mock = makeSupabase({ midJaExiste: true })
    supabaseHolder.current = mock

    const res = await POST(makeReq(EVENTO_MENSAGEM('oi')))
    await aguardarProcessamentoAssincrono()

    expect(res.status).toBe(200)
    expect(agentHolder.processarMensagem).not.toHaveBeenCalled()
    expect(evolutionHolder.enviarMensagem).not.toHaveBeenCalled()
    expect(mock.interacoesInserts).toHaveLength(0)
  })

  it('concorrência: duas reentregas simultâneas — a que perde a corrida no INSERT (23505) não duplica a resposta', async () => {
    const mock = makeSupabase({ midConflitoNoInsert: 'MID-PADRAO-TESTE' })
    supabaseHolder.current = mock

    const res = await POST(makeReq(EVENTO_MENSAGEM('oi')))
    await aguardarProcessamentoAssincrono()

    expect(res.status).toBe(200)
    expect(agentHolder.processarMensagem).not.toHaveBeenCalled()
    expect(evolutionHolder.enviarMensagem).not.toHaveBeenCalled()
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
