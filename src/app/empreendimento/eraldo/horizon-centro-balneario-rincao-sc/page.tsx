import type { Metadata } from 'next'
import EmpreendimentoTemplate from '@/components/eraldo/EmpreendimentoTemplate'
import { horizon } from '@/data/eraldo/horizon'
import { SITE_URL } from '@/lib/site'

const URL = SITE_URL + '/empreendimento/eraldo/' + horizon.slug

export const metadata: Metadata = {
  title: 'Horizon | Balneário Rincão',
  description: 'Horizon, em construção no Centro de Balneário Rincão/SC — 14 pavimentos, 35 apartamentos a poucos passos do mar, entrega prevista para 30/11/2026. Fale com Stiven Allan.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Horizon | Balneário Rincão | Stiven Allan',
    description: 'Em construção no Centro de Balneário Rincão. 14 pavimentos, 35 apartamentos, a poucos passos do mar.',
    url: URL,
    siteName: 'Stiven Allan — Imóveis',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: horizon.heroImg, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Horizon | Balneário Rincão | Stiven Allan',
    description: 'Em construção a poucos passos do mar em Balneário Rincão. 14 pavimentos, 35 apartamentos.',
    images: [horizon.heroImg],
  },
  robots: { index: true, follow: true },
}

export default function HorizonPage() {
  return <EmpreendimentoTemplate data={horizon} />
}
