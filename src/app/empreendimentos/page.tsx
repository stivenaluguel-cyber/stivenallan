import type { Metadata } from 'next'
import Link from 'next/link'
import { getVitrineEmpreendimentos } from '@/lib/vitrine'
import { HeroImage } from '@/components/HeroImage'
import RegionFilter from '@/components/RegionFilter'
import { statusLabel, precoLabel, type Empreendimento, type StatusObra } from '@/lib/empreendimentos'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Empreendimentos em Criciúma SC e região',
  description: 'Todos os empreendimentos da Fontana Construtora em Criciúma e região SC. Apartamentos e terrenos com financiamento direto. Atendimento exclusivo com Stiven Allan.',
  alternates: { canonical: 'https://stivenallan.com.br/empreendimentos' },
  openGraph: {
    title: 'Empreendimentos em Criciúma SC e região | Stiven Allan',
    description: 'Descubra os empreendimentos da Fontana Construtora em Criciúma SC. Financiamento direto, sem banco.',
    url: 'https://stivenallan.com.br/empreendimentos',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Empreendimentos em Criciúma SC e região | Stiven Allan' },
  robots: { index: true, follow: true },
}

const WPP = 'https://wa.me/5548991642332'
const WPP_MSG = WPP + '?text=Ol%C3%A1+Stiven!+Vi+seu+site+e+quero+conhecer+os+empreendimentos+dispon%C3%ADveis.'

// Mesmo sistema de tokens de src/app/page.tsx — cada página deste site é
// autocontida (próprio <style>, sem componentes compartilhados entre rotas),
// então os tokens são replicados aqui para manter a mesma identidade visual.
const t = {
  bg: '#FAFAF8', ink: '#1A1814', champagne: '#B89B5E', chamDark: '#8A7240',
  muted: '#6B655B', line: 'rgba(26,24,20,0.10)', dark: '#141210',
  onDark: '#F5F1EA', onDarkMuted: 'rgba(245,241,234,0.60)',
  display: "var(--font-bricolage), system-ui, sans-serif",
  serif: "var(--font-cormorant), Georgia, serif",
  body: "var(--font-hanken), system-ui, sans-serif",
}

function StatusBadge({ status }: { status?: StatusObra }) {
  const colorMap: Record<string, { bg: string; color: string }> = {
    'na planta': { bg: 'rgba(184,155,94,0.12)', color: '#8A7240' },
    'em obras':  { bg: 'rgba(184,155,94,0.12)', color: '#8A7240' },
    'pronto':    { bg: 'rgba(40,120,60,0.10)',  color: '#2a7840' },
    'entregue':  { bg: 'rgba(40,120,60,0.10)',  color: '#2a7840' },
  }
  const c = colorMap[status || 'na planta'] || colorMap['na planta']
  return (
    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', background: c.bg, color: c.color, padding: '4px 10px', fontFamily: t.body }}>
      {statusLabel(status)}
    </span>
  )
}

