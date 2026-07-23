import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { imoveis } from '@/data/imoveis'
import { granPalazzo } from '@/data/eraldo/gran-palazzo'
import { play } from '@/data/eraldo/play'
import type { Empreendimento as EmpreendimentoEraldo } from '@/data/eraldo/types'

// Cidades suportadas
const CIDADES: Record<string, { nome: string; uf: string; descricao: string }> = {
  'criciuma': { nome: 'Criciúma', uf: 'SC', descricao: 'Lançamentos imobiliários em Criciúma e região sul catarinense.' },
  'criciuma-sc': { nome: 'Criciúma', uf: 'SC', descricao: 'Lançamentos imobiliários em Criciúma e região sul catarinense.' },
  'icara': { nome: 'Içara', uf: 'SC', descricao: 'Empreendimentos e lançamentos em Içara/SC.' },
  'icara-sc': { nome: 'Içara', uf: 'SC', descricao: 'Empreendimentos e lançamentos em Içara/SC.' },
  'ararangua': { nome: 'Araranguá', uf: 'SC', descricao: 'Lançamentos e imóveis em Araranguá/SC.' },
  'ararangua-sc': { nome: 'Araranguá', uf: 'SC', descricao: 'Lançamentos e imóveis em Araranguá/SC.' },
  'nova-veneza': { nome: 'Nova Veneza', uf: 'SC', descricao: 'Imóveis e lançamentos em Nova Veneza/SC.' },
  'nova-veneza-sc': { nome: 'Nova Veneza', uf: 'SC', descricao: 'Imóveis e lançamentos em Nova Veneza/SC.' },
  'forquilhinha': { nome: 'Forquilhinha', uf: 'SC', descricao: 'Lançamentos imobiliários em Forquilhinha/SC.' },
  'forquilhinha-sc': { nome: 'Forquilhinha', uf: 'SC', descricao: 'Lançamentos imobiliários em Forquilhinha/SC.' },
  'laguna': { nome: 'Laguna', uf: 'SC', descricao: 'Empreendimentos à beira-mar em Laguna/SC.' },
  'laguna-sc': { nome: 'Laguna', uf: 'SC', descricao: 'Empreendimentos à beira-mar em Laguna/SC.' },
  'rincao': { nome: 'Rincão', uf: 'SC', descricao: 'Empreendimentos em Rincão/SC.' },
  'rincao-sc': { nome: 'Rincão', uf: 'SC', descricao: 'Empreendimentos em Rincão/SC.' },
  'balneario-rincao': { nome: 'Balneário Rincão', uf: 'SC', descricao: 'Empreendimentos frente mar em Balneário Rincão/SC, o litoral mais exclusivo do sul catarinense.' },
  'balneario-rincao-sc': { nome: 'Balneário Rincão', uf: 'SC', descricao: 'Empreendimentos frente mar em Balneário Rincão/SC, o litoral mais exclusivo do sul catarinense.' },
  'sideropolis': { nome: 'Siderópolis', uf: 'SC', descricao: 'Empreendimentos e lançamentos em Siderópolis/SC.' },
  'sideropolis-sc': { nome: 'Siderópolis', uf: 'SC', descricao: 'Empreendimentos e lançamentos em Siderópolis/SC.' },
  'cocal-do-sul': { nome: 'Cocal do Sul', uf: 'SC', descricao: 'Empreendimentos em Cocal do Sul/SC.' },
  'cocal-do-sul-sc': { nome: 'Cocal do Sul', uf: 'SC', descricao: 'Empreendimentos em Cocal do Sul/SC.' },
  'sombrio': { nome: 'Sombrio', uf: 'SC', descricao: 'Lançamentos imobiliários em Sombrio/SC.' },
  'sombrio-sc': { nome: 'Sombrio', uf: 'SC', descricao: 'Lançamentos imobiliários em Sombrio/SC.' },
  'bom-jardim-da-serra': { nome: 'Bom Jardim da Serra', uf: 'SC', descricao: 'Empreendimentos na Serra Catarinense.' },
  'bom-jardim-da-serra-sc': { nome: 'Bom Jardim da Serra', uf: 'SC', descricao: 'Empreendimentos na Serra Catarinense.' },
  'balneario-picarras': { nome: 'Balneário Piçarras', uf: 'SC', descricao: 'Empreendimentos frente mar em Balneário Piçarras/SC.' },
  'balneario-picarras-sc': { nome: 'Balneário Piçarras', uf: 'SC', descricao: 'Empreendimentos frente mar em Balneário Piçarras/SC.' },
  // Tubarão só tem empreendimentos da Eraldo Construções (não da Fontana) — dados
  // reais em src/data/eraldo/gran-palazzo.ts e src/data/eraldo/play.ts, ambos na
  // Vila Moema. Antes desta correção, "tubarao"/"tubarao-sc" não existia aqui, e a
  // página caía no branch `!info` (200 com "Cidade não encontrada") mesmo aparecendo
  // no sitemap — achado da auditoria SEO 2026-07-21.
  'tubarao': { nome: 'Tubarão', uf: 'SC', descricao: 'Empreendimentos da Eraldo Construções na Vila Moema, Tubarão/SC.' },
  'tubarao-sc': { nome: 'Tubarão', uf: 'SC', descricao: 'Empreendimentos da Eraldo Construções na Vila Moema, Tubarão/SC.' },
}

