'use client'
import { useEffect, useRef, useState } from 'react'
import { useLeadAccess } from '@/hooks/useLeadAccess'
import { useLeadAccessContext } from './LeadSessionProvider'
import { computeScrollFraction, shouldShowEarlyGate } from './scroll-fraction'
import LeadUnlockForm from './LeadUnlockForm'
import { RESERVA_WHATSAPP_PX } from '@/components/CtaFixoEmpreendimento'

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
  const abertoRef = useRef(false)
  // Guarda quem tinha o foco antes do painel abrir, pra devolver ao fechar —
  // senão o foco cai em document.body e o usuário de teclado é jogado de volta
  // pro topo do documento (WCAG 2.4.3).
  const focoAnteriorRef = useRef<HTMLElement | null>(null)

  function dispensar() {
    setDispensado(true)
    focoAnteriorRef.current?.focus?.({ preventScroll: true })
  }

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
        // Latch: depois de aberto, só fecha por ação explícita (× ou Escape).
        // shouldShowEarlyGate é uma FAIXA (25%–40%), não um limiar — sem o
        // latch, passar de 40% desmontava o painel, o LeadUnlockForm ia junto
        // e todo o useState de valores era destruído: nome, WhatsApp, e-mail e
        // as 3 seleções sumiam, e o formulário voltava vazio ao rolar de volta.
        // Rolar é o reflexo natural de quem quer ver o que o painel cobre, e a
        // abertura do teclado virtual muda innerHeight (logo, a fração) sem
        // nenhuma rolagem do usuário.
        if (abertoRef.current) return
        const fraction = computeScrollFraction(window.scrollY, document.documentElement.scrollHeight, window.innerHeight)
        if (shouldShowEarlyGate(fraction, dispensado, access.status)) {
          abertoRef.current = true
          setVisivelCedo(true)
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current)
    }
  }, [variant, bloqueado, dispensado, access.status])

  // Escape fecha. Sem isto o único jeito de sair era o ×, que fica em
  // position:absolute DENTRO do container rolável — ou seja, rola junto com o
  // conteúdo e some do topo assim que o usuário desce até os selects.
  useEffect(() => {
    if (!visivelCedo) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dispensar()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visivelCedo])

  // Só aparece em 'locked'. Antes era `=== 'unlocked'` (ou seja, aparecia
  // também durante 'loading'): quem já tinha sessão via o formulário inteiro
  // renderizar e sumir quando o fetch de status resolvia — flash de ~700px no
  // rodapé. Com o default do provider agora sendo 'loading', esse ramo passaria
  // a valer no SSR também, o que tornaria o flash universal.
  if (!gateEnabled || access.status !== 'locked') return null

  if (variant === 'early-inline') {
    if (!visivelCedo) return null
    return (
      <div
        role="complementary"
        aria-label="Receba plantas, disponibilidade e condições"
        style={{
          // right reservado ao botão flutuante de WhatsApp. Full-width com
          // fundo opaco e z-index 60 enterrava o WppFloat (z-index 50) — o
          // canal que hoje mais converte ficava inalcançável no mobile. É a
          // mesma reserva que CtaFixoEmpreendimento já documenta.
          position: 'fixed', left: 0, right: RESERVA_WHATSAPP_PX, bottom: 0, zIndex: 60,
          background: 'var(--surface)', borderTop: '1px solid var(--line)',
          boxShadow: '0 -8px 24px rgba(0,0,0,0.12)',
          // dvh, não vh: com o teclado virtual aberto o vh não encolhe, e o
          // botão de enviar ficava atrás do teclado sem forma de alcançar
          // (rolar dentro do painel não adianta — está fora da tela física,
          // não fora da caixa de rolagem). O teto absoluto cobre zoom 200%,
          // onde 70% de um viewport já reduzido vira uma fresta.
          maxHeight: 'min(70dvh, calc(100dvh - 96px))',
          // Sem overflow aqui: quem rola é o filho, pra o × ficar preso ao
          // painel em vez de rolar junto com o conteúdo e sumir.
        }}
      >
        <button
          type="button"
          onClick={dispensar}
          aria-label="Fechar"
          style={{
            position: 'absolute', top: 8, right: 8, minWidth: 44, minHeight: 44, zIndex: 1,
            background: 'var(--surface)', border: 'none', fontSize: 20, color: 'var(--muted)', cursor: 'pointer',
          }}
        >
          ×
        </button>
        <div
          style={{
            maxHeight: 'min(70dvh, calc(100dvh - 96px))', overflowY: 'auto',
            padding: '16px 20px',
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          }}
        >
          {/* paddingRight no bloco do título: o × de 44px ocupa o canto e
              passava por cima da primeira linha do título em 360px. */}
          <div style={{ maxWidth: 420, margin: '0 auto', paddingRight: 40 }}>
            <LeadUnlockForm
              propertyId={propertyId} propertySlug={propertySlug} propertyName={propertyName}
              ctaPosition="early-inline" previewCount={previewCount}
            />
          </div>
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
