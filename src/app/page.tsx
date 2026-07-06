import Link from 'next/link'
import { imoveis } from '@/data/imoveis'
import { getVitrineImoveis } from '@/lib/vitrine'
import Image from 'next/image'
import { SITE_URL } from '@/lib/site'
import RegionFilter from '@/components/RegionFilter'

const WPP = 'https://wa.me/5548991642332'
const WPP_MSG = WPP + '?text=Ol%C3%A1+Stiven!+Vi+seu+site+e+quero+conhecer+as+condi%C3%A7%C3%B5es+de+financiamento+direto.'

export const metadata = {
  title: 'Apartamentos na Planta com Financiamento Direto em Criciúma/SC',
  description: 'Empreendimentos com financiamento direto da construtora, sem burocracia bancária. Sul de SC: Criciúma, Laguna, Rincão, Nova Veneza.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'Morar bem não deveria depender de um banco. | Stiven Allan',
    description: 'Empreendimentos com financiamento direto da construtora. Sul de Santa Catarina.',
    url: SITE_URL, siteName: 'Stiven Allan — Imóveis', locale: 'pt_BR', type: 'website',
    images: [{ url: 'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/monte-leone-centro-criciuma-sc.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Morar bem não deveria depender de um banco. | Stiven Allan', images: ['https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/monte-leone-centro-criciuma-sc.jpg'] },
  robots: { index: true, follow: true },
}

const t = {
  bg: '#FAFAF8', ink: '#1A1814', champagne: '#B89B5E', chamDark: '#8A7240',
  muted: '#6B655B', line: 'rgba(26,24,20,0.10)', dark: '#141210',
  onDark: '#F5F1EA', onDarkMuted: 'rgba(245,241,234,0.60)',
  display: "'Jost', system-ui, sans-serif",
  serif: "'Cormorant Garamond', Georgia, serif",
  body: "'Hanken Grotesk', system-ui, sans-serif",
}

const DEPOIMENTOS = [
  { nome: 'Rafael T.', cidade: 'Criciúma, SC', texto: 'Nunca imaginei que compraria um apartamento sem depender de banco. O processo foi simples, rápido e as condições são incríveis.' },
  { nome: 'Camila S.', cidade: 'Içara, SC', texto: 'O Stiven apresentou um empreendimento perfeito para mim e estruturou um pagamento que coube no meu orçamento. Recomendo muito.' },
  { nome: 'Fernando B.', cidade: 'Nova Veneza, SC', texto: 'A flexibilidade do financiamento direto foi o que fez a diferença. Sem filas, sem burocracia, só resultado.' },
]

const COMO_FUNCIONA = [
  { n: '01', titulo: 'Escolha o imóvel', desc: 'Navegue pelo portfólio e escolha o empreendimento ideal para o seu estilo de vida e objetivos.' },
  { n: '02', titulo: 'Simulação personalizada', desc: 'Stiven estrutura um plano de pagamento sob medida, sem intermediação bancária.' },
  { n: '03', titulo: 'Contrato direto', desc: 'Documentação simplificada, sem intermediários.' },
  { n: '04', titulo: 'Chaves na mão', desc: 'Acompanhamento completo até a entrega. Seu imóvel, do jeito que você imaginou.' },
]

const METRICAS = [
  { valor: '4+', label: 'Empreendimentos ativos' },
  { valor: '100%', label: 'Financiamento direto' },
  { valor: '+', label: 'Construtoras parceiras' },
  { valor: 'SC', label: 'Sul de Santa Catarina' },
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    'na planta': { label: 'Na planta', bg: 'rgba(184,155,94,0.12)', color: '#8A7240' },
    'em obras':  { label: 'Em obras',  bg: 'rgba(184,155,94,0.12)', color: '#8A7240' },
    'pronto':    { label: 'Pronto',    bg: 'rgba(40,120,60,0.10)',  color: '#2a7840' },
  }
  const s = map[status] || map['na planta']
  return (
    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', background: s.bg, color: s.color, padding: '4px 10px', fontFamily: t.body }}>
      {s.label}
    </span>
  )
}

