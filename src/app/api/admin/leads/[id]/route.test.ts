import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { supabaseHolder, requireAdminHolder, registrarMudancaEstagioMock, recalcularScoreLeadMock } = vi.hoisted(() => {
  const supabaseHolder = { current: null as unknown as ReturnType<typeof makeSupabase> }
  const requireAdminHolder = { current: async () => 'admin-1' as string | null }
  const registrarMudancaEstagioMock = vi.fn(async () => {})
  const recalcularScoreLeadMock = vi.fn(async () => null as null)
  return { supabaseHolder, requireAdminHolder, registrarMudancaEstagioMock, recalcularScoreLeadMock }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

vi.mock('@/lib/dashboard/admin-auth', () => ({
  requireAdmin: () => requireAdminHolder.current(),
}))

vi.mock('@/lib/leads/registrar-mudanca-estagio', () => ({
  registrarMudancaEstagio: registrarMudancaEstagioMock,
}))

vi.mock('@/lib/leads/score-server', () => ({
  recalcularScoreLead: recalcularScoreLeadMock,
}))

import { PUT, PATCH } from './route'

function makeSupabase(cfg: {
  estagioAtual?: string | null
  updatedRow?: Record<string, unknown>
  updateError?: { message: string } | null
} = {}) {
  const updates: Record<string, unknown>[] = []
  return {
    updates,
    from(table: string) {
      if (table !== 'leads') throw new Error(`Unexpected table: ${table}`)
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: cfg.estagioAtual !== undefined ? { estagio_funil: cfg.estagioAtual } : null,
              error: null,
            }),
          }),
        }),
        update: (payload: Record<string, unknown>) => {
          updates.push(payload)
          return {
            eq: () => ({
              select: () => ({
                single: () => Promise.resolve(
                  cfg.updateError
                    ? { data: null, error: cfg.updateError }
                    : { data: cfg.updatedRow ?? { id: 'lead-1', ...payload }, error: null }
                ),
              }),
            }),
          }
        },
      }
    },
  }
}

function makeReq(body?: unknown, opts: { invalidJson?: boolean } = {}) {
  return {
    json: async () => {
      if (opts.invalidJson) throw new SyntaxError('Unexpected token in JSON')
      return body
    },
  } as unknown as NextRequest
}

const params = (id: string) => ({ params: Promise.resolve({ id }) })

