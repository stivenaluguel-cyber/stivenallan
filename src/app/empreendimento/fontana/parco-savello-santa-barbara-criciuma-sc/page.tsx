import type { Metadata } from 'next'
import Image from 'next/image'
import GalleryWithLightbox, { LightboxPhoto } from './gallery-lightbox'
import Link from 'next/link'

// Hotsite premium Parco Savello Residencial (Fontana, Santa Bárbara Criciúma/SC). Padrão EPIC.
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Parco%20Savello%20Residencial.'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'

const t = {
bg: '#FAFAF8',
ink: '#1A2B1B',
green: '#3D5A3E',
greenDark: '#243526',
muted: '#566357',
line: 'rgba(26,43,27,0.12)',
dark: '#0E1A0F',
onDark: '#EAF2EA',
onDarkMuted: 'rgba(234,242,234,0.66)',
display: "\'Bricolage Grotesque\', system-ui, sans-serif",
serif: "\'Cormorant Garamond\', Georgia, serif",
body: "\'Hanken Grotesk\', system-ui, sans-serif",
}

const IMG = {
hero: 'https://estilofontana.com.br/images/empreendimento/slideshows/parco-savello-residencial-6644aab323ce3.jpg?fm=webp',
fachada: 'https://estilofontana.com.br/images/2024/05/20/f-ps-fotomontagem-ef-aprovada-664bad69c0a0e.jpg?fm=webp',
aerea: 'https://estilofontana.com.br/images/2024/05/20/f-ps-voo-passaro-ef-op3-web-aprovada-664babbb72fb9.jpg?fm=webp',
}

const GALERIA: { src: string; alt: string; label: string }[] = [
{ src: 'https://estilofontana.com.br/images/empreendimento/slideshows/parco-savello-residencial-6644aab323ce3.jpg?fm=webp', alt: 'Parco Savello Residencial - perspectiva', label: 'O Residencial' },
{ src: 'https://estilofontana.com.br/images/2024/05/20/f-ps-fotomontagem-ef-aprovada-664bad69c0a0e.jpg?fm=webp', alt: 'Parco Savello Residencial - fachada', label: 'Fachada' },
{ src: 'https://estilofontana.com.br/images/2024/05/20/f-ps-voo-passaro-ef-op3-web-aprovada-664babbb72fb9.jpg?fm=webp', alt: 'Parco Savello Residencial - vista aérea', label: 'Vista Aérea' },
{ src: 'https://blog.estilofontana.com.br/wp-content/uploads/2024/06/lan%C3%A7amento-em-crici%C3%BAma-parco-savello-1.jpg', alt: 'Parco Savello Residencial - acesso principal', label: 'Acesso Principal' },
{ src: 'https://www.estilofontana.com.br/blog/wp-content/uploads/2024/06/lan%C3%A7amento-em-Crici%C3%BAma-parco-savello-4.jpg', alt: 'Parco Savello Residencial - torre', label: 'Torre' },
{ src: 'https://www.estilofontana.com.br/blog/wp-content/uploads/2024/06/lan%C3%A7amento-em-Crici%C3%BAma-parco-savello-3.jpg', alt: 'Parco Savello Residencial - entorno', label: 'Entorno' },
{ src: 'https://www.estilofontana.com.br/blog/wp-content/uploads/2024/06/lan%C3%A7amento-em-Crici%C3%BAma-parco-savello-6.jpg', alt: 'Parco Savello Residencial - lazer', label: 'Lazer' },
{ src: 'https://www.estilofontana.com.br/blog/wp-content/uploads/2024/06/lan%C3%A7amento-em-Crici%C3%BAma-parco-savello-5-1.jpg', alt: 'Parco Savello Residencial - paisagismo', label: 'Paisagismo' },
]

const DIFERENCIAIS: string[] = [
'Hall com pé-direito duplo',
'Sacada com guarda-corpo em vidro',
'Fechadura digital',
'Persiana nos dormitórios',
'Tubulação para água quente',
'Rebaixo em gesso',
'Espera para split',
'Espera para coifa',
'Espera para carregador elétrico',
'Manta acústica entre pavimentos',
'Possibilidade de personalização de planta',
]

const AMENIDADES: string[] = [
'Piscina adulto e infantil',
'Espaço gourmet externo',
'Espaço fitness com terraço',
'Salão de festas',
'Brinquedoteca',
'Playground',
'Pet place',
'Bicicletário',
'Churrasqueira a carvão',
'2 elevadores',
'Gerador para áreas comuns',
'Sistema de câmeras 24h',
]

