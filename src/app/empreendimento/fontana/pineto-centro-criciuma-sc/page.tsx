import type { Metadata } from 'next'
import Link from 'next/link'

const C = {
  bg: '#121315', card: '#202327', border: '#2c3035',
  accent: '#c9a24b', accent2: '#e2c275', muted: '#a7adb4',
  white: '#f1f3f5', green: '#1f9d55', danger: '#e63946',
}

const WPP = 'https://api.whatsapp.com/send?phone=5548991455522&text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Pineto%20Residencial!'

export const metadata: Metadata = {
  title: 'Pineto Residencial | Apartamento 2 Quartos Centro Criciúma SC | Stiven Allan Corretor',
  description: 'Pineto Residencial: apartamentos 2 dormitórios (1 suíte), 75 a 76m², academia, coworking, salão de festas. Em obras no Centro de Criciúma/SC. Construtora Fontana. Stiven Allan, CRECI/RS 60.275.',
  keywords: ['Pineto Residencial', 'apartamento 2 quartos Centro Criciúma', 'em obras Fontana Criciúma', 'apartamento compacto moderno Criciúma SC', 'Stiven Allan corretor', 'coworking residencial Criciúma'],
  alternates: { canonical: 'https://stivenallan.vercel.app/empreendimento/fontana/pineto-centro-criciuma-sc' },
  openGraph: {
    title: 'Pineto Residencial — Modernidade e Praticidade no Centro de Criciúma/SC',
    description: 'Apartamentos 2 dorm. (1 suíte), 75–76m², academia, coworking, espaço ioga. Em obras. Stiven Allan CRECI/RS 60.275.',
    url: 'https://stivenallan.vercel.app/empreendimento/fontana/pineto-centro-criciuma-sc',
    type: 'website',
    locale: 'pt_BR',
  },
}

const schemaLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'RealEstateListing',
      '@id': 'https://stivenallan.vercel.app/empreendimento/fontana/pineto-centro-criciuma-sc#listing',
      name: 'Pineto Residencial',
      description: 'Apartamentos 2 dormitórios (1 suíte), 75 a 76m², academia, coworking, espaço ioga, salão de festas. Em obras. Construtora Fontana, Centro de Criciúma/SC.',
      url: 'https://stivenallan.vercel.app/empreendimento/fontana/pineto-centro-criciuma-sc',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rua Itajaí, 185',
        addressLocality: 'Criciúma',
        addressRegion: 'SC',
        addressCountry: 'BR',
      },
      numberOfRooms: 2,
      floorSize: { '@type': 'QuantitativeValue', value: 75, maxValue: 76, unitCode: 'MTK' },
      offers: { '@type': 'Offer', priceCurrency: 'BRL', availability: 'https://schema.org/InStock' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://stivenallan.vercel.app' },
        { '@type': 'ListItem', position: 2, name: 'Lançamentos Criciúma', item: 'https://stivenallan.vercel.app/lancamentos/criciuma-sc' },
        { '@type': 'ListItem', position: 3, name: 'Pineto Residencial', item: 'https://stivenallan.vercel.app/empreendimento/fontana/pineto-centro-criciuma-sc' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Qual o preço do Pineto Residencial?', acceptedAnswer: { '@type': 'Answer', text: 'Preços sob consulta. O Pineto oferece condições especiais para quem compra ainda em obras. Contate Stiven Allan.' } },
        { '@type': 'Question', name: 'Onde fica o Pineto Residencial?', acceptedAnswer: { '@type': 'Answer', text: 'Rua Itajaí, 185 — Centro de Criciúma/SC. Localização central com fácil acesso a comércio e mobilidade urbana.' } },
        { '@type': 'Question', name: 'O Pineto tem academia?', acceptedAnswer: { '@type': 'Answer', text: 'Sim. O Pineto tem academia, coworking, espaço ioga e salão de festas nas áreas comuns.' } },
        { '@type': 'Question', name: 'O Pineto é bom para investimento?', acceptedAnswer: { '@type': 'Answer', text: 'Sim. Apartamentos compactos no Centro têm alta demanda para locação e valorização consistente em Criciúma.' } },
        { '@type': 'Question', name: 'O Pineto aceita FGTS?', acceptedAnswer: { '@type': 'Answer', text: 'Sim, o Pineto pode ser financiado com FGTS dependendo do perfil. Consulte Stiven Allan para simulação personalizada.' } },
      ],
    },
  ],
}

