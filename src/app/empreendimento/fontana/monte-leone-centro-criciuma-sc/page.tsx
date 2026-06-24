import type { Metadata } from 'next'
import Link from 'next/link'

const C = {
  bg: '#121315',
  card: '#202327',
  border: '#2c3035',
  accent: '#c9a24b',
  accent2: '#e2c275',
  muted: '#a7adb4',
  white: '#f1f3f5',
  green: '#1f9d55',
  greenHover: '#17773f',
  danger: '#e63946',
}

const WPP = 'https://api.whatsapp.com/send?phone=5548991455522&text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Monte%20Leone%20Residencial!'

export const metadata: Metadata = {
  title: 'Monte Leone Residencial | Apartamento 4 Quartos Centro Criciúma SC | Stiven Allan Corretor',
  description: 'Monte Leone Residencial: apartamentos de luxo 4 dormitórios (3 suítes), 230 a 253m², no Centro de Criciúma/SC. Lançamento Fontana. Vista para a Serra. Consultoria de Stiven Allan, CRECI/RS 60.275.',
  keywords: ['Monte Leone Residencial', 'apartamento 4 quartos Centro Criciúma', 'lançamento Fontana Criciúma', 'apartamento de luxo Criciúma SC', 'imóvel Centro Criciúma', 'Stiven Allan corretor'],
  alternates: { canonical: 'https://stivenallan.vercel.app/empreendimento/fontana/monte-leone-centro-criciuma-sc' },
  openGraph: {
    title: 'Monte Leone Residencial — Lançamento de Luxo no Centro de Criciúma/SC',
    description: 'Apartamentos 4 dorm. (3 suítes), 230–253m², piscina climatizada, 3 vagas. Vista para a Serra. Consultoria exclusiva: Stiven Allan CRECI/RS 60.275.',
    url: 'https://stivenallan.vercel.app/empreendimento/fontana/monte-leone-centro-criciuma-sc',
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: 'https://estilofontana.com.br/wp-content/uploads/2024/08/monte-leone-hero.jpg', width: 1200, height: 630, alt: 'Monte Leone Residencial - Fachada' }],
  },
}

const schemaLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'RealEstateListing',
      '@id': 'https://stivenallan.vercel.app/empreendimento/fontana/monte-leone-centro-criciuma-sc#listing',
      name: 'Monte Leone Residencial',
      description: 'Apartamentos de luxo 4 dormitórios (3 suítes), 230 a 253m², piscina climatizada, 3 vagas de garagem, reconhecimento facial, vista para a Serra. Lançamento Construtora Fontana no Centro de Criciúma/SC.',
      url: 'https://stivenallan.vercel.app/empreendimento/fontana/monte-leone-centro-criciuma-sc',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rua Hortêncio João da Silva, esquina Rua Antônio Baptista de Lucca, 98',
        addressLocality: 'Criciúma',
        addressRegion: 'SC',
        postalCode: '88801-000',
        addressCountry: 'BR',
      },
      numberOfRooms: 4,
      floorSize: { '@type': 'QuantitativeValue', value: 230, maxValue: 253, unitCode: 'MTK' },
      offers: { '@type': 'Offer', priceCurrency: 'BRL', availability: 'https://schema.org/InStock' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://stivenallan.vercel.app' },
        { '@type': 'ListItem', position: 2, name: 'Lançamentos Criciúma', item: 'https://stivenallan.vercel.app/lancamentos/criciuma-sc' },
        { '@type': 'ListItem', position: 3, name: 'Monte Leone Residencial', item: 'https://stivenallan.vercel.app/empreendimento/fontana/monte-leone-centro-criciuma-sc' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Qual o preço do Monte Leone Residencial?', acceptedAnswer: { '@type': 'Answer', text: 'O Monte Leone é um empreendimento premium. Consulte o corretor Stiven Allan para valores atualizados e condições de pagamento exclusivas.' } },
        { '@type': 'Question', name: 'Onde fica o Monte Leone?', acceptedAnswer: { '@type': 'Answer', text: 'Rua Hortêncio João da Silva, esquina Rua Antônio Baptista de Lucca, 98 — Centro de Criciúma/SC.' } },
        { '@type': 'Question', name: 'Quantas vagas de garagem tem o Monte Leone?', acceptedAnswer: { '@type': 'Answer', text: 'O Monte Leone conta com até 3 vagas de garagem por unidade.' } },
        { '@type': 'Question', name: 'Posso usar FGTS para comprar no Monte Leone?', acceptedAnswer: { '@type': 'Answer', text: 'Sim, dependendo do valor do imóvel e do perfil do comprador o FGTS pode ser utilizado. Entre em contato com Stiven Allan para uma análise personalizada.' } },
        { '@type': 'Question', name: 'Qual a construtora do Monte Leone?', acceptedAnswer: { '@type': 'Answer', text: 'O Monte Leone Residencial é um empreendimento da Construtora Fontana, com tradição em Criciúma e Santa Catarina.' } },
      ],
    },
  ],
}

