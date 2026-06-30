import type { Metadata } from 'next'
import Image from 'next/image'
import GalleryWithLightbox, { LightboxPhoto } from './gallery-lightbox'

const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Due%20Fratelli%20Residencial.'
const CATALOGO_PDF = 'https://estilofontana.com.br/upload/empreendimento/catalogo/due-fratelli-residencial-1602177598.pdf'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'

const t = {
  bg:'#FAFAF8', ink:'#16201A', slate:'#3A5068', slateDark:'#243240',
  muted:'#5A6870', line:'rgba(22,32,26,0.12)', dark:'#0D141A',
  onDark:'#E8EFF6', onDarkMuted:'rgba(232,239,246,0.66)',
  display:"'Jost',system-ui,sans-serif",
  serif:"'Cormorant Garamond',Georgia,serif",
  body:"'Hanken Grotesk',system-ui,sans-serif",
}

const IMG = {
  hero: 'https://estilofontana.com.br/images/empreendimento/slideshows/due-fratelli-residencial-5f889c789761e.jpg?fm=webp',
  mapa: 'https://estilofontana.com.br/images/2020/10/27/localizacao-5f985c6f66773.png?fm=webp',
  lazer: 'https://estilofontana.com.br/images/empreendimento/slideshows/due-fratelli-residencial-5f88a49aa91f3.jpg?fm=webp',
}

