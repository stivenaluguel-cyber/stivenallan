import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WppFloat from '@/components/WppFloat'
import { notFound } from 'next/navigation'

export const revalidate = 3600

interface Post {
  slug: string
  titulo: string
  resumo: string
  categoria: string
  data: string
  tempo_leitura: number
  conteudo: string
  tags: string[]
  autor: string
}

// Posts estáticos — futuramente integrar com CMS/Supabase
const POSTS: Record<string, Post> = {
  'como-comprar-apartamento-criciuma-sc': {
    slug: 'como-comprar-apartamento-criciuma-sc',
    titulo: 'Como Comprar Apartamento em Criciúma/SC: Guia Completo 2025',
    resumo: 'Descubra o passo a passo para adquirir seu apartamento em Criciúma com segurança: documentação, financiamento, escolha do bairro ideal e mais.',
    categoria: 'Guia de Compra',
    data: '2025-01-15',
    tempo_leitura: 8,
    autor: 'Stiven Allan',
    tags: ['apartamento', 'criciúma', 'comprar imóvel', 'guia'],
    conteudo: `## Por Que Comprar em Criciúma?

Criciúma é a maior cidade do sul catarinense, com infraestrutura completa, mercado de trabalho aquecido e qualidade de vida acima da média nacional. A cidade tem se consolidado como polo regional, atraindo novos moradores e investidores imobiliários.

## Passo 1: Defina Seu Orçamento

Antes de sair procurando imóveis, é fundamental entender sua capacidade financeira. Considere:

- **Entrada:** normalmente entre 10% e 30% do valor do imóvel
- **Parcelas:** não devem ultrapassar 30% da renda familiar
- **Custos adicionais:** ITBI (2-3%), escritura, registro e reformas

## Passo 2: Escolha o Bairro Ideal

Cada bairro de Criciúma tem suas características. Os mais valorizados são:

- **Centro:** comércio, serviços, vida agitada
- **Michel:** residencial nobre, próximo ao parque
- **Comerciário:** família, escolas de qualidade
- **Universitário:** jovens, próximo a UNESC e SATC

## Passo 3: Financiamento Imobiliário

O financiamento pela Caixa Econômica Federal oferece as melhores condições:
- Até 80% do valor do imóvel
- Prazo de até 35 anos
- Taxas a partir de 10,5% ao ano + TR

## Passo 4: Documentação Necessária

Para financiar, você precisará de: RG, CPF, comprovante de renda (últimos 3 meses), extrato bancário (3 meses) e comprovante de residência.

## Passo 5: Visite e Negocie

Nunca compre sem visitar pessoalmente. Avalie: estado de conservação, posição solar, barulho, vizinhança e infraestrutura do condomínio.

## Conclusão

Comprar um apartamento em Criciúma é um ótimo investimento. Com planejamento e a orientação certa, você encontrará o imóvel perfeito. Entre em contato comigo e vamos começar sua busca!`,
  },
  'lancamentos-imobiliarios-sul-catarinense-2025': {
    slug: 'lancamentos-imobiliarios-sul-catarinense-2025',
    titulo: 'Melhores Lançamentos Imobiliários no Sul Catarinense em 2025',
    resumo: 'Conheça os empreendimentos mais promissores em Criciúma, Içara, Nova Veneza e região.',
    categoria: 'Lançamentos',
    data: '2025-01-10',
    tempo_leitura: 6,
    autor: 'Stiven Allan',
    tags: ['lançamentos', 'investimento', 'sul catarinense', '2025'],
    conteudo: `## O Mercado Imobiliário no Sul Catarinense em 2025

O mercado imobiliário do sul de Santa Catarina vive um momento de crescimento expressivo. Novas construtoras estão chegando à região, e os lançamentos em Criciúma e municípios vizinhos têm superado as expectativas de vendas.

## Por Que Investir na Região?

- **Crescimento econômico:** polo tecnológico, saúde e educação em expansão
- **Valorização consistente:** imóveis na região valorizaram 25% nos últimos 3 anos
- **Qualidade de vida:** infraestrutura completa com custo de vida menor que capitais

## Principais Cidades Para Investir

### Criciúma
A capital da região concentra os empreendimentos de maior valor agregado. Bairros como Michel e Mina do Mato lideram os lançamentos premium.

### Içara
Com crescimento acelerado, Içara oferece terrenos mais acessíveis e está a apenas 10 minutos de Criciúma.

### Nova Veneza
Cidade charmosa com características italianas, excelente para famílias que buscam tranquilidade sem abrir mão da proximidade com Criciúma.

## Conclusão

2025 é um excelente ano para investir em imóveis no sul catarinense. Fale comigo para conhecer as melhores oportunidades disponíveis!`,
  },
  'financiamento-imobiliario-caixa-economica-federal': {
    slug: 'financiamento-imobiliario-caixa-economica-federal',
    titulo: 'Financiamento Imobiliário pela Caixa: Tudo que Você Precisa Saber',
    resumo: 'Taxas, prazos, simulações e dicas para conseguir seu crédito imobiliário com as melhores condições em 2025.',
    categoria: 'Financiamento',
    data: '2025-01-05',
    tempo_leitura: 10,
    autor: 'Stiven Allan',
    tags: ['financiamento', 'caixa econômica', 'crédito imobiliário', 'taxa'],
    conteudo: `## Financiamento pela Caixa: A Melhor Opção?

A Caixa Econômica Federal é responsável por cerca de 70% dos financiamentos imobiliários do Brasil. Com taxas competitivas e programas especiais, é a opção preferida da maioria dos compradores.

## Principais Modalidades

### Sistema Financeiro de Habitação (SFH)
Para imóveis de até R$ 1,5 milhão, com uso do FGTS e taxas menores.

### Sistema de Financiamento Imobiliário (SFI)
Para imóveis acima de R$ 1,5 milhão, sem limite de valor.

## Taxas Atuais (2025)

| Perfil | Taxa ao ano |
|--------|-------------|
| FGTS + Relacionamento | A partir de 10,5% + TR |
| Sem FGTS | A partir de 11,0% + TR |
| SBPE | A partir de 11,5% + TR |

## Como Usar o FGTS

Você pode usar o FGTS se:
- Não possui imóvel no município onde reside/trabalha
- Não teve financiamento pelo SFH nos últimos 3 anos
- Tem pelo menos 3 anos de carteira assinada (somados)

## Dicas Para Aprovação

1. Mantenha o nome limpo (sem negativações)
2. Comprove renda formal ou informal (extratos, declaração de IR)
3. Tenha entrada de pelo menos 20%
4. Organize toda documentação antes de ir ao banco

## Simulação de Financiamento

Para um imóvel de R$ 300.000 com entrada de R$ 60.000:
- **Valor financiado:** R$ 240.000
- **Prazo:** 30 anos (360 meses)
- **Parcela inicial:** aproximadamente R$ 2.800/mês

Consulte-me para uma simulação personalizada!`,
  },
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = POSTS[slug]
  if (!post) return {}

  return {
    title: `${post.titulo} | Blog Stiven Allan Corretor`,
    description: post.resumo,
    alternates: {
      canonical: `https://stivenallan.com.br/blog/${slug}`,
    },
    openGraph: {
      title: post.titulo,
      description: post.resumo,
      type: 'article',
      publishedTime: post.data,
      authors: [post.autor],
    },
    keywords: post.tags.join(', '),
  }
}

