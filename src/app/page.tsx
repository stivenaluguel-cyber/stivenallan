import Link from 'next/link'
import Image from 'next/image'
import { getSupabaseClient } from '@/lib/supabase'
import { c, font, brl, ui } from '@/lib/theme'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stivenallan.vercel.app'
const WPP = 'https://wa.me/5548991642332'
const WPP_MSG = WPP + '?text=Ol%C3%A1+Stiven!+Vi+seu+site+e+quero+conhecer+as+condi%C3%A7%C3%B5es+de+financiamento+direto.'

export const metadata = {
  title: 'Imóveis no Sul de Santa Catarina | Stiven Allan CRECI/RS 60.275',
  description: 'Empreendimentos com financiamento direto da construtora, sem burocracia bancária. Sul de SC: Criciúma, Laguna, Rincão, Nova Veneza.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'Morar bem não deveria depender de um banco. | Stiven Allan',
    description: 'Empreendimentos com financiamento direto da construtora. Sul de Santa Catarina.',
    url: SITE_URL, siteName: 'Stiven Allan — Imóveis', locale: 'pt_BR', type: 'website',
    images: [{ url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', width: 1200, height: 630 }],
  },
}

const PORTFOLIO_FALLBACK = [
  { id: '1', nome: 'Monte Leone Residencial', slug: 'monte-leone-centro-criciuma-sc', construtora_slug: 'fontana', construtora_nome: 'Construtora Fontana', bairro: 'Centro', cidade: 'Criciúma', uf: 'SC', regiao: 'cidade', status_obra: 'na planta', area_min: 230, area_max: 253, exibir_preco: false, preco_a_partir_de: null, frase: 'Viver no centro com a sofisticação que você merece.', imagem_capa_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80' },
  { id: '2', nome: 'Lavis Residencial', slug: 'lavis-residencial-centro-criciuma-sc', construtora_slug: 'fontana', construtora_nome: 'Construtora Fontana', bairro: 'Centro', cidade: 'Criciúma', uf: 'SC', regiao: 'cidade', status_obra: 'em obras', area_min: 65, area_max: 95, exibir_preco: true, preco_a_partir_de: 320000, frase: 'Conforto moderno no coração de Criciúma.', imagem_capa_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=700&q=80' },
  { id: '3', nome: 'Pineto Residencial', slug: 'pineto-centro-criciuma-sc', construtora_slug: 'fontana', construtora_nome: 'Construtora Fontana', bairro: 'Centro', cidade: 'Criciúma', uf: 'SC', regiao: 'cidade', status_obra: 'na planta', area_min: 75, area_max: 76, exibir_preco: true, preco_a_partir_de: 619250, frase: 'Na planta no Centro de Criciúma, com financiamento direto com a construtora.', imagem_capa_url: 'https://lh3.googleusercontent.com/d/1WoeVn8nWbU-Zbr-NGK9fT-quhSH_OFas=w1200' },
  { id: '4', nome: 'Águas de Marano Residencial', slug: 'aguas-de-marano-frente-mar-balneario-picarras-sc', construtora_slug: 'fontana', construtora_nome: 'Construtora Fontana', bairro: 'Centro', cidade: 'Balneário Piçarras', uf: 'SC', regiao: 'praia', status_obra: 'em obras', area_min: 196, area_max: 199, exibir_preco: false, preco_a_partir_de: null, frase: 'Frente mar — mergulhe em cada detalhe.', imagem_capa_url: 'https://estilofontana.com.br/images/empreendimento/slideshows/aguas-de-marano-residencial-65a583e5c68f2.jpg?fm=webp' },
]

const DEPOIMENTOS = [
  { nome: 'Rafael T.', cidade: 'Criciúma, SC', texto: 'Nunca imaginei que compraria um apartamento sem depender de banco. O processo foi simples, rápido e as condições são incríveis.' },
  { nome: 'Camila S.', cidade: 'Içara, SC', texto: 'O Stiven apresentou um empreendimento perfeito para mim e estruturou um pagamento que coube no meu orçamento. Recomendo muito.' },
  { nome: 'Fernando B.', cidade: 'Nova Veneza, SC', texto: 'A flexibilidade do financiamento direto foi o que fez a diferença. Sem filas, sem aprovação, só resultado.' },
]

const MARQUEE_ITEMS = ['Financiamento Direto', 'Sem Banco', 'Lançamentos', 'Sul Catarinense', 'Construtoras Parceiras', 'CRECI/RS 60.275', 'Sul de Santa Catarina', 'Visitas VIP', 'Financiamento Direto', 'Sem Banco', 'Lançamentos', 'Sul Catarinense', 'Construtoras Parceiras', 'CRECI/RS 60.275', 'Sul de Santa Catarina', 'Visitas VIP']

// Helper: exibe preco ou "Sob consulta" — sem React.CSSProperties para evitar erro de tipo
function PrecoDisplay({ exibir_preco, preco_a_partir_de, dark }: { exibir_preco: boolean; preco_a_partir_de: number | null; dark?: boolean }) {
  const color = dark ? 'rgba(245,241,234,0.6)' : c.muted
  const base = { fontSize: 13, fontWeight: 700, color } as const
  if (exibir_preco && preco_a_partir_de) {
    return <div style={base}>A partir de {brl(preco_a_partir_de)}</div>
  }
  return <div style={base}>Sob consulta</div>
}

async function getEmpreendimentosDB() {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return null
    const { data, error } = await supabase
      .from('empreendimentos')
      .select('id, nome, slug, bairro, cidade, uf, status_obra, area_privativa_min, area_privativa_max, imagem_capa_url, construtora, exibir_preco, preco_a_partir_de')
      .eq('status_venda', 'ativo')
      .order('created_at', { ascending: false })
      .limit(6)
    if (error || !data?.length) return null
    return data.map((e: any) => ({
      id: e.id, nome: e.nome, slug: e.slug,
      construtora_slug: (e.construtora || 'fontana').toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      construtora_nome: e.construtora || 'Construtora',
      bairro: e.bairro || '', cidade: e.cidade || 'Criciúma', uf: e.uf || 'SC',
      regiao: 'cidade', status_obra: e.status_obra || 'na planta',
      exibir_preco: e.exibir_preco ?? false,
      preco_a_partir_de: e.preco_a_partir_de ?? null,
      frase: 'Um novo padrão de viver no Sul Catarinense.',
      area_min: e.area_privativa_min, area_max: e.area_privativa_max,
      imagem_capa_url: e.imagem_capa_url || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=80',
    }))
  } catch { return null }
}

async function getCidadesComEmpreendimentos(): Promise<string[]> {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return ['criciúma']
    const { data } = await supabase
      .from('empreendimentos')
      .select('cidade')
      .eq('status_venda', 'ativo')
    if (!data?.length) return ['criciúma']
    return [...new Set(data.map((d: any) => (d.cidade || '').toLowerCase()))]
  } catch { return ['criciúma'] }
}

function cidadeParaSlug(cidade: string): string {
  return cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
}

const REGIOES_CONFIG = [
  { id: 'praia', label: 'PRAIA', icon: '🏖️', cidades: ['Balneário Piçarras', 'Rincão', 'Laguna'], cor: '#2563eb' },
  { id: 'serra', label: 'SERRA', icon: '⛰️', cidades: ['Nova Veneza', 'Bom Jardim da Serra'], cor: '#16a34a' },
  { id: 'cidade', label: 'CIDADE', icon: '🏙️', cidades: ['Criciúma', 'Içara', 'Forquilhinha'], cor: '#9333ea' },
]

function SiteHeader() {
  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(243,242,238,0.94)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: `1px solid ${c.line}` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: font.display, fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', color: c.ink, textDecoration: 'none' }}>
          STIVEN ALLAN
          <span style={{ display: 'block', fontSize: 9, fontWeight: 500, letterSpacing: '0.2em', color: c.muted, marginTop: 1, fontFamily: font.body }}>FINANCIAMENTO DIRETO · SUL SC</span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {[['/#empreendimentos', 'Empreendimentos'], ['/#como-funciona', 'Como Funciona'], ['/#sobre', 'Sobre']].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontSize: 13, fontWeight: 600, color: c.muted, textDecoration: 'none' }}>{label}</Link>
          ))}
          <a href={WPP_MSG} target="_blank" rel="noopener noreferrer" style={{ ...ui.btnConvert, fontSize: 13, padding: '10px 20px' }}>Tenho Interesse</a>
        </nav>
      </div>
    </header>
  )
}