const GALERIA = [
  { src: IMG.hero, alt: 'Fachada Due Fratelli', label: 'Fachada' },
  { src: 'https://lh3.googleusercontent.com/d/1GUOHCMV2J7azSkrNfTIC_vdiMaMEJ8zA', alt: 'Vista Aérea Due Fratelli', label: 'Vista Aérea' },
  { src: 'https://lh3.googleusercontent.com/d/1hRoRdt7c9SrDsF_zHxMvDUheAHZk0zDj', alt: 'Vista Aérea Due Fratelli', label: 'Vista Aérea' },
  { src: 'https://lh3.googleusercontent.com/d/1gTMCU8shamu-CYGk3HKiP7uxQPlQ_giB', alt: 'Vista Aérea Due Fratelli', label: 'Vista Aérea' },
  { src: 'https://lh3.googleusercontent.com/d/1cTRBdYwLYMDy-4YnuQ7NOuaDoKYS4Ujh', alt: 'Vista Aérea Due Fratelli', label: 'Vista Aérea' },
  { src: 'https://lh3.googleusercontent.com/d/1BiUDSc9pdi664V8dqPITaYX1cofkn-ZN', alt: 'Hall de Entrada Due Fratelli', label: 'Hall de Entrada' },
  { src: 'https://lh3.googleusercontent.com/d/1tNBzLBD3E-eAZZoZtHgv_6a4i6pdN_va', alt: 'Hall de Entrada Due Fratelli', label: 'Hall de Entrada' },
  { src: 'https://lh3.googleusercontent.com/d/1UyKq9cffmWDAxdPC-K4pekEp23vkg-vU', alt: 'Hall de Entrada Due Fratelli', label: 'Hall de Entrada' },
  { src: 'https://lh3.googleusercontent.com/d/18-F3chjVNM3iipTDFuzu16O4zl3oa338', alt: 'Salão de Festas Due Fratelli', label: 'Salão de Festas' },
  { src: 'https://lh3.googleusercontent.com/d/1B_gew3z7-DVwI7Qn1Euv_QcsL9BqbqG5', alt: 'Salão de Festas Due Fratelli', label: 'Salão de Festas' },
  { src: 'https://lh3.googleusercontent.com/d/1V1B-TDUqAmA4r2EF_kZu_8Hq91RGtFjO', alt: 'Salão de Festas Due Fratelli', label: 'Salão de Festas' },
  { src: 'https://lh3.googleusercontent.com/d/1S0Qnk-C1lY6YwmQJvzZnqhkeMp5trMKP', alt: 'Salão de Festas Due Fratelli', label: 'Salão de Festas' },
  { src: 'https://lh3.googleusercontent.com/d/1zf2aj8pDSsF_gkGKPxyQvRgGD62k9yPB', alt: 'Churrasqueira Due Fratelli', label: 'Churrasqueira' },
  { src: 'https://lh3.googleusercontent.com/d/1am24wtJl1xUyd__5r4Xp9-ZVPYqhmv7L', alt: 'Churrasqueira Due Fratelli', label: 'Churrasqueira' },
  { src: 'https://lh3.googleusercontent.com/d/1hsPZl9WnpET6SRunW9o59H3uautSW_xQ', alt: 'Area Comum Due Fratelli', label: 'Area Comum' },
  { src: 'https://lh3.googleusercontent.com/d/1URfh7bPG-4QouY8r5tNcCv2oQfUs-FXn', alt: 'Area Comum Due Fratelli', label: 'Area Comum' },
  { src: 'https://lh3.googleusercontent.com/d/1-HGiv8sV7jzlktu5fQ9qJhhPIcXrOkEz', alt: 'Area Comum Due Fratelli', label: 'Area Comum' },
  { src: 'https://lh3.googleusercontent.com/d/13wxBbGKBEQ5HF-_8iLXQfQFHp7GgubEt', alt: 'Living Due Fratelli', label: 'Living' },
  { src: 'https://lh3.googleusercontent.com/d/18N-4T-3mhjeWCFPlO_YhW6OobLoAD65G', alt: 'Living Due Fratelli', label: 'Living' },
  { src: 'https://lh3.googleusercontent.com/d/1rQmRZ3pCT-0mjlZQmntNU5MNvSWaqws9', alt: 'Living Due Fratelli', label: 'Living' },
  { src: 'https://lh3.googleusercontent.com/d/1K2Zw4JnneikqAYdi6r_vb-OUimGpDzDz', alt: 'Cozinha Due Fratelli', label: 'Cozinha' },
  { src: 'https://lh3.googleusercontent.com/d/1osmrYxKgU6VHWg--FDM73fn2rIrL83Fx', alt: 'Cozinha Due Fratelli', label: 'Cozinha' },
  { src: 'https://lh3.googleusercontent.com/d/1gyQinMSW-PwIpoZQP5IkVYX1R1jTQHK_', alt: 'Suite Due Fratelli', label: 'Suite' },
  { src: 'https://lh3.googleusercontent.com/d/1QCPu_8K5T1JuNkErNe_xlw6_OHNJ8i3A', alt: 'Suite Due Fratelli', label: 'Suite' },
  { src: 'https://lh3.googleusercontent.com/d/1aGcgT86-e1YipmR7tvc3KBlUmevIX_ie', alt: 'Sacada Due Fratelli', label: 'Sacada' },
  { src: 'https://lh3.googleusercontent.com/d/1dVY-C1hGswYqR00fqT0sSONDoSaUo9l7', alt: 'Sacada Due Fratelli', label: 'Sacada' },
  { src: 'https://lh3.googleusercontent.com/d/1oYwiQgL0nRR_kszOGpvUuc8ZymStCUI7', alt: 'Dormitorio Due Fratelli', label: 'Dormitorio' },
  { src: 'https://lh3.googleusercontent.com/d/1qA0HsE4vSUI7-j6UFsJBD7dNEuZ1c4Q4', alt: 'Dormitorio Due Fratelli', label: 'Dormitorio' },
  { src: 'https://lh3.googleusercontent.com/d/1lUhstJvwxFyA9Vin2KhxU_Zf2sXsO2Nw', alt: 'Dormitorio Due Fratelli', label: 'Dormitorio' },
  { src: 'https://lh3.googleusercontent.com/d/1IatMUMVqUqr5ofMavFYJhRJjQ-QNV6A8', alt: 'Banheiro Due Fratelli', label: 'Banheiro' },
]

const DIFERENCIAIS = [
  '2 e 3 dormitorios com ate 92 m2 privativos',
  '1 suite com acabamento refinado',
  'Sacada privativa com churrasqueira',
  '2 elevadores no edificio',
]

const AMENIDADES = [
  'Salao de Festas','Hall de Entrada','Churrasqueira','2 Elevadores',
]

