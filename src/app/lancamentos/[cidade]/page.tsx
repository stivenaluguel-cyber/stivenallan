import type { Metadata } from 'next'
import Link from 'next/link'

// Cidades suportadas
const CIDADES: Record<string, { nome: string; uf: string; descricao: string }> = {
  'criciuma': { nome: 'Criciúma', uf: 'SC', descricao: 'Lançamentos imobiliários em Criciúma e região sul catarinense.' },
  'criciuma-sc': { nome: 'Criciúma', uf: 'SC', descricao: 'Lançamentos imobiliários em Criciúma e região sul catarinense.' },
  'icara': { nome: 'Içara', uf: 'SC', descricao: 'Empreendimentos e lançamentos em Içara/SC.' },
  'icara-sc': { nome: 'Içara', uf: 'SC', descricao: 'Empreendimentos e lançamentos em Içara/SC.' },
  'ararangua': { nome: 'Araraçoiaba da Serra', uf: 'SC', descricao: 'Imóveis e lançamentos em Araraçu/SC.' },
  'ararangua-sc': { nome: 'Araraçu', uf: 'SC', descricao: 'Imóveis e lançamentos em Araraçu/SC.' },
  'nova-veneza': { nome: 'Nova Veneza', uf: 'SC', descricao: 'Imóveis e lançamentos em Nova Veneza/SC.' },
  'nova-veneza-sc': { nome: 'Nova Veneza', uf: 'SC', descricao: 'Imóveis e lançamentos em Nova Veneza/SC.' },
  'forquilhinha': { nome: 'Forquilhinha', uf: 'SC', descricao: 'Lançamentos imobiliários em Forquilhinha/SC.' },
  'forquilhinha-sc': { nome: 'Forquilhinha', uf: 'SC', descricao: 'Lançamentos imobiliários em Forquilhinha/SC.' },
  'laguna': { nome: 'Laguna', uf: 'SC', descricao: 'Empreendimentos à beira-mar em Laguna/SC.' },
  'laguna-sc': { nome: 'Laguna', uf: 'SC', descricao: 'Empreendimentos à beira-mar em Laguna/SC.' },
  'rincao': { nome: 'Rincão', uf: 'SC', descricao: 'Empreendimentos em Rincão/SC.' },
  'rincao-sc': { nome: 'Rincão', uf: 'SC', descricao: 'Empreendimentos em Rincão/SC.' },
  'cocal-do-sul': { nome: 'Cocal do Sul', uf: 'SC', descricao: 'Empreendimentos em Cocal do Sul/SC.' },
  'cocal-do-sul-sc': { nome: 'Cocal do Sul', uf: 'SC', descricao: 'Empreendimentos em Cocal do Sul/SC.' },
  'sombrio': { nome: 'Sombrio', uf: 'SC', descricao: 'Lançamentos imobiliários em Sombrio/SC.' },
  'sombrio-sc': { nome: 'Sombrio', uf: 'SC', descricao: 'Lançamentos imobiliários em Sombrio/SC.' },
  'bom-jardim-da-serra': { nome: 'Bom Jardim da Serra', uf: 'SC', descricao: 'Empreendimentos na Serra Catarinense.' },
  'bom-jardim-da-serra-sc': { nome: 'Bom Jardim da Serra', uf: 'SC', descricao: 'Empreendimentos na Serra Catarinense.' },
}

// Portfólio hardcoded com preço híbrido (exibir_preco + preco_a_partir_de)
// REGRA: se exibir_preco=false, mostrar "Sob consulta" em TODOS os lugares
// Este objeto é o fallback — o ideal é vir do Supabase via exibir_preco
const EMPREENDIMENTOS_POR_CIDADE: Record<string, {
  nome: string; slug: string; construtora: string; dorms: string;
  exibir_preco: boolean; preco_a_partir_de: number | null;
}[]> = {
  'criciuma': [
    { nome: 'Monte Leone', slug: '/empreendimento/fontana/monte-leone-ana-lucia-criciuma-sc', construtora: 'Fontana', dorms: '2 e 3 dorms', exibir_preco: true, preco_a_partir_de: 280000 },
    { nome: 'Lavis Residencial', slug: '/empreendimento/fontana/lavis-residencial-centro-criciuma-sc', construtora: 'Fontana', dorms: '2 e 3 dorms', exibir_preco: true, preco_a_partir_de: 320000 },
    { nome: 'Pineto Residencial', slug: '/empreendimento/fontana/pineto-centro-criciuma-sc', construtora: 'Fontana', dorms: '2 e 3 dorms', exibir_preco: true, preco_a_partir_de: 350000 },
  ],
}

function formatPreco(exibir_preco: boolean, preco_a_partir_de: number | null): string {
  if (!exibir_preco || !preco_a_partir_de) return 'Sob consulta'
  const mil = preco_a_partir_de / 1000
  return `A partir de R$ ${mil % 1 === 0 ? mil.toFixed(0) : mil.toFixed(0)} mil`
}

