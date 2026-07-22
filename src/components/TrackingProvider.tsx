'use client'
import { useCallback, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import {
  captureAttribution,
  trackSpaPageView,
  trackViewContent,
  trackWhatsappClick,
  trackWhatsappLinkFallback,
} from '@/lib/tracking'
import { onConsentChange } from '@/lib/consent'

// Delays de retentativa do ViewContent: o script do Pixel monta assíncrono
// (depois do aceite ou da hidratação), então a 1ª tentativa pode rodar antes de
// window.fbq existir. O estado por canal em trackViewContent garante que cada
// canal recebe no máximo 1 evento por página — retentar é idempotente.
const VIEW_CONTENT_RETRIES_MS = [400, 1500, 4000]

// Atribuição (UTMs/gclid/fbclid) + page_view em navegação SPA + ViewContent nas
// págs de empreendimento + clique em CTAs de WhatsApp ([data-wpp]).
// Tudo passa pelos gates de consentimento de src/lib/tracking.ts.
export function TrackingProvider() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)
  // Canais já entregues do ViewContent da página atual (dedupe: 1x por canal por página)
  const viewContent = useRef<{ slug: string; meta: boolean; ga4: boolean } | null>(null)
  const retryTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  const maybeViewContent = useCallback((path: string) => {
    const m = path.match(/^\/empreendimento\/[^/]+\/([^/]+)/)
    if (!m) {
      viewContent.current = null
      return
    }
    const slug = m[1]
    const prev = viewContent.current?.slug === slug ? viewContent.current : { slug, meta: false, ga4: false }
    if (prev.meta && prev.ga4) return
    const sent = trackViewContent(slug, { meta: !prev.meta, ga4: !prev.ga4 })
    viewContent.current = { slug, meta: prev.meta || sent.meta, ga4: prev.ga4 || sent.ga4 }
  }, [])

  const scheduleViewContentRetries = useCallback(() => {
    for (const t of retryTimers.current) clearTimeout(t)
    retryTimers.current = VIEW_CONTENT_RETRIES_MS.map((ms) =>
      setTimeout(() => maybeViewContent(window.location.pathname), ms)
    )
  }, [maybeViewContent])

  useEffect(() => {
    captureAttribution()
  }, [])

  // Clique delegado nos CTAs de WhatsApp — substitui o script inline do layout
  // pra passar pelos gates de consentimento e padronizar os parâmetros.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Element | null
      const a = target?.closest?.('[data-wpp]')
      if (a) {
        trackWhatsappClick({
          content_name: a.getAttribute('data-wpp-nome') || 'WhatsApp',
          empreendimento: a.getAttribute('data-wpp-emp'),
          position: a.getAttribute('data-wpp'),
        })
        return
      }
      // Links wa.me sem anotação (páginas antigas): fallback derivado da URL.
      const wa = target?.closest?.('a[href*="wa.me/"], a[href*="api.whatsapp.com"]')
      if (wa) trackWhatsappLinkFallback(window.location.pathname)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    if (!pathname) return
    if (isFirstRender.current) {
      // o primeiro PageView é disparado pela config do gtag.js / snippet do Pixel
      // quando os scripts montam (AnalyticsScripts) — aqui só navegações seguintes
      isFirstRender.current = false
    } else {
      trackSpaPageView(pathname)
    }
    maybeViewContent(pathname)
    scheduleViewContentRetries()
  }, [pathname, maybeViewContent, scheduleViewContentRetries])

  // Consentimento concedido depois do load → completa o ViewContent da página
  // atual nos canais recém-liberados (o PageView inicial dessas plataformas é
  // disparado pelos próprios snippets ao montar, não aqui).
  useEffect(() => {
    const off = onConsentChange(() => {
      maybeViewContent(window.location.pathname)
      scheduleViewContentRetries()
    })
    return () => {
      off()
      for (const t of retryTimers.current) clearTimeout(t)
    }
  }, [maybeViewContent, scheduleViewContentRetries])

  return null
}
