import type { Metadata } from 'next'
import Image from 'next/image'
import { HeroImage } from '@/components/HeroImage'
import Link from 'next/link'
import GalleryWithLightbox from './gallery-lightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Tremezzo%20Residencial%20em%20Crici%C3%BAma.%20Pode%20me%20passar%20mais%20informa%C3%A7%C3%B5es%3F'

export const metadata: Metadata = {
  title: 'Tremezzo Residencial | Centro Criciúma',
  description: 'Tremezzo Residencial — 3 dormitórios, 125 m², decorado disponível para visitação. 18 andares no Centro de Criciúma. Financiamento direto Fontana, sem banco.',
  alternates: { canonical: SITE_URL + '/empreendimento/fontana/tremezzo-residencial-centro-criciuma-sc' },
  openGraph: {
    title: 'Tremezzo Residencial | Criciúma | Stiven Allan',
    description: 'Apartamento decorado disponível. 3 dormitórios, 125 m², Centro Criciúma. Financiamento direto Fontana.',
    url: SITE_URL + '/empreendimento/fontana/tremezzo-residencial-centro-criciuma-sc',
    siteName: 'Stiven Allan — Imóveis',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://lh3.googleusercontent.com/d/1zwMSHa-Ja6MGdlC2lq9fxQU7plgxHBLo', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tremezzo Residencial | Centro Criciúma | Stiven Allan',
    description: 'Decorado disponível para visita. 125 m², 18 andares. Financiamento direto da construtora.',
    images: ['https://lh3.googleusercontent.com/d/1zwMSHa-Ja6MGdlC2lq9fxQU7plgxHBLo'],
  },
  robots: { index: true, follow: true },
}
const RENDERS = [
  { src: 'https://lh3.googleusercontent.com/d/1zwMSHa-Ja6MGdlC2lq9fxQU7plgxHBLo', alt: 'Tremezzo Residencial — fachada principal', label: 'Fachada' },
  { src: 'https://lh3.googleusercontent.com/d/15q1c6rVrgvuywQ6SdRsWDtnVcXT8qSoB', alt: 'Tremezzo Residencial — fachada angular', label: 'Fachada angular' },
  { src: 'https://lh3.googleusercontent.com/d/1LXRWetoAesYcsX9Z147NG5a6v_1MGR5x', alt: 'Tremezzo Residencial — fachada lateral', label: 'Fachada lateral' },
  { src: 'https://lh3.googleusercontent.com/d/1eU-TvLidHnIJ6fVfD-vZV79eQxjYW1wM', alt: 'Tremezzo Residencial — fotomontagem', label: 'Fotomontagem' },
  { src: 'https://lh3.googleusercontent.com/d/1hqJTMIkDtH3sfz4oiRzTQyPMk1jxcBTL', alt: 'Tremezzo Residencial — acesso principal', label: 'Acesso principal' },
  { src: 'https://lh3.googleusercontent.com/d/1_JkJJQdhrpqu2-21VipzXbhA00ODkIyd', alt: 'Tremezzo Residencial — hall de entrada', label: 'Hall de entrada' },
  { src: 'https://lh3.googleusercontent.com/d/17kPkJxoXpQh1AggivjZGTwr-8_bSuI-u', alt: 'Tremezzo — piscina adulto', label: 'Piscina' },
  { src: 'https://lh3.googleusercontent.com/d/1sAi2MrrSvv81n-0rXdD5UUvP2yvIGfk_', alt: 'Tremezzo — espaço fitness', label: 'Fitness' },
  { src: 'https://lh3.googleusercontent.com/d/1UJt4R_9PgpUm3GMFRoYnTXU7SyVthYAB', alt: 'Tremezzo — coworking', label: 'Coworking' },
  { src: 'https://lh3.googleusercontent.com/d/1_JKSBGU6bogh2mWM6J8hjxKpqrzYjzRL', alt: 'Tremezzo — sala de jogos', label: 'Sala de jogos' },
  { src: 'https://lh3.googleusercontent.com/d/1Y0YSrz60_PHy0NJKLWlIklGgaN3Y-EYC', alt: 'Tremezzo — horta e jardim', label: 'Jardim' },
  { src: 'https://lh3.googleusercontent.com/d/1DDLQmXlzGCipAfJniuhbrE4I4ODXsG9v', alt: 'Tremezzo — salão de festas', label: 'Salão de festas' },
  { src: 'https://lh3.googleusercontent.com/d/1aiw6SZXMZxhIZ9BLisK1pXjYwiuLtCb6', alt: 'Tremezzo — salão de festas ângulo 2', label: 'Salão de festas 2' },
  { src: 'https://lh3.googleusercontent.com/d/1bWFhCE1vy7pjxqcnXRe_1h1bGzAN0XVi', alt: 'Tremezzo — living integrado', label: 'Living integrado' },
  { src: 'https://lh3.googleusercontent.com/d/1COeweim5wRugw9oLBJ9JbcH42rvwjCNu', alt: 'Tremezzo — quiosque gourmet', label: 'Quiosque gourmet' },
  { src: 'https://lh3.googleusercontent.com/d/1H4xGsrk1_xYpi8jZPowW6LxfhRdXm0Hz', alt: 'Tremezzo — sacada gourmet', label: 'Sacada gourmet' },
  { src: 'https://lh3.googleusercontent.com/d/1UzTzNisPdmEp6325oRjxCJB4zZJHXZae', alt: 'Tremezzo — playground', label: 'Playground' },
  { src: 'https://lh3.googleusercontent.com/d/11pQk-K--lBt3G4oh4vzc8eI_iFDNhM8E', alt: 'Tremezzo — espaço pet', label: 'Espaço pet' },
  { src: 'https://lh3.googleusercontent.com/d/1g9afEAHK0jHFdwjATu0NQNR-RHb0XJ5M', alt: 'Tremezzo — brinquedoteca', label: 'Brinquedoteca' },
  { src: 'https://lh3.googleusercontent.com/d/12lEdyYLbfr2iGixI1zYdHpR1SWYj1Yfd', alt: 'Tremezzo — suíte tipo', label: 'Suíte tipo' },
]
const GALERIA = [
  { src: 'https://lh3.googleusercontent.com/d/18HE4iwX3yyHWSrwmdDy7Bh24cV5bXfds', alt: 'Tremezzo decorado — sala de estar', label: 'Sala de estar' },
  { src: 'https://lh3.googleusercontent.com/d/1qFS3jO4QLO3NYiti72txNScf3OKYEEPr', alt: 'Tremezzo decorado — living integrado', label: 'Living' },
  { src: 'https://lh3.googleusercontent.com/d/1JQC2OHVfewNqodtfgiqbCZS08AxjNl5B', alt: 'Tremezzo decorado — cozinha quartzito', label: 'Cozinha' },
  { src: 'https://lh3.googleusercontent.com/d/1IOn-JOwk8gnrSPgmgDEwCupYVooALGAF', alt: 'Tremezzo decorado — suíte master', label: 'Suíte master' },
  { src: 'https://lh3.googleusercontent.com/d/1Ko3ZZpNQ0O30hMqN_rRVZutxgVdoNCmr', alt: 'Tremezzo decorado — dormitório', label: 'Dormitório' },
  { src: 'https://lh3.googleusercontent.com/d/1OTUk2uARjk3i92cCnqY7lVckkvee9aYY', alt: 'Tremezzo decorado — sacada gourmet churrasqueira', label: 'Sacada gourmet' },
  { src: 'https://lh3.googleusercontent.com/d/1s5g57AZBwvSPs6FVmu5O4MMoP9xCMyFx', alt: 'Tremezzo decorado — banheiro', label: 'Banheiro' },
  { src: 'https://lh3.googleusercontent.com/d/18w2x6MEefc844FYB-ngVVC7GTLQHvicT', alt: 'Tremezzo decorado — lavanderia independente', label: 'Lavanderia' },
  { src: 'https://lh3.googleusercontent.com/d/1PNmTx_2w0n_fHE4_gdjusi1HAzI2K9I_', alt: 'Tremezzo decorado — varanda', label: 'Varanda' },
  { src: 'https://lh3.googleusercontent.com/d/1fOCMDkxomAmTB07Tm4RAM1RojVrKMkZM', alt: 'Tremezzo decorado — área gourmet', label: 'Área gourmet' },
  { src: 'https://lh3.googleusercontent.com/d/19isrU_y2eH8YW2_qLM5vxKstj_Fex2oB', alt: 'Tremezzo decorado — porcelanato retificado', label: 'Acabamento' },
  { src: 'https://lh3.googleusercontent.com/d/1Ag_2wRbJMA7-sZSie1B_CCj84_JQatqM', alt: 'Tremezzo decorado — vista privilegiada', label: 'Vista privilegiada' },
]