// Seleção editorial de quais empreendimentos aparecem como card em cada cidade.
// Os DADOS de cada um (nome, status/fase, preço) vêm de @/data/imoveis — nada hardcoded aqui.
const SLUGS_POR_CIDADE: Record<string, string[]> = {
  'criciuma': [
    'monte-leone-centro-criciuma-sc',
    'lavis-residencial-centro-criciuma-sc',
    'pineto-centro-criciuma-sc',
  ],
  'balneario-picarras': [
    'aguas-de-marano-frente-mar-balneario-picarras-sc',
  ],
  'icara': [
    'castellano-centro-icara-sc',
    'pianezze-centro-icara-sc',
    'piazza-castello-centro-icara-sc',
  ],
  'balneario-rincao': [
    'mar-di-arienzo-centro-balneario-rincao-sc',
    'mar-di-atrani-centro-balneario-rincao-sc',
    'mar-positano-centro-balneario-rincao-sc',
    'villammare-residencial-balneario-rincao-sc',
  ],
  'laguna': [
    'mar-di-licata-mar-grosso-laguna-sc',
    'mar-di-nizza-mar-grosso-laguna-sc',
  ],
  'sideropolis': [
    'avezzano-centro-sideropolis-sc',
    'rocca-pietore-centro-sideropolis-sc',
  ],
}

// Dormitórios não existem em @/data/imoveis (dado de planta, não de status/preço).
const DORMS_POR_SLUG: Record<string, string> = {
  'monte-leone-centro-criciuma-sc': '2 e 3 dorms',
  'lavis-residencial-centro-criciuma-sc': '2 e 3 dorms',
  'pineto-centro-criciuma-sc': '2 dorms · 1 suíte',
  'aguas-de-marano-frente-mar-balneario-picarras-sc': '3 e 4 dorms · 3 suítes',
  'castellano-centro-icara-sc': '3 dorms',
  'pianezze-centro-icara-sc': '2 e 3 dorms · 1 suíte',
  'piazza-castello-centro-icara-sc': '3 dorms · 3 suítes',
  'mar-di-arienzo-centro-balneario-rincao-sc': '3 dorms · 1 suíte',
  'mar-di-atrani-centro-balneario-rincao-sc': '3 dorms · 1 suíte',
  'mar-positano-centro-balneario-rincao-sc': '3 dorms · 1 suíte',
  'villammare-residencial-balneario-rincao-sc': '4 dorms · 2 suítes + 2 demi suítes',
  'mar-di-licata-mar-grosso-laguna-sc': '3 dorms · 1 suíte',
  'mar-di-nizza-mar-grosso-laguna-sc': '2 e 3 dorms · 1 suíte',
  'avezzano-centro-sideropolis-sc': '3 dorms · 3 suítes',
  'rocca-pietore-centro-sideropolis-sc': '2 ou 3 dorms · 1 suíte',
}

