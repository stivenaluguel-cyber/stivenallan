import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

// Hotsite premium Águas de Marano Residencial (Fontana, FRENTE MAR, Centro de Balneário Piçarras/SC). Padrao EPIC.
// WhatsApp do corretor Stiven (NAO usar numeros internos da Fontana).
const WPP = "https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20%C3%81guas%20de%20Marano%20Residencial."
const CATALOGO_PDF = "https://estilofontana.com.br/upload/empreendimento/catalogo/Águas-de-marano-residencial-1707323527.pdf"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'

const t = {
  bg: '#FAFAF8',
  ink: '#16202B',
  navy: '#1B3A5B',
  navyDark: '#13293F',
  muted: '#5E6973',
  line: 'rgba(22,32,43,0.12)',
  dark: '#0F1E2D',
  onDark: '#EAF1F6',
  onDarkMuted: 'rgba(234,241,246,0.66)',
  display: "'Jost', system-ui, sans-serif",
  serif: "'Cormorant Garamond', Georgia, serif",
  body: "'Hanken Grotesk', system-ui, sans-serif",
}

const IMG = {
  hero: "https://estilofontana.com.br/images/2024/01/15/f-adm-fachada-02-ef-web-65a588a03d4c8.jpg?fm=webp",
  mapa: "https://estilofontana.com.br/images/2024/01/19/89898-65aab89d1a2fb.png?fm=webp",
  video: "https://www.youtube.com/embed/bdU-2kkXRZg",
}

const GALERIA = [
  { src: "https://estilofontana.com.br/images/empreendimento/slideshows/aguas-de-marano-residencial-65a583e5c68f2.jpg?fm=webp", alt: 'Águas de Marano Residencial — perspectiva frente mar em Balneário Piçarras/SC', label: 'Frente mar' },
  { src: "https://estilofontana.com.br/images/empreendimento/slideshows/aguas-de-marano-residencial-65a6bbf8a4550.jpg?fm=webp", alt: 'Águas de Marano Residencial — vista do empreendimento', label: 'O empreendimento' },
  { src: "https://estilofontana.com.br/images/empreendimento/slideshows/aguas-de-marano-residencial-65a6bfc2517cc.jpg?fm=webp", alt: 'Águas de Marano Residencial — perspectiva externa', label: 'Arquitetura' },
  { src: "https://estilofontana.com.br/images/2024/01/15/f-adm-piscina-completa-ef-web-65a59327c6b50.jpg?fm=webp", alt: 'Piscina adulto com wet bar do Águas de Marano', label: 'Piscina & wet bar' },
  { src: "https://estilofontana.com.br/images/2024/01/15/f-adm-spa-aquecido-ef-web-65a593695f5f0.jpg?fm=webp", alt: 'Spa aquecido do Águas de Marano', label: 'Spa aquecido' },
  { src: "https://estilofontana.com.br/images/2024/01/15/f-adm-terraco-espaco-fogo-ef-web-65a5938b45e1b.jpg?fm=webp", alt: 'Terraco com espaco fogo do Águas de Marano', label: 'Terraco & espaco fogo' },
  { src: "https://estilofontana.com.br/images/2024/01/15/f-adm-salao-festas-01-ef-web-65a593fa7718c.jpg?fm=webp", alt: 'Salao de festas do Águas de Marano', label: 'Salão de festas' },
  { src: "https://estilofontana.com.br/images/2024/01/15/f-adm-playground-ef-web-65a596dc5e2e7.jpg?fm=webp", alt: 'Playground do Águas de Marano', label: 'Playground' },
]

const DIFERENCIAIS = [
  'Sacada com churrasqueira e guarda-corpo de vidro',
  'Persianas automatizadas nos dormitórios',
  'Manta acústica entre lajes',
  'Tubulação de água quente',
  'Fechadura digital',
  'Espaço para carregador de carro elétrico',
]

