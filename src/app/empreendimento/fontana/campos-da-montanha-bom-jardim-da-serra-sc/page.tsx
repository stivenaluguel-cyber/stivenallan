import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import GalleryWithLightbox, { LightboxPhoto } from './gallery-lightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Campos%20da%20Montanha%20Residencial.'
const CATALOGO = 'https://estilofontana.com.br/upload/empreendimento/catalogo/campos-da-montanha-residencial-1668428039.pdf'

const t = {
bg:'#F8FAF8', ink:'#0F1A12', forest:'#2D4A2F', forestDark:'#1A2E1C',
muted:'#536455', line:'rgba(15,26,18,0.12)', dark:'#080F09',
onDark:'#E8F2E8', onDarkMuted:'rgba(232,242,232,0.66)',
display:"'Jost',system-ui,sans-serif",
serif:"'Cormorant Garamond',Georgia,serif",
body:"'Hanken Grotesk',system-ui,sans-serif",
}

const IMG = {
hero: 'https://estilofontana.com.br/images/empreendimento/slideshows/campos-da-montanha-residencial-6297ada80ea83.jpg?fm=webp',
mapa: 'https://estilofontana.com.br/images/2022/06/01/localizacao-5f96cd92c6aef-6297b2eeb9403.png?fm=webp',
}

const GALERIA = [
{ src: IMG.hero, alt: 'Campos da Montanha Residencial — vista aérea', label: 'Vista aérea' },
{ src: 'https://lh3.googleusercontent.com/d/179_WSGL1GuCU4sP9yWABq961KYK9w_PK', alt: 'Pórtico de Entrada Campos da Montanha', label: 'Pórtico de Entrada' },
{ src: 'https://lh3.googleusercontent.com/d/1D2vWj82cdoW2DgvWvRKoaql9j6eWtSjb', alt: 'Spa com Sauna Campos da Montanha', label: 'Spa com Sauna' },
{ src: 'https://lh3.googleusercontent.com/d/1fuaQqaIB4tKE3MnJ1aoM844tjYPK03_J', alt: 'Fazendinha Campos da Montanha', label: 'Fazendinha' },
{ src: 'https://lh3.googleusercontent.com/d/1K9zGxd7UUeVWlHNbvLOJjg6N0yemKGsR', alt: 'Espaço Fogo Campos da Montanha', label: 'Espaço Fogo' },
{ src: 'https://lh3.googleusercontent.com/d/1bLO6lwgOIzKlPBh9w0gObg26OsZqVTWI', alt: 'Quiosque Fogo de Chão Campos da Montanha', label: 'Quiosque Fogo de Chão' },
{ src: 'https://lh3.googleusercontent.com/d/1Ww2fnC2XbxU11bYCfgJmp8lgBDnCmQVS', alt: 'Salão de Festas Campos da Montanha', label: 'Salão de Festas' },
{ src: 'https://lh3.googleusercontent.com/d/1GtsVsVBymDJbkANbTq7y2635j_YKvlLD', alt: 'Sala de Jogos Campos da Montanha', label: 'Sala de Jogos' },
{ src: 'https://lh3.googleusercontent.com/d/1lLc2kb0cn4mbS_e7ncNywVm4f1h52Mq0', alt: 'Playground Campos da Montanha', label: 'Playground' },
{ src: 'https://lh3.googleusercontent.com/d/10AN3DEOIETYovjPYjxO68jhcJ-A3X-R5', alt: 'Brinquedoteca Campos da Montanha', label: 'Brinquedoteca' },
{ src: 'https://lh3.googleusercontent.com/d/1T08UNXa_wa7pdQir-5-yjyJZUCZVb7hu', alt: 'Quadra Poliesportiva Campos da Montanha', label: 'Quadra Poliesportiva' },
{ src: 'https://lh3.googleusercontent.com/d/1m6Op_V-E2E1cBpnTEpGuwpB9ypizC_tj', alt: 'Quadra de Tînis Campos da Montanha', label: 'Quadra de Tînis' },
{ src: 'https://lh3.googleusercontent.com/d/18O1bvPjwz3MOQKXLZBJeOFC0le9K7qlu', alt: 'Pomar Campos da Montanha', label: 'Pomar' },
{ src: 'https://lh3.googleusercontent.com/d/1ZZmXkHFK5I5y-VmpuMc1cvxUIQvjO1f8', alt: 'Implantação Geral Campos da Montanha', label: 'Implantação Geral' },
{ src: 'https://lh3.googleusercontent.com/d/1kOvDf5dVuvIG-EjBE7ta29nAbXVPlN_A', alt: 'Fotomontagem Campos da Montanha', label: 'Fotomontagem' },
]