// Conteúdo de contexto de mercado para cidades com poucos empreendimentos (1 bairro
// cada, ao contrário de Criciúma que tem 7) — por isso não têm seção de "bairros
// ativos" própria, diferente do bloco cityKey === 'criciuma' abaixo. Fatos extraídos
// das páginas estáticas reais de cada empreendimento (meta description/FAQ), não
// inventados.
const CONTEUDO_POR_CIDADE: Record<
  string,
  { mercado: string; faqs: { pergunta: string; resposta: string }[] }
> = {
  'icara': {
    mercado:
      'Içara concentra hoje três empreendimentos ativos da Construtora Fontana, todos no Centro da cidade: o Castellano Residencial, com apartamentos de 3 dormitórios e 109 a 112 m² privativos, em obras; o Pianezze Residencial, com unidades de 2 e 3 dormitórios (1 suíte) e 66 a 86 m², já pronto para morar; e o Piazza Castello Residencial, com 3 dormitórios (3 suítes) e até 172 m² privativos. A combinação de um lançamento em obras com um empreendimento já pronto dá a quem procura imóvel em Içara a opção de comprar na planta com parcelas menores ou mudar em pouco tempo para um apartamento pronto — fale com o corretor para confirmar a disponibilidade e o status atualizado de cada empreendimento.',
    faqs: [
      {
        pergunta: 'Quais empreendimentos da Fontana estão ativos em Içara hoje?',
        resposta:
          'Castellano Residencial (em obras), Pianezze Residencial (pronto para morar) e Piazza Castello Residencial (consulte o status atualizado), todos no Centro de Içara/SC.',
      },
      {
        pergunta: 'Como funciona o financiamento direto da Fontana em Içara?',
        resposta:
          'O modelo prevê entrada de 20% no ato da assinatura, saldo parcelado mensalmente com reforços anuais e correção pelo CUB/SC durante a obra, sem necessidade de aprovação bancária.',
      },
      {
        pergunta: 'Qual a diferença entre o Castellano e os outros dois empreendimentos em Içara?',
        resposta:
          'O Castellano Residencial ainda está em obras, com parcelas menores durante a construção. O Pianezze Residencial já está pronto para morar, no mesmo bairro Centro; consulte o corretor para o status atualizado do Piazza Castello Residencial.',
      },
    ],
  },
  'balneario-rincao': {
    mercado:
      'Balneário Rincão, o litoral mais exclusivo do sul catarinense, concentra hoje quatro empreendimentos ativos da Fontana, todos no Centro e em obras: o Mar di Arienzo Residencial (3 dormitórios com suíte, 97 a 109 m²), o Mar di Atrani Residencial (3 dormitórios com suíte, 100 a 101 m², a 250 metros da beira-mar), o Mar Positano Residencial (3 dormitórios com 1 suíte, 107 a 126 m², sacada com churrasqueira) e o Villammare Residencial (4 dormitórios — 2 suítes e 2 demi suítes —, 172 a 275 m², a passos da praia). É a cidade com a maior concentração de lançamentos da Fontana no litoral, reforçando o Centro de Balneário Rincão como destino de apartamentos próximos à praia.',
    faqs: [
      {
        pergunta: 'Quais empreendimentos da Fontana estão ativos em Balneário Rincão hoje?',
        resposta:
          'Mar di Arienzo Residencial, Mar di Atrani Residencial, Mar Positano Residencial e Villammare Residencial, todos no Centro de Balneário Rincão/SC e em obras.',
      },
      {
        pergunta: 'Como funciona o financiamento direto da Fontana em Balneário Rincão?',
        resposta:
          'O modelo prevê entrada de 20% no ato da assinatura, saldo parcelado mensalmente com reforços anuais e correção pelo CUB/SC durante a obra, sem necessidade de aprovação bancária.',
      },
      {
        pergunta: 'Os empreendimentos da Fontana em Balneário Rincão são frente mar?',
        resposta:
          'O Mar di Atrani Residencial fica a 250 metros da beira-mar e o Villammare Residencial é a passos da praia; o Mar di Arienzo Residencial e o Mar Positano Residencial ficam no Centro de Balneário Rincão, próximos à orla.',
      },
    ],
  },
  'laguna': {
    mercado:
      'Em Laguna, a Fontana constrói dois empreendimentos no bairro Mar Grosso, ambos em obras: o Mar di Licata Residencial, com apartamentos de 3 dormitórios e suíte, 120 a 122 m² privativos e rooftop com vista para o mar, e o Mar di Nizza Residencial, com unidades de 2 e 3 dormitórios (1 suíte) e 65 a 92 m² privativos. Os dois lançamentos reforçam o Mar Grosso como um dos bairros mais procurados de Laguna para quem busca um apartamento perto do litoral com financiamento direto da construtora.',
    faqs: [
      {
        pergunta: 'Quais empreendimentos da Fontana estão ativos em Laguna hoje?',
        resposta:
          'Mar di Licata Residencial e Mar di Nizza Residencial, os dois no bairro Mar Grosso, em Laguna/SC, e em obras.',
      },
      {
        pergunta: 'Como funciona o financiamento direto da Fontana em Laguna?',
        resposta:
          'O modelo prevê entrada de 20% no ato da assinatura, saldo parcelado mensalmente com reforços anuais e correção pelo CUB/SC durante a obra, sem necessidade de aprovação bancária.',
      },
      {
        pergunta: 'Onde ficam os empreendimentos da Fontana em Laguna?',
        resposta: 'Os dois lançamentos ativos da Fontana em Laguna ficam no bairro Mar Grosso.',
      },
    ],
  },
  'balneario-picarras': {
    mercado:
      'Em Balneário Piçarras, a Fontana constrói o Águas de Marano Residencial, no Frente Mar, com apartamentos de 3 e 4 dormitórios (até 3 suítes) e 196 a 199 m² privativos, atualmente em obras, com previsão de entrega em julho de 2028. É o único lançamento ativo da construtora na cidade até o momento, com localização frente mar.',
    faqs: [
      {
        pergunta: 'Qual empreendimento da Fontana está ativo em Balneário Piçarras hoje?',
        resposta:
          'O Águas de Marano Residencial, no Frente Mar de Balneário Piçarras/SC, atualmente em obras.',
      },
      {
        pergunta: 'Como funciona o financiamento direto da Fontana em Balneário Piçarras?',
        resposta:
          'O modelo prevê entrada de 20% no ato da assinatura, saldo parcelado mensalmente com reforços anuais e correção pelo CUB/SC durante a obra, sem necessidade de aprovação bancária.',
      },
      {
        pergunta: 'Qual a previsão de entrega do Águas de Marano Residencial?',
        resposta: 'A previsão de entrega é julho de 2028, no Frente Mar de Balneário Piçarras/SC.',
      },
    ],
  },
}

