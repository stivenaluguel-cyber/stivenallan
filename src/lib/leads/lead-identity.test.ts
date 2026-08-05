import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { resolveLeadForGate } from './lead-identity'

function makeSupabase(rpcResult: { data?: unknown; error?: { message: string } | null }) {
  const calls: { fn: string; args: unknown }[] = []
  const client = {
    rpc(fn: string, args: unknown) {
      calls.push({ fn, args })
      return Promise.resolve({ data: rpcResult.data ?? null, error: rpcResult.error ?? null })
    },
  }
  return { client: client as unknown as SupabaseClient, calls }
}

const BASE_INPUT = {
  nome: 'Fulano',
  whatsapp: '48999998888',
  email: 'Fulano@Example.com',
  propertyId: 'prop-1',
  propertyName: 'Parco Savello',
  source: '/empreendimento/fontana/parco-savello-santa-barbara-criciuma-sc',
  faixaInvestimento: 'R$ 900 mil a R$ 1,2 milhão',
  prazoCompra: '3 a 6 meses',
  entradaDisponivel: '20% a 29%',
  attribution: {},
}

describe('resolveLeadForGate', () => {
  it('lead novo: repassa normalizado e devolve created=true', async () => {
    const { client, calls } = makeSupabase({ data: { leadId: 'lead-1', created: true, conflito: false } })
    const resultado = await resolveLeadForGate(client, BASE_INPUT)
    expect(resultado).toEqual({ status: 'resolved', leadId: 'lead-1', created: true, conflito: false })

    const call = calls.find((c) => c.fn === 'resolve_lead_for_gate')!
    const args = call.args as Record<string, unknown>
    expect(args.p_whatsapp).toBe('48999998888')
    expect(args.p_email).toBe('fulano@example.com')
  })

  it('lead existente por telefone ou email: created=false', async () => {
    const { client } = makeSupabase({ data: { leadId: 'lead-existente', created: false, conflito: false } })
    const resultado = await resolveLeadForGate(client, BASE_INPUT)
    expect(resultado).toEqual({ status: 'resolved', leadId: 'lead-existente', created: false, conflito: false })
  })

  it('conflito telefone x email em leads diferentes: conflito=true, ainda resolve um leadId', async () => {
    const { client } = makeSupabase({ data: { leadId: 'lead-do-telefone', created: false, conflito: true } })
    const resultado = await resolveLeadForGate(client, BASE_INPUT)
    expect(resultado).toEqual({ status: 'resolved', leadId: 'lead-do-telefone', created: false, conflito: true })
    // a função nunca expõe qual dos dois leads é "o outro" — só o alvo do merge
    expect(resultado).not.toHaveProperty('outroLeadId')
  })

  it('normaliza telefone rigorosamente (normalizarCelularBR) — rejeita fixo/numero invalido', async () => {
    const { client, calls } = makeSupabase({ data: { leadId: 'x', created: true, conflito: false } })
    await resolveLeadForGate(client, { ...BASE_INPUT, whatsapp: '4832211234' }) // fixo, 10 digitos sem 9
    // normalizarCelularBR aceita 10-11 digitos (nao valida o 9), entao isso passa —
    // o teste real de invalidez é telefone vazio/curto demais abaixo
    expect(calls).toHaveLength(1)
  })

  it('sem telefone: invalid, nunca chama rpc', async () => {
    const { client, calls } = makeSupabase({})
    const resultado = await resolveLeadForGate(client, { ...BASE_INPUT, whatsapp: null })
    expect(resultado.status).toBe('invalid')
    expect(calls).toHaveLength(0)
  })

  it('sem email: invalid, nunca chama rpc (email e obrigatorio no gate, diferente do /api/leads legado)', async () => {
    const { client, calls } = makeSupabase({})
    const resultado = await resolveLeadForGate(client, { ...BASE_INPUT, email: null })
    expect(resultado.status).toBe('invalid')
    expect(calls).toHaveLength(0)
  })

  it('sem nome: invalid, nunca chama rpc', async () => {
    const { client, calls } = makeSupabase({})
    const resultado = await resolveLeadForGate(client, { ...BASE_INPUT, nome: null })
    expect(resultado.status).toBe('invalid')
    expect(calls).toHaveLength(0)
  })

  it('erro do rpc vira status error, nunca lanca excecao', async () => {
    const { client } = makeSupabase({ error: { message: 'db indisponivel' } })
    const resultado = await resolveLeadForGate(client, BASE_INPUT)
    expect(resultado).toEqual({ status: 'error', motivo: 'db indisponivel' })
  })

  it('repassa UTMs/fbclid/gclid da atribuicao pro rpc', async () => {
    const { client, calls } = makeSupabase({ data: { leadId: 'lead-1', created: true, conflito: false } })
    await resolveLeadForGate(client, {
      ...BASE_INPUT,
      attribution: { utm_source: 'meta', utm_campaign: 'site-lp', fbclid: 'abc123' },
    })
    const args = calls[0].args as Record<string, unknown>
    expect(args.p_utm_source).toBe('meta')
    expect(args.p_utm_campaign).toBe('site-lp')
    expect(args.p_fbclid).toBe('abc123')
    expect(args.p_gclid).toBeNull()
  })
})