const AMENIDADES = [
  'Piscina adulto com wet bar',
  'Splash infantil',
  'Spa aquecido',
  'Salão de festas',
  'Espaço fogo / terraço',
  'Sala de jogos com gourmet',
  'Fitness',
  'Garden lounge',
  'Espaço teen',
  'Pet place',
  'Acesso à praia',
  'Gerador',
  'Câmeras 24h',
]

export const metadata: Metadata = {
  title: 'Águas de Marano Residencial — frente mar no Centro de Balneário Piçarras/SC | Stiven Allan',
  description: 'Águas de Marano Residencial (Construtora Fontana): apartamentos frente mar de alto padrão no Centro de Balneário Piçarras/SC. 3 e 4 dormitórios, ate 3 suítes, 196 a 199 m² privativos. Atendimento exclusivo com Stiven Allan.',
  alternates: { canonical: SITE_URL + '/empreendimento/fontana/aguas-de-marano-frente-mar-balneario-picarras-sc' },
  openGraph: {
    title: 'Águas de Marano Residencial — frente mar em Balneário Piçarras/SC',
    description: 'Tenha o mar como seu vizinho. Apartamentos frente mar de alto padrão no Centro de Balneário Piçarras/SC. Atendimento exclusivo com Stiven Allan.',
    url: SITE_URL + '/empreendimento/fontana/aguas-de-marano-frente-mar-balneario-picarras-sc',
    type: 'website',
    images: [{ url: "https://estilofontana.com.br/images/2024/01/15/f-adm-fachada-02-ef-web-65a588a03d4c8.jpg?fm=webp", width: 1200, height: 800, alt: 'Fachada do Águas de Marano Residencial' }],
  },
  robots: { index: true, follow: true },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Residence',
  name: 'Águas de Marano Residencial',
  description: 'Apartamentos frente mar de alto padrão no Centro de Balneário Piçarras/SC. 3 e 4 dormitórios, ate 3 suítes, 196 a 199 m² privativos.',
  url: SITE_URL + '/empreendimento/fontana/aguas-de-marano-frente-mar-balneario-picarras-sc',
  image: "https://estilofontana.com.br/images/2024/01/15/f-adm-fachada-02-ef-web-65a588a03d4c8.jpg?fm=webp",
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Av. Nereu Ramos, esq. Rua Henrique Todeschini',
    addressLocality: 'Balneário Piçarras',
    addressRegion: 'SC',
    addressCountry: 'BR',
  },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Piscina adulto com wet bar', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Spa aquecido', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Acesso à praia', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Frente mar', value: true },
  ],
}

