import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { supabaseHolder } = vi.hoisted(() => ({
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> | null },
}))

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => supabaseHolder.current,
}))

import { getDashboardStats, getRecentLeads } from './dashboard-data'

type Call = { table: string; method: string; args: unknown[] }

// Builder encadeável e "thenable" que espelha o postgrest-js real: cada
// `.eq()/.order()/.limit()` é registrado e retorna o próprio builder; o
// `.then()` resolve conforme o formato de `select(...)` usado em page.tsx
// (contagem via {count:'exact', head:true} vs lista de leads recentes).
function makeSupabase(cfg: {
  totalEmpreendimentos?: number
  totalLeads?: number
  leadsNovos?: number
  recentLeads?: unknown[]
}) {
  const calls: Call[] = []

  function builder(table: string, selectArg: unknown, selectOpts: { count?: string; head?: boolean } | undefined) {
    let eqArgs: [string, unknown] | null = null
    const b = {
      eq(col: string, val: unknown) {
        calls.push({ table, method: 'eq', args: [col, val] })
        eqArgs = [col, val]
        return b
      },
      order(...args: unknown[]) {
        calls.push({ table, method: 'order', args })
        return b
      },
      limit(...args: unknown[]) {
        calls.push({ table, method: 'limit', args })
        return b
      },
      then(resolve: (v: { count?: number; data: unknown; error: null }) => void) {
        if (selectOpts?.count === 'exact' && selectOpts.head) {
          if (table === 'empreendimentos') {
            resolve({ count: cfg.totalEmpreendimentos ?? 0, data: null, error: null })
            return
          }
          if (eqArgs && eqArgs[0] === 'status') {
            resolve({ count: cfg.leadsNovos ?? 0, data: null, error: null })
            return
          }
          resolve({ count: cfg.totalLeads ?? 0, data: null, error: null })
          return
        }
        resolve({ data: cfg.recentLeads ?? [], error: null })
      },
    }
    return b
  }

  return {
    calls,
    from(table: string) {
      return {
        select: (arg: unknown, opts?: { count?: string; head?: boolean }) => {
          calls.push({ table, method: 'select', args: [arg, opts] })
          return builder(table, arg, opts)
        },
      }
    },
  }
}

describe('admin/page — getDashboardStats', () => {
  afterEach(() => {
    supabaseHolder.current = null
  })

  it('retorna null quando o supabase admin nao esta configurado', async () => {
    supabaseHolder.current = null
    expect(await getDashboardStats()).toBeNull()
  })

  it('Item 6A: nunca consulta empreendimentos.destaque (card "Em Destaque" removido, coluna nunca existiu)', async () => {
    const sb = makeSupabase({ totalEmpreendimentos: 5, totalLeads: 10, leadsNovos: 2 })
    supabaseHolder.current = sb
    const stats = await getDashboardStats()
    expect(sb.calls.some((c) => c.method === 'eq' && c.args[0] === 'destaque')).toBe(false)
    expect(stats).toEqual({ totalEmpreendimentos: 5, totalLeads: 10, leadsNovos: 2 })
  })

  it('consulta apenas empreendimentos e leads (status="novo" é o único eq, coluna real)', async () => {
    const sb = makeSupabase({ totalEmpreendimentos: 1, totalLeads: 3, leadsNovos: 1 })
    supabaseHolder.current = sb
    await getDashboardStats()
    const tabelas = new Set(sb.calls.map((c) => c.table))
    expect(tabelas).toEqual(new Set(['empreendimentos', 'leads']))
    const eqCalls = sb.calls.filter((c) => c.method === 'eq')
    expect(eqCalls).toEqual([{ table: 'leads', method: 'eq', args: ['status', 'novo'] }])
  })
})

describe('admin/page — getRecentLeads', () => {
  afterEach(() => {
    supabaseHolder.current = null
  })

  it('retorna [] quando o supabase admin nao esta configurado', async () => {
    supabaseHolder.current = null
    expect(await getRecentLeads()).toEqual([])
  })

  it('Item 6A: select usa whatsapp, nunca telefone (leads.telefone nunca existiu no schema real)', async () => {
    const sb = makeSupabase({
      recentLeads: [{ id: 'lead-1', nome: 'Ana', whatsapp: '5548999999999', status: 'novo', created_at: null, empreendimentos: null }],
    })
    supabaseHolder.current = sb
    const leads = await getRecentLeads()
    const selectCall = sb.calls.find((c) => c.table === 'leads' && c.method === 'select')
    const selectString = selectCall?.args[0] as string
    expect(selectString).toContain('whatsapp')
    expect(selectString).not.toContain('telefone')
    expect(leads[0]).toMatchObject({ whatsapp: '5548999999999' })
  })

  it('propaga o embed empreendimentos(nome) sem alterar dados retornados', async () => {
    const sb = makeSupabase({
      recentLeads: [
        { id: 'lead-1', nome: 'Ana', whatsapp: '5548999999999', status: 'novo', created_at: '2026-08-01T10:00:00Z', empreendimentos: [{ nome: 'Monte Leone' }] },
      ],
    })
    supabaseHolder.current = sb
    const leads = await getRecentLeads()
    expect(leads[0].empreendimentos).toEqual([{ nome: 'Monte Leone' }])
  })
})
