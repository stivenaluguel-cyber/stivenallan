'use client'
import { useCallback, useEffect, useRef } from 'react'
import { getAttribution, trackContentUnlocked, trackPropertyInterestRecorded, type PropertyInterestGaEventType } from '@/lib/tracking'

export type InterestEventType =
  | 'view'
  | 'unlock'
  | 'whatsapp_click'
  | 'catalog_download'
  | 'floorplan_view'
  | 'gallery_view'
  | 'availability_view'

const VIEW_DWELL_MS = 5000 // ~5s de página visível antes de contar como visualização

// `active` = histórico habilitado pro slug E sessão já confirmada 'unlocked'
// (ver LeadSessionProvider) — sem isso, nunca chama /api/lead-track: um
// visitante sem sessão não tem lead_id nenhum pra associar, e a rota
// devolveria 401 de qualquer forma (pré-conversão continua só em VisitTracker).
export function usePropertyInterest(propertyId: string, propertySlug: string, active: boolean) {
  const viewFiredRef = useRef(false)
  const unlockFiredRef = useRef(false)

  const recordEvent = useCallback(
    (eventType: InterestEventType) => {
      if (!active) return
      const attribution = getAttribution()
      fetch('/api/lead-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        keepalive: true,
        body: JSON.stringify({
          propertyId,
          propertySlug,
          eventType,
          source: typeof window !== 'undefined' ? window.location.pathname : null,
          utm_source: attribution.utm_source ?? null,
          utm_medium: attribution.utm_medium ?? null,
          utm_campaign: attribution.utm_campaign ?? null,
          gclid: attribution.gclid ?? null,
          fbclid: attribution.fbclid ?? null,
          clientEventId: crypto.randomUUID(),
        }),
      }).catch(() => {})

      if (eventType === 'unlock') {
        trackContentUnlocked({ property_slug: propertySlug })
      } else if (eventType !== 'view' && eventType !== 'whatsapp_click') {
        trackPropertyInterestRecorded({ property_slug: propertySlug, event_type: eventType as PropertyInterestGaEventType })
      }
    },
    [active, propertyId, propertySlug],
  )

  // Marca "unlock" uma única vez quando a sessão vira 'unlocked' nesta
  // página — cobre tanto quem acabou de se cadastrar quanto quem já tinha
  // sessão válida e está vendo este empreendimento pela primeira vez.
  useEffect(() => {
    if (!active || unlockFiredRef.current) return
    unlockFiredRef.current = true
    recordEvent('unlock')
  }, [active, recordEvent])

  // View só conta após ~5s de permanência real — cobre prefetch do Next
  // (nunca fica montado 5s) e geração estática (não roda este efeito).
  useEffect(() => {
    if (!active || viewFiredRef.current) return
    const timer = setTimeout(() => {
      viewFiredRef.current = true
      recordEvent('view')
    }, VIEW_DWELL_MS)
    return () => clearTimeout(timer)
  }, [active, recordEvent])

  return { recordEvent }
}