export default function AguasDeMaranoPage() {
  return (
    <main style={{ background: t.bg, color: t.ink, fontFamily: t.body, overflowX: 'hidden' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <style>{`
        html { scroll-behavior: smooth; }
        .am-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: ${t.navy}; font-family: ${t.body}; font-weight: 500; }
        .am-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.04; text-shadow: 0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4); }
        .am-onimg { text-shadow: 0 1px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5); }
        .am-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.16em; line-height: 1.1; font-size: clamp(26px,4vw,46px); margin: 0; }
        .am-serif { font-family: ${t.serif}; font-style: italic; font-weight: 400; }
        .am-rule { width: 56px; height: 1px; background: ${t.navy}; border: 0; }
        .am-cta { display: inline-block; font-family: ${t.body}; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: ${t.ink}; border: 1px solid ${t.navy}; padding: 16px 34px; text-decoration: none; transition: background .35s ease, color .35s ease; cursor: pointer; }
        .am-cta:hover { background: ${t.navy}; color: #fff; }
        .am-cta-light { color: ${t.onDark}; border-color: rgba(234,241,246,0.55); }
        .am-cta-light:hover { background: ${t.onDark}; color: ${t.navyDark}; }
        .am-navlink { font-family: ${t.body}; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.85); text-decoration: none; transition: color .3s ease; }
        .am-navlink:hover { color: #fff; }
        .am-fade { opacity: 0; transform: translateY(24px); animation: amfade .9s ease forwards; }
        @keyframes amfade { to { opacity: 1; transform: none; } }
        .am-gcard { position: relative; overflow: hidden; }
        .am-gcard img { transition: transform .8s ease; }
        .am-gcard:hover img { transform: scale(1.06); }
        .am-amen { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${t.line}; font-size: 15px; }
        .am-amen::before { content: ''; width: 6px; height: 6px; background: ${t.navy}; border-radius: 50%; flex: 0 0 auto; }
        .am-wa { position: fixed; right: 20px; bottom: 20px; z-index: 60; width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
        .am-burger { display: none; }
        @media (max-width: 860px) {
          .am-nav-links { display: none !important; }
          .am-burger { display: flex !important; }
          .am-hero-video { display: none !important; }
          .am-hero-fallback { display: block !important; }
        }
        details.am-menu > summary { list-style: none; }
        details.am-menu > summary::-webkit-details-marker { display: none; }
      `}</style>

      {/* NAV */}
      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px clamp(18px,5vw,56px)' }}>
          <a href="#top" style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.26em', fontSize: 16, color: '#fff', textDecoration: 'none', textTransform: 'uppercase' }}>Águas de Marano</a>
          <div className="am-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
            <a href="#residencial" className="am-navlink">O Residencial</a>
            <a href="#galeria" className="am-navlink">Galeria</a>
            <a href="#plantas" className="am-navlink">Plantas</a>
            <a href="#diferenciais" className="am-navlink">Diferenciais</a>
            <a href="#localizacao" className="am-navlink">Localização</a>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="am-cta am-cta-light" style={{ padding: '12px 24px' }}>Atendimento Exclusivo</a>
          </div>
          <details className="am-menu am-burger" style={{ position: 'relative' }}>
            <summary style={{ cursor: 'pointer', color: '#fff', fontSize: 22, lineHeight: 1, padding: 6 }} aria-label="Abrir menu">&#9776;</summary>
            <div style={{ position: 'absolute', right: 0, top: '120%', background: t.navyDark, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 200, boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
              <a href="#residencial" className="am-navlink">O Residencial</a>
              <a href="#galeria" className="am-navlink">Galeria</a>
              <a href="#plantas" className="am-navlink">Plantas</a>
              <a href="#diferenciais" className="am-navlink">Diferenciais</a>
              <a href="#localizacao" className="am-navlink">Localização</a>
              <a href={WPP} target="_blank" rel="noopener noreferrer" className="am-navlink">Atendimento Exclusivo</a>
            </div>
          </details>
        </nav>
      </header>

      {/* HERO */}
      <section id="top" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end' }}>
        <Image src={IMG.hero} alt="Fachada do Águas de Marano Residencial — frente mar em Balneário Piçarras/SC" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,30,45,0.42) 0%, rgba(15,30,45,0.12) 40%, rgba(15,30,45,0.78) 100%)' }} />
        <div className="am-fade" style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px) clamp(56px,9vh,110px)', maxWidth: 1100 }}>
          <p className="am-eyebrow am-onimg" style={{ color: '#fff', marginBottom: 18 }}>Águas de Marano Residencial &mdash; Centro, Balneário Piçarras/SC</p>
          <h1 className="am-h1" style={{ color: '#fff', fontSize: 'clamp(40px,8vw,104px)', margin: 0 }}>Águas de Marano</h1>
          <p className="am-serif am-onimg" style={{ color: '#fff', fontSize: 'clamp(20px,3vw,32px)', marginTop: 14, marginBottom: 34 }}>Mergulhe em cada detalhe.</p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="am-cta am-cta-light">Atendimento Exclusivo</a>
        </div>
      </section>

      {/* CONCEITO */}
      <section id="residencial" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p className="am-eyebrow" style={{ marginBottom: 26 }}>O Residencial</p>
          <p className="am-serif" style={{ fontSize: 'clamp(24px,3.4vw,40px)', lineHeight: 1.35, color: t.ink, margin: 0 }}>
            Tenha o mar como seu vizinho. Veja a transparência das águas a cada movimento do mar. Um endereço onde o bem-estar se torna estilo de vida e a sua liberdade fica próxima de tudo &mdash; frente mar, no coração de Balneário Piçarras.
          </p>
          <hr className="am-rule" style={{ margin: '46px auto 0' }} />
        </div>
      </section>

      {/* VIDEO */}
      <section style={{ padding: '0 clamp(0px,4vw,56px) clamp(40px,8vh,96px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: t.dark }}>
          <iframe
            src={IMG.video}
            title="Vídeo Águas de Marano Residencial"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" style={{ padding: 'clamp(40px,8vh,80px) 0 0' }}>
        <div style={{ textAlign: 'center', padding: '0 clamp(18px,5vw,56px) clamp(34px,6vh,60px)' }}>
          <p className="am-eyebrow" style={{ marginBottom: 16 }}>Galeria</p>
          <h2 className="am-h2">Uma vida frente mar</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
          {GALERIA.map((g, i) => (
            <figure key={i} className="am-gcard" style={{ margin: 0, aspectRatio: '4 / 3', position: 'relative' }}>
              <Image src={g.src} alt={g.alt} fill loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,30,45,0.55), rgba(15,30,45,0) 45%)' }} />
              <figcaption className="am-onimg" style={{ position: 'absolute', left: 18, bottom: 16, color: '#fff', fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase' }}>{g.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* AS RESIDENCIAS */}
      <section id="plantas" style={{ background: t.dark, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <p className="am-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>As Residências</p>
          <h2 className="am-h2" style={{ color: t.onDark }}>Espaço para viver o mar</h2>
          <p className="am-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 56 }}>Plantas amplas, 100% frente mar.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'clamp(28px,5vw,64px)', marginBottom: 56 }}>
            {[
              { n: '3 e 4', l: 'Dormitórios' },
              { n: '3', l: 'Suítes' },
              { n: '196 a 199', l: 'm² privativos' },
              { n: '100%', l: 'Frente mar' },
            ].map((it, i) => (
              <div key={i}>
                <div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(34px,5vw,58px)', letterSpacing: '0.04em', lineHeight: 1 }}>{it.n}</div>
                <div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDarkMuted, marginTop: 12 }}>{it.l}</div>
              </div>
            ))}
          </div>
          <a href={CATALOGO_PDF} target="_blank" rel="noopener noreferrer" className="am-cta am-cta-light">Baixar Catalogo &amp; Plantas</a>
        </div>
      </section>

      {/* DIFERENCIAIS DAS UNIDADES */}
      <section id="diferenciais" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
            <p className="am-eyebrow" style={{ marginBottom: 16 }}>Diferenciais das Unidades</p>
            <h2 className="am-h2">Detalhes que elevam o morar</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, background: t.line }}>
            {DIFERENCIAIS.map((d, i) => (
              <div key={i} style={{ background: t.bg, padding: 'clamp(28px,4vw,44px)' }}>
                <div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 22, color: t.navy, marginBottom: 14 }}>{String(i + 1).padStart(2, '0')}</div>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: t.ink }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAZER & AREAS COMUNS */}
      <section style={{ background: t.bg, padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
            <p className="am-eyebrow" style={{ marginBottom: 16 }}>Lazer &amp; Areas Comuns</p>
            <h2 className="am-h2">O resort é a sua casa</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 'clamp(28px,5vw,64px)', alignItems: 'center' }}>
            <div className="am-gcard" style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden' }}>
              <Image src={"https://estilofontana.com.br/images/2024/01/15/f-adm-piscina-completa-ef-web-65a59327c6b50.jpg?fm=webp"} alt="Piscina adulto com wet bar do Águas de Marano Residencial" fill loading="lazy" sizes="(max-width: 768px) 100vw, 55vw" style={{ objectFit: 'cover' }} />
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {AMENIDADES.map((a, i) => (
                <div key={i} className="am-amen">{a}</div>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* LOCALIZACAO */}
      <section id="localizacao" style={{ padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)', background: t.dark, color: t.onDark }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 'clamp(34px,5vw,64px)', alignItems: 'center' }}>
          <div>
            <p className="am-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Localização</p>
            <h2 className="am-h2" style={{ color: t.onDark }}>A sua liberdade próxima de tudo.</h2>
            <p style={{ color: t.onDarkMuted, fontSize: 17, lineHeight: 1.6, marginTop: 24 }}>
              Av. Nereu Ramos, esq. Rua Henrique Todeschini &mdash; Centro, Balneário Piçarras/SC
            </p>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="am-cta am-cta-light" style={{ marginTop: 30 }}>Atendimento Exclusivo</a>
          </div>
          <div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 2 }}>
            <Image src={IMG.mapa} alt="Mapa da localizacao do Águas de Marano Residencial no Centro de Balneário Piçarras/SC" fill loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* FINANCIAMENTO DIRETO */}
      <section style={{ background: t.navy, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <p className="am-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Financiamento Direto</p>
          <h2 className="am-h2" style={{ color: t.onDark }}>A liberdade de comprar sem banco</h2>
          <p className="am-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 60 }}>Sem burocracia, sem intermediários. Direto com a construtora.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 'clamp(28px,4vw,52px)' }}>
            {[
              { n: '01', t: 'Converse com o corretor', d: 'Atendimento exclusivo e personalizado para entender o seu momento e as melhores condições.' },
              { n: '02', t: 'Escolha a sua planta', d: 'Selecione a unidade frente mar ideal e defina uma proposta sob medida, sem amarras bancárias.' },
              { n: '03', t: 'Negocie direto', d: 'Condições flexíveis diretamente com a Construtora Fontana, com a liberdade que você merece.' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 40, opacity: 0.55, marginBottom: 14 }}>{s.n}</div>
                <h3 style={{ fontFamily: t.display, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 17, margin: '0 0 12px' }}>{s.t}</h3>
                <p style={{ color: t.onDarkMuted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 56, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.onDark }}>Frente mar exclusivo &middot; Sob consulta</p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ position: 'relative', minHeight: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Image src={"https://estilofontana.com.br/images/2024/01/15/f-adm-spa-aquecido-ef-web-65a593695f5f0.jpg?fm=webp"} alt="Spa aquecido frente mar do Águas de Marano Residencial" fill loading="lazy" sizes="100vw" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,30,45,0.62)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px)', maxWidth: 880 }}>
          <p className="am-eyebrow am-onimg" style={{ color: '#fff', marginBottom: 22 }}>Atendimento Exclusivo</p>
          <h2 className="am-h2 am-onimg" style={{ color: '#fff', fontSize: 'clamp(30px,5vw,56px)' }}>Tenha o mar como seu vizinho.</h2>
          <div style={{ marginTop: 38 }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="am-cta am-cta-light">Atendimento Exclusivo</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: t.navyDark, color: t.onDarkMuted, padding: 'clamp(56px,9vh,96px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 'clamp(28px,5vw,56px)' }}>
          <div>
            <div style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.22em', fontSize: 18, color: t.onDark, textTransform: 'uppercase' }}>Stiven Allan</div>
            <p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6 }}>Imóveis de alto padrão em Santa Catarina.<br />CRECI/RS 60.275</p>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Contato</div>
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: t.onDarkMuted, textDecoration: 'none', fontSize: 14 }}>WhatsApp &middot; (48) 99164-2332</a>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Empreendimento</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>Águas de Marano Residencial<br />Construtora Fontana<br />Centro, Balneário Piçarras/SC</p>
          </div>
        </div>
        <div style={{ maxWidth: 1180, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(234,241,246,0.12)', fontSize: 12 }}>
          &copy; {new Date().getFullYear()} Stiven Allan. Imagens meramente ilustrativas. Frente mar exclusivo &mdash; valores sob consulta.
        </div>
      </footer>

      {/* WHATSAPP FLUTUANTE */}
      <a href={WPP} target="_blank" rel="noopener noreferrer" className="am-wa" aria-label="Falar no WhatsApp com Stiven Allan">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.973-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
      </a>
    </main>
  )
}
