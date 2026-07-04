import type { Metadata } from 'next'
import Image from 'next/image'
import GalleryWithLightbox, { LightboxPhoto } from './gallery-lightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

// Hotsite premium Lavis Residencial (Fontana, Centro de Criciuma/SC). Padrao EPIC — benchmark Aguas de Marano.
// WhatsApp do corretor Stiven (NAO usar numeros internos da Fontana).
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Lavis%20Residencial.'
const CATALOGO_PDF = 'https://estilofontana.com.br/upload/empreendimento/catalogo/lavis-residencial-1764352426.pdf'

const t = {
  bg: '#FAFAF8',
  ink: '#201610',
  terra: '#B0734E',
  terraDark: '#7D4B2A',
  muted: '#6E6058',
  line: 'rgba(32,22,16,0.12)',
  dark: '#14100A',
  onDark: '#F5EFE8',
  onDarkMuted: 'rgba(245,239,232,0.66)',
  display: "'Bricolage Grotesque', system-ui, sans-serif",
  serif: "'Cormorant Garamond', Georgia, serif",
  body: "'Hanken Grotesk', system-ui, sans-serif",
}

const IMG = {
  heroFrontal: 'https://estilofontana.com.br/upload/2025/11/26/1-f-la-fachada-frontal-r03-web-6926d44adbc25.jpg',
  fachadaAngular: 'https://estilofontana.com.br/upload/2025/11/26/2-f-la-fachada-angular-r03-web-6926d44aad3cb.jpg',
  fotomontagem: 'https://estilofontana.com.br/images/2025/11/26/27-f-la-fotomontagem-op-02-ef-web-6926e7faba3f4.jpg?fm=webp',
  mapa: 'https://estilofontana.com.br/images/2025/11/26/lavis-6926d96bce7ad.jpg?fm=webp',
  piscina: 'https://estilofontana.com.br/images/2025/11/26/11-f-la-piscina-op-002-ef-web-6926d56317e9f.jpg?fm=webp',
  video: 'https://www.youtube.com/embed/gLjgaXUa-A8',
}

const GALERIA: { src: string; alt: string; label: string }[] = [
  { src: 'https://estilofontana.com.br/images/empreendimento/slideshows/lavis-residencial-6926d1adaa325.jpg?fm=webp', alt: 'Lavis Residencial — perspectiva do empreendimento no Centro de Criciúma/SC', label: 'O Residencial' },
  { src: 'https://estilofontana.com.br/images/empreendimento/slideshows/lavis-residencial-6926d230f3b44.jpg?fm=webp', alt: 'Lavis Residencial — fachada e volumetria arquitetônica', label: 'Arquitetura' },
  { src: 'https://estilofontana.com.br/images/empreendimento/slideshows/lavis-residencial-6926d29d5b1d9.jpg?fm=webp', alt: 'Lavis Residencial — perspectiva externa', label: 'Perspectiva' },
  { src: 'https://estilofontana.com.br/images/2025/11/26/3-f-la-embasamento-r03-web-6926d4a93fe97.jpg?fm=webp', alt: 'Acesso principal do Lavis Residencial', label: 'Acesso principal' },
  { src: 'https://estilofontana.com.br/images/2025/11/26/13-f-la-hall-de-entrada-ef-web-6926d4c2528ec.jpg?fm=webp', alt: 'Hall de entrada do Lavis Residencial', label: 'Hall de entrada' },
  { src: 'https://estilofontana.com.br/images/2025/11/26/8-6926d4ea5db5d.jpg?fm=webp', alt: 'Espaço gourmet do Lavis Residencial', label: 'Espaço gourmet' },
  { src: 'https://estilofontana.com.br/images/2025/11/26/11-f-la-piscina-op-002-ef-web-6926d56317e9f.jpg?fm=webp', alt: 'Piscina do Lavis Residencial', label: 'Piscina' },
  { src: 'https://estilofontana.com.br/images/2025/11/26/7-f-la-fitness-r03-web-6926d5b639a52.jpg?fm=webp', alt: 'Academia do Lavis Residencial', label: 'Academia' },
]

const DIFERENCIAIS: string[] = [
  'Hall com pé-direito duplo',
  'Acesso por reconhecimento facial',
  'Fechadura digital',
  'Lavabo',
  'Janela com peitoril de vidro',
  'Porcelanato retificado',
  'Tubulação de água quente',
  'Espera para split e para coifa',
  'Nicho nos banheiros',
  'Garagem com pintura epóxi',
  'Ponto para lava-louças',
]

