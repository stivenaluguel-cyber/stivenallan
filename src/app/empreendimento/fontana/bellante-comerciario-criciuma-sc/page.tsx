import type { Metadata } from 'next';
import GalleryWithLightbox from './gallery-lightbox';
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

export const revalidate = 3600;

const ACCENT = '#2C4A7C';
const ACCENT_DARK = '#1a2d4d';
const WA = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Bellante%20Residencial.';
const HERO = 'https://estilofontana.com.br/images/empreendimento/slideshows/bellante-residencial-642b0899097e5.jpg?fm=webp';

const GALERIA = [
  { src: 'https://lh3.googleusercontent.com/d/12AAsmhPmf2OEAiJ92P1XFUTZMuXYgYjG', alt: 'Fachada' },
  { src: 'https://lh3.googleusercontent.com/d/103UpUylOmmcbrTKDW6WOKzMQXKh8dhZd', alt: 'Fachada Angular' },
  { src: 'https://lh3.googleusercontent.com/d/1iWi0zYgKgJXjmjT2DyDm3HiN6owTPqeW', alt: 'Acesso Principal' },
  { src: 'https://lh3.googleusercontent.com/d/1HSe-qPq4ls2PxPgmq08CjORCPOT41nSl', alt: 'Hall de Entrada' },
  { src: 'https://lh3.googleusercontent.com/d/11z8F7-sNFXFdOcjD4hP8LMePeBqBQXAI', alt: 'Living' },
  { src: 'https://lh3.googleusercontent.com/d/1muQ1uCeg1AxqAfU1nr75jD5za255GuiJ', alt: 'Suíte' },
  { src: 'https://lh3.googleusercontent.com/d/1lvfLyc4vx7abIoitI4YUNo5Ld4juYwyV', alt: 'Salão de Festas' },
  { src: 'https://lh3.googleusercontent.com/d/1gt3r9jjuDGpK7Vj5hU5MruqexMw9u05f', alt: 'Sports Pub' },
  { src: 'https://lh3.googleusercontent.com/d/1aFh_rFpxaI-vagoiOhhWdMoWto4vtISd', alt: 'Coworking' },
  { src: 'https://lh3.googleusercontent.com/d/1Rmvc_bwvgr4LJISFgN4ObYzZ67b8R-pv', alt: 'Academia' },
];

