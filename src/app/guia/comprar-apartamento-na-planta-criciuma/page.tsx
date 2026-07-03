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
    description: 'Tudo o que voce precisa saber antes de comprar um apartamento na planta em Criciuma.',
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
      name: 'Quais construtoras tem lancamentos na planta em Criciuma?',
      acceptedAnswer: { '@type': 'Answer', text: 'A Construtora Fontana e uma das principais com lancamentos na planta em Criciuma e regiao, com empreendimentos nos bairros Centro, Michel, Rio Maina, Santa Barbara, e tambem nas praias de Balneario Rincao e Balneario Picarras.' },
    },
    {
      '@type': 'Question',
      name: 'Qual a diferenca entre comprar na planta e pronto?',
      acceptedAnswer: { '@type': 'Answer', text: 'Na planta, voce paga durante a obra com parcelas menores e corrigidas pelo CUB/SC. Ao final da obra, pode refinanciar com banco ou quitar direto. Um imovel pronto pode ser habitado imediatamente, mas geralmente exige mais capital inicial.' },
    },
    {
      '@type': 'Question',
      name: 'E seguro comprar na planta em Criciuma?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sim, desde que a construtora seja registrada no CRECI, o empreendimento esteja registrado em cartorio e o contrato seja registrado. A Construtora Fontana atua ha decadas na regiao sul catarinense com historico de entregas.' },
    },
    {
      '@type': 'Question',
      name: 'Como funciona o pagamento de apartamento na planta?',
      acceptedAnswer: { '@type': 'Answer', text: 'No financiamento direto Fontana: entrada de 20% no ato, saldo dividido em parcelas mensais e reforos anuais, todos corrigidos pelo CUB/SC durante a obra. Sem necessidade de aprovacao bancaria.' },
    },
    {
      '@type': 'Question',
      name: 'Quando recebo o apartamento comprado na planta?',
      acceptedAnswer: { '@type': 'Answer', text: 'Depende do empreendimento. Os lancamentos Fontana tem prazos de entrega entre 2026 e 2030, dependendo do estagio atual da obra. Cada empreendimento tem sua data de previsao de entrega em contrato.' },
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
            Tudo o que voce precisa saber antes de assinar o contrato: etapas, vantagens, riscos e como funciona o financiamento direto.
          </p>
        </div>
      </section>

      {/* CONTEUDO */}
      <article style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vh,96px) clamp(18px,5vw,64px)' }}>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Por que comprar na planta em Criciuma?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          Comprar na planta permite pagar o imovel em parcelas menores durante a obra, com possibilidade de ganho de valorizacao ate a entrega. Em Criciuma, os empreendimentos Fontana tem entregado imoveis com valorizacao relevante em relacao ao preco de lancamento. Alem disso, o financiamento direto da Fontana dispensa aprovacao bancaria, o que agiliza muito o processo de aquisicao.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
          Criciuma e o maior polo economico do sul catarinense, com mercado imobiliario aquecido e crescente demanda por apartamentos modernos. A Construtora Fontana, com decadas de atuacao na regiao, e a principal construtora com lancamentos em varios bairros da cidade e no litoral sul catarinense.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Etapas para comprar na planta</h2>
        <ol style={{ fontSize: 15, lineHeight: 2.2, color: '#333', paddingLeft: 24 }}>
          <li><strong>Escolha o empreendimento:</strong> Verifique localizacao, construtora, tipologia e previsao de entrega.</li>
          <li><strong>Conheca o plano de financiamento:</strong> Entrada de 20%, parcelas mensais corrigidas pelo CUB/SC e reforos anuais.</li>
          <li><strong>Analise o contrato:</strong> O contrato deve ser registrado em cartorio para sua protecao juridica.</li>
          <li><strong>Pague a entrada:</strong> 20% do valor no ato da assinatura do contrato.</li>
          <li><strong>Pague as parcelas durante a obra:</strong> Mensais corrigidas pelo CUB/SC mais reforos anuais equivalentes a 5 parcelas cada.</li>
          <li><strong>Receba as chaves:</strong> Faca a vistoria, confirme o acabamento e assine o auto de entrega.</li>
          <li><strong>Registre o imovel:</strong> Quite o saldo devedor e registre o imovel em seu nome no cartorio de registro de imoveis.</li>
        </ol>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Como funciona o financiamento direto na planta?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          O plano padrao Fontana divide o pagamento em entrada de 20%, ate 72 parcelas mensais corrigidas pelo CUB/SC e ate 6 reforos anuais (cada reforo equivale a 5 parcelas mensais). Nao e necessario aprovacao bancaria.
        </p>
        <div style={{ background: '#F0F7F0', borderRadius: 2, padding: '24px 28px', margin: '24px 0' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1A5C3A', marginTop: 0, marginBottom: 8 }}>Exemplo: apartamento de R$ 500.000</p>
          <ul style={{ fontSize: 14, lineHeight: 2, color: '#333', paddingLeft: 20, margin: 0 }}>
            <li><strong>Entrada (20%):</strong> R$ 100.000 no ato</li>
            <li><strong>Saldo (80%):</strong> R$ 400.000 dividido em parcelas mais reforos</li>
            <li><strong>Parcelas mensais base:</strong> aproximadamente R$ 3.330/mes por 72 meses</li>
            <li><strong>Reforos anuais (5x parcela):</strong> aproximadamente R$ 16.650/ano por 6 anos</li>
          </ul>
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          O CUB/SC (Custo Unitario Basico do Sinduscon-SC) corrige as parcelas todo mes. Em junho de 2026, o CUB/SC estava em R$ 3.096,25/m2. A variacao historica fica entre 0,4% e 0,8% ao mes.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Principais bairros e regioes com lancamentos em Criciuma</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          A Construtora Fontana tem lancamentos em diversas regioes de Criciuma e Sul Catarinense: <strong>Centro</strong>, <strong>Michel</strong>, <strong>Rio Maina</strong>, <strong>Santa Barbara</strong>, <strong>Cruzeiro do Sul</strong>, alem de empreendimentos de veraneio em <strong>Balneario Rincao</strong>, <strong>Balneario Picarras</strong> e <strong>Laguna</strong>.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
          Para imoveis de alto padrao, os bairros Michel e Centro de Criciuma concentram os lancamentos mais sofisticados, com apartamentos de 3 e 4 suites, rooftops exclusivos e areas de lazer completas. Para quem busca custo-beneficio, os bairros Rio Maina e Santa Barbara oferecem boas opcoes com financiamento direto acessivel.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Vantagens e atencoes ao comprar na planta</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 24, marginTop: 16 }}>
          <div style={{ background: '#F0F7F0', padding: 24, borderRadius: 2 }}>
            <h3 style={{ fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1A5C3A', marginTop: 0 }}>Vantagens</h3>
            <ul style={{ fontSize: 14, lineHeight: 2, color: '#333', paddingLeft: 20, margin: 0 }}>
              <li>Preco de lancamento geralmente menor</li>
              <li>Parcelas menores durante a obra</li>
              <li>Sem aprovacao bancaria (financiamento direto)</li>
              <li>Possibilidade de personalizacao do acabamento</li>
              <li>Potencial de valorizacao ate a entrega</li>
            </ul>
          </div>
          <div style={{ background: '#FFF8F0', padding: 24, borderRadius: 2 }}>
            <h3 style={{ fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B4513', marginTop: 0 }}>Atencoes</h3>
            <ul style={{ fontSize: 14, lineHeight: 2, color: '#333', paddingLeft: 20, margin: 0 }}>
              <li>Parcelas corrigidas pelo CUB/SC podem subir</li>
              <li>Prazo de entrega pode ser prorrogado</li>
              <li>Nao da para morar durante a obra</li>
              <li>Verificar registro do contrato em cartorio</li>
              <li>Pesquisar historico de entregas da construtora</li>
            </ul>
          </div>
        </div>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>O que verificar antes de assinar?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          Antes de assinar o contrato de compra de um apartamento na planta, verifique: registro do empreendimento na prefeitura e cartorio; CRECI do corretor (Stiven Allan: CRECI 60.275); clausulas de correcao das parcelas (deve ser CUB/SC na Fontana); prazo de entrega e tolerancia prevista no contrato; especificacao tecnica do acabamento e dos materiais; forma de quitacao do saldo pos-chaves via saldo direto ou financiamento bancario.
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
          <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,28px)', margin: 0 }}>Veja os lancamentos</h2>
          <p style={{ color: 'rgba(234,242,232,0.8)', marginTop: 16, marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
            Empreendimentos Fontana disponíveis em Criciuma e regiao. Atendimento exclusivo com Stiven Allan, CRECI 60.275.
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
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Inicio</Link>
          <Link href="/empreendimentos" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Empreendimentos</Link>
          <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>WhatsApp</a>
        </p>
      </footer>
    </main>
  )
}
