import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WppFloat from '@/components/WppFloat'
import FeaturedProperties from '@/components/FeaturedProperties'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'
const WPP = 'https://wa.me/5548991642332'
const WPP_MSG = WPP + '?text=Ol%C3%A1+Stiven!+Vi+seu+site+e+gostaria+de+conhecer+os+lan%C3%A7amentos+dispon%C3%ADveis.'

export const metadata = {
  title: 'Stiven Allan — Corretor de Imóveis em Criciúma e Região | SC',
  description: 'Lançamentos e empreendimentos de construtoras em Criciúma, Içara, Nova Veneza, Forquilhinha e Cocal do Sul/SC. Atendimento premium. CRECI/RS 60.275.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'Stiven Allan — Corretor de Imóveis em Criciúma e Região | SC',
    description: 'Especialista em lançamentos imobiliários em Criciúma e região do Sul Catarinense. CRECI/RS 60.275.',
    url: SITE_URL,
    siteName: 'Stiven Allan Corretor',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', width: 1200, height: 630, alt: 'Stiven Allan — Corretor de Imóveis em Criciúma SC' }],
  },
}

const CIDADES = [
  { nome: 'Criciúma', slug: 'criciuma-sc', uf: 'SC' },
  { nome: 'Içara', slug: 'icara-sc', uf: 'SC' },
  { nome: 'Nova Veneza', slug: 'nova-veneza-sc', uf: 'SC' },
  { nome: 'Forquilhinha', slug: 'forquilhinha-sc', uf: 'SC' },
  { nome: 'Cocal do Sul', slug: 'cocal-do-sul-sc', uf: 'SC' },
]

const BAIRROS = ['Centro', 'Próspera', 'Michel', 'Pio Corrêa', 'Comerciário', 'Santa Luzia', 'Universitário', 'Içara', 'Nova Veneza', 'Forquilhinha', 'Cocal do Sul']

const C = {
  bg: '#0e0f11', bg2: '#161719', card: '#1c1e22',
  accent: '#c9a24b', accent2: '#e2c275', green: '#1f9d55',
  text: '#f4f4f4', muted: '#8a9099', border: '#252830',
}

