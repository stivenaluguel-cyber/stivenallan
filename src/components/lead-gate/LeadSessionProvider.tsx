'use client'
import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { LeadAccessStatus } from './scroll-fraction'

type PropertyRegistration = { propertyId: string; propertySlug: string; gateEnabled: boolean }

type LeadAccessContextValue = {
  gateEnabled: boolean
  status: LeadAccessStatus
  registerProperty: (p: PropertyRegistration) => void
  requestUnlock: () => void
  onUnlocked: () => void
  setRequestUnlockHandler: (fn: (() => void) | null) => void
}

const noop = () => {}

// Default context = comportamento de hoje em qualquer página sem a flag: gate
// nunca aparece, WhatsApp nunca é bloqueado (garantido por gateEnabled=false,
// que curto-circuita todo consumidor). Só páginas que chamam registerProperty
// com gateEnabled=true saem desse estado neutro.
//
// status começa 'loading', NÃO 'unlocked'. O default anterior vazava conteúdo:
// no SSR não existe cookie nem fetch, então o status default é o que vale — e
// com 'unlocked' o GatedContent caía em `if (unlocked) return children` e
// escrevia o conteúdo protegido dentro do HTML da página, que é ISR
// (revalidate=3600) e servido igual para todo mundo. Bastava "ver código-fonte"
// para ler plantas e disponibilidade sem cadastro. 'loading' é o único default
// seguro: nenhum consumidor trata 'loading' como liberado.
const LeadAccessContext = createContext<LeadAccessContextValue>({
  gateEnabled: false,
  status: 'loading',
  registerProperty: noop,
  requestUnlock: noop,
  onUnlocked: noop,
  setRequestUnlockHandler: noop,
})

export function useLeadAccessContext() {
  return useContext(LeadAccessContext)
}

// Montado uma vez no layout raiz, ao lado do TrackingProvider — nunca por
// página. Guarda o estado de acesso da página de empreendimento atual (no
// máximo uma por vez: o site não renderiza duas páginas de empreendimento
// simultâneas) e faz NO MÁXIMO uma chamada a /api/lead-access/status por
// carregamento de página com a flag ativa.
export function LeadSessionProvider({ children }: { children: React.ReactNode }) {
  const [gateEnabled, setGateEnabled] = useState(false)
  // 'loading' pelo mesmo motivo do default do contexto acima: este é o valor
  // que vale durante o SSR e o primeiro render do client. Páginas sem gate
  // saem daqui via registerProperty({gateEnabled:false}) → 'unlocked'.
  const [status, setStatus] = useState<LeadAccessStatus>('loading')
  const registeredSlugRef = useRef<string | null>(null)
  const unlockHandlerRef = useRef<(() => void) | null>(null)

  const registerProperty = useCallback((p: PropertyRegistration) => {
    if (!p.gateEnabled) {
      setGateEnabled(false)
      setStatus('unlocked')
      return
    }
    setGateEnabled(true)
    // Evita refetch em re-renders — só busca status uma vez por propertySlug.
    if (registeredSlugRef.current === p.propertySlug) return
    registeredSlugRef.current = p.propertySlug
    setStatus('loading')

    fetch('/api/lead-access/status', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : { unlocked: false }))
      .then((data: { unlocked: boolean }) => setStatus(data.unlocked ? 'unlocked' : 'locked'))
      .catch(() => setStatus('locked'))
  }, [])

  const setRequestUnlockHandler = useCallback((fn: (() => void) | null) => {
    unlockHandlerRef.current = fn
  }, [])

  const requestUnlock = useCallback(() => {
    unlockHandlerRef.current?.()
  }, [])

  const onUnlocked = useCallback(() => {
    setStatus('unlocked')
  }, [])

  return (
    <LeadAccessContext.Provider
      value={{ gateEnabled, status, registerProperty, requestUnlock, onUnlocked, setRequestUnlockHandler }}
    >
      {children}
    </LeadAccessContext.Provider>
  )
}
