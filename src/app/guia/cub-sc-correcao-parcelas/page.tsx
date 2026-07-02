import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

const SLUG = 'cub-sc-correcao-parcelas'
const CANONICAL = `${SITE_URL}/guia/${SLUG}`
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20quero%20entender%20como%20o%20CUB%2FSC%20afeta%20minhas%20parcelas.'

// CUB/SC referência jun/2026
const CUB_JUNHO_2026 = 3096.25

export const metadata: Metadata = {
  title: 'CUB/SC e Correção de Parcelas no Financiamento Direto | Guia Stiven Allan',
  description: 'Entenda o que é o CUB/SC, como ele corrige as parcelas do financiamento direto Fontana e como calcular o impacto na sua prestação. CUB/SC jun/2026: R$ 3.096,25/m².',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'CUB/SC e Correção de Parcelas no Financiamento Direto',
    description: 'Guia completo sobre o CUB/SC e como ele afeta as parcelas do financiamento direto com construtoras em Criciúma.',
    url: CANONICAL,
    type: 'article',
  },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'CUB/SC e Correção de Parcelas no Financiamento Direto',
  description: 'Guia completo sobre o CUB/SC e como ele afeta as parcelas do financiamento direto em Criciúma/SC.',
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
      name: 'O que é o CUB/SC?',
      acceptedAnswer: { '@type': 'Answer', text: 'O CUB (Custo Unitário Básico) é um índice publicado mensalmente pelo Sinduscon-SC que reflete o custo de construção civil em Santa Catarina. Em junho de 2026, o CUB/SC estava em R$ 3.096,25/m².' },
    },
    {
      '@type': 'Question',
      name: 'Como o CUB/SC afeta minhas parcelas?',
      acceptedAnswer: { '@type': 'Answer', text: 'No financiamento direto Fontana, as parcelas mensais são corrigidas todo mês pela variação do CUB/SC. Se o CUB subir 0,6% em um mês, sua parcela também sobe 0,6% naquele mês.' },
    },
    {
      '@type': 'Question',
      name: 'O CUB/SC é o mesmo que INCC?',
      acceptedAnswer: { '@type': 'Answer', text: 'Não. O INCC (Índice Nacional de Custo da Construção) é nacional, calculado pela FGV. O CUB/SC é estadual, calculado pelo Sinduscon-SC. Na Construtora Fontana, as parcelas são corrigidas pelo CUB/SC.' },
    },
    {
      '@type': 'Question',
      name: 'Quanto o CUB/SC varia por mês, em média?',
      acceptedAnswer: { '@type': 'Answer', text: 'A variação histórica do CUB/SC fica em torno de 0,4% a 0,8% ao mês, mas pode variar. Em anos de alta inflação na construção civil, a variação pode ser maior. Consulte o Sinduscon-SC para valores atualizados.' },
    },
    {
      '@type': 'Question',
      name: 'Posso fixar o valor da parcela para não ser corrigida pelo CUB?',
      acceptedAnswer: { '@type': 'Answer', text: 'No financiamento direto Fontana durante a obra, as parcelas são obrigatoriamente corrigidas pelo CUB/SC. Após a entrega das chaves, você pode refinanciar com um banco a uma taxa fixa, sem correção pelo CUB.' },
    },
  ],
}

