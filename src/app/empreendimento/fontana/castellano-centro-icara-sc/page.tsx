import type { Metadata } from 'next'
import Image from 'next/image'
import { HeroImage } from '@/components/HeroImage'
import GalleryWithLightbox, { LightboxPhoto } from './gallery-lightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Castellano%20Residencial.'
const CATALOGO_PDF = 'https://estilofontana.com.br/upload/empreendimento/catalogo/castellano-residencial-1603391644.pdf'

const t = {
  bg:'#FAFAF8', ink:'#18141A', purple:'#4A3860', purpleDark:'#2E2240',
  muted:'#6A5E78', line:'rgba(24,20,26,0.12)', dark:'#0F0B14',
  onDark:'#EFE9F6', onDarkMuted:'rgba(239,233,246,0.66)',
  display:"'Jost',system-ui,sans-serif",
  serif:"'Cormorant Garamond',Georgia,serif",
  body:"'Hanken Grotesk',system-ui,sans-serif",
}

const IMG = {
  hero: '/images/empreendimentos/castellano-centro-icara-sc/castellano-residencial-600076ae1e9e9.jpg',
  mapa: '/images/empreendimentos/castellano-centro-icara-sc/localizacao-5f984a88a761c.jpg',
  lazer: '/images/empreendimentos/castellano-centro-icara-sc/castellano-residencial-600076ae1e9e9.jpg',
}

const GALERIA = [
  { src: IMG.hero, alt: 'Fachada Castellano Residencial', label: 'Fachada' },
  { src: 'https://lh3.googleusercontent.com/d/1YbeoMjUbbY1TOJvn9HQK8lJqlj1x8h9W', alt: 'Fachada Castellano', label: 'Fachada' },
  { src: 'https://lh3.googleusercontent.com/d/1JDf0od9ziZCyCxc1_nQaXyMoeERh6I3W', alt: 'Fachada Castellano', label: 'Fachada' },
  { src: 'https://lh3.googleusercontent.com/d/1apypI7om4hiZYQJ-w9vgpwFDoLbgoxrw', alt: 'Vista aérea Castellano', label: 'Vista Aérea' },
  { src: 'https://lh3.googleusercontent.com/d/1Qq2HebmH46u-OxWIv1Oyi439TnXzFqhe', alt: 'Vista aérea Castellano', label: 'Vista Aérea' },
  { src: 'https://lh3.googleusercontent.com/d/1crPYaXzdUpyWfE5ZqJ-st5FXHtww3RtR', alt: 'Hall de Entrada Castellano', label: 'Hall de Entrada' },
  { src: 'https://lh3.googleusercontent.com/d/1ENhsera0COxmCKZ5dkuNTt4bQncLpKj4', alt: 'Hall de Entrada Castellano', label: 'Hall de Entrada' },
  { src: 'https://lh3.googleusercontent.com/d/1C7I_CoafTvAyatrV4nDDB2nZdde0Tpvf', alt: 'Playground Castellano', label: 'Playground' },
  { src: 'https://lh3.googleusercontent.com/d/1ZGaCabSni8IwW-lYXHi6Uc5mJ4zeThSr', alt: 'Playground Castellano', label: 'Playground' },
  { src: 'https://lh3.googleusercontent.com/d/1Rqp00syfbESbAmIz0lFry_t9fkNzvL92', alt: 'Playground Castellano', label: 'Playground' },
  { src: 'https://lh3.googleusercontent.com/d/1DXT_slEOrdtK_8EMuRJiZTRKJWGLwdM4', alt: 'Playground Castellano', label: 'Playground' },
  { src: 'https://lh3.googleusercontent.com/d/19u7ofl_S7gXLrVJPloqpJuHJd0gwJY9D', alt: 'Salão de Festas Castellano', label: 'Salão de Festas' },
  { src: 'https://lh3.googleusercontent.com/d/10zqA9vxcuD8ykZtNLuGKYYEzDIf_1zH0', alt: 'Salão de Festas Castellano', label: 'Salão de Festas' },
  { src: 'https://lh3.googleusercontent.com/d/1vblQI9ps3_DH0R06z1yVqGT9_stS-lHT', alt: 'Salão de Festas Castellano', label: 'Salão de Festas' },
]

