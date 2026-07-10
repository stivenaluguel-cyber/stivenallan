import type { Metadata } from 'next'
import Image from 'next/image'
import GalleryWithLightbox, { LightboxPhoto } from './gallery-lightbox'
import Link from 'next/link'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

// Hotsite premium Monte Leone Residencial (Fontana, Centro Criciúma/SC). Padrão EPIC — benchmark Aguas de Marano.
// WhatsApp do corretor Stiven (NAO usar numeros internos da Fontana).
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Monte%20Leone%20Residencial.'
const CATALOGO_PDF = 'https://estilofontana.com.br/upload/empreendimento/catalogo/monte-leone-residencial-1756387346.pdf'

const t = {
bg: '#FAFAF8',
ink: '#16201A',
green: '#33503F',
greenDark: '#1E3328',
muted: '#5A6860',
line: 'rgba(22,32,26,0.12)',
dark: '#0F1810',
onDark: '#EAF2EC',
onDarkMuted: 'rgba(234,242,236,0.66)',
display: "\'Bricolage Grotesque\', system-ui, sans-serif",
serif: "\'Cormorant Garamond\', Georgia, serif",
body: "\'Hanken Grotesk\', system-ui, sans-serif",
}

const IMG = {
heroFrontal: 'https://estilofontana.com.br/upload/2025/08/29/f-ml-fachada-frontal-ef-web-68b18b16935ef.jpg',
heroAerea: 'https://estilofontana.com.br/images/2025/08/28/f-ml-voo-passaro-ef-web-68b0986133a09.jpg?fm=webp',
fachadaAngular: 'https://estilofontana.com.br/upload/2025/08/29/f-ml-fachada-angular-ef-web-68b18b1717c8b.jpg',
mapa: 'https://estilofontana.com.br/images/2025/08/27/monte-leone-68af608281484.png?fm=webp',
piscina: 'https://estilofontana.com.br/images/2025/08/11/f-ml-piscina-ang-02-ef-web-689a457c22a22.jpg',
video: 'https://www.youtube.com/embed/7CIZGHxnTXE',
}

