import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

const CANONICAL = `${SITE_URL}/guia`
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20quero%20saber%20mais%20sobre%20os%20guias%20de%20financiamento%20e%20compra.'

export const metadata: Metadata = {
    title: 'Guias sobre Financiamento e Compra de Imoveis',
    description: 'Guias completos sobre financiamento direto, CUB/SC, compra na planta e onde investir no Sul de Santa Catarina.',
    alternates: { canonical: CANONICAL },
    openGraph: {
        title: 'Guias sobre Financiamento e Compra de Imoveis | Stiven Allan',
        description: 'Conteudo completo sobre financiamento direto, CUB/SC, planta vs. pronto e onde investir no Sul de Santa Catarina.',
        url: CANONICAL,
        type: 'website',
    },
    twitter: { card: 'summary_large_image', title: 'Guias sobre Financiamento e Compra de Imoveis | Stiven Allan' },
}

const BREADCRUMB_SCHEMA = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Guias', item: CANONICAL },
    ],
}

const GUIAS = [
    {
        slug: 'financiamento-direto-construtora',
        titulo: 'Financiamento Direto com a Construtora',
        resumo: 'Entenda como funciona o financiamento direto Fontana: entrada de 20%, parcelas corrigidas pelo CUB/SC e sem necessidade de aprovacao bancaria.',
    },
    {
        slug: 'comprar-apartamento-na-planta-criciuma',
        titulo: 'Como Comprar Apartamento na Planta em Criciuma/SC',
        resumo: 'Guia completo com etapas, riscos e vantagens de comprar um apartamento na planta em Criciuma/SC.',
    },
    {
        slug: 'cub-sc-correcao-parcelas',
        titulo: 'CUB/SC e Correcao de Parcelas',
        resumo: 'Entenda o que e o CUB/SC e como ele corrige as parcelas do financiamento direto durante a obra.',
    },
    {
        slug: 'financiamento-direto-vs-bancario',
        titulo: 'Financiamento Direto vs. Bancario',
        resumo: 'Compare o financiamento direto com a construtora e o financiamento bancario tradicional, com exemplos reais.',
    },
    {
        slug: 'apartamento-na-planta-vs-pronto',
        titulo: 'Apartamento na Planta vs. Pronto',
        resumo: 'Compare vantagens, condicoes de pagamento e prazos entre comprar na planta e comprar um imovel pronto.',
    },
    {
        slug: 'onde-investir-sul-santa-catarina',
        titulo: 'Onde Investir no Sul de Santa Catarina',
        resumo: 'Conheca as cidades com empreendimentos ativos no Sul de Santa Catarina e o perfil de cada regiao.',
    },
    {
        slug: 'apartamento-frente-mar-rincao-ou-laguna',
        titulo: 'Balneario Rincao ou Laguna: Onde Comprar Frente Mar',
        resumo: 'Compare Balneario Rincao e Laguna (Mar Grosso) para comprar apartamento frente mar na planta, com valorizacao, perfil de cada praia e financiamento direto com a construtora.',
    },
]

export default function GuiaIndexPage() {
    return (
        <main style={{ background: '#FAFAF8', color: '#1A1814', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />

            {/* HEADER */}
            <header style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '16px clamp(18px,5vw,64px)' }}>
                <nav style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/" style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 400, letterSpacing: '0.22em', fontSize: 15, color: '#1A1A1A', textDecoration: 'none', textTransform: 'uppercase' }}>Stiven Allan</Link>
                    <Link href="/empreendimentos" style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#B89B5E', textDecoration: 'none' }}>Ver Empreendimentos</Link>
                </nav>
            </header>

            {/* HERO */}
            <section style={{ background: '#1A1814', color: '#F5F1EA', padding: 'clamp(64px,12vh,120px) clamp(18px,5vw,64px)' }}>
                <div style={{ maxWidth: 1080, margin: '0 auto' }}>
                    <p style={{ fontSize: 11, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(245,241,234,0.55)', marginBottom: 20 }}>Central de Conteudo</p>
                    <h1 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 'clamp(28px,5vw,52px)', lineHeight: 1.1, margin: 0 }}>
                        Guias sobre Financiamento e Compra de Imoveis
                    </h1>
                    <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(245,241,234,0.75)', marginTop: 24, lineHeight: 1.6, maxWidth: 640 }}>
                        Conteudo completo e factual sobre financiamento direto, CUB/SC, compra na planta e as regioes com empreendimentos ativos no Sul de Santa Catarina.
                    </p>
                </div>
            </section>

            {/* GRID DE GUIAS */}
            <section style={{ padding: 'clamp(48px,8vh,96px) clamp(18px,5vw,64px)' }}>
                <div style={{ maxWidth: 1080, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 28 }}>
                        {GUIAS.map((g) => (
                            <Link
                                key={g.slug}
                                href={`/guia/${g.slug}`}
                                style={{
                                    display: 'block',
                                    background: '#fff',
                                    border: '1px solid rgba(26,24,20,0.10)',
                                    borderTop: '3px solid #B89B5E',
                                    borderRadius: 2,
                                    padding: '28px 26px',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                }}
                            >
                                <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 400, fontSize: 'clamp(17px,2vw,20px)', lineHeight: 1.3, margin: '0 0 12px', color: '#1A1814' }}>
                                    {g.titulo}
                                </h2>
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#555', margin: '0 0 20px' }}>
                                    {g.resumo}
                                </p>
                                <span style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#8A7240', fontWeight: 500 }}>
                                    Ler guia completo &rarr;
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '0 clamp(18px,5vw,64px) clamp(72px,10vh,120px)' }}>
                <div style={{ maxWidth: 1080, margin: '0 auto' }}>
                    <div style={{ background: '#1A1814', color: '#F5F1EA', borderRadius: 2, padding: 'clamp(32px,5vw,56px)', textAlign: 'center' }}>
                        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,28px)', margin: 0 }}>Ainda tem duvidas?</h2>
                        <p style={{ color: 'rgba(245,241,234,0.8)', marginTop: 16, marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
                            Fale direto com Stiven Allan, CRECI 60.275, e tire suas duvidas sobre financiamento e os empreendimentos disponiveis.
                        </p>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#F5F1EA', border: '1px solid rgba(245,241,234,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
                                Falar no WhatsApp
                            </a>
                            <Link href="/empreendimentos" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#F5F1EA', border: '1px solid rgba(245,241,234,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
                                Ver Empreendimentos
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ background: '#111', color: 'rgba(255,255,255,0.4)', padding: 'clamp(32px,5vh,56px) clamp(18px,5vw,64px)', textAlign: 'center', fontSize: 12 }}>
                <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} Stiven Allan - CRECI 60.275 - Imoveis em Criciuma e Sul de SC</p>
                <p style={{ margin: '8px 0 0' }}>
                    <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Inicio</Link>
                    <Link href="/empreendimentos" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Empreendimentos</Link>
                    <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>WhatsApp</a>
                </p>
            </footer>
        </main>
    )
}
