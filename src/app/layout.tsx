import type { Metadata } from 'next'
import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google'
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Stiven Allan — Imóveis de Alto Padrão em Criciúma/SC | CRECI/RS 60.275',
    template: '%s | Stiven Allan',
  },
  description:
    'Stiven Allan, corretor CRECI/RS 60.275. Lançamentos e empreendimentos de construtoras em Criciúma e região. Financiamento direto sem banco.',
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
  description: 'Corretor de imóveis especialista em lançamentos e empreendimentos de construtoras em Criciúma/SC. Financiamento direto. CRECI/RS 60.275.',
  url: SITE_URL,
  telephone: '+5548991642332',
  email: 'contato@stivenallan.com.br',
  areaServed: [
    { '@type': 'City', name: 'Criciúma', containedInPlace: { '@type': 'State', name: 'Santa Catarina' } },
    { '@type': 'City', name: 'Içara', containedInPlace: { '@type': 'State', name: 'Santa Catarina' } },
    { '@type': 'City', name: 'Nova Veneza', containedInPlace: { '@type': 'State', name: 'Santa Catarina' } },
    { '@type': 'City', name: 'Forquilhinha', containedInPlace: { '@type': 'State', name: 'Santa Catarina' } },
    { '@type': 'City', name: 'Cocal do Sul', containedInPlace: { '@type': 'State', name: 'Santa Catarina' } },
  ],
  hasCredential: 'CRECI/RS 60.275',
  sameAs: ['https://wa.me/5548991642332', 'https://www.instagram.com/stivenallan.ofc'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} ${hanken.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaAgent) }} />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://xpkznaqgctfkoonqpcye.supabase.co" />
        <link rel="preconnect" href="https://xpkznaqgctfkoonqpcye.supabase.co" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  )
}
