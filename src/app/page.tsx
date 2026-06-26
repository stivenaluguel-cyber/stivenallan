import Link from 'next/link'
import Image from 'next/image'
import { getSupabaseClient } from '@/lib/supabase'
import { c, font, brl, ui } from '@/lib/theme'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'
const WPP = 'https://wa.me/5548991642332'
const WPP_MSG = WPP + '?text=Ol%C3%A1+Stiven!+Vi+seu+site+e+quero+conhecer+os+lan%C3%A7amentos.'

export const metadata = {
  title: 'Imóveis de Alto Padrão em Criciúma/SC | Stiven Allan CRECI/RS 60.275',
  description: 'Lançamentos e empreendimentos premium em Criciúma e região. Financiamento direto sem banco. Corretor Stiven Allan CRECI/RS 60.275.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'Imóveis de Alto Padrão em Criciúma/SC | Stiven Allan',
    description: 'Lançamentos premium, financiamento direto, atendimento personalizado.',
    url: SITE_URL,
    siteName: 'Stiven Allan — Imóveis',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', width: 1200, height: 630 }],
  },
}

const PORTFOLIO = [
  {
    id: '1', nome: 'Monte Leone Residencial',
    slug: 'monte-leone-centro-criciuma-sc', construtora_slug: 'fontana',
    construtora_nome: 'Construtora Fontana', bairro: 'Centro', cidade: 'Criciúma', uf: 'SC',
    status_obra: 'lançamento', area_min: 230, area_max: 253,
    preco_a_partir_de: 800000,
    imagem_capa_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: '2', nome: 'Lavis Residencial',
    slug: 'lavis-centro-criciuma-sc', construtora_slug: 'fontana',
    construtora_nome: 'Construtora Fontana', bairro: 'Centro', cidade: 'Criciúma', uf: 'SC',
    status_obra: 'lançamento', area_min: 65, area_max: 95,
    preco_a_partir_de: 320000,
    imagem_capa_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: '3', nome: 'Pineto Residencial',
    slug: 'pineto-centro-criciuma-sc', construtora_slug: 'fontana',
    construtora_nome: 'Construtora Fontana', bairro: 'Centro', cidade: 'Criciúma', uf: 'SC',
    status_obra: 'lançamento', area_min: 65, area_max: 110,
    preco_a_partir_de: 350000,
    imagem_capa_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80',
  },
]

const MARQUEE_ITEMS = [
  'Financiamento Direto', 'Sem Banco', 'Lançamentos Exclusivos', 'Alto Padrão',
  'Construtoras Parceiras', 'CRECI/RS 60.275', 'Criciúma e Região', 'Visitas VIP',
  'Financiamento Direto', 'Sem Banco', 'Lançamentos Exclusivos', 'Alto Padrão',
  'Construtoras Parceiras', 'CRECI/RS 60.275', 'Criciúma e Região', 'Visitas VIP',
]

async function getEmpreendimentosDB() {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return null
    const { data, error } = await supabase
      .from('empreendimentos')
      .select('id, nome, slug, bairro, cidade, uf, status_obra, area_privativa_min, area_privativa_max, preco_a_partir_de, imagem_capa_url, construtora')
      .eq('status_venda', 'ativo')
      .order('created_at', { ascending: false })
      .limit(3)
    if (error || !data?.length) return null
    return data.map((e: any) => ({
      id: e.id, nome: e.nome, slug: e.slug,
      construtora_slug: (e.construtora || 'fontana').toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      construtora_nome: e.construtora || 'Construtora',
      bairro: e.bairro || '', cidade: e.cidade || 'Criciúma', uf: e.uf || 'SC',
      status_obra: e.status_obra || 'lançamento',
      area_min: e.area_privativa_min, area_max: e.area_privativa_max,
      preco_a_partir_de: e.preco_a_partir_de,
      imagem_capa_url: e.imagem_capa_url || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80',
    }))
  } catch { return null }
}

