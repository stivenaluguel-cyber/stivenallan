import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

const SLUG = 'comprar-apartamento-na-planta-criciuma'
const CANONICAL = `${SITE_URL}/guia/${SLUG}`
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20quero%20saber%20mais%20sobre%20apartamentos%20na%20planta%20em%20Crici%C3%BAma.'

export const metadata: Metadata = {
  title: 'Como Comprar Apartamento na Planta em Criciuma/SC: Guia Completo',
  description: 'Guia completo para comprar apartamento na planta em Criciuma/SC: etapas, riscos, vantagens e como funciona o financiamento direto com a Construtora Fontana.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Como Comprar Apartamento na Planta em Criciuma/SC | Stiven Allan',
    description: 'Tudo o que você precisa saber antes de comprar um apartamento na planta em Criciuma.',
    url: CANONICAL,
    type: 'article',
  },
    twitter: { card: 'summary_large_image', title: 'Como Comprar Apartamento na Planta em Criciuma/SC | Stiven Allan' },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Como Comprar Apartamento na Planta em Criciuma/SC',
  description: 'Guia completo para comprar apartamento na planta em Criciuma/SC com financiamento direto Fontana.',
  url: CANONICAL,
  author: { '@type': 'Person', name: 'Stiven Allan', url: SITE_URL },
  publisher: { '@type': 'Organization', name: 'Stiven Allan Imoveis', url: SITE_URL },
}

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Quais construtoras tem lançamentos na planta em Criciuma?',
      acceptedAnswer: { '@type': 'Answer', text: 'A Construtora Fontana e uma das principais com lançamentos na planta em Criciuma e região, com empreendimentos nos bairros Centro, Michel, Rio Maina, Santa Barbara, e também nas praias de Balneario Rincao e Balneario Picarras.' },
    },
    {
      '@type': 'Question',
      name: 'Qual a diferença entre comprar na planta e pronto?',
      acceptedAnswer: { '@type': 'Answer', text: 'Na planta, você paga durante a obra com parcelas menores e corrigidas pelo CUB/SC. Ao final da obra, pode refinanciar com banco ou quitar direto. Um imóvel pronto pode ser habitado imediatamente, mas geralmente exige mais capital inicial.' },
    },
    {
      '@type': 'Question',
      name: 'É seguro comprar na planta em Criciuma?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sim, desde que a construtora seja registrada no CRECI, o empreendimento esteja registrado em cartório e o contrato seja registrado. A Construtora Fontana atua há décadas na região sul catarinense com histórico de entregas.' },
    },
    {
      '@type': 'Question',
      name: 'Como funciona o pagamento de apartamento na planta?',
      acceptedAnswer: { '@type': 'Answer', text: 'No financiamento direto Fontana: entrada de 20% no ato, saldo dividido em parcelas mensais e reforos anuais, todos corrigidos pelo CUB/SC durante a obra. Sem necessidade de aprovação bancária.' },
    },
    {
      '@type': 'Question',
      name: 'Quando recebo o apartamento comprado na planta?',
      acceptedAnswer: { '@type': 'Answer', text: 'Depende do empreendimento. Os lançamentos Fontana tem prazos de entrega entre 2026 e 2030, dependendo do estagio atual da obra. Cada empreendimento tem sua data de previsao de entrega em contrato.' },
    },
  ],
}

