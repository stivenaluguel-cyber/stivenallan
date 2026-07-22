import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site'
import { VisitTracker } from '@/components/VisitTracker'
import { TrackingProvider } from '@/components/TrackingProvider'
import { AnalyticsScripts } from '@/components/AnalyticsScripts'
import { CookieConsent } from '@/components/CookieConsent'
import { Bricolage_Grotesque, Hanken_Grotesk, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
  weight: ['400', '500', '600', '700', '800'],
})

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hanken',
  weight: ['400', '500', '600', '700'],
})

// Usado nos hotsites premium (ex. Parco Savello, Casa Guaíba Park) para os
// destaques em itálico serifado — antes só existia como string CSS sem
// nenhum @font-face carregado, então caía silenciosamente pro Georgia.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cormorant',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Stiven Allan — Imóveis de Alto Padrão em Criciúma/SC',
    template: '%s | Stiven Allan',
  },
  description:
    'Stiven Allan, corretor CRECI 60.275. Lançamentos e empreendimentos de construtoras em Criciúma e região. Financiamento direto sem banco.',
  keywords: ['corretor de imóveis criciúma', 'lançamentos imobiliários criciúma', 'apartamentos na planta criciúma', 'empreendimentos criciúma sc', 'stiven allan corretor', 'creci 60275', 'financiamento direto imóveis'],
  authors: [{ name: 'Stiven Allan', url: SITE_URL }],
  creator: 'Stiven Allan',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: 'Stiven Allan — Imóveis de Alto Padrão',
    title: 'Stiven Allan — Imóveis de Alto Padrão em Criciúma/SC',
    description: 'Lançamentos e empreendimentos premium em Criciúma e região. Financiamento direto, sem banco.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stiven Allan — Imóveis de Alto Padrão em Criciúma/SC',
    description: 'Lançamentos e empreendimentos premium em Criciúma e região.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: SITE_URL },
}

const schemaAgent = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Stiven Allan',
  url: SITE_URL,
  telephone: '+5548991642332',
  description: 'Corretor de imóveis especialista em lançamentos com financiamento direto da construtora em Criciúma e Sul de Santa Catarina.',
  email: 'contato@stivenallan.com.br',
  areaServed: [
    { '@type': 'City', name: 'Criciúma' },
    { '@type': 'City', name: 'Balneário Rincão' },
    { '@type': 'City', name: 'Laguna' },
    { '@type': 'City', name: 'Içara' },
    { '@type': 'City', name: 'Siderópolis' },
    { '@type': 'City', name: 'Balneário Piçarras' },
  ],
  hasCredential: 'CRECI 60.275',
  sameAs: ['https://wa.me/5548991642332', 'https://www.instagram.com/stivenallan.ofc'],
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} ${hanken.variable} ${cormorant.variable}`}>
      <head>
        {/* Google Consent Mode v2 — default DENY antes de qualquer gtag.js (LGPD).
            Restaura sincronicamente a escolha salva (mesma chave/versão de
            src/lib/consent.ts) pra visitantes que já decidiram. Os scripts de
            GA4/Pixel só carregam após o aceite (AnalyticsScripts). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
try{var sc=JSON.parse(localStorage.getItem('sa_consent'));if(sc&&sc.version===1&&sc.categories){var cc=sc.categories;gtag('consent','update',{analytics_storage:cc.analytics?'granted':'denied',ad_storage:cc.marketing?'granted':'denied',ad_user_data:cc.marketing?'granted':'denied',ad_personalization:cc.marketing?'granted':'denied'});}}catch(e){}`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaAgent) }} />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://xpkznaqgctfkoonqpcye.supabase.co" />
        <link rel="preconnect" href="https://xpkznaqgctfkoonqpcye.supabase.co" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body><VisitTracker /><TrackingProvider />{children}
{/* GA4/Meta/Google Ads carregam SÓ após consentimento (LGPD) — ver AnalyticsScripts.
    O clique em [data-wpp] (Contact/contact_whatsapp) é delegado no TrackingProvider. */}
<AnalyticsScripts />
<CookieConsent />
</body>
    </html>
  )
}
