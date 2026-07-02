import type { Metadata } from 'next'
import Image from 'next/image'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Lançamentos Imobiliários em Criciúma SC | Stiven Allan CRECI 60.275',
  description: 'Todos os lançamentos e empreendimentos da Fontana Construtora em Criciúma e região SC. Apartamentos de 1, 2 e 3 suítes com plantas modernas. Consulte Stiven Allan, especialista em lançamentos.',
  keywords: [
    'lançamentos imobiliários Criciúma',
    'apartamentos novos Criciúma SC',
    'Fontana Construtora Criciúma',
    'empreendimentos Criciúma SC',
    'comprar apartamento Criciúma',
    'Stiven Allan corretor Criciúma',
    'Monte Leone Residencial',
    'Lavis Residencial Criciúma',
    'Pineto Residencial Criciúma',
    'Hub Smart Home Criciúma',
  ],
  authors: [{ name: 'Stiven Allan', url: 'https://stivenallan.vercel.app' }],
  creator: 'Stiven Allan — CRECI 60.275',
  alternates: {
    canonical: 'https://stivenallan.vercel.app/empreendimentos',
  },
  openGraph: {
    title: 'Lançamentos Imobiliários em Criciúma SC | Stiven Allan',
    description: 'Descubra os melhores lançamentos da Fontana Construtora em Criciúma SC. Apartamentos modernos, lazer completo e localização privilegiada.',
    url: 'https://stivenallan.vercel.app/empreendimentos',
    siteName: 'Stiven Allan — CRECI 60.275',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lançamentos em Criciúma SC | Stiven Allan',
    description: 'Todos os lançamentos da Fontana Construtora em Criciúma SC.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: 'Lançamentos Imobiliários em Criciúma SC',
      description: 'Todos os lançamentos e empreendimentos da Fontana Construtora em Criciúma e região SC, apresentados por Stiven Allan, corretor CRECI 60.275.',
      url: 'https://stivenallan.vercel.app/empreendimentos',
      author: {
        '@type': 'RealEstateAgent',
        name: 'Stiven Allan',
        identifier: 'CRECI 60.275',
        telephone: '+5548991455522',
        url: 'https://stivenallan.vercel.app',
        areaServed: { '@type': 'City', name: 'Criciúma', containedInPlace: { '@type': 'State', name: 'Santa Catarina' } },
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://stivenallan.vercel.app' },
        { '@type': 'ListItem', position: 2, name: 'Empreendimentos', item: 'https://stivenallan.vercel.app/empreendimentos' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Quais são os lançamentos disponíveis em Criciúma SC?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Em Criciúma SC estão disponíveis: Monte Leone Residencial (3 e 4 suítes, bairro Michel), Lavis Residencial (2 e 3 suítes, Centro), Pineto Residencial (2 suítes, Centro com coworking e yoga), e Hub Smart Home (1 e 2 suítes com automação residencial, Centro). Todos da Fontana Construtora.',
          },
        },
        {
          '@type': 'Question',
          name: 'Como comprar um apartamento nos lançamentos da Fontana em Criciúma?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Entre em contato com Stiven Allan, CRECI 60.275, pelo WhatsApp (48) 99145-5522. Como corretor especializado nos empreendimentos da Fontana em Criciúma, ofereço atendimento personalizado, informações sobre plantas, valores e condições de pagamento.',
          },
        },
      ],
    },
  ],
}

const WHATSAPP_BASE = 'https://api.whatsapp.com/send?phone=5548991455522&text='

