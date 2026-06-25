import type { Metadata } from 'next'
import Image from 'next/image'

const C = {
  bg: '#121315', card: '#1a1d24', border: '#2a2d35',
  accent: '#c9a24b', accent2: '#e2c275', muted: '#a7adb4',
  white: '#f1f3f5', green: '#1f9d55', danger: '#e63946',
}

const WPP = 'https://api.whatsapp.com/send?phone=5548991455522&text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Lavis%20Residencial!'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Lavis Residencial | Apartamentos 2 e 3 Suítes Centro Criciúma SC | Stiven Allan',
  description: 'Lavis Residencial: apartamentos 2 e 3 dormitórios com suíte no Centro de Criciúma/SC. Piscina, fitness, deck, hall sofisticado. Lançamento Fontana. Consultoria Stiven Allan CRECI/RS 60.275.',
  keywords: ['Lavis Residencial', 'apartamento Centro Criciúma', 'lançamento Fontana Criciúma', 'apartamento 3 suítes Criciúma SC', 'Stiven Allan corretor'],
  alternates: { canonical: 'https://stivenallan.vercel.app/empreendimento/fontana/lavis-centro-criciuma-sc' },
  openGraph: {
    title: 'Lavis Residencial — Sofisticação no Centro de Criciúma/SC',
    description: 'Apartamentos 2 e 3 dorm. com suíte, piscina, deck externo, fitness e hall de entrada premium. Lançamento Fontana. Consulte Stiven Allan.',
    url: 'https://stivenallan.vercel.app/empreendimento/fontana/lavis-centro-criciuma-sc',
    images: [{ url: 'https://lh3.googleusercontent.com/d/1pB-4sxYVrSqMmyIbbEeeGwcQMcOTS015', width: 1200, height: 630 }],
    type: 'website',
    locale: 'pt_BR',
  },
}

// Imagens reais do Google Drive — Lavis | Criciúma
const GALERIA = [
  { id: '1pB-4sxYVrSqMmyIbbEeeGwcQMcOTS015', alt: 'Lavis Residencial — fachada frontal', label: 'Fachada' },
  { id: '1lyQ9nOW-tHItoSMoHzhy73gDWPUhV3fL', alt: 'Lavis — fachada angular', label: 'Perspectiva' },
  { id: '17xpVz7NYIxtvdoKiewKquDgb9ZrX1I8h', alt: 'Lavis — vista aérea do empreendimento', label: 'Vista Aérea' },
  { id: '1pgZ8qpAlGj6Od97G3RfdohM7PvVkfHwe', alt: 'Lavis — fotomontagem localização Centro Criciúma', label: 'Localização' },
  { id: '17BWlUE3zEqP-LzqRNE_T1z6WNEyGAhjB', alt: 'Lavis — salão de festas gourmet', label: 'Salão de Festas' },
  { id: '1g8T7OCs7cL7A6UMk1g2zTxtgyb-ptZ7T', alt: 'Lavis — playground área kids', label: 'Playground' },
  { id: '1iL_myAjfCXtfiwCfgq2fFqE1if_g3emT', alt: 'Lavis — piscina adulto', label: 'Piscina' },
  { id: '1uvtjqVIfWmdaRbKg831oWAG67O47hIdJ', alt: 'Lavis — piscina perspectiva', label: 'Área Aquática' },
  { id: '1dkvYQs4IQhH3T7aicZblknsG_O4fRUfT', alt: 'Lavis — deck externo', label: 'Deck Externo' },
  { id: '1l8HccppWhmjNSL9S8RG30sF4xULo2ldm', alt: 'Lavis — hall de entrada', label: 'Hall de Entrada' },
  { id: '1WtQtoHzmY9jRvFMbR9f2A1gSCNKvzHKo', alt: 'Lavis — living integrado', label: 'Living' },
  { id: '1DpSnmDt5jtn5LSbNEKTpbs7aW688yPww', alt: 'Lavis — sacada gourmet', label: 'Sacada Gourmet' },
  { id: '17tljoL4_Hw29594aKYL8T0HKdUkaxaB9', alt: 'Lavis — suíte master', label: 'Suíte' },
]

const PLANTAS = [
  { id: '1n2Za_17p_FsM-v5lHWxKnrM-VLLWCLs5', label: 'Embasamento', desc: 'Garagem e infraestrutura' },
]

