'use client'
import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { getConsent, onConsentChange, type ConsentCategories } from '@/lib/consent'
import { applyGtagConfigs, newGtagConfigured, type GtagFn } from '@/lib/gtag-config'
import { GA4_ID, GADS_ID, META_PIXEL_ID } from '@/lib/tracking-config'

// Carrega GA4 / Meta Pixel / Google Ads SOMENTE depois do consentimento da
// categoria correspondente (LGPD). Antes do aceite, nada é baixado nem dispara —
// o Consent Mode v2 default deny (script inline no layout) cobre o gtag.js e o
// estado é atualizado via gtag('consent','update') em src/lib/consent.ts.
//
// gtag.js é carregado UMA vez (src congelado no primeiro aceite aplicável); as
// configs de GA4/Google Ads são imperativas via applyGtagConfigs — assim um
// upgrade de consentimento na mesma sessão (ex.: analytics aceito, marketing
// adicionado depois pelo rodapé) aplica a config nova na hora, sem refresh,
// sem script duplicado e sem repetir config (config repetida do GA4 geraria
// page_view duplicado). O snippet do Pixel dispara seu próprio PageView na
// primeira execução — por isso o TrackingProvider não manda page_view no
// primeiro render.
export function AnalyticsScripts() {
  const [cats, setCats] = useState<ConsentCategories | null>(null)
  // Estado por-pageload das configs já aplicadas (sobrevive a re-renders e a
  // revogar+reconceder — não reconfigura, só o consent update volta a valer).
  const configured = useRef(newGtagConfigured())
  // Src do gtag.js congelado na primeira carga: mudar o src depois injetaria
  // um segundo <script> (next/script deduplica por src, não por id, em loaders).
  const gtagSrcId = useRef<string | null>(null)

  useEffect(() => {
    setCats(getConsent()?.categories ?? null)
    return onConsentChange((state) => setCats(state.categories))
  }, [])

  const analytics = cats?.analytics === true
  const marketing = cats?.marketing === true
  // gtag.js serve GA4 (analytics) e Google Ads (marketing) — carrega se qualquer
  // um foi aceito; cada produto só recebe config da própria categoria.
  const loadGtagJs = analytics || (marketing && Boolean(GADS_ID))
  if (loadGtagJs && !gtagSrcId.current) {
    gtagSrcId.current = analytics ? GA4_ID : GADS_ID
  }

  // Configs imperativas: rodam no primeiro aceite E em upgrades de categoria na
  // mesma sessão. O stub global de gtag existe sempre (script inline do <head>),
  // então as chamadas enfileiram na dataLayer até o gtag.js processar.
  useEffect(() => {
    if (!cats) return
    const g = (window as unknown as { gtag?: GtagFn }).gtag
    if (typeof g !== 'function') return
    applyGtagConfigs(g, cats, configured.current, { ga4: GA4_ID, gads: GADS_ID })
  }, [cats])

  return (
    <>
      {gtagSrcId.current && (
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagSrcId.current}`} strategy="afterInteractive" />
      )}
      {marketing && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('consent','grant');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}</Script>
      )}
    </>
  )
}