function EmpCard({ emp }: { emp: typeof imoveis[0] }) {
  const href = `/empreendimento/${emp.construtora_slug}/${emp.slug}`
  const wpp = WPP + `?text=Ol%C3%A1+Stiven!+Tenho+interesse+no+${encodeURIComponent(emp.nome)}.`
  return (
    <article className="home-card">
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#e8e4dc' }}>
          <Image src={emp.img} alt={emp.nome} fill sizes="(max-width:768px)100vw,50vw" style={{ objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,24,20,0.55), transparent 50%)' }} />
          <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <StatusBadge status={emp.status} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', background: 'rgba(184,155,94,0.15)', color: '#8A7240', padding: '4px 10px', fontFamily: t.body }}>Financiamento direto</span>
          </div>
          <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
            <p style={{ margin: 0, fontFamily: t.body, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,241,234,0.70)', marginBottom: 4 }}>{emp.construtora}</p>
            <h3 style={{ margin: 0, fontFamily: t.display, fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.10em', fontSize: 'clamp(18px,2.5vw,24px)', color: '#F5F1EA', lineHeight: 1.1 }}>{emp.nome}</h3>
          </div>
        </div>
        <div style={{ padding: '20px 22px 22px', background: t.bg, borderBottom: `1px solid ${t.line}` }}>
          <p style={{ margin: '0 0 8px', fontFamily: t.body, fontSize: 12, color: '#6B5A3A', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}>{emp.bairro} · {emp.cidade}/{emp.uf}</p>
          <p style={{ margin: '0 0 16px', fontFamily: t.serif, fontStyle: 'italic', fontSize: 'clamp(15px,1.6vw,17px)', color: t.ink, lineHeight: 1.5 }}>{emp.frase}</p>
          <p style={{ margin: '0 0 18px', fontFamily: t.body, fontSize: 13, color: t.muted, fontWeight: 500 }}>{emp.exibir_preco && emp.preco ? `A partir de R$ ${emp.preco.toLocaleString('pt-BR')}` : 'Sob consulta'}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="home-cta-primary" style={{ fontFamily: t.body, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.ink, borderBottom: `1px solid ${t.champagne}`, paddingBottom: 2, fontWeight: 500 }}>Ver detalhes →</span>
            <a href={wpp} data-wpp="1" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-label={`WhatsApp sobre ${emp.nome}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </a>
          </div>
        </div>
      </Link>
    </article>
  )
}

export default async function HomePage() {
  const imoveisVitrine = await getVitrineImoveis();
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,400;1,300;1,400&family=Hanken+Grotesk:wght@300;400;500&display=swap');
        html { scroll-behavior: smooth; }
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #FAFAF8; color: #1A1814; font-family: 'Hanken Grotesk', system-ui, sans-serif; }
        .home-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: background .35s ease, box-shadow .35s ease; background: transparent; }
        .home-nav--solid { background: rgba(250,250,248,0.97) !important; backdrop-filter: blur(20px); box-shadow: 0 1px 0 rgba(26,24,20,0.08); }
        .home-nav--solid .home-nav-link { color: #1A1814 !important; text-shadow: none !important; }
        .home-nav--solid .home-nav-brand { color: #1A1814 !important; text-shadow: none !important; }
        .home-nav--solid .home-nav-wpp { color: #8A7240 !important; text-shadow: none !important; }
        @supports (animation-timeline: scroll()) {
          .home-nav { animation: nav-fill linear both; animation-timeline: scroll(); animation-range: 0px 80px; }
          @keyframes nav-fill { to { background: rgba(250,250,248,0.96); backdrop-filter: blur(20px); box-shadow: 0 1px 0 rgba(26,24,20,0.08); } }
        }
        .home-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: #B89B5E; font-family: 'Hanken Grotesk', system-ui, sans-serif; font-weight: 500; }
        .home-h1 { font-family: 'Jost', system-ui, sans-serif; font-weight: 300; text-transform: uppercase; letter-spacing: 0.12em; line-height: 1.06; margin: 0; }
        .home-h2 { font-family: 'Jost', system-ui, sans-serif; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.1; margin: 0; font-size: clamp(26px,4vw,44px); }
        .home-serif { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 300; }
        .home-rule { width: 48px; height: 1px; background: #B89B5E; border: 0; margin: 0; }
        .home-card { background: #FAFAF8; overflow: hidden; transition: transform .35s ease, box-shadow .35s ease; }
        .home-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(26,24,20,0.12); }
        .home-cta-primary { transition: border-color .25s ease, color .25s ease; cursor: pointer; }
        .home-cta-primary:hover { color: #B89B5E; }
        .home-btn { display: inline-block; font-family: 'Hanken Grotesk', system-ui, sans-serif; font-size: 11px; letter-spacing: 0.32em; text-transform: uppercase; color: #1A1814; border: 1px solid #1A1814; padding: 15px 36px; text-decoration: none; transition: background .3s ease, color .3s ease; }
        .home-btn:hover { background: #1A1814; color: #FAFAF8; }
        .home-btn--cham { border-color: #B89B5E; color: #B89B5E; }
        .home-btn--cham:hover { background: #B89B5E; color: #FAFAF8; }
        .home-step-n { font-family: 'Jost', system-ui, sans-serif; font-weight: 300; font-size: clamp(40px,6vw,64px); color: rgba(184,155,94,0.18); letter-spacing: 0.04em; line-height: 1; }
        .home-dep-card { background: #fff; padding: 36px 32px; border-top: 2px solid #B89B5E; }
        .home-region-btn { font-family: 'Hanken Grotesk', system-ui, sans-serif; font-size: 10px; letter-spacing: 0.30em; text-transform: uppercase; color: #6B655B; border: 1px solid rgba(26,24,20,0.15); padding: 10px 22px; background: transparent; text-decoration: none; display: inline-block; cursor: pointer; transition: border-color .25s, color .25s; }
        .home-region-btn:hover { border-color: #B89B5E; color: #B89B5E; }
        .home-wa-float { position: fixed; right: 22px; bottom: 22px; z-index: 60; width: 54px; height: 54px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(37,211,102,0.35); transition: transform .2s ease; }
        .home-wa-float:hover { transform: scale(1.08); }
        @keyframes fadein { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
        .fade-in { animation: fadein .7s ease both; }
        .fade-in-1 { animation-delay: .10s; } .fade-in-2 { animation-delay: .22s; } .fade-in-3 { animation-delay: .34s; } .fade-in-4 { animation-delay: .46s; }
        @media (max-width: 1200px) { section { padding-left: clamp(16px,4vw,32px) !important; padding-right: clamp(16px,4vw,32px) !important; } }
        @media (max-width: 900px) { .home-how-grid, .home-metrics-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 768px) { .home-cards-grid { grid-template-columns: 1fr !important; } .home-how-grid { grid-template-columns: 1fr 1fr !important; } .home-metrics-grid { grid-template-columns: 1fr 1fr !important; } .home-footer-grid { grid-template-columns: 1fr !important; gap: 40px !important; } .home-dep-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 480px) { .home-how-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* NAV */}
      <nav className="home-nav">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(18px,4vw,48px)', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: t.display, fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: 16, textDecoration: 'none', color: '#FFFFFF', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }} className="home-nav-brand">
            Stiven Allan
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="/#empreendimentos" style={{ fontFamily: t.body, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#FFFFFF', textDecoration: 'none', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }} className="home-nav-link">Empreendimentos</Link>
            <a href={WPP_MSG} data-wpp="1" target="_blank" rel="noopener noreferrer" style={{ fontFamily: t.body, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.champagne, textDecoration: 'none', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }} className="home-nav-wpp">WhatsApp</a>
          </div>
        </div>
      </nav>
      <script dangerouslySetInnerHTML={{ __html: `(function(){var n=document.querySelector('.home-nav');if(!n)return;function u(){n.classList.toggle('home-nav--solid',window.scrollY>40);}window.addEventListener('scroll',u,{passive:true});u();})();` }} />

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100svh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#1a1814' }}>
        <Image src="https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/due-fratelli-centro-criciuma-sc.jpg" alt="Hall de entrada iluminado de empreendimento de alto padrão — Sul de Santa Catarina" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.65) 100%)' }} />
        <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'calc(68px + 2vh) clamp(24px,6vw,80px) 4vh' }}>
          <p className="home-eyebrow fade-in" style={{ color: 'rgba(184,155,94,0.85)', marginBottom: 24, textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>Stiven Allan · CRECI 60.275</p>
          <h1 className="home-h1 fade-in fade-in-1" style={{ fontSize: 'clamp(30px,3.6vw,52px)', lineHeight: 1.08, color: '#FFFFFF', textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 2px 32px rgba(0,0,0,0.60)', maxWidth: '28ch' }}>
            Apartamentos na planta com financiamento direto — sem banco, sem burocracia
          </h1>
          <hr className="home-rule fade-in fade-in-2" style={{ margin: '28px auto' }} />
          <p className="home-serif fade-in fade-in-2" style={{ fontSize: 'clamp(16px,2.2vw,22px)', color: '#FFFFFF', maxWidth: 560, margin: '0 0 20px', lineHeight: 1.6, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Morar bem não deveria depender de um banco.
          </p>
          <p className="fade-in fade-in-2" style={{ fontFamily: t.body, fontSize: 'clamp(13px,1.6vw,16px)', color: 'rgba(245,241,234,0.82)', maxWidth: 620, margin: '0 0 40px', lineHeight: 1.7, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Empreendimentos de alto padrão com financiamento direto da construtora em Criciúma, Balneário Rincão, Laguna e todo o Sul de Santa Catarina. Sem banco, sem burocracia.
          </p>
          <div className="fade-in fade-in-3" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/#empreendimentos" className="home-btn" style={{ background: 'rgba(245,241,234,0.12)', borderColor: 'rgba(245,241,234,0.40)', color: '#FFFFFF', backdropFilter: 'blur(8px)' }}>Explorar empreendimentos</Link>
            <a href={WPP_MSG} data-wpp="1" target="_blank" rel="noopener noreferrer" style={{ fontFamily: t.body, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(245,241,234,0.55)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '15px 0' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Falar com Stiven
            </a>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: t.body, fontSize: 9, letterSpacing: '0.30em', textTransform: 'uppercase', color: 'rgba(245,241,234,0.40)' }}>rolar</span>
          <div style={{ width: 1, height: 40, background: 'rgba(245,241,234,0.25)' }} />
        </div>
      </section>

      {/* EMPREENDIMENTOS */}
      <section id="empreendimentos" style={{ padding: 'clamp(72px,12vh,120px) clamp(18px,4vw,40px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,8vh,72px)' }}>
            <p className="home-eyebrow" style={{ marginBottom: 16, color: '#6B5A3A' }}>Portfólio</p>
            <h2 className="home-h2">Empreendimentos</h2>
            <hr className="home-rule" style={{ margin: '20px auto 0' }} />
          </div>
          <RegionFilter cidades={[...new Set(imoveisVitrine.filter(e => e.ativo).map(e => e.cidade))].sort()} />
          <div className="home-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(16px,2.5vw,28px)' }}>
            {imoveisVitrine.filter(e => e.ativo).map((emp, i) => (
              <div key={emp.id} data-cidade={emp.cidade} className={'fade-in fade-in-' + ((i % 4) + 1)}>
                <EmpCard emp={emp} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{ background: t.dark, color: t.onDark, padding: 'clamp(72px,12vh,120px) clamp(18px,4vw,40px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,8vh,72px)' }}>
            <p className="home-eyebrow" style={{ color: t.champagne, marginBottom: 16 }}>Como funciona</p>
            <h2 className="home-h2" style={{ color: t.onDark }}>Financiamento direto</h2>
            <p className="home-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(15px,1.8vw,19px)', marginTop: 20, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.65 }}>
              Financiamento negociado diretamente com a construtora, sem intermediação bancária.
            </p>
          </div>
          <div className="home-how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 'clamp(24px,3vw,40px)' }}>
            {COMO_FUNCIONA.map((step, i) => (
              <div key={step.n} className={'fade-in fade-in-' + (i + 1)} style={{ borderTop: '1px solid rgba(245,241,234,0.12)', paddingTop: 28 }}>
                <div className="home-step-n" aria-hidden="true">{step.n}</div>
                <h3 style={{ fontFamily: t.display, fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 14, color: t.onDark, margin: '16px 0 10px' }}>{step.titulo}</h3>
                <p style={{ fontFamily: t.body, fontSize: 14, color: t.onDarkMuted, lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MÉTRICAS */}
      <section style={{ padding: 'clamp(56px,10vh,96px) clamp(18px,4vw,40px)', borderBottom: `1px solid ${t.line}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="home-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 'clamp(24px,3vw,40px)', textAlign: 'center' }}>
            {METRICAS.map((m, i) => (
              <div key={m.label} className={'fade-in fade-in-' + (i + 1)} style={{ borderTop: `2px solid ${t.champagne}`, paddingTop: 24 }}>
                <div style={{ fontFamily: t.display, fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 'clamp(36px,5vw,56px)', color: t.ink, lineHeight: 1 }}>{m.valor}</div>
                <p style={{ fontFamily: t.body, fontSize: 12, letterSpacing: '0.20em', textTransform: 'uppercase', color: t.muted, margin: '10px 0 0', fontWeight: 500 }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section style={{ padding: 'clamp(72px,12vh,120px) clamp(18px,4vw,40px)', background: '#F5F1EA' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,8vh,72px)' }}>
            <p className="home-eyebrow" style={{ marginBottom: 16, color: '#6B5A3A' }}>Depoimentos</p>
            <h2 className="home-h2">Quem já realizou</h2>
          </div>
          <div className="home-dep-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(16px,2.5vw,24px)' }}>
            {DEPOIMENTOS.map((d, i) => (
              <div key={d.nome} className={'home-dep-card fade-in fade-in-' + (i + 1)}>
                <p style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 'clamp(16px,1.7vw,19px)', color: t.ink, lineHeight: 1.65, margin: '0 0 24px' }}>“{d.texto}”</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.champagne, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: t.display, fontWeight: 300, fontSize: 14, color: '#fff', textTransform: 'uppercase' }}>{d.nome[0]}</span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontFamily: t.body, fontWeight: 500, fontSize: 13, color: t.ink }}>{d.nome}</p>
                    <p style={{ margin: 0, fontFamily: t.body, fontSize: 11, color: t.muted, letterSpacing: '0.08em' }}>{d.cidade}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: t.dark, color: t.onDark, padding: 'clamp(80px,14vh,140px) clamp(18px,4vw,40px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p className="home-eyebrow" style={{ color: t.champagne, marginBottom: 24 }}>Próximo passo</p>
          <h2 className="home-serif" style={{ color: t.onDark, fontSize: 'clamp(32px,5.5vw,60px)', fontStyle: 'italic', fontWeight: 300, letterSpacing: '0.01em', lineHeight: 1.15 }}>Seu próximo investimento começa aqui.</h2>
          <p className="home-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(16px,1.9vw,21px)', margin: '24px 0 40px', lineHeight: 1.65 }}>
            Empreendimentos que valorizam antes mesmo das chaves. Fale com Stiven e descubra como fazer seu capital trabalhar com inteligência.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WPP_MSG} data-wpp="1" target="_blank" rel="noopener noreferrer" className="home-btn" style={{ background: t.champagne, borderColor: t.champagne, color: '#fff' }}>Falar com Stiven</a>
            <Link href="/#empreendimentos" className="home-btn home-btn--cham">Ver empreendimentos</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0E0C0A', color: t.onDark, padding: 'clamp(56px,10vh,96px) clamp(18px,4vw,40px) clamp(32px,6vh,56px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="home-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 'clamp(32px,4vw,64px)', marginBottom: 56, paddingBottom: 40, borderBottom: '1px solid rgba(245,241,234,0.10)' }}>
            <div>
              <p style={{ fontFamily: t.display, fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: 16, color: t.onDark, margin: '0 0 16px' }}>Stiven Allan</p>
              <p style={{ fontFamily: t.body, fontSize: 13, color: t.onDarkMuted, lineHeight: 1.7, margin: '0 0 12px', maxWidth: 280 }}>Corretor de imóveis especializado em empreendimentos Fontana com financiamento direto.</p>
              <p style={{ fontFamily: t.body, fontSize: 11, letterSpacing: '0.16em', color: 'rgba(245,241,234,0.35)', margin: 0 }}>CRECI 60.275</p>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: t.champagne, marginBottom: 20 }}>Menu</div>
              {[['/', 'Início'], ['/#empreendimentos', 'Empreendimentos'], ['/#como-funciona', 'Financiamento direto']].map(([href, label]) => (
                <div key={href} style={{ marginBottom: 10 }}>
                  <Link href={href} style={{ fontSize: 13, color: 'rgba(245,241,234,0.55)', textDecoration: 'none', letterSpacing: '0.04em' }}>{label}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: t.champagne, marginBottom: 20 }}>Empreendimentos</div>
              {imoveisVitrine.filter(e => e.ativo).map(emp => (
                <div key={emp.id} style={{ marginBottom: 10 }}>
                  <Link href={'/empreendimento/' + emp.construtora_slug + '/' + emp.slug} style={{ fontSize: 13, color: 'rgba(245,241,234,0.55)', textDecoration: 'none' }}>{emp.nome}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: t.champagne, marginBottom: 20 }}>Contato</div>
              <a href={WPP} data-wpp="1" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'rgba(245,241,234,0.55)', textDecoration: 'none', display: 'block', marginBottom: 10 }}>WhatsApp</a>
              <p style={{ fontSize: 13, color: 'rgba(245,241,234,0.35)', margin: '16px 0 0', lineHeight: 1.6 }}>Sul de Santa Catarina</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontFamily: t.body, fontSize: 12, color: 'rgba(245,241,234,0.25)', margin: 0 }}>© {new Date().getFullYear()} Stiven Allan. Todos os direitos reservados.</p>
            <p style={{ fontFamily: t.body, fontSize: 12, color: 'rgba(245,241,234,0.25)', margin: 0 }}>Sul de Santa Catarina · CRECI 60.275</p>
          </div>
        </div>
      </footer>

      {/* WA FLOAT */}
      <a href={WPP_MSG} data-wpp="1" target="_blank" rel="noopener noreferrer" className="home-wa-float" aria-label="Falar com Stiven via WhatsApp">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      </a>
    </>
  )
}