const schemaOrg = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'RealEstateAgent',
      name: 'Stiven Allan',
      description: 'Corretor de imóveis especializado em lançamentos e empreendimentos de construtoras em Criciúma/SC e região. CRECI/RS 60.275.',
      url: SITE_URL,
      telephone: '+5548991642332',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      address: { '@type': 'PostalAddress', addressLocality: 'Criciúma', addressRegion: 'SC', addressCountry: 'BR' },
      areaServed: ['Criciúma', 'Içara', 'Nova Veneza', 'Forquilhinha', 'Cocal do Sul'],
      hasCredential: 'CRECI/RS 60.275',
    },
    {
      '@type': 'WebSite',
      name: 'Stiven Allan Corretor',
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: SITE_URL + '/lancamentos/criciuma-sc?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />
      <style>{`
        * { box-sizing: border-box; }
        .hero-search-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;
          gap: 10px;
        }
        @media (max-width: 640px) {
          .hero-search-grid { grid-template-columns: 1fr 1fr; }
          .hero-search-btn { grid-column: span 2; }
        }
        .cidades-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }
        @media (max-width: 900px) { .cidades-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 500px) { .cidades-grid { grid-template-columns: repeat(2, 1fr); } }
        .sobre-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
        }
        @media (max-width: 800px) {
          .sobre-grid { grid-template-columns: 1fr; gap: 36px; }
          .sobre-foto { height: 300px !important; }
        }
        .cidade-card:hover {
          border-color: #c9a24b !important;
          background: #1c1e22 !important;
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.35);
        }
        .hero-select:focus {
          outline: none;
          border-color: #c9a24b !important;
        }
        .stat-card {
          text-align: center;
          padding: 20px 28px;
          border-radius: 20px;
          border: 1px solid rgba(201,162,75,0.15);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(10px);
        }
        .lead-form-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 18px;
          color: #f4f4f4;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .lead-form-input:focus {
          border-color: #c9a24b;
        }
        .lead-form-input::placeholder {
          color: #505560;
        }
        .lead-form-select {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 18px;
          color: #f4f4f4;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          cursor: pointer;
          -webkit-appearance: none;
        }
        .lead-form-select:focus {
          border-color: #c9a24b;
        }
        .divider-gold {
          height: 1px;
          background: linear-gradient(90deg, transparent, #c9a24b, transparent);
          opacity: 0.4;
        }
        @keyframes float-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-up { animation: float-up 0.7s ease forwards; }
        .animate-up-delay { animation: float-up 0.7s ease 0.15s forwards; opacity: 0; }
        .animate-up-delay2 { animation: float-up 0.7s ease 0.3s forwards; opacity: 0; }
      `}</style>
      <Header />

      {/* HERO */}
      <section style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        overflow: 'hidden',
      }}>
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85"
          alt="Lançamentos imobiliários de alto padrão em Criciúma SC"
          fill priority quality={85}
          style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
          sizes="100vw"
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(10,11,14,0.75) 0%, rgba(10,11,14,0.55) 40%, rgba(10,11,14,0.9) 100%)',
          zIndex: 1,
        }} />
        {/* Noise texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          opacity: 0.03,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }} />
        <div style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: '900px',
          margin: '0 auto', padding: '0 24px',
          textAlign: 'center',
        }}>
          <div className="animate-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(201,162,75,0.12)',
            border: '1px solid rgba(201,162,75,0.35)',
            borderRadius: '50px',
            padding: '6px 20px',
            marginBottom: '28px',
          }}>
            <div style={{ width: '6px', height: '6px', background: '#c9a24b', borderRadius: '50%', boxShadow: '0 0 8px #c9a24b' }} />
            <span style={{ color: '#c9a24b', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>
              CRECI/RS 60.275 · CRICIÚMA, SC
            </span>
          </div>

          <h1 className="animate-up-delay" style={{
            fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)',
            fontWeight: 900, lineHeight: 1.1,
            color: '#f4f4f4', marginBottom: '24px',
            letterSpacing: '-1px',
          }}>
            Lançamentos e Empreendimentos<br />
            <span style={{
              background: 'linear-gradient(90deg, #c9a24b, #e2c275, #c9a24b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>em Criciúma e Região</span>
          </h1>

          <p className="animate-up-delay2" style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: 'rgba(244,244,244,0.6)', marginBottom: '48px',
            maxWidth: '520px', margin: '0 auto 48px',
            lineHeight: 1.75, fontWeight: 400,
          }}>
            Das melhores construtoras do sul catarinense.<br />
            Curadoria premium do primeiro contato até a entrega das chaves.
          </p>

          <div style={{
            background: 'rgba(14,15,17,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '20px',
            maxWidth: '660px',
            margin: '0 auto',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          }}>
            <p style={{ color: '#505560', fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>
              BUSCA RÁPIDA
            </p>
            <div className="hero-search-grid">
              <select className="hero-select" style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#f4f4f4', padding: '12px 16px', borderRadius: '12px',
                fontSize: '14px', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s',
              }}>
                <option value="">Tipo de Imóvel</option>
                <option value="apartamento">Apartamento</option>
                <option value="cobertura">Cobertura</option>
                <option value="casa">Casa em Condomínio</option>
              </select>
              <select className="hero-select" style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#f4f4f4', padding: '12px 16px', borderRadius: '12px',
                fontSize: '14px', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s',
              }}>
                <option value="criciuma-sc">Cidade</option>
                <option value="criciuma-sc">Criciúma</option>
                <option value="icara-sc">Içara</option>
                <option value="nova-veneza-sc">Nova Veneza</option>
                <option value="forquilhinha-sc">Forquilhinha</option>
                <option value="cocal-do-sul-sc">Cocal do Sul</option>
              </select>
              <select className="hero-select" style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#f4f4f4', padding: '12px 16px', borderRadius: '12px',
                fontSize: '14px', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s',
              }}>
                <option value="">Dorm.</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
              <Link href="/lancamentos/criciuma-sc" className="hero-search-btn" style={{
                background: 'linear-gradient(135deg, #c9a24b, #e2c275)',
                color: '#1a1305',
                fontWeight: 800, padding: '12px 24px',
                borderRadius: '12px', fontSize: '14px',
                textDecoration: 'none', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                letterSpacing: '0.5px',
              }}>
                Buscar →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div style={{
        background: 'linear-gradient(90deg, #1a1305, #2a200a, #1a1305)',
        borderTop: '1px solid rgba(201,162,75,0.15)',
        borderBottom: '1px solid rgba(201,162,75,0.15)',
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: '960px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0',
        }}>
          {[
            { num: '+50', label: 'Empreendimentos', icon: '🏗️' },
            { num: '5★', label: 'Avaliação média', icon: '⭐' },
            { num: '8+', label: 'Anos de experiência', icon: '📅' },
            { num: '100%', label: 'Foco em lançamentos', icon: '🏆' },
          ].map((item, i) => (
            <div key={item.num} style={{
              textAlign: 'center',
              padding: '28px 16px',
              borderRight: i < 3 ? '1px solid rgba(201,162,75,0.1)' : 'none',
            }}>
              <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 900, color: '#c9a24b', lineHeight: 1, marginBottom: '6px', letterSpacing: '-1px' }}>
                {item.num}
              </span>
              <span style={{ display: 'block', fontSize: '11px', color: 'rgba(201,162,75,0.6)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* EMPREENDIMENTOS */}
      <section id="empreendimentos" style={{ padding: '100px 24px', background: C.bg }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div style={{ marginBottom: '64px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'rgba(201,162,75,0.08)',
              border: '1px solid rgba(201,162,75,0.2)',
              borderRadius: '50px', padding: '6px 18px',
              marginBottom: '20px',
            }}>
              <div style={{ width: '4px', height: '4px', background: '#c9a24b', borderRadius: '50%' }} />
              <span style={{ color: '#c9a24b', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>
                PORTFÓLIO SELECIONADO
              </span>
            </div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 900,
              color: C.text, marginBottom: '14px',
              letterSpacing: '-0.5px', lineHeight: 1.15,
            }}>
              Empreendimentos em <span style={{
                background: 'linear-gradient(90deg, #c9a24b, #e2c275)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Destaque</span>
            </h2>
            <p style={{ color: C.muted, fontSize: '1rem', maxWidth: '440px', margin: '0 auto', lineHeight: 1.7 }}>
              Lançamentos curados em Criciúma e região do Sul Catarinense
            </p>
          </div>
          <FeaturedProperties />
          <div style={{ textAlign: 'center', marginTop: '56px' }}>
            <Link href="/lancamentos/criciuma-sc" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              border: '1px solid rgba(201,162,75,0.4)',
              background: 'rgba(201,162,75,0.05)',
              color: '#c9a24b', fontWeight: 700,
              padding: '16px 40px', borderRadius: '50px',
              fontSize: '14px', textDecoration: 'none',
              letterSpacing: '0.5px',
              transition: 'background 0.2s, border-color 0.2s',
            }}>
              Ver todos os lançamentos
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>

      <div className="divider-gold" />

      {/* CAPTACAO DE LEADS PREMIUM */}
      <section style={{
        padding: '100px 24px',
        background: 'linear-gradient(180deg, #0e0f11 0%, #131006 50%, #0e0f11 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow dourado de fundo */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(201,162,75,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}>
            {/* LADO ESQUERDO: Texto */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(201,162,75,0.1)',
                border: '1px solid rgba(201,162,75,0.25)',
                borderRadius: '50px', padding: '6px 16px', marginBottom: '24px',
              }}>
                <div style={{ width: '6px', height: '6px', background: '#c9a24b', borderRadius: '50%', boxShadow: '0 0 6px #c9a24b' }} />
                <span style={{ color: '#c9a24b', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>
                  ACESSO EXCLUSIVO
                </span>
              </div>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                fontWeight: 900, lineHeight: 1.15,
                color: '#f4f4f4', marginBottom: '20px',
                letterSpacing: '-0.5px',
              }}>
                Receba os melhores<br />
                <span style={{
                  background: 'linear-gradient(90deg, #c9a24b, #e2c275)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>lançamentos em primeira mão</span>
              </h2>
              <p style={{ color: '#8a9099', fontSize: '15px', lineHeight: 1.8, marginBottom: '32px' }}>
                Cadastre-se e seja o primeiro a saber sobre novas oportunidades, condições exclusivas de lançamento e visitas VIP aos empreendimentos.
              </p>
              {/* Beneficios */}
              {[
                { icon: '🌟', text: 'Acesso antecipado aos melhores apartamentos' },
                { icon: '💰', text: 'Condições especiais de lançamento' },
                { icon: '🔑', text: 'Visitas VIP a empreendimentos exclusivos' },
                { icon: '📱', text: 'Atendimento personalizado via WhatsApp' },
              ].map((b) => (
                <div key={b.text} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  marginBottom: '12px',
                }}>
                  <span style={{ fontSize: '16px' }}>{b.icon}</span>
                  <span style={{ color: '#a7adb4', fontSize: '14px' }}>{b.text}</span>
                </div>
              ))}
            </div>
            {/* LADO DIREITO: Formulario */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '28px',
              padding: '40px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontWeight: 800, fontSize: '20px', color: '#f4f4f4', marginBottom: '6px' }}>
                  Quero receber lançamentos
                </h3>
                <p style={{ color: '#8a9099', fontSize: '13px' }}>
                  Preencha e entro em contato pelo WhatsApp
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  className="lead-form-input"
                  readOnly
                />
                <input
                  type="tel"
                  placeholder="(48) 9 0000-0000"
                  className="lead-form-input"
                  readOnly
                />
                <select className="lead-form-select">
                  <option value="">O que você procura?</option>
                  <option>Apartamento 1-2 dormós (até R$ 400k)</option>
                  <option>Apartamento 3-4 dormós (até R$ 700k)</option>
                  <option>Alto padrão / Cobertura (acima de R$ 700k)</option>
                  <option>Investimento / Renda</option>
                </select>
                <select className="lead-form-select">
                  <option value="">Cidade de interesse</option>
                  <option>Criciúma</option>
                  <option>Içara</option>
                  <option>Nova Veneza</option>
                  <option>Forquilhinha</option>
                </select>
                <a
                  href={WPP_MSG}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    background: 'linear-gradient(135deg, #c9a24b 0%, #e2c275 100%)',
                    color: '#1a1305', fontWeight: 800,
                    padding: '16px', borderRadius: '12px',
                    fontSize: '15px', textDecoration: 'none',
                    letterSpacing: '0.3px',
                    boxShadow: '0 8px 30px rgba(201,162,75,0.3)',
                    marginTop: '6px',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Quero ser avisado pelo WhatsApp
                </a>
                <p style={{ color: '#505560', fontSize: '11px', textAlign: 'center', lineHeight: 1.6 }}>
                  Sem spam. Atendimento humano e personalizado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider-gold" />

      {/* ONDE ATUO */}
      <section style={{ padding: '100px 24px', background: C.bg2 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '60px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'rgba(201,162,75,0.08)',
              border: '1px solid rgba(201,162,75,0.2)',
              borderRadius: '50px', padding: '6px 18px', marginBottom: '20px',
            }}>
              <div style={{ width: '4px', height: '4px', background: '#c9a24b', borderRadius: '50%' }} />
              <span style={{ color: '#c9a24b', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>
                COBERTURA
              </span>
            </div>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900,
              color: C.text, marginBottom: '12px', letterSpacing: '-0.3px',
            }}>
              Onde eu <span style={{
                background: 'linear-gradient(90deg, #c9a24b, #e2c275)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>atuo</span>
            </h2>
            <p style={{ color: C.muted, fontSize: '1rem', lineHeight: 1.7 }}>
              Criciúma e cidades vizinhas do Sul Catarinense
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '48px' }}>
            {BAIRROS.map((b) => (
              <span key={b} style={{
                background: C.card, border: '1px solid rgba(255,255,255,0.06)',
                color: '#7a8290', padding: '8px 18px',
                borderRadius: '50px', fontSize: '12px', fontWeight: 500,
              }}>{b}</span>
            ))}
          </div>
          <div className="cidades-grid">
            {CIDADES.map((c) => (
              <Link key={c.slug} href={`/lancamentos/${c.slug}`} className="cidade-card" style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '18px', padding: '24px 16px',
                textAlign: 'center', textDecoration: 'none',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '10px',
                transition: 'all 0.25s ease',
              }}>
                <div style={{
                  width: '40px', height: '40px',
                  background: 'rgba(201,162,75,0.1)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a24b" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <span style={{ fontWeight: 700, fontSize: '14px', color: C.text }}>{c.nome}</span>
                <span style={{ fontSize: '10px', color: C.muted, fontWeight: 700, letterSpacing: '2px' }}>{c.uf}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-gold" />

      {/* SOBRE */}
      <section id="sobre" style={{ padding: '100px 24px', background: C.bg }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="sobre-grid">
            <div className="sobre-foto" style={{
              position: 'relative', height: '540px',
              borderRadius: '24px', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
            }}>
              <Image
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=85"
                alt="Stiven Allan, corretor de imóveis em Criciúma SC"
                fill
                style={{ objectFit: 'cover', objectPosition: 'top center' }}
                sizes="(max-width: 800px) 100vw, 50vw"
              />
              {/* Overlay dourado sutil */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(0deg, rgba(10,10,12,0.6) 0%, transparent 50%)',
              }} />
              <div style={{
                position: 'absolute', bottom: '24px', left: '24px', right: '24px',
                background: 'rgba(10,10,12,0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(201,162,75,0.3)',
                borderRadius: '16px', padding: '16px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ color: '#c9a24b', fontWeight: 800, fontSize: '15px', marginBottom: '2px' }}>Stiven Allan</p>
                  <p style={{ color: '#8a9099', fontSize: '11px', letterSpacing: '1px' }}>Corretor de Imóveis</p>
                </div>
                <div style={{
                  background: 'rgba(201,162,75,0.15)',
                  border: '1px solid rgba(201,162,75,0.3)',
                  borderRadius: '10px', padding: '8px 14px',
                }}>
                  <p style={{ color: '#c9a24b', fontWeight: 700, fontSize: '12px', letterSpacing: '1px' }}>CRECI/RS 60.275</p>
                </div>
              </div>
            </div>

            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(201,162,75,0.08)',
                border: '1px solid rgba(201,162,75,0.2)',
                borderRadius: '50px', padding: '6px 16px', marginBottom: '24px',
              }}>
                <div style={{ width: '4px', height: '4px', background: '#c9a24b', borderRadius: '50%' }} />
                <span style={{ color: '#c9a24b', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>
                  SOBRE MIM
                </span>
              </div>
              <h2 style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', fontWeight: 900,
                marginBottom: '20px', color: '#f4f4f4', lineHeight: 1.2,
                letterSpacing: '-0.5px',
              }}>
                Olá, eu sou o{' '}
                <span style={{
                  background: 'linear-gradient(90deg, #c9a24b, #e2c275)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Stiven Allan</span>
              </h2>
              <p style={{ color: '#8a9099', marginBottom: '16px', lineHeight: 1.8, fontSize: '15px' }}>
                Corretor de imóveis com atuação em Criciúma e região do extremo sul catarinense. Especializado nos principais lançamentos e construtoras da região.
              </p>
              <p style={{ color: '#8a9099', marginBottom: '40px', lineHeight: 1.8, fontSize: '15px' }}>
                Seja para morar ou investir, ofereço curadoria premium e acompanhamento do primeiro contato até a entrega das chaves.
              </p>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px', marginBottom: '40px',
              }}>
                {[
                  { num: '+50', label: 'Empreendimentos' },
                  { num: '5★', label: 'Avaliação' },
                  { num: '8+', label: 'Anos' },
                ].map((s) => (
                  <div key={s.num} style={{
                    background: 'rgba(201,162,75,0.06)',
                    border: '1px solid rgba(201,162,75,0.15)',
                    borderRadius: '16px', padding: '20px 16px',
                    textAlign: 'center',
                  }}>
                    <b style={{ display: 'block', fontSize: '1.8rem', fontWeight: 900, color: '#c9a24b', lineHeight: 1, letterSpacing: '-1px' }}>{s.num}</b>
                    <small style={{ color: '#8a9099', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>{s.label}</small>
                  </div>
                ))}
              </div>
              <a href={WPP_MSG} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: '#1f9d55', color: '#fff',
                fontWeight: 700, padding: '16px 32px',
                borderRadius: '50px', fontSize: '15px',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(31,157,85,0.3)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="contato" style={{
        padding: '100px 24px',
        background: 'linear-gradient(180deg, #161719 0%, #0e0f11 100%)',
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '32px', padding: '64px 48px',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
          }}>
            <div style={{
              position: 'absolute', top: '-60px', right: '-60px',
              width: '200px', height: '200px',
              background: 'radial-gradient(circle, rgba(201,162,75,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              width: '64px', height: '64px', margin: '0 auto 28px',
              background: 'linear-gradient(135deg, #c9a24b, #e2c275)',
              borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(201,162,75,0.4)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#1a1305">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900,
              marginBottom: '16px', color: '#f4f4f4', letterSpacing: '-0.5px',
            }}>
              Vamos encontrar o seu imóvel ideal?
            </h2>
            <p style={{ color: '#8a9099', marginBottom: '36px', fontSize: '15px', lineHeight: 1.75, maxWidth: '400px', margin: '0 auto 36px' }}>
              Fale comigo agora pelo WhatsApp. Resposta rápida, sem enrolação e sem compromisso.
            </p>
            <a
              href={WPP_MSG}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '12px',
                background: '#1f9d55', color: '#fff',
                fontWeight: 800, fontSize: '16px',
                padding: '18px 48px', borderRadius: '50px',
                textDecoration: 'none',
                boxShadow: '0 12px 36px rgba(31,157,85,0.35)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <WppFloat />
    </>
  )
}
