import type { Metadata } from 'next'
import Image from 'next/image'
import { HeroImage } from '@/components/HeroImage'
import GalleryWithLightbox, { LightboxPhoto } from './gallery-lightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

const WPP = "https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Calalzo%20Di%20Cadore%20Residencial."
const CATALOGO_PDF = "https://estilofontana.com.br/upload/empreendimento/catalogo/calalzo-di-cadore-residencial-1603739983.pdf"

const t = {
  bg: '#FAFAF8', ink: '#16201A', green: '#3D5C38', greenDark: '#263A23', muted: '#5A6858',
  line: 'rgba(22,32,26,0.12)', dark: '#0F1710', onDark: '#EAF2E8', onDarkMuted: 'rgba(234,242,232,0.66)',
  display: "'Jost', system-ui, sans-serif", serif: "'Cormorant Garamond', Georgia, serif",
  body: "'Hanken Grotesk', system-ui, sans-serif",
}

const IMG = {
  hero: 'https://estilofontana.com.br/images/empreendimento/slideshows/calalzo-di-cadore-residencial-64a2c669b3bc6.JPG?fm=webp',
  mapa: 'https://estilofontana.com.br/images/2020/10/26/localizacao-5f96e4a316e04.png?fm=webp',
  lazer: 'https://estilofontana.com.br/images/empreendimento/slideshows/calalzo-di-cadore-residencial-64a2c6698cf6f.JPG?fm=webp',
}

const GALERIA = [
  { src: IMG.hero, alt: 'Calalzo Di Cadore Residencial — Fachada', label: 'Fachada' },
  { src: 'https://lh3.googleusercontent.com/d/1H3JtoI-vUWYRL-jX065tvKpOerw0MKFx', alt: 'Fachada — Vista 2', label: 'Fachada — Vista 2' },
  { src: 'https://lh3.googleusercontent.com/d/1tKptJwvpPULKfONKwZsigrYczqnOkA_R', alt: 'Fachada — Vista 3', label: 'Fachada — Vista 3' },
  { src: 'https://lh3.googleusercontent.com/d/1yf10YOAEq9GQXL-Rvz9ktH5HS2LQiVFu', alt: 'Fachada — Vista 4', label: 'Fachada — Vista 4' },
  { src: 'https://lh3.googleusercontent.com/d/15iuXzP_toTINw1ho_HqHihmTCs6Ruz3D', alt: 'Hall de Entrada', label: 'Hall de Entrada' },
  { src: 'https://lh3.googleusercontent.com/d/1NJxK13y_3e8mhbAJx0NbeLDeXujS0liB', alt: 'Hall — Vista 2', label: 'Hall — Vista 2' },
  { src: 'https://lh3.googleusercontent.com/d/1VLPx7fAKBK4olk5KSycUGb_xL_yE1kLW', alt: 'Hall — Vista 3', label: 'Hall — Vista 3' },
  { src: 'https://lh3.googleusercontent.com/d/12O8mRl-FqB3NxevjmGOdVV4IYaOp0PxJ', alt: 'Espaço Fogo', label: 'Espaço Fogo' },
  { src: 'https://lh3.googleusercontent.com/d/19_qkbiqa5c476ZDfQSmrC-FWMWJqiZLV', alt: 'Espaço Zen', label: 'Espaço Zen' },
  { src: 'https://lh3.googleusercontent.com/d/1abiN_Pwv2SzxKe8cC1R2lRTPjeC_CVcN', alt: 'Espaço Zen — Vista 2', label: 'Espaço Zen — Vista 2' },
  { src: 'https://lh3.googleusercontent.com/d/1b425OGOs_vdyzVLjPUq21FPV4zHHKljM', alt: 'Salão de Festas', label: 'Salão de Festas' },
  { src: 'https://lh3.googleusercontent.com/d/13QPzd0_MG1HmTZSyKYuzRb1CM3k9deOq', alt: 'Salão de Festas — Vista 2', label: 'Salão de Festas — Vista 2' },
  { src: 'https://lh3.googleusercontent.com/d/1WgHm_R95LyKrLAx2UASf1vMA_XhRdSgu', alt: 'Salão de Festas — Vista 3', label: 'Salão de Festas — Vista 3' },
]