const DIFERENCIAIS = [
  { icon: '🏊', titulo: 'Piscina e Deck', desc: 'Área aquática com deck externo integrado para lazer ao sol' },
  { icon: '🎉', titulo: 'Salão Gourmet', desc: 'Espaço de festas sofisticado com cozinha integrada' },
  { icon: '💪', titulo: 'Fitness Center', desc: 'Academia equipada para treinar sem sair de casa' },
  { icon: '🛝', titulo: 'Playground', desc: 'Área kids pensada para a diversão com segurança' },
  { icon: '🏛️', titulo: 'Hall Premium', desc: 'Entrada imponente com acabamento de alto padrão' },
  { icon: '🔐', titulo: 'Segurança 24h', desc: 'Portaria com controle de acesso e monitoramento' },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateListing',
  name: 'Lavis Residencial',
  description: 'Lançamento residencial no Centro de Criciúma/SC com apartamentos de 2 e 3 dormitórios, piscina, deck, fitness e salão gourmet. Construtora Fontana.',
  url: 'https://stivenallan.vercel.app/empreendimento/fontana/lavis-centro-criciuma-sc',
  image: 'https://lh3.googleusercontent.com/d/1pB-4sxYVrSqMmyIbbEeeGwcQMcOTS015',
  offers: { '@type': 'Offer', priceCurrency: 'BRL', price: '420000', availability: 'https://schema.org/InStock' },
  address: { '@type': 'PostalAddress', addressLocality: 'Criciúma', addressRegion: 'SC', postalCode: '88802-300', addressCountry: 'BR' },
  floorSize: { '@type': 'QuantitativeValue', minValue: 65, maxValue: 95, unitCode: 'MTK' },
}