const empreendimentos = [
  {
    nome: 'Monte Leone Residencial',
    slug: '/empreendimento/fontana/monte-leone-michel-criciuma-sc',
    status: 'Lançamento',
    statusColor: '#c9a24b',
    bairro: 'Michel • Criciúma SC',
    suites: '3 e 4 Suítes',
    preco: 'A partir de R$ 580.000',
    area: '110 a 165 m²',
    destaque: 'Rooftop exclusivo com vista panorâmica',
    icones: ['🏊', '🎉', '🏋️', '🌿'],
    features: ['Piscina Adulto e Infantil', 'Salão de Festas Premium', 'Fitness Completo', 'Área Verde'],
    tag: 'ALTO PADRÃO',
    tagBg: 'rgba(201,162,75,0.2)',
    tagColor: '#c9a24b',
    whatsapp: WHATSAPP_BASE + encodeURIComponent('Olá Stiven, tenho interesse no Monte Leone Residencial!'),
  },
  {
    nome: 'Lavis Residencial',
    slug: '/empreendimento/fontana/lavis-centro-criciuma-sc',
    status: 'Lançamento',
    statusColor: '#10b981',
    bairro: 'Centro • Criciúma SC',
    suites: '2 e 3 Suítes',
    preco: 'A partir de R$ 420.000',
    area: '60 a 95 m²',
    destaque: 'Piscina com deck gourmet + playground',
    icones: ['🏊', '🧒', '🎉', '🌳'],
    features: ['Piscina Adulto e Infantil', 'Playground', 'Salão de Festas', 'Jardim'],
    tag: 'MAIS VENDIDO',
    tagBg: 'rgba(16,185,129,0.15)',
    tagColor: '#10b981',
    whatsapp: WHATSAPP_BASE + encodeURIComponent('Olá Stiven, tenho interesse no Lavis Residencial!'),
  },
  {
    nome: 'Pineto Residencial',
    slug: '/empreendimento/fontana/pineto-centro-criciuma-sc',
    status: 'Lançamento',
    statusColor: '#6366f1',
    bairro: 'Centro • Criciúma SC',
    suites: '2 Suítes',
    preco: 'A partir de R$ 450.000',
    area: '65 a 75 m²',
    destaque: 'Único com Coworking + Espaço Yoga',
    icones: ['💻', '🧘', '🏋️', '🎉'],
    features: ['Coworking Privativo', 'Espaço Yoga', 'Academia', 'Salão de Festas'],
    tag: 'INOVADOR',
    tagBg: 'rgba(99,102,241,0.15)',
    tagColor: '#6366f1',
    whatsapp: WHATSAPP_BASE + encodeURIComponent('Olá Stiven, tenho interesse no Pineto Residencial!'),
  },
  {
    nome: 'Hub Smart Home',
    slug: '/empreendimento/fontana/hub-smart-home-criciuma-sc',
    status: 'Lançamento',
    statusColor: '#f59e0b',
    bairro: 'Centro • Criciúma SC',
    suites: '1 e 2 Suítes',
    preco: 'A partir de R$ 350.000',
    area: '45 a 85 m²',
    destaque: 'Automação residencial 100% pelo smartphone',
    icones: ['📱', '🔒', '📷', '🏋️'],
    features: ['App de Controle', 'Acesso Inteligente', 'CFTV Integrado', 'Fitness'],
    tag: 'SMART HOME',
    tagBg: 'rgba(245,158,11,0.15)',
    tagColor: '#f59e0b',
    whatsapp: WHATSAPP_BASE + encodeURIComponent('Olá Stiven, tenho interesse no Hub Smart Home!'),
  },
]

const WHATSAPP_GERAL = 'https://api.whatsapp.com/send?phone=5548991455522&text=Ol%C3%A1%20Stiven%2C%20gostaria%20de%20conhecer%20os%20lan%C3%A7amentos%20da%20Fontana%20em%20Crici%C3%BAma!'

