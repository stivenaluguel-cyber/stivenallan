import type { Metadata } from 'next'
import EmpreendimentoTemplate from '@/components/eraldo/EmpreendimentoTemplate'
import { symphony } from '@/data/eraldo/symphony'
import { SITE_URL } from '@/lib/site'

const URL = SITE_URL + '/empreendimento/eraldo/' + symphony.slug

export const metadata: Metadata = {
  title: 'Symphony | Mar Grosso, Laguna',
  description: 'Symphony, em construção em Mar Grosso, Laguna/SC — 19 pavimentos, 76 unidades, a poucos passos do mar, entrega prevista para novembro de 2027. Fale com Stiven Allan.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Symphony | Laguna | Stiven Allan',
    description: 'Em construção em Mar Grosso. 19 pavimentos, 76 unidades, a poucos passos do mar.',
    url: URL,
    siteName: 'Stiven Allan — Imóveis',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: symphony.heroImg, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Symphony | Laguna | Stiven Allan',
    description: 'Em construção a poucos passos do mar em Mar Grosso, Laguna. 19 pavimentos, 76 unidades.',
    images: [symphony.heroImg],
  },
  robots: { index: true, follow: true },
}

export default function SymphonyPage() {
  return <EmpreendimentoTemplate data={symphony} />
}
