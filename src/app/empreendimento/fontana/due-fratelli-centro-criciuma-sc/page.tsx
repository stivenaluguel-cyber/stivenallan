import type { Metadata } from 'next'
import Image from 'next/image'
import GalleryWithLightbox, { LightboxPhoto } from './gallery-lightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

const WPP = "https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Due%20Fratelli%20Residencial."
const CATALOGO_PDF = "https://estilofontana.com.br/upload/empreendimento/catalogo/due-fratelli-residencial-1602177598.pdf"

const t = {
bg: '#FAFAF8', ink: '#16201A', slate: '#3A5068', slateDark: '#243240', muted: '#5A6870',
line: 'rgba(22,32,26,0.12)', dark: '#0D141A', onDark: '#E8EFF6', onDarkMuted: 'rgba(232,239,246,0.66)',
display: "'Jost', system-ui, sans-serif", serif: "'Cormorant Garamond', Georgia, serif",
body: "'Hanken Grotesk', system-ui, sans-serif",
}
const IMG = {
hero: 'https://estilofontana.com.br/images/empreendimento/slideshows/due-fratelli-residencial-5f889c789761e.jpg?fm=webp',
mapa: 'https://estilofontana.com.br/images/2020/10/27/localizacao-5f985c6f66773.png?fm=webp',
lazer: 'https://estilofontana.com.br/images/empreendimento/slideshows/due-fratelli-residencial-5f88a49aa91f3.jpg?fm=webp',
}
const GALERIA = [
{ src: IMG.hero, alt: 'Fachada Due Fratelli Residencial', label: 'Fachada' },
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
{ src: 'https://lh3.googleusercontent.com/d/1hsPZl9WnpET6SRunW9o59H3uautSW_xQ', alt: 'Área Comum Due Fratelli', label: 'Área Comum' },
{ src: 'https://lh3.googleusercontent.com/d/1URfh7bPG-4QouY8r5tNcCv2oQfUs-FXn', alt: 'Área Comum Due Fratelli', label: 'Área Comum' },
{ src: 'https://lh3.googleusercontent.com/d/1-HGiv8sV7jzlktu5fQ9qJhhPIcXrOkEz', alt: 'Área Comum Due Fratelli', label: 'Área Comum' },
{ src: 'https://lh3.googleusercontent.com/d/13wxBbGKBEQ5HF-_8iLXQfQFHp7GgubEt', alt: 'Living Due Fratelli', label: 'Living' },
{ src: 'https://lh3.googleusercontent.com/d/18N-4T-3mhjeWCFPlO_YhW6OobLoAD65G', alt: 'Living Due Fratelli', label: 'Living' },
{ src: 'https://lh3.googleusercontent.com/d/1rQmRZ3pCT-0mjlZQmntNU5MNvSWaqws9', alt: 'Living Due Fratelli', label: 'Living' },
{ src: 'https://lh3.googleusercontent.com/d/1K2Zw4JnneikqAYdi6r_vb-OUimGpDzDz', alt: 'Cozinha Due Fratelli', label: 'Cozinha' },
{ src: 'https://lh3.googleusercontent.com/d/1osmrYxKgU6VHWg--FDM73fn2rIrL83Fx', alt: 'Cozinha Due Fratelli', label: 'Cozinha' },
{ src: 'https://lh3.googleusercontent.com/d/1gyQinMSW-PwIpoZQP5IkVYX1R1jTQHK_', alt: 'Suíte Due Fratelli', label: 'Suíte' },
{ src: 'https://lh3.googleusercontent.com/d/1QCPu_8K5T1JuNkErNe_xlw6_OHNJ8i3A', alt: 'Suíte Due Fratelli', label: 'Suíte' },
{ src: 'https://lh3.googleusercontent.com/d/1aGcgT86-e1YipmR7tvc3KBlUmevIX_ie', alt: 'Sacada Due Fratelli', label: 'Sacada' },
{ src: 'https://lh3.googleusercontent.com/d/1dVY-C1hGswYqR00fqT0sSONDoSaUo9l7', alt: 'Sacada Due Fratelli', label: 'Sacada' },
{ src: 'https://lh3.googleusercontent.com/d/1oYwiQgL0nRR_kszOGpvUuc8ZymStCUI7', alt: 'Dormítório Due Fratelli', label: 'Dormítório' },
{ src: 'https://lh3.googleusercontent.com/d/1qA0HsE4vSUI7-j6UFsJBD7dNEuZ1c4Q4', alt: 'Dormítório Due Fratelli', label: 'Dormítório' },
{ src: 'https://lh3.googleusercontent.com/d/1lUhstJvwxFyA9Vin2KhxU_Zf2sXsO2Nw', alt: 'Dormítório Due Fratelli', label: 'Dormítório' },
{ src: 'https://lh3.googleusercontent.com/d/1IatMUMVqUqr5ofMavFYJhRJjQ-QNV6A8', alt: 'Banheiro Due Fratelli', label: 'Banheiro' },
]
const DIFERENCIAIS = [
'2 e 3 dormítórios com até 92 m² privativos',
'1 suíte com acabamento refinado',
'Sacada privativa com churrasqueira',
'2 elevadores no edifício',
]
const AMENIDADES = [
'Salão de Festas', 'Hall de Entrada', 'Churrasqueira', '2 Elevadores',
]

