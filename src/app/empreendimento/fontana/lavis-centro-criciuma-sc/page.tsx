import type { Metadata } from 'next'
import Image from 'next/image'
import { c, font, ui } from '@/lib/theme'
import Simulador from '@/components/Simulador'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'

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
  '@graph': [
    {
      '@type': 'RealEstateListing',
      name: 'Lavis Residencial',
      description: 'Lançamento residencial no Centro de Criciúma/SC com apartamentos de 2 e 3 dormitórios, piscina, deck, fitness e salão gourmet. Construtora Fontana.',
      url: 'https://stivenallan.vercel.app/empreendimento/fontana/lavis-centro-criciuma-sc',
      image: 'https://lh3.googleusercontent.com/d/1pB-4sxYVrSqMmyIbbEeeGwcQMcOTS015',
      offers: { '@type': 'Offer', priceCurrency: 'BRL', price: '420000', availability: 'https://schema.org/InStock' },
      address: { '@type': 'PostalAddress', addressLocality: 'Criciúma', addressRegion: 'SC', postalCode: '88802-300', addressCountry: 'BR' },
      floorSize: { '@type': 'QuantitativeValue', minValue: 65, maxValue: 95, unitCode: 'MTK' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://stivenallan.vercel.app' },
        { '@type': 'ListItem', position: 2, name: 'Lançamentos Criciúma', item: 'https://stivenallan.vercel.app/lancamentos/criciuma-sc' },
        { '@type': 'ListItem', position: 3, name: 'Lavis Residencial' },
      ],
    },
  ],
}

