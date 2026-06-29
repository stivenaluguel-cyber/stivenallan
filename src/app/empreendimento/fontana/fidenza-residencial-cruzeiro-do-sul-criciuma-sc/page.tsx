'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

// Hotsite premium Fidenza Residencial (Fontana, Cruzeiro do Sul, Criciuma/SC). Padrao EPIC — benchmark Aguas de Marano.
// Acento: grafite #2B2B2B com detalhe azul #1E3A8A discreto (motivo Mondrian).
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Fidenza%20Residencial.'
const CATALOGO_PDF = 'https://estilofontana.com.br/upload/empreendimento/catalogo/fidenza-residencial-1725383545.pdf'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'

const t = {
bg: '#FAFAF8',
ink: '#1A1916',
graphite: '#2B2B2B',
graphiteDark: '#1A1A1A',
blue: '#1E3A8A',
muted: '#6E685E',
line: 'rgba(26,25,22,0.12)',
dark: '#14130F',
onDark: '#F4F1EA',
onDarkMuted: 'rgba(244,241,234,0.66)',
display: "\'Bricolage Grotesque\', system-ui, sans-serif",
serif: "\'Cormorant Garamond\', Georgia, serif",
body: "\'Hanken Grotesk\', system-ui, sans-serif",
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

const LB_IMGS = [
...GALERIA,
{ src: IMG.piscina, alt: 'Piscina adulto e infantil com deck molhado — Fidenza Residencial', label: 'Lazer — Piscina' },
]

const DIFERENCIAIS: string[] = [
'Hall com pé-direito duplo',
'Sacada com churrasqueira a carvão e guarda-corpo de vidro',
'Persianas automatizadas nos dormitórios',
'Manta acústica entre pavimentos',
'Fechadura digital',
'Tubulação de água quente com espera para recirculação',
'Espera para split e para coifa',
'Nicho nos banheiros',
'Rebaixo em gesso',
]

const AMENIDADES: string[] = [
'Piscina adulto e infantil com deck molhado',
'Academia com varanda panorâmica',
'Salão de festas',
'Brinquedoteca',
'Playground ao ar livre',
'Espaço de lazer integrado',
'Câmeras de segurança',
'Gerador para áreas comuns',
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
url: SITE_URL,
telephone: '+5548991642332',
areaServed: { '@type': 'City', name: 'Criciúma', containedInPlace: { '@type': 'State', name: 'Santa Catarina' } },
},
{
'@type': 'Apartment',
name: 'Fidenza Residencial',
description: 'Apartamentos de alto padrão no Cruzeiro do Sul, Criciúma/SC: 3 dormitórios (todos suítes), 149 a 161 m² privativos, 2 unidades por andar, com financiamento direto com a Construtora Fontana.',
image: IMG.heroFrontal,
numberOfRooms: 3,
numberOfBathroomsTotal: 3,
floorSize: { '@type': 'QuantitativeValue', minValue: 149, maxValue: 161, unitCode: 'MTK' },
address: { '@type': 'PostalAddress', streetAddress: 'Rua São José, 1000', addressLocality: 'Criciúma', addressRegion: 'SC', addressCountry: 'BR' },
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

// ── LIGHTBOX COMPONENT ──────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }: {
images: { src: string; alt: string; label: string }[]
startIndex: number
onClose: () => void
}) {
const [idx, setIdx] = useState(startIndex)
const [zoom, setZoom] = useState(1)
const [offset, setOffset] = useState({ x: 0, y: 0 })
const [dragging, setDragging] = useState(false)
const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
const [pinchDist, setPinchDist] = useState<number | null>(null)
const prev = useCallback(() => { setIdx(i => (i - 1 + images.length) % images.length); setZoom(1); setOffset({ x: 0, y: 0 }) }, [images.length])
const next = useCallback(() => { setIdx(i => (i + 1) % images.length); setZoom(1); setOffset({ x: 0, y: 0 }) }, [images.length])
useEffect(() => {
document.body.style.overflow = 'hidden'
const onKey = (e: KeyboardEvent) => {
if (e.key === 'Escape') onClose()
if (e.key === 'ArrowLeft') prev()
if (e.key === 'ArrowRight') next()
}
window.addEventListener('keydown', onKey)
return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
}, [onClose, prev, next])
const handleWheel = (e: React.WheelEvent) => { e.preventDefault(); setZoom(z => Math.min(4, Math.max(1, z - e.deltaY * 0.002))) }
const handleMouseDown = (e: React.MouseEvent) => { if (zoom > 1) { setDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }) } }
const handleMouseMove = (e: React.MouseEvent) => { if (dragging) setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }) }
const handleMouseUp = () => setDragging(false)
const handleTouchStart = (e: React.TouchEvent) => { if (e.touches.length === 2) { const dx = e.touches[0].clientX - e.touches[1].clientX; const dy = e.touches[0].clientY - e.touches[1].clientY; setPinchDist(Math.sqrt(dx*dx+dy*dy)) } }
const handleTouchMove = (e: React.TouchEvent) => { if (e.touches.length === 2 && pinchDist !== null) { const dx = e.touches[0].clientX - e.touches[1].clientX; const dy = e.touches[0].clientY - e.touches[1].clientY; const dist = Math.sqrt(dx*dx+dy*dy); setZoom(z => Math.min(4, Math.max(1, z * (dist / pinchDist)))); setPinchDist(dist) } }
const handleTouchEnd = () => setPinchDist(null)
const img = images[idx]
return (
<div role="dialog" aria-modal="true" aria-label={"Lightbox — " + img.label} style={{ position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.92)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
<div onClick={onClose} style={{ position:'absolute', inset:0, zIndex:0 }} aria-hidden="true" />
<button onClick={onClose} aria-label="Fechar lightbox" style={{ position:'absolute',top:18,right:22,zIndex:3,background:'none',border:'none',color:'#fff',fontSize:32,cursor:'pointer',lineHeight:1,padding:'4px 10px',fontWeight:300 }}>&#x2715;</button>
{images.length > 1 && <button onClick={(e)=>{e.stopPropagation();prev()}} aria-label="Imagem anterior" style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',zIndex:3,background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',color:'#fff',fontSize:28,cursor:'pointer',padding:'12px 18px',lineHeight:1,borderRadius:2,backdropFilter:'blur(4px)' }}>&#8249;</button>}
{images.length > 1 && <button onClick={(e)=>{e.stopPropagation();next()}} aria-label="Próxima imagem" style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',zIndex:3,background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',color:'#fff',fontSize:28,cursor:'pointer',padding:'12px 18px',lineHeight:1,borderRadius:2,backdropFilter:'blur(4px)' }}>&#8250;</button>}
<div onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={{ position:'relative',zIndex:2,maxWidth:'90vw',maxHeight:'80vh',cursor:zoom>1?'grab':'zoom-in',transform:`scale(${zoom}) translate(${offset.x/zoom}px,${offset.y/zoom}px)`,transformOrigin:'center center',transition:dragging?'none':'transform 0.1s ease' }}>
<img src={img.src} alt={img.alt} style={{ maxWidth:'90vw', maxHeight:'80vh', display:'block', userSelect:'none', pointerEvents:'none', objectFit:'contain' }} />
</div>
<div style={{ position:'absolute',bottom:18,left:0,right:0,textAlign:'center',zIndex:3,color:'rgba(255,255,255,0.85)',fontSize:12,letterSpacing:'0.26em',textTransform:'uppercase' }}>{img.label}{images.length > 1 && <span style={{ marginLeft:14, opacity:0.55 }}>{idx+1} / {images.length}</span>}</div>
</div>
)
}
type LBState = { open: boolean; index: number }

