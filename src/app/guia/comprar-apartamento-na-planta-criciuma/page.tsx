import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

const SLUG = 'comprar-apartamento-na-planta-criciuma'
const CANONICAL = `${SITE_URL}/guia/${SLUG}`
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20quero%20saber%20mais%20sobre%20apartamentos%20na%20planta%20em%20Crici%C3%BAma.'

export const metadata: Metadata = {
  title: 'Como Comprar Apartamento na Planta em Criciúma/SC | Guia Stiven Allan',
  description: 'Guia completo para comprar apartamento na planta em Criciúma/SC: etapas, riscos, vantagens e como funciona o financiamento direto com a Construtora Fontana.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Como Comprar Apartamento na Planta em Criciúma/SC',
    description: 'Tudo o que você precisa saber antes de comprar um apartamento na planta em Criciúma.',
    url: CANONICAL,
    type: 'article',
  },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Como Comprar Apartamento na Planta em Criciúma/SC',
  description: 'Guia completo para comprar apartamento na planta em Criciúma/SC com financiamento direto Fontana.',
  url: CANONICAL,
  author: { '@type': 'Person', name: 'Stiven Allan', url: SITE_URL },
  publisher: { '@type': 'Organization', name: 'Stiven Allan Imóveis', url: SITE_URL },
}

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Quais construtoras têm lançamentos na planta em Criciúma?',
      acceptedAnswer: { '@type': 'Answer', text: 'A Construtora Fontana é uma das principais com lançamentos na planta em Criciúma e região, com empreendimentos nos bairros Centro, Michel, Rio Maina, Santa Bárbara, e também nas praias de Balneário Rincão e Balneário Piçarras.' },
    },
    {
      '@type': 'Question',
      name: 'Qual a diferença entre comprar na planta e pronto?',
      acceptedAnswer: { '@type': 'Answer', text: 'Na planta, você paga durante a obra com parcelas menores e corrigidas pelo CUB/SC. Ao final da obra, pode refinanciar com banco ou quitar direto. Um imóvel pronto pode ser habitado imediatamente, mas geralmente exige mais capital inicial.' },
    },
    {
      '@type': 'Question',
      name: 'É seguro comprar na planta em Criciúma?',
      acceptedAnswer: { '@type': 'Answer', text: 'Sim, desde que a construtora seja registrada no CRECI, o empreendimento esteja registrado em cartório e o contrato seja registrado. A Construtora Fontana atua há décadas na região sul catarinense com histórico de entregas.' },
    },
    {
      '@type': 'Question',
      name: 'Como funciona o pagamento de apartamento na planta?',
      acceptedAnswer: { '@type': 'Answer', text: 'No financiamento direto Fontana: entrada de 20% no ato, saldo dividido em parcelas mensais e reforços anuais, todos corrigidos pelo CUB/SC durante a obra. Sem necessidade de aprovação bancária.' },
    },
    {
      '@type': 'Question',
      name: 'Quando recebo o apartamento comprado na planta?',
      acceptedAnswer: { '@type': 'Answer', text: 'Depende do empreendimento. Os lançamentos Fontana têm prazos de entrega entre 2026 e 2030, dependendo do estágio atual da obra. Cada empreendimento tem sua data de previsão de entrega em contrato.' },
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
          <p style={{ fontSize: 11, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(234,242,232,0.55)', marginBottom: 20 }}>Guia · Compra na Planta</p>
          <h1 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 'clamp(28px,5vw,52px)', lineHeight: 1.1, margin: 0 }}>
            Comprar Apartamento<br />na Planta em Criciúma
          </h1>
          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(234,242,232,0.75)', marginTop: 24, lineHeight: 1.6 }}>
            Tudo o que você precisa saber antes de assinar o contrato: etapas, vantagens, riscos e como funciona o financiamento direto.
          </p>
        </div>
      </section>

      {/* CONTEÚDO */}
      <article style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vh,96px) clamp(18px,5vw,64px)' }}>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Por que comprar na planta?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          Comprar na planta permite pagar o imóvel em parcelas menores durante a obra, com possibilidade de ganho de valorização até a entrega. Em Criciúma, os empreendimentos Fontana têm entregado imóveis com valorização relevante em relação ao preço de lançamento.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Etapas para comprar na planta</h2>
        <ol style={{ fontSize: 15, lineHeight: 2.2, color: '#333', paddingLeft: 24 }}>
          <li><strong>Escolha o empreendimento:</strong> Verifique localização, construtora e previsão de entrega.</li>
          <li><strong>Conheça o plano de financiamento:</strong> Entrada, parcelas mensais, reforços anuais e correção pelo CUB/SC.</li>
          <li><strong>Assine o contrato:</strong> O contrato deve ser registrado em cartório para sua proteção.</li>
          <li><strong>Pague as parcelas:</strong> Mensais corrigidas pelo CUB/SC + reforços anuais durante a obra.</li>
          <li><strong>Receba as chaves:</strong> Faça a vistoria e registre o imóvel em seu nome.</li>
        </ol>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Principais bairros e regiões com lançamentos em Criciúma</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          A Construtora Fontana tem lançamentos em diversas regiões de Criciúma e Sul Catarinense: <strong>Centro</strong>, <strong>Michel</strong>, <strong>Rio Maina</strong>, <strong>Santa Bárbara</strong>, <strong>Cruzeiro do Sul</strong>, além de empreendimentos de veraneio em <strong>Balneário Rincão</strong> e <strong>Balneário Piçarras</strong>.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Vantagens e atenções ao comprar na planta</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 24, marginTop: 16 }}>
          <div style={{ background: '#F0F7F0', padding: 24, borderRadius: 2 }}>
            <h3 style={{ fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1A5C3A', marginTop: 0 }}>Vantagens</h3>
            <ul style={{ fontSize: 14, lineHeight: 2, color: '#333', paddingLeft: 20, margin: 0 }}>
              <li>Preço de lançamento geralmente menor</li>
              <li>Parcelas menores durante a obra</li>
              <li>Sem aprovação bancária (financiamento direto)</li>
              <li>Possibilidade de personalização</li>
            </ul>
          </div>
          <div style={{ background: '#FFF8F0', padding: 24, borderRadius: 2 }}>
            <h3 style={{ fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B4513', marginTop: 0 }}>Atenções</h3>
            <ul style={{ fontSize: 14, lineHeight: 2, color: '#333', paddingLeft: 20, margin: 0 }}>
              <li>Parcelas corrigidas pelo CUB/SC (pode subir)</li>
              <li>Prazo de entrega pode estender</li>
              <li>Não dá para morar durante a obra</li>
              <li>Verificar idoneidade da construtora</li>
            </ul>
          </div>
        </div>

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
          <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,28px)', margin: 0 }}>Veja os lançamentos disponíveis</h2>
          <p style={{ color: 'rgba(234,242,232,0.8)', marginTop: 16, marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
            Empreendimentos Fontana disponíveis em Criciúma e região. Atendimento exclusivo com Stiven Allan, CRECI 60.275.
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
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Stiven Allan · CRECI 60.275 · Imóveis em Criciúma e Sul de SC</p>
        <p style={{ margin: '8px 0 0' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Início</Link>
          <Link href="/empreendimentos" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Empreendimentos</Link>
          <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>WhatsApp</a>
        </p>
      </footer>
    </main>
  )
}
