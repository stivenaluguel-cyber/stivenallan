import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: (n: string) => (n === 'dashboard_token' ? { value: 'valid' } : undefined) }),
}))
vi.mock('jose', () => ({ jwtVerify: async () => ({ payload: { adminId: 'admin-1' } }) }))

const { supabaseHolder } = vi.hoisted(() => ({ supabaseHolder: { current: null as any } }))
vi.mock('@supabase/supabase-js', () => ({ createClient: () => supabaseHolder.current }))

import { POST } from './route'

const UUID = '00000000-0000-4000-8000-000000000001'

function makeSupabase(cfg: { sessaoStatus?: string; sessaoAdmin?: string } = {}) {
  return {
    from(table: string) {
      if (table === 'crm_focus_sessions') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { id: 'sess-1', admin_id: cfg.sessaoAdmin ?? 'admin-1', status: cfg.sessaoStatus ?? 'ativa' },
                error: null,
              }),
              maybeSingle: async () => ({ data: { processed_leads: 1, skipped_leads: 0, earned_points: 8, total_leads: 3 }, error: null }),
            }),
          }),
        }
      }
      if (table === 'leads') {
        return { select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'lead-1', estagio_funil: 'qualificado' }, error: null }) }) }) }
      }
      throw new Error('Tabela inesperada no teste: ' + table)
    },
    async rpc() {
      return { data: { alreadyProcessed: false, points: 8, sessionLeadStatus: 'processado' }, error: null }
    },
  }
}

function callPost(body: unknown) {
  return POST({ json: async () => body } as unknown as NextRequest)
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
  process.env.JWT_SECRET = 'segredo-de-teste-com-32-caracteres-minimos'
  supabaseHolder.current = makeSupabase()
})
afterEach(() => { supabaseHolder.current = null })

describe('POST /api/admin/focus/events — ações restritas', () => {
  it('recusa proposta_enviada vinda do cliente (403), sem gravar pontos', async () => {
    const res = await callPost({ sessionId: 'sess-1', leadId: 'lead-1', actionType: 'proposta_enviada', clientEventId: UUID })
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toContain('fluxo real')
  })

  it('aceita uma ação normal', async () => {
    const res = await callPost({ sessionId: 'sess-1', leadId: 'lead-1', actionType: 'followup_agendado', clientEventId: UUID })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.points).toBe(8)
    // Contadores autoritativos voltam junto com a resposta.
    expect(json.data.session).toEqual({ processed_leads: 1, skipped_leads: 0, earned_points: 8, total_leads: 3 })
  })

  it('aceita a nova ação "adiado"', async () => {
    const res = await callPost({
      sessionId: 'sess-1', leadId: 'lead-1', actionType: 'adiado',
      clientEventId: UUID, snoozedUntil: '2026-08-05T23:59:59-03:00',
    })
    expect(res.status).toBe(200)
  })
})

describe('POST /api/admin/focus/events — validações de sessão', () => {
  it('recusa ação em sessão que não está ativa', async () => {
    supabaseHolder.current = makeSupabase({ sessaoStatus: 'concluida' })
    const res = await callPost({ sessionId: 'sess-1', leadId: 'lead-1', actionType: 'pular', clientEventId: UUID })
    expect(res.status).toBe(409)
  })

  it('recusa sessão de outro admin', async () => {
    supabaseHolder.current = makeSupabase({ sessaoAdmin: 'outro-admin' })
    const res = await callPost({ sessionId: 'sess-1', leadId: 'lead-1', actionType: 'pular', clientEventId: UUID })
    expect(res.status).toBe(403)
  })

  it('exige clientEventId em formato UUID', async () => {
    const res = await callPost({ sessionId: 'sess-1', leadId: 'lead-1', actionType: 'pular', clientEventId: 'nao-e-uuid' })
    expect(res.status).toBe(400)
  })

  it('recusa actionType desconhecido', async () => {
    const res = await callPost({ sessionId: 'sess-1', leadId: 'lead-1', actionType: 'inventado', clientEventId: UUID })
    expect(res.status).toBe(400)
  })

  it('perdido exige motivo válido', async () => {
    const res = await callPost({ sessionId: 'sess-1', leadId: 'lead-1', actionType: 'perdido', clientEventId: UUID, metadata: { motivo: 'qualquer' } })
    expect(res.status).toBe(400)
  })
})
