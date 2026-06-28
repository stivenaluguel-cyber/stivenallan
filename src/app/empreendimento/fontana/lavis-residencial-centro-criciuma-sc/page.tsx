import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

// Hotsite premium Lavis Residencial (Fontana, Centro de Criciuma/SC). Padrao EPIC.
// WhatsApp do corretor Stiven (NAO usar numeros internos da Fontana).
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Lavis%20Residencial.'
const CATALOGO_PDF = 'https://estilofontana.com.br/upload/empreendimento/catalogo/lavis-residencial-1764352426.pdf'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'

const t = {
  bg: '#FAFAF8',
  ink: '#1A1916',
  gold: '#B89B5E',
  goldDark: '#8A6D2F',
  muted: '#6E685E',
  line: 'rgba(26,25,22,0.12)',
  dark: '#14130F',
  onDark: '#F4F1EA',
  onDarkMuted: 'rgba(244,241,234,0.66)',
  display: "'Bricolage Grotesque', system-ui, sans-serif",
  serif: "'Cormorant Garamond', Georgia, serif",
  body: "'Hanken Grotesk', system-ui, sans-serif",
}

const IMG = {
  heroFrontal: 'https://estilofontana.com.br/upload/2025/11/26/1-f-la-fachada-frontal-r03-web-6926d44adbc25.jpg',
  fachadaAngular: 'https://estilofontana.com.br/upload/2025/11/26/2-f-la-fachada-angular-r03-web-6926d44aad3cb.jpg',
  fotomontagem: 'https://estilofontana.com.br/images/2025/11/26/27-f-la-fotomontagem-op-02-ef-web-6926e7faba3f4.jpg?fm=webp',
  mapa: 'https://estilofontana.com.br/images/2025/11/26/lavis-6926d96bce7ad.jpg?fm=webp',
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
    title: 'Lavis Residencial — Sofisticação em movimento',
    description: 'Apartamentos de alto padrão no Centro de Criciúma/SC. 3 suítes, 125 a 132 m², financiamento direto com a construtora.',
    url: `${SITE_URL}/empreendimento/fontana/lavis-residencial-centro-criciuma-sc`,
    images: [{ url: IMG.fotomontagem, width: 1200, height: 630, alt: 'Lavis Residencial — fachada' }],
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lavis Residencial — Sofisticação em movimento',
    description: 'Apartamentos de alto padrão no Centro de Criciúma/SC. 3 suítes, 125 a 132 m², financiamento direto com a construtora.',
    images: [IMG.fotomontagem],
  },
  robots: { index: true, follow: true },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <style>{`
        html { scroll-behavior: smooth; }
        .lv-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: ${t.gold}; font-family: ${t.body}; font-weight: 500; }
        .lv-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.04; text-shadow: 0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4); font-size: clamp(40px,8vw,104px); margin: 0; }
        .lv-onimg { text-shadow: 0 1px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5); }
        .lv-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.16em; line-height: 1.1; font-size: clamp(26px,4vw,46px); margin: 0; }
        .lv-serif { font-family: ${t.serif}; font-style: italic; font-weight: 400; }
        .lv-rule { width: 56px; height: 1px; background: ${t.gold}; border: 0; }
        .lv-cta { display: inline-block; font-family: ${t.body}; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: ${t.ink}; border: 1px solid ${t.gold}; padding: 16px 34px; text-decoration: none; transition: background .35s ease, color .35s ease; cursor: pointer; }
        .lv-cta:hover { background: ${t.gold}; color: #fff; }
        .lv-cta-light { color: ${t.onDark}; border-color: rgba(244,241,234,0.55); }
        .lv-cta-light:hover { background: ${t.onDark}; color: ${t.dark}; }
        .lv-navlink { font-family: ${t.body}; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.85); text-decoration: none; transition: color .3s ease; }
        .lv-navlink:hover { color: #fff; }
        .lv-fade { opacity: 0; transform: translateY(24px); animation: lvfade .9s ease forwards; }
        @keyframes lvfade { to { opacity: 1; transform: none; } }
        .lv-gcard { position: relative; overflow: hidden; }
        .lv-gcard img { transition: transform .9s ease; }
        .lv-gcard:hover img { transform: scale(1.05); }
        .lv-amen { border-bottom: 1px solid ${t.line}; padding: 18px 0; display: flex; align-items: center; gap: 16px; }
        .lv-wa { position: fixed; right: 18px; bottom: 18px; z-index: 90; width: 54px; height: 54px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.22); text-decoration: none; }
        @media (max-width: 760px) { .lv-nav-links { display: none !important; } }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px', backdropFilter: 'blur(6px)', background: 'rgba(250,250,248,0.0)', borderBottom: '1px solid transparent' }}>
        <span style={{ fontFamily: t.display, fontWeight: 600, letterSpacing: '0.18em', fontSize: 15, color: t.onDark, textTransform: 'uppercase', mixBlendMode: 'difference' }}>Lavis</span>
        <div className="lv-nav-links" style={{ display: 'flex', gap: 28 }}>
          <a href="#conceito" className="lv-navlink">O Residencial</a>
          <a href="#galeria" className="lv-navlink">Galeria</a>
          <a href="#residencias" className="lv-navlink">As Residências</a>
          <a href="#diferenciais" className="lv-navlink">Diferenciais</a>
          <a href="#localizacao" className="lv-navlink">Localização</a>
        </div>
        <a href={WPP} target="_blank" rel="noopener noreferrer" className="lv-navlink" style={{ border: '1px solid rgba(255,255,255,0.5)', padding: '10px 18px' }}>Atendimento</a>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end' }}>
        <Image src={IMG.heroFrontal} alt="Fachada frontal do Lavis Residencial, no Centro de Criciúma/SC" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,19,15,0.42) 0%, rgba(20,19,15,0.16) 38%, rgba(20,19,15,0.82) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 28px 12vh', maxWidth: 980 }}>
          <p className="lv-eyebrow lv-onimg" style={{ color: t.gold }}>Lavis Residencial — Centro, Criciúma/SC</p>
          <h1 className="lv-h1" style={{ color: t.onDark }}>Lavis Residencial</h1>
          <p className="lv-serif" style={{ color: t.gold, fontSize: 'clamp(22px,3.4vw,38px)', marginTop: 14, marginBottom: 34 }}>Sofisticação em movimento.</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="lv-cta" style={{ borderColor: t.gold, color: t.onDark }}>Atendimento exclusivo</a>
            <a href="#conceito" className="lv-cta" style={{ borderColor: 'rgba(244,241,234,0.4)', color: t.onDark }}>Conheça o residencial</a>
          </div>
        </div>
      </section>

      {/* CONCEITO */}
      <section id="conceito" style={{ padding: 'clamp(90px,16vh,180px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <p className="lv-eyebrow" style={{ color: t.goldDark, marginBottom: 22 }}>O Residencial</p>
          <h2 className="lv-h2">No seu ritmo,<br />em equilíbrio</h2>
          <hr className="lv-rule" style={{ margin: '34px auto' }} />
          <p style={{ fontSize: 'clamp(20px,2.8vw,32px)', lineHeight: 1.5, color: t.ink, margin: '0 0 26px', fontFamily: t.serif, fontStyle: 'italic' }}>
            No Lavis, a vida moderna encontra o equilíbrio. E, mesmo em constante movimento, a harmonia permanece.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: t.muted, maxWidth: 620, margin: '0 auto' }}>
            Um respiro em meio à rotina. Traços orgânicos e curvas que transmitem calmaria, no centro da cidade, no seu ritmo.
          </p>
        </div>
      </section>

      {/* VIDEO */}
      <section id="video" style={{ padding: '0 clamp(0px,4vw,56px) clamp(40px,8vh,96px)' }}>
        <p className="lv-eyebrow" style={{ textAlign: 'center', marginBottom: 26, color: t.goldDark }}>Conheça o Lavis</p>
        <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: t.dark }}>
          <iframe
            src={IMG.video}
            title="Vídeo Lavis Residencial"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" style={{ background: t.dark, padding: 'clamp(80px,14vh,160px) 0' }}>
        <div style={{ padding: '0 28px', maxWidth: 1280, margin: '0 auto 6vh' }}>
          <p className="lv-eyebrow" style={{ color: t.gold }}>Galeria</p>
          <h2 className="lv-h2" style={{ color: t.onDark }}>Um respiro<br />em meio à rotina</h2>
          <p className="lv-serif" style={{ fontSize: 'clamp(18px,2.4vw,26px)', lineHeight: 1.6, color: t.onDarkMuted, maxWidth: 620, marginTop: 14 }}>
            Traços orgânicos e curvas que transmitem calmaria.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, padding: '0 14px' }}>
          {GALERIA.map((g, i) => (
            <figure key={i} className="lv-gcard" style={{ position: 'relative', margin: 0, aspectRatio: '4 / 3' }}>
              <Image src={g.src} alt={g.alt} fill loading="lazy" sizes="(max-width: 760px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
              <figcaption style={{ position: 'absolute', left: 16, bottom: 14, zIndex: 2, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#fff', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>{g.label}</figcaption>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.45) 100%)' }} />
            </figure>
          ))}
        </div>
      </section>

      {/* AS RESIDENCIAS */}
      <section id="residencias" style={{ background: t.dark, color: t.onDark, borderTop: '1px solid rgba(244,241,234,0.1)', padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <p className="lv-eyebrow" style={{ color: t.gold, marginBottom: 18 }}>As Residências</p>
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
                <div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(34px,5vw,58px)', letterSpacing: '0.04em', lineHeight: 1, color: t.gold }}>{it.n}</div>
                <div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDarkMuted, marginTop: 12 }}>{it.l}</div>
              </div>
            ))}
          </div>
          <a href={CATALOGO_PDF} target="_blank" rel="noopener noreferrer" className="lv-cta lv-cta-light">Baixar Catálogo &amp; Plantas</a>
        </div>
      </section>

      {/* DIFERENCIAIS DAS UNIDADES */}
      <section id="diferenciais" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
            <p className="lv-eyebrow" style={{ color: t.goldDark, marginBottom: 16 }}>Diferenciais das Unidades</p>
            <h2 className="lv-h2">Detalhes que elevam o morar</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, background: t.line }}>
            {DIFERENCIAIS.map((d, i) => (
              <div key={i} style={{ background: t.bg, padding: 'clamp(28px,4vw,44px)' }}>
                <div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 22, color: t.gold, marginBottom: 14 }}>{String(i + 1).padStart(2, '0')}</div>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: t.ink }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAZER & AREAS COMUNS */}
      <section style={{ background: t.bg, borderTop: '1px solid ' + t.line, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(40px,6vw,80px)', alignItems: 'center' }}>
          <div>
            <p className="lv-eyebrow" style={{ color: t.goldDark }}>Lazer &amp; Áreas Comuns</p>
            <h2 className="lv-h2">A harmonia<br />permanece</h2>
            <hr className="lv-rule" style={{ margin: '28px 0' }} />
            <div>
              {AMENIDADES.map((a, i) => (
                <div key={i} className="lv-amen">
                  <span style={{ color: t.gold, fontSize: 13 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontSize: 16, color: t.ink }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', aspectRatio: '3 / 4', minHeight: 360 }}>
            <Image src={IMG.fachadaAngular} alt="Fachada angular do Lavis Residencial, no Centro de Criciúma/SC" fill loading="lazy" sizes="(max-width: 760px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* LOCALIZACAO */}
      <section id="localizacao" style={{ background: t.dark, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(40px,6vw,80px)', alignItems: 'center' }}>
          <div>
            <p className="lv-eyebrow" style={{ color: t.gold }}>Localização</p>
            <h2 className="lv-h2" style={{ color: t.onDark }}>No centro da cidade,<br />no seu ritmo</h2>
            <hr className="lv-rule" style={{ margin: '28px 0' }} />
            <p style={{ fontSize: 18, lineHeight: 1.8, color: t.onDarkMuted, maxWidth: 460 }}>
              Rua Timóteo Batista, 53 — Centro, Criciúma/SC. A poucos passos de tudo o que importa, com a privacidade de um endereço de alto padrão.
            </p>
          </div>
          <div style={{ position: 'relative', aspectRatio: '4 / 3', minHeight: 320, border: '1px solid rgba(244,241,234,0.14)' }}>
            <Image src={IMG.mapa} alt="Mapa de localização do Lavis Residencial no Centro de Criciúma/SC" fill loading="lazy" sizes="(max-width: 760px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* FINANCIAMENTO DIRETO */}
      <section style={{ background: t.gold, color: '#1A1916', padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <p className="lv-eyebrow" style={{ color: '#5a4a1f', marginBottom: 18 }}>Financiamento Direto</p>
          <h2 className="lv-h2" style={{ color: '#1A1916' }}>A liberdade de comprar sem banco</h2>
          <p className="lv-serif" style={{ color: 'rgba(26,25,22,0.78)', fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 60 }}>Sem burocracia, sem intermediários. Direto com a construtora, em 3 passos.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 'clamp(28px,4vw,52px)' }}>
            {[
              { n: '01', ti: 'Converse com o corretor', d: 'Atendimento exclusivo e personalizado para entender o seu momento e as melhores condições.' },
              { n: '02', ti: 'Escolha a sua unidade', d: 'Personalize a planta e defina o apartamento ideal para o seu estilo de vida.' },
              { n: '03', ti: 'Negocie direto com a Fontana', d: 'Condições facilitadas, sem banco e sem burocracia. Privilégio de quem compra com liberdade.' },
            ].map((it, i) => (
              <div key={i} style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 38, color: '#1A1916', marginBottom: 14 }}>{it.n}</div>
                <div style={{ fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12, color: '#1A1916' }}>{it.ti}</div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'rgba(26,25,22,0.72)' }}>{it.d}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 56 }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="lv-cta" style={{ borderColor: '#1A1916', color: '#1A1916' }}>Falar com Stiven Allan</a>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ position: 'relative', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Image src={IMG.fotomontagem} alt="Lavis Residencial — fotomontagem no Centro de Criciúma/SC" fill loading="lazy" sizes="100vw" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,19,15,0.6)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px)', maxWidth: 880 }}>
          <p className="lv-eyebrow lv-onimg" style={{ color: t.gold, marginBottom: 22 }}>Atendimento Exclusivo</p>
          <h2 className="lv-serif lv-onimg" style={{ color: '#fff', fontSize: 'clamp(30px,5vw,56px)', fontStyle: 'italic' }}>Sofisticação em movimento.</h2>
          <div style={{ marginTop: 38 }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="lv-cta lv-cta-light">Atendimento Exclusivo</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: t.dark, color: t.onDarkMuted, padding: 'clamp(56px,9vh,96px) clamp(18px,5vw,56px)' }}>
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
        <div style={{ maxWidth: 1180, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(244,241,234,0.12)', fontSize: 12 }}>
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
