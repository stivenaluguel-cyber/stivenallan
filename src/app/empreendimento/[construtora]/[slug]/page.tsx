import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WppFloat from '@/components/WppFloat'
import LeadForm from '@/components/LeadForm'

// ISR: revalidar a cada 1 hora (Regra Absoluta do projeto)
export const revalidate = 3600

type Props = { params: Promise<{ construtora: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { construtora, slug } = await params
  const nomeFormatado = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return {
    title: `${nomeFormatado} | Empreendimento em Criciúma/SC | Stiven Allan`,
    description: `Conheça o ${nomeFormatado}, empreendimento da ${construtora} em Criciúma/SC. Fale com Stiven Allan, CRECI/RS 60.275.`,
    alternates: { canonical: `https://stivenallan.com.br/empreendimento/${construtora}/${slug}` },
    openGraph: {
      title: `${nomeFormatado} | Empreendimento em Criciúma/SC`,
      description: `Lançamento da ${construtora} em Criciúma. Conheça as plantas e valores.`,
    },
  }
}

export default async function EmpreendimentoPage({ params }: Props) {
  const { construtora, slug } = await params
  const nomeFormatado = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const construtoraNome = construtora.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  const schemaListing = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: nomeFormatado,
    description: `Empreendimento ${nomeFormatado} da ${construtoraNome} em Criciúma/SC.`,
    url: `https://stivenallan.com.br/empreendimento/${construtora}/${slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Criciúma',
      addressRegion: 'SC',
      addressCountry: 'BR',
    },
    offers: { '@type': 'Offer', priceCurrency: 'BRL', availability: 'https://schema.org/InStock' },
  }

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://stivenallan.com.br' },
      { '@type': 'ListItem', position: 2, name: 'Lançamentos Criciúma', item: 'https://stivenallan.com.br/lancamentos/criciuma-sc' },
      { '@type': 'ListItem', position: 3, name: nomeFormatado, item: `https://stivenallan.com.br/empreendimento/${construtora}/${slug}` },
    ],
  }

  const schemaAgent = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Stiven Allan',
    description: 'Corretor de imóveis em Criciúma/SC e região. CRECI/RS 60.275.',
    url: 'https://stivenallan.com.br',
    telephone: '+5548991642332',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Criciúma',
      addressRegion: 'SC',
      addressCountry: 'BR',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaListing) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaAgent) }} />
      <Header />

      <main className="pt-24">
        <div className="container mx-auto px-6 py-8">
          <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-[#a7adb4] mb-6">
            <Link href="/" className="hover:text-[#c9a24b] transition-colors">Início</Link>
            <span aria-hidden="true">/</span>
            <Link href="/lancamentos/criciuma-sc" className="hover:text-[#c9a24b] transition-colors">Criciúma</Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#f4f4f4]" aria-current="page">{nomeFormatado}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Coluna principal */}
            <div className="lg:col-span-2">
              {/* Galeria principal */}
              <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden mb-6 bg-[#202327]">
                <Image
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
                  alt={nomeFormatado + ' - Empreendimento em Criciúma/SC'}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
                <span className="absolute top-4 left-4 bg-[#c9a24b] text-[#1a1305] text-xs font-bold px-4 py-2 rounded-full">Lançamento</span>
              </div>

              {/* Detalhes */}
              <div className="bg-[#202327] border border-[#2c3035] rounded-2xl p-6 mb-6">
                <p className="text-[#a7adb4] text-sm mb-1">{construtoraNome}</p>
                <h1 className="text-3xl font-extrabold mb-2">{nomeFormatado}</h1>
                <p className="text-[#a7adb4] mb-6">Criciúma, SC</p>

                <div className="grid grid-cols-3 gap-4 border-t border-[#2c3035] pt-6 mb-6">
                  <div className="text-center"><b className="text-2xl text-[#e2c275] block">2-3</b><small className="text-[#a7adb4] text-sm">Dormitórios</small></div>
                  <div className="text-center"><b className="text-2xl text-[#e2c275] block">65-95m²</b><small className="text-[#a7adb4] text-sm">Área Priv.</small></div>
                  <div className="text-center"><b className="text-2xl text-[#e2c275] block">1-2</b><small className="text-[#a7adb4] text-sm">Vagas</small></div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#a7adb4] text-sm">A partir de</p>
                    <p className="text-3xl font-extrabold text-[#e2c275]">R$ 320.000</p>
                  </div>
                  <a href="https://wa.me/5548991642332" target="_blank" rel="noopener noreferrer" className="bg-[#1f9d55] text-white font-bold px-6 py-3 rounded-full hover:bg-[#17854a] transition-colors">
                    Quero saber mais
                  </a>
                </div>
              </div>

              {/* Descrição */}
              <div className="bg-[#202327] border border-[#2c3035] rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Sobre o Empreendimento</h2>
                <p className="text-[#a7adb4] leading-relaxed">O {nomeFormatado} é um empreendimento de alto padrão localizado em Criciúma/SC, desenvolvido pela {construtoraNome}. Com plantas modernas e infraestrutura completa, é a opção ideal para quem busca qualidade de vida ou investimento imobiliário no sul catarinense.</p>
              </div>

              {/* Localização */}
              <div className="bg-[#202327] border border-[#2c3035] rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Localização</h2>
                <p className="text-[#a7adb4]">Criciúma - SC</p>
              </div>
            </div>

            {/* Coluna do formulário */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <LeadForm empreendimentoSlug={slug} empreendimentoNome={nomeFormatado} />
                <a href="https://wa.me/5548991642332" target="_blank" rel="noopener noreferrer" className="mt-4 w-full flex items-center justify-center gap-2 bg-[#1f9d55] text-white font-bold py-4 rounded-2xl hover:bg-[#17854a] transition-colors">
                  Mensagem no WhatsApp
                </a>
                <a href="tel:+5548991642332" className="mt-3 w-full flex items-center justify-center gap-2 border border-[#2c3035] text-[#f4f4f4] font-bold py-4 rounded-2xl hover:border-[#c9a24b] transition-colors">
                  Ligar: (48) 99164-2332
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WppFloat />
    </>
  )
}