export const revalidate = 3600

export const metadata: Metadata = {
title: 'Parco Savello Residencial | Santa Bárbara Criciúma | Stiven Allan',
description: 'Parco Savello Residencial (Construtora Fontana): 3 dormitórios (2 suítes), 93 a 94 m², no bairro Santa Bárbara, Criciúma/SC. Financiamento direto com a construtora. Atendimento exclusivo com Stiven Allan.',
keywords: ['Parco Savello Residencial', 'apartamento Santa Bárbara Criciúma', 'lançamento Fontana', 'Stiven Allan corretor SC'],
alternates: { canonical: `${SITE_URL}/empreendimento/fontana/parco-savello-santa-barbara-criciuma-sc` },
openGraph: {
title: 'Parco Savello Residencial — Vivi la Vita',
description: 'Parco Savello Residencial (Construtora Fontana): 3 dormitórios (2 suítes), 93 a 94 m², Santa Bárbara Criciúma/SC. Financiamento direto Fontana.',
url: `${SITE_URL}/empreendimento/fontana/parco-savello-santa-barbara-criciuma-sc`,
images: [{ url: IMG.aerea, width: 1200, height: 630, alt: 'Parco Savello Residencial — vista aérea' }],
type: 'website',
locale: 'pt_BR',
},
twitter: {
card: 'summary_large_image',
title: 'Parco Savello Residencial — Vivi la Vita',
description: 'Parco Savello Residencial (Construtora Fontana): 3 dormitórios (2 suítes), 93 a 94 m², Santa Bárbara Criciúma/SC.',
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
url: SITE_URL,
telephone: '+5548991642332',
areaServed: { '@type': 'City', name: 'Criciúma', containedInPlace: { '@type': 'State', name: 'Santa Catarina' } },
},
{
'@type': 'Apartment',
name: 'Parco Savello Residencial',
description: 'Apartamentos no bairro Santa Bárbara, Criciúma/SC: 3 dormitórios (2 suítes), 93 a 94 m² privativos, 2 vagas, com financiamento direto com a Construtora Fontana.',
image: IMG.hero,
numberOfRooms: 3,
numberOfBathroomsTotal: 2,
floorSize: { '@type': 'QuantitativeValue', minValue: 93, maxValue: 94, unitCode: 'MTK' },
address: { '@type': 'PostalAddress', streetAddress: 'Rua Duarte da Costa, 875', addressLocality: 'Criciúma', addressRegion: 'SC', addressCountry: 'BR' },
},
{
'@type': 'BreadcrumbList',
itemListElement: [
{ '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
{ '@type': 'ListItem', position: 2, name: 'Lançamentos Criciúma', item: `${SITE_URL}/lancamentos/criciuma-sc` },
{ '@type': 'ListItem', position: 3, name: 'Parco Savello Residencial', item: `${SITE_URL}/empreendimento/fontana/parco-savello-santa-barbara-criciuma-sc` },
],
},
],
}

