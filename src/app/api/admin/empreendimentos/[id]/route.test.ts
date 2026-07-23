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

import { DELETE, PUT } from './route'

type Row = Record<string, unknown>

function makeSupabase(row: Row) {
  const db: Row = { ...row }
  const eqCalls: Row[] = []
  const client = {
    from: (table: string) => {
      if (table !== 'properties') throw new Error(`unexpected table ${table}`)
      return {
        update(payload: Row) {
          Object.assign(db, payload)
          eqCalls.push(payload)
          const result = { data: { ...db }, error: null }
          return {
            // PUT encadeia .eq(...).select().single(); DELETE só faz
            // `await ...update(...).eq(...)` sem select — o objeto abaixo
            // precisa servir os dois: ser "thenable" (awaitable direto) E
            // expor .select() pra quem encadear.
            eq: () => ({
              select: () => ({ single: async () => result }),
              then: (resolve: (v: typeof result) => void) => resolve(result),
            }),
          }
        },
      }
    },
  }
  return { client, db, eqCalls }
}

function req(body: unknown) {
  return { json: async () => body } as unknown as Parameters<typeof PUT>[0]
}

function params(id: string) {
  return { params: Promise.resolve({ id }) }
}

describe('PUT /api/admin/empreendimentos/[id]', () => {
  beforeEach(() => {
    supabaseHolder.current = makeSupabase({
      id: 'p1', nome: 'Monte Leone', cidade: 'Criciúma', descricao: 'Um apê incrível',
      status: 'em_obras', status_venda: 'ativo', preco: 900000, video_url: 'https://x',
    })
  })
  afterEach(() => vi.clearAllMocks())

  it('update parcial (só status_venda) NÃO apaga nome/cidade/descrição/preço — bug real corrigido', async () => {
    const res = await PUT(req({ status_venda: 'pausado' }), params('p1'))
    expect(res.status).toBe(200)

    const { db } = supabaseHolder.current
    expect(db.status_venda).toBe('pausado')
    // nada mais deveria ter sido tocado
    expect(db.nome).toBe('Monte Leone')
    expect(db.cidade).toBe('Criciúma')
    expect(db.descricao).toBe('Um apê incrível')
    expect(db.preco).toBe(900000)
    expect(db.video_url).toBe('https://x')
    expect(db.status).toBe('em_obras') // status de obra intocado
  })

  it('editar o formulário completo grava status_obra e status_venda em colunas independentes', async () => {
    await PUT(
      req({
        nome: 'Monte Leone', cidade: 'Criciúma', status_obra: 'pronto', status_venda: 'encerrado',
      }),
      params('p1'),
    )
    const { db } = supabaseHolder.current
    expect(db.status).toBe('pronto')
    expect(db.status_venda).toBe('encerrado')
  })

  it('corpo vazio não gera update nenhum (erro claro em vez de UPDATE sem colunas)', async () => {
    const res = await PUT(req({}), params('p1'))
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/admin/empreendimentos/[id]', () => {
  beforeEach(() => {
    supabaseHolder.current = makeSupabase({
      id: 'p1', nome: 'Monte Leone', ativo: true, oculto: false,
    })
  })
  afterEach(() => vi.clearAllMocks())

  it('soft delete: marca ativo=false e oculto=true em vez de apagar a linha', async () => {
    const res = await DELETE(req({}), params('p1'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ success: true })

    const { db, eqCalls } = supabaseHolder.current
    // a linha continua existindo (não foi removida do "banco" simulado)
    expect(db.id).toBe('p1')
    expect(db.nome).toBe('Monte Leone')
    expect(db.ativo).toBe(false)
    expect(db.oculto).toBe(true)
    expect(eqCalls).toEqual([{ ativo: false, oculto: true }])
  })
})
