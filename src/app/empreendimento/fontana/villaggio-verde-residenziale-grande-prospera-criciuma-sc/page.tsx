import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import GalleryWithLightbox from './gallery-lightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

const WPP = "https://wa.me/5548991642332?text=Olá!%20Tenho%20interesse%20no%20Villaggio%20Verde%20Residenziale%20em%20Criciúma."

const t = {
  bg: '#F5F2ED', ink: '#1A1A1A', green: '#2D4A2D', greenDark: '#1A2E1A',
  muted: '#6B6B6B', line: 'rgba(0,0,0,0.10)', dark: '#0D1A0D',
  onDark: '#F5F2ED', onDarkMuted: 'rgba(245,242,237,0.65)',
  display: "'Playfair Display', Georgia, serif",
  serif: "Georgia, serif",
  body: "'Inter', system-ui, sans-serif"
}

const CDN = 'https://estilofontana.com.br/images/empreendimento/slideshows/'
const D = 'https://lh3.googleusercontent.com/d/'

const IMG = {
  hero:  CDN + 'villaggio-verde-residenziale-646388473855e.JPG',
  hero2: CDN + 'villaggio-verde-residenziale-646388324deac.JPG',
  dsc:   'https://estilofontana.com.br/images/2020/10/22/dsc-5478-5f91b72cb327a.jpg',
}

const GALERIA = [
  { src: D+'1IPVwy1P0yt1YirjI2I4OeqqRWjD77o9g', alt: 'Fachada Villaggio Verde Criciúma', label: 'Fachada' },
  { src: D+'1VR_5kgUR7SUsV6zixG_IggiZynJoZX3y', alt: 'Entrada Villaggio Verde Criciúma', label: 'Pórtico de Entrada' },
  { src: D+'1rjGZslaT-wjpKdQqqM8wGL9ts4JH8FTt', alt: 'área externa Villaggio Verde', label: 'área Externa' },
  { src: D+'1Xx8WmFPfoFvDHg7awMFaABF4Yk0-IA8d', alt: 'Piscina Villaggio Verde Criciúma', label: 'Piscina' },
  { src: D+'1-BkdqpEBJBKnahqWNpg3BFI9fm4nPOER', alt: 'Piscina e lazer Villaggio Verde', label: 'Lazer' },
  { src: D+'1GfPPoEM8XUVjHIlwQ8h6CWOQMtdfhmIA', alt: 'Salão de festas Villaggio Verde', label: 'Salão de Festas' },
  { src: D+'1F-w1hM0V-6yFqJEmwbK0TO0Hu5TBNm0l', alt: 'Salão de festas interior Villaggio Verde', label: 'Salão Interior' },
  { src: D+'1eUsMkF8wvpKMuQ2clpca4PYi0MLQkMom', alt: 'área da piscina Villaggio Verde', label: 'área da Piscina' },
  { src: D+'1jFLGK8EQ3dy4H4gQf3r-Dv85NTFX_Wok', alt: 'Espaço de eventos Villaggio Verde', label: 'Espaço de Eventos' },
]

const AMENIDADES = [
  'Piscina e piscina infantil', 'Academia', 'Playground',
  'Campo de futebol', 'Minicampo de golfe', 'Quadras de tênis',
  'Sala de jogos', 'Brinquedoteca', 'Salão de festas',
  'Pórtico de entrada monumental', 'Guarita 24h', 'Vestiarío',
]

const DIFERENCIAIS = [
  'Terrenos de 794 a 1.038 m² — espaço real para sua casa ideal',
  '12.000 m² de área de lazer exclusiva dos moradores',
  'Grande Próspera · Criciúma — localização privilegiada',
  'Condomínio fechado com segurança e portaria 24h',
  'Infraestrutura completa: academia, piscina, quadras e mais',
  'Campo de golfe e campo de futebol no próprio condomínio',
  'Construtora Fontana — solidez e qualidade comprovadas',
  'Financiamento direto com a Construtora Fontana',
]

