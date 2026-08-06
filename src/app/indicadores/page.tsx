import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'
import { buscarCub } from '@/lib/cub-sinduscon'
import { buscarIndicadoresBcb, type IndicadorValor } from '@/lib/indicadores-bcb'

// Dados de mercado mudam todo dia útil — 1h de cache evita bater nas APIs do
// BC a cada request sem deixar a página visivelmente desatualizada.
export const revalidate = 3600

const CANONICAL = `${SITE_URL}/indicadores`
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20vi%20os%20indicadores%20do%20site%20e%20quero%20simular%20um%20financiamento.'

export const metadata: Metadata = {
  title: 'Indicadores do Mercado Imobiliário: CUB/SC, Selic, CDI, IGP-M, Dólar',
  description: 'Acompanhe os indicadores que afetam financiamento e correção de parcelas em Criciúma/SC: CUB/SC, Selic, CDI, IGP-M, Poupança, Dólar e Euro — atualizados direto do Banco Central.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Indicadores do Mercado Imobiliário | Stiven Allan',
    description: 'CUB/SC, Selic, CDI, IGP-M, Poupança, Dólar e Euro — atualizados direto do Banco Central. Referência para quem financia imóvel em Criciúma/SC.',
    url: CANONICAL,
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Indicadores do Mercado Imobiliário | Stiven Allan' },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Indicadores do Mercado Imobiliário',
  description: 'CUB/SC, Selic, CDI, IGP-M, Poupança, Dólar e Euro, atualizados direto do Banco Central.',
  url: CANONICAL,
  publisher: { '@type': 'Organization', name: 'Stiven Allan Imóveis', url: SITE_URL },
}

function fmtPct(v: IndicadorValor | null, casas = 2): string {
  if (!v) return '—'
  return `${v.valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`
}

