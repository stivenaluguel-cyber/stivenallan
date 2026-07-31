import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { resolveOrCreateInstagramLead, mensagemInstagramJaProcessada, registrarInteracaoInstagram } from './upsert-instagram-lead'

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

function makeSupabaseInteracoes({
  existente = null,
  insertError = null,
}: {
  existente?: { id: string } | null
  insertError?: { code?: string; message?: string } | null
} = {}) {
  const calls: Call[] = []
  const client = {
    from(table: string) {
      return {
        select() {
          calls.push({ table, op: 'select' })
          return { eq: (_f: string, _v: unknown) => ({ maybeSingle: async () => ({ data: existente, error: null }) }) }
        },
        insert(payload: unknown) {
          calls.push({ table, op: 'insert', payload })
          return Promise.resolve({ error: insertError })
        },
      }
    },
  }
  return { client: client as unknown as SupabaseClient, calls }
}

describe('mensagemInstagramJaProcessada', () => {
  it('retorna false quando o mid ainda nao foi visto', async () => {
    const { client } = makeSupabaseInteracoes({ existente: null })
    expect(await mensagemInstagramJaProcessada(client, 'mid-novo')).toBe(false)
  })

  it('retorna true quando o mid ja existe (redelivery da Meta)', async () => {
    const { client } = makeSupabaseInteracoes({ existente: { id: 'interacao-1' } })
    expect(await mensagemInstagramJaProcessada(client, 'mid-repetido')).toBe(true)
  })
})

describe('registrarInteracaoInstagram', () => {
  it('grava a interacao com o mid quando ainda nao existe', async () => {
    const { client, calls } = makeSupabaseInteracoes()
    const resultado = await registrarInteracaoInstagram(client, { leadId: 'lead-1', mid: 'mid-abc', texto: 'oi' })
    expect(resultado).toBe('inserida')
    const payload = calls.find((c) => c.op === 'insert')!.payload as Record<string, unknown>
    expect(payload).toMatchObject({ lead_id: 'lead-1', canal: 'instagram', direcao: 'entrada', mensagem: 'oi', mid: 'mid-abc' })
  })

  it('trata violacao de indice unico (corrida entre redeliveries concorrentes) como duplicada, sem lancar excecao', async () => {
    const { client } = makeSupabaseInteracoes({ insertError: { code: '23505', message: 'duplicate key' } })
    const resultado = await registrarInteracaoInstagram(client, { leadId: 'lead-1', mid: 'mid-abc', texto: 'oi' })
    expect(resultado).toBe('duplicada')
  })

  it('propaga outros erros de insercao', async () => {
    const { client } = makeSupabaseInteracoes({ insertError: { code: '500', message: 'db indisponivel' } })
    await expect(registrarInteracaoInstagram(client, { leadId: 'lead-1', mid: null, texto: 'oi' })).rejects.toMatchObject({ code: '500' })
  })
})
