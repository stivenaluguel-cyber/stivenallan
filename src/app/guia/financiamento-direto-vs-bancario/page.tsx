import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

const SLUG = 'financiamento-direto-vs-bancário'
const CANONICAL = `${SITE_URL}/guia/${SLUG}`
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20quero%20entender%20a%20diferen%C3%A7a%20entre%20financiamento%20direto%20e%20banc%C3%A1rio.'

export const metadata: Metadata = {
  title: 'Financiamento Direto vs. Bancário: Qual Escolher?',
    description: 'Compare o financiamento direto com a construtora e o financiamento bancário tradicional: sistemas SPC-JS, Price e SAC, com exemplos reais das construtoras da região.',
      alternates: { canonical: CANONICAL },
        openGraph: {
            title: 'Financiamento Direto vs. Bancário | Stiven Allan',
                description: 'Sistemas de cálculo, entrada, correção das parcelas e uso do FGTS: entenda as diferenças reais entre os dois modelos.',
                    url: CANONICAL,
                        type: 'article',
                          },
                            twitter: { card: 'summary_large_image', title: 'Financiamento Direto vs. Bancário | Stiven Allan' },
                            }

                            const SCHEMA = {
                            '@context': 'https://schema.org',
                            '@type': 'Article',
                            headline: 'Financiamento Direto vs. Financiamento Bancário',
                            description: 'Comparação factual entre o financiamento direto com a construtora e o financiamento bancário tradicional.',
                            url: CANONICAL,
                            author: { '@type': 'Person', name: 'Stiven Allan', url: SITE_URL },
                            publisher: { '@type': 'Organization', name: 'Stiven Allan Imoveis', url: SITE_URL },
                            }

                            const BREADCRUMB_SCHEMA = {
                            '@context': 'https://schema.org',
                            '@type': 'BreadcrumbList',
                            itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
                            { '@type': 'ListItem', position: 2, name: 'Guias', item: `${SITE_URL}/guia/financiamento-direto-construtora` },
                            { '@type': 'ListItem', position: 3, name: 'Financiamento Direto vs. Bancário', item: CANONICAL },
                            ],
                            }

                            const FAQ_SCHEMA = {
                            '@context': 'https://schema.org',
                            '@type': 'FAQPage',
                            mainEntity: [
                            {
                            '@type': 'Question',
                            name: 'Qual a diferença entre juros simples e juros compostos no financiamento de imóveis?',
                            acceptedAnswer: { '@type': 'Answer', text: 'No sistema de juros simples (SPC-JS), usado por Fontana, Corbetta e Locks, os juros incidem apenas sobre o valor original em cada parcela. No sistema de juros compostos, usado nas tabelas Price e SAC, os juros incidem também sobre os juros ja acumulados ao longo do tempo.' },
                            },
                            {
                            '@type': 'Question',
                            name: 'Posso usar FGTS no financiamento direto com a construtora?',
                            acceptedAnswer: { '@type': 'Answer', text: 'No financiamento direto com a Fontana, não ha necessidade de usar o FGTS durante a obra. O financiamento bancário, por outro lado, permite o uso do FGTS para compor a entrada ou amortizar o saldo devedor.' },
                            },
                            {
                            '@type': 'Question',
                            name: 'Qual sistema de cálculo a Construtora Fontana utiliza?',
                            acceptedAnswer: { '@type': 'Answer', text: 'A Fontana utiliza o SPC-JS (Sistema de Parcelas Constantes a Juros Simples), com taxa de referência de 0,75% ao mês, o mesmo sistema usado pela Corbetta e pela Locks.' },
                            },
                            {
                            '@type': 'Question',
                            name: 'Como funciona o modelo split da Corbetta?',
                            acceptedAnswer: { '@type': 'Answer', text: 'No modelo split da Corbetta, o saldo é dividido entre duas trilhas de amortização com proporção fixa: aproximadamente 71,5% do saldo é direcionado as parcelas mensais e o restante aos reforços anuais, cada trilha calculada pelo seu próprio fator de valor presente.' },
                            },
                            {
                            '@type': 'Question',
                            name: 'Qual taxa de juros a Giassi utiliza?',
                            acceptedAnswer: { '@type': 'Answer', text: 'A Giassi trabalha com o sistema Price (juros compostos), a uma taxa de 9,5% ao ano, diferente do sistema de juros simples usado por Fontana, Corbetta e Locks.' },
                            },
                            ],
                            }

                            export default function GuiaFinanciamentoDiretoVsBancarioPage() {
                            return (
                            <main style={{ background: '#FAFAF8', color: '#1A1A1A', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
                            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
                            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
                            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />

                            {/* HEADER */}
                            <header style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '16px clamp(18px,5vw,64px)' }}>
                            <nav style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Link href="/" style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 400, letterSpacing: '0.22em', fontSize: 15, color: '#1A1A1A', textDecoration: 'none', textTransform: 'uppercase' }}>Stiven Allan</Link>
                            <Link href="/empreendimentos" style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C1682E', textDecoration: 'none' }}>Ver Empreendimentos</Link>
                            </nav>
                            </header>

                            {/* HERO */}
                            <section style={{ background: '#241611', color: '#F2E9DE', padding: 'clamp(64px,12vh,120px) clamp(18px,5vw,64px)' }}>
                            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                            <p style={{ fontSize: 11, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(242,233,222,0.55)', marginBottom: 20 }}>Guia - Financiamento</p>
                            <h1 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 'clamp(28px,5vw,52px)', lineHeight: 1.1, margin: 0 }}>
                            Financiamento Direto vs. Financiamento Bancário
                            </h1>
                            <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(242,233,222,0.75)', marginTop: 24, lineHeight: 1.6 }}>
                            Compare os dois modelos com exemplos reais dos sistemas de cálculo usados pelas construtoras da região Sul de Santa Catarina.
                            </p>
                            </div>
                            </section>

                            {/* CONTEÚDO */}
                            <article style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vh,96px) clamp(18px,5vw,64px)' }}>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>O que é o financiamento direto com a construtora?</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            No financiamento direto, o comprador paga o imóvel diretamente a construtora, sem passar por banco e sem análise de crédito ou de renda. No modelo padrão da Construtora Fontana, a entrada corresponde a 20% do valor do imóvel, paga no ato da assinatura do contrato. O saldo é dividido em até 72 parcelas mensais e até 6 reforços anuais, sendo que cada reforço equivale a 5 vezes o valor da parcela mensal.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            Durante a obra, as parcelas são corrigidas mensalmente pelo CUB/SC (Custo Unitário Básico do Sinduscon-SC). Após a entrega das chaves, o saldo remanescente pode ser financiado diretamente com a construtora, corrigido por IGPM + 0,75% a.m., em prazos de até 180 ou 240 meses, conforme o empreendimento.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>O que é o financiamento bancário tradicional?</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            No financiamento bancário, o banco analisa a renda e o historico de crédito do comprador antes de aprovar o contrato. O cálculo das parcelas segue sistemas de juros compostos, geralmente pelas tabelas Price ou SAC. Diferente do financiamento direto, o financiamento bancário permite o uso do FGTS para composição da entrada ou amortização do saldo devedor.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            Por outro lado, o financiamento bancário envolve custos que não existem no financiamento direto com a construtora, como IOF, tarifa de abertura de crédito e, em muitos casos, seguro obrigatório embutido na prestação mensal.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Três sistemas de cálculo: SPC-JS, Price e SAC</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            As construtoras da região Sul de Santa Catarina utilizam sistemas diferentes para calcular as parcelas dos seus planos de pagamento. Conhecer a diferença ajuda a comparar propostas de forma justa:
                            </p>
                            <ul style={{ fontSize: 15, lineHeight: 2, color: '#333', paddingLeft: 24 }}>
                            <li><strong>SPC-JS (Sistema de Parcelas Constantes a Juros Simples):</strong> usado pela Construtora Fontana, pela Corbetta e pela Locks, com taxa de referência de 0,75% ao mês. Os juros incidem sobre o valor original, sem compor sobre parcelas ja pagas.</li>
                            <li><strong>Price (juros compostos):</strong> sistema usado pela Giassi, com taxa de 9,5% ao ano. A prestação é constante, mas os juros incidem de forma composta sobre o saldo devedor.</li>
                            <li><strong>Price/SAC:</strong> a Perego trabalha com os sistemas tradicionais Price e SAC, ambos baseados em juros compostos, comuns também no financiamento bancário.</li>
                            </ul>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Comparando os presets das construtoras da região</h2>
                            <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                            <tr style={{ background: '#C1682E', color: '#fff' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Construtora</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Sistema</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Taxa de referência</th>
                            </tr>
                            </thead>
                            <tbody>
                            {[
                            ['Fontana', 'SPC-JS (juros simples)', '0,75% a.m.'],
                            ['Corbetta', 'SPC-JS (juros simples), modelo split', '0,75% a.m.'],
                            ['Locks', 'SPC-JS (juros simples), identico a Fontana', '0,75% a.m.'],
                            ['Giassi', 'Price (juros compostos)', '9,5% a.a.'],
                            ['Perego', 'Price/SAC', '0,75% a.m.'],
                            ].map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#FBEEE2' : '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                            {row.map((cell, j) => (
                            <td key={j} style={{ padding: '12px 16px', color: '#333' }}>{cell}</td>
                            ))}
                            </tr>
                            ))}
                            </tbody>
                            </table>
                            </div>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            Na Corbetta, o modelo split direciona aproximadamente 71,5% do saldo para as parcelas mensais e o restante para os reforços anuais, cada trilha amortizada pelo seu próprio fator de valor presente. Ja na Fontana e na Locks, o reforço anual equivale sempre a 5 vezes o valor da parcela mensal, calculado sobre o saldo total do plano.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Vantagens e atenções de cada modelo</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 24, marginTop: 16 }}>
                            <div style={{ background: '#FBEEE2', padding: 24, borderRadius: 2 }}>
                            <h3 style={{ fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C1682E', marginTop: 0 }}>Financiamento Direto</h3>
                            <ul style={{ fontSize: 14, lineHeight: 2, color: '#333', paddingLeft: 20, margin: 0 }}>
                            <li>Sem aprovação bancária nem análise de renda</li>
                            <li>Sem IOF e sem tarifa de abertura de crédito</li>
                            <li>Negociação direta com a construtora</li>
                            <li>Parcelas corrigidas pelo CUB/SC podem subir mês a mês</li>
                            <li>Não ha uso de FGTS durante a obra</li>
                            </ul>
                            </div>
                            <div style={{ background: '#F0F0F0', padding: 24, borderRadius: 2 }}>
                            <h3 style={{ fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginTop: 0 }}>Financiamento Bancário</h3>
                            <ul style={{ fontSize: 14, lineHeight: 2, color: '#333', paddingLeft: 20, margin: 0 }}>
                            <li>Permite uso do FGTS na entrada ou amortização</li>
                            <li>Taxas contratuais fixas (Price/SAC), sem correção pelo CUB</li>
                            <li>Exige aprovação de crédito e comprovação de renda</li>
                            <li>Incide IOF, tarifas e, em muitos casos, seguro obrigatório</li>
                            <li>Juros compostos podem elevar o custo total conforme o prazo</li>
                            </ul>
                            </div>
                            </div>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Qual modelo escolher?</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            A escolha depende do perfil do comprador. Quem ainda não tem aprovação bancária ou busca agilidade tende a se beneficiar do financiamento direto durante a obra, como o modelo praticado pela Fontana, Corbetta e Locks. Quem ja tem FGTS disponível e prefere uma taxa contratual fixa pode considerar o financiamento bancário, seja no momento da compra ou após a entrega das chaves, quando o saldo remanescente do financiamento direto também pode ser substituido por um financiamento bancário convencional.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            Empreendimentos como o <Link href="/empreendimento/fontana/bellante-comerciario-criciuma-sc" style={{ color: '#C1682E' }}>Bellante Residencial</Link>, com plano de 2 reforços anuais e 60 parcelas mensais, o <Link href="/empreendimento/fontana/thiene-centro-criciuma-sc" style={{ color: '#C1682E' }}>Thiene Residencial</Link>, com entrada reduzida de 10%, e o <Link href="/empreendimento/fontana/pavia-rio-maina-criciuma-sc" style={{ color: '#C1682E' }}>Pavia Residencial</Link>, ja pronto e com entrada de 15%, mostram como as condições variam conforme o estagio e o plano de cada lancamento. Fale com Stiven Allan, CRECI 60.275, para simular o cenário mais adequado ao seu perfil.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            Vale reforcar que a escolha do sistema de cálculo também influência o planejamento financeiro ao longo do contrato. No SPC-JS (juros simples), usado por Fontana, Corbetta e Locks, o crescimento da divida e mais previsível porque os juros não incidem sobre juros ja pagos. Ja nos sistemas Price e SAC, usados pela Giassi e pela Perego, o cálculo por juros compostos pode gerar um custo total diferente dependendo do prazo contratado, o que reforca a importância de comparar simulações completas antes de assinar qualquer contrato, seja com a construtora ou com um banco.
                            </p>
                            

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Perguntas Frequentes</h2>

                            {FAQ_SCHEMA.mainEntity.map((item, i) => (
                            <details key={i} style={{ borderTop: '1px solid rgba(0,0,0,0.10)', padding: '20px 0' }}>
                            <summary style={{ cursor: 'pointer', fontSize: 16, fontWeight: 500, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {item.name}
                            <span style={{ fontSize: 20, color: '#C1682E', marginLeft: 16, flexShrink: 0 }}>+</span>
                            </summary>
                            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#555', marginTop: 12, marginBottom: 0 }}>{item.acceptedAnswer.text}</p>
                            </details>
                            ))}
                            <div style={{ borderTop: '1px solid rgba(0,0,0,0.10)' }} />

                            <p style={{ fontSize: 14, lineHeight: 1.8, color: '#666', marginTop: 32 }}>
                            Veja também: <Link href="/guia/financiamento-direto-construtora" style={{ color: '#C1682E' }}>Financiamento Direto com a Construtora</Link> e <Link href="/guia/cub-sc-correção-parcelas" style={{ color: '#C1682E' }}>CUB/SC e Correção de Parcelas</Link>.
                            </p>

                            {/* CTA */}
                            <div style={{ background: '#241611', color: '#F2E9DE', borderRadius: 2, padding: 'clamp(32px,5vw,56px)', marginTop: 64, textAlign: 'center' }}>
                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,28px)', margin: 0 }}>Simule os dois cenários</h2>
                            <p style={{ color: 'rgba(242,233,222,0.8)', marginTop: 16, marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
                            Compare o financiamento direto e o bancário para o empreendimento da sua escolha. Stiven Allan, CRECI 60.275.
                            </p>
                            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#F2E9DE', border: '1px solid rgba(242,233,222,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
                            Falar no WhatsApp
                            </a>
                            <Link href="/empreendimentos" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#F2E9DE', border: '1px solid rgba(242,233,222,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
                            Ver Empreendimentos
                            </Link>
                            </div>
                            </div>
                            </article>

                            {/* FOOTER */}
                            <footer style={{ background: '#111', color: 'rgba(255,255,255,0.4)', padding: 'clamp(32px,5vh,56px) clamp(18px,5vw,64px)', textAlign: 'center', fontSize: 12 }}>
                            <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} Stiven Allan - CRECI 60.275 - Imoveis em Criciuma e Sul de SC</p>
                            <p style={{ margin: '8px 0 0' }}>
                            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Início</Link>
                            <Link href="/empreendimentos" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Empreendimentos</Link>
                            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>WhatsApp</a>
                            </p>
                            </footer>
                            </main>
                            )
                            }

