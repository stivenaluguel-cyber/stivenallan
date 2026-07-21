import type { Metadata } from 'next'
import Image from 'next/image'
import { HeroImage } from '@/components/HeroImage'
import GalleryWithLightbox from './gallery-lightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'

export const metadata: Metadata = {
  title: 'Mar di Nizza Residencial | Mar Grosso Laguna SC',
  description: 'Mar di Nizza Residencial em Mar Grosso, Laguna/SC. 2 e 3 dormitórios (1 suíte), 65 a 92 m² privativos. Salão de Festas com Deck Externo, Espaço Fitness com Terraço, Living Integrado. Preço sob consulta.',
  keywords: ['Mar di Nizza Residencial', 'Mar Grosso', 'Laguna SC', 'apartamento Laguna', 'Construtora Fontana', 'Stiven Allan', 'imóvel litoral SC'],
  openGraph: {
    title: 'Mar di Nizza Residencial | Mar Grosso Laguna SC | Stiven Allan',
    description: 'Sinta a leveza do litoral de Laguna no seu dia a dia. 2 e 3 dormitórios, 65 a 92 m² privativos.',
    images: ['/images/empreendimentos/mar-di-nizza-mar-grosso-laguna-sc/mar-di-nizza-residencial-64e74bef1ceb6.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mar di Nizza Residencial | Mar Grosso Laguna SC | Stiven Allan',
    description: 'Sinta a leveza do litoral de Laguna no seu dia a dia. 2 e 3 dormitórios, 65 a 92 m² privativos.',
    images: ['/images/empreendimentos/mar-di-nizza-mar-grosso-laguna-sc/mar-di-nizza-residencial-64e74bef1ceb6.jpg'],
  },
}

const t = {
  bg:'#F8FAFA', ink:'#0F1C22', teal:'#1B7A72', tealDark:'#104E48',
  muted:'#4A6E6A', line:'rgba(15,28,34,0.12)', dark:'#070D0C',
  onDark:'#E2F4F2', onDarkMuted:'rgba(226,244,242,0.66)',
  display:"'Jost',system-ui,sans-serif",
  serif:"'Cormorant Garamond',Georgia,serif",
  body:"'Hanken Grotesk',system-ui,sans-serif",
}

const IMG = {
  hero: '/images/empreendimentos/mar-di-nizza-mar-grosso-laguna-sc/mar-di-nizza-residencial-64e74bef1ceb6.jpg',
  mapa: '/images/empreendimentos/mar-di-nizza-mar-grosso-laguna-sc/localizacao-64e74f0416d2d.jpg',
  lazer: '/images/empreendimentos/mar-di-nizza-mar-grosso-laguna-sc/mar-di-nizza-residencial-64e74bef1ceb6.jpg',
}

const GALERIA = [
  { src: IMG.hero, alt: 'Fachada Angular — Mar di Nizza Residencial', label: 'Fachada Angular' },
  { src: 'https://lh3.googleusercontent.com/d/1E1sk5Sb5QHIxn7EHjhoG0Hn-QRHSyaHq', alt: 'Salão de Festas com Deck Externo — Mar di Nizza Residencial', label: 'Salão de Festas com Deck Externo' },
  { src: 'https://lh3.googleusercontent.com/d/1iKs4tg414Rq6JqVnj4Z_Lg4N771m8zSN', alt: 'Espaço Fitness com Terraço — Mar di Nizza Residencial', label: 'Espaço Fitness com Terraço' },
  { src: 'https://lh3.googleusercontent.com/d/1t6FwFT3qZ1iQ7iVMd1UTw7QO7Xas913b', alt: 'Living Integrado — Mar di Nizza Residencial', label: 'Living Integrado' },
  { src: 'https://lh3.googleusercontent.com/d/1Pueu9qBjQwTwJHm5k_gqSOhsex-2ZBhM', alt: 'Suíte — Mar di Nizza Residencial', label: 'Suíte' },
  { src: 'https://lh3.googleusercontent.com/d/1aDO3zBrq_bjg3uGMAjhr4sbfom77TE7w', alt: 'Acesso Principal — Mar di Nizza Residencial', label: 'Acesso Principal' },
]

const DIFERENCIAIS = [
  'Salão de Festas com Deck Externo',
  'Espaço Fitness com Terraço',
  'Churrasqueira com sistema de exaustão e dumper',
  'Hall de Entrada com pé-direito duplo',
  'Persianas nos dormitórios',
  'Rebaixo em gesso',
  'Tubulação de água quente',
  'Espera para ar-condicionado split',
  'Possibilidade de personalização de planta',
]

// Plantas oficiais — site estilofontana.com.br (aba "Plantas" do Mar di Nizza).
// Metragens/dormitórios/suítes por final confirmados na própria imagem da planta oficial.
const PLANTAS = [
  { categoria: 'tipo', src: 'https://estilofontana.com.br/images/empreendimento_planta/planta-tipo-final-01-1692882173.jpg', alt: 'Mar di Nizza Residencial — planta tipo final 01', label: 'Planta tipo — Final 01', area: 92.09, quartos: 3, suites: 1 },
  { categoria: 'tipo', src: 'https://estilofontana.com.br/images/empreendimento_planta/planta-tipo-final-02-1692882306.jpg', alt: 'Mar di Nizza Residencial — planta tipo final 02', label: 'Planta tipo — Final 02', area: 87.98, quartos: 3, suites: 1 },
  { categoria: 'tipo', src: 'https://estilofontana.com.br/images/empreendimento_planta/planta-tipo-final-03-1692882472.jpg', alt: 'Mar di Nizza Residencial — planta tipo final 03', label: 'Planta tipo — Final 03', area: 65.89, quartos: 2, suites: 1 },
  { categoria: 'tipo', src: 'https://estilofontana.com.br/images/empreendimento_planta/planta-tipo-final-04-1692882534.jpg', alt: 'Mar di Nizza Residencial — planta tipo final 04', label: 'Planta tipo — Final 04', area: 87.84, quartos: 3, suites: 1 },
  { categoria: 'tipo', src: 'https://estilofontana.com.br/images/empreendimento_planta/planta-tipo-final-05-1692882594.jpg', alt: 'Mar di Nizza Residencial — planta tipo final 05', label: 'Planta tipo — Final 05', area: 90.78, quartos: 3, suites: 1 },
  { categoria: 'tipo', src: 'https://estilofontana.com.br/images/empreendimento_planta/planta-tipo-final-06-1692882646.jpg', alt: 'Mar di Nizza Residencial — planta tipo final 06', label: 'Planta tipo — Final 06', area: 66.51, quartos: 2, suites: 1 },
  { categoria: 'comum', src: 'https://estilofontana.com.br/images/empreendimento_planta/terreo-1692883746.jpg', alt: 'Mar di Nizza Residencial — planta do térreo', label: 'Térreo' },
  { categoria: 'comum', src: 'https://estilofontana.com.br/images/empreendimento_planta/1o-pavimento-1692883770.jpg', alt: 'Mar di Nizza Residencial — 1º pavimento de garagem', label: '1º Pavimento · Garagem' },
  { categoria: 'comum', src: 'https://estilofontana.com.br/images/empreendimento_planta/2o-pavimento-1692883787.jpg', alt: 'Mar di Nizza Residencial — 2º pavimento de garagem', label: '2º Pavimento · Garagem' },
]

const PLANTAS_GRUPOS = [
  { titulo: 'Apartamentos tipo', categoria: 'tipo' },
  { titulo: 'Térreo e garagem', categoria: 'comum' },
]

const CONDICOES = {
  texto: 'Entrada de 20% do valor do imóvel, paga em parcela única, mais 6 reforços anuais, conforme a composição da tabela vigente, e o saldo dividido em até 72 parcelas mensais. Durante a obra, os valores são corrigidos mensalmente pelo CUB/Sinduscon-SC.',
  desconto: 'Para pagamento à vista, desconto de 15% sobre o valor total (sem permuta).',
  vigencia: 'Condições conforme tabela de julho/2026, sujeitas à atualização. Consulte a tabela vigente para valores e disponibilidade por unidade.',
}

const AMENIDADES = [
  'Salão de Festas com Deck Externo','Espaço Fitness com Terraço',
  'Hall com pé-direito duplo','Living Integrado',
  'Acesso para Banhistas','2 Elevadores',
]

const STATS = [
  {n:'2 e 3',l:'Dormitórios'},
  {n:'1',l:'Suíte'},
  {n:'65 a 92',l:'m² privativos'},
  {n:'2',l:'Elevadores'},
]

const WA = 'https://wa.me/5548991642332?text=Olá Stiven, tenho interesse no Mar di Nizza Residencial.'
const CATALOGO = 'https://estilofontana.com.br/upload/empreendimento/catalogo/mar-di-nizza-residencial-1695056288.pdf'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Apartment',
  name: 'Mar di Nizza Residencial',
  description: 'Residencial com 2 e 3 dormitórios (1 suíte), 65 a 92 m² privativos em Mar Grosso, Laguna/SC.',
  numberOfRooms: 3,
  floorSize: { '@type': 'QuantitativeValue', value: 92, unitCode: 'MTK' },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua Joana Mussi, esq. Rua Moreira Gomes',
    addressLocality: 'Laguna',
    addressRegion: 'SC',
    addressCountry: 'BR',
  },
  image: IMG.hero,
  url: 'https://stivenallan.com.br/empreendimento/fontana/mar-di-nizza-mar-grosso-laguna-sc',
}