function SiteHeader() {
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(243,242,238,0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${c.line}`,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: font.display, fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', color: c.ink, textDecoration: 'none' }}>
          STIVEN ALLAN
          <span style={{ display: 'block', fontSize: 9, fontWeight: 500, letterSpacing: '0.2em', color: c.muted, marginTop: 1, fontFamily: font.body }}>
            ALTO PADRÃO · FINANCIAMENTO DIRETO
          </span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[['/#portfólio', 'Empreendimentos'], ['/lancamentos/criciuma-sc', 'Lançamentos'], ['/#sobre', 'Sobre']].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontSize: 13, fontWeight: 600, color: c.muted, textDecoration: 'none', letterSpacing: '0.01em', transition: 'color .2s' }}
              onMouseOver={e => (e.currentTarget.style.color = c.ink)}
              onMouseOut={e => (e.currentTarget.style.color = c.muted)}>
              {label}
            </Link>
          ))}
          <a href={WPP_MSG} target="_blank" rel="noopener noreferrer" style={{ ...ui.btnConvert, fontSize: 13, padding: '10px 20px' }}>
            Reservar
          </a>
        </nav>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer style={{ background: c.charcoal, color: c.onDark, padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,56px) 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', marginBottom: 8 }}>STIVEN ALLAN</div>
            <div style={{ fontSize: 11, color: c.onDarkMuted, letterSpacing: '0.2em', marginBottom: 16 }}>CRECI/RS 60.275</div>
            <p style={{ fontSize: 13, color: c.onDarkMuted, lineHeight: 1.7, maxWidth: 260 }}>Especialista em lançamentos e empreendimentos de construtoras em Criciúma e região.</p>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', color: c.bronze, marginBottom: 16 }}>LANÇAMENTOS</div>
            {['Criciúma', 'Içara', 'Nova Veneza', 'Forquilhinha'].map(c2 => (
              <div key={c2} style={{ marginBottom: 10 }}><Link href={`/lancamentos/${c2.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-')}-sc`} style={{ fontSize: 13, color: 'rgba(245,241,234,0.6)', textDecoration: 'none' }}>{c2}/SC</Link></div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', color: c.bronze, marginBottom: 16 }}>CONTATO</div>
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'rgba(245,241,234,0.6)', textDecoration: 'none', display: 'block', marginBottom: 10 }}>(48) 99164-2332</a>
            <a href="https://instagram.com/stivenallan.ofc" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'rgba(245,241,234,0.6)', textDecoration: 'none' }}>@stivenallan.ofc</a>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${c.lineDark}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'rgba(245,241,234,0.4)' }}>© {new Date().getFullYear()} Stiven Allan. CRECI/RS 60.275. Todos os direitos reservados.</p>
          <p style={{ fontSize: 12, color: 'rgba(245,241,234,0.4)' }}>Criciúma, Santa Catarina</p>
        </div>
      </div>
    </footer>
  )
}

function WppFloat() {
  return (
    <a href={WPP_MSG} target="_blank" rel="noopener noreferrer"
      style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 90, width: 52, height: 52, borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,0.4)', textDecoration: 'none' }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  )
}

