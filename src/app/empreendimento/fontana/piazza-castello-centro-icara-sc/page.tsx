import Image from 'next/image'
import { HeroImage } from '@/components/HeroImage'
import type { Metadata } from 'next'
import GalleryWithLightbox from './gallery-lightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'

const COR = '#5B2333'
const CDN = '/images/empreendimentos/piazza-castello-centro-icara-sc/'
const D = (id: string) => `https://lh3.googleusercontent.com/d/${id}`
const WA = 'https://wa.me/5548991642332?text=Ol%C3%A1!%20Tenho%20interesse%20no%20Piazza%20Castello%20Residencial.'
const CATALOGO = 'https://drive.google.com/file/d/1q_66Ex_z0HJLQG_hvC0bau8sqILvvcsc/view'

export const metadata: Metadata = {
  title: 'Piazza Castello Residencial — Centro · Içara/SC | Construtora Fontana',
  description: '3 dormítórios (3 suítes), até 172 m², apenas 2 apartamentos por andar. Centro de Içara/SC. Financiamento direto com a Construtora Fontana.',
  openGraph: {
    title: 'Piazza Castello Residencial — Centro · Içara/SC | Stiven Allan',
    description: 'Exclusividade no coração de Içara: apenas 2 apartamentos por andar, 3 suítes, até 172 m².',
    images: [`${CDN}piazza-castello-residencial-5f8dcbdd18ee4.jpg`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Piazza Castello Residencial — Centro · Içara/SC | Stiven Allan',
    description: 'Exclusividade no coração de Içara: apenas 2 apartamentos por andar, 3 suítes, até 172 m².',
    images: [`${CDN}piazza-castello-residencial-5f8dcbdd18ee4.jpg`],
  },
}

const galeria = [
  { src: D('1SDljSGNp66NMhZIEKe1orGozVDssWX09'), alt: 'Piazza Castello — Fachada' },
  { src: D('1X70Vv9hjgszALVOOfxl_P9c-QxWZi4FS'), alt: 'Piazza Castello — Fachada angular' },
  { src: D('1y-LArT_zOVn4RczjxrERkwYJSYOIMhrd'), alt: 'Piazza Castello — Vista da rua' },
  { src: D('1IjV56yK23LVqdCyXyu3VYdVnSebWobwN'), alt: 'Piazza Castello — Vista aérea' },
  { src: D('1wrmLl7pq7hfMgAO35wMt4g-7zhF-SVos'), alt: 'Piazza Castello — Piscina' },
  { src: D('1JqLnC9_QMov22Os2FMU8q1-tJnDbxbAR'), alt: 'Piazza Castello — Piscina deck' },
  { src: D('11L8E1RbRQES8gLqWb4AF99bbgbSoup2o'), alt: 'Piazza Castello — Salão de Festas' },
  { src: D('1miaWDKVi2l_HO1D5EStveRzVaCFbT-66'), alt: 'Piazza Castello — Hall de Entrada' },
  { src: D('1OTzEtnyer0DJvXeuqb-iOAo8y3zqw-s4'), alt: 'Piazza Castello — Apartamento Tipo' },
]

export default function PiazzaCastelloPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: 'Piazza Castello Residencial',
    description: '3 dormítórios (3 suítes), até 172 m², apenas 2 apartamentos por andar, no Centro de Içara/SC.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Praça Presidente João Goulart',
      addressLocality: 'Içara',
      addressRegion: 'SC',
      addressCountry: 'BR',
    },
  }

  return (
    <>
      

      <style>{`
        .pc-hero{position:relative;height:100svh;min-height:560px;display:flex;flex-direction:column;justify-content:flex-end}
        .pc-hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.15) 60%,transparent 100%)}
        .pc-hero-content{position:relative;z-index:2;padding:3rem 1.5rem 4rem}
        .pc-container{max-width:1100px;margin:0 auto}
        .pc-badge{display:inline-block;background:${COR};color:#fff;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:.35rem .8rem;border-radius:2px;margin-bottom:1rem}
        .pc-hero-title{font-size:clamp(2rem,6vw,3.5rem);font-weight:700;color:#fff;line-height:1.1;margin:0 0 .75rem}
        .pc-hero-sub{font-size:clamp(1rem,2.5vw,1.25rem);color:rgba(255,255,255,.88);margin:0 0 2rem;max-width:600px}
        .pc-hero-btn{display:inline-flex;align-items:center;gap:.5rem;background:${COR};color:#fff;text-decoration:none;padding:.85rem 2rem;border-radius:4px;font-weight:700;font-size:1rem}
        .pc-specs{background:#fff;display:flex;flex-wrap:wrap;border-bottom:1px solid #eee}
        .pc-spec{flex:1 1 150px;padding:1.25rem 1.5rem;text-align:center;border-right:1px solid #eee}
        .pc-spec:last-child{border-right:none}
        .pc-spec-val{font-size:1.5rem;font-weight:700;color:${COR}}
        .pc-spec-lbl{font-size:.75rem;color:#666;text-transform:uppercase;letter-spacing:.08em;margin-top:.2rem}
        .pc-section{padding:5rem 1.5rem}
        .pc-section-tag{font-size:.7rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${COR};margin-bottom:.5rem}
        .pc-section-title{font-size:clamp(1.6rem,4vw,2.4rem);font-weight:700;color:#1a1a1a;line-height:1.2;margin:0 0 1.5rem}
        .pc-section-text{font-size:1.05rem;color:#555;line-height:1.75;margin:0 0 1.5rem;max-width:680px}
        .pc-features{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;margin-top:2rem}
        .pc-feature{display:flex;align-items:center;gap:.75rem;padding:1rem 1.25rem;border:1px solid #eee;border-radius:6px;font-size:.9rem;color:#333}
        .pc-feature-dot{width:8px;height:8px;border-radius:50%;background:${COR};flex-shrink:0}
        .pc-dark{background:#1a1a1a}
        .pc-dark .pc-section-title{color:#fff}
        .pc-dark .pc-section-text{color:#aaa}
        .pc-dark .pc-section-tag{color:#c4768a}
        .pc-lazer-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:4px;margin-top:2rem}
        .pc-lazer-item{position:relative;aspect-ratio:4/3;overflow:hidden}
        .pc-lazer-label{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.7));color:#fff;padding:.75rem 1rem;font-size:.85rem;font-weight:600;z-index:2}
        .pc-loc-grid{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;margin-top:2rem}
        .pc-loc-img{position:relative;aspect-ratio:16/9;border-radius:8px;overflow:hidden}
        .pc-loc-address{font-size:1.1rem;font-weight:600;color:#1a1a1a;margin:0 0 1rem}
        .pc-loc-text{font-size:.95rem;color:#555;line-height:1.8;margin:0 0 1.5rem}
        .pc-cta-box{text-align:center;padding:5rem 1.5rem;background:${COR}}
        .pc-cta-title{font-size:clamp(1.5rem,4vw,2rem);font-weight:700;color:#fff;margin:0 0 1rem}
        .pc-cta-sub{font-size:1rem;color:rgba(255,255,255,.85);margin:0 0 2rem}
        .pc-cta-btn{display:inline-flex;align-items:center;gap:.6rem;background:#fff;color:${COR};text-decoration:none;padding:.9rem 2.25rem;border-radius:4px;font-weight:700;font-size:1.05rem}
        .pc-catalogo-btn{display:inline-flex;align-items:center;gap:.6rem;border:2px solid ${COR};color:${COR};text-decoration:none;padding:.85rem 2rem;border-radius:4px;font-weight:600;font-size:.95rem}
        .pc-footer{background:#111;color:#999;padding:2.5rem 1.5rem;text-align:center;font-size:.82rem;line-height:1.8}
        .pc-footer-logo{font-size:1rem;font-weight:700;color:#fff;margin:0 0 .25rem}
        .pc-fab{position:fixed;bottom:1.5rem;right:1.5rem;z-index:100;background:#25D366;border-radius:50%;width:56px;height:56px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,.3);text-decoration:none}
        @media(max-width:768px){.pc-loc-grid{grid-template-columns:1fr}.pc-spec{flex:1 1 120px}}
      `}</style>

      
<PropertySchema nome="Piazza Castello Residencial" slug="piazza-castello-centro-icara-sc" construtora_slug="fontana" cidade="Içara" uf="SC" bairro="Centro" descricao="Piazza Castello Residencial — 3 dormitórios (3 suítes), até 172 m² privativos, apenas 2 unidades por andar, no Centro de Içara/SC." imagem="https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/piazza-castello-centro-icara-sc.jpg" faq={[{"pergunta":"Como funciona o pagamento do Piazza Castello Residencial?","resposta":"Condições de pagamento sob consulta. Fale com um corretor para receber a composição comercial e a disponibilidade atualizadas."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Fale com um corretor para confirmar as modalidades de pagamento disponíveis, incluindo financiamento bancário e FGTS."},{"pergunta":"Onde fica o Piazza Castello Residencial?","resposta":"O Piazza Castello Residencial está localizado na Praça Presidente João Goulart, frente à Praça Castelo Branco, no Centro de Içara/SC."},{"pergunta":"Quais as plantas e metragens disponíveis?","resposta":"O empreendimento oferece apartamentos exclusivos com 3 dormitórios (3 suítes) e até 172 m² privativos, com apenas 2 unidades por andar."}]} />
<header style={{position:'absolute',top:0,left:0,right:0,zIndex:10,padding:'1.5rem'}}>
        <a href="/" style={{color:'#fff',fontSize:'1rem',fontWeight:700,textDecoration:'none',letterSpacing:'.04em'}}>
          Stiven Allan
        </a>
      </header>

      <section className="pc-hero">
        <Image
          src={`${CDN}piazza-castello-residencial-5f8dcbdd18ee4.jpg`}
          alt="Piazza Castello Residencial — Içara/SC"
          fill
          priority
          sizes="100vw"
          style={{objectFit:'cover'}}
        />
        <div className="pc-hero-overlay" />
        <div className="pc-hero-content">
          <div className="pc-container">
            <span className="pc-badge">Pronto para morar · Centro · Içara/SC</span>
            <h1 className="pc-hero-title">Piazza Castello<br />Residencial</h1>
            <p className="pc-hero-sub">Apenas 2 apartamentos por andar — exclusividade no coração de Içara.</p>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="pc-hero-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.551 4.103 1.515 5.83L.057 23.536a.5.5 0 0 0 .612.612l5.701-1.458A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 0 1-5.003-1.37l-.358-.213-3.724.952.969-3.735-.234-.373A9.799 9.799 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
              Falar pelo WhatsApp
            </a>
          </div>
        </div>
      </section>

      <div className="pc-specs">
        <div className="pc-spec"><div className="pc-spec-val">3</div><div className="pc-spec-lbl">Dormítórios (3 suítes)</div></div>
        <div className="pc-spec"><div className="pc-spec-val">172 m²</div><div className="pc-spec-lbl">Área privativa</div></div>
        <div className="pc-spec"><div className="pc-spec-val">2</div><div className="pc-spec-lbl">Aptos por andar</div></div>
        <div className="pc-spec"><div className="pc-spec-val">Pronto</div><div className="pc-spec-lbl">Para morar</div></div>
      </div>

      <section className="pc-section" style={{background:'#f8f8f8',paddingTop:'3rem',paddingBottom:'3rem'}}>
        <div className="pc-container">
          <p className="pc-section-tag">Galeria</p>
          <h2 className="pc-section-title">Veja por dentro</h2>
          <GalleryWithLightbox galeria={galeria} prefix="pc" gradient={COR} />
        </div>
      </section>

      <section className="pc-section">
        <div className="pc-container">
          <p className="pc-section-tag">O Empreendimento</p>
          <h2 className="pc-section-title">Sofisticação e exclusividade<br />no centro de Içara</h2>
          <p className="pc-section-text">O Piazza Castello foi concebido para quem valoriza privacidade e requinte. Com apenas 2 apartamentos por andar, cada unidade ocupa um espaço privilegiado — silêncio, privacidade e a sensação de uma residência particular em pleno coração de Içara.</p>
          <p className="pc-section-text">Os apartamentos de até 172 m² contam com 3 suítes, sacada gourmet e hall de entrada com pé direito duplo. Um projeto que une grandiosidade à intimidade.</p>
          <div className="pc-features">
            {['3 suítes','Sacada Gourmet','Hall com pé direito duplo','2 Elevadores','2 aptos por andar','Piscina','Salão de Festas','Academia','Brinquedoteca','Playground'].map(f => (
              <div key={f} className="pc-feature"><span className="pc-feature-dot" />{f}</div>
            ))}
          </div>
          <div style={{marginTop:'2.5rem',padding:'1.5rem',background:'#f9f9f9',borderLeft:`4px solid ${COR}`,borderRadius:'0 4px 4px 0'}}>
            <p style={{margin:0,fontSize:'.95rem',color:'#444',fontWeight:600}}>Financiamento direto com a Construtora Fontana</p>
            <p style={{margin:'.5rem 0 0',fontSize:'.9rem',color:'#666'}}>Negocie diretamente com a construtora — sem burocracia de banco.</p>
          </div>
        </div>
      </section>

      <section className="pc-section pc-dark">
        <div className="pc-container">
          <p className="pc-section-tag">Lazer</p>
          <h2 className="pc-section-title">Estrutura completa para sua família</h2>
          <p className="pc-section-text">Tudo o que você precisa sem precisar sair do condomínio.</p>
          <div className="pc-lazer-grid">
            {[
              { id:'1wrmLl7pq7hfMgAO35wMt4g-7zhF-SVos', label:'Piscina' },
              { id:'11L8E1RbRQES8gLqWb4AF99bbgbSoup2o', label:'Salão de Festas' },
              { id:'1pPsRoSQziGj5KTaE8dIYPSPkY54u_pCa', label:'Academia' },
              { id:'1JnM304p4cRx4ltHHGoHcXr2Au4-1y0yp', label:'Brinquedoteca & Playground' },
            ].map(item => (
              <div key={item.id} className="pc-lazer-item">
                <Image unoptimized src={D(item.id)} alt={item.label} fill sizes="(max-width:768px) 50vw,25vw" style={{objectFit:'cover'}} />
                <div className="pc-lazer-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pc-section">
        <div className="pc-container">
          <p className="pc-section-tag">Localização</p>
          <h2 className="pc-section-title">No coração de Içara</h2>
          <div className="pc-loc-grid">
            <div className="pc-loc-img">
              <Image unoptimized src={D('1IjV56yK23LVqdCyXyu3VYdVnSebWobwN')} alt="Piazza Castello — Vista aérea" fill sizes="(max-width:768px) 100vw,50vw" style={{objectFit:'cover'}} />
            </div>
            <div>
              <p className="pc-loc-address">Praça Pres. João Goulart<br />frente à Praça Castelo Branco<br />Centro · Içara/SC</p>
              <p className="pc-loc-text">Localização central privilegiada, com fácil acesso ao comércio, serviços e toda a infraestrutura de Içara. O endereço mais desejado da cidade.</p>
              <a href={WA} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:'.5rem',background:COR,color:'#fff',textDecoration:'none',padding:'.75rem 1.75rem',borderRadius:'4px',fontWeight:600,fontSize:'.9rem'}}>
                Agendar visita
              </a>
            </div>
          </div>
        </div>
      </section>

      <section style={{padding:'4rem 1.5rem',background:'#f8f8f8',textAlign:'center'}}>
        <div className="pc-container">
          <p className="pc-section-tag">Material</p>
          <h2 className="pc-section-title">Catálogo completo</h2>
          <p style={{color:'#666',margin:'0 0 1.5rem'}}>Plantas, especificações técnicas e detalhes do empreendimento.</p>
          <LeadCaptureButton slug="piazza-castello-centro-icara-sc" construtora_slug="fontana" className="pc-catalogo-btn"  propertyDisplayName="Piazza Castello Residencial" />
        </div>
      </section>

      <div className="pc-cta-box">
        <h2 className="pc-cta-title">Pronto para conhecer seu próximo lar?</h2>
        <p className="pc-cta-sub">Fale agora com nosso consultor e agende uma visita.</p>
        <a href={WA} target="_blank" rel="noopener noreferrer" className="pc-cta-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.551 4.103 1.515 5.83L.057 23.536a.5.5 0 0 0 .612.612l5.701-1.458A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 0 1-5.003-1.37l-.358-.213-3.724.952.969-3.735-.234-.373A9.799 9.799 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
          Quero saber mais
        </a>
      </div>

      <footer className="pc-footer">
        <p className="pc-footer-logo">Stiven Allan · Corretor de Imóveis</p>
        <p>CRECI 60.275 · Parceiro Oficial Construtora Fontana</p>
        <p style={{marginTop:'.5rem'}}><a href={WA} target="_blank" rel="noopener noreferrer" style={{color:'#25D366',textDecoration:'none'}}>WhatsApp: (48) 99164-2332</a></p>
        <p style={{marginTop:'.5rem',fontSize:'.75rem'}}><a href="/" style={{color:'#666',textDecoration:'none'}}>← Ver todos os empreendimentos</a></p>
      </footer>

      <a href={WA} target="_blank" rel="noopener noreferrer" className="pc-fab" aria-label="WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.551 4.103 1.515 5.83L.057 23.536a.5.5 0 0 0 .612.612l5.701-1.458A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 0 1-5.003-1.37l-.358-.213-3.724.952.969-3.735-.234-.373A9.799 9.799 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
      </a>
      {/* SEO FAQ */}
      <PropertyFAQ items={[{"pergunta":"Como funciona o pagamento do Piazza Castello Residencial?","resposta":"Condições de pagamento sob consulta. Fale com um corretor para receber a composição comercial e a disponibilidade atualizadas."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Fale com um corretor para confirmar as modalidades de pagamento disponíveis, incluindo financiamento bancário e FGTS."},{"pergunta":"Onde fica o Piazza Castello Residencial?","resposta":"O Piazza Castello Residencial está localizado na Praça Presidente João Goulart, frente à Praça Castelo Branco, no Centro de Içara/SC."},{"pergunta":"Quais as plantas e metragens disponíveis?","resposta":"O empreendimento oferece apartamentos exclusivos com 3 dormitórios (3 suítes) e até 172 m² privativos, com apenas 2 unidades por andar."}]} accent="#3D5C38" />
      <RelatedProperties atualSlug="piazza-castello-centro-icara-sc" cidade="Içara" />
    </>
  )
}
