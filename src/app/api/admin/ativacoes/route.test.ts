import { describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: (n: string) => (n === 'dashboard_token' ? { value: 'valid' } : undefined) }),
}))
vi.mock('jose', () => ({ jwtVerify: async () => ({ payload: { adminId: 'admin-1' } }) }))

const { holder } = vi.hoisted(() => ({ holder: { current: null as any } }))
vi.mock('@supabase/supabase-js', () => ({ createClient: () => holder.current }))

import { PATCH, POST } from './route'

function makeSupabase() {
  const updates: Record<string, unknown>[] = []
  const upserts: { rows: Record<string, unknown>[]; opts: unknown }[] = []
  return {
    updates,
    upserts,
    from() {
      return {
        update(row: Record<string, unknown>) {
          updates.push(row)
          return { eq: () => ({ select: () => ({ single: async () => ({ data: { id: 'a1', ...row }, error: null }) }) }) }
        },
        upsert(rows: Record<string, unknown>[], opts: unknown) {
          upserts.push({ rows, opts })
          return { select: async () => ({ data: rows.map((r, i) => ({ id: 'a' + i, ...r })), error: null }) }
        },
      }
    },
  }
}

const req = (body: unknown) => ({ json: async () => body }) as unknown as NextRequest

describe('PATCH /api/admin/ativacoes', () => {
  // Mesma classe de bug que zerou 8 empreendimentos: o Kanban manda só
  // {id, status} ao arrastar um cartão, e um update que reconstrói a linha
  // apagaria nome, contexto, anotações e o vínculo com o lead.
  it('arrastar cartão no Kanban não apaga nenhum outro campo', async () => {
    const sb = makeSupabase()
    holder.current = sb

    await PATCH(req({ id: 'a1', status: 'respondeu' }))

    const row = sb.updates[0]
    expect(row.status).toBe('respondeu')
    for (const campo of ['username', 'nome', 'origem', 'contexto', 'anotacoes', 'lead_id', 'abordado_em']) {
      expect(campo in row, `"${campo}" não deveria estar no update parcial`).toBe(false)
    }
  })

  it('marcar como abordado registra abordado_em automaticamente', async () => {
    const sb = makeSupabase()
    holder.current = sb

    await PATCH(req({ id: 'a1', status: 'abordado' }))

    expect(sb.updates[0].status).toBe('abordado')
    expect(sb.updates[0].abordado_em).toBeTruthy()
  })

  it('status que não existe é recusado antes de tocar no banco', async () => {
    const sb = makeSupabase()
    holder.current = sb

    const res = await PATCH(req({ id: 'a1', status: 'quase_respondeu' }))

    expect(res.status).toBe(400)
    expect(sb.updates).toHaveLength(0)
  })

  it('origem que não existe é recusada antes de tocar no banco', async () => {
    const sb = makeSupabase()
    holder.current = sb

    const res = await PATCH(req({ id: 'a1', origem: 'dm_frio' }))

    expect(res.status).toBe(400)
    expect(sb.updates).toHaveLength(0)
  })

  it('corpo sem campo nenhum é recusado em vez de disparar update vazio', async () => {
    const sb = makeSupabase()
    holder.current = sb

    const res = await PATCH(req({ id: 'a1' }))

    expect(res.status).toBe(400)
    expect(sb.updates).toHaveLength(0)
  })

  it('sem id devolve 400', async () => {
    holder.current = makeSupabase()
    expect((await PATCH(req({ status: 'pendente' }))).status).toBe(400)
  })

  it('aceita vincular lead e anotar na mesma chamada', async () => {
    const sb = makeSupabase()
    holder.current = sb

    await PATCH(req({ id: 'a1', lead_id: 'lead-9', anotacoes: 'pediu tabela do Pineto' }))

    expect(sb.updates[0]).toMatchObject({ lead_id: 'lead-9', anotacoes: 'pediu tabela do Pineto' })
    expect('status' in sb.updates[0]).toBe(false)
  })
})

describe('POST /api/admin/ativacoes (lote)', () => {
  it('normaliza username e deduplica dentro do lote', async () => {
    const sb = makeSupabase()
    holder.current = sb

    const res = await POST(
      req({
        itens: [
          { username: '@Maria_SC ', origem: 'curtida', contexto: 'post financiamento' },
          { username: 'maria_sc', origem: 'curtida' }, // duplicata da mesma pessoa
          { username: 'joao', origem: 'novo_seguidor', nome: 'João' },
        ],
      })
    )

    expect(res.status).toBe(201)
    const { rows, opts } = sb.upserts[0]
    expect(rows).toHaveLength(2)
    expect(rows[0].username).toBe('maria_sc')
    expect(rows[1]).toMatchObject({ username: 'joao', origem: 'novo_seguidor', nome: 'João' })
    // Reimportar a mesma lista não pode rebaixar quem já foi abordado.
    expect(opts).toMatchObject({ onConflict: 'username,origem', ignoreDuplicates: true })
  })

  it('a mesma pessoa em origens diferentes NÃO é deduplicada', async () => {
    const sb = makeSupabase()
    holder.current = sb

    await POST(
      req({
        itens: [
          { username: 'maria', origem: 'curtida' },
          { username: 'maria', origem: 'comentario' },
        ],
      })
    )

    expect(sb.upserts[0].rows).toHaveLength(2)
  })

  it('origem inválida em qualquer item recusa o lote inteiro sem tocar no banco', async () => {
    const sb = makeSupabase()
    holder.current = sb

    const res = await POST(
      req({
        itens: [
          { username: 'maria', origem: 'curtida' },
          { username: 'joao', origem: 'seguidor' },
        ],
      })
    )

    expect(res.status).toBe(400)
    expect(sb.upserts).toHaveLength(0)
  })

  it('item sem username recusa o lote', async () => {
    const sb = makeSupabase()
    holder.current = sb

    const res = await POST(req({ itens: [{ username: '  @ ', origem: 'curtida' }] }))

    expect(res.status).toBe(400)
    expect(sb.upserts).toHaveLength(0)
  })

  it('corpo vazio devolve 400', async () => {
    const sb = makeSupabase()
    holder.current = sb

    expect((await POST(req({}))).status).toBe(400)
    expect((await POST(req(null))).status).toBe(400)
    expect(sb.upserts).toHaveLength(0)
  })
})
