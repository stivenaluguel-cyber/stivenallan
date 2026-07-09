import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import GalleryWithLightbox from './gallery-lightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

const WPP = "https://wa.me/5548991642332?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Villammare%20Residencial%20em%20Balne%C3%A1rio%20Rinc%C3%A3o."

const t = {
  bg: '#F4F6F8', ink: '#1A1A1A', navy: '#1A3A5C', navyDark: '#0D2039',
  muted: '#6B6B6B', dark: '#091828',
  onDark: '#F4F6F8', onDarkMuted: 'rgba(244,246,248,0.65)',
  display: "'Playfair Display', Georgia, serif",
  serif: "Georgia, serif",
  body: "'Inter', system-ui, sans-serif"
}

const CDN = 'https://estilofontana.com.br/images/empreendimento/slideshows/'
const D = 'https://lh3.googleusercontent.com/d/'

const IMG = {
  hero: CDN + 'villammare-residencial-68ff86c8ba6ce.jpg',
  hero2: CDN + 'villammare-residencial-68ff86cbcd473.jpg',
  fotomont: D + '1QrO_PSauK4kVuW09ybFuYQU3ld123-Lm',
}

const GALERIA = [
  { src: D+'1Za3ySDHQ7ATPR4LC7Oap8JTQkpZw8_9V', alt: 'Fachada Angular Villammare Balneário Rincão', label: 'Fachada Angular' },
  { src: D+'1xw1KBEiOP9YNaZPEfCaqOG0pPcHWrfWL', alt: 'Fachada Frontal Villammare Balneário Rincão', label: 'Fachada Frontal' },
  { src: D+'1gRjiv9hbdTFXA1P6x8YVIQF-AeoNTeYY', alt: 'Vista aerea Villammare Balneário Rincão', label: 'Vista Aerea' },
  { src: D+'13pJY132EO7r7M-LhNWu1NTvPWWHDj_7R', alt: 'Living Villammare Residencial', label: 'Living Integrado' },
  { src: D+'1iNzubghH01mMk-UZFIHfWp9mj105tgR9', alt: 'Suite Master Villammare Residencial', label: 'Suite Master' },
  { src: D+'1majsObnc_JPIyALmPj8JfwziIYLwTeB8', alt: 'Sacada Villammare Balneário Rincão', label: 'Sacada com Vista' },
  { src: D+'1QJ57JHgyLwUdsdx4DRsvDydMIFFxr76h', alt: 'Salao de Festas Villammare', label: 'Salao de Festas' },
  { src: D+'1WXRYSvnWTcuDulZu11fjOxSuriNjgbb0', alt: 'Hall de Entrada Villammare', label: 'Hall de Entrada' },
  { src: D+'1UCviOdRGtl1lXT2QEgOzChrPGT7RG5gR', alt: 'Acesso Principal Villammare', label: 'Acesso Principal' },
]

const AMENIDADES = [
  'Salao de festas com living integrado',
  'Sacada com churrasqueira a carvao e guarda-corpo em vidro',
  '2 elevadores',
  'Hall de entrada sofisticado',
  'Fechadura digital',
  'Persianas automatizadas',
  'Manta acustica entre pavimentos',
  'Porcelanato retificado',
  'Garagem com pintura epoxi',
  'Espera para carregador de carro eletrico',
  'Sistema de cameras 24h',
  'Lavabo e tubulacao para agua quente',
]

const DIFERENCIAIS = [
  '4 dormitorios - 2 suites e 2 demi suites de alto padrao',
  '172 a 275 m2 de area privativa com plantas flexiveis',
  'Sacada com churrasqueira e guarda-corpo em vidro com vista para o mar',
  'Living integrado em conceito aberto - espaco e fluidez',
  'Acabamentos premium: porcelanato, fechadura digital e persianas automatizadas',
  'A passos da praia - Balneário Rincão, o litoral mais exclusivo de SC',
  'Construtora Fontana - solidez e qualidade comprovadas',
  'Financiamento direto com a Construtora Fontana',
]

