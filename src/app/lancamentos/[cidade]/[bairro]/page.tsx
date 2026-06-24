import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WppFloat from '@/components/WppFloat'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const CIDADES: Record<string, { nome: string; uf: string }> = {
  'criciuma': { nome: 'Criciúma', uf: 'SC' },
  'icara': { nome: 'Içara', uf: 'SC' },
  'nova-veneza': { nome: 'Nova Veneza', uf: 'SC' },
  'forquilhinha': { nome: 'Forquilhinha', uf: 'SC' },
  'cocal-do-sul': { nome: 'Cocal do Sul', uf: 'SC' },
}

type Props = { params: Promise<{ cidade: string; bairro: string }> }

function formatBairro(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatPreco(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valor)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade, bairro } = await params
  const cidadeInfo = CIDADES[cidade]
  const nomeBairro = formatBairro(bairro)
  const nomeCidade = cidadeInfo?.nome ?? cidade

  return {
    title: `Lançamentos no ${nomeBairro}, ${nomeCidade}/SC | Stiven Allan Corretor`,
    description: `Encontre os melhores lançamentos imobiliários no bairro ${nomeBairro} em ${nomeCidade}/SC. Apartamentos, casas e terrenos com Stiven Allan, CRECI/RS 60.275.`,
    alternates: {
      canonical: `https://stivenallan.com.br/lancamentos/${cidade}/${bairro}`,
    },
    openGraph: {
      title: `Lançamentos no ${nomeBairro}, ${nomeCidade}/SC`,
      description: `Imóveis e lançamentos no ${nomeBairro} em ${nomeCidade}. Consulte Stiven Allan, seu corretor especialista.`,
    },
  }
}

export const revalidate = 3600

interface Empreendimento {
  id: string
  nome: string
  slug: string
  cidade: string
  bairro: string | null
  uf: string
  tipo: string
  status: string
  preco_min: number | null
  preco_max: number | null
  fotos: string[]
  construtoras: { nome: string; slug: string } | null
}

async function getEmpreendimentosPorBairro(cidade: string, bairro: string): Promise<Empreendimento[]> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const nomeBairro = formatBairro(bairro)
    const { data } = await supabase
      .from('empreendimentos')
      .select('id, nome, slug, cidade, bairro, uf, tipo, status, preco_min, preco_max, fotos, construtoras(nome, slug)')
      .eq('cidade', cidade)
      .ilike('bairro', nomeBairro)
      .order('destaque', { ascending: false })
      .order('created_at', { ascending: false })
    return (data as Empreendimento[]) ?? []
  } catch {
    return []
  }
}

const STATUS_LABELS: Record<string, string> = {
  lancamento: 'Lançamento',
  em_obras: 'Em Obras',
  pronto: 'Pronto para Morar',
  breve_lancamento: 'Breve Lançamento',
}

const STATUS_COLORS: Record<string, string> = {
  lancamento: 'bg-[#c9a24b] text-[#121315]',
  em_obras: 'bg-blue-500/20 text-blue-400',
  pronto: 'bg-green-500/20 text-green-400',
  breve_lancamento: 'bg-purple-500/20 text-purple-400',
}

export default async function BairroPage({ params }: Props) {
  const { cidade, bairro } = await params
  const cidadeInfo = CIDADES[cidade]
  const nomeBairro = formatBairro(bairro)
  const nomeCidade = cidadeInfo?.nome ?? cidade

  const empreendimentos = await getEmpreendimentosPorBairro(cidade, bairro)

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
        url: `https://stivenallan.com.br/empreendimento/${emp.construtoras?.slug ?? 'construtora'}/${emp.slug}`,
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
            Encontre os melhores imóveis no bairro {nomeBairro} em {nomeCidade}. 
            Lançamentos, apartamentos, casas e terrenos com Stiven Allan, 
            seu corretor especialista na região sul catarinense.
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
                Ainda não há empreendimentos cadastrados para o bairro <strong className="text-white">{nomeBairro}</strong>.
              </p>
              <p className="text-[#a7adb4] mb-8">
                Fale comigo — tenho acesso a lançamentos exclusivos nesta região!
              </p>
              <Link
                href={`/lancamentos/${cidade}`}
                className="inline-block px-6 py-3 border border-[#c9a24b]/40 text-[#c9a24b] rounded-full hover:bg-[#c9a24b]/10 transition-colors mr-4"
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
                  <Link href={`/empreendimento/${emp.construtoras?.slug ?? 'construtora'}/${emp.slug}`}>
                    <div className="relative h-52 bg-[#2c3035] overflow-hidden">
                      {emp.fotos && emp.fotos.length > 0 ? (
                        <Image
                          src={emp.fotos[0]}
                          alt={`${emp.nome} — ${nomeBairro}, ${nomeCidade}/SC`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-[#a7adb4] text-sm">Sem foto</span>
                        </div>
                      )}
                      <span
                        className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[emp.status] ?? 'bg-white/10 text-white'}`}
                      >
                        {STATUS_LABELS[emp.status] ?? emp.status}
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-[#a7adb4] text-xs mb-1">{emp.tipo} · {nomeBairro}</p>
                      <h2 className="text-white font-bold text-lg mb-2 group-hover:text-[#c9a24b] transition-colors line-clamp-2">
                        {emp.nome}
                      </h2>
                      {(emp.preco_min || emp.preco_max) && (
                        <p className="text-[#c9a24b] font-semibold text-sm">
                          {emp.preco_min ? `A partir de ${formatPreco(emp.preco_min)}` : `Até ${formatPreco(emp.preco_max!)}`}
                        </p>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 text-center bg-[#1a1c1f] border border-[#2c3035] rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-3">Quer conhecer outros imóveis no {nomeBairro}?</h2>
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

          {/* Internal linking */}
          <div className="mt-12">
            <h3 className="text-white font-semibold mb-4">Outros bairros em {nomeCidade}</h3>
            <div className="flex flex-wrap gap-2">
              {['centro', 'universitario', 'santa-barbara', 'mina-do-mato', 'pio-correia', 'comerciario', 'michel', 'nossa-senhora-da-saude'].map((b) => (
                b !== bairro && (
                  <Link
                    key={b}
                    href={`/lancamentos/${cidade}/${b}`}
                    className="px-4 py-2 bg-[#202327] border border-[#2c3035] rounded-full text-[#a7adb4] text-sm hover:border-[#c9a24b]/40 hover:text-[#c9a24b] transition-colors"
                  >
                    {formatBairro(b)}
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WppFloat />
    </>
  )
}