describe('PUT /api/admin/leads/[id]', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    requireAdminHolder.current = async () => 'admin-1'
    registrarMudancaEstagioMock.mockClear()
  })

  it('Item 8: sem sessao admin, PUT continua 401', async () => {
    requireAdminHolder.current = async () => null
    const res = await PUT(makeReq({ nome: 'Ana' }), params('lead-1'))
    expect(res.status).toBe(401)
  })

  it('Item 8: JSON invalido retorna 400 e nao chama update no Supabase', async () => {
    const sb = makeSupabase({ estagioAtual: null })
    supabaseHolder.current = sb
    const res = await PUT(makeReq(undefined, { invalidJson: true }), params('lead-1'))
    expect(res.status).toBe(400)
    expect(sb.updates).toHaveLength(0)
  })

  it('Item 8: campos legitimos sao aplicados e updated_at e gerado pelo servidor', async () => {
    const sb = makeSupabase({ estagioAtual: null })
    supabaseHolder.current = sb
    const res = await PUT(makeReq({ nome: 'Ana', temperatura: 5 }), params('lead-1'))
    expect(res.status).toBe(200)
    expect(sb.updates).toHaveLength(1)
    const sent = sb.updates[0]
    expect(sent.nome).toBe('Ana')
    expect(sent.temperatura).toBe(5)
    expect(typeof sent.updated_at).toBe('string')
    expect(Object.keys(sent).sort()).toEqual(['nome', 'temperatura', 'updated_at'].sort())
  })

  it('Item 8: mass assignment bloqueado — id/created_at/lead_score/cliente_id nunca chegam ao .update()', async () => {
    const sb = makeSupabase({ estagioAtual: null })
    supabaseHolder.current = sb
    const res = await PUT(makeReq({
      id: 'outro-id',
      created_at: '2020-01-01T00:00:00Z',
      lead_score: 999,
      cliente_id: 'cliente-x',
      nome: 'Ana',
    }), params('lead-1'))
    expect(res.status).toBe(200)
    const sent = sb.updates[0]
    expect(sent).not.toHaveProperty('id')
    expect(sent).not.toHaveProperty('created_at')
    expect(sent).not.toHaveProperty('lead_score')
    expect(sent).not.toHaveProperty('cliente_id')
    expect(sent.nome).toBe('Ana')
  })

  it('Item 8: updated_at enviado pelo cliente nao prevalece — servidor gera o proprio timestamp', async () => {
    const sb = makeSupabase({ estagioAtual: null })
    supabaseHolder.current = sb
    const antesMs = Date.now()
    const res = await PUT(makeReq({ nome: 'Ana', updated_at: '1999-01-01T00:00:00.000Z' }), params('lead-1'))
    expect(res.status).toBe(200)
    const sent = sb.updates[0]
    expect(sent.updated_at).not.toBe('1999-01-01T00:00:00.000Z')
    expect(new Date(sent.updated_at as string).getTime()).toBeGreaterThanOrEqual(antesMs)
  })

  it('Item 8: estagio_funil mudou -> registrarMudancaEstagio chamado exatamente 1x com de/para corretos', async () => {
    const sb = makeSupabase({ estagioAtual: 'novo' })
    supabaseHolder.current = sb
    const res = await PUT(makeReq({ estagio_funil: 'qualificado' }), params('lead-1'))
    expect(res.status).toBe(200)
    expect(registrarMudancaEstagioMock).toHaveBeenCalledTimes(1)
    expect(registrarMudancaEstagioMock).toHaveBeenCalledWith(expect.anything(), 'lead-1', 'novo', 'qualificado')
  })

  it('Item 8: estagio_funil igual ao atual -> nao registra transicao', async () => {
    const sb = makeSupabase({ estagioAtual: 'qualificado' })
    supabaseHolder.current = sb
    const res = await PUT(makeReq({ estagio_funil: 'qualificado' }), params('lead-1'))
    expect(res.status).toBe(200)
    expect(registrarMudancaEstagioMock).not.toHaveBeenCalled()
  })

  it('Item 8: campo arbitrario nao-whitelisted nao entra no update nem dispara transicao', async () => {
    const sb = makeSupabase({ estagioAtual: 'novo' })
    supabaseHolder.current = sb
    const res = await PUT(makeReq({ estagio_funil_fake: 'qualquer', outroCampo: 'x' }), params('lead-1'))
    expect(res.status).toBe(200)
    expect(registrarMudancaEstagioMock).not.toHaveBeenCalled()
    const sent = sb.updates[0]
    expect(sent).not.toHaveProperty('estagio_funil_fake')
    expect(sent).not.toHaveProperty('outroCampo')
    expect(Object.keys(sent)).toEqual(['updated_at'])
  })
})

describe('PATCH /api/admin/leads/[id]', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    requireAdminHolder.current = async () => 'admin-1'
    registrarMudancaEstagioMock.mockClear()
    recalcularScoreLeadMock.mockClear()
  })

  it('Item 8: sem sessao admin, PATCH continua 401', async () => {
    requireAdminHolder.current = async () => null
    const res = await PATCH(makeReq({ nome: 'Ana' }), params('lead-1'))
    expect(res.status).toBe(401)
  })

  it('Item 8: JSON invalido retorna 400 e nao chama update no Supabase', async () => {
    const sb = makeSupabase({ estagioAtual: null })
    supabaseHolder.current = sb
    const res = await PATCH(makeReq(undefined, { invalidJson: true }), params('lead-1'))
    expect(res.status).toBe(400)
    expect(sb.updates).toHaveLength(0)
  })

  it('Item 8: apos o reordenamento, whitelist e transicao de estagio continuam preservadas', async () => {
    const sb = makeSupabase({ estagioAtual: 'novo', updatedRow: { id: 'lead-1', estagio_funil: 'qualificado' } })
    supabaseHolder.current = sb
    const res = await PATCH(makeReq({ estagio_funil: 'qualificado', id: 'outro-id' }), params('lead-1'))
    expect(res.status).toBe(200)
    expect(registrarMudancaEstagioMock).toHaveBeenCalledTimes(1)
    expect(registrarMudancaEstagioMock).toHaveBeenCalledWith(expect.anything(), 'lead-1', 'novo', 'qualificado')
    const sent = sb.updates[0]
    expect(sent).not.toHaveProperty('id')
    expect(sent.estagio_funil).toBe('qualificado')
    expect(recalcularScoreLeadMock).toHaveBeenCalledTimes(1)
  })
})
