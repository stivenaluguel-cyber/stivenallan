import type { Metadata } from 'next';
import GalleryWithLightbox from './gallery-lightbox';

export const revalidate = 3600;

const ACCENT = '#5C3D2E';
const ACCENT_DARK = '#3b2419';
const WA = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Bosco%20Del%20Montello%20Residencial.';
const HERO = 'https://estilofontana.com.br/images/empreendimento/slideshows/bosco-del-montello-residencial-613a4794e8ddd.jpg?fm=webp';

const GALERIA = [
  { src: 'https://lh3.googleusercontent.com/d/1tzsfiyBrHb0TF_tY1qpEgLa0Rq12Rl6M', alt: 'Fachada — Torre B' },
  { src: 'https://lh3.googleusercontent.com/d/18dppXmv4AfEH8YRloVCS-5S89HUa_-_K', alt: 'Hall de Entrada — Torre A' },
  { src: 'https://lh3.googleusercontent.com/d/1ZLgZXWRErlML66rOa-N08Sc5dNkOd6RQ', alt: 'Hall de Entrada — Torre B' },
  { src: 'https://lh3.googleusercontent.com/d/1-Xbuto_y1eNxXdHKk9iha0PoxR1fBRN0', alt: 'Hall — Vista 2' },
  { src: 'https://lh3.googleusercontent.com/d/1KQ17kp5A-nZGJTIiGy-4QW5IGnD3Bvsw', alt: 'Hall — Vista 3' },
  { src: 'https://lh3.googleusercontent.com/d/12PK77XlYYA4lTeS-1LlazSla039Zpo20', alt: 'Sala de Jogos' },
  { src: 'https://lh3.googleusercontent.com/d/1wm6LhHH5L5e86ivCuFJTkmy0k3nH4vzR', alt: 'Espaço Gourmet' },
  { src: 'https://lh3.googleusercontent.com/d/1MbFHE5do6n0ZT4zuuNFLSfywq6TuRam3', alt: 'Salão de Festas — Torre A' },
  { src: 'https://lh3.googleusercontent.com/d/15RMbMUFl-5Z4VsqexXPCAIte0Q4RoUR4', alt: 'Salão de Festas — Torre B' },
  { src: 'https://lh3.googleusercontent.com/d/13BOG-GYhIZOhrcSMDh_61042HKsayUWC', alt: 'Salão de Festas — Vista 2' },
  { src: 'https://lh3.googleusercontent.com/d/1wY_vq0N_dydBErqqvQGUhNFs5PUvExis', alt: 'Brinquedoteca' },
  { src: 'https://lh3.googleusercontent.com/d/1Yd2sVtxaukeIOluIZR1UGvUdZ--obBGL', alt: 'Academia' },
  { src: 'https://lh3.googleusercontent.com/d/1sifUF6yi3GGIX6xDhRwiBrRXbgqaR0tL', alt: 'Academia — Vista 2' },
  { src: 'https://lh3.googleusercontent.com/d/1xIOknHMPEN_zVjZOS0hIM2EfeR7TCXaG', alt: 'Apartamento Tipo' },
  { src: 'https://lh3.googleusercontent.com/d/1uoDzPSvBCQkyttcfT_gC6HH-QNcBbc9X', alt: 'Apartamento — Vista 2' },
];

const DIFERENCIAIS = [
  '1 suíte',
  'Paredes externas 20 cm (conforto acústico)',
  'Persianas com blackout',
  'Sacada privativa',
];

export const metadata: Metadata = {
  title: 'Bosco Del Montello Residencial | Centro Criciúma SC | Stiven Allan',
  description: 'Bosco Del Montello Residencial — 2 dormitórios (1 suíte), até 66 m², Centro de Criciúma/SC. Financiamento direto Fontana. Conheça com Stiven Allan CRECI 60.275.',
  openGraph: { title: 'Bosco Del Montello Residencial | Centro Criciúma SC | Stiven Allan', description: 'Repleto de detalhes únicos. Apartamentos com 1 suíte até 66 m² no Centro de Criciúma.', images: [{ url: HERO }] },
};