const GALERIA: { src: string; alt: string; label: string }[] = [
{ src: 'https://estilofontana.com.br/images/empreendimento/slideshows/monte-leone-residencial-68b0b93ab1366.jpg?fm=webp', alt: 'Monte Leone Residencial — perspectiva do empreendimento no Centro de Criciúma/SC', label: 'O Residencial' },
{ src: 'https://estilofontana.com.br/images/empreendimento/slideshows/monte-leone-residencial-68b0b93dc2c1e.jpg?fm=webp', alt: 'Monte Leone Residencial — conjunto arquitetônico', label: 'Arquitetura' },
{ src: 'https://estilofontana.com.br/images/empreendimento/slideshows/monte-leone-residencial-68b0b946d1e4d.jpg?fm=webp', alt: 'Monte Leone Residencial — detalhe da fachada', label: 'Fachada' },
{ src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-embasamento-ef-web-689a44e070a08.jpg', alt: 'Monte Leone — acesso principal e embasamento', label: 'Acesso Principal' },
{ src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-hall-ef-web-689a44f77e59d.jpg', alt: 'Monte Leone — hall com pé-direito duplo', label: 'Hall de Entrada' },
{ src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-lounge-ang-01-ef-web-689a455866961.jpg', alt: 'Monte Leone — lounge e passarela', label: 'Lounge' },
{ src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-piscina-ang-02-ef-web-689a457c22a22.jpg', alt: 'Monte Leone — piscina climatizada adulto e infantil', label: 'Piscina' },
{ src: 'https://estilofontana.com.br/images/2025/08/11/f-ml-deck-ang-02-ef-web-689a45c5b88a0.jpg', alt: 'Monte Leone — deck da piscina', label: 'Deck' },
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
description: 'Monte Leone Residencial (Construtora Fontana): 4 dormitórios (3 suítes), 230 a 253 m², no Centro de Criciúma/SC. Vista para a Serra, financiamento direto com a construtora. Atendimento exclusivo com Stiven Allan.',
keywords: ['Monte Leone Residencial', 'apartamento alto padrão Criciúma', 'lançamento Fontana', 'Centro Criciúma', 'Stiven Allan corretor SC'],
alternates: { canonical: `${SITE_URL}/empreendimento/fontana/monte-leone-centro-criciuma-sc` },
openGraph: {
title: 'Monte Leone Residencial — Magnífico por essência | Stiven Allan',
description: 'Monte Leone Residencial (Construtora Fontana): 4 dormitórios (3 suítes), 230 a 253 m², no Centro de Criciúma/SC. Vista para a Serra. Atendimento exclusivo com Stiven Allan.',
url: `${SITE_URL}/empreendimento/fontana/monte-leone-centro-criciuma-sc`,
images: [{ url: IMG.heroAerea, width: 1200, height: 630, alt: 'Monte Leone Residencial — fachada' }],
type: 'website',
locale: 'pt_BR',
},
twitter: {
card: 'summary_large_image',
title: 'Monte Leone Residencial — Magnífico por essência | Stiven Allan',
description: 'Monte Leone Residencial (Construtora Fontana): 4 dormitórios (3 suítes), 230 a 253 m², no Centro de Criciúma/SC. Vista para a Serra. Atendimento exclusivo com Stiven Allan.',
images: [IMG.heroAerea],
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
name: 'Monte Leone Residencial',
description: 'Apartamentos de alto padrão no Centro de Criciúma/SC: 4 dormitórios (3 suítes), 230 a 253 m² privativos, 3 vagas, com financiamento direto com a Construtora Fontana.',
image: IMG.heroFrontal,
numberOfRooms: 4,
numberOfBathroomsTotal: 5,
floorSize: { '@type': 'QuantitativeValue', minValue: 230, maxValue: 253, unitCode: 'MTK' },
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
      <PropertySchema nome="Monte Leone Residencial" slug="monte-leone-centro-criciuma-sc" construtora_slug="fontana" cidade="Criciúma" uf="SC" bairro="Centro" descricao="Monte Leone Residencial (Construtora Fontana): 4 dormitórios (3 suítes), 230 a 253 m², no Centro de Criciúma/SC. Vista para a Serra. Atendimento exclusivo com Stiven Allan." imagem="https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/monte-leone-centro-criciuma-sc.jpg" faq={[{"pergunta":"Como funciona o financiamento direto do Monte Leone Residencial?","resposta":"Entrada de 20%, saldo em até 72 parcelas mensais e 6 reforços anuais (cada reforço equivale a 5 parcelas mensais), com correção pelo CUB/SC durante a obra. Sem análise de banco."},{"pergunta":"Qual a previsão de entrega do Monte Leone Residencial?","resposta":"A previsão de entrega é agosto de 2030, em Centro, Criciúma/SC."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Sim. Além do financiamento direto com a construtora, é possível optar por financiamento bancário. Fale com o Stiven pelo WhatsApp para simular as duas opções."},{"pergunta":"Onde fica o Monte Leone Residencial?","resposta":"O Monte Leone Residencial está localizado no Centro, Criciúma/SC."}]} />


<style>{`
html { scroll-behavior: smooth; }
.ml-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: ${t.green}; font-family: ${t.body}; font-weight: 500; }
.ml-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.04; text-shadow: 0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4); font-size: clamp(40px,8vw,104px); margin: 0; }
.ml-onimg { text-shadow: 0 1px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5); }
.ml-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: 0.16em; line-height: 1.1; font-size: clamp(26px,4vw,46px); margin: 0; }
.ml-serif { font-family: ${t.serif}; font-style: italic; font-weight: 400; }
.ml-rule { width: 56px; height: 1px; background: ${t.green}; border: 0; }
.ml-cta { display: inline-block; font-family: ${t.body}; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; color: ${t.ink}; border: 1px solid ${t.green}; padding: 16px 34px; text-decoration: none; transition: background .35s ease, color .35s ease; cursor: pointer; }
.ml-cta:hover { background: ${t.green}; color: #fff; }
.ml-cta-light { color: ${t.onDark}; border-color: rgba(234,242,236,0.55); }
.ml-cta-light:hover { background: ${t.onDark}; color: ${t.greenDark}; }
.ml-navlink { font-family: ${t.body}; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.85); text-decoration: none; transition: color .3s ease; }
.ml-navlink:hover { color: #fff; }
.ml-fade { opacity: 0; transform: translateY(24px); animation: mlfade .9s ease forwards; }
@keyframes mlfade { to { opacity: 1; transform: none; } }
.ml-gcard { position: relative; overflow: hidden; cursor: zoom-in; }
.ml-gcard img { transition: transform .8s ease; }
.ml-gcard:hover img { transform: scale(1.06); }
.ml-gcard:focus { outline: 2px solid ${t.green}; outline-offset: 2px; }
.ml-amen { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${t.line}; font-size: 15px; }
.ml-amen::before { content: ''; width: 6px; height: 6px; background: ${t.green}; border-radius: 50%; flex: 0 0 auto; }
.ml-lazer-card { position: relative; overflow: hidden; cursor: zoom-in; }
.ml-lazer-card img { transition: transform .8s ease; }
.ml-lazer-card:hover img { transform: scale(1.06); }
.ml-lazer-card:focus { outline: 2px solid ${t.green}; outline-offset: 2px; }
.ml-wa { position: fixed; right: 20px; bottom: 20px; z-index: 60; width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.25); text-decoration: none; }
.ml-burger { display: none; }
@media (max-width: 860px) {
.ml-nav-links { display: none !important; }
.ml-burger { display: flex !important; }
}
details.ml-menu > summary { list-style: none; }
details.ml-menu > summary::-webkit-details-marker { display: none; }
`}</style>

{/* NAV */}
<header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
<nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px clamp(18px,5vw,56px)' }}>
<a href="#top" style={{ fontFamily: t.display, fontWeight: 400, letterSpacing: '0.26em', fontSize: 16, color: '#fff', textDecoration: 'none', textTransform: 'uppercase' }}>Monte Leone</a>
<div className="ml-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
<a href="#residencial" className="ml-navlink">O Residencial</a>
<a href="#galeria" className="ml-navlink">Galeria</a>
<a href="#residencias" className="ml-navlink">As Residências</a>
<a href="#diferenciais" className="ml-navlink">Diferenciais</a>
<a href="#localizacao" className="ml-navlink">Localização</a>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ml-cta ml-cta-light" style={{ padding: '12px 24px' }}>Atendimento Exclusivo</a>
</div>
<details className="ml-menu ml-burger" style={{ position: 'relative' }}>
<summary style={{ cursor: 'pointer', color: '#fff', fontSize: 22, lineHeight: 1, padding: 6 }} aria-label="Abrir menu">&#9776;</summary>
<div style={{ position: 'absolute', right: 0, top: '120%', background: t.greenDark, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 200, boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
<a href="#residencial" className="ml-navlink">O Residencial</a>
<a href="#galeria" className="ml-navlink">Galeria</a>
<a href="#residencias" className="ml-navlink">As Residências</a>
<a href="#diferenciais" className="ml-navlink">Diferenciais</a>
<a href="#localizacao" className="ml-navlink">Localização</a>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ml-navlink">Atendimento Exclusivo</a>
</div>
</details>
</nav>
</header>

{/* 1 HERO */}
<section id="top" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'flex-end' }}>
<Image src={IMG.heroFrontal} alt="Fachada frontal do Monte Leone Residencial, no Centro de Criciúma/SC" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,24,16,0.42) 0%, rgba(15,24,16,0.12) 40%, rgba(15,24,16,0.82) 100%)' }} />
<div className="ml-fade" style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px) clamp(56px,9vh,110px)', maxWidth: 1100 }}>
<p className="ml-eyebrow ml-onimg" style={{ color: '#fff', marginBottom: 18 }}>Monte Leone Residencial &mdash; Centro, Criciúma/SC</p>
<h1 className="ml-h1" style={{ color: '#fff' }}>Monte Leone Residencial</h1>
<p className="ml-serif ml-onimg" style={{ color: t.onDark, fontSize: 'clamp(20px,3vw,32px)', marginTop: 14, marginBottom: 34 }}>Magnífico por essência.</p>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ml-cta ml-cta-light">Atendimento Exclusivo</a>
</div>
</section>

{/* 2 CONCEITO */}
<section id="residencial" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)', textAlign: 'center' }}>
<div style={{ maxWidth: 820, margin: '0 auto' }}>
<p className="ml-eyebrow" style={{ marginBottom: 26 }}>O Residencial</p>
<h2 className="ml-h2">Na altura<br />dos seus sonhos</h2>
<hr className="ml-rule" style={{ margin: '34px auto' }} />
<p className="ml-serif" style={{ fontSize: 'clamp(22px,3.2vw,38px)', lineHeight: 1.38, color: t.ink, margin: 0 }}>
O Monte Leone Residencial reflete a essência de quem valoriza o que há de mais raro — tempo de qualidade, espaço para contemplação e liberdade para viver plenamente.
</p>
<p style={{ fontSize: 18, lineHeight: 1.8, color: t.muted, marginTop: 28, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
Uma joia arquitetônica lapidada para brilhar no coração nobre de Criciúma, com vista deslumbrante para a Serra em cada unidade. Mais que um empreendimento, um legado.
</p>
<p className="ml-serif" style={{ fontSize: 'clamp(18px,2.2vw,26px)', color: t.green, marginTop: 30 }}>Sinta o sublime em cada detalhe.</p>
</div>
</section>

{/* 3 VIDEO */}
<section id="video" style={{ padding: '0 clamp(0px,4vw,56px) clamp(40px,8vh,96px)' }}>
<p className="ml-eyebrow" style={{ textAlign: 'center', marginBottom: 26 }}>Conheça o Monte Leone</p>
<div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: t.dark }}>
<iframe
src="https://www.youtube.com/embed/7CIZGHxnTXE"
title="Vídeo Monte Leone Residencial"
loading="lazy"
allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
allowFullScreen
style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
/>
</div>
</section>

{/* 4 GALERIA */}
<section id="galeria" style={{ padding: 'clamp(40px,8vh,80px) 0 0' }}>
<div style={{ textAlign: 'center', padding: '0 clamp(18px,5vw,56px) clamp(34px,6vh,60px)' }}>
<p className="ml-eyebrow" style={{ marginBottom: 16 }}>Galeria</p>
<h2 className="ml-h2">Onde a vida pulsa<br />com elegância</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
<GalleryWithLightbox galeria={GALERIA} prefix="ml" gradient="rgba(15,24,16,0.55)" />
</div>
</section>

{/* 5 AS RESIDÊNCIAS */}
<section id="residencias" style={{ background: t.dark, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
<p className="ml-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>As Residências</p>
<h2 className="ml-h2" style={{ color: t.onDark }}>Espaço para contemplação</h2>
<p className="ml-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 56 }}>Plantas amplas, vista para a Serra.</p>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'clamp(28px,5vw,64px)', marginBottom: 56 }}>
{[
{ n: '4', l: 'Dormitórios (3 suítes)' },
{ n: '3', l: 'Suítes' },
{ n: '230 a 253', l: 'm² privativos' },
{ n: '3', l: 'Vagas de garagem' },
].map((it, i) => (
<div key={i}>
<div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 'clamp(34px,5vw,58px)', letterSpacing: '0.04em', lineHeight: 1 }}>{it.n}</div>
<div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.onDarkMuted, marginTop: 12 }}>{it.l}</div>
</div>
))}
</div>
<LeadCaptureButton slug="monte-leone-centro-criciuma-sc" construtora_slug="fontana" className="ml-cta ml-cta-light"  propertyDisplayName="Monte Leone Residencial" />
</div>
</section>

{/* 6 DIFERENCIAIS DAS UNIDADES */}
<section id="diferenciais" style={{ padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1120, margin: '0 auto' }}>
<div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
<p className="ml-eyebrow" style={{ marginBottom: 16 }}>Diferenciais das Unidades</p>
<h2 className="ml-h2">O sublime<br />em cada detalhe</h2>
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

{/* 7 LAZER & ÁREAS COMUNS */}
<section style={{ background: t.bg, padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1180, margin: '0 auto' }}>
<div style={{ textAlign: 'center', marginBottom: 'clamp(40px,7vh,72px)' }}>
<p className="ml-eyebrow" style={{ marginBottom: 16 }}>Lazer &amp; Áreas Comuns</p>
<h2 className="ml-h2">Bem-estar<br />em cada andar</h2>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 'clamp(28px,5vw,64px)', alignItems: 'center' }}>
<LightboxPhoto src={IMG.piscina} alt="Piscina climatizada adulto e infantil do Monte Leone Residencial" label="Piscina" cardClass="ml-lazer-card" imgSizes="(max-width: 768px) 100vw, 55vw" />
<ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
{AMENIDADES.map((a, i) => (
<div key={i} className="ml-amen">{a}</div>
))}
</ul>
</div>
</div>
</section>

{/* 8 LOCALIZAÇÃO */}
<section id="localizacao" style={{ padding: 'clamp(80px,12vh,140px) clamp(18px,5vw,56px)', background: t.dark, color: t.onDark }}>
<div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 'clamp(34px,5vw,64px)', alignItems: 'center' }}>
<div>
<p className="ml-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Localização</p>
<h2 className="ml-h2" style={{ color: t.onDark }}>O endereço dos que<br />transformam a vida em arte</h2>
<hr className="ml-rule" style={{ margin: '28px 0' }} />
<p style={{ color: t.onDarkMuted, fontSize: 17, lineHeight: 1.6, marginTop: 0 }}>
Rua Hortêncio João da Silva, esq. Rua Antônio Baptista de Lucca, nº 98 &mdash; Centro, Criciúma/SC
</p>
<p style={{ color: t.onDarkMuted, fontSize: 15, lineHeight: 1.8, marginTop: 14, maxWidth: 420 }}>
No coração nobre de Criciúma, a poucos passos de comércio premium, gastronomia, serviços e dos principais acessos da cidade &mdash; com vista para a Serra.
</p>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ml-cta ml-cta-light" style={{ marginTop: 30 }}>Atendimento Exclusivo</a>
</div>
<div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 2 }}>
<Image src={IMG.mapa} alt="Mapa da localização do Monte Leone Residencial no Centro de Criciúma/SC" fill loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
</div>
</div>
</section>