// Link para a página de bairro (só existe para as combinações com 2+
// empreendimentos reais — ver BAIRROS_POR_CIDADE em [bairro]/page.tsx).
const BAIRRO_LINK_POR_CIDADE: Record<string, { slug: string; nome: string }> = {
  'icara': { slug: 'centro', nome: 'Centro' },
  'balneario-rincao': { slug: 'centro', nome: 'Centro' },
  'laguna': { slug: 'mar-grosso', nome: 'Mar Grosso' },
}

function statusParaFase(status: string): string {
  if (status === 'na planta') return 'Na planta'
  if (status === 'em obras') return 'Em obras'
  if (status === 'entregue') return 'Entregue'
  if (status === 'pronto') return 'Pronto para morar'
  if (status === 'sob consulta') return 'Sob consulta'
  return status
}

// Empreendimentos da Eraldo Construções por cidade — mesma ideia editorial de
// SLUGS_POR_CIDADE, mas para empreendimentos que vivem em src/data/eraldo (não em
// @/data/imoveis, que é só Fontana). Hoje só Tubarão depende exclusivamente desta
// lista; cidades com empreendimentos Fontana continuam usando SLUGS_POR_CIDADE.
const ERALDO_POR_CIDADE: Record<string, EmpreendimentoEraldo[]> = {
  tubarao: [granPalazzo, play],
}

