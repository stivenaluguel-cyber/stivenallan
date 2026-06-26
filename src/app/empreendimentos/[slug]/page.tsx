import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { c, font, brl, ui } from '@/lib/theme'
import Simulador from '@/components/Simulador'

export const revalidate = 3600

const WPP = 'https://wa.me/5548991642332'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

async function getEmpreendimento(slug: string) {
  const sb = getSupabase()
  const { data } = await sb.from('empreendimentos').select('*').eq('slug', slug).single()
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const emp = await getEmpreendimento(slug)
  if (!emp) return { title: 'Empreendimento | Stiven Allan' }
  const url = `${SITE_URL}/empreendimentos/${slug}`
  return {
    title: `${emp.nome} — ${emp.cidade}/${emp.uf} | Stiven Allan`,
    description: emp.descricao_curta || `${emp.nome} em ${emp.bairro || emp.cidade}/${emp.uf}. ${emp.preco_a_partir_de ? 'A partir de ' + brl(emp.preco_a_partir_de) + '.' : ''} Corretor Stiven Allan CRECI/RS 60.275.`,
    alternates: { canonical: url },
    openGraph: { title: emp.nome, description: emp.descricao_curta || '', url, images: emp.imagem_capa_url ? [{ url: emp.imagem_capa_url }] : [] },
  }
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const emp = await getEmpreendimento(slug)
  if (!emp) notFound()

  const url = `${SITE_URL}/empreendimentos/${slug}`
  const wppMsg = WPP + `?text=Ol%C3%A1+Stiven!+Tenho+interesse+no+${encodeURIComponent(emp.nome)}+em+${encodeURIComponent(emp.cidade)}.`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'RealEstateListing',
        name: emp.nome,
        url,
        description: emp.descricao_curta || emp.nome,
        image: emp.imagem_capa_url || undefined,
        address: { '@type': 'PostalAddress', streetAddress: emp.endereco || emp.bairro, addressLocality: emp.cidade, addressRegion: emp.uf, addressCountry: 'BR' },
        offers: emp.preco_a_partir_de ? { '@type': 'Offer', price: emp.preco_a_partir_de, priceCurrency: 'BRL', availability: 'https://schema.org/InStock' } : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Empreendimentos', item: SITE_URL + '/empreendimentos' },
          { '@type': 'ListItem', position: 3, name: emp.nome, item: url },
        ],
      },
    ],
  }

  const imagens: string[] = [
    ...(emp.imagem_capa_url ? [emp.imagem_capa_url] : []),
    ...(emp.imagens_urls || []),
  ].slice(0, 5)
  if (imagens.length === 0) imagens.push('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: c.paper, borderBottom: `1px solid ${c.line}`, padding: '0 clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: c.muted }}>
            <Link href="/" style={{ color: c.muted, textDecoration: 'none' }}>Início</Link>
            <span>/</span>
            <Link href="/lancamentos/criciuma-sc" style={{ color: c.muted, textDecoration: 'none' }}>Empreendimentos</Link>
            <span>/</span>
            <span style={{ color: c.ink, fontWeight: 600 }}>{emp.nome}</span>
          </nav>
          <a href={wppMsg} target="_blank" rel="noopener noreferrer" style={{ ...ui.btnConvert, fontSize: 13, padding: '10px 20px' }}>Reservar</a>
        </div>
      </nav>

      {/* HERO GALERIA */}
      <section style={{ background: c.charcoal }}>
        <div style={{ position: 'relative', height: 'clamp(280px,45vw,560px)', overflow: 'hidden' }}>
          <Image src={imagens[0]} alt={emp.nome + ' - ' + emp.cidade} fill priority quality={85} style={{ objectFit: 'cover' }} sizes="100vw" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(19,18,17,0.7) 100%)' }} />
        </div>
        {imagens.length > 1 && (
          <div style={{ display: 'flex', gap: 4, padding: '4px 0', overflowX: 'auto', background: c.charcoal }}>
            {imagens.slice(1).map((src, i) => (
              <div key={i} style={{ position: 'relative', height: 72, minWidth: 110, flexShrink: 0 }}>
                <Image src={src} alt={`${emp.nome} foto ${i + 2}`} fill style={{ objectFit: 'cover' }} sizes="110px" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RESUMO */}
      <section style={{ padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,40px)', background: c.paper }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(28px,4vw,56px)', alignItems: 'start' }}>
          <div>
            <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 12 }}>{emp.construtora || 'Construtora'} · {emp.status_obra || 'Lançamento'}</span>
            <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.8rem)', letterSpacing: '-0.03em', lineHeight: 1.1, color: c.ink, marginBottom: 12 }}>{emp.nome}</h1>
            <p style={{ fontSize: 15, color: c.muted, marginBottom: 20 }}>{emp.bairro ? emp.bairro + ', ' : ''}{emp.cidade}/{emp.uf}</p>
            {emp.descricao_curta && <p style={{ fontSize: 16, color: c.ink, lineHeight: 1.75, marginBottom: 24 }}>{emp.descricao_curta}</p>}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {emp.area_privativa_min && <div><div style={{ fontSize: 11, color: c.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Area</div><div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 16, color: c.ink }}>{emp.area_privativa_min === emp.area_privativa_max ? emp.area_privativa_min : emp.area_privativa_min + '–' + emp.area_privativa_max}m²</div></div>}
              {emp.total_unidades && <div><div style={{ fontSize: 11, color: c.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Unidades</div><div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 16, color: c.ink }}>{emp.total_unidades}</div></div>}
              {emp.previsao_entrega && <div><div style={{ fontSize: 11, color: c.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Entrega</div><div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 16, color: c.ink }}>{emp.previsao_entrega}</div></div>}
            </div>
          </div>

          {/* CARD DE PRECO */}
          <div style={{ background: c.charcoal, color: c.onDark, borderRadius: 4, padding: 'clamp(24px,3vw,32px)', position: 'sticky', top: 72 }}>
            {emp.preco_a_partir_de && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: c.onDarkMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>A partir de</div>
                <div style={{ fontFamily: font.display, fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 800, color: c.orange, letterSpacing: '-0.025em', lineHeight: 1 }}>{brl(emp.preco_a_partir_de)}</div>
              </div>
            )}
            <a href={wppMsg} target="_blank" rel="noopener noreferrer"
              style={{ ...ui.btnConvert, display: 'block', textAlign: 'center', width: '100%', marginBottom: 10, boxShadow: '0 8px 24px rgba(255,106,61,0.3)' }}>
              Quero Reservar
            </a>
            <a href={'#simulador'} style={{ ...ui.btnSecondary, display: 'block', textAlign: 'center', width: '100%', color: c.onDark, borderColor: c.lineDark }}>
              Simular Financiamento
            </a>
            <p style={{ fontSize: 12, color: c.onDarkMuted, marginTop: 14, textAlign: 'center', lineHeight: 1.5 }}>Atendimento personalizado pelo WhatsApp. Sem compromisso.</p>
          </div>
        </div>
      </section>

      {/* SIMULADOR */}
      <div style={{ background: c.surface, borderTop: `1px solid ${c.line}` }}>
        <Simulador
          valorInicial={emp.preco_a_partir_de || 850000}
          valorMin={emp.preco_a_partir_de ? Math.round(emp.preco_a_partir_de * 0.7) : 450000}
          valorMax={emp.preco_ate || (emp.preco_a_partir_de ? Math.round(emp.preco_a_partir_de * 2.5) : 2200000)}
          hrefReserva={wppMsg}
        />
      </div>

      {/* LOCALIZACAO */}
      {(emp.cidade || emp.bairro) && (
        <section style={{ padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,40px)', background: c.paper, borderTop: `1px solid ${c.line}` }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 12 }}>LOCALIZAÇÃO</span>
            <h2 style={{ ...ui.h2, color: c.ink, marginBottom: 20 }}>{emp.bairro ? emp.bairro + ', ' : ''}{emp.cidade}/{emp.uf}</h2>
            {emp.endereco && <p style={{ fontSize: 15, color: c.muted }}>{emp.endereco}</p>}
            {emp.maps_embed_url && (
              <div style={{ marginTop: 24, borderRadius: 4, overflow: 'hidden', border: `1px solid ${c.line}`, height: 320 }}>
                <iframe src={emp.maps_embed_url} width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA FOOTER */}
      <section style={{ background: c.charcoal, padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ ...ui.h2, color: c.onDark }}>Ficou interessado?</h2>
          <p style={{ color: c.onDarkMuted, marginTop: 16, fontSize: 15, lineHeight: 1.7 }}>Fale comigo pelo WhatsApp e receba todas as informações do {emp.nome}.</p>
          <a href={wppMsg} target="_blank" rel="noopener noreferrer" style={{ ...ui.btnConvert, marginTop: 28, display: 'inline-block', boxShadow: '0 8px 24px rgba(255,106,61,0.35)' }}>
            Falar com Stiven
          </a>
        </div>
      </section>
    </>
  )
}
