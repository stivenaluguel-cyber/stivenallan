import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

const sendNotificationMock = vi.hoisted(() => vi.fn())
const setVapidDetailsMock = vi.hoisted(() => vi.fn())

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: setVapidDetailsMock,
    sendNotification: sendNotificationMock,
  },
}))

// Importado depois do mock (convenção vitest com vi.mock hoisted).
const { notificarLeadNovo } = await import('./notificar-lead-novo')

type Call = { table: string; op: string; payload?: unknown }

function makeSupabase({
  admin = { id: 'admin-1' },
  subs = [] as { id: string; endpoint: string; p256dh: string; auth: string }[],
} = {}) {
  const calls: Call[] = []
  const deletedIds: string[] = []
  const client = {
    from(table: string) {
      if (table === 'admin_users') {
        return {
          select() {
            calls.push({ table, op: 'select' })
            return { limit: () => ({ maybeSingle: async () => ({ data: admin, error: null }) }) }
          },
        }
      }
      if (table === 'crm_push_subscriptions') {
        return {
          select(): Promise<{ data: typeof subs; error: null }> {
            calls.push({ table, op: 'select' })
            return Promise.resolve({ data: subs, error: null })
          },
          delete() {
            return {
              eq: (_f: string, id: string) => {
                deletedIds.push(id)
                return Promise.resolve({ data: null, error: null })
              },
            }
          },
        }
      }
      // crm_notificacoes
      return {
        insert(payload: unknown) {
          calls.push({ table, op: 'insert', payload })
          return Promise.resolve({ data: null, error: null })
        },
      }
    },
  }
  return { client: client as unknown as SupabaseClient, calls, deletedIds }
}

beforeEach(() => {
  sendNotificationMock.mockReset()
  setVapidDetailsMock.mockReset()
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'chave-publica-teste'
  process.env.VAPID_PRIVATE_KEY = 'chave-privada-teste'
})

afterEach(() => {
  delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  delete process.env.VAPID_PRIVATE_KEY
})

describe('notificarLeadNovo', () => {
  it('sempre grava em crm_notificacoes, mesmo sem nenhuma assinatura push', async () => {
    const { client, calls } = makeSupabase({ subs: [] })
    await notificarLeadNovo(client, { id: 'lead-1', nome: 'Fulano', origem: 'Meta Ads' })

    const insertCall = calls.find((c) => c.table === 'crm_notificacoes' && c.op === 'insert')!
    const payload = insertCall.payload as Record<string, unknown>
    expect(payload.tipo).toBe('lead_novo')
    expect(payload.titulo).toBe('Novo lead: Fulano')
    expect(payload.link).toBe('/dashboard/crm?lead=lead-1')
    expect(sendNotificationMock).not.toHaveBeenCalled()
  })

  it('envia push pra cada assinatura cadastrada', async () => {
    const { client } = makeSupabase({
      subs: [
        { id: 'sub-1', endpoint: 'https://push.example/1', p256dh: 'p1', auth: 'a1' },
        { id: 'sub-2', endpoint: 'https://push.example/2', p256dh: 'p2', auth: 'a2' },
      ],
    })
    sendNotificationMock.mockResolvedValue({})
    await notificarLeadNovo(client, { id: 'lead-1', nome: 'Fulano', origem: 'Google Ads' })
    expect(sendNotificationMock).toHaveBeenCalledTimes(2)
  })

  it('remove assinatura expirada (404/410) sem lançar exceção', async () => {
    const { client, deletedIds } = makeSupabase({
      subs: [{ id: 'sub-expirada', endpoint: 'https://push.example/x', p256dh: 'p', auth: 'a' }],
    })
    sendNotificationMock.mockRejectedValue(Object.assign(new Error('gone'), { statusCode: 410 }))
    await expect(notificarLeadNovo(client, { id: 'lead-1', nome: 'Fulano', origem: null })).resolves.toBeUndefined()
    expect(deletedIds).toEqual(['sub-expirada'])
  })

  it('nao envia push se as chaves VAPID nao estao configuradas, mas nao lanca excecao', async () => {
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const { client } = makeSupabase({ subs: [{ id: 's1', endpoint: 'e', p256dh: 'p', auth: 'a' }] })
    await notificarLeadNovo(client, { id: 'lead-1', nome: 'Fulano', origem: 'Site' })
    expect(sendNotificationMock).not.toHaveBeenCalled()
  })

  it('nunca lanca excecao mesmo se o supabase falhar por completo', async () => {
    const client = {
      from() {
        throw new Error('conexao recusada')
      },
    } as unknown as SupabaseClient
    await expect(notificarLeadNovo(client, { id: 'lead-1', nome: null, origem: null })).resolves.toBeUndefined()
  })
})