export default function LavisPage() {
  return (
    <main style={{ background: C.bg, color: C.white, fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 640, overflow: 'hidden' }}>
        <Image
          src={`https://lh3.googleusercontent.com/d/${GALERIA[0].id}`}
          alt="Lavis Residencial — fachada Centro Criciúma"
          fill priority
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          sizes="100vw"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(18,19,21,0.3) 0%, rgba(18,19,21,0.85) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 5% 10%' }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.accent, color: '#000', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 20, textTransform: 'uppercase' }}>
              Lançamento · Fontana Construtora
            </div>
            <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 800, lineHeight: 1.05, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              Lavis Residencial
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: C.muted, marginBottom: 32, maxWidth: 520, lineHeight: 1.6 }}>
              Sofisticação e localização privilegiada no Centro de Criciúma. Apartamentos 2 e 3 dormitórios com suíte, área de lazer completa e acabamento premium.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={WPP} target="_blank" rel="noopener noreferrer"
                style={{ background: C.accent, color: '#000', borderRadius: 8, padding: '14px 28px', fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Tenho interesse
              </a>
              <a href="#galeria"
                style={{ background: 'rgba(255,255,255,0.1)', color: C.white, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '14px 24px', fontWeight: 600, fontSize: 15, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                Ver galeria
              </a>
            </div>
          </div>
        </div>
        {/* Pills flutuantes */}
        <div style={{ position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Centro Criciúma', '2 e 3 Dorms', 'Piscina', 'Lançamento'].map(t => (
            <span key={t} style={{ background: 'rgba(18,19,21,0.7)', border: '1px solid rgba(201,162,75,0.4)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: C.accent2, backdropFilter: 'blur(8px)' }}>{t}</span>
          ))}
        </div>
      </section>

      {/* NÚMEROS */}
      <section style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 5%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32 }}>
          {[
            { v: 'R$ 420 mil', l: 'A partir de' },
            { v: '65–95 m²', l: 'Área privativa' },
            { v: '2 e 3', l: 'Dormitórios' },
            { v: '1 suíte', l: 'Por unidade' },
            { v: 'Centro', l: 'Criciúma / SC' },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: C.accent }}>{v}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" style={{ padding: '80px 5%', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Galeria de Imagens</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Cada detalhe pensado para você</h2>
        </div>
        {/* Imagem destaque */}
        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 12, position: 'relative', height: 520 }}>
          <Image src={`https://lh3.googleusercontent.com/d/${GALERIA[2].id}`} alt={GALERIA[2].alt} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 90vw" />
          <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(18,19,21,0.75)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: C.accent, fontWeight: 600, backdropFilter: 'blur(6px)' }}>{GALERIA[2].label}</div>
        </div>
        {/* Grid de miniaturas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {GALERIA.filter((_, i) => i !== 2).map(img => (
            <div key={img.id} style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', height: 220 }}>
              <Image src={`https://lh3.googleusercontent.com/d/${img.id}`} alt={img.alt} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 320px" />
              <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(18,19,21,0.7)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: C.accent, fontWeight: 600 }}>{img.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section style={{ background: C.card, padding: '80px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Infraestrutura</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, margin: 0 }}>Lazer completo sem sair de casa</h2>
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

      {/* LOCALIZAÇÃO */}
      <section style={{ padding: '80px 5%', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Localização</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, margin: '0 0 20px', lineHeight: 1.2 }}>No coração do Centro de Criciúma</h2>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, marginBottom: 24 }}>
              O Lavis está estrategicamente localizado no Centro de Criciúma, a poucos minutos dos principais comércios, serviços, gastronomia e cultura da cidade. Praticidade no seu dia a dia.
            </p>
            {['Shopping Della', 'Hospital São José', 'Universidades', 'Gastronomia e comércio'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, background: C.accent, borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: C.muted }}>{item} — próximo</span>
              </div>
            ))}
          </div>
          <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', height: 380 }}>
            <Image src={`https://lh3.googleusercontent.com/d/${GALERIA[3].id}`} alt="Lavis — fotomontagem Centro Criciúma" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      {/* PLANTAS — destaque */}
      <section style={{ background: C.card, padding: '80px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Plantas</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, margin: '0 0 12px' }}>Explore as tipologias</h2>
            <p style={{ color: C.muted, fontSize: 15 }}>Plantas inteligentes com integração de ambientes e aproveitamento máximo de espaço</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {[
              { id: '1n2Za_17p_FsM-v5lHWxKnrM-VLLWCLs5', label: 'Embasamento', tipo: 'Garagem e infraestrutura', area: '—' },
            ].map(p => (
              <div key={p.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: 280 }}>
                  <Image src={`https://lh3.googleusercontent.com/d/${p.id}`} alt={`Planta Lavis — ${p.label}`} fill style={{ objectFit: 'contain', background: '#fff', padding: 12 }} sizes="400px" />
                </div>
                <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{p.label}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{p.tipo}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: 'transparent', color: C.accent, border: `1px solid ${C.accent}`, borderRadius: 8, padding: '12px 28px', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Solicitar plantas completas pelo WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* CONSTRUTORA */}
      <section style={{ padding: '80px 5%', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', height: 360 }}>
            <Image src={`https://lh3.googleusercontent.com/d/${GALERIA[9].id}`} alt="Lavis — hall de entrada premium" fill style={{ objectFit: 'cover' }} sizes="50vw" />
          </div>
          <div>
            <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Construtora Fontana</div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, margin: '0 0 20px', lineHeight: 1.2 }}>Tradição e qualidade em cada detalhe</h2>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8 }}>
              A Fontana Construtora é reconhecida pela excelência em acabamentos, pontualidade nas entregas e projetos arquitetônicos que equilibram funcionalidade e estética. O Lavis é mais uma expressão dessa tradição.
            </p>
          </div>
        </div>
      </section>

      {/* CTA CONSULTOR */}
      <section style={{ background: `linear-gradient(135deg, ${C.card}, #1e1b2e)`, border: `1px solid rgba(201,162,75,0.2)`, margin: '0 5% 80px', borderRadius: 20, padding: '60px 5%', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center' }}>
          <div>
            <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Consultor Exclusivo</div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>Stiven Allan — CRECI/RS 60.275</h2>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: '0 0 28px' }}>
              Especialista em lançamentos Fontana em Criciúma e região sul de SC. Atendimento personalizado, análise financeira e acompanhamento completo do processo de compra.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={WPP} target="_blank" rel="noopener noreferrer"
                style={{ background: '#25d366', color: '#fff', borderRadius: 8, padding: '14px 24px', fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
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

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '32px 5%', textAlign: 'center', color: C.muted, fontSize: 13 }}>
        <p style={{ margin: 0 }}>
          Lavis Residencial · Fontana Construtora · Centro, Criciúma/SC<br />
          Consultor: Stiven Allan · CRECI/RS 60.275 · (48) 99145-5522
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#4a5568' }}>
          As imagens são ilustrativas. Informações sujeitas a alterações sem aviso prévio.
        </p>
      </footer>
    </main>
  )
              }