const DIFERENCIAIS = [
  '3 dormitórios com 109 a 112 m² privativos',
  '1 suíte com sacada privativa',
  '2 sacadas por apartamento',
  '2 elevadores e churrasqueira exclusiva',
]

const AMENIDADES = [
  'Salão de Festas','Hall de Entrada','Playground','Churrasqueira','2 Elevadores',
]

export const metadata: Metadata = {
  title: 'Castellano Residencial | Centro Içara SC',
  description: 'Castellano Residencial — 3 dormitórios com 109 a 112 m² privativos no Centro de Içara/SC. Inspirado em um castelo italiano. Sob consulta.',
  alternates: { canonical: `${SITE_URL}/empreendimento/fontana/castellano-centro-icara-sc` },
  openGraph: {
    title: 'Castellano Residencial | Centro Içara SC | Stiven Allan',
    description: 'Para viver momentos únicos — 3 dorms · 109–112 m² · Centro Içara/SC.',
    url: `${SITE_URL}/empreendimento/fontana/castellano-centro-icara-sc`,
    images: [{ url: IMG.hero, width: 1200, height: 630, alt: 'Castellano Residencial — Içara SC' }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Castellano Residencial | Centro Içara SC | Stiven Allan', description: '109–112 m² no Centro de Içara. Sob consulta.', images: [IMG.hero] },
  robots: { index: true, follow: true },
}

export default function CastellanoPage() {
  return (
    <main style={{ background: t.bg, color: t.ink, fontFamily: t.body, overflowX: 'hidden' }}>
      
      <style>{`
        html { scroll-behavior: smooth; }
        .cs-eyebrow { font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: ${t.purple}; font-family: ${t.display}; }
        .cs-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: .06em; line-height: 1.08; }
        .cs-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: .07em; }
        .cs-serif { font-family: ${t.serif}; font-style: italic; }
        .cs-rule { width: 56px; height: 1px; background: ${t.purple}; margin: 20px 0; }
        .cs-cta { display: inline-flex; align-items: center; gap: 10px; padding: 13px 30px; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; font-family: ${t.display}; border: 1px solid ${t.purple}; color: ${t.purple}; background: transparent; cursor: pointer; text-decoration: none; transition: background .25s, color .25s; }
        .cs-cta:hover { background: ${t.purple}; color: #fff; }
        .cs-cta-light { display: inline-flex; align-items: center; gap: 10px; padding: 13px 30px; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; font-family: ${t.display}; border: 1px solid rgba(239,233,246,0.55); color: ${t.onDark}; background: transparent; cursor: pointer; text-decoration: none; transition: background .25s, color .25s; }
        .cs-cta-light:hover { background: rgba(239,233,246,0.12); }
        .cs-navlink { font-family: ${t.display}; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: #fff; text-decoration: none; opacity: .82; transition: opacity .2s; }
        .cs-navlink:hover { opacity: 1; }
        .cs-fade { animation: csfade .9s ease forwards; }
        @keyframes csfade { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        .cs-gcard { overflow: hidden; }
        .cs-gcard:hover img { transform: scale(1.04); }
        .cs-gcard img { transition: transform .55s ease; }
        .cs-amen { display: flex; align-items: center; gap: 14px; padding: 16px 0; border-bottom: 1px solid ${t.line}; font-size: 14px; color: ${t.ink}; }
        .cs-amen:last-child { border-bottom: none; }
        .cs-lazer-card { border-radius: 2px; overflow: hidden; }
        .cs-wa { position: fixed; right: 20px; bottom: 20px; z-index: 900; width: 54px; height: 54px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 18px rgba(0,0,0,0.22); text-decoration: none; transition: transform .2s; }
        .cs-wa:hover { transform: scale(1.08); }
        @media (max-width: 860px) { .cs-nav-links { display: none !important; } }
      `}</style>

      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, padding: '28px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: t.display, fontWeight: 300, fontSize: 18, letterSpacing: '.18em', textTransform: 'uppercase', color: '#fff' }}>Stiven Allan</span>
        </a>
        <nav className="cs-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <a href="#residencial" className="cs-navlink">O Residencial</a>
          <a href="#galeria" className="cs-navlink">Galeria</a>
          <a href="#plantas" className="cs-navlink">Plantas</a>
          <a href="#localizacao" className="cs-navlink">Localização</a>
          <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ fontFamily: t.display, fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: '#fff', background: t.purple, padding: '10px 22px', textDecoration: 'none' }}>Quero saber mais</a>
        </nav>
      </header>

      <section id="top" style={{ position: 'relative', height: '100svh', minHeight: 560, overflow: 'hidden' }}>
        <HeroImage src={IMG.hero} alt="Castellano Residencial — Içara SC" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,11,20,0.78) 0%, rgba(15,11,20,0.2) 55%, transparent 100%)' }} />
        <div className="cs-fade" style={{ position: 'absolute', bottom: '10svh', left: '6vw', right: '6vw', maxWidth: 680 }}>
          <p className="cs-eyebrow" style={{ color: 'rgba(239,233,246,0.8)', marginBottom: 14 }}>Construtora Fontana · Centro · Içara/SC</p>
          <h1 className="cs-h1" style={{ fontSize: 'clamp(36px,6vw,80px)', color: '#fff', margin: '0 0 22px' }}>Castellano<br />Residencial</h1>
          <p className="cs-serif" style={{ fontSize: 'clamp(18px,2.2vw,26px)', color: 'rgba(239,233,246,0.88)', margin: '0 0 32px' }}>Para viver momentos únicos.</p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="cs-cta-light">Agendar visita</a>
        </div>
      </section>

      <section id="residencial" style={{ padding: 'clamp(72px,10vw,120px) 6vw', maxWidth: 900, margin: '0 auto' }}>
        <p className="cs-eyebrow" style={{ marginBottom: 12 }}>O Residencial</p>
        <div className="cs-rule" />
        <p className="cs-serif" style={{ fontSize: 'clamp(24px,3.5vw,46px)', lineHeight: 1.28, color: t.ink, margin: '0 0 32px' }}>
          Em uma charmosa comuna do norte da Itália, a Fontana buscou inspiração para o Castellano.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: t.muted, maxWidth: 680 }}>
          Quem passa por Castellano encanta-se com a beleza de um grandioso castelo em meio à tranquilidade das vilas italianas — um belo refúgio para quem procura sossego sem afastar-se da comodidade dos centros urbanos.
        </p>
      </section>

      <section id="galeria" style={{ padding: '0 0 clamp(48px,8vw,96px)' }}>
        <div style={{ padding: '0 6vw', marginBottom: 32 }}>
          <p className="cs-eyebrow">Galeria de Fotos</p>
          <div className="cs-rule" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 3 }}>
          <GalleryWithLightbox galeria={GALERIA} prefix="cs-" gradient="rgba(15,11,20,0.55)" />
        </div>
      </section>

      <section id="plantas" style={{ background: t.dark, padding: 'clamp(72px,10vw,120px) 6vw' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <p className="cs-eyebrow" style={{ color: t.onDarkMuted }}>As Residências</p>
            <div className="cs-rule" style={{ background: t.purple }} />
            <h2 className="cs-h2" style={{ fontSize: 'clamp(28px,4vw,52px)', color: t.onDark, margin: '0 0 24px', lineHeight: 1.12 }}>109 a 112 m²<br />de sofisticação</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: t.onDarkMuted, marginBottom: 36 }}>3 dormitórios com 1 suíte e 2 sacadas — espaço generoso com acabamento de alto padrão, projetado para conforto e elegância.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
              {[['3','Dormitórios'],['1','Suíte'],['109–112','m² privativos'],['2','Sacadas']].map(([val,lbl])=>(
                <div key={lbl}>
                  <div style={{ fontFamily: t.display, fontSize: 32, fontWeight: 200, color: t.onDark, letterSpacing: '.04em' }}>{val}</div>
                  <div style={{ fontFamily: t.display, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: t.onDarkMuted }}>{lbl}</div>
                </div>
              ))}
            </div>
            <LeadCaptureButton slug="castellano-centro-icara-sc" construtora_slug="fontana" className="cs-cta-light"  propertyDisplayName="Castellano Residencial" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[['Endereço','Rua Pio XII esq. Rua Duque de Caxias — Centro, Içara/SC'],['Status','Em obras'],['Preço','Sob consulta']].map(([k,v])=>(
              <div key={k} style={{ padding: '28px 32px', border: `1px solid rgba(239,233,246,0.12)`, borderRadius: 2 }}>
                <p style={{ fontFamily: t.display, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: t.onDarkMuted, margin: '0 0 8px' }}>{k}</p>
                <p style={{ fontSize: 15, color: t.onDark, margin: 0 }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(72px,10vw,120px) 6vw', maxWidth: 1100, margin: '0 auto' }}>
        <p className="cs-eyebrow">Diferenciais das Unidades</p>
        <div className="cs-rule" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 0 }}>
          {DIFERENCIAIS.map((d,i)=>(
            <div key={d} style={{ padding: '32px 28px', borderRight: i%2===0 ? `1px solid ${t.line}` : 'none', borderBottom: `1px solid ${t.line}` }}>
              <div style={{ fontFamily: t.display, fontSize: 28, fontWeight: 200, color: t.purple, marginBottom: 12, letterSpacing: '.04em' }}>0{i+1}</div>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: t.muted, margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: t.bg, padding: 'clamp(72px,10vw,120px) 6vw' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <p className="cs-eyebrow">Área de Lazer</p>
            <div className="cs-rule" />
            <h2 className="cs-h2" style={{ fontSize: 'clamp(24px,3vw,40px)', color: t.ink, margin: '0 0 32px' }}>Lazer completo<br />para toda a família</h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {AMENIDADES.map(a=>(
                <li key={a} className="cs-amen">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.purple, flexShrink: 0 }} />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <LightboxPhoto src={IMG.lazer} alt="Área de lazer Castellano Residencial" label="Lazer" cardClass="cs-lazer-card" imgSizes="(max-width: 768px) 100vw, 50vw" />
        </div>
      </section>

      <section id="localizacao" style={{ background: t.dark, padding: 'clamp(72px,10vw,120px) 6vw' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <p className="cs-eyebrow" style={{ color: t.onDarkMuted }}>Localização</p>
            <div className="cs-rule" style={{ background: t.purple }} />
            <h2 className="cs-h2" style={{ fontSize: 'clamp(24px,3vw,40px)', color: t.onDark, margin: '0 0 24px' }}>Centro de<br />Içara/SC</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: t.onDarkMuted, marginBottom: 12 }}>Rua Pio XII esq. Rua Duque de Caxias</p>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: t.onDarkMuted, marginBottom: 32 }}>Localização privilegiada no centro de Içara, com fácil acesso a comércio, escolas e serviços da cidade.</p>
            <a href="https://www.google.com/maps/search/?api=1&query=Rua+Pio+XII+Içara+SC" target="_blank" rel="noopener noreferrer" className="cs-cta-light">Ver no mapa</a>
          </div>
          <div style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 2, overflow: 'hidden' }}>
            <Image unoptimized src={IMG.mapa} alt="Mapa localização Castellano" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      <section style={{ background: t.purple, padding: 'clamp(72px,10vw,120px) 6vw' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="cs-eyebrow" style={{ color: 'rgba(239,233,246,0.7)' }}>Como adquirir</p>
          <div className="cs-rule" style={{ background: 'rgba(239,233,246,0.5)' }} />
          <h2 className="cs-h2" style={{ fontSize: 'clamp(24px,3.5vw,44px)', color: t.onDark, margin: '0 0 48px' }}>Financiamento<br />Direto com a Construtora</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, marginBottom: 48 }}>
            {[['01','Escolha seu imóvel','Selecione a planta ideal para você e sua família.'],['02','Fale com Stiven','Tire dúvidas pelo WhatsApp — rápido e sem burocracia.'],['03','Realize seu sonho','Condições personalizadas para o seu perfil.']].map(([n,t1,t2])=>(
              <div key={n}>
                <div style={{ fontFamily: t.display, fontSize: 36, fontWeight: 200, color: 'rgba(239,233,246,0.4)', marginBottom: 12 }}>{n}</div>
                <p style={{ fontFamily: t.display, fontSize: 14, letterSpacing: '.12em', textTransform: 'uppercase', color: t.onDark, margin: '0 0 8px' }}>{t1}</p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: t.onDarkMuted, margin: 0 }}>{t2}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={CATALOGO_PDF} target="_blank" rel="noopener noreferrer" className="cs-cta-light">Baixar catálogo</a>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="cs-cta-light">Falar com Stiven</a>
          </div>
        </div>
      </section>

      <section style={{ position: 'relative', minHeight: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Image unoptimized src={IMG.hero} alt="Castellano Residencial — Içara" fill sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,11,20,0.75)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 6vw' }}>
          <p className="cs-eyebrow" style={{ color: 'rgba(239,233,246,0.7)', marginBottom: 16 }}>Castellano Residencial</p>
          <h2 className="cs-serif" style={{ fontSize: 'clamp(28px,5vw,60px)', color: t.onDark, margin: '0 0 32px', lineHeight: 1.2 }}>Para viver momentos únicos.</h2>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="cs-cta-light">Quero saber mais</a>
        </div>
      </section>

      <RelatedProperties atualSlug="castellano-centro-icara-sc" cidade="Içara" />

      <footer style={{ background: t.purpleDark, padding: 'clamp(48px,8vw,80px) 6vw' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 48 }}>
          <div>
            <span style={{ fontFamily: t.display, fontWeight: 300, fontSize: 16, letterSpacing: '.18em', textTransform: 'uppercase', color: t.onDark }}>Stiven Allan</span>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: t.onDarkMuted, marginTop: 16 }}>Especialista em imóveis de alto padrão da Construtora Fontana em Santa Catarina.</p>
          </div>
          <div>
            <p style={{ fontFamily: t.display, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: t.onDarkMuted, marginBottom: 16 }}>Contato</p>
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 13, color: t.onDark, textDecoration: 'none', marginBottom: 8 }}>WhatsApp: (48) 99164-2332</a>
            <a href="mailto:stivenallan@gmail.com" style={{ display: 'block', fontSize: 13, color: t.onDark, textDecoration: 'none' }}>stivenallan@gmail.com</a>
          </div>
          <div>
            <p style={{ fontFamily: t.display, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: t.onDarkMuted, marginBottom: 16 }}>Empreendimento</p>
            <p style={{ fontSize: 13, color: t.onDark, margin: '0 0 6px' }}>Castellano Residencial</p>
            <p style={{ fontSize: 13, color: t.onDarkMuted, margin: 0 }}>Centro · Içara/SC</p>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '32px auto 0', paddingTop: 24, borderTop: `1px solid rgba(239,233,246,0.1)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: t.onDarkMuted, margin: 0 }}>© {new Date().getFullYear()} Stiven Allan · Todos os direitos reservados</p>
          <a href="/" style={{ fontSize: 12, color: t.onDarkMuted, textDecoration: 'none' }}>Ver todos os imóveis</a>
        </div>
      </footer>

      <a href={WPP} target="_blank" rel="noopener noreferrer" className="cs-wa" aria-label="WhatsApp">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
      </a>
    </main>
  )
}
