import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: (n: string) => (n === 'dashboard_token' ? { value: 'valid' } : undefined) }),
}))
vi.mock('jose', () => ({ jwtVerify: async () => ({ payload: { adminId: 'admin-1' } }) }))
vi.mock('@/lib/leads/registrar-mudanca-estagio', () => ({ registrarMudancaEstagio: async () => {} }))

const { supabaseHolder } = vi.hoisted(() => ({ supabaseHolder: { current: null as any } }))
vi.mock('@supabase/supabase-js', () => ({ createClient: () => supabaseHolder.current }))

import { POST } from './route'

type Cfg = {
  leadExiste?: boolean
  sessaoAtiva?: { id: string } | null
  leadNaSessao?: boolean
  erroInsert?: { code: string; message: string }
}

function makeSupabase(cfg: Cfg = {}) {
  const propostas: Record<string, any>[] = []
  const eventos: Record<string, any>[] = []
  const interacoes: Record<string, any>[] = []
  let seq = 0

  return {
    propostas, eventos, interacoes,
    from(table: string) {
      if (table === 'leads') {
        return {
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: cfg.leadExiste === false ? null : { id: 'lead-1', estagio_funil: 'qualificado' }, error: null }) }) }),
          update: () => ({ eq: async () => ({ error: null }) }),
        }
      }
      if (table === 'crm_propostas') {
        return {
          select: () => ({
            eq: (_c: string, v: unknown) => ({
              maybeSingle: async () => ({ data: propostas.find((p) => p.client_event_id === v) ?? null, error: null }),
            }),
          }),
          insert: (row: Record<string, any>) => ({
            select: () => ({
              single: async () => {
                if (cfg.erroInsert) return { data: null, error: cfg.erroInsert }
                if (row.client_event_id && propostas.some((p) => p.client_event_id === row.client_event_id)) {
                  return { data: null, error: { code: '23505', message: 'duplicate key' } }
                }
                seq++
                // `numero` vem do DEFAULT da coluna (sequence), não do app.
                const nova = { id: 'prop-' + seq, numero: 'P-2026-' + String(seq).padStart(5, '0'), ...row }
                propostas.push(nova)
                return { data: nova, error: null }
              },
            }),
          }),
        }
      }
      if (table === 'leads_interacoes') {
        return { insert: async (row: unknown) => { interacoes.push(row as Record<string, any>); return { error: null } } }
      }
      if (table === 'crm_focus_sessions') {
        // Duas leituras diferentes usam esta tabela: getActiveFocusSession
        // (.eq.eq.order.limit.maybeSingle) e a leitura de contadores
        // autoritativos dentro de recordFocusEvent (.eq.maybeSingle).
        const contadores = { processed_leads: 0, skipped_leads: 0, earned_points: 25, total_leads: 3 }
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: contadores, error: null }),
              eq: () => ({ order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: cfg.sessaoAtiva ?? null, error: null }) }) }) }),
            }),
          }),
        }
      }
      if (table === 'crm_focus_session_leads') {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: cfg.leadNaSessao ? { lead_id: 'lead-1' } : null, error: null }) }) }) }),
        }
      }
      throw new Error('Tabela inesperada no teste: ' + table)
    },
    async rpc(fn: string, args: Record<string, unknown>) {
      if (fn !== 'advance_focus_session_lead') throw new Error('rpc inesperada: ' + fn)
      const chave = String(args.p_client_event_id)
      if (eventos.some((e) => e.client_event_id === chave)) {
        return { data: { alreadyProcessed: true, points: 0 }, error: null }
      }
      eventos.push({ client_event_id: chave, action_type: args.p_action_type, points: args.p_points })
      return { data: { alreadyProcessed: false, points: args.p_points }, error: null }
    },
  }
}

function callPost(body: unknown) {
  return POST({ json: async () => body } as unknown as NextRequest)
}

const payloadValido = {
  lead_id: 'lead-1', valor_proposto: 500000, entrada: 100000,
  parcelas_qtd: 60, parcelas_valor: 5000, observacoes: 'primeira proposta',
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
  process.env.JWT_SECRET = 'segredo'
  supabaseHolder.current = makeSupabase()
})
afterEach(() => { supabaseHolder.current = null })

describe('POST /api/admin/propostas — sucesso', () => {
  it('cria a proposta com as colunas reais e recebe numero gerado pelo banco', async () => {
    const res = await callPost(payloadValido)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data.numero).toBe('P-2026-00001')
    expect(json.alreadyExists).toBe(false)

    const gravada = supabaseHolder.current.propostas[0]
    expect(gravada.valor_entrada).toBe(100000)
    expect(gravada.notas).toBe('primeira proposta')
    expect(gravada.simulacao_json).toEqual({ parcelas_qtd: 60, parcelas_valor: 5000 })
    expect(gravada.corretor_id).toBe('admin-1')
    // Nenhuma coluna inventada foi enviada ao banco.
    for (const inventada of ['entrada', 'parcelas_qtd', 'observacoes', 'versao', 'baloes']) {
      expect(gravada).not.toHaveProperty(inventada)
    }
  })

  it('registra a interação no histórico do lead com o número da proposta', async () => {
    await callPost(payloadValido)
    expect(supabaseHolder.current.interacoes[0].descricao).toContain('P-2026-00001')
  })
})

