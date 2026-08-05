'use client'
import { useEffect, useRef, useState } from 'react'
import { useLeadAccess } from '@/hooks/useLeadAccess'
import { useLeadAccessContext } from './LeadSessionProvider'
import { computeScrollFraction, shouldShowEarlyGate } from './scroll-fraction'
import LeadUnlockForm from './LeadUnlockForm'

type Props = {
  propertyId: string
  propertySlug: string
  propertyName: string
  gateEnabled: boolean
  variant: 'early-inline' | 'section-bottom'
  previewCount: { fotos: number; plantas: number }
}

// Painel fixo ancorado (nunca modal central, nunca overlay full-screen —
// foge da estética de paywall genérico). Fração calculada sobre a altura
// TOTAL do documento (não da viewport), pra funcionar identicamente nas 3
// famílias de página sem conhecer a estrutura interna de cada uma.
export default function LeadAccessGate({ propertyId, propertySlug, propertyName, gateEnabled, variant, previewCount }: Props) {
  const access = useLeadAccess(propertyId, propertySlug, gateEnabled)
  const ctx = useLeadAccessContext()
  const [visivelCedo, setVisivelCedo] = useState(false)
  const [dispensado, setDispensado] = useState(false)
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)

  const bloqueado = gateEnabled && access.status === 'locked'

  // O bloco tardio (fim da página) é sempre o alvo que WhatsApp bloqueado
  // rola até — é o único que está sempre no DOM (o early-inline pode estar
  // dispensado/oculto), replicando o padrão já usado por CtaFixoEmpreendimento.
  useEffect(() => {
    if (variant !== 'section-bottom') return
    ctx.setRequestUnlockHandler(() => {
      const reduzirMovimento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      sectionRef.current?.scrollIntoView({ behavior: reduzirMovimento ? 'auto' : 'smooth', block: 'start' })
      const primeiroCampo = sectionRef.current?.querySelector<HTMLElement>('input:not([type="hidden"]):not([tabindex="-1"]), select')
      window.setTimeout(() => primeiroCampo?.focus({ preventScroll: true }), reduzirMovimento ? 0 : 500)
    })
    return () => ctx.setRequestUnlockHandler(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant])

  useEffect(() => {
    if (variant !== 'early-inline' || !bloqueado || dispensado) {
      setVisivelCedo(false)
      return
    }
    function onScroll() {
      if (rafRef.current !== null) return
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        const fraction = computeScrollFraction(window.scrollY, document.documentElement.scrollHeight, window.innerHeight)
        setVisivelCedo(shouldShowEarlyGate(fraction, dispensado, access.status))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current)
    }
  }, [variant, bloqueado, dispensado, access.status])

  // Só aparece em 'locked'. Antes era `=== 'unlocked'` (ou seja, aparecia
  // também durante 'loading'): quem já tinha sessão via o formulário inteiro
  // renderizar e sumir quando o fetch de status resolvia — flash de ~700px no
  // rodapé. Com o default do provider agora sendo 'loading', esse ramo passaria
  // a valer no SSR também, o que tornaria o flash universal.
  if (!gateEnabled || access.status !== 'locked') return null

  if (variant === 'early-inline') {
    if (!visivelCedo) return null
    const reduzirMovimento = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    return (
      <div
        role="complementary"
        aria-label="Receba plantas, disponibilidade e condições"
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60,
          background: 'var(--surface)', borderTop: '1px solid var(--line)',
          boxShadow: '0 -8px 24px rgba(0,0,0,0.12)', padding: '16px 20px',
          maxHeight: '70vh', overflowY: 'auto',
          transition: reduzirMovimento ? 'none' : 'transform .3s ease',
        }}
      >
        <button
          type="button"
          onClick={() => setDispensado(true)}
          aria-label="Fechar"
          style={{
            position: 'absolute', top: 8, right: 8, minWidth: 44, minHeight: 44,
            background: 'transparent', border: 'none', fontSize: 20, color: 'var(--muted)', cursor: 'pointer',
          }}
        >
          ×
        </button>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <LeadUnlockForm
            propertyId={propertyId} propertySlug={propertySlug} propertyName={propertyName}
            ctaPosition="early-inline" previewCount={previewCount}
          />
        </div>
      </div>
    )
  }

  return (
    <section
      id="contato"
      ref={sectionRef}
      style={{ maxWidth: 480, margin: '0 auto', padding: '48px 20px 16px', scrollMarginTop: 24 }}
    >
      <LeadUnlockForm
        propertyId={propertyId} propertySlug={propertySlug} propertyName={propertyName}
        ctaPosition="section-bottom" previewCount={previewCount}
      />
    </section>
  )
}