export default async function HomePage() {
  const dbPortfolio = await getEmpreendimentosDB()
  const portfolio = dbPortfolio || PORTFOLIO

  return (
    <>
      <SiteHeader />

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: c.charcoal }}>
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85"
          alt="Imóvel de alto padrão em Criciúma SC"
          fill priority quality={85}
          style={{ objectFit: 'cover', objectPosition: 'center 30%', opacity: 0.18 }}
          sizes="100vw"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(19,18,17,0) 0%, rgba(19,18,17,0.6) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto', padding: 'clamp(100px,12vw,140px) clamp(20px,5vw,56px) clamp(60px,8vw,100px)' }}>
          <span style={{ ...ui.eyebrow, color: c.bronze, display: 'block', marginBottom: 20 }}>
            CRECI/RS 60.275 · CRICIÚMA, SC
          </span>
          <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 'clamp(2.2rem,6vw,5rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: c.onDark, marginBottom: 28, maxWidth: '14ch' }}>
            Morar bem não deveria depender de um banco.
          </h1>
          <p style={{ fontSize: 'clamp(15px,2vw,19px)', color: c.onDarkMuted, marginBottom: 44, maxWidth: '52ch', lineHeight: 1.65 }}>
            Lançamentos e empreendimentos de construtoras com financiamento direto, sem burocracia bancária. Do primeiro contato à entrega das chaves.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="#portfólio" style={{ ...ui.btnConvert, boxShadow: '0 8px 28px rgba(255,106,61,0.35)' }}>
              Ver Lançamentos
            </a>
            <a href={WPP_MSG} target="_blank" rel="noopener noreferrer"
              style={{ ...ui.btnSecondary, color: c.onDark, borderColor: 'rgba(245,241,234,0.3)' }}>
              Falar com Stiven
            </a>
          </div>
          {/* Scroll cue */}
          <div className="bounce-y" style={{ marginTop: 64, color: 'rgba(245,241,234,0.35)', fontSize: 12, letterSpacing: '0.15em', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
            <span style={{ width: 1, height: 40, background: 'rgba(245,241,234,0.2)', display: 'block' }} />
            SCROLL
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ background: c.bronze, padding: '12px 0', overflow: 'hidden' }}>
        <div className="marquee-track" style={{ display: 'flex', gap: 0 }}>
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} style={{ fontFamily: font.display, fontWeight: 700, fontSize: 14, color: c.onDark, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '0 28px', whiteSpace: 'nowrap' }}>
              {item}
              <span style={{ marginLeft: 28, color: 'rgba(243,242,238,0.4)' }}>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* MÉTRICAS */}
      <section style={{ background: c.surface, borderBottom: `1px solid ${c.line}`, padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,56px)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 32, textAlign: 'center' }}>
          {[
            { num: '+50', label: 'Empreendimentos', desc: 'no portfólio' },
            { num: '8+', label: 'Anos', desc: 'de experiência' },
            { num: '100%', label: 'Foco', desc: 'em lançamentos' },
            { num: '5★', label: 'Avaliação', desc: 'média dos clientes' },
          ].map((m) => (
            <div key={m.num}>
              <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 'clamp(2rem,3.5vw,3rem)', letterSpacing: '-0.03em', color: c.bronze, lineHeight: 1 }}>{m.num}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: c.ink, marginTop: 6 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CORRETOR */}
      <section id="sobre" style={{ padding: 'clamp(64px,7vw,100px) clamp(16px,4vw,56px)', background: c.paper }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(32px,5vw,72px)', alignItems: 'center' }}>
          <div style={{ position: 'relative', height: 'clamp(320px,40vw,520px)', borderRadius: 4, overflow: 'hidden', border: `1px solid ${c.line}` }}>
            <Image src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=85" alt="Stiven Allan corretor" fill style={{ objectFit: 'cover', objectPosition: 'top' }} sizes="(max-width:768px) 100vw, 50vw" />
            <div style={{ position: 'absolute', bottom: 20, left: 20, background: c.charcoal, borderLeft: `3px solid ${c.bronze}`, padding: '10px 16px', borderRadius: 2 }}>
              <div style={{ fontFamily: font.display, fontSize: 13, fontWeight: 700, color: c.onDark }}>Stiven Allan</div>
              <div style={{ fontSize: 11, color: c.onDarkMuted, marginTop: 2, letterSpacing: '0.1em' }}>CRECI/RS 60.275</div>
            </div>
          </div>
          <div>
            <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 14 }}>SOBRE MIM</span>
            <h2 style={{ ...ui.h2, color: c.ink }}>Olhão que dirige, não só um vendedor.</h2>
            <p style={{ fontSize: 16, color: c.muted, marginTop: 20, lineHeight: 1.75 }}>Corretor especializado em lançamentos em Criciúma e região do Sul Catarinense.</p>
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['Acesso prioritário','Lançamentos antes da divulgação pública.'],['Curadoria especializada','Só apresento empreendimentos que eu compraria.'],['Do contato às chaves','Acompanhamento completo em todas as etapas.']].map(([t,d]) => (
                <div key={t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: c.bronze, marginTop: 7, flexShrink: 0 }} /><div><b style={{ fontSize: 14, color: c.ink, fontWeight: 700 }}>{t}</b><br /><span style={{ fontSize: 13, color: c.muted }}>{d}</span></div></div>
              ))}
            </div>
            <a href={WPP_MSG} target="_blank" rel="noopener noreferrer" style={{ ...ui.btnPrimary, marginTop: 32, display: 'inline-block' }}>Falar no WhatsApp</a>
          </div>
        </div>
      </section>

      {/* ENGENHARIA FINANCEIRA */}
      <section style={{ background: c.charcoal, color: c.onDark, padding: 'clamp(64px,7vw,100px) clamp(16px,4vw,56px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,5vw,60px)', maxWidth: '52ch', marginLeft: 'auto', marginRight: 'auto' }}>
            <span style={{ ...ui.eyebrow, color: c.orange, display: 'block', marginBottom: 14 }}>COMO FUNCIONA</span>
            <h2 style={{ ...ui.h2, color: c.onDark }}>Engenharia financeira. Sem banco.</h2>
            <p style={{ color: c.onDarkMuted, marginTop: 16, fontSize: 16, lineHeight: 1.7 }}>Estruturamos o pagamento direto com a construtora. Sem aprovação bancária.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24 }}>
            {[{n:'01',t:'Entrada direta',d:'Negocie a entrada com a construtora. Geralmente 20-30% do valor.'},{n:'02',t:'Parcelas mensais',d:'Saldo em parcelas mensais direto com a construtora, sem juros bancários.'},{n:'03',t:'Reforços anuais',d:'Pagamentos extras anuais que reduzem o saldo e a parcela mensal.'}].map((s) => (
              <div key={s.n} style={{ background: 'rgba(245,241,234,0.04)', border: `1px solid ${c.lineDark}`, borderRadius: 4, padding: 'clamp(24px,3vw,32px)' }}>
                <div style={{ fontFamily: font.display, fontSize: 42, fontWeight: 800, color: c.orange, lineHeight: 1, marginBottom: 16, letterSpacing: '-0.04em', opacity: 0.8 }}>{s.n}</div>
                <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, color: c.onDark, marginBottom: 10 }}>{s.t}</div>
                <p style={{ fontSize: 14, color: c.onDarkMuted, lineHeight: 1.7 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" style={{ padding: 'clamp(64px,7vw,100px) clamp(16px,4vw,56px)', background: c.paper }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ marginBottom: 'clamp(36px,5vw,56px)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div><span style={{ ...ui.eyebrow, display: 'block', marginBottom: 12 }}>PORTFÓLIO</span><h2 style={{ ...ui.h2, color: c.ink, margin: 0 }}>Empreendimentos em Destaque</h2></div>
            <Link href="/lancamentos/criciuma-sc" style={{ fontSize: 13, fontWeight: 600, color: c.bronze, textDecoration: 'none', letterSpacing: '0.04em' }}>Ver todos →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
            {portfolio.map((emp: any) => (
              <Link key={emp.id} href={`/empreendimento/${emp.construtora_slug}/${emp.slug}`} className="card-hover" style={{ ...ui.card, textDecoration: 'none', display: 'block' }}>
                <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
                  <Image src={emp.imagem_capa_url} alt={emp.nome} fill style={{ objectFit: 'cover' }} sizes="(max-width:640px) 100vw, (max-width:960px) 50vw, 33vw" />
                  <div style={{ position: 'absolute', top: 14, left: 14, background: c.charcoal, color: c.onDark, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 2 }}>{emp.status_obra}</div>
                </div>
                <div style={{ padding: 'clamp(18px,2vw,24px)' }}>
                  <div style={{ fontSize: 11, color: c.bronze, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{emp.construtora_nome}</div>
                  <h3 style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, color: c.ink, lineHeight: 1.2, marginBottom: 6, letterSpacing: '-0.015em' }}>{emp.nome}</h3>
                  <p style={{ fontSize: 13, color: c.muted, marginBottom: 18 }}>{emp.bairro ? emp.bairro + ', ' : ''}{emp.cidade}/{emp.uf}</p>
                  <div style={{ borderTop: `1px solid ${c.line}`, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      {emp.area_min && <div style={{ fontSize: 12, color: c.muted }}>{emp.area_min === emp.area_max ? emp.area_min : emp.area_min + '–' + emp.area_max}m²</div>}
                      <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, color: c.ink, marginTop: 2 }}>{emp.preco_a_partir_de ? brl(emp.preco_a_partir_de) : 'Consulte'}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: c.bronze, letterSpacing: '0.05em' }}>VER →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="contato" style={{ padding: 'clamp(64px,7vw,100px) clamp(16px,4vw,56px)', background: c.charcoal }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ ...ui.eyebrow, color: c.orange, display: 'block', marginBottom: 16 }}>COMECE AGORA</span>
          <h2 style={{ ...ui.h2, color: c.onDark }}>Vamos encontrar o seu imóvel ideal?</h2>
          <p style={{ color: c.onDarkMuted, marginTop: 18, fontSize: 16, lineHeight: 1.7 }}>
            Fale comigo agora pelo WhatsApp. Resposta rápida, sem enrolação e sem compromisso.
          </p>
          <a href={WPP_MSG} target="_blank" rel="noopener noreferrer"
            style={{ ...ui.btnConvert, marginTop: 36, display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 28px rgba(255,106,61,0.4)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Falar no WhatsApp
          </a>
        </div>
      </section>

      <SiteFooter />
      <WppFloat />
    </>
  )
}
