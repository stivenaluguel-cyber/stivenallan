import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

const { authHolder, supabaseHolder } = vi.hoisted(() => ({
  authHolder: { autenticado: true },
  supabaseHolder: { current: null as unknown as ReturnType<typeof makeSupabase> },
}))

vi.mock('@/lib/dashboard/auth-check', () => ({
  autenticado: async () => authHolder.autenticado,
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => supabaseHolder.current,
}))

import { PUT } from './route'

type MockConfig = {
  intervalosAntes?: Array<Record<string, unknown>>
  mensagensAntes?: Array<Record<string, unknown>>
  insertIntervalosError?: { message: string } | null
  insertMensagensError?: { message: string } | null
  historicoInsertShouldThrow?: boolean
}

function makeSupabase(cfg: MockConfig = {}) {
  const intervalosInserted: Record<string, unknown>[][] = []
  const mensagensInserted: Record<string, unknown>[][] = []
  const historicoInserts: Record<string, unknown>[] = []
  const deletes: string[] = []

  return {
    intervalosInserted,
    mensagensInserted,
    historicoInserts,
    deletes,
    from(table: string) {
      if (table === 'automacao_whatsapp_intervalos') {
        return {
          select: () => Promise.resolve({ data: cfg.intervalosAntes ?? [], error: null }),
          delete: () => ({
            gte: async () => {
              deletes.push(table)
              return { error: null }
            },
          }),
          insert: async (rows: Record<string, unknown>[]) => {
            intervalosInserted.push(rows)
            return { error: cfg.insertIntervalosError ?? null }
          },
        }
      }
      if (table === 'automacao_whatsapp_mensagens') {
        return {
          select: () => Promise.resolve({ data: cfg.mensagensAntes ?? [], error: null }),
          delete: () => ({
            gte: async () => {
              deletes.push(table)
              return { error: null }
            },
          }),
          insert: async (rows: Record<string, unknown>[]) => {
            mensagensInserted.push(rows)
            return { error: cfg.insertMensagensError ?? null }
          },
        }
      }
      if (table === 'automacao_historico') {
        return {
          insert: async (row: Record<string, unknown>) => {
            if (cfg.historicoInsertShouldThrow) throw new Error('historico insert failed')
            historicoInserts.push(row)
            return { error: null }
          },
        }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
  }
}

function makeReq(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest
}

describe('PUT /api/admin/automacoes/whatsapp', () => {
  beforeEach(() => {
    authHolder.autenticado = true
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    supabaseHolder.current = null as unknown as ReturnType<typeof makeSupabase>
    vi.restoreAllMocks()
  })

  it('401 se não autenticado', async () => {
    authHolder.autenticado = false
    const res = await PUT(makeReq({ intervalos: [], mensagens: [] }))
    expect(res.status).toBe(401)
  })

  it('rejeita quando intervalos e mensagens vêm vazios', async () => {
    const res = await PUT(makeReq({ intervalos: [], mensagens: [] }))
    expect(res.status).toBe(400)
    const json = (await res.json()) as { error: string }
    expect(json.error).toMatch(/não podem ficar vazios/)
  })

  it('rejeita quando uma mensagem individual vem vazia (validação por item, não só o array)', async () => {
    const res = await PUT(makeReq({
      intervalos: [{ ordem: 0, dias: 1 }],
      mensagens: [{ estagio_funil: 'primeiro_contato', ordem: 0, mensagem: '   ' }],
    }))
    expect(res.status).toBe(400)
    const json = (await res.json()) as { error: string }
    expect(json.error).toMatch(/vazia/)
  })

  it('rejeita quando um intervalo tem dias < 1', async () => {
    const res = await PUT(makeReq({
      intervalos: [{ ordem: 0, dias: 0 }],
      mensagens: [{ estagio_funil: 'primeiro_contato', ordem: 0, mensagem: 'Oi {nome}' }],
    }))
    expect(res.status).toBe(400)
  })

  it('salva com sucesso e grava historico com estado antes/depois', async () => {
    const mock = makeSupabase({
      intervalosAntes: [{ ordem: 0, dias: 1 }],
      mensagensAntes: [{ estagio_funil: 'primeiro_contato', ordem: 0, mensagem: 'texto antigo' }],
    })
    supabaseHolder.current = mock

    const novo = {
      intervalos: [{ ordem: 0, dias: 2 }],
      mensagens: [{ estagio_funil: 'primeiro_contato', ordem: 0, mensagem: 'texto novo' }],
    }
    const res = await PUT(makeReq(novo))
    expect(res.status).toBe(200)

    expect(mock.intervalosInserted[0]).toEqual(novo.intervalos)
    expect(mock.mensagensInserted[0]).toEqual(novo.mensagens)

    expect(mock.historicoInserts).toHaveLength(1)
    expect(mock.historicoInserts[0]).toMatchObject({
      tipo: 'whatsapp',
      payload_antes: { intervalos: [{ ordem: 0, dias: 1 }], mensagens: [{ estagio_funil: 'primeiro_contato', ordem: 0, mensagem: 'texto antigo' }] },
      payload_depois: novo,
    })
  })

  it('historico insert falhando não quebra a resposta de sucesso (fail-open)', async () => {
    const mock = makeSupabase({ historicoInsertShouldThrow: true })
    supabaseHolder.current = mock
    const res = await PUT(makeReq({
      intervalos: [{ ordem: 0, dias: 1 }],
      mensagens: [{ estagio_funil: 'primeiro_contato', ordem: 0, mensagem: 'Oi {nome}' }],
    }))
    expect(res.status).toBe(200)
  })

  it('500 se o insert de mensagens falhar', async () => {
    const mock = makeSupabase({ insertMensagensError: { message: 'db error' } })
    supabaseHolder.current = mock
    const res = await PUT(makeReq({
      intervalos: [{ ordem: 0, dias: 1 }],
      mensagens: [{ estagio_funil: 'primeiro_contato', ordem: 0, mensagem: 'Oi {nome}' }],
    }))
    expect(res.status).toBe(500)
  })
})