export default function FidenzaPage() {
const [lb, setLb] = useState<LBState>({ open: false, index: 0 })
const openLb = useCallback((i: number) => setLb({ open: true, index: i }), [])
const closeLb = useCallback(() => setLb(s => ({ ...s, open: false })), [])

return (
<main lang="pt-BR" style={{ background: t.bg, color: t.ink, fontFamily: t.body, overflowX: 'hidden' }}>
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

<style>{`
html { scroll-behavior: smooth; }
.fz-mondrian { position: absolute; inset: 0; pointer-events: none; overflow: hidden; opacity: 0.035; z-index: 1; }
.fz-mondrian line { stroke: ${t.blue}; stroke-width: 1; }
.fz-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: ${t.graphite}; font-family: ${t.body}; font-weight: 500; }
.fz-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.04; text-shadow: 0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4); font-size: clamp(40px,8vw,104px); margin: 0; }
.fz-onimg { text-shadow: 0 1px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5); }
.fz-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.16em; line-height: 1.1; font-size: clamp(26px,4vw,46px); margin: 0; }
.fz-serif { font-family: ${t.serif}; font-style: italic; font-weight: 400; }
.fz-rule { width: 56px; height: 1px; background: ${t.graphite}; border: 0; }
.fz-cta { display: inline-block; font-family: ${t.body}; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: ${t.ink}; border: 1px solid ${t.graphite}; padding: 16px 34px; text-decoration: none; transition: background .35s ease, color .35s ease; cursor: pointer; }
.fz-cta:hover { background: ${t.graphite}; color: #fff; }
.fz-cta-light { color: ${t.onDark}; border-color: rgba(244,241,234,0.55); }
.fz-cta-light:hover { background: ${t.onDark}; color: ${t.graphiteDark}; }
.fz-navlink { font-family: ${t.body}; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.85); text-decoration: none; transition: color .3s ease; }
.fz-navlink:hover { color: #fff; }
.fz-fade { opacity: 0; transform: translateY(24px); animation: fzfade .9s ease forwards; }
@keyframes fzfade { to { opacity: 1; transform: none; } }
.fz-gcard { position: relative; overflow: hidden; cursor: zoom-in; }
.fz-gcard img { transition: transform .8s ease; }
.fz-gcard:hover img { transform: scale(1.06); }
.fz-gcard:focus { outline: 2px solid ${t.graphite}; outline-offset: 2px; }
.fz-amen { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${t.line}; font-size: 15px; }
.fz-amen::before { content: ''; width: 6px; height: 6px; background: ${t.graphite}; border-radius: 50%; flex: 0 0 auto; }
.fz-lazer-card { position: relative; overflow: hidden; cursor: zoom-in; }
.fz-lazer-card img { transition: transform .8s ease; }
.fz-lazer-card:hover img { transform: scale(1.06); }
.fz-lazer-card:focus { outline: 2px solid ${t.graphite}; outline-offset: 2px; }
.fz-wa { position: fixed; right: 20px; bottom: 20px; z-index: 60; width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.25); text-decoration: none; }
.fz-burger { display: none; }
@media (max-width: 860px) {
.fz-nav-links { display: none !important; }
.fz-burger { display: flex !important; }
}
details.fz-menu > summary { list-style: none; }
details.fz-menu > summary::-webkit-details-marker { display: none; }
`}</style>

{/* NAV */}
<header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
<nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px clamp(18px,5vw,56px)' }}>
<a href="#top" style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.26em', fontSize: 16, color: '#fff', textDecoration: 'none', textTransform: 'uppercase' }}>Fidenza</a>
<div className="fz-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
<a href="#residencial" className="fz-navlink">O Residencial</a>
<a href="#galeria" className="fz-navlink">Galeria</a>
<a href="#residencias" className="fz-navlink">As Residências</a>
<a href="#diferenciais" className="fz-navlink">Diferenciais</a>
<a href="#localizacao" className="fz-navlink">Localização</a>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="fz-cta fz-cta-light" style={{ padding: '12px 24px' }}>Atendimento Exclusivo</a>
</div>
<details className="fz-menu fz-burger" style={{ position: 'relative' }}>
<summary style={{ cursor: 'pointer', color: '#fff', fontSize: 22, lineHeight: 1, padding: 6 }} aria-label="Abrir menu">&#9776;</summary>
<div style={{ position: 'absolute', right: 0, top: '120%', background: t.graphiteDark, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 200, boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
<a href="#residencial" className="fz-navlink">O Residencial</a>
<a href="#galeria" className="fz-navlink">Galeria</a>
<a href="#residencias" className="fz-navlink">As Residências</a>
<a href="#diferenciais" className="fz-navlink">Diferenciais</a>
<a href="#localizacao" className="fz-navlink">Localização</a>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="fz-navlink">Atendimento Exclusivo</a>
</div>
</details>
</nav>
</header>

{/* 1 HERO */}
<section id="top" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end' }}>
<svg className="fz-mondrian" aria-hidden="true" viewBox="0 0 1440 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
<line x1="0" y1="180" x2="1440" y2="180" />
<line x1="0" y1="450" x2="1440" y2="450" />
<line x1="0" y1="720" x2="1440" y2="720" />
<line x1="320" y1="0" x2="320" y2="900" />
<line x1="720" y1="0" x2="720" y2="900" />
<line x1="1120" y1="0" x2="1120" y2="900" />
</svg>
<Image src={IMG.heroFrontal} alt="Fachada frontal do Fidenza Residencial — Cruzeiro do Sul, Criciúma/SC, em frente ao Criciúma Clube" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center top' }} />
<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(20,19,15,0.42) 0%, rgba(20,19,15,0.12) 40%, rgba(20,19,15,0.82) 100%)' }} />
<div className="fz-fade" style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px) clamp(56px,9vh,110px)', maxWidth: 1100 }}>
<p className="fz-eyebrow fz-onimg" style={{ color: '#fff', marginBottom: 18 }}>Construtora Fontana &mdash; Cruzeiro do Sul, Criciúma/SC</p>
<h1 className="fz-h1" style={{ color: '#fff' }}>Fidenza Residencial</h1>
<p className="fz-serif fz-onimg" style={{ color: t.onDark, fontSize: 'clamp(20px,3vw,32px)', marginTop: 14, marginBottom: 34 }}>Sua autenticidade em cada detalhe.</p>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="fz-cta fz-cta-light">Atendimento Exclusivo</a>
</div>
</section>

{/* 2 CONCEITO */}
<section id="residencial" style={{ position: 'relative', padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)', textAlign: 'center' }}>
<svg className="fz-mondrian" aria-hidden="true" style={{ opacity: 0.02 }} viewBox="0 0 1440 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
<line x1="0" y1="300" x2="1440" y2="300" />
<line x1="0" y1="600" x2="1440" y2="600" />
<line x1="480" y1="0" x2="480" y2="900" />
<line x1="960" y1="0" x2="960" y2="900" />
</svg>
<div style={{ maxWidth: 820, margin: '0 auto', position: 'relative', zIndex: 2 }}>
<p className="fz-eyebrow" style={{ marginBottom: 26 }}>O Residencial</p>
<h2 className="fz-h2">Uma obra de arte<br />para chamar de lar</h2>
<hr className="fz-rule" style={{ margin: '34px auto' }} />
<p className="fz-serif" style={{ fontSize: 'clamp(24px,3.4vw,40px)', lineHeight: 1.35, color: t.ink, margin: 0 }}>
Nasce em Criciúma um lugar que acompanha seu momento de vida. Um encontro de linhas horizontais e verticais, que se tornam uma obra de arte.
</p>
<p style={{ fontSize: 18, lineHeight: 1.8, color: t.muted, marginTop: 26, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
Onde o seu estilo de vida autêntico se transforma em seu novo lar.
</p>
<p className="fz-serif" style={{ fontSize: 'clamp(17px,2.1vw,24px)', color: t.graphite, marginTop: 28 }}>A originalidade de viver em um lugar que se encaixa no que você é.</p>
<div style={{ marginTop: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
<span style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.muted }}>Apenas 2 apartamentos por andar</span>
<span style={{ width: 1, height: 28, background: t.line, display: 'inline-block' }} />
<span style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.muted }}>22 unidades · 11 pavimentos</span>
<span style={{ width: 1, height: 28, background: t.line, display: 'inline-block' }} />
<span style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.muted }}>Entrega prevista dez/2027</span>
</div>
</div>
</section>

{/* 3 VIDEO */}
<section id="video" style={{ padding: '0 clamp(0px,4vw,56px) clamp(40px,8vh,96px)' }}>
<p className="fz-eyebrow" style={{ textAlign: 'center', marginBottom: 26 }}>Conheça o Fidenza</p>
<div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: t.dark }}>
<iframe src={IMG.video} title="Vídeo Fidenza Residencial — Construtora Fontana" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} />
</div>
</section>

