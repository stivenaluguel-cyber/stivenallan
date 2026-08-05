'use client'
import { useEffect, useRef } from 'react'
import { useLeadAccess } from '@/hooks/useLeadAccess'
import { usePropertyInterest, type InterestEventType } from '@/hooks/usePropertyInterest'
import { trackGatedContentView } from '@/lib/tracking'

type Props = {
  propertyId: string
  propertySlug: string
  gateEnabled: boolean
  historyEnabled: boolean
  ctaPosition: string
  teaser: React.ReactNode
  children: React.ReactNode
  // Marco de interesse a registrar quando este bloco específico é revelado
  // (ex.: 'gallery_view' na galeria, 'floorplan_view' nas plantas,
  // 'availability_view' na disponibilidade). Omitir quando o próprio
  // conteúdo tem um clique mais preciso pra disparar (ex.: catalog_download
  // no link real do PDF, via usePropertyInterest().recordEvent direto).
  interestEventType?: InterestEventType
}

// Server sempre renderiza o teaser primeiro (HTML inicial nunca contém o
// conteúdo liberado — necessário porque as páginas de empreendimento são
// ISR/compartilhadas entre visitantes). A troca teaser→conteúdo acontece só
// no client, pós-hidratação, sem scrollIntoView — o que já estava visível
// continua exatamente onde estava.
export default function GatedContent({
  propertyId, propertySlug, gateEnabled, historyEnabled, ctaPosition, teaser, children, interestEventType,
}: Props) {
  const access = useLeadAccess(propertyId, propertySlug, gateEnabled)
  const { recordEvent } = usePropertyInterest(propertyId, propertySlug, historyEnabled && access.status === 'unlocked')
  const viewTrackedRef = useRef(false)
  const revealTrackedRef = useRef(false)

  const unlocked = !gateEnabled || access.status === 'unlocked'

  useEffect(() => {
    if (unlocked || viewTrackedRef.current) return
    viewTrackedRef.current = true
    trackGatedContentView({ property_slug: propertySlug, cta_position: ctaPosition })
  }, [unlocked, propertySlug, ctaPosition])

  useEffect(() => {
    if (!unlocked || !interestEventType || revealTrackedRef.current) return
    revealTrackedRef.current = true
    recordEvent(interestEventType)
  }, [unlocked, interestEventType, recordEvent])

  if (unlocked) return <>{children}</>
  return <>{teaser}</>
}
