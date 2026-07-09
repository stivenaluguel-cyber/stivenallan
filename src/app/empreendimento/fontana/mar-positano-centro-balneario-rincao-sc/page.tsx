import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import GalleryWithLightbox, { LightboxPhoto } from './gallery-lightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

const WPP = "https://wa.me/5548991642332?text=Olá!%20Tenho%20interesse%20no%20Mar%20Positano%20Residencial%20em%20Balneário%20Rincão."
const CATALOGO_PDF = "https://estilofontana.com.br/upload/empreendimento/catalogo/mar-positano-residencial-1761677677.pdf"

const t = {
  bg: '#F5F2ED', ink: '#1A1A1A', navy: '#1B3A5B', navyDark: '#13293F',
  muted: '#6B6B6B', line: 'rgba(0,0,0,0.10)', dark: '#0D1B2A',
  onDark: '#F5F2ED', onDarkMuted: 'rgba(245,242,237,0.65)',
  display: "'Playfair Display', Georgia, serif",
  serif: "Georgia, serif",
  body: "'Inter', system-ui, sans-serif"
}

const IMG = {
  hero: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-positano-residencial-676db4dfc93f5.jpg',
  mapa: 'https://estilofontana.com.br/images/2025/01/08/mapa-mar-positano-677ea2e7cb00b.jpg',
  video: '',
  piscina: 'https://lh3.googleusercontent.com/d/1MLv9SV4J6njj6M68rllCnt3Zdl8yC67P',
}

const GALERIA = [
  { src: 'https://lh3.googleusercontent.com/d/1t2x0dC6MjAWmikfhuVMs9AThxa3erbuU', alt: 'Fachada Mar Positano Residencial', label: 'Fachada' },
  { src: 'https://lh3.googleusercontent.com/d/1jGWztQRIxnOoO93a9gk2D1R9wdvH-JkM', alt: 'Embasamento Mar Positano', label: 'Embasamento' },
  { src: 'https://lh3.googleusercontent.com/d/14YE_1MeqzKkvLohIMHfDK8tqj8RDC519', alt: 'Hall de entrada Mar Positano', label: 'Hall' },
  { src: 'https://lh3.googleusercontent.com/d/1xwly9oBLaqYyniuf4Wgf5e470msuIH2W', alt: 'Living integrado Mar Positano', label: 'Living' },
  { src: 'https://lh3.googleusercontent.com/d/1N2LtJDVSLe2SfE42BH1LwT25D4zHuAMv', alt: 'Sacada com churrasqueira Mar Positano', label: 'Sacada' },
  { src: 'https://lh3.googleusercontent.com/d/1zF8QOHOWNvH-f6lAOf1NcMa-YPZCvdtg', alt: 'Suíte master Mar Positano', label: 'Suíte' },
  { src: 'https://lh3.googleusercontent.com/d/1MLv9SV4J6njj6M68rllCnt3Zdl8yC67P', alt: 'Piscina Mar Positano', label: 'Piscina' },
  { src: 'https://lh3.googleusercontent.com/d/1O3EqgdcFgvEEZ2PObrGVQDo5AVwR93V6', alt: 'Quiosque Mar Positano', label: 'Quiosque' },
  { src: 'https://lh3.googleusercontent.com/d/1RNQUwH-xTbtkNeyIUKCqoNaB51tZ8e-6', alt: 'Salão de festas Mar Positano', label: 'Salão de Festas' },
]

const DIFERENCIAIS = [
  'Apartamentos de 107 a 126 m² com planta inteligente',
  'Sacada com churrasqueira em todos os apartamentos',
  'Suíte master com closet',
  'Cozinha integrada ao living para amplidam',
  'Acabamentos de alto padrão selecionados',
  'Localização privilegiada no Centro de Balneário Rincão',
  'Construtora Fontana — tradição e qualidade comprovadas',
  'Financiamento direto com a Construtora Fontana',
]

const AMENIDADES = [
  'Piscina adulto e infantil',
  'Quiosque com churrasqueira',
  'Salão de festas',
  'Hall de entrada sofisticado',
  'Playground',
  'Espaço fitness',
]

