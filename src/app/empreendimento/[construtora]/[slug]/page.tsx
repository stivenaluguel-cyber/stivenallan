import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WppFloat from '@/components/WppFloat'
import { getSupabaseClient } from '@/lib/supabase'

export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'
const WPP = 'https://wa.me/5548991642332'

type Props = { params: Promise<{ construtora: string; slug: string }> }

async function getEmpreendimento(construtora: string, slug: string) {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('empreendimentos')
      .select('id, nome, slug, bairro, cidade, uf, status_obra, status_venda, construtora, descricao_curta, descricao_completa, preco_a_partir_de, area_privativa_min, area_privativa_max, imagem_capa_url, imagens_urls, whatsapp, endereco, maps_embed_url, previsao_entrega')
      .eq('slug', slug)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { construtora, slug } = await params
  const emp = await getEmpreendimento(construtora, slug)
  const nomeFormatado = emp?.nome || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const construtoraNome = emp?.construtora || construtora.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const desc = emp?.descricao_curta || 'Empreendimento de alto padrão em ' + (emp?.cidade || 'Criciúma') + '/SC. Consulte Stiven Allan, CRECI/RS 60.275.'
  const imgUrl = emp?.imagem_capa_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
  const url = SITE_URL + '/empreendimento/' + construtora + '/' + slug

  return {
    title: nomeFormatado + '  | Empreendimento em ' + (emp?.cidade || 'Criciúma') + '/SC | Stiven Allan',
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: nomeFormatado + ' | ' + construtoraNome + ' | ' + (emp?.cidade || 'Criciúma') + '/SC',
      description: desc,
      url,
      siteName: 'Stiven Allan Corretor',
      locale: 'pt_BR',
      type: 'website',
      images: [{ url: imgUrl, width: 1200, height: 630, alt: nomeFormatado }],
    },
  }
}