export const metadata: Metadata = {
  title: 'Villaggio Verde Residenziale | Terrenos em Criciúma SC | Fontana',
  description: 'Villaggio Verde Residenziale: condomínio fechado de terrenos de 794 a 1.038 m² na Grande Próspera, Criciúma/SC. 12.000 m² de lazer, academia, piscina, campo de golfe e financiamento direto.',
  alternates: { canonical: `${SITE_URL}/empreendimento/fontana/villaggio-verde-residenziale-grande-prospera-criciuma-sc` },
  openGraph: {
    title: 'Villaggio Verde Residenziale | Condomínio em Criciúma SC | Stiven Allan',
    description: 'Terrenos de 794—1.038 m² em condomínio fechado. 12.000 m² de lazer exclusivo. Grande Próspera · Criciúma.',
    url: `${SITE_URL}/empreendimento/fontana/villaggio-verde-residenziale-grande-prospera-criciuma-sc`,
    images: [{ url: CDN+'villaggio-verde-residenziale-646388473855e.JPG', width: 1200, height: 630, alt: 'Villaggio Verde Residenziale' }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Villaggio Verde Residenziale | Criciúma SC | Stiven Allan', description: 'Terrenos 794—1.038 m² · Condomínio fechado · Grande Próspera · Criciúma' },
  robots: { index: true, follow: true },
}

export default function Page() {
  return (
    <main style={{ fontFamily: t.body, background: t.bg, color: t.ink, overflowX: 'hidden' }}>
      <PropertySchema
        nome="Villaggio Verde Residenziale"
        slug="villaggio-verde-residenziale-grande-prospera-criciuma-sc"
        construtora_slug="fontana"
        cidade="Criciuma"
        uf="SC"
        bairro="Grande Prospera"
        descricao="Condominio fechado de terrenos de 794 a 1.038 m2 na Grande Prospera, Criciuma/SC."
        imagem={CDN+'villaggio-verde-residenziale-646388473855e.JPG'}
        faq={[
          {pergunta:"Como funciona o financiamento do Villaggio Verde?",resposta:"Entrada de 25,3%, saldo em ate 72 parcelas mensais e 6 reforos anuais, correcao pelo IPCA. Sem banco."},
          {pergunta:"Quais os tamanhos de terreno no Villaggio Verde?",resposta:"Terrenos de 794 a 1.038 m2 em condominio fechado na Grande Prospera, Criciuma/SC."},
          {pergunta:"O que inclui a area de lazer do Villaggio Verde?",resposta:"12.000 m2 de lazer com academia, piscina, campo de golfe e mais."},
          {pergunta:"Qual a localizacao do Villaggio Verde?",resposta:"Rodovia Leonardo Bialeck, 525, Grande Prospera, Criciuma/SC."},
          {pergunta:"Posso construir qualquer projeto no terreno?",resposta:"Ha regulamento construtivo. Consulte Stiven pelo WhatsApp."},
        ]}
      />
      <style>{`
        html { scroll-behavior: smooth; }
        .vv-eyebrow { font-size:11px; letter-spacing:0.42em; text-transform:uppercase; }
        .vv-h1 { font-family:${t.display}; font-weight:300; text-transform:uppercase; letter-spacing:0.14em; }
        .vv-h2 { font-family:${t.display}; font-weight:300; text-transform:uppercase; font-size:clamp(26px,4vw,46px); }
        .vv-cta { display:inline-block; letter-spacing:0.3em; border:1px solid; padding:16px 34px; text-decoration:none; text-transform:uppercase; font-size:11px; }
        .vv-amen { display:flex; align-items:center; gap:12px; padding:14px 0; border-bottom:1px solid rgba(0,0,0,0.08); }
        .vv-amen::before { content:''; width:6px; height:6px; background:${t.green}; border-radius:50%; flex-shrink:0; }
        .vv-wa { position:fixed; right:20px; bottom:20px; width:56px; height:56px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(0,0,0,0.25); z-index:200; }
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
        <Image src={IMG.hero} alt="Villaggio Verde Residenziale — Grande Próspera, Criciúma SC" fill priority sizes="100vw" style={{ objectFit:'cover', objectPosition:'center' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(13,26,13,0.75) 0%, rgba(13,26,13,0.18) 55%, transparent 100%)' }} />
        <div style={{ position:'relative', padding:'0 32px 64px', maxWidth:800 }}>
          <p className="vv-eyebrow" style={{ color:'rgba(255,255,255,0.7)', marginBottom:16 }}>Grande Próspera · Criciúma / SC</p>
          <h1 className="vv-h1" style={{ color:'#fff', fontSize:'clamp(28px,4.5vw,60px)', lineHeight:1.1, margin:'0 0 16px' }}>Villaggio Verde<br/>Residenziale</h1>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'clamp(15px,2vw,18px)', fontFamily:t.serif, fontStyle:'italic', marginBottom:36 }}>
            Viva seu hobby no jardim da sua casa.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="vv-cta" style={{ color:'#fff', borderColor:'rgba(255,255,255,0.6)' }}>
            Quero Saber Mais
          </a>
          <LeadCaptureButton slug="villaggio-verde-residenziale-grande-prospera-criciuma-sc" construtora_slug="fontana"  propertyDisplayName="Villaggio Verde Residenziale" />
        </div>
      </section>

      <section style={{ padding:'96px 32px', maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
        <div>
          <p className="vv-eyebrow" style={{ color:t.green, marginBottom:20 }}>O Condomínio</p>
          <h2 className="vv-h2" style={{ color:t.ink, margin:'0 0 28px' }}>Um Estilo de Vida Exclusivo</h2>
          <p style={{ color:t.muted, lineHeight:1.8, marginBottom:24 }}>
            O Villaggio Verde Residenziale é um <strong>condomínio fechado de terrenos</strong> de <strong>794 a 1.038 m²</strong> na Grande Próspera, Criciúma. Com <strong>12.000 m² de área de lazer</strong>, proporciona um ambiente de exclusividade, segurança e qualidade de vida para você construir a casa dos seus sonhos.
          </p>
          <ul style={{ listStyle:'none', padding:0, margin:'0 0 36px', display:'flex', flexDirection:'column', gap:10 }}>
            {['Terrenos de 794 a 1.038 m²','12.000 m² de área de lazer exclusiva','Condomínio fechado com segurança 24h','Campo de golfe e campo de futebol','Piscina, academia, quadras de tênis','Grande Próspera — localização privilegiada'].map((f,i) => (
              <li key={i} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:t.ink }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:t.green, flexShrink:0, display:'inline-block' }} />
                {f}
              </li>
            ))}
          </ul>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="vv-cta" style={{ color:t.green, borderColor:t.green }}>
            Consultar Condições
          </a>
        </div>
        <div style={{ position:'relative', aspectRatio:'3/4', borderRadius:2, overflow:'hidden' }}>
          <Image src={IMG.hero2} alt="Vista aérea Villaggio Verde Criciúma" fill sizes="(max-width:768px) 100vw, 50vw" style={{ objectFit:'cover' }} />
        </div>
      </section>

      <section style={{ background:'#fff', padding:'96px 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p className="vv-eyebrow" style={{ color:t.green, marginBottom:20 }}>Galeria</p>
          <h2 className="vv-h2" style={{ color:t.ink, margin:'0 0 48px' }}>Conheça o Villaggio Verde</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            <GalleryWithLightbox galeria={GALERIA} prefix="vv" gradient="rgba(13,26,13,0.6)" />
          </div>
        </div>
      </section>

      <section style={{ background:t.dark, padding:'96px 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p className="vv-eyebrow" style={{ color:t.onDarkMuted, marginBottom:20 }}>Seus Terrenos</p>
          <h2 className="vv-h2" style={{ color:t.onDark, margin:'0 0 16px' }}>Espaço para Sua Casa Ideal</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:48, alignItems:'center' }}>
            <div>
              <p style={{ color:t.onDarkMuted, lineHeight:1.8, marginBottom:32 }}>
                Terrenos espaçosos de <strong style={{ color:t.onDark }}>794 a 1.038 m²</strong> em condomínio fechado, com toda a infraestrutura pronta para você construir exatamente a casa que sempre imaginou, em um ambiente seguro e exclusivo.
              </p>
              <div style={{ display:'flex', gap:48, marginBottom:40 }}>
                {[['794','m² mín'],['1.038','m² máx'],['12k','m² lazer']].map(([n,l]) => (
                  <div key={l}>
                    <p style={{ fontFamily:t.display, fontSize:40, fontWeight:300, color:t.onDark, margin:0, lineHeight:1 }}>{n}</p>
                    <p style={{ fontSize:11, letterSpacing:'0.3em', textTransform:'uppercase', color:t.onDarkMuted, margin:'6px 0 0' }}>{l}</p>
                  </div>
                ))}
              </div>
              <a href={WPP} target="_blank" rel="noopener noreferrer" className="vv-cta" style={{ color:t.onDark, borderColor:'rgba(245,242,237,0.4)' }}>
                Falar com Stiven Allan
              </a>
            </div>
            <div style={{ position:'relative', aspectRatio:'4/3', overflow:'hidden', borderRadius:2 }}>
              <Image src={IMG.dsc} alt="área do Villaggio Verde Criciúma" fill sizes="(max-width:768px) 100vw, 50vw" style={{ objectFit:'cover' }} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding:'96px 32px', maxWidth:1100, margin:'0 auto' }}>
        <p className="vv-eyebrow" style={{ color:t.green, marginBottom:20 }}>Por que escolher</p>
        <h2 className="vv-h2" style={{ color:t.ink, margin:'0 0 56px' }}>Diferenciais</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'28px 64px' }}>
          {DIFERENCIAIS.map((d,i) => (
            <div key={i} style={{ display:'flex', gap:24, alignItems:'flex-start' }}>
              <span style={{ fontFamily:t.display, fontSize:32, fontWeight:300, color:t.green, lineHeight:1, flexShrink:0 }}>{String(i+1).padStart(2,'0')}</span>
              <p style={{ margin:0, fontSize:15, lineHeight:1.7, color:t.ink }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background:'#fff', padding:'96px 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p className="vv-eyebrow" style={{ color:t.green, marginBottom:20 }}>área de Lazer</p>
          <h2 className="vv-h2" style={{ color:t.ink, margin:'0 0 12px' }}>12.000 m² de Infraestrutura</h2>
          <p style={{ color:t.muted, marginBottom:48, maxWidth:600 }}>Uma das maiores áreas de lazer de Criciúma em condomínio fechado — para você, sua família e seus amigos.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:48, alignItems:'start' }}>
            <div>
              {AMENIDADES.map((a,i) => (
                <div key={i} className="vv-amen">
                  <span style={{ fontSize:14, color:t.ink }}>{a}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ position:'relative', aspectRatio:'1', overflow:'hidden', borderRadius:2 }}>
                <Image src={D+'1qgCYyVJAt8xgVIwHolmchxxuOf-Z0HOW'} alt="Piscina Villaggio Verde" fill sizes="300px" style={{ objectFit:'cover' }} />
              </div>
              <div style={{ position:'relative', aspectRatio:'1', overflow:'hidden', borderRadius:2 }}>
                <Image src={D+'1S5u-pOdWNIBS6fYW4hsuax1Q5QoDagYp'} alt="Salão de festas Villaggio Verde" fill sizes="300px" style={{ objectFit:'cover' }} />
              </div>
              <div style={{ position:'relative', aspectRatio:'1', overflow:'hidden', borderRadius:2 }}>
                <Image src={D+'1Hs1b9dx7Z-hLuDMyHW6cj7-R9izbtJT6'} alt="Fachada Villaggio Verde" fill sizes="300px" style={{ objectFit:'cover' }} />
              </div>
              <div style={{ position:'relative', aspectRatio:'1', overflow:'hidden', borderRadius:2 }}>
                <Image src={D+'1jFLGK8EQ3dy4H4gQf3r-Dv85NTFX_Wok'} alt="Espaço de eventos Villaggio Verde" fill sizes="300px" style={{ objectFit:'cover' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding:'96px 32px', maxWidth:1100, margin:'0 auto' }}>
        <p className="vv-eyebrow" style={{ color:t.green, marginBottom:20 }}>Localização</p>
        <h2 className="vv-h2" style={{ color:t.ink, margin:'0 0 12px' }}>Grande Próspera · Criciúma</h2>
        <p style={{ color:t.muted, marginBottom:40 }}>Rodovia Leonardo Bialeck, 525 — Grande Próspera · Criciúma / SC</p>
        <div style={{ position:'relative', aspectRatio:'16/6', overflow:'hidden', borderRadius:2 }}>
          <Image src={IMG.hero} alt="Localização Villaggio Verde Criciúma" fill sizes="(max-width:768px) 100vw, 1100px" style={{ objectFit:'cover', objectPosition:'center 30%' }} />
          <div style={{ position:'absolute', inset:0, background:'rgba(13,26,13,0.35)' }} />
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <p style={{ color:'#fff', fontSize:'clamp(14px,2vw,18px)', letterSpacing:'0.15em', textTransform:'uppercase', fontFamily:t.display, fontWeight:300 }}>Rodovia Leonardo Bialeck, 525 · Criciúma/SC</p>
          </div>
        </div>
      </section>

      <section style={{ background:t.dark, padding:'96px 32px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <p className="vv-eyebrow" style={{ color:t.onDarkMuted, marginBottom:20 }}>Financiamento</p>
          <h2 className="vv-h2" style={{ color:t.onDark, margin:'0 0 24px' }}>Direto com a Construtora</h2>
          <p style={{ color:t.onDarkMuted, fontSize:16, lineHeight:1.8, maxWidth:640, margin:'0 auto 48px' }}>
            O Villaggio Verde oferece financiamento direto com a Construtora Fontana — condições especiais, entrada facilitada e processo sem burocracia. Fale comigo para uma proposta personalizada.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="vv-cta" style={{ color:t.onDark, borderColor:'rgba(245,242,237,0.4)' }}>
            Consultar Condições
          </a>
        </div>
      </section>

      <section style={{ position:'relative', minHeight:480, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        <Image src={IMG.hero2} alt="Villaggio Verde Residenziale Criciúma" fill sizes="100vw" style={{ objectFit:'cover', objectPosition:'center' }} />
        <div style={{ position:'absolute', inset:0, background:'rgba(13,26,13,0.72)' }} />
        <div style={{ position:'relative', textAlign:'center', padding:'0 32px' }}>
          <h2 className="vv-h2" style={{ color:'#fff', margin:'0 0 16px' }}>Villaggio Verde Residenziale</h2>
          <p style={{ color:'rgba(255,255,255,0.75)', marginBottom:40, fontFamily:t.serif, fontStyle:'italic', fontSize:18 }}>Preço sob consulta · Grande Próspera · Criciúma / SC</p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="vv-cta" style={{ color:'#fff', borderColor:'rgba(255,255,255,0.6)' }}>
            Falar com Stiven Allan
          </a>
        </div>
      </section>

      <footer style={{ background:t.greenDark, padding:'48px 32px', textAlign:'center' }}>
        <p style={{ color:t.onDarkMuted, fontSize:12, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Stiven Allan</p>
        <p style={{ color:t.onDarkMuted, fontSize:11, margin:'0 0 4px' }}>CRECI 60.275</p>
        <p style={{ color:t.onDarkMuted, fontSize:11, margin:0 }}>Criciúma · SC</p>
        <div style={{ marginTop:24 }}>
          <Link href="/" style={{ color:t.onDarkMuted, fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', textDecoration:'none' }}>← Todos os Empreendimentos</Link>
        </div>
      </footer>

      <a href={WPP} target="_blank" rel="noopener noreferrer" className="vv-wa" aria-label="WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.528 5.855L.057 23.117a.75.75 0 0 0 .917.913l5.352-1.483A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.952 9.952 0 0 1-5.127-1.416l-.367-.217-3.785 1.048 1.015-3.7-.239-.381A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>

      <PropertyFAQ items={[
        {pergunta:"Como funciona o financiamento do Villaggio Verde Residenziale?",resposta:"Entrada de 25,3%, saldo em até 72 parcelas mensais e 6 reforços anuais, correção pelo IPCA. Vencimentos nos dias 05, 10 ou 15 de cada mês. Negociação direta com a Fontana, sem banco."},
        {pergunta:"Quais os tamanhos de terreno disponíveis no Villaggio Verde?",resposta:"Terrenos de 794 a 1.038 m² em condomínio fechado na Grande Próspera, Criciúma/SC."},
        {pergunta:"O que inclui a área de lazer do Villaggio Verde?",resposta:"12.000 m² de lazer exclusivo com academia, piscina, campo de golfe e mais, dentro do condomínio fechado."},
        {pergunta:"Qual a localização do Villaggio Verde Residenziale?",resposta:"Rodovia Leonardo Bialeck, 525, Grande Próspera, Criciúma/SC — fácil acesso pela Av. do Estado."},
        {pergunta:"Posso construir o que quiser no terreno do Villaggio Verde?",resposta:"Há regulamento construtivo do condomínio. Consulte Stiven pelo WhatsApp para detalhes das diretrizes e aprovação de projetos."},
      ]} accent="#2D4A2D" />

      <RelatedProperties atualSlug="villaggio-verde-residenziale-grande-prospera-criciuma-sc" cidade="Criciúma" />
    </main>
  )
}
