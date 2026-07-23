import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WppFloat from '@/components/WppFloat'
import { imoveis } from '@/data/imoveis'

// Cidades com pelo menos 1 combinação cidade+bairro com 2+ empreendimentos reais
// (ver BAIRROS_POR_CIDADE) — chaves consistentes com /lancamentos/[cidade].
const CIDADES: Record<string, { nome: string; uf: string }> = {
  'criciuma-sc': { nome: 'Criciúma', uf: 'SC' },
  'icara-sc': { nome: 'Içara', uf: 'SC' },
  'balneario-rincao-sc': { nome: 'Balneário Rincão', uf: 'SC' },
  'laguna-sc': { nome: 'Laguna', uf: 'SC' },
  'sideropolis-sc': { nome: 'Siderópolis', uf: 'SC' },
}

// Só geramos página para combinações cidade+bairro com 2+ empreendimentos reais —
// bairros com 1 único empreendimento renderizariam conteúdo quase idêntico à própria
// página do empreendimento (risco de conteúdo fino/duplicado para o Google).
// slug do bairro -> nome real (bate com o campo `bairro` de @/data/imoveis).
const BAIRROS_POR_CIDADE: Record<string, Record<string, string>> = {
  'criciuma-sc': { centro: 'Centro' },
  'icara-sc': { centro: 'Centro' },
  'balneario-rincao-sc': { centro: 'Centro' },
  'laguna-sc': { 'mar-grosso': 'Mar Grosso' },
  'sideropolis-sc': { centro: 'Centro' },
}

type Props = { params: Promise<{ cidade: string; bairro: string }> }

function formatPreco(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valor)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade, bairro } = await params
  const cidadeInfo = CIDADES[cidade]
  const nomeBairro = BAIRROS_POR_CIDADE[cidade]?.[bairro]
  if (!cidadeInfo || !nomeBairro) return {}
  const nomeCidade = cidadeInfo.nome

  return {
    title: `Lançamentos no ${nomeBairro}, ${nomeCidade}/SC`,
    description: `Encontre os melhores lançamentos imobiliários no bairro ${nomeBairro} em ${nomeCidade}/SC. Apartamentos com financiamento direto da Construtora Fontana, com Stiven Allan, CRECI 60.275.`,
    alternates: {
      canonical: `https://stivenallan.com.br/lancamentos/${cidade}/${bairro}`,
    },
    openGraph: {
      title: `Lançamentos no ${nomeBairro}, ${nomeCidade}/SC | Stiven Allan`,
      description: `Imóveis e lançamentos no ${nomeBairro} em ${nomeCidade}. Consulte Stiven Allan, seu corretor especialista.`,
    },
    twitter: { card: 'summary_large_image', title: `Lançamentos no ${nomeBairro}, ${nomeCidade}/SC | Stiven Allan` },
  }
}

export async function generateStaticParams() {
  return Object.entries(BAIRROS_POR_CIDADE).flatMap(([cidade, bairros]) =>
    Object.keys(bairros).map((bairro) => ({ cidade, bairro })),
  )
}

const STATUS_LABELS: Record<string, string> = {
  'na planta': 'Na Planta',
  'em obras': 'Em Obras',
  'pronto': 'Pronto para Morar',
  'entregue': 'Entregue',
  'sob consulta': 'Sob Consulta',
}

const STATUS_COLORS: Record<string, string> = {
  'na planta': 'bg-[#c9a24b] text-[#121315]',
  'em obras': 'bg-blue-500/20 text-blue-400',
  'pronto': 'bg-green-500/20 text-green-400',
  'entregue': 'bg-white/10 text-white',
  'sob consulta': 'bg-white/10 text-white',
}

function getEmpreendimentosPorBairro(nomeCidade: string, nomeBairro: string) {
  return imoveis.filter((im) => im.cidade === nomeCidade && im.bairro === nomeBairro && im.ativo)
}

