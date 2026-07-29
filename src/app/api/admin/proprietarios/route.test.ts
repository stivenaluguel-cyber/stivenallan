import { describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: (n: string) => (n === 'dashboard_token' ? { value: 'valid' } : undefined) }),
}))
vi.mock('jose', () => ({ jwtVerify: async () => ({ payload: { adminId: 'admin-1' } }) }))

const { holder } = vi.hoisted(() => ({ holder: { current: null as any } }))
vi.mock('@supabase/supabase-js', () => ({ createClient: () => holder.current }))

import { PATCH } from './route'

function makeSupabase() {
  const updates: Record<string, unknown>[] = []
  return {
    updates,
    from() {
      return {
        update(row: Record<string, unknown>) {
          updates.push(row)
          return { eq: () => ({ select: () => ({ single: async () => ({ data: { id: 'p1', ...row }, error: null }) }) }) }
        },
      }
    },
  }
}

const req = (body: unknown) => ({ json: async () => body }) as unknown as NextRequest

describe('PATCH /api/admin/proprietarios', () => {
  // Mesma classe de bug que zerou 8 empreendimentos hoje: o Kanban manda só
  // {id, estagio} ao arrastar um cartão, e um update que reconstrói a linha
  // apagaria endereço, valor e autorização do proprietário.
  it('arrastar cartão no Kanban não apaga nenhum outro campo', async () => {
    const sb = makeSupabase()
    holder.current = sb

    await PATCH(req({ id: 'p1', estagio: 'avaliacao_agendada' }))

    const row = sb.updates[0]
    expect(row.estagio).toBe('avaliacao_agendada')
    for (const campo of ['nome', 'whatsapp', 'endereco', 'valor_pretendido', 'autorizacao', 'anotacoes', 'cidade']) {
      expect(campo in row, `"${campo}" não deveria estar no update parcial`).toBe(false)
    }
  })

  it('publicar registra a data automaticamente', async () => {
    const sb = makeSupabase()
    holder.current = sb

    await PATCH(req({ id: 'p1', estagio: 'publicado' }))

    expect(sb.updates[0].publicado_em).toBeTruthy()
  })

  it('estágio que não existe é recusado antes de tocar no banco', async () => {
    const sb = makeSupabase()
    holder.current = sb

    const res = await PATCH(req({ id: 'p1', estagio: 'quase_vendido' }))

    expect(res.status).toBe(400)
    expect(sb.updates).toHaveLength(0)
  })

  // A separação dos dois funis tem que valer também na API, não só no tipo.
  it('estágio do funil de COMPRADORES é recusado', async () => {
    const sb = makeSupabase()
    holder.current = sb

    const res = await PATCH(req({ id: 'p1', estagio: 'proposta_enviada' }))

    expect(res.status).toBe(400)
    expect(sb.updates).toHaveLength(0)
  })

  it('corpo sem campo nenhum é recusado em vez de disparar update vazio', async () => {
    const sb = makeSupabase()
    holder.current = sb

    const res = await PATCH(req({ id: 'p1' }))

    expect(res.status).toBe(400)
    expect(sb.updates).toHaveLength(0)
  })

  it('sem id devolve 400', async () => {
    holder.current = makeSupabase()
    expect((await PATCH(req({ estagio: 'novo' }))).status).toBe(400)
  })

  it('aceita marcar autorização e valor acordado juntos', async () => {
    const sb = makeSupabase()
    holder.current = sb

    await PATCH(req({ id: 'p1', autorizacao: true, valor_acordado: 480000 }))

    expect(sb.updates[0]).toMatchObject({ autorizacao: true, valor_acordado: 480000 })
    expect('estagio' in sb.updates[0]).toBe(false)
  })

  it('aceita desmarcar autorização (false não é "vazio")', async () => {
    const sb = makeSupabase()
    holder.current = sb

    await PATCH(req({ id: 'p1', autorizacao: false }))

    expect(sb.updates[0].autorizacao).toBe(false)
  })
})
