import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { upsertAdsLead } from './upsert-ads-lead'

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
          return {
            select: () => ({
              single: async () => ({ data: insertError ? null : insertData, error: insertError }),
            }),
          }
        },
        select() {
          calls.push({ table, op: 'select' })
          return {
            eq: (_field: string, _val: unknown) => ({
              maybeSingle: async () => ({ data: existente, error: null }),
            }),
          }
        },
      }
    },
  }
  return { client: client as unknown as SupabaseClient, calls }
}

describe('upsertAdsLead', () => {
  it('cria um lead novo quando o insert funciona', async () => {
    const { client, calls } = makeSupabase()
    const resultado = await upsertAdsLead(client, {
      nome: 'Fulano', whatsapp: '+55 11 99999-9999', email: 'Fulano@Example.com',
      origem: 'Meta Ads', source: 'meta_lead_ads:form-1',
    })
    expect(resultado).toEqual({ status: 'created', id: 'lead-novo' })

    const insertCall = calls.find((c) => c.op === 'insert')!
    const payload = insertCall.payload as Record<string, unknown>
    // Normalização de telefone/email antes de gravar (mesmas regras do resto do app).
    expect(payload.whatsapp).toBe('5511999999999')
    expect(payload.email).toBe('fulano@example.com')
    expect(payload.origem).toBe('Meta Ads')
    expect(payload.estagio_funil).toBe('primeiro_contato')
  })

  it('nao inventa telefone: pula o lead quando nao ha whatsapp', async () => {
    const { client, calls } = makeSupabase()
    const resultado = await upsertAdsLead(client, {
      nome: 'Fulano', whatsapp: null, email: 'fulano@example.com',
      origem: 'Google Ads', source: 'google_lead_ads:form-1',
    })
    expect(resultado.status).toBe('skipped')
    expect(calls).toHaveLength(0)
  })

  it('em conflito de whatsapp (23505), devolve o lead existente sem tentar sobrescrever', async () => {
    const { client } = makeSupabase({ insertError: { code: '23505', message: 'duplicate key' }, existente: { id: 'lead-ja-existe' } })
    const resultado = await upsertAdsLead(client, {
      nome: 'Fulano', whatsapp: '11999999999', email: null,
      origem: 'Meta Ads', source: 'meta_lead_ads:form-1',
    })
    expect(resultado).toEqual({ status: 'existing', id: 'lead-ja-existe' })
  })

  it('outros erros de insert viram skipped (nunca lancam excecao pro caller)', async () => {
    const { client } = makeSupabase({ insertError: { code: '500', message: 'db indisponivel' } })
    const resultado = await upsertAdsLead(client, {
      nome: 'Fulano', whatsapp: '11999999999', email: null,
      origem: 'Google Ads', source: 'google_lead_ads:form-1',
    })
    expect(resultado.status).toBe('skipped')
  })
})