export default function EmpreendimentosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main style={{ background: '#121315', color: '#e8eaed', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh' }}>

        {/* HEADER */}
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(18,19,21,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,162,75,0.2)', padding: '0 clamp(1rem,4vw,2rem)' }}>
          <nav style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <a href="/" style={{ color: '#c9a24b', fontWeight: 700, fontSize: 'clamp(0.9rem,2vw,1.1rem)', textDecoration: 'none', letterSpacing: '0.05em' }}>
              STIVEN ALLAN
            </a>
            <a
              href={WHATSAPP_GERAL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#c9a24b', color: '#121315', padding: '0.5rem 1.25rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', letterSpacing: '0.03em' }}
            >
              FALAR COM CORRETOR
            </a>
          </nav>
        </header>

        {/* HERO */}
        <section style={{ paddingTop: 'calc(64px + clamp(3rem,8vw,6rem))', paddingBottom: 'clamp(2rem,5vw,4rem)', paddingLeft: 'clamp(1rem,4vw,2rem)', paddingRight: 'clamp(1rem,4vw,2rem)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(201,162,75,0.06) 0%, transparent 60%)' }} />
          <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" style={{ marginBottom: '1.5rem' }}>
              <ol style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0, fontSize: '0.78rem', color: '#a7adb4' }}>
                <li><a href="/" style={{ color: '#a7adb4', textDecoration: 'none' }}>Início</a></li>
                <li style={{ color: '#c9a24b' }}>›</li>
                <li style={{ color: '#c9a24b' }}>Empreendimentos</li>
              </ol>
            </nav>

            <div style={{ display: 'inline-block', background: 'rgba(201,162,75,0.1)', border: '1px solid rgba(201,162,75,0.3)', color: '#c9a24b', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              FONTANA CONSTRUTORA • CRICIÚMA SC
            </div>
            
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Lançamentos em
              <span style={{ display: 'block', color: '#c9a24b' }}>Criciúma e região</span>
            </h1>
            
            <p style={{ color: '#a7adb4', fontSize: 'clamp(0.95rem,2.2vw,1.1rem)', maxWidth: '600px', margin: 0, lineHeight: 1.7 }}>
              {empreendimentos.length} lançamentos selecionados da Fontana Construtora. Apartamentos modernos com lazer completo, acabamento de alto padrão e localização privilegiada em Criciúma SC.
            </p>

            {/* Stats bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(201,162,75,0.15)' }}>
              {[
                { valor: '4', label: 'Lançamentos ativos' },
                { valor: '1', label: 'Construtora parceira' },
                { valor: 'CRECI', label: '60.275 — Corretor Stiven' },
                { valor: 'SC', label: 'Criciúma e região' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 'clamp(1.2rem,3vw,1.8rem)', fontWeight: 900, color: '#c9a24b', lineHeight: 1 }}>{s.valor}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CARDS GRID */}
        <section style={{ padding: 'clamp(2rem,5vw,4rem) clamp(1rem,4vw,2rem)', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,520px),1fr))', gap: '2rem' }}>
            {empreendimentos.map(emp => (
              <article
                key={emp.slug}
                style={{ background: '#202327', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(201,162,75,0.1)', display: 'flex', flexDirection: 'column' }}
              >
                {/* Card top bar */}
                <div style={{ padding: '1.5rem 1.75rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(201,162,75,0.15)', border: '1px solid rgba(201,162,75,0.3)', color: '#c9a24b', padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                        {emp.status.toUpperCase()}
                      </span>
                      <span style={{ background: emp.tagBg, border: `1px solid ${emp.tagColor}40`, color: emp.tagColor, padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                        {emp.tag}
                      </span>
                    </div>
                    <span style={{ color: '#a7adb4', fontSize: '0.75rem' }}>Fontana</span>
                  </div>

                  <h2 style={{ fontSize: 'clamp(1.2rem,3vw,1.6rem)', fontWeight: 800, margin: '0 0 0.25rem', color: '#e8eaed', lineHeight: 1.2 }}>{emp.nome}</h2>
                  <p style={{ color: '#a7adb4', fontSize: '0.85rem', margin: '0 0 1rem' }}>{emp.bairro}</p>
                  
                  {/* Destaque */}
                  <div style={{ background: 'rgba(201,162,75,0.08)', border: '1px solid rgba(201,162,75,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#c9a24b', fontWeight: 600 }}>
                    ✦ {emp.destaque}
                  </div>

                  {/* Numbers */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {[
                      { label: 'Tipologia', valor: emp.suites },
                      { label: 'Área', valor: emp.area },
                      { label: 'Preço', valor: emp.preco },
                    ].map(n => (
                      <div key={n.label} style={{ background: '#121315', borderRadius: '8px', padding: '0.6rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{n.label}</div>
                        <div style={{ fontSize: '0.78rem', color: '#c9a24b', fontWeight: 700, lineHeight: 1.2 }}>{n.valor}</div>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {emp.features.map((f, i) => (
                      <span key={f} style={{ background: '#121315', border: '1px solid rgba(255,255,255,0.08)', color: '#a7adb4', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {emp.icones[i]} {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card footer */}
                <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <a
                    href={emp.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 1, minWidth: '140px', background: '#c9a24b', color: '#121315', padding: '0.75rem 1rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.82rem', textDecoration: 'none', textAlign: 'center', letterSpacing: '0.04em', display: 'block' }}
                  >
                    SOLICITAR INFORMAÇÕES
                  </a>
                  <a
                    href={emp.slug}
                    style={{ flex: 1, minWidth: '120px', background: 'transparent', color: '#e8eaed', padding: '0.75rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)', display: 'block', letterSpacing: '0.04em' }}
                  >
                    VER DETALHES
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA CORRETOR */}
        <section style={{ background: '#202327', borderTop: '1px solid rgba(201,162,75,0.1)', borderBottom: '1px solid rgba(201,162,75,0.1)', padding: 'clamp(3rem,8vw,5rem) clamp(1rem,4vw,2rem)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', background: 'rgba(201,162,75,0.1)', border: '1px solid rgba(201,162,75,0.3)', color: '#c9a24b', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              ATENDIMENTO ESPECIALIZADO
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem,4vw,2.5rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.2 }}>
              Não sabe qual lançamento escolher?
            </h2>
            <p style={{ color: '#a7adb4', fontSize: 'clamp(0.9rem,2vw,1rem)', lineHeight: 1.8, margin: '0 auto 2rem', maxWidth: '580px' }}>
              Stiven Allan é especialista nos empreendimentos da Fontana Construtora em Criciúma. Com CRECI 60.275, oferece atendimento personalizado para ajudar você a encontrar o imóvel ideal dentro do seu perfil e orçamento.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              <a
                href={WHATSAPP_GERAL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#c9a24b', color: '#121315', padding: '0.9rem 2rem', borderRadius: '8px', fontWeight: 800, fontSize: 'clamp(0.85rem,2vw,1rem)', textDecoration: 'none', letterSpacing: '0.04em', display: 'inline-block' }}
              >
                FALAR COM STIVEN — WHATSAPP
              </a>
            </div>
            <div style={{ marginTop: '1.25rem', color: '#6b7280', fontSize: '0.8rem' }}>
              CRECI 60.275 • (48) 99145-5522 • Criciúma e região SC
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#0d0e10', borderTop: '1px solid rgba(201,162,75,0.2)', padding: 'clamp(2rem,5vw,3rem) clamp(1rem,4vw,2rem)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#c9a24b', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>STIVEN ALLAN</div>
              <div style={{ color: '#a7adb4', fontSize: '0.8rem' }}>CRECI 60.275</div>
              <div style={{ color: '#a7adb4', fontSize: '0.8rem', marginTop: '0.2rem' }}>Criciúma e região — SC</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <a href={WHATSAPP_GERAL} target="_blank" rel="noopener noreferrer" style={{ color: '#c9a24b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                (48) 99145-5522
              </a>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                © {new Date().getFullYear()} Stiven Allan. Todos os direitos reservados.
              </div>
              <div style={{ color: '#4b5563', fontSize: '0.7rem', marginTop: '0.2rem' }}>
                Empreendimentos da Fontana Construtora em Criciúma SC
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