function CatalogCard({ emp }: { emp: Empreendimento }) {
  const href = `/empreendimento/${emp.construtoraSlug}/${emp.slug}`
  const wpp = WPP + `?text=Ol%C3%A1+Stiven!+Tenho+interesse+no+${encodeURIComponent(emp.nome)}.`
  const localizacao = [emp.bairro, `${emp.cidade}/${emp.uf}`].filter(Boolean).join(' · ')
  return (
    <article className="cat-card" style={{ position: 'relative' }}>
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#e8e4dc' }}>
          <HeroImage src={emp.imagem} alt={emp.nome} fill sizes="(max-width:768px)100vw,50vw" style={{ objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,24,20,0.55), transparent 50%)' }} />
          <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <StatusBadge status={emp.statusObra} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', background: 'rgba(184,155,94,0.15)', color: '#8A7240', padding: '4px 10px', fontFamily: t.body }}>Financiamento direto</span>
          </div>
          <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
            <p style={{ margin: 0, fontFamily: t.body, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,241,234,0.70)', marginBottom: 4 }}>{emp.construtoraNome || 'Construtora Fontana'}</p>
            <h3 style={{ margin: 0, fontFamily: t.display, fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.10em', fontSize: 'clamp(18px,2.5vw,24px)', color: '#F5F1EA', lineHeight: 1.1 }}>{emp.nome}</h3>
          </div>
        </div>
        <div style={{ padding: '20px 22px 22px', background: t.bg, borderBottom: `1px solid ${t.line}` }}>
          <p style={{ margin: '0 0 8px', fontFamily: t.body, fontSize: 12, color: '#6B5A3A', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}>{localizacao}</p>
          <p style={{ margin: '0 0 16px', fontFamily: t.serif, fontStyle: 'italic', fontSize: 'clamp(15px,1.6vw,17px)', color: t.ink, lineHeight: 1.5, minHeight: '1.5em' }}>{emp.frase}</p>
          <p style={{ margin: '0 0 18px', fontFamily: t.body, fontSize: 13, color: t.muted, fontWeight: 500 }}>{precoLabel(emp)}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="cat-cta-primary" style={{ fontFamily: t.body, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.ink, borderBottom: `1px solid ${t.champagne}`, paddingBottom: 2, fontWeight: 500 }}>Ver detalhes →</span>
            <span aria-hidden="true" style={{ width: 36, height: 36, flexShrink: 0 }} />
          </div>
        </div>
      </Link>
      <a href={wpp} data-wpp="1" target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', right: 22, bottom: 22, width: 36, height: 36, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label={`WhatsApp sobre ${emp.nome}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      </a>
    </article>
  )
}

export default async function EmpreendimentosPage() {
  const listaEmp = await getVitrineEmpreendimentos()
  const lista = listaEmp.filter((e) => !e.oculto && e.construtoraSlug && e.slug && e.imagem)
  const cidades = [...new Set(lista.map((e) => e.cidade))].sort()
  const totalCidades = cidades.length
  const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://stivenallan.com.br' }, { '@type': 'ListItem', position: 2, name: 'Empreendimentos', item: 'https://stivenallan.com.br/empreendimentos' } ] }
  const itemListSchema = { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: lista.map((emp, i) => ({ '@type': 'ListItem', position: i + 1, name: emp.nome, url: 'https://stivenallan.com.br/empreendimento/' + emp.construtoraSlug + '/' + emp.slug })) }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <style>{`
        html { scroll-behavior: smooth; }
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #FAFAF8; color: #1A1814; font-family: var(--font-hanken), system-ui, sans-serif; }
        .cat-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(20,18,16,0.92); backdrop-filter: blur(20px); box-shadow: 0 1px 0 rgba(245,241,234,0.08); }
        .cat-eyebrow { font-size: 11px; letter-spacing: 0.42em; text-transform: uppercase; color: #B89B5E; font-family: var(--font-hanken), system-ui, sans-serif; font-weight: 500; }
        .cat-h2 { font-family: var(--font-bricolage), system-ui, sans-serif; font-weight: 300; text-transform: uppercase; letter-spacing: 0.14em; line-height: 1.1; margin: 0; font-size: clamp(28px,4.5vw,48px); }
        .cat-serif { font-family: var(--font-cormorant), Georgia, serif; font-style: italic; font-weight: 300; }
        .cat-rule { width: 48px; height: 1px; background: #B89B5E; border: 0; margin: 0; }
        .cat-card { background: #FAFAF8; overflow: hidden; transition: transform .35s ease, box-shadow .35s ease; }
        .cat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(26,24,20,0.12); }
        .cat-cta-primary { transition: border-color .25s ease, color .25s ease; cursor: pointer; }
        .cat-cta-primary:hover { color: #B89B5E; }
        .cat-btn { display: inline-block; font-family: var(--font-hanken), system-ui, sans-serif; font-size: 11px; letter-spacing: 0.32em; text-transform: uppercase; color: #1A1814; border: 1px solid #1A1814; padding: 15px 36px; text-decoration: none; transition: background .3s ease, color .3s ease; }
        .cat-btn:hover { background: #1A1814; color: #FAFAF8; }
        .cat-btn--cham { border-color: #B89B5E; color: #B89B5E; }
        .cat-btn--cham:hover { background: #B89B5E; color: #FAFAF8; }
        .cat-wa-float { position: fixed; right: 22px; bottom: 22px; z-index: 60; width: 54px; height: 54px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(37,211,102,0.35); transition: transform .2s ease; }
        .cat-wa-float:hover { transform: scale(1.08); }
        .cat-region-select { font-family: var(--font-hanken), system-ui, sans-serif; font-size: 11px; letter-spacing: 0.20em; text-transform: uppercase; color: #6B655B; border: 1px solid rgba(26,24,20,0.15); padding: 12px 40px 12px 20px; background: transparent; width: 100%; cursor: pointer; appearance: none; -webkit-appearance: none; -moz-appearance: none; transition: border-color .25s, color .25s; }
        .cat-region-select:hover, .cat-region-select:focus { border-color: #B89B5E; color: #B89B5E; outline: none; }
        .cat-region-select option { color: #1A1814; background: #FAFAF8; }
        @keyframes fadein { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
        .fade-in { animation: fadein .7s ease both; }
        .fade-in-1 { animation-delay: .10s; } .fade-in-2 { animation-delay: .22s; } .fade-in-3 { animation-delay: .34s; } .fade-in-4 { animation-delay: .46s; }
        @media (max-width: 1200px) { section { padding-left: clamp(16px,4vw,32px) !important; padding-right: clamp(16px,4vw,32px) !important; } }
        @media (max-width: 768px) { .cat-cards-grid { grid-template-columns: 1fr !important; } .cat-footer-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
      `}</style>

      {/* NAV */}
      <nav className="cat-nav">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(18px,4vw,48px)', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: t.display, fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: 16, textDecoration: 'none', color: t.onDark }}>
            Stiven Allan
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="/empreendimentos" style={{ fontFamily: t.body, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.onDark, textDecoration: 'none' }}>Empreendimentos</Link>
            <a href={WPP_MSG} data-wpp="1" target="_blank" rel="noopener noreferrer" style={{ fontFamily: t.body, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.champagne, textDecoration: 'none' }}>WhatsApp</a>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section style={{ background: t.dark, color: t.onDark, padding: 'calc(68px + clamp(48px,8vh,72px)) clamp(18px,4vw,40px) clamp(72px,12vh,120px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <nav aria-label="breadcrumb" style={{ marginBottom: 24 }}>
            <ol style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0, fontSize: 12, fontFamily: t.body, color: t.onDarkMuted }}>
              <li><Link href="/" style={{ color: t.onDarkMuted, textDecoration: 'none' }}>Início</Link></li>
              <li style={{ color: t.champagne }}>›</li>
              <li style={{ color: t.onDark }}>Empreendimentos</li>
            </ol>
          </nav>
          <p className="cat-eyebrow fade-in" style={{ marginBottom: 16 }}>Portfólio completo</p>
          <h1 className="cat-h2 fade-in fade-in-1" style={{ color: t.onDark, maxWidth: '20ch' }}>Empreendimentos em Criciúma e região</h1>
          <hr className="cat-rule fade-in fade-in-2" style={{ margin: '24px 0' }} />
          <p className="cat-serif fade-in fade-in-2" style={{ color: t.onDarkMuted, fontSize: 'clamp(15px,1.8vw,19px)', maxWidth: 560, lineHeight: 1.65 }}>
            {lista.length} empreendimentos em {totalCidades} cidades do Sul de Santa Catarina, todos com financiamento direto da construtora — sem banco, sem burocracia.
          </p>
        </div>
      </section>

      {/* GRID */}
      <section style={{ padding: 'clamp(72px,12vh,120px) clamp(18px,4vw,40px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,8vh,72px)' }}>
            <p className="cat-eyebrow" style={{ marginBottom: 16, color: '#6B5A3A' }}>Portfólio</p>
            <h2 className="cat-h2">Todos os empreendimentos</h2>
            <hr className="cat-rule" style={{ margin: '20px auto 0' }} />
          </div>
          <RegionFilter cidades={cidades} />
          <div className="cat-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(16px,2.5vw,28px)' }}>
            {lista.map((emp, i) => (
              <div key={emp.slug} data-cidade={emp.cidade} className={'fade-in fade-in-' + ((i % 4) + 1)}>
                <CatalogCard emp={emp} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: t.dark, color: t.onDark, padding: 'clamp(72px,12vh,120px) clamp(18px,4vw,40px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <p className="cat-eyebrow" style={{ marginBottom: 24 }}>Não sabe qual escolher?</p>
          <h2 className="cat-serif" style={{ color: t.onDark, fontSize: 'clamp(28px,4.5vw,48px)', fontStyle: 'italic', fontWeight: 300, letterSpacing: '0.01em', lineHeight: 1.15 }}>Stiven é especialista nos empreendimentos Fontana da região.</h2>
          <p className="cat-serif" style={{ color: t.onDarkMuted, fontSize: 'clamp(15px,1.8vw,19px)', margin: '20px 0 36px', lineHeight: 1.6 }}>
            Fale com Stiven e receba uma recomendação sob medida para o seu momento. CRECI 60.275.
          </p>
          <a href={WPP_MSG} data-wpp="1" target="_blank" rel="noopener noreferrer" className="cat-btn" style={{ background: t.champagne, borderColor: t.champagne, color: t.ink }}>Falar com Stiven — WhatsApp</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0E0C0A', color: t.onDark, padding: 'clamp(56px,10vh,96px) clamp(18px,4vw,40px) clamp(32px,6vh,56px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="cat-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 'clamp(32px,4vw,64px)', marginBottom: 40, paddingBottom: 40, borderBottom: '1px solid rgba(245,241,234,0.10)' }}>
            <div>
              <p style={{ fontFamily: t.display, fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: 16, color: t.onDark, margin: '0 0 16px' }}>Stiven Allan</p>
              <p style={{ fontFamily: t.body, fontSize: 13, color: t.onDarkMuted, lineHeight: 1.7, margin: '0 0 12px', maxWidth: 280 }}>Corretor de imóveis especializado em empreendimentos Fontana com financiamento direto.</p>
              <p style={{ fontFamily: t.body, fontSize: 11, letterSpacing: '0.16em', color: 'rgba(245,241,234,0.5)', margin: 0 }}>CRECI 60.275</p>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: t.champagne, marginBottom: 20 }}>Menu</div>
              {[['/', 'Início'], ['/empreendimentos', 'Empreendimentos'], ['/#como-funciona', 'Financiamento direto'], ['/guia', 'Guias']].map(([href, label]) => (
                <div key={href} style={{ marginBottom: 10 }}>
                  <Link href={href} style={{ fontSize: 13, color: 'rgba(245,241,234,0.55)', textDecoration: 'none', letterSpacing: '0.04em' }}>{label}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: t.champagne, marginBottom: 20 }}>Contato</div>
              <a href={WPP} data-wpp="1" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'rgba(245,241,234,0.55)', textDecoration: 'none', display: 'block', marginBottom: 10 }}>WhatsApp</a>
              <p style={{ fontSize: 13, color: 'rgba(245,241,234,0.5)', margin: '16px 0 0', lineHeight: 1.6 }}>Sul de Santa Catarina</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontFamily: t.body, fontSize: 12, color: 'rgba(245,241,234,0.5)', margin: 0 }}>© {new Date().getFullYear()} Stiven Allan. Todos os direitos reservados.</p>
            <p style={{ fontFamily: t.body, fontSize: 12, color: 'rgba(245,241,234,0.5)', margin: 0 }}>Sul de Santa Catarina · CRECI 60.275</p>
          </div>
        </div>
      </footer>

      {/* WA FLOAT */}
      <a href={WPP_MSG} data-wpp="1" target="_blank" rel="noopener noreferrer" className="cat-wa-float" aria-label="Falar com Stiven via WhatsApp">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      </a>
    </>
  )
}