export const metadata: Metadata = {
  title: 'Due Fratelli Residencial | Centro Criciuma SC | Stiven Allan',
  description: 'Due Fratelli Residencial — 2 e 3 dormitorios com ate 92 m2 privativos no Centro de Criciuma/SC. Sacada com churrasqueira, 2 elevadores.',
  alternates: { canonical: SITE_URL + '/empreendimento/fontana/due-fratelli-centro-criciuma-sc' },
  openGraph: {
    title: 'Due Fratelli Residencial | Centro Criciuma SC',
    description: 'Qualidade de vida e praticidade no Centro de Criciuma.',
    url: SITE_URL + '/empreendimento/fontana/due-fratelli-centro-criciuma-sc',
    images: [{ url: 'https://estilofontana.com.br/images/empreendimento/slideshows/due-fratelli-residencial-5f889c789761e.jpg?fm=webp', width: 1200, height: 630, alt: 'Due Fratelli Residencial' }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Due Fratelli Residencial | Centro Criciuma SC', description: 'Qualidade de vida e praticidade no Centro de Criciuma.', images: ['https://estilofontana.com.br/images/empreendimento/slideshows/due-fratelli-residencial-5f889c789761e.jpg?fm=webp'] },
  robots: { index: true, follow: true },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Apartment',
      name: 'Due Fratelli Residencial',
      description: 'Residencial com 2 e 3 dormitorios de ate 92 m2 privativos no Centro de Criciuma/SC.',
      numberOfRooms: 3,
      floorSize: { '@type': 'QuantitativeValue', value: 92, unitCode: 'MTK' },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rua Princesa Isabel',
        addressLocality: 'Criciuma',
        addressRegion: 'SC',
        addressCountry: 'BR',
      },
      url: SITE_URL + '/empreendimento/fontana/due-fratelli-centro-criciuma-sc',
      image: 'https://estilofontana.com.br/images/empreendimento/slideshows/due-fratelli-residencial-5f889c789761e.jpg?fm=webp',
    },
  ],
}

