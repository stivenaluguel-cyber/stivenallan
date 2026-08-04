import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { openaiHolder } = vi.hoisted(() => ({ openaiHolder: { create: vi.fn() } }))
vi.mock('@/lib/agent', () => ({
  getOpenAI: () => ({ chat: { completions: { create: openaiHolder.create } } }),
}))

import { sugerirConhecimentoDeConversasResolvidas } from './base-conhecimento-auto-sugestao'

type Cfg = {
  mudancas?: Array<{ lead_id: string | null; created_at: string }>
  mudancasError?: { message: string } | null
  contagemExistente?: number
  interacoes?: Array<{ direcao: string; mensagem: string }>
}

function fakeSupabase(cfg: Cfg = {}) {
  const inserts: Record<string, unknown>[] = []
  return {
    inserts,
    from(table: string) {
      if (table === 'leads_interacoes') {
        return {
          select: () => ({
            eq: () => ({
              in: () => ({
                gte: () => ({
                  limit: async () => ({ data: cfg.mudancas ?? [], error: cfg.mudancasError ?? null }),
                }),
              }),
            }),
          }),
        }
      }
      if (table === 'base_conhecimento') {
        return {
          select: () => ({
            eq: async () => ({ count: cfg.contagemExistente ?? 0, error: null }),
          }),
          insert: async (row: Record<string, unknown>) => {
            inserts.push(row)
            return { error: null }
          },
        }
      }
      if (table === 'interacoes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  limit: async () => ({ data: cfg.interacoes ?? [], error: null }),
                }),
              }),
            }),
          }),
        }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
  } as unknown as import('@supabase/supabase-js').SupabaseClient & { inserts: Record<string, unknown>[] }
}

beforeEach(() => {
  openaiHolder.create.mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('sugerirConhecimentoDeConversasResolvidas', () => {
  it('sem mudanças de estágio nas últimas 24h, não avalia nada', async () => {
    const supabase = fakeSupabase({ mudancas: [] })
    const resultado = await sugerirConhecimentoDeConversasResolvidas(supabase)
    expect(resultado).toEqual({ avaliados: 0, sugeridos: 0 })
  })

  it('gera e insere uma sugestão pendente (aprovado=false) a partir da conversa', async () => {
    openaiHolder.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ pergunta: 'Tem vaga de garagem?', resposta: 'Sim, uma inclusa.' }) } }],
    })
    const supabase = fakeSupabase({
      mudancas: [{ lead_id: 'lead-1', created_at: '2026-08-03T10:00:00Z' }],
      contagemExistente: 0,
      interacoes: [
        { direcao: 'entrada', mensagem: 'tem vaga de garagem?' },
        { direcao: 'saida', mensagem: 'sim, uma vaga inclusa' },
      ],
    })

    const resultado = await sugerirConhecimentoDeConversasResolvidas(supabase)

    expect(resultado).toEqual({ avaliados: 1, sugeridos: 1 })
    expect((supabase as unknown as { inserts: Record<string, unknown>[] }).inserts).toEqual([
      expect.objectContaining({
        pergunta: 'Tem vaga de garagem?',
        resposta: 'Sim, uma inclusa.',
        origem: 'ia_sugerida',
        aprovado: false,
        lead_id_origem: 'lead-1',
      }),
    ])
  })

  it('não duplica: lead que já tem sugestão anterior é pulado', async () => {
    const supabase = fakeSupabase({
      mudancas: [{ lead_id: 'lead-1', created_at: '2026-08-03T10:00:00Z' }],
      contagemExistente: 1,
    })
    const resultado = await sugerirConhecimentoDeConversasResolvidas(supabase)
    expect(resultado).toEqual({ avaliados: 1, sugeridos: 0 })
    expect(openaiHolder.create).not.toHaveBeenCalled()
  })

  it('não insere quando o modelo não encontra nada reutilizável (pergunta/resposta vazias)', async () => {
    openaiHolder.create.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ pergunta: '', resposta: '' }) } }] })
    const supabase = fakeSupabase({
      mudancas: [{ lead_id: 'lead-1', created_at: '2026-08-03T10:00:00Z' }],
      interacoes: [
        { direcao: 'entrada', mensagem: 'oi' },
        { direcao: 'saida', mensagem: 'oi, tudo bem?' },
      ],
    })
    const resultado = await sugerirConhecimentoDeConversasResolvidas(supabase)
    expect(resultado).toEqual({ avaliados: 1, sugeridos: 0 })
  })

  it('não quebra quando o modelo falha — só pula o lead', async () => {
    openaiHolder.create.mockRejectedValue(new Error('timeout'))
    const supabase = fakeSupabase({
      mudancas: [{ lead_id: 'lead-1', created_at: '2026-08-03T10:00:00Z' }],
      interacoes: [
        { direcao: 'entrada', mensagem: 'oi' },
        { direcao: 'saida', mensagem: 'oi, tudo bem?' },
      ],
    })
    const resultado = await sugerirConhecimentoDeConversasResolvidas(supabase)
    expect(resultado).toEqual({ avaliados: 1, sugeridos: 0 })
  })

  it('lead com menos de 2 interações (conversa vazia/incompleta) é pulado sem chamar o modelo', async () => {
    const supabase = fakeSupabase({
      mudancas: [{ lead_id: 'lead-1', created_at: '2026-08-03T10:00:00Z' }],
      interacoes: [{ direcao: 'entrada', mensagem: 'oi' }],
    })
    const resultado = await sugerirConhecimentoDeConversasResolvidas(supabase)
    expect(resultado).toEqual({ avaliados: 1, sugeridos: 0 })
    expect(openaiHolder.create).not.toHaveBeenCalled()
  })

  it('deduplica lead_id repetido dentro da mesma leva de mudanças (2 status_change do mesmo lead)', async () => {
    openaiHolder.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ pergunta: 'p', resposta: 'r' }) } }],
    })
    const supabase = fakeSupabase({
      mudancas: [
        { lead_id: 'lead-1', created_at: '2026-08-03T10:00:00Z' },
        { lead_id: 'lead-1', created_at: '2026-08-03T11:00:00Z' },
      ],
      interacoes: [
        { direcao: 'entrada', mensagem: 'oi' },
        { direcao: 'saida', mensagem: 'oi, tudo bem?' },
      ],
    })
    const resultado = await sugerirConhecimentoDeConversasResolvidas(supabase)
    expect(resultado.avaliados).toBe(1)
  })
})