export const metadata: Metadata = {
  title: 'Mar Positano Residencial | Apartamentos em Balneário Rincão SC | Fontana',
  description: 'Mar Positano Residencial: apartamentos de 3 dormitórios (1 suíte), 107 a 126 m², no Centro de Balneário Rincão/SC. Sacada com churrasqueira, piscina e lazer completo. Consulte condições.',
  alternates: { canonical: `${SITE_URL}/empreendimento/fontana/mar-positano-centro-balneario-rincao-sc` },
  openGraph: {
    title: 'Mar Positano Residencial | Balneário Rincão SC | Stiven Allan',
    description: 'Apartamentos de 3 dormitórios com suíte, 107 a 126 m², no Centro de Balneário Rincão. Lazer completo e financiamento facilitado.',
    url: `${SITE_URL}/empreendimento/fontana/mar-positano-centro-balneario-rincao-sc`,
    images: [{ url: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-positano-residencial-676db4dfc93f5.jpg', width: 1200, height: 630, alt: 'Mar Positano Residencial' }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Mar Positano Residencial | Balneário Rincão SC | Stiven Allan', description: 'Apartamentos 3 dorms (1 suíte), 107–126 m². Centro de Balneário Rincão.' },
  robots: { index: true, follow: true },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'RealEstateListing',
      name: 'Mar Positano Residencial',
      description: 'Apartamentos de 3 dormitórios (1 suíte), 107 a 126 m², no Centro de Balneário Rincão/SC. Sacada com churrasqueira, piscina e lazer completo.',
      url: `${SITE_URL}/empreendimento/fontana/mar-positano-centro-balneario-rincao-sc`,
      image: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-positano-residencial-676db4dfc93f5.jpg',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rua Waldemar Carlos Petrini, esq. Rua Espírito Santo',
        addressLocality: 'Balneário Rincão',
        addressRegion: 'SC',
        addressCountry: 'BR',
      },
      offers: { '@type': 'Offer', availability: 'https://schema.org/PreOrder', priceCurrency: 'BRL', description: 'Sob consulta' },
    },
    {
      '@type': 'LocalBusiness',
      name: 'Stiven Allan',
      url: SITE_URL,
      telephone: '+5548991642332',
      address: { '@type': 'PostalAddress', addressLocality: 'Criciúma', addressRegion: 'SC', addressCountry: 'BR' },
    },
  ],
}

