import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WppFloat from '@/components/WppFloat'

const CIDADES: Record<string, { nome: string; uf: string; descricao: string }> = {
  'criciuma-sc': { nome: 'Criciúma', uf: 'SC', descricao: 'Lançamentos imobiliários em Criciúma e região sul catarinense.' },
  'icara-sc': { nome: 'Içara', uf: 'SC', descricao: 'Empreendimentos e lançamentos em Içara/SC.' },
  'nova-veneza-sc': { nome: 'Nova Veneza', uf: 'SC', descricao: 'Imóveis e lançamentos em Nova Veneza/SC.' },
  'forquilhinha-sc': { nome: 'Forquilhinha', uf: 'SC', descricao: 'Lançamentos imobiliários em Forquilhinha/SC.' },
  'cocal-do-sul-sc': { nome: 'Cocal do Sul', uf: 'SC', descricao: 'Empreendimentos em Cocal do Sul/SC.' },
}

type Props = { params: Promise<{ cidade: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade } = await params
  const info = CIDADES[cidade]
  if (!info) return {}
  return {
    title: `Lançamentos Imobiliários em ${info.nome}/${info.uf} | Stiven Allan`,
    description: `${info.descricao} Conheça os melhores empreendimentos com Stiven Allan, CRECI/RS 60.275.`,
    alternates: { canonical: `https://stivenallan.com.br/lancamentos/${cidade}` },
    openGraph: {
      title: `Lançamentos em ${info.nome}/${info.uf} | Stiven Allan`,
      description: info.descricao,
    },
  }
}

export async function generateStaticParams() {
  return Object.keys(CIDADES).map((cidade) => ({ cidade }))
}

export default async function LancamentosCidadePage({ params }: Props) {
  const { cidade } = await params
  const info = CIDADES[cidade]

  if (!info) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Cidade não encontrada</h1>
            <Link href="/" className="text-[#c9a24b] hover:underline">Voltar ao início</Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://stivenallan.com.br' },
      { '@type': 'ListItem', position: 2, name: `Lançamentos ${info.nome}`, item: `https://stivenallan.com.br/lancamentos/${cidade}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />
      <Header />
      <section className="pt-32 pb-16 bg-[#1a1c1f]">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-[#a7adb4] mb-6">
            <Link href="/" className="hover:text-[#c9a24b] transition-colors">Início</Link>
            <span>/</span>
            <span className="text-[#f4f4f4]">Lançamentos {info.nome}</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Lançamentos em <span className="text-[#c9a24b]">{info.nome}/{info.uf}</span>
          </h1>
          <p className="text-[#a7adb4] text-lg max-w-2xl">{info.descricao} Fale com Stiven Allan, especialista em lançamentos no sul catarinense.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-7">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#202327] border border-[#2c3035] rounded-2xl overflow-hidden">
                <div className="relative h-52 bg-[#2c3035] flex items-center justify-center">
                  <p className="text-[#a7adb4] text-sm">Carregando empreendimentos...</p>
                </div>
                <div className="p-5">
                  <div className="h-4 bg-[#2c3035] rounded mb-3 w-3/4"></div>
                  <div className="h-3 bg-[#2c3035] rounded mb-2 w-1/2"></div>
                  <div className="h-6 bg-[#2c3035] rounded mt-4 w-2/3"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16 bg-[#1a1c1f] border border-[#2c3035] rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-3">Não encontrou o que procura?</h2>
            <p className="text-[#a7adb4] mb-6">Fale diretamente comigo. Tenho acesso a empreendimentos exclusivos em {info.nome} e região.</p>
            <a href={`https://wa.me/5548991642332?text=Ol%C3%A1+Stiven!+Procuro+imóveis+em+${encodeURIComponent(info.nome)}.`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#1f9d55] text-white font-bold px-8 py-4 rounded-full hover:bg-[#17854a] transition-colors">
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>
      <Footer />
      <WppFloat />
    </>
  )
}