export default function GuiaComprarNaPlantaPage() {
  return (
    <main style={{ background: '#FAFAF8', color: '#1A1A1A', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '16px clamp(18px,5vw,64px)' }}>
        <nav style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 400, letterSpacing: '0.22em', fontSize: 15, color: '#1A1A1A', textDecoration: 'none', textTransform: 'uppercase' }}>Stiven Allan</Link>
          <Link href="/empreendimentos" style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1A5C3A', textDecoration: 'none' }}>Ver Empreendimentos</Link>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ background: '#1A2E1A', color: '#EAF2E8', padding: 'clamp(64px,12vh,120px) clamp(18px,5vw,64px)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(234,242,232,0.55)', marginBottom: 20 }}>Guia - Compra na Planta</p>
          <h1 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 'clamp(28px,5vw,52px)', lineHeight: 1.1, margin: 0 }}>
            Comprar Apartamento na Planta em Criciuma
          </h1>
          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(234,242,232,0.75)', marginTop: 24, lineHeight: 1.6 }}>
            Tudo o que você precisa saber antes de assinar o contrato: etapas, vantagens, riscos e como funciona o financiamento direto.
          </p>
        </div>
      </section>

      {/* CONTEÚDO */}
      <article style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vh,96px) clamp(18px,5vw,64px)' }}>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Por que comprar na planta em Criciuma?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          Comprar na planta permite pagar o imóvel em parcelas menores durante a obra, com possibilidade de ganho de valorização até a entrega. Em Criciuma, os empreendimentos Fontana tem entregado imóveis com valorização relevante em relação ao preco de lançamento. Além disso, o financiamento direto da Fontana dispensa aprovação bancária, o que agiliza muito o processo de aquisição.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
          Criciuma e o maior polo econômico do sul catarinense, com mercado imobiliário aquecido e crescente demanda por apartamentos modernos. A Construtora Fontana, com décadas de atuação na região, e a principal construtora com lançamentos em varios bairros da cidade e no litoral sul catarinense.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Etapas para comprar na planta</h2>
        <ol style={{ fontSize: 15, lineHeight: 2.2, color: '#333', paddingLeft: 24 }}>
          <li><strong>Escolha o empreendimento:</strong> Verifique a localização, a construtora, a tipologia e a previsao de entrega do imóvel. Em Criciuma e no Sul Catarinense, os lançamentos Fontana vao de bairros como Michel e Centro até empreendimentos de veraneio no litoral. Compare a planta, o padrão de acabamento e a data prevista de conclusao antes de decidir.</li>
          <li><strong>Conheca o plano de financiamento:</strong> O plano padrão Fontana tem entrada de 20%, até 72 parcelas mensais corrigidas pelo CUB/SC e até 6 reforos anuais. Cada reforo anual equivale a 5 parcelas mensais. Como o financiamento e direto com a construtora, não há necessidade de aprovação bancária, o que agiliza o processo.</li>
          <li><strong>Análise o contrato (reserva):</strong> Feita a reserva da unidade, análise o contrato com atenção antes de assinar. O contrato deve ser registrado em cartório para sua proteção juridica e precisa trazer a cláusula de correção pelo CUB/SC, o prazo de entrega e a tolerância previstos. Confira também a especificação técnica do acabamento.</li>
          <li><strong>Pague a entrada:</strong> A entrada corresponde a 20% do valor do imóvel e e paga no ato da assinatura do contrato. Num apartamento de R$ 500.000, por exemplo, isso equivale a R$ 100.000. E esse pagamento inicial que garante a reserva da unidade escolhida.</li>
          <li><strong>Pague as parcelas durante a obra:</strong> Durante a construção, você paga parcelas mensais corrigidas pelo CUB/SC, além dos reforos anuais equivalentes a 5 parcelas cada. As parcelas menores durante a obra são uma das principais vantagens de comprar na planta. O saldo de 80% e diluido ao longo de até 72 meses.</li>
          <li><strong>Receba as chaves:</strong> Concluida a obra, faca a vistoria da unidade, confirme se o acabamento corresponde a especificação do contrato e assine o auto de entrega. E o momento de checar todos os itens antes de receber o imóvel. Eventuais ajustes devem ser registrados na própria vistoria.</li>
          <li><strong>Quite o saldo e registre o imóvel:</strong> Após as chaves, quite o saldo devedor remanescente, seja pelo saldo direto com a Fontana ou por financiamento bancário. Em seguida, registre o imóvel em seu nome no cartório de registro de imóveis. Somente com o registro a propriedade passa oficialmente para o comprador.</li>
        </ol>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Como funciona o financiamento direto na planta?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          O plano padrão Fontana divide o pagamento em entrada de 20%, até 72 parcelas mensais corrigidas pelo CUB/SC e até 6 reforos anuais (cada reforo equivale a 5 parcelas mensais). Não é necessário aprovação bancária.
        </p>
        <div style={{ background: '#F0F7F0', borderRadius: 2, padding: '24px 28px', margin: '24px 0' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1A5C3A', marginTop: 0, marginBottom: 8 }}>Exemplo: apartamento de R$ 500.000</p>
          <ul style={{ fontSize: 14, lineHeight: 2, color: '#333', paddingLeft: 20, margin: 0 }}>
            <li><strong>Entrada (20%):</strong> R$ 100.000 no ato</li>
            <li><strong>Saldo (80%):</strong> R$ 400.000 dividido em parcelas mais reforos</li>
            <li><strong>Parcelas mensais base:</strong> aproximadamente R$ 3.330/mês por 72 meses</li>
            <li><strong>Reforos anuais (5x parcela):</strong> aproximadamente R$ 16.650/ano por 6 anos</li>
            <li><strong>Como chegamos a esses valores:</strong> a entrada de 20% sobre R$ 500.000 resulta em R$ 100.000, deixando um saldo de R$ 400.000 (80%). Diluido em 72 meses, o saldo daria cerca de R$ 5.556 por mês; como parte do valor migra para os 6 reforos anuais (cerca de R$ 16.650 cada), a parcela mensal base cai para aproximadamente R$ 3.330.</li>
          </ul>
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          O CUB/SC (Custo Unitário Básico do Sinduscon-SC) corrige as parcelas todo mês. Em junho de 2026, o CUB/SC estava em R$ 3.096,25/m2. A variação historica fica entre 0,4% e 0,8% ao mês.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Principais bairros e regiões com lançamentos em Criciuma</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          A Construtora Fontana tem lançamentos em diversas regiões de Criciuma e Sul Catarinense: <strong>Centro</strong>, <strong>Michel</strong>, <strong>Rio Maina</strong>, <strong>Santa Barbara</strong>, <strong>Cruzeiro do Sul</strong>, além de empreendimentos de veraneio em <strong>Balneario Rincao</strong>, <strong>Balneario Picarras</strong> e <strong>Laguna</strong>.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
          Para imóveis de alto padrão, os bairros Michel e Centro de Criciuma concentram os lançamentos mais sofisticados, com apartamentos de 3 e 4 suites, rooftops exclusivos e areas de lazer completas. Para quem busca custo-benefício, os bairros Rio Maina e Santa Barbara oferecem boas opções com financiamento direto acessível.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: '#333', marginTop: 12 }}>
          Vale considerar também o perfil de cada região ao comprar na planta. O Centro e o bairro Michel reunem os empreendimentos de alto padrão, com apartamentos de 3 e 4 suites e areas de lazer completas, enquanto Rio Maina e Santa Barbara concentram opções de melhor custo-benefício com financiamento direto acessível. Ja Balneario Rincao, Balneario Picarras e Laguna são voltados a quem busca imóveis de veraneio no litoral sul catarinense. Definir a região ajuda a alinhar o investimento ao seu objetivo, seja moradia ou valorização.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Vantagens e atenções ao comprar na planta</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 24, marginTop: 16 }}>
          <div style={{ background: '#F0F7F0', padding: 24, borderRadius: 2 }}>
            <h3 style={{ fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1A5C3A', marginTop: 0 }}>Vantagens</h3>
            <ul style={{ fontSize: 14, lineHeight: 2, color: '#333', paddingLeft: 20, margin: 0 }}>
              <li>Preco de lançamento geralmente menor</li>
              <li>Parcelas menores durante a obra</li>
              <li>Sem aprovação bancária (financiamento direto)</li>
              <li>Possibilidade de personalização do acabamento</li>
              <li>Potencial de valorização até a entrega</li>
            </ul>
          </div>
          <div style={{ background: '#FFF8F0', padding: 24, borderRadius: 2 }}>
            <h3 style={{ fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B4513', marginTop: 0 }}>Atencoes</h3>
            <ul style={{ fontSize: 14, lineHeight: 2, color: '#333', paddingLeft: 20, margin: 0 }}>
              <li>Parcelas corrigidas pelo CUB/SC podem subir</li>
              <li>Prazo de entrega pode ser prorrogado</li>
              <li>Não da para morar durante a obra</li>
              <li>Verificar registro do contrato em cartório</li>
              <li>Pesquisar histórico de entregas da construtora</li>
            </ul>
          </div>
        </div>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>O que verificar antes de assinar?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          Antes de assinar o contrato de compra de um apartamento na planta, verifique: registro do empreendimento na prefeitura e cartório; CRECI do corretor (Stiven Allan: CRECI 60.275); cláusulas de correção das parcelas (deve ser CUB/SC na Fontana); prazo de entrega e tolerância prevista no contrato; especificação técnica do acabamento e dos materiais; forma de quitação do saldo pos-chaves via saldo direto ou financiamento bancário.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Perguntas Frequentes</h2>

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
        <div style={{ background: '#1A2E1A', color: '#EAF2E8', borderRadius: 2, padding: 'clamp(32px,5vw,56px)', marginTop: 64, textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,28px)', margin: 0 }}>Veja os lançamentos</h2>
          <p style={{ color: 'rgba(234,242,232,0.8)', marginTop: 16, marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
            Empreendimentos Fontana disponíveis em Criciuma e região. Atendimento exclusivo com Stiven Allan, CRECI 60.275.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#EAF2E8', border: '1px solid rgba(234,242,232,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
              Falar no WhatsApp
            </a>
            <Link href="/empreendimentos" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#EAF2E8', border: '1px solid rgba(234,242,232,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
              Ver Empreendimentos
            </Link>
          </div>
        </div>
      </article>

      {/* FOOTER */}
      <footer style={{ background: '#111', color: 'rgba(255,255,255,0.4)', padding: 'clamp(32px,5vh,56px) clamp(18px,5vw,64px)', textAlign: 'center', fontSize: 12 }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Stiven Allan - CRECI 60.275 - Imoveis em Criciuma e Sul de SC</p>
        <p style={{ margin: '8px 0 0' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Início</Link>
          <Link href="/empreendimentos" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Empreendimentos</Link>
          <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>WhatsApp</a>
        </p>
      </footer>
    </main>
  )
}
