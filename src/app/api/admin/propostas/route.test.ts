import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { supabaseHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))

vi.mock('@/lib/dashboard/auth-check', () => ({
  autenticado: async () => true,
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current.client,
}))

vi.mock('@/lib/meta-capi', () => ({
  sendMetaCapiEvent: vi.fn(async () => ({ ok: true })),
}))

import { POST, PATCH } from './route'

type Row = Record<string, unknown>

function makeSupabase(seed: { leads?: Row[]; crm_propostas?: Row[]; leads_interacoes?: Row[] }) {
  const db: Record<string, Row[]> = {
    leads: seed.leads ?? [],
    crm_propostas: seed.crm_propostas ?? [],
    leads_interacoes: seed.leads_interacoes ?? [],
  }

  function chain(table: string) {
    const filters: Array<(r: Row) => boolean> = []
    const api = {
      select: () => api,
      insert(row: Row) {
        const withId = { id: 'gen-' + Math.random().toString(36).slice(2), ...row }
        db[table].push(withId)
        return {
          select: () => ({ single: async () => ({ data: withId, error: null }) }),
        }
      },
      update(payload: Row) {
        return {
          eq(field: string, val: unknown) {
            const matched = db[table].filter((r) => r[field] === val)
            matched.forEach((r) => Object.assign(r, payload))
            return {
              select: () => ({ single: async () => ({ data: matched[0] ?? null, error: matched.length ? null : { message: 'not found' } }) }),
              then: (resolve: (v: { data: Row[]; error: null }) => void) => resolve({ data: matched, error: null }),
            }
          },
        }
      },
      eq(field: string, val: unknown) {
        filters.push((r) => r[field] === val)
        return api
      },
      single: async () => {
        const matched = db[table].filter((r) => filters.every((f) => f(r)))
        return matched.length === 1 ? { data: { ...matched[0] }, error: null } : { data: null, error: { message: 'not found' } }
      },
    }
    return api
  }

  return { client: { from: (table: string) => chain(table) }, db }
}

function req(body: unknown) {
  return { json: async () => body } as unknown as Parameters<typeof POST>[0]
}

describe('POST /api/admin/propostas', () => {
  beforeEach(() => {
    supabaseHolder.current = makeSupabase({
      leads: [{ id: 'l1', estagio_funil: 'interessado', nome: 'Ana', whatsapp: '5548999999999', email: null, fbclid: null }],
    })
  })
  afterEach(() => vi.clearAllMocks())

  it('grava estagio_funil="proposta_enviada" (vocabulário canônico) — não "proposta"', async () => {
    const res = await POST(req({ lead_id: 'l1', empreendimento_id: 'e1', valor_proposto: 500000 }))
    expect(res.status).toBe(201)

    const lead = supabaseHolder.current.db.leads.find((l) => l.id === 'l1')
    expect(lead?.estagio_funil).toBe('proposta_enviada')
    expect(lead?.estagio_funil).not.toBe('proposta')
  })

  it('registra a transição em leads_interacoes com estagio_de/estagio_para preenchidos', async () => {
    await POST(req({ lead_id: 'l1', empreendimento_id: 'e1', valor_proposto: 500000 }))
    const transicao = supabaseHolder.current.db.leads_interacoes.find((i) => i.tipo === 'status_change')
    expect(transicao?.estagio_de).toBe('interessado')
    expect(transicao?.estagio_para).toBe('proposta_enviada')
  })
})

describe('PATCH /api/admin/propostas (aceitar proposta)', () => {
  beforeEach(() => {
    supabaseHolder.current = makeSupabase({
      leads: [{ id: 'l1', estagio_funil: 'negociacao', nome: 'Ana', whatsapp: '5548999999999', email: null, fbclid: null }],
      crm_propostas: [{ id: 'p1', lead_id: 'l1', valor_proposto: 500000, status: 'pendente' }],
    })
  })
  afterEach(() => vi.clearAllMocks())

  it('grava estagio_funil="fechado" (vocabulário canônico) — não "fechamento"', async () => {
    const res = await PATCH(req({ id: 'p1', status: 'aceita' }))
    expect(res.status).toBe(200)

    const lead = supabaseHolder.current.db.leads.find((l) => l.id === 'l1')
    expect(lead?.estagio_funil).toBe('fechado')
    expect(lead?.estagio_funil).not.toBe('fechamento')
  })
})