export default function DueFratelliPage() {
  return (
    <main style={{ background: t.bg, color: t.ink, fontFamily: t.body, margin: 0, padding: 0 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Jost:wght@300;400;500;600&family=Hanken+Grotesk:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${t.bg};color:${t.ink}}
        .df-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:64px;background:rgba(13,20,26,0.82);backdrop-filter:blur(12px);}
        .df-logo{font-family:${t.display};font-size:15px;font-weight:600;letter-spacing:3px;color:${t.onDark};text-decoration:none;text-transform:uppercase;}
        .df-nav-links{display:flex;gap:28px;list-style:none;}
        .df-nav-links a{font-family:${t.body};font-size:13px;color:${t.onDarkMuted};text-decoration:none;transition:color .2s;}
        .df-nav-links a:hover{color:${t.onDark}}
        .df-nav-cta{font-family:${t.body};font-size:13px;font-weight:500;color:${t.onDark};background:${t.slate};border:none;border-radius:6px;padding:9px 20px;cursor:pointer;text-decoration:none;transition:background .2s;}
        .df-nav-cta:hover{background:${t.slateDark}}
        @media(max-width:860px){.df-nav-links{display:none!important}}
        .df-hero{position:relative;height:100vh;min-height:600px;display:flex;align-items:flex-end;}
        .df-hero-img{position:absolute;inset:0;z-index:0;}
        .df-hero-img::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(13,20,26,0.72) 0%,rgba(13,20,26,0.18) 60%,transparent 100%);}
        .df-hero-content{position:relative;z-index:1;padding:0 48px 72px;}
        .df-hero-eyebrow{font-family:${t.body};font-size:11px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:${t.onDarkMuted};margin-bottom:16px;}
        .df-hero-title{font-family:${t.serif};font-size:clamp(42px,7vw,86px);font-weight:300;line-height:1.0;color:${t.onDark};margin-bottom:20px;}
        .df-hero-sub{font-family:${t.body};font-size:16px;font-weight:300;color:${t.onDarkMuted};margin-bottom:36px;max-width:520px;line-height:1.6;}
        .df-hero-actions{display:flex;gap:16px;flex-wrap:wrap;}
        .df-btn-primary{font-family:${t.body};font-size:14px;font-weight:500;color:${t.onDark};background:${t.slate};border:none;border-radius:8px;padding:14px 28px;cursor:pointer;text-decoration:none;transition:background .2s;}
        .df-btn-primary:hover{background:${t.slateDark}}
        .df-btn-outline{font-family:${t.body};font-size:14px;color:${t.onDark};background:transparent;border:1px solid rgba(232,239,246,0.35);border-radius:8px;padding:14px 28px;cursor:pointer;text-decoration:none;transition:border-color .2s;}
        .df-btn-outline:hover{border-color:${t.onDark}}
        .df-section{padding:96px 48px;}
        .df-section-eyebrow{font-family:${t.body};font-size:11px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:${t.slate};margin-bottom:16px;}
        .df-section-title{font-family:${t.serif};font-size:clamp(32px,5vw,52px);font-weight:300;line-height:1.15;color:${t.ink};margin-bottom:24px;}
        .df-section-text{font-family:${t.body};font-size:16px;font-weight:300;line-height:1.75;color:${t.muted};max-width:640px;}
        .df-stats{display:flex;gap:48px;flex-wrap:wrap;margin-top:48px;}
        .df-stat-n{font-family:${t.serif};font-size:48px;font-weight:300;color:${t.slate};line-height:1;}
        .df-stat-l{font-family:${t.body};font-size:13px;color:${t.muted};margin-top:4px;}
        .df-gal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:4px;}
        .df-gal-item{position:relative;aspect-ratio:4/3;overflow:hidden;border:none;padding:0;cursor:pointer;background:none;}
        .df-gal-img-wrap{position:absolute;inset:0;}
        .df-gal-overlay{position:absolute;inset:0;opacity:0;transition:opacity .3s;}
        .df-gal-item:hover .df-gal-overlay{opacity:1}
        .df-gal-label{position:absolute;bottom:8px;left:10px;font-family:${t.body};font-size:11px;font-weight:500;color:#fff;letter-spacing:1px;text-transform:uppercase;opacity:0;transition:opacity .3s;z-index:2;}
        .df-gal-item:hover .df-gal-label{opacity:1}
        .df-dark{background:${t.dark};color:${t.onDark};padding:96px 48px;}
        .df-dark .df-section-eyebrow{color:${t.onDarkMuted}}
        .df-dark .df-section-title{color:${t.onDark}}
        .df-dark .df-section-text{color:${t.onDarkMuted}}
        .df-diferenciais{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;margin-top:48px;}
        .df-dif-item{background:rgba(232,239,246,0.06);border:1px solid rgba(232,239,246,0.1);border-radius:12px;padding:28px 24px;}
        .df-dif-icon{width:32px;height:2px;background:${t.slate};margin-bottom:16px;}
        .df-dif-text{font-family:${t.body};font-size:15px;font-weight:300;color:${t.onDark};line-height:1.6;}
        .df-amenidades{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px;}
        .df-amenidade{font-family:${t.body};font-size:13px;color:${t.onDark};background:rgba(232,239,246,0.08);border:1px solid rgba(232,239,246,0.15);border-radius:100px;padding:8px 20px;}
        .df-lazer-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:48px;}
        .df-lazer-main{grid-row:span 2;position:relative;min-height:400px;}
        .df-lazer-sm{position:relative;min-height:195px;}
        .df-mapa-wrap{position:relative;height:480px;margin-top:48px;border-radius:16px;overflow:hidden;}
        .df-cta-section{background:${t.slate};padding:96px 48px;text-align:center;}
        .df-cta-title{font-family:${t.serif};font-size:clamp(32px,5vw,52px);font-weight:300;color:${t.onDark};margin-bottom:16px;}
        .df-cta-sub{font-family:${t.body};font-size:16px;font-weight:300;color:${t.onDarkMuted};margin-bottom:40px;}
        .df-cta-actions{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;}
        .df-footer{background:${t.dark};color:${t.onDarkMuted};padding:48px;text-align:center;font-family:${t.body};font-size:13px;}
        .df-footer a{color:${t.onDarkMuted};text-decoration:none;}
        .df-wa{position:fixed;bottom:28px;right:28px;z-index:200;width:56px;height:56px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.25);transition:transform .2s;}
        .df-wa:hover{transform:scale(1.1)}
        @media(max-width:640px){
          .df-section,.df-dark,.df-cta-section{padding:64px 24px}
          .df-hero-content{padding:0 24px 56px}
          .df-stats{gap:28px}
          .df-lazer-grid{grid-template-columns:1fr}
          .df-lazer-main,.df-lazer-sm{grid-row:auto}
        }
      `}</style>

      <nav className="df-nav">
        <a href="/" className="df-logo">Stiven Allan</a>
        <ul className="df-nav-links">
          <li><a href="/">Inicio</a></li>
          <li><a href="/#empreendimentos">Empreendimentos</a></li>
          <li><a href="/#contato">Contato</a></li>
        </ul>
        <a href={WPP} className="df-nav-cta" target="_blank" rel="noopener noreferrer">QUERO SABER MAIS</a>
      </nav>

      <section className="df-hero">
        <div className="df-hero-img">
          <Image src={IMG.hero} alt="Due Fratelli Residencial" fill style={{ objectFit:'cover' }} priority sizes="100vw" />
        </div>
        <div className="df-hero-content">
          <p className="df-hero-eyebrow">Construtora Fontana · Centro · Criciuma/SC</p>
          <h1 className="df-hero-title">DUE FRATELLI<br/>RESIDENCIAL</h1>
          <p className="df-hero-sub">Qualidade de vida e praticidade.</p>
          <div className="df-hero-actions">
            <a href={WPP} className="df-btn-primary" target="_blank" rel="noopener noreferrer">Quero conhecer</a>
            <a href={CATALOGO_PDF} className="df-btn-outline" target="_blank" rel="noopener noreferrer">Baixar catalogo</a>
          </div>
        </div>
      </section>

      <section className="df-section">
        <p className="df-section-eyebrow">As Residencias</p>
        <h2 className="df-section-title">Espaco e sofisticacao<br/>para a sua familia</h2>
        <p className="df-section-text">Atento ao potencial de expansao da regiao, o Due Fratelli une a melhor selecao de servicos e lojas comerciais a tranquilidade do seu lar. Dar valor a sua vida e aproveitar e reservar mais tempo com quem voce ama.</p>
        <div className="df-stats">
          {[{n:'2 e 3',l:'Dormitorios'},{n:'1',l:'Suite'},{n:'ate 92',l:'m2 privativos'},{n:'2',l:'Elevadores'}].map(s => (
            <div key={s.l}>
              <div className="df-stat-n">{s.n}</div>
              <div className="df-stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="df-section" style={{ paddingTop: 0 }}>
        <p className="df-section-eyebrow">Galeria</p>
        <h2 className="df-section-title">Cada detalhe<br/>cuidadosamente planejado</h2>
        <GalleryWithLightbox galeria={GALERIA} prefix="df-" gradient="linear-gradient(to top,rgba(13,20,26,0.6) 0%,transparent 100%)" />
      </section>

      <section className="df-dark">
        <p className="df-section-eyebrow">Diferenciais</p>
        <h2 className="df-section-title">Por que escolher<br/>o Due Fratelli</h2>
        <div className="df-diferenciais">
          {DIFERENCIAIS.map(d => (
            <div key={d} className="df-dif-item">
              <div className="df-dif-icon" />
              <p className="df-dif-text">{d}</p>
            </div>
          ))}
        </div>
        <p className="df-section-eyebrow" style={{ marginTop: 64 }}>Amenidades</p>
        <div className="df-amenidades">
          {AMENIDADES.map(a => <span key={a} className="df-amenidade">{a}</span>)}
        </div>
      </section>

      <section className="df-section">
        <p className="df-section-eyebrow">Lazer</p>
        <h2 className="df-section-title">Momentos especiais<br/>no lugar certo</h2>
        <div className="df-lazer-grid">
          <div className="df-lazer-main">
            <LightboxPhoto src={IMG.lazer} alt="Lazer Due Fratelli" label="Area de Lazer" cardClass="df-lazer-main" imgSizes="(max-width:640px) 100vw,50vw" />
          </div>
          <div className="df-lazer-sm">
            <LightboxPhoto src={GALERIA[8].src} alt="Salao de Festas Due Fratelli" label="Salao de Festas" cardClass="df-lazer-sm" imgSizes="(max-width:640px) 100vw,25vw" />
          </div>
          <div className="df-lazer-sm">
            <LightboxPhoto src={GALERIA[12].src} alt="Churrasqueira Due Fratelli" label="Churrasqueira" cardClass="df-lazer-sm" imgSizes="(max-width:640px) 100vw,25vw" />
          </div>
        </div>
      </section>

      <section className="df-section" style={{ paddingTop: 0 }}>
        <p className="df-section-eyebrow">Localizacao</p>
        <h2 className="df-section-title">No coracao<br/>de Criciuma</h2>
        <p className="df-section-text">Rua Princesa Isabel — Centro, Criciuma/SC. Proximo a comercio, servicos e vias de acesso.</p>
        <div className="df-mapa-wrap">
          <Image src={IMG.mapa} alt="Localizacao Due Fratelli — Centro Criciuma" fill style={{ objectFit:'cover' }} sizes="(max-width:768px) 100vw,80vw" />
        </div>
      </section>

      <section className="df-dark">
        <p className="df-section-eyebrow">Investimento</p>
        <h2 className="df-section-title">Preco sob consulta</h2>
        <p className="df-section-text">Entre em contato para conhecer as condicoes especiais disponiveis para o Due Fratelli Residencial.</p>
        <div style={{ marginTop: 36 }}>
          <a href={WPP} className="df-btn-primary" target="_blank" rel="noopener noreferrer">Consultar condicoes</a>
        </div>
      </section>

      <section className="df-cta-section">
        <h2 className="df-cta-title">Pronto para conhecer<br/>o Due Fratelli?</h2>
        <p className="df-cta-sub">Fale com Stiven Allan e agende uma visita.</p>
        <div className="df-cta-actions">
          <a href={WPP} className="df-btn-primary" target="_blank" rel="noopener noreferrer" style={{ background: t.dark }}>Falar pelo WhatsApp</a>
          <a href={CATALOGO_PDF} className="df-btn-outline" target="_blank" rel="noopener noreferrer">Baixar catalogo</a>
        </div>
      </section>

      <footer className="df-footer">
        <p>2024 Stiven Allan · Corretor de Imoveis · <a href="/">stivenallan.vercel.app</a></p>
        <p style={{ marginTop: 8 }}>CRECI SC · Due Fratelli Residencial · Centro, Criciuma/SC</p>
      </footer>

      <a href={WPP} className="df-wa" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.822 6.5L4 29l7.75-1.797A12.94 12.94 0 0016 28c6.627 0 12-5.373 12-12S22.627 3 16 3z" fill="#fff"/><path d="M21.93 19.93c-.3.84-1.48 1.54-2.34 1.74-.62.14-1.43.25-4.16-1.16-2.78-1.44-4.57-4.23-4.71-4.43-.13-.2-1.12-1.49-1.12-2.84 0-1.35.71-2.01 1.01-2.3.3-.28.65-.35.87-.35.22 0 .43.01.62.02.2.01.47-.08.73.56.3.7 1.02 2.49 1.11 2.67.09.18.15.39.03.63-.12.24-.18.39-.35.6-.18.21-.37.47-.53.63-.18.18-.36.37-.16.72.2.35.9 1.49 1.94 2.41 1.33 1.19 2.46 1.56 2.81 1.73.35.18.56.15.77-.09.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.81-.18.33.12 2.1 1 2.46 1.18.36.18.6.27.69.42.09.15.09.87-.21 1.71z" fill={t.slate}/></svg>
      </a>
    </main>
  )
}
