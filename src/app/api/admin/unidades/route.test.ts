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

import { POST, PATCH } from './route'

type Row = Record<string, unknown>

function makeSupabase(seed: { empreendimentos_unidades?: Row[]; configuracoes_cub?: Row[] }) {
  const db: Record<string, Row[]> = {
    empreendimentos_unidades: seed.empreendimentos_unidades ?? [],
    configuracoes_cub: seed.configuracoes_cub ?? [],
  }

  function chain(table: string) {
    const api = {
      select: () => api,
      order: () => api,
      limit: () => api,
      insert(row: Row) {
        const withId = { id: 'gen-' + Math.random().toString(36).slice(2), ...row }
        db[table].push(withId)
        return { select: () => ({ single: async () => ({ data: withId, error: null }) }) }
      },
      update(payload: Row) {
        return {
          eq(field: string, val: unknown) {
            const matched = db[table].filter((r) => r[field] === val)
            matched.forEach((r) => Object.assign(r, payload))
            return { select: () => ({ single: async () => ({ data: matched[0] ?? null, error: matched.length ? null : { message: 'not found' } }) }) }
          },
        }
      },
      single: async () => ({ data: db[table][0] ?? null, error: null }),
    }
    return api
  }

  return { client: { from: (table: string) => chain(table) }, db }
}

function req(body: unknown) {
  return { json: async () => body } as unknown as Parameters<typeof POST>[0]
}

describe('POST /api/admin/unidades', () => {
  beforeEach(() => {
    supabaseHolder.current = makeSupabase({ empreendimentos_unidades: [] })
  })
  afterEach(() => vi.clearAllMocks())

  it('grava vagas/situacao/data_tabela quando enviados (migration 0018)', async () => {
    const res = await POST(req({
      empreendimento_id: 'e1', unidade: '101', metragem: 60,
      vagas: 2, situacao: 'reservada', data_tabela: '2026-06-01',
    }))
    expect(res.status).toBe(201)

    const salva = supabaseHolder.current.db.empreendimentos_unidades[0]
    expect(salva.vagas).toBe(2)
    expect(salva.situacao).toBe('reservada')
    expect(salva.data_tabela).toBe('2026-06-01')
  })

  it('rejeita situacao fora do enum com 400 (mesmo enum do check constraint da migration 0018)', async () => {
    const res = await POST(req({
      empreendimento_id: 'e1', unidade: '101', metragem: 60, situacao: 'esgotada',
    }))
    expect(res.status).toBe(400)
    expect(supabaseHolder.current.db.empreendimentos_unidades).toHaveLength(0)
  })
})

describe('PATCH /api/admin/unidades', () => {
  beforeEach(() => {
    supabaseHolder.current = makeSupabase({
      empreendimentos_unidades: [{ id: 'u1', unidade: '101', situacao: 'disponivel' }],
    })
  })
  afterEach(() => vi.clearAllMocks())

  it('atualiza situacao pra um valor válido', async () => {
    const res = await PATCH(req({ id: 'u1', situacao: 'vendida' }))
    expect(res.status).toBe(200)
    expect(supabaseHolder.current.db.empreendimentos_unidades[0].situacao).toBe('vendida')
  })

  it('rejeita situacao inválida com 400 e não altera a linha', async () => {
    const res = await PATCH(req({ id: 'u1', situacao: 'invalida' }))
    expect(res.status).toBe(400)
    expect(supabaseHolder.current.db.empreendimentos_unidades[0].situacao).toBe('disponivel')
  })
})