const STATUS_BADGE: Record<string, string> = { 'na planta': '#1d4ed8', 'em obras': '#d97706', 'pronto': '#16a34a', 'lancamento': '#7c3aed', 'lançamento': '#7c3aed' }

function WppFloat() {
  return (
    <a href={WPP_MSG} target="_blank" rel="noopener noreferrer" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 90, width: 56, height: 56, borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(37,211,102,0.45)', textDecoration: 'none' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
  )
}

function SiteFooter({ cidades }: { cidades: string[] }) {
  return (
    <footer style={{ background: c.charcoal, color: c.onDark, padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,56px) 36px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 48, marginBottom: 56 }}>
          <div>
            <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', marginBottom: 6 }}>STIVEN ALLAN</div>
            <div style={{ fontSize: 11, color: c.onDarkMuted, letterSpacing: '0.2em', marginBottom: 20 }}>CRECI/RS 60.275</div>
            <p style={{ fontSize: 13, color: c.onDarkMuted, lineHeight: 1.75, maxWidth: 260 }}>Especialista em empreendimentos com financiamento direto no Sul de Santa Catarina.</p>
            <div style={{ marginTop: 20, fontSize: 12, color: 'rgba(245,241,234,0.4)', lineHeight: 1.8 }}>{cidades.join(' · ')}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', color: c.bronze, marginBottom: 18 }}>EMPREENDIMENTOS</div>
            {cidades.map(cid => (
              <div key={cid} style={{ marginBottom: 10 }}>
                <Link href={`/lancamentos/${cid.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-')}-sc`} style={{ fontSize: 13, color: 'rgba(245,241,234,0.55)', textDecoration: 'none' }}>{cid}/SC</Link>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', color: c.bronze, marginBottom: 18 }}>CONTATO</div>
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#25d366', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontWeight: 600 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              (48) 99164-2332
            </a>
            <a href="https://instagram.com/stivenallan.ofc" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'rgba(245,241,234,0.55)', textDecoration: 'none', display: 'block' }}>@stivenallan.ofc</a>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${c.lineDark}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'rgba(245,241,234,0.35)' }}>© {new Date().getFullYear()} Stiven Allan. CRECI/RS 60.275. Todos os direitos reservados.</p>
          <p style={{ fontSize: 12, color: 'rgba(245,241,234,0.35)' }}>Sul de Santa Catarina</p>
        </div>
      </div>
    </footer>
  )
}

