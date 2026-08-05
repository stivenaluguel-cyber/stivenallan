'use client'
import { useEffect, useRef, useState } from 'react'
import GalleryWithLightbox from './gallery-lightbox'
import { useLeadAccess } from '@/hooks/useLeadAccess'
import { usePropertyInterest, type InterestEventType } from '@/hooks/usePropertyInterest'
import { trackGatedContentView } from '@/lib/tracking'
import type { ItemGaleria, BlocoRestrito } from '@/lib/lead-gate/conteudo-restrito-tipos'

type Props = {
  propertyId: string
  propertySlug: string
  gateEnabled: boolean
  historyEnabled: boolean
  bloco: BlocoRestrito
  ctaPosition: string
  interestEventType: InterestEventType
  gradient: string
  badge?: string
  // Cartão de prévia. Vem do servidor como elemento pronto — ele só contém
  // texto e contagens, nenhuma URL do conteúdo restrito.
  teaser: React.ReactNode
  // Renderização agrupada (plantas são divididas em "tipo" e "comum").
  grupos?: { titulo: string; categoria: string }[]
  eyebrowColor?: string
  children?: React.ReactNode
}

// Diferença essencial para o <GatedContent> genérico: aqui o conteúdo NÃO chega
// como prop do servidor. A página estática não o contém em lugar nenhum — nem
// no HTML, nem no payload RSC. Ele é buscado em /api/lead-gate/content, que
// valida a sessão antes de responder.
//
// Consequência aceita: um brevíssimo estado de carregamento depois do
// desbloqueio. É o preço de o gate ser real em página com ISR.
export default function ConteudoLiberado({
  propertyId, propertySlug, gateEnabled, historyEnabled, bloco, ctaPosition,
  interestEventType, gradient, badge, teaser, grupos, eyebrowColor, children,
}: Props) {
  const access = useLeadAccess(propertyId, propertySlug, gateEnabled)
  const { recordEvent } = usePropertyInterest(propertyId, propertySlug, historyEnabled && access.status === 'unlocked')
  const [itens, setItens] = useState<ItemGaleria[] | null>(null)
  const [erro, setErro] = useState(false)
  const buscouRef = useRef(false)
  const teaserTrackRef = useRef(false)
  const revelouRef = useRef(false)

  const unlocked = !gateEnabled || access.status === 'unlocked'

  useEffect(() => {
    if (unlocked || teaserTrackRef.current) return
    teaserTrackRef.current = true
    trackGatedContentView({ property_slug: propertySlug, cta_position: ctaPosition })
  }, [unlocked, propertySlug, ctaPosition])

  useEffect(() => {
    if (!unlocked || buscouRef.current) return
    buscouRef.current = true
    fetch(`/api/lead-gate/content?slug=${encodeURIComponent(propertySlug)}&bloco=${bloco}`, {
      credentials: 'same-origin',
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { itens: ItemGaleria[] }) => setItens(d.itens))
      .catch(() => {
        // Permite nova tentativa se a sessão for revalidada depois.
        buscouRef.current = false
        setErro(true)
      })
  }, [unlocked, propertySlug, bloco])

  useEffect(() => {
    if (!itens || revelouRef.current) return
    revelouRef.current = true
    recordEvent(interestEventType)
  }, [itens, interestEventType, recordEvent])

  if (!unlocked) return <>{teaser}</>

  if (erro && !itens) {
    return (
      <p role="alert" style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', padding: '24px 0' }}>
        Não foi possível carregar este conteúdo agora. Atualize a página para tentar de novo.
      </p>
    )
  }

  if (!itens) {
    return (
      <p role="status" style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)', padding: '24px 0' }}>
        Carregando…
      </p>
    )
  }

  if (grupos) {
    return (
      <>
        {grupos.map(({ titulo, categoria }) => {
          const doGrupo = itens.filter((i) => i.categoria === categoria)
          if (!doGrupo.length) return null
          return (
            <div key={categoria} style={{ marginBottom: 40 }}>
              <p className="ps-eyebrow" style={{ color: eyebrowColor, marginBottom: 16, textAlign: 'center' }}>{titulo}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <GalleryWithLightbox galeria={doGrupo} prefix={`ps-${bloco}`} gradient={gradient} badge={badge} />
              </div>
            </div>
          )
        })}
        {children}
      </>
    )
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
        <GalleryWithLightbox galeria={itens} prefix={`ps-${bloco}`} gradient={gradient} badge={badge} />
      </div>
      {children}
    </>
  )
}