const DIFERENCIAIS = [
  '1 suíte com sacada privativa',
  '2 sacadas por apartamento',
  'Rebaixo em gesso com iluminação planejada',
  'Espaço Pet integrado ao lazer',
]

const AMENIDADES = [
  'Espaço Fogo', 'Playground', 'Pet Place',
  'Salão de Festas', 'Churrasqueira', '2 Elevadores',
]

export const metadata: Metadata = {
  title: 'Calalzo Di Cadore Residencial | Michel Criciúma SC',
  description: 'Calalzo Di Cadore Residencial — 2 dormitórios (1 suíte), até 70 m², Michel, Criciúma/SC. Em obras. Financiamento direto Fontana. Conheça com Stiven Allan CRECI 60.275.',
  alternates: { canonical: SITE_URL + '/empreendimento/fontana/calalzo-di-cadore-michel-criciuma-sc' },
  openGraph: {
    title: 'Calalzo Di Cadore Residencial | Michel Criciúma SC | Stiven Allan',
    description: 'Para completar sua vida. Apartamentos com 1 suíte até 70 m² no Michel, Criciúma/SC.',
    url: SITE_URL + '/empreendimento/fontana/calalzo-di-cadore-michel-criciuma-sc',
    type: 'website',
    images: [{ url: IMG.hero, width: 1200, height: 800, alt: 'Fachada do Calalzo Di Cadore Residencial' }],
  },
  twitter: { card: 'summary_large_image', title: 'Calalzo Di Cadore Residencial | Michel Criciúma SC | Stiven Allan', description: 'Para completar sua vida. Apartamentos com 1 suíte até 70 m² no Michel, Criciúma/SC.', images: [IMG.hero] },
  robots: { index: true, follow: true },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [{ '@type': 'Apartment', name: 'Calalzo Di Cadore Residencial', description: 'Apartamentos de 2 dormitórios (1 suíte) com até 70 m² privativos no Michel, Criciúma/SC.', image: IMG.hero, numberOfRooms: 2, numberOfBathroomsTotal: 2, floorSize: { '@type': 'QuantitativeValue', value: 70, unitCode: 'MTK' }, address: { '@type': 'PostalAddress', streetAddress: 'Rua Joaquim Nabuco esq. Rua São Vicente de Paula', addressLocality: 'Criciúma', addressRegion: 'SC', addressCountry: 'BR' } }],
}

