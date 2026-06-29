import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

// Hotsite premium Fidenza Residencial (Fontana, Cruzeiro do Sul, Criciuma/SC). Padrao EPIC.
// WhatsApp do corretor Stiven (NAO usar numeros internos da Fontana).
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Fidenza%20Residencial.'
const CATALOGO_PDF = 'https://estilofontana.com.br/upload/empreendimento/catalogo/fidenza-residencial-1725383545.pdf'
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
  heroFrontal: 'https://estilofontana.com.br/images/2024/09/02/f-f-fachada-frontal-r05-ef-web-66d61ccec113e.jpg?fm=webp',
  fachadaAngular: 'https://estilofontana.com.br/images/2024/09/02/f-f-fachada-angular-r05-ef-web-66d61cd5390b1.jpg?fm=webp',
  aerea: 'https://estilofontana.com.br/images/2025/03/25/f-f-voo-passaro-ef-67e2adc29eced.jpg?w=1120&h=645&fm=webp',
  acessoPrincipal: 'https://estilofontana.com.br/images/2024/09/02/f-f-acesso-principal-r05-ef-web-66d61eada23cc.jpg?w=1120&h=645&fm=webp',
  piscina: 'https://estilofontana.com.br/images/2024/09/12/f-f-piscina-com-prainha-ef-web-66e31ed990718.jpg?w=1120&h=645&fm=webp',
  academia: 'https://estilofontana.com.br/images/2024/09/02/f-f-academia-com-varanda-ef-66d61eeab74cd.jpg?w=1120&h=645&fm=webp',
  brinquedoteca: 'https://estilofontana.com.br/images/2024/09/02/f-f-brinquedoteca-ef-web-66d61eb2047ac.jpg?w=1120&h=645&fm=webp',
  playground: 'https://estilofontana.com.br/images/2024/09/02/f-f-playground-ef-web-66d61ecc672f3.jpg?w=1120&h=645&fm=webp',
  mapa: 'https://estilofontana.com.br/images/2024/07/15/mapa-fidenza-66952783e227e.jpg?fm=webp',
  video: 'https://www.youtube.com/embed/SNJ_EynBBOA',
}

const GALERIA: { src: string; alt: string; label: string }[] = [
  { src: IMG.heroFrontal, alt: 'Fidenza Residencial — fachada frontal, Cruzeiro do Sul, Criciúma/SC', label: 'Fachada Principal' },
  { src: IMG.fachadaAngular, alt: 'Fidenza Residencial — fachada angular, perspectiva lateral', label: 'Perspectiva' },
  { src: IMG.aerea, alt: 'Fidenza Residencial — vista aérea do empreendimento no Cruzeiro do Sul', label: 'Vista Aérea' },
  { src: IMG.acessoPrincipal, alt: 'Fidenza Residencial — hall de acesso principal com pé-direito duplo', label: 'Acesso Principal' },
  { src: IMG.piscina, alt: 'Fidenza Residencial — piscina adulto e infantil com deck molhado', label: 'Piscina & Deck' },
  { src: IMG.academia, alt: 'Fidenza Residencial — academia com varanda e vista privilegiada', label: 'Academia' },
  { src: IMG.brinquedoteca, alt: 'Fidenza Residencial — brinquedoteca para as crianças', label: 'Brinquedoteca' },
  { src: IMG.playground, alt: 'Fidenza Residencial — playground ao ar livre', label: 'Playground' },
]

const DIFERENCIAIS: string[] = [
  'Hall com pé-direito duplo — grandiosidade logo na entrada',
  'Sacada com churrasqueira a carvão e guarda-corpo de vidro',
  'Persianas automatizadas nos dormitórios',
  'Manta acústica entre pavimentos para máximo conforto sonoro',
  'Fechadura digital de alta segurança',
  'Tubulação de água quente com espera para recirculação',
  'Espera para split em todos os ambientes',
  'Espera para coifa na cozinha',
  'Nichos embutidos nos banheiros',
  'Rebaixo em gesso com acabamento refinado',
]

