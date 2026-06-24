import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Stiven Allan — Corretor de Imóveis em Criciúma e Região | SC',
    template: '%s | Stiven Allan — CRECI/RS 60.275',
  },
  description:
    'Stiven Allan, corretor de imóveis CRECI/RS 60.275 especializado em lançamentos e empreendimentos de construtoras em Criciúma, Içara, Nova Veneza, Forquilhinha e Cocal do Sul/SC.',
  keywords: [
    'corretor de imóveis criciúma',
    'lançamentos imobiliários criciúma',
    'apartamentos na planta criciúma',
    'empreendimentos criciúma sc',
    'imóveis criciúma sc',
    'stiven allan corretor',
    'creci 60275',
  ],
  authors: [{ name: 'Stiven Allan', url: SITE_URL }],
  creator: 'Stiven Allan',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: 'Stiven Allan — Corretor de Imóveis',
    title: 'Stiven Allan — Corretor de Imóveis em Criciúma e Região | SC',
    description: 'Lançamentos e empreendimentos premium em Criciúma e região. Atendimento personalizado do primeiro contato até a entrega das chaves.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stiven Allan — Corretor de Imóveis em Criciúma/SC',
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
  description: 'Corretor de imóveis especialista em lançamentos e empreendimentos de construtoras em Criciúma/SC e região.',
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
  sameAs: ['https://wa.me/5548991642332', 'https://www.instagram.com/stivenallan'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaAgent) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-[#121315] text-[#f4f4f4] antialiased">{children}</body>
    </html>
  )
}
