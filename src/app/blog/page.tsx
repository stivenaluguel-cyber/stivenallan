import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WppFloat from '@/components/WppFloat'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog Imobiliário | Dicas e Tendências do Mercado | Stiven Allan Corretor',
  description: 'Fique por dentro do mercado imobiliário em Criciúma e região sul catarinense. Dicas de compra, financiamento, valorização e lançamentos com Stiven Allan, CRECI 60.275.',
  alternates: {
    canonical: 'https://stivenallan.com.br/blog',
  },
  openGraph: {
    title: 'Blog Imobiliário | Stiven Allan Corretor em Criciúma/SC',
    description: 'Dicas, tendências e notícias do mercado imobiliário no sul de Santa Catarina.',
  },
}

interface Post {
  slug: string
  titulo: string
  resumo: string
  categoria: string
  imagem?: string
  data: string
  tempo_leitura: number
}

// Posts estáticos — futuramente integrar com Supabase/CMS
const POSTS: Post[] = [
  {
    slug: 'como-comprar-apartamento-criciuma-sc',
    titulo: 'Como Comprar Apartamento em Criciúma/SC: Guia Completo 2025',
    resumo: 'Descubra o passo a passo para adquirir seu apartamento em Criciúma com segurança: documentação, financiamento, escolha do bairro ideal e mais.',
    categoria: 'Guia de Compra',
    data: '2025-01-15',
    tempo_leitura: 8,
  },
  {
    slug: 'lancamentos-imobiliarios-sul-catarinense-2025',
    titulo: 'Melhores Lançamentos Imobiliários no Sul Catarinense em 2025',
    resumo: 'Conheça os empreendimentos mais promissores em Criciúma, Içara, Nova Veneza e região — oportunidades de investimento e moradia.',
    categoria: 'Lançamentos',
    data: '2025-01-10',
    tempo_leitura: 6,
  },
  {
    slug: 'financiamento-imobiliario-caixa-economica-federal',
    titulo: 'Financiamento Imobiliário pela Caixa: Tudo que Você Precisa Saber',
    resumo: 'Taxas, prazos, simulações e dicas para conseguir seu crédito imobiliário com as melhores condições em 2025.',
    categoria: 'Financiamento',
    data: '2025-01-05',
    tempo_leitura: 10,
  },
  {
    slug: 'valorizar-imovel-antes-de-vender',
    titulo: '10 Dicas Para Valorizar Seu Imóvel Antes de Vender',
    resumo: 'Pequenas reformas, organização e home staging podem aumentar o valor de venda do seu imóvel em até 30%. Veja como fazer.',
    categoria: 'Dicas',
    data: '2024-12-20',
    tempo_leitura: 5,
  },
  {
    slug: 'melhor-bairro-para-morar-em-criciuma',
    titulo: 'Qual o Melhor Bairro Para Morar em Criciúma? Comparativo Completo',
    resumo: 'Centro, Michel, Comerciário, Universitário e outros bairros de Criciúma analisados por infraestrutura, segurança e valorização imobiliária.',
    categoria: 'Guia de Bairros',
    data: '2024-12-15',
    tempo_leitura: 7,
  },
  {
    slug: 'o-que-e-creci-corretor-de-imoveis',
    titulo: 'CRECI: O Que É e Por Que É Importante Para Seu Corretor Ter',
    resumo: 'Entenda a importância do registro CRECI para o corretor de imóveis e como ele protege você em transações imobiliárias.',
    categoria: 'Educação',
    data: '2024-12-10',
    tempo_leitura: 4,
  },
]

const CATEGORIA_CORES: Record<string, string> = {
  'Guia de Compra': 'bg-blue-500/20 text-blue-400',
  'Lançamentos': 'bg-[#c9a24b]/20 text-[#c9a24b]',
  'Financiamento': 'bg-green-500/20 text-green-400',
  'Dicas': 'bg-purple-500/20 text-purple-400',
  'Guia de Bairros': 'bg-orange-500/20 text-orange-400',
  'Educação': 'bg-teal-500/20 text-teal-400',
}

