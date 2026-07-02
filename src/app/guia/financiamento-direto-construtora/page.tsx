import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

const SLUG = 'financiamento-direto-construtora'
const CANONICAL = `${SITE_URL}/guia/${SLUG}`
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20quero%20saber%20mais%20sobre%20financiamento%20direto%20com%20a%20construtora.'

export const metadata: Metadata = {
  title: 'Financiamento Direto com a Construtora: Guia Completo | Stiven Allan',
  description: 'Entenda como funciona o financiamento direto Fontana em Criciúma/SC: entrada 20%, parcelas corrigidas pelo CUB/SC, reforços anuais e sem necessidade de aprovação bancária.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Financiamento Direto com a Construtora — Guia Completo',
    description: 'Tudo sobre o financiamento direto da Construtora Fontana em Criciúma/SC. Sem banco, sem burocracia.',
    url: CANONICAL,
    type: 'article',
  },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Financiamento Direto com a Construtora: Guia Completo',
  description: 'Entenda como funciona o financiamento direto da Construtora Fontana em Criciúma/SC.',
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
      name: 'O que é financiamento direto com a construtora?',
      acceptedAnswer: { '@type': 'Answer', text: 'É quando você compra o imóvel pagando diretamente à construtora, sem passar por banco. Você paga uma entrada, parcelas mensais e reforços anuais. As parcelas são corrigidas pelo CUB/SC durante a obra.' },
    },
    {
      '@type': 'Question',
      name: 'Qual a entrada para financiamento direto na Construtora Fontana?',
      acceptedAnswer: { '@type': 'Answer', text: 'Na maioria dos empreendimentos Fontana, a entrada é de 20% do valor do imóvel, paga no ato. Alguns empreendimentos têm condições especiais.' },
    },
    {
      '@type': 'Question',
      name: 'O que é o CUB/SC e como afeta minhas parcelas?',
      acceptedAnswer: { '@type': 'Answer', text: 'O CUB (Custo Unitário Básico) do Sinduscon-SC é o índice que corrige as parcelas durante a obra. Em junho/2026, o CUB/SC estava em R\$ 3.096,25/m². As parcelas sobem mensalmente de acordo com a variação do CUB.' },
    },
    {
      '@type': 'Question',
      name: 'O que são os reforços anuais no financiamento direto?',
      acceptedAnswer: { '@type': 'Answer', text: 'São pagamentos extras anuais, geralmente equivalentes a 5 vezes o valor da parcela mensal, pagos uma vez por ano durante a obra. O número de reforços varia conforme o prazo de entrega.' },
    },
    {
      '@type': 'Question',
      name: 'Posso usar FGTS no financiamento direto com a construtora?',
      acceptedAnswer: { '@type': 'Answer', text: 'No financiamento direto com a Fontana, não há necessidade de usar o FGTS durante a obra. Após as chaves, é possível fazer um financiamento bancário e usar o FGTS nessa transação.' },
    },
  ],
}

export default function GuiaFinanciamentoDiretoPage() {
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
      <section style={{ background: '#1A1A1A', color: '#F5F2ED', padding: 'clamp(64px,12vh,120px) clamp(18px,5vw,64px)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(245,242,237,0.55)', marginBottom: 20 }}>Guia · Financiamento</p>
          <h1 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 'clamp(28px,5vw,52px)', lineHeight: 1.1, margin: 0 }}>
            Financiamento Direto<br />com a Construtora
          </h1>
          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(245,242,237,0.75)', marginTop: 24, lineHeight: 1.6 }}>
            Sem banco, sem burocracia. Entenda como funciona o financiamento direto da Construtora Fontana em Criciúma e região.
          </p>
        </div>
      </section>

      {/* CONTEÚDO */}
      <article style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vh,96px) clamp(18px,5vw,64px)' }}>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>O que é financiamento direto?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          No financiamento direto, você compra o imóvel pagando diretamente à construtora — sem passar por banco, sem aprovação de crédito bancária, sem análise de renda. As parcelas são corrigidas pelo <strong>CUB/SC (Custo Unitário Básico do Sinduscon-SC)</strong> durante a obra.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Como funciona o plano padrão Fontana?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          O plano padrão da Construtora Fontana para imóveis em obras divide o pagamento em três partes: <strong>entrada (Parcela A — ato)</strong>, <strong>parcelas mensais</strong> e <strong>reforços anuais</strong>.
        </p>
        <ul style={{ fontSize: 15, lineHeight: 2, color: '#333', paddingLeft: 24 }}>
          <li><strong>Entrada:</strong> 20% do valor do imóvel, paga no ato da assinatura.</li>
          <li><strong>Parcelas mensais:</strong> Até 72 mensais durante a obra, corrigidas mensalmente pelo CUB/SC.</li>
          <li><strong>Reforços anuais:</strong> Até 6 reforços, cada um equivalente a 5 parcelas mensais, pagos uma vez por ano.</li>
          <li><strong>CUB/SC jun/2026:</strong> R$ 3.096,25/m² (base de correção das parcelas).</li>
        </ul>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>O que é o CUB/SC?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          O CUB (Custo Unitário Básico) é publicado mensalmente pelo Sinduscon-SC e reflete o custo de construção civil. Em junho de 2026, o CUB/SC estava em <strong>R$ 3.096,25/m²</strong>. As parcelas do financiamento direto Fontana sobem mensalmente de acordo com a variação do CUB — se o CUB subir 0,6% no mês, suas parcelas também sobem 0,6%.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Vantagens do financiamento direto</h2>
        <ul style={{ fontSize: 15, lineHeight: 2, color: '#333', paddingLeft: 24 }}>
          <li>Sem aprovação bancária — qualquer pessoa pode comprar, independente de score.</li>
          <li>Sem IOF, sem taxa de abertura de crédito, sem seguro obrigatório.</li>
          <li>Negociação direta com a construtora — mais flexibilidade.</li>
          <li>Possibilidade de quitar antecipadamente com desconto.</li>
          <li>Após a entrega das chaves, você pode fazer um financiamento bancário para pagar o saldo, usando FGTS se tiver disponível.</li>
        </ul>

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
        <div style={{ background: '#1A5C3A', color: '#fff', borderRadius: 2, padding: 'clamp(32px,5vw,56px)', marginTop: 64, textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,28px)', margin: 0 }}>Simule seu financiamento</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 16, marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
            Veja as condições dos empreendimentos Fontana disponíveis em Criciúma e região. Stiven Allan, CRECI 60.275.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#fff', border: '1px solid rgba(255,255,255,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
              Falar no WhatsApp
            </a>
            <Link href="/empreendimentos" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#fff', border: '1px solid rgba(255,255,255,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
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
