import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { recordPropertyInterest } from './property-interest'

function makeSupabase(error: { message: string } | null = null) {
  const calls: { fn: string; args: unknown }[] = []
  const client = {
    rpc(fn: string, args: unknown) {
      calls.push({ fn, args })
      return Promise.resolve({ data: null, error })
    },
  }
  return { client: client as unknown as SupabaseClient, calls }
}

const BASE_INPUT = {
  leadId: 'lead-1',
  propertyId: 'prop-1',
  propertySlug: 'parco-savello-santa-barbara-criciuma-sc',
  eventType: 'view' as const,
  source: '/empreendimento/fontana/parco-savello-santa-barbara-criciuma-sc',
  attribution: {},
}

describe('recordPropertyInterest', () => {
  it('chama record_property_interest com os campos certos', async () => {
    const { client, calls } = makeSupabase()
    const resultado = await recordPropertyInterest(client, BASE_INPUT)
    expect(resultado).toEqual({ status: 'recorded' })

    const args = calls[0].args as Record<string, unknown>
    expect(args.p_lead_id).toBe('lead-1')
    expect(args.p_property_id).toBe('prop-1')
    expect(args.p_event_type).toBe('view')
  })

  it('repassa cada tipo de evento sem transformar', async () => {
    const { client, calls } = makeSupabase()
    for (const eventType of [
      'unlock',
      'whatsapp_click',
      'catalog_download',
      'floorplan_view',
      'gallery_view',
      'availability_view',
    ] as const) {
      await recordPropertyInterest(client, { ...BASE_INPUT, eventType })
    }
    expect(calls.map((c) => (c.args as Record<string, unknown>).p_event_type)).toEqual([
      'unlock',
      'whatsapp_click',
      'catalog_download',
      'floorplan_view',
      'gallery_view',
      'availability_view',
    ])
  })

  it('repassa UTM/fbclid/gclid quando presentes', async () => {
    const { client, calls } = makeSupabase()
    await recordPropertyInterest(client, {
      ...BASE_INPUT,
      attribution: { utm_campaign: 'site-lp', gclid: 'g-1' },
    })
    const args = calls[0].args as Record<string, unknown>
    expect(args.p_utm_campaign).toBe('site-lp')
    expect(args.p_gclid).toBe('g-1')
    expect(args.p_fbclid).toBeNull()
  })

  it('erro do rpc vira status error, nunca lanca excecao', async () => {
    const { client } = makeSupabase({ message: 'timeout' })
    const resultado = await recordPropertyInterest(client, BASE_INPUT)
    expect(resultado).toEqual({ status: 'error', motivo: 'timeout' })
  })
})
