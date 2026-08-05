import type { SupabaseClient } from '@supabase/supabase-js'
import type { Attribution } from '@/lib/tracking'

export type PropertyInterestEventType =
  | 'view'
  | 'unlock'
  | 'whatsapp_click'
  | 'catalog_download'
  | 'floorplan_view'
  | 'gallery_view'
  | 'availability_view'

export type PropertyInterestInput = {
  leadId: string
  propertyId: string
  propertySlug: string
  eventType: PropertyInterestEventType
  source: string | null
  attribution: Attribution
}

export type PropertyInterestResult = { status: 'recorded' } | { status: 'error'; motivo: string }

// Upsert idempotente em lead_property_interests (estado atual por lead+propriedade)
// via record_property_interest — nunca um INSERT/UPDATE direto daqui, pra manter
// a janela de dedup de `view_count` e o "só na 1a ocorrencia" dos marcos (unlocked_at
// etc.) centralizados num único lugar (a função SQL), não duplicados em cada chamador.
export async function recordPropertyInterest(
  supabase: SupabaseClient,
  input: PropertyInterestInput,
): Promise<PropertyInterestResult> {
  const { error } = await supabase.rpc('record_property_interest', {
    p_lead_id: input.leadId,
    p_property_id: input.propertyId,
    p_property_slug: input.propertySlug,
    p_event_type: input.eventType,
    p_source: input.source,
    p_utm_source: input.attribution.utm_source ?? null,
    p_utm_medium: input.attribution.utm_medium ?? null,
    p_utm_campaign: input.attribution.utm_campaign ?? null,
    p_fbclid: input.attribution.fbclid ?? null,
    p_gclid: input.attribution.gclid ?? null,
  })

  if (error) return { status: 'error', motivo: error.message }
  return { status: 'recorded' }
}