const DIFERENCIAIS = [
'Lotes de 850 a 1.369 m² em condomínio fechado',
'Infraestrutura completa: água, luz, drenagem e ruas pavimentadas',
'Espaço para pouso de helicóptero',
'Fazendinha e pomar nativos integrados ao verde',
]

const AMENIDADES = [
'Spa com Sauna','Quiosque com Fogo de Chão','Espaço Fogo',
'Salão de Festas','Sala de Jogos','Playground','Brinquedoteca',
'Quadra Poliesportiva','Quadra de Tînis','Pórtico de Entrada monumental',
'Fazendinha','Pomar',
]

const SCHEMA = {
'@context': 'https://schema.org',
'@type': 'LandLot',
name: 'Campos da Montanha Residencial',
description: 'Terreno em condomínio fechado na Serra Catarinense. Lotes de 850 a 1.369 m² em Bom Jardim da Serra/SC.',
url: `${SITE_URL}/empreendimento/fontana/campos-da-montanha-bom-jardim-da-serra-sc`,
address: {
'@type': 'PostalAddress',
streetAddress: 'Rod. SC-390',
addressLocality: 'Bom Jardim da Serra',
addressRegion: 'SC',
addressCountry: 'BR',
},
floorSize: { '@type': 'QuantitativeValue', minValue: 850, maxValue: 1369, unitCode: 'MTK' },
}

export const metadata: Metadata = {
title: 'Campos da Montanha Residencial | Bom Jardim da Serra SC',
description: 'Terreno em condomínio na Serra Catarinense. Lotes de 850 a 1.369 m² com infraestrutura completa em Bom Jardim da Serra/SC.',
openGraph: {
title: 'Campos da Montanha Residencial | Bom Jardim da Serra SC',
description: 'Terreno em condomínio na Serra Catarinense. Lotes de 850 a 1.369 m².',
images: [{ url: IMG.hero }],
},
}

