import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { recordLeadEvento } from './record-lead-evento'

function makeSupabase() {
  const calls: { table: string; payload: unknown; options: unknown }[] = []
  const client = {
    from(table: string) {
      return {
        upsert(payload: unknown, options: unknown) {
          calls.push({ table, payload, options })
          return Promise.resolve({ data: null, error: null })
        },
      }
    },
  }
  return { client: client as unknown as SupabaseClient, calls }
}

describe('recordLeadEvento', () => {
  it('grava na tabela lead_eventos com upsert + ignoreDuplicates por client_event_id', async () => {
    const { client, calls } = makeSupabase()
    await recordLeadEvento(client, {
      leadId: 'lead-1',
      tipo: 'unlock',
      slug: 'parco-savello-santa-barbara-criciuma-sc',
      propertyId: 'prop-1',
      clientEventId: 'evt-abc',
    })

    expect(calls).toHaveLength(1)
    expect(calls[0].table).toBe('lead_eventos')
    expect(calls[0].payload).toEqual({
      lead_id: 'lead-1',
      tipo: 'unlock',
      slug: 'parco-savello-santa-barbara-criciuma-sc',
      property_id: 'prop-1',
      client_event_id: 'evt-abc',
    })
    expect(calls[0].options).toEqual({ onConflict: 'client_event_id', ignoreDuplicates: true })
  })
})