export async function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }))
}

function formatData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function renderMarkdown(content: string): string {
  return content
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-white mt-8 mb-4">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-white mt-6 mb-3">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="text-[#a7adb4] ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-[#a7adb4] leading-relaxed mb-4">')
    .replace(/^(?!<[h|l])/gm, '')
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = POSTS[slug]

  if (!post) notFound()

  const schemaArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.titulo,
    description: post.resumo,
    author: {
      '@type': 'Person',
      name: post.autor,
      jobTitle: 'Corretor de Imóveis',
      hasCredential: 'CRECI 60.275',
      url: 'https://stivenallan.com.br',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Stiven Allan Corretor',
      url: 'https://stivenallan.com.br',
    },
    datePublished: post.data,
    dateModified: post.data,
    url: `https://stivenallan.com.br/blog/${slug}`,
    keywords: post.tags.join(', '),
    articleSection: post.categoria,
  }

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://stivenallan.com.br' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://stivenallan.com.br/blog' },
      { '@type': 'ListItem', position: 3, name: post.titulo, item: `https://stivenallan.com.br/blog/${slug}` },
    ],
  }

  // Get related posts
  const related = Object.values(POSTS)
    .filter((p) => p.slug !== slug)
    .slice(0, 3)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />

      <Header />

      <article className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#a7adb4] mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#c9a24b] transition-colors">Início</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#c9a24b] transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-[#f4f4f4] truncate max-w-xs">{post.titulo}</span>
          </nav>

          {/* Header do Post */}
          <header className="mb-10">
            <span className="inline-block mb-4 px-3 py-1 bg-[#c9a24b]/20 text-[#c9a24b] rounded-full text-sm font-semibold">
              {post.categoria}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              {post.titulo}
            </h1>
            <p className="text-[#a7adb4] text-lg mb-6">{post.resumo}</p>

            <div className="flex items-center gap-4 text-sm text-[#a7adb4] pb-8 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#c9a24b]/20 flex items-center justify-center text-[#c9a24b] font-bold text-sm">
                  SA
                </div>
                <span className="text-white font-medium">{post.autor}</span>
                <span className="text-[#a7adb4]">· CRECI 60.275</span>
              </div>
              <span>·</span>
              <time dateTime={post.data}>{formatData(post.data)}</time>
              <span>·</span>
              <span>{post.tempo_leitura} min de leitura</span>
            </div>
          </header>

          {/* Conteúdo */}
          <div className="prose-custom">
            {post.conteudo.split('\n').map((paragraph, i) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={i} className="text-2xl font-bold text-white mt-8 mb-4">
                    {paragraph.slice(3)}
                  </h2>
                )
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={i} className="text-xl font-semibold text-white mt-6 mb-3">
                    {paragraph.slice(4)}
                  </h3>
                )
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <li key={i} className="text-[#a7adb4] leading-relaxed ml-4 list-disc mb-1">
                    {paragraph.slice(2).replace(/\*\*(.+?)\*\*/g, '$1')}
                  </li>
                )
              }
              if (paragraph.trim() === '' || paragraph.startsWith('|')) return null
              return (
                <p key={i} className="text-[#a7adb4] leading-relaxed mb-4">
                  {paragraph.replace(/\*\*(.+?)\*\*/g, (_, text) => text)}
                </p>
              )
            })}
          </div>

          {/* Tags */}
          <div className="mt-10 pt-8 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-[#202327] border border-white/10 rounded-full text-[#a7adb4] text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 bg-[#202327] border border-[#c9a24b]/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-2">Precisa de ajuda para encontrar seu imóvel?</h2>
            <p className="text-[#a7adb4] mb-4">
              Sou Stiven Allan, corretor CRECI 60.275, especialista em lançamentos e imóveis no sul catarinense. 
              Posso te ajudar a encontrar a melhor oportunidade.
            </p>
            <a
              href="https://wa.me/5548991642332?text=Olá+Stiven!+Li+seu+artigo+e+gostaria+de+mais+informações."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1f9d55] text-white font-bold px-6 py-3 rounded-full hover:bg-[#17854a] transition-colors"
            >
              Falar com Stiven no WhatsApp
            </a>
          </div>
        </div>

        {/* Posts Relacionados */}
        {related.length > 0 && (
          <div className="container mx-auto px-6 max-w-4xl mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Artigos Relacionados</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((relPost) => (
                <Link
                  key={relPost.slug}
                  href={`/blog/${relPost.slug}`}
                  className="bg-[#202327] border border-[#2c3035] rounded-xl p-5 hover:border-[#c9a24b]/30 transition-all group"
                >
                  <span className="text-xs text-[#c9a24b] font-semibold">{relPost.categoria}</span>
                  <h3 className="text-white font-bold mt-1 mb-2 line-clamp-2 group-hover:text-[#c9a24b] transition-colors text-sm">
                    {relPost.titulo}
                  </h3>
                  <span className="text-[#a7adb4] text-xs">{relPost.tempo_leitura} min de leitura</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
      <WppFloat />
    </>
  )
}
