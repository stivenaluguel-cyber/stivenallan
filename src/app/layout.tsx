import type { Metadata, Viewport } from 'next'
import { SITE_URL } from '@/lib/site'
import { VisitTracker } from '@/components/VisitTracker'
import { TrackingProvider } from '@/components/TrackingProvider'
import { AnalyticsScripts } from '@/components/AnalyticsScripts'
import { CookieConsent } from '@/components/CookieConsent'
import { Piazzolla, Public_Sans } from 'next/font/google'
import './globals.css'

// Identidade tipográfica "Clássica Brasileira Sofisticada" (redesenho de
// 08/2026 — branch design/tipografia-editorial). Piazzolla como display com
// raiz latino-americana foge do par Playfair/Cormorant que todo template
// "luxury" genérico usa; Public Sans cobre corpo, navegação e controles com
// ótimo suporte a diacríticos do português. Só 2 pesos por família (400/600)
// + itálico da Piazzolla como acento pontual — nunca decorativo em toda seção.
const piazzolla = Piazzolla({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-piazzolla',
  weight: ['400', '600'],
  style: ['normal', 'italic'],
})

const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-public-sans',
  weight: ['400', '600'],
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
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  // "Adicionar à Tela de Início" no Safari do iPhone: sem isso o ícone
  // salvo é só um screenshot da página e abre dentro do Safari (com barra
  // de endereço); com isso, abre em tela cheia como um app instalado.
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SA Painel',
  },
}

export const viewport: Viewport = {
  themeColor: '#D24E22',
}

const schemaAgent = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  // @id fixo para que cada empreendimento possa apontar `provider` para cá
  // (ver PropertySchema). Sem isso, buscadores e IAs não ligavam a listagem
  // ao corretor responsável por ela.
  '@id': `${SITE_URL}#corretor`,
  name: 'Stiven Allan',
  url: SITE_URL,
  telephone: '+5548991642332',
  description: 'Corretor de imóveis especialista em lançamentos com financiamento direto da construtora em Criciúma e Sul de Santa Catarina.',
  // email removido (2026-07-24): stivenallan.com.br não tem registro MX —
  // não recebe e-mail, então não deve ser declarado como contato aqui.
  // hasCredential (schema estruturado) removido (2026-07-24): Gate B
  // (validação oficial da situação cadastral do CRECI) segue aberto.
  // Isso NÃO remove o texto simples "CRECI 60.275" que continua visível em
  // várias páginas do site (rodapés, /sobre, páginas de empreendimento) —
  // só a afirmação estruturada em JSON-LD. Gate B permanece aberto até
  // validação oficial e padronização completa. Ver PR #17.
  areaServed: [
    { '@type': 'City', name: 'Criciúma' },
    { '@type': 'City', name: 'Balneário Rincão' },
    { '@type': 'City', name: 'Laguna' },
    { '@type': 'City', name: 'Içara' },
    { '@type': 'City', name: 'Siderópolis' },
    { '@type': 'City', name: 'Balneário Piçarras' },
  ],
  sameAs: ['https://wa.me/5548991642332', 'https://www.instagram.com/stivenallan.ofc'],
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${piazzolla.variable} ${publicSans.variable}`}>
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
        {/* Next.js Metadata API só emite a meta tag padrão "mobile-web-app-capable"
            (appleWebApp.capable acima) — o prefixo "apple-" continua sendo o que
            o Safari do iOS de fato lê pra abrir em tela cheia sem a barra de
            endereço ao instalar pela Tela de Início; sem ele, versões mais
            antigas do iOS abrem como uma aba normal do Safari. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
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
