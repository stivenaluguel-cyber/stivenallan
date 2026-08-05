import type { SupabaseClient } from '@supabase/supabase-js'

export type RecordLeadEventoInput = {
  leadId: string
  tipo: string
  slug: string
  propertyId: string | null
  clientEventId: string | null
}

// Timeline crua (lead_eventos) — complementa lead_property_interests (estado
// agregado). `client_event_id` tem índice único parcial (migration
// 20260805003000): usar upsert com ignoreDuplicates faz o Postgres descartar
// silenciosamente um reenvio (ex.: retry de rede do client) em vez de gravar
// evento duplicado na linha do tempo do lead.
export async function recordLeadEvento(supabase: SupabaseClient, input: RecordLeadEventoInput): Promise<void> {
  await supabase.from('lead_eventos').upsert(
    {
      lead_id: input.leadId,
      tipo: input.tipo,
      slug: input.slug,
      property_id: input.propertyId,
      client_event_id: input.clientEventId,
    },
    { onConflict: 'client_event_id', ignoreDuplicates: true },
  )
}
