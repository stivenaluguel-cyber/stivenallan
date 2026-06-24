import type { Metadata } from 'next'
import Link from 'next/link'

const C = {
  bg: '#121315', card: '#202327', border: '#2c3035',
  accent: '#c9a24b', accent2: '#e2c275', muted: '#a7adb4',
  white: '#f1f3f5', green: '#1f9d55', danger: '#e63946',
}

const WPP = 'https://api.whatsapp.com/send?phone=5548991455522&text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Lavis%20Residencial!'

export const metadata: Metadata = {
  title: 'Lavis Residencial | Apartamento 3 Suítes Centro Criciúma SC | Stiven Allan Corretor',
  description: 'Lavis Residencial: apartamentos 3 dormitórios (3 suítes), 125 a 132m², no Centro de Criciúma/SC. Em obras. Construtora Fontana. Consultoria de Stiven Allan, CRECI/RS 60.275.',
  keywords: ['Lavis Residencial', 'apartamento 3 suítes Centro Criciúma', 'em obras Fontana Criciúma', 'apartamento moderno Criciúma SC', 'Stiven Allan corretor'],
  alternates: { canonical: 'https://stivenallan.vercel.app/empreendimento/fontana/lavis-centro-criciuma-sc' },
  openGraph: {
    title: 'Lavis Residencial — Sofisticação em Movimento no Centro de Criciúma/SC',
    description: 'Apartamentos 3 dorm. (3 suítes), 125–132m², piscina, academia, reconhecimento facial. Em obras. Stiven Allan CRECI/RS 60.275.',
    url: 'https://stivenallan.vercel.app/empreendimento/fontana/lavis-centro-criciuma-sc',
    type: 'website',
    locale: 'pt_BR',
  },
}

const schemaLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'RealEstateListing',
      '@id': 'https://stivenallan.vercel.app/empreendimento/fontana/lavis-centro-criciuma-sc#listing',
      name: 'Lavis Residencial',
      description: 'Apartamentos 3 dormitórios (3 suítes), 125 a 132m², piscina, academia, espaço gourmet, reconhecimento facial. Em obras. Construtora Fontana, Centro de Criciúma/SC.',
      url: 'https://stivenallan.vercel.app/empreendimento/fontana/lavis-centro-criciuma-sc',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rua Timóteo Batista, 53',
        addressLocality: 'Criciúma',
        addressRegion: 'SC',
        addressCountry: 'BR',
      },
      numberOfRooms: 3,
      floorSize: { '@type': 'QuantitativeValue', value: 125, maxValue: 132, unitCode: 'MTK' },
      offers: { '@type': 'Offer', priceCurrency: 'BRL', availability: 'https://schema.org/InStock' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://stivenallan.vercel.app' },
        { '@type': 'ListItem', position: 2, name: 'Lançamentos Criciúma', item: 'https://stivenallan.vercel.app/lancamentos/criciuma-sc' },
        { '@type': 'ListItem', position: 3, name: 'Lavis Residencial', item: 'https://stivenallan.vercel.app/empreendimento/fontana/lavis-centro-criciuma-sc' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Qual o preço do Lavis Residencial?', acceptedAnswer: { '@type': 'Answer', text: 'O Lavis é um empreendimento de médio-alto padrão. Consulte o corretor Stiven Allan para valores atualizados e condições especiais.' } },
        { '@type': 'Question', name: 'Onde fica o Lavis Residencial?', acceptedAnswer: { '@type': 'Answer', text: 'Rua Timóteo Batista, 53 — Centro de Criciúma/SC. Localização estratégica com excelente mobilidade urbana.' } },
        { '@type': 'Question', name: 'O Lavis tem piscina?', acceptedAnswer: { '@type': 'Answer', text: 'Sim, o Lavis conta com piscina, academia, espaço gourmet e terraço nas áreas de lazer.' } },
        { '@type': 'Question', name: 'Qual o status do Lavis Residencial?', acceptedAnswer: { '@type': 'Answer', text: 'O Lavis está em obras. Entre em contato para saber o prazo de entrega.' } },
        { '@type': 'Question', name: 'Qual a construtora do Lavis?', acceptedAnswer: { '@type': 'Answer', text: 'O Lavis Residencial é um empreendimento da Construtora Fontana, com tradição em Criciúma/SC.' } },
      ],
    },
  ],
}

