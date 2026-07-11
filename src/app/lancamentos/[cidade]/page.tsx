import type { Metadata } from 'next'
import Link from 'next/link'
import { imoveis } from '@/data/imoveis'

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
  'cocal-do-sul': { nome: 'Cocal do Sul', uf: 'SC', descricao: 'Empreendimentos em Cocal do Sul/SC.' },
  'cocal-do-sul-sc': { nome: 'Cocal do Sul', uf: 'SC', descricao: 'Empreendimentos em Cocal do Sul/SC.' },
  'sombrio': { nome: 'Sombrio', uf: 'SC', descricao: 'Lançamentos imobiliários em Sombrio/SC.' },
  'sombrio-sc': { nome: 'Sombrio', uf: 'SC', descricao: 'Lançamentos imobiliários em Sombrio/SC.' },
  'bom-jardim-da-serra': { nome: 'Bom Jardim da Serra', uf: 'SC', descricao: 'Empreendimentos na Serra Catarinense.' },
  'bom-jardim-da-serra-sc': { nome: 'Bom Jardim da Serra', uf: 'SC', descricao: 'Empreendimentos na Serra Catarinense.' },
  'balneario-picarras': { nome: 'Balneário Piçarras', uf: 'SC', descricao: 'Empreendimentos frente mar em Balneário Piçarras/SC.' },
  'balneario-picarras-sc': { nome: 'Balneário Piçarras', uf: 'SC', descricao: 'Empreendimentos frente mar em Balneário Piçarras/SC.' },
}

// Seleção editorial de quais empreendimentos aparecem como card em cada cidade.
// // Os DADOS de cada um (nome, status/fase, preço) vêm de @/data/imoveis — nada hardcoded aqui.
const SLUGS_POR_CIDADE: Record<string, string[]> = {
  'criciuma': [
    'monte-leone-centro-criciuma-sc',
    'lavis-residencial-centro-criciuma-sc',
    'pineto-centro-criciuma-sc',
  ],
  'balneario-picarras': [
    'aguas-de-marano-frente-mar-balneario-picarras-sc',
  ],
}

// Dormitórios não existem em @/data/imoveis (dado de planta, não de status/preço).
const DORMS_POR_SLUG: Record<string, string> = {
  'monte-leone-centro-criciuma-sc': '2 e 3 dorms',
  'lavis-residencial-centro-criciuma-sc': '2 e 3 dorms',
  'pineto-centro-criciuma-sc': '2 dorms · 1 suíte',
  'aguas-de-marano-frente-mar-balneario-picarras-sc': '3 e 4 dorms · 3 suítes',
}

function statusParaFase(status: string): string {
  if (status === 'na planta') return 'Na planta'
  if (status === 'em obras') return 'Em obras'
  if (status === 'entregue') return 'Entregue'
  if (status === 'pronto') return 'Pronto para morar'
  return status
}

function getEmpreendimentosDaCidade(cityKey: string) {
  const slugs = SLUGS_POR_CIDADE[cityKey]
  if (!slugs) return []
  return slugs
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

  if (!info) {
    return (
      <main style={{ background: '#121315', minHeight: '100vh', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', gap: 20 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Cidade não encontrada</h1>
        <Link href="/" style={{ color: '#c9a24b', textDecoration: 'none', fontSize: 16 }}>Voltar ao início</Link>
      </main>
    )
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
              <li style={{ background: '#202327', border: '1px solid #2e3338', borderRadius: 10, padding: '16px 20px', fontSize: 15, color: '#a7adb4', lineHeight: 1.7 }}><strong style={{ color: '#fff' }}>Centro:</strong> Monte Leone Residencial (na planta), Lavis Residencial (em obras), Tremezzo Residencial (em obras), Thiene Residencial (na planta), Bosco Del Montello Residencial (na planta) e Pineto Residencial (em obras), além do Calliano Residencial e do Due Fratelli Residencial, já entregues.</li>
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