describe('POST /api/admin/propostas — payload inválido', () => {
  it('recusa sem lead_id', async () => {
    const res = await callPost({ valor_proposto: 1000 })
    expect(res.status).toBe(400)
  })

  it('recusa valor_proposto ausente ou zero', async () => {
    expect((await callPost({ lead_id: 'lead-1' })).status).toBe(400)
    expect((await callPost({ lead_id: 'lead-1', valor_proposto: 0 })).status).toBe(400)
  })

  it('recusa lead inexistente (proposta órfã não pontua)', async () => {
    supabaseHolder.current = makeSupabase({ leadExiste: false })
    const res = await callPost(payloadValido)
    expect(res.status).toBe(404)
    expect(supabaseHolder.current.propostas).toHaveLength(0)
  })
})

describe('POST /api/admin/propostas — retry e duplicidade', () => {
  it('retry com o mesmo clientEventId NÃO cria uma segunda proposta', async () => {
    const comId = { ...payloadValido, clientEventId: '11111111-1111-1111-1111-111111111111' }
    const primeira = await callPost(comId)
    expect(primeira.status).toBe(201)

    const retry = await callPost(comId)
    expect(retry.status).toBe(200)
    const json = await retry.json()
    expect(json.alreadyExists).toBe(true)
    expect(supabaseHolder.current.propostas).toHaveLength(1)
  })

  it('corrida (23505) devolve a proposta da outra requisição, sem duplicar', async () => {
    const clientEventId = '22222222-2222-2222-2222-222222222222'
    supabaseHolder.current.propostas.push({ id: 'prop-race', numero: 'P-2026-09999', client_event_id: clientEventId })
    const res = await callPost({ ...payloadValido, clientEventId })
    expect(res.status).toBe(200)
    expect((await res.json()).data.id).toBe('prop-race')
    expect(supabaseHolder.current.propostas).toHaveLength(1)
  })

  it('proposta legitimamente nova (outro clientEventId) é criada normalmente', async () => {
    await callPost({ ...payloadValido, clientEventId: '11111111-1111-1111-1111-111111111111' })
    const segunda = await callPost({ ...payloadValido, clientEventId: '33333333-3333-3333-3333-333333333333' })
    expect(segunda.status).toBe(201)
    expect(supabaseHolder.current.propostas).toHaveLength(2)
  })
})

describe('POST /api/admin/propostas — falha parcial', () => {
  it('se o INSERT falhar, nada depois acontece: sem etapa, sem histórico, sem pontos', async () => {
    supabaseHolder.current = makeSupabase({
      erroInsert: { code: '23502', message: 'null value in column "numero"' },
      sessaoAtiva: { id: 'sess-1' }, leadNaSessao: true,
    })
    const res = await callPost(payloadValido)
    expect(res.status).toBe(500)
    expect(supabaseHolder.current.interacoes).toHaveLength(0)
    expect(supabaseHolder.current.eventos).toHaveLength(0)
  })

  it('retry após falha no evento não gera proposta duplicada nem pontua duas vezes', async () => {
    supabaseHolder.current = makeSupabase({ sessaoAtiva: { id: 'sess-1' }, leadNaSessao: true })
    const comId = { ...payloadValido, clientEventId: '44444444-4444-4444-4444-444444444444' }

    await callPost(comId)
    expect(supabaseHolder.current.propostas).toHaveLength(1)
    expect(supabaseHolder.current.eventos).toHaveLength(1)

    await callPost(comId)
    expect(supabaseHolder.current.propostas).toHaveLength(1)
    expect(supabaseHolder.current.eventos).toHaveLength(1)
  })
})

describe('POST /api/admin/propostas — pontuação só com proposta real e lead na sessão', () => {
  it('pontua quando há sessão ativa E o lead está na fila dela', async () => {
    supabaseHolder.current = makeSupabase({ sessaoAtiva: { id: 'sess-1' }, leadNaSessao: true })
    await callPost(payloadValido)
    expect(supabaseHolder.current.eventos).toHaveLength(1)
    expect(supabaseHolder.current.eventos[0].action_type).toBe('proposta_enviada')
    expect(supabaseHolder.current.eventos[0].points).toBe(25)
  })

  it('NÃO pontua quando o lead não faz parte da sessão ativa', async () => {
    supabaseHolder.current = makeSupabase({ sessaoAtiva: { id: 'sess-1' }, leadNaSessao: false })
    const res = await callPost(payloadValido)
    expect(res.status).toBe(201)
    expect(supabaseHolder.current.eventos).toHaveLength(0)
  })

  it('sem sessão ativa, cria a proposta sem pontuar', async () => {
    supabaseHolder.current = makeSupabase({ sessaoAtiva: null })
    const res = await callPost(payloadValido)
    expect(res.status).toBe(201)
    expect(supabaseHolder.current.eventos).toHaveLength(0)
  })
})