function fmtBrl(v: number): string {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const H2 = { fontFamily: 'var(--font-piazzolla), Georgia, serif', fontWeight: 600, fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }
const P = { fontSize: 16, lineHeight: 1.8, color: '#333' }

export default async function IndicadoresPage() {
  const [cub, bcb] = await Promise.all([buscarCub(), buscarIndicadoresBcb()])

  const cards: Array<{ label: string; valor: string; nota: string }> = [
    { label: 'CUB/SC', valor: `${fmtBrl(cub.valor_m2)}/m²`, nota: `${cub.usar_em_label} · Sinduscon` },
    { label: 'Dólar comercial', valor: bcb.dolar ? fmtBrl(bcb.dolar.venda) : '—', nota: bcb.dolar ? `venda · ${bcb.dolar.data} · Banco Central` : 'indisponível no momento' },
    { label: 'Euro', valor: bcb.euro ? fmtBrl(bcb.euro.venda) : '—', nota: bcb.euro ? `venda · ${bcb.euro.data} · Banco Central` : 'indisponível no momento' },
    { label: 'Selic (meta)', valor: fmtPct(bcb.selic), nota: bcb.selic ? `a.a. · ${bcb.selic.data} · Banco Central` : 'indisponível no momento' },
    { label: 'CDI', valor: fmtPct(bcb.cdi), nota: bcb.cdi ? `acumulado no mês · ${bcb.cdi.data} · Banco Central` : 'indisponível no momento' },
    { label: 'IGP-M', valor: fmtPct(bcb.igpm), nota: bcb.igpm ? `variação mensal · ${bcb.igpm.data} · FGV/Banco Central` : 'indisponível no momento' },
    { label: 'Poupança', valor: fmtPct(bcb.poupanca, 4), nota: bcb.poupanca ? `rendimento do período · ${bcb.poupanca.data} · Banco Central` : 'indisponível no momento' },
  ]

  return (
    <main style={{ background: '#FAFAF8', color: '#1A1A1A', fontFamily: 'var(--font-public-sans), system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '16px clamp(18px,5vw,64px)' }}>
        <nav style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-piazzolla), Georgia, serif', fontWeight: 400, fontSize: 15, color: '#1A1A1A', textDecoration: 'none' }}>Stiven Allan</Link>
          <Link href="/empreendimentos" style={{ fontSize: 15, color: '#1B5E8B', textDecoration: 'none' }}>Ver Empreendimentos</Link>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ background: '#0F1C22', color: '#E4EEF6', padding: 'clamp(64px,12vh,120px) clamp(18px,5vw,64px)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(228,238,246,0.55)', marginBottom: 20 }}>Mercado</p>
          <h1 style={{ fontFamily: 'var(--font-piazzolla), Georgia, serif', fontWeight: 600, fontSize: 'clamp(28px,5vw,52px)', lineHeight: 1.1, margin: 0 }}>
            Indicadores do Mercado Imobiliário
          </h1>
          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(228,238,246,0.75)', marginTop: 24, lineHeight: 1.6, maxWidth: 680 }}>
            CUB/SC, Selic, CDI, IGP-M, Poupança, Dólar e Euro — direto do Banco Central, atualizados a cada hora. Referência pra quem está financiando um imóvel em Criciúma e região.
          </p>
        </div>
      </section>

      {/* CARDS */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(40px,6vh,64px) clamp(18px,5vw,64px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {cards.map((c) => (
            <div key={c.label} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, padding: '24px 24px' }}>
              <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#1B5E8B', fontWeight: 600 }}>{c.label}</p>
              <p style={{ margin: '10px 0 0', fontSize: 'clamp(22px,3vw,30px)', fontFamily: 'var(--font-piazzolla), Georgia, serif', fontWeight: 600 }}>{c.valor}</p>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#888' }}>{c.nota}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTEÚDO */}
      <article style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vh,96px) clamp(18px,5vw,64px)' }}>
        <h2 style={H2}>Por que esses indicadores importam</h2>
        <p style={P}>
          Quem financia um imóvel — seja direto com a construtora ou por banco — está exposto a pelo menos um desses índices. No financiamento direto com a Construtora Fontana, as parcelas durante a obra são corrigidas pelo <strong>CUB/SC</strong>. Já num financiamento bancário pós-chaves, a taxa costuma ter como referência a <strong>Selic</strong> e o <strong>CDI</strong>. O <strong>IGP-M</strong> aparece em contratos de aluguel e em alguns reajustes contratuais. Acompanhar esses números ajuda a planejar o orçamento e conferir se a correção cobrada está correta.
        </p>

        <h2 style={H2}>CUB/SC e correção de parcelas</h2>
        <p style={P}>
          Quer entender o cálculo completo, com exemplos de como a parcela sobe mês a mês durante a obra? Veja o guia dedicado:
        </p>
        <p style={P}>
          <Link href="/guia/cub-sc-correcao-parcelas" style={{ color: '#1B5E8B', fontWeight: 600 }}>CUB/SC e Correção de Parcelas no Financiamento Direto →</Link>
        </p>

        <div style={{ marginTop: 40, background: '#0F1C22', color: '#E4EEF6', borderRadius: 2, padding: '32px 28px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6 }}>Quer simular o impacto desses indicadores no seu financiamento?</p>
          <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 20, background: '#1B5E8B', color: '#fff', textDecoration: 'none', padding: '14px 32px', borderRadius: 2, fontSize: 15, fontWeight: 600 }}>
            Falar com Stiven no WhatsApp
          </a>
        </div>

        <p style={{ fontSize: 12, color: '#888', marginTop: 32 }}>
          Fontes: CUB/SC — <a href="https://sinduscon-fpolis.org.br/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>Sinduscon (Grande Florianópolis)</a>. Selic, CDI, IGP-M, Poupança, Dólar e Euro — <a href="https://www.bcb.gov.br/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>Banco Central do Brasil</a> (Sistema Gerenciador de Séries Temporais e PTAX). Atualizado em {new Date(bcb.atualizado_em).toLocaleString('pt-BR')}.
        </p>
      </article>
    </main>
  )
}
