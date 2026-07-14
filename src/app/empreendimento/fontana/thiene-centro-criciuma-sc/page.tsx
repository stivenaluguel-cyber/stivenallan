import type { Metadata } from 'next'
import Image from 'next/image'
import { HeroImage } from '@/components/HeroImage'
import GalleryWithLightbox from './gallery-lightbox'
import Link from 'next/link'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

// Hotsite premium Thiene Residencial (Fontana, Centro Criciúma/SC). Padrão EPIC.
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Thiene%20Residencial.'

const t = {
bg: '#F9F9F7',
ink: '#111820',
blue: '#1C3144',
blueDark: '#0E1F2E',
muted: '#4A5568',
line: 'rgba(17,24,32,0.12)',
dark: '#0A1520',
onDark: '#E8EFF5',
onDarkMuted: 'rgba(232,239,245,0.66)',
display: "\'Bricolage Grotesque\', system-ui, sans-serif",
serif: "\'Cormorant Garamond\', Georgia, serif",
body: "\'Hanken Grotesk\', system-ui, sans-serif",
}

const IMG = {
hero: '/images/empreendimentos/thiene-centro-criciuma-sc/thiene-residencial-64be6b2174a61.jpg',
}

const GALERIA: { src: string; alt: string; label: string }[] = [
{ src: '/images/empreendimentos/thiene-centro-criciuma-sc/thiene-residencial-64be6b2174a61.jpg', alt: 'Thiene Residencial - fachada', label: 'Fachada' },
{ src: '/images/empreendimentos/thiene-centro-criciuma-sc/fon-thi-acesso-ef-web.jpg', alt: 'Thiene Residencial - acesso principal', label: 'Acesso' },
{ src: '/images/empreendimentos/thiene-centro-criciuma-sc/fon-thi-fotomontagem-ef-web.jpg', alt: 'Thiene Residencial - fotomontagem', label: 'Perspectiva' },
{ src: '/images/empreendimentos/thiene-centro-criciuma-sc/fon-thi-suite-final-01-ef-web.jpg', alt: 'Thiene Residencial - suíte', label: 'Suíte' },
{ src: '/images/empreendimentos/thiene-centro-criciuma-sc/fon-thi-piscina-ef-web.jpg', alt: 'Thiene Residencial - piscina', label: 'Piscina' },
{ src: '/images/empreendimentos/thiene-centro-criciuma-sc/fon-thi-fachada-angular-ef-web.jpg', alt: 'Thiene Residencial - fachada angular', label: 'Vista Angular' },
]

const DIFERENCIAIS: string[] = [
'Living integrado',
'Sacada com churrasqueira a carvão',
'Lavanderia com acesso para a sacada',
'Persianas automatizadas',
'Rebaixo em gesso',
'Lavabo',
'Fechadura digital',
'Espera para coifa',
'Manta acústica entre pavimentos',
'Possibilidade de personalização de planta',
'Geração de energia por placas fotovoltaicas',
]

const AMENIDADES: string[] = [
'Piscina com deck molhado',
'Terraço coberto e descoberto',
'Espaço fitness',
'Salão de festas',
'Sala de jogos',
'Brinquedoteca',
'Playground',
'Jardim vertical',
'Hall com pé-direito duplo',
'2 elevadores',
'Aproveitamento de águas pluviais',
]

export const revalidate = 3600

export const metadata: Metadata = {
title: 'Thiene Residencial | Centro Criciúma',
description: 'Thiene Residencial (Construtora Fontana): 3 dormitórios (1 suíte), 101 a 102 m², no Centro de Criciúma/SC. Financiamento direto com a construtora. Atendimento exclusivo com Stiven Allan.',
keywords: ['Thiene Residencial', 'apartamento Centro Criciúma', 'lançamento Fontana', 'Stiven Allan corretor SC'],
alternates: { canonical: `${SITE_URL}/empreendimento/fontana/thiene-centro-criciuma-sc` },
openGraph: {
title: 'Thiene Residencial — Grandioso como a sua história. | Stiven Allan',
description: 'Thiene Residencial (Construtora Fontana): 3 dormitórios (1 suíte), 101 a 102 m², Centro Criciúma/SC. Financiamento direto Fontana.',
url: `${SITE_URL}/empreendimento/fontana/thiene-centro-criciuma-sc`,
images: [{ url: IMG.hero, width: 1200, height: 630, alt: 'Thiene Residencial — Centro, Criciúma/SC' }],
type: 'website',
locale: 'pt_BR',
},
twitter: {
card: 'summary_large_image',
title: 'Thiene Residencial — Grandioso como a sua história. | Stiven Allan',
description: 'Thiene Residencial (Construtora Fontana): 3 dormitórios (1 suíte), 101 a 102 m², Centro Criciúma/SC.',
images: [IMG.hero],
},
robots: { index: true, follow: true },
}