export default function CalalzoDiCadorePage() {
  return (
    <main style={{ background: t.bg, color: t.ink, fontFamily: t.body, overflowX: 'hidden' }}>
      
      <style>{`
        html { scroll-behavior: smooth; }
        .cc-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: ${t.green}; font-family: ${t.body}; font-weight: 500; }
        .cc-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.04; text-shadow: 0 2px 24px rgba(0,0,0,0.55); }
        .cc-onimg { text-shadow: 0 1px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5); }
        .cc-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.16em; line-height: 1.1; font-size: clamp(26px,4vw,46px); margin: 0; }
        .cc-serif { font-family: ${t.serif}; font-style: italic; font-weight: 400; }
        .cc-rule { width: 56px; height: 1px; background: ${t.green}; border: 0; }
        .cc-cta { display: inline-block; font-family: ${t.body}; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: ${t.ink}; border: 1px solid ${t.green}; padding: 16px 34px; text-decoration: none; transition: background .35s ease, color .35s ease; cursor: pointer; }
        .cc-cta:hover { background: ${t.green}; color: #fff; }
        .cc-cta-light { color: ${t.onDark}; border-color: rgba(234,242,232,0.55); }
        .cc-cta-light:hover { background: ${t.onDark}; color: ${t.greenDark}; }
        .cc-navlink { font-family: ${t.body}; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.85); text-decoration: none; transition: color .3s ease; }
        .cc-navlink:hover { color: #fff; }
        .cc-fade { opacity: 0; transform: translateY(24px); animation: ccfade .9s ease forwards; }
        @keyframes ccfade { to { opacity: 1; transform: none; } }
        .cc-gcard { position: relative; overflow: hidden; }
        .cc-gcard img { transition: transform .8s ease; }
        .cc-gcard:hover img { transform: scale(1.06); }
        .cc-gcard:focus { outline: 2px solid ${t.green}; outline-offset: 2px; }
        .cc-amen { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${t.line}; font-size: 15px; }
        .cc-amen::before { content: ''; width: 6px; height: 6px; background: ${t.green}; border-radius: 50%; flex: 0 0 auto; }
        .cc-lazer-card { position: relative; overflow: hidden; }
        .cc-lazer-card img { transition: transform .8s ease; }
        .cc-lazer-card:hover img { transform: scale(1.06); }
        .cc-lazer-card:focus { outline: 2px solid ${t.green}; outline-offset: 2px; }
        .cc-wa { position: fixed; right: 20px; bottom: 20px; z-index: 60; width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
        .cc-burger { display: none; }
        @media (max-width: 860px) { .cc-nav-links { display: none !important; } .cc-burger { display: flex !important; } }
        details.cc-menu > summary { list-style: none; }
        details.cc-menu > summary::-webkit-details-marker { display: none; }
      `}</style>
      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px clamp(18px,5vw,56px)' }}>
          <a href="#top" style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.26em', fontSize: 16, color: '#fff', textDecoration: 'none', textTransform: 'uppercase' }}>Calalzo Di Cadore</a>
          <div className="cc-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
            <a href="#residencial" className="cc-navlink">O Residencial</a>
            <a href="#galeria" className="cc-navlink">Galeria</a>
            <a href="#diferenciais" className="cc-navlink">Diferenciais</a>
            <a href="#localizacao" className="cc-navlink">Localização</a>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="cc-cta cc-cta-light" style={{ padding: '12px 24px' }}>Atendimento Exclusivo</a>
          </div>
          <details className="cc-menu cc-burger" style={{ position: 'relative' }}>
            <summary style={{ cursor: 'pointer', color: '#fff', fontSize: 22, lineHeight: 1, padding: 6 }} aria-label="Abrir menu">&#9776;</summary>
            <div style={{ position: 'absolute', right: 0, top: '120%', background: t.greenDark, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 200, boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
              <a href="#residencial" className="cc-navlink">O Residencial</a>
              <a href="#galeria" className="cc-navlink">Galeria</a>
              <a href="#diferenciais" className="cc-navlink">Diferenciais</a>
              <a href="#localizacao" className="cc-navlink">Localização</a>
              <a href={WPP} target="_blank" rel="noopener noreferrer" className="cc-navlink">Atendimento Exclusivo</a>
            </div>
          </details>
        </nav>
      </header>
      <section id="top" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end' }}>
        <HeroImage src={IMG.hero} alt="Fachada do Calalzo Di Cadore Residencial — Michel, Criciúma/SC" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,23,16,0.42) 0%, rgba(15,23,16,0.12) 40%, rgba(15,23,16,0.78) 100%)' }} />
        <div className="cc-fade" style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px) clamp(56px,9vh,110px)', maxWidth: 1100 }}>
          <p className="cc-eyebrow cc-onimg" style={{ color: '#fff', marginBottom: 18 }}>Calalzo Di Cadore Residencial &mdash; Michel, Criciúma/SC</p>
          <h1 className="cc-h1" style={{ color: '#fff', fontSize: 'clamp(40px,8vw,104px)', margin: 0 }}>Calalzo Di Cadore</h1>
          <p className="cc-serif cc-onimg" style={{ color: '#fff', fontSize: 'clamp(20px,3vw,32px)', marginTop: 14, marginBottom: 34 }}>Para completar sua vida.</p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="cc-cta cc-cta-light">Atendimento Exclusivo</a>
        </div>
      </section>
      <section id="residencial" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p className="cc-eyebrow" style={{ marginBottom: 26 }}>O Residencial</p>
          <p className="cc-serif" style={{ fontSize: 'clamp(24px,3.4vw,40px)', lineHeight: 1.35, color: t.ink, margin: 0 }}>Viver com plenitude é conquistar o seu próprio lugar, mas sem se desligar das suas origens. É estar bem consigo mesmo para alcançar a liberdade que sempre almejou.</p>
          <hr className="cc-rule" style={{ margin: '46px auto 0' }} />
        </div>
      </section>
      <section id="galeria" style={{ padding: '0 clamp(0px,4vw,56px) clamp(40px,8vh,96px)' }}>
        <p className="cc-eyebrow" style={{ textAlign: 'center', marginBottom: 26 }}>Galeria</p>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}><h2 className="cc-h2" style={{ textAlign: 'center', marginBottom: 'clamp(34px,6vh,60px)' }}>Uma vida para completar</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
          <GalleryWithLightbox galeria={GALERIA} prefix="cc" gradient="rgba(15,23,16,0.55)" />
        </div>
      </section>
      <section id="plantas" style={{ background: t.dark, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <p className="cc-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>As Residências</p>
          <h2 className="cc-h2" style={{ color: t.onDark }}>Espaço para viver com plenitude</h2>
          <p className="cc-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 56 }}>Até 70 m² privativos, 2 dormitórios.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'clamp(28px,5vw,64px)', marginBottom: 56 }}>
            {[{n:'2',l:'Dormitórios'},{n:'1',l:'Suíte'},{n:'70',l:'m² privativos'},{n:'2',l:'Elevadores'}].map((it,i)=>(
              <div key={i}><div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(34px,5vw,58px)', letterSpacing: '0.04em', lineHeight: 1 }}>{it.n}</div><div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDarkMuted, marginTop: 12 }}>{it.l}</div></div>
            ))}
          </div>
          <LeadCaptureButton slug="calalzo-di-cadore-michel-criciuma-sc" construtora_slug="fontana" className="cc-cta cc-cta-light"  propertyDisplayName="Calalzo di Cadore Residencial" />
        </div>
      </section>
      <section id="diferenciais" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
            <p className="cc-eyebrow" style={{ marginBottom: 16 }}>Diferenciais das Unidades</p>
            <h2 className="cc-h2">Detalhes que elevam o morar</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, background: t.line }}>
            {DIFERENCIAIS.map((d,i)=>(<div key={i} style={{ background: t.bg, padding: 'clamp(28px,4vw,44px)' }}><div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 22, color: t.green, marginBottom: 14 }}>{String(i+1).padStart(2,'0')}</div><p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: t.ink }}>{d}</p></div>))}
          </div>
        </div>
      </section>
      <section style={{ background: t.bg, padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
            <p className="cc-eyebrow" style={{ marginBottom: 16 }}>Lazer &amp; Áreas Comuns</p>
            <h2 className="cc-h2">Uma casa que completa você</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 'clamp(28px,5vw,64px)', alignItems: 'center' }}>
            <LightboxPhoto src={IMG.lazer} alt="Área de lazer do Calalzo Di Cadore Residencial" label="Área de lazer" cardClass="cc-lazer-card" imgSizes="(max-width: 768px) 100vw, 55vw" />
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>{AMENIDADES.map((a,i)=>(<div key={i} className="cc-amen">{a}</div>))}</ul>
          </div>
        </div>
      </section>
      <section id="localizacao" style={{ padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)', background: t.dark, color: t.onDark }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 'clamp(34px,5vw,64px)', alignItems: 'center' }}>
          <div>
            <p className="cc-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Localização</p>
            <h2 className="cc-h2" style={{ color: t.onDark }}>No Michel, em Criciúma.</h2>
            <p style={{ color: t.onDarkMuted, fontSize: 17, lineHeight: 1.6, marginTop: 24 }}>Rua Joaquim Nabuco esq. Rua São Vicente de Paula &mdash; Michel, Criciúma/SC</p>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="cc-cta cc-cta-light" style={{ marginTop: 30 }}>Atendimento Exclusivo</a>
          </div>
          <div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 2 }}>
            <Image src={IMG.mapa} alt="Mapa da localização do Calalzo Di Cadore Residencial" fill loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>
      <section style={{ background: t.green, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <p className="cc-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Financiamento Direto</p>
          <h2 className="cc-h2" style={{ color: t.onDark }}>A liberdade de comprar sem banco</h2>
          <p className="cc-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 60 }}>Sem burocracia, sem intermediários. Direto com a construtora.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 'clamp(28px,4vw,52px)' }}>
            {[{n:'01',t:'Converse com o corretor',d:'Atendimento exclusivo e personalizado para entender o seu momento e as melhores condições.'},{n:'02',t:'Escolha a sua unidade',d:'Selecione o apartamento ideal e defina uma proposta sob medida, sem amarras bancárias.'},{n:'03',t:'Negocie direto',d:'Condições flexíveis diretamente com a Construtora Fontana, com a liberdade que você merece.'}].map((s,i)=>(
              <div key={i} style={{ textAlign: 'left' }}><div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 40, opacity: 0.55, marginBottom: 14 }}>{s.n}</div><h3 style={{ fontFamily: t.display, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 17, margin: '0 0 12px', color: t.onDark }}>{s.t}</h3><p style={{ color: t.onDarkMuted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.d}</p></div>
            ))}
          </div>
          <div style={{ marginTop: 56, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={CATALOGO_PDF} target="_blank" rel="noopener noreferrer" className="cc-cta cc-cta-light">Baixar Catálogo</a>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="cc-cta cc-cta-light">Atendimento Exclusivo</a>
          </div>
          <p style={{ marginTop: 40, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.onDark }}>Michel, Criciúma/SC &middot; Sob consulta</p>
        </div>
      </section>
      <section style={{ position: 'relative', minHeight: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Image src={IMG.hero} alt="Calalzo Di Cadore Residencial" fill loading="lazy" sizes="100vw" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,16,0.65)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px)', maxWidth: 880 }}>
          <p className="cc-eyebrow cc-onimg" style={{ color: '#fff', marginBottom: 22 }}>Atendimento Exclusivo</p>
          <h2 className="cc-h2 cc-onimg" style={{ color: '#fff', fontSize: 'clamp(30px,5vw,56px)' }}>Para completar sua vida.</h2>
          <div style={{ marginTop: 38 }}><a href={WPP} target="_blank" rel="noopener noreferrer" className="cc-cta cc-cta-light">Atendimento Exclusivo</a></div>
        </div>
      </section>
      <footer style={{ background: t.greenDark, color: t.onDarkMuted, padding: 'clamp(56px,9vh,96px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 'clamp(28px,5vw,56px)' }}>
          <div><div style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.22em', fontSize: 18, color: t.onDark, textTransform: 'uppercase' }}>Stiven Allan</div><p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6 }}>Imóveis de alto padrão em Santa Catarina.<br />CRECI 60.275</p></div>
          <div><div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Contato</div><a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: t.onDarkMuted, textDecoration: 'none', fontSize: 14 }}>WhatsApp &middot; (48) 99164-2332</a></div>
          <div><div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Empreendimento</div><p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>Calalzo Di Cadore Residencial<br />Construtora Fontana<br />Michel, Criciúma/SC</p></div>
        </div>
        <div style={{ maxWidth: 1180, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(234,242,232,0.12)', fontSize: 12 }}>&copy; {new Date().getFullYear()} Stiven Allan. Imagens meramente ilustrativas. Valores sob consulta.</div>
      </footer>
      <a href={WPP} target="_blank" rel="noopener noreferrer" className="cc-wa" aria-label="Falar no WhatsApp com Stiven Allan">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.973-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
      </a>
            <PropertySchema schema={SCHEMA} />
            <PropertyFAQ items={[
      {pergunta:"Como funciona o financiamento direto do Calalzo Di Cadore?",resposta:"Imóvel pronto. Entrada de 20%, saldo em até 180 meses com correção pelo IGPM + 0,75% a.m. Negociação direta com a Construtora Fontana, sem análise bancária."},
      {pergunta:"Qual o tamanho e tipo dos apartamentos do Calalzo Di Cadore?",resposta:"2 dormitórios (1 suíte), com até 70 m² privativos no Michel, Criciúma/SC."},
      {pergunta:"O Calalzo Di Cadore já está pronto para morar?",resposta:"Sim. O Calalzo Di Cadore Residencial já está construído e disponível para entrega imediata."},
      {pergunta:"Onde fica o Calalzo Di Cadore?",resposta:"Rua Joaquim Nabuco esq. Rua São Vicente de Paula, Michel, Criciúma/SC — região de fácil acesso e próxima a comércios."},
      {pergunta:"Posso usar FGTS ou financiamento bancário no Calalzo Di Cadore?",resposta:"Sim. Além do financiamento direto Fontana (180 meses, IGPM + 0,75% a.m.), é possível financiamento bancário ou uso de FGTS. Consulte Stiven pelo WhatsApp."},
            ]} accent="#3D5C38" />
            <RelatedProperties atualSlug="calalzo-di-cadore-michel-criciuma-sc" cidade="Criciúma" />
    </main>
  )
}
