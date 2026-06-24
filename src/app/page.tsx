import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WppFloat from '@/components/WppFloat'
import FeaturedProperties from '@/components/FeaturedProperties'

export const metadata = {
  title: 'Stiven Allan — Corretor de Imóveis em Criciúma e Região | SC',
  description: 'Lançamentos e empreendimentos de construtoras em Criciúma, Içara, Nova Veneza, Forquilhinha e Cocal do Sul/SC. CRECI/RS 60.275.',
  alternates: { canonical: 'https://stivenallan.com.br' },
}

const CIDADES = [
  { nome: 'Criciúma', slug: 'criciuma-sc', uf: 'SC' },
  { nome: 'Içara', slug: 'icara-sc', uf: 'SC' },
  { nome: 'Nova Veneza', slug: 'nova-veneza-sc', uf: 'SC' },
  { nome: 'Forquilhinha', slug: 'forquilhinha-sc', uf: 'SC' },
  { nome: 'Cocal do Sul', slug: 'cocal-do-sul-sc', uf: 'SC' },
]

const BAIRROS = ['Centro','Próspera','Michel','Pio Corrêa','Comerciário','Santa Luzia','Universitário','Içara','Nova Veneza','Forquilhinha','Cocal do Sul']

// Paleta de cores
const C = {
  bg: '#121315',
  bg2: '#1a1c1f',
  card: '#202327',
  accent: '#c9a24b',
  accent2: '#e2c275',
  green: '#1f9d55',
  greenHover: '#17854a',
  text: '#f4f4f4',
  muted: '#a7adb4',
  border: '#2c3035',
}