export default function ThieneResidencialPage() {
return (
<main style={{ background: t.bg, color: t.ink, fontFamily: t.body, overflowX: 'hidden' }}>
<PropertySchema nome="Thiene Residencial" slug="thiene-centro-criciuma-sc" construtora_slug="fontana" cidade="Criciúma" uf="SC" bairro="Centro" descricao="Thiene Residencial — 3 dormitórios (1 suíte), 101 a 102 m² privativos no Centro de Criciúma/SC. Financiamento direto Fontana." imagem="https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/thiene-centro-criciuma-sc.jpg" faq={[{"pergunta":"Como funciona o pagamento do Thiene Residencial?","resposta":"Entrada de 10%, saldo parcelado diretamente com a construtora em até 180 meses, com correção IGPM + 0,75% a.m."},{"pergunta":"Qual a previsão de entrega do Thiene Residencial?","resposta":"A previsão de entrega é setembro de 2026, em Centro, Criciúma/SC."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Sim. Além do financiamento direto com a construtora, é possível optar por financiamento bancário. Fale com o Stiven pelo WhatsApp para simular as duas opções."},{"pergunta":"Onde fica o Thiene Residencial?","resposta":"O Thiene Residencial está localizado na Rua Monteiro Lobato, esq. Rua Santo Antônio, no Centro de Criciúma/SC."},{"pergunta":"Quais as plantas e metragens disponíveis?","resposta":"O empreendimento oferece apartamentos com 3 dormitórios (1 suíte), de 101 a 102 m² privativos."}]} />



<style>{`
html { scroll-behavior: smooth; }
.th-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: ${t.blue}; font-family: ${t.body}; font-weight: 500; }
.th-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.04; text-shadow: 0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4); font-size: clamp(40px,8vw,104px); margin: 0; }
.th-onimg { text-shadow: 0 1px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5); }
.th-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.16em; line-height: 1.1; font-size: clamp(26px,4vw,46px); margin: 0; }
.th-serif { font-family: ${t.serif}; font-style: italic; font-weight: 400; }
.th-rule { width: 56px; height: 1px; background: ${t.blue}; border: 0; }
.th-cta { display: inline-block; font-family: ${t.body}; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: ${t.ink}; border: 1px solid ${t.blue}; padding: 16px 34px; text-decoration: none; transition: background .35s ease, color .35s ease; cursor: pointer; }
.th-cta:hover { background: ${t.blue}; color: #fff; }
.th-cta-light { color: ${t.onDark}; border-color: rgba(232,239,245,0.55); }
.th-cta-light:hover { background: ${t.onDark}; color: ${t.blueDark}; }
.th-navlink { font-family: ${t.body}; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.85); text-decoration: none; transition: color .3s ease; }
.th-navlink:hover { color: #fff; }
.th-fade { opacity: 0; transform: translateY(24px); animation: thfade .9s ease forwards; }
@keyframes thfade { to { opacity: 1; transform: none; } }
.th-gcard { position: relative; overflow: hidden; cursor: zoom-in; }
.th-gcard img { transition: transform .8s ease; }
.th-gcard:hover img { transform: scale(1.06); }
.th-gcard:focus { outline: 2px solid ${t.blue}; outline-offset: 2px; }
.th-amen { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${t.line}; font-size: 15px; }
.th-amen::before { content: ''; width: 6px; height: 6px; background: ${t.blue}; border-radius: 50%; flex: 0 0 auto; }
.th-wa { position: fixed; right: 20px; bottom: 20px; z-index: 60; width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.25); text-decoration: none; }
.th-burger { display: none; }
@media (max-width: 860px) {
.th-nav-links { display: none !important; }
.th-burger { display: flex !important; }
}
details.th-menu > summary { list-style: none; }
details.th-menu > summary::-webkit-details-marker { display: none; }
`}</style>

{/* NAV */}
<header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
<nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px clamp(18px,5vw,56px)' }}>
<a href="#top" style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.26em', fontSize: 16, color: '#fff', textDecoration: 'none', textTransform: 'uppercase' }}>Thiene</a>
<div className="th-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
<a href="#residencial" className="th-navlink">O Residencial</a>
<a href="#galeria" className="th-navlink">Galeria</a>
<a href="#residencias" className="th-navlink">As Residências</a>
<a href="#diferenciais" className="th-navlink">Diferenciais</a>
<a href="#localizacao" className="th-navlink">Localização</a>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="th-cta th-cta-light" data-wpp="1" style={{ padding: '12px 24px' }}>Atendimento Exclusivo</a>
</div>
<details className="th-menu th-burger" style={{ position: 'relative' }}>
<summary style={{ cursor: 'pointer', color: '#fff', fontSize: 22, lineHeight: 1, padding: 6 }} aria-label="Abrir menu">&#9776;</summary>
<div style={{ position: 'absolute', right: 0, top: '120%', background: t.blueDark, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 200, boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
<a href="#residencial" className="th-navlink">O Residencial</a>
<a href="#galeria" className="th-navlink">Galeria</a>
<a href="#residencias" className="th-navlink">As Residências</a>
<a href="#diferenciais" className="th-navlink">Diferenciais</a>
<a href="#localizacao" className="th-navlink">Localização</a>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="th-navlink" data-wpp="1">Atendimento Exclusivo</a>
</div>
</details>
</nav>
</header>

{/* 1 HERO */}
<section id="top" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end' }}>
<HeroImage src={IMG.hero} alt="Thiene Residencial — perspectiva do empreendimento no Centro, Criciúma/SC" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,21,32,0.42) 0%, rgba(10,21,32,0.12) 40%, rgba(10,21,32,0.82) 100%)' }} />
<div className="th-fade" style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px) clamp(56px,9vh,110px)', maxWidth: 1100 }}>
<p className="th-eyebrow th-onimg" style={{ color: '#fff', marginBottom: 18 }}>Thiene Residencial &mdash; Centro, Criciúma/SC</p>
<h1 className="th-h1" style={{ color: '#fff' }}>Thiene Residencial</h1>
<p className="th-serif th-onimg" style={{ color: t.onDark, fontSize: 'clamp(20px,3vw,32px)', marginTop: 14, marginBottom: 12 }}>Grandioso como a sua história.</p>
<p className="th-onimg" style={{ color: t.onDarkMuted, fontSize: 'clamp(15px,1.8vw,19px)', marginTop: 0, marginBottom: 34, maxWidth: 580, lineHeight: 1.6 }}>A escolha para viver bem, viver por completo. Amplos apartamentos com acabamentos nobres para momentos históricos.</p>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="th-cta th-cta-light" data-wpp="1">Atendimento Exclusivo</a>
</div>
</section>

{/* 2 CONCEITO */}
<section id="residencial" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)', textAlign: 'center' }}>
<div style={{ maxWidth: 820, margin: '0 auto' }}>
<p className="th-eyebrow" style={{ marginBottom: 26 }}>O Residencial</p>
<h2 className="th-h2">Onde a história<br />se escreve</h2>
<hr className="th-rule" style={{ margin: '34px auto' }} />
<p className="th-serif" style={{ fontSize: 'clamp(22px,3.2vw,38px)', lineHeight: 1.38, color: t.ink, margin: 0 }}>
O Thiene Residencial nasce no coração de Criciúma para quem escreve grandes histórias.
</p>
<p style={{ fontSize: 18, lineHeight: 1.8, color: t.muted, marginTop: 28, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
No Centro da cidade, com tudo a poucos passos, o Thiene entrega espaço, sofisticação e diferenciais que transformam o cotidiano em algo extraordinário.
</p>
<p className="th-serif" style={{ fontSize: 'clamp(18px,2.2vw,26px)', color: t.blue, marginTop: 30 }}>Grandioso como a sua história.</p>
</div>
</section>

{/* 3 GALERIA */}
<section id="galeria" style={{ padding: 'clamp(40px,8vh,80px) 0 0' }}>
<div style={{ textAlign: 'center', padding: '0 clamp(18px,5vw,56px) clamp(34px,6vh,60px)' }}>
<p className="th-eyebrow" style={{ marginBottom: 16 }}>Galeria</p>
<h2 className="th-h2">Sofisticação<br />em cada detalhe</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
<GalleryWithLightbox galeria={GALERIA} prefix="th" gradient="rgba(10,21,32,0.55)" />
</div>
</section>

{/* 4 AS RESIDÊNCIAS */}
<section id="residencias" style={{ background: t.dark, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
<p className="th-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>As Residências</p>
<h2 className="th-h2" style={{ color: t.onDark }}>Espaço para viver<br />com grandiosidade</h2>
<p className="th-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 56 }}>3 dormitórios, 1 suíte, espaço generoso.</p>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'clamp(28px,5vw,64px)', marginBottom: 56 }}>
{[
{ n: '3', l: 'Dormitórios (1 suíte)' },
{ n: '101–102', l: 'm² privativos' },
{ n: 'Centro', l: 'Criciúma/SC' },
].map((it, i) => (
<div key={i}>
<div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(34px,5vw,58px)', letterSpacing: '0.04em', lineHeight: 1 }}>{it.n}</div>
<div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDarkMuted, marginTop: 12 }}>{it.l}</div>
</div>
))}
</div>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="th-cta th-cta-light" data-wpp="1">Solicitar Catálogo</a>
<LeadCaptureButton slug="thiene-centro-criciuma-sc" construtora_slug="fontana"  propertyDisplayName="Thiene Residencial" />
</div>
</section>

{/* 5 DIFERENCIAIS DAS UNIDADES */}
<section id="diferenciais" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1120, margin: '0 auto' }}>
<div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
<p className="th-eyebrow" style={{ marginBottom: 16 }}>Diferenciais das Unidades</p>
<h2 className="th-h2">Cada detalhe<br />pensado para você</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, background: t.line }}>
{DIFERENCIAIS.map((d, i) => (
<div key={i} style={{ background: t.bg, padding: 'clamp(28px,4vw,44px)' }}>
<div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 22, color: t.blue, marginBottom: 14 }}>{String(i + 1).padStart(2, '0')}</div>
<p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: t.ink }}>{d}</p>
</div>
))}
</div>
</div>
</section>

