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
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  limit: async () => ({ data: [], error: null }),
                }),
              }),
            }),
          }),
          insert: (row: Record<string, unknown>) => {
            interacoesInserts.push(row)
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

function makeReq(body: unknown) {
  return {
    headers: new Headers(),
    json: async () => body,
  } as unknown as NextRequest
}

const EVENTO_MENSAGEM = (texto: string) => ({
  event: 'messages.upsert',
  instance: 'stiven',
  data: {
    key: { remoteJid: '5548999999999@s.whatsapp.net', fromMe: false },
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
