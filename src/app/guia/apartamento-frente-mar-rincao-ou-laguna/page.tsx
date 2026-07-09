import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

const SLUG = 'apartamento-frente-mar-rincao-ou-laguna'
const CANONICAL = `${SITE_URL}/guia/${SLUG}`
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20quero%20saber%20mais%20sobre%20apartamentos%20frente%20mar%20no%20litoral%20sul%20de%20SC.'

export const metadata: Metadata = {
  title: 'Balneário Rincão ou Laguna: Onde Comprar Apartamento Frente Mar',
  description: 'Comparativo completo para comprar apartamento na planta no litoral sul de SC: Balneário Rincão ou Laguna (Mar Grosso)? Valorização, perfil de cada praia, empreendimentos e financiamento direto com a construtora.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Rincão ou Laguna: Onde Comprar Apartamento Frente Mar | Stiven Allan',
    description: 'Comparativo das duas praias do litoral sul de SC para comprar na planta com financiamento direto, sem banco.',
    url: CANONICAL,
    type: 'article',
  },
  twitter: { card: 'summary_large_image', title: 'Rincão ou Laguna: Onde Comprar Apartamento Frente Mar | Stiven Allan' },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Balneário Rincão ou Laguna: Onde Comprar Apartamento Frente Mar no Sul de SC',
  description: 'Comparativo completo entre Balneário Rincão e Laguna (Mar Grosso) para quem quer comprar apartamento na planta no litoral sul de Santa Catarina.',
  url: CANONICAL,
  author: { '@type': 'Person', name: 'Stiven Allan', url: SITE_URL },
  publisher: { '@type': 'Organization', name: 'Stiven Allan Imóveis', url: SITE_URL },
}

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Guias', item: `${SITE_URL}/guia/comprar-apartamento-na-planta-criciuma` },
    { '@type': 'ListItem', position: 3, name: 'Balneário Rincão ou Laguna: Onde Comprar Apartamento Frente Mar', item: CANONICAL },
  ],
}

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Vale mais a pena comprar apartamento em Balneário Rincão ou em Laguna?',
      acceptedAnswer: { '@type': 'Answer', text: 'Depende do objetivo. Balneário Rincão é o município mais jovem de SC, com preços de entrada menores e maior potencial de valorização por estar em fase de verticalização. Laguna (Mar Grosso) é praia consolidada, com infraestrutura pronta, comércio o ano todo e liquidez maior para revenda e locação. Para investir em valorização, Rincão; para uso próprio imediato e renda de aluguel, Laguna.' },
    },
    {
      '@type': 'Question',
      name: 'Quanto custa um apartamento frente mar na planta no litoral sul de SC?',
      acceptedAnswer: { '@type': 'Answer', text: 'Os empreendimentos da Construtora Fontana no litoral sul de SC partem da faixa de R$ 600 mil, variando conforme praia, andar, vista e metragem. Os valores exatos de cada unidade são apresentados na conversa com o corretor, junto com a tabela vigente da fase de obra.' },
    },
    {
      '@type': 'Question',
      name: 'Dá para comprar apartamento na praia sem financiamento bancário?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sim. Nos empreendimentos Fontana do litoral sul, a compra é por financiamento direto com a construtora: entrada de 20%, parcelas mensais corrigidas pelo CUB/SC durante a obra e reforços anuais — sem aprovação de banco, sem IOF e sem seguro embutido.' },
    },
    {
      '@type': 'Question',
      name: 'Por que os preços sobem durante a obra?',
      acceptedAnswer: { '@type': 'Answer', text: 'A tabela de venda é reajustada a cada fase da obra: fundação, estrutura, acabamento e entrega. Quem compra em fase inicial paga o menor preço da história daquele empreendimento. Esse é o principal mecanismo de valorização de quem compra na planta.' },
    },
    {
      '@type': 'Question',
      name: 'Quais empreendimentos frente mar estão disponíveis com a Fontana?',
      acceptedAnswer: { '@type': 'Answer', text: 'Em Balneário Rincão: Mar di Arienzo, Mar di Atrani, Mar Positano e Villammare. Em Laguna (Mar Grosso): Mar di Licata e Mar di Nizza. Todos com financiamento direto da construtora e atendimento por Stiven Allan, CRECI 60.275.' },
    },
  ],
}

