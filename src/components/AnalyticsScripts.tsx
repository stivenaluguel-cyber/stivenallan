'use client'
import Script from 'next/script'
import { useEffect, useState } from 'react'
import { getConsent, onConsentChange, type ConsentCategories } from '@/lib/consent'
import { GA4_ID, GADS_ID, META_PIXEL_ID } from '@/lib/tracking-config'

// Carrega GA4 / Meta Pixel / Google Ads SOMENTE depois do consentimento da
// categoria correspondente (LGPD). Antes do aceite, nada é baixado nem dispara —
// o Consent Mode v2 default deny (script inline no layout) cobre o gtag.js e o
// estado é atualizado via gtag('consent','update') em src/lib/consent.ts.
//
// Montagem tardia é suportada: next/script injeta os scripts quando o estado
// muda (aceite no banner), e cada snippet dispara seu próprio PageView inicial —
// por isso o TrackingProvider NÃO manda page_view do primeiro render.
export function AnalyticsScripts() {
  const [cats, setCats] = useState<ConsentCategories | null>(null)

  useEffect(() => {
    setCats(getConsent()?.categories ?? null)
    return onConsentChange((state) => setCats(state.categories))
  }, [])

  const analytics = cats?.analytics === true
  const marketing = cats?.marketing === true
  // gtag.js serve GA4 (analytics) e Google Ads (marketing) — carrega se qualquer
  // um foi aceito; cada produto só recebe config da própria categoria.
  const loadGtagJs = analytics || (marketing && Boolean(GADS_ID))
  const gtagSrcId = analytics ? GA4_ID : GADS_ID

  return (
    <>
      {loadGtagJs && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagSrcId}`} strategy="afterInteractive" />
          <Script id="gtag-config" strategy="afterInteractive">{`
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
${analytics ? `gtag('config','${GA4_ID}');` : ''}
${marketing && GADS_ID ? `gtag('config','${GADS_ID}');` : ''}
`}</Script>
        </>
      )}
      {marketing && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('consent','grant');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}</Script>
      )}
    </>
  )
}