export default function GuiaCubScPage() {
  return (
    <main style={{ background: '#FAFAF8', color: '#1A1A1A', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '16px clamp(18px,5vw,64px)' }}>
        <nav style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 400, letterSpacing: '0.22em', fontSize: 15, color: '#1A1A1A', textDecoration: 'none', textTransform: 'uppercase' }}>Stiven Allan</Link>
          <Link href="/empreendimentos" style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1B5E8B', textDecoration: 'none' }}>Ver Empreendimentos</Link>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ background: '#0F1C22', color: '#E4EEF6', padding: 'clamp(64px,12vh,120px) clamp(18px,5vw,64px)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(228,238,246,0.55)', marginBottom: 20 }}>Guia · CUB/SC</p>
          <h1 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 'clamp(28px,5vw,52px)', lineHeight: 1.1, margin: 0 }}>
            CUB/SC e Correção<br />de Parcelas
          </h1>
          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(228,238,246,0.75)', marginTop: 24, lineHeight: 1.6 }}>
            Entenda o que é o CUB/SC, como ele corrige suas parcelas e o que esperar durante a obra.
          </p>
          <div style={{ marginTop: 32, background: 'rgba(228,238,246,0.08)', border: '1px solid rgba(228,238,246,0.15)', borderRadius: 2, padding: '20px 24px', display: 'inline-block' }}>
            <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(228,238,246,0.55)' }}>CUB/SC · Referência jun/2026</p>
            <p style={{ margin: '8px 0 0', fontSize: 'clamp(24px,4vw,40px)', fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, letterSpacing: '0.04em' }}>R$ {CUB_JUNHO_2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/m²</p>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <article style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vh,96px) clamp(18px,5vw,64px)' }}>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>O que é o CUB/SC?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          O <strong>CUB (Custo Unitário Básico)</strong> é um índice publicado mensalmente pelo <strong>Sinduscon-SC</strong> (Sindicato da Indústria da Construção Civil de Santa Catarina). Ele mede o custo médio de construção residencial no estado e serve como base de correção monetária nos contratos de compra de imóveis na planta.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          Em junho de 2026, o CUB/SC estava em <strong>R$ {CUB_JUNHO_2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/m²</strong>. Este valor é atualizado todo mês e publicado pelo Sinduscon-SC.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Como o CUB/SC corrige as parcelas?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          No financiamento direto da Construtora Fontana, cada parcela mensal é corrigida todo mês pela variação do CUB/SC. O cálculo é simples:
        </p>
        <div style={{ background: '#F0F5FF', border: '1px solid rgba(27,94,139,0.15)', borderRadius: 2, padding: '24px 28px', margin: '24px 0', fontFamily: 'monospace', fontSize: 14, lineHeight: 2 }}>
          <p style={{ margin: 0 }}><strong>Parcela nova = Parcela anterior × (CUB do mês / CUB do mês anterior)</strong></p>
          <p style={{ margin: '12px 0 0', color: '#555', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
            Exemplo: parcela de R$ 1.000 + CUB subiu 0,6% = nova parcela de R$ 1.006
          </p>
        </div>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>CUB/SC vs. INCC vs. IGPM</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#1B5E8B', color: '#fff' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Índice</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Quem calcula</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Abrangência</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Uso</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['CUB/SC', 'Sinduscon-SC', 'Santa Catarina', 'Correção de parcelas na planta (Fontana)'],
                ['INCC', 'FGV', 'Nacional', 'Correção de parcelas (outros contratos)'],
                ['IGPM', 'FGV', 'Nacional', 'Pós-chaves (saldo direto Fontana)'],
              ].map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#F8FAFA' : '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '12px 16px', color: '#333' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>O que acontece com as parcelas após as chaves?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          Após a entrega do imóvel, o saldo devedor pode ser financiado diretamente com a Fontana, com correção pelo <strong>IGPM + 0,75% a.m.</strong>, em até 180 ou 240 meses. Alternativamente, você pode usar um financiamento bancário convencional e quitar o saldo com a construtora.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Perguntas Frequentes</h2>

        {FAQ_SCHEMA.mainEntity.map((item, i) => (
          <details key={i} style={{ borderTop: '1px solid rgba(0,0,0,0.10)', padding: '20px 0' }}>
            <summary style={{ cursor: 'pointer', fontSize: 16, fontWeight: 500, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {item.name}
              <span style={{ fontSize: 20, color: '#1B5E8B', marginLeft: 16, flexShrink: 0 }}>+</span>
            </summary>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#555', marginTop: 12, marginBottom: 0 }}>{item.acceptedAnswer.text}</p>
          </details>
        ))}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.10)' }} />

        {/* CTA */}
        <div style={{ background: '#0F1C22', color: '#E4EEF6', borderRadius: 2, padding: 'clamp(32px,5vw,56px)', marginTop: 64, textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,28px)', margin: 0 }}>Simule seu financiamento</h2>
          <p style={{ color: 'rgba(228,238,246,0.8)', marginTop: 16, marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
            Veja os empreendimentos Fontana disponíveis e simule as condições de financiamento. Stiven Allan, CRECI 60.275.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#E4EEF6', border: '1px solid rgba(228,238,246,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
              Falar no WhatsApp
            </a>
            <Link href="/empreendimentos" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#E4EEF6', border: '1px solid rgba(228,238,246,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
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
