import type { Metadata } from 'next'
import Image from 'next/image'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Hub Smart Home | Apartamentos Inteligentes Centro Criciúma SC | Stiven Allan',
  description: 'Hub Smart Home em Criciúma SC — Apartamentos com automação residencial, design contemporâneo e localização privilegiada no Centro. Fontana Construtora. Consulte Stiven Allan CRECI/RS 60.275.',
  keywords: [
    'Hub Smart Home Criciúma',
    'apartamento smart home Criciúma',
    'automação residencial Criciúma SC',
    'apartamento inteligente Criciúma',
    'Fontana Construtora Criciúma',
    'lançamento imobiliário Criciúma centro',
    'comprar apartamento Criciúma SC',
    'Stiven Allan corretor Criciúma',
    'imóvel novo Centro Criciúma',
    'Hub Smart Home lançamento',
  ],
  authors: [{ name: 'Stiven Allan', url: 'https://stivenallan.vercel.app' }],
  creator: 'Stiven Allan — CRECI/RS 60.275',
  alternates: {
    canonical: 'https://stivenallan.vercel.app/empreendimento/fontana/hub-smart-home-criciuma-sc',
  },
  openGraph: {
    title: 'Hub Smart Home | Apartamentos Inteligentes em Criciúma SC',
    description: 'Tecnologia e conforto integrados. Hub Smart Home oferece apartamentos com automação residencial completa no coração de Criciúma.',
    url: 'https://stivenallan.vercel.app/empreendimento/fontana/hub-smart-home-criciuma-sc',
    siteName: 'Stiven Allan — CRECI/RS 60.275',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hub Smart Home | Criciúma SC',
    description: 'Apartamentos com automação residencial no Centro de Criciúma. Fontana Construtora.',
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
      '@type': 'RealEstateListing',
      name: 'Hub Smart Home',
      description: 'Apartamentos com automação residencial completa no Centro de Criciúma SC. Condomínio inteligente com tecnologia integrada, lazer completo e design contemporâneo. Fontana Construtora.',
      url: 'https://stivenallan.vercel.app/empreendimento/fontana/hub-smart-home-criciuma-sc',
      image: 'https://stivenallan.vercel.app/empreendimento/fontana/hub-smart-home-criciuma-sc',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'RealEstateAgent',
          name: 'Stiven Allan',
          identifier: 'CRECI/RS 60.275',
          telephone: '+5548991455522',
          url: 'https://stivenallan.vercel.app',
        },
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Centro',
        addressLocality: 'Criciúma',
        addressRegion: 'SC',
        addressCountry: 'BR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -28.678,
        longitude: -49.370,
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://stivenallan.vercel.app' },
        { '@type': 'ListItem', position: 2, name: 'Empreendimentos', item: 'https://stivenallan.vercel.app/empreendimentos' },
        { '@type': 'ListItem', position: 3, name: 'Hub Smart Home', item: 'https://stivenallan.vercel.app/empreendimento/fontana/hub-smart-home-criciuma-sc' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'O que é o Hub Smart Home em Criciúma?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Hub Smart Home é um empreendimento residencial da Fontana Construtora localizado no Centro de Criciúma SC, com apartamentos dotados de automação residencial integrada, design contemporâneo e infraestrutura de condomínio completa.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quais são os diferenciais do Hub Smart Home?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'O Hub Smart Home oferece automação residencial (controle de iluminação, climatização e segurança pelo smartphone), acabamentos de alto padrão, área de lazer completa e localização central em Criciúma SC com fácil acesso a comércio e serviços.',
          },
        },
        {
          '@type': 'Question',
          name: 'Como entrar em contato para saber mais sobre o Hub Smart Home?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Entre em contato com Stiven Allan, CRECI/RS 60.275, pelo WhatsApp (48) 99145-5522. Atendimento personalizado para tirar dúvidas, agendar visita ao decorado e conhecer as condições de pagamento.',
          },
        },
      ],
    },
  ],
}

const WHATSAPP = 'https://api.whatsapp.com/send?phone=5548991455522&text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Hub%20Smart%20Home!'

// Diferenciais smart home
const diferenciais = [
  { icon: '📱', titulo: 'Automação Residencial', desc: 'Controle iluminação, climatização e segurança pelo smartphone de qualquer lugar' },
  { icon: '🔒', titulo: 'Acesso Inteligente', desc: 'Fechadura digital com reconhecimento facial, senha e aplicativo — sem chave convencional' },
  { icon: '🌡️', titulo: 'Climatização Smart', desc: 'Ar-condicionado integrado ao sistema de automação com controle remoto via app' },
  { icon: '📷', titulo: 'CFTV Integrado', desc: 'Câmeras de segurança conectadas ao app com visualização em tempo real' },
  { icon: '⚡', titulo: 'Eficiência Energética', desc: 'Sistema de automação reduz consumo com acionamento automático de dispositivos' },
  { icon: '🏋️', titulo: 'Espaço Fitness', desc: 'Academia completa equipada para treinos no próprio condomínio' },
  { icon: '🎉', titulo: 'Salão de Festas', desc: 'Espaço gourmet moderno para comemorações com amigos e família' },
  { icon: '🚗', titulo: 'Vagas Cobertas', desc: 'Vagas de garagem cobertas com infraestrutura para carregamento de veículos elétricos' },
]

