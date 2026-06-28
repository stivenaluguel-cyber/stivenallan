import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

// Hotsite premium Monte Leone Residencial (Fontana, Centro Criciuma/SC). Padrao EPIC.
// WhatsApp do corretor Stiven (NAO usar numeros internos da Fontana).
const WPP = 'https://api.whatsapp.com/send?phone=5548991642332&text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Monte%20Leone%20Residencial.'
const CATALOGO_PDF = 'https://estilofontana.com.br/upload/empreendimento/catalogo/monte-leone-residencial-1756387346.pdf'
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
  body: "'Hanken Grotesk', system-ui, sans-serif",
}

const IMG = {
  heroFrontal: 'https://estilofontana.com.br/upload/2025/08/29/f-ml-fachada-frontal-ef-web-68b18b16935ef.jpg',
  heroAerea: 'https://estilofontana.com.br/images/2025/08/28/f-ml-voo-passaro-ef-web-68b0986133a09.jpg?fm=webp',
  fachadaAngular: 'https://estilofontana.com.br/upload/2025/08/29/f-ml-fachada-angular-ef-web-68b18b1717c8b.jpg',
  mapa: 'https://estilofontana.com.br/images/2025/08/27/monte-leone-68af608281484.png?fm=webp',
}

const GALERIA: { src: string; alt: string; label: string }[] = [
  { src: 'https://estilofontana.com.br/images/empreendimento/slideshows/monte-leone-residencial-68b0b93ab1366.jpg?fm=webp', alt: 'Monte Leone Residencial — perspectiva do empreendimento', label: 'O Residencial' },
  { src: 'https://estilofontana.com.br/images/empreendimento/slideshows/monte-leone-residencial-68b0b93dc2c1e.jpg?fm=webp', alt: 'Monte Leone Residencial — vista do conjunto arquitetonico', label: 'Arquitetura' },
  { src: 'https://estilofontana.com.br/images/empreendimento/slideshows/monte-leone-residencial-68b0b946d1e4d.jpg?fm=webp', alt: 'Monte Leone Residencial — detalhe da fachada', label: 'Fachada' },
  { src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-embasamento-ef-web-689a44e070a08.jpg', alt: 'Monte Leone — acesso e embasamento', label: 'Acesso Principal' },
  { src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-hall-ef-web-689a44f77e59d.jpg', alt: 'Monte Leone — hall com pe-direito duplo', label: 'Hall de Entrada' },
  { src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-lounge-ang-01-ef-web-689a455866961.jpg', alt: 'Monte Leone — lounge e passarela', label: 'Lounge' },
  { src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-piscina-ang-02-ef-web-689a457c22a22.jpg', alt: 'Monte Leone — piscina climatizada', label: 'Piscina' },
  { src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-deck-ang-02-ef-web-689a45c5b88a0.jpg', alt: 'Monte Leone — deck da piscina', label: 'Deck' },
  { src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-salao-de-festas-ef-web-689a523c5b4f9.jpg', alt: 'Monte Leone — salao de festas', label: 'Salao de Festas' },
  { src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-sala-de-jogos-ef-web-689a525cc816a.jpg', alt: 'Monte Leone — sala de jogos', label: 'Sala de Jogos' },
  { src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-area-gourmet-ef-web-689a527a76fde.jpg', alt: 'Monte Leone — espaco gourmet', label: 'Espaco Gourmet' },
  { src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-academia-interna-ef-web-689a5314a4c3a.jpg', alt: 'Monte Leone — academia interna', label: 'Academia' },
  { src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-brinquedoteca-ef-web-689a53473cfc9.jpg', alt: 'Monte Leone — brinquedoteca', label: 'Brinquedoteca' },
  { src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-playground-ef-web-689a538d46ff1.jpg', alt: 'Monte Leone — playground', label: 'Playground' },
]

const PLANTAS: { src: string; tipo: string; area: string; desc: string }[] = [
  { src: 'https://estilofontana.com.br/images/empreendimento_planta/apartamento-tipo-final-01-1756401745.jpg?w=1400&fm=webp', tipo: 'Apartamento Tipo — Final 01', area: '253,80 m²', desc: '4 dormitórios, sendo 1 suíte master com sacada e 2 suítes' },
  { src: 'https://estilofontana.com.br/images/empreendimento_planta/apartamento-tipo-final-02-1756402030.jpg?w=1400&fm=webp', tipo: 'Apartamento Tipo — Final 02', area: '240,30 m²', desc: '4 dormitórios, sendo 1 suíte master com sacada e 2 suítes' },
  { src: 'https://estilofontana.com.br/images/empreendimento_planta/apartamento-tipo-final-03-1756402389.jpg?w=1400&fm=webp', tipo: 'Apartamento Tipo — Final 03', area: '230,00 m²', desc: '4 dormitórios, sendo 1 suíte master com sacada e 2 suítes' },
]

const DIFERENCIAIS: string[] = [
  'Hall de entrada com pé-direito duplo',
  'Living integrado',
  'Sacada com guarda-corpo de vidro e forro em madeira natural',
  'Acesso digital com reconhecimento facial',
  'Suíte master com banheira de imersão',
  'Parede dupla entre apartamentos — conforto térmico e acústico',
  'Persianas motorizadas nos dormitórios',
  'Espera para sistema de aspiração central',
  'Laje técnica para split do ar-condicionado',
  'Espera para toalheiro aquecido',
  'Fechadura digital',
  'Porcelanato retificado',
]

const AMENIDADES: string[] = [
  'Piscina climatizada (adulto e infantil)',
  'Salão de festas',
  'Sala de jogos',
  'Espaço gourmet com churrasqueira',
  'Academia interna',
  'Circuito ao ar livre',
  'Brinquedoteca',
  'Playground',
  'Terraço externo',
  '3 elevadores (com elevador de serviço exclusivo)',
  'Gerador de energia para áreas comuns',
  'Segurança por câmeras',
  'Espaço delivery',
]

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Monte Leone Residencial — Alto Padrão Criciúma/SC',
  description: 'Monte Leone Residencial: 4 dormitórios (3 suítes), 230 a 253 m², 3 vagas, no Centro de Criciúma/SC. Vista para a Serra, financiamento direto com a construtora. Construtora Fontana. Atendimento exclusivo com Stiven Allan, CRECI/RS 60.275.',
  keywords: ['Monte Leone Residencial', 'apartamento alto padrão Criciúma', 'cobertura Criciúma', 'lançamento Fontana', 'Stiven Allan corretor SC'],
  alternates: { canonical: `${SITE_URL}/empreendimento/fontana/monte-leone-centro-criciuma-sc` },
  openGraph: {
    title: 'Monte Leone Residencial — Magnífico por essência',
    description: '4 dormitórios (3 suítes), 230 a 253 m², no coração nobre de Criciúma/SC. Financiamento direto com a construtora.',
    url: `${SITE_URL}/empreendimento/fontana/monte-leone-centro-criciuma-sc`,
    images: [{ url: IMG.heroAerea, width: 1200, height: 630, alt: 'Monte Leone Residencial — fachada' }],
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monte Leone Residencial — Magnífico por essência',
    description: '4 dormitórios (3 suítes), 230 a 253 m², no coração nobre de Criciúma/SC. Financiamento direto com a construtora.',
    images: [IMG.heroAerea],
  },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Residence',
      name: 'Monte Leone Residencial',
      description: 'Empreendimento de alto padrão no Centro de Criciúma/SC: 4 dormitórios (3 suítes), 230 a 253 m², 3 vagas, com financiamento direto com a Construtora Fontana.',
      url: `${SITE_URL}/empreendimento/fontana/monte-leone-centro-criciuma-sc`,
      image: IMG.heroFrontal,
      address: { '@type': 'PostalAddress', streetAddress: 'Rua Hortêncio João da Silva, 98', addressLocality: 'Criciúma', addressRegion: 'SC', addressCountry: 'BR' },
    },
    {
      '@type': 'Apartment',
      name: 'Monte Leone Residencial',
      description: 'Apartamentos de alto padrão no Centro de Criciúma/SC: 4 dormitórios sendo 3 suítes, 230 a 253 m² privativos, 3 vagas de garagem, com financiamento direto com a Construtora Fontana.',
      image: IMG.heroFrontal,
      numberOfRooms: 4,
      numberOfBathroomsTotal: 5,
      floorSize: { '@type': 'QuantitativeValue', value: 253, unitCode: 'MTK' },
      address: { '@type': 'PostalAddress', streetAddress: 'Rua Hortêncio João da Silva, 98', addressLocality: 'Criciúma', addressRegion: 'SC', addressCountry: 'BR' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Lançamentos Criciúma', item: `${SITE_URL}/lancamentos/criciuma-sc` },
        { '@type': 'ListItem', position: 3, name: 'Monte Leone Residencial', item: `${SITE_URL}/empreendimento/fontana/monte-leone-centro-criciuma-sc` },
      ],
    },
  ],
}

export default function MonteLeonePage() {
  return (
    <main style={{ background: t.bg, color: t.ink, fontFamily: t.body, overflowX: 'hidden' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <style>{`
        html { scroll-behavior: smooth; }
        .ml-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: ${t.gold}; font-family: ${t.body}; }
        .ml-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.04; text-shadow: 0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4); }
        .ml-onimg { text-shadow: 0 1px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5); }
        .ml-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.16em; line-height: 1.1; font-size: clamp(26px,4vw,46px); margin: 0; }
        .ml-rule { width: 56px; height: 1px; background: ${t.gold}; border: 0; }
        .ml-cta { display: inline-block; font-family: ${t.body}; font-size: 12px; letter-spacing: 0.32em; text-transform: uppercase; color: ${t.ink}; border: 1px solid ${t.gold}; padding: 16px 34px; text-decoration: none; transition: background .35s ease, color .35s ease; }
        .ml-cta:hover { background: ${t.gold}; color: #fff; }
        .ml-cta-dark { color: ${t.onDark}; border-color: rgba(184,155,94,0.8); }
        .ml-cta-dark:hover { background: ${t.gold}; color: #14130F; }
        .ml-navlink { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: ${t.onDark}; text-decoration: none; opacity: .82; transition: opacity .25s; }
        .ml-navlink:hover { opacity: 1; }
        .ml-fade { opacity: 0; transform: translateY(18px); animation: mlFade 1.1s ease forwards; }
        @keyframes mlFade { to { opacity: 1; transform: none; } }
        .ml-gcard { position: relative; overflow: hidden; }
        .ml-gcard img { transition: transform .9s ease; }
        .ml-gcard:hover img { transform: scale(1.05); }
        .ml-amen { border-bottom: 1px solid ${t.line}; padding: 18px 0; display: flex; align-items: center; gap: 16px; }
        .ml-wa { position: fixed; right: 18px; bottom: 18px; z-index: 90; width: 54px; height: 54px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.22); text-decoration: none; }
        @media (max-width: 760px) { .ml-nav-links { display: none !important; } }
      `}</style>


      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px', backdropFilter: 'blur(6px)', background: 'rgba(250,250,248,0.0)', borderBottom: '1px solid transparent' }}>
        <span style={{ fontFamily: t.display, fontWeight: 600, letterSpacing: '0.18em', fontSize: 15, color: t.onDark, textTransform: 'uppercase', mixBlendMode: 'difference' }}>Monte Leone</span>
        <div className="ml-nav-links" style={{ display: 'flex', gap: 28 }}>
          <a href="#residencial" className="ml-navlink">O Residencial</a>
          <a href="#galeria" className="ml-navlink">Galeria</a>
          <a href="#plantas" className="ml-navlink">Plantas</a>
          <a href="#diferenciais" className="ml-navlink">Diferenciais</a>
          <a href="#localizacao" className="ml-navlink">Localização</a>
        </div>
        <a href={WPP} target="_blank" rel="noopener noreferrer" className="ml-cta" style={{ borderColor: 'rgba(244,241,234,0.6)', color: t.onDark }}>Atendimento exclusivo</a>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end' }}>
        <Image src={IMG.heroFrontal} alt="Fachada frontal do Monte Leone Residencial, no Centro de Criciúma/SC" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,19,15,0.45) 0%, rgba(20,19,15,0.18) 38%, rgba(20,19,15,0.82) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 28px 12vh', maxWidth: 980 }}>
          <p className="ml-eyebrow ml-onimg" style={{ color: t.gold }}>Monte Leone Residencial — Centro, Criciúma/SC</p>
          <h1 className="ml-h1" style={{ color: t.onDark }}>Monte Leone Residencial</h1>
          <p className="ml-h1-slogan" style={{ color: t.gold, fontFamily: t.display, fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,34px)', marginTop: 10, marginBottom: 0 }}>Magnífico por essência</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 34 }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="ml-cta" style={{ borderColor: t.gold, color: t.onDark }}>Atendimento exclusivo</a>
            <a href="#residencial" className="ml-cta" style={{ borderColor: 'rgba(244,241,234,0.4)', color: t.onDark }}>Conheça o residencial</a>
          </div>
        </div>
      </section>

      {/* CONCEITO */}
      <section id="residencial" style={{ padding: '14vh 28px', maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '6vw', alignItems: 'center' }}>
        <div>
          <p className="ml-eyebrow" style={{ color: t.goldDark }}>O Residencial</p>
          <h2 className="ml-h2">Na altura<br />dos seus sonhos</h2>
          <div className="ml-rule" />
          <p style={{ fontSize: 18, lineHeight: 1.8, color: t.muted, maxWidth: 560 }}>
            O Monte Leone Residencial reflete a essência de quem valoriza o que há de mais raro — tempo de qualidade, espaço para contemplação e liberdade para viver plenamente. Uma joia arquitetônica lapidada para brilhar no coração nobre de Criciúma, com vista deslumbrante para a Serra em cada unidade.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: t.muted, maxWidth: 560, marginTop: 20 }}>
            Mais que um empreendimento, um legado — símbolo de sofisticação, exclusividade e permanência.
          </p>
          <p style={{ fontFamily: t.display, fontStyle: 'italic', fontSize: 22, color: t.ink, marginTop: 30 }}>Sinta o sublime em cada detalhe.</p>
        </div>
        <div style={{ position: 'relative', aspectRatio: '3 / 4', borderRadius: 2, overflow: 'hidden' }}>
          <Image src={IMG.fachadaAngular} alt="Vista angular da fachada do Monte Leone Residencial" fill sizes="(max-width: 760px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" style={{ background: t.dark, padding: '14vh 0' }}>
        <div style={{ padding: '0 28px', maxWidth: 1280, margin: '0 auto 6vh' }}>
          <p className="ml-eyebrow" style={{ color: t.gold }}>Galeria</p>
          <h2 className="ml-h2" style={{ color: t.onDark }}>Onde a vida pulsa<br />com elegância</h2>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: t.onDarkMuted, maxWidth: 620, marginTop: 8 }}>
            E o cotidiano se transforma em expressão sofisticada de bem-estar.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, padding: '0 14px' }}>
          {GALERIA.map((g, i) => (
            <figure key={i} className="ml-gcard" style={{ position: 'relative', margin: 0, aspectRatio: i % 5 === 0 ? '16 / 11' : '4 / 3', gridColumn: i % 5 === 0 ? 'span 2' : 'span 1', overflow: 'hidden', borderRadius: 2 }}>
              <Image src={g.src} alt={g.alt} fill loading="lazy" sizes="(max-width: 760px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
              <figcaption style={{ position: 'absolute', left: 14, bottom: 12, fontFamily: t.display, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.onDark, textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>{g.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* AS RESIDÊNCIAS — números */}
      <section style={{ padding: '14vh 28px', maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
        <p className="ml-eyebrow" style={{ color: t.goldDark }}>As Residências</p>
        <h2 className="ml-h2" style={{ margin: '0 auto' }}>Espaço para<br />contemplação</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginTop: '7vh', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
          {[
            { n: '4', l: 'Dormitórios (3 suítes)' },
            { n: '230–253', l: 'm² privativos' },
            { n: '3', l: 'Vagas de garagem' },
            { n: '∞', l: 'Personalização de planta' },
          ].map((s, i) => (
            <div key={i}>
              <p style={{ fontFamily: t.display, fontWeight: 600, fontSize: 'clamp(34px, 5vw, 56px)', color: t.ink, lineHeight: 1 }}>{s.n}</p>
              <p style={{ marginTop: 12, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.muted }}>{s.l}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '7vh', fontFamily: t.display, fontSize: 'clamp(20px, 2.4vw, 30px)', color: t.goldDark, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Sob consulta</p>
      </section>

      {/* PLANTAS */}
      <section id="plantas" style={{ background: t.bg, padding: '12vh 28px', borderTop: '1px solid ' + t.line }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p className="ml-eyebrow" style={{ color: t.goldDark }}>Plantas</p>
          <h2 className="ml-h2">Liberdade para<br />viver plenamente</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28, marginTop: '6vh' }}>
            {PLANTAS.map((p, i) => (
              <div key={i} style={{ border: '1px solid ' + t.line, borderRadius: 2, overflow: 'hidden', background: '#fff' }}>
                <div style={{ position: 'relative', aspectRatio: '4 / 3', background: '#fff' }}>
                  <Image src={p.src} alt={'Planta ' + p.tipo + ' — ' + p.area} fill loading="lazy" sizes="(max-width: 760px) 100vw, 33vw" style={{ objectFit: 'contain', padding: 14 }} />
                </div>
                <div style={{ padding: '20px 22px', borderTop: '1px solid ' + t.line }}>
                  <p style={{ fontFamily: t.display, fontWeight: 600, fontSize: 18, color: t.ink }}>{p.tipo}</p>
                  <p style={{ fontSize: 14, color: t.goldDark, marginTop: 4, letterSpacing: '0.08em' }}>{p.area}</p>
                  <p style={{ fontSize: 14, color: t.muted, marginTop: 10, lineHeight: 1.6 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section id="diferenciais" style={{ background: t.dark, padding: '14vh 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p className="ml-eyebrow" style={{ color: t.gold }}>Diferenciais das unidades</p>
          <h2 className="ml-h2" style={{ color: t.onDark }}>O sublime<br />em cada detalhe</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0 48px', marginTop: '6vh' }}>
            {DIFERENCIAIS.map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '20px 0', borderBottom: '1px solid rgba(244,241,234,0.12)', alignItems: 'baseline' }}>
                <span style={{ fontFamily: t.display, fontSize: 13, color: t.gold, minWidth: 28 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: 16, lineHeight: 1.6, color: t.onDark }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAZER & ÁREAS COMUNS */}
      <section style={{ padding: '14vh 28px', maxWidth: 1280, margin: '0 auto' }}>
        <p className="ml-eyebrow" style={{ color: t.goldDark }}>Lazer & áreas comuns</p>
        <h2 className="ml-h2">Bem-estar<br />em cada andar</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0 56px', marginTop: '5vh' }}>
          {AMENIDADES.map((a, i) => (
            <div key={i} className="ml-amen">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.gold, flexShrink: 0 }} />
              <span style={{ fontSize: 16, color: t.ink }}>{a}</span>
            </div>
          ))}
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section id="localizacao" style={{ background: t.bg, borderTop: '1px solid ' + t.line, padding: '12vh 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '5vw', alignItems: 'center' }}>
          <div>
            <p className="ml-eyebrow" style={{ color: t.goldDark }}>Localização</p>
            <h2 className="ml-h2">O endereço dos<br />que transformam<br />a vida em arte</h2>
            <div className="ml-rule" />
            <p style={{ fontSize: 18, lineHeight: 1.8, color: t.ink }}>Rua Hortêncio João da Silva, esquina com a Rua Antônio Baptista de Lucca, nº 98</p>
            <p style={{ fontSize: 16, color: t.muted, marginTop: 6 }}>Centro — Criciúma/SC</p>
            <p style={{ fontSize: 15, color: t.muted, marginTop: 24, lineHeight: 1.8, maxWidth: 480 }}>No coração nobre de Criciúma, a poucos passos de comércio premium, gastronomia, serviços e dos principais acessos da cidade — com vista para a Serra.</p>
          </div>
          <div style={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: 2, overflow: 'hidden', border: '1px solid ' + t.line }}>
            <Image src={IMG.mapa} alt="Mapa da localização do Monte Leone Residencial no Centro de Criciúma/SC" fill loading="lazy" sizes="(max-width: 760px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* FINANCIAMENTO DIRETO */}
      <section style={{ background: t.dark, padding: '14vh 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p className="ml-eyebrow" style={{ color: t.gold }}>Financiamento direto</p>
          <h2 className="ml-h2" style={{ color: t.onDark, margin: '0 auto' }}>A liberdade<br />de quem decide</h2>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: t.onDarkMuted, maxWidth: 640, margin: '24px auto 0' }}>
            Negocie diretamente, sem banco e sem burocracia. Um privilégio para quem valoriza tempo, discrição e condições construídas sob medida.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28, marginTop: '7vh', textAlign: 'left' }}>
            {[
              { n: '01', t: 'Converse com o corretor', d: 'Atendimento exclusivo e reservado, direto com Stiven Allan.' },
              { n: '02', t: 'Condições sob medida', d: 'Proposta construída conforme o seu momento, sem intermediários.' },
              { n: '03', t: 'Realize', d: 'Sua unidade no Monte Leone, com a tranquilidade de negociar direto.' },
            ].map((s, i) => (
              <div key={i} style={{ borderTop: '1px solid ' + t.gold, paddingTop: 22 }}>
                <p style={{ fontFamily: t.display, fontSize: 30, color: t.gold }}>{s.n}</p>
                <p style={{ fontFamily: t.display, fontSize: 18, color: t.onDark, marginTop: 10 }}>{s.t}</p>
                <p style={{ fontSize: 15, color: t.onDarkMuted, marginTop: 8, lineHeight: 1.7 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ position: 'relative', minHeight: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Image src={IMG.heroAerea} alt="Vista aérea do Monte Leone Residencial" fill loading="lazy" sizes="100vw" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,19,15,0.7)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 28px', maxWidth: 760 }}>
          <h2 className="ml-h2 ml-onimg" style={{ color: t.onDark, margin: '0 auto' }}>Sinta o sublime<br />em cada detalhe</h2>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 34 }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="ml-cta" style={{ borderColor: t.gold, color: t.onDark }}>Atendimento exclusivo</a>
            <a href={CATALOGO_PDF} target="_blank" rel="noopener noreferrer" className="ml-cta" style={{ borderColor: 'rgba(244,241,234,0.4)', color: t.onDark }}>Baixar catálogo</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0E0D0A', color: t.onDarkMuted, padding: '8vh 28px 6vh' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40 }}>
          <div>
            <p style={{ fontFamily: t.display, fontWeight: 600, letterSpacing: '0.18em', fontSize: 16, color: t.onDark, textTransform: 'uppercase' }}>Monte Leone</p>
            <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7 }}>Residencial — Construtora Fontana<br />Centro, Criciúma/SC</p>
          </div>
          <div>
            <p style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.gold }}>Corretor</p>
            <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7, color: t.onDark }}>Stiven Allan</p>
            <p style={{ fontSize: 14, lineHeight: 1.7 }}>CRECI 60.275</p>
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 10, fontSize: 14, color: t.gold, textDecoration: 'none' }}>Falar no WhatsApp →</a>
          </div>
          <div>
            <p style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.gold }}>Navegação</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              <a href="#residencial" style={{ fontSize: 14, color: t.onDarkMuted, textDecoration: 'none' }}>O Residencial</a>
              <a href="#galeria" style={{ fontSize: 14, color: t.onDarkMuted, textDecoration: 'none' }}>Galeria</a>
              <a href="#plantas" style={{ fontSize: 14, color: t.onDarkMuted, textDecoration: 'none' }}>Plantas</a>
              <a href="#localizacao" style={{ fontSize: 14, color: t.onDarkMuted, textDecoration: 'none' }}>Localização</a>
            </div>
          </div>
        </div>
        <p style={{ maxWidth: 1280, margin: '6vh auto 0', paddingTop: 24, borderTop: '1px solid rgba(244,241,234,0.1)', fontSize: 12, color: 'rgba(244,241,234,0.4)' }}>
          Imagens meramente ilustrativas. Valores e condições sob consulta. © {new Date().getFullYear()} Stiven Allan — Imóveis de Alto Padrão.
        </p>
      </footer>

      {/* WHATSAPP FLUTUANTE */}
      <a href={WPP} target="_blank" rel="noopener noreferrer" className="ml-wa" aria-label="Falar no WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.449L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.654-.957zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
      </a>
    </main>
  )
}
