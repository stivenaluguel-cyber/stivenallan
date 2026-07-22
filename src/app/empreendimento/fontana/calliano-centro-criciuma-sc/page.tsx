import type { Metadata } from 'next'
import Image from 'next/image'
import { HeroImage } from '@/components/HeroImage'
import GalleryWithLightbox, { LightboxPhoto } from './gallery-lightbox'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Calliano%20Residencial.'
const CATALOGO_PDF = 'https://estilofontana.com.br/upload/empreendimento/catalogo/calliano-residencial-1603223885.pdf'

const t = {
  bg:'#FAFAF8', ink:'#1A1612', terra:'#7A4028', terraDark:'#4E2818',
  muted:'#6B5A50', line:'rgba(26,22,18,0.12)', dark:'#110B07',
  onDark:'#F6EDE8', onDarkMuted:'rgba(246,237,232,0.66)',
  display:"'Jost',system-ui,sans-serif",
  serif:"'Cormorant Garamond',Georgia,serif",
  body:"'Hanken Grotesk',system-ui,sans-serif",
}

const IMG = {
  hero: '/images/empreendimentos/calliano-centro-criciuma-sc/calliano-residencial-5f903109ab6a9.jpg',
  mapa: '/images/empreendimentos/calliano-centro-criciuma-sc/localizacao-5f9032238d8ae.jpg',
  lazer: '/images/empreendimentos/calliano-centro-criciuma-sc/calliano-residencial-5f903109ab6a9.jpg',
}

const GALERIA = [
  { src: IMG.hero, alt: 'Fachada Calliano Residencial', label: 'Fachada' },
  { src: 'https://lh3.googleusercontent.com/d/1dmIrZMIArh41KS_q14bSdMu_nbvkC00-', alt: 'Hall de Entrada Calliano', label: 'Hall de Entrada' },
  { src: 'https://lh3.googleusercontent.com/d/1sy-iU_jlAUlAjYkOapuBKnhFk7A1WgL5', alt: 'Hall de Entrada Calliano', label: 'Hall de Entrada' },
  { src: 'https://lh3.googleusercontent.com/d/1YcFLm2qgXAEj4FMW8D7LX81_v4-XsBhS', alt: 'Hall de Entrada Calliano', label: 'Hall de Entrada' },
  { src: 'https://lh3.googleusercontent.com/d/1zNj1VKhbGZ3yMESJpAjfbhCeDa7e3mJW', alt: 'Área Externa Calliano', label: 'Campo de Futebol' },
  { src: 'https://lh3.googleusercontent.com/d/1xM0ZPiCZo09mztcbGZmgDemL9WIl1XPq', alt: 'Área Externa Calliano', label: 'Área Externa' },
  { src: 'https://lh3.googleusercontent.com/d/1-Y3wzzPx8MgVdf0vJyvY8plVNszYET5Z', alt: 'Área Externa Calliano', label: 'Área Externa' },
  { src: 'https://lh3.googleusercontent.com/d/1LoOvrVjeh9KQ2RboQ29VOD91QYj_a57Z', alt: 'Salão de Festas Calliano', label: 'Salão de Festas' },
  { src: 'https://lh3.googleusercontent.com/d/1ctCGWdZJZuHskwKAOjEFOQUo346-LuXi', alt: 'Salão de Festas Calliano', label: 'Salão de Festas' },
  { src: 'https://lh3.googleusercontent.com/d/1HP0e6RBflgZZ_cOioNYRcvXftj0zyRaG', alt: 'Salão de Festas Calliano', label: 'Salão de Festas' },
]

const DIFERENCIAIS = [
  '2 ou 3 dormitórios com até 92 m² privativos',
  '1 suíte com acabamento refinado',
  'Sacada privativa em todos os apartamentos',
  'Localização privilegiada no Centro de Criciúma',
]

const AMENIDADES = [
  'Salão de Festas','Hall de Entrada com design italiano',
  'Playground','Campo de Futebol','Churrasqueira','Elevador',
]

