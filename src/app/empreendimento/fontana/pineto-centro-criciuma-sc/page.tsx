import type { Metadata } from 'next'
import Image from 'next/image'

const C = {
  bg: '#121315', card: '#1a1d24', border: '#2a2d35',
  accent: '#c9a24b', accent2: '#e2c275', muted: '#a7adb4',
  white: '#f1f3f5', green: '#1f9d55',
}

const WPP = 'https://api.whatsapp.com/send?phone=5548991455522&text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Pineto%20Residencial!'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Pineto Residencial | Apartamentos 2 e 3 Dormitórios Centro Criciúma SC | Stiven Allan',
  description: 'Pineto Residencial: apartamentos 2 e 3 dormitórios com suíte no Centro de Criciúma/SC. Coworking, espaço yoga, piscina, playground. Lançamento Fontana Construtora. Consultor Stiven Allan CRECI/RS 60.275.',
  keywords: ['Pineto Residencial', 'apartamento Criciúma', 'lançamento Fontana', 'coworking apartamento Criciúma', 'Stiven Allan corretor SC'],
  alternates: { canonical: 'https://stivenallan.vercel.app/empreendimento/fontana/pineto-centro-criciuma-sc' },
  openGraph: {
    title: 'Pineto Residencial — Lifestyle Completo no Centro de Criciúma/SC',
    description: 'Apartamentos 2 e 3 dorm. com coworking, espaço yoga, piscina, academia e salão gourmet. Lançamento exclusivo Fontana.',
    url: 'https://stivenallan.vercel.app/empreendimento/fontana/pineto-centro-criciuma-sc',
    images: [{ url: 'https://lh3.googleusercontent.com/d/1WoeVn8nWbU-Zbr-NGK9fT-quhSH_OFas', width: 1200, height: 630 }],
    type: 'website',
    locale: 'pt_BR',
  },
}

const GALERIA = [
  { id: '1WoeVn8nWbU-Zbr-NGK9fT-quhSH_OFas', alt: 'Pineto Residencial — fachada frontal Centro Criciúma', label: 'Fachada' },
  { id: '1pAWa8inPVV_XM0-CDKNC6M8T6YO5wNGv', alt: 'Pineto — perspectiva angular', label: 'Perspectiva' },
  { id: '1KmOmEQuPraRJUfmW8FBoK-6_WyQ8fFK_', alt: 'Pineto — acesso principal', label: 'Acesso Principal' },
  { id: '1lzQM-x4vIGkMBbwuGrqwIiTZ8RqgdolJ', alt: 'Pineto — hall de entrada sofisticado', label: 'Hall de Entrada' },
  { id: '1PwMdWzuLF7hXM9SkEVNtv90kvjdPR3dt', alt: 'Pineto — living integrado', label: 'Living' },
  { id: '1HKmiz9MsLrg3xrW2WknSq3YdLLlsv921', alt: 'Pineto — suíte master', label: 'Suíte' },
  { id: '1mt3O1a0jWgMHBXK8CCIRjMOQPBrdIqRS', alt: 'Pineto — coworking integrado', label: 'Coworking' },
  { id: '1UY_UxkyWI1gN8dMqW_7UJVl2uMBHsAMP', alt: 'Pineto — espaço yoga e meditação', label: 'Espaço Yoga' },
  { id: '1osvUbZHc8XJP0gZP2Oxbn1PZK1V3fgVW', alt: 'Pineto — academia fitness', label: 'Academia' },
  { id: '1Mg6ipBSqIecSJ9nWmlQtClUwFVzvsm9R', alt: 'Pineto — playground área kids', label: 'Playground' },
  { id: '1ISCgwxJn2DIBQAhUb3bl1dfcOf-34hzC', alt: 'Pineto — salão de festas gourmet', label: 'Salão de Festas' },
]