export default function LavisPage() {
  return (
    <main style={{ background: c.paper, color: c.ink, fontFamily: font.body, minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        .lavis-diff-card:hover { transform: translateY(-2px); border-left-color: ${c.orange} !important; transition: transform .22s ease, border-left-color .22s ease; }
        .lavis-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,106,61,0.35); }
        <LeadCaptureButton slug="lavis-centro-criciuma-sc" construtora_slug="fontana"  propertyDisplayName="Lavis Residencial" />
        .lavis-img-thumb { transition: transform .3s ease; }
        .lavis-img-thumb:hover { transform: scale(1.03); }
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      {/* BREADCRUMB NAV */}
      <nav aria-label="Breadcrumb" style={{ background: c.charcoal, borderBottom: `1px solid ${c.lineDark}`, padding: '12px 5%' }}>
        <ol style={{ display: 'flex', gap: 8, listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap' }}>
          <li><a href="/" style={{ color: c.onDarkMuted, fontSize: 13, textDecoration: 'none' }}>Início</a></li>
          <li style={{ color: c.onDarkMuted }}>›</li>
          <li><a href="/lancamentos/criciuma-sc" style={{ color: c.onDarkMuted, fontSize: 13, textDecoration: 'none' }}>Lançamentos Criciúma</a></li>
          <li style={{ color: c.onDarkMuted }}>›</li>
          <li style={{ color: c.bronze, fontSize: 13, fontWeight: 600 }}>Lavis Residencial</li>
        </ol>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 640, overflow: 'hidden' }}>
        <Image
          src={`https://lh3.googleusercontent.com/d/${GALERIA[0].id}`}
          alt="Lavis Residencial — fachada Centro Criciúma"
          fill priority
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          sizes="100vw"
        />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(19,18,17,0.3) 0%, rgba(19,18,17,0.88) 100%)` }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 5% 10%' }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: c.bronze, color: '#fff', borderRadius: 2, padding: '5px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 20, textTransform: 'uppercase' }}>
              Lançamento · Fontana Construtora
            </div>
            <h1 style={{ fontFamily: font.display, fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 800, lineHeight: 1.05, margin: '0 0 16px', letterSpacing: '-0.025em', color: c.onDark }}>
              Lavis Residencial
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: c.onDarkMuted, marginBottom: 32, maxWidth: 520, lineHeight: 1.6 }}>
              Sofisticação e localização privilegiada no Centro de Criciúma. Apartamentos 2 e 3 dormitórios com suíte, área de lazer completa e acabamento premium.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={WPP} target="_blank" rel="noopener noreferrer" className="lavis-cta-btn"
                style={{ ...ui.btnConvert, minHeight: 48 }}>
                Tenho interesse
              </a>
              <a href="#galeria"
                style={{ background: 'rgba(255,255,255,0.1)', color: c.onDark, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 2, padding: '14px 24px', fontWeight: 600, fontSize: 15, textDecoration: 'none', backdropFilter: 'blur(8px)', minHeight: 48, display: 'inline-flex', alignItems: 'center' }}>
                Ver galeria
              </a>
            </div>
          </div>
        </div>
        {/* Pills flutuantes */}
        <div style={{ position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Centro Criciúma', '2 e 3 Dorms', 'Piscina', 'Lançamento'].map(t => (
            <span key={t} style={{ background: 'rgba(19,18,17,0.7)', border: `1px solid rgba(210,78,34,0.4)`, borderRadius: 40, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: c.onDark, backdropFilter: 'blur(8px)' }}>{t}</span>
          ))}
        </div>
      </section>

      {/* NÚMEROS */}
      <section style={{ background: c.charcoal, borderBottom: `1px solid ${c.lineDark}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 5%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32 }}>
          {[
            { v: 'R$ 420 mil', l: 'A partir de' },
            { v: '65–95 m²', l: 'Área privativa' },
            { v: '2 e 3', l: 'Dormitórios' },
            { v: '1 suíte', l: 'Por unidade' },
            { v: 'Centro', l: 'Criciúma / SC' },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: font.display, fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: c.orange }}>{v}</div>
              <div style={{ fontSize: 13, color: c.onDarkMuted, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SIMULADOR */}
      <section style={{ background: c.surface, padding: '64px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ ...ui.eyebrow, marginBottom: 10 }}>Simulação de Financiamento</div>
            <h2 style={{ ...ui.h2, color: c.ink, margin: 0 }}>Calcule sua parcela</h2>
          </div>
          <Simulador valorInicial={420000} valorMin={294000} valorMax={650000} hrefReserva={WPP} />
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" style={{ padding: '80px 5%', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <div style={{ ...ui.eyebrow, marginBottom: 12 }}>Galeria de Imagens</div>
          <h2 style={{ ...ui.h2, color: c.ink }}>Cada detalhe pensado para você</h2>
        </div>
        {/* Imagem destaque */}
        <div style={{ borderRadius: 4, overflow: 'hidden', marginBottom: 12, position: 'relative', height: 520 }}>
          <Image src={`https://lh3.googleusercontent.com/d/${GALERIA[2].id}`} alt={GALERIA[2].alt} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 90vw" />
          <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(19,18,17,0.75)', borderRadius: 2, padding: '6px 14px', fontSize: 13, color: c.orange, fontWeight: 600, backdropFilter: 'blur(6px)' }}>{GALERIA[2].label}</div>
        </div>
        {/* Grid de miniaturas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {GALERIA.filter((_, i) => i !== 2).map(img => (
            <div key={img.id} className="lavis-img-thumb" style={{ borderRadius: 3, overflow: 'hidden', position: 'relative', height: 220 }}>
              <Image src={`https://lh3.googleusercontent.com/d/${img.id}`} alt={img.alt} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 320px" />
              <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(19,18,17,0.75)', borderRadius: 2, padding: '4px 10px', fontSize: 12, color: c.orange, fontWeight: 600 }}>{img.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section style={{ background: c.surface, padding: '80px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ ...ui.eyebrow, marginBottom: 12 }}>Infraestrutura</div>
            <h2 style={{ ...ui.h2, color: c.ink }}>Lazer completo sem sair de casa</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {DIFERENCIAIS.map(d => (
              <div key={d.titulo} className="lavis-diff-card" style={{ background: c.paper, border: `1px solid ${c.line}`, borderRadius: 3, padding: '24px 28px', display: 'flex', gap: 16, alignItems: 'flex-start', borderLeft: `3px solid ${c.bronze}` }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{d.icon}</span>
                <div>
                  <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, marginBottom: 6, color: c.ink }}>{d.titulo}</div>
                  <div style={{ fontSize: 13, color: c.muted, lineHeight: 1.6 }}>{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section style={{ padding: '80px 5%', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
          <div>
            <div style={{ ...ui.eyebrow, marginBottom: 16 }}>Localização</div>
            <h2 style={{ ...ui.h2, color: c.ink, marginBottom: 20 }}>No coração do Centro de Criciúma</h2>
            <p style={{ fontSize: 15, color: c.muted, lineHeight: 1.8, marginBottom: 24 }}>
              O Lavis está estrategicamente localizado no Centro de Criciúma, a poucos minutos dos principais comércios, serviços, gastronomia e cultura da cidade. Praticidade no seu dia a dia.
            </p>
            {['Shopping Della', 'Hospital São José', 'Universidades', 'Gastronomia e comércio'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, background: c.bronze, borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: c.muted }}>{item} — próximo</span>
              </div>
            ))}
          </div>
          <div style={{ borderRadius: 4, overflow: 'hidden', position: 'relative', height: 380 }}>
            <Image src={`https://lh3.googleusercontent.com/d/${GALERIA[3].id}`} alt="Lavis — fotomontagem Centro Criciúma" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      {/* PLANTAS */}
      <section style={{ background: c.surface, padding: '80px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ ...ui.eyebrow, marginBottom: 12 }}>Plantas</div>
            <h2 style={{ ...ui.h2, color: c.ink, marginBottom: 12 }}>Explore as tipologias</h2>
            <p style={{ color: c.muted, fontSize: 15 }}>Plantas inteligentes com integração de ambientes e aproveitamento máximo de espaço</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {[{ id: '1n2Za_17p_FsM-v5lHWxKnrM-VLLWCLs5', label: 'Embasamento', tipo: 'Garagem e infraestrutura' }].map(p => (
              <div key={p.id} style={{ ...ui.card, borderRadius: 3 }}>
                <div style={{ position: 'relative', height: 280 }}>
                  <Image src={`https://lh3.googleusercontent.com/d/${p.id}`} alt={`Planta Lavis — ${p.label}`} fill style={{ objectFit: 'contain', padding: 12 }} sizes="400px" />
                </div>
                <div style={{ padding: '16px 20px', borderTop: `1px solid ${c.line}` }}>
                  <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, color: c.ink }}>{p.label}</div>
                  <div style={{ fontSize: 13, color: c.muted, marginTop: 4 }}>{p.tipo}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', ...ui.btnSecondary, borderRadius: 2 }}>
              Solicitar plantas completas pelo WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* CONSTRUTORA */}
      <section style={{ padding: '80px 5%', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
          <div style={{ borderRadius: 4, overflow: 'hidden', position: 'relative', height: 360 }}>
            <Image src={`https://lh3.googleusercontent.com/d/${GALERIA[9].id}`} alt="Lavis — hall de entrada premium" fill style={{ objectFit: 'cover' }} sizes="50vw" />
          </div>
          <div>
            <div style={{ ...ui.eyebrow, marginBottom: 16 }}>Construtora Fontana</div>
            <h2 style={{ ...ui.h2, color: c.ink, marginBottom: 20 }}>Tradição e qualidade em cada detalhe</h2>
            <p style={{ fontSize: 15, color: c.muted, lineHeight: 1.8 }}>
              A Fontana Construtora é reconhecida pela excelência em acabamentos, pontualidade nas entregas e projetos arquitetônicos que equilibram funcionalidade e estética. O Lavis é mais uma expressão dessa tradição.
            </p>
          </div>
        </div>
      </section>

      {/* CTA CONSULTOR */}
      <section style={{ background: c.charcoal, margin: '0 5% 80px', borderRadius: 4, padding: '60px 5%', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 40, alignItems: 'center' }}>
          <div>
            <div style={{ ...ui.eyebrow, marginBottom: 12 }}>Consultor Exclusivo</div>
            <h2 style={{ fontFamily: font.display, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2, color: c.onDark }}>Stiven Allan — CRECI/RS 60.275</h2>
            <p style={{ fontSize: 15, color: c.onDarkMuted, lineHeight: 1.7, margin: '0 0 28px' }}>
              Especialista em lançamentos Fontana em Criciúma e região sul de SC. Atendimento personalizado, análise financeira e acompanhamento completo do processo de compra.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={WPP} target="_blank" rel="noopener noreferrer" className="lavis-cta-btn"
                style={{ background: '#25d366', color: '#fff', borderRadius: 2, padding: '14px 24px', fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 48 }}>
                Chamar no WhatsApp
              </a>
              <a href="tel:+5548991455522"
                style={{ background: 'transparent', color: c.onDark, border: `1px solid ${c.lineDark}`, borderRadius: 2, padding: '14px 20px', fontWeight: 600, fontSize: 15, textDecoration: 'none', minHeight: 48, display: 'inline-flex', alignItems: 'center' }}>
                (48) 99145-5522
              </a>
            </div>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ width: 80, height: 80, background: `linear-gradient(135deg, ${c.bronze}, ${c.orange})`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 auto 12px' }}>S</div>
            <div style={{ fontSize: 13, color: c.onDarkMuted }}>Seg–Sáb · 8h–20h</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${c.line}`, padding: '32px 5%', textAlign: 'center', color: c.muted, fontSize: 13 }}>
        <p style={{ margin: 0 }}>
          Lavis Residencial · Fontana Construtora · Centro, Criciúma/SC<br />
          Consultor: Stiven Allan · CRECI/RS 60.275 · (48) 99145-5522
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: c.muted }}>
          As imagens são ilustrativas. Informações sujeitas a alterações sem aviso prévio.
        </p>
      </footer>

      {/* CTA STICKY MOBILE */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: c.charcoal, borderTop: `1px solid ${c.lineDark}`, padding: '12px 5%', display: 'flex', gap: 10 }} className="lavis-mobile-cta">
        <style>{`.lavis-mobile-cta { display: flex; } @media (min-width: 768px) { .lavis-mobile-cta { display: none !important; } }`}</style>
        <a href={WPP} target="_blank" rel="noopener noreferrer"
          style={{ flex: 1, ...ui.btnConvert, borderRadius: 2, textAlign: 'center', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          Falar com Stiven
        </a>
        <a href="tel:+5548991455522"
          style={{ flex: 1, ...ui.btnPrimary, borderRadius: 2, textAlign: 'center', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
          Ligar agora
        </a>
      </div>
    </main>
  )
}