const CSS = `.mn-hero{position:relative;width:100%;height:100vh;min-height:520px;display:flex;align-items:flex-end}.mn-hero-img{position:absolute;inset:0;z-index:0}.mn-hero-overlay{position:absolute;inset:0;z-index:1;background:linear-gradient(to top,rgba(7,13,12,0.72) 0%,rgba(7,13,12,0.18) 60%,rgba(7,13,12,0.04) 100%)}.mn-hero-content{position:relative;z-index:2;width:100%;max-width:900px;margin:0 auto;padding:0 24px 72px}.mn-tagline{font-size:clamp(2rem,5vw,3.4rem);font-weight:300;color:#E2F4F2;line-height:1.18;letter-spacing:-.01em;margin:0 0 20px}.mn-hero-cta{display:inline-flex;align-items:center;gap:10px;background:#1B7A72;color:#fff;text-decoration:none;padding:14px 28px;font-size:.85rem;letter-spacing:.14em;text-transform:uppercase;font-weight:500;border-radius:2px;transition:background .2s;border:none;cursor:pointer;font-family:'Jost',system-ui,sans-serif}.mn-hero-cta:hover{background:#104E48}.mn-section{padding:80px 24px;max-width:1160px;margin:0 auto}.mn-section-sm{padding:48px 24px;max-width:1160px;margin:0 auto}.mn-label{font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;font-weight:600;margin:0 0 16px;opacity:.55}.mn-h2{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:300;letter-spacing:-.02em;margin:0 0 24px;line-height:1.2}.mn-copy{font-size:1.05rem;line-height:1.75;max-width:680px;opacity:.82}.mn-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:2px;background:rgba(15,28,34,0.08);margin-top:56px}.mn-stat{background:#F8FAFA;padding:28px 20px;text-align:center}.mn-stat-n{font-size:clamp(1.6rem,3.5vw,2.2rem);font-weight:300;color:#1B7A72;letter-spacing:-.02em;display:block;margin-bottom:4px}.mn-stat-l{font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;opacity:.55}.mn-divider{width:100%;height:1px;background:rgba(15,28,34,0.12);margin:0}.mn-two-col{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}@media(max-width:768px){.mn-two-col{grid-template-columns:1fr;gap:40px}}.mn-diff-list{list-style:none;padding:0;margin:0;display:grid;gap:16px}.mn-diff-item{display:flex;gap:16px;align-items:flex-start}.mn-diff-num{font-size:.72rem;letter-spacing:.16em;color:#1B7A72;font-weight:600;padding-top:2px;min-width:28px}.mn-diff-text{font-size:.97rem;line-height:1.5;opacity:.82}.mn-lazer-card{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:2px}.mn-gal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px}@media(max-width:640px){.mn-gal-grid{grid-template-columns:1fr}}.mn-gcard{border-radius:0}.mn-onimg{font-family:'Hanken Grotesk',system-ui,sans-serif}.mn-amenidades{display:flex;flex-wrap:wrap;gap:10px}.mn-chip{display:inline-flex;align-items:center;padding:8px 16px;border:1px solid rgba(15,28,34,0.16);font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;border-radius:2px;opacity:.8}.mn-mapa-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}@media(max-width:768px){.mn-mapa-grid{grid-template-columns:1fr;gap:40px}}.mn-mapa-img{position:relative;width:100%;aspect-ratio:4/3;overflow:hidden;border-radius:2px}.mn-cta-band{background:#104E48;color:#E2F4F2;padding:72px 24px;text-align:center}.mn-cta-band-h{font-size:clamp(1.6rem,3.5vw,2.4rem);font-weight:300;margin:0 0 12px;letter-spacing:-.01em}.mn-cta-band-sub{opacity:.66;margin:0 0 36px;font-size:1rem}.mn-cta-btn{display:inline-flex;align-items:center;gap:10px;background:#1B7A72;color:#fff;text-decoration:none;padding:16px 32px;font-size:.85rem;letter-spacing:.14em;text-transform:uppercase;font-weight:500;border-radius:2px;transition:background .2s}.mn-cta-btn:hover{background:#104E48}.mn-fab{position:fixed;bottom:28px;right:28px;z-index:999;display:flex;align-items:center;gap:10px;background:#1B7A72;color:#fff;text-decoration:none;padding:14px 22px;border-radius:100px;font-size:.82rem;font-weight:600;letter-spacing:.06em;box-shadow:0 4px 24px rgba(27,122,114,.38);transition:background .2s}.mn-fab:hover{background:#104E48}.mn-footer{background:#070D0C;color:rgba(226,244,242,0.66);padding:32px 24px;text-align:center;font-size:.82rem}`