const DIFERENCIAIS = [
  { icon: '💻', titulo: 'Coworking', desc: 'Espaço de trabalho compartilhado integrado ao empreendimento — trabalhe de casa sem abrir mão do profissionalismo' },
  { icon: '🧘', titulo: 'Espaço Yoga', desc: 'Área exclusiva para yoga e meditação, um diferencial único em Criciúma' },
  { icon: '🏋️', titulo: 'Academia Completa', desc: 'Fitness center equipado para manter a rotina de exercícios no próprio condomínio' },
  { icon: '🏊', titulo: 'Piscina', desc: 'Área aquática para lazer e relaxamento nos momentos de descanso' },
  { icon: '🛝', titulo: 'Playground', desc: 'Espaço kids planejado com segurança e diversão para as crianças' },
  { icon: '🎉', titulo: 'Salão Gourmet', desc: 'Espaço de festas sofisticado com cozinha integrada para seus momentos especiais' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateListing',
  name: 'Pineto Residencial',
  description: 'Lançamento residencial no Centro de Criciúma/SC com apartamentos de 2 e 3 dormitórios, coworking, espaço yoga, academia, piscina e salão gourmet. Construtora Fontana.',
  url: 'https://stivenallan.vercel.app/empreendimento/fontana/pineto-centro-criciuma-sc',
  image: 'https://lh3.googleusercontent.com/d/1WoeVn8nWbU-Zbr-NGK9fT-quhSH_OFas',
  offers: { '@type': 'Offer', priceCurrency: 'BRL', price: '450000', availability: 'https://schema.org/InStock' },
  address: { '@type': 'PostalAddress', addressLocality: 'Criciúma', addressRegion: 'SC', postalCode: '88802-100', addressCountry: 'BR' },
  floorSize: { '@type': 'QuantitativeValue', minValue: 72, maxValue: 108, unitCode: 'MTK' },
}

export default function PinetoPage() {
  return (
    <main style={{ background: C.bg, color: C.white, fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 640, overflow: 'hidden' }}>
        <Image
          src={`https://lh3.googleusercontent.com/d/${GALERIA[0].id}`}
          alt="Pineto Residencial — fachada Centro Criciúma SC"
          fill priority
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
          sizes="100vw"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(18,19,21,0.2) 0%, rgba(18,19,21,0.88) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 5% 10%' }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.accent, color: '#000', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 20, textTransform: 'uppercase' }}>
              Lançamento · Fontana Construtora
            </div>
            <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 800, lineHeight: 1.05, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              Pineto Residencial
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: C.muted, marginBottom: 32, maxWidth: 540, lineHeight: 1.6 }}>
              O empreendimento que redefine o estilo de vida no Centro de Criciúma. Apartamentos 2 e 3 dormitórios com coworking, yoga, academia e piscina — tudo no mesmo lugar.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={WPP} target="_blank" rel="noopener noreferrer"
                style={{ background: C.accent, color: '#000', borderRadius: 8, padding: '14px 28px', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                Tenho interesse
              </a>
              <a href="#galeria"
                style={{ background: 'rgba(255,255,255,0.1)', color: C.white, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '14px 24px', fontWeight: 600, fontSize: 15, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                Ver galeria
              </a>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Centro Criciúma', 'Coworking', 'Yoga', '2 e 3 Dorms'].map(t => (
            <span key={t} style={{ background: 'rgba(18,19,21,0.7)', border: '1px solid rgba(201,162,75,0.4)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: C.accent2, backdropFilter: 'blur(8px)' }}>{t}</span>
          ))}
        </div>
      </section>

      {/* NÚMEROS */}
      <section style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 5%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32 }}>
          {[
            { v: 'R$ 450 mil', l: 'A partir de' },
            { v: '72–108 m²', l: 'Área privativa' },
            { v: '2 e 3', l: 'Dormitórios' },
            { v: 'Coworking', l: 'Diferencial único' },
            { v: 'Centro', l: 'Criciúma / SC' },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 800, color: C.accent }}>{v}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" style={{ padding: '80px 5%', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Galeria</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, margin: 0 }}>Um novo padrão para Criciúma</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', height: 480 }}>
            <Image src={`https://lh3.googleusercontent.com/d/${GALERIA[0].id}`} alt={GALERIA[0].alt} fill style={{ objectFit: 'cover' }} sizes="60vw" />
            <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(18,19,21,0.75)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: C.accent, fontWeight: 600, backdropFilter: 'blur(6px)' }}>{GALERIA[0].label}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {GALERIA.slice(1, 3).map(img => (
              <div key={img.id} style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', flex: 1 }}>
                <Image src={`https://lh3.googleusercontent.com/d/${img.id}`} alt={img.alt} fill style={{ objectFit: 'cover' }} sizes="30vw" />
                <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(18,19,21,0.7)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: C.accent, fontWeight: 600 }}>{img.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {GALERIA.slice(3).map(img => (
            <div key={img.id} style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', height: 200 }}>
              <Image src={`https://lh3.googleusercontent.com/d/${img.id}`} alt={img.alt} fill style={{ objectFit: 'cover' }} sizes="300px" />
              <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(18,19,21,0.7)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: C.accent, fontWeight: 600 }}>{img.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section style={{ background: C.card, padding: '80px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Diferenciais</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, margin: 0 }}>O que só o Pineto tem</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {DIFERENCIAIS.map(d => (
              <div key={d.titulo} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px 28px', display: 'flex', gap: 16, alignItems: 'flex-start', borderLeft: `3px solid ${C.accent}` }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{d.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{d.titulo}</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COWORKING DESTAQUE */}
      <section style={{ padding: '80px 5%', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', height: 400 }}>
            <Image src={`https://lh3.googleusercontent.com/d/${GALERIA[6].id}`} alt="Pineto — coworking integrado" fill style={{ objectFit: 'cover' }} sizes="50vw" />
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,162,75,0.15)', border: '1px solid rgba(201,162,75,0.3)', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 20, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Exclusivo no Pineto
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, margin: '0 0 20px', lineHeight: 1.2 }}>Coworking integrado ao seu lar</h2>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, marginBottom: 20 }}>
              O Pineto é o único empreendimento residencial em Criciúma com coworking profissional integrado. Trabalhe com produtividade, sem deslocamento, com toda a infraestrutura que você precisa a passos do seu apartamento.
            </p>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8 }}>
              Ideal para profissionais remotos, empreendedores e quem valoriza equilíbrio entre vida profissional e pessoal.
            </p>
          </div>
        </div>
      </section>

      {/* YOGA DESTAQUE */}
      <section style={{ background: C.card, padding: '80px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Bem-Estar</div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, margin: '0 0 20px', lineHeight: 1.2 }}>Espaço Yoga e Meditação</h2>
              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8 }}>
                Um espaço dedicado ao equilíbrio mental e físico, projetado para a prática de yoga, meditação e alongamento. Mais um diferencial que coloca o Pineto em uma categoria única no mercado imobiliário de Criciúma.
              </p>
            </div>
            <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', height: 360 }}>
              <Image src={`https://lh3.googleusercontent.com/d/${GALERIA[7].id}`} alt="Pineto — espaço yoga meditação" fill style={{ objectFit: 'cover' }} sizes="50vw" />
            </div>
          </div>
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section style={{ padding: '80px 5%', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Localização</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, margin: 0 }}>Centro de Criciúma — tudo a sua porta</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {['Shopping Della', 'Hospital São José', 'Universidades UNESC e SATC', 'Gastronomia e bares', 'Comércio e bancos', 'Terminal de ônibus'].map(item => (
            <div key={item} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 8, height: 8, background: C.accent, borderRadius: '50%', flexShrink: 0 }} />
              <span style={{ fontSize: 14 }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1a1d27, #1e1b2e)', border: `1px solid rgba(201,162,75,0.2)`, margin: '0 5% 80px', borderRadius: 20, padding: '60px 5%', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center' }}>
          <div>
            <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Consultor Exclusivo</div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, margin: '0 0 12px' }}>Stiven Allan — CRECI/RS 60.275</h2>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: '0 0 28px' }}>
              Especialista em lançamentos Fontana em Criciúma. Atendimento personalizado, análise de investimento e acompanhamento completo do processo de compra.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={WPP} target="_blank" rel="noopener noreferrer"
                style={{ background: '#25d366', color: '#fff', borderRadius: 8, padding: '14px 24px', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                Chamar no WhatsApp
              </a>
              <a href="tel:+5548991455522"
                style={{ background: 'transparent', color: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '14px 20px', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
                (48) 99145-5522
              </a>
            </div>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ width: 80, height: 80, background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#000', margin: '0 auto 12px' }}>S</div>
            <div style={{ fontSize: 13, color: C.muted }}>Seg–Sáb · 8h–20h</div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '32px 5%', textAlign: 'center', color: C.muted, fontSize: 13 }}>
        <p style={{ margin: 0 }}>
          Pineto Residencial · Fontana Construtora · Centro, Criciúma/SC<br />
          Consultor: Stiven Allan · CRECI/RS 60.275 · (48) 99145-5522
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#4a5568' }}>
          As imagens são ilustrativas. Informações sujeitas a alterações sem aviso prévio.
        </p>
      </footer>
    </main>
  )
}