const AMENIDADES: string[] = [
  'Piscina',
  'Academia',
  'Salão de festas',
  'Espaço gourmet',
  'Churrasqueira com exaustão',
  'Brinquedoteca',
  'Playground',
  'Terraço + câmeras 24h',
  'Manta acústica entre pavimentos',
  'Gerador',
  'Espera para carregador de carro elétrico',
]

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Lavis Residencial — Alto Padrão Centro Criciúma/SC',
  description: 'Lavis Residencial (Construtora Fontana): apartamentos de alto padrão no Centro de Criciúma/SC. 3 suítes, 125 a 132 m², financiamento direto com a construtora. Atendimento exclusivo com Stiven Allan.',
  keywords: ['Lavis Residencial', 'apartamento alto padrão Criciúma', 'lançamento Fontana', 'Centro Criciúma', 'Stiven Allan corretor SC'],
  alternates: { canonical: `${SITE_URL}/empreendimento/fontana/lavis-residencial-centro-criciuma-sc` },
  openGraph: {
    title: 'Lavis Residencial — Sofisticação em movimento | Stiven Allan',
    description: 'Lavis Residencial (Construtora Fontana): apartamentos de alto padrão no Centro de Criciúma/SC. 3 suítes, 125 a 132 m², financiamento direto com a construtora. Atendimento exclusivo com Stiven Allan.',
    url: `${SITE_URL}/empreendimento/fontana/lavis-residencial-centro-criciuma-sc`,
    images: [{ url: IMG.fotomontagem, width: 1200, height: 630, alt: 'Lavis Residencial — fachada' }],
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lavis Residencial — Sofisticação em movimento | Stiven Allan',
    description: 'Lavis Residencial (Construtora Fontana): apartamentos de alto padrão no Centro de Criciúma/SC. 3 suítes, 125 a 132 m², financiamento direto com a construtora. Atendimento exclusivo com Stiven Allan.',
    images: [IMG.fotomontagem],
  },
  robots: { index: true, follow: true },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'RealEstateAgent',
      name: 'Stiven Allan',
      url: SITE_URL,
      telephone: '+5548991642332',
      areaServed: { '@type': 'City', name: 'Criciúma', containedInPlace: { '@type': 'State', name: 'Santa Catarina' } },
    },
    {
      '@type': 'Apartment',
      name: 'Lavis Residencial',
      description: 'Apartamentos de alto padrão no Centro de Criciúma/SC: 3 dormitórios, todos suítes, 125 a 132 m² privativos, com financiamento direto com a Construtora Fontana.',
      image: IMG.heroFrontal,
      numberOfRooms: 3,
      numberOfBathroomsTotal: 3,
      floorSize: { '@type': 'QuantitativeValue', minValue: 125, maxValue: 132, unitCode: 'MTK' },
      address: { '@type': 'PostalAddress', streetAddress: 'Rua Timóteo Batista, 53', addressLocality: 'Criciúma', addressRegion: 'SC', addressCountry: 'BR' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Lançamentos Criciúma', item: `${SITE_URL}/lancamentos/criciuma-sc` },
        { '@type': 'ListItem', position: 3, name: 'Lavis Residencial', item: `${SITE_URL}/empreendimento/fontana/lavis-residencial-centro-criciuma-sc` },
      ],
    },
  ],
}