function formatData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogPage() {
  const destaque = POSTS[0]
  const demais = POSTS.slice(1)

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://stivenallan.com.br' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://stivenallan.com.br/blog' },
    ],
  }

  const schemaBlog = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog Imobiliário Stiven Allan',
    url: 'https://stivenallan.com.br/blog',
    description: 'Dicas, tendências e notícias do mercado imobiliário em Criciúma e região sul catarinense.',
    publisher: {
      '@type': 'Person',
      name: 'Stiven Allan',
      jobTitle: 'Corretor de Imóveis',
      hasCredential: 'CRECI 60.275',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBlog) }} />

      <Header />

      {/* Hero */}
      <section className="pt-32 pb-12 bg-[#1a1c1f]">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-[#a7adb4] mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#c9a24b] transition-colors">Início</Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#f4f4f4]">Blog</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Blog <span className="text-[#c9a24b]">Imobiliário</span>
          </h1>
          <p className="text-[#a7adb4] text-lg max-w-2xl">
            Dicas, guias e novidades do mercado imobiliário em Criciúma e no sul catarinense. 
            Conteúdo criado por Stiven Allan, CRECI 60.275.
          </p>
        </div>
      </section>

      {/* Post em destaque */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <Link
            href={`/blog/${destaque.slug}`}
            className="group block bg-[#202327] border border-[#2c3035] rounded-2xl overflow-hidden hover:border-[#c9a24b]/30 transition-all"
          >
            <div className="md:grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto bg-[#2c3035] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#c9a24b]/20 to-transparent" />
                <div className="flex items-center justify-center h-full">
                  <span className="text-6xl">🏙️</span>
                </div>
                <span className="absolute top-4 left-4 px-3 py-1 bg-[#c9a24b] text-[#121315] rounded-full text-xs font-bold">
                  Destaque
                </span>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className={`inline-block mb-3 px-3 py-1 rounded-full text-xs font-semibold w-fit ${CATEGORIA_CORES[destaque.categoria] ?? 'bg-white/10 text-white'}`}>
                  {destaque.categoria}
                </span>
                <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-[#c9a24b] transition-colors">
                  {destaque.titulo}
                </h2>
                <p className="text-[#a7adb4] mb-4 line-clamp-3">{destaque.resumo}</p>
                <div className="flex items-center gap-4 text-[#a7adb4] text-sm">
                  <span>{formatData(destaque.data)}</span>
                  <span>·</span>
                  <span>{destaque.tempo_leitura} min de leitura</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Grade de posts */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-8">Artigos Recentes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {demais.map((post) => (
              <article
                key={post.slug}
                className="bg-[#202327] border border-[#2c3035] rounded-2xl overflow-hidden hover:border-[#c9a24b]/30 transition-all group"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative h-44 bg-[#2c3035] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#c9a24b]/10 to-transparent" />
                    <div className="flex items-center justify-center h-full">
                      <span className="text-4xl opacity-50">🏠</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <span className={`inline-block mb-2 px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORIA_CORES[post.categoria] ?? 'bg-white/10 text-white'}`}>
                      {post.categoria}
                    </span>
                    <h3 className="text-white font-bold text-base mb-2 group-hover:text-[#c9a24b] transition-colors line-clamp-2">
                      {post.titulo}
                    </h3>
                    <p className="text-[#a7adb4] text-sm mb-3 line-clamp-2">{post.resumo}</p>
                    <div className="flex items-center gap-3 text-[#a7adb4] text-xs">
                      <span>{formatData(post.data)}</span>
                      <span>·</span>
                      <span>{post.tempo_leitura} min</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* CTA newsletter / WhatsApp */}
          <div className="mt-16 bg-[#1a1c1f] border border-[#2c3035] rounded-2xl p-10 text-center">
            <h2 className="text-2xl font-bold mb-3">Fique por dentro do mercado imobiliário</h2>
            <p className="text-[#a7adb4] mb-6 max-w-xl mx-auto">
              Receba em primeira mão os melhores lançamentos, dicas e oportunidades do mercado imobiliário em Criciúma e região.
            </p>
            <a
              href="https://wa.me/5548991642332?text=Olá+Stiven!+Quero+receber+novidades+do+mercado+imobiliário."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1f9d55] text-white font-bold px-8 py-4 rounded-full hover:bg-[#17854a] transition-colors"
            >
              Falar com Stiven no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <WppFloat />
    </>
  )
}