export default async function EmpreendimentoPage({ params }: Props) {
  const { construtora, slug } = await params
  const emp = await getEmpreendimento(construtora, slug)

  const nomeFormatado = emp?.nome || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const construtoraNome = emp?.construtora || construtora.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const cidade = emp?.cidade || 'Criciúma'
  const bairro = emp?.bairro || ''
  const descricao = emp?.descricao_completa || emp?.descricao_curta || 'O ' + nomeFormatado + ' é um empreendimento de alto padrão localizado em ' + cidade + '/SC, desenvolvido pela ' + construtoraNome + '. Com plantas modernas e infraestrutura completa, é a opção ideal para quem busca qualidade de vida ou investimento imobiliário no sul catarinense.'
  const preco = emp?.preco_a_partir_de
  const imgCapa = emp?.imagem_capa_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
  const imagens: string[] = emp?.imagens_urls || []
  const statusObra = emp?.status_obra || 'lancamento'
  const wppNum = emp?.whatsapp || '5548991642332'
  const url = SITE_URL + '/empreendimento/' + construtora + '/' + slug

  const statusLabel: Record<string, string> = {
    lancamento: 'Lançamento',
    em_obras: 'Em Obras',
    pronto: 'Pronto para Morar',
  }

  const schemaListing = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: nomeFormatado,
    description: descricao,
    url,
    image: imgCapa,
    address: {
      '@type': 'PostalAddress',
      streetAddress: emp?.endereco || bairro,
      addressLocality: cidade,
      addressRegion: emp?.uf || 'SC',
      addressCountry: 'BR',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: preco,
      availability: 'https://schema.org/InStock',
    },
  }

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Lançamentos ' + cidade, item: SITE_URL + '/lancamentos/' + cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-') + '-sc' },
      { '@type': 'ListItem', position: 3, name: nomeFormatado, item: url },
    ],
  }

  const schemaAgent = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Stiven Allan',
    description: 'Corretor de imóveis em Criciúma/SC e região. CRECI/RS 60.275.',
    url: SITE_URL,
    telephone: '+5548991642332',
    address: { '@type': 'PostalAddress', addressLocality: 'Criciúma', addressRegion: 'SC', addressCountry: 'BR' },
  }

  const C = {
    bg: '#121315', bg2: '#1a1c1f', card: '#202327',
    accent: '#c9a24b', accent2: '#e2c275', green: '#1f9d55',
    text: '#f4f4f4', muted: '#a7adb4', border: '#2c3035',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaListing) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaAgent) }} />
      <style>{'`.emp-main-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; } @media (max-width: 768px) { .emp-main-grid { grid-template-columns: 1fr 1fr; } } @media (max-width: 480px) { .emp-main-grid { grid-template-columns: 1fr; } }`'}</style>
      <Header />

      <main style={{ paddingTop: '80px', background: C.bg, minHeight: '100vh' }}>

        {/* BREADCRUMB */}
        <nav aria-label="Breadcrumb" style={{ padding: '16px 24px', borderBottom: '1px solid ' + C.border, background: C.bg2 }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <ol style={{ display: 'flex', gap: '8px', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap', alignItems: 'center' }}>
              <li><Link href="/" style={{ color: C.muted, fontSize: '13px', textDecoration: 'none' }}>Início</Link></li>
              <li style={{ color: C.border }}>/</li>
              <li><Link href={''/lancamentos/criciuma-sc'' as any} style={{ color: C.muted, fontSize: '13px', textDecoration: 'none' }}>Lançamentos {cidade}</Link></li>
              <li style={{ color: C.border }}>/</li>
              <li style={{ color: C.accent, fontSize: '13px', fontWeight: 600 }}>{nomeFormatado}</li>
            </ol>
          </div>
        </nav>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
          {/* Status badge */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{
              background: statusObra === 'lancamento' ? C.accent : statusObra === 'em_obras' ? '#2563eb' : C.green,
              color: statusObra === 'lancamento' ? '#1a1305' : '#fff',
              fontSize: '11px', fontWeight: 700, padding: '6px 16px', borderRadius: '50px',
              letterSpacing: '1px', textTransform: 'uppercase',
            }}>
              {statusLabel[statusObra] || statusObra}
            </span>
          </div>

          {/* Título */}
          <p style={{ color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>{construtoraNome}</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: C.text, marginBottom: '6px', lineHeight: 1.1 }}>{nomeFormatado}</h1>
          <p style={{ color: C.muted, marginBottom: '32px', fontSize: '15px' }}>{bairro ? bairro + ', ' : ''}{cidade}/{emp?.uf || 'SC'}</p>

          {/* Grid principal: foto + sidebar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>

            {/* Coluna esquerda */}
            <div>
              {/* Imagem capa */}
              <div style={{ position: 'relative', height: '400px', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', background: C.card }}>
                <Image
                  src={imgCapa}
                  alt={nomeFormatado + ' em ' + cidade + '/SC' }
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              </div>

              {/* Galeria extra se houver */}
              {imagens.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
                  {imagens.slice(0, 6).map((img, i) => (
                    <div key={i} style={{ position: 'relative', height: '120px', borderRadius: '10px', overflow: 'hidden', background: C.card }}>
                      <Image src={img} alt={nomeFormatado + ' foto ' + (i + 1)} fill style={{ objectFit: 'cover' }} sizes="33vw" />
                    </div>
                  ))}
                </div>
              )}

              {/* Sobre o empreendimento */}
              <div style={{ background: C.card, border: '1px solid ' + C.border, borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.text, marginBottom: '14px' }}>Sobre o Empreendimento</h2>
                <p style={{ color: C.muted, lineHeight: 1.75, fontSize: '15px' }}>{descricao}</p>
              </div>

              {/* Especificações */}
              {(emp?.area_privativa_min || preco) && (
                <div style={{ background: C.card, border: '1px solid ' + C.border, borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.text, marginBottom: '20px' }}>Especificações</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                    {emp?.area_privativa_min && (
                      <div style={{ textAlign: 'center', padding: '16px', background: C.bg2, borderRadius: '12px' }}>
                        <b style={{ display: 'block', fontSize: '1.4rem', color: C.accent2, fontWeight: 900 }}>
                          {emp.area_privativa_min === emp.area_privativa_max ? emp.area_privativa_min : emp.area_privativa_min + '–' + emp.area_privativa_max}m²
                        </b>
                        <small style={{ color: C.muted, fontSize: '12px' }}>Área Privativa</small>
                      </div>
                    )}
                    {preco && (
                      <div style={{ textAlign: 'center', padding: '16px', background: C.bg2, borderRadius: '12px' }}>
                        <b style={{ display: 'block', fontSize: '1.2rem', color: C.accent2, fontWeight: 900 }}>R$ {preco.toLocaleString('pt-BR')}</b>
                        <small style={{ color: C.muted, fontSize: '12px' }}>A partir de</small>
                      </div>
                    )}
                    {emp?.previsao_entrega && (
                      <div style={{ textAlign: 'center', padding: '16px', background: C.bg2, borderRadius: '12px' }}>
                        <b style={{ display: 'block', fontSize: '1.2rem', color: C.accent2, fontWeight: 900 }}>{new Date(emp.previsao_entrega).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</b>
                        <small style={{ color: C.muted, fontSize: '12px' }}>Previsão de Entrega</small>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Localização */}
              <div style={{ background: C.card, border: '1px solid ' + C.border, borderRadius: '16px', padding: '28px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.text, marginBottom: '12px' }}>Localização</h2>
                <p style={{ color: C.muted, marginBottom: '16px' }}>{emp?.endereco ? emp.endereco + ', ' : '' }{bairro ? bairro + ', ' : '' }{cidade} — {emp?.uf || 'SC'}</p>
                {emp?.maps_embed_url ? (
                  <iframe src={emp.maps_embed_url} width="100%" height="280" style={{ border: 0, borderRadius: '12px', display: 'block' }} allowFullScreen loading="lazy" title={'Localização ' + nomeFormatado} />
                ) : (
                  <a
                    href={'https://maps.google.com/?q=' + encodeURIComponent(nomeFormatado + ' ' + cidade + ' SC')}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: C.accent, fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Abrir no Google Maps →
                  </a>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ position: 'sticky', top: '100px' }}>
              <div style={{ background: C.card, border: '1px solid ' + C.border, borderRadius: '20px', padding: '28px', marginBottom: '16px' }}>
                <p style={{ color: C.muted, fontSize: '13px', marginBottom: '6px' }}>Sobre {nomeFormatado}</p>
                {preco && (
                  <p style={{ color: C.accent2, fontSize: '1.6rem', fontWeight: 900, marginBottom: '20px' }}>
                    R$ {preco.toLocaleString('pt-BR')}<small style={{ fontSize: '14px', fontWeight: 400, color: C.muted }}> /a partir de</small>
                  </p>
                )}
                <a
                  href={'https://api.whatsapp.com/send?phone=' + wppNum + '&text=Ol%C3%A1%20Stiven!%20Tenho%20interesse%20no%20' + encodeURIComponent(nomeFormatado) + '.'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    background: C.green, color: '#fff', fontWeight: 700,
                    padding: '14px', borderRadius: '12px', textDecoration: 'none',
                    fontSize: '15px', marginBottom: '10px',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Mensagem no WhatsApp
                </a>
                <a
                  href="tel:+5548991642332"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid ' + C.border, color: C.text, fontWeight: 600,
                    padding: '13px', borderRadius: '12px', textDecoration: 'none',
                    fontSize: '14px',
                  }}
                >
                  Ligar: (48) 99164-2332
                </a>
              </div>

              {/* Corretor box */}
              <div style={{ background: C.card, border: '1px solid ' + C.border, borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: C.bg2, border: '2px solid ' + C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: C.accent, fontSize: '16px', flexShrink: 0 }}>SA</div>
                  <div>
                    <p style={{ fontWeight: 800, color: C.text, fontSize: '15px', margin: 0 }}>Stiven Allan</p>
                    <p style={{ color: C.muted, fontSize: '12px', margin: 0 }}>CRECI/RS 60.275 · Especialista em Lançamentos</p>
                  </div>
                </div>
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