export default function LavisPage() {
  return (
    <main style={{ background: t.bg, color: t.ink, fontFamily: t.body, overflowX: 'hidden' }}>
      <PropertySchema nome="Lavis Residencial" slug="lavis-residencial-centro-criciuma-sc" construtora_slug="fontana" cidade="Criciúma" uf="SC" bairro="Centro" descricao="Lavis Residencial (Construtora Fontana): apartamentos de alto padrão no Centro de Criciúma/SC. 3 suítes, 125 a 132 m², financiamento direto com a construtora. Atendimento exclusivo com Stiven Allan." imagem="https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/lavis-residencial-centro-criciuma-sc.jpg" faq={[{"pergunta":"Como funciona o financiamento direto do Lavis Residencial?","resposta":"Entrada de 20%, saldo em até 72 parcelas mensais e 6 reforços anuais (cada reforço equivale a 5 parcelas mensais), com correção pelo CUB/SC durante a obra. Sem análise de banco."},{"pergunta":"Qual a previsão de entrega do Lavis Residencial?","resposta":"A previsão de entrega é dezembro de 2030, em Centro, Criciúma/SC."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Sim. Além do financiamento direto com a construtora, é possível optar por financiamento bancário. Fale com o Stiven pelo WhatsApp para simular as duas opções."},{"pergunta":"Onde fica o Lavis Residencial?","resposta":"O Lavis Residencial está localizado no Centro, Criciúma/SC."}]} />
      

      <style>{`
        html { scroll-behavior: smooth; }
        .lv-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: ${t.terra}; font-family: ${t.body}; font-weight: 500; }
        .lv-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.04; text-shadow: 0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4); font-size: clamp(40px,8vw,104px); margin: 0; }
        .lv-onimg { text-shadow: 0 1px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5); }
        .lv-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.16em; line-height: 1.1; font-size: clamp(26px,4vw,46px); margin: 0; }
        .lv-serif { font-family: ${t.serif}; font-style: italic; font-weight: 400; }
        .lv-rule { width: 56px; height: 1px; background: ${t.terra}; border: 0; }
        .lv-cta { display: inline-block; font-family: ${t.body}; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: ${t.ink}; border: 1px solid ${t.terra}; padding: 16px 34px; text-decoration: none; transition: background .35s ease, color .35s ease; cursor: pointer; }
        .lv-cta:hover { background: ${t.terra}; color: #fff; }
        .lv-cta-light { color: ${t.onDark}; border-color: rgba(245,239,232,0.55); }
        .lv-cta-light:hover { background: ${t.onDark}; color: ${t.terraDark}; }
        .lv-navlink { font-family: ${t.body}; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.85); text-decoration: none; transition: color .3s ease; }
        .lv-navlink:hover { color: #fff; }
        .lv-fade { opacity: 0; transform: translateY(24px); animation: lvfade .9s ease forwards; }
        @keyframes lvfade { to { opacity: 1; transform: none; } }
        .lv-gcard { position: relative; overflow: hidden; }
        .lv-gcard img { transition: transform .8s ease; }
        .lv-gcard:hover img { transform: scale(1.06); }
        .lv-amen { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${t.line}; font-size: 15px; }
        .lv-amen::before { content: ''; width: 6px; height: 6px; background: ${t.terra}; border-radius: 50%; flex: 0 0 auto; }
        .lv-wa { position: fixed; right: 20px; bottom: 20px; z-index: 60; width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.25); text-decoration: none; }
        .lv-burger { display: none; }
        @media (max-width: 860px) {
          .lv-nav-links { display: none !important; }
          .lv-burger { display: flex !important; }
        }
        details.lv-menu > summary { list-style: none; }
        details.lv-menu > summary::-webkit-details-marker { display: none; }
      `}</style>

      {/* NAV */}
      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px clamp(18px,5vw,56px)' }}>
          <a href="#top" style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.26em', fontSize: 16, color: '#fff', textDecoration: 'none', textTransform: 'uppercase' }}>Lavis</a>
          <div className="lv-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
            <a href="#residencial" className="lv-navlink">O Residencial</a>
            <a href="#galeria" className="lv-navlink">Galeria</a>
            <a href="#residencias" className="lv-navlink">As Residências</a>
            <a href="#diferenciais" className="lv-navlink">Diferenciais</a>
            <a href="#localizacao" className="lv-navlink">Localização</a>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="lv-cta lv-cta-light" style={{ padding: '12px 24px' }}>Atendimento Exclusivo</a>
          </div>
          <details className="lv-menu lv-burger" style={{ position: 'relative' }}>
            <summary style={{ cursor: 'pointer', color: '#fff', fontSize: 22, lineHeight: 1, padding: 6 }} aria-label="Abrir menu">&#9776;</summary>
            <div style={{ position: 'absolute', right: 0, top: '120%', background: t.terraDark, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 200, boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
              <a href="#residencial" className="lv-navlink">O Residencial</a>
              <a href="#galeria" className="lv-navlink">Galeria</a>
              <a href="#residencias" className="lv-navlink">As Residências</a>
              <a href="#diferenciais" className="lv-navlink">Diferenciais</a>
              <a href="#localizacao" className="lv-navlink">Localização</a>
              <a href={WPP} target="_blank" rel="noopener noreferrer" className="lv-navlink">Atendimento Exclusivo</a>
            </div>
          </details>
        </nav>
      </header>

      {/* 1 HERO */}
      <section id="top" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end' }}>
        <Image src={IMG.heroFrontal} alt="Fachada frontal do Lavis Residencial, no Centro de Criciúma/SC" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(20,16,10,0.42) 0%, rgba(20,16,10,0.12) 40%, rgba(20,16,10,0.82) 100%)' }} />
        <div className="lv-fade" style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px) clamp(56px,9vh,110px)', maxWidth: 1100 }}>
          <p className="lv-eyebrow lv-onimg" style={{ color: '#fff', marginBottom: 18 }}>Lavis Residencial &mdash; Centro, Criciúma/SC</p>
          <h1 className="lv-h1" style={{ color: '#fff' }}>Lavis Residencial</h1>
          <p className="lv-serif lv-onimg" style={{ color: t.onDark, fontSize: 'clamp(20px,3vw,32px)', marginTop: 14, marginBottom: 34 }}>Sofisticação em movimento.</p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="lv-cta lv-cta-light">Atendimento Exclusivo</a>
        </div>
      </section>

      {/* 2 CONCEITO */}
      <section id="residencial" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p className="lv-eyebrow" style={{ marginBottom: 26 }}>O Residencial</p>
          <h2 className="lv-h2">No seu ritmo,<br />em equilíbrio</h2>
          <hr className="lv-rule" style={{ margin: '34px auto' }} />
          <p className="lv-serif" style={{ fontSize: 'clamp(24px,3.4vw,40px)', lineHeight: 1.35, color: t.ink, margin: 0 }}>
            No Lavis, a vida moderna encontra o equilíbrio. E, mesmo em constante movimento, a harmonia permanece.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: t.muted, marginTop: 26, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
            Um respiro em meio à rotina. Traços orgânicos e curvas que transmitem calmaria, no centro da cidade, no seu ritmo.
          </p>
        </div>
      </section>

      {/* 3 VIDEO */}
      <section id="video" style={{ padding: '0 clamp(0px,4vw,56px) clamp(40px,8vh,96px)' }}>
        <p className="lv-eyebrow" style={{ textAlign: 'center', marginBottom: 26 }}>Conheça o Lavis</p>
        <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: t.dark }}>
          <iframe
            src={IMG.video}
            title="Vídeo Lavis Residencial"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
      </section>

      {/* 4 GALERIA */}
      <section id="galeria" style={{ padding: 'clamp(40px,8vh,80px) 0 0' }}>
        <div style={{ textAlign: 'center', padding: '0 clamp(18px,5vw,56px) clamp(34px,6vh,60px)' }}>
          <p className="lv-eyebrow" style={{ marginBottom: 16 }}>Galeria</p>
          <h2 className="lv-h2">Um respiro<br />em meio à rotina</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
          <GalleryWithLightbox galeria={GALERIA} prefix="lv" gradient="rgba(20,16,10,0.55)" />
        </div>
      </section>

      {/* 5 AS RESIDÊNCIAS */}
      <section id="residencias" style={{ background: t.dark, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <p className="lv-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>As Residências</p>
          <h2 className="lv-h2" style={{ color: t.onDark }}>Espaço para viver no seu ritmo</h2>
          <p className="lv-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 56 }}>Plantas pensadas para o equilíbrio do morar.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'clamp(28px,5vw,64px)', marginBottom: 56 }}>
            {[
              { n: '3', l: 'Dormitórios (todos suítes)' },
              { n: '3', l: 'Suítes' },
              { n: '125 a 132', l: 'm² privativos' },
              { n: 'Sim', l: 'Personalização de planta' },
            ].map((it, i) => (
              <div key={i}>
                <div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(34px,5vw,58px)', letterSpacing: '0.04em', lineHeight: 1 }}>{it.n}</div>
                <div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDarkMuted, marginTop: 12 }}>{it.l}</div>
              </div>
            ))}
          </div>
          <LeadCaptureButton slug="lavis-residencial-centro-criciuma-sc" construtora_slug="fontana" className="lv-cta lv-cta-light"  propertyDisplayName="Lavis Residencial" />
        </div>
      </section>

      {/* 6 DIFERENCIAIS */}
      <section id="diferenciais" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
            <p className="lv-eyebrow" style={{ marginBottom: 16 }}>Diferenciais das Unidades</p>
            <h2 className="lv-h2">Detalhes que elevam o morar</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', borderTop: `1px solid ${t.line}`, borderLeft: `1px solid ${t.line}` }}>
            {DIFERENCIAIS.map((d, i) => (
              <div key={i} style={{ background: t.bg, padding: 'clamp(28px,4vw,44px)', borderBottom: `1px solid ${t.line}`, borderRight: `1px solid ${t.line}` }}>
                <div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 22, color: t.terra, marginBottom: 14 }}>{String(i + 1).padStart(2, '0')}</div>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: t.ink }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 LAZER & ÁREAS COMUNS */}
      <section style={{ background: t.bg, padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
            <p className="lv-eyebrow" style={{ marginBottom: 16 }}>Lazer &amp; Áreas Comuns</p>
            <h2 className="lv-h2">A harmonia<br />permanece</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 'clamp(28px,5vw,64px)', alignItems: 'center' }}>
            <LightboxPhoto src={IMG.piscina} alt="Piscina do Lavis Residencial no Centro de Criciúma/SC" label="Piscina" cardClass="lv-gcard" imgSizes="(max-width: 768px) 100vw, 55vw" />
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {AMENIDADES.map((a, i) => (
                <div key={i} className="lv-amen">{a}</div>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 8 LOCALIZAÇÃO */}
      <section id="localizacao" style={{ padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)', background: t.dark, color: t.onDark }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 'clamp(34px,5vw,64px)', alignItems: 'center' }}>
          <div>
            <p className="lv-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Localização</p>
            <h2 className="lv-h2" style={{ color: t.onDark }}>No centro da cidade,<br />no seu ritmo</h2>
            <hr className="lv-rule" style={{ margin: '28px 0' }} />
            <p style={{ color: t.onDarkMuted, fontSize: 17, lineHeight: 1.6 }}>
              Rua Timóteo Batista, 53 &mdash; Centro, Criciúma/SC. A poucos passos de tudo o que importa, com a privacidade de um endereço de alto padrão.
            </p>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="lv-cta lv-cta-light" style={{ marginTop: 30 }}>Atendimento Exclusivo</a>
          </div>
          <div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 2 }}>
            <Image src={IMG.mapa} alt="Mapa da localização do Lavis Residencial no Centro de Criciúma/SC" fill loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* 9 FINANCIAMENTO DIRETO */}
      <section style={{ background: t.terra, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <p className="lv-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Financiamento Direto</p>
          <h2 className="lv-h2" style={{ color: t.onDark }}>A liberdade de comprar sem banco</h2>
          <p className="lv-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 60 }}>Sem burocracia, sem intermediários. Direto com a construtora.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 'clamp(28px,4vw,52px)' }}>
            {[
              { n: '01', ti: 'Converse com o corretor', d: 'Atendimento exclusivo e personalizado para entender o seu momento e as melhores condições.' },
              { n: '02', ti: 'Escolha a sua unidade', d: 'Personalize a planta e defina o apartamento ideal para o seu estilo de vida.' },
              { n: '03', ti: 'Negocie direto com a Fontana', d: 'Condições facilitadas, sem banco e sem burocracia. Privilégio de quem compra com liberdade.' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 40, opacity: 0.55, marginBottom: 14 }}>{s.n}</div>
                <h3 style={{ fontFamily: t.display, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 17, margin: '0 0 12px', color: t.onDark }}>{s.ti}</h3>
                <p style={{ color: t.onDarkMuted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 56, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.onDark }}>Alto padrão exclusivo &middot; Sob consulta</p>
        </div>
      </section>

      {/* 10 CTA FINAL */}
      <section style={{ position: 'relative', minHeight: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Image src={IMG.fotomontagem} alt="Lavis Residencial — fotomontagem no Centro de Criciúma/SC" fill loading="lazy" sizes="100vw" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,16,10,0.62)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px)', maxWidth: 880 }}>
          <p className="lv-eyebrow lv-onimg" style={{ color: '#fff', marginBottom: 22 }}>Atendimento Exclusivo</p>
          <h2 className="lv-h2 lv-onimg" style={{ color: '#fff', fontSize: 'clamp(30px,5vw,56px)' }}>Sofisticação em movimento.</h2>
          <div style={{ marginTop: 38 }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="lv-cta lv-cta-light">Atendimento Exclusivo</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: t.terraDark, color: t.onDarkMuted, padding: 'clamp(56px,9vh,96px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 'clamp(28px,5vw,56px)' }}>
          <div>
            <div style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.22em', fontSize: 18, color: t.onDark, textTransform: 'uppercase' }}>Stiven Allan</div>
            <p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6 }}>Imóveis de alto padrão em Santa Catarina.<br />CRECI 60.275</p>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Contato</div>
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: t.onDarkMuted, textDecoration: 'none', fontSize: 14 }}>WhatsApp &middot; (48) 99164-2332</a>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Empreendimento</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>Lavis Residencial<br />Construtora Fontana<br />Centro, Criciúma/SC</p>
          </div>
        </div>
        <div style={{ maxWidth: 1180, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(245,239,232,0.12)', fontSize: 12 }}>
          &copy; {new Date().getFullYear()} Stiven Allan. Imagens meramente ilustrativas. Valores sob consulta.
        </div>
      </footer>

      {/* WHATSAPP FLUTUANTE */}
      <a href={WPP} target="_blank" rel="noopener noreferrer" className="lv-wa" aria-label="Falar no WhatsApp com Stiven Allan">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.973-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
      </a>
    </main>
  )
}