{/* 4 GALERIA */}
<section id="galeria" style={{ padding: 'clamp(40px,8vh,80px) 0 0' }}>
<div style={{ textAlign: 'center', padding: '0 clamp(18px,5vw,56px) clamp(34px,6vh,60px)' }}>
<p className="fz-eyebrow" style={{ marginBottom: 16 }}>Galeria</p>
<h2 className="fz-h2">Linhas que<br />se tornam arte</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
{GALERIA.map((g, i) => (
<figure key={i} className="fz-gcard" style={{ margin: 0, aspectRatio: '4 / 3', position: 'relative' }} role="button" tabIndex={0} aria-label={`Ampliar imagem: ${g.label}`} onClick={() => openLb(i)} onKeyDown={e => (e.key==='Enter'||e.key===' ') && openLb(i)}>
<Image src={g.src} alt={g.alt} fill loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,19,15,0.55), rgba(20,19,15,0) 45%)' }} />
<figcaption className="fz-onimg" style={{ position: 'absolute', left: 18, bottom: 16, color: '#fff', fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase' }}>{g.label}</figcaption>
</figure>
))}
</div>
</section>

{/* 5 AS RESIDÊNCIAS */}
<section id="residencias" style={{ background: t.dark, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
<p className="fz-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>As Residências</p>
<h2 className="fz-h2" style={{ color: t.onDark }}>Espaço para o<br />seu estilo autêntico</h2>
<p className="fz-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 56 }}>Apenas 2 apartamentos por andar. 22 unidades em 11 pavimentos.</p>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'clamp(24px,4vw,48px)', marginBottom: 40 }}>
{[
{ n: '3', l: 'Dormitórios (3 suítes)' },
{ n: '149–161', l: 'm² privativos' },
{ n: '2', l: 'Apartamentos por andar' },
{ n: '2', l: 'Elevadores' },
{ n: '11', l: 'Pavimentos' },
].map((it, i) => (
<div key={i}>
<div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(28px,4vw,52px)', letterSpacing: '0.04em', lineHeight: 1 }}>{it.n}</div>
<div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDarkMuted, marginTop: 12 }}>{it.l}</div>
</div>
))}
</div>
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 48, opacity: 0.7 }}>
<span style={{ width: 32, height: 1, background: t.onDark, display: 'inline-block' }} />
<span style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(22px,3vw,38px)', letterSpacing: '0.06em' }}>Dez/2027</span>
<span style={{ width: 32, height: 1, background: t.onDark, display: 'inline-block' }} />
<span style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.onDarkMuted }}>Entrega prevista</span>
</div>
<a href={CATALOGO_PDF} target="_blank" rel="noopener noreferrer" className="fz-cta fz-cta-light">Baixar Catálogo &amp; Plantas</a>
</div>
</section>