// Números do empreendimento
const numeros = [
  { valor: '1 e 2', unidade: 'suítes', label: 'Tipologias' },
  { valor: 'Centro', unidade: 'Criciúma', label: 'Localização' },
  { valor: '100%', unidade: 'smart', label: 'Automação' },
  { valor: 'Fontana', unidade: 'construtora', label: 'Incorporadora' },
]

// Tecnologias smart
const tecnologias = [
  { nome: 'App de Controle', desc: 'Gerencie todo o apartamento pelo celular' },
  { nome: 'Iluminação Cênica', desc: 'Cenas de luz pré-programadas para cada momento' },
  { nome: 'Persianas Motorizadas', desc: 'Abertura e fechamento automático por horário ou app' },
  { nome: 'Interfone Digital', desc: 'Vídeo chamada HD com porteiro e visitantes' },
  { nome: 'Sensor de Presença', desc: 'Acionamento automático de luzes em áreas comuns' },
  { nome: 'Central de Alarme', desc: 'Monitoramento 24h integrado ao sistema do condomínio' },
]

export default function HubSmartHomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main style={{ background: '#121315', color: '#e8eaed', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh' }}>

        {/* HEADER NAV */}
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(18,19,21,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,162,75,0.2)', padding: '0 clamp(1rem,4vw,2rem)' }}>
          <nav style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <a href="/" style={{ color: '#c9a24b', fontWeight: 700, fontSize: 'clamp(0.9rem,2vw,1.1rem)', textDecoration: 'none', letterSpacing: '0.05em' }}>
              STIVEN ALLAN
            </a>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#c9a24b', color: '#121315', padding: '0.5rem 1.25rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', letterSpacing: '0.03em' }}
            >
              FALAR COM CORRETOR
            </a>
          </nav>
        </header>

        {/* HERO */}
        <section style={{ position: 'relative', height: 'clamp(500px,80vh,800px)', marginTop: '64px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1c1f 0%, #0d0e10 50%, #1a1c1f 100%)' }} />
          
          {/* Smart Home visual pattern */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <div style={{ width: 'clamp(300px,60vw,700px)', height: 'clamp(300px,60vw,700px)', border: '1px solid rgba(201,162,75,0.1)', borderRadius: '50%', position: 'absolute' }} />
            <div style={{ width: 'clamp(200px,45vw,520px)', height: 'clamp(200px,45vw,520px)', border: '1px solid rgba(201,162,75,0.15)', borderRadius: '50%', position: 'absolute' }} />
            <div style={{ width: 'clamp(120px,28vw,320px)', height: 'clamp(120px,28vw,320px)', border: '1px solid rgba(201,162,75,0.2)', borderRadius: '50%', position: 'absolute' }} />
            <div style={{ fontSize: 'clamp(4rem,12vw,9rem)', opacity: 0.08 }}>🏠</div>
          </div>

          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(18,19,21,0.98) 0%, rgba(18,19,21,0.7) 60%, rgba(18,19,21,0.3) 100%)' }} />

          <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 clamp(1.5rem,6vw,5rem)', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" style={{ marginBottom: '1.5rem' }}>
              <ol style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0, fontSize: '0.78rem', color: '#a7adb4' }}>
                <li><a href="/" style={{ color: '#a7adb4', textDecoration: 'none' }}>Início</a></li>
                <li style={{ color: '#c9a24b' }}>›</li>
                <li><a href="/empreendimentos" style={{ color: '#a7adb4', textDecoration: 'none' }}>Empreendimentos</a></li>
                <li style={{ color: '#c9a24b' }}>›</li>
                <li style={{ color: '#c9a24b' }}>Hub Smart Home</li>
              </ol>
            </nav>

            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {['Fontana Construtora', 'Smart Home', 'Centro Criciúma SC', 'Lançamento'].map(b => (
                <span key={b} style={{ background: 'rgba(201,162,75,0.15)', border: '1px solid rgba(201,162,75,0.35)', color: '#c9a24b', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {b}
                </span>
              ))}
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem,6vw,4.5rem)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
              Hub
              <span style={{ display: 'block', color: '#c9a24b' }}>Smart Home</span>
            </h1>

            <p style={{ fontSize: 'clamp(1rem,2.5vw,1.4rem)', color: '#a7adb4', margin: '0.75rem 0 0', maxWidth: '520px', lineHeight: 1.5 }}>
              O primeiro condomínio com automação residencial completa no Centro de Criciúma
            </p>

            <p style={{ fontSize: 'clamp(0.85rem,1.8vw,1rem)', color: '#c9a24b', margin: '0.5rem 0 0', fontWeight: 500, letterSpacing: '0.04em' }}>
              FONTANA CONSTRUTORA • CENTRO • CRICIÚMA SC
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#c9a24b', color: '#121315', padding: '0.9rem 2rem', borderRadius: '8px', fontWeight: 800, fontSize: 'clamp(0.85rem,2vw,1rem)', textDecoration: 'none', letterSpacing: '0.04em', display: 'inline-block' }}
              >
                SOLICITAR INFORMAÇÕES
              </a>
              <a
                href="#diferenciais"
                style={{ background: 'transparent', color: '#e8eaed', padding: '0.9rem 2rem', borderRadius: '8px', fontWeight: 700, fontSize: 'clamp(0.85rem,2vw,1rem)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-block' }}
              >
                VER DIFERENCIAIS
              </a>
            </div>
          </div>
        </section>

        {/* NÚMEROS */}
        <section style={{ background: '#202327', borderTop: '1px solid rgba(201,162,75,0.2)', borderBottom: '1px solid rgba(201,162,75,0.2)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(2rem,5vw,3rem) clamp(1rem,4vw,2rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '2rem' }}>
            {numeros.map(n => (
              <div key={n.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, color: '#c9a24b', lineHeight: 1 }}>{n.valor}</div>
                <div style={{ fontSize: '0.8rem', color: '#a7adb4', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>{n.unidade}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{n.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SMART HOME SHOWCASE */}
        <section style={{ padding: 'clamp(3rem,8vw,6rem) clamp(1rem,4vw,2rem)', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem,5vw,3.5rem)' }}>
            <div style={{ display: 'inline-block', background: 'rgba(201,162,75,0.1)', border: '1px solid rgba(201,162,75,0.3)', color: '#c9a24b', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              TECNOLOGIA
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.8rem)', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.2 }}>
              Seu apartamento, inteligente
            </h2>
            <p style={{ color: '#a7adb4', fontSize: 'clamp(0.9rem,2vw,1.05rem)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
              Hub Smart Home integra tecnologia de automação residencial em cada detalhe. Controle tudo pelo smartphone — de qualquer lugar do mundo.
            </p>
          </div>

          {/* Tech grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5rem' }}>
            {tecnologias.map(t => (
              <div key={t.nome} style={{ background: '#202327', borderRadius: '12px', padding: '1.5rem 2rem', border: '1px solid rgba(201,162,75,0.1)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c9a24b', marginTop: '6px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#e8eaed', fontSize: '0.95rem', marginBottom: '0.35rem' }}>{t.nome}</div>
                  <div style={{ color: '#a7adb4', fontSize: '0.85rem', lineHeight: 1.5 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DIFERENCIAIS */}
        <section id="diferenciais" style={{ background: '#202327', padding: 'clamp(3rem,8vw,6rem) clamp(1rem,4vw,2rem)', borderTop: '1px solid rgba(201,162,75,0.1)', borderBottom: '1px solid rgba(201,162,75,0.1)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem,5vw,3.5rem)' }}>
              <div style={{ display: 'inline-block', background: 'rgba(201,162,75,0.1)', border: '1px solid rgba(201,162,75,0.3)', color: '#c9a24b', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                DIFERENCIAIS
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.8rem)', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.2 }}>
                Mais que um apartamento —<br/>um estilo de vida conectado
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.5rem' }}>
              {diferenciais.map(d => (
                <div key={d.titulo} style={{ background: '#121315', borderRadius: '12px', padding: '1.75rem', border: '1px solid rgba(201,162,75,0.1)', transition: 'border-color 0.2s' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{d.icon}</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e8eaed', margin: '0 0 0.5rem', lineHeight: 1.3 }}>{d.titulo}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#a7adb4', margin: 0, lineHeight: 1.6 }}>{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LOCALIZAÇÃO */}
        <section style={{ padding: 'clamp(3rem,8vw,6rem) clamp(1rem,4vw,2rem)', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem,5vw,3.5rem)' }}>
            <div style={{ display: 'inline-block', background: 'rgba(201,162,75,0.1)', border: '1px solid rgba(201,162,75,0.3)', color: '#c9a24b', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              LOCALIZAÇÃO
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.8rem)', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.2 }}>
              Centro de Criciúma —<br/>tudo ao seu alcance
            </h2>
            <p style={{ color: '#a7adb4', fontSize: 'clamp(0.9rem,2vw,1rem)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
              Localizado no coração de Criciúma, Hub Smart Home oferece proximidade a centros comerciais, hospitais, escolas e vias de acesso.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
            {[
              { icon: '🏬', local: 'Shopping Criciúma', dist: '5 min' },
              { icon: '🏥', local: 'Hospital São José', dist: '7 min' },
              { icon: '🎓', local: 'UNESC Campus', dist: '10 min' },
              { icon: '✈️', local: 'Aeroporto Forquilhinha', dist: '15 min' },
              { icon: '🏦', local: 'Agências Bancárias', dist: '3 min a pé' },
              { icon: '🍽️', local: 'Restaurantes e Cafés', dist: '1 min a pé' },
            ].map(l => (
              <div key={l.local} style={{ background: '#202327', borderRadius: '10px', padding: '1.25rem', border: '1px solid rgba(201,162,75,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem' }}>{l.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#e8eaed', fontSize: '0.9rem' }}>{l.local}</div>
                  <div style={{ color: '#c9a24b', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.15rem' }}>{l.dist}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONSTRUTORA */}
        <section style={{ background: '#202327', padding: 'clamp(3rem,8vw,5rem) clamp(1rem,4vw,2rem)', borderTop: '1px solid rgba(201,162,75,0.1)', borderBottom: '1px solid rgba(201,162,75,0.1)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', background: 'rgba(201,162,75,0.1)', border: '1px solid rgba(201,162,75,0.3)', color: '#c9a24b', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              FONTANA CONSTRUTORA
            </div>
            <h2 style={{ fontSize: 'clamp(1.4rem,3.5vw,2.2rem)', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.3 }}>
              Tradição em qualidade e inovação no Sul de Santa Catarina
            </h2>
            <p style={{ color: '#a7adb4', fontSize: 'clamp(0.9rem,2vw,1rem)', lineHeight: 1.8, margin: '0 auto', maxWidth: '720px' }}>
              A Fontana Construtora é referência em Criciúma e região pela excelência na entrega de empreendimentos residenciais. O Hub Smart Home é mais um projeto que une tecnologia de ponta, materiais de qualidade superior e design contemporâneo — garantindo valorização e qualidade de vida para seus moradores.
            </p>
          </div>
        </section>

        {/* CTA PRINCIPAL */}
        <section style={{ padding: 'clamp(4rem,10vw,7rem) clamp(1rem,4vw,2rem)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,162,75,0.08) 0%, transparent 70%)' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', background: 'rgba(201,162,75,0.1)', border: '1px solid rgba(201,162,75,0.3)', color: '#c9a24b', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              FALE COM O ESPECIALISTA
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem,5vw,3.2rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.1 }}>
              Pronto para viver no futuro?
            </h2>
            <p style={{ color: '#a7adb4', fontSize: 'clamp(0.95rem,2.2vw,1.1rem)', margin: '0 auto 2rem', lineHeight: 1.7, maxWidth: '520px' }}>
              Converse com Stiven Allan, especialista em lançamentos da Fontana em Criciúma. Condições exclusivas, atendimento personalizado e todo o suporte até a entrega das chaves.
            </p>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', background: '#c9a24b', color: '#121315', padding: 'clamp(0.9rem,2.5vw,1.1rem) clamp(2rem,5vw,3rem)', borderRadius: '8px', fontWeight: 800, fontSize: 'clamp(0.9rem,2vw,1.05rem)', textDecoration: 'none', letterSpacing: '0.05em' }}
            >
              QUERO SABER MAIS — WHATSAPP
            </a>
            <div style={{ marginTop: '1.25rem', color: '#a7adb4', fontSize: '0.8rem' }}>
              Stiven Allan • CRECI/RS 60.275 • (48) 99145-5522
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#0d0e10', borderTop: '1px solid rgba(201,162,75,0.2)', padding: 'clamp(2rem,5vw,3rem) clamp(1rem,4vw,2rem)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#c9a24b', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>STIVEN ALLAN</div>
              <div style={{ color: '#a7adb4', fontSize: '0.8rem' }}>CRECI/RS 60.275</div>
              <div style={{ color: '#a7adb4', fontSize: '0.8rem', marginTop: '0.2rem' }}>Criciúma e região — SC</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={{ color: '#c9a24b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                (48) 99145-5522
              </a>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                © {new Date().getFullYear()} Stiven Allan. Todos os direitos reservados.
              </div>
              <div style={{ color: '#4b5563', fontSize: '0.7rem', marginTop: '0.2rem' }}>
                Hub Smart Home é um empreendimento da Fontana Construtora
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