export const metadata: Metadata = {
  title: 'Villammare Residencial | Apartamentos em Balneário Rincão SC | Fontana',
  description: 'Villammare Residencial: apartamentos de 4 dormitorios (2 suites + 2 demi suites), 172 a 275 m2, a passos da praia em Balneário Rincão/SC. Sacada com vista para o mar e financiamento direto.',
  alternates: { canonical: SITE_URL + '/empreendimento/fontana/villammare-residencial-balneario-rincao-sc' },
  openGraph: {
    title: 'Villammare Residencial | Balneário Rincão SC | Stiven Allan',
    description: '4 dorms (2 suites + 2 demi suites) - 172-275 m2 - Vista para o mar - Balneário Rincão/SC.',
    url: SITE_URL + '/empreendimento/fontana/villammare-residencial-balneario-rincao-sc',
    images: [{ url: CDN+'villammare-residencial-68ff86c8ba6ce.jpg', width: 1200, height: 630, alt: 'Villammare Residencial' }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Villammare Residencial | Balneário Rincão SC | Stiven Allan', description: '4 dorms - 172-275 m2 - A beira-mar - Balneário Rincão' },
  robots: { index: true, follow: true },
}

export default function Page() {
  return (
    <main style={{ fontFamily: t.body, background: t.bg, color: t.ink, overflowX: 'hidden' }}>
      <PropertySchema
        nome="Villammare Residencial"
        slug="villammare-residencial-balneario-rincao-sc"
        construtora_slug="fontana"
        cidade="Balneário Rincão"
        uf="SC"
        bairro="Centro"
        descricao="Apartamentos de 4 dormitorios (2 suites e 2 demi suites), 172 a 275 m2, em Balneário Rincão/SC, a passos da praia."
        imagem={CDN+'villammare-residencial-68ff86c8ba6ce.jpg'}
        faq={[
          {pergunta:"Como funciona o financiamento direto do Villammare Residencial?",resposta:"Entrada de 20%, saldo em ate 72 parcelas mensais e 6 reforos anuais (cada reforo = 5 mensais), correcao pelo CUB/SC durante a obra. Entrega prevista setembro de 2029. Sem banco."},
          {pergunta:"Qual a previsao de entrega do Villammare Residencial?",resposta:"Previsao de entrega setembro de 2029, em Balneário Rincão/SC."},
          {pergunta:"Quais sao as plantas do Villammare Residencial?",resposta:"4 dormitorios (2 suites e 2 demi suites), de 172 a 275 m2 privativos, a passos da praia em Balneário Rincão/SC."},
          {pergunta:"O Villammare tem vista para o mar?",resposta:"Sim. O Villammare fica a passos da praia em Balneário Rincão com sacada e vista privilegiada para o mar."},
          {pergunta:"Posso usar FGTS ou financiamento bancario no Villammare?",resposta:"Sim. Alem do financiamento direto Fontana, e possivel financiamento bancario ou FGTS. Consulte Stiven pelo WhatsApp."},
        ]}
      />
      <style>{`
        html { scroll-behavior: smooth; }
        .vm-eyebrow { font-size:11px; letter-spacing:0.42em; text-transform:uppercase; }
        .vm-h1 { font-family:${t.display}; font-weight:300; text-transform:uppercase; letter-spacing:0.14em; }
        .vm-h2 { font-family:${t.display}; font-weight:300; text-transform:uppercase; font-size:clamp(26px,4vw,46px); }
        .vm-cta { display:inline-block; letter-spacing:0.3em; border:1px solid; padding:16px 34px; text-decoration:none; text-transform:uppercase; font-size:11px; }
        .vm-amen { display:flex; align-items:center; gap:12px; padding:14px 0; border-bottom:1px solid rgba(0,0,0,0.08); }
        .vm-amen::before { content:''; width:6px; height:6px; background:${t.navy}; border-radius:50%; flex-shrink:0; }
        .vm-wa { position:fixed; right:20px; bottom:20px; width:56px; height:56px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(0,0,0,0.25); z-index:200; }
      `}</style>

      <header style={{ position:'absolute', top:0, left:0, right:0, zIndex:50, padding:'24px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/" style={{ color:'#fff', textDecoration:'none', fontFamily:t.display, fontWeight:300, fontSize:18, letterSpacing:'0.12em' }}>STIVEN ALLAN</Link>
        <nav style={{ display:'flex', gap:32 }}>
          <Link href="/#empreendimentos" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:12, letterSpacing:'0.24em', textTransform:'uppercase' }}>Empreendimentos</Link>
          <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:12, letterSpacing:'0.24em', textTransform:'uppercase' }}>Contato</a>
        </nav>
      </header>

      <section style={{ position:'relative', height:'100vh', minHeight:560, display:'flex', alignItems:'flex-end' }}>
        <Image src={IMG.hero} alt="Villammare Residencial - Balneário Rincão SC, a beira-mar" fill priority sizes="100vw" style={{ objectFit:'cover', objectPosition:'center' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(9,24,40,0.78) 0%, rgba(9,24,40,0.20) 55%, transparent 100%)' }} />
        <div style={{ position:'relative', padding:'0 32px 64px', maxWidth:800 }}>
          <p className="vm-eyebrow" style={{ color:'rgba(255,255,255,0.7)', marginBottom:16 }}>Balneário Rincão / SC</p>
          <h1 className="vm-h1" style={{ color:'#fff', fontSize:'clamp(28px,4.5vw,60px)', lineHeight:1.1, margin:'0 0 16px' }}>Villammare<br/>Residencial</h1>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'clamp(15px,2vw,18px)', fontFamily:t.serif, fontStyle:'italic', marginBottom:36 }}>
            Onde o mar habita, estar perto e o melhor destino.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="vm-cta" style={{ color:'#fff', borderColor:'rgba(255,255,255,0.6)' }}>
            Quero Saber Mais
          </a>
          <LeadCaptureButton slug="villammare-residencial-balneario-rincao-sc" construtora_slug="fontana" propertyDisplayName="Villammare Residencial" />
        </div>
      </section>

      <section style={{ padding:'96px 32px', maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
        <div>
          <p className="vm-eyebrow" style={{ color:t.navy, marginBottom:20 }}>O Empreendimento</p>
          <h2 className="vm-h2" style={{ color:t.ink, margin:'0 0 28px' }}>Elegancia Singular<br/>A Beira-Mar</h2>
          <p style={{ color:t.muted, lineHeight:1.8, marginBottom:24 }}>
            O Villammare Residencial redefine o padrao do morar a beira-mar em Balneário Rincão. Com <strong>4 dormitorios</strong>, 2 suites e 2 demi suites, em plantas de <strong>172 a 275 m2</strong>, cada detalhe foi pensado para proporcionar conforto, elegancia e a incomparavel experiencia de viver com o mar como vizinho.
          </p>
          <ul style={{ listStyle:'none', padding:0, margin:'0 0 36px', display:'flex', flexDirection:'column', gap:10 }}>
            {['4 dormitorios - 2 suites + 2 demi suites','172 a 275 m2 de area privativa','Sacada com churrasqueira e vista para o mar','Living integrado em conceito aberto','2 elevadores - Fechadura digital','A passos da praia de Balneário Rincão'].map((f,i) => (
              <li key={i} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:t.ink }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:t.navy, flexShrink:0, display:'inline-block' }} />
                {f}
              </li>
            ))}
          </ul>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="vm-cta" style={{ color:t.navy, borderColor:t.navy }}>
            Consultar Condicoes
          </a>
        </div>
        <div style={{ position:'relative', aspectRatio:'3/4', borderRadius:2, overflow:'hidden' }}>
          <Image src={IMG.hero2} alt="Villammare Residencial fachada frontal" fill sizes="(max-width:768px) 100vw, 50vw" style={{ objectFit:'cover' }} />
        </div>
      </section>

      <section style={{ background:'#fff', padding:'96px 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p className="vm-eyebrow" style={{ color:t.navy, marginBottom:20 }}>Galeria</p>
          <h2 className="vm-h2" style={{ color:t.ink, margin:'0 0 48px' }}>Perspectivas</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            <GalleryWithLightbox galeria={GALERIA} prefix="vm" gradient="rgba(9,24,40,0.6)" />
          </div>
        </div>
      </section>

      <section style={{ background:t.dark, padding:'96px 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p className="vm-eyebrow" style={{ color:t.onDarkMuted, marginBottom:20 }}>Tipologias</p>
          <h2 className="vm-h2" style={{ color:t.onDark, margin:'0 0 16px' }}>As Residencias</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:48, alignItems:'center' }}>
            <div>
              <p style={{ color:t.onDarkMuted, lineHeight:1.8, marginBottom:32 }}>
                Duas opcoes de plantas de <strong style={{ color:t.onDark }}>172 a 275 m2</strong> com <strong style={{ color:t.onDark }}>4 dormitorios</strong>, sendo 2 suites completas e 2 demi suites, living integrado e sacada gourmet com vista privilegiada.
              </p>
              <div style={{ display:'flex', gap:40, marginBottom:40 }}>
                {[['4','Dorm.'],['2','Suites'],['275','m2 max']].map(([n,l]) => (
                  <div key={l}>
                    <p style={{ fontFamily:t.display, fontSize:40, fontWeight:300, color:t.onDark, margin:0, lineHeight:1 }}>{n}</p>
                    <p style={{ fontSize:11, letterSpacing:'0.3em', textTransform:'uppercase', color:t.onDarkMuted, margin:'6px 0 0' }}>{l}</p>
                  </div>
                ))}
              </div>
              <a href={WPP} target="_blank" rel="noopener noreferrer" className="vm-cta" style={{ color:t.onDark, borderColor:'rgba(244,246,248,0.4)' }}>
                Ver Plantas
              </a>
            </div>
            <div style={{ position:'relative', aspectRatio:'4/3', overflow:'hidden', borderRadius:2 }}>
              <Image src={D+'1fUHaA4u5lKVgpxEAJ_eQtBCUVDYkT_PU'} alt="Apartamento tipo Villammare" fill sizes="(max-width:768px) 100vw, 50vw" style={{ objectFit:'cover' }} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding:'96px 32px', maxWidth:1100, margin:'0 auto' }}>
        <p className="vm-eyebrow" style={{ color:t.navy, marginBottom:20 }}>Por que escolher</p>
        <h2 className="vm-h2" style={{ color:t.ink, margin:'0 0 56px' }}>Diferenciais</h2>
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
          <p className="vm-eyebrow" style={{ color:t.navy, marginBottom:20 }}>Acabamentos e Lazer</p>
          <h2 className="vm-h2" style={{ color:t.ink, margin:'0 0 48px' }}>Alto Padrao em Cada Detalhe</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start' }}>
            <div>
              {AMENIDADES.map((a,i) => (
                <div key={i} className="vm-amen">
                  <span style={{ fontSize:14, color:t.ink }}>{a}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[D+'1BvuDuEqG85Hpx-7pPJAdmW0TrTon1MaL',D+'1n7iquXjXrDP9FK-6xqmdWRuqB--vpUsr',D+'1kTxiR4Zbz5ttX73gnNq31-eMjkQEztYW',D+'1AeibHujGTQS_kPO_orU3manrdh42qYzS'].map((src,i) => (
                <div key={i} style={{ position:'relative', aspectRatio:'1', overflow:'hidden', borderRadius:2 }}>
                  <Image src={src} alt={"Acabamento Villammare " + (i+1)} fill sizes="300px" style={{ objectFit:'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding:'96px 32px', maxWidth:1100, margin:'0 auto' }}>
        <p className="vm-eyebrow" style={{ color:t.navy, marginBottom:20 }}>Localizacao</p>
        <h2 className="vm-h2" style={{ color:t.ink, margin:'0 0 12px' }}>Balneário Rincão - SC</h2>
        <p style={{ color:t.muted, marginBottom:40 }}>Rua Manoel Jose Mage, No 15 - esquina com Av. Waldemar Carlos Petrini - Balneário Rincão/SC</p>
        <div style={{ position:'relative', aspectRatio:'16/7', overflow:'hidden', borderRadius:2 }}>
          <Image src={IMG.fotomont} alt="Localizacao Villammare Balneário Rincão" fill sizes="(max-width:768px) 100vw, 1100px" style={{ objectFit:'cover' }} />
        </div>
      </section>

      <section style={{ background:t.dark, padding:'96px 32px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <p className="vm-eyebrow" style={{ color:t.onDarkMuted, marginBottom:20 }}>Financiamento</p>
          <h2 className="vm-h2" style={{ color:t.onDark, margin:'0 0 24px' }}>Direto com a Construtora</h2>
          <p style={{ color:t.onDarkMuted, fontSize:16, lineHeight:1.8, maxWidth:640, margin:'0 auto 48px' }}>
            O Villammare oferece financiamento direto com a Construtora Fontana - condicoes especiais, entrada facilitada e processo simplificado. Fale comigo para uma proposta personalizada.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="vm-cta" style={{ color:t.onDark, borderColor:'rgba(244,246,248,0.4)' }}>
            Consultar Condicoes
          </a>
        </div>
      </section>

      <section style={{ position:'relative', minHeight:480, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        <Image src={IMG.hero} alt="Villammare Residencial Balneário Rincão" fill sizes="100vw" style={{ objectFit:'cover' }} />
        <div style={{ position:'absolute', inset:0, background:'rgba(9,24,40,0.72)' }} />
        <div style={{ position:'relative', textAlign:'center', padding:'0 32px' }}>
          <h2 className="vm-h2" style={{ color:'#fff', margin:'0 0 16px' }}>Villammare Residencial</h2>
          <p style={{ color:'rgba(255,255,255,0.75)', marginBottom:40, fontFamily:t.serif, fontStyle:'italic', fontSize:18 }}>Preco sob consulta - Balneário Rincão / SC</p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="vm-cta" style={{ color:'#fff', borderColor:'rgba(255,255,255,0.6)' }}>
            Falar com Stiven Allan
          </a>
        </div>
      </section>

      <footer style={{ background:t.navyDark, padding:'48px 32px', textAlign:'center' }}>
        <p style={{ color:t.onDarkMuted, fontSize:12, letterSpacing:'0.2em', textTransform:'uppercase', margin:'0 0 8px' }}>Stiven Allan</p>
        <p style={{ color:t.onDarkMuted, fontSize:11, margin:'0 0 4px' }}>CRECI 60.275</p>
        <p style={{ color:t.onDarkMuted, fontSize:11, margin:0 }}>Balneário Rincão - SC</p>
        <div style={{ marginTop:24 }}>
          <Link href="/" style={{ color:t.onDarkMuted, fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', textDecoration:'none' }}>Todos os Empreendimentos</Link>
        </div>
      </footer>

      <a href={WPP} target="_blank" rel="noopener noreferrer" className="vm-wa" aria-label="WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.528 5.855L.057 23.117a.75.75 0 0 0 .917.913l5.352-1.483A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.952 9.952 0 0 1-5.127-1.416l-.367-.217-3.785 1.048 1.015-3.7-.239-.381A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>

      <PropertyFAQ items={[
        {pergunta:"Como funciona o financiamento direto do Villammare Residencial?",resposta:"Entrada de 20%, saldo em ate 72 parcelas mensais e 6 reforos anuais (cada reforo = 5 mensais), correcao pelo CUB/SC durante a obra. Entrega prevista setembro de 2029. Sem banco."},
        {pergunta:"Qual a previsao de entrega do Villammare Residencial?",resposta:"Previsao de entrega setembro de 2029, em Balneário Rincão/SC."},
        {pergunta:"Quais sao as plantas do Villammare Residencial?",resposta:"4 dormitorios (2 suites e 2 demi suites), de 172 a 275 m2 privativos, a passos da praia em Balneário Rincão/SC."},
        {pergunta:"O Villammare tem vista para o mar?",resposta:"Sim. O Villammare fica a passos da praia em Balneário Rincão com sacada e vista privilegiada para o mar."},
        {pergunta:"Posso usar FGTS ou financiamento bancario no Villammare?",resposta:"Sim. Alem do financiamento direto Fontana, e possivel financiamento bancario ou FGTS. Consulte Stiven pelo WhatsApp."},
      ]} accent="#1B3A4B" />

      <RelatedProperties atualSlug="villammare-residencial-balneario-rincao-sc" cidade="Balneário Rincão" />
    </main>
  )
}