const H2: React.CSSProperties = { fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.8, color: '#333' }

export default function GuiaRincaoOuLagunaPage() {
  return (
    <main style={{ background: '#FAFAF8', color: '#1A1A1A', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '16px clamp(18px,5vw,64px)' }}>
        <nav style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 400, letterSpacing: '0.22em', fontSize: 15, color: '#1A1A1A', textDecoration: 'none', textTransform: 'uppercase' }}>Stiven Allan</Link>
          <Link href="/empreendimentos" style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1A5C3A', textDecoration: 'none' }}>Ver Empreendimentos</Link>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ background: '#1A1A1A', color: '#F5F2ED', padding: 'clamp(64px,12vh,120px) clamp(18px,5vw,64px)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(245,242,237,0.55)', marginBottom: 20 }}>Guia — Litoral Sul de SC</p>
          <h1 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 'clamp(28px,5vw,52px)', lineHeight: 1.1, margin: 0 }}>
            Rincão ou Laguna: onde comprar frente mar?
          </h1>
          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(245,242,237,0.75)', marginTop: 24, lineHeight: 1.6 }}>
            As duas praias do litoral sul catarinense onde ainda é possível comprar apartamento na planta direto com a construtora — e o que cada uma entrega para morar, veranear ou investir.
          </p>
        </div>
      </section>

      {/* CONTEUDO */}
      <article style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vh,96px) clamp(18px,5vw,64px)' }}>

        <p style={P}>
          Quem procura apartamento frente mar em Santa Catarina pensa primeiro em Balneário Camboriú ou Itapema — e encontra preços que já passaram do teto. O litoral sul do estado conta outra história: <strong>Balneário Rincão</strong> e <strong>Laguna (Mar Grosso)</strong> ainda têm lançamentos na planta com financiamento direto da construtora, a menos de uma hora de Criciúma, com valores de entrada que o litoral norte não vê há uma década.
        </p>
        <p style={{ ...P, marginTop: 16 }}>
          A pergunta certa não é qual praia é melhor — é qual combina com o seu objetivo. Este guia compara as duas de frente, com os critérios que realmente importam na decisão.
        </p>

        <h2 style={H2}>Balneário Rincão: a praia em construção</h2>
        <p style={P}>
          Emancipado de Içara em 2013, Balneário Rincão é o município mais jovem de Santa Catarina — e isso é exatamente a tese de investimento. A orla está em plena verticalização: onde hoje há terrenos e casas de veraneio, os próximos anos verão uma linha de edifícios frente mar. Quem compra na planta agora compra o metro quadrado de uma orla que ainda vai se valorizar com cada prédio novo, cada calçadão revitalizado e cada verão mais movimentado.
        </p>
        <p style={{ ...P, marginTop: 16 }}>
          O Rincão tem 13 km de praia, as lagoas de Esteves e do Faxinal para esportes náuticos, e a proximidade de Criciúma (35 minutos) que garante demanda de locação de veraneio da própria região. A Construtora Fontana concentra ali quatro empreendimentos: <Link href="/empreendimento/fontana/mar-di-arienzo-centro-balneario-rincao-sc" style={{ color: '#1A5C3A' }}>Mar di Arienzo</Link>, <Link href="/empreendimento/fontana/mar-di-atrani-centro-balneario-rincao-sc" style={{ color: '#1A5C3A' }}>Mar di Atrani</Link>, <Link href="/empreendimento/fontana/mar-positano-centro-balneario-rincao-sc" style={{ color: '#1A5C3A' }}>Mar Positano</Link> e <Link href="/empreendimento/fontana/villammare-residencial-balneario-rincao-sc" style={{ color: '#1A5C3A' }}>Villammare</Link> — todos em obras, todos com financiamento direto.
        </p>
        <p style={{ ...P, marginTop: 16 }}>
          Cada um desses quatro lançamentos tem sua própria data de entrega prevista, o que ajuda a escolher o prazo de obra mais adequado ao seu planejamento: o Mar di Atrani está previsto para outubro de 2028, o Mar Positano para agosto de 2029, o Villammare para setembro de 2029 e o Mar di Arienzo para agosto de 2030. As próprias frases de marketing reforçam a proposta de cada um: "Amplie seu horizonte" no Mar di Arienzo, "A vida no agora" no Mar di Atrani e "Um verdadeiro mergulho em sensações únicas" no Mar Positano.
        </p>

        <h2 style={H2}>Laguna (Mar Grosso): a praia consolidada</h2>
        <p style={P}>
          Laguna é cidade histórica de mais de 340 anos, e o Mar Grosso é a sua praia urbana consolidada: comércio aberto o ano inteiro, restaurantes, farmácias e supermercados a pé, avenida beira-mar estruturada. Para quem quer usar o apartamento em qualquer estação — não só no verão — ou quer renda de locação por temporada com procura garantida, o Mar Grosso entrega infraestrutura pronta hoje.
        </p>
        <p style={{ ...P, marginTop: 16 }}>
          A Fontana tem dois empreendimentos na quadra do mar: <Link href="/empreendimento/fontana/mar-di-licata-mar-grosso-laguna-sc" style={{ color: '#1A5C3A' }}>Mar di Licata</Link> e <Link href="/empreendimento/fontana/mar-di-nizza-mar-grosso-laguna-sc" style={{ color: '#1A5C3A' }}>Mar di Nizza</Link>, ambos em obras. Laguna também está a caminho do encontro entre a BR-101 duplicada e as praias do Rosa e Ibiraquera — o eixo turístico que mais cresce no estado passa na porta.
        </p>
        <p style={{ ...P, marginTop: 16 }}>
          O Mar di Nizza tem entrega prevista para dezembro de 2026 — a mais próxima entre os seis empreendimentos do litoral sul —, enquanto o Mar di Licata está previsto para outubro de 2027. As frases de marketing seguem o mesmo convite: o Mar di Licata promete "Bem-vindo ao seu novo horizonte particular" e o Mar di Nizza resume a proposta em "Sinta a leveza do litoral de Laguna no seu dia a dia".
        </p>

        <h2 style={H2}>Comparativo direto</h2>
        <div style={{ background: '#F5F2ED', borderRadius: 2, padding: '24px 28px', margin: '24px 0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 520 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid rgba(0,0,0,0.15)' }}>
                <th style={{ padding: '10px 8px' }}>Critério</th>
                <th style={{ padding: '10px 8px' }}>Balneário Rincão</th>
                <th style={{ padding: '10px 8px' }}>Laguna (Mar Grosso)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Perfil', 'Praia em verticalização, cidade jovem', 'Praia urbana consolidada, cidade histórica'],
                ['Tese principal', 'Valorização (comprar antes da orla ficar pronta)', 'Uso imediato e renda de locação'],
                ['Infraestrutura hoje', 'Em expansão, movimento forte no verão', 'Completa o ano inteiro'],
                ['Distância de Criciúma', '~35 min', '~50 min'],
                ['Empreendimentos Fontana', 'Mar di Arienzo, Mar di Atrani, Mar Positano, Villammare', 'Mar di Licata, Mar di Nizza'],
                ['Financiamento', 'Direto com a construtora, sem banco', 'Direto com a construtora, sem banco'],
              ].map((row) => (
                <tr key={row[0]} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 600 }}>{row[0]}</td>
                  <td style={{ padding: '10px 8px', color: '#333' }}>{row[1]}</td>
                  <td style={{ padding: '10px 8px', color: '#333' }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={H2}>O fator que vale para as duas: comprar na fase certa</h2>
        <p style={P}>
          Nos dois destinos, o mecanismo de ganho é o mesmo: <strong>a tabela sobe a cada fase da obra</strong>. Fundação, estrutura, acabamento, entrega — cada etapa vencida reajusta o preço das unidades restantes. Quem entra na fase inicial paga o menor preço que aquele empreendimento jamais terá, e ainda dilui o pagamento em parcelas durante toda a construção, sem banco no meio.
        </p>
        <p style={{ ...P, marginTop: 16 }}>
          O plano padrão Fontana é entrada de 20%, até 72 parcelas mensais corrigidas pelo CUB/SC e reforços anuais. Os detalhes de como funciona a correção estão no nosso <Link href="/guia/financiamento-direto-construtora" style={{ color: '#1A5C3A' }}>guia completo de financiamento direto</Link>.
        </p>
        <p style={{ ...P, marginTop: 16 }}>
          Todos os seis empreendimentos seguem o mesmo plano de obra padrão da Fontana: entrada de 20%, até 72 parcelas mensais corrigidas pelo CUB/SC e 6 reforços anuais ao longo da construção. Para quem prefere quitar à vista, a construtora oferece desconto de 15% sobre o valor de tabela em qualquer um dos seis — Mar di Arienzo, Mar di Atrani, Mar Positano e Villammare em Balneário Rincão, Mar di Licata e Mar di Nizza em Laguna.
        </p>
        <p style={{ ...P, marginTop: 16 }}>
          Para conhecer as demais regiões onde a Construtora Fontana tem empreendimentos ativos — como Criciúma, Içara, Sideropolis e Bom Jardim da Serra —, veja também o guia <Link href="/guia/onde-investir-sul-santa-catarina" style={{ color: '#1A5C3A' }}>Onde Investir no Sul de Santa Catarina</Link>.
        </p>

        <h2 style={H2}>Perguntas frequentes</h2>

        {FAQ_SCHEMA.mainEntity.map((item, i) => (
          <details key={i} style={{ borderTop: '1px solid rgba(0,0,0,0.10)', padding: '20px 0' }}>
            <summary style={{ cursor: 'pointer', fontSize: 16, fontWeight: 500, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {item.name}
              <span style={{ fontSize: 20, color: '#1A5C3A', marginLeft: 16, flexShrink: 0 }}>+</span>
            </summary>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#555', marginTop: 12, marginBottom: 0 }}>{item.acceptedAnswer.text}</p>
          </details>
        ))}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.10)' }} />

        {/* CTA */}
        <div style={{ background: '#1A5C3A', color: '#fff', borderRadius: 2, padding: 'clamp(32px,5vw,56px)', marginTop: 64, textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,28px)', margin: 0 }}>Compare as condições das duas praias</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 16, marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
            Stiven Allan (CRECI 60.275) acompanha as fases de obra e tabelas dos 6 empreendimentos do litoral sul — e monta a comparação para o seu caso, sem compromisso.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" data-wpp style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#fff', border: '1px solid rgba(255,255,255,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
              Falar no WhatsApp
            </a>
            <Link href="/lancamentos/balneario-rincao-sc" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#fff', border: '1px solid rgba(255,255,255,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
              Ver Rincão
            </Link>
            <Link href="/lancamentos/laguna-sc" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#fff', border: '1px solid rgba(255,255,255,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
              Ver Laguna
            </Link>
          </div>
        </div>
      </article>

      {/* FOOTER */}
      <footer style={{ background: '#111', color: 'rgba(255,255,255,0.4)', padding: 'clamp(32px,5vh,56px) clamp(18px,5vw,64px)', textAlign: 'center', fontSize: 12 }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Stiven Allan — CRECI 60.275 — Imóveis em Criciúma e Sul de SC</p>
        <p style={{ margin: '8px 0 0' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Início</Link>
          <Link href="/empreendimentos" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Empreendimentos</Link>
          <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>WhatsApp</a>
        </p>
      </footer>
    </main>
  )
}