// Plantas oficiais — site estilofontana.com.br (aba "Plantas" do Calliano).
// Confirmado na tabela vigente: finais 1, 2, 4 e 5 = 3 dormitórios (1 suíte); finais 3 e 6 = 2 dormitórios (1 suíte).
const PLANTAS = [
  { categoria: 'tipo', src: 'https://estilofontana.com.br/images/empreendimento_planta/final-2-final-1-4-e-5-possuem-a-mesma-rebatida-1603284878.jpg', alt: 'Calliano Residencial — planta apartamento tipo final 2 (finais 1, 4 e 5 possuem a mesma planta, rebatida)', label: 'Apartamento Tipo — Final 2 (finais 1, 4 e 5, rebatida)', quartos: 3, suites: 1 },
  { categoria: 'tipo', src: 'https://estilofontana.com.br/images/empreendimento_planta/final-3-final-6-possui-a-mesma-rebatida-1603284927.jpg', alt: 'Calliano Residencial — planta apartamento tipo final 3 (final 6 possui a mesma planta, rebatida)', label: 'Apartamento Tipo — Final 3 (final 6, rebatida)', quartos: 2, suites: 1 },
  { categoria: 'comum', src: 'https://estilofontana.com.br/images/empreendimento_planta/cobertura-inferior-1603285073.jpg', alt: 'Calliano Residencial — cobertura inferior, final 2 (final 1 rebatida)', label: 'Cobertura Inferior — Final 2 (final 1, rebatida)' },
  { categoria: 'comum', src: 'https://estilofontana.com.br/images/empreendimento_planta/cobertura-superior-1603285002.jpg', alt: 'Calliano Residencial — cobertura superior, final 2 (final 1 rebatida)', label: 'Cobertura Superior — Final 2 (final 1, rebatida)' },
  { categoria: 'comum', src: 'https://estilofontana.com.br/images/empreendimento_planta/terreo-1603285142.jpg', alt: 'Calliano Residencial — planta do térreo', label: 'Térreo' },
  { categoria: 'comum', src: 'https://estilofontana.com.br/images/empreendimento_planta/garagem-1603285213.jpg', alt: 'Calliano Residencial — garagem, 1º pavimento', label: 'Garagem — 1º Pavimento' },
  { categoria: 'comum', src: 'https://estilofontana.com.br/images/empreendimento_planta/subsolo-1603285203.jpg', alt: 'Calliano Residencial — subsolo', label: 'Subsolo' },
]
const PLANTAS_GRUPOS = [
  { titulo: 'Apartamentos tipo', categoria: 'tipo' },
  { titulo: 'Coberturas, térreo e garagem', categoria: 'comum' },
]

// Tabela vigente traz apenas 1 unidade-exemplo (305) — não uma tabela completa. Veredito: texto seguro genérico.
const FAQ_ITEMS = [
  { pergunta: 'Quais são as condições de pagamento do Calliano Residencial?', resposta: 'Condições variam conforme unidade e modalidade. Consulte a tabela vigente para valores e disponibilidade. Condições conforme a tabela vigente, sujeitas à atualização. Consulte a tabela vigente para valores e disponibilidade por unidade.' },
  { pergunta: 'Todas as unidades têm a mesma metragem e o mesmo número de dormitórios?', resposta: 'Não. Os finais 1, 2, 4 e 5 têm 3 dormitórios (1 suíte); os finais 3 e 6 têm 2 dormitórios (1 suíte). Consulte o corretor para confirmar a planta e a metragem exata da unidade de seu interesse.' },
  { pergunta: 'Onde fica o Calliano Residencial?', resposta: 'O Calliano Residencial está localizado na Rua São José, Centro, Criciúma/SC.' },
]

