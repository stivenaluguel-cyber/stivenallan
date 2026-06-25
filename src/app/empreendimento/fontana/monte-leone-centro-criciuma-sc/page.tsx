import type { Metadata } from 'next'

export const revalidate = 3600

const WPP = 'https://api.whatsapp.com/send?phone=5548991455522&text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Monte%20Leone!'

// Google Drive image helper
const gd = (id: string, w = 1200) => `https://lh3.googleusercontent.com/d/${id}=w${w}`

// Image IDs from Google Drive (Monte Leone)
const IMG = {
  fachadaFrontal: '1fMiRBzC7f5QjEWSWfrCf9ExxdjtBqsQw',
  fachadaAngular: '1qTxY-6kI1MiToh9HKPQ7Gy4B3E17VOEs',
  vooPassaro:    '1oXgD-F-4VuFNUmAIUzl8TTeKintea2t0',
  piscina1:      '1qAe2EIqVS1pvCcvByVipcp7Qtyi1Wl1h',
  piscina2:      '167seez0Pt30BKoXGEZNCN0Nx7potXKt5',
  areaGourmet:   '1IbZsHWqT55sQy3vnEOC6EN60LUrj4DFt',
  salaoFestas:   '1DwD8l2Fuz6jykw4S_b_oF1nubJAeUBBo',
  living1:       '1cN-urMYTdZyD91iOBVTVH3IY43ZflCeW',
  living2:       '1xbkDVtpM_LTGxwfDvafWWL99urH-SZfF',
  suite:         '1Ho1yTZ2AQx5hvGV-YbmDqUJSFXZ019-X',
  banheiro:      '1hpuLwJlhpuyXwGHRtpaWHefBb__whD5I',
  hall:          '1MR5AdLgREy_ZnknnbNBhaQ027gRBNwQe',
  lounge1:       '1PU5JZnVqRr2zIjylYXfs3EvOq-Wbsxd7',
  deck1:         '1vM9NMNoNuLbWX4MjqoZ0oFb2DLLjBPUs',
  playground:    '1T0yhEpnCMFmcX-OBpUxyVbJWUceHvhKt',
  academiaExt:   '1_qP-mJQKB049pBC33kGxrQQHQjJTzvhE',
  salaJogos:     '1lLgmjXGMcEdJC4FimZ0lGZIklAnd1EVH',
  sacada:        '1mvRpHDHf9i6tRn9_2y59ph1sFIa2tvuB',
  brinquedoteca: '1ZJy-vixChyH1ZzdoJYWuMFvHAvJVEm4V',
  // plantas
  planta1:       '1_Mi2tuLiJEb5PV3A2DBh3sJfE6o3PI1y',
  planta2:       '11RRpaBbyBlAlm5fzLrunDr_YNDzrjndt',
  planta3:       '13kdzMA6kJqJdEiZgtxacqsEogTqdoQhm',
  plantaLazer:   '1RxvMPVCK-k95lKz8-jNb6aczB0IciCGv',
  plantaGaragem: '1-paSD_GgaA7Hx4wfYah_rn20EZ9SDhdy',
}
export const metadata: Metadata = {
  title: 'Monte Leone Residencial | Apartamento 4 Quartos Centro Criciuma SC | Stiven Allan Corretor',
  description: 'Monte Leone Residencial: apartamentos de luxo 4 dorm (3 suites), 230-253m2, 3 vagas, piscina climatizada. Lancamento no Centro de Criciuma/SC. Consulte Stiven Allan CRECI/RS 60.275.',
  keywords: ['Monte Leone Residencial','apartamento 4 quartos Criciuma','lancamento Criciuma SC','apartamento 230m2 Criciuma','Construtora Fontana Criciuma','apartamento de luxo Criciuma','3 suites Criciuma','Stiven Allan corretor','CRECI RS 60275'],
  alternates: { canonical: 'https://stivenallan.vercel.app/empreendimento/fontana/monte-leone-centro-criciuma-sc' },
  openGraph: {
    title: 'Monte Leone Residencial | 4 Dorm 253m2 | Lancamento Centro Criciuma',
    description: 'Lancamento exclusivo no ponto mais alto do Centro de Criciuma. Vista para a Serra, 230-253m2, piscina climatizada.',
    url: 'https://stivenallan.vercel.app/empreendimento/fontana/monte-leone-centro-criciuma-sc',
    siteName: 'Stiven Allan Corretor',
    locale: 'pt_BR',
    type: 'website',
  },
}
export default function MonteLeone() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'RealEstateListing',
        name: 'Monte Leone Residencial',
        description: 'Lancamento de alto padrao no Centro de Criciuma/SC. Apartamentos 4 dormitorios (3 suites), 230-253m2, 3 vagas, piscina climatizada.',
        url: 'https://stivenallan.vercel.app/empreendimento/fontana/monte-leone-centro-criciuma-sc',
        image: `https://lh3.googleusercontent.com/d/1fMiRBzC7f5QjEWSWfrCf9ExxdjtBqsQw=w1200`,
        address: { '@type': 'PostalAddress', streetAddress: 'Rua Conselheiro Joao Zancan, 193', addressLocality: 'Criciuma', addressRegion: 'SC', addressCountry: 'BR' },
        offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'BRL' },
      },
      {
        '@type': 'RealEstateAgent',
        name: 'Stiven Allan',
        telephone: '+5548991455522',
        url: 'https://stivenallan.vercel.app',
        address: { '@type': 'PostalAddress', addressLocality: 'Criciuma', addressRegion: 'SC' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://stivenallan.vercel.app' },
          { '@type': 'ListItem', position: 2, name: 'Lancamentos Criciuma', item: 'https://stivenallan.vercel.app/lancamentos/criciuma-sc' },
          { '@type': 'ListItem', position: 3, name: 'Monte Leone Residencial' },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'Qual o preco do Monte Leone?', acceptedAnswer: { '@type': 'Answer', text: 'Os valores e condicoes de pagamento variam conforme a unidade. Entre em contato com Stiven Allan CRECI/RS 60.275 pelo WhatsApp para receber a tabela atualizada.' } },
          { '@type': 'Question', name: 'Quais as opcoes de planta do Monte Leone?', acceptedAnswer: { '@type': 'Answer', text: 'O Monte Leone oferece tres opcoes de planta: Tipo 01, Tipo 02 e Tipo 03, com areas de 230m2 a 253m2, todas com 4 dormitorios (3 suites) e 3 vagas de garagem.' } },
          { '@type': 'Question', name: 'Onde fica o Monte Leone Residencial?', acceptedAnswer: { '@type': 'Answer', text: 'No Centro de Criciuma/SC, na Rua Conselheiro Joao Zancan, 193, no ponto mais alto do Centro, com vista permanente para a Serra.' } },
          { '@type': 'Question', name: 'Qual o status do empreendimento?', acceptedAnswer: { '@type': 'Answer', text: 'Monte Leone esta em fase de lancamento com unidades disponiveis. A entrega esta prevista conforme cronograma da Construtora Fontana.' } },
          { '@type': 'Question', name: 'Quais as areas de lazer?', acceptedAnswer: { '@type': 'Answer', text: 'Piscina climatizada com deck, academia interna e externa, area gourmet, salao de festas, sala de jogos, brinquedoteca e playground.' } },
        ],
      },
    ],
  }
  const galeria = [
    { id: '1fMiRBzC7f5QjEWSWfrCf9ExxdjtBqsQw', label: 'Fachada Frontal' },
    { id: '1qTxY-6kI1MiToh9HKPQ7Gy4B3E17VOEs', label: 'Fachada Angular' },
    { id: '1qAe2EIqVS1pvCcvByVipcp7Qtyi1Wl1h', label: 'Piscina Climatizada' },
    { id: '1oXgD-F-4VuFNUmAIUzl8TTeKintea2t0', label: 'Vista Aerea' },
    { id: '1cN-urMYTdZyD91iOBVTVH3IY43ZflCeW', label: 'Living' },
    { id: '1Ho1yTZ2AQx5hvGV-YbmDqUJSFXZ019-X', label: 'Suite Master' },
    { id: '1hpuLwJlhpuyXwGHRtpaWHefBb__whD5I', label: 'Banheiro Suite' },
    { id: '1IbZsHWqT55sQy3vnEOC6EN60LUrj4DFt', label: 'Area Gourmet' },
    { id: '1DwD8l2Fuz6jykw4S_b_oF1nubJAeUBBo', label: 'Salao de Festas' },
    { id: '1MR5AdLgREy_ZnknnbNBhaQ027gRBNwQe', label: 'Hall de Entrada' },
    { id: '1vM9NMNoNuLbWX4MjqoZ0oFb2DLLjBPUs', label: 'Deck' },
    { id: '1mvRpHDHf9i6tRn9_2y59ph1sFIa2tvuB', label: 'Sacada' },
    { id: '1_qP-mJQKB049pBC33kGxrQQHQjJTzvhE', label: 'Academia Externa' },
    { id: '1PU5JZnVqRr2zIjylYXfs3EvOq-Wbsxd7', label: 'Lounge' },
    { id: '1lLgmjXGMcEdJC4FimZ0lGZIklAnd1EVH', label: 'Sala de Jogos' },
    { id: '1T0yhEpnCMFmcX-OBpUxyVbJWUceHvhKt', label: 'Playground' },
    { id: '1ZJy-vixChyH1ZzdoJYWuMFvHAvJVEm4V', label: 'Brinquedoteca' },
  ]

  const plantas = [
    { id: '1_Mi2tuLiJEb5PV3A2DBh3sJfE6o3PI1y', label: 'Tipo 01', area: '230m²', dorms: '4 dorm / 3 suites' },
    { id: '11RRpaBbyBlAlm5fzLrunDr_YNDzrjndt', label: 'Tipo 02', area: '241m²', dorms: '4 dorm / 3 suites' },
    { id: '13kdzMA6kJqJdEiZgtxacqsEogTqdoQhm', label: 'Tipo 03', area: '253m²', dorms: '4 dorm / 3 suites' },
    { id: '1RxvMPVCK-k95lKz8-jNb6aczB0IciCGv', label: 'Pavimento Lazer', area: '3° Pav', dorms: 'Piscina · Deck · Academia' },
    { id: '1-paSD_GgaA7Hx4wfYah_rn20EZ9SDhdy', label: 'Garagem', area: '2° Pav', dorms: '3 vagas / unidade' },
  ]
  const faq = [
    { q: 'Qual o preco do Monte Leone?', a: 'Os valores variam por unidade e andar. Consulte Stiven Allan pelo WhatsApp para receber a tabela de vendas atualizada com todas as opcoes de pagamento.' },
    { q: 'Quais sao as opcoes de planta?', a: 'Tres tipologias: Tipo 01 (230m²), Tipo 02 (241m²) e Tipo 03 (253m²). Todas com 4 dormitorios, 3 suites e 3 vagas de garagem.' },
    { q: 'Onde fica o Monte Leone?', a: 'No Centro de Criciuma/SC, Rua Conselheiro Joao Zancan, 193. Ponto mais alto do centro, com vista permanente para a Serra catarinense.' },
    { q: 'Qual o prazo de entrega?', a: 'Empreendimento em lancamento. Consulte o corretor Stiven Allan para informacoes atualizadas sobre cronograma de obras e entrega.' },
    { q: 'Como visitar o stand?', a: 'Entre em contato via WhatsApp com Stiven Allan (CRECI/RS 60.275). Ele agenda uma apresentacao completa do empreendimento e do decorado.' },
  ]

  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Urgency bar */}
      <div style={{ background: '#e63946', color: '#fff', textAlign: 'center', padding: '10px 20px', fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px', position: 'sticky', top: 0, zIndex: 50 }}>
        LANCAMENTO — Unidades limitadas disponveis.&nbsp;
        <a href={WPP} target='_blank' rel='noopener noreferrer' style={{ color: '#fff', textDecoration: 'underline' }}>Falar com corretor agora →</a>
      </div>
      {/* HERO - full viewport com imagem real */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden', background: '#0a0a0b' }}>
        {/* Imagem de fundo real - fachada angular */}
        <img
          src={`https://lh3.googleusercontent.com/d/1qTxY-6kI1MiToh9HKPQ7Gy4B3E17VOEs=w1600`}
          alt='Monte Leone Residencial - Fachada'
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.55)' }}
          loading='eager'
        />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,11,0.2) 0%, rgba(10,10,11,0.1) 40%, rgba(10,10,11,0.75) 75%, rgba(10,10,11,0.97) 100%)' }} />

        {/* Badge superior esquerdo */}
        <div style={{ position: 'absolute', top: 32, left: 32, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ background: '#c9a24b', color: '#0a0a0b', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', padding: '6px 14px', textTransform: 'uppercase' }}>Lancamento</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', padding: '6px 14px', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.2)' }}>Construtora Fontana</span>
        </div>

        {/* Conteudo hero */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 32px 60px', maxWidth: 900 }}>
          <p style={{ color: '#c9a24b', fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Centro · Criciuma/SC</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(3rem, 8vw, 7rem)', fontWeight: 900, lineHeight: 1, margin: '0 0 8px', letterSpacing: '-2px' }}>Monte Leone</h1>
          <h2 style={{ color: '#c9a24b', fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', fontWeight: 300, lineHeight: 1, margin: '0 0 32px', letterSpacing: '-1px', fontStyle: 'italic' }}>Residencial</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: 560, lineHeight: 1.6, marginBottom: 40 }}>
            O ponto mais alto do Centro. Vista permanente para a Serra. 4 dormitorios, 230–253m², piscina climatizada.
          </p>
          {/* CTAs */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
            <a href={WPP} target='_blank' rel='noopener noreferrer' style={{ background: '#1f9d55', color: '#fff', padding: '16px 36px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', letterSpacing: '0.5px' }}>
              Quero conhecer →
            </a>
            <a href='#galeria' style={{ background: 'transparent', color: '#fff', padding: '16px 36px', fontWeight: 600, fontSize: '15px', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>
              Ver fotos
            </a>
          </div>
          {/* Stats bar */}
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 24 }}>
            {[['4', 'Dormitorios'],['3', 'Suites'],['253m²', 'Ate'],['3', 'Vagas']].map(([v, l], i) => (
              <div key={i} style={{ flex: 1, borderRight: i < 3 ? '1px solid rgba(255,255,255,0.12)' : 'none', paddingRight: 24, marginRight: 24 }}>
                <div style={{ color: '#c9a24b', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, lineHeight: 1 }}>{v}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* GALERIA - scroll horizontal */}
      <section id='galeria' style={{ background: '#0a0a0b', paddingTop: 0 }}>
        <div style={{ overflowX: 'auto', display: 'flex', gap: 4, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          {galeria.map((item, i) => (
            <div key={i} style={{ flex: '0 0 auto', width: 'clamp(280px, 33vw, 440px)', height: 'clamp(200px, 25vw, 320px)', position: 'relative', scrollSnapAlign: 'start', overflow: 'hidden' }}>
              <img
                src={`https://lh3.googleusercontent.com/d/${item.id}=w800`}
                alt={item.label}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                loading={i < 3 ? 'eager' : 'lazy'}
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7)', padding: '32px 16px 12px' }}>
                <span style={{ color: '#fff', fontSize: '12px', fontWeight: 500, letterSpacing: '0.5px' }}>{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONCEITO */}
      <section style={{ background: '#0f1012', padding: '100px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <p style={{ color: '#c9a24b', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 24 }}>O Empreendimento</p>
            <h2 style={{ color: '#f1f3f5', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 28px', letterSpacing: '-1px' }}>
              Magnifico<br /><span style={{ color: '#c9a24b', fontStyle: 'italic', fontWeight: 300 }}>por essencia.</span>
            </h2>
            <p style={{ color: '#a7adb4', fontSize: '17px', lineHeight: 1.8, marginBottom: 20 }}>
              No ponto mais alto do Centro de Criciuma, o Monte Leone Residencial ergue-se como simbolo de exclusividade e sofisticacao. Vista permanente para a Serra catarinense, arquitetura assinada e acabamentos de alto padrao.
            </p>
            <p style={{ color: '#a7adb4', fontSize: '17px', lineHeight: 1.8, marginBottom: 36 }}>
              Apenas unidades por andar, garantindo privacidade absoluta. Piscina climatizada, academia completa e areas de convivencia que transformam cada dia em experiencia premium.
            </p>
            <a href={WPP} target='_blank' rel='noopener noreferrer' style={{ display: 'inline-block', background: '#c9a24b', color: '#0a0a0b', padding: '14px 32px', fontWeight: 700, fontSize: '14px', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Agendar visita
            </a>
          </div>
          <div style={{ position: 'relative' }}>
            <img
              src='https://lh3.googleusercontent.com/d/1qAe2EIqVS1pvCcvByVipcp7Qtyi1Wl1h=w900'
              alt='Piscina climatizada Monte Leone'
              style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }}
              loading='lazy'
            />
            <div style={{ position: 'absolute', bottom: -24, left: -24, background: '#c9a24b', padding: '20px 24px', maxWidth: 200 }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#0a0a0b', lineHeight: 1 }}>253m²</div>
              <div style={{ fontSize: '12px', color: '#0a0a0b', opacity: 0.7, marginTop: 4 }}>ate (Tipo Plus)</div>
            </div>
          </div>
        </div>
      </section>
      {/* PLANTAS */}
      <section id='plantas' style={{ background: '#121315', padding: '100px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 60 }}>
            <p style={{ color: '#c9a24b', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Plantas e Tipologias</p>
            <h2 style={{ color: '#f1f3f5', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Escolha seu apartamento ideal</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 2 }}>
            {plantas.map((p, i) => (
              <div key={i} style={{ background: '#0f1012', overflow: 'hidden', position: 'relative' }}>
                <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#1a1c20' }}>
                  <img
                    src={`https://lh3.googleusercontent.com/d/${p.id}=w700`}
                    alt={`Planta ${p.label} - Monte Leone`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '20px', background: '#fff' }}
                    loading='lazy'
                  />
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ color: '#f1f3f5', fontSize: '18px', fontWeight: 700, margin: '0 0 6px' }}>{p.label}</h3>
                      <p style={{ color: '#a7adb4', fontSize: '13px', margin: 0 }}>{p.dorms}</p>
                    </div>
                    <span style={{ background: '#c9a24b', color: '#0a0a0b', padding: '6px 14px', fontSize: '14px', fontWeight: 800 }}>{p.area}</span>
                  </div>
                  <a href={WPP} target='_blank' rel='noopener noreferrer' style={{ display: 'block', marginTop: 16, color: '#c9a24b', fontSize: '13px', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.5px' }}>
                    Consultar preco desta planta →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* DIFERENCIAIS com foto real */}
      <section style={{ background: '#0f1012', padding: '100px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
            <div>
              <p style={{ color: '#c9a24b', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Infraestrutura</p>
              <h2 style={{ color: '#f1f3f5', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 800, margin: '0 0 48px', letterSpacing: '-0.5px' }}>Lazer e Diferenciais</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                {[
                  ['Piscina climatizada',''],
                  ['Deck com solarium',''],
                  ['Academia interna',''],
                  ['Academia externa',''],
                  ['Area gourmet',''],
                  ['Salao de festas',''],
                  ['Sala de jogos',''],
                  ['Brinquedoteca',''],
                  ['Playground',''],
                  ['Lounge social',''],
                  ['Hall privativo',''],
                  ['3 vagas garagem',''],
                ].map(([label], i) => (
                  <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid #1e2024', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: '#c9a24b', fontSize: '16px' }}>—</span>
                    <span style={{ color: '#f1f3f5', fontSize: '14px', fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              <img src='https://lh3.googleusercontent.com/d/1IbZsHWqT55sQy3vnEOC6EN60LUrj4DFt=w600' alt='Area Gourmet' style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} loading='lazy' />
              <img src='https://lh3.googleusercontent.com/d/1DwD8l2Fuz6jykw4S_b_oF1nubJAeUBBo=w600' alt='Salao de Festas' style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} loading='lazy' />
              <img src='https://lh3.googleusercontent.com/d/1lLgmjXGMcEdJC4FimZ0lGZIklAnd1EVH=w600' alt='Sala de Jogos' style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} loading='lazy' />
              <img src='https://lh3.googleusercontent.com/d/1_qP-mJQKB049pBC33kGxrQQHQjJTzvhE=w600' alt='Academia' style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} loading='lazy' />
            </div>
          </div>
        </div>
      </section>
      {/* ACABAMENTOS */}
      <section style={{ background: '#121315', padding: '100px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <img src='https://lh3.googleusercontent.com/d/1Ho1yTZ2AQx5hvGV-YbmDqUJSFXZ019-X=w900' alt='Suite Master Monte Leone' style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }} loading='lazy' />
          </div>
          <div>
            <p style={{ color: '#c9a24b', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Qualidade</p>
            <h2 style={{ color: '#f1f3f5', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.5px' }}>Acabamentos Premium</h2>
            <p style={{ color: '#a7adb4', fontSize: '15px', lineHeight: 1.7, marginBottom: 40 }}>Cada detalhe projetado para um nivel de vida superior. Materiais selecionados e tecnologia aplicada a cada metro quadrado.</p>
            <div>
              {[
                'Porcelanato retificado nas areas sociais',
                'Cozinha com armarios planejados',
                'Bancadas em granito ou quartzo',
                'Suites com closet integrado',
                'Banheiros com louças de alto padrao',
                'Varanda com esquadria de aluminio',
                'Ar-condicionado pre-instalado',
                'Tomadas USB em todos os ambientes',
                'Interfone digital com video',
                'Elevadores de ultima geracao',
                'Gerador para areas comuns',
                'Sistema de seguranca 24h',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #1e2024' }}>
                  <span style={{ color: '#c9a24b', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>✓</span>
                  <span style={{ color: '#f1f3f5', fontSize: '14px' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* LOCALIZACAO */}
      <section style={{ background: '#0f1012', padding: '100px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ color: '#c9a24b', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Onde fica</p>
          <h2 style={{ color: '#f1f3f5', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 800, margin: '0 0 48px', letterSpacing: '-0.5px' }}>Localizacao privilegiada</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            <div>
              <p style={{ color: '#a7adb4', fontSize: '15px', lineHeight: 1.7, marginBottom: 32 }}>
                <strong style={{ color: '#f1f3f5' }}>Rua Conselheiro Joao Zancan, 193</strong><br />
                Centro · Criciuma/SC
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                {[
                  ['5 min', 'Shopping Della'],
                  ['5 min', 'Hospital Sao Jose'],
                  ['8 min', 'UNESC'],
                  ['10 min', 'Rodoviaria'],
                  ['10 min', 'Forum'],
                  ['15 min', 'Aeroporto Diomicio Freitas'],
                ].map(([tempo, local]) => (
                  <div key={local} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ background: '#c9a24b', color: '#0a0a0b', padding: '4px 10px', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{tempo}</span>
                    <span style={{ color: '#f1f3f5', fontSize: '14px' }}>{local}</span>
                  </div>
                ))}
              </div>
              <a href='https://maps.google.com/?q=Rua+Conselheiro+Joao+Zancan+193+Criciuma+SC' target='_blank' rel='noopener noreferrer' style={{ color: '#c9a24b', fontSize: '13px', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.5px' }}>
                Abrir no Google Maps →
              </a>
            </div>
            <div>
              <iframe
                src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3535.5!2d-49.3712!3d-28.6803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDQwJzQ5LjEiUyA0OcKwMjInMTYuMyJX!5e0!3m2!1spt-BR!2sbr!4v1234567890'
                width='100%'
                height='360'
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
                title='Localizacao Monte Leone Criciuma'
              />
            </div>
          </div>
        </div>
      </section>
      {/* CORRETOR */}
      <section style={{ background: '#121315', padding: '80px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
            <div style={{ flexShrink: 0, width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: '3px solid #c9a24b' }}>
              <div style={{ width: '100%', height: '100%', background: '#202327', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>SA</div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#c9a24b', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Seu Corretor</p>
              <h3 style={{ color: '#f1f3f5', fontSize: '28px', fontWeight: 800, margin: '0 0 4px' }}>Stiven Allan</h3>
              <p style={{ color: '#a7adb4', fontSize: '14px', marginBottom: 16 }}>CRECI/RS 60.275 · Especialista em Lancamentos · Criciuma/SC</p>
              <p style={{ color: '#a7adb4', fontSize: '15px', lineHeight: 1.7, marginBottom: 24 }}>
                Corretor de imoveis especializado em lancamentos de construtoras na regiao de Criciuma. Atendimento personalizado, transparencia e suporte completo do primeiro contato ate a entrega das chaves.
              </p>
              <a href={WPP} target='_blank' rel='noopener noreferrer' style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#1f9d55', color: '#fff', padding: '14px 28px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
                Falar com Stiven no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* FORMULARIO */}
      <section id='contato' style={{ background: '#0f1012', padding: '100px 32px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#c9a24b', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Solicite informacoes</p>
          <h2 style={{ color: '#f1f3f5', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.5px' }}>Quero saber mais sobre o Monte Leone</h2>
          <p style={{ color: '#a7adb4', fontSize: '15px', lineHeight: 1.7, marginBottom: 48 }}>Preencha o formulario e Stiven Allan entra em contato via WhatsApp com tabela de precos e disponibilidade de unidades.</p>
          <form
            action={WPP}
            method='get'
            target='_blank'
            onSubmit={(e) => {
              e.preventDefault()
              const nome = (e.currentTarget.elements.namedItem('nome') as HTMLInputElement)?.value
              const tel = (e.currentTarget.elements.namedItem('tel') as HTMLInputElement)?.value
              const planta = (e.currentTarget.elements.namedItem('planta') as HTMLSelectElement)?.value
              const msg = encodeURIComponent(`Ola Stiven, me chamo ${nome}. Tenho interesse no Monte Leone Residencial. Planta preferida: ${planta}. Meu whatsapp: ${tel}`)
              window.open(`https://api.whatsapp.com/send?phone=5548991455522&text=${msg}`, '_blank')
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}
          >
            <input name='nome' type='text' placeholder='Seu nome completo' required style={{ background: '#202327', border: '1px solid #2c3035', color: '#f1f3f5', padding: '16px 20px', fontSize: '15px', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
            <input name='tel' type='tel' placeholder='Seu WhatsApp (com DDD)' required style={{ background: '#202327', border: '1px solid #2c3035', color: '#f1f3f5', padding: '16px 20px', fontSize: '15px', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
            <select name='planta' style={{ background: '#202327', border: '1px solid #2c3035', color: '#a7adb4', padding: '16px 20px', fontSize: '15px', outline: 'none', width: '100%', boxSizing: 'border-box' }}>
              <option value='Qualquer'>Todas as opcoes</option>
              <option value='Tipo 01 - 230m2'>Tipo 01 — 230m²</option>
              <option value='Tipo 02 - 241m2'>Tipo 02 — 241m²</option>
              <option value='Tipo 03 - 253m2'>Tipo 03 — 253m²</option>
            </select>
            <button type='submit' style={{ background: '#1f9d55', color: '#fff', padding: '18px', fontWeight: 800, fontSize: '16px', border: 'none', cursor: 'pointer', letterSpacing: '0.5px' }}>
              Enviar pelo WhatsApp →
            </button>
          </form>
          <p style={{ color: '#4a5568', fontSize: '12px', marginTop: 16 }}>Stiven Allan — CRECI/RS 60.275 · Nao compartilhamos seus dados.</p>
        </div>
      </section>
      {/* FAQ */}
      <section style={{ background: '#121315', padding: '100px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ color: '#c9a24b', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Duvidas frequentes</p>
          <h2 style={{ color: '#f1f3f5', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, margin: '0 0 48px', letterSpacing: '-0.5px' }}>Perguntas frequentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {faq.map((item, i) => (
              <details key={i} style={{ borderBottom: '1px solid #1e2024', paddingBottom: 0 }}>
                <summary style={{ color: '#f1f3f5', fontSize: '16px', fontWeight: 600, padding: '20px 0', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {item.q}
                  <span style={{ color: '#c9a24b', fontSize: '20px', flexShrink: 0, marginLeft: 16 }}>+</span>
                </summary>
                <p style={{ color: '#a7adb4', fontSize: '15px', lineHeight: 1.7, padding: '0 0 20px', margin: 0 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ position: 'relative', padding: '120px 32px', overflow: 'hidden', background: '#0a0a0b' }}>
        <img src='https://lh3.googleusercontent.com/d/1oXgD-F-4VuFNUmAIUzl8TTeKintea2t0=w1600' alt='Monte Leone Criciuma vista aerea' style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3)', objectPosition: 'center' }} loading='lazy' />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#c9a24b', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 24 }}>Ainda tem duvidas?</p>
          <h2 style={{ color: '#fff', fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900, margin: '0 0 24px', lineHeight: 1.1, letterSpacing: '-1px' }}>
            Monte Leone<br /><span style={{ color: '#c9a24b', fontStyle: 'italic', fontWeight: 300 }}>esta te esperando.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '17px', lineHeight: 1.7, marginBottom: 40 }}>
            Unidades limitadas. Fale agora com Stiven Allan e garanta sua reserva sem compromisso.
          </p>
          <a href={WPP} target='_blank' rel='noopener noreferrer' style={{ display: 'inline-block', background: '#1f9d55', color: '#fff', padding: '20px 48px', fontWeight: 800, fontSize: '18px', textDecoration: 'none', letterSpacing: '0.5px' }}>
            Falar com Stiven Allan agora
          </a>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: 20 }}>CRECI/RS 60.275 · Atendimento via WhatsApp</p>
        </div>
      </section>

      {/* BREADCRUMB */}
      <nav aria-label='Breadcrumb' style={{ background: '#0a0a0b', padding: '16px 32px', borderTop: '1px solid #1e2024' }}>
        <ol style={{ display: 'flex', gap: 8, listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap' }}>
          <li><a href='/' style={{ color: '#a7adb4', fontSize: '13px', textDecoration: 'none' }}>Inicio</a></li>
          <li style={{ color: '#4a5568' }}>/</li>
          <li><a href='/lancamentos/criciuma-sc' style={{ color: '#a7adb4', fontSize: '13px', textDecoration: 'none' }}>Lancamentos Criciuma</a></li>
          <li style={{ color: '#4a5568' }}>/</li>
          <li style={{ color: '#c9a24b', fontSize: '13px', fontWeight: 600 }}>Monte Leone Residencial</li>
        </ol>
      </nav>
    </>
  )
}