const AMENIDADES: string[] = [
  'Piscina adulto e infantil com deck molhado',
  'Academia com varanda panorâmica',
  'Salão de festas',
  'Brinquedoteca',
  'Playground ao ar livre',
  'Espaço de lazer integrado',
  'Câmeras de segurança em todo o condomínio',
  'Gerador para as áreas comuns',
  'Espera para carregador de carro elétrico',
]

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Fidenza Residencial — Alto Padrão Criciúma/SC',
  description: 'Fidenza Residencial (Construtora Fontana): apartamentos de alto padrão no Cruzeiro do Sul, Criciúma/SC. 3 suítes, 149 a 161 m², 2 aptos por andar. Financiamento direto. Atendimento exclusivo com Stiven Allan.',
  keywords: ['Fidenza Residencial', 'apartamento alto padrão Criciúma', 'lançamento Fontana', 'Cruzeiro do Sul Criciúma', 'Stiven Allan corretor SC'],
  alternates: { canonical: `${SITE_URL}/empreendimento/fontana/fidenza-residencial-cruzeiro-do-sul-criciuma-sc` },
  openGraph: {
    title: 'Fidenza Residencial — Sua autenticidade em cada detalhe.',
    description: 'Fidenza Residencial (Construtora Fontana): apartamentos de alto padrão no Cruzeiro do Sul, Criciúma/SC. 3 suítes, 149 a 161 m², 2 aptos por andar. Financiamento direto. Atendimento exclusivo com Stiven Allan.',
    url: `${SITE_URL}/empreendimento/fontana/fidenza-residencial-cruzeiro-do-sul-criciuma-sc`,
    images: [{ url: IMG.aerea, width: 1200, height: 630, alt: 'Fidenza Residencial — fachada' }],
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fidenza Residencial — Sua autenticidade em cada detalhe.',
    description: 'Fidenza Residencial (Construtora Fontana): apartamentos de alto padrão no Cruzeiro do Sul, Criciúma/SC. 3 suítes, 149 a 161 m², 2 aptos por andar. Financiamento direto. Atendimento exclusivo com Stiven Allan.',
    images: [IMG.aerea],
  },
  robots: { index: true, follow: true },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'RealEstateAgent',
      name: 'Stiven Allan',
      description: 'Corretor de imóveis CRECI 60.275 especialista em lançamentos de alto padrão no Sul de Santa Catarina.',
      url: SITE_URL,
      telephone: '+5548991642332',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Criciúma',
        addressRegion: 'SC',
        addressCountry: 'BR',
      },
    },
    {
      '@type': 'Apartment',
      name: 'Fidenza Residencial',
      description: 'Apartamentos de alto padrão no Cruzeiro do Sul, Criciúma/SC: 3 dormitórios (todos suítes), 149 a 161 m² privativos, 2 unidades por andar, com financiamento direto com a Construtora Fontana.',
      image: IMG.heroFrontal,
      numberOfRooms: 3,
      numberOfBathroomsTotal: 3,
      floorSize: { '@type': 'QuantitativeValue', minValue: 149, maxValue: 161, unitCode: 'MTK' },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rua São José, 1000',
        addressLocality: 'Criciúma',
        addressRegion: 'SC',
        addressCountry: 'BR',
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Lançamentos Criciúma', item: `${SITE_URL}/lancamentos/criciuma-sc` },
        { '@type': 'ListItem', position: 3, name: 'Fidenza Residencial', item: `${SITE_URL}/empreendimento/fontana/fidenza-residencial-cruzeiro-do-sul-criciuma-sc` },
      ],
    },
  ],
}

