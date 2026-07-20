import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site'
import Script from 'next/script'
import { VisitTracker } from '@/components/VisitTracker'
import { TrackingProvider } from '@/components/TrackingProvider'
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaAgent) }} />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://xpkznaqgctfkoonqpcye.supabase.co" />
        <link rel="preconnect" href="https://xpkznaqgctfkoonqpcye.supabase.co" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body><VisitTracker /><TrackingProvider />{children}
<Script src="https://www.googletagmanager.com/gtag/js?id=G-5TWF0JTG8H" strategy="afterInteractive"/>
<Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-5TWF0JTG8H');`}</Script>
<Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','364836344657445');fbq('track','PageView');`}</Script>
{/* Contact/contact_whatsapp em qualquer link com data-wpp. data-wpp-emp/data-wpp-nome (opcionais) enriquecem com empreendimento/content_name sem mudar o evento pras páginas que só usam data-wpp="1". */}
<Script id="wpp-track" strategy="afterInteractive">{`document.addEventListener('click',function(e){var a=e.target.closest('[data-wpp]');if(!a)return;var p={content_name:a.getAttribute('data-wpp-nome')||'WhatsApp',method:'whatsapp'};var pos=a.getAttribute('data-wpp');if(pos)p.position=pos;var emp=a.getAttribute('data-wpp-emp');if(emp)p.empreendimento=emp;if(typeof fbq!=='undefined')fbq('track','Contact',p);if(typeof gtag!=='undefined')gtag('event','contact_whatsapp',p);});`}</Script>
{process.env.NEXT_PUBLIC_GADS_ID && (
  <Script id="gads" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('config','${process.env.NEXT_PUBLIC_GADS_ID}');`}</Script>
)}
</body>
    </html>
  )
}
