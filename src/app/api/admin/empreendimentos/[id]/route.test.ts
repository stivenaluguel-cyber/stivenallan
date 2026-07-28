import { describe, expect, it, vi } from 'vitest'
import type { NextRequest } from 'next/server'

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: (n: string) => (n === 'dashboard_token' ? { value: 'valid' } : undefined) }),
}))
vi.mock('jose', () => ({ jwtVerify: async () => ({ payload: { adminId: 'admin-1' } }) }))

const { supabaseHolder } = vi.hoisted(() => ({ supabaseHolder: { current: null as any } }))
vi.mock('@supabase/supabase-js', () => ({ createClient: () => supabaseHolder.current }))

import { PUT } from './route'

/** Captura o objeto exato entregue ao .update() do Supabase. */
function makeSupabase() {
  const updates: Record<string, unknown>[] = []
  return {
    updates,
    from() {
      return {
        update(row: Record<string, unknown>) {
          updates.push(row)
          return {
            eq: () => ({
              select: () => ({ single: async () => ({ data: { id: 'p1', ...row }, error: null }) }),
            }),
          }
        },
      }
    },
  }
}

function req(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest
}
const params = Promise.resolve({ id: 'p1' })

describe('PUT /api/admin/empreendimentos/[id] — update parcial', () => {
  // O BUG: a listagem manda só {status_venda} ao trocar Ativo/Pausado, e o
  // update reescrevia a linha toda com null. Confirmado em produção: 8
  // empreendimentos perderam o status de obra.
  it('update só de status_venda não encosta em nenhum outro campo', async () => {
    const sb = makeSupabase()
    supabaseHolder.current = sb

    await PUT(req({ status_venda: 'pausado' }), { params })

    expect(sb.updates).toHaveLength(1)
    expect(sb.updates[0]).toEqual({ status_venda: 'pausado' })
  })

  it('não zera nome, cidade, descrição, galeria, diferenciais nem FAQ', async () => {
    const sb = makeSupabase()
    supabaseHolder.current = sb

    await PUT(req({ status_venda: 'encerrado' }), { params })

    const row = sb.updates[0]
    for (const campo of ['nome', 'cidade', 'uf', 'descricao', 'descricao_curta', 'preco', 'galeria', 'diferenciais', 'faq', 'cover_image_url', 'status']) {
      expect(campo in row, `"${campo}" não deveria estar no update parcial`).toBe(false)
    }
  })

  it('status de obra e status de venda não se sobrescrevem', async () => {
    const sb = makeSupabase()
    supabaseHolder.current = sb

    await PUT(req({ status_obra: 'em obras', status_venda: 'ativo' }), { params })

    expect(sb.updates[0]).toMatchObject({ status: 'em obras', status_venda: 'ativo' })
  })

  it('traduz o vocabulário antigo do formulário ao gravar', async () => {
    const sb = makeSupabase()
    supabaseHolder.current = sb

    await PUT(req({ status_obra: 'lancamento' }), { params })

    expect(sb.updates[0]).toEqual({ status: 'na planta' })
  })

  it('slugifica a construtora — senão a URL pública dá 404', async () => {
    const sb = makeSupabase()
    supabaseHolder.current = sb

    await PUT(req({ construtora: 'Acme Construções' }), { params })

    expect(sb.updates[0]).toEqual({ construtora_slug: 'acme-construcoes' })
  })

  it('recusa corpo vazio em vez de disparar um update sem campos', async () => {
    const sb = makeSupabase()
    supabaseHolder.current = sb

    const res = await PUT(req({}), { params })

    expect(res.status).toBe(400)
    expect(sb.updates).toHaveLength(0)
  })

  it('grava normalmente os campos enviados numa edição completa', async () => {
    const sb = makeSupabase()
    supabaseHolder.current = sb

    await PUT(req({
      nome: 'Villa Nova',
      cidade: 'Criciúma',
      descricao_completa: 'Texto longo',
      status_obra: 'pronto',
      imagens_urls: ['a.jpg', 'b.jpg'],
      faq: [{ pergunta: 'P', resposta: 'R' }],
    }), { params })

    expect(sb.updates[0]).toMatchObject({
      nome: 'Villa Nova',
      cidade: 'Criciúma',
      descricao: 'Texto longo',
      status: 'pronto',
      galeria: ['a.jpg', 'b.jpg'],
      faq: [{ pergunta: 'P', resposta: 'R' }],
    })
  })
})
