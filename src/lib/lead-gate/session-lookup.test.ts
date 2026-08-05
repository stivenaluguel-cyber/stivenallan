import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { hashSessionToken } from './session'
import { lookupSessionByToken, touchSessionLastSeen } from './session-lookup'

function makeSupabase(row: Record<string, unknown> | null, updateCalls: unknown[] = []) {
  const client = {
    from(table: string) {
      return {
        select() {
          return {
            eq() {
              return { maybeSingle: async () => ({ data: row, error: row ? null : { message: 'not found' } }) }
            },
          }
        },
        update(payload: unknown) {
          updateCalls.push({ table, payload })
          return { eq: async () => ({ data: null, error: null }) }
        },
      }
    },
  }
  return client as unknown as SupabaseClient
}

const FUTURE = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
const PAST = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

describe('lookupSessionByToken', () => {
  it('valida sessao ativa e devolve leadId', async () => {
    const token = 'token-de-teste'
    const client = makeSupabase({
      id: 'sess-1',
      lead_id: 'lead-1',
      expires_at: FUTURE,
      revoked_at: null,
      last_seen_at: new Date().toISOString(),
    })
    const resultado = await lookupSessionByToken(client, token)
    expect(resultado).toMatchObject({ status: 'valid', sessionId: 'sess-1', leadId: 'lead-1' })
  })

  it('token que nao bate com nenhum hash: invalid, sem vazar detalhe', async () => {
    const client = makeSupabase(null)
    const resultado = await lookupSessionByToken(client, 'token-inexistente')
    expect(resultado).toEqual({ status: 'invalid' })
  })

  it('sessao revogada: invalid mesmo com expires_at no futuro', async () => {
    const client = makeSupabase({
      id: 'sess-1', lead_id: 'lead-1', expires_at: FUTURE,
      revoked_at: new Date().toISOString(), last_seen_at: new Date().toISOString(),
    })
    const resultado = await lookupSessionByToken(client, 'token')
    expect(resultado).toEqual({ status: 'invalid' })
  })

  it('sessao expirada: invalid', async () => {
    const client = makeSupabase({
      id: 'sess-1', lead_id: 'lead-1', expires_at: PAST,
      revoked_at: null, last_seen_at: new Date().toISOString(),
    })
    const resultado = await lookupSessionByToken(client, 'token')
    expect(resultado).toEqual({ status: 'invalid' })
  })

  it('nunca expoe o hash nem o token — so leadId/sessionId no resultado valido', async () => {
    const token = 'token-secreto'
    const client = makeSupabase({
      id: 'sess-1', lead_id: 'lead-1', expires_at: FUTURE, revoked_at: null, last_seen_at: new Date().toISOString(),
    })
    const resultado = await lookupSessionByToken(client, token)
    const serializado = JSON.stringify(resultado)
    expect(serializado).not.toContain(hashSessionToken(token))
    expect(serializado).not.toContain(token)
  })
})

describe('touchSessionLastSeen', () => {
  it('atualiza quando o ultimo last_seen_at tem mais de 1h (throttle)', async () => {
    const calls: unknown[] = []
    const client = makeSupabase(null, calls)
    await touchSessionLastSeen(client, 'sess-1', PAST)
    expect(calls).toHaveLength(1)
  })

  it('nao atualiza quando last_seen_at e recente (evita UPDATE a cada poll)', async () => {
    const calls: unknown[] = []
    const client = makeSupabase(null, calls)
    await touchSessionLastSeen(client, 'sess-1', new Date().toISOString())
    expect(calls).toHaveLength(0)
  })
})
