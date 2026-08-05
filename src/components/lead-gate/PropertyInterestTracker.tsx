'use client'
import { useLeadAccess } from '@/hooks/useLeadAccess'
import { usePropertyInterest } from '@/hooks/usePropertyInterest'

type Props = { propertyId: string; propertySlug: string; gateEnabled: boolean; historyEnabled: boolean }

// Garante que 'view'/'unlock' são registrados uma vez por página mesmo que a
// página não tenha nenhum bloco <GatedContent> (que também dispara o hook,
// mas só quando montado). Invisível — não renderiza nada.
export default function PropertyInterestTracker({ propertyId, propertySlug, gateEnabled, historyEnabled }: Props) {
  const access = useLeadAccess(propertyId, propertySlug, gateEnabled)
  usePropertyInterest(propertyId, propertySlug, gateEnabled && historyEnabled && access.status === 'unlocked')
  return null
}
