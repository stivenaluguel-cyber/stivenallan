import type { Metadata } from 'next'
import EmpreendimentoTemplate from '@/components/eraldo/EmpreendimentoTemplate'
import { harmony } from '@/data/eraldo/harmony'
import { SITE_URL } from '@/lib/site'

const URL = SITE_URL + '/empreendimento/eraldo/' + harmony.slug

export const metadata: Metadata = {
  title: 'Harmony Residence | Balneário Rincão',
  description: 'Harmony Residence, lançamento no Centro de Balneário Rincão/SC — 12 pavimentos, 36 unidades a poucos passos do mar. Financiamento direto com a construtora. Fale com Stiven Allan.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Harmony Residence | Balneário Rincão | Stiven Allan',
    description: 'Lançamento no Centro de Balneário Rincão. 12 pavimentos, 36 unidades, a poucos passos do mar. Financiamento direto Eraldo Construções.',
    url: URL,
    siteName: 'Stiven Allan — Imóveis',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: harmony.heroImg, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harmony Residence | Balneário Rincão | Stiven Allan',
    description: 'Lançamento a poucos passos do mar em Balneário Rincão. 12 pavimentos, 36 unidades. Financiamento direto.',
    images: [harmony.heroImg],
  },
  robots: { index: true, follow: true },
}

export default function HarmonyPage() {
  return <EmpreendimentoTemplate data={harmony} />
}
