import type { Metadata } from 'next'
import { c, font, ui } from '@/lib/theme'
import { PropertySchema } from '@/components/PropertySchema'
import { PropertyFAQ } from '@/components/PropertyFAQ'
import { RelatedProperties } from '@/components/RelatedProperties'
import Simulador from '@/components/Simulador'
import { LeadCaptureButton } from '@/components/LeadCaptureButton'

export const revalidate = 3600

const WHATSAPP = 'https://api.whatsapp.com/send?phone=5548991455522&text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Hub%20Smart%20Home!'

export const metadata: Metadata = {
  title: 'Hub Smart Home | Apartamentos Inteligentes Centro Criciúma SC | Stiven Allan',
  description: 'Hub Smart Home em Criciúma SC — Apartamentos com automação residencial, design contemporâneo e localização privilegiada no Centro. Fontana Construtora. Consulte Stiven Allan CRECI 60.275.',
  keywords: ['Hub Smart Home Criciúma','apartamento smart home Criciúma','automação residencial Criciúma SC','apartamento inteligente Criciúma','Fontana Construtora Criciúma','lançamento imobiliário Criciúma centro','comprar apartamento Criciúma SC','Stiven Allan corretor Criciúma','imóvel novo Centro Criciúma','Hub Smart Home lançamento'],
  authors: [{ name: 'Stiven Allan', url: 'https://stivenallan.vercel.app' }],
  creator: 'Stiven Allan — CRECI 60.275',
  alternates: { canonical: 'https://stivenallan.vercel.app/empreendimento/fontana/hub-smart-home-criciuma-sc' },
  openGraph: {
    title: 'Hub Smart Home | Apartamentos Inteligentes em Criciúma SC',
    description: 'Tecnologia e conforto integrados. Hub Smart Home oferece apartamentos com automação residencial completa no coração de Criciúma.',
    url: 'https://stivenallan.vercel.app/empreendimento/fontana/hub-smart-home-criciuma-sc',
    siteName: 'Stiven Allan — CRECI 60.275',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
}

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'RealEstateListing',
      name: 'Hub Smart Home',
      description: 'Apartamentos com automação residencial completa no Centro de Criciúma SC. Condomínio inteligente com tecnologia integrada, lazer completo e design contemporâneo. Fontana Construtora.',
      url: 'https://stivenallan.vercel.app/empreendimento/fontana/hub-smart-home-criciuma-sc',
      offers: { '@type': 'Offer', priceCurrency: 'BRL', availability: 'https://schema.org/InStock', seller: { '@type': 'RealEstateAgent', name: 'Stiven Allan', identifier: 'CRECI 60.275', telephone: '+5548991455522', url: 'https://stivenallan.vercel.app' } },
      address: { '@type': 'PostalAddress', streetAddress: 'Centro', addressLocality: 'Criciúma', addressRegion: 'SC', addressCountry: 'BR' },
      geo: { '@type': 'GeoCoordinates', latitude: -28.678, longitude: -49.370 },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://stivenallan.vercel.app' },
        { '@type': 'ListItem', position: 2, name: 'Lançamentos Criciúma', item: 'https://stivenallan.vercel.app/lancamentos/criciuma-sc' },
        { '@type': 'ListItem', position: 3, name: 'Hub Smart Home', item: 'https://stivenallan.vercel.app/empreendimento/fontana/hub-smart-home-criciuma-sc' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'O que é o Hub Smart Home em Criciúma?', acceptedAnswer: { '@type': 'Answer', text: 'Hub Smart Home é um empreendimento residencial da Fontana Construtora localizado no Centro de Criciúma SC, com apartamentos dotados de automação residencial integrada, design contemporâneo e infraestrutura de condomínio completa.' } },
        { '@type': 'Question', name: 'Quais são os diferenciais do Hub Smart Home?', acceptedAnswer: { '@type': 'Answer', text: 'O Hub Smart Home oferece automação residencial (controle de iluminação, climatização e segurança pelo smartphone), acabamentos de alto padrão, área de lazer completa e localização central em Criciúma SC.' } },
        { '@type': 'Question', name: 'Como entrar em contato para saber mais sobre o Hub Smart Home?', acceptedAnswer: { '@type': 'Answer', text: 'Entre em contato com Stiven Allan, CRECI 60.275, pelo WhatsApp (48) 99145-5522. Atendimento personalizado para tirar dúvidas, agendar visita ao decorado e conhecer as condições de pagamento.' } },
      ],
    },
  ],
}

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