type Props = { params: Promise<{ cidade: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade } = await params
  const info = CIDADES[cidade]
  if (!info) return {}
  return {
    title: `Lançamentos Imobiliários em ${info.nome}/${info.uf} | Stiven Allan`,
    description: `${info.descricao} Confira os melhores empreendimentos com Stiven Allan, CRECI/RS 60.275.`,
    alternates: { canonical: `https://stivenallan.vercel.app/lancamentos/${cidade}` },
    openGraph: {
      title: `Lançamentos em ${info.nome}/${info.uf} | Stiven Allan`,
      description: info.descricao,
    },
  }
}

export async function generateStaticParams() {
  return Object.keys(CIDADES).map((cidade) => ({ cidade }))
}

export default async function LancamentosCidadePage({ params }: Props) {
  const { cidade } = await params
  const info = CIDADES[cidade]
  const wppUrl = 'https://wa.me/5548991642332?text=Ol%C3%A1+Stiven!+Vi+o+site+e+quero+saber+dos+lan%C3%A7amentos.'

  if (!info) {
    return (
      <main style={{ background: '#121315', minHeight: '100vh', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', gap: 20 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Cidade não encontrada</h1>
        <Link href="/" style={{ color: '#c9a24b', textDecoration: 'none', fontSize: 16 }}>Voltar ao início</Link>
      </main>
    )
  }

  const cityKey = cidade.replace('-sc', '')
  const empreendimentos = EMPREENDIMENTOS_POR_CIDADE[cityKey] || []

  return (
    <main style={{ background: '#121315', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <section style={{ padding: '80px 24px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <nav style={{ marginBottom: 40 }}>
          <ol style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0, fontSize: 14, color: '#a7adb4' }}>
            <li><Link href="/" style={{ color: '#a7adb4', textDecoration: 'none' }}>Início</Link></li>
            <li style={{ color: '#c9a24b' }}>&rsaquo;</li>
            <li><Link href="/lancamentos/criciuma-sc" style={{ color: '#a7adb4', textDecoration: 'none' }}>Lançamentos</Link></li>
            <li style={{ color: '#c9a24b' }}>&rsaquo;</li>
            <li style={{ color: '#fff' }}>{info.nome}/{info.uf}</li>
          </ol>
        </nav>

        <p style={{ fontSize: 13, letterSpacing: '0.12em', color: '#c9a24b', textTransform: 'uppercase', marginBottom: 16 }}>
          {info.uf} — Região Sul Catarinense
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
          Lançamentos em{' '}
          <span style={{ color: '#c9a24b' }}>{info.nome}, {info.uf}</span>
        </h1>
        <p style={{ fontSize: 17, color: '#a7adb4', lineHeight: 1.7, maxWidth: 600, marginBottom: 40 }}>
          {info.descricao} Atendimento exclusivo do corretor Stiven Allan, CRECI/RS 60.275.
        </p>

        {empreendimentos.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 60 }}>
            {empreendimentos.map((emp, i) => (
              <Link key={i} href={emp.slug} style={{ display: 'block', background: '#202327', borderRadius: 12, padding: '28px 24px', border: '1px solid #2e3338', textDecoration: 'none', color: '#fff' }}>
                <p style={{ fontSize: 12, color: '#c9a24b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{emp.construtora}</p>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{emp.nome}</h2>
                <p style={{ fontSize: 14, color: '#a7adb4', marginBottom: 4 }}>{emp.dorms}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#c9a24b', marginBottom: 16 }}>
                  {formatPreco(emp.exibir_preco, emp.preco_a_partir_de)}
                </p>
                <span style={{ fontSize: 13, color: '#c9a24b', fontWeight: 600 }}>Ver detalhes →</span>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ background: '#202327', borderRadius: 12, padding: '40px 32px', border: '1px solid #2e3338', marginBottom: 60, textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Em breve lançamentos em {info.nome}</h2>
            <p style={{ fontSize: 15, color: '#a7adb4', marginBottom: 24 }}>Cadastre-se para receber novidades em primeira mão.</p>
            <a href={wppUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#25D366', color: '#fff', fontWeight: 700, padding: '12px 24px', borderRadius: 8, textDecoration: 'none' }}>
              Avisar quando lançar
            </a>
          </div>
        )}

        <div style={{ background: 'linear-gradient(135deg, #c9a24b15, #c9a24b05)', borderRadius: 16, padding: '48px 32px', border: '1px solid #c9a24b30', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 12 }}>
            Quer saber mais sobre lançamentos em {info.nome}?
          </h2>
          <p style={{ fontSize: 16, color: '#a7adb4', marginBottom: 28 }}>
            Fale agora com o Stiven via WhatsApp e receba atendimento personalizado.
          </p>
          <a href={wppUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 16, padding: '14px 32px', borderRadius: 10, textDecoration: 'none' }}>
            Falar com Corretor no WhatsApp
          </a>
        </div>
      </section>
    </main>
  )
}