{/* 6 DIFERENCIAIS */}
<section id="diferenciais" style={{ position: 'relative', padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<svg className="fz-mondrian" aria-hidden="true" style={{ opacity: 0.02 }} viewBox="0 0 1440 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
<line x1="0" y1="225" x2="1440" y2="225" />
<line x1="0" y1="675" x2="1440" y2="675" />
<line x1="360" y1="0" x2="360" y2="900" />
<line x1="1080" y1="0" x2="1080" y2="900" />
</svg>
<div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative', zIndex: 2 }}>
<div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
<p className="fz-eyebrow" style={{ marginBottom: 16 }}>Diferenciais das Unidades</p>
<h2 className="fz-h2">Detalhes que<br />definem o padrão</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, background: t.line }}>
{DIFERENCIAIS.map((d, i) => (
<div key={i} style={{ background: t.bg, padding: 'clamp(28px,4vw,44px)' }}>
<div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 22, color: t.blue, marginBottom: 14, opacity: 0.7 }}>{String(i + 1).padStart(2, '0')}</div>
<p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: t.ink }}>{d}</p>
</div>
))}
</div>
</div>
</section>

{/* 7 LAZER & ÁREAS COMUNS */}
<section style={{ background: t.bg, padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1180, margin: '0 auto' }}>
<div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
<p className="fz-eyebrow" style={{ marginBottom: 16 }}>Lazer &amp; Áreas Comuns</p>
<h2 className="fz-h2">Cada detalhe<br />pensado para você</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 'clamp(28px,5vw,64px)', alignItems: 'center' }}>
<div className="fz-lazer-card" style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden' }} role="button" tabIndex={0} aria-label="Ampliar imagem: Lazer — Piscina" onClick={() => openLb(GALERIA.length)} onKeyDown={e => (e.key==='Enter'||e.key===' ') && openLb(GALERIA.length)}>
<Image src={IMG.piscina} alt="Piscina adulto e infantil com deck molhado — Fidenza Residencial" fill loading="lazy" sizes="(max-width: 768px) 100vw, 55vw" style={{ objectFit: 'cover' }} />
</div>
<ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
{AMENIDADES.map((a, i) => (
<div key={i} className="fz-amen">{a}</div>
))}
</ul>
</div>
</div>
</section>

