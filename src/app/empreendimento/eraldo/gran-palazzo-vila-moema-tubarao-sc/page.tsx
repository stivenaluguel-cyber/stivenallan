import type { Metadata } from 'next'
import EmpreendimentoTemplate from '@/components/eraldo/EmpreendimentoTemplate'
import { granPalazzo } from '@/data/eraldo/gran-palazzo'
import { SITE_URL } from '@/lib/site'

const URL = SITE_URL + '/empreendimento/eraldo/' + granPalazzo.slug

export const metadata: Metadata = {
  title: 'Gran Palazzo | Vila Moema, Tubarão',
  description: 'Gran Palazzo, em construção na Vila Moema, Tubarão/SC — 21 pavimentos, 66 unidades, entrega prevista para dezembro de 2026. Fale com Stiven Allan.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Gran Palazzo | Tubarão | Stiven Allan',
    description: 'Em construção na Vila Moema. 21 pavimentos, 66 unidades, entrega dez/2026.',
    url: URL,
    siteName: 'Stiven Allan — Imóveis',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: granPalazzo.heroImg, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gran Palazzo | Tubarão | Stiven Allan',
    description: 'Em construção na Vila Moema, Tubarão. 21 pavimentos, 66 unidades.',
    images: [granPalazzo.heroImg],
  },
  robots: { index: true, follow: true },
}

export default function GranPalazzoPage() {
  return <EmpreendimentoTemplate data={granPalazzo} />
}
