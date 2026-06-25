import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WppFloat from '@/components/WppFloat'
import { getSupabaseClient } from '@/lib/supabase'

export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'
const WPP_DEFAULT = '5548991642332'

type Props = { params: Promise<{ construtora: string; slug: string }> }

async function getEmpreendimento(slug: string) {
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
  const emp = await getEmpreendimento(slug)
  const nome = emp?.nome || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const cidade = emp?.cidade || 'Criciuma'
  const desc = emp?.descricao_curta || ('Empreendimento de alto padrao em ' + cidade + '/SC. Consulte Stiven Allan, CRECI/RS 60.275.')
  const imgUrl = emp?.imagem_capa_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
  const url = SITE_URL + '/empreendimento/' + construtora + '/' + slug
  return {
    title: nome + ' | Empreendimento em ' + cidade + '/SC | Stiven Allan',
    description: desc,
    alternates: { canonical: url },
    openGraph: { title: nome, description: desc, url, siteName: 'Stiven Allan Corretor', locale: 'pt_BR', type: 'website', images: [{ url: imgUrl, width: 1200, height: 630, alt: nome }] },
  }
}

export default async function EmpreendimentoPage({ params }: Props) {
  const { construtora, slug } = await params
  const emp = await getEmpreendimento(slug)

  const nome = emp?.nome || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const construtoraNome = emp?.construtora || construtora.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const cidade = emp?.cidade || 'Criciuma'
  const bairro = emp?.bairro || ''
  const descricao = emp?.descricao_completa || emp?.descricao_curta || ('O ' + nome + ' e um empreendimento de alto padrao em ' + cidade + '/SC, desenvolvido pela ' + construtoraNome + '.')
  const preco = emp?.preco_a_partir_de
  const imgCapa = emp?.imagem_capa_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
  const imagens: string[] = emp?.imagens_urls || []
  const statusObra = emp?.status_obra || 'lancamento'
  const wppNum = emp?.whatsapp || WPP_DEFAULT
  const url = SITE_URL + '/empreendimento/' + construtora + '/' + slug

  const statusLabel: Record<string, string> = {
    lancamento: 'Lancamento',
    em_obras: 'Em Obras',
    pronto: 'Pronto para Morar',
  }

  const schemaListing = {
    '@context': 'https://schema.org', '@type': 'RealEstateListing',
    name: nome, description: descricao, url,
    image: imgCapa,
    address: { '@type': 'PostalAddress', streetAddress: emp?.endereco || bairro, addressLocality: cidade, addressRegion: emp?.uf || 'SC', addressCountry: 'BR' },
    offers: { '@type': 'Offer', priceCurrency: 'BRL', price: preco, availability: 'https://schema.org/InStock' },
  }
  const schemaBreadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Lancamentos ' + cidade, item: SITE_URL + '/lancamentos/criciuma-sc' },
      { '@type': 'ListItem', position: 3, name: nome, item: url },
    ],
  }
  const schemaAgent = {
    '@context': 'https://schema.org', '@type': 'RealEstateAgent',
    name: 'Stiven Allan', description: 'Corretor de imoveis em Criciuma/SC. CRECI/RS 60.275.',
    url: SITE_URL, telephone: '+5548991642332',
    address: { '@type': 'PostalAddress', addressLocality: 'Criciuma', addressRegion: 'SC', addressCountry: 'BR' },
  }

  const C = { bg: '#121315', bg2: '#1a1c1f', card: '#202327', accent: '#c9a24b', accent2: '#e2c275', green: '#1f9d55', text: '#f4f4f4', muted: '#a7adb4', border: '#2c3035' }
  const wppLink = 'https://api.whatsapp.com/send?phone=' + wppNum + '&text=Ol%C3%A1%20Stiven!%20Tenho%20interesse%20no%20' + encodeURIComponent(nome) + '.'

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaListing) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaAgent) }} />
      <style>{`.slug-grid { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; } .slug-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 24px; } .slug-specs { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; } @media (max-width: 900px) { .slug-grid { grid-template-columns: 1fr; } .slug-gallery { grid-template-columns: repeat(2, 1fr); } }`}</style>
      <Header />
      <main style={{ paddingTop: '80px', background: C.bg, minHeight: '100vh' }}>
        <nav aria-label="Breadcrumb" style={{ padding: '16px 24px', borderBottom: '1px solid ' + C.border, background: C.bg2 }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <ol style={{ display: 'flex', gap: '8px', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap', alignItems: 'center' }}>
              <li><Link href="/" style={{ color: C.muted, fontSize: '13px', textDecoration: 'none' }}>Inicio</Link></li>
              <li style={{ color: C.border }}>/</li>
              <li><Link href="/lancamentos/criciuma-sc" style={{ color: C.muted, fontSize: '13px', textDecoration: 'none' }}>{'Lancamentos ' + cidade}</Link></li>
              <li style={{ color: C.border }}>/</li>
              <li style={{ color: C.accent, fontSize: '13px', fontWeight: 600 }}>{nome}</li>
            </ol>
          </div>
        </nav>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ background: statusObra === 'lancamento' ? C.accent : statusObra === 'em_obras' ? '#2563eb' : C.green, color: statusObra === 'lancamento' ? '#1a1305' : '#fff', fontSize: '11px', fontWeight: 700, padding: '6px 16px', borderRadius: '50px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {statusLabel[statusObra] || statusObra}
            </span>
          </div>
          <p style={{ color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>{construtoraNome}</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: C.text, marginBottom: '6px', lineHeight: 1.1 }}>{nome}</h1>
          <p style={{ color: C.muted, marginBottom: '32px', fontSize: '15px' }}>{bairro ? bairro + ', ' : ''}{cidade}/{emp?.uf || 'SC'}</p>
          <div className="slug-grid">
            <div>
              <div style={{ position: 'relative', height: '400px', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', background: C.card }}>
                <Image src={imgCapa} alt={nome + ' em ' + cidade + '/SC'} fill style={{ objectFit: 'cover' }} priority sizes="(max-width: 768px) 100vw, 66vw" />
              </div>
              {imagens.length > 0 && (
                <div className="slug-gallery">
                  {imagens.slice(0, 6).map((img, i) => (
                    <div key={i} style={{ position: 'relative', height: '120px', borderRadius: '10px', overflow: 'hidden', background: C.card }}>
                      <Image src={img} alt={nome + ' foto ' + (i + 1)} fill style={{ objectFit: 'cover' }} sizes="33vw" />
                    </div>
                  ))}
                </div>
              )}
              <div style={{ background: C.card, border: '1px solid ' + C.border, borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.text, marginBottom: '14px' }}>Sobre o Empreendimento</h2>
                <p style={{ color: C.muted, lineHeight: 1.75, fontSize: '15px' }}>{descricao}</p>
              </div>
              {(emp?.area_privativa_min || preco) && (
                <div style={{ background: C.card, border: '1px solid ' + C.border, borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.text, marginBottom: '20px' }}>Especificacoes</h2>
                  <div className="slug-specs">
                    {emp?.area_privativa_min && (
                      <div style={{ textAlign: 'center', padding: '16px', background: C.bg2, borderRadius: '12px' }}>
                        <b style={{ display: 'block', fontSize: '1.4rem', color: C.accent2, fontWeight: 900 }}>
                          {emp.area_privativa_min === emp.area_privativa_max ? emp.area_privativa_min : emp.area_privativa_min + '–' + emp.area_privativa_max}{'m²'}
                        </b>
                        <small style={{ color: C.muted, fontSize: '12px' }}>Area Privativa</small>
                      </div>
                    )}
                    {preco && (
                      <div style={{ textAlign: 'center', padding: '16px', background: C.bg2, borderRadius: '12px' }}>
                        <b style={{ display: 'block', fontSize: '1.2rem', color: C.accent2, fontWeight: 900 }}>{'R$ ' + preco.toLocaleString('pt-BR')}</b>
                        <small style={{ color: C.muted, fontSize: '12px' }}>A partir de</small>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div style={{ background: C.card, border: '1px solid ' + C.border, borderRadius: '16px', padding: '28px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.text, marginBottom: '12px' }}>Localizacao</h2>
                <p style={{ color: C.muted, marginBottom: '16px' }}>{emp?.endereco ? emp.endereco + ', ' : ''}{bairro ? bairro + ', ' : ''}{cidade} — {emp?.uf || 'SC'}</p>
                {emp?.maps_embed_url ? (
                  <iframe src={emp.maps_embed_url} width="100%" height="280" style={{ border: 0, borderRadius: '12px', display: 'block' }} allowFullScreen loading="lazy" title={'Localizacao ' + nome} />
                ) : (
                  <a href={'https://maps.google.com/?q=' + encodeURIComponent(nome + ' ' + cidade + ' SC')} target="_blank" rel="noopener noreferrer" style={{ color: C.accent, fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}>
                    Abrir no Google Maps
                  </a>
                )}
              </div>
            </div>
            <div style={{ position: 'sticky', top: '100px' }}>
              <div style={{ background: C.card, border: '1px solid ' + C.border, borderRadius: '20px', padding: '28px', marginBottom: '16px' }}>
                <p style={{ color: C.muted, fontSize: '13px', marginBottom: '6px' }}>Sobre {nome}</p>
                {preco && (
                  <p style={{ color: C.accent2, fontSize: '1.6rem', fontWeight: 900, marginBottom: '20px' }}>
                    {'R$ ' + preco.toLocaleString('pt-BR')}<small style={{ fontSize: '14px', fontWeight: 400, color: C.muted }}>{' /a partir de'}</small>
                  </p>
                )}
                <a href={wppLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: C.green, color: '#fff', fontWeight: 700, padding: '14px', borderRadius: '12px', textDecoration: 'none', fontSize: '15px', marginBottom: '10px' }}>
                  Mensagem no WhatsApp
                </a>
                <a href="tel:+5548991642332" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + C.border, color: C.text, fontWeight: 600, padding: '13px', borderRadius: '12px', textDecoration: 'none', fontSize: '14px' }}>
                  Ligar: (48) 99164-2332
                </a>
              </div>
              <div style={{ background: C.card, border: '1px solid ' + C.border, borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: C.bg2, border: '2px solid ' + C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: C.accent, fontSize: '16px', flexShrink: 0 }}>SA</div>
                  <div>
                    <p style={{ fontWeight: 800, color: C.text, fontSize: '15px', margin: 0 }}>Stiven Allan</p>
                    <p style={{ color: C.muted, fontSize: '12px', margin: 0 }}>CRECI/RS 60.275 - Especialista em Lancamentos</p>
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