const LAZER_IMGS = RENDERS.slice(6)

export default function TremezzoPage() {
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Jost:wght@200;300;400&family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=Hanken+Grotesk:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #FAFAF8; color: #1A1814; font-family: 'Hanken Grotesk', system-ui, sans-serif; }
  .tz-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: background .35s ease, box-shadow .35s ease; }
  @supports (animation-timeline: scroll()) {
    .tz-nav { animation: tz-nav-fill linear both; animation-timeline: scroll(); animation-range: 0px 80px; }
    @keyframes tz-nav-fill { to { background: rgba(250,250,248,0.96); backdrop-filter: blur(20px); box-shadow: 0 1px 0 rgba(26,24,20,0.10); } }
  }
  .tz-fade { opacity: 0; transform: translateY(24px); animation: tzfade .9s ease forwards; }
  .tz-fade-1 { animation-delay: .1s; } .tz-fade-2 { animation-delay: .25s; } .tz-fade-3 { animation-delay: .4s; }
  @keyframes tzfade { to { opacity: 1; transform: none; } }
  .tz-gcard { position: relative; overflow: hidden; border-radius: 6px; cursor: zoom-in; }
  .tz-gcard img { transition: transform .8s ease; }
  .tz-gcard:hover img { transform: scale(1.06); }
  .tz-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; font-family: 'Jost', system-ui, sans-serif; font-size: 11px; font-weight: 400; letter-spacing: 0.3em; text-transform: uppercase; text-decoration: none; border: 1px solid #6B2D3E; color: #6B2D3E; background: transparent; cursor: pointer; transition: all .25s ease; border-radius: 2px; }
  .tz-btn:hover { background: #6B2D3E; color: #fff; }
  .tz-btn--solid { background: #6B2D3E; color: #fff; }
  .tz-btn--solid:hover { background: #4E1F2C; border-color: #4E1F2C; }
  .tz-rule { width: 40px; height: 1px; background: #6B2D3E; border: none; display: block; }
  .tz-h2 { font-family: 'Jost', system-ui, sans-serif; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.1; }
  .tz-serif { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 300; }
  .tz-diff-item { display: flex; align-items: flex-start; gap: 16px; padding: 18px 0; border-bottom: 1px solid rgba(26,24,20,0.10); }
  .tz-diff-icon { width: 36px; height: 36px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(107,45,62,0.08); border-radius: 50%; font-size: 16px; }
  .tz-lcard { position: relative; overflow: hidden; border-radius: 6px; aspect-ratio: 4/3; }
  .tz-lcard img { transition: transform .8s ease; }
  .tz-lcard:hover img { transform: scale(1.06); }
  .tz-wa-float { position: fixed; bottom: 28px; right: 28px; z-index: 999; width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(37,211,102,0.35); transition: transform .2s ease; }
  .tz-wa-float:hover { transform: scale(1.08); }
  @media (max-width: 768px) {
    .tz-step-grid { grid-template-columns: 1fr !important; }
    .tz-metrics-grid { grid-template-columns: repeat(2,1fr) !important; }
    .tz-diff-grid { grid-template-columns: 1fr !important; }
  }
`
  return (
    <>
      <PropertySchema
      nome="Tremezzo Residencial"
      slug="tremezzo-residencial-centro-criciuma-sc"
      construtora_slug="fontana"
      cidade="Criciúma"
      uf="SC"
      bairro="Centro"
      descricao="Apartamentos 3 dormitórios, 125 m2, 18 andares no Centro de Criciúma/SC. Decorado disponivel. Financiamento direto Fontana."
      imagem="https://lh3.googleusercontent.com/d/1zwMSHa-Ja6MGdlC2lq9fxQU7plgxHBLo"
      faq={[
        {pergunta:"Como funciona o financiamento direto do Tremezzo Residencial?",resposta:"Entrada de 20%, saldo em até 72 parcelas mensais e 6 reforos anuais (cada reforo = 5 mensais), correcao pelo CUB/SC durante a obra. Entrega prevista marco 2027. Sem banco."},
        {pergunta:"Qual a previsao de entrega do Tremezzo Residencial?",resposta:"Previsao de entrega marco de 2027, no Centro de Criciúma/SC."},
        {pergunta:"O Tremezzo tem apartamento decorado para visitar?",resposta:"Sim. O apartamento decorado esta disponivel para visitacao. Agende com Stiven pelo WhatsApp (48) 99164-2332."},
        {pergunta:"Quantos andares e qual a metragem do Tremezzo?",resposta:"18 andares, apartamentos de 3 dormitórios com 125 m2 privativos, no Centro de Criciúma/SC."},
        {pergunta:"Posso usar FGTS ou financiamento bancario no Tremezzo?",resposta:"Sim. Alem do financiamento direto Fontana, e possivel financiamento bancario ou FGTS. Consulte Stiven pelo WhatsApp."},
      ]}
    />
      <style>{`${CSS}`}</style>

      {/* NAV */}
      <nav className="tz-nav">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(18px,4vw,48px)', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: 15, textDecoration: 'none', color: '#FFFFFF', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            Stiven Allan
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="/#empreendimentos" style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>Empreendimentos</Link>
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6B2D3E', textDecoration: 'none', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>WhatsApp</a>
          </div>
        </div>
      </nav>
      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden' }}>
        <HeroImage unoptimized src={RENDERS[0].src} alt="Tremezzo Residencial — fachada, Centro de Criciúma SC" fill priority style={{ objectFit: 'cover', objectPosition: 'center 40%' }} sizes="100vw" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.40) 55%, rgba(0,0,0,0.55) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 clamp(24px,6vw,80px)', paddingTop: 68 }}>
          <p className="tz-fade" style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(245,238,240,0.80)', marginBottom: 24, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
            Construtora Fontana · Centro · Criciúma/SC
          </p>
          <h1 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 200, textTransform: 'uppercase', letterSpacing: '0.15em', lineHeight: 1.05, fontSize: 'clamp(38px,7vw,92px)', color: '#FFFFFF', textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 2px 32px rgba(0,0,0,0.60)', maxWidth: 800 }} className="tz-fade tz-fade-1">
            Celebre o inesquecível.
          </h1>
          <hr className="tz-rule tz-fade tz-fade-2" style={{ margin: '28px auto' }} />
          <p className="tz-serif tz-fade tz-fade-2" style={{ fontSize: 'clamp(16px,2.2vw,22px)', color: '#FFFFFF', maxWidth: 600, margin: '0 0 40px', lineHeight: 1.6, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Tremezzo Residencial — sofisticação nos detalhes, conforto em cada metro quadrado, Centro de Criciúma.
          </p>
          <div className="tz-fade tz-fade-3" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="tz-btn tz-btn--solid">Agendar visita ao decorado</a>
            <LeadCaptureButton slug="tremezzo-residencial-centro-criciuma-sc" construtora_slug="fontana"  propertyDisplayName="Tremezzo Residencial" />
            <a href="#galeria" className="tz-btn" style={{ borderColor: 'rgba(255,255,255,0.55)', color: '#fff', backdropFilter: 'blur(8px)' }}>Ver galeria</a>
          </div>
          <p className="tz-fade tz-fade-3" style={{ marginTop: 20, fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            Apartamento decorado aberto para visitação.
          </p>
        </div>
        <a href="#conceito" style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.55)', fontSize: 22, textDecoration: 'none' }}>↓</a>
      </section>

      {/* CONCEITO */}
      <section id="conceito" style={{ background: '#FAFAF8', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(48px,6vw,96px)', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#6B2D3E', display: 'block', marginBottom: 20 }}>O empreendimento</p>
            <h2 className="tz-h2" style={{ fontSize: 'clamp(26px,4vw,44px)', color: '#1A1814', marginBottom: 28 }}>Sofisticação<br />em cada detalhe.</h2>
            <hr className="tz-rule" style={{ marginBottom: 28 }} />
            <p className="tz-serif" style={{ fontSize: 'clamp(17px,2vw,21px)', color: '#6B655B', lineHeight: 1.7, marginBottom: 24 }}>
              O Tremezzo Residencial é um projeto de 18 andares no coração de Criciúma, onde cada detalhe foi pensado para quem não abre mão do melhor. Sacada gourmet integrada ao living, churrasqueira a carvão, persianas automatizadas e fechadura digital.
            </p>
            <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 14, color: '#6B655B', lineHeight: 1.8, marginBottom: 32 }}>
              Com 3 dormitórios (1 suíte master), 125 m² privativos e 200 m² de área total, cada unidade foi concebida para oferecer privacidade, conforto e funcionalidade. São apenas 4 apartamentos por andar.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[{ ico: '🏗', label: 'Em obras · 03/2027' }, { ico: '📐', label: '125 m² privativos' }, { ico: '🏢', label: '18 andares' }, { ico: '🚗', label: '2 vagas' }].map(({ ico, label }) => (
                <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(107,45,62,0.07)', color: '#6B2D3E', borderRadius: 2, padding: '7px 14px', fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 12, letterSpacing: '0.1em' }}>{ico} {label}</span>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 4, overflow: 'hidden' }}>
            <Image unoptimized src={RENDERS[1].src} alt="Tremezzo Residencial — perspectiva" fill style={{ objectFit: 'cover' }} sizes="(min-width:768px) 50vw,100vw" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,12,16,0.55), transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
              <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(245,238,240,0.70)', marginBottom: 4 }}>Status</p>
              <p style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, fontSize: 18, color: '#F5EEF0', letterSpacing: '0.08em' }}>Em obras · Entrega 03/2027</p>
            </div>
          </div>
        </div>
      </section>
      {/* VIDEO */}
      <section style={{ background: '#1A0C10', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(107,45,62,0.80)', display: 'block', marginBottom: 16 }}>Vídeo oficial</p>
            <h2 className="tz-h2" style={{ fontSize: 'clamp(24px,3.5vw,38px)', color: '#F5EEF0' }}>Conheça o Tremezzo</h2>
          </div>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 6, overflow: 'hidden' }}>
            <iframe src="https://www.youtube.com/embed/8pwzAjEyH4s" title="Tremezzo Residencial — vídeo oficial" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} />
          </div>
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" style={{ background: '#FAFAF8', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#6B2D3E', display: 'block', marginBottom: 16 }}>Galeria</p>
            <h2 className="tz-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#1A1814', marginBottom: 16 }}>Apartamento decorado</h2>
            <p className="tz-serif" style={{ fontSize: 'clamp(15px,1.8vw,19px)', color: '#6B655B', maxWidth: 480, margin: '0 auto' }}>
              Apartamento decorado aberto para visitação. Conheça pessoalmente cada detalhe.
            </p>
          </div>
          <GalleryWithLightbox galeria={GALERIA} prefix="tz" gradient="linear-gradient(to top, rgba(26,12,16,0.55), transparent 50%)" />
        </div>
      </section>

      {/* AS RESIDÊNCIAS */}
      <section style={{ background: '#1A0C10', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(107,45,62,0.80)', display: 'block', marginBottom: 16 }}>As residências</p>
            <h2 className="tz-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#F5EEF0', marginBottom: 16 }}>Números que encantam</h2>
            <hr className="tz-rule" style={{ margin: '0 auto 24px' }} />
          </div>
          <div className="tz-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'clamp(32px,4vw,56px)' }}>
            {[{ val: '125', label: 'm² privativos' }, { val: '18', label: 'Andares' }, { val: '+1.000', label: 'm² de lazer' }, { val: '03/2027', label: 'Entrega prevista' }].map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 200, fontSize: 'clamp(40px,6vw,64px)', color: 'rgba(245,238,240,0.90)', letterSpacing: '0.04em', lineHeight: 1 }}>{val}</p>
                <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(245,238,240,0.65)', marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 24, borderTop: '1px solid rgba(245,238,240,0.10)', paddingTop: 48 }}>
            {[{ n: '3', label: 'Dormitórios (1 suíte)' }, { n: '200', label: 'm² área total' }, { n: '4', label: 'Aptos por andar' }, { n: '2', label: 'Elevadores' }, { n: '2', label: 'Vagas' }, { n: '~72', label: 'Unidades' }].map(({ n, label }) => (
              <div key={label} style={{ textAlign: 'center', padding: '24px 16px' }}>
                <p style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 200, fontSize: 'clamp(28px,4vw,48px)', color: '#D4869A', letterSpacing: '0.04em', lineHeight: 1 }}>{n}</p>
                <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,238,240,0.65)', marginTop: 8 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* DIFERENCIAIS */}
      <section style={{ background: '#FAFAF8', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#6B2D3E', display: 'block', marginBottom: 16 }}>Diferenciais</p>
            <h2 className="tz-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#1A1814' }}>O padrão que transforma</h2>
          </div>
          <div className="tz-diff-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0 48px', maxWidth: 840, margin: '0 auto' }}>
            {[
              { ico: '🔐', title: 'Fechadura digital', desc: 'Tecnologia e segurança na entrada do seu lar.' },
              { ico: '🪟', title: 'Persianas automatizadas', desc: 'Controle de luz e privacidade com praticidade.' },
              { ico: '🏺', title: 'Porcelanato retificado 80×80 cm', desc: 'Acabamento impecável em grandes formatos.' },
              { ico: '🪨', title: 'Quartzito Gabbana Polido', desc: 'Bancada de cozinha com padrão premium.' },
              { ico: '🔇', title: 'Manta acústica', desc: 'Conforto sonoro para o seu descanso.' },
              { ico: '🧺', title: 'Lavanderia independente', desc: 'Com acesso externo — praticidade no dia a dia.' },
              { ico: '🍖', title: 'Sacada gourmet + churrasqueira', desc: 'Integrada ao living, com churrasqueira a carvão.' },
              { ico: '🅿', title: '2 vagas de garagem', desc: 'Espaço garantido para toda a família.' },
            ].map(({ ico, title, desc }) => (
              <div key={title} className="tz-diff-item">
                <div className="tz-diff-icon">{ico}</div>
                <div>
                  <p style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 400, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1A1814', marginBottom: 4 }}>{title}</p>
                  <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 14, color: '#6B655B', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAZER */}
      <section style={{ background: '#1A0C10', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(107,45,62,0.80)', display: 'block', marginBottom: 16 }}>Lazer</p>
            <h2 className="tz-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#F5EEF0', marginBottom: 16 }}>+1.000 m² de experiências</h2>
            <p className="tz-serif" style={{ fontSize: 'clamp(15px,1.8vw,19px)', color: 'rgba(245,238,240,0.65)', maxWidth: 520, margin: '0 auto' }}>
              Piscinas, fitness, coworking, salão de festas, brinquedoteca, espaço pet e muito mais.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {LAZER_IMGS.map((item, i) => (
              <div key={i} className="tz-lcard">
                <Image unoptimized src={item.src} alt={item.alt} fill style={{ objectFit: 'cover' }} sizes="(min-width:1024px) 33vw,50vw" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,12,16,0.65), transparent 50%)' }} />
                <p style={{ position: 'absolute', bottom: 12, left: 14, color: 'rgba(245,238,240,0.90)', fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{item.label}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {['Piscina adulto','Piscina infantil','Fitness','Sala de jogos','Coworking','Brinquedoteca','Playground','Espaço pet','Quiosque BBQ','Jardim','Bicicletário','Terraço','Salão de festas'].map(item => (
              <span key={item} style={{ padding: '7px 14px', background: 'rgba(107,45,62,0.15)', borderRadius: 2, fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(107,45,62,0.85)' }}>{item}</span>
            ))}
          </div>
        </div>
      </section>
      {/* LOCALIZAÇÃO */}
      <section style={{ background: '#FAFAF8', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#6B2D3E', display: 'block', marginBottom: 16 }}>Localização</p>
            <h2 className="tz-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#1A1814', marginBottom: 12 }}>Centro de Criciúma</h2>
            <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 15, color: '#6B655B', maxWidth: 420, margin: '0 auto' }}>
              Av. Vítor Meireles c/ Rua Domingos Bristot — tudo que você precisa a poucos minutos.
            </p>
          </div>
          <div style={{ borderRadius: 6, overflow: 'hidden', aspectRatio: '16/7' }}>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3534.5!2d-49.3703!3d-28.6778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zQXYuIFbDrXRvciBNZWlyZWxlcywgQ3JpY2nDum1hLCBTQw!5e0!3m2!1spt-BR!2sbr!4v1700000000000" title="Localização Tremezzo Residencial" style={{ width: '100%', height: '100%', border: 0, display: 'block' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </div>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
            {[{ label: 'Endereço', val: 'Av. Vítor Meireles c/ R. Domingos Bristot' }, { label: 'Bairro', val: 'Centro, Criciúma/SC' }, { label: 'Status', val: 'Em obras · Entrega 03/2027' }].map(({ label, val }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#6B2D3E', marginBottom: 4 }}>{label}</p>
                <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 15, color: '#1A1814' }}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINANCIAMENTO DIRETO */}
      <section style={{ background: '#FAFAF8', padding: 'clamp(64px,8vw,120px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(26,24,20,0.10)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#6B2D3E', display: 'block', marginBottom: 16 }}>Como funciona</p>
            <h2 className="tz-h2" style={{ fontSize: 'clamp(24px,3.5vw,42px)', color: '#1A1814', marginBottom: 16 }}>Financiamento direto</h2>
            <p className="tz-serif" style={{ fontSize: 'clamp(15px,1.8vw,19px)', color: '#6B655B', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Negociado diretamente com a Construtora Fontana, sem intermediação bancária.
            </p>
          </div>
          <div className="tz-step-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'clamp(32px,4vw,56px)' }}>
            {[
              { n: '01', titulo: 'Escolha a sua unidade', desc: 'Conheça o decorado e selecione a unidade ideal para o seu estilo de vida.' },
              { n: '02', titulo: 'Simulação personalizada', desc: 'Stiven estrutura as condições de pagamento com a construtora, de acordo com o seu perfil.' },
              { n: '03', titulo: 'Contrato direto', desc: 'Documentação simplificada, sem intermediários.' },
            ].map(({ n, titulo, desc }) => (
              <div key={n} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: "'Jost', system-ui, sans-serif", fontSize: 36, fontWeight: 200, color: 'rgba(107,45,62,0.20)', lineHeight: 1, flexShrink: 0, width: 48 }}>{n}</span>
                <div>
                  <p style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 400, fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1A1814', marginBottom: 10 }}>{titulo}</p>
                  <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 14, color: '#6B655B', lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: '#1A0C10', padding: 'clamp(80px,10vw,140px) clamp(24px,6vw,80px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(107,45,62,0.80)', display: 'block', marginBottom: 24 }}>Próximo passo</p>
          <h2 className="tz-serif" style={{ fontSize: 'clamp(32px,5vw,58px)', color: '#F5EEF0', fontStyle: 'italic', fontWeight: 300, lineHeight: 1.2, marginBottom: 24 }}>
            Agende sua visita ao decorado.
          </h2>
          <hr className="tz-rule" style={{ margin: '0 auto 32px' }} />
          <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 'clamp(15px,1.8vw,18px)', color: 'rgba(245,238,240,0.65)', lineHeight: 1.7, marginBottom: 40 }}>
            O decorado do Tremezzo Residencial está aberto para visitação. Conheça o padrão de acabamento e fale com Stiven para descobrir as condições de pagamento direto.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="tz-btn tz-btn--solid">Falar com Stiven</a>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="tz-btn" style={{ borderColor: 'rgba(245,238,240,0.30)', color: '#F5EEF0' }}>Sob consulta · Financiamento direto</a>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer style={{ background: '#1A0C10', borderTop: '1px solid rgba(245,238,240,0.08)', padding: 'clamp(32px,4vw,48px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: 14, color: '#F5EEF0' }}>Stiven Allan</p>
            <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 12, color: 'rgba(245,238,240,0.65)', marginTop: 4 }}>CRECI 60.275 · Imóveis no Sul de Santa Catarina</p>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <Link href="/" style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,238,240,0.65)', textDecoration: 'none' }}>Início</Link>
            <Link href="/#empreendimentos" style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,238,240,0.65)', textDecoration: 'none' }}>Empreendimentos</Link>
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6B2D3E', textDecoration: 'none' }}>WhatsApp</a>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '16px auto 0', paddingTop: 16, borderTop: '1px solid rgba(245,238,240,0.05)' }}>
          <p style={{ fontFamily: "'Hanken Grotesk', system-ui, sans-serif", fontSize: 11, color: 'rgba(245,238,240,0.30)', letterSpacing: '0.08em' }}>
            {new Date().getFullYear()} Stiven Allan · Tremezzo Residencial é um empreendimento da Construtora Fontana. Imagens meramente ilustrativas.
          </p>
        </div>
      </footer>

      {/* WA FLOAT */}
      <a href={WPP} target="_blank" rel="noopener noreferrer" className="tz-wa-float" aria-label="Falar com Stiven pelo WhatsApp">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      <PropertyFAQ items={[
        {pergunta:"Como funciona o financiamento direto do Tremezzo Residencial?",resposta:"Entrada de 20%, saldo em até 72 parcelas mensais e 6 reforços anuais (cada reforço = 5 mensais), correção pelo CUB/SC durante a obra. Entrega prevista março 2027. Sem banco."},
        {pergunta:"Qual a previsão de entrega do Tremezzo Residencial?",resposta:"Previsão de entrega março de 2027, no Centro de Criciúma/SC."},
        {pergunta:"O Tremezzo tem apartamento decorado para visitar?",resposta:"Sim. O apartamento decorado está disponível para visitação. Agende com Stiven pelo WhatsApp (48) 99164-2332."},
        {pergunta:"Quantos andares e qual a metragem do Tremezzo?",resposta:"18 andares, apartamentos de 3 dormitórios com 125 m² privativos, no Centro de Criciúma/SC."},
        {pergunta:"Posso usar FGTS ou financiamento bancário no Tremezzo?",resposta:"Sim. Além do financiamento direto Fontana, é possível financiamento bancário ou FGTS. Consulte Stiven pelo WhatsApp."},
      ]} accent="#7A3B2E" />

      <RelatedProperties atualSlug="tremezzo-residencial-centro-criciuma-sc" cidade="Criciúma" />
    </>
  )
}