export const metadata: Metadata = {
  title: 'Bellante Residencial | Comerciário Criciúma SC',
  description: 'Bellante Residencial — 2 dormitórios (1 suíte), 62–66 m², Comerciário em Criciúma/SC. Em obras. Financiamento direto Fontana. Conheça com Stiven Allan.',
  openGraph: {
    title: 'Bellante Residencial | Comerciário Criciúma SC | Stiven Allan',
    description: 'Feito para você. Apartamentos com 2 dorms (1 suíte) de 62–66 m² no Comerciário de Criciúma.',
    images: [{ url: HERO }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bellante Residencial | Comerciário Criciúma SC | Stiven Allan',
    description: 'Feito para você. Apartamentos com 2 dorms (1 suíte) de 62–66 m² no Comerciário de Criciúma.',
    images: [HERO],
  },
};

export default function BellantePage() {
  return (
    <main style={{ fontFamily: "'Inter', sans-serif", color: '#1a1a1a', overflowX: 'hidden' }}>
      <PropertySchema nome="Bellante" slug="bellante-comerciario-criciuma-sc" construtora_slug="fontana" cidade="Criciúma" uf="SC" bairro="Comerciário" descricao="Bellante Residencial — 2 dormitórios (1 suíte), 62–66 m², Comerciário em Criciúma/SC. Em obras. Financiamento direto Fontana. Conheça com Stiven Allan." imagem="https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/bellante-comerciario-criciuma-sc.jpg" faq={[{"pergunta":"Como funciona o financiamento direto do Bellante?","resposta":"Entrada de 20%, saldo em até 60 parcelas mensais e 2 reforços anuais (cada reforço equivale a 5 parcelas mensais), com correção pelo CUB/SC durante a obra. Sem análise de banco."},{"pergunta":"Qual a previsão de entrega do Bellante?","resposta":"A previsão de entrega é novembro de 2026, em Comerciário, Criciúma/SC."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Sim. Além do financiamento direto com a construtora, é possível optar por financiamento bancário. Fale com o Stiven pelo WhatsApp para simular as duas opções."},{"pergunta":"Onde fica o Bellante?","resposta":"O Bellante está localizado no Comerciário, Criciúma/SC."}]} />

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '64px' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em' }}>BELLANTE RESIDENCIAL</span>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {['O Residencial','Galeria','As Residências','Lazer','Localização','Financiamento'].map(s => (
            <a key={s} href={`#${s.toLowerCase().replace(/\s/g,'-').replace(/ê/g,'e').replace(/ã/g,'a').replace(/ç/g,'c')}`}
              style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {s}
            </a>
          ))}
          <a href={WA} target="_blank" rel="noopener"
            style={{ background: ACCENT, color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '2px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em' }}>
            FALAR COM STIVEN
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', minHeight: '600px', overflow: 'hidden' }}>
        <img src={HERO} alt="Bellante Residencial — Fachada"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1.5rem' }}>
          <p style={{ color: '#a8bfdf', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1rem' }}>Comerciário · Criciúma / SC</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 300, lineHeight: 1.1, margin: '0 0 1.25rem', maxWidth: '800px' }}>
            Bellante<br /><strong style={{ fontWeight: 700 }}>Residencial</strong>
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#c8d8ef', fontSize: 'clamp(1.4rem,3vw,2.2rem)', fontStyle: 'italic', marginBottom: '2rem' }}>
            "Feito para você."
          </p>
          <a href={WA} target="_blank" rel="noopener"
            style={{ background: ACCENT, color: '#fff', padding: '1rem 2.5rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: '2px' }}>
            QUERO SABER MAIS
          </a>
        </div>
      </section>

      {/* O RESIDENCIAL */}
      <section id="o-residencial" style={{ background: '#faf9f7', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: ACCENT, fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem' }}>O Residencial</p>
          <div style={{ width: '40px', height: '2px', background: ACCENT, margin: '0 auto 2rem' }} />
          <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 300, lineHeight: 1.3, marginBottom: '2rem', color: '#1a1a1a' }}>
            Arquitetura única.<br /><strong style={{ fontWeight: 700 }}>Localização privilegiada.</strong>
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.9, color: '#555', marginBottom: '2rem' }}>
            No Bellante Residencial, a arquitetura é única e os motivos para viver nele são muitos. Um projeto moderno que acolhe e expressa a personalidade de seus moradores, em localização privilegiada de Criciúma.
          </p>
          <blockquote style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontStyle: 'italic', color: '#333', borderLeft: `4px solid ${ACCENT}`, paddingLeft: '1.5rem', margin: '2.5rem auto', maxWidth: '600px', textAlign: 'left' }}>
            "Feito para você."
          </blockquote>
          <p style={{ fontSize: '1rem', lineHeight: 1.9, color: '#555' }}>
            2 dormitórios com 1 suíte, apartamentos de 62 a 66 m² privativos no Comerciário em Criciúma/SC. Em obras. Uma construção que honra cada detalhe com acabamentos nobres e espaços que respiram elegância.
          </p>
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" style={{ padding: '5rem 1.5rem', background: '#111' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ color: ACCENT, fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.75rem' }}>Galeria</p>
          <div style={{ width: '40px', height: '2px', background: ACCENT, margin: '0 auto 3rem' }} />
          <GalleryWithLightbox images={GALERIA} accent={ACCENT} />
        </div>
      </section>

      {/* AS RESIDÊNCIAS */}
      <section id="as-residencias" style={{ background: '#1a1a1a', color: '#fff', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: ACCENT, fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>As Residências</p>
          <div style={{ width: '40px', height: '2px', background: ACCENT, margin: '0 auto 2.5rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {[
              { n: '2', l: 'dormitórios' },
              { n: '1', l: 'suíte' },
              { n: '62–66', l: 'm² privativos' },
              { n: '2', l: 'elevadores' },
            ].map(({ n, l }) => (
              <div key={l} style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 200, color: '#fff', margin: 0, lineHeight: 1 }}>{n}</p>
                <p style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', margin: '0.5rem 0 0' }}>{l}</p>
              </div>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '650px', margin: '0 auto' }}>
            Residências pensadas para quem exige o melhor. Ambientes integrados, acabamentos nobres e espaços que celebram cada momento da sua história.
          </p>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section id="diferenciais" style={{ background: '#faf9f7', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ color: ACCENT, fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.75rem' }}>Diferenciais das Unidades</p>
          <div style={{ width: '40px', height: '2px', background: ACCENT, margin: '0 auto 3rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {['1 suíte','Pé direito duplo no hall','Rebaixo em gesso','Espera p/ split'].map((item, i) => (
              <div key={item} style={{ background: '#fff', padding: '1.75rem 2rem', borderTop: `3px solid ${ACCENT}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', color: ACCENT, fontWeight: 300, display: 'block', marginBottom: '0.5rem' }}>{String(i + 1).padStart(2, '0')}</span>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1a1a1a', margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAZER */}
      <section id="lazer" style={{ background: '#111', color: '#fff', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: ACCENT, fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Lazer & Áreas Comuns</p>
          <div style={{ width: '40px', height: '2px', background: ACCENT, margin: '0 auto 2.5rem' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            {['Bicicletário','Coworking','Salão de Festas','Espaço Fitness','Sports Pub','Churrasqueira','2 Elevadores'].map(item => (
              <span key={item} style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '0.6rem 1.4rem', fontSize: '0.85rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.8)' }}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section id="localizacao" style={{ padding: '6rem 1.5rem', background: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ color: ACCENT, fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.75rem' }}>Localização</p>
          <div style={{ width: '40px', height: '2px', background: ACCENT, margin: '0 auto 2.5rem' }} />
          <p style={{ textAlign: 'center', color: '#555', marginBottom: '2.5rem', fontSize: '1rem' }}>
            Rua Treze de Maio, 92 — Comerciário, Criciúma/SC
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <img src="https://estilofontana.com.br/images/2023/04/06/localizacao-bellante-642edb705c4c6.jpg?fm=webp"
              alt="Localização Bellante Residencial — Comerciário Criciúma"
              style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '4px' }} />
            <div style={{ borderRadius: '4px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
              <iframe
                src="https://maps.google.com/maps?q=Rua+Treze+de+Maio+92,+Comerci%C3%A1rio,+Crici%C3%BAma,+SC&output=embed"
                width="100%" height="300" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy"
              />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <a href={WA} target="_blank" rel="noopener"
              style={{ background: ACCENT, color: '#fff', padding: '1rem 2.5rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: '2px', display: 'inline-block' }}>
              AGENDAR VISITA
            </a>
          </div>
        </div>
      </section>

      {/* CATÁLOGO DOWNLOAD */}
      <section id="catalogo" style={{ background: ACCENT, padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem' }}>Material Completo</p>
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 300, marginBottom: '1rem' }}>
            Baixe o <strong style={{ fontWeight: 700 }}>catálogo completo</strong>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Plantas, acabamentos e todos os detalhes do Bellante Residencial.
          </p>
          <LeadCaptureButton slug="bellante-comerciario-criciuma-sc" construtora_slug="fontana"  propertyDisplayName="Bellante Residencial" />
        </div>
      </section>

      {/* FINANCIAMENTO DIRETO */}
      <section id="financiamento" style={{ background: ACCENT_DARK, color: '#fff', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Facilidade</p>
          <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.4)', margin: '0 auto 2rem' }} />
          <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 300, marginBottom: '1rem' }}>
            Financiamento <strong style={{ fontWeight: 700 }}>Direto Fontana</strong>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '3rem', fontSize: '1rem' }}>Sem banco. Sem burocracia. Condições sob medida para você.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {[
              { n: '01', t: 'Converse com Stiven', d: 'Entenda as condições e tire todas as suas dúvidas.' },
              { n: '02', t: 'Condições sob medida', d: 'Parcelas e prazos personalizados para o seu perfil.' },
              { n: '03', t: 'Realize seu sonho', d: 'Assine o contrato e conquiste seu apartamento.' },
            ].map(({ n, t, d }) => (
              <div key={n} style={{ padding: '2rem', background: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.5rem', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>{n}</span>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: '0.5rem 0 0.5rem', color: '#fff' }}>{t}</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 300 }}>Preço: <strong style={{ fontWeight: 700 }}>Sob consulta</strong></p>
          <a href={WA} target="_blank" rel="noopener"
            style={{ display: 'inline-block', marginTop: '1.5rem', background: '#fff', color: ACCENT_DARK, padding: '1rem 2.5rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: '2px' }}>
            CONSULTAR CONDIÇÕES
          </a>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ position: 'relative', height: '60vh', minHeight: '400px', overflow: 'hidden' }}>
        <img src={HERO} alt="Bellante Residencial"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }} />
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1.5rem' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#c8d8ef', fontSize: 'clamp(1.5rem,3vw,2.5rem)', fontStyle: 'italic', marginBottom: '2rem' }}>
            "Feito para você."
          </p>
          <a href={WA} target="_blank" rel="noopener"
            style={{ background: ACCENT, color: '#fff', padding: '1rem 2.5rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: '2px' }}>
            FALAR COM STIVEN
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0d0d0d', color: 'rgba(255,255,255,0.55)', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontWeight: 700, color: '#fff', marginBottom: '0.5rem', fontSize: '1rem', letterSpacing: '0.1em' }}>STIVEN ALLAN</p>
        <p style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>CRECI/SC 60.275</p>
        <a href={WA} target="_blank" rel="noopener" style={{ color: '#25D366', textDecoration: 'none', fontSize: '0.85rem' }}>WhatsApp: (48) 99164-2332</a>
        <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>Bellante Residencial · Comerciário, Criciúma/SC · Construtora Fontana</p>
      </footer>

      {/* WHATSAPP FLUTUANTE */}
      <a href={WA} target="_blank" rel="noopener" aria-label="WhatsApp"
        style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 100, background: '#25D366', color: '#fff', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', textDecoration: 'none', fontSize: '1.6rem' }}>
        💬
      </a>

    </main>
  );
}