{/* 8 LOCALIZAÇÃO */}
<section id="localizacao" style={{ padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)', background: t.dark, color: t.onDark }}>
<div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 'clamp(34px,5vw,64px)', alignItems: 'center' }}>
<div>
<p className="fz-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Localização</p>
<h2 className="fz-h2" style={{ color: t.onDark }}>No coração do<br />Cruzeiro do Sul</h2>
<hr className="fz-rule" style={{ margin: '28px 0', background: t.onDark }} />
<p style={{ color: t.onDarkMuted, fontSize: 17, lineHeight: 1.6 }}>Rua São José, 1000, esq. Rua Monteiro Lobato &mdash; Cruzeiro do Sul, Criciúma/SC. Em frente ao Criciúma Clube.</p>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="fz-cta fz-cta-light" style={{ marginTop: 30 }}>Atendimento Exclusivo</a>
</div>
<div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 2 }}>
<Image src={IMG.mapa} alt="Mapa de localização do Fidenza Residencial — Rua São José, Cruzeiro do Sul, Criciúma/SC" fill loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
</div>
</div>
</section>

{/* 9 FINANCIAMENTO DIRETO */}
<section style={{ background: t.graphite, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
<p className="fz-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Financiamento Direto</p>
<h2 className="fz-h2" style={{ color: t.onDark }}>O privilégio de comprar sem banco</h2>
<p className="fz-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 60 }}>Sem burocracia, sem intermediários. Liberdade total, direto com a construtora.</p>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 'clamp(28px,4vw,52px)' }}>
{[
{ n: '01', ti: 'Converse com o corretor', d: 'Atendimento exclusivo e personalizado com Stiven Allan para entender o seu momento e as melhores condições.' },
{ n: '02', ti: 'Escolha a sua unidade', d: 'Selecione o apartamento ideal para o seu estilo de vida, com total liberdade de escolha.' },
{ n: '03', ti: 'Negocie direto com a Fontana', d: 'Condições facilitadas, sem banco, sem burocracia. O privilégio de quem compra com autenticidade.' },
].map((s, i) => (
<div key={i} style={{ textAlign: 'left' }}>
<div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 40, opacity: 0.55, marginBottom: 14 }}>{s.n}</div>
<h3 style={{ fontFamily: t.display, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 17, margin: '0 0 12px', color: t.onDark }}>{s.ti}</h3>
<p style={{ color: t.onDarkMuted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
</div>
))}
</div>
<p style={{ marginTop: 56, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.onDark }}>Premium exclusivo &middot; Sob consulta</p>
</div>
</section>

{/* 10 CTA FINAL */}
<section style={{ position: 'relative', minHeight: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
<Image src={IMG.fachadaAngular} alt="Fidenza Residencial — perspectiva angular, Cruzeiro do Sul, Criciúma/SC" fill loading="lazy" sizes="100vw" style={{ objectFit: 'cover' }} />
<div style={{ position: 'absolute', inset: 0, background: 'rgba(20,19,15,0.62)' }} />
<div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px)', maxWidth: 880 }}>
<p className="fz-eyebrow fz-onimg" style={{ color: '#fff', marginBottom: 22 }}>Atendimento Exclusivo</p>
<h2 className="fz-serif fz-onimg" style={{ color: '#fff', fontSize: 'clamp(30px,5vw,56px)', fontStyle: 'italic', margin: '0 0 38px' }}>Sua autenticidade em cada detalhe.</h2>
<div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="fz-cta fz-cta-light">Atendimento Exclusivo</a>
<a href={CATALOGO_PDF} target="_blank" rel="noopener noreferrer" className="fz-cta" style={{ borderColor: 'rgba(244,241,234,0.5)', color: t.onDark }}>Baixar Catálogo</a>
</div>
</div>
</section>

{/* FOOTER */}
<footer style={{ background: t.graphiteDark, color: t.onDarkMuted, padding: 'clamp(56px,9vh,96px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 'clamp(28px,5vw,56px)' }}>
<div>
<div style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.22em', fontSize: 18, color: t.onDark, textTransform: 'uppercase' }}>Stiven Allan</div>
<p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6 }}>Imóveis de alto padrão em Santa Catarina.<br />CRECI 60.275</p>
</div>
<div>
<div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Contato</div>
<a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: t.onDarkMuted, textDecoration: 'none', fontSize: 14 }}>WhatsApp &middot; (48) 99164-2332</a>
</div>
<div>
<div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Empreendimento</div>
<p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>Fidenza Residencial<br />Construtora Fontana<br />Cruzeiro do Sul, Criciúma/SC<br />Rua São José, 1000</p>
</div>
<div>
<div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDark, marginBottom: 14 }}>Outros Empreendimentos</div>
<Link href="/empreendimento/fontana/monte-leone-centro-criciuma-sc" style={{ display: 'block', fontSize: 14, color: t.onDarkMuted, textDecoration: 'none', marginBottom: 8 }}>Monte Leone Residencial</Link>
<Link href="/empreendimento/fontana/lavis-residencial-centro-criciuma-sc" style={{ display: 'block', fontSize: 14, color: t.onDarkMuted, textDecoration: 'none', marginBottom: 8 }}>Lavis Residencial</Link>
<Link href="/empreendimento/fontana/aguas-de-marano-frente-mar-balneario-picarras-sc" style={{ display: 'block', fontSize: 14, color: t.onDarkMuted, textDecoration: 'none' }}>Águas de Marano</Link>
</div>
</div>
<div style={{ maxWidth: 1180, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(244,241,234,0.1)', fontSize: 12 }}>
&copy; {new Date().getFullYear()} Stiven Allan. Imagens meramente ilustrativas. Valores sob consulta.
</div>
</footer>

{/* WHATSAPP FLUTUANTE */}
<a href={WPP} target="_blank" rel="noopener noreferrer" className="fz-wa" aria-label="Falar no WhatsApp com Stiven Allan">
<svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.973-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
</a>

{/* LIGHTBOX */}
{lb.open && <Lightbox images={LB_IMGS} startIndex={lb.index} onClose={closeLb} />}
</main>
)
}