function statusEraldoParaFase(status: EmpreendimentoEraldo['status']): string {
  if (status === 'lancamento') return 'Na planta'
  if (status === 'em_construcao') return 'Em obras'
  if (status === 'entregue') return 'Entregue'
  return status
}

function getEmpreendimentosDaCidade(cityKey: string) {
  const slugs = SLUGS_POR_CIDADE[cityKey]
  const fontana = !slugs
    ? []
    : slugs
        .map((slug) => imoveis.find((im) => im.slug === slug && im.ativo))
        .filter((im): im is NonNullable<typeof im> => Boolean(im))
        .map((im) => ({
          nome: im.nome,
          fase: statusParaFase(im.status),
          slug: '/empreendimento/' + im.construtora_slug + '/' + im.slug,
          construtora: im.construtora.replace(/^Construtora\s+/, ''),
          dorms: DORMS_POR_SLUG[im.slug] || '',
          exibir_preco: im.exibir_preco,
          preco_a_partir_de: im.preco,
        }))

  const eraldo = (ERALDO_POR_CIDADE[cityKey] || []).map((emp) => ({
    nome: emp.nome,
    fase: statusEraldoParaFase(emp.status),
    slug: '/empreendimento/' + emp.construtoraSlug + '/' + emp.slug,
    construtora: 'Eraldo Construções',
    // Sem campo de dormitórios único em src/data/eraldo (fica em tipologias[],
    // por planta) — omitido aqui em vez de inventar um resumo.
    dorms: '',
    exibir_preco: false,
    preco_a_partir_de: null as number | null,
  }))

  return [...fontana, ...eraldo]
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
    title: `Lançamentos Imobiliários em ${info.nome}/${info.uf}`,
    description: `${info.descricao} Confira os melhores empreendimentos com Stiven Allan, CRECI 60.275.`,
    alternates: { canonical: `https://stivenallan.com.br/lancamentos/${cidade}` },
    openGraph: {
      title: `Lançamentos em ${info.nome}/${info.uf} | Stiven Allan`,
      description: info.descricao,
    },
    twitter: { card: 'summary_large_image', title: `Lançamentos em ${info.nome}/${info.uf} | Stiven Allan`, description: info.descricao },
  }
}

export async function generateStaticParams() {
  return Object.keys(CIDADES).map((cidade) => ({ cidade }))
}