export default function ParcoSavelloPage() {
return (
<main style={{ background: t.bg, color: t.ink, fontFamily: t.body, overflowX: 'hidden' }}>
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

<style>{`
html { scroll-behavior: smooth; }
.ps-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: ${t.green}; font-family: ${t.body}; font-weight: 500; }
.ps-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.04; text-shadow: 0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4); font-size: clamp(40px,8vw,104px); margin: 0; }
.ps-onimg { text-shadow: 0 1px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5); }
.ps-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.16em; line-height: 1.1; font-size: clamp(26px,4vw,46px); margin: 0; }
.ps-serif { font-family: ${t.serif}; font-style: italic; font-weight: 400; }
.ps-rule { width: 56px; height: 1px; background: ${t.green}; border: 0; }
.ps-cta { display: inline-block; font-family: ${t.body}; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: ${t.ink}; border: 1px solid ${t.green}; padding: 16px 34px; text-decoration: none; transition: background .35s ease, color .35s ease; cursor: pointer; }
.ps-cta:hover { background: ${t.green}; color: #fff; }
.ps-cta-light { color: ${t.onDark}; border-color: rgba(234,242,234,0.55); }
.ps-cta-light:hover { background: ${t.onDark}; color: ${t.greenDark}; }
.ps-navlink { font-family: ${t.body}; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.85); text-decoration: none; transition: color .3s ease; }
.ps-navlink:hover { color: #fff; }
.ps-fade { opacity: 0; transform: translateY(24px); animation: psfade .9s ease forwards; }
@keyframes psfade { to { opacity: 1; transform: none; } }
.ps-gcard { position: relative; overflow: hidden; cursor: zoom-in; }
.ps-gcard img { transition: transform .8s ease; }
.ps-gcard:hover img { transform: scale(1.06); }
.ps-gcard:focus { outline: 2px solid ${t.green}; outline-offset: 2px; }
.ps-amen { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${t.line}; font-size: 15px; }
.ps-amen::before { content: ''; width: 6px; height: 6px; background: ${t.green}; border-radius: 50%; flex: 0 0 auto; }
.ps-lazer-card { position: relative; overflow: hidden; cursor: zoom-in; }
.ps-lazer-card img { transition: transform .8s ease; }
.ps-lazer-card:hover img { transform: scale(1.06); }
.ps-lazer-card:focus { outline: 2px solid ${t.green}; outline-offset: 2px; }
.ps-wa { position: fixed; right: 20px; bottom: 20px; z-index: 60; width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.25); text-decoration: none; }
.ps-burger { display: none; }
@media (max-width: 860px) {
.ps-nav-links { display: none !important; }
.ps-burger { display: flex !important; }
}
details.ps-menu > summary { list-style: none; }
details.ps-menu > summary::-webkit-details-marker { display: none; }
`}</style>

{/* NAV */}
<header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
<nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px clamp(18px,5vw,56px)' }}>
<a href="#top" style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.26em', fontSize: 16, color: '#fff', textDecoration: 'none', textTransform: 'uppercase' }}>Parco Savello</a>
<div className="ps-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
<a href="#residencial" className="ps-navlink">O Residencial</a>
<a href="#galeria" className="ps-navlink">Galeria</a>
<a href="#residencias" className="ps-navlink">As Residências</a>
<a href="#diferenciais" className="ps-navlink">Diferenciais</a>
<a href="#localizacao" className="ps-navlink">Localização</a>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ps-cta ps-cta-light" data-wpp="1" style={{ padding: '12px 24px' }}>Atendimento Exclusivo</a>
</div>
<details className="ps-menu ps-burger" style={{ position: 'relative' }}>
<summary style={{ cursor: 'pointer', color: '#fff', fontSize: 22, lineHeight: 1, padding: 6 }} aria-label="Abrir menu">&#9776;</summary>
<div style={{ position: 'absolute', right: 0, top: '120%', background: t.greenDark, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 200, boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
<a href="#residencial" className="ps-navlink">O Residencial</a>
<a href="#galeria" className="ps-navlink">Galeria</a>
<a href="#residencias" className="ps-navlink">As Residências</a>
<a href="#diferenciais" className="ps-navlink">Diferenciais</a>
<a href="#localizacao" className="ps-navlink">Localização</a>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ps-navlink" data-wpp="1">Atendimento Exclusivo</a>
</div>
</details>
</nav>
</header>

{/* 1 HERO */}
<section id="top" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end' }}>
<Image src={IMG.hero} alt="Parco Savello Residencial — perspectiva do empreendimento no bairro Santa Bárbara, Criciúma/SC" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(14,26,15,0.42) 0%, rgba(14,26,15,0.12) 40%, rgba(14,26,15,0.82) 100%)' }} />
<div className="ps-fade" style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px) clamp(56px,9vh,110px)', maxWidth: 1100 }}>
<p className="ps-eyebrow ps-onimg" style={{ color: '#fff', marginBottom: 18 }}>Parco Savello Residencial &mdash; Santa Bárbara, Criciúma/SC</p>
<h1 className="ps-h1" style={{ color: '#fff' }}>Parco Savello Residencial</h1>
<p className="ps-serif ps-onimg" style={{ color: t.onDark, fontSize: 'clamp(20px,3vw,32px)', marginTop: 14, marginBottom: 34 }}>Vivi la Vita.</p>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ps-cta ps-cta-light" data-wpp="1">Atendimento Exclusivo</a>
</div>
</section>

{/* 2 CONCEITO */}
<section id="residencial" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)', textAlign: 'center' }}>
<div style={{ maxWidth: 820, margin: '0 auto' }}>
<p className="ps-eyebrow" style={{ marginBottom: 26 }}>O Residencial</p>
<h2 className="ps-h2">Onde a vida<br />floresce</h2>
<hr className="ps-rule" style={{ margin: '34px auto' }} />
<p className="ps-serif" style={{ fontSize: 'clamp(22px,3.2vw,38px)', lineHeight: 1.38, color: t.ink, margin: 0 }}>
O Parco Savello Residencial nasce para quem valoriza a calmaria sem abrir mão da vida urbana.
</p>
<p style={{ fontSize: 18, lineHeight: 1.8, color: t.muted, marginTop: 28, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
No coração do bairro Santa Bárbara, com o Parque da Prefeitura como extensão do seu quintal, cada dia é uma nova experiência de bem-estar. Um lugar onde o tempo desacelera e a vida floresce.
</p>
<p className="ps-serif" style={{ fontSize: 'clamp(18px,2.2vw,26px)', color: t.green, marginTop: 30 }}>Todo segundo existe para ser vivido, para ser sentido por completo.</p>
</div>
</section>

{/* 3 GALERIA */}
<section id="galeria" style={{ padding: 'clamp(40px,8vh,80px) 0 0' }}>
<div style={{ textAlign: 'center', padding: '0 clamp(18px,5vw,56px) clamp(34px,6vh,60px)' }}>
<p className="ps-eyebrow" style={{ marginBottom: 16 }}>Galeria</p>
<h2 className="ps-h2">Natureza<br />e elegância</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
<GalleryWithLightbox galeria={GALERIA} prefix="ps" gradient="rgba(14,26,15,0.55)" />
</div>
</section>

{/* 4 AS RESIDÊNCIAS */}
<section id="residencias" style={{ background: t.dark, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
<p className="ps-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>As Residências</p>
<h2 className="ps-h2" style={{ color: t.onDark }}>Espaço para viver com inteireza</h2>
<p className="ps-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 56 }}>3 dormitórios, 2 suítes, 2 vagas.</p>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'clamp(28px,5vw,64px)', marginBottom: 56 }}>
{[
{ n: '3', l: 'Dormitórios (2 suítes)' },
{ n: '93–94', l: 'm² privativos' },
{ n: '2', l: 'Vagas de garagem' },
].map((it, i) => (
<div key={i}>
<div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(34px,5vw,58px)', letterSpacing: '0.04em', lineHeight: 1 }}>{it.n}</div>
<div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDarkMuted, marginTop: 12 }}>{it.l}</div>
</div>
))}
</div>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ps-cta ps-cta-light" data-wpp="1">Solicitar Catálogo</a>
</div>
</section>

{/* 5 DIFERENCIAIS DAS UNIDADES */}
<section id="diferenciais" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1120, margin: '0 auto' }}>
<div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
<p className="ps-eyebrow" style={{ marginBottom: 16 }}>Diferenciais das Unidades</p>
<h2 className="ps-h2">Cada detalhe<br />pensado para você</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, background: t.line }}>
{DIFERENCIAIS.map((d, i) => (
<div key={i} style={{ background: t.bg, padding: 'clamp(28px,4vw,44px)' }}>
<div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 22, color: t.green, marginBottom: 14 }}>{String(i + 1).padStart(2, '0')}</div>
<p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: t.ink }}>{d}</p>
</div>
))}
</div>
</div>
</section>

