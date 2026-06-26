import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { c, font, brl, ui } from '@/lib/theme'
import Simulador from '@/components/Simulador'

const WPP = 'https://api.whatsapp.com/send?phone=5548991455522&text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Pineto%20Residencial!'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Pineto Residencial | Apartamentos 2 e 3 Dormitórios Centro Criciúma SC | Stiven Allan',
  description: 'Pineto Residencial: apartamentos 2 e 3 dormitórios com suíte no Centro de Criciúma/SC. Coworking, espaço yoga, piscina, playground. Lançamento Fontana Construtora. Consultor Stiven Allan CRECI/RS 60.275.',
  keywords: ['Pineto Residencial', 'apartamento Criciúma', 'lançamento Fontana', 'coworking apartamento Criciúma', 'Stiven Allan corretor SC'],
  alternates: { canonical: `${SITE_URL}/empreendimento/fontana/pineto-centro-criciuma-sc` },
  openGraph: {
    title: 'Pineto Residencial — Lifestyle Completo no Centro de Criciúma/SC',
    description: 'Apartamentos 2 e 3 dorm. com coworking, espaço yoga, piscina, academia e salão gourmet. Lançamento exclusivo Fontana.',
    url: `${SITE_URL}/empreendimento/fontana/pineto-centro-criciuma-sc`,
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
  '@graph': [
    {
      '@type': 'RealEstateListing',
      name: 'Pineto Residencial',
      description: 'Lançamento residencial no Centro de Criciúma/SC com apartamentos de 2 e 3 dormitórios, coworking, espaço yoga, academia, piscina e salão gourmet. Construtora Fontana.',
      url: `${SITE_URL}/empreendimento/fontana/pineto-centro-criciuma-sc`,
      image: 'https://lh3.googleusercontent.com/d/1WoeVn8nWbU-Zbr-NGK9fT-quhSH_OFas',
      offers: { '@type': 'Offer', priceCurrency: 'BRL', price: '450000', availability: 'https://schema.org/InStock' },
      address: { '@type': 'PostalAddress', addressLocality: 'Criciúma', addressRegion: 'SC', postalCode: '88802-100', addressCountry: 'BR' },
      floorSize: { '@type': 'QuantitativeValue', minValue: 72, maxValue: 108, unitCode: 'MTK' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Lançamentos Criciúma', item: `${SITE_URL}/lancamentos/criciuma-sc` },
        { '@type': 'ListItem', position: 3, name: 'Pineto Residencial', item: `${SITE_URL}/empreendimento/fontana/pineto-centro-criciuma-sc` },
      ],
    },
  ],
}