export default function MonteLeone() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaLD) }}
      />

      {/* SEÇÃO 0 — BARRA FLUTUANTE DE URGÊNCIA */}
      <div style={{ background: C.danger, color: '#fff', textAlign: 'center', padding: '10px 16px', fontSize: '13px', fontWeight: 600, position: 'sticky', top: 0, zIndex: 100 }}>
        🚨 Lançamento limitado — Unidades disponíveis.{' '}
        <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>
          Garanta a sua →
        </a>
      </div>

      {/* SEÇÃO 1 — HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', background: '#0a0b0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px 60px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(18,19,21,0.85) 100%)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px' }}>
          <p style={{ color: C.accent, fontSize: '13px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Lançamento · Fontana · Centro – Criciúma/SC
          </p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', fontWeight: 900, color: C.white, lineHeight: 1.05, marginBottom: '20px', letterSpacing: '-1px' }}>
            Monte Leone<br />
            <span style={{ color: C.accent }}>Residencial</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', color: C.muted, maxWidth: '600px', margin: '0 auto 40px' }}>
            O ponto mais alto do Centro de Criciúma. Vista permanente para a Serra. 4 dormitórios, 230–253m², piscina climatizada.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer"
              style={{ background: C.green, color: '#fff', padding: '16px 36px', borderRadius: '8px', fontWeight: 700, fontSize: '16px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
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
          {[
            { n: '4', d: 'Dormitórios' },
            { n: '3', d: 'Suítes' },
            { n: '253m²', d: 'Área Privativa' },
            { n: '3', d: 'Vagas Garagem' },
          ].map((i) => (
            <div key={i.d} style={{ background: C.card, padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: C.accent }}>{i.n}</div>
              <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>{i.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO 2 — APRESENTAÇÃO DO CONCEITO */}
      <section style={{ background: C.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '16px' }}>O Empreendimento</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: C.white, marginBottom: '24px', lineHeight: 1.15 }}>
            Magnífico por essência.
          </h2>
          <p style={{ color: C.muted, fontSize: '1.1rem', lineHeight: 1.8 }}>
            Na altura dos seus sonhos, o Monte Leone é um reflexo do estilo de quem valoriza o que há de mais raro — o tempo de qualidade, o espaço para contemplar e a liberdade para viver plenamente. Uma joia arquitetônica lapidada para brilhar no coração nobre de Criciúma, com vista deslumbrante para a Serra que emoldura cada unidade.
          </p>
          <p style={{ color: C.muted, fontSize: '1.1rem', lineHeight: 1.8, marginTop: '16px' }}>
            Mais do que um empreendimento, o Monte Leone é um legado — um símbolo de sofisticação, exclusividade e permanência no endereço mais desejado de Criciúma.
          </p>
        </div>
      </section>

      {/* SEÇÃO 3 — TIPOLOGIAS */}
      <section id="plantas" style={{ background: '#0e1012', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Plantas & Tipologias</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, color: C.white }}>Espaço que eleva o padrão de viver</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { tipo: 'Apartamento Padrão', area: '230m²', quartos: '4 dorm. (3 suítes)', vagas: '1 a 3 vagas', descricao: 'Living integrado, sacada ampla com guarda-corpo em vidro, suíte master com banheira de imersão.' },
              { tipo: 'Apartamento Plus', area: '253m²', quartos: '4 dorm. (3 suítes)', vagas: '3 vagas', descricao: 'Planta personalizável, lavabo, forro da sacada em madeira natural, churrasqueira com exaustor.' },
            ].map((p) => (
              <div key={p.tipo} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})` }} />
                <div style={{ display: 'inline-block', background: 'rgba(201,162,75,0.15)', color: C.accent, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>{p.tipo}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: C.accent, marginBottom: '8px' }}>{p.area}</div>
                <div style={{ color: C.white, fontWeight: 600, marginBottom: '4px' }}>{p.quartos}</div>
                <div style={{ color: C.muted, fontSize: '14px', marginBottom: '16px' }}>{p.vagas}</div>
                <p style={{ color: C.muted, fontSize: '14px', lineHeight: 1.7 }}>{p.descricao}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', color: C.muted, fontSize: '14px', marginTop: '24px' }}>
            Possibilidade de personalização de planta • Consulte disponibilidade
          </p>
        </div>
      </section>

      {/* SEÇÃO 4 — DIFERENCIAIS E LAZER */}
      <section id="diferenciais" style={{ background: C.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Diferenciais & Lazer</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, color: C.white }}>Sinta o sublime em cada detalhe</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { icon: '🏊', label: 'Piscina Climatizada' },
              { icon: '🏋️', label: 'Academia Interna' },
              { icon: '🎮', label: 'Sala de Jogos' },
              { icon: '🎉', label: 'Salão de Festas' },
              { icon: '🌳', label: 'Terraço Externo' },
              { icon: '🧒', label: 'Brinquedoteca' },
              { icon: '🛗', label: '3 Elevadores' },
              { icon: '🔐', label: 'Reconhecimento Facial' },
              { icon: '⚡', label: 'Gerador de Energia' },
              { icon: '📦', label: 'Espaço Delivery' },
              { icon: '🚗', label: 'Garagem Epóxi' },
              { icon: '🍖', label: 'Churrasqueira com Exaustor' },
            ].map((d) => (
              <div key={d.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{d.icon}</div>
                <div style={{ color: C.white, fontSize: '13px', fontWeight: 600 }}>{d.label}</div>
              </div>
            ))}
          </div>
          {/* Diferenciais internos */}
          <div style={{ marginTop: '48px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '32px' }}>
            <h3 style={{ color: C.accent, fontWeight: 700, marginBottom: '20px', fontSize: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>Acabamentos Premium</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              {[
                'Porcelanato retificado', 'Rebaixo em gesso', 'Fechadura digital', 'Pé-direito duplo no hall',
                'Banheira de imersão (suíte master)', 'Parede dupla entre apartamentos', 'Nicho nos banheiros',
                'Forro da sacada em madeira natural', 'Janela com peitoril em vidro', 'Espera para aspiração central',
                'Automação de persianas', 'Som integrado', 'Recirculação de água quente', 'Toalheiro aquecido',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.muted, fontSize: '14px' }}>
                  <span style={{ color: C.accent, fontWeight: 700 }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 5 — LOCALIZAÇÃO */}
      <section id="localizacao" style={{ background: '#0e1012', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Localização</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, color: C.white, marginBottom: '20px' }}>
              O endereço dos que transformam a vida em arte
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, marginBottom: '24px' }}>
              Rua Hortêncio João da Silva, esquina Rua Antônio Baptista de Lucca, 98 — Centro, Criciúma/SC.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: '🏫', text: 'Escolas e universidades a 5 min a pé' },
                { icon: '🛒', text: 'Shopping e comércio no entorno imediato' },
                { icon: '🏥', text: 'Hospitais e clínicas nas proximidades' },
                { icon: '🚌', text: 'Eixo principal de mobilidade urbana' },
                { icon: '🌄', text: 'Vista permanente para a Serra catarinense' },
              ].map((l) => (
                <div key={l.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: C.muted, fontSize: '14px' }}>
                  <span style={{ fontSize: '18px', marginTop: '1px' }}>{l.icon}</span>
                  <span>{l.text}</span>
                </div>
              ))}
            </div>
            <a href={`https://www.google.com/maps/search/?api=1&query=Rua+Hortêncio+João+da+Silva+98+Criciúma+SC`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: '24px', background: 'transparent', color: C.accent, border: `2px solid ${C.accent}`, padding: '12px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              Ver no Google Maps →
            </a>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden', height: '340px' }}>
            <iframe
              title="Localização Monte Leone Residencial"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3550.07!2d-49.3706!3d-28.6773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDQwJzM4LjMiUyA0OcKwMjInMTQuMiJX!5e0!3m2!1spt-BR!2sbr!4v1700000000000"
              width="100%" height="100%" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* SEÇÃO 6 — SOBRE O CORRETOR */}
      <section style={{ background: C.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div style={{ background: C.card, border: `2px solid ${C.accent}`, borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '90px', height: '90px', background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🏡</div>
            <h3 style={{ color: C.white, fontWeight: 800, fontSize: '1.3rem', marginBottom: '4px' }}>Stiven Allan</h3>
            <p style={{ color: C.accent, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>CRECI/RS 60.275</p>
          </div>
          <div>
            <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Seu Corretor</p>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: C.white, marginBottom: '16px' }}>
              Especialista em lançamentos Fontana em Criciúma
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, marginBottom: '24px' }}>
              Com mais de 8 anos de atuação no mercado imobiliário de Criciúma e região, Stiven Allan é especialista em lançamentos de construtoras premium. Assessoria completa: simulação, documentação, financiamento e acompanhamento até a entrega das chaves.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href={WPP} target="_blank" rel="noopener noreferrer"
                style={{ background: C.green, color: '#fff', padding: '14px 28px', borderRadius: '8px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }}>
                📲 Falar no WhatsApp
              </a>
              <Link href="/" style={{ background: 'transparent', color: C.accent, border: `2px solid ${C.accent}`, padding: '14px 28px', borderRadius: '8px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', display: 'inline-block' }}>
                Ver outros empreendimentos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 7 — FORMULÁRIO DE CAPTAÇÃO */}
      <section id="contato" style={{ background: '#0e1012', padding: '80px 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>Fale com o Corretor</p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, color: C.white, marginBottom: '12px' }}>
            Receba informações exclusivas
          </h2>
          <p style={{ color: C.muted, marginBottom: '36px' }}>
            Tabela de preços, plantas, condições especiais e simulação de financiamento — sem compromisso.
          </p>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '36px', textAlign: 'left' }}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <input type="text" placeholder="Seu nome completo" aria-label="Nome"
                style={{ background: '#1a1d21', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '14px 16px', color: C.white, fontSize: '15px', width: '100%', boxSizing: 'border-box', outline: 'none' }} />
              <input type="tel" placeholder="WhatsApp (com DDD)" aria-label="WhatsApp"
                style={{ background: '#1a1d21', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '14px 16px', color: C.white, fontSize: '15px', width: '100%', boxSizing: 'border-box', outline: 'none' }} />
              <select aria-label="Interesse"
                style={{ background: '#1a1d21', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '14px 16px', color: C.muted, fontSize: '15px', width: '100%', boxSizing: 'border-box', outline: 'none' }}>
                <option value="">Qual seu interesse?</option>
                <option value="compra">Compra para morar</option>
                <option value="investimento">Investimento</option>
                <option value="info">Só quero informações</option>
              </select>
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
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ color: C.accent, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>FAQ</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, color: C.white }}>Perguntas Frequentes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { q: 'Qual o preço do Monte Leone Residencial?', a: 'O Monte Leone é um empreendimento premium com preços sob consulta. Entre em contato com Stiven Allan para receber a tabela atualizada e as melhores condições de pagamento.' },
              { q: 'Onde fica o Monte Leone?', a: 'Rua Hortêncio João da Silva, esquina com Rua Antônio Baptista de Lucca, nº 98 — Centro de Criciúma/SC. Localização nobre com vista para a Serra.' },
              { q: 'Quantas vagas de garagem tem?', a: 'O empreendimento oferece de 1 a 3 vagas de garagem por unidade, com piso em epóxi.' },
              { q: 'Posso usar FGTS?', a: 'Dependendo do valor e do perfil, o FGTS pode ser utilizado como parte do pagamento. Stiven Allan realiza análise gratuita.' },
              { q: 'Qual a construtora responsável?', a: 'Construtora Fontana, tradição em Santa Catarina com dezenas de empreendimentos entregues em Criciúma, Içara, Joinville e litoral catarinense.' },
            ].map((item, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '24px' }}>
                <h3 style={{ color: C.white, fontWeight: 700, marginBottom: '10px', fontSize: '15px' }}>❓ {item.q}</h3>
                <p style={{ color: C.muted, lineHeight: 1.7, fontSize: '14px' }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 9 — CTA FINAL */}
      <section style={{ background: `linear-gradient(135deg, #0e1012 0%, #1a1d21 100%)`, padding: '80px 24px', textAlign: 'center', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ width: '64px', height: '64px', background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, borderRadius: '16px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🏔️</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: C.white, marginBottom: '16px' }}>
            Monte Leone está te esperando
          </h2>
          <p style={{ color: C.muted, fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '36px' }}>
            Unidades limitadas. Lançamento exclusivo no Centro de Criciúma. Não perca a oportunidade de garantir o seu apartamento com as melhores condições.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer"
            style={{ background: C.green, color: '#fff', padding: '18px 48px', borderRadius: '10px', fontWeight: 800, fontSize: '18px', textDecoration: 'none', display: 'inline-block' }}>
            📲 Falar com Stiven Allan agora
          </a>
          <p style={{ color: C.muted, fontSize: '13px', marginTop: '16px' }}>
            CRECI/RS 60.275 · Criciúma e Região · SC
          </p>
        </div>
      </section>

      {/* BREADCRUMB NAVEGAÇÃO */}
      <nav aria-label="Breadcrumb" style={{ background: '#0a0b0d', padding: '12px 24px', borderTop: `1px solid ${C.border}` }}>
        <ol style={{ display: 'flex', gap: '8px', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap', maxWidth: '1100px', marginLeft: 'auto', marginRight: 'auto' }}>
          <li><Link href="/" style={{ color: C.muted, fontSize: '13px', textDecoration: 'none' }}>Início</Link></li>
          <li style={{ color: C.border }}>›</li>
          <li><Link href="/lancamentos/criciuma-sc" style={{ color: C.muted, fontSize: '13px', textDecoration: 'none' }}>Lançamentos Criciúma</Link></li>
          <li style={{ color: C.border }}>›</li>
          <li><span style={{ color: C.accent, fontSize: '13px', fontWeight: 600 }}>Monte Leone Residencial</span></li>
        </ol>
      </nav>
    </>
  )
}