export default function MarDiNizzaPage() {
  return (
    <>
      
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div style={{ fontFamily: t.body, background: t.bg, color: t.ink }}>
<PropertySchema nome="Mar di Nizza Residencial" slug="mar-di-nizza-mar-grosso-laguna-sc" construtora_slug="fontana" cidade="Laguna" uf="SC" bairro="Mar Grosso" descricao="Mar di Nizza Residencial — 2 e 3 dormitórios, 65 a 92 m² privativos no Mar Grosso, Laguna/SC. Financiamento direto Fontana." imagem="https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/mar-di-nizza-mar-grosso-laguna-sc.jpg" faq={[{"pergunta":"Como funciona o financiamento direto do Mar di Nizza Residencial?","resposta":"Entrada de 20% (parcela única), 6 reforços anuais, conforme a composição da tabela vigente, e saldo em até 72 parcelas mensais, corrigidas pelo CUB/Sinduscon-SC durante a obra. Para pagamento à vista, desconto de 15% sobre o valor total (sem permuta). Condições conforme tabela de julho/2026, sujeitas à atualização — fale com Stiven para simular sua unidade. Consulte a tabela vigente para valores e disponibilidade por unidade."},{"pergunta":"Qual a previsão de entrega do Mar di Nizza Residencial?","resposta":"A previsão de entrega é dezembro de 2026, em Mar Grosso, Laguna/SC."},{"pergunta":"Como é a correção monetária após a entrega das chaves?","resposta":"O saldo remanescente é corrigido mensalmente, à escolha do comprador, por uma de duas opções: IGPM acrescido de juros compensatórios de 0,75% ao mês, ou apenas pelo CUB/Sinduscon-SC."},{"pergunta":"Onde fica o Mar di Nizza Residencial?","resposta":"O Mar di Nizza Residencial está localizado na Rua Joana Mussi, esq. Rua Moreira Gomes, no Mar Grosso, Laguna/SC."},{"pergunta":"Quais as plantas e metragens disponíveis?","resposta":"2 dormitórios (1 suíte) de 65,89 a 66,51 m² privativos, ou 3 dormitórios (1 suíte) de 87,84 a 92,09 m² privativos, conforme o final do apartamento — confira as plantas oficiais na página."}]} />

        {/* NAV */}
        <header style={{ position:'absolute', top:0, left:0, right:0, zIndex:10, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 32px' }}>
          <a href="/" style={{ color:'#E2F4F2', textDecoration:'none', fontFamily:t.display, fontSize:'1.1rem', fontWeight:600, letterSpacing:'.04em' }}>Stiven Allan</a>
          <nav style={{ display:'flex', gap:24 }}>
            <LeadCaptureButton slug="mar-di-nizza-mar-grosso-laguna-sc" construtora_slug="fontana" className="mn-cta"  propertyDisplayName="Mar di Nizza Residencial" />
            <a href={WA} target="_blank" rel="noopener noreferrer" style={{ color:'rgba(226,244,242,0.82)', textDecoration:'none', fontSize:'.8rem', letterSpacing:'.12em', textTransform:'uppercase' }}>Contato</a>
          </nav>
        </header>

        {/* HERO */}
        <section className="mn-hero">
          <div className="mn-hero-img">
            <HeroImage src={IMG.hero} alt="Mar di Nizza Residencial — fachada" fill priority sizes="100vw" style={{ objectFit:'cover', objectPosition:'center 30%' }} />
          </div>
          <div className="mn-hero-overlay" />
          <div className="mn-hero-content">
            <p className="mn-label" style={{ color:'rgba(226,244,242,0.66)' }}>Mar Grosso — Laguna/SC</p>
            <h1 className="mn-tagline" style={{ fontFamily:t.serif }}>Sinta a leveza do litoral de Laguna no seu dia a dia.</h1>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className="mn-hero-cta" style={{ fontFamily:t.display }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Tenho interesse
              </a>
              <LeadCaptureButton slug="mar-di-nizza-mar-grosso-laguna-sc" construtora_slug="fontana" propertyDisplayName="Mar di Nizza Residencial" className="mn-hero-cta" label="Baixar catálogo & plantas" />
            </div>
          </div>
        </section>

        {/* SOBRE */}
        <section className="mn-section">
          <p className="mn-label" style={{ color:t.teal }}>O Empreendimento</p>
          <h2 className="mn-h2" style={{ fontFamily:t.serif }}>Mar di Nizza Residencial</h2>
          <p className="mn-copy">A poucos minutos do mar e tudo que você precisa. O Mar di Nizza foi pensado para acolher bem os seus sonhos — com infraestrutura moderna e apartamentos de 2 e 3 dormitórios, ele é capaz de abrigar tudo que faz parte de você. Venha aproveitar ao máximo o seu jeito leve de viver.</p>
          <div className="mn-stats">
            {STATS.map((s,i) => (
              <div key={i} className="mn-stat">
                <span className="mn-stat-n" style={{ fontFamily:t.display }}>{s.n}</span>
                <span className="mn-stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        </section>

        <hr className="mn-divider" />

        {/* DIFERENCIAIS */}
        <section className="mn-section">
          <div className="mn-two-col">
            <div>
              <p className="mn-label" style={{ color:t.teal }}>Diferenciais</p>
              <h2 className="mn-h2" style={{ fontFamily:t.serif }}>Por que escolher o Mar di Nizza?</h2>
              <ul className="mn-diff-list">
                {DIFERENCIAIS.map((d,i) => (
                  <li key={i} className="mn-diff-item">
                    <span className="mn-diff-num" style={{ fontFamily:t.display }}>{String(i+1).padStart(2,'0')}</span>
                    <span className="mn-diff-text">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mn-lazer-card">
              <Image unoptimized src={IMG.lazer} alt="Área de lazer — Mar di Nizza Residencial" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit:'cover' }} />
            </div>
          </div>
        </section>

        <hr className="mn-divider" />

        {/* PLANTAS */}
        <section className="mn-section">
          <p className="mn-label" style={{ color:t.teal }}>Plantas</p>
          <h2 className="mn-h2" style={{ fontFamily:t.serif }}>Escolha o seu layout</h2>
          <p className="mn-copy" style={{ marginBottom: 40 }}>Plantas oficiais da Construtora Fontana — 2 e 3 dormitórios (1 suíte), de 65,89 a 92,09 m² privativos, conforme o final do apartamento.</p>
          <div style={{ display:'flex', flexDirection:'column', gap:48 }}>
            {PLANTAS_GRUPOS.map(({ titulo, categoria }) => {
              const itens = PLANTAS.filter(p => p.categoria === categoria)
              if (!itens.length) return null
              return (
                <div key={categoria}>
                  <p className="mn-label" style={{ color:t.teal, marginBottom:16 }}>{titulo}</p>
                  <div className="mn-gal-grid" style={{ borderRadius: 2, overflow:'hidden' }}>
                    <GalleryWithLightbox galeria={itens} prefix="mnp" gradient="rgba(7,13,12,0.55)" badge="Planta oficial" trackPlantas={{ empreendimento: 'mar-di-nizza-mar-grosso-laguna-sc', content_name: 'Mar di Nizza Residencial' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <hr className="mn-divider" />

        {/* GALERIA */}
        <section style={{ padding:'80px 0' }}>
          <div style={{ maxWidth:1160, margin:'0 auto', padding:'0 24px 32px' }}>
            <p className="mn-label" style={{ color:t.teal }}>Galeria</p>
            <h2 className="mn-h2" style={{ fontFamily:t.serif }}>Conheça cada detalhe</h2>
          </div>
          <div className="mn-gal-grid">
            <GalleryWithLightbox galeria={GALERIA} prefix="mn" gradient="rgba(7,13,12,0.62)" />
          </div>
        </section>

        <hr className="mn-divider" />

        {/* AMENIDADES */}
        <section className="mn-section">
          <p className="mn-label" style={{ color:t.teal }}>Infraestrutura</p>
          <h2 className="mn-h2" style={{ fontFamily:t.serif }}>Amenidades</h2>
          <div className="mn-amenidades">
            {AMENIDADES.map((a,i) => (
              <span key={i} className="mn-chip">{a}</span>
            ))}
          </div>
        </section>

        <hr className="mn-divider" />

        {/* LOCALIZAÇÃO */}
        <section className="mn-section">
          <div className="mn-mapa-grid">
            <div>
              <p className="mn-label" style={{ color:t.teal }}>Localização</p>
              <h2 className="mn-h2" style={{ fontFamily:t.serif }}>Mar Grosso, Laguna/SC</h2>
              <p className="mn-copy" style={{ marginBottom:32 }}>Rua Joana Mussi, esq. Rua Moreira Gomes — Laguna/SC</p>
              <a href={WA} target="_blank" rel="noopener noreferrer" className="mn-hero-cta" style={{ fontFamily:t.display }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Quero saber mais
              </a>
            </div>
            <div className="mn-mapa-img">
              <Image unoptimized src={IMG.mapa} alt="Localização Mar di Nizza — Mar Grosso, Laguna/SC" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit:'cover' }} />
            </div>
          </div>
        </section>

        <hr className="mn-divider" />

        {/* CONDIÇÕES DE PAGAMENTO */}
        <section className="mn-section">
          <p className="mn-label" style={{ color:t.teal }}>Investimento</p>
          <h2 className="mn-h2" style={{ fontFamily:t.serif }}>Condições de pagamento</h2>
          <p className="mn-copy">{CONDICOES.texto}</p>
          <p className="mn-copy" style={{ marginTop: 16 }}>{CONDICOES.desconto}</p>
          <p style={{ marginTop: 24, fontSize: '.78rem', letterSpacing: '.04em', opacity: .55 }}>{CONDICOES.vigencia}</p>
          <a href={WA} target="_blank" rel="noopener noreferrer" className="mn-hero-cta" style={{ fontFamily:t.display, marginTop: 32 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Simular condições
          </a>
        </section>

        {/* CTA BAND */}
        <section className="mn-cta-band">
          <p className="mn-cta-band-h" style={{ fontFamily:t.serif }}>Pronto para morar no litoral?</p>
          <p className="mn-cta-band-sub" style={{ fontFamily:t.body }}>Preço sob consulta — fale com Stiven Allan</p>
          <a href={WA} target="_blank" rel="noopener noreferrer" className="mn-cta-btn" style={{ fontFamily:t.display }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Entrar em contato
          </a>
        </section>

        {/* FOOTER */}
        <footer className="mn-footer" style={{ fontFamily:t.body }}>
          <p style={{ margin:0 }}>&copy; {new Date().getFullYear()} Stiven Allan — Corretor de Imóveis</p>
          <p style={{ margin:'6px 0 0', opacity:.7 }}>Mar di Nizza Residencial é um empreendimento da Construtora Fontana, incorporado por OBF Construções Ltda. Incorporação imobiliária averbada na Matrícula R-1/45.501, Ofício de Registro de Imóveis da Comarca de Laguna/SC.</p>
        </footer>

        {/* FAB WhatsApp */}
        <a href={WA} target="_blank" rel="noopener noreferrer" className="mn-fab" aria-label="WhatsApp" style={{ fontFamily:t.display }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </a>
      
{/* SEO FAQ */}
<PropertyFAQ items={[{"pergunta":"Como funciona o financiamento direto do Mar di Nizza Residencial?","resposta":"Entrada de 20% (parcela única), 6 reforços anuais, conforme a composição da tabela vigente, e saldo em até 72 parcelas mensais, corrigidas pelo CUB/Sinduscon-SC durante a obra. Para pagamento à vista, desconto de 15% sobre o valor total (sem permuta). Condições conforme tabela de julho/2026, sujeitas à atualização — fale com Stiven para simular sua unidade. Consulte a tabela vigente para valores e disponibilidade por unidade."},{"pergunta":"Qual a previsão de entrega do Mar di Nizza Residencial?","resposta":"A previsão de entrega é dezembro de 2026, em Mar Grosso, Laguna/SC."},{"pergunta":"Como é a correção monetária após a entrega das chaves?","resposta":"O saldo remanescente é corrigido mensalmente, à escolha do comprador, por uma de duas opções: IGPM acrescido de juros compensatórios de 0,75% ao mês, ou apenas pelo CUB/Sinduscon-SC."},{"pergunta":"Onde fica o Mar di Nizza Residencial?","resposta":"O Mar di Nizza Residencial está localizado na Rua Joana Mussi, esq. Rua Moreira Gomes, no Mar Grosso, Laguna/SC."},{"pergunta":"Quais as plantas e metragens disponíveis?","resposta":"2 dormitórios (1 suíte) de 65,89 a 66,51 m² privativos, ou 3 dormitórios (1 suíte) de 87,84 a 92,09 m² privativos, conforme o final do apartamento — confira as plantas oficiais na página."}]} accent="#1B7A72" />
<RelatedProperties atualSlug="mar-di-nizza-mar-grosso-laguna-sc" cidade="Laguna" />

</div>
    </>
  )
}