export const metadata: Metadata = {
title: 'Due Fratelli Residencial — Centro Criciúma/SC',
description: 'Due Fratelli Residencial (Construtora Fontana): 2 e 3 dormítórios com até 92 m² privativos no Centro de Criciúma/SC. Sacada com churrasqueira, 2 elevadores. Atendimento exclusivo com Stiven Allan.',
alternates: { canonical: SITE_URL + '/empreendimento/fontana/due-fratelli-centro-criciuma-sc' },
openGraph: {
title: 'Due Fratelli Residencial — Centro Criciúma/SC | Stiven Allan',
description: 'Qualidade de vida e praticidade no Centro de Criciúma. 2 e 3 dormítórios, até 92 m² privativos, sacada com churrasqueira.',
url: SITE_URL + '/empreendimento/fontana/due-fratelli-centro-criciuma-sc',
type: 'website',
images: [{ url: 'https://estilofontana.com.br/images/empreendimento/slideshows/due-fratelli-residencial-5f889c789761e.jpg?fm=webp', width: 1200, height: 800, alt: 'Fachada Due Fratelli Residencial' }],
},
twitter: {
card: 'summary_large_image',
title: 'Due Fratelli Residencial — Centro Criciúma/SC | Stiven Allan',
description: 'Qualidade de vida e praticidade no Centro de Criciúma. 2 e 3 dormítórios, até 92 m² privativos.',
images: ['https://estilofontana.com.br/images/empreendimento/slideshows/due-fratelli-residencial-5f889c789761e.jpg?fm=webp'],
},
robots: { index: true, follow: true },
}
const SCHEMA = {
'@context': 'https://schema.org',
'@graph': [
{ '@type': 'Apartment', name: 'Due Fratelli Residencial', description: 'Residencial com 2 e 3 dormítórios de até 92 m² privativos no Centro de Criciúma/SC.', image: 'https://estilofontana.com.br/images/empreendimento/slideshows/due-fratelli-residencial-5f889c789761e.jpg?fm=webp', numberOfRooms: 3, floorSize: { '@type': 'QuantitativeValue', value: 92, unitCode: 'MTK' }, address: { '@type': 'PostalAddress', streetAddress: 'Rua Princesa Isabel', addressLocality: 'Criciúma', addressRegion: 'SC', addressCountry: 'BR' } },
],
}

