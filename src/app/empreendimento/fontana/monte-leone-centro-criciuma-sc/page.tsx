import type { Metadata } from 'next'
import Image from 'next/image'
import { c, font, ui } from '@/lib/theme'
import Simulador from '@/components/Simulador'

export const revalidate = 3600

const WPP = 'https://api.whatsapp.com/send?phone=5548991642332&text=Ol%C3%A1%20Stiven%2C%20tenho%20interesse%20no%20Monte%20Leone!'

export const metadata: Metadata = {
  title: 'Monte Leone Residencial | Apartamento 4 Quartos Centro Criciuma SC | Stiven Allan Corretor',
  description: 'Monte Leone Residencial: apartamentos de luxo 4 dorm (3 suites), 230-253m2, 3 vagas, piscina climatizada. Lançamento no Centro de Criciuma/SC. Consulte Stiven Allan CRECI/RS 60.275.',
  keywords: ['Monte Leone Residencial','apartamento 4 quartos Criciuma','lançamento Criciuma SC','apartamento 230m2','Construtora Fontana'],
  alternates: { canonical: 'https://stivenallan.vercel.app/empreendimento/fontana/monte-leone-centro-criciuma-sc' },
  openGraph: {
    title: 'Monte Leone Residencial | 4 Dorm 253m2 | Lançamento Centro Criciuma',
    description: 'Lançamento exclusivo no ponto mais alto do Centro de Criciuma. Vista para a Serra, 230-253m2, piscina climatizada.',
    url: 'https://stivenallan.vercel.app/empreendimento/fontana/monte-leone-centro-criciuma-sc',
    siteName: 'Stiven Allan Corretor',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://lh3.googleusercontent.com/d/1qTxY-6kI1MiToh9HKPQ7Gy4B3E17VOEs', width: 1200, height: 630 }],
  },
}

const galeria = [
  { id: '1fMiRBzC7f5QjEWSWfrCf9ExxdjtBqsQw', label: 'Fachada Frontal' },
  { id: '1qTxY-6kI1MiToh9HKPQ7Gy4B3E17VOEs', label: 'Fachada Angular' },
  { id: '1qAe2EIqVS1pvCcvByVipcp7Qtyi1Wl1h', label: 'Piscina Climatizada' },
  { id: '1oXgD-F-4VuFNUmAIUzl8TTeKintea2t0', label: 'Vista Aérea' },
  { id: '1cN-urMYTdZyD91iOBVTVH3IY43ZflCeW', label: 'Living' },
  { id: '1Ho1yTZ2AQx5hvGV-YbmDqUJSFXZ019-X', label: 'Suíte Master' },
  { id: '1hpuLwJlhpuyXwGHRtpaWHefBb__whD5I', label: 'Banheiro Suíte' },
  { id: '1IbZsHWqT55sQy3vnEOC6EN60LUrj4DFt', label: 'Área Gourmet' },
  { id: '1DwD8l2Fuz6jykw4S_b_oF1nubJAeUBBo', label: 'Salão de Festas' },
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
  { id: '1_Mi2tuLiJEb5PV3A2DBh3sJfE6o3PI1y', label: 'Tipo 01', area: '230m²', sub: '4 dorm / 3 suítes' },
  { id: '11RRpaBbyBlAlm5fzLrunDr_YNDzrjndt', label: 'Tipo 02', area: '241m²', sub: '4 dorm / 3 suítes' },
  { id: '13kdzMA6kJqJdEiZgtxacqsEogTqdoQhm', label: 'Tipo 03', area: '253m²', sub: '4 dorm / 3 suítes' },
  { id: '1RxvMPVCK-k95lKz8-jNb6aczB0IciCGv', label: 'Pavimento Lazer', area: '3º Pav', sub: 'Piscina · Deck · Academia' },
  { id: '1-paSD_GgaA7Hx4wfYah_rn20EZ9SDhdy', label: 'Garagem', area: '2º Pav', sub: '3 vagas / unidade' },
]

