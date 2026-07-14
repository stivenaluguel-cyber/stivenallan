import type { Metadata } from 'next'
import Image from 'next/image'
import { HeroImage } from '@/components/HeroImage'
import Link from 'next/link'
import GalleryWithLightbox, { LightboxPhoto } from './gallery-lightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

const WPP = "https://wa.me/5548991642332?text=Olá!%20Tenho%20interesse%20no%20Pineto%20Residencial%20em%20Criciúma."
const CATALOGO_PDF = "https://estilofontana.com.br/upload/empreendimento/catalogo/pineto-residencial-1747653911.pdf"

const t = {
  bg: '#F5F2ED', ink: '#1A1A1A', navy: '#2D3F55', navyDark: '#1A2535',
  muted: '#6B6B6B', line: 'rgba(0,0,0,0.10)', dark: '#0D1B2A',
  onDark: '#F5F2ED', onDarkMuted: 'rgba(245,242,237,0.65)',
  display: "'Playfair Display', Georgia, serif",
  serif: "Georgia, serif",
  body: "'Inter', system-ui, sans-serif"
}

const IMG = {
  hero: '/images/empreendimentos/pineto-centro-criciuma-sc/pineto-residencial-68249cd5dfc70.jpg',
  hero2: '/images/empreendimentos/pineto-centro-criciuma-sc/pineto-residencial-68249cdb816aa.jpg',
  mapa: '/images/empreendimentos/pineto-centro-criciuma-sc/mapa-pineto-682b2075b57bb.jpg',
}

const GALERIA = [
  { src: '/images/empreendimentos/pineto-centro-criciuma-sc/pineto-residencial-68249cd5dfc70.jpg', alt: 'Fachada Pineto Residencial Criciúma', label: 'Fachada' },
  { src: '/images/empreendimentos/pineto-centro-criciuma-sc/pineto-residencial-68249cdb816aa.jpg', alt: 'Pineto Residencial Centro Criciúma', label: 'Vista Geral' },
]

const DIFERENCIAIS = [
  '2 dormitórios com 1 suíte — 75 a 76 m² de área privativa',
  'Living integrado com sacada e guarda-corpo em vidro',
  'Hall de entrada com pé-direito duplo',
  'Academia, coworking e espaço ioga',
  'Acabamento premium: porcelanato retificado e rebaixo em gesso',
  'Gerador de energia para todas as áreas comuns',
  'Localização estratégica no Centro de Criciúma',
  'Financiamento direto com a Construtora Fontana',
]

const AMENIDADES = [
  'Academia',
  'Coworking',
  'Espaço ioga',
  'Playground',
  'Salão de festas',
  'Churrasqueira a carvão',
  'Sistema de segurança por câmeras 24h',
  'Gerador de energia para áreas comuns',
  '2 elevadores',
]

export const metadata: Metadata = {
  title: 'Pineto Residencial | Apartamentos no Centro de Criciúma SC | Fontana',
  description: 'Pineto Residencial: apartamentos de 2 dormitórios (1 suíte), 75 a 76 m², no Centro de Criciúma/SC. Academia, coworking, espaço ioga e financiamento direto com a construtora.',
  alternates: { canonical: `${SITE_URL}/empreendimento/fontana/pineto-centro-criciuma-sc` },
  openGraph: {
    title: 'Pineto Residencial | Centro de Criciúma SC | Stiven Allan',
    description: 'Apartamentos 2 dorms (1 suíte), 75–76 m², no Centro de Criciúma. Academia, coworking, espaço ioga e financiamento direto com a Construtora Fontana.',
    url: `${SITE_URL}/empreendimento/fontana/pineto-centro-criciuma-sc`,
    images: [{ url: '/images/empreendimentos/pineto-centro-criciuma-sc/pineto-residencial-68249cd5dfc70.jpg', width: 1200, height: 630, alt: 'Pineto Residencial' }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Pineto Residencial | Criciúma SC | Stiven Allan', description: 'Aptos 2 dorms (1 suíte) · 75–76 m² · Centro de Criciúma' },
  robots: { index: true, follow: true },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'RealEstateListing',
      name: 'Pineto Residencial',
      description: 'Apartamentos de 2 dormitórios (1 suíte), 75 a 76 m², no Centro de Criciúma/SC. Academia, coworking, espaço ioga e acabamento premium.',
      url: `${SITE_URL}/empreendimento/fontana/pineto-centro-criciuma-sc`,
      image: '/images/empreendimentos/pineto-centro-criciuma-sc/pineto-residencial-68249cd5dfc70.jpg',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rua Itajaí, 185',
        addressLocality: 'Criciúma',
        addressRegion: 'SC',
        addressCountry: 'BR',
      },
      offers: { '@type': 'Offer', availability: 'https://schema.org/PreOrder', priceCurrency: 'BRL', description: 'Sob consulta' },
    },
    {
      '@type': 'LocalBusiness',
      name: 'Stiven Allan',
      url: SITE_URL,
      telephone: '+5548991642332',
      address: { '@type': 'PostalAddress', addressLocality: 'Criciúma', addressRegion: 'SC', addressCountry: 'BR' },
    },
  ],
}

