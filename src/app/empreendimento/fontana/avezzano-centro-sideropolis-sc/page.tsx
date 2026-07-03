import type { Metadata } from 'next';
import GalleryWithLightbox from './gallery-lightbox';
import { LeadCaptureButton } from '@/components/LeadCaptureButton'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import { SITE_URL } from '@/lib/site'

export const revalidate = 3600;

const ACCENT = '#5B3427';
const ACCENT_DARK = '#3d2219';
const WA = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Avezzano%20Residencial.';
const HERO = 'https://estilofontana.com.br/images/empreendimento/slideshows/avezzano-residencial-61a626507d294.jpg?fm=webp';

const GALERIA = [
  { src: 'https://lh3.googleusercontent.com/d/1teagfJJc-4pfX8o6uiFdTR-kwTnYhB23', alt: 'Fachada' },
  { src: 'https://lh3.googleusercontent.com/d/1bGjbfuBNtE5CojVHa2ymhK2UcIqgX_7U', alt: 'Acesso' },
  { src: 'https://lh3.googleusercontent.com/d/179ccQjOJ4CMoyZsQdM_ladrfI9GdkGc_', alt: 'Hall de Entrada' },
  { src: 'https://lh3.googleusercontent.com/d/1IvoIY1NhC3BrQ0jgWZFQyKGN4yTuXDFe', alt: 'Hall — Vista 2' },
  { src: 'https://lh3.googleusercontent.com/d/1mzt8N1i4uAKh__Yq1M8dqon3mmdPzbFJ', alt: 'Salão de Festas' },
  { src: 'https://lh3.googleusercontent.com/d/1ZVdwvaTarO7HbKgxPMRLjgL2GX09ftX6', alt: 'Salão Gourmet' },
  { src: 'https://lh3.googleusercontent.com/d/19J_HYJIhTyY9CKnfLfY1Uf8Uo3PTebsB', alt: 'Área de Festas' },
  { src: 'https://lh3.googleusercontent.com/d/1_OS8kjfeFaCRMT9GEGLKt8ygx98B06SA', alt: 'Apartamento Tipo' },
  { src: 'https://lh3.googleusercontent.com/d/12naltpwq7FnSkCWKw_ZW048rTZwgr-FB', alt: 'Living com Vista' },
  { src: 'https://lh3.googleusercontent.com/d/10QTO7wycnnDY-xD8lSc-aG6CoqkQexMZ', alt: 'Sacada' },
  { src: 'https://lh3.googleusercontent.com/d/1CYgrjHd-CNBWhWVij-AYjnYoq2rQu0Kl', alt: 'PlayGround' },
];

export const metadata: Metadata = {
  title: 'Avezzano Residencial | Centro Siderópolis SC',
  description: 'Avezzano Residencial — 3 dormitórios (3 suítes), até 127 m², Centro de Siderópolis/SC. Financiamento direto Fontana, sem bancos. Conheça com Stiven Allan.',
  openGraph: {
    title: 'Avezzano Residencial | Centro Siderópolis SC',
    description: 'Permita-se viver no melhor. Apartamentos com 3 suítes até 127 m² no coração de Siderópolis.',
    images: [{ url: HERO }],
  },
};

export default function AvezzanoPage() {
  return (
    <main style={{ fontFamily: "'Inter', sans-serif", color: '#1a1a1a', overflowX: 'hidden' }}>
      <PropertySchema nome="Avezzano" slug="avezzano-centro-sideropolis-sc" construtora_slug="fontana" cidade="Siderópolis" uf="SC" bairro="Centro" descricao="Avezzano Residencial — 3 dormitórios (3 suítes), até 127 m², Centro de Siderópolis/SC. Financiamento direto Fontana, sem bancos. Conheça com Stiven Allan." imagem="https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/avezzano-centro-sideropolis-sc.jpg" faq={[{"pergunta":"Como funciona o pagamento do Avezzano?","resposta":"Entrada e saldo por financiamento bancário ou parcelado direto com a construtora em até 240 meses, com correção IGPM + 0,75% a.m."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Sim. Além do financiamento direto com a construtora, é possível optar por financiamento bancário. Fale com o Stiven pelo WhatsApp para simular as duas opções."},{"pergunta":"Onde fica o Avezzano?","resposta":"O Avezzano está localizado no Centro, Siderópolis/SC."}]} />

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '64px' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em' }}>AVEZZANO RESIDENCIAL</span>
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
        <img src={HERO} alt="Avezzano Residencial — Salão de Festas"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1.5rem' }}>
          <p style={{ color: ACCENT, fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1rem' }}>Centro · Siderópolis / SC</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 300, lineHeight: 1.1, margin: '0 0 1.25rem', maxWidth: '800px' }}>
            Avezzano<br /><strong style={{ fontWeight: 700 }}>Residencial</strong>
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#e8d5c0', fontSize: 'clamp(1.4rem,3vw,2.2rem)', fontStyle: 'italic', marginBottom: '2rem' }}>
            "Permita-se viver no melhor."
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
            Inspirado na <strong style={{ fontWeight: 700 }}>comune italiana de Avezzano</strong>
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.9, color: '#555', marginBottom: '2rem' }}>
            Conforto e segurança em uma construção moderna. Espaços amplos e arejados em perfeita sintonia entre conforto e liberdade — uma experiência de morar que transcende o cotidiano.
          </p>
          <blockquote style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontStyle: 'italic', color: '#333', borderLeft: `4px solid ${ACCENT}`, paddingLeft: '1.5rem', margin: '2.5rem auto', maxWidth: '600px', textAlign: 'left' }}>
            "Permita-se viver no melhor."
          </blockquote>
          <p style={{ fontSize: '1rem', lineHeight: 1.9, color: '#555' }}>
            3 dormitórios com 3 suítes, apartamentos de até 127 m² privativos no coração de Siderópolis/SC. Uma construção que honra cada detalhe com acabamentos nobres e espaços que respiram elegância.
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
              { n: '3', l: 'dormitórios' },
              { n: '3', l: 'suítes' },
              { n: '127', l: 'm² privativos' },
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
            {['3 suítes','Living amplo','Lavabo','Home office','Fechadura digital','2 elevadores','Churrasqueira'].map((item, i) => (
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
            {['Salão de festas','Playground','Churrasqueira'].map(item => (
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
            Rua Vereador José Feltrin — Centro, Siderópolis/SC
          </p>
          <div style={{ borderRadius: '4px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
            <iframe
              src="https://maps.google.com/maps?q=Rua+Vereador+Jos%C3%A9+Feltrin,+Centro,+Sider%C3%B3polis,+SC&output=embed"
              width="100%" height="400" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy"
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
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
            Plantas, acabamentos e todos os detalhes do Avezzano Residencial.
          </p>
          <LeadCaptureButton slug="avezzano-centro-sideropolis-sc" construtora_slug="fontana"  propertyDisplayName="Avezzano Residencial" />
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
        <img src={HERO} alt="Avezzano Residencial"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }} />
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1.5rem' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#e8d5c0', fontSize: 'clamp(1.5rem,3vw,2.5rem)', fontStyle: 'italic', marginBottom: '2rem' }}>
            "Permita-se viver no melhor."
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
        <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>Avezzano Residencial · Centro, Siderópolis/SC · Construtora Fontana</p>
      </footer>

      {/* WHATSAPP FLUTUANTE */}
      <a href={WA} target="_blank" rel="noopener" aria-label="WhatsApp"
        style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 100, background: '#25D366', color: '#fff', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', textDecoration: 'none', fontSize: '1.6rem' }}>
        💬
      </a>

    </main>
  );
}