{/* 6 LAZER & ÁREAS COMUNS */}
<section style={{ background: t.bg, padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1180, margin: '0 auto' }}>
<div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
<p className="ps-eyebrow" style={{ marginBottom: 16 }}>Lazer &amp; Áreas Comuns</p>
<h2 className="ps-h2">Bem-estar<br />ao ar livre</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 'clamp(28px,5vw,64px)', alignItems: 'center' }}>
<LightboxPhoto src={IMG.fachada} alt="Fachada do Parco Savello Residencial em Santa Bárbara, Criciúma/SC" label="Fachada" cardClass="ps-lazer-card" imgSizes="(max-width: 768px) 100vw, 55vw" />
<ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
{AMENIDADES.map((a, i) => (
<div key={i} className="ps-amen">{a}</div>
))}
</ul>
</div>
</div>
</section>

{/* 7 LOCALIZAÇÃO */}
<section id="localizacao" style={{ padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)', background: t.dark, color: t.onDark }}>
<div style={{ maxWidth: 1180, margin: '0 auto' }}>
<div style={{ maxWidth: 640 }}>
<p className="ps-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Localização</p>
<h2 className="ps-h2" style={{ color: t.onDark }}>Ouça menos o barulho<br />da cidade</h2>
<hr className="ps-rule" style={{ margin: '28px 0' }} />
<p style={{ color: t.onDarkMuted, fontSize: 17, lineHeight: 1.6, marginTop: 0 }}>
Rua Duarte da Costa, n&ordm; 875, esq. Rua Artur Bernardes &mdash; Santa Bárbara, Criciúma/SC
</p>
<p style={{ color: t.onDarkMuted, fontSize: 15, lineHeight: 1.8, marginTop: 14, maxWidth: 420 }}>
Tendo o bem-estar e a natureza como seus melhores vizinhos. O Parque da Prefeitura como extensão do seu quintal.
</p>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ps-cta ps-cta-light" data-wpp="1" style={{ marginTop: 30 }}>Atendimento Exclusivo</a>
</div>
</div>
</section>

{/* 8 FINANCIAMENTO DIRETO */}
<section style={{ background: t.green, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
<p className="ps-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Financiamento Direto</p>
<h2 className="ps-h2" style={{ color: t.onDark }}>A liberdade de comprar sem banco</h2>
<p className="ps-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 60 }}>Sem burocracia, sem intermediários. Direto com a construtora.</p>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 'clamp(28px,4vw,52px)' }}>
{[
{ n: '01', ti: 'Converse com o Corretor', d: 'Atendimento exclusivo e reservado com Stiven Allan para entender o seu momento e as melhores condições.' },
{ n: '02', ti: 'Condições sob medida', d: 'Proposta construída conforme o seu momento, sem intermediários e sem amarras bancárias.' },
{ n: '03', ti: 'Realize', d: 'Sua unidade no Parco Savello, com a tranquilidade de negociar diretamente com a Construtora Fontana.' },
].map((s, i) => (
<div key={i} style={{ textAlign: 'left' }}>
<div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 40, opacity: 0.55, marginBottom: 14 }}>{s.n}</div>
<h3 style={{ fontFamily: t.display, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 17, margin: '0 0 12px', color: t.onDark }}>{s.ti}</h3>
<p style={{ color: t.onDarkMuted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
</div>
))}
</div>
<p style={{ marginTop: 56, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.onDark }}>Na planta &middot; Sob consulta</p>
</div>
</section>

{/* 9 CTA FINAL */}
<section style={{ position: 'relative', minHeight: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
<Image src={IMG.aerea} alt="Vista aérea do Parco Savello Residencial em Santa Bárbara, Criciúma/SC" fill loading="lazy" sizes="100vw" style={{ objectFit: 'cover' }} />
<div style={{ position: 'absolute', inset: 0, background: 'rgba(14,26,15,0.62)' }} />
<div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px)', maxWidth: 880 }}>
<p className="ps-eyebrow ps-onimg" style={{ color: '#fff', marginBottom: 22 }}>Atendimento Exclusivo</p>
<h2 className="ps-h2 ps-onimg" style={{ color: '#fff', fontSize: 'clamp(30px,5vw,56px)' }}>Vivi la Vita.</h2>
<div style={{ marginTop: 38 }}>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ps-cta ps-cta-light" data-wpp="1">Atendimento Exclusivo</a>
</div>
</div>
</section>

{/* FOOTER */}
<footer style={{ background: t.greenDark, color: t.onDarkMuted, padding: 'clamp(56px,9vh,96px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 'clamp(28px,5vw,56px)' }}>
<div>
<div style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.22em', fontSize: 18, color: t.onDark, textTransform: 'uppercase' }}>Stiven Allan</div>
<p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6 }}>Imóveis de alto padrão em Santa Catarina.<br />CRECI 60.275</p>
</div>
<div>
<div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Contato</div>
<a href={WPP} target="_blank" rel="noopener noreferrer" data-wpp="1" style={{ color: t.onDarkMuted, textDecoration: 'none', fontSize: 14 }}>WhatsApp &middot; (48) 99164-2332</a>
</div>
<div>
<div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Empreendimento</div>
<p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>Parco Savello Residencial<br />Construtora Fontana<br />Santa Bárbara, Criciúma/SC</p>
</div>
</div>
<div style={{ maxWidth: 1180, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(234,242,234,0.12)', fontSize: 12 }}>
&copy; {new Date().getFullYear()} Stiven Allan. Imagens meramente ilustrativas. Valores sob consulta.
</div>
</footer>

{/* WHATSAPP FLUTUANTE */}
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ps-wa" data-wpp="1" aria-label="Falar no WhatsApp com Stiven Allan">
<svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.973-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
</a>

</main>
)
}
