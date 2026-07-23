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
  passosAntes?: Array<Record<string, unknown>>
  insertError?: { message: string } | null
  historicoInsertShouldThrow?: boolean
}

function makeSupabase(cfg: MockConfig = {}) {
  const inserted: Record<string, unknown>[][] = []
  const historicoInserts: Record<string, unknown>[] = []

  return {
    inserted,
    historicoInserts,
    from(table: string) {
      if (table === 'automacao_email_passos') {
        return {
          select: () => Promise.resolve({ data: cfg.passosAntes ?? [], error: null }),
          delete: () => ({
            gte: async () => ({ error: null }),
          }),
          insert: async (rows: Record<string, unknown>[]) => {
            inserted.push(rows)
            return { error: cfg.insertError ?? null }
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

describe('PUT /api/admin/automacoes/email', () => {
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
    const res = await PUT(makeReq({ passos: [] }))
    expect(res.status).toBe(401)
  })

  it('rejeita quando passos vem vazio', async () => {
    const res = await PUT(makeReq({ passos: [] }))
    expect(res.status).toBe(400)
    const json = (await res.json()) as { error: string }
    expect(json.error).toMatch(/não podem ficar vazios/)
  })

  it('rejeita quando um passo tem assunto vazio', async () => {
    const res = await PUT(makeReq({
      passos: [{ ordem: 0, dias_minimos: 2, assunto: '   ', corpo_html: '<p>oi</p>' }],
    }))
    expect(res.status).toBe(400)
    const json = (await res.json()) as { error: string }
    expect(json.error).toMatch(/assunto está vazio/)
  })

  it('rejeita quando um passo tem corpo_html vazio', async () => {
    const res = await PUT(makeReq({
      passos: [{ ordem: 0, dias_minimos: 2, assunto: 'Oi {nome}', corpo_html: '' }],
    }))
    expect(res.status).toBe(400)
    const json = (await res.json()) as { error: string }
    expect(json.error).toMatch(/corpo do e-mail está vazio/)
  })

  it('rejeita quando dias_minimos é negativo', async () => {
    const res = await PUT(makeReq({
      passos: [{ ordem: 0, dias_minimos: -1, assunto: 'Oi {nome}', corpo_html: '<p>oi</p>' }],
    }))
    expect(res.status).toBe(400)
  })

  it('salva com sucesso e grava historico com estado antes/depois', async () => {
    const mock = makeSupabase({ passosAntes: [{ ordem: 0, dias_minimos: 2, assunto: 'antigo', corpo_html: '<p>antigo</p>' }] })
    supabaseHolder.current = mock

    const novo = { passos: [{ ordem: 0, dias_minimos: 3, assunto: 'novo', corpo_html: '<p>novo</p>' }] }
    const res = await PUT(makeReq(novo))
    expect(res.status).toBe(200)

    expect(mock.inserted[0]).toEqual(novo.passos)
    expect(mock.historicoInserts).toHaveLength(1)
    expect(mock.historicoInserts[0]).toMatchObject({
      tipo: 'email',
      payload_antes: [{ ordem: 0, dias_minimos: 2, assunto: 'antigo', corpo_html: '<p>antigo</p>' }],
      payload_depois: novo.passos,
    })
  })

  it('historico insert falhando não quebra a resposta de sucesso (fail-open)', async () => {
    const mock = makeSupabase({ historicoInsertShouldThrow: true })
    supabaseHolder.current = mock
    const res = await PUT(makeReq({
      passos: [{ ordem: 0, dias_minimos: 2, assunto: 'Oi {nome}', corpo_html: '<p>oi</p>' }],
    }))
    expect(res.status).toBe(200)
  })

  it('500 se o insert falhar', async () => {
    const mock = makeSupabase({ insertError: { message: 'db error' } })
    supabaseHolder.current = mock
    const res = await PUT(makeReq({
      passos: [{ ordem: 0, dias_minimos: 2, assunto: 'Oi {nome}', corpo_html: '<p>oi</p>' }],
    }))
    expect(res.status).toBe(500)
  })
})