export default function FidenzaPage() {
  return (
    <main lang="pt-BR" style={{ background: t.bg, color: t.ink, fontFamily: t.body, overflowX: 'hidden' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <style>{`
        html { scroll-behavior: smooth; }
        .fz-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: ${t.gold}; font-family: ${t.body}; font-weight: 500; }
        .fz-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.04; text-shadow: 0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4); font-size: clamp(40px,8vw,104px); margin: 0; }
        .fz-onimg { text-shadow: 0 1px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5); }
        .fz-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.16em; line-height: 1.1; font-size: clamp(26px,4vw,46px); margin: 0; }
        .fz-serif { font-family: ${t.serif}; font-style: italic; font-weight: 400; }
        .fz-rule { width: 56px; height: 1px; background: ${t.gold}; border: 0; }
        .fz-cta { display: inline-block; font-family: ${t.body}; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; padding: 14px 32px; border: 1px solid ${t.ink}; color: ${t.ink}; text-decoration: none; transition: background .35s ease, color .35s ease; }
        .fz-cta:hover { background: ${t.gold}; color: #fff; border-color: ${t.gold}; }
        .fz-cta-light { color: ${t.onDark}; border-color: rgba(244,241,234,0.55); }
        .fz-cta-light:hover { background: ${t.onDark}; color: ${t.dark}; border-color: ${t.onDark}; }
        .fz-navlink { font-family: ${t.body}; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.85); text-decoration: none; transition: color .3s ease; }
        .fz-navlink:hover { color: #fff; }
        .fz-fade { opacity: 0; transform: translateY(24px); animation: fzfade .9s ease forwards; }
        .fz-fade-d1 { animation-delay: .15s; }
        .fz-fade-d2 { animation-delay: .3s; }
        .fz-fade-d3 { animation-delay: .45s; }
        @keyframes fzfade { to { opacity: 1; transform: none; } }
        .fz-gcard { position: relative; overflow: hidden; cursor: zoom-in; }
        .fz-gcard img { transition: transform .9s ease; }
        .fz-gcard:hover img { transform: scale(1.05); }
        .fz-amen { border-bottom: 1px solid ${t.line}; padding: 18px 0; display: flex; align-items: center; gap: 16px; }
        .fz-wa { position: fixed; right: 18px; bottom: 18px; z-index: 90; width: 54px; height: 54px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.22); text-decoration: none; }
        .fz-mondrian { position: absolute; inset: 0; pointer-events: none; overflow: hidden; opacity: 0.035; }
        .fz-mondrian line { stroke: ${t.ink}; stroke-width: 1; }
        @media (max-width: 760px) { .fz-nav-links { display: none !important; } }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px', backdropFilter: 'blur(6px)', background: 'rgba(250,250,248,0.0)', borderBottom: '1px solid transparent' }}>
        <span style={{ fontFamily: t.display, fontWeight: 600, letterSpacing: '0.18em', fontSize: 15, color: t.onDark, textTransform: 'uppercase', mixBlendMode: 'difference' }}>Fidenza</span>
        <div className="fz-nav-links" style={{ display: 'flex', gap: 28 }}>
          <a href="#conceito" className="fz-navlink">O Residencial</a>
          <a href="#galeria" className="fz-navlink">Galeria</a>
          <a href="#residencias" className="fz-navlink">As Residências</a>
          <a href="#diferenciais" className="fz-navlink">Diferenciais</a>
          <a href="#localizacao" className="fz-navlink">Localização</a>
        </div>
        <a href={WPP} target="_blank" rel="noopener noreferrer" className="fz-cta" style={{ borderColor: 'rgba(244,241,234,0.6)', color: t.onDark, padding: '10px 22px', mixBlendMode: 'difference' }}>Falar com Stiven</a>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end' }}>
        {/* Mondrian grid motif — finas linhas decorativas inspiradas em Piet Mondrian */}
        <svg className="fz-mondrian" aria-hidden="true" viewBox="0 0 1440 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="180" x2="1440" y2="180" />
          <line x1="0" y1="450" x2="1440" y2="450" />
          <line x1="0" y1="720" x2="1440" y2="720" />
          <line x1="320" y1="0" x2="320" y2="900" />
          <line x1="720" y1="0" x2="720" y2="900" />
          <line x1="1120" y1="0" x2="1120" y2="900" />
        </svg>
        <Image
          src={IMG.heroFrontal}
          alt="Fidenza Residencial — fachada frontal, Cruzeiro do Sul, Criciúma/SC, em frente ao Criciúma Clube"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,19,15,0.38) 0%, rgba(20,19,15,0.14) 40%, rgba(20,19,15,0.84) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px) 12vh', maxWidth: 1020 }}>
          <p className="fz-eyebrow fz-onimg fz-fade" style={{ color: t.gold, marginBottom: 14 }}>Construtora Fontana — Cruzeiro do Sul, Criciúma/SC</p>
          <h1 className="fz-h1 fz-fade fz-fade-d1" style={{ color: t.onDark }}>Fidenza Residencial</h1>
          <p className="fz-serif fz-fade fz-fade-d2" style={{ color: t.gold, fontSize: 'clamp(22px,3.4vw,38px)', marginTop: 14, marginBottom: 34 }}>Sua autenticidade em cada detalhe.</p>
          <div className="fz-fade fz-fade-d3" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="fz-cta" style={{ borderColor: t.gold, color: t.onDark }}>Atendimento exclusivo</a>
            <a href="#conceito" className="fz-cta" style={{ borderColor: 'rgba(244,241,234,0.4)', color: t.onDark }}>Conheça o residencial</a>
          </div>
        </div>
      </section>

      {/* CONCEITO */}
      <section id="conceito" style={{ position: 'relative', padding: 'clamp(90px,16vh,180px) clamp(18px,5vw,56px)' }}>
        {/* Mondrian grid motif sutil no fundo */}
        <svg className="fz-mondrian" aria-hidden="true" viewBox="0 0 1440 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="300" x2="1440" y2="300" />
          <line x1="0" y1="600" x2="1440" y2="600" />
          <line x1="480" y1="0" x2="480" y2="900" />
          <line x1="960" y1="0" x2="960" y2="900" />
        </svg>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p className="fz-eyebrow" style={{ color: t.goldDark, marginBottom: 22 }}>O Residencial</p>
          <h2 className="fz-h2">Uma obra de arte<br />para chamar de lar</h2>
          <hr className="fz-rule" style={{ margin: '34px auto' }} />
          <p style={{ fontSize: 'clamp(20px,2.8vw,32px)', lineHeight: 1.55, color: t.ink, margin: '0 0 28px', fontFamily: t.serif, fontStyle: 'italic' }}>
            Nasce em Criciúma um lugar que acompanha seu momento de vida. Um encontro de linhas horizontais e verticais, que se tornam uma obra de arte.
          </p>
          <p style={{ fontSize: 'clamp(16px,1.9vw,21px)', lineHeight: 1.75, color: t.muted, margin: '0 0 20px', maxWidth: 680, marginLeft: 'auto', marginRight: 'auto' }}>
            Onde o seu estilo de vida autêntico se transforma em seu novo lar.
          </p>
          <p className="fz-serif" style={{ fontSize: 'clamp(17px,2.1vw,24px)', color: t.gold, marginTop: 28 }}>
            A originalidade de viver em um lugar que se encaixa no que você é.
          </p>
          <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.muted }}>Apenas 2 apartamentos por andar</span>
            <span style={{ width: 1, height: 28, background: t.line, display: 'inline-block' }} />
            <span style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.muted }}>22 unidades · 11 pavimentos</span>
            <span style={{ width: 1, height: 28, background: t.line, display: 'inline-block' }} />
            <span style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.muted }}>Entrega prevista dez/2027</span>
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section id="video" style={{ padding: '0 clamp(0px,4vw,56px) clamp(40px,8vh,96px)', background: t.bg }}>
        <p className="fz-eyebrow" style={{ textAlign: 'center', marginBottom: 26, color: t.goldDark }}>Conheça o Fidenza</p>
        <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: t.dark }}>
          <iframe
            src={IMG.video}
            title="Vídeo Fidenza Residencial — Construtora Fontana"
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
          <p className="fz-eyebrow" style={{ color: t.gold }}>Galeria</p>
          <h2 className="fz-h2" style={{ color: t.onDark }}>Linhas que<br />se tornam arte</h2>
          <p className="fz-serif" style={{ fontSize: 'clamp(18px,2.4vw,26px)', lineHeight: 1.6, color: t.onDarkMuted, maxWidth: 620, marginTop: 14 }}>
            Arquitetura inspirada na precisão geométrica de Piet Mondrian.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, padding: '0 14px' }}>
          {GALERIA.map((g, i) => (
            <figure key={i} className="fz-gcard" style={{ position: 'relative', margin: 0, aspectRatio: '4 / 3' }}>
              <Image
                src={g.src}
                alt={g.alt}
                fill
                loading="lazy"
                sizes="(max-width: 760px) 100vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
              <figcaption style={{ position: 'absolute', left: 16, bottom: 14, zIndex: 2, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#fff', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>{g.label}</figcaption>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.45) 100%)' }} />
            </figure>
          ))}
        </div>
      </section>

      {/* AS RESIDÊNCIAS */}
      <section id="residencias" style={{ background: t.dark, color: t.onDark, borderTop: '1px solid rgba(244,241,234,0.08)', padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <p className="fz-eyebrow" style={{ color: t.gold, marginBottom: 18 }}>As Residências</p>
          <h2 className="fz-h2" style={{ color: t.onDark }}>Espaço para o seu<br />estilo autêntico</h2>
          <p className="fz-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 56 }}>
            Apenas 2 apartamentos por andar. 22 unidades em 11 pavimentos.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'clamp(24px,4vw,48px)', marginBottom: 40 }}>
            {[
              { n: '3', l: 'Dormitórios (todos suítes)' },
              { n: '149–161', l: 'm² privativos' },
              { n: '2', l: 'Apartamentos por andar' },
              { n: '2', l: 'Elevadores' },
              { n: '11', l: 'Pavimentos' },
            ].map((it, i) => (
              <div key={i}>
                <div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '0.04em', lineHeight: 1, color: t.gold }}>{it.n}</div>
                <div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDarkMuted, marginTop: 12 }}>{it.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 56, opacity: 0.75 }}>
            <span style={{ width: 32, height: 1, background: t.gold, display: 'inline-block' }} />
            <span style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(26px,3.2vw,42px)', color: t.gold, letterSpacing: '0.06em' }}>Dez/2027</span>
            <span style={{ width: 32, height: 1, background: t.gold, display: 'inline-block' }} />
            <span style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.onDarkMuted }}>Entrega prevista</span>
          </div>iv>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={CATALOGO_PDF} target="_blank" rel="noopener noreferrer" className="fz-cta fz-cta-light">Baixar Catálogo & Plantas</a>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="fz-cta" style={{ borderColor: t.gold, color: t.onDark }}>Atendimento exclusivo</a>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS DAS UNIDADES */}
      <section id="diferenciais" style={{ position: 'relative', padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        {/* Mondrian grid sutil */}
        <svg className="fz-mondrian" aria-hidden="true" viewBox="0 0 1440 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="225" x2="1440" y2="225" />
          <line x1="0" y1="675" x2="1440" y2="675" />
          <line x1="360" y1="0" x2="360" y2="900" />
          <line x1="1080" y1="0" x2="1080" y2="900" />
        </svg>
        <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
            <p className="fz-eyebrow" style={{ color: t.goldDark, marginBottom: 16 }}>Diferenciais das Unidades</p>
            <h2 className="fz-h2">Detalhes que<br />definem o padrão</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: t.line }}>
            {DIFERENCIAIS.map((d, i) => (
              <div key={i} style={{ background: t.bg, padding: 'clamp(28px,4vw,44px)' }}>
                <div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 22, color: t.gold, marginBottom: 14 }}>{String(i + 1).padStart(2, '0')}</div>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: t.ink }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAZER & ÁREAS COMUNS */}
      <section style={{ background: t.bg, borderTop: '1px solid ' + t.line, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(40px,6vw,80px)', alignItems: 'center' }}>
          <div>
            <p className="fz-eyebrow" style={{ color: t.goldDark, marginBottom: 22 }}>Lazer & Áreas Comuns</p>
            <h2 className="fz-h2" style={{ marginBottom: 32 }}>Cada detalhe<br />pensado para você</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {AMENIDADES.map((a, i) => (
                <li key={i} className="fz-amen">
                  <span style={{ width: 28, height: 1, background: t.gold, flexShrink: 0 }} />
                  <span style={{ fontSize: 15, color: t.ink }}>{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <figure style={{ margin: 0, position: 'relative', aspectRatio: '4/3', overflow: 'hidden', gridColumn: '1 / -1' }}>
              <Image src={IMG.piscina} alt="Piscina adulto e infantil com deck molhado — Fidenza Residencial" fill loading="lazy" sizes="(max-width: 760px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
            </figure>
            <figure style={{ margin: 0, position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
              <Image src={IMG.academia} alt="Academia com varanda panorâmica — Fidenza Residencial" fill loading="lazy" sizes="25vw" style={{ objectFit: 'cover' }} />
            </figure>
            <figure style={{ margin: 0, position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
              <Image src={IMG.playground} alt="Playground ao ar livre — Fidenza Residencial" fill loading="lazy" sizes="25vw" style={{ objectFit: 'cover' }} />
            </figure>
          </div>
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section id="localizacao" style={{ background: t.dark, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(40px,6vw,80px)', alignItems: 'center' }}>
          <div>
            <p className="fz-eyebrow" style={{ color: t.gold, marginBottom: 22 }}>Localização</p>
            <h2 className="fz-h2" style={{ color: t.onDark, marginBottom: 28 }}>No coração do<br />Cruzeiro do Sul</h2>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: t.onDarkMuted, marginBottom: 24 }}>
              Rua São José, 1000, esq. Rua Monteiro Lobato<br />
              Cruzeiro do Sul — Criciúma/SC<br />
              Em frente ao Criciúma Clube.
            </p>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="fz-cta fz-cta-light">Quero conhecer o endereço</a>
          </div>
          <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
            <Image
              src={IMG.mapa}
              alt="Mapa de localização do Fidenza Residencial — Rua São José, Cruzeiro do Sul, Criciúma/SC"
              fill
              loading="lazy"
              sizes="(max-width: 760px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* FINANCIAMENTO DIRETO */}
      <section style={{ background: t.gold, color: '#1A1916', padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <p className="fz-eyebrow" style={{ color: '#5a4a1f', marginBottom: 18 }}>Financiamento Direto</p>
          <h2 className="fz-h2" style={{ color: '#1A1916' }}>O privilégio de comprar sem banco</h2>
          <p className="fz-serif" style={{ color: 'rgba(26,25,22,0.78)', fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 60 }}>
            Sem burocracia, sem intermediários. Liberdade total, direto com a construtora, em 3 passos.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 'clamp(28px,4vw,52px)' }}>
            {[
              { n: '01', ti: 'Converse com o corretor', d: 'Atendimento exclusivo e personalizado com Stiven Allan para entender o seu momento e as melhores condições.' },
              { n: '02', ti: 'Escolha a sua unidade', d: 'Selecione o apartamento ideal para o seu estilo de vida, com total liberdade de escolha.' },
              { n: '03', ti: 'Negocie direto com a Fontana', d: 'Condições facilitadas, sem banco, sem burocracia. O privilégio de quem compra com autenticidade.' },
            ].map((it, i) => (
              <div key={i} style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 38, color: '#1A1916', marginBottom: 14 }}>{it.n}</div>
                <div style={{ fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12, color: '#1A1916' }}>{it.ti}</div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'rgba(26,25,22,0.72)' }}>{it.d}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 56 }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="fz-cta" style={{ borderColor: '#1A1916', color: '#1A1916' }}>Iniciar atendimento</a>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ position: 'relative', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Image
          src={IMG.fachadaAngular}
          alt="Fidenza Residencial — perspectiva angular da fachada, Cruzeiro do Sul, Criciúma/SC"
          fill
          loading="lazy"
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,19,15,0.62)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px)', maxWidth: 880 }}>
          <p className="fz-eyebrow fz-onimg" style={{ color: t.gold, marginBottom: 22 }}>Atendimento Exclusivo</p>
          <h2 className="fz-serif fz-onimg" style={{ color: '#fff', fontSize: 'clamp(30px,5vw,56px)', fontStyle: 'italic', margin: '0 0 38px' }}>Sua autenticidade em cada detalhe.</h2>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="fz-cta fz-cta-light">Atendimento Exclusivo</a>
            <a href={CATALOGO_PDF} target="_blank" rel="noopener noreferrer" className="fz-cta" style={{ borderColor: t.gold, color: t.onDark }}>Baixar Catálogo</a>
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
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 14, color: t.onDarkMuted, textDecoration: 'none', marginBottom: 10 }}>WhatsApp: (48) 99164-2332</a>
            <a href="https://stivenallan.vercel.app" style={{ display: 'block', fontSize: 14, color: t.onDarkMuted, textDecoration: 'none' }}>stivenallan.vercel.app</a>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Sobre o Residencial</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>Fidenza Residencial<br />Construtora Fontana<br />Cruzeiro do Sul — Criciúma/SC<br />Rua São José, 1000</p>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Empreendimentos</div>
            <Link href="/empreendimento/fontana/monte-leone-centro-criciuma-sc" style={{ display: 'block', fontSize: 14, color: t.onDarkMuted, textDecoration: 'none', marginBottom: 8 }}>Monte Leone Residencial</Link>
            <Link href="/empreendimento/fontana/lavis-residencial-centro-criciuma-sc" style={{ display: 'block', fontSize: 14, color: t.onDarkMuted, textDecoration: 'none', marginBottom: 8 }}>Lavis Residencial</Link>
            <Link href="/empreendimento/fontana/aguas-de-marano-frente-mar-balneario-picarras-sc" style={{ display: 'block', fontSize: 14, color: t.onDarkMuted, textDecoration: 'none' }}>Águas de Marano Residencial</Link>
          </div>
        </div>
        <div style={{ maxWidth: 1180, margin: '48px auto 0', paddingTop: 28, borderTop: '1px solid rgba(244,241,234,0.1)', fontSize: 12, color: 'rgba(244,241,234,0.35)', letterSpacing: '0.12em' }}>
          © 2024 Stiven Allan · Imóveis de alto padrão no Sul Catarinense · Preços sob consulta
        </div>
      </footer>

      {/* WHATSAPP FLUTUANTE */}
      <a href={WPP} target="_blank" rel="noopener noreferrer" className="fz-wa" aria-label="Falar no WhatsApp com Stiven Allan">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.973-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
        </svg>
      </a>
    </main>
  )
}
