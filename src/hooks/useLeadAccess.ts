'use client'
import { useEffect } from 'react'
import { useLeadAccessContext } from '@/components/lead-gate/LeadSessionProvider'

// Registra a propriedade atual no LeadSessionProvider (dispara no máximo 1
// fetch de status por propertySlug) e devolve o estado de acesso corrente.
// Chamado por LeadAccessGate/GatedContent — nunca duas vezes com resultado
// diferente na mesma página, porque o provider é global (1 por app).
export function useLeadAccess(propertyId: string, propertySlug: string, gateEnabled: boolean) {
  const ctx = useLeadAccessContext()

  useEffect(() => {
    ctx.registerProperty({ propertyId, propertySlug, gateEnabled })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, propertySlug, gateEnabled])

  return ctx
}
