import type { Metadata } from 'next'
import EmpreendimentoTemplate from '@/components/eraldo/EmpreendimentoTemplate'
import { granMichel } from '@/data/eraldo/gran-michel'
import { SITE_URL } from '@/lib/site'

const URL = SITE_URL + '/empreendimento/eraldo/' + granMichel.slug

export const metadata: Metadata = {
  title: 'Gran Michel | Bairro Michel Criciúma',
  description: 'Gran Michel, em construção no Bairro Michel, Criciúma/SC — 15 pavimentos, 88 unidades, rooftop com piscina. Financiamento direto com a construtora. Fale com Stiven Allan.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Gran Michel | Criciúma | Stiven Allan',
    description: 'Em construção no Bairro Michel. 15 pavimentos, 88 unidades, rooftop com piscina. Financiamento direto Eraldo Construções.',
    url: URL,
    siteName: 'Stiven Allan — Imóveis',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: granMichel.heroImg, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gran Michel | Criciúma | Stiven Allan',
    description: 'Em construção no Bairro Michel. 15 pavimentos, 88 unidades. Financiamento direto.',
    images: [granMichel.heroImg],
  },
  robots: { index: true, follow: true },
}

export default function GranMichelPage() {
  return <EmpreendimentoTemplate data={granMichel} />
}