export default function CamposDaMontanhaPage() {
return (
<main style={{ background: t.bg, color: t.ink, fontFamily: t.body, overflowX: 'hidden' }}>

<style>{`
html { scroll-behavior: smooth; }
.cm-eyebrow { font-size:11px; letter-spacing:0.42em; text-transform:uppercase; color:${t.forest}; font-family:${t.body}; font-weight:500; }
.cm-h1 { font-family:${t.display}; font-weight:300; text-transform:uppercase; letter-spacing:0.14em; line-height:1.04; text-shadow:0 2px 24px rgba(0,0,0,0.55); }
.cm-onimg { text-shadow:0 1px 16px rgba(0,0,0,0.6); }
.cm-h2 { font-family:${t.display}; font-weight:300; text-transform:uppercase; letter-spacing:0.16em; line-height:1.1; font-size:clamp(26px,4vw,46px); margin:0; }
.cm-rule { width:56px; height:1px; background:${t.forest}; border:0; }
.cm-cta { display:inline-block; font-family:${t.body}; font-size:12px; letter-spacing:0.3em; text-transform:uppercase; color:${t.ink}; border:1px solid ${t.forest}; padding:16px 34px; text-decoration:none; transition:background .2s,color .2s; }
.cm-cta:hover { background:${t.forest}; color:#fff; }
.cm-cta-light { color:${t.onDark}; border-color:rgba(232,242,232,0.55); }
.cm-cta-light:hover { background:${t.onDark}; color:${t.forestDark}; }
.cm-navlink { font-family:${t.body}; font-size:11px; letter-spacing:0.28em; text-transform:uppercase; color:rgba(255,255,255,0.85); text-decoration:none; }
.cm-navlink:hover { color:#fff; }
.cm-fade { opacity:0; transform:translateY(24px); animation:cmfade .9s ease forwards; }
@keyframes cmfade { to { opacity:1; transform:none; } }
.cm-gcard { position: relative; overflow: hidden; }
.cm-gcard img { transition: transform .8s ease; }
.cm-gcard:hover img { transform: scale(1.06); }
.cm-gcard:focus { outline: 2px solid ${t.forest}; outline-offset: 2px; }
.cm-amen { display:flex; align-items:center; gap:12px; padding:14px 0; border-bottom:1px solid ${t.line}; font-size:15px; }
.cm-amen::before { content:''; width:6px; height:6px; background:${t.forest}; border-radius:50%; flex:0 0 auto; }
.cm-lazer-card { position: relative; overflow: hidden; }
.cm-lazer-card img { transition: transform .8s ease; }
.cm-lazer-card:hover img { transform: scale(1.06); }
.cm-lazer-card:focus { outline: 2px solid ${t.forest}; outline-offset: 2px; }
.cm-wa { position:fixed; right:20px; bottom:20px; z-index:60; width:56px; height:56px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; text-decoration:none; box-shadow:0 4px 16px rgba(0,0,0,0.25); }
@media (max-width:860px) { .cm-nav-links { display:none !important; } }
`}</style>
<header style={{ position:'absolute', top:0, left:0, right:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:64 }}>
<Link href="/" style={{ fontFamily:t.display, fontSize:15, fontWeight:300, letterSpacing:'0.22em', textTransform:'uppercase', color:t.onDark, textDecoration:'none' }}>Stiven Allan</Link>
<nav className="cm-nav-links" style={{ display:'flex', gap:32 }}>
<a href="#galeria" className="cm-navlink">Galeria</a>
<a href="#diferenciais" className="cm-navlink">Diferenciais</a>
<a href="#localizacao" className="cm-navlink">Localização</a>
<a href={WPP} className="cm-navlink" style={{ color:'#4ade80' }}>WhatsApp</a>
</nav>
</header>
<section style={{ position:'relative', height:'100vh', minHeight:560, display:'flex', alignItems:'flex-end', paddingBottom:80 }}>
<Image src={IMG.hero} alt="Campos da Montanha Residencial – Vista aérea" fill sizes="100vw" style={{ objectFit:'cover', objectPosition:'center' }} priority />
<div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(8,15,9,0.72) 0%, rgba(8,15,9,0.18) 55%, transparent 100%)' }} />
<div style={{ position:'relative', padding:'0 48px', maxWidth:840 }} className="cm-fade">
<p className="cm-eyebrow cm-onimg" style={{ color:t.onDarkMuted, marginBottom:16 }}>Rod. SC-390 · Bom Jardim da Serra / SC</p>
<h1 className="cm-h1 cm-onimg" style={{ fontSize:'clamp(34px,6vw,80px)', color:t.onDark, margin:'0 0 12px', fontFamily:t.display }}>Campos da<br/>Montanha</h1>
<p style={{ fontFamily:t.serif, fontSize:'clamp(18px,2.2vw,26px)', color:t.onDarkMuted, margin:'0 0 32px', fontStyle:'italic' }}>Sinta o bem-estar da serra em todos os seus dias.</p>
<a href={WPP} className="cm-cta cm-cta-light">Fale com Stiven</a>
</div>
</section>
<section style={{ maxWidth:780, margin:'0 auto', padding:'96px 32px 80px' }}>
<p className="cm-eyebrow" style={{ marginBottom:20 }}>O Empreendimento</p>
<hr className="cm-rule" style={{ marginBottom:32 }} />
<p style={{ fontFamily:t.serif, fontSize:'clamp(20px,2.4vw,30px)', lineHeight:1.55, color:t.ink, fontStyle:'italic', margin:0 }}>Um caminho sinuoso desenhado pela natureza lhe conectará ao verde das montanhas e ao azul do céu. Águas límpidas, cachoeiras, cânions e neve no inverno — este é o cenário que envolve o Campos da Montanha. A Capital das Águas como palco da sua nova vida.</p>
</section>
<section style={{ background:t.dark, padding:'80px 32px' }}>
<div style={{ maxWidth:1100, margin:'0 auto' }}>
<p className="cm-eyebrow" style={{ color:t.onDarkMuted, marginBottom:12 }}>Os Lotes</p>
<hr className="cm-rule" style={{ background:t.onDark, marginBottom:40 }} />
<div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:2 }}>
{([{n:'850 a 1.369',l:'m² por lote'},{n:'100%',l:'Infraestrutura'},{n:'1.000+',l:'metros de altitude'},{n:'Serra',l:'Catarinense'}] as {n:string,l:string}[]).map((s,i) => (
<div key={i} style={{ background:'rgba(232,242,232,0.04)', padding:'40px 32px', borderLeft:'1px solid rgba(232,242,232,0.08)' }}>
<p style={{ fontFamily:t.display, fontSize:'clamp(28px,4vw,52px)', fontWeight:300, color:t.onDark, margin:'0 0 6px', letterSpacing:'0.04em' }}>{s.n}</p>
<p style={{ fontFamily:t.body, fontSize:12, letterSpacing:'0.3em', textTransform:'uppercase', color:t.onDarkMuted, margin:0 }}>{s.l}</p>
</div>
))}
</div>
</div>
</section>
<section id="galeria" style={{ padding:'96px 32px', background:t.bg }}>
<div style={{ maxWidth:1100, margin:'0 auto' }}>
<p className="cm-eyebrow" style={{ marginBottom:12 }}>Galeria</p>
<hr className="cm-rule" style={{ marginBottom:40 }} />
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
<GalleryWithLightbox galeria={GALERIA} prefix="cm" gradient="rgba(8,15,9,0.55)" />
</div>
</div>
</section>
<section id="diferenciais" style={{ background:t.dark, padding:'96px 32px' }}>
<div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
<div>
<p className="cm-eyebrow" style={{ color:t.onDarkMuted, marginBottom:12 }}>Diferenciais</p>
<hr className="cm-rule" style={{ background:t.onDark, marginBottom:40 }} />
{DIFERENCIAIS.map((d,i) => (
<div key={i} style={{ display:'grid', gridTemplateColumns:'40px 1fr', gap:20, marginBottom:32, alignItems:'start' }}>
<span style={{ fontFamily:t.serif, fontSize:'clamp(22px,2vw,30px)', color:t.forest, lineHeight:1 }}>{String(i+1).padStart(2,'0')}</span>
<p style={{ margin:0, color:t.onDarkMuted, fontSize:15, lineHeight:1.7 }}>{d}</p>
</div>
))}
</div>
<div>
<p className="cm-eyebrow" style={{ color:t.onDarkMuted, marginBottom:12 }}>Lazer</p>
<hr className="cm-rule" style={{ background:t.onDark, marginBottom:24 }} />
<div style={{ marginBottom:32 }}>
<LightboxPhoto src={GALERIA[1].src} alt="Campos da Montanha – Pórtico de Entrada" label="Pórtico de Entrada" cardClass="cm-lazer-card" imgSizes="(max-width: 768px) 100vw, 50vw" />
</div>
{AMENIDADES.map((a,i) => (
<div key={i} className="cm-amen" style={{ color:t.onDarkMuted }}>{a}</div>
))}
</div>
</div>
</section>
<section style={{ background:t.forest, padding:'80px 32px', textAlign:'center' }}>
<p className="cm-eyebrow" style={{ color:t.onDarkMuted, marginBottom:16 }}>Material Completo</p>
<h2 className="cm-h2" style={{ color:t.onDark, marginBottom:32 }}>Baixe o Catálogo</h2>
<LeadCaptureButton slug="campos-da-montanha-bom-jardim-da-serra-sc" construtora_slug="fontana" className="cm-cta cm-cta-light"  propertyDisplayName="Campos da Montanha Residencial" />
</section>
<section id="localizacao" style={{ padding:'96px 32px', background:t.bg }}>
<div style={{ maxWidth:1100, margin:'0 auto' }}>
<p className="cm-eyebrow" style={{ marginBottom:12 }}>Localização</p>
<hr className="cm-rule" style={{ marginBottom:16 }} />
<p style={{ color:t.muted, fontSize:15, marginBottom:40, letterSpacing:'0.04em' }}>Rod. SC-390 — Bom Jardim da Serra / SC</p>
<div style={{ position:'relative', width:'100%', aspectRatio:'16/7' }}>
<Image src={IMG.mapa} alt="Mapa de localização – Campos da Montanha" fill sizes="(max-width:860px) 100vw, 1100px" style={{ objectFit:'cover', borderRadius:2 }} />
</div>
</div>
</section>
<section style={{ background:t.dark, padding:'80px 32px', textAlign:'center' }}>
<p className="cm-eyebrow" style={{ color:t.onDarkMuted, marginBottom:16 }}>Seu Corretor</p>
<h2 className="cm-h2" style={{ color:t.onDark, marginBottom:16 }}>Stiven Allan</h2>
<p style={{ color:t.onDarkMuted, fontSize:15, maxWidth:480, margin:'0 auto 40px' }}>Especialista em imóveis premium no litoral e serra de Santa Catarina. Atendimento personalizado, sem burocracia.</p>
<div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
<a href={WPP} className="cm-cta cm-cta-light">Falar no WhatsApp</a>
<Link href="/" className="cm-cta" style={{ color:t.onDark, borderColor:'rgba(232,242,232,0.3)' }}>Ver todos os imóveis</Link>
</div>
</section>
<footer style={{ background:t.dark, borderTop:'1px solid rgba(232,242,232,0.06)', padding:'32px', textAlign:'center' }}>
<p style={{ color:t.onDarkMuted, fontSize:12, letterSpacing:'0.2em', textTransform:'uppercase', margin:0 }}>© {new Date().getFullYear()} Stiven Allan · Campos da Montanha Residencial · Bom Jardim da Serra/SC</p>
</footer>
<a href={WPP} target="_blank" rel="noopener noreferrer" className="cm-wa" aria-label="Falar no WhatsApp com Stiven Allan">
<svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.973-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
</a>

{/* SEO FAQ */}
<PropertyFAQ items={[{"pergunta":"Como funciona o pagamento do Campos da Montanha Residencial?","resposta":"Entrada de 20%, saldo em até 60 parcelas mensais e 5 reforços anuais (cada reforço equivale a 5 parcelas mensais), negociado diretamente com a Construtora Fontana. Sem análise de banco."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Sim. Além do financiamento direto com a construtora, é possível optar por financiamento bancário. Fale com o Stiven pelo WhatsApp para simular as duas opções."},{"pergunta":"Onde fica o Campos da Montanha Residencial?","resposta":"O Campos da Montanha Residencial está localizado na Rod. SC-390, em Bom Jardim da Serra/SC."},{"pergunta":"Quais as metragens de lote disponíveis?","resposta":"O condomínio oferece lotes de 850 a 1.369 m² com infraestrutura completa: água, luz, drenagem e ruas pavimentadas."}]} accent="#2D4A2F" />
<RelatedProperties atualSlug="campos-da-montanha-bom-jardim-da-serra-sc" cidade="Bom Jardim da Serra" />


</main>
)
}