export default function Page() {
  return (
    <main style={{ fontFamily: t.body, background: t.bg, color: t.ink, overflowX: 'hidden' }}>
<PropertySchema nome="Mar Positano Residencial" slug="mar-positano-centro-balneario-rincao-sc" construtora_slug="fontana" cidade="Balneário Rincão" uf="SC" bairro="Centro" descricao="Mar Positano Residencial — apartamentos 3 dormitórios com suíte, 107 a 126 m² privativos no Centro de Balneário Rincão/SC. Financiamento direto Fontana." imagem="https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/mar-positano-centro-balneario-rincao-sc.jpg" faq={[{"pergunta":"Como funciona o financiamento direto do Mar Positano Residencial?","resposta":"Entrada de 20%, saldo em até 72 parcelas mensais e 6 reforços anuais (cada reforço equivale a 5 parcelas mensais), com correção pelo CUB/SC durante a obra. Sem análise de banco."},{"pergunta":"Qual a previsão de entrega do Mar Positano Residencial?","resposta":"A previsão de entrega é agosto de 2029, em Centro, Balneário Rincão/SC."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Sim. Além do financiamento direto com a construtora, é possível optar por financiamento bancário. Fale com o Stiven pelo WhatsApp para simular as duas opções."},{"pergunta":"Onde fica o Mar Positano Residencial?","resposta":"O Mar Positano Residencial está localizado na Rua Waldemar Carlos Petrini, esq. Rua Espírito Santo, no Centro de Balneário Rincão/SC."},{"pergunta":"Quais as plantas e metragens disponíveis?","resposta":"O empreendimento oferece apartamentos com 3 dormitórios (1 suíte), de 107 a 126 m² privativos, com sacada."}]} />

      <style>{`
        html { scroll-behavior: smooth; }
        .mp-eyebrow { font-size:11px; letter-spacing:0.42em; text-transform:uppercase; }
        .mp-h1 { font-family:${t.display}; font-weight:300; text-transform:uppercase; letter-spacing:0.14em; }
        .mp-h2 { font-family:${t.display}; font-weight:300; text-transform:uppercase; font-size:clamp(26px,4vw,46px); }
        .mp-cta { display:inline-block; letter-spacing:0.3em; border:1px solid; padding:16px 34px; text-decoration:none; }
        .mp-gcard { position:relative; overflow:hidden; }
        .mp-amen { display:flex; align-items:center; gap:12px; padding:14px 0; border-bottom:1px solid rgba(0,0,0,0.08); }
        .mp-amen::before { content:''; width:6px; height:6px; background:${t.navy}; border-radius:50%; flex-shrink:0; }
        .mp-lazer-card { position:relative; overflow:hidden; }
        .mp-wa { position:fixed; right:20px; bottom:20px; width:56px; height:56px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(0,0,0,0.25); z-index:200; }
        details.mp-menu > summary { list-style:none; }
        details.mp-menu > summary::-webkit-details-marker { display:none; }
      `}</style>

      {/* HEADER */}
      <header style={{ position:'absolute', top:0, left:0, right:0, zIndex:50, padding:'24px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/" style={{ color:'#fff', textDecoration:'none', fontFamily:t.display, fontWeight:300, fontSize:18, letterSpacing:'0.12em' }}>
          STIVEN ALLAN
        </Link>
        <nav style={{ display:'flex', gap:32, alignItems:'center' }}>
          <Link href="/#empreendimentos" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:12, letterSpacing:'0.24em', textTransform:'uppercase' }}>Empreendimentos</Link>
          <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:12, letterSpacing:'0.24em', textTransform:'uppercase' }}>Contato</a>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ position:'relative', height:'100vh', minHeight:560, display:'flex', alignItems:'flex-end' }}>
        <Image src={IMG.hero} alt="Mar Positano Residencial — Balneário Rincão SC" fill priority sizes="100vw" style={{ objectFit:'cover', objectPosition:'center' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(13,27,42,0.72) 0%, rgba(13,27,42,0.18) 55%, transparent 100%)' }} />
        <div style={{ position:'relative', padding:'0 32px 64px', maxWidth:760 }}>
          <p className="mp-eyebrow" style={{ color:'rgba(255,255,255,0.7)', marginBottom:16 }}>Centro · Balneário Rincão / SC</p>
          <h1 className="mp-h1" style={{ color:'#fff', fontSize:'clamp(32px,5vw,64px)', lineHeight:1.1, margin:'0 0 16px' }}>Mar Positano<br/>Residencial</h1>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'clamp(15px,2vw,18px)', fontFamily:t.serif, fontStyle:'italic', marginBottom:36 }}>
            Um verdadeiro mergulho em sensações únicas.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="mp-cta" style={{ color:'#fff', borderColor:'rgba(255,255,255,0.6)', fontSize:11, letterSpacing:'0.3em', textTransform:'uppercase' }}>
            Quero Saber Mais
          </a>
        </div>
      </section>

      {/* RESIDENCIAL */}
      <section style={{ padding:'96px 32px', maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
        <div>
          <p className="mp-eyebrow" style={{ color:t.navy, marginBottom:20 }}>O Empreendimento</p>
          <h2 className="mp-h2" style={{ color:t.ink, margin:'0 0 28px' }}>As Residências</h2>
          <p style={{ color:t.muted, lineHeight:1.8, marginBottom:24 }}>
            O Mar Positano entrega apartamentos de <strong>3 dormitórios</strong> com 1 suíte, em plantas de <strong>107 a 126 m²</strong>, no coração do Centro de Balneário Rincão. Cada unidade conta com sacada com churrasqueira, cozinha integrada ao living e acabamentos criteriosamente selecionados.
          </p>
          <ul style={{ listStyle:'none', padding:0, margin:'0 0 36px', display:'flex', flexDirection:'column', gap:10 }}>
            {['3 dormitórios · 1 suíte master com closet','107 a 126 m² de área privativa','Sacada com churrasqueira','Cozinha integrada ao living','2 vagas de garagem','Área de serviço completa'].map((f,i) => (
              <li key={i} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:t.ink }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:t.navy, flexShrink:0, display:'inline-block' }} />
                {f}
              </li>
            ))}
          </ul>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="mp-cta" style={{ color:t.navy, borderColor:t.navy, fontSize:11, textTransform:'uppercase' }}>
            Consultar Condições
          </a>
        </div>
        <div style={{ position:'relative', aspectRatio:'3/4', borderRadius:2, overflow:'hidden' }}>
          <Image src={IMG.piscina} alt="Área de lazer Mar Positano" fill sizes="(max-width:768px) 100vw, 50vw" style={{ objectFit:'cover' }} />
        </div>
      </section>

      {/* GALERIA */}
      <section style={{ background:'#fff', padding:'96px 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p className="mp-eyebrow" style={{ color:t.navy, marginBottom:20 }}>Galeria</p>
          <h2 className="mp-h2" style={{ color:t.ink, margin:'0 0 48px' }}>Perspectivas</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            <GalleryWithLightbox galeria={GALERIA} prefix="mp" gradient="rgba(13,27,42,0.55)" />
          </div>
        </div>
      </section>

      {/* PLANTAS */}
      <section style={{ background:t.dark, padding:'96px 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p className="mp-eyebrow" style={{ color:t.onDarkMuted, marginBottom:20 }}>Plantas</p>
          <h2 className="mp-h2" style={{ color:t.onDark, margin:'0 0 16px' }}>Pavimentos & Tipologias</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:48, marginBottom:48 }}>
            <div>
              <p style={{ color:t.onDarkMuted, lineHeight:1.8, marginBottom:32 }}>
                Dois tipos de apartamento — <strong style={{ color:t.onDark }}>107 m²</strong> e <strong style={{ color:t.onDark }}>126 m²</strong> — com layouts que integram ambientes e maximizam a luminosidade natural.
              </p>
              <div style={{ display:'flex', gap:32 }}>
                {[['3', 'dormitórios'],['1', 'Suíte'],['126', 'm² máx']].map(([n, l]) => (
                  <div key={l}>
                    <p style={{ fontFamily:t.display, fontSize:40, fontWeight:300, color:t.onDark, margin:0 }}>{n}</p>
                    <p style={{ fontSize:11, letterSpacing:'0.3em', textTransform:'uppercase', color:t.onDarkMuted, margin:0 }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
              <LeadCaptureButton slug="mar-positano-centro-balneario-rincao-sc" construtora_slug="fontana" className="mp-cta"  propertyDisplayName="Mar Positano Residencial" />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
            {[
              { src:'https://lh3.googleusercontent.com/d/1vtqxF5YhLrMBkG9zpRaZ41mDLPJ0j_FF', alt:'Planta subsolo Mar Positano', label:'Subsolo' },
              { src:'https://lh3.googleusercontent.com/d/1tYeh2YknKyqA7wWL6aPWNrU02ruNCCwv', alt:'Planta térreo Mar Positano', label:'Térreo' },
              { src:'https://lh3.googleusercontent.com/d/1NFfweqWv-w4oK6O7WDZcSqf13Ii03eYJ', alt:'Planta 1º pavimento Mar Positano', label:'1º Pavimento' },
              { src:'https://lh3.googleusercontent.com/d/1pOqr8BjjOfY-bp5WA0OjZDNju3KMNZc-', alt:'Planta tipo 303 Mar Positano', label:'Tipo 303' },
              { src:'https://lh3.googleusercontent.com/d/1gIU5_dqL4ntat5HuQJ0UV_BEUKD4riNx', alt:'Planta tipo 401 Mar Positano', label:'Tipo 401' },
              { src:'https://lh3.googleusercontent.com/d/1hD8CHaNoV4cBx62vh5ePssVCueaSPTxl', alt:'Planta tipo 403 Mar Positano', label:'Tipo 403' },
              { src:'https://lh3.googleusercontent.com/d/19V31YHxwjUTaWJj-GHhJAW65dvbHWZmG', alt:'Planta tipo 501 Mar Positano', label:'Tipo 501' },
              { src:'https://lh3.googleusercontent.com/d/1s8g-ZVWgjn6s6HyvhR-NjWu3aGlG4u2m', alt:'Planta tipo 503 Mar Positano', label:'Tipo 503' },
            ].map((p) => (
              <LightboxPhoto key={p.label} src={p.src} alt={p.alt} label={p.label} cardClass="mp-lazer-card" imgSizes="(max-width:768px) 50vw, 25vw" />
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section style={{ padding:'96px 32px', maxWidth:1100, margin:'0 auto' }}>
        <p className="mp-eyebrow" style={{ color:t.navy, marginBottom:20 }}>Por que escolher</p>
        <h2 className="mp-h2" style={{ color:t.ink, margin:'0 0 56px' }}>Diferenciais</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'28px 64px' }}>
          {DIFERENCIAIS.map((d, i) => (
            <div key={i} style={{ display:'flex', gap:24, alignItems:'flex-start' }}>
              <span style={{ fontFamily:t.display, fontSize:32, fontWeight:300, color:t.navy, lineHeight:1, flexShrink:0 }}>{String(i+1).padStart(2,'0')}</span>
              <p style={{ margin:0, fontSize:15, lineHeight:1.7, color:t.ink }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LAZER */}
      <section style={{ background:'#fff', padding:'96px 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p className="mp-eyebrow" style={{ color:t.navy, marginBottom:20 }}>Area de Lazer</p>
          <h2 className="mp-h2" style={{ color:t.ink, margin:'0 0 48px' }}>Infraestrutura Completa</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start' }}>
            <div>
              {AMENIDADES.map((a,i) => (
                <div key={i} className="mp-amen">
                  <span style={{ fontSize:14, color:t.ink }}>{a}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <LightboxPhoto src="https://lh3.googleusercontent.com/d/1MLv9SV4J6njj6M68rllCnt3Zdl8yC67P" alt="Piscina Mar Positano" label="Piscina" cardClass="mp-lazer-card" imgSizes="(max-width:768px) 50vw, 25vw" />
              <LightboxPhoto src="https://lh3.googleusercontent.com/d/1O3EqgdcFgvEEZ2PObrGVQDo5AVwR93V6" alt="Quiosque Mar Positano" label="Quiosque" cardClass="mp-lazer-card" imgSizes="(max-width:768px) 50vw, 25vw" />
              <LightboxPhoto src="https://lh3.googleusercontent.com/d/1RNQUwH-xTbtkNeyIUKCqoNaB51tZ8e-6" alt="Salão de festas Mar Positano" label="Salão de Festas" cardClass="mp-lazer-card" imgSizes="(max-width:768px) 50vw, 25vw" />
              <LightboxPhoto src="https://lh3.googleusercontent.com/d/14YE_1MeqzKkvLohIMHfDK8tqj8RDC519" alt="Hall Mar Positano" label="Hall" cardClass="mp-lazer-card" imgSizes="(max-width:768px) 50vw, 25vw" />
            </div>
          </div>
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section style={{ padding:'96px 32px', maxWidth:1100, margin:'0 auto' }}>
        <p className="mp-eyebrow" style={{ color:t.navy, marginBottom:20 }}>Localização</p>
        <h2 className="mp-h2" style={{ color:t.ink, margin:'0 0 12px' }}>Centro de Balneário Rincão</h2>
        <p style={{ color:t.muted, marginBottom:40 }}>Rua Waldemar Carlos Petrini, esq. Rua Espírito Santo — Balneário Rincão / SC</p>
        <div style={{ position:'relative', aspectRatio:'16/7', overflow:'hidden', borderRadius:2 }}>
          <Image src={IMG.mapa} alt="Mapa localização Mar Positano Balneário Rincão" fill sizes="(max-width:768px) 100vw, 1100px" style={{ objectFit:'cover' }} />
        </div>
      </section>

      {/* FINANCIAMENTO */}
      <section style={{ background:t.dark, padding:'96px 32px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <p className="mp-eyebrow" style={{ color:t.onDarkMuted, marginBottom:20 }}>Financiamento</p>
          <h2 className="mp-h2" style={{ color:t.onDark, margin:'0 0 24px' }}>Financiamento Direto com a Fontana</h2>
          <p style={{ color:t.onDarkMuted, fontSize:16, lineHeight:1.8, marginBottom:48, maxWidth:640, margin:'0 auto 48px' }}>
            A Construtora Fontana oferece financiamento direto, sem burocracia de banco. Parcelas que cabem no seu bolso, atendimento personalizado e condições especiais para quem compra na planta.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="mp-cta" style={{ color:t.onDark, borderColor:'rgba(245,242,237,0.4)', fontSize:11, textTransform:'uppercase' }}>
            Consultar Condições
          </a>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ position:'relative', minHeight:480, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        <Image src={IMG.hero} alt="Mar Positano Residencial" fill sizes="100vw" style={{ objectFit:'cover', objectPosition:'center top' }} />
        <div style={{ position:'absolute', inset:0, background:'rgba(13,27,42,0.70)' }} />
        <div style={{ position:'relative', textAlign:'center', padding:'0 32px' }}>
          <h2 className="mp-h2" style={{ color:'#fff', margin:'0 0 16px' }}>Mar Positano Residencial</h2>
          <p style={{ color:'rgba(255,255,255,0.75)', marginBottom:40, fontFamily:t.serif, fontStyle:'italic', fontSize:18 }}>Preço sob consulta · Balneário Rincão / SC</p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="mp-cta" style={{ color:'#fff', borderColor:'rgba(255,255,255,0.6)', fontSize:11, textTransform:'uppercase' }}>
            Falar com Stiven Allan
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:t.navyDark, padding:'48px 32px', textAlign:'center' }}>
        <p style={{ color:t.onDarkMuted, fontSize:12, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Stiven Allan</p>
        <p style={{ color:t.onDarkMuted, fontSize:11, margin:'0 0 4px' }}>CRECI 60.275</p>
        <p style={{ color:t.onDarkMuted, fontSize:11, margin:0 }}>Balneário Rincão · SC</p>
        <div style={{ marginTop:24 }}>
          <Link href="/" style={{ color:t.onDarkMuted, fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', textDecoration:'none' }}>← Todos os Empreendimentos</Link>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <a href={WPP} target="_blank" rel="noopener noreferrer" className="mp-wa" aria-label="WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.528 5.855L.057 23.117a.75.75 0 0 0 .917.913l5.352-1.483A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.952 9.952 0 0 1-5.127-1.416l-.367-.217-3.785 1.048 1.015-3.7-.239-.381A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>

{/* SEO FAQ */}
<PropertyFAQ items={[{"pergunta":"Como funciona o financiamento direto do Mar Positano Residencial?","resposta":"Entrada de 20%, saldo em até 72 parcelas mensais e 6 reforços anuais (cada reforço equivale a 5 parcelas mensais), com correção pelo CUB/SC durante a obra. Sem análise de banco."},{"pergunta":"Qual a previsão de entrega do Mar Positano Residencial?","resposta":"A previsão de entrega é agosto de 2029, em Centro, Balneário Rincão/SC."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Sim. Além do financiamento direto com a construtora, é possível optar por financiamento bancário. Fale com o Stiven pelo WhatsApp para simular as duas opções."},{"pergunta":"Onde fica o Mar Positano Residencial?","resposta":"O Mar Positano Residencial está localizado na Rua Waldemar Carlos Petrini, esq. Rua Espírito Santo, no Centro de Balneário Rincão/SC."},{"pergunta":"Quais as plantas e metragens disponíveis?","resposta":"O empreendimento oferece apartamentos com 3 dormitórios (1 suíte), de 107 a 126 m² privativos, com sacada."}]} accent="#1B3A5B" />
<RelatedProperties atualSlug="mar-positano-centro-balneario-rincao-sc" cidade="Balneário Rincão" />


    </main>
  )
}
