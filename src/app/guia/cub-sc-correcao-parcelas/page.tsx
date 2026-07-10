import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

const SLUG = 'cub-sc-correcao-parcelas'
const CANONICAL = `${SITE_URL}/guia/${SLUG}`
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20quero%20entender%20como%20o%20CUB%2FSC%20afeta%20minhas%20parcelas.'

const CUB_JUNHO_2026 = 3096.25

export const metadata: Metadata = {
  title: 'CUB/SC e Correção de Parcelas no Financiamento Direto: Guia Completo',
  description: 'Entenda o que é o CUB/SC, como ele corrige as parcelas do financiamento direto Fontana e como calcular o impacto na sua prestação. CUB/SC jun/2026: R$ 3.096,25/m2.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'CUB/SC e Correção de Parcelas no Financiamento Direto | Stiven Allan',
    description: 'Guia completo sobre o CUB/SC e como ele afeta as parcelas do financiamento direto com construtoras em Criciuma.',
    url: CANONICAL,
    type: 'article',
  },
    twitter: { card: 'summary_large_image', title: 'CUB/SC e Correção de Parcelas no Financiamento Direto | Stiven Allan' },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'CUB/SC e Correção de Parcelas no Financiamento Direto',
  description: 'Guia completo sobre o CUB/SC e como ele afeta as parcelas do financiamento direto em Criciuma/SC.',
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
      name: 'O que é o CUB/SC?',
      acceptedAnswer: { '@type': 'Answer', text: 'O CUB (Custo Unitário Básico) e um índice publicado mensalmente pelo Sinduscon-SC que reflete o custo de construção civil em Santa Catarina. Em junho de 2026, o CUB/SC estava em R$ 3.096,25/m2.' },
    },
    {
      '@type': 'Question',
      name: 'Como o CUB/SC afeta minhas parcelas?',
      acceptedAnswer: { '@type': 'Answer', text: 'No financiamento direto Fontana, as parcelas mensais são corrigidas todo mês pela variação do CUB/SC. Se o CUB subir 0,6% em um mês, sua parcela também sobe 0,6% naquele mês.' },
    },
    {
      '@type': 'Question',
      name: 'O CUB/SC e o mesmo que INCC?',
      acceptedAnswer: { '@type': 'Answer', text: 'Não. O INCC (Índice Nacional de Custo da Construção) e nacional, calculado pela FGV. O CUB/SC é estadual, calculado pelo Sinduscon-SC. Na Construtora Fontana, as parcelas são corrigidas pelo CUB/SC.' },
    },
    {
      '@type': 'Question',
      name: 'Quanto o CUB/SC varia por mês, em média?',
      acceptedAnswer: { '@type': 'Answer', text: 'A variação historica do CUB/SC fica em torno de 0,4% a 0,8% ao mês, mas pode variar. Em anos de alta inflação na construção civil, a variação pode ser maior. Consulte o Sinduscon-SC para valores atualizados.' },
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
          <p style={{ fontSize: 11, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(228,238,246,0.55)', marginBottom: 20 }}>Guia - CUB/SC</p>
          <h1 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 'clamp(28px,5vw,52px)', lineHeight: 1.1, margin: 0 }}>
            CUB/SC e Correção de Parcelas
          </h1>
          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(228,238,246,0.75)', marginTop: 24, lineHeight: 1.6 }}>
            Entenda o que é o CUB/SC, como ele corrige suas parcelas e o que esperar durante a obra.
          </p>
          <div style={{ marginTop: 32, background: 'rgba(228,238,246,0.08)', border: '1px solid rgba(228,238,246,0.15)', borderRadius: 2, padding: '20px 24px', display: 'inline-block' }}>
            <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(228,238,246,0.55)' }}>CUB/SC - Referência jun/2026</p>
            <p style={{ margin: '8px 0 0', fontSize: 'clamp(24px,4vw,40px)', fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, letterSpacing: '0.04em' }}>R$ {CUB_JUNHO_2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/m2</p>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <article style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vh,96px) clamp(18px,5vw,64px)' }}>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>O que é o CUB/SC?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          O <strong>CUB (Custo Unitário Básico)</strong> e um índice publicado mensalmente pelo <strong>Sinduscon-SC</strong> (Sindicato da Indústria da Construção Civil de Santa Catarina). Ele mede o custo médio de construção residencial no estado e serve como base de correção monetaria nos contratos de compra de imoveis na planta com a Construtora Fontana.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
          Em junho de 2026, o CUB/SC estava em <strong>R$ {CUB_JUNHO_2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/m2</strong>. Este valor e atualizado todo mês e publicado pelo Sinduscon-SC no site oficial. A Construtora Fontana usa o CUB/SC como indexador das parcelas mensais durante a obra, diferentemente de muitas construtoras do Sudeste que usam o INCC nacional.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Como o CUB/SC corrige as parcelas?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          No financiamento direto da Construtora Fontana, cada parcela mensal e corrigida todo mês pela variação do CUB/SC. O cálculo é simples:
        </p>
        <div style={{ background: '#F0F5FF', border: '1px solid rgba(27,94,139,0.15)', borderRadius: 2, padding: '24px 28px', margin: '24px 0', fontFamily: 'monospace', fontSize: 14, lineHeight: 2 }}>
          <p style={{ margin: 0 }}><strong>Parcela nova = Parcela anterior x (CUB do mês / CUB do mês anterior)</strong></p>
          <p style={{ margin: '12px 0 0', color: '#555', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
            Exemplo: parcela de R$ 1.000 + CUB subiu 0,6% = nova parcela de R$ 1.006
          </p>
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          O impacto acumulado do CUB ao longo de 72 meses de obra pode ser significativo. Assumindo uma variação média mensal de 0,5%, o CUB acumularia cerca de 43% em 72 meses. Isso significa que uma parcela que comeca em R$ 2.000 pode chegar proxima de R$ 2.860 ao final da obra. Por isso é importante planejar o fluxo de caixa com essa correção em mente.
        <h3 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'clamp(16px,2vw,20px)', marginTop: 32, marginBottom: 12 }}>Como acompanhar o CUB mês a mês</h3>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          Acompanhar a correção evita surpresas no boleto e ajuda a conferir se o valor cobrado esta correto. Como o CUB/SC (Custo Unitário Básico do Sinduscon-SC) e divulgado mensalmente, da para prever a proxima parcela com boa precisao. O processo e simples e pode ser feito todo mês:
        </p>
        <ol style={{ fontSize: 16, lineHeight: 1.8, color: '#333', paddingLeft: 20 }}>
          <li>Consulte o valor atualizado do CUB/SC no site do Sinduscon-SC, que divulga o índice de cada mês. Foi la que saiu o valor de junho de 2026, de R$ 3.096,25 por metro quadrado.</li>
          <li>Confira no seu contrato qual e o índice de correção previsto. No financiamento direto da Fontana, esse índice e o CUB/SC, e não outro como INCC ou IGP-M.</li>
          <li>Recalcule a parcela aplicando a formula da pagina: parcela nova = parcela anterior x (CUB do mês / CUB do mês anterior). A variação historica costuma ficar entre 0,4% e 0,8% ao mês.</li>
          <li>Compare o resultado com o valor do boleto para confirmar que a correção foi aplicada corretamente e registrar qualquer divergencia.</li>
        </ol>
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Simulacao: impacto do CUB em 36 meses</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          Para um financiamento de 36 meses de obra com parcela inicial de R$ 2.000:
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#1B5E8B', color: '#fff' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Mês</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Variação CUB</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500 }}>Parcela aproximada</th>
              </tr>
            </thead>
            <tbody>
              {[['1', '-', 'R$ 2.000'], ['12', '+0,5% a.m.', 'R$ 2.124'], ['24', '+0,5% a.m.', 'R$ 2.254'], ['36', '+0,5% a.m.', 'R$ 2.393']].map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#F8FAFA' : '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '10px 14px', color: '#333' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 13, color: '#666', marginTop: 8 }}>Simulacao ilustrativa com variação mensal hipotetica de 0,5%. Variação real do CUB/SC pode ser maior ou menor.</p>
        <h3 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'clamp(16px,2vw,20px)', marginTop: 32, marginBottom: 12 }}>Passo a passo da simulacao</h3>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          Veja como a formula acima gera os valores da tabela, partindo de uma parcela inicial de R$ 2.000 com variação de 0,5% ao mês. No mês 1, a parcela e de R$ 2.000. No mês 2, multiplicamos R$ 2.000 por 1,005 (o equivalente a +0,5%), chegando a cerca de R$ 2.010. No mês 3, aplicamos 0,5% de novo sobre R$ 2.010, alcancando aproximadamente R$ 2.020. Repetindo esse calculo mês a mês, a correção se acumula: por volta do mês 12 a parcela chega perto de R$ 2.124, no mês 24 fica proxima de R$ 2.254 e no mês 36 alcanca cerca de R$ 2.393, exatamente como mostra a tabela. Note que cada aumento incide sobre a parcela ja corrigida, por isso o efeito e composto ao longo da obra.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          Esse mesmo mecanismo explica por que o impacto acumulado importa tanto: assumindo uma variação média de 0,5% ao mês, o CUB/SC pode acumular cerca de 43% em 72 meses de obra. Por isso vale simular o cenario completo antes de fechar o contrato, para dimensionar quanto a parcela pode crescer da primeira ate a ultima prestação e planejar o orcamento com folga.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>CUB/SC vs INCC vs IGPM</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#1B5E8B', color: '#fff' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Índice</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Quem calcula</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Abrangencia</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Uso</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['CUB/SC', 'Sinduscon-SC', 'Santa Catarina', 'Parcelas durante a obra (Fontana)'],
                ['INCC', 'FGV', 'Nacional', 'Parcelas durante a obra (outros contratos)'],
                ['IGPM', 'FGV', 'Nacional', 'Saldo direto pos-chaves (Fontana)'],
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

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>O que acontece com as parcelas apos as chaves?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          Após a entrega do imovel, o saldo devedor pode ser financiado diretamente com a Fontana, com correção pelo <strong>IGPM + 0,75% a.m.</strong>, em ate 180 ou 240 meses. Alternativamente, você pode usar um financiamento bancario convencional e quitar o saldo com a construtora.
        </p>
        <h3 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'clamp(16px,2vw,20px)', marginTop: 32, marginBottom: 12 }}>Financiamento do saldo apos a entrega</h3>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
          A vantagem do financiamento bancario pos-chaves e a possibilidade de usar o FGTS para amortizar o saldo, o que não é possível durante a fase de obra no financiamento direto. Alem disso, as taxas bancarias para imoveis prontos costumam ser competitivas, especialmente para quem tem bom historico de credito.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Como planejar o orcamento com a correção do CUB?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          Para se preparar para a correção pelo CUB/SC, planeje suas parcelas com uma margem de segurança de 10 a 15% acima do valor inicial. Isso significa que se sua parcela inicial e de R$ 2.000, você deve ter capacidade de pagar ate R$ 2.200 a R$ 2.300 por mês ao final da obra, dependendo do prazo e da variação real do CUB.
        </p>
        <h3 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'clamp(16px,2vw,20px)', marginTop: 32, marginBottom: 12 }}>Conte com uma simulacao personalizada</h3>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
          Stiven Allan monta simulacoes detalhadas com projecoes de correção para cada empreendimento Fontana, ajudando o comprador a entender o fluxo de caixa real ao longo de toda a obra. Este servico e prestado sem custo adicional para quem adquire atraves de Stiven Allan, CRECI 60.275.
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
            Veja os empreendimentos Fontana disponíveis e simule as condicoes de financiamento. Stiven Allan, CRECI 60.275.
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
