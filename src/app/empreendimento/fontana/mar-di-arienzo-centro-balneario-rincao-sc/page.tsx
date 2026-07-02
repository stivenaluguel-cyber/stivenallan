import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import GalleryWithLightbox, { LightboxPhoto } from './gallery-lightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

const WPP = "https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Mar%20di%20Arienzo%20Residencial."
const CATALOGO_PDF = "https://estilofontana.com.br/upload/empreendimento/catalogo/mar-di-arienzo-residencial-1775575547.pdf"

const t = {
bg: '#F8FAFA', ink: '#0F1C1E', teal: '#1E5C62', tealDark: '#123840', muted: '#4E6E72',
line: 'rgba(15,28,30,0.12)', dark: '#080F10', onDark: '#E4F2F4', onDarkMuted: 'rgba(228,242,244,0.66)',
display: "'Jost', system-ui, sans-serif", serif: "'Cormorant Garamond', Georgia, serif",
body: "'Hanken Grotesk', system-ui, sans-serif",
}
const IMG = {
hero: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-arienzo-residencial-69d2e834c59ea.jpg?fm=webp',
lazer: 'https://lh3.googleusercontent.com/d/1vNhfjwg8oG3EzCeXdRiK1uqfsBPSXaC6',
}
const GALERIA = [
{ src: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-arienzo-residencial-69d2e834c59ea.jpg?fm=webp', alt: 'Mar di Arienzo Residencial — fachada frontal', label: 'Fachada Frontal' },
{ src: 'https://lh3.googleusercontent.com/d/1Shs1tG3s1Zo9_kzboLZrA0ntvo9vw4CD', alt: 'Mar di Arienzo — fachada angular', label: 'Fachada Angular' },
{ src: 'https://lh3.googleusercontent.com/d/1d6GcKbUKqb94Vl1pGIwOntXb4-9SylaJ', alt: 'Terraço Mar di Arienzo Residencial', label: 'Terraço' },
{ src: 'https://lh3.googleusercontent.com/d/1vNhfjwg8oG3EzCeXdRiK1uqfsBPSXaC6', alt: 'Piscina adulto e infantil Mar di Arienzo', label: 'Piscina' },
{ src: 'https://lh3.googleusercontent.com/d/1puwz1fEXb418qtdNoc7xifJVp0llTugJ', alt: 'Salão de festas Mar di Arienzo', label: 'Salão de Festas' },
{ src: 'https://lh3.googleusercontent.com/d/1DzLF6CLEoZEFWuae3dEsIR8JgPPCBPdz', alt: 'Playground Mar di Arienzo Residencial', label: 'Playground' },
{ src: 'https://lh3.googleusercontent.com/d/1mCpJJMZxDHjyzQ-K01S6RxsT2X725qOc', alt: 'Hall de entrada Mar di Arienzo', label: 'Hall de Entrada' },
{ src: 'https://lh3.googleusercontent.com/d/1rfZFlw78tyThcByrz5bX0hnLtIhK8btT', alt: 'Sacada com vista mar Mar di Arienzo', label: 'Sacada com Vista Mar' },
{ src: 'https://lh3.googleusercontent.com/d/1zlFyNz7oggT232_aS5TwezC6Pf7KQ73R', alt: 'Suíte Mar di Arienzo Residencial', label: 'Suíte' },
]
const DIFERENCIAIS = [
'Sacada com guarda-corpo em vidro e churrasqueira com exaustão',
'Persianas automatizadas e fechadura digital',
'Manta acústica entre pavimentos',
'Porcelanato retificado e nicho nos banheiros',
'Tubulação para água quente e espera para coifa',
'Possibilidade de personalização de planta',
]
const AMENIDADES = [
'Piscina adulto e infantil','Terraço','Academia','Salão de Festas',
'Playground','Brinquedoteca','Hall com pé direito duplo',
'Acesso digital com reconhecimento facial','Câmeras 24h',
'Gerador para áreas comuns','Espera para carregador elétrico',
'Acesso para banhistas','Porte-Cochère','2 Elevadores',
]

export const metadata: Metadata = {
title: 'Mar di Arienzo Residencial | Balneário Rincão SC | Stiven Allan',
description: 'Mar di Arienzo Residencial (Construtora Fontana): apartamentos 3 dormitórios com suíte, 97 a 109 m² privativos no Centro de Balneário Rincão/SC. Atendimento exclusivo com Stiven Allan.',
alternates: { canonical: SITE_URL + '/empreendimento/fontana/mar-di-arienzo-centro-balneario-rincao-sc' },
openGraph: {
title: 'Mar di Arienzo Residencial — Centro, Balneário Rincão/SC',
description: 'Amplie seu horizonte. Apartamentos 3 dormitórios com suíte, 97 a 109 m² privativos no Centro de Balneário Rincão/SC. Atendimento exclusivo com Stiven Allan.',
url: SITE_URL + '/empreendimento/fontana/mar-di-arienzo-centro-balneario-rincao-sc',
type: 'website',
images: [{ url: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-arienzo-residencial-69d2e834c59ea.jpg?fm=webp', width: 1200, height: 800, alt: 'Fachada Mar di Arienzo Residencial' }],
},
twitter: {
card: 'summary_large_image',
title: 'Mar di Arienzo Residencial — Centro, Balneário Rincão/SC',
description: 'Amplie seu horizonte. Apartamentos 3 dormitórios com suíte, 97 a 109 m² privativos no Centro de Balneário Rincão/SC. Atendimento exclusivo com Stiven Allan.',
images: ['https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-arienzo-residencial-69d2e834c59ea.jpg?fm=webp'],
},
robots: { index: true, follow: true },
}
const SCHEMA = {
'@context': 'https://schema.org',
'@graph': [
{ '@type': 'Apartment', name: 'Mar di Arienzo Residencial', description: 'Apartamentos 3 dormitórios com suíte, 97 a 109 m² privativos no Centro de Balneário Rincão/SC.', image: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-arienzo-residencial-69d2e834c59ea.jpg?fm=webp', numberOfRooms: 3, numberOfBathroomsTotal: 1, floorSize: { '@type': 'QuantitativeValue', value: 109, unitCode: 'MTK' }, address: { '@type': 'PostalAddress', streetAddress: 'Rua Criciúma esq. Rua Araranguá', addressLocality: 'Balneário Rincão', addressRegion: 'SC', addressCountry: 'BR' } },
],
}

export default function MarDiArienzoPage() {
return (
<main style={{ background: t.bg, color: t.ink, fontFamily: t.body, overflowX: 'hidden' }}>

<style>{`
html { scroll-behavior: smooth; }
.ma-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: ${t.teal}; font-family: ${t.body}; font-weight: 500; }
.ma-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.04; text-shadow: 0 2px 24px rgba(0,0,0,0.55); }
.ma-onimg { text-shadow: 0 1px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5); }
.ma-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.16em; line-height: 1.1; font-size: clamp(26px,4vw,46px); margin: 0; }
.ma-serif { font-family: ${t.serif}; font-style: italic; font-weight: 400; }
.ma-rule { width: 56px; height: 1px; background: ${t.teal}; border: 0; }
.ma-cta { display: inline-block; font-family: ${t.body}; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: ${t.ink}; border: 1px solid ${t.teal}; padding: 16px 34px; text-decoration: none; transition: background .35s ease, color .35s ease; cursor: pointer; }
.ma-cta:hover { background: ${t.teal}; color: #fff; }
.ma-cta-light { color: ${t.onDark}; border-color: rgba(228,242,244,0.55); }
.ma-cta-light:hover { background: ${t.onDark}; color: ${t.tealDark}; }
.ma-navlink { font-family: ${t.body}; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.85); text-decoration: none; transition: color .3s ease; }
.ma-navlink:hover { color: #fff; }
.ma-fade { opacity: 0; transform: translateY(24px); animation: mafade .9s ease forwards; }
@keyframes mafade { to { opacity: 1; transform: none; } }
.ma-gcard { position: relative; overflow: hidden; }
.ma-gcard img { transition: transform .8s ease; }
.ma-gcard:hover img { transform: scale(1.06); }
.ma-gcard:focus { outline: 2px solid ${t.teal}; outline-offset: 2px; }
.ma-amen { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${t.line}; font-size: 15px; }
.ma-amen::before { content: ''; width: 6px; height: 6px; background: ${t.teal}; border-radius: 50%; flex: 0 0 auto; }
.ma-lazer-card { position: relative; overflow: hidden; }
.ma-lazer-card img { transition: transform .8s ease; }
.ma-lazer-card:hover img { transform: scale(1.06); }
.ma-lazer-card:focus { outline: 2px solid ${t.teal}; outline-offset: 2px; }
.ma-wa { position: fixed; right: 20px; bottom: 20px; z-index: 60; width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
.ma-burger { display: none; }
@media (max-width: 860px) { .ma-nav-links { display: none !important; } .ma-burger { display: flex !important; } }
details.ma-menu > summary { list-style: none; }
details.ma-menu > summary::-webkit-details-marker { display: none; }
`}</style>
<header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
<nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px clamp(18px,5vw,56px)' }}>
<a href="#top" style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.26em', fontSize: 16, color: '#fff', textDecoration: 'none', textTransform: 'uppercase' }}>Mar di Arienzo</a>
<div className="ma-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
<a href="#residencial" className="ma-navlink">O Residencial</a>
<a href="#galeria" className="ma-navlink">Galeria</a>
<a href="#diferenciais" className="ma-navlink">Diferenciais</a>
<a href="#localizacao" className="ma-navlink">Localização</a>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ma-cta ma-cta-light" style={{ padding: '12px 24px' }}>Atendimento Exclusivo</a>
</div>
<details className="ma-menu ma-burger" style={{ position: 'relative' }}>
<summary style={{ cursor: 'pointer', color: '#fff', fontSize: 22, lineHeight: 1, padding: 6 }} aria-label="Abrir menu">&#9776;</summary>
<div style={{ position: 'absolute', right: 0, top: '120%', background: t.tealDark, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 200, boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
<a href="#residencial" className="ma-navlink">O Residencial</a>
<a href="#galeria" className="ma-navlink">Galeria</a>
<a href="#diferenciais" className="ma-navlink">Diferenciais</a>
<a href="#localizacao" className="ma-navlink">Localização</a>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ma-navlink">Atendimento Exclusivo</a>
</div>
</details>
</nav>
</header>
<section id="top" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end' }}>
<Image src={IMG.hero} alt="Fachada Mar di Arienzo Residencial — Centro, Balneário Rincão/SC" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,15,16,0.42) 0%, rgba(8,15,16,0.12) 40%, rgba(8,15,16,0.78) 100%)' }} />
<div className="ma-fade" style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px) clamp(56px,9vh,110px)', maxWidth: 1100 }}>
<p className="ma-eyebrow ma-onimg" style={{ color: '#fff', marginBottom: 18 }}>Mar di Arienzo Residencial &mdash; Centro, Balneário Rincão/SC</p>
<h1 className="ma-h1" style={{ color: '#fff', fontSize: 'clamp(40px,8vw,104px)', margin: 0 }}>Mar di Arienzo</h1>
<p className="ma-serif ma-onimg" style={{ color: '#fff', fontSize: 'clamp(20px,3vw,32px)', marginTop: 14, marginBottom: 34 }}>Amplie seu horizonte.</p>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ma-cta ma-cta-light">Atendimento Exclusivo</a>
</div>
</section>
<section id="residencial" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)', textAlign: 'center' }}>
<div style={{ maxWidth: 820, margin: '0 auto' }}>
<p className="ma-eyebrow" style={{ marginBottom: 26 }}>O Residencial</p>
<p className="ma-serif" style={{ fontSize: 'clamp(24px,3.4vw,40px)', lineHeight: 1.35, color: t.ink, margin: 0 }}>Viva o mar sem pensar no tempo. Navegue o espaço da liberdade, sua história no centro de tudo. Encontre no horizonte a melhor moldura para o seu jeito de bem morar &mdash; com a excelência Fontana no Mar di Arienzo Residencial.</p>
<hr className="ma-rule" style={{ margin: '46px auto 0' }} />
</div>
</section>
<section id="galeria" style={{ padding: 'clamp(40px,8vh,80px) 0 0' }}>
<div style={{ textAlign: 'center', padding: '0 clamp(18px,5vw,56px) clamp(34px,6vh,60px)' }}>
<p className="ma-eyebrow" style={{ marginBottom: 16 }}>Galeria</p>
<h2 className="ma-h2">O horizonte é seu</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
<GalleryWithLightbox galeria={GALERIA} prefix="ma" gradient="rgba(8,15,16,0.55)" />
</div>
</section>
<section id="plantas" style={{ background: t.dark, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
<p className="ma-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>As Residências</p>
<h2 className="ma-h2" style={{ color: t.onDark }}>Espaço para viver com vista</h2>
<p className="ma-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 56 }}>Plantas amplas, no centro de tudo.</p>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'clamp(28px,5vw,64px)', marginBottom: 56 }}>
{[{n:'3',l:'Dormitórios'},{n:'1',l:'Suíte'},{n:'97 a 109',l:'m² privativos'},{n:'Vista',l:'Mar'}].map((it,i)=>(
<div key={i}><div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(34px,5vw,58px)', letterSpacing: '0.04em', lineHeight: 1 }}>{it.n}</div><div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDarkMuted, marginTop: 12 }}>{it.l}</div></div>
))}
</div>
<LeadCaptureButton slug="mar-di-arienzo-centro-balneario-rincao-sc" construtora_slug="fontana" className="ma-cta ma-cta-light"  propertyDisplayName="Mar di Arienzo Residencial" />
</div>
</section>
<section id="diferenciais" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1120, margin: '0 auto' }}>
<div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
<p className="ma-eyebrow" style={{ marginBottom: 16 }}>Diferenciais das Unidades</p>
<h2 className="ma-h2">Detalhes que elevam o morar</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, background: t.line }}>
{DIFERENCIAIS.map((d,i)=>(
<div key={i} style={{ background: t.bg, padding: 'clamp(28px,4vw,44px)' }}>
<div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 22, color: t.teal, marginBottom: 14 }}>{String(i+1).padStart(2,'0')}</div>
<p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: t.ink }}>{d}</p>
</div>
))}
</div>
</div>
</section>
<section style={{ background: t.bg, padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1180, margin: '0 auto' }}>
<div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
<p className="ma-eyebrow" style={{ marginBottom: 16 }}>Lazer &amp; Áreas Comuns</p>
<h2 className="ma-h2">O resort é a sua casa</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 'clamp(28px,5vw,64px)', alignItems: 'center' }}>
<LightboxPhoto src={IMG.lazer} alt="Piscina adulto e infantil Mar di Arienzo Residencial" label="Piscina &amp; Área de Lazer" cardClass="ma-lazer-card" imgSizes="(max-width: 768px) 100vw, 55vw" />
<ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
{AMENIDADES.map((a,i)=>(
<div key={i} className="ma-amen">{a}</div>
))}
</ul>
</div>
</div>
</section>
<section id="localizacao" style={{ padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)', background: t.dark, color: t.onDark }}>
<div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
<p className="ma-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Localização</p>
<h2 className="ma-h2" style={{ color: t.onDark }}>No coração de Balneário Rincão.</h2>
<p style={{ color: t.onDarkMuted, fontSize: 17, lineHeight: 1.6, marginTop: 24, marginBottom: 40 }}>Rua Criciúma esq. Rua Araranguá &mdash; Centro, Balneário Rincão/SC</p>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ma-cta ma-cta-light">Atendimento Exclusivo</a>
</div>
</section>
<section style={{ background: t.teal, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
<p className="ma-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Financiamento Direto</p>
<h2 className="ma-h2" style={{ color: t.onDark }}>A liberdade de comprar sem banco</h2>
<p className="ma-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 60 }}>Sem burocracia, sem intermediários. Direto com a construtora.</p>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 'clamp(28px,4vw,52px)' }}>
{[{n:'01',t:'Converse com o corretor',d:'Atendimento exclusivo e personalizado para entender o seu momento e as melhores condições.'},{n:'02',t:'Escolha a sua planta',d:'Selecione a unidade ideal e defina uma proposta sob medida, sem amarras bancárias.'},{n:'03',t:'Negocie direto',d:'Condições flexíveis diretamente com a Construtora Fontana, com a liberdade que você merece.'}].map((s,i)=>(
<div key={i} style={{ textAlign: 'left' }}><div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 40, opacity: 0.55, marginBottom: 14 }}>{s.n}</div><h3 style={{ fontFamily: t.display, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 17, margin: '0 0 12px' }}>{s.t}</h3><p style={{ color: t.onDarkMuted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.d}</p></div>
))}
</div>
<p style={{ marginTop: 56, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.onDark }}>Centro de Balneário Rincão &middot; Sob consulta</p>
</div>
</section>
<section style={{ position: 'relative', minHeight: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
<Image src={IMG.hero} alt="Mar di Arienzo Residencial — Balneário Rincão/SC" fill loading="lazy" sizes="100vw" style={{ objectFit: 'cover' }} />
<div style={{ position: 'absolute', inset: 0, background: 'rgba(8,15,16,0.62)' }} />
<div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px)', maxWidth: 880 }}>
<p className="ma-eyebrow ma-onimg" style={{ color: '#fff', marginBottom: 22 }}>Atendimento Exclusivo</p>
<h2 className="ma-h2 ma-onimg" style={{ color: '#fff', fontSize: 'clamp(30px,5vw,56px)' }}>Amplie seu horizonte.</h2>
<div style={{ marginTop: 38 }}><a href={WPP} target="_blank" rel="noopener noreferrer" className="ma-cta ma-cta-light">Atendimento Exclusivo</a></div>
</div>
</section>
<footer style={{ background: t.tealDark, color: t.onDarkMuted, padding: 'clamp(56px,9vh,96px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 'clamp(28px,5vw,56px)' }}>
<div><div style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.22em', fontSize: 18, color: t.onDark, textTransform: 'uppercase' }}>Stiven Allan</div><p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6 }}>Imóveis de alto padrão em Santa Catarina.<br />CRECI 60.275</p></div>
<div><div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Contato</div><a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: t.onDarkMuted, textDecoration: 'none', fontSize: 14 }}>WhatsApp &middot; (48) 99164-2332</a></div>
<div><div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Empreendimento</div><p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>Mar di Arienzo Residencial<br />Construtora Fontana<br />Centro, Balneário Rincão/SC</p></div>
</div>
<div style={{ maxWidth: 1180, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(228,242,244,0.12)', fontSize: 12 }}>&copy; {new Date().getFullYear()} Stiven Allan. Imagens meramente ilustrativas. Sob consulta.</div>
</footer>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ma-wa" aria-label="Falar no WhatsApp com Stiven Allan">
<svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.973-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
</a>

{/* SEO FAQ */}
<PropertyFAQ items={[{"pergunta":"Como funciona o financiamento direto do Mar di Arienzo Residencial?","resposta":"Entrada de 20%, saldo em até 72 parcelas mensais e 6 reforços anuais (cada reforço equivale a 5 parcelas mensais), com correção pelo CUB/SC durante a obra. Sem análise de banco."},{"pergunta":"Qual a previsão de entrega do Mar di Arienzo Residencial?","resposta":"A previsão de entrega é agosto de 2030, em Centro, Balneário Rincão/SC."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Sim. Além do financiamento direto com a construtora, é possível optar por financiamento bancário. Fale com o Stiven pelo WhatsApp para simular as duas opções."},{"pergunta":"Onde fica o Mar di Arienzo Residencial?","resposta":"O Mar di Arienzo Residencial está localizado na Rua Criciúma esq. Rua Araranguá, no Centro de Balneário Rincão/SC."},{"pergunta":"Quais as plantas e metragens disponíveis?","resposta":"O empreendimento oferece apartamentos com 3 dormitórios (1 suíte), de 97 a 109 m² privativos."}]} accent="#1E5C62" />
<RelatedProperties atualSlug="mar-di-arienzo-centro-balneario-rincao-sc" cidade="Balneário Rincão" />


</main>
)
}