export default function Page() {
  return (
    <main style={{ fontFamily: t.body, background: t.bg, color: t.ink, overflowX: 'hidden' }}>
<PropertySchema nome="Pineto Residencial" slug="pineto-centro-criciuma-sc" construtora_slug="fontana" cidade="Criciúma" uf="SC" bairro="Centro" descricao="Pineto Residencial — 2 dormitórios (1 suíte), 75 a 76 m² privativos no Centro de Criciúma/SC. Financiamento direto Fontana." imagem="https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/pineto-centro-criciuma-sc.jpg" faq={[{"pergunta":"Como funciona o financiamento direto do Pineto Residencial?","resposta":"Entrada de 20%, saldo em até 72 parcelas mensais e 6 reforços anuais (cada reforço equivale a 5 parcelas mensais), com correção pelo CUB/SC durante a obra. Sem análise de banco."},{"pergunta":"Qual a previsão de entrega do Pineto Residencial?","resposta":"A previsão de entrega é novembro de 2029, em Centro, Criciúma/SC."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Sim. Além do financiamento direto com a construtora, é possível optar por financiamento bancário. Fale com o Stiven pelo WhatsApp para simular as duas opções."},{"pergunta":"Onde fica o Pineto Residencial?","resposta":"O Pineto Residencial está localizado na Rua Itajaí, 185, no Centro de Criciúma/SC."},{"pergunta":"Quais as plantas e metragens disponíveis?","resposta":"O empreendimento oferece apartamentos com 2 dormitórios (1 suíte), de 75 a 76 m² privativos, com academia, coworking e áreas de lazer."}]} />

      
      <style>{`
        html { scroll-behavior: smooth; }
        .pn-eyebrow { font-size:11px; letter-spacing:0.42em; text-transform:uppercase; }
        .pn-h1 { font-family:${t.display}; font-weight:300; text-transform:uppercase; letter-spacing:0.14em; }
        .pn-h2 { font-family:${t.display}; font-weight:300; text-transform:uppercase; font-size:clamp(26px,4vw,46px); }
        .pn-cta { display:inline-block; letter-spacing:0.3em; border:1px solid; padding:16px 34px; text-decoration:none; }
        .pn-gcard { position:relative; overflow:hidden; }
        .pn-amen { display:flex; align-items:center; gap:12px; padding:14px 0; border-bottom:1px solid rgba(0,0,0,0.08); }
        .pn-amen::before { content:''; width:6px; height:6px; background:${t.navy}; border-radius:50%; flex-shrink:0; }
        .pn-lazer-card { position:relative; overflow:hidden; }
        .pn-wa { position:fixed; right:20px; bottom:20px; width:56px; height:56px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(0,0,0,0.25); z-index:200; }
        details.pn-menu > summary { list-style:none; }
        details.pn-menu > summary::-webkit-details-marker { display:none; }
      `}</style>

      <header style={{ position:'absolute', top:0, left:0, right:0, zIndex:50, padding:'24px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/" style={{ color:'#fff', textDecoration:'none', fontFamily:t.display, fontWeight:300, fontSize:18, letterSpacing:'0.12em' }}>
          STIVEN ALLAN
        </Link>
        <nav style={{ display:'flex', gap:32, alignItems:'center' }}>
          <Link href="/#empreendimentos" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:12, letterSpacing:'0.24em', textTransform:'uppercase' }}>Empreendimentos</Link>
          <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:12, letterSpacing:'0.24em', textTransform:'uppercase' }}>Contato</a>
        </nav>
      </header>

      <section style={{ position:'relative', height:'100vh', minHeight:560, display:'flex', alignItems:'flex-end' }}>
        <HeroImage src={IMG.hero} alt="Pineto Residencial — Centro de Criciúma SC" fill priority sizes="100vw" style={{ objectFit:'cover', objectPosition:'center' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(13,27,42,0.72) 0%, rgba(13,27,42,0.18) 55%, transparent 100%)' }} />
        <div style={{ position:'relative', padding:'0 32px 64px', maxWidth:760 }}>
          <p className="pn-eyebrow" style={{ color:'rgba(255,255,255,0.7)', marginBottom:16 }}>Centro · Criciúma / SC</p>
          <h1 className="pn-h1" style={{ color:'#fff', fontSize:'clamp(32px,5vw,64px)', lineHeight:1.1, margin:'0 0 16px' }}>Pineto<br/>Residencial</h1>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'clamp(15px,2vw,18px)', fontFamily:t.serif, fontStyle:'italic', marginBottom:36 }}>
            A sua originalidade é o segredo para viver bem.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="pn-cta" style={{ color:'#fff', borderColor:'rgba(255,255,255,0.6)', fontSize:11, letterSpacing:'0.3em', textTransform:'uppercase' }}>
            Quero Saber Mais
          </a>
        </div>
      </section>

      <section style={{ padding:'96px 32px', maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
        <div>
          <p className="pn-eyebrow" style={{ color:t.navy, marginBottom:20 }}>O Empreendimento</p>
          <h2 className="pn-h2" style={{ color:t.ink, margin:'0 0 28px' }}>As Residências</h2>
          <p style={{ color:t.muted, lineHeight:1.8, marginBottom:24 }}>
            O Pineto Residencial entrega <strong>2 dormitórios</strong> com 1 suíte em plantas de <strong>75 a 76 m²</strong>, no Centro de Criciúma. Com living integrado, sacada em vidro e acabamento premium, foi projetado para quem valoriza originalidade e qualidade em cada detalhe.
          </p>
          <ul style={{ listStyle:'none', padding:0, margin:'0 0 36px', display:'flex', flexDirection:'column', gap:10 }}>
            {['2 dormitórios · 1 suíte master','75 a 76 m² de área privativa','Living integrado à sacada','Sacada com guarda-corpo em vidro','Porcelanato retificado e rebaixo em gesso','Tubulação para água quente'].map((f,i) => (
              <li key={i} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:t.ink }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:t.navy, flexShrink:0, display:'inline-block' }} />
                {f}
              </li>
            ))}
          </ul>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="pn-cta" style={{ color:t.navy, borderColor:t.navy, fontSize:11, textTransform:'uppercase' }}>
            Consultar Condições
          </a>
        </div>
        <div style={{ position:'relative', aspectRatio:'3/4', borderRadius:2, overflow:'hidden' }}>
          <Image unoptimized src={IMG.hero2} alt="Pineto Residencial Criciúma" fill sizes="(max-width:768px) 100vw, 50vw" style={{ objectFit:'cover' }} />
        </div>
      </section>

      <section style={{ background:'#fff', padding:'96px 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p className="pn-eyebrow" style={{ color:t.navy, marginBottom:20 }}>Galeria</p>
          <h2 className="pn-h2" style={{ color:t.ink, margin:'0 0 48px' }}>Perspectivas</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
            <GalleryWithLightbox galeria={GALERIA} prefix="pn" gradient="rgba(13,27,42,0.55)" />
          </div>
        </div>
      </section>

      <section style={{ background:t.dark, padding:'96px 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p className="pn-eyebrow" style={{ color:t.onDarkMuted, marginBottom:20 }}>Tipologia</p>
          <h2 className="pn-h2" style={{ color:t.onDark, margin:'0 0 16px' }}>Planta &amp; Detalhes</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:48, marginBottom:48 }}>
            <div>
              <p style={{ color:t.onDarkMuted, lineHeight:1.8, marginBottom:32 }}>
                Planta única de <strong style={{ color:t.onDark }}>2 dormitórios</strong> com 1 suíte e <strong style={{ color:t.onDark }}>75 a 76 m²</strong> de área privativa. Hall de entrada com pé-direito duplo e living que se integra à sacada.
              </p>
              <div style={{ display:'flex', gap:32 }}>
                {[['2','Dorm.'],['1','Suíte'],['76','m² máx']].map(([n,l]) => (
                  <div key={l}>
                    <p style={{ fontFamily:t.display, fontSize:40, fontWeight:300, color:t.onDark, margin:0 }}>{n}</p>
                    <p style={{ fontSize:11, letterSpacing:'0.3em', textTransform:'uppercase', color:t.onDarkMuted, margin:0 }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
              <LeadCaptureButton slug="pineto-centro-criciuma-sc" construtora_slug="fontana" className="pn-cta"  propertyDisplayName="Pineto Residencial" />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding:'96px 32px', maxWidth:1100, margin:'0 auto' }}>
        <p className="pn-eyebrow" style={{ color:t.navy, marginBottom:20 }}>Por que escolher</p>
        <h2 className="pn-h2" style={{ color:t.ink, margin:'0 0 56px' }}>Diferenciais</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'28px 64px' }}>
          {DIFERENCIAIS.map((d,i) => (
            <div key={i} style={{ display:'flex', gap:24, alignItems:'flex-start' }}>
              <span style={{ fontFamily:t.display, fontSize:32, fontWeight:300, color:t.navy, lineHeight:1, flexShrink:0 }}>{String(i+1).padStart(2,'0')}</span>
              <p style={{ margin:0, fontSize:15, lineHeight:1.7, color:t.ink }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background:'#fff', padding:'96px 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p className="pn-eyebrow" style={{ color:t.navy, marginBottom:20 }}>Área de Lazer</p>
          <h2 className="pn-h2" style={{ color:t.ink, margin:'0 0 48px' }}>Infraestrutura Completa</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start' }}>
            <div>
              {AMENIDADES.map((a,i) => (
                <div key={i} className="pn-amen">
                  <span style={{ fontSize:14, color:t.ink }}>{a}</span>
                </div>
              ))}
            </div>
            <div style={{ position:'relative', aspectRatio:'4/3', overflow:'hidden', borderRadius:2 }}>
              <Image unoptimized src={IMG.hero} alt="Pineto Residencial lazer" fill sizes="(max-width:768px) 100vw, 50vw" style={{ objectFit:'cover' }} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding:'96px 32px', maxWidth:1100, margin:'0 auto' }}>
        <p className="pn-eyebrow" style={{ color:t.navy, marginBottom:20 }}>Localização</p>
        <h2 className="pn-h2" style={{ color:t.ink, margin:'0 0 12px' }}>Centro de Criciúma</h2>
        <p style={{ color:t.muted, marginBottom:40 }}>Rua Itajaí, 185 — Centro · Criciúma / SC</p>
        <div style={{ position:'relative', aspectRatio:'16/7', overflow:'hidden', borderRadius:2 }}>
          <Image unoptimized src={IMG.mapa} alt="Mapa localização Pineto Residencial Criciúma" fill sizes="(max-width:768px) 100vw, 1100px" style={{ objectFit:'cover' }} />
        </div>
      </section>

      <section style={{ background:t.dark, padding:'96px 32px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <p className="pn-eyebrow" style={{ color:t.onDarkMuted, marginBottom:20 }}>Financiamento</p>
          <h2 className="pn-h2" style={{ color:t.onDark, margin:'0 0 24px' }}>Direto com a Construtora</h2>
          <p style={{ color:t.onDarkMuted, fontSize:16, lineHeight:1.8, maxWidth:640, margin:'0 auto 48px' }}>
            O Pineto oferece financiamento direto com a Construtora Fontana — condições especiais, entrada facilitada e processo simplificado. Fale comigo para receber uma proposta personalizada.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="pn-cta" style={{ color:t.onDark, borderColor:'rgba(245,242,237,0.4)', fontSize:11, textTransform:'uppercase' }}>
            Consultar Condições
          </a>
        </div>
      </section>

      <section style={{ position:'relative', minHeight:480, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        <Image unoptimized src={IMG.hero2} alt="Pineto Residencial Criciúma" fill sizes="100vw" style={{ objectFit:'cover', objectPosition:'center' }} />
        <div style={{ position:'absolute', inset:0, background:'rgba(13,27,42,0.70)' }} />
        <div style={{ position:'relative', textAlign:'center', padding:'0 32px' }}>
          <h2 className="pn-h2" style={{ color:'#fff', margin:'0 0 16px' }}>Pineto Residencial</h2>
          <p style={{ color:'rgba(255,255,255,0.75)', marginBottom:40, fontFamily:t.serif, fontStyle:'italic', fontSize:18 }}>Preço sob consulta · Centro · Criciúma / SC</p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="pn-cta" style={{ color:'#fff', borderColor:'rgba(255,255,255,0.6)', fontSize:11, textTransform:'uppercase' }}>
            Falar com Stiven Allan
          </a>
        </div>
      </section>

      <footer style={{ background:t.navyDark, padding:'48px 32px', textAlign:'center' }}>
        <p style={{ color:t.onDarkMuted, fontSize:12, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Stiven Allan</p>
        <p style={{ color:t.onDarkMuted, fontSize:11, margin:'0 0 4px' }}>CRECI 60.275</p>
        <p style={{ color:t.onDarkMuted, fontSize:11, margin:0 }}>Criciúma · SC</p>
        <div style={{ marginTop:24 }}>
          <Link href="/" style={{ color:t.onDarkMuted, fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', textDecoration:'none' }}>← Todos os Empreendimentos</Link>
        </div>
      </footer>

      <a href={WPP} target="_blank" rel="noopener noreferrer" className="pn-wa" aria-label="WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.528 5.855L.057 23.117a.75.75 0 0 0 .917.913l5.352-1.483A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.952 9.952 0 0 1-5.127-1.416l-.367-.217-3.785 1.048 1.015-3.7-.239-.381A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>
      {/* SEO FAQ */}
      <PropertyFAQ items={[{"pergunta":"Como funciona o financiamento direto do Pineto Residencial?","resposta":"Entrada de 20%, saldo em até 72 parcelas mensais e 6 reforços anuais (cada reforço equivale a 5 parcelas mensais), com correção pelo CUB/SC durante a obra. Sem análise de banco."},{"pergunta":"Qual a previsão de entrega do Pineto Residencial?","resposta":"A previsão de entrega é novembro de 2029, em Centro, Criciúma/SC."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Sim. Além do financiamento direto com a construtora, é possível optar por financiamento bancário. Fale com o Stiven pelo WhatsApp para simular as duas opções."},{"pergunta":"Onde fica o Pineto Residencial?","resposta":"O Pineto Residencial está localizado na Rua Itajaí, 185, no Centro de Criciúma/SC."},{"pergunta":"Quais as plantas e metragens disponíveis?","resposta":"O empreendimento oferece apartamentos com 2 dormitórios (1 suíte), de 75 a 76 m² privativos, com academia, coworking e áreas de lazer."}]} accent="#3D5C38" />
      <RelatedProperties atualSlug="pineto-centro-criciuma-sc" cidade="Criciúma" />

    </main>
  )
}