export default async function BairroPage({ params }: Props) {
  const { cidade, bairro } = await params
  const cidadeInfo = CIDADES[cidade]
  const nomeBairro = BAIRROS_POR_CIDADE[cidade]?.[bairro]

  if (!cidadeInfo || !nomeBairro) {
    return (
      <>
        <Header />
        <section className="pt-32 pb-16 bg-[#1a1c1f] text-center">
          <div className="container mx-auto px-6">
            <h1 className="text-3xl font-extrabold mb-4">Bairro não encontrado</h1>
            <Link href="/empreendimentos" className="text-[#c9a24b]">Ver todos os empreendimentos</Link>
          </div>
        </section>
        <Footer />
        <WppFloat />
      </>
    )
  }

  const nomeCidade = cidadeInfo.nome
  const empreendimentos = getEmpreendimentosPorBairro(nomeCidade, nomeBairro)

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://stivenallan.com.br' },
      { '@type': 'ListItem', position: 2, name: `Lançamentos ${nomeCidade}`, item: `https://stivenallan.com.br/lancamentos/${cidade}` },
      { '@type': 'ListItem', position: 3, name: `Bairro ${nomeBairro}`, item: `https://stivenallan.com.br/lancamentos/${cidade}/${bairro}` },
    ],
  }

  const schemaItemList = empreendimentos.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Lançamentos no ${nomeBairro}, ${nomeCidade}/SC`,
    numberOfItems: empreendimentos.length,
    itemListElement: empreendimentos.map((emp, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'RealEstateListing',
        name: emp.nome,
        url: `https://stivenallan.com.br/empreendimento/${emp.construtora_slug}/${emp.slug}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: nomeCidade,
          addressRegion: 'SC',
          addressCountry: 'BR',
          streetAddress: nomeBairro,
        },
      },
    })),
  } : null

  const outrosBairros = Object.entries(BAIRROS_POR_CIDADE[cidade] ?? {}).filter(([slug]) => slug !== bairro)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }}
      />
      {schemaItemList && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaItemList) }}
        />
      )}

      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#1a1c1f]">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-[#a7adb4] mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#c9a24b] transition-colors">Início</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/lancamentos/${cidade}`} className="hover:text-[#c9a24b] transition-colors">
              Lançamentos {nomeCidade}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#f4f4f4]">{nomeBairro}</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Lançamentos no{' '}
            <span className="text-[#c9a24b]">{nomeBairro}</span>
            {', '}
            <span className="text-white">{nomeCidade}/SC</span>
          </h1>
          <p className="text-[#a7adb4] text-lg max-w-2xl">
            Encontre os melhores apartamentos no bairro {nomeBairro} em {nomeCidade}.
            Lançamentos da Construtora Fontana com financiamento direto, sem banco,
            com Stiven Allan, CRECI 60.275.
          </p>
          {empreendimentos.length > 0 && (
            <p className="mt-4 text-[#c9a24b] font-semibold">
              {empreendimentos.length} empreendimento{empreendimentos.length > 1 ? 's' : ''} encontrado{empreendimentos.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>

      {/* Listagem */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {empreendimentos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#a7adb4] text-lg mb-4">
                Ainda não há empreendimentos cadastrados para o bairro{' '}
                <strong className="text-white">{nomeBairro}</strong>.
              </p>
              <p className="text-[#a7adb4] mb-8">
                Fale comigo — tenho acesso a lançamentos exclusivos nesta região!
              </p>
              <Link
                href={`/lancamentos/${cidade}`}
                className="inline-block px-6 py-3 border border-[#c9a24b]/40 text-[#c9a24b] rounded-full hover:bg-[#c9a24b]/10 transition-colors"
              >
                Ver todos em {nomeCidade}
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {empreendimentos.map((emp) => (
                <article
                  key={emp.id}
                  className="bg-[#202327] border border-[#2c3035] rounded-2xl overflow-hidden hover:border-[#c9a24b]/30 transition-all group"
                >
                  <Link href={`/empreendimento/${emp.construtora_slug}/${emp.slug}`}>
                    <div className="relative h-52 bg-[#2c3035] overflow-hidden">
                      <Image
                        src={emp.img}
                        alt={`${emp.nome} — ${nomeBairro}, ${nomeCidade}/SC`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span
                        className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[emp.status] ?? 'bg-white/10 text-white'}`}
                      >
                        {STATUS_LABELS[emp.status] ?? emp.status}
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-[#a7adb4] text-xs mb-1">Apartamento · {nomeBairro}</p>
                      <h2 className="text-white font-bold text-lg mb-2 group-hover:text-[#c9a24b] transition-colors line-clamp-2">
                        {emp.nome}
                      </h2>
                      <p className="text-[#c9a24b] font-semibold text-sm">
                        {emp.exibir_preco && emp.preco ? `A partir de ${formatPreco(emp.preco)}` : 'Sob consulta'}
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 text-center bg-[#1a1c1f] border border-[#2c3035] rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-3">
              Quer conhecer outros imóveis no {nomeBairro}?
            </h2>
            <p className="text-[#a7adb4] mb-6">
              Tenho acesso a lançamentos exclusivos e posso te ajudar a encontrar o imóvel ideal.
            </p>
            <a
              href={`https://wa.me/5548991642332?text=Olá+Stiven!+Tenho+interesse+em+imóveis+no+${encodeURIComponent(nomeBairro)}+em+${encodeURIComponent(nomeCidade)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1f9d55] text-white font-bold px-8 py-4 rounded-full hover:bg-[#17854a] transition-colors"
            >
              Falar no WhatsApp
            </a>
          </div>

          {/* Internal linking — só bairros reais desta cidade, gerados de fato */}
          {outrosBairros.length > 0 && (
            <div className="mt-12">
              <h3 className="text-white font-semibold mb-4">Outros bairros em {nomeCidade}</h3>
              <div className="flex flex-wrap gap-2">
                {outrosBairros.map(([slug, nome]) => (
                  <Link
                    key={slug}
                    href={`/lancamentos/${cidade}/${slug}`}
                    className="px-4 py-2 bg-[#202327] border border-[#2c3035] rounded-full text-[#a7adb4] text-sm hover:border-[#c9a24b]/40 hover:text-[#c9a24b] transition-colors"
                  >
                    {nome}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WppFloat />
    </>
  )
}