{/* 6 LAZER & ÁREAS COMUNS */}
<section style={{ background: t.dark, color: t.onDark, padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1180, margin: '0 auto' }}>
<div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
<p className="th-eyebrow" style={{ color: t.onDark, marginBottom: 16 }}>Lazer &amp; Áreas Comuns</p>
<h2 className="th-h2" style={{ color: t.onDark }}>Bem-estar<br />ao ar livre</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 'clamp(28px,4vw,48px)' }}>
{AMENIDADES.map((a, i) => (
<div key={i} className="th-amen" style={{ color: t.onDark, borderBottomColor: 'rgba(232,239,245,0.15)' }}>
<span style={{ width: 6, height: 6, background: t.onDark, borderRadius: '50%', flexShrink: 0, opacity: 0.6 }} />
{a}
</div>
))}
</div>
</div>
</section>

{/* 7 LOCALIZAÇÃO */}
<section id="localizacao" style={{ padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)', background: t.bg }}>
<div style={{ maxWidth: 1180, margin: '0 auto' }}>
<div style={{ maxWidth: 640 }}>
<p className="th-eyebrow" style={{ marginBottom: 18 }}>Localização</p>
<h2 className="th-h2">No coração<br />de Criciúma</h2>
<hr className="th-rule" style={{ margin: '28px 0' }} />
<p style={{ color: t.muted, fontSize: 17, lineHeight: 1.6, marginTop: 0 }}>
Rua Monteiro Lobato, esq. Rua Santo Antônio &mdash; Centro, Criciúma/SC
</p>
<p style={{ color: t.muted, fontSize: 15, lineHeight: 1.8, marginTop: 14, maxWidth: 420 }}>
Com tudo a poucos passos, o Thiene coloca você no centro da vida urbana de Criciúma, com a sofisticação e o conforto que você merece.
</p>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="th-cta" data-wpp="1" style={{ marginTop: 30 }}>Atendimento Exclusivo</a>
</div>
</div>
</section>

{/* 8 FINANCIAMENTO DIRETO */}
<section style={{ background: t.blue, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
<p className="th-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Financiamento Direto</p>
<h2 className="th-h2" style={{ color: t.onDark }}>A liberdade de comprar sem banco</h2>
<p className="th-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 60 }}>Sem burocracia, sem intermediários. Direto com a construtora.</p>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 'clamp(28px,4vw,52px)' }}>
{[
{ n: '01', ti: 'Converse com o Corretor', d: 'Atendimento exclusivo e reservado com Stiven Allan para entender o seu momento e as melhores condições.' },
{ n: '02', ti: 'Condições sob medida', d: 'Proposta construída conforme o seu momento, sem intermediários e sem amarras bancárias.' },
{ n: '03', ti: 'Realize', d: 'Sua unidade no Thiene Residencial, com a tranquilidade de negociar diretamente com a Construtora Fontana.' },
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
<Image unoptimized src={IMG.hero} alt="Thiene Residencial — Centro, Criciúma/SC" fill loading="lazy" sizes="100vw" style={{ objectFit: 'cover' }} />
<div style={{ position: 'absolute', inset: 0, background: 'rgba(10,21,32,0.65)' }} />
<div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px)', maxWidth: 880 }}>
<p className="th-eyebrow th-onimg" style={{ color: '#fff', marginBottom: 22 }}>Atendimento Exclusivo</p>
<h2 className="th-h2 th-onimg" style={{ color: '#fff', fontSize: 'clamp(30px,5vw,56px)' }}>Grandioso como a sua história.</h2>
<div style={{ marginTop: 38 }}>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="th-cta th-cta-light" data-wpp="1">Atendimento Exclusivo</a>
</div>
</div>
</section>

{/* FOOTER */}
<footer style={{ background: t.blueDark, color: t.onDarkMuted, padding: 'clamp(56px,9vh,96px) clamp(18px,5vw,56px)' }}>
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
<p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>Thiene Residencial<br />Construtora Fontana<br />Centro, Criciúma/SC</p>
</div>
</div>
<div style={{ maxWidth: 1180, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(232,239,245,0.12)', fontSize: 12 }}>
&copy; {new Date().getFullYear()} Stiven Allan. Imagens meramente ilustrativas. Valores sob consulta.
</div>
</footer>

{/* WHATSAPP FLUTUANTE */}
<a href={WPP} target="_blank" rel="noopener noreferrer" className="th-wa" data-wpp="1" aria-label="Falar no WhatsApp com Stiven Allan">
<svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.973-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
</a>


{/* SEO FAQ */}
<PropertyFAQ items={[{"pergunta":"Como funciona o pagamento do Thiene Residencial?","resposta":"Entrada de 10%, saldo parcelado diretamente com a construtora em até 180 meses, com correção IGPM + 0,75% a.m."},{"pergunta":"Qual a previsão de entrega do Thiene Residencial?","resposta":"A previsão de entrega é setembro de 2026, em Centro, Criciúma/SC."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Sim. Além do financiamento direto com a construtora, é possível optar por financiamento bancário. Fale com o Stiven pelo WhatsApp para simular as duas opções."},{"pergunta":"Onde fica o Thiene Residencial?","resposta":"O Thiene Residencial está localizado na Rua Monteiro Lobato, esq. Rua Santo Antônio, no Centro de Criciúma/SC."},{"pergunta":"Quais as plantas e metragens disponíveis?","resposta":"O empreendimento oferece apartamentos com 3 dormitórios (1 suíte), de 101 a 102 m² privativos."}]} accent="#1C3144" />
<RelatedProperties atualSlug="thiene-centro-criciuma-sc" cidade="Criciúma" />


</main>
)
}