export default function HomePage() {
  return (
    <>
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        overflow: 'hidden',
      }}>
        <Image
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80"
          alt="Lançamentos imobiliários em Criciúma SC"
          fill
          priority
          quality={85}
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          sizes="100vw"
        />
        {/* Overlay escuro */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(10,11,13,0.82) 0%, rgba(10,11,13,0.65) 50%, rgba(10,11,13,0.88) 100%)',
          zIndex: 1,
        }} />
        {/* Conteúdo hero */}
        <div style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: '900px',
          margin: '0 auto', padding: '0 24px',
          textAlign: 'center',
        }}>
          <p style={{
            color: C.accent, fontSize: '11px', fontWeight: 700,
            letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '20px',
          }}>CRECI/RS 60.275 · Criciúma, SC</p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.75rem)',
            fontWeight: 900, lineHeight: 1.15,
            color: C.text, marginBottom: '20px',
          }}>
            Lançamentos e Empreendimentos<br />
            <span style={{ color: C.accent2 }}>em Criciúma e Região</span>
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'rgba(244,244,244,0.75)', marginBottom: '44px',
            maxWidth: '600px', margin: '0 auto 44px',
            lineHeight: 1.7,
          }}>
            Das melhores construtoras do sul catarinense.<br />
            Atendimento premium do primeiro contato até a entrega das chaves.
          </p>

          {/* Busca rápida */}
          <div style={{
            background: 'rgba(26,28,31,0.92)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${C.border}`,
            borderRadius: '20px',
            padding: '20px',
            maxWidth: '680px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr auto',
            gap: '12px',
          }}>
            <select style={{
              background: C.bg, border: `1px solid ${C.border}`,
              color: C.text, padding: '12px 16px', borderRadius: '12px',
              fontSize: '14px', outline: 'none', cursor: 'pointer',
            }}>
              <option>Tipo de Imóvel</option>
              <option>Apartamento</option>
              <option>Casa</option>
              <option>Cobertura</option>
            </select>
            <select style={{
              background: C.bg, border: `1px solid ${C.border}`,
              color: C.text, padding: '12px 16px', borderRadius: '12px',
              fontSize: '14px', outline: 'none', cursor: 'pointer',
            }}>
              <option>Cidade</option>
              <option>Criciúma</option>
              <option>Içara</option>
              <option>Nova Veneza</option>
              <option>Forquilhinha</option>
            </select>
            <select style={{
              background: C.bg, border: `1px solid ${C.border}`,
              color: C.text, padding: '12px 16px', borderRadius: '12px',
              fontSize: '14px', outline: 'none', cursor: 'pointer',
            }}>
              <option>Dorm.</option>
              <option>1+</option><option>2+</option>
              <option>3+</option><option>4+</option>
            </select>
            <Link href="/lancamentos/criciuma-sc" style={{
              background: C.green, color: '#fff',
              fontWeight: 700, padding: '12px 24px',
              borderRadius: '12px', fontSize: '14px',
              textDecoration: 'none', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              Buscar →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CREDENCIAIS BAR ───────────────────────────────────────────── */}
      <div style={{
        background: C.accent,
        padding: '16px 24px',
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'center',
          gap: '32px',
        }}>
          {[
            { num: '+50', label: 'Empreendimentos' },
            { num: '5★', label: 'Avaliação média' },
            { num: '8+', label: 'Anos de experiência' },
            { num: '100%', label: 'Foco em lançamentos' },
          ].map((item) => (
            <div key={item.num} style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: 900, color: '#1a1305' }}>{item.num}</span>
              <span style={{ display: 'block', fontSize: '12px', color: '#1a1305', opacity: 0.8, fontWeight: 600 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── EMPREENDIMENTOS ───────────────────────────────────────────── */}
      <section id="empreendimentos" style={{ padding: '80px 24px', background: C.bg }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{
            textAlign: 'center', color: C.accent,
            fontSize: '11px', fontWeight: 700,
            letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px',
          }}>PORTFÓLIO</p>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900,
            textAlign: 'center', marginBottom: '12px', color: C.text,
          }}>
            Empreendimentos em <span style={{ color: C.accent }}>Destaque</span>
          </h2>
          <p style={{ textAlign: 'center', color: C.muted, marginBottom: '56px', fontSize: '1.05rem' }}>
            Lançamentos selecionados em Criciúma e região
          </p>
          <FeaturedProperties />
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link href="/lancamentos/criciuma-sc" style={{
              display: 'inline-block',
              border: `2px solid ${C.accent}`,
              color: C.accent, fontWeight: 700,
              padding: '14px 36px', borderRadius: '50px',
              fontSize: '15px', textDecoration: 'none',
              letterSpacing: '0.5px',
            }}>
              Ver todos os lançamentos em Criciúma →
            </Link>
          </div>
        </div>
      </section>

      {/* ── ONDE ATUO ─────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: C.bg2 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{
            textAlign: 'center', color: C.accent,
            fontSize: '11px', fontWeight: 700,
            letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px',
          }}>COBERTURA</p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900,
            textAlign: 'center', marginBottom: '12px', color: C.text,
          }}>
            Onde eu <span style={{ color: C.accent }}>atuo</span>
          </h2>
          <p style={{ textAlign: 'center', color: C.muted, marginBottom: '44px', fontSize: '1rem' }}>
            Criciúma e cidades vizinhas do Sul Catarinense
          </p>

          {/* Bairros pills */}
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'center', gap: '10px', marginBottom: '44px',
          }}>
            {BAIRROS.map((b) => (
              <span key={b} style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                color: C.muted,
                padding: '8px 20px',
                borderRadius: '50px',
                fontSize: '13px',
                cursor: 'pointer',
              }}>
                {b}
              </span>
            ))}
          </div>

          {/* Cidades grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '16px',
          }}>
            {CIDADES.map((c) => (
              <Link key={c.slug} href={`/lancamentos/${c.slug}`} style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: '16px',
                padding: '20px 16px',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span style={{ fontWeight: 700, fontSize: '14px', color: C.text }}>{c.nome}</span>
                <span style={{ fontSize: '11px', color: C.muted, fontWeight: 600, letterSpacing: '2px' }}>{c.uf}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE ─────────────────────────────────────────────────────── */}
      <section id="sobre" style={{ padding: '80px 24px', background: C.bg }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
          }}>
            {/* Foto */}
            <div style={{
              position: 'relative', height: '480px',
              borderRadius: '20px', overflow: 'hidden',
              border: `1px solid ${C.border}`,
            }}>
              <Image
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
                alt="Stiven Allan, corretor de imóveis em Criciúma SC"
                fill
                style={{ objectFit: 'cover', objectPosition: 'top center' }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Tag dourada sobre foto */}
              <div style={{
                position: 'absolute', bottom: '20px', left: '20px',
                background: 'rgba(18,19,21,0.92)',
                border: `1px solid ${C.accent}`,
                borderRadius: '12px', padding: '10px 18px',
              }}>
                <span style={{ color: C.accent, fontWeight: 800, fontSize: '14px' }}>CRECI/RS 60.275</span>
              </div>
            </div>
            {/* Texto */}
            <div>
              <p style={{
                color: C.accent, fontSize: '11px', fontWeight: 700,
                letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '14px',
              }}>SOBRE MIM</p>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900,
                marginBottom: '20px', color: C.text, lineHeight: 1.25,
              }}>
                Olá, eu sou o <span style={{ color: C.accent }}>Stiven Allan</span>
              </h2>
              <p style={{ color: C.muted, marginBottom: '16px', lineHeight: 1.75, fontSize: '15px' }}>
                Corretor de imóveis com atuação em Criciúma e região do extremo sul catarinense. Especializado nos principais lançamentos e construtoras da região.
              </p>
              <p style={{ color: C.muted, marginBottom: '36px', lineHeight: 1.75, fontSize: '15px' }}>
                Seja para morar ou investir, ofereço curadoria premium e acompanhamento do primeiro contato até a entrega das chaves.
              </p>
              {/* Stats */}
              <div style={{ display: 'flex', gap: '32px', marginBottom: '36px' }}>
                {[
                  { num: '+50', label: 'Empreendimentos' },
                  { num: '5★', label: 'Atendimento' },
                  { num: '8+', label: 'Anos' },
                ].map((s) => (
                  <div key={s.num}>
                    <b style={{ display: 'block', fontSize: '2rem', fontWeight: 900, color: C.accent2, lineHeight: 1 }}>{s.num}</b>
                    <small style={{ color: C.muted, fontSize: '12px' }}>{s.label}</small>
                  </div>
                ))}
              </div>
              <a
                href="https://wa.me/5548991642332"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  background: C.green, color: '#fff',
                  fontWeight: 700, padding: '14px 32px',
                  borderRadius: '50px', fontSize: '15px',
                  textDecoration: 'none',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────── */}
      <section id="contato" style={{ padding: '80px 24px', background: C.bg2 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: `linear-gradient(135deg, ${C.bg2} 0%, #2a2419 100%)`,
            border: `1px solid ${C.border}`,
            borderRadius: '24px', padding: '60px 40px',
          }}>
            <div style={{
              width: '56px', height: '56px', margin: '0 auto 24px',
              background: C.accent, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#1a1305">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900,
              marginBottom: '16px', color: C.text,
            }}>
              Vamos encontrar seu imóvel ideal?
            </h2>
            <p style={{ color: C.muted, marginBottom: '36px', fontSize: '15px', lineHeight: 1.7 }}>
              Fale comigo agora pelo WhatsApp. Resposta rápida e sem compromisso.
            </p>
            <a
              href="https://wa.me/5548991642332?text=Ol%C3%A1+Stiven!+Vi+seu+site+e+quero+saber+mais."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: C.green, color: '#fff',
                fontWeight: 700, fontSize: '17px',
                padding: '16px 44px', borderRadius: '50px',
                textDecoration: 'none',
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
