import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { resolveOrCreateInstagramLead } from './upsert-instagram-lead'

type Call = { table: string; op: string; payload?: unknown }

function makeSupabase({
  insertError = null,
  insertData = { id: 'lead-novo' },
  existente = { id: 'lead-existente' },
}: {
  insertError?: { code?: string; message?: string } | null
  insertData?: { id: string } | null
  existente?: { id: string } | null
} = {}) {
  const calls: Call[] = []
  const client = {
    from(table: string) {
      return {
        insert(payload: unknown) {
          calls.push({ table, op: 'insert', payload })
          return { select: () => ({ single: async () => ({ data: insertError ? null : insertData, error: insertError }) }) }
        },
        select() {
          calls.push({ table, op: 'select' })
          return { eq: (_f: string, _v: unknown) => ({ maybeSingle: async () => ({ data: existente, error: null }) }) }
        },
      }
    },
  }
  return { client: client as unknown as SupabaseClient, calls }
}

describe('resolveOrCreateInstagramLead', () => {
  it('cria o lead com placeholder ig:<igsid> quando ainda nao existe', async () => {
    const { client, calls } = makeSupabase()
    const resultado = await resolveOrCreateInstagramLead(client, { igsid: '17841400000000000', nomeSugerido: 'fulano.oficial' })
    expect(resultado).toEqual({ status: 'created', id: 'lead-novo' })

    const payload = calls.find((c) => c.op === 'insert')!.payload as Record<string, unknown>
    expect(payload.whatsapp).toBe('ig:17841400000000000')
    expect(payload.nome).toBe('fulano.oficial')
    expect(payload.origem).toBe('Instagram DM')
    expect(payload.estagio_funil).toBe('primeiro_contato')
  })

  it('reaproveita o lead existente em vez de duplicar quando a mesma conversa manda outra mensagem', async () => {
    const { client } = makeSupabase({ insertError: { code: '23505', message: 'duplicate key' }, existente: { id: 'lead-ja-existe' } })
    const resultado = await resolveOrCreateInstagramLead(client, { igsid: '17841400000000000' })
    expect(resultado).toEqual({ status: 'existing', id: 'lead-ja-existe' })
  })

  it('nao lanca excecao em outros erros de insert', async () => {
    const { client } = makeSupabase({ insertError: { code: '500', message: 'db indisponivel' } })
    const resultado = await resolveOrCreateInstagramLead(client, { igsid: '17841400000000000' })
    expect(resultado.status).toBe('skipped')
  })

  it('funciona sem nome sugerido (perfil nao encontrado na Graph API)', async () => {
    const { client, calls } = makeSupabase()
    await resolveOrCreateInstagramLead(client, { igsid: '17841400000000000' })
    const payload = calls.find((c) => c.op === 'insert')!.payload as Record<string, unknown>
    expect(payload.nome).toBeNull()
  })
})
