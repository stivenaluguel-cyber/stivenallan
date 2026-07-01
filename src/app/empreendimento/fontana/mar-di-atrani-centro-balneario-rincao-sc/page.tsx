import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import GalleryWithLightbox, { LightboxPhoto } from './gallery-lightbox'

const WPP = "https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Mar%20di%20Atrani%20Residencial."
const CATALOGO_PDF = "https://estilofontana.com.br/upload/empreendimento/catalogo/mar-di-atrani-residencial-1736353105.pdf"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'

const t = {
bg: '#F8FAFA', ink: '#0F1C22', azure: '#1B5E8B', azureDark: '#113C5A', muted: '#4E6A7A',
line: 'rgba(15,28,34,0.12)', dark: '#080E12', onDark: '#E4EEF6', onDarkMuted: 'rgba(228,238,246,0.66)',
display: "'Jost', system-ui, sans-serif", serif: "'Cormorant Garamond', Georgia, serif",
body: "'Hanken Grotesk', system-ui, sans-serif",
}
const IMG = {
hero: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-atrani-residencial-675c232fef052.jpg?fm=webp',
mapa: 'https://estilofontana.com.br/images/2024/12/16/mapa-mardiatrani-67603ff05bdb5.jpg?fm=webp',
lazer: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-atrani-residencial-675c232fef052.jpg?fm=webp',
}
const GALERIA = [
{ src: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-atrani-residencial-675c232fef052.jpg?fm=webp', alt: 'Mar di Atrani Residencial — fachada frontal', label: 'Fachada Frontal' },
{ src: 'https://lh3.googleusercontent.com/d/1PXeNqh6dhGqr5ZbJKqaqksqmhpA_vfK6', alt: 'Mar di Atrani — fachada angular', label: 'Fachada Angular' },
{ src: 'https://lh3.googleusercontent.com/d/1fe9t2T0geSe3EUTdZn8yUVKIxXk6bbKk', alt: 'Salão de festas com deck Mar di Atrani', label: 'Salão de Festas com Deck' },
{ src: 'https://lh3.googleusercontent.com/d/1lKvi0RUjyT24pU2-PRjzOimweaQBdB3E', alt: 'Living integrado Mar di Atrani Residencial', label: 'Living Integrado' },
{ src: 'https://lh3.googleusercontent.com/d/1e73f1jF9WdoHRt-A-hknvYe_Am49-gio', alt: 'Suíte Mar di Atrani Residencial', label: 'Suíte' },
{ src: 'https://lh3.googleusercontent.com/d/1J28_ggDt6bN26U9RL4SpZgHv6Qx5nOPv', alt: 'Hall de entrada Mar di Atrani', label: 'Hall de Entrada' },
{ src: 'https://lh3.googleusercontent.com/d/1hFfRv1OPUESeryN9NODUfiLWLODRDFX8', alt: 'Acesso principal Mar di Atrani Residencial', label: 'Acesso Principal' },
]
const DIFERENCIAIS = [
'Sacada com guarda-corpo em vidro e churrasqueira com exaustão',
'Persianas automatizadas e fechadura digital',
'Manta acústica entre pavimentos',
'Hall de Entrada com pé-direito duplo',
'Porcelanato retificado e nicho nos banheiros',
'Tubulação para água quente e rebaixo em gesso',
]
const AMENIDADES = [
'Salão de Festas com Deck Externo',
'Hall de Entrada com pé-direito duplo',
'Living Integrado',
'Acesso Principal',
]

export const metadata: Metadata = {
title: 'Mar di Atrani Residencial | Balneário Rincão SC | Stiven Allan',
description: 'Mar di Atrani Residencial (Construtora Fontana): apartamentos 3 dormitórios com suíte, 100 a 101 m² privativos, a 250 metros da beira-mar no Centro de Balneário Rincão/SC. Atendimento exclusivo com Stiven Allan.',
alternates: { canonical: SITE_URL + '/empreendimento/fontana/mar-di-atrani-centro-balneario-rincao-sc' },
openGraph: {
title: 'Mar di Atrani Residencial — Centro, Balneário Rincão/SC',
description: 'A vida no agora. Apartamentos 3 dormitórios com suíte, 100 a 101 m² privativos, a 250 metros da beira-mar em Balneário Rincão/SC. Atendimento exclusivo com Stiven Allan.',
url: SITE_URL + '/empreendimento/fontana/mar-di-atrani-centro-balneario-rincao-sc',
type: 'website',
images: [{ url: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-atrani-residencial-675c232fef052.jpg?fm=webp', width: 1200, height: 800, alt: 'Fachada Mar di Atrani Residencial' }],
},
twitter: {
card: 'summary_large_image',
title: 'Mar di Atrani Residencial — Centro, Balneário Rincão/SC',
description: 'A vida no agora. Apartamentos 3 dormitórios com suíte, 100 a 101 m² privativos, a 250 metros da beira-mar em Balneário Rincão/SC. Atendimento exclusivo com Stiven Allan.',
images: ['https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-atrani-residencial-675c232fef052.jpg?fm=webp'],
},
robots: { index: true, follow: true },
}
const SCHEMA = {
'@context': 'https://schema.org',
'@graph': [
{ '@type': 'Apartment', name: 'Mar di Atrani Residencial', description: 'Apartamentos 3 dormitórios com suíte, 100 a 101 m² privativos, a 250 metros da beira-mar no Centro de Balneário Rincão/SC.', image: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-atrani-residencial-675c232fef052.jpg?fm=webp', numberOfRooms: 3, numberOfBathroomsTotal: 1, floorSize: { '@type': 'QuantitativeValue', value: 101, unitCode: 'MTK' }, address: { '@type': 'PostalAddress', streetAddress: 'Rua Rio de Janeiro, 230, esq. Rua Urussanga', addressLocality: 'Balneário Rincão', addressRegion: 'SC', addressCountry: 'BR' } },
],
}

export default function MarDiAtraniPage() {
return (
<main style={{ background: t.bg, color: t.ink, fontFamily: t.body, overflowX: 'hidden' }}>
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
<style>{`
html { scroll-behavior: smooth; }
.mt-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: ${t.azure}; font-family: ${t.body}; font-weight: 500; }
.mt-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.04; text-shadow: 0 2px 24px rgba(0,0,0,0.55); }
.mt-onimg { text-shadow: 0 1px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5); }
.mt-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.16em; line-height: 1.1; font-size: clamp(26px,4vw,46px); margin: 0; }
.mt-serif { font-family: ${t.serif}; font-style: italic; font-weight: 400; }
.mt-rule { width: 56px; height: 1px; background: ${t.azure}; border: 0; }
.mt-cta { display: inline-block; font-family: ${t.body}; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: ${t.ink}; border: 1px solid ${t.azure}; padding: 16px 34px; text-decoration: none; transition: background .35s ease, color .35s ease; cursor: pointer; }
.mt-cta:hover { background: ${t.azure}; color: #fff; }
.mt-cta-light { color: ${t.onDark}; border-color: rgba(228,238,246,0.55); }
.mt-cta-light:hover { background: ${t.onDark}; color: ${t.azureDark}; }
.mt-navlink { font-family: ${t.body}; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.85); text-decoration: none; transition: color .3s ease; }
.mt-navlink:hover { color: #fff; }
.mt-fade { opacity: 0; transform: translateY(24px); animation: mtfade .9s ease forwards; }
@keyframes mtfade { to { opacity: 1; transform: none; } }
.mt-gcard { position: relative; overflow: hidden; }
.mt-gcard img { transition: transform .8s ease; }
.mt-gcard:hover img { transform: scale(1.06); }
.mt-gcard:focus { outline: 2px solid ${t.azure}; outline-offset: 2px; }
.mt-amen { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${t.line}; font-size: 15px; }
.mt-amen::before { content: ''; width: 6px; height: 6px; background: ${t.azure}; border-radius: 50%; flex: 0 0 auto; }
.mt-lazer-card { position: relative; overflow: hidden; }
.mt-lazer-card img { transition: transform .8s ease; }
.mt-lazer-card:hover img { transform: scale(1.06); }
.mt-lazer-card:focus { outline: 2px solid ${t.azure}; outline-offset: 2px; }
.mt-wa { position: fixed; right: 20px; bottom: 20px; z-index: 60; width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
.mt-burger { display: none; }
@media (max-width: 860px) { .mt-nav-links { display: none !important; } .mt-burger { display: flex !important; } }
details.mt-menu > summary { list-style: none; }
details.mt-menu > summary::-webkit-details-marker { display: none; }
`}</style>
<header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
<nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px clamp(18px,5vw,56px)' }}>
<a href="#top" style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.26em', fontSize: 16, color: '#fff', textDecoration: 'none', textTransform: 'uppercase' }}>Mar di Atrani</a>
<div className="mt-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
<a href="#residencial" className="mt-navlink">O Residencial</a>
<a href="#galeria" className="mt-navlink">Galeria</a>
<a href="#diferenciais" className="mt-navlink">Diferenciais</a>
<a href="#localizacao" className="mt-navlink">Localização</a>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="mt-cta mt-cta-light" style={{ padding: '12px 24px' }}>Atendimento Exclusivo</a>
</div>
<details className="mt-menu mt-burger" style={{ position: 'relative' }}>
<summary style={{ cursor: 'pointer', color: '#fff', fontSize: 22, lineHeight: 1, padding: 6 }} aria-label="Abrir menu">&#9776;</summary>
<div style={{ position: 'absolute', right: 0, top: '120%', background: t.azureDark, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 200, boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
<a href="#residencial" className="mt-navlink">O Residencial</a>
<a href="#galeria" className="mt-navlink">Galeria</a>
<a href="#diferenciais" className="mt-navlink">Diferenciais</a>
<a href="#localizacao" className="mt-navlink">Localização</a>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="mt-navlink">Atendimento Exclusivo</a>
</div>
</details>
</nav>
</header>
<section id="top" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end' }}>
<Image src={IMG.hero} alt="Fachada Mar di Atrani Residencial — Centro, Balneário Rincão/SC" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,14,18,0.42) 0%, rgba(8,14,18,0.12) 40%, rgba(8,14,18,0.78) 100%)' }} />
<div className="mt-fade" style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px) clamp(56px,9vh,110px)', maxWidth: 1100 }}>
<p className="mt-eyebrow mt-onimg" style={{ color: '#fff', marginBottom: 18 }}>Mar di Atrani Residencial &mdash; Centro, Balneário Rincão/SC</p>
<h1 className="mt-h1" style={{ color: '#fff', fontSize: 'clamp(40px,8vw,104px)', margin: 0 }}>Mar di Atrani</h1>
<p className="mt-serif mt-onimg" style={{ color: '#fff', fontSize: 'clamp(20px,3vw,32px)', marginTop: 14, marginBottom: 34 }}>A vida no agora.</p>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="mt-cta mt-cta-light">Atendimento Exclusivo</a>
</div>
</section>
<section id="residencial" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)', textAlign: 'center' }}>
<div style={{ maxWidth: 820, margin: '0 auto' }}>
<p className="mt-eyebrow" style={{ marginBottom: 26 }}>O Residencial</p>
<p className="mt-serif" style={{ fontSize: 'clamp(24px,3.4vw,40px)', lineHeight: 1.35, color: t.ink, margin: 0 }}>No Mar di Atrani, todo segundo é feito de memórias: vividas, compartilhadas, inesquecíveis. No verão e sempre que quiser, aproveite a praia em família. Sinta a brisa da varanda. O ano inteiro, todo o ano &mdash; relaxe, toque os pés na areia e colecione grandes momentos.</p>
<hr className="mt-rule" style={{ margin: '46px auto 0' }} />
</div>
</section>
<section id="galeria" style={{ padding: 'clamp(40px,8vh,80px) 0 0' }}>
<div style={{ textAlign: 'center', padding: '0 clamp(18px,5vw,56px) clamp(34px,6vh,60px)' }}>
<p className="mt-eyebrow" style={{ marginBottom: 16 }}>Galeria</p>
<h2 className="mt-h2">A vida que te espera</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
<GalleryWithLightbox galeria={GALERIA} prefix="mt" gradient="rgba(8,14,18,0.55)" />
</div>
</section>
<section id="plantas" style={{ background: t.dark, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
<p className="mt-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>As Residências</p>
<h2 className="mt-h2" style={{ color: t.onDark }}>Espaço para viver com liberdade</h2>
<p className="mt-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 56 }}>250 metros da beira-mar, no centro de tudo.</p>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'clamp(28px,5vw,64px)', marginBottom: 56 }}>
{[{n:'3',l:'Dormitórios'},{n:'1',l:'Suíte'},{n:'100 a 101',l:'m² privativos'},{n:'250m',l:'da beira-mar'}].map((it,i)=>(
<div key={i}><div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(34px,5vw,58px)', letterSpacing: '0.04em', lineHeight: 1 }}>{it.n}</div><div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDarkMuted, marginTop: 12 }}>{it.l}</div></div>
))}
</div>
<a href={CATALOGO_PDF} target="_blank" rel="noopener noreferrer" className="mt-cta mt-cta-light">Baixar Catálogo &amp; Plantas</a>
</div>
</section>
<section id="diferenciais" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1120, margin: '0 auto' }}>
<div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
<p className="mt-eyebrow" style={{ marginBottom: 16 }}>Diferenciais das Unidades</p>
<h2 className="mt-h2">Detalhes que elevam o morar</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, background: t.line }}>
{DIFERENCIAIS.map((d,i)=>(
<div key={i} style={{ background: t.bg, padding: 'clamp(28px,4vw,44px)' }}>
<div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 22, color: t.azure, marginBottom: 14 }}>{String(i+1).padStart(2,'0')}</div>
<p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: t.ink }}>{d}</p>
</div>
))}
</div>
</div>
</section>
<section style={{ background: t.bg, padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1180, margin: '0 auto' }}>
<div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
<p className="mt-eyebrow" style={{ marginBottom: 16 }}>Lazer &amp; Áreas Comuns</p>
<h2 className="mt-h2">Cada detalhe pensado para você</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 'clamp(28px,5vw,64px)', alignItems: 'center' }}>
<LightboxPhoto src={IMG.lazer} alt="Fachada Mar di Atrani Residencial — Balneário Rincão" label="Mar di Atrani Residencial" cardClass="mt-lazer-card" imgSizes="(max-width: 768px) 100vw, 55vw" />
<ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
{AMENIDADES.map((a,i)=>(
<div key={i} className="mt-amen">{a}</div>
))}
</ul>
</div>
</div>
</section>
<section id="localizacao" style={{ padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)', background: t.dark, color: t.onDark }}>
<div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 'clamp(34px,5vw,64px)', alignItems: 'center' }}>
<div>
<p className="mt-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Localização</p>
<h2 className="mt-h2" style={{ color: t.onDark }}>No coração de Balneário Rincão.</h2>
<p style={{ color: t.onDarkMuted, fontSize: 17, lineHeight: 1.6, marginTop: 24 }}>Rua Rio de Janeiro, 230, esq. Rua Urussanga &mdash; Centro, Balneário Rincão/SC</p>
<p style={{ color: t.onDarkMuted, fontSize: 15, lineHeight: 1.5, marginTop: 12 }}>A apenas 250 metros da beira-mar.</p>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="mt-cta mt-cta-light" style={{ marginTop: 30 }}>Atendimento Exclusivo</a>
</div>
<div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 2 }}>
<Image src={IMG.mapa} alt="Mapa da localização Mar di Atrani Residencial em Balneário Rincão" fill loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
</div>
</div>
</section>
<section style={{ background: t.azure, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
<p className="mt-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Financiamento Direto</p>
<h2 className="mt-h2" style={{ color: t.onDark }}>A liberdade de comprar sem banco</h2>
<p className="mt-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 60 }}>Sem burocracia, sem intermediários. Direto com a construtora.</p>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 'clamp(28px,4vw,52px)' }}>
{[{n:'01',t:'Converse com o corretor',d:'Atendimento exclusivo e personalizado para entender o seu momento e as melhores condições.'},{n:'02',t:'Escolha a sua planta',d:'Selecione a unidade ideal e defina uma proposta sob medida, sem amarras bancárias.'},{n:'03',t:'Negocie direto',d:'Condições flexíveis diretamente com a Construtora Fontana, com a liberdade que você merece.'}].map((s,i)=>(
<div key={i} style={{ textAlign: 'left' }}><div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 40, opacity: 0.55, marginBottom: 14 }}>{s.n}</div><h3 style={{ fontFamily: t.display, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 17, margin: '0 0 12px' }}>{s.t}</h3><p style={{ color: t.onDarkMuted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.d}</p></div>
))}
</div>
<p style={{ marginTop: 56, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.onDark }}>Centro de Balneário Rincão &middot; Sob consulta</p>
</div>
</section>
<section style={{ position: 'relative', minHeight: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
<Image src={IMG.hero} alt="Mar di Atrani Residencial — Balneário Rincão/SC" fill loading="lazy" sizes="100vw" style={{ objectFit: 'cover' }} />
<div style={{ position: 'absolute', inset: 0, background: 'rgba(8,14,18,0.62)' }} />
<div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px)', maxWidth: 880 }}>
<p className="mt-eyebrow mt-onimg" style={{ color: '#fff', marginBottom: 22 }}>Atendimento Exclusivo</p>
<h2 className="mt-h2 mt-onimg" style={{ color: '#fff', fontSize: 'clamp(30px,5vw,56px)' }}>A vida no agora.</h2>
<div style={{ marginTop: 38 }}><a href={WPP} target="_blank" rel="noopener noreferrer" className="mt-cta mt-cta-light">Atendimento Exclusivo</a></div>
</div>
</section>
<footer style={{ background: t.azureDark, color: t.onDarkMuted, padding: 'clamp(56px,9vh,96px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 'clamp(28px,5vw,56px)' }}>
<div><div style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.22em', fontSize: 18, color: t.onDark, textTransform: 'uppercase' }}>Stiven Allan</div><p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6 }}>Imóveis de alto padrão em Santa Catarina.<br />CRECI 60.275</p></div>
<div><div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Contato</div><a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: t.onDarkMuted, textDecoration: 'none', fontSize: 14 }}>WhatsApp &middot; (48) 99164-2332</a></div>
<div><div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Empreendimento</div><p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>Mar di Atrani Residencial<br />Construtora Fontana<br />Centro, Balneário Rincão/SC</p></div>
</div>
<div style={{ maxWidth: 1180, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(228,238,246,0.12)', fontSize: 12 }}>&copy; {new Date().getFullYear()} Stiven Allan. Imagens meramente ilustrativas. Sob consulta.</div>
</footer>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="mt-wa" aria-label="Falar no WhatsApp com Stiven Allan">
<svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.973-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
</a>
</main>
)
}