const numeros = [
  { valor: '1 e 2', unidade: 'suítes', label: 'Tipologias' },
  { valor: 'Centro', unidade: 'Criciúma', label: 'Localização' },
  { valor: '100%', unidade: 'smart', label: 'Automação' },
  { valor: 'Fontana', unidade: 'construtora', label: 'Incorporadora' },
]

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
      <style>{`
        .hub-card:hover { transform: translateY(-2px); border-color: #FF6A3D !important; transition: transform .22s ease, border-color .22s ease; }
        .hub-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,106,61,0.35); }
        .hub-tech:hover { border-color: rgba(210,78,34,0.4) !important; }
      `}</style>
      

      <main style={{ background: c.paper, color: c.ink, fontFamily: font.body, minHeight: '100vh' }}>

        {/* BREADCRUMB */}
        <nav aria-label="Breadcrumb" style={{ background: c.charcoal, borderBottom: `1px solid ${c.lineDark}`, padding: '12px 5%' }}>
          <ol style={{ display: 'flex', gap: 8, listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap' }}>
            <li><a href="/" style={{ color: c.onDarkMuted, fontSize: 13, textDecoration: 'none' }}>Início</a></li>
            <li style={{ color: c.onDarkMuted }}>›</li>
            <li><a href="/lancamentos/criciuma-sc" style={{ color: c.onDarkMuted, fontSize: 13, textDecoration: 'none' }}>Lançamentos Criciúma</a></li>
            <li style={{ color: c.onDarkMuted }}>›</li>
            <li style={{ color: c.bronze, fontSize: 13, fontWeight: 600 }}>Hub Smart Home</li>
          </ol>
        </nav>

        {/* HERO — padrão geométrico areia/bronze */}
        <section style={{ position: 'relative', height: 'clamp(500px,80vh,800px)', overflow: 'hidden' }}>
          {/* Fundo areia com gradiente */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${c.charcoal} 0%, #1e1b18 50%, ${c.charcoal} 100%)` }} />

          {/* Padrão geométrico recolorido bronze/laranja */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <div style={{ width: 'clamp(300px,60vw,700px)', height: 'clamp(300px,60vw,700px)', border: `1px solid rgba(210,78,34,0.12)`, borderRadius: '50%', position: 'absolute' }} />
            <div style={{ width: 'clamp(200px,45vw,520px)', height: 'clamp(200px,45vw,520px)', border: `1px solid rgba(210,78,34,0.18)`, borderRadius: '50%', position: 'absolute' }} />
            <div style={{ width: 'clamp(120px,28vw,320px)', height: 'clamp(120px,28vw,320px)', border: `1px solid rgba(255,106,61,0.22)`, borderRadius: '50%', position: 'absolute' }} />
            <div style={{ fontSize: 'clamp(4rem,12vw,9rem)', opacity: 0.07 }}>🏠</div>
          </div>

          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(19,18,17,0.97) 0%, rgba(19,18,17,0.72) 60%, rgba(19,18,17,0.3) 100%)' }} />

          <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 clamp(1.5rem,6vw,5rem)', maxWidth: 1200, margin: '0 auto' }}>
            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {['Fontana Construtora', 'Smart Home', 'Centro Criciúma SC', 'Lançamento'].map(b => (
                <span key={b} style={{ background: `rgba(210,78,34,0.12)`, border: `1px solid rgba(210,78,34,0.35)`, color: c.bronze, padding: '5px 14px', borderRadius: 40, fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {b}
                </span>
              ))}
            </div>

            <h1 style={{ fontFamily: font.display, fontSize: 'clamp(2.2rem,6vw,4.5rem)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 8px', letterSpacing: '-0.025em', color: c.onDark }}>
              Hub
              <span style={{ display: 'block', color: c.orange }}>Smart Home</span>
            </h1>

            <p style={{ fontSize: 'clamp(1rem,2.5vw,1.4rem)', color: c.onDarkMuted, margin: '12px 0 0', maxWidth: 520, lineHeight: 1.5 }}>
              O primeiro condomínio com automação residencial completa no Centro de Criciúma
            </p>

            <p style={{ fontSize: 'clamp(0.85rem,1.8vw,1rem)', color: c.bronze, margin: '8px 0 0', fontWeight: 600, letterSpacing: '0.04em' }}>
              FONTANA CONSTRUTORA • CENTRO • CRICIÚMA SC
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 32 }}>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="hub-cta"
                style={{ ...ui.btnConvert, minHeight: 48 }}>SOLICITAR INFORMAÇÕES</a>
              <LeadCaptureButton slug="hub-smart-home-criciuma-sc" construtora_slug="fontana"  propertyDisplayName="Hub Smart Home Residencial" />
              <a href="#diferenciais"
                style={{ background: 'transparent', color: c.onDark, padding: '14px 26px', borderRadius: 2, fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', minHeight: 48 }}>VER DIFERENCIAIS</a>
            </div>
          </div>
        </section>

        {/* NÚMEROS */}
        <section style={{ background: c.charcoal, borderTop: `1px solid ${c.lineDark}`, borderBottom: `1px solid ${c.lineDark}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(2rem,5vw,3rem) 5%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '2rem' }}>
            {numeros.map(n => (
              <div key={n.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: font.display, fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, color: c.orange, lineHeight: 1 }}>{n.valor}</div>
                <div style={{ fontSize: 12, color: c.onDarkMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{n.unidade}</div>
                <div style={{ fontSize: 11, color: c.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{n.label}</div>
              </div>
            ))}
          </div>
        </section>
        {/* SMART HOME SHOWCASE */}
        <section style={{ padding: 'clamp(3rem,8vw,6rem) 5%', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem,5vw,3.5rem)' }}>
            <div style={{ ...ui.eyebrow, marginBottom: 16 }}>TECNOLOGIA</div>
            <h2 style={{ ...ui.h2, color: c.ink }}>Seu apartamento, inteligente</h2>
            <p style={{ color: c.muted, fontSize: 'clamp(0.9rem,2vw,1.05rem)', maxWidth: 600, margin: '16px auto 0', lineHeight: 1.7 }}>
              Hub Smart Home integra tecnologia de automação residencial em cada detalhe. Controle tudo pelo smartphone — de qualquer lugar do mundo.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {tecnologias.map(t => (
              <div key={t.nome} className="hub-tech" style={{ background: c.surface, borderRadius: 3, padding: '1.5rem 2rem', border: `1px solid ${c.line}`, display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.bronze, marginTop: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: font.display, fontWeight: 700, color: c.ink, fontSize: 15, marginBottom: 6 }}>{t.nome}</div>
                  <div style={{ color: c.muted, fontSize: 14, lineHeight: 1.5 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SIMULADOR */}
        <section style={{ background: c.surface, padding: '64px 5%', borderTop: `1px solid ${c.line}`, borderBottom: `1px solid ${c.line}` }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ ...ui.eyebrow, marginBottom: 10 }}>Simulação de Financiamento</div>
              <h2 style={{ ...ui.h2, color: c.ink, margin: 0 }}>Calcule sua parcela</h2>
            </div>
            <Simulador valorInicial={380000} valorMin={280000} valorMax={600000} hrefReserva={WHATSAPP} />
          </div>
        </section>

        {/* DIFERENCIAIS */}
        <section id="diferenciais" style={{ background: c.paper, padding: 'clamp(3rem,8vw,6rem) 5%' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem,5vw,3.5rem)' }}>
              <div style={{ ...ui.eyebrow, marginBottom: 16 }}>DIFERENCIAIS</div>
              <h2 style={{ ...ui.h2, color: c.ink }}>Mais que um apartamento —<br/>um estilo de vida conectado</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
              {diferenciais.map(d => (
                <div key={d.titulo} className="hub-card" style={{ ...ui.card, padding: '1.75rem', borderRadius: 3, border: `1px solid ${c.line}` }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>{d.icon}</div>
                  <h3 style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, color: c.ink, margin: '0 0 8px', lineHeight: 1.3 }}>{d.titulo}</h3>
                  <p style={{ fontSize: 14, color: c.muted, margin: 0, lineHeight: 1.6 }}>{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LOCALIZAÇÃO */}
        <section style={{ padding: 'clamp(3rem,8vw,6rem) 5%', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem,5vw,3.5rem)' }}>
            <div style={{ ...ui.eyebrow, marginBottom: 16 }}>LOCALIZAÇÃO</div>
            <h2 style={{ ...ui.h2, color: c.ink }}>Centro de Criciúma —<br/>tudo ao seu alcance</h2>
            <p style={{ color: c.muted, fontSize: 'clamp(0.9rem,2vw,1rem)', maxWidth: 560, margin: '16px auto 0', lineHeight: 1.7 }}>
              Localizado no coração de Criciúma, Hub Smart Home oferece proximidade a centros comerciais, hospitais, escolas e vias de acesso.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            {[
              { icon: '🏬', local: 'Shopping Criciúma', dist: '5 min' },
              { icon: '🏥', local: 'Hospital São José', dist: '7 min' },
              { icon: '🎓', local: 'UNESC Campus', dist: '10 min' },
              { icon: '✈️', local: 'Aeroporto Forquilhinha', dist: '15 min' },
              { icon: '🏦', local: 'Agências Bancárias', dist: '3 min a pé' },
              { icon: '🍽️', local: 'Restaurantes e Cafés', dist: '1 min a pé' },
            ].map(l => (
              <div key={l.local} className="hub-card" style={{ background: c.surface, borderRadius: 3, padding: '1.25rem', border: `1px solid ${c.line}`, display: 'flex', alignItems: 'center', gap: '1rem', minHeight: 72 }}>
                <div style={{ fontSize: '1.5rem' }}>{l.icon}</div>
                <div>
                  <div style={{ fontFamily: font.display, fontWeight: 600, color: c.ink, fontSize: 14 }}>{l.local}</div>
                  <div style={{ color: c.bronze, fontSize: 13, fontWeight: 600, marginTop: 2 }}>{l.dist}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* CONSTRUTORA */}
        <section style={{ background: c.surface, padding: 'clamp(3rem,8vw,5rem) 5%', borderTop: `1px solid ${c.line}`, borderBottom: `1px solid ${c.line}` }}>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ ...ui.eyebrow, marginBottom: 24 }}>FONTANA CONSTRUTORA</div>
            <h2 style={{ ...ui.h2, color: c.ink, marginBottom: 16 }}>Tradição em qualidade e inovação no Sul de Santa Catarina</h2>
            <p style={{ color: c.muted, fontSize: 'clamp(0.9rem,2vw,1rem)', lineHeight: 1.8, margin: '0 auto', maxWidth: 720 }}>
              A Fontana Construtora é referência em Criciúma e região pela excelência na entrega de empreendimentos residenciais. O Hub Smart Home é mais um projeto que une tecnologia de ponta, materiais de qualidade superior e design contemporâneo — garantindo valorização e qualidade de vida para seus moradores.
            </p>
          </div>
        </section>

        {/* CTA PRINCIPAL */}
        <section style={{ padding: 'clamp(4rem,10vw,7rem) 5%', textAlign: 'center', position: 'relative', overflow: 'hidden', background: c.charcoal }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(210,78,34,0.08) 0%, transparent 70%)` }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
            <div style={{ ...ui.eyebrow, marginBottom: 24 }}>FALE COM O ESPECIALISTA</div>
            <h2 style={{ fontFamily: font.display, color: c.onDark, fontSize: 'clamp(1.8rem,5vw,3.2rem)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.025em' }}>
              Pronto para viver no futuro?
            </h2>
            <p style={{ color: c.onDarkMuted, fontSize: 'clamp(0.95rem,2.2vw,1.1rem)', margin: '0 auto 32px', lineHeight: 1.7, maxWidth: 520 }}>
              Converse com Stiven Allan, especialista em lançamentos da Fontana em Criciúma. Condições exclusivas, atendimento personalizado e todo o suporte até a entrega das chaves.
            </p>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="hub-cta"
              style={{ display: 'inline-block', ...ui.btnConvert, fontSize: 'clamp(0.9rem,2vw,1.05rem)', minHeight: 52 }}>
              QUERO SABER MAIS — WHATSAPP
            </a>
            <div style={{ marginTop: 20, color: c.onDarkMuted, fontSize: 13 }}>
              Stiven Allan • CRECI 60.275 • (48) 99145-5522
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: c.charcoal, borderTop: `1px solid ${c.lineDark}`, padding: 'clamp(2rem,5vw,3rem) 5%' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: font.display, color: c.bronze, fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em', marginBottom: 6 }}>STIVEN ALLAN</div>
              <div style={{ color: c.onDarkMuted, fontSize: 13 }}>CRECI 60.275</div>
              <div style={{ color: c.onDarkMuted, fontSize: 13, marginTop: 2 }}>Criciúma e região — SC</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={{ color: c.bronze, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                (48) 99145-5522
              </a>
              <div style={{ color: c.muted, fontSize: 12, marginTop: 6 }}>
                © {new Date().getFullYear()} Stiven Allan. Todos os direitos reservados.
              </div>
              <div style={{ color: c.muted, fontSize: 11, marginTop: 2 }}>
                Hub Smart Home é um empreendimento da Fontana Construtora
              </div>
            </div>
          </div>
        </footer>

        {/* CTA STICKY MOBILE */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: c.charcoal, borderTop: `1px solid ${c.lineDark}`, padding: '12px 5%', display: 'flex', gap: 10 }} className="hub-mobile-cta">
          <style>{`.hub-mobile-cta { display: flex; } @media (min-width: 768px) { .hub-mobile-cta { display: none !important; } }`}</style>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, ...ui.btnConvert, borderRadius: 2, textAlign: 'center', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
            Falar com Stiven
          </a>
          <a href="tel:+5548991455522"
            style={{ flex: 1, ...ui.btnPrimary, borderRadius: 2, textAlign: 'center', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
            Ligar agora
          </a>
        </div>
      


{/* SEO FAQ */}
<PropertyFAQ items={[{"pergunta":"Como funciona o financiamento direto do Hub Smart Home?","resposta":"Entrada de 20%, saldo em até 72 parcelas mensais e 6 reforços anuais (cada reforço equivale a 5 parcelas mensais), com correção pelo CUB/SC durante a obra. Sem análise de banco."},{"pergunta":"Posso usar financiamento bancário ou FGTS?","resposta":"Sim. Além do financiamento direto com a construtora, é possível optar por financiamento bancário. Fale com o Stiven pelo WhatsApp para simular as duas opções."},{"pergunta":"Onde fica o Hub Smart Home?","resposta":"O Hub Smart Home está localizado no Centro de Criciúma/SC."},{"pergunta":"Quais são os diferenciais do Hub Smart Home?","resposta":"O empreendimento oferece automação residencial completa (controle de iluminação, climatização e segurança pelo smartphone), espaço fitness, salão de festas e vagas de garagem cobertas com infraestrutura para veículos elétricos."}]} accent="#FF6A3D" />
<RelatedProperties atualSlug="hub-smart-home-criciuma-sc" cidade="Criciúma" />


</main>
    </>
  )
}