export const metadata: Metadata = {
  title: 'Calliano Residencial — Pronto para Morar, Centro Criciúma/SC',
  description: 'Calliano Residencial, pronto para morar no Centro de Criciúma/SC — 2 ou 3 dormitórios e até 92 m² privativos. Consulte as condições de pagamento e a disponibilidade atualizadas.',
  alternates: { canonical: `${SITE_URL}/empreendimento/fontana/calliano-centro-criciuma-sc` },
  openGraph: {
    title: 'Calliano Residencial — Pronto para Morar, Centro Criciúma/SC | Stiven Allan',
    description: 'Pronto para morar — 2 ou 3 dorms · até 92 m² · Centro de Criciúma/SC. Consulte as condições de pagamento atualizadas.',
    url: `${SITE_URL}/empreendimento/fontana/calliano-centro-criciuma-sc`,
    images: [{ url: IMG.hero, width: 1200, height: 630, alt: 'Calliano Residencial — Criciúma SC' }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Calliano Residencial — Pronto para Morar, Centro Criciúma/SC | Stiven Allan', description: 'Pronto para morar — até 92 m² privativos no Centro de Criciúma.', images: [IMG.hero] },
  robots: { index: true, follow: true },
}

export default function CallianoPage() {
  return (
    <main style={{ background: t.bg, color: t.ink, fontFamily: t.body, overflowX: 'hidden' }}>
      <PropertySchema nome="Calliano Residencial" slug="calliano-centro-criciuma-sc" construtora_slug="fontana" cidade="Criciúma" uf="SC" bairro="Centro" descricao="Calliano Residencial, no Centro de Criciúma/SC — 2 ou 3 dormitórios (1 suíte), até 92 m² privativos, acabamento refinado e design italiano. Fale com Stiven Allan." imagem="https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/calliano-centro-criciuma-sc.jpg" faq={FAQ_ITEMS} />

      <style>{`
        html { scroll-behavior: smooth; }
        .ca-eyebrow { font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: ${t.terra}; font-family: ${t.display}; }
        .ca-h1 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: .06em; line-height: 1.08; }
        .ca-h2 { font-family: ${t.display}; font-weight: 300; text-transform: uppercase; letter-spacing: .07em; }
        .ca-serif { font-family: ${t.serif}; font-style: italic; }
        .ca-rule { width: 56px; height: 1px; background: ${t.terra}; margin: 20px 0; }
        .ca-cta { display: inline-flex; align-items: center; gap: 10px; padding: 13px 30px; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; font-family: ${t.display}; border: 1px solid ${t.terra}; color: ${t.terra}; background: transparent; cursor: pointer; text-decoration: none; transition: background .25s, color .25s; }
        .ca-cta:hover { background: ${t.terra}; color: #fff; }
        .ca-cta-light { display: inline-flex; align-items: center; gap: 10px; padding: 13px 30px; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; font-family: ${t.display}; border: 1px solid rgba(246,237,232,0.55); color: ${t.onDark}; background: transparent; cursor: pointer; text-decoration: none; transition: background .25s, color .25s; }
        .ca-cta-light:hover { background: rgba(246,237,232,0.12); }
        .ca-navlink { font-family: ${t.display}; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: #fff; text-decoration: none; opacity: .82; transition: opacity .2s; }
        .ca-navlink:hover { opacity: 1; }
        .ca-fade { animation: cafade .9s ease forwards; }
        @keyframes cafade { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        .ca-gcard { overflow: hidden; }
        .ca-gcard:hover img { transform: scale(1.04); }
        .ca-gcard img { transition: transform .55s ease; }
        .ca-amen { display: flex; align-items: center; gap: 14px; padding: 16px 0; border-bottom: 1px solid ${t.line}; font-size: 14px; color: ${t.ink}; }
        .ca-amen:last-child { border-bottom: none; }
        .ca-lazer-card { border-radius: 2px; overflow: hidden; }
        .ca-wa { position: fixed; right: 20px; bottom: 20px; z-index: 900; width: 54px; height: 54px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 18px rgba(0,0,0,0.22); text-decoration: none; transition: transform .2s; }
        .ca-wa:hover { transform: scale(1.08); }
        .ca-burger { display: none; }
        @media (max-width: 860px) { .ca-nav-links { display: none !important; } }
      `}</style>

      {/* HEADER */}
      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, padding: '28px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: t.display, fontWeight: 300, fontSize: 18, letterSpacing: '.18em', textTransform: 'uppercase', color: '#fff' }}>Stiven Allan</span>
        </a>
        <nav className="ca-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <a href="#residencial" className="ca-navlink">O Residencial</a>
          <a href="#galeria" className="ca-navlink">Galeria</a>
          <a href="#plantas" className="ca-navlink">Plantas</a>
          <a href="#localizacao" className="ca-navlink">Localização</a>
          <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ fontFamily: t.display, fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: '#fff', background: t.terra, padding: '10px 22px', textDecoration: 'none' }}>Quero saber mais</a>
        </nav>
      </header>

      {/* HERO */}
      <section id="top" style={{ position: 'relative', height: '100svh', minHeight: 560, overflow: 'hidden' }}>
        <HeroImage src={IMG.hero} alt="Calliano Residencial — Criciúma SC" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,11,7,0.72) 0%, rgba(17,11,7,0.18) 55%, transparent 100%)' }} />
        <div className="ca-fade" style={{ position: 'absolute', bottom: '10svh', left: '6vw', right: '6vw', maxWidth: 680 }}>
          <p className="ca-eyebrow" style={{ color: 'rgba(246,237,232,0.8)', marginBottom: 14 }}>Construtora Fontana · Centro · Criciúma/SC</p>
          <h1 className="ca-h1" style={{ fontSize: 'clamp(36px,6vw,80px)', color: '#fff', margin: '0 0 22px' }}>Calliano<br />Residencial</h1>
          <p className="ca-serif" style={{ fontSize: 'clamp(18px,2.2vw,26px)', color: 'rgba(246,237,232,0.88)', margin: '0 0 32px' }}>Idealizado para oferecer o melhor.</p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="ca-cta-light">Agendar visita</a>
        </div>
      </section>

      {/* O RESIDENCIAL */}
      <section id="residencial" style={{ padding: 'clamp(72px,10vw,120px) 6vw', maxWidth: 900, margin: '0 auto' }}>
        <p className="ca-eyebrow" style={{ marginBottom: 12 }}>O Residencial</p>
        <div className="ca-rule" />
        <p className="ca-serif" style={{ fontSize: 'clamp(24px,3.5vw,46px)', lineHeight: 1.28, color: t.ink, margin: '0 0 32px' }}>
          Inspirado em uma vila italiana onde a vida corre serena entre rotas de caminhada, cafés da tarde e boa culinária.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: t.muted, maxWidth: 680 }}>
          Inspirado em uma vila italiana onde a vida corre serena entre rotas de caminhada, cafés da tarde e boa culinária — o Calliano traz esse espírito para o centro de Criciúma, com requinte e tranquilidade para seus moradores.
        </p>
      </section>

      {/* GALERIA */}
      <section id="galeria" style={{ padding: '0 0 clamp(48px,8vw,96px)' }}>
        <div style={{ padding: '0 6vw', marginBottom: 32 }}>
          <p className="ca-eyebrow">Galeria de Fotos</p>
          <div className="ca-rule" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 3 }}>
          <GalleryWithLightbox galeria={GALERIA} prefix="ca-" gradient="rgba(17,11,7,0.55)" />
        </div>
      </section>

      {/* AS RESIDÊNCIAS */}
      <section id="plantas" style={{ background: t.dark, padding: 'clamp(72px,10vw,120px) 6vw' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <p className="ca-eyebrow" style={{ color: t.onDarkMuted }}>As Residências</p>
            <div className="ca-rule" style={{ background: t.terra }} />
            <h2 className="ca-h2" style={{ fontSize: 'clamp(28px,4vw,52px)', color: t.onDark, margin: '0 0 24px', lineHeight: 1.12 }}>Até 92 m²<br />de espaço privativo</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: t.onDarkMuted, marginBottom: 36 }}>
              2 ou 3 dormitórios com 1 suíte — até 92 m² privativos. Cada apartamento foi projetado com atenção aos detalhes para proporcionar conforto e sofisticação.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
              {[['2–3','Dormitórios'],['1','Suíte'],['92 m²','Área privativa'],['Sob consulta','Valor']].map(([val,lbl]) => (
                <div key={lbl}>
                  <div style={{ fontFamily: t.display, fontSize: 32, fontWeight: 200, color: t.onDark, letterSpacing: '.04em' }}>{val}</div>
                  <div style={{ fontFamily: t.display, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: t.onDarkMuted }}>{lbl}</div>
                </div>
              ))}
            </div>
            <LeadCaptureButton slug="calliano-centro-criciuma-sc" construtora_slug="fontana" className="ca-cta-light"  propertyDisplayName="Calliano Residencial" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '28px 32px', border: `1px solid rgba(246,237,232,0.12)`, borderRadius: 2 }}>
              <p style={{ fontFamily: t.display, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: t.onDarkMuted, margin: '0 0 8px' }}>Endereço</p>
              <p style={{ fontSize: 15, color: t.onDark, margin: 0 }}>Rua São José — Centro, Criciúma/SC</p>
            </div>
            <div style={{ padding: '28px 32px', border: `1px solid rgba(246,237,232,0.12)`, borderRadius: 2 }}>
              <p style={{ fontFamily: t.display, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: t.onDarkMuted, margin: '0 0 8px' }}>Status</p>
              <p style={{ fontSize: 15, color: t.onDark, margin: 0 }}>Entregue</p>
            </div>
            <div style={{ padding: '28px 32px', border: `1px solid rgba(246,237,232,0.12)`, borderRadius: 2 }}>
              <p style={{ fontFamily: t.display, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: t.onDarkMuted, margin: '0 0 8px' }}>Preço</p>
              <p style={{ fontSize: 15, color: t.onDark, margin: 0 }}>Sob consulta</p>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: 'clamp(64px,10vh,96px) auto 0', textAlign: 'left' }}>
          {PLANTAS_GRUPOS.map(({ titulo, categoria }) => {
            const itens = PLANTAS.filter(p => p.categoria === categoria)
            if (!itens.length) return null
            return (
              <div key={categoria} style={{ marginBottom: 40 }}>
                <p className="ca-eyebrow" style={{ color: t.onDarkMuted, marginBottom: 16, textAlign: 'center' }}>{titulo}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <GalleryWithLightbox galeria={itens} prefix="ca" gradient="rgba(17,11,7,0.6)" badge="Planta oficial" trackPlantas={{ empreendimento: 'calliano-centro-criciuma-sc', content_name: 'Calliano Residencial' }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section style={{ padding: 'clamp(72px,10vw,120px) 6vw', maxWidth: 1100, margin: '0 auto' }}>
        <p className="ca-eyebrow">Diferenciais das Unidades</p>
        <div className="ca-rule" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 0 }}>
          {DIFERENCIAIS.map((d, i) => (
            <div key={d} style={{ padding: '32px 28px', borderRight: i % 2 === 0 ? `1px solid ${t.line}` : 'none', borderBottom: `1px solid ${t.line}` }}>
              <div style={{ fontFamily: t.display, fontSize: 28, fontWeight: 200, color: t.terra, marginBottom: 12, letterSpacing: '.04em' }}>0{i+1}</div>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: t.muted, margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LAZER */}
      <section style={{ background: t.bg, padding: 'clamp(72px,10vw,120px) 6vw' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <p className="ca-eyebrow">Área de Lazer</p>
            <div className="ca-rule" />
            <h2 className="ca-h2" style={{ fontSize: 'clamp(24px,3vw,40px)', color: t.ink, margin: '0 0 32px' }}>Lazer completo<br />para toda a família</h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {AMENIDADES.map(a => (
                <li key={a} className="ca-amen">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.terra, flexShrink: 0 }} />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <LightboxPhoto
            src={IMG.lazer}
            alt="Área de lazer Calliano Residencial"
            label="Lazer"
            cardClass="ca-lazer-card"
            imgSizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section id="localizacao" style={{ background: t.dark, padding: 'clamp(72px,10vw,120px) 6vw' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <p className="ca-eyebrow" style={{ color: t.onDarkMuted }}>Localização</p>
            <div className="ca-rule" style={{ background: t.terra }} />
            <h2 className="ca-h2" style={{ fontSize: 'clamp(24px,3vw,40px)', color: t.onDark, margin: '0 0 24px' }}>Centro de<br />Criciúma/SC</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: t.onDarkMuted, marginBottom: 12 }}>Rua São José — Centro</p>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: t.onDarkMuted, marginBottom: 32 }}>Localização privilegiada no coração de Criciúma, próximo a comércio, serviços e tudo que a cidade oferece de melhor.</p>
            <a href="https://www.google.com/maps/search/?api=1&query=Rua+S%C3%A3o+Jos%C3%A9%2C+Centro%2C+Crici%C3%BAma+SC" target="_blank" rel="noopener noreferrer" className="ca-cta-light">Ver no mapa</a>
          </div>
          <div style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 2, overflow: 'hidden' }}>
            <Image unoptimized src={IMG.mapa} alt="Mapa localização Calliano Residencial" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* FINANCIAMENTO */}
      <section style={{ background: t.terra, padding: 'clamp(72px,10vw,120px) 6vw' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="ca-eyebrow" style={{ color: 'rgba(246,237,232,0.7)' }}>Como adquirir</p>
          <div className="ca-rule" style={{ background: 'rgba(246,237,232,0.5)' }} />
          <h2 className="ca-h2" style={{ fontSize: 'clamp(24px,3.5vw,44px)', color: t.onDark, margin: '0 0 24px' }}>Financiamento<br />Direto com a Construtora</h2>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: t.onDarkMuted, maxWidth: 640, margin: '0 0 40px' }}>Condições variam conforme unidade e modalidade. Consulte a tabela vigente para valores e disponibilidade.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, marginBottom: 48 }}>
            {[
              ['01','Escolha seu imóvel','Selecione a planta ideal para você e sua família.'],
              ['02','Fale com Stiven','Tire todas as dúvidas pelo WhatsApp — rápido e sem burocracia.'],
              ['03','Realize seu sonho','Condições personalizadas para o seu perfil.'],
            ].map(([n,t1,t2]) => (
              <div key={n}>
                <div style={{ fontFamily: t.display, fontSize: 36, fontWeight: 200, color: 'rgba(246,237,232,0.5)', marginBottom: 12 }}>{n}</div>
                <p style={{ fontFamily: t.display, fontSize: 14, letterSpacing: '.12em', textTransform: 'uppercase', color: t.onDark, margin: '0 0 8px' }}>{t1}</p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: t.onDarkMuted, margin: 0 }}>{t2}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={CATALOGO_PDF} target="_blank" rel="noopener noreferrer" className="ca-cta-light">Baixar catálogo</a>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="ca-cta-light">Falar com Stiven</a>
          </div>
          <p style={{ marginTop: 40, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(246,237,232,0.7)' }}>Condições conforme a tabela vigente, sujeitas à atualização. Consulte a tabela vigente para valores e disponibilidade por unidade.</p>
        </div>
      </section>

      {/* SEO FAQ */}
      <PropertyFAQ items={FAQ_ITEMS} accent={t.terra} />

      <RelatedProperties atualSlug="calliano-centro-criciuma-sc" cidade="Criciúma" />

      {/* CTA FINAL */}
      <section style={{ position: 'relative', minHeight: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Image unoptimized src={IMG.hero} alt="Calliano Residencial — Criciúma" fill sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,11,7,0.72)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 6vw' }}>
          <p className="ca-eyebrow" style={{ color: 'rgba(246,237,232,0.7)', marginBottom: 16 }}>Calliano Residencial</p>
          <h2 className="ca-serif" style={{ fontSize: 'clamp(28px,5vw,60px)', color: t.onDark, margin: '0 0 32px', lineHeight: 1.2 }}>Idealizado para oferecer o melhor.</h2>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="ca-cta-light">Quero saber mais</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: t.terraDark, padding: 'clamp(48px,8vw,80px) 6vw' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 48 }}>
          <div>
            <span style={{ fontFamily: t.display, fontWeight: 300, fontSize: 16, letterSpacing: '.18em', textTransform: 'uppercase', color: t.onDark }}>Stiven Allan</span>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: t.onDarkMuted, marginTop: 16 }}>Especialista em imóveis de alto padrão da Construtora Fontana em Santa Catarina.</p>
          </div>
          <div>
            <p style={{ fontFamily: t.display, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: t.onDarkMuted, marginBottom: 16 }}>Contato</p>
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 13, color: t.onDark, textDecoration: 'none', marginBottom: 8 }}>WhatsApp: (48) 99164-2332</a>
            <a href="mailto:stivenallan@gmail.com" style={{ display: 'block', fontSize: 13, color: t.onDark, textDecoration: 'none' }}>stivenallan@gmail.com</a>
          </div>
          <div>
            <p style={{ fontFamily: t.display, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: t.onDarkMuted, marginBottom: 16 }}>Empreendimento</p>
            <p style={{ fontSize: 13, color: t.onDark, margin: '0 0 6px' }}>Calliano Residencial</p>
            <p style={{ fontSize: 13, color: t.onDarkMuted, margin: 0 }}>Centro · Criciúma/SC</p>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '32px auto 0', paddingTop: 24, borderTop: `1px solid rgba(246,237,232,0.1)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: t.onDarkMuted, margin: 0 }}>© {new Date().getFullYear()} Stiven Allan · Todos os direitos reservados</p>
          <a href="/" style={{ fontSize: 12, color: t.onDarkMuted, textDecoration: 'none' }}>Ver todos os imóveis</a>
        </div>
      </footer>

      {/* WHATSAPP FIXED */}
      <a href={WPP} target="_blank" rel="noopener noreferrer" className="ca-wa" aria-label="WhatsApp">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
      </a>
    </main>
  )
        }
