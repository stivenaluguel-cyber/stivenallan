import type { Metadata } from 'next'
import EmpreendimentoTemplate from '@/components/eraldo/EmpreendimentoTemplate'
import { play } from '@/data/eraldo/play'
import { SITE_URL } from '@/lib/site'

const URL = SITE_URL + '/empreendimento/eraldo/' + play.slug

export const metadata: Metadata = {
  title: 'Play Residence | Vila Moema, Tubarão',
  description: 'Play Residence, pronto para morar na Vila Moema, Tubarão/SC — 17 pavimentos, anexo ao Complexo Alliance. Agende uma visita com Stiven Allan.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Play Residence | Tubarão | Stiven Allan',
    description: 'Pronto para morar na Vila Moema, anexo ao Complexo Alliance. 17 pavimentos.',
    url: URL,
    siteName: 'Stiven Allan — Imóveis',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: play.heroImg, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Play Residence | Tubarão | Stiven Allan',
    description: 'Pronto para morar na Vila Moema, Tubarão. 17 pavimentos, anexo ao Complexo Alliance.',
    images: [play.heroImg],
  },
  robots: { index: true, follow: true },
}

export default function PlayPage() {
  return <EmpreendimentoTemplate data={play} />
}