{/* 9 FINANCIAMENTO DIRETO */}
<section style={{ background: t.green, color: t.onDark, padding: 'clamp(80px,14vh,160px) clamp(18px,5vw,56px)' }}>
<div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
<p className="ml-eyebrow" style={{ color: t.onDark, marginBottom: 18 }}>Financiamento Direto</p>
<h2 className="ml-h2" style={{ color: t.onDark }}>A liberdade de comprar sem banco</h2>
<p className="ml-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(18px,2.4vw,26px)', marginTop: 18, marginBottom: 60 }}>Sem burocracia, sem intermediários. Direto com a construtora.</p>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 'clamp(28px,4vw,52px)' }}>
{[
{ n: '01', ti: 'Converse com o corretor', d: 'Atendimento exclusivo e reservado com Stiven Allan para entender o seu momento e as melhores condições.' },
{ n: '02', ti: 'Condições sob medida', d: 'Proposta construída conforme o seu momento, sem intermediários e sem amarras bancárias.' },
{ n: '03', ti: 'Realize', d: 'Sua unidade no Monte Leone, com a tranquilidade de negociar diretamente com a Construtora Fontana.' },
].map((s, i) => (
<div key={i} style={{ textAlign: 'left' }}>
<div style={{ fontFamily: t.display, fontWeight: 300, fontSize: 40, opacity: 0.55, marginBottom: 14 }}>{s.n}</div>
<h3 style={{ fontFamily: t.display, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 17, margin: '0 0 12px', color: t.onDark }}>{s.ti}</h3>
<p style={{ color: t.onDarkMuted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
</div>
))}
</div>
<p style={{ marginTop: 56, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.onDark }}>Alto padrão exclusivo &middot; Sob consulta</p>
</div>
</section>

{/* 10 CTA FINAL */}
<section style={{ position: 'relative', minHeight: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
<Image src={IMG.heroAerea} alt="Vista aérea do Monte Leone Residencial no Centro de Criciúma/SC" fill loading="lazy" sizes="100vw" style={{ objectFit: 'cover' }} />
<div style={{ position: 'absolute', inset: 0, background: 'rgba(15,24,16,0.62)' }} />
<div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(18px,5vw,56px)', maxWidth: 880 }}>
<p className="ml-eyebrow ml-onimg" style={{ color: '#fff', marginBottom: 22 }}>Atendimento Exclusivo</p>
<h2 className="ml-h2 ml-onimg" style={{ color: '#fff', fontSize: 'clamp(30px,5vw,56px)' }}>Magnífico por essência.</h2>
<div style={{ marginTop: 38 }}>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ml-cta ml-cta-light">Atendimento Exclusivo</a>
</div>
</div>
</section>

{/* FOOTER */}
      {/* SEO FAQ */}
      <PropertyFAQ items={[{"pergunta":"Como funciona o financiamento direto do Monte Leone Residencial?","resposta":"Entrada de 20%, saldo em até 72 parcelas mensais e 6 reforços anuais (cada reforço equivale a 5 parcelas mensais), com correção pelo CUB/SC durante a obra. Sem análise de banco."},{"pergunta":"Qual a previsão de entrega do Monte Leone Residencial?","resposta":"A previsão de entrega é agosto de 2030, em Centro, Criciúma/SC."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Sim. Além do financiamento direto com a construtora, é possível optar por financiamento bancário. Fale com o Stiven pelo WhatsApp para simular as duas opções."},{"pergunta":"Onde fica o Monte Leone Residencial?","resposta":"O Monte Leone Residencial está localizado no Centro, Criciúma/SC."}]} accent="#33503F" />
      <RelatedProperties atualSlug="monte-leone-centro-criciuma-sc" cidade="Criciúma" />

<footer style={{ background: t.greenDark, color: t.onDarkMuted, padding: 'clamp(56px,9vh,96px) clamp(18px,5vw,56px)' }}>
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
<p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>Monte Leone Residencial<br />Construtora Fontana<br />Centro, Criciúma/SC</p>
</div>
</div>
<div style={{ maxWidth: 1180, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid rgba(234,242,236,0.12)', fontSize: 12 }}>
&copy; {new Date().getFullYear()} Stiven Allan. Imagens meramente ilustrativas. Valores sob consulta.
</div>
</footer>

{/* WHATSAPP FLUTUANTE */}
<a href={WPP} target="_blank" rel="noopener noreferrer" className="ml-wa" aria-label="Falar no WhatsApp com Stiven Allan">
<svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.973-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
</a>



</main>
)
}