export default function Lavis() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaLD) }} />

      {/* SEÇÃO 0 — STATUS */}
      <div style={{ background: '#1a5c3a', color: '#fff', textAlign: 'center', padding: '10px 16px', fontSize: '13px', fontWeight: 600, position: 'sticky', top: 0, zIndex: 100 }}>
        🏗️ Em obras — Oportunidade para entrada com condições especiais.{' '}
        <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: '#a8f0c6', textDecoration: 'underline' }}>Consulte →</a>
      </div>

      {/* SEÇÃO 1 — HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', background: '#0a0b0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px 60px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(18,19,21,0.88) 100%)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px' }}>
          <p style={{ color: C.accent, fontSize: '13px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Em Obras · Fontana · Centro – Criciúma/SC
          </p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', fontWeight: 900, color: C.white, lineHeight: 1.05, marginBottom: '20px', letterSpacing: '-1px' }}>
            Lavis<br />
            <span style={{ color: C.accent }}>Residencial</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: C.muted, maxWidth: '600px', margin: '0 auto 16px' }}>
            Sofisticação em movimento. A vida moderna em equilíbrio no Centro de Criciúma.
          </p>
          <p style={{ fontSize: '1rem', color: C.muted, maxWidth: '560px', margin: '0 auto 40px', fontStyle: 'italic' }}>
            3 dormitórios (3 suítes) · 125–132m² · Piscina · Academia · Reconhecimento facial
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
        {/* Barra de números */}
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: C.border, borderRadius: '12px', overflow: 'hidden', marginTop: '60px', width: '100%', maxWidth: '760px' }}>
          {[{ n: '3', d: 'Dormitórios' }, { n: '3', d: 'Suítes' }, { n: '132m²', d: 'Área Privativa' }, { n: '2', d: 'Vagas Garagem' }].map((i) => (
            <div key={i.d} style={{ background: C.card, padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: C.accent }}>{i.n}</div>
              <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>{i.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO 2 — CONCEITO */}
      <section style={{ background: C.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '16px' }}>O Empreendimento</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: C.white, marginBottom: '24px', lineHeight: 1.15 }}>Sofisticação em Movimento.</h2>
          <p style={{ color: C.muted, fontSize: '1.1rem', lineHeight: 1.8 }}>
            No Lavis, a vida moderna encontra o equilíbrio. E, mesmo em constante movimento, a harmonia permanece. Traços orgânicos que tornam seu lar harmoniosamente encantador — curvas que se entrelaçam e transmitem calmaria, enquanto o aconchego envolve e convida para entrar.
          </p>
          <p style={{ color: C.muted, fontSize: '1.1rem', lineHeight: 1.8, marginTop: '16px' }}>
            Experimente o privilégio de viver no centro de tudo, com sofisticação ao seu redor. Localização estratégica, onde a vida pulsa ao redor, mas o bem-estar permanece.
          </p>
        </div>
      </section>

      {/* SEÇÃO 3 — TIPOLOGIA */}
      <section id="plantas" style={{ background: '#0e1012', padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Plantas & Tipologias</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, color: C.white }}>Um respiro em meio à rotina</h2>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '36px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})` }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '24px', marginBottom: '28px' }}>
              {[
                { label: 'Área Privativa', value: '125–132m²' },
                { label: 'Dormitórios', value: '3 (todas suítes)' },
                { label: 'Vagas', value: '2 por unidade' },
                { label: 'Lavabo', value: 'Incluso' },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.accent }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: C.muted, marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <p style={{ color: C.muted, fontSize: '14px', lineHeight: 1.7 }}>
              Possibilidade de personalização de planta. Living integrado, sacada ampla, churrasqueira com exaustão e damper, janela com peitoril em vidro. Hall de entrada com pé-direito duplo.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4 — DIFERENCIAIS */}
      <section id="diferenciais" style={{ background: C.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Diferenciais & Lazer</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, color: C.white }}>Onde cada detalhe importa</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
            {[
              { icon: '🏊', label: 'Piscina' },
              { icon: '🏋️', label: 'Academia' },
              { icon: '🍖', label: 'Espaço Gourmet' },
              { icon: '🎉', label: 'Salão de Festas' },
              { icon: '🌳', label: 'Terraço' },
              { icon: '🧒', label: 'Brinquedoteca' },
              { icon: '🔐', label: 'Reconhecimento Facial' },
              { icon: '⚡', label: 'Gerador de Energia' },
              { icon: '🚗', label: 'Espera Carro Elétrico' },
              { icon: '📹', label: 'Segurança 24h por câmera' },
              { icon: '🛗', label: 'Hall Pé-Direito Duplo' },
              { icon: '📦', label: 'Nicho nos Banheiros' },
            ].map((d) => (
              <div key={d.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '18px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '26px', marginBottom: '8px' }}>{d.icon}</div>
                <div style={{ color: C.white, fontSize: '13px', fontWeight: 600 }}>{d.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '36px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '28px' }}>
            <h3 style={{ color: C.accent, fontWeight: 700, marginBottom: '16px', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Acabamentos Inclusos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
              {[
                'Porcelanato retificado', 'Rebaixo em gesso', 'Fechadura digital', 'Pé-direito duplo no hall',
                'Janela com peitoril em vidro', 'Garagem com pintura epóxi', 'Ponto para lava-louças',
                'Churrasqueira com exaustão e damper', 'Manta acústica entre pavimentos', 'Tubulação para água quente',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.muted, fontSize: '13px' }}>
                  <span style={{ color: C.accent, fontWeight: 700 }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 5 — LOCALIZAÇÃO */}
      <section id="localizacao" style={{ background: '#0e1012', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Localização</p>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 800, color: C.white, marginBottom: '16px' }}>No centro da cidade, no seu ritmo</h2>
            <p style={{ color: C.muted, lineHeight: 1.8, marginBottom: '16px' }}>Rua Timóteo Batista, 53 — Centro, Criciúma/SC.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {['🛒 Comércio e serviços no entorno', '🏫 Universidades e escolas próximas', '🏥 Hospitais e farmácias nas redondezas', '🚌 Terminal de ônibus e mobilidade urbana', '🍽️ Gastronomia e lazer a pé'].map((l) => (
                <div key={l} style={{ color: C.muted, fontSize: '14px' }}>{l}</div>
              ))}
            </div>
            <a href="https://www.google.com/maps/search/?api=1&query=Rua+Timóteo+Batista+53+Criciúma+SC" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: 'transparent', color: C.accent, border: `2px solid ${C.accent}`, padding: '12px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              Ver no Google Maps →
            </a>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden', height: '320px' }}>
            <iframe title="Localização Lavis Residencial"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3550.2!2d-49.3711!3d-28.6745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zTGF2aXMgUmVzaWRlbmNpYWw!5e0!3m2!1spt-BR!2sbr!4v1700000000001"
              width="100%" height="100%" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>

      {/* SEÇÃO 6 — CORRETOR */}
      <section style={{ background: C.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div style={{ background: C.card, border: `2px solid ${C.accent}`, borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🏡</div>
            <h3 style={{ color: C.white, fontWeight: 800, fontSize: '1.2rem', marginBottom: '4px' }}>Stiven Allan</h3>
            <p style={{ color: C.accent, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>CRECI/RS 60.275</p>
          </div>
          <div>
            <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Seu Corretor</p>
            <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 800, color: C.white, marginBottom: '14px' }}>Especialista em empreendimentos Fontana</h2>
            <p style={{ color: C.muted, lineHeight: 1.8, marginBottom: '24px' }}>
              Stiven Allan acompanha você do primeiro contato até a entrega das chaves. Simulação, documentação, financiamento bancário e condições exclusivas para corretores parceiros da Fontana.
            </p>
            <a href={WPP} target="_blank" rel="noopener noreferrer"
              style={{ background: C.green, color: '#fff', padding: '14px 28px', borderRadius: '8px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', display: 'inline-block' }}>
              📲 Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* SEÇÃO 7 — CAPTAÇÃO */}
      <section id="contato" style={{ background: '#0e1012', padding: '80px 24px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Fale com o Corretor</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: C.white, marginBottom: '12px' }}>Receba a tabela de preços</h2>
          <p style={{ color: C.muted, marginBottom: '32px' }}>Condições especiais de pagamento para quem está em obras. Sem compromisso.</p>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '32px' }}>
            <div style={{ display: 'grid', gap: '14px' }}>
              <input type="text" placeholder="Seu nome" aria-label="Nome" style={{ background: '#1a1d21', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '14px 16px', color: C.white, fontSize: '15px', width: '100%', boxSizing: 'border-box' }} />
              <input type="tel" placeholder="WhatsApp (com DDD)" aria-label="WhatsApp" style={{ background: '#1a1d21', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '14px 16px', color: C.white, fontSize: '15px', width: '100%', boxSizing: 'border-box' }} />
              <a href={WPP} target="_blank" rel="noopener noreferrer"
                style={{ background: C.green, color: '#fff', padding: '16px', borderRadius: '8px', fontWeight: 700, fontSize: '16px', textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                📲 Enviar pelo WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 8 — FAQ */}
      <section id="faq" style={{ background: C.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>FAQ</p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: C.white }}>Perguntas Frequentes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { q: 'Qual o preço do Lavis Residencial?', a: 'Preços sob consulta. Stiven Allan disponibiliza a tabela atualizada e as melhores condições para quem está em obras.' },
              { q: 'Onde fica o Lavis?', a: 'Rua Timóteo Batista, 53 — Centro de Criciúma/SC, a poucos minutos a pé do comércio e serviços.' },
              { q: 'O Lavis tem piscina?', a: 'Sim. O Lavis conta com piscina, academia, espaço gourmet e terraço nas áreas comuns.' },
              { q: 'Quando o Lavis será entregue?', a: 'O Lavis está em obras. Entre em contato para o cronograma atualizado de entrega.' },
              { q: 'Posso personalizar a planta?', a: 'Sim, o Lavis oferece possibilidade de personalização de planta. Consulte Stiven Allan para opções disponíveis.' },
            ].map((item, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '22px' }}>
                <h3 style={{ color: C.white, fontWeight: 700, marginBottom: '8px', fontSize: '14px' }}>❓ {item.q}</h3>
                <p style={{ color: C.muted, lineHeight: 1.7, fontSize: '14px' }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: `linear-gradient(135deg, #0e1012, #1a1d21)`, padding: '80px 24px', textAlign: 'center', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏙️</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: C.white, marginBottom: '16px' }}>Lavis — viva o centro com estilo</h2>
          <p style={{ color: C.muted, fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '32px' }}>Condições especiais para quem compra ainda na fase de obras. Fale agora com Stiven Allan.</p>
          <a href={WPP} target="_blank" rel="noopener noreferrer"
            style={{ background: C.green, color: '#fff', padding: '18px 44px', borderRadius: '10px', fontWeight: 800, fontSize: '17px', textDecoration: 'none', display: 'inline-block' }}>
            📲 Falar com Stiven Allan
          </a>
          <p style={{ color: C.muted, fontSize: '13px', marginTop: '16px' }}>CRECI/RS 60.275 · Criciúma/SC</p>
        </div>
      </section>

      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" style={{ background: '#0a0b0d', padding: '12px 24px', borderTop: `1px solid ${C.border}` }}>
        <ol style={{ display: 'flex', gap: '8px', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap', maxWidth: '1100px', marginLeft: 'auto', marginRight: 'auto' }}>
          <li><Link href="/" style={{ color: C.muted, fontSize: '13px', textDecoration: 'none' }}>Início</Link></li>
          <li style={{ color: C.border }}>›</li>
          <li><Link href="/lancamentos/criciuma-sc" style={{ color: C.muted, fontSize: '13px', textDecoration: 'none' }}>Lançamentos Criciúma</Link></li>
          <li style={{ color: C.border }}>›</li>
          <li><span style={{ color: C.accent, fontSize: '13px', fontWeight: 600 }}>Lavis Residencial</span></li>
        </ol>
      </nav>
    </>
  )
}