const faq = [
  { q: 'Qual o preço do Monte Leone?', a: 'Os valores variam por unidade e andar. Consulte Stiven Allan pelo WhatsApp para receber a tabela de vendas atualizada com todas as opções de pagamento.' },
  { q: 'Quais são as opções de planta?', a: 'Três tipologias: Tipo 01 (230m²), Tipo 02 (241m²) e Tipo 03 (253m²). Todas com 4 dormitórios, 3 suítes e 3 vagas de garagem.' },
  { q: 'Onde fica o Monte Leone?', a: 'No Centro de Criciuma/SC, Rua Conselheiro Joao Zancan, 193. Ponto mais alto do centro, com vista permanente para a Serra catarinense.' },
  { q: 'Qual o prazo de entrega?', a: 'Empreendimento em lançamento. Consulte o corretor Stiven Allan para informações atualizadas sobre cronograma de obras e entrega.' },
  { q: 'Como visitar o stand?', a: 'Entre em contato via WhatsApp com Stiven Allan (CRECI/RS 60.275). Ele agenda uma apresentação completa do empreendimento.' },
]

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'RealEstateListing', name: 'Monte Leone Residencial', description: 'Lançamento de alto padrão no Centro de Criciuma/SC. 4 dormitórios 3 suítes, 230-253m2, 3 vagas.', url: 'https://stivenallan.vercel.app/empreendimento/fontana/monte-leone-centro-criciuma-sc', address: { '@type': 'PostalAddress', streetAddress: 'Rua Conselheiro Joao Zancan, 193', addressLocality: 'Criciuma', addressRegion: 'SC', addressCountry: 'BR' }, offers: { '@type': 'Offer', priceCurrency: 'BRL', availability: 'https://schema.org/InStock' } },
    { '@type': 'RealEstateAgent', name: 'Stiven Allan', telephone: '+5548991642332', url: 'https://stivenallan.vercel.app' },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Início', item: 'https://stivenallan.vercel.app' }, { '@type': 'ListItem', position: 2, name: 'Lançamentos Criciúma', item: 'https://stivenallan.vercel.app/lancamentos/criciuma-sc' }, { '@type': 'ListItem', position: 3, name: 'Monte Leone Residencial' }] },
    { '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
}
export default function MonteLeone() {
  return (
    <>
      <style>{`
        .ml-card:hover { transform: translateY(-2px); border-color: #FF6A3D !important; transition: transform .22s ease, border-color .22s ease; }
        .ml-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,106,61,0.35); }
        .ml-img:hover { transform: scale(1.03); }
        details[open] summary span.ml-plus { display: none; }
        details summary span.ml-minus { display: none; }
        details[open] summary span.ml-minus { display: inline; }
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* URGENCY BAR */}
      <div style={{ background: c.bronze, color: '#fff', textAlign: 'center', padding: '10px 20px', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', position: 'sticky', top: 0, zIndex: 50 }}>
        LANÇAMENTO — Unidades limitadas.&nbsp;
        <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>Falar com corretor agora →</a>
      </div>

      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" style={{ background: c.charcoal, borderBottom: `1px solid ${c.lineDark}`, padding: '12px 5%' }}>
        <ol style={{ display: 'flex', gap: 8, listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap' }}>
          <li><a href="/" style={{ color: c.onDarkMuted, fontSize: 13, textDecoration: 'none' }}>Início</a></li>
          <li style={{ color: c.onDarkMuted }}>›</li>
          <li><a href="/lancamentos/criciuma-sc" style={{ color: c.onDarkMuted, fontSize: 13, textDecoration: 'none' }}>Lançamentos Criciúma</a></li>
          <li style={{ color: c.onDarkMuted }}>›</li>
          <li style={{ color: c.bronze, fontSize: 13, fontWeight: 600 }}>Monte Leone Residencial</li>
        </ol>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden', background: c.charcoal }}>
        <Image src={`https://lh3.googleusercontent.com/d/${galeria[1].id}`} alt="Monte Leone Residencial - Fachada" fill priority style={{ objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.55)' }} sizes="100vw" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(19,18,17,0.2) 0%, rgba(19,18,17,0.1) 40%, rgba(19,18,17,0.8) 75%, rgba(19,18,17,0.97) 100%)' }} />
        <div style={{ position: 'absolute', top: 32, left: 32, display: 'flex', gap: 10, flexWrap: 'wrap', zIndex: 10 }}>
          <span style={{ background: c.bronze, color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '2px', padding: '6px 14px', borderRadius: 2, textTransform: 'uppercase' }}>Lançamento</span>
          <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', padding: '6px 14px', borderRadius: 2, textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.2)' }}>Construtora Fontana</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '0 5% 60px', maxWidth: 900 }}>
          <p style={{ color: c.bronze, fontSize: 13, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Centro · Criciuma/SC</p>
          <h1 style={{ fontFamily: font.display, color: c.onDark, fontSize: 'clamp(3rem, 8vw, 7rem)', fontWeight: 900, lineHeight: 1, margin: '0 0 8px', letterSpacing: '-0.025em' }}>Monte Leone</h1>
          <h2 style={{ fontFamily: font.display, color: c.orange, fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', fontWeight: 300, lineHeight: 1, margin: '0 0 32px', letterSpacing: '-0.015em', fontStyle: 'italic' }}>Residencial</h2>
          <p style={{ color: c.onDarkMuted, fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: 560, lineHeight: 1.6, marginBottom: 40 }}>O ponto mais alto do Centro. Vista permanente para a Serra. 4 dormitórios, 230–253m², piscina climatizada.</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="ml-cta" style={{ ...ui.btnConvert, minHeight: 48 }}>Quero conhecer →</a>
            <a href="#galeria" style={{ background: 'transparent', color: '#fff', padding: '16px 36px', fontWeight: 600, fontSize: 15, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 2, minHeight: 48, display: 'inline-flex', alignItems: 'center' }}>Ver fotos</a>
          </div>
          <div style={{ display: 'flex', gap: 0, borderTop: `1px solid ${c.lineDark}`, paddingTop: 24 }}>
            {[['4','Dormitórios'],['3','Suítes'],['253m²','Até'],['3','Vagas']].map(([v, l], i) => (
              <div key={i} style={{ flex: 1, borderRight: i < 3 ? `1px solid ${c.lineDark}` : 'none', paddingRight: 24, marginRight: 24 }}>
                <div style={{ fontFamily: font.display, color: c.orange, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, lineHeight: 1 }}>{v}</div>
                <div style={{ color: c.onDarkMuted, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" style={{ background: c.charcoal, padding: '4px 0' }}>
        <div style={{ overflowX: 'auto', display: 'flex', gap: 4, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          {galeria.map((item, i) => (
            <div key={i} className="ml-img" style={{ flex: '0 0 auto', width: 'clamp(280px, 33vw, 440px)', height: 'clamp(200px, 25vw, 320px)', position: 'relative', scrollSnapAlign: 'start', overflow: 'hidden', flexShrink: 0 }}>
              <Image src={`https://lh3.googleusercontent.com/d/${item.id}`} alt={item.label} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 280px, 440px" loading={i < 3 ? 'eager' : 'lazy'} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '32px 16px 12px' }}>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* CONCEITO */}
      <section style={{ background: c.paper, padding: '100px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ ...ui.eyebrow, marginBottom: 24 }}>O Empreendimento</div>
            <h2 style={{ ...ui.h2, color: c.ink, marginBottom: 28 }}>Magnífico<br /><span style={{ color: c.bronze, fontStyle: 'italic', fontWeight: 300 }}>por essência.</span></h2>
            <p style={{ fontSize: 17, color: c.muted, lineHeight: 1.8, marginBottom: 20 }}>No ponto mais alto do Centro de Criciuma, o Monte Leone Residencial ergue-se como símbolo de exclusividade. Vista permanente para a Serra catarinense, arquitetura assinada e acabamentos de alto padrão.</p>
            <p style={{ fontSize: 17, color: c.muted, lineHeight: 1.8, marginBottom: 36 }}>Piscina climatizada, academia completa e áreas de convivência que transformam cada dia em experiência premium.</p>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="ml-cta" style={{ ...ui.btnConvert, minHeight: 48 }}>Agendar visita</a>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 4, overflow: 'hidden', position: 'relative', aspectRatio: '4/5', width: '100%' }}>
              <Image src={`https://lh3.googleusercontent.com/d/${galeria[2].id}`} alt="Piscina climatizada Monte Leone" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 50vw" loading="lazy" />
            </div>
            <div style={{ position: 'absolute', bottom: -24, left: -24, background: c.bronze, padding: '20px 24px', borderRadius: 2 }}>
              <div style={{ fontFamily: font.display, fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>253m²</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>até (Tipo Plus)</div>
            </div>
          </div>
        </div>
      </section>

      {/* SIMULADOR */}
      <section style={{ background: c.surface, padding: '64px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ ...ui.eyebrow, marginBottom: 10 }}>Simulação de Financiamento</div>
            <h2 style={{ ...ui.h2, color: c.ink, margin: 0 }}>Calcule sua parcela</h2>
          </div>
          <Simulador valorInicial={1200000} valorMin={900000} valorMax={1800000} hrefReserva={WPP} />
        </div>
      </section>

      {/* PLANTAS */}
      <section id="plantas" style={{ background: c.paper, padding: '100px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ ...ui.eyebrow, marginBottom: 16 }}>Plantas e Tipologias</div>
          <h2 style={{ ...ui.h2, color: c.ink, marginBottom: 48 }}>Escolha seu apartamento ideal</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 3 }}>
            {plantas.map((p, i) => (
              <div key={i} className="ml-card" style={{ ...ui.card, overflow: 'hidden', borderRadius: 3, border: `1px solid ${c.line}` }}>
                <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#fff', position: 'relative' }}>
                  <Image src={`https://lh3.googleusercontent.com/d/${p.id}`} alt={`Planta ${p.label} Monte Leone`} fill style={{ objectFit: 'contain', padding: '16px' }} sizes="(max-width: 768px) 100vw, 400px" loading="lazy" />
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontFamily: font.display, color: c.ink, fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>{p.label}</h3>
                      <p style={{ color: c.muted, fontSize: 13, margin: 0 }}>{p.sub}</p>
                    </div>
                    <span style={{ background: c.bronze, color: '#fff', padding: '6px 14px', fontSize: 14, fontWeight: 800, borderRadius: 2 }}>{p.area}</span>
                  </div>
                  <a href={WPP} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', marginTop: 16, color: c.bronze, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Consultar preço desta planta →</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* DIFERENCIAIS */}
      <section style={{ background: c.surface, padding: '100px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 80, alignItems: 'start' }}>
          <div>
            <div style={{ ...ui.eyebrow, marginBottom: 16 }}>Infraestrutura</div>
            <h2 style={{ ...ui.h2, color: c.ink, marginBottom: 40 }}>Lazer e Diferenciais</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {['Piscina climatizada','Deck com solarium','Academia interna','Academia externa','Área gourmet','Salão de festas','Sala de jogos','Brinquedoteca','Playground','Lounge social','Hall privativo','3 vagas garagem'].map((label, i) => (
                <div key={i} style={{ padding: '14px 0', borderBottom: `1px solid ${c.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: c.bronze, fontWeight: 700 }}>—</span>
                  <span style={{ color: c.ink, fontSize: 14 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {[
              { id: '1IbZsHWqT55sQy3vnEOC6EN60LUrj4DFt', alt: 'Área Gourmet' },
              { id: '1DwD8l2Fuz6jykw4S_b_oF1nubJAeUBBo', alt: 'Salão de Festas' },
              { id: '1lLgmjXGMcEdJC4FimZ0lGZIklAnd1EVH', alt: 'Sala de Jogos' },
              { id: '1_qP-mJQKB049pBC33kGxrQQHQjJTzvhE', alt: 'Academia' },
            ].map((img, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', borderRadius: 3 }}>
                <Image src={`https://lh3.googleusercontent.com/d/${img.id}`} alt={img.alt} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 50vw, 300px" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACABAMENTOS */}
      <section style={{ background: c.paper, padding: '100px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 80, alignItems: 'center' }}>
          <div style={{ borderRadius: 4, overflow: 'hidden', position: 'relative', aspectRatio: '4/5', width: '100%' }}>
            <Image src={`https://lh3.googleusercontent.com/d/${galeria[5].id}`} alt="Suíte Master Monte Leone" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 50vw" loading="lazy" />
          </div>
          <div>
            <div style={{ ...ui.eyebrow, marginBottom: 16 }}>Qualidade</div>
            <h2 style={{ ...ui.h2, color: c.ink, marginBottom: 12 }}>Acabamentos Premium</h2>
            <p style={{ color: c.muted, fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>Cada detalhe projetado para um nível de vida superior.</p>
            {['Porcelanato retificado nas áreas sociais','Cozinha com armários planejados','Bancadas em granito ou quartzo','Suítes com closet integrado','Banheiros com louças de alto padrão','Varanda com esquadria de alumínio','Ar-condicionado pré-instalado','Tomadas USB em todos os ambientes','Interfone digital com vídeo','Elevadores de última geração','Gerador para áreas comuns','Sistema de segurança 24h'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: `1px solid ${c.line}` }}>
                <span style={{ color: c.bronze, fontWeight: 700, fontSize: 16, flexShrink: 0 }}>✓</span>
                <span style={{ color: c.ink, fontSize: 14 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* LOCALIZAÇÃO */}
      <section style={{ background: c.surface, padding: '100px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ ...ui.eyebrow, marginBottom: 16 }}>Onde fica</div>
          <h2 style={{ ...ui.h2, color: c.ink, marginBottom: 48 }}>Localização privilegiada</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
            <div>
              <p style={{ color: c.muted, fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}><strong style={{ color: c.ink }}>Rua Conselheiro Joao Zancan, 193</strong><br />Centro · Criciuma/SC</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                {[['5 min','Shopping Della'],['5 min','Hospital São José'],['8 min','UNESC'],['10 min','Rodoviária'],['10 min','Fórum'],['15 min','Aeroporto Diomício Freitas']].map(([t, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ background: c.bronze, color: '#fff', padding: '4px 10px', fontSize: 12, fontWeight: 700, flexShrink: 0, borderRadius: 2 }}>{t}</span>
                    <span style={{ color: c.ink, fontSize: 14 }}>{l}</span>
                  </div>
                ))}
              </div>
              <a href="https://maps.google.com/?q=Rua+Conselheiro+Joao+Zancan+193+Criciuma+SC" target="_blank" rel="noopener noreferrer"
                style={{ color: c.bronze, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Abrir no Google Maps →</a>
            </div>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3535.5!2d-49.3712!3d-28.6803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDQwJzQ5LjEiUyA0OcKwMjInMTYuMyJX!5e0!3m2!1spt-BR!2sbr!4v1234567890" width="100%" height="360" style={{ border: 0, display: 'block', borderRadius: 4 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Localização Monte Leone Criciuma" />
          </div>
        </div>
      </section>

      {/* CORRETOR */}
      <section style={{ background: c.charcoal, padding: '80px 5%' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0, width: 100, height: 100, borderRadius: '50%', background: 'rgba(210,78,34,0.15)', border: `3px solid ${c.bronze}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: c.bronze }}>SA</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ ...ui.eyebrow, marginBottom: 8 }}>Seu Corretor</div>
            <h3 style={{ fontFamily: font.display, color: c.onDark, fontSize: 28, fontWeight: 800, margin: '0 0 4px' }}>Stiven Allan</h3>
            <p style={{ color: c.onDarkMuted, fontSize: 14, marginBottom: 16 }}>CRECI/RS 60.275 · Especialista em Lançamentos · Criciuma/SC</p>
            <p style={{ color: c.onDarkMuted, fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>Corretor de imóveis especializado em lançamentos de construtoras na região de Criciuma. Atendimento personalizado, transparência e suporte completo.</p>
            <a href={WPP} target="_blank" rel="noopener noreferrer" className="ml-cta"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#25d366', color: '#fff', padding: '14px 28px', fontWeight: 700, fontSize: 14, textDecoration: 'none', borderRadius: 2, minHeight: 48 }}>Falar com Stiven no WhatsApp</a>
          </div>
        </div>
      </section>

      {/* CONTATO — tipologias diretas WPP */}
      <section id="contato" style={{ background: c.surface, padding: '100px 5%' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ ...ui.eyebrow, marginBottom: 16 }}>Solicite informações</div>
          <h2 style={{ ...ui.h2, color: c.ink, marginBottom: 16 }}>Quero saber mais sobre o Monte Leone</h2>
          <p style={{ color: c.muted, fontSize: 15, lineHeight: 1.7, marginBottom: 48 }}>Escolha a tipologia de interesse e fale diretamente com Stiven Allan pelo WhatsApp.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            {[
              ['Tipo 01 — 230m²', 'Ol%C3%A1%20Stiven!%20Tenho%20interesse%20no%20Monte%20Leone%20Tipo%2001%20(230m%C2%B2).'],
              ['Tipo 02 — 241m²', 'Ol%C3%A1%20Stiven!%20Tenho%20interesse%20no%20Monte%20Leone%20Tipo%2002%20(241m%C2%B2).'],
              ['Tipo 03 — 253m²', 'Ol%C3%A1%20Stiven!%20Tenho%20interesse%20no%20Monte%20Leone%20Tipo%2003%20(253m%C2%B2).'],
              ['Todas as opções', 'Ol%C3%A1%20Stiven!%20Tenho%20interesse%20no%20Monte%20Leone.%20Pode%20me%20enviar%20as%20opções%3F'],
            ].map(([label, msg], i) => (
              <a key={i} href={`https://api.whatsapp.com/send?phone=5548991642332&text=${msg}`} target="_blank" rel="noopener noreferrer" className="ml-card"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: i === 3 ? '#25d366' : c.paper, color: i === 3 ? '#fff' : c.ink, padding: '18px 24px', textDecoration: 'none', border: `1px solid ${i === 3 ? '#25d366' : c.line}`, borderRadius: 3, minHeight: 56 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{label}</span>
                <span style={{ color: i === 3 ? '#fff' : c.bronze, fontSize: 18 }}>→</span>
              </a>
            ))}
          </div>
          <p style={{ color: c.muted, fontSize: 12 }}>Stiven Allan — CRECI/RS 60.275</p>
        </div>
      </section>
      {/* FAQ */}
      <section style={{ background: c.paper, padding: '100px 5%' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ ...ui.eyebrow, marginBottom: 16 }}>Dúvidas frequentes</div>
          <h2 style={{ ...ui.h2, color: c.ink, marginBottom: 48 }}>Perguntas frequentes</h2>
          {faq.map((item, i) => (
            <details key={i} style={{ borderBottom: `1px solid ${c.line}` }}>
              <summary style={{ color: c.ink, fontSize: 16, fontWeight: 600, padding: '20px 0', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 44 }}>
                {item.q}<span style={{ color: c.bronze, fontSize: 20, flexShrink: 0, marginLeft: 16 }} className="ml-plus">+</span><span style={{ color: c.bronze, fontSize: 20, flexShrink: 0, marginLeft: 16 }} className="ml-minus">−</span>
              </summary>
              <p style={{ color: c.muted, fontSize: 15, lineHeight: 1.7, padding: '0 0 20px', margin: 0 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ position: 'relative', padding: '120px 5%', overflow: 'hidden', background: c.charcoal }}>
        <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <Image src={`https://lh3.googleusercontent.com/d/${galeria[3].id}`} alt="Monte Leone Criciuma vista aérea" fill style={{ objectFit: 'cover', filter: 'brightness(0.3)' }} sizes="100vw" loading="lazy" />
        </div>
        <div style={{ position: 'relative', zIndex: 3, maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ ...ui.eyebrow, marginBottom: 24 }}>Ainda tem dúvidas?</div>
          <h2 style={{ fontFamily: font.display, color: '#fff', fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900, margin: '0 0 24px', lineHeight: 1.1, letterSpacing: '-0.025em' }}>Monte Leone<br /><span style={{ color: c.orange, fontStyle: 'italic', fontWeight: 300 }}>está te esperando.</span></h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17, lineHeight: 1.7, marginBottom: 40 }}>Unidades limitadas. Fale agora com Stiven Allan e garanta sua reserva sem compromisso.</p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" className="ml-cta"
            style={{ display: 'inline-block', ...ui.btnConvert, fontSize: 18, minHeight: 56 }}>Falar com Stiven Allan agora</a>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 20 }}>CRECI/RS 60.275 · Atendimento via WhatsApp</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${c.line}`, padding: '32px 5%', textAlign: 'center', color: c.muted, fontSize: 13, background: c.paper }}>
        <p style={{ margin: 0 }}>Monte Leone Residencial · Fontana Construtora · Centro, Criciuma/SC</p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: c.muted }}>Consultor: Stiven Allan · CRECI/RS 60.275 · (48) 99164-2332</p>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: c.muted }}>As imagens são ilustrativas. Informações sujeitas a alterações sem aviso prévio.</p>
      </footer>

      {/* CTA STICKY MOBILE */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: c.charcoal, borderTop: `1px solid ${c.lineDark}`, padding: '12px 5%', display: 'flex', gap: 10 }} className="ml-mobile-cta">
        <style>{`.ml-mobile-cta { display: flex; } @media (min-width: 768px) { .ml-mobile-cta { display: none !important; } }`}</style>
        <a href={WPP} target="_blank" rel="noopener noreferrer"
          style={{ flex: 1, ...ui.btnConvert, borderRadius: 2, textAlign: 'center', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          Falar com Stiven
        </a>
        <a href="tel:+5548991642332"
          style={{ flex: 1, ...ui.btnPrimary, borderRadius: 2, textAlign: 'center', minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
          Ligar agora
        </a>
      </div>
    </>
  )
}
