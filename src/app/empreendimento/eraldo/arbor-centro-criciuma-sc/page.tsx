import type { Metadata } from 'next'
import EmpreendimentoTemplate from '@/components/eraldo/EmpreendimentoTemplate'
import { arbor } from '@/data/eraldo/arbor'
import { SITE_URL } from '@/lib/site'

const URL = SITE_URL + '/empreendimento/eraldo/' + arbor.slug

export const metadata: Metadata = {
  title: 'Árbor | Centro Criciúma',
  description: 'Árbor, em construção no Centro de Criciúma/SC — 25 pavimentos, 40 unidades e apartamentos de 3 suítes. Financiamento direto com a construtora, sem banco. Fale com Stiven Allan.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Árbor | Criciúma | Stiven Allan',
    description: 'Em construção no Centro de Criciúma. 25 pavimentos, 40 unidades, apartamentos de 3 suítes. Financiamento direto Eraldo Construções.',
    url: URL,
    siteName: 'Stiven Allan — Imóveis',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: arbor.heroImg, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Árbor | Centro Criciúma | Stiven Allan',
    description: 'Em construção no Centro de Criciúma. 25 pavimentos, 40 unidades. Financiamento direto.',
    images: [arbor.heroImg],
  },
  robots: { index: true, follow: true },
}

export default function ArborPage() {
  return <EmpreendimentoTemplate data={arbor} />
}
