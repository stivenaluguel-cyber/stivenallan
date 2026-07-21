import type { Metadata } from 'next'
import EmpreendimentoTemplate from '@/components/eraldo/EmpreendimentoTemplate'
import { lessence } from '@/data/eraldo/lessence'
import { SITE_URL } from '@/lib/site'

const URL = SITE_URL + '/empreendimento/eraldo/' + lessence.slug

export const metadata: Metadata = {
  title: "L'Essence Home Club | Cruzeiro do Sul, Criciúma",
  description: "L'Essence Home Club, pronto para morar no Cruzeiro do Sul, Criciúma/SC — 16 pavimentos, 67 unidades, lazer completo. Agende uma visita com Stiven Allan.",
  alternates: { canonical: URL },
  openGraph: {
    title: "L'Essence Home Club | Criciúma | Stiven Allan",
    description: 'Pronto para morar no Cruzeiro do Sul. 16 pavimentos, 67 unidades, lazer completo já em funcionamento.',
    url: URL,
    siteName: 'Stiven Allan — Imóveis',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: lessence.heroImg, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "L'Essence Home Club | Criciúma | Stiven Allan",
    description: 'Pronto para morar no Cruzeiro do Sul, Criciúma. 16 pavimentos, 67 unidades.',
    images: [lessence.heroImg],
  },
  robots: { index: true, follow: true },
}

export default function LessencePage() {
  return <EmpreendimentoTemplate data={lessence} />
}