export default async function LancamentosCidadePage({ params }: Props) {
  const { cidade } = await params
  const info = CIDADES[cidade]
  const wppUrl = 'https://wa.me/5548991642332?text=Ol%C3%A1+Stiven!+Vi+o+site+e+quero+saber+dos+lan%C3%A7amentos.'

  // Sem entrada em CIDADES = sem dados reais o suficiente pra montar uma página —
  // 404 de verdade em vez do 200 com "Cidade não encontrada" que existia aqui antes
  // (achado da auditoria SEO 2026-07-21: /lancamentos/tubarao-sc aparecia no sitemap
  // com esse fallback, retornando 200 com conteúdo de erro). Qualquer cidade nova que
  // apareça via Supabase antes de ganhar uma entrada em CIDADES cai aqui — 404 real,
  // nunca mais um soft-404 disfarçado de 200.
  if (!info) {
    notFound()
  }

  const cityKey = cidade.replace('-sc', '')
  const empreendimentos = getEmpreendimentosDaCidade(cityKey)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://stivenallan.com.br' },
      { '@type': 'ListItem', position: 2, name: 'Lançamentos', item: 'https://stivenallan.com.br/lancamentos' },
      { '@type': 'ListItem', position: 3, name: info.nome + '/' + info.uf, item: 'https://stivenallan.com.br/lancamentos/' + cidade },
    ],
  }
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: empreendimentos.map((emp, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: emp.nome,
      url: 'https://stivenallan.com.br' + emp.slug,
    })),
  }

  return (
    <main style={{ background: '#121315', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
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
          {info.descricao} Atendimento exclusivo do corretor Stiven Allan, CRECI 60.275.
        </p>

        {empreendimentos.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 60 }}>
            {empreendimentos.map((emp, i) => (
              <Link key={i} href={emp.slug} style={{ display: 'block', background: '#202327', borderRadius: 12, padding: '28px 24px', border: '1px solid #2e3338', textDecoration: 'none', color: '#fff' }}>
                {emp.fase && (<span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#c9a24b', border: '1px solid #c9a24b', borderRadius: 40, padding: '3px 10px', marginBottom: 12 }}>{emp.fase}</span>)}
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

        {cityKey === 'criciuma' && (
          <section style={{ marginBottom: 60 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>O mercado de lançamentos em Criciúma</h2>
            <p style={{ fontSize: 16, color: '#a7adb4', lineHeight: 1.8, marginBottom: 40, maxWidth: 760 }}>
              Criciúma é um dos polos mais ativos da construção civil no sul de Santa Catarina, com lançamentos concentrados principalmente no Centro, mas também presentes em bairros como Cruzeiro do Sul, Santa Bárbara, Comerciário, Michel, Rio Maina e Grande Próspera. A Construtora Fontana mantém, atualmente, empreendimentos em diferentes fases de obra na cidade — desde unidades ainda na planta até prédios em obras e edifícios já entregues — o que mostra o ritmo constante de novos lançamentos na região. Entre os empreendimentos ativos no Centro estão o Monte Leone Residencial, o Lavis Residencial, o Tremezzo Residencial, o Thiene Residencial, o Bosco Del Montello Residencial e o Pineto Residencial, além do Calliano Residencial e do Due Fratelli Residencial, já entregues. Fora do Centro, a Fontana também constrói o Fidenza Residencial no Cruzeiro do Sul, o Parco Savello Residencial em Santa Bárbara, o Bellante Residencial no Comerciário, o Calalzo Di Cadore Residencial no Michel, o Pavia Residencial no Rio Maina e o Villaggio Verde Residenziale no Grande Próspera.
            </p>

            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Por que financiamento direto com a construtora</h2>
            <p style={{ fontSize: 16, color: '#a7adb4', lineHeight: 1.8, marginBottom: 40, maxWidth: 760 }}>
              A maior parte dos lançamentos da Fontana em Criciúma é comercializada com financiamento direto com a construtora, sem depender da aprovação de um banco. Na prática, o modelo funciona com entrada de 20% no ato da assinatura do contrato, saldo dividido em parcelas mensais e reforços anuais, todos corrigidos pelo CUB/SC ao longo da obra. Para quem tem restrição de crédito, renda informal ou simplesmente prefere não esperar meses por uma análise bancária, esse formato reduz a burocracia e agiliza o processo de compra. Ao final da obra, o comprador pode optar por quitar o saldo devedor à vista ou migrar para um financiamento bancário tradicional, conforme sua necessidade. Esse modelo tem sido um dos principais motivos pelos quais famílias da região Sul Catarinense — e também de outras cidades — têm escolhido comprar apartamentos na planta em Criciúma diretamente com a Fontana.
            </p>

            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Bairros com lançamentos ativos em Criciúma</h2>
            <p style={{ fontSize: 16, color: '#a7adb4', lineHeight: 1.8, marginBottom: 24, maxWidth: 760 }}>
              Veja abaixo os bairros de Criciúma que concentram lançamentos ativos da Construtora Fontana atualmente, com o nome de cada empreendimento e o status da obra:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'grid', gap: 12, maxWidth: 760 }}>
              <li style={{ background: '#202327', border: '1px solid #2e3338', borderRadius: 10, padding: '16px 20px', fontSize: 15, color: '#a7adb4', lineHeight: 1.7 }}><strong style={{ color: '#fff' }}><Link href="/lancamentos/criciuma-sc/centro" style={{ color: '#fff', textDecoration: 'underline' }}>Centro</Link>:</strong> Monte Leone Residencial (na planta), Lavis Residencial (em obras), Tremezzo Residencial (em obras), Thiene Residencial (na planta), Bosco Del Montello Residencial (na planta) e Pineto Residencial (em obras), além do Calliano Residencial e do Due Fratelli Residencial, já entregues.</li>
              <li style={{ background: '#202327', border: '1px solid #2e3338', borderRadius: 10, padding: '16px 20px', fontSize: 15, color: '#a7adb4', lineHeight: 1.7 }}><strong style={{ color: '#fff' }}>Cruzeiro do Sul:</strong> Fidenza Residencial, em obras.</li>
              <li style={{ background: '#202327', border: '1px solid #2e3338', borderRadius: 10, padding: '16px 20px', fontSize: 15, color: '#a7adb4', lineHeight: 1.7 }}><strong style={{ color: '#fff' }}>Santa Bárbara:</strong> Parco Savello Residencial, na planta.</li>
              <li style={{ background: '#202327', border: '1px solid #2e3338', borderRadius: 10, padding: '16px 20px', fontSize: 15, color: '#a7adb4', lineHeight: 1.7 }}><strong style={{ color: '#fff' }}>Comerciário:</strong> Bellante Residencial, em obras.</li>
              <li style={{ background: '#202327', border: '1px solid #2e3338', borderRadius: 10, padding: '16px 20px', fontSize: 15, color: '#a7adb4', lineHeight: 1.7 }}><strong style={{ color: '#fff' }}>Michel:</strong> Calalzo Di Cadore Residencial, em obras.</li>
              <li style={{ background: '#202327', border: '1px solid #2e3338', borderRadius: 10, padding: '16px 20px', fontSize: 15, color: '#a7adb4', lineHeight: 1.7 }}><strong style={{ color: '#fff' }}>Rio Maina:</strong> Pavia Residencial, em obras.</li>
              <li style={{ background: '#202327', border: '1px solid #2e3338', borderRadius: 10, padding: '16px 20px', fontSize: 15, color: '#a7adb4', lineHeight: 1.7 }}><strong style={{ color: '#fff' }}>Grande Próspera:</strong> Villaggio Verde Residenziale, pronto para morar.</li>
            </ul>

            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Perguntas frequentes sobre lançamentos em Criciúma</h2>
            <div style={{ display: 'grid', gap: 24, maxWidth: 760, marginBottom: 40 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Quais bairros de Criciúma têm lançamentos da Fontana atualmente?</h3>
                <p style={{ fontSize: 15, color: '#a7adb4', lineHeight: 1.7 }}>Atualmente a Fontana tem empreendimentos ativos no Centro, no Cruzeiro do Sul, em Santa Bárbara, no Comerciário, no Michel, no Rio Maina e no Grande Próspera, com unidades em fases que vão de na planta a entregues.</p>
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Como funciona o financiamento direto da Fontana em Criciúma?</h3>
                <p style={{ fontSize: 15, color: '#a7adb4', lineHeight: 1.7 }}>O modelo de financiamento direto prevê entrada de 20% no ato da assinatura, saldo parcelado mensalmente com reforços anuais, e correção pelo CUB/SC durante toda a obra, sem necessidade de aprovação bancária.</p>
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Qual a diferença entre comprar um lançamento na planta e um empreendimento pronto em Criciúma?</h3>
                <p style={{ fontSize: 15, color: '#a7adb4', lineHeight: 1.7 }}>Na planta, as parcelas costumam ser menores e o pagamento acompanha o andamento da obra. Empreendimentos prontos ou entregues, como o Calliano Residencial e o Due Fratelli Residencial, ambos no Centro, permitem mudança imediata, mas geralmente exigem mais capital disponível no momento da compra.</p>
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>É seguro comprar um apartamento na planta em Criciúma?</h3>
                <p style={{ fontSize: 15, color: '#a7adb4', lineHeight: 1.7 }}>Sim, desde que o empreendimento esteja regularizado e a construtora tenha histórico comprovado de entregas. A Fontana atua há décadas na região Sul Catarinense, com empreendimentos entregues no Centro de Criciúma, como o Calliano Residencial e o Due Fratelli Residencial.</p>
              </div>
            </div>

            <p style={{ fontSize: 16, color: '#a7adb4', lineHeight: 1.8, maxWidth: 760 }}>
              Se você está pesquisando lançamentos em Criciúma, vale considerar não só a localização e o bairro, mas também a fase de obra de cada empreendimento e as condições de pagamento oferecidas pela construtora. Do Centro ao Grande Próspera, os empreendimentos da Fontana cobrem diferentes perfis de compra, de quem busca um apartamento ainda na planta com parcelas menores a quem prefere um imóvel pronto para morar. Fale com o corretor Stiven Allan, CRECI 60.275, para saber qual empreendimento em Criciúma se encaixa melhor no seu momento e orçamento.
            </p>
          </section>
        )}

        {CONTEUDO_POR_CIDADE[cityKey] && (
          <section style={{ marginBottom: 60 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>O mercado de lançamentos em {info.nome}</h2>
            <p style={{ fontSize: 16, color: '#a7adb4', lineHeight: 1.8, marginBottom: 16, maxWidth: 760 }}>
              {CONTEUDO_POR_CIDADE[cityKey].mercado}
            </p>
            {BAIRRO_LINK_POR_CIDADE[cityKey] && (
              <p style={{ fontSize: 15, marginBottom: 40 }}>
                <Link href={`/lancamentos/${cidade}/${BAIRRO_LINK_POR_CIDADE[cityKey].slug}`} style={{ color: '#c9a24b', fontWeight: 600, textDecoration: 'underline' }}>
                  Ver todos os lançamentos no {BAIRRO_LINK_POR_CIDADE[cityKey].nome} →
                </Link>
              </p>
            )}

            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Por que financiamento direto com a construtora</h2>
            <p style={{ fontSize: 16, color: '#a7adb4', lineHeight: 1.8, marginBottom: 40, maxWidth: 760 }}>
              A maior parte dos lançamentos da Fontana em {info.nome} é comercializada com financiamento direto com a construtora, sem depender da aprovação de um banco. Na prática, o modelo funciona com entrada de 20% no ato da assinatura do contrato, saldo dividido em parcelas mensais e reforços anuais, todos corrigidos pelo CUB/SC ao longo da obra. Para quem tem restrição de crédito, renda informal ou simplesmente prefere não esperar meses por uma análise bancária, esse formato reduz a burocracia e agiliza o processo de compra. Ao final da obra, o comprador pode optar por quitar o saldo devedor à vista ou migrar para um financiamento bancário tradicional, conforme sua necessidade.
            </p>

            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16 }}>Perguntas frequentes sobre lançamentos em {info.nome}</h2>
            <div style={{ display: 'grid', gap: 24, maxWidth: 760, marginBottom: 40 }}>
              {CONTEUDO_POR_CIDADE[cityKey].faqs.map((faq, i) => (
                <div key={i}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{faq.pergunta}</h3>
                  <p style={{ fontSize: 15, color: '#a7adb4', lineHeight: 1.7 }}>{faq.resposta}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 16, color: '#a7adb4', lineHeight: 1.8, maxWidth: 760 }}>
              Fale com o corretor Stiven Allan, CRECI 60.275, para saber qual empreendimento em {info.nome} se encaixa melhor no seu momento e orçamento.
            </p>
          </section>
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