export default async function HomePage() {
  const [dbPortfolio, cidadesComEmp] = await Promise.all([getEmpreendimentosDB(), getCidadesComEmpreendimentos()])
  const portfolio = dbPortfolio || PORTFOLIO_FALLBACK
  const cidadesAtivas = Array.from(new Set([...cidadesComEmp, ...portfolio.map((e: any) => (e.cidade || '').toLowerCase())].filter(Boolean)))
  const cidadesNomes = Array.from(new Set(portfolio.map((e: any) => e.cidade).filter(Boolean)))
  const destaque = portfolio[0]

  const regioesVisiveis = REGIOES_CONFIG.map(r => ({
    ...r, cidadesVisiveis: r.cidades.filter(c2 => cidadesAtivas.includes(c2.toLowerCase())),
  })).filter(r => r.cidadesVisiveis.length > 0)

  return (
    <>
      <SiteHeader />
      <section style={{ position: 'relative', minHeight: '100svh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: '#0d0c0b' }}>
        <Image src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=90" alt="Empreendimento no Sul de Santa Catarina" fill priority quality={90} style={{ objectFit: 'cover', objectPosition: 'center 40%', opacity: 0.28 }} sizes="100vw" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,9,8,0.85) 0%, rgba(10,9,8,0.3) 60%, rgba(10,9,8,0.7) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1100, margin: '0 auto', padding: 'clamp(110px,14vw,160px) clamp(20px,5vw,56px) clamp(80px,10vw,120px)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 40, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.bronze, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,241,234,0.7)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>CRECI/RS 60.275 · Sul de Santa Catarina</span>
          </div>
          <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 'clamp(2.4rem,6.5vw,5.2rem)', lineHeight: 1.02, letterSpacing: '-0.035em', color: '#f5f1ea', marginBottom: 28, maxWidth: '15ch' }}>Morar bem não deveria depender de um banco.</h1>
          <p style={{ fontSize: 'clamp(15px,1.8vw,18px)', color: 'rgba(245,241,234,0.65)', marginBottom: 48, maxWidth: '52ch', lineHeight: 1.7 }}>Empreendimentos com financiamento direto da construtora — sem a burocracia do banco.</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="#empreendimentos" style={{ ...ui.btnConvert, boxShadow: '0 8px 28px rgba(255,106,61,0.35)', fontSize: 15, padding: '14px 28px' }}>Conhecer empreendimentos</a>
            <a href={WPP_MSG} target="_blank" rel="noopener noreferrer" style={{ ...ui.btnSecondary, color: '#f5f1ea', borderColor: 'rgba(245,241,234,0.28)', fontSize: 15, padding: '14px 28px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>
      <div style={{ background: c.bronze, padding: '11px 0', overflow: 'hidden' }}>
        <div className="marquee-track" style={{ display: 'flex', gap: 0 }}>
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} style={{ fontFamily: font.display, fontWeight: 700, fontSize: 13, color: c.onDark, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0 24px', whiteSpace: 'nowrap' }}>
              {item}<span style={{ marginLeft: 24, color: 'rgba(243,242,238,0.4)' }}>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* 2. NAVEGAÇÃO POR REGIÃO — só exibe regiões com empreendimentos */}
      {regioesVisiveis.length > 0 && (
        <section style={{ background: c.paper, padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,56px)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(36px,4vw,56px)' }}>
              <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 12 }}>ONDE ATUAMOS</span>
              <h2 style={{ ...ui.h2, color: c.ink }}>Escolha sua região</h2>
              <p style={{ fontSize: 16, color: c.muted, marginTop: 12, maxWidth: '44ch', margin: '12px auto 0' }}>Do litoral à serra e às cidades do Sul Catarinense, curadoria de empreendimentos para cada estilo de vida.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20, justifyContent: 'center' }}>
              {regioesVisiveis.map((r) => (
                <div key={r.id} style={{ background: c.surface, border: `1px solid ${c.line}`, borderRadius: 6, padding: 'clamp(28px,3vw,40px) clamp(20px,2vw,28px)' }}>
                  <div style={{ fontSize: 40, marginBottom: 16, lineHeight: 1 }}>{r.icon}</div>
                  <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', color: c.ink, marginBottom: 12 }}>{r.label}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {r.cidadesVisiveis.map(cidade2 => (
                      <Link key={cidade2} href={`/lancamentos/${cidadeParaSlug(cidade2)}-sc`}
                        style={{ fontSize: 13, color: c.bronze, textDecoration: 'none', fontWeight: 600 }}>
                        {cidade2} →
                      </Link>
                    ))}
                  </div>
                  <div style={{ marginTop: 20, width: 36, height: 3, background: r.cor, borderRadius: 2 }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. VITRINE DE EMPREENDIMENTOS */}
      <section id="empreendimentos" style={{ padding: 'clamp(64px,7vw,100px) clamp(16px,4vw,56px)', background: c.paper }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 'clamp(36px,5vw,56px)' }}>
            <div>
              <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 12 }}>PORTFÓLIO</span>
              <h2 style={{ ...ui.h2, color: c.ink, margin: 0 }}>Empreendimentos em destaque</h2>
            </div>
            <Link href="/lancamentos/criciuma-sc" style={{ fontSize: 13, fontWeight: 600, color: c.bronze, textDecoration: 'none', letterSpacing: '0.04em' }}>Ver todos →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 28 }}>
            {portfolio.map((emp: any) => (
              <div key={emp.id} style={{ ...ui.card, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Link href={`/empreendimento/${emp.construtora_slug}/${emp.slug}`} style={{ display: 'block', position: 'relative', height: 280, overflow: 'hidden', flexShrink: 0, textDecoration: 'none' }}>
                  <Image
                    src={emp.imagem_capa_url}
                    alt={emp.nome}
                    fill
                    style={{ objectFit: 'cover', transition: 'transform .5s ease' }}
                    sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 50%,rgba(10,9,8,0.7) 100%)' }} />
                  <div style={{ position: 'absolute', top: 14, left: 14, background: STATUS_BADGE[emp.status_obra] || '#374151', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '5px 11px', borderRadius: 3 }}>
                    {emp.status_obra}
                  </div>
                  <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(10,9,8,0.72)', border: '1px solid rgba(255,255,255,0.15)', color: '#f5f1ea', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', padding: '4px 10px', borderRadius: 3 }}>
                    Financiamento direto
                  </div>
                </Link>
                <div style={{ padding: 'clamp(18px,2vw,24px)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: 11, color: c.bronze, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{emp.construtora_nome}</div>
                  <Link href={`/empreendimento/${emp.construtora_slug}/${emp.slug}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontFamily: font.display, fontWeight: 700, fontSize: 20, color: c.ink, lineHeight: 1.2, marginBottom: 6, letterSpacing: '-0.02em' }}>{emp.nome}</h3>
                  </Link>
                  <p style={{ fontSize: 13, color: c.muted, marginBottom: 10 }}>{emp.bairro ? emp.bairro + ', ' : ''}{emp.cidade}/{emp.uf}</p>
                  <p style={{ fontSize: 13, color: c.muted, lineHeight: 1.6, marginBottom: 'auto', fontStyle: 'italic' }}>“{emp.frase}”</p>
                  <div style={{ borderTop: `1px solid ${c.line}`, paddingTop: 16, marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <PrecoDisplay exibir_preco={emp.exibir_preco} preco_a_partir_de={emp.preco_a_partir_de} />
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Link href={`/empreendimento/${emp.construtora_slug}/${emp.slug}`}
                        style={{ background: c.charcoal, color: c.onDark, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '9px 14px', borderRadius: 3, textDecoration: 'none' }}>
                        Ver detalhes
                      </Link>
                      <a href={WPP_MSG} target="_blank" rel="noopener noreferrer"
                        style={{ background: '#25d366', color: '#fff', fontSize: 12, fontWeight: 700, padding: '9px 12px', borderRadius: 3, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. EMPREENDIMENTO EM DESTAQUE */}
      <section style={{ background: c.charcoal, padding: 'clamp(64px,7vw,100px) clamp(16px,4vw,56px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(40px,6vw,80px)', alignItems: 'center' }}>
          <Link href={`/empreendimento/${destaque.construtora_slug}/${destaque.slug}`} style={{ display: 'block', position: 'relative', height: 'clamp(360px,45vw,560px)', borderRadius: 4, overflow: 'hidden', textDecoration: 'none' }}>
            <Image src={destaque.imagem_capa_url} alt={destaque.nome} fill quality={88} style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 50vw" />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg,transparent,rgba(10,9,8,0.8))' }} />
          </Link>
          <div>
            <span style={{ ...ui.eyebrow, color: c.orange, display: 'block', marginBottom: 16 }}>EMPREENDIMENTO EM DESTAQUE</span>
            <h2 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', letterSpacing: '-0.025em', color: c.onDark, lineHeight: 1.1, marginBottom: 16 }}>{destaque.nome}</h2>
            <p style={{ fontSize: 16, color: c.onDarkMuted, lineHeight: 1.7, marginBottom: 28, fontStyle: 'italic' }}>{destaque.frase}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[destaque.cidade + '/' + destaque.uf, destaque.construtora_nome].filter(Boolean).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.bronze, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: c.onDarkMuted }}>{item}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.bronze, flexShrink: 0 }} />
                <PrecoDisplay exibir_preco={destaque.exibir_preco} preco_a_partir_de={destaque.preco_a_partir_de} dark />
              </div>
            </div>
            <div style={{ background: 'rgba(245,241,234,0.05)', border: '1px solid rgba(245,241,234,0.1)', borderLeft: '3px solid ' + c.bronze, borderRadius: 4, padding: '20px 24px', marginBottom: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: c.bronze, letterSpacing: '0.14em', marginBottom: 8 }}>CONDIÇÕES EXCLUSIVAS</div>
              <p style={{ fontSize: 14, color: c.onDarkMuted, lineHeight: 1.7, margin: 0 }}>Financiamento direto com a construtora, sem aprovação bancária. Condições negociadas na conversa.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href={`/empreendimento/${destaque.construtora_slug}/${destaque.slug}`}
                style={{ ...ui.btnPrimary, display: 'inline-block', textDecoration: 'none' }}>
                Ver detalhes
              </Link>
              <a href={WPP_MSG} target="_blank" rel="noopener noreferrer"
                style={{ ...ui.btnConvert, display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 28px rgba(255,106,61,0.35)' }}>
                Quero conhecer as condições
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMO FUNCIONA */}
      <section id="como-funciona" style={{ background: c.surface, padding: 'clamp(64px,7vw,100px) clamp(16px,4vw,56px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,6vw,72px)', maxWidth: '54ch', marginLeft: 'auto', marginRight: 'auto' }}>
            <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 14 }}>COMO FUNCIONA</span>
            <h2 style={{ ...ui.h2, color: c.ink }}>Financiamento direto: liberdade, não desconto.</h2>
            <p style={{ fontSize: 16, color: c.muted, marginTop: 16, lineHeight: 1.7 }}>Não é uma concesão. É um privilégio: você negocia direto com quem constrói, sem fila de banco, sem burocracia.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24 }}>
            {[
              { n: '01', title: 'Entrada negociada direto', desc: 'Sem exigências bancárias. A entrada é combinada entre você e a construtora, com flexibilidade real.' },
              { n: '02', title: 'Parcelas flexíveis', desc: 'O saldo é parcelado em condições acordadas direto com a construtora, sem spread bancário.' },
              { n: '03', title: 'Sem aprovação bancária', desc: 'Chega de filas e documentos. A decisão é tomada entre você e a construtora, com agilidade.' },
            ].map((s) => (
              <div key={s.n} style={{ background: c.paper, border: '1px solid ' + c.line, borderRadius: 6, padding: 'clamp(28px,3vw,40px)' }}>
                <div style={{ fontFamily: font.display, fontSize: 48, fontWeight: 800, color: c.bronze, lineHeight: 1, marginBottom: 20, letterSpacing: '-0.04em', opacity: 0.7 }}>{s.n}</div>
                <h3 style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, color: c.ink, marginBottom: 12, letterSpacing: '-0.01em' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <a href={WPP_MSG} target="_blank" rel="noopener noreferrer" style={{ ...ui.btnConvert, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              Quero saber mais
            </a>
          </div>
        </div>
      </section>

      <section id="sobre" style={{ background: c.paper, padding: 'clamp(64px,7vw,100px) clamp(16px,4vw,56px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 40, textAlign: 'center', marginBottom: 'clamp(56px,7vw,80px)', paddingBottom: 'clamp(56px,7vw,80px)', borderBottom: '1px solid ' + c.line }}>
            {[{ num: '+50', label: 'Empreendimentos', desc: 'no portfólio' }, { num: '8+', label: 'Anos', desc: 'de experiência' }, { num: '100%', label: 'Foco', desc: 'em financiamento direto' }, { num: '5★', label: 'Avaliação', desc: 'média dos clientes' }].map((m) => (
              <div key={m.num}>
                <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 'clamp(2rem,3.5vw,3rem)', letterSpacing: '-0.03em', color: c.bronze, lineHeight: 1 }}>{m.num}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: c.ink, marginTop: 8 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: c.muted, marginTop: 3 }}>{m.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(36px,4vw,56px)' }}>
            <span style={{ ...ui.eyebrow, display: 'block', marginBottom: 12 }}>DEPOIMENTOS</span>
            <h2 style={{ ...ui.h2, color: c.ink }}>O que dizem nossos clientes</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
            {DEPOIMENTOS.map((d, i) => (
              <div key={i} style={{ background: c.surface, border: '1px solid ' + c.line, borderRadius: 6, padding: 'clamp(24px,2.5vw,32px)' }}>
                <div style={{ fontSize: 28, color: c.bronze, lineHeight: 1, marginBottom: 16, fontFamily: 'Georgia, serif' }}>“</div>
                <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>{d.texto}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: c.line, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.display, fontWeight: 700, fontSize: 16, color: c.ink }}>{d.nome.charAt(0)}</div>
                  <div><div style={{ fontSize: 13, fontWeight: 700, color: c.ink }}>{d.nome}</div><div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>{d.cidade}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ background: c.charcoal, padding: 'clamp(64px,7vw,100px) clamp(16px,4vw,56px)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ ...ui.eyebrow, color: c.orange, display: 'block', marginBottom: 16 }}>COMECE AGORA</span>
          <h2 style={{ ...ui.h2, color: c.onDark }}>Vamos encontrar o seu imóvel ideal?</h2>
          <p style={{ color: c.onDarkMuted, marginTop: 16, fontSize: 16, lineHeight: 1.7 }}>Resposta rápida, sem enrolação e sem compromisso. As condições são reveladas na conversa.</p>
          <a href={WPP_MSG} target="_blank" rel="noopener noreferrer" style={{ ...ui.btnConvert, marginTop: 36, display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(255,106,61,0.4)', fontSize: 16, padding: '16px 36px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Falar no WhatsApp
          </a>
        </div>
      </section>
      <SiteFooter cidades={cidadesNomes} />
      <WppFloat />
    </>
  )
}