export default function BoscoPage() {
  return (
    <main style={{ fontFamily: "'Inter', sans-serif", color: '#1a1a1a', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '64px' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em' }}>BOSCO DEL MONTELLO</span>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {['O Residencial','Galeria','As Residências','Diferenciais','Localização'].map(s => (
            <a key={s} href={`#${s.toLowerCase().replace(/\s/g,'-').replace(/ê/g,'e').replace(/ã/g,'a').replace(/ç/g,'c')}`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s}</a>
          ))}
          <a href={WA} target="_blank" rel="noopener" style={{ background: ACCENT, color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '2px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em' }}>FALAR COM STIVEN</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', minHeight: '600px', overflow: 'hidden' }}>
        <img src={HERO} alt="Bosco Del Montello Residencial — Fachada" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '0 clamp(1.5rem,5vw,4rem) clamp(3.5rem,8vh,6rem)' }}>
          <p style={{ color: '#d4b8a8', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1rem' }}>Centro · Criciúma / SC</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2.8rem,7vw,6rem)', fontWeight: 300, lineHeight: 1.04, margin: '0 0 1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Bosco Del Montello<br /><strong style={{ fontWeight: 700 }}>Residencial</strong>
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#e8d5c0', fontSize: 'clamp(1.4rem,3vw,2.2rem)', fontStyle: 'italic', marginBottom: '2rem' }}>Repleto de detalhes únicos.</p>
          <a href={WA} target="_blank" rel="noopener" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.7)', color: '#fff', padding: '1rem 2.5rem', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase' }}>ATENDIMENTO EXCLUSIVO</a>
        </div>
      </section>

      {/* O RESIDENCIAL */}
      <section id="o-residencial" style={{ background: '#faf9f7', padding: 'clamp(5rem,12vh,10rem) clamp(1.5rem,5vw,4rem)' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: ACCENT, fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 500 }}>O Residencial</p>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1.5rem,3vw,2.5rem)', lineHeight: 1.35, color: '#1a1a1a', margin: '0 0 2rem' }}>
            Aqui você vai viver o melhor dos dois mundos: desfrutar da privacidade dentro do seu apartamento e ainda dividir muitas horas de alegria nos espaços inspirados no seu estilo.
          </p>
          <hr style={{ width: '56px', height: '1px', border: 0, background: ACCENT, margin: '0 auto' }} />
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" style={{ padding: 'clamp(3rem,7vh,5rem) 0 0' }}>
        <div style={{ textAlign: 'center', padding: '0 clamp(1.5rem,5vw,4rem) clamp(2rem,5vh,3.5rem)' }}>
          <p style={{ color: ACCENT, fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 500 }}>Galeria</p>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 'clamp(1.6rem,3.5vw,2.8rem)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, color: '#1a1a1a' }}>Sinta-se em casa</h2>
        </div>
        <div style={{ background: '#111' }}>
          <GalleryWithLightbox images={GALERIA} accent={ACCENT} />
        </div>
      </section>

      {/* AS RESIDÊNCIAS */}
      <section id="as-residencias" style={{ background: '#1a1a1a', color: '#fff', padding: 'clamp(5rem,12vh,10rem) clamp(1.5rem,5vw,4rem)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 500 }}>As Residências</p>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 'clamp(1.6rem,3.5vw,2.8rem)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 1rem', color: '#fff' }}>Espaço para viver bem</h2>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(1.1rem,2vw,1.5rem)', fontStyle: 'italic', marginBottom: '4rem' }}>Plantas amplas, acabamentos nobres.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'clamp(2rem,5vw,4rem)', marginBottom: '3.5rem' }}>
            {[{ n: '2', l: 'dormitórios' },{ n: '1', l: 'suíte' },{ n: '66', l: 'm² privativos' },{ n: '2', l: 'elevadores' }].map(({ n, l }) => (
              <div key={l}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 'clamp(2.2rem,4.5vw,3.5rem)', letterSpacing: '0.04em', color: '#fff', margin: 0, lineHeight: 1 }}>{n}</p>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', margin: '0.75rem 0 0' }}>{l}</p>
              </div>
            ))}
          </div>
          <a href={WA} target="_blank" rel="noopener" style={{ display: 'inline-block', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', padding: '1rem 2.5rem', textDecoration: 'none', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>FALAR COM STIVEN</a>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section id="diferenciais" style={{ padding: 'clamp(5rem,12vh,10rem) clamp(1.5rem,5vw,4rem)', background: '#faf9f7' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem,6vh,4.5rem)' }}>
            <p style={{ color: ACCENT, fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 500 }}>Diferenciais das Unidades</p>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 'clamp(1.6rem,3.5vw,2.8rem)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Detalhes que elevam o morar</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1px', background: 'rgba(22,32,43,0.12)' }}>
            {DIFERENCIAIS.map((d, i) => (
              <div key={i} style={{ background: '#faf9f7', padding: 'clamp(1.75rem,4vw,2.75rem)' }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: '1.375rem', color: ACCENT, marginBottom: '0.875rem' }}>{String(i + 1).padStart(2, '0')}</div>
                <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.5, color: '#1a1a1a' }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAZER */}
      <section style={{ background: '#111', color: '#fff', padding: 'clamp(5rem,12vh,10rem) clamp(1.5rem,5vw,4rem)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 500 }}>Lazer & Áreas Comuns</p>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 'clamp(1.6rem,3.5vw,2.8rem)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 3rem', color: '#fff' }}>Uma casa que surpreende</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            {['Academia','Brinquedoteca','Sala de Jogos','Salão de Festas','2 Elevadores'].map(item => (
              <span key={item} style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '0.6rem 1.4rem', fontSize: '0.85rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.8)' }}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section id="localizacao" style={{ padding: 'clamp(5rem,12vh,10rem) clamp(1.5rem,5vw,4rem)', background: '#1a1a1a', color: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 'clamp(2rem,5vw,4rem)', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '1.25rem', fontWeight: 500 }}>Localização</p>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 'clamp(1.6rem,3.5vw,2.8rem)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 1.5rem', color: '#fff' }}>A sua liberdade próxima de tudo.</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: '2rem' }}>Rua Urussanga — Centro, Criciúma/SC</p>
            <a href={WA} target="_blank" rel="noopener" style={{ display: 'inline-block', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', padding: '1rem 2.5rem', textDecoration: 'none', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>AGENDAR VISITA</a>
          </div>
          <div style={{ borderRadius: '2px', overflow: 'hidden' }}>
            <img src="https://estilofontana.com.br/images/2020/10/26/localizacao-5f96e20b6e722.png?fm=webp" alt="Localização Bosco Del Montello — Centro Criciúma" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section id="catalogo" style={{ background: ACCENT, padding: 'clamp(5rem,12vh,10rem) clamp(1.5rem,5vw,4rem)', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 500 }}>Material Completo</p>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 'clamp(1.6rem,3vw,2.5rem)', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', margin: '0 0 1rem' }}>Baixe o catálogo completo</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>Plantas, acabamentos e todos os detalhes do Bosco Del Montello Residencial.</p>
          <a href="https://estilofontana.com.br/upload/empreendimento/catalogo/bosco-del-montello-1602177950.pdf" target="_blank" rel="noopener" style={{ background: '#fff', color: ACCENT, padding: '1rem 2.5rem', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'inline-block' }}>BAIXAR CATÁLOGO</a>
        </div>
      </section>

      {/* FINANCIAMENTO */}
      <section id="financiamento" style={{ background: ACCENT_DARK, color: '#fff', padding: 'clamp(5rem,12vh,10rem) clamp(1.5rem,5vw,4rem)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 500 }}>Facilidade</p>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 'clamp(1.6rem,3.5vw,2.8rem)', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', margin: '0 0 1rem' }}>A liberdade de comprar sem banco</h2>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(1.1rem,2vw,1.5rem)', fontStyle: 'italic', marginBottom: '3.5rem' }}>Sem burocracia, sem intermediários. Direto com a construtora.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(2rem,4vw,3.5rem)' }}>
            {[
              { n: '01', t: 'Converse com Stiven', d: 'Atendimento exclusivo e personalizado para entender o seu momento e as melhores condições.' },
              { n: '02', t: 'Escolha sua unidade', d: 'Selecione o apartamento ideal e defina uma proposta sob medida, sem amarras bancárias.' },
              { n: '03', t: 'Negocie direto', d: 'Condições flexíveis diretamente com a Construtora Fontana, com a liberdade que você merece.' },
            ].map(({ n, t, d }) => (
              <div key={n} style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: '2.5rem', opacity: 0.4, marginBottom: '0.875rem', letterSpacing: '0.04em' }}>{n}</div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.9rem', margin: '0 0 0.75rem', color: '#fff' }}>{t}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '3.5rem', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>Centro, Criciúma/SC &middot; Sob consulta</p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ position: 'relative', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <img src={HERO} alt="Bosco Del Montello Residencial" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.62)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(1.5rem,5vw,4rem)', maxWidth: '880px' }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 500 }}>Atendimento Exclusivo</p>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 'clamp(1.8rem,4vw,3.5rem)', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', margin: '0 0 2.5rem' }}>Repleto de detalhes únicos.</h2>
          <a href={WA} target="_blank" rel="noopener" style={{ display: 'inline-block', border: '1px solid rgba(255,255,255,0.7)', color: '#fff', padding: '1rem 2.5rem', textDecoration: 'none', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>ATENDIMENTO EXCLUSIVO</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0d0d0d', color: 'rgba(255,255,255,0.55)', padding: 'clamp(3.5rem,9vh,6rem) clamp(1.5rem,5vw,4rem)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 'clamp(2rem,5vw,3.5rem)' }}>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, letterSpacing: '0.18em', fontSize: '1rem', color: '#fff', textTransform: 'uppercase', marginBottom: '0.875rem' }}>Stiven Allan</div>
            <p style={{ marginTop: 0, fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.55)' }}>Imóveis de alto padrão em Santa Catarina.<br />CRECI 60.275</p>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#fff', marginBottom: '0.875rem' }}>Contato</div>
            <a href={WA} target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '0.875rem' }}>WhatsApp · (48) 99164-2332</a>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#fff', marginBottom: '0.875rem' }}>Empreendimento</div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>Bosco Del Montello Residencial<br />Construtora Fontana<br />Centro, Criciúma/SC</p>
          </div>
        </div>
        <div style={{ maxWidth: '1100px', margin: '2.5rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
          &copy; {new Date().getFullYear()} Stiven Allan. Imagens meramente ilustrativas. Valores sob consulta.
        </div>
      </footer>

      {/* WHATSAPP FLUTUANTE */}
      <a href={WA} target="_blank" rel="noopener" aria-label="WhatsApp" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 100, background: '#25D366', color: '#fff', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', textDecoration: 'none', fontSize: '1.6rem' }}>💬</a>

    </main>
  );
}