export default function Pineto() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaLD) }} />

      {/* BARRA OBRAS */}
      <div style={{ background: '#1a4a7a', color: '#fff', textAlign: 'center', padding: '10px 16px', fontSize: '13px', fontWeight: 600, position: 'sticky', top: 0, zIndex: 100 }}>
        🏗️ Em obras — Compre agora e garanta as melhores condições.{' '}
        <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: '#90c8ff', textDecoration: 'underline' }}>Falar com corretor →</a>
      </div>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', background: '#0a0b0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px 60px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(18,19,21,0.88) 100%)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px' }}>
          <p style={{ color: C.accent, fontSize: '13px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Em Obras · Fontana · Centro – Criciúma/SC
          </p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', fontWeight: 900, color: C.white, lineHeight: 1.05, marginBottom: '20px', letterSpacing: '-1px' }}>
            Pineto<br /><span style={{ color: C.accent }}>Residencial</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: C.muted, maxWidth: '600px', margin: '0 auto 16px' }}>
            Experimente. Sinta. Viva. O apartamento compacto e completo no coração de Criciúma.
          </p>
          <p style={{ fontSize: '15px', color: C.muted, maxWidth: '540px', margin: '0 auto 40px', fontStyle: 'italic' }}>
            2 dormitórios (1 suíte) · 75–76m² · Academia · Coworking · Espaço Ioga
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer"
              style={{ background: C.green, color: '#fff', padding: '16px 36px', borderRadius: '8px', fontWeight: 700, fontSize: '16px', textDecoration: 'none' }}>
              📲 Quero Conhecer
            </a>
            <a href="#diferenciais"
              style={{ background: 'transparent', color: C.accent, padding: '16px 36px', borderRadius: '8px', fontWeight: 700, fontSize: '16px', textDecoration: 'none', border: `2px solid ${C.accent}` }}>
              Ver Detalhes ↓
            </a>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: C.border, borderRadius: '12px', overflow: 'hidden', marginTop: '60px', width: '100%', maxWidth: '720px' }}>
          {[{ n: '2', d: 'Dormitórios' }, { n: '1', d: 'Suíte' }, { n: '76m²', d: 'Área Privativa' }, { n: '2', d: 'Elevadores' }].map((i) => (
            <div key={i.d} style={{ background: C.card, padding: '22px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: C.accent }}>{i.n}</div>
              <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>{i.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CONCEITO */}
      <section style={{ background: C.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '16px' }}>O Empreendimento</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: C.white, marginBottom: '24px', lineHeight: 1.15 }}>Aqui a sua originalidade é o segredo para viver bem.</h2>
          <p style={{ color: C.muted, fontSize: '1.05rem', lineHeight: 1.8 }}>
            Todas as decisões ainda podem ser tomadas. Todas as oportunidades ainda irão surgir. O Pineto Residencial foi pensado para quem valoriza a vida no centro, com praticidade, design inteligente e espaços que estimulam um novo modo de viver.
          </p>
          <p style={{ color: C.muted, fontSize: '1.05rem', lineHeight: 1.8, marginTop: '16px' }}>
            Ideal para quem busca primeiro imóvel, investimento para locação, ou um endereço moderno no coração de Criciúma.
          </p>
        </div>
      </section>

      {/* TIPOLOGIA */}
      <section id="plantas" style={{ background: '#0e1012', padding: '80px 24px' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Planta & Tipologia</p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: C.white }}>Design inteligente em espaço otimizado</h2>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '36px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})` }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {[
                { label: 'Área Privativa', value: '75–76m²' },
                { label: 'Dormitórios', value: '2 (1 suíte)' },
                { label: 'Living', value: 'Integrado' },
                { label: 'Sacada', value: 'Guarda-corpo vidro' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: C.accent }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: C.muted, marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <p style={{ color: C.muted, fontSize: '14px', lineHeight: 1.7 }}>
              Living integrado, sacada ampla com guarda-corpo em vidro, persiana nos dormitórios, churrasqueira a carvão, piso porcelanato retificado, rebaixo em gesso, laje técnica para split.
            </p>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section id="diferenciais" style={{ background: C.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Diferenciais & Lazer</p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: C.white }}>Mais do que um apartamento — um estilo de vida</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            {[
              { icon: '🏋️', label: 'Academia' },
              { icon: '💼', label: 'Coworking' },
              { icon: '🧘', label: 'Espaço Ioga' },
              { icon: '🎉', label: 'Salão de Festas' },
              { icon: '🧒', label: 'Playground' },
              { icon: '🌳', label: 'Área Externa' },
              { icon: '🛗', label: '2 Elevadores' },
              { icon: '🔐', label: 'Sistema de Segurança' },
              { icon: '⚡', label: 'Gerador de Energia' },
              { icon: '📹', label: 'Câmeras 24h' },
              { icon: '🏡', label: 'Hall Pé-Direito Duplo' },
              { icon: '🚿', label: 'Persiana nos Dormitórios' },
            ].map((d) => (
              <div key={d.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '18px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '26px', marginBottom: '8px' }}>{d.icon}</div>
                <div style={{ color: C.white, fontSize: '13px', fontWeight: 600 }}>{d.label}</div>
              </div>
            ))}
          </div>

          {/* Destaque investimento */}
          <div style={{ marginTop: '36px', background: `linear-gradient(135deg, rgba(201,162,75,0.08), rgba(201,162,75,0.03))`, border: `1px solid ${C.accent}`, borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>💰</div>
            <h3 style={{ color: C.accent, fontWeight: 800, fontSize: '16px', marginBottom: '8px' }}>Excelente para investimento</h3>
            <p style={{ color: C.muted, fontSize: '14px', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto' }}>
              Apartamentos compactos no Centro de Criciúma têm alta demanda para locação por estudantes, profissionais e turistas. Rentabilidade atrativa e valorização consistente no mercado local.
            </p>
          </div>
        </div>
      </section>

      {/* LOCALIZAÇÃO */}
      <section id="localizacao" style={{ background: '#0e1012', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Localização</p>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: C.white, marginBottom: '14px' }}>No Centro de todos os seus novos planos</h2>
            <p style={{ color: C.muted, lineHeight: 1.8, marginBottom: '16px' }}>Rua Itajaí, 185 — Centro, Criciúma/SC. Localização estratégica no coração da cidade.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {['📍 Centro histórico e comercial de Criciúma', '🚌 Terminal de ônibus e transporte público', '🎓 Universidades e cursos técnicos próximos', '🍴 Restaurantes e entretenimento a pé', '🏪 Supermercados e farmácias no bairro'].map((l) => (
                <div key={l} style={{ color: C.muted, fontSize: '14px' }}>{l}</div>
              ))}
            </div>
            <a href="https://www.google.com/maps/search/?api=1&query=Rua+Itajaí+185+Criciúma+SC" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: 'transparent', color: C.accent, border: `2px solid ${C.accent}`, padding: '12px 22px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              Ver no Google Maps →
            </a>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden', height: '300px' }}>
            <iframe title="Localização Pineto Residencial"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3550.3!2d-49.3700!3d-28.6760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zUGluZXRvIFJlc2lkZW5jaWFs!5e0!3m2!1spt-BR!2sbr!4v1700000000002"
              width="100%" height="100%" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>

      {/* CORRETOR */}
      <section style={{ background: C.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div style={{ background: C.card, border: `2px solid ${C.accent}`, borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
            <div style={{ width: '76px', height: '76px', background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, borderRadius: '50%', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>🏡</div>
            <h3 style={{ color: C.white, fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>Stiven Allan</h3>
            <p style={{ color: C.accent, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>CRECI/RS 60.275</p>
          </div>
          <div>
            <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px' }}>Seu Corretor</p>
            <h2 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.7rem)', fontWeight: 800, color: C.white, marginBottom: '12px' }}>Especialista em Fontana em Criciúma</h2>
            <p style={{ color: C.muted, lineHeight: 1.8, marginBottom: '20px', fontSize: '14px' }}>
              Do primeiro contato à entrega das chaves. Stiven Allan oferece simulação de financiamento, consultoria documental e acompanhamento completo. Condições especiais para quem compra ainda em obras.
            </p>
            <a href={WPP} target="_blank" rel="noopener noreferrer"
              style={{ background: C.green, color: '#fff', padding: '13px 26px', borderRadius: '8px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', display: 'inline-block' }}>
              📲 Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* CAPTAÇÃO */}
      <section id="contato" style={{ background: '#0e1012', padding: '80px 24px' }}>
        <div style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Fale com o Corretor</p>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: C.white, marginBottom: '10px' }}>Receba tabela e condições</h2>
          <p style={{ color: C.muted, marginBottom: '28px', fontSize: '14px' }}>Sem compromisso. Resposta em minutos no WhatsApp.</p>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '28px' }}>
            <div style={{ display: 'grid', gap: '12px' }}>
              <input type="text" placeholder="Seu nome" aria-label="Nome" style={{ background: '#1a1d21', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '14px 16px', color: C.white, fontSize: '15px', width: '100%', boxSizing: 'border-box' }} />
              <input type="tel" placeholder="WhatsApp (com DDD)" aria-label="WhatsApp" style={{ background: '#1a1d21', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '14px 16px', color: C.white, fontSize: '15px', width: '100%', boxSizing: 'border-box' }} />
              <a href={WPP} target="_blank" rel="noopener noreferrer"
                style={{ background: C.green, color: '#fff', padding: '15px', borderRadius: '8px', fontWeight: 700, fontSize: '16px', textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                📲 Enviar pelo WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ background: C.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>FAQ</p>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: C.white }}>Perguntas Frequentes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: 'Qual o preço do Pineto Residencial?', a: 'Preços sob consulta. O Pineto oferece condições especiais para quem compra ainda em obras. Entre em contato com Stiven Allan.' },
              { q: 'Onde fica o Pineto?', a: 'Rua Itajaí, 185 — Centro de Criciúma/SC, com localização central e fácil acesso a toda a cidade.' },
              { q: 'O Pineto é bom para investimento?', a: 'Sim. Unidades compactas no Centro têm alta demanda para locação e consistente valorização no mercado imobiliário de Criciúma.' },
              { q: 'Posso usar FGTS no Pineto?', a: 'Dependendo do valor e perfil, o FGTS pode ser utilizado. Stiven Allan realiza análise gratuita para você.' },
              { q: 'O Pineto tem coworking?', a: 'Sim. O Pineto é um dos poucos empreendimentos em Criciúma com coworking, além de academia, espaço ioga e área externa.' },
            ].map((item, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px' }}>
                <h3 style={{ color: C.white, fontWeight: 700, marginBottom: '8px', fontSize: '14px' }}>❓ {item.q}</h3>
                <p style={{ color: C.muted, lineHeight: 1.7, fontSize: '14px' }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: `linear-gradient(135deg, #0e1012, #1a1d21)`, padding: '80px 24px', textAlign: 'center', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '660px', margin: '0 auto' }}>
          <div style={{ fontSize: '44px', marginBottom: '18px' }}>🏙️</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.7rem)', fontWeight: 900, color: C.white, marginBottom: '14px' }}>Pineto — experimente, sinta, viva</h2>
          <p style={{ color: C.muted, fontSize: '1rem', lineHeight: 1.7, marginBottom: '32px' }}>Condições especiais ainda em obras. Ideal para morar ou investir no Centro de Criciúma.</p>
          <a href={WPP} target="_blank" rel="noopener noreferrer"
            style={{ background: C.green, color: '#fff', padding: '17px 42px', borderRadius: '10px', fontWeight: 800, fontSize: '17px', textDecoration: 'none', display: 'inline-block' }}>
            📲 Falar com Stiven Allan
          </a>
          <p style={{ color: C.muted, fontSize: '13px', marginTop: '14px' }}>CRECI/RS 60.275 · Criciúma/SC</p>
        </div>
      </section>

      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" style={{ background: '#0a0b0d', padding: '12px 24px', borderTop: `1px solid ${C.border}` }}>
        <ol style={{ display: 'flex', gap: '8px', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap', maxWidth: '1100px', marginLeft: 'auto', marginRight: 'auto' }}>
          <li><Link href="/" style={{ color: C.muted, fontSize: '13px', textDecoration: 'none' }}>Início</Link></li>
          <li style={{ color: C.border }}>›</li>
          <li><Link href="/lancamentos/criciuma-sc" style={{ color: C.muted, fontSize: '13px', textDecoration: 'none' }}>Lançamentos Criciúma</Link></li>
          <li style={{ color: C.border }}>›</li>
          <li><span style={{ color: C.accent, fontSize: '13px', fontWeight: 600 }}>Pineto Residencial</span></li>
        </ol>
      </nav>
    </>
  )
}