export default function PinetoPage() {
  const wppMsg = WPP
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      {/* NAV / BREADCRUMB */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: c.paper, borderBottom: `1px solid ${c.line}`, padding: '0 clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: c.muted }}>
            <Link href="/" style={{ color: c.muted, textDecoration: 'none' }}>Início</Link>
            <span>/</span>
            <Link href="/lancamentos/criciuma-sc" style={{ color: c.muted, textDecoration: 'none' }}>Lançamentos</Link>
            <span>/</span>
            <span style={{ color: c.ink, fontWeight: 600 }}>Pineto Residencial</span>
          </nav>
          <a href={wppMsg} target="_blank" rel="noopener noreferrer" style={{ ...ui.btnConvert, fontSize: 13, padding: '10px 20px', minHeight: 44 }}>Reservar</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', height: 'clamp(480px,70vh,680px)', overflow: 'hidden', background: c.charcoal }}>
        <Image
          src={`https://lh3.googleusercontent.com/d/${GALERIA[0].id}`}
          alt="Pineto Residencial — fachada Centro Criciúma SC"
          fill priority
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
          sizes="100vw"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(19,18,17,0.25) 0%, rgba(19,18,17,0.78) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(24px,5vw,56px)' }}>
          <div style={{ maxWidth: 700 }}>
            <span style={{ ...ui.eyebrow, display: 'inline-block', marginBottom: 14, color: c.orange }}>LANÇAMENTO · FONTANA CONSTRUTORA</span>
            <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 'clamp(2.2rem,6vw,4rem)', lineHeight: 1.05, letterSpacing: '-0.025em', color: c.onDark, margin: '0 0 16px' }}>
              Pineto Residencial
            </h1>
            <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: c.onDarkMuted, marginBottom: 32, maxWidth: 520, lineHeight: 1.65 }}>
              O empreendimento que redefine o estilo de vida no Centro de Criciúma. Apartamentos 2 e 3 dormitórios com coworking, yoga, academia e piscina — tudo no mesmo lugar.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={wppMsg} target="_blank" rel="noopener noreferrer" style={{ ...ui.btnConvert, minHeight: 48, display: 'inline-flex', alignItems: 'center', boxShadow: '0 8px 28px rgba(255,106,61,0.35)' }}>
                Tenho interesse
              </a>
              <a href="#galeria" style={{ ...ui.btnSecondary, color: c.onDark, borderColor: 'rgba(245,241,234,0.3)', minHeight: 48, display: 'inline-flex', alignItems: 'center' }}>
                Ver galeria
              </a>
            </div>
          </div>
        </div>
        {/* Pills */}
        <div style={{ position: 'absolute', top: 24, left: 'clamp(16px,5vw,40px)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Centro Criciúma', 'Coworking', 'Yoga', '2 e 3 Dorms'].map(t => (
            <span key={t} style={{ background: 'rgba(19,18,17,0.65)', border: `1px solid ${c.bronze}66`, borderRadius: 40, padding: '5px 14px', fontSize: 12, fontWeight: 600, color: c.onDark, backdropFilter: 'blur(8px)' }}>{t}</span>
          ))}
        </div>
      </section>

      {/* NÚMEROS */}
      <section style={{ background: c.surface, borderBottom: `1px solid ${c.line}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(28px,4vw,40px) clamp(16px,4vw,40px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 24 }}>
          {[
            { v: 'R$ 450 mil', l: 'A partir de' },
            { v: '72–108 m²', l: 'Área privativa' },
            { v: '2 e 3', l: 'Dormitórios' },
            { v: 'Coworking', l: 'Diferencial único' },
            { v: 'Centro', l: 'Criciúma / SC' },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: font.display, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 800, color: c.bronze, letterSpacing: '-0.02em' }}>{v}</div>
              <div style={{ fontSize: 12, color: c.muted, marginTop: 4, letterSpacing: '0.04em' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" style={{ padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 12 }}>GALERIA</span>
          <h2 style={{ ...ui.h2, color: c.ink }}>Um novo padrão para Criciúma</h2>
        </div>
        {/* Destaque 2-col */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 8, marginBottom: 8 }}>
          <div style={{ borderRadius: 4, overflow: 'hidden', position: 'relative', height: 'clamp(260px,38vw,460px)' }}>
            <Image src={`https://lh3.googleusercontent.com/d/${GALERIA[0].id}`} alt={GALERIA[0].alt} fill style={{ objectFit: 'cover' }} sizes="60vw" />
            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(19,18,17,0.72)', borderRadius: 2, padding: '4px 12px', fontSize: 12, color: c.onDark, fontWeight: 600 }}>{GALERIA[0].label}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {GALERIA.slice(1, 3).map(img => (
              <div key={img.id} style={{ borderRadius: 4, overflow: 'hidden', position: 'relative', flex: 1 }}>
                <Image src={`https://lh3.googleusercontent.com/d/${img.id}`} alt={img.alt} fill style={{ objectFit: 'cover' }} sizes="30vw" />
                <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(19,18,17,0.72)', borderRadius: 2, padding: '3px 10px', fontSize: 11, color: c.onDark, fontWeight: 600 }}>{img.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Grid restante */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
          {GALERIA.slice(3).map(img => (
            <div key={img.id} style={{ borderRadius: 4, overflow: 'hidden', position: 'relative', height: 180 }}>
              <Image src={`https://lh3.googleusercontent.com/d/${img.id}`} alt={img.alt} fill style={{ objectFit: 'cover' }} sizes="260px" />
              <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(19,18,17,0.72)', borderRadius: 2, padding: '3px 10px', fontSize: 11, color: c.onDark, fontWeight: 600 }}>{img.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section style={{ background: c.surface, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)', borderTop: `1px solid ${c.line}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 12 }}>DIFERENCIAIS</span>
            <h2 style={{ ...ui.h2, color: c.ink }}>O que só o Pineto tem</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {DIFERENCIAIS.map(d => (
              <div key={d.titulo} style={{ ...ui.card, padding: '22px 24px', display: 'flex', gap: 16, alignItems: 'flex-start', borderLeft: `3px solid ${c.bronze}`, transition: 'transform .2s, border-color .2s, box-shadow .2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.borderColor = c.orange; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(210,78,34,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.borderColor = c.bronze; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
              >
                <span style={{ fontSize: 26, flexShrink: 0, marginTop: 2 }}>{d.icon}</span>
                <div>
                  <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 15, color: c.ink, marginBottom: 6 }}>{d.titulo}</div>
                  <div style={{ fontSize: 13, color: c.muted, lineHeight: 1.6 }}>{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COWORKING DESTAQUE */}
      <section style={{ padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)', background: c.paper }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }}>
          <div style={{ borderRadius: 4, overflow: 'hidden', position: 'relative', height: 'clamp(260px,35vw,400px)', border: `1px solid ${c.line}` }}>
            <Image src={`https://lh3.googleusercontent.com/d/${GALERIA[6].id}`} alt="Pineto — coworking integrado" fill style={{ objectFit: 'cover' }} sizes="50vw" />
          </div>
          <div>
            <span style={{ background: `${c.bronze}18`, border: `1px solid ${c.bronze}40`, borderRadius: 40, padding: '5px 14px', fontSize: 11, fontWeight: 700, color: c.bronze, display: 'inline-block', marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Exclusivo no Pineto
            </span>
            <h2 style={{ ...ui.h2, color: c.ink }}>Coworking integrado ao seu lar</h2>
            <p style={{ fontSize: 15, color: c.muted, lineHeight: 1.8, marginTop: 20, marginBottom: 16 }}>
              O Pineto é o único empreendimento residencial em Criciúma com coworking profissional integrado. Trabalhe com produtividade, sem deslocamento, com toda a infraestrutura que você precisa a passos do seu apartamento.
            </p>
            <p style={{ fontSize: 15, color: c.muted, lineHeight: 1.8 }}>
              Ideal para profissionais remotos, empreendedores e quem valoriza equilíbrio entre vida profissional e pessoal.
            </p>
          </div>
        </div>
      </section>

      {/* YOGA DESTAQUE */}
      <section style={{ background: c.charcoal, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }}>
            <div>
              <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 16, color: c.orange }}>BEM-ESTAR</span>
              <h2 style={{ ...ui.h2, color: c.onDark }}>Espaço Yoga e Meditação</h2>
              <p style={{ fontSize: 15, color: c.onDarkMuted, lineHeight: 1.8, marginTop: 20 }}>
                Um espaço dedicado ao equilíbrio mental e físico, projetado para a prática de yoga, meditação e alongamento. Mais um diferencial que coloca o Pineto em uma categoria única no mercado imobiliário de Criciúma.
              </p>
            </div>
            <div style={{ borderRadius: 4, overflow: 'hidden', position: 'relative', height: 'clamp(240px,30vw,360px)' }}>
              <Image src={`https://lh3.googleusercontent.com/d/${GALERIA[7].id}`} alt="Pineto — espaço yoga meditação" fill style={{ objectFit: 'cover' }} sizes="50vw" />
            </div>
          </div>
        </div>
      </section>

      {/* SIMULADOR */}
      <div style={{ background: c.surface, borderTop: `1px solid ${c.line}` }}>
        <Simulador
          valorInicial={450000}
          valorMin={315000}
          valorMax={700000}
          hrefReserva={wppMsg}
        />
      </div>

      {/* LOCALIZAÇÃO */}
      <section style={{ padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)', background: c.paper, borderTop: `1px solid ${c.line}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 12 }}>LOCALIZAÇÃO</span>
          <h2 style={{ ...ui.h2, color: c.ink }}>Centro de Criciúma — tudo a sua porta</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 32 }}>
            {['Shopping Della', 'Hospital São José', 'Universidades UNESC e SATC', 'Gastronomia e bares', 'Comércio e bancos', 'Terminal de ônibus'].map(item => (
              <div key={item} style={{ ...ui.card, padding: '14px 18px', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 6, height: 6, background: c.bronze, borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: c.ink }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA CONSULTOR */}
      <section style={{ background: c.charcoal, padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 16, color: c.orange }}>CONSULTOR EXCLUSIVO</span>
          <h2 style={{ ...ui.h2, color: c.onDark }}>Stiven Allan — CRECI/RS 60.275</h2>
          <p style={{ fontSize: 15, color: c.onDarkMuted, lineHeight: 1.7, margin: '20px 0 32px' }}>
            Especialista em lançamentos Fontana em Criciúma. Atendimento personalizado, análise de investimento e acompanhamento completo do processo de compra.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={wppMsg} target="_blank" rel="noopener noreferrer"
              style={{ background: '#25d366', color: '#fff', borderRadius: 2, padding: '15px 28px', fontWeight: 700, fontSize: 15, textDecoration: 'none', minHeight: 48, display: 'inline-flex', alignItems: 'center' }}>
              Chamar no WhatsApp
            </a>
            <a href="tel:+5548991455522"
              style={{ ...ui.btnSecondary, color: c.onDark, borderColor: c.lineDark, minHeight: 48, display: 'inline-flex', alignItems: 'center' }}>
              (48) 99145-5522
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER MÍNIMO */}
      <footer style={{ background: c.charcoal, borderTop: `1px solid ${c.lineDark}`, padding: 'clamp(24px,3vw,32px) clamp(16px,4vw,40px)', textAlign: 'center', color: c.onDarkMuted, fontSize: 13 }}>
        <p style={{ margin: 0 }}>
          Pineto Residencial · Fontana Construtora · Centro, Criciúma/SC<br />
          Consultor: Stiven Allan · CRECI/RS 60.275 · (48) 99145-5522
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'rgba(245,241,234,0.35)' }}>
          As imagens são ilustrativas. Informações sujeitas a alterações sem aviso prévio.
        </p>
      </footer>

      {/* CTA STICKY MOBILE */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 80, background: c.paper, borderTop: `1px solid ${c.line}`, padding: '12px 16px', display: 'flex', gap: 8 }}>
        <a href={wppMsg} target="_blank" rel="noopener noreferrer"
          style={{ ...ui.btnConvert, flex: 1, textAlign: 'center', minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
          Tenho interesse — WhatsApp
        </a>
      </div>
    </>
  )
}