export default function DueFratelliPage() {
return (
<main style={{ background: t.bg, color: t.ink, fontFamily: t.body, overflowX: 'hidden' }}>

<style>{`
html { scroll-behavior: smooth; }
.df-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: ${t.slate}; font-family: ${t.body}; font-weight: 500; }
.df-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.04; text-shadow: 0 2px 24px rgba(0,0,0,0.55); }
.df-onimg { text-shadow: 0 1px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5); }
.df-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.16em; line-height: 1.1; font-size: clamp(26px,4vw,46px); margin: 0; }
.df-serif { font-family: ${t.serif}; font-style: italic; font-weight: 400; }
.df-rule { width: 56px; height: 1px; background: ${t.slate}; border: 0; }
.df-cta { display: inline-block; font-family: ${t.body}; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: ${t.ink}; border: 1px solid ${t.slate}; padding: 16px 34px; text-decoration: none; transition: background .35s ease, color .35s ease; cursor: pointer; }
.df-cta:hover { background: ${t.slate}; color: #fff; }
.df-cta-light { color: ${t.onDark}; border-color: rgba(232,239,246,0.55); }
.df-cta-light:hover { background: ${t.onDark}; color: ${t.slateDark}; }
.df-navlink { font-family: ${t.body}; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.85); text-decoration: none; transition: color .3s ease; }
.df-navlink:hover { color: #fff; }
.df-fade { opacity: 0; transform: translateY(24px); animation: dffade .9s ease forwards; }
@keyframes dffade { to { opacity: 1; transform: none; } }
.df-gcard { position: relative; overflow: hidden; }
.df-gcard img { transition: transform .8s ease; }
.df-gcard:hover img { transform: scale(1.06); }
.df-gcard:focus { outline: 2px solid ${t.slate}; outline-offset: 2px; }
.df-amen { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${t.line}; font-size: 15px; }
.df-amen::before { content: ''; width: 6px; height: 6px; background: ${t.slate}; border-radius: 50%; flex: 0 0 auto; }
.df-lazer-card { position: relative; overflow: hidden; }
.df-lazer-card img { transition: transform .8s ease; }
.df-lazer-card:hover img { transform: scale(1.06); }
.df-lazer-card:focus { outline: 2px solid ${t.slate}; outline-offset: 2px; }
.df-wa { position: fixed; right: 20px; bottom: 20px; z-index: 60; width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
.df-burger { display: none; }
@media (max-width: 860px) { .df-nav-links { display: none !important; } .df-burger { display: flex !important; } }
details.df-menu > summary { list-style: none; }
details.df-menu > summary::-webkit-details-marker { display: none; }
`}</style>
<header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
<nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px clamp(18px,5vw,56px)' }}>
<a href="#top" style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.26em', fontSize: 16, color: '#fff', textDecoration: 'none', textTransform: 'uppercase' }}>Due Fratelli</a>
<div className="df-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
<a href="#residencial" className="df-navlink">O Residencial</a>
<a href="#galeria" className="df-navlink">Galeria</a>
<a href="#diferenciais" className="df-navlink">Diferenciais</a>
<a href="#localizacao" className="df-navlink">Localização</a>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="df-cta df-cta-light" style={{ padding: '12px 24px' }}>Atendimento Exclusivo</a>
</div>
<details className="df-menu df-burger" style={{ position: 'relative' }}>
<summary style={{ cursor: 'pointer', color: '#fff', fontSize: 22, lineHeight: 1, padding: 6 }} aria-label="Abrir menu">&#9776;</summary>
<div style={{ position: 'absolute', right: 0, top: '120%', background: t.slateDark, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 200, boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
<a href="#residencial" className="df-navlink">O Residencial</a>
<a href="#galeria" className="df-navlink">Galeria</a>
<a href="#diferenciais" className="df-navlink">Diferenciais</a>
<a href="#localizacao" className="df-navlink">Localização</a>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="df-navlink">Atendimento Exclusivo</a>
</div>
</details>
</nav>
</header>
<section id="top" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end' }}>
<Image src={IMG.hero} alt="Fachada do Due Fratelli Residencial — Centro de Criciúma/SC" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,20,26,0.42) 0%, rgba(13,20,26,0.12) 40%, rgba(13,20,26,0.78) 100%)' }} />
<div className="df-fade" style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px) clamp(56px,9vh,110px)', maxWidth: 1100 }}>
<p className="df-eyebrow df-onimg" style={{ color: '#fff', marginBottom: 18 }}>Due Fratelli Residencial &mdash; Centro, Criciúma/SC</p>
<h1 className="df-h1" style={{ color: '#fff', fontSize: 'clamp(40px,8vw,104px)', margin: 0 }}>Due Fratelli</h1>
<p className="df-serif df-onimg" style={{ color: '#fff', fontSize: 'clamp(20px,3vw,32px)', marginTop: 14, marginBottom: 34 }}>Qualidade de vida e praticidade.</p>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="df-cta df-cta-light">Atendimento Exclusivo</a>
</div>
</section>
<section id="residencial" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)', textAlign: 'center' }}>
<div style={{ maxWidth: 820, margin: '0 auto' }}>
<p className="df-eyebrow" style={{ marginBottom: 26 }}>O Residencial</p>
<p className="df-serif" style={{ fontSize: 'clamp(24px,3.4vw,40px)', lineHeight: 1.35, color: t.ink, margin: 0 }}>Atento ao potencial de expansão da região, o Due Fratelli une a melhor seleção de serviços e lojas comerciais à tranquilidade do seu lar. Dar valor à sua vida é aproveitar e reservar mais tempo com quem você ama.</p>
<hr className="df-rule" style={{ margin: '46px auto 0' }} />
</div>
</section>
<section id="galeria" style={{ padding: 'clamp(40px,8vh,80px) 0 0' }}>
<div style={{ textAlign: 'center', padding: '0 clamp(18px,5vw,56px) clamp(34px,6vh,60px)' }}>
<p className="df-eyebrow" style={{ marginBottom: 16 }}>Galeria</p>
<h2 className="df-h2">Cada detalhe, cuidadosamente planejado</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
<GalleryWithLightbox galeria={GALERIA} prefix="df" gradient="rgba(13,20,26,0.55)" />
</div>
</section>
<section id="plantas" style={{ background: t.dark, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
<p className="df-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>As Residências</p>
<h2 className="df-h2" style={{ color: t.onDark }}>Espaço para a sua família</h2>
<p className="df-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 56 }}>2 e 3 dormítórios com até 92 m² privativos.</p>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'clamp(28px,5vw,64px)', marginBottom: 56 }}>
{[{n:'2 e 3',l:'Dormítórios'},{n:'1',l:'Suíte'},{n:'até 92',l:'m² privativos'},{n:'2',l:'Elevadores'}].map((it,i)=>(
<div key={i}><div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(34px,5vw,58px)', letterSpacing: '0.04em', lineHeight: 1 }}>{it.n}</div><div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDarkMuted, marginTop: 12 }}>{it.l}</div></div>
))}
</div>
<LeadCaptureButton slug="due-fratelli-centro-criciuma-sc" construtora_slug="fontana" className="df-cta df-cta-light"  propertyDisplayName="Due Fratelli Residencial" />
</div>
</section>
<section id="diferenciais" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1120, margin: '0 auto' }}>
<div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
<p className="df-eyebrow" style={{ marginBottom: 16 }}>Diferenciais das Unidades</p>
<h2 className="df-h2">Detalhes que elevam o morar</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, background: t.line }}>
{DIFERENCIAIS.map((d,i)=>(
<div key={i} style={{ background: t.bg, padding: 'clamp(28px,4vw,44px)' }}>
<div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 22, color: t.slate, marginBottom: 14 }}>{String(i+1).padStart(2,'0')}</div>
<p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: t.ink }}>{d}</p>
</div>
))}
</div>
</div>
</section>
<section style={{ background: t.bg, padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1180, margin: '0 auto' }}>
<div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
<p className="df-eyebrow" style={{ marginBottom: 16 }}>Lazer &amp; Áreas Comuns</p>
<h2 className="df-h2">O conforto é a sua casa</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 'clamp(28px,5vw,64px)', alignItems: 'center' }}>
<LightboxPhoto src={IMG.lazer} alt="Lazer do Due Fratelli Residencial" label="Lazer" cardClass="df-lazer-card" imgSizes="(max-width: 768px) 100vw, 55vw" />
<ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
{AMENIDADES.map((a,i)=>(
<div key={i} className="df-amen">{a}</div>
))}
</ul>
</div>
</div>
</section>
<section id="localizacao" style={{ padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)', background: t.dark, color: t.onDark }}>
<div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 'clamp(34px,5vw,64px)', alignItems: 'center' }}>
<div>
<p className="df-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Localização</p>
<h2 className="df-h2" style={{ color: t.onDark }}>No coração de Criciúma.</h2>
<p style={{ color: t.onDarkMuted, fontSize: 17, lineHeight: 1.6, marginTop: 24 }}>Rua Princesa Isabel &mdash; Centro, Criciúma/SC</p>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="df-cta df-cta-light" style={{ marginTop: 30 }}>Atendimento Exclusivo</a>
</div>
<div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden' }}>
<Image src={IMG.mapa} alt="Mapa da localização do Due Fratelli" fill loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
</div>
</div>
</section>
<section style={{ background: t.slate, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
<p className="df-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Investimento</p>
<h2 className="df-h2" style={{ color: t.onDark }}>A liberdade de comprar sem banco</h2>
<p className="df-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 60 }}>Sem burocracia, sem intermediários. Direto com a construtora.</p>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 'clamp(28px,4vw,52px)' }}>
{[{n:'01',tt:'Converse com o corretor',d:'Atendimento exclusivo e personalizado para entender o seu momento e as melhores condições.'},{n:'02',tt:'Escolha a sua planta',d:'Selecione a unidade ideal e defina uma proposta sob medida, sem amarras bancárias.'},{n:'03',tt:'Negocie direto',d:'Condições flexíveis diretamente com a Construtora Fontana, com a liberdade que você merece.'}].map((s,i)=>(
<div key={i} style={{ textAlign: 'left' }}><div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 40, opacity: 0.55, marginBottom: 14 }}>{s.n}</div><h3 style={{ fontFamily: t.display, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 17, margin: '0 0 12px' }}>{s.tt}</h3><p style={{ color: t.onDarkMuted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.d}</p></div>
))}
</div>
<p style={{ marginTop: 56, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.onDark }}>Qualidade &amp; praticidade &middot; Sob consulta</p>
</div>
</section>
<section style={{ position: 'relative', minHeight: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
<Image src={GALERIA[8].src} alt="Salão de Festas do Due Fratelli Residencial" fill loading="lazy" sizes="100vw" style={{ objectFit: 'cover' }} />
<div style={{ position: 'absolute', inset: 0, background: 'rgba(13,20,26,0.62)' }} />
<div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px)', maxWidth: 880 }}>
<p className="df-eyebrow df-onimg" style={{ color: '#fff', marginBottom: 22 }}>Atendimento Exclusivo</p>
<h2 className="df-h2 df-onimg" style={{ color: '#fff', fontSize: 'clamp(30px,5vw,56px)' }}>Qualidade de vida e praticidade.</h2>
<div style={{ marginTop: 38 }}><a href={WPP} target="_blank" rel="noopener noreferrer" className="df-cta df-cta-light">Atendimento Exclusivo</a></div>
</div>
</section>
<footer style={{ background: t.slateDark, color: t.onDarkMuted, padding: 'clamp(56px,9vh,96px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 'clamp(28px,5vw,56px)' }}>
<div><div style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.22em', fontSize: 18, color: t.onDark, textTransform: 'uppercase' }}>Stiven Allan</div><p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6 }}>Imóveis de alto padrão em Santa Catarina.<br />CRECI 60.275</p></div>
<div><div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Contato</div><a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: t.onDarkMuted, textDecoration: 'none', fontSize: 14 }}>WhatsApp &middot; (48) 99164-2332</a></div>
<div><div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Empreendimento</div><p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>Due Fratelli Residencial<br />Construtora Fontana<br />Centro, Criciúma/SC</p></div>
</div>
<div style={{ maxWidth: 1180, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(232,239,246,0.12)', fontSize: 12 }}>&copy; {new Date().getFullYear()} Stiven Allan. Imagens meramente ilustrativas. Valores sob consulta.</div>
</footer>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="df-wa" aria-label="Falar no WhatsApp com Stiven Allan">
<svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.973-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
</a>

{/* SEO FAQ */}
<PropertyFAQ items={[{"pergunta":"Como funciona o pagamento do Due Fratelli Residencial?","resposta":"Entrada de 20%, saldo parcelado diretamente com a construtora em até 180 meses, com correção IGPM + 0,75% a.m."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Sim. Além do financiamento direto com a construtora, é possível optar por financiamento bancário. Fale com o Stiven pelo WhatsApp para simular as duas opções."},{"pergunta":"Onde fica o Due Fratelli Residencial?","resposta":"O Due Fratelli Residencial está localizado na Rua Princesa Isabel, no Centro de Criciúma/SC."},{"pergunta":"Quais as plantas e metragens disponíveis?","resposta":"O empreendimento oferece apartamentos com 2 e 3 dormitórios (com suíte) e sacada com churrasqueira, com até 92 m² privativos."}]} accent="#3A5068" />
<RelatedProperties atualSlug="due-fratelli-centro-criciuma-sc" cidade="Criciúma" />


</main>
)
  }
