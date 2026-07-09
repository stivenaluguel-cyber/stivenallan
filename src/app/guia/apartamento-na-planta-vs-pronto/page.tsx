import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

const SLUG = 'apartamento-na-planta-vs-pronto'
const CANONICAL = `${SITE_URL}/guia/${SLUG}`
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20quero%20entender%20a%20diferen%C3%A7a%20entre%20comprar%20na%20planta%20e%20pronto.'

export const metadata: Metadata = {
  title: 'Apartamento na Planta vs. Pronto: Qual Comprar?',
    description: 'Compare vantagens, condições de pagamento e prazos entre comprar um apartamento na planta (em obra) e um imóvel pronto na região Sul de Santa Catarina.',
      alternates: { canonical: CANONICAL },
        openGraph: {
            title: 'Apartamento na Planta vs. Pronto | Stiven Allan',
                description: 'Entrada, desconto a vista, tempo de espera e personalizacao: as diferencas reais entre comprar em obra e comprar pronto.',
                    url: CANONICAL,
                        type: 'article',
                          },
                            twitter: { card: 'summary_large_image', title: 'Apartamento na Planta vs. Pronto | Stiven Allan' },
                            }

                            const SCHEMA = {
                            '@context': 'https://schema.org',
                            '@type': 'Article',
                            headline: 'Apartamento na Planta vs. Pronto: Vantagens e Diferencas Reais',
                            description: 'Comparacao factual entre comprar um apartamento na planta e um imovel pronto na regiao Sul de Santa Catarina.',
                            url: CANONICAL,
                            author: { '@type': 'Person', name: 'Stiven Allan', url: SITE_URL },
                            publisher: { '@type': 'Organization', name: 'Stiven Allan Imoveis', url: SITE_URL },
                            }

                            const BREADCRUMB_SCHEMA = {
                            '@context': 'https://schema.org',
                            '@type': 'BreadcrumbList',
                            itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
                            { '@type': 'ListItem', position: 2, name: 'Guias', item: `${SITE_URL}/guia/comprar-apartamento-na-planta-criciuma` },
                            { '@type': 'ListItem', position: 3, name: 'Apartamento na Planta vs. Pronto', item: CANONICAL },
                            ],
                            }

                            const FAQ_SCHEMA = {
                            '@context': 'https://schema.org',
                            '@type': 'FAQPage',
                            mainEntity: [
                            {
                            '@type': 'Question',
                            name: 'Qual a diferenca de entrada entre um plano de obra e um imovel pronto?',
                            acceptedAnswer: { '@type': 'Answer', text: 'No plano padrao de obra da Fontana, a entrada e de 20% do valor do imovel. Ja em imoveis prontos, a entrada varia por empreendimento: no Pavia Residencial, por exemplo, a entrada e de 15%.' },
                            },
                            {
                            '@type': 'Question',
                            name: 'Existe desconto a vista maior comprando um imovel pronto?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Varia por empreendimento. No plano padrao de obra, o desconto a vista costuma ser de 15%. No Pavia Residencial, ja pronto, o desconto a vista e de 5%. Em outros imoveis prontos sem previsao de entrega, pode nao haver desconto a vista especifico.' },
                            },
                            {
                            '@type': 'Question',
                            name: 'Posso personalizar o acabamento comprando na planta?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Sim, comprar na planta costuma permitir personalizacao do acabamento durante a obra. Em um imovel ja pronto, o acabamento ja esta definido e concluido.' },
                            },
                            {
                            '@type': 'Question',
                            name: 'Como funciona o financiamento de um imovel ja pronto?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Em imoveis prontos, o saldo apos a entrada pode ser financiado diretamente com a construtora, corrigido por IGPM + 0,75% a.m., em prazos de ate 180 ou 240 meses, ou por financiamento bancario convencional com uso de FGTS.' },
                            },
                            {
                            '@type': 'Question',
                            name: 'O que e o modelo quase pronto, como o Thiene Residencial?',
                            acceptedAnswer: { '@type': 'Answer', text: 'O Thiene Residencial tem entrada reduzida de 10% e uma condicao especial de 10% de desconto adicional pagando 40% do valor ate a entrega das chaves, com saldo em ate 180 meses corrigido por IGPM + 0,75% a.m.' },
                            },
                            ],
                            }

                            export default function GuiaPlantaVsProntoPage() {
                            return (
                            <main style={{ background: '#FAFAF8', color: '#1A1A1A', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
                            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
                            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
                            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />

                            {/* HEADER */}
                            <header style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '16px clamp(18px,5vw,64px)' }}>
                            <nav style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Link href="/" style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 400, letterSpacing: '0.22em', fontSize: 15, color: '#1A1A1A', textDecoration: 'none', textTransform: 'uppercase' }}>Stiven Allan</Link>
                            <Link href="/empreendimentos" style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1E8F76', textDecoration: 'none' }}>Ver Empreendimentos</Link>
                            </nav>
                            </header>

                            {/* HERO */}
                            <section style={{ background: '#0F2621', color: '#E4F2EE', padding: 'clamp(64px,12vh,120px) clamp(18px,5vw,64px)' }}>
                            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                            <p style={{ fontSize: 11, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(228,242,238,0.55)', marginBottom: 20 }}>Guia - Planta vs. Pronto</p>
                            <h1 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 'clamp(28px,5vw,52px)', lineHeight: 1.1, margin: 0 }}>
                            Apartamento na Planta vs. Pronto
                            </h1>
                            <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(228,242,238,0.75)', marginTop: 24, lineHeight: 1.6 }}>
                            Compare condicoes de pagamento, prazos e personalizacao entre comprar em obra e comprar um imovel ja pronto na regiao Sul de Santa Catarina.
                            </p>
                            </div>
                            </section>

                            {/* CONTEUDO */}
                            <article style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vh,96px) clamp(18px,5vw,64px)' }}>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Os estagios reais dos empreendimentos da regiao</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            Os empreendimentos da Construtora Fontana na regiao Sul de Santa Catarina se dividem em estagios de pagamento distintos: <strong>obra</strong> (em construcao, com plano de parcelas durante a obra), <strong>quase pronto</strong> (obra em fase final, com condicoes especiais) e <strong>pronto</strong> (imovel ja concluido). Cada estagio tem um plano de pagamento proprio.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            Exemplos reais de empreendimentos em obra sao o <Link href="/empreendimento/fontana/lavis-residencial-centro-criciuma-sc" style={{ color: '#1E8F76' }}>Lavis Residencial</Link>, o Fidenza Residencial e o Mar di Nizza Residencial. O <Link href="/empreendimento/fontana/thiene-centro-criciuma-sc" style={{ color: '#1E8F76' }}>Thiene Residencial</Link> esta classificado como quase pronto. Ja o <Link href="/empreendimento/fontana/pavia-rio-maina-criciuma-sc" style={{ color: '#1E8F76' }}>Pavia Residencial</Link> e o Avezzano Residencial sao exemplos de imoveis prontos, com plano de pagamento diferente dos empreendimentos ainda em obra.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Condicoes de pagamento por estagio</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            As condicoes de entrada e desconto a vista variam conforme o estagio e o empreendimento. Veja exemplos reais:
                            </p>
                            <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                            <tr style={{ background: '#1E8F76', color: '#fff' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Empreendimento</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Estagio</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Entrada</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Desconto a vista</th>
                            </tr>
                            </thead>
                            <tbody>
                            {[
                            ['Lavis Residencial (padrao obra)', 'Obra', '20%', '15%'],
                            ['Thiene Residencial', 'Quase pronto', '10%', '15% + 10% extra'],
                            ['Pavia Residencial', 'Pronto', '15%', '5%'],
                            ['Avezzano Residencial', 'Pronto', '20%', 'Nao informado'],
                            ].map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#E9F5F1' : '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                            {row.map((cell, j) => (
                            <td key={j} style={{ padding: '12px 16px', color: '#333' }}>{cell}</td>
                            ))}
                            </tr>
                            ))}
                            </tbody>
                            </table>
                            </div>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            No Thiene Residencial, alem do desconto a vista padrao de 15%, ha uma condicao especial: 10% de desconto adicional para quem paga 40% do valor ate a entrega das chaves, com ato minimo de 10% e saldo em ate 180 meses. Ja no plano padrao de obra da Fontana, o saldo e dividido em ate 72 parcelas mensais e ate 6 reforcos anuais, corrigidos pelo CUB/SC.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Tempo de espera e personalizacao</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            Comprar na planta significa aguardar a conclusao da obra, com prazos que variam conforme o empreendimento e o cronograma da construtora. Em compensacao, comprar na planta costuma permitir personalizacao do acabamento durante a obra. Ja um imovel pronto, como o Pavia Residencial ou o Avezzano Residencial, pode ser habitado ou alugado imediatamente apos a compra, mas o acabamento ja esta definido e concluido, sem espaco para personalizacao.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            O Thiene Residencial, classificado como quase pronto, representa um meio-termo: a obra esta em fase final, o que reduz o tempo de espera em relacao a um lancamento recem-iniciado, mas ainda permite condicoes de entrada reduzida e desconto adicional para quem antecipa parte do pagamento.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Financiamento disponivel em cada fase</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            Durante a obra, o financiamento e direto com a construtora, sem uso de FGTS, com parcelas mensais e reforcos anuais corrigidos pelo CUB/SC. Em imoveis prontos, o saldo apos a entrada pode ser financiado diretamente com a construtora, corrigido por IGPM + 0,75% a.m., em prazos de ate 180 ou 240 meses conforme o empreendimento, ou por financiamento bancario convencional, que permite o uso do FGTS.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            No Pavia Residencial, o saldo direto pos-entrada e financiado em ate 240 meses. Ja no Thiene Residencial, o saldo apos o pagamento inicial e financiado em ate 180 meses, ambos corrigidos por IGPM + 0,75% a.m.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Vantagens de cada opcao</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 24, marginTop: 16 }}>
                            <div style={{ background: '#E9F5F1', padding: 24, borderRadius: 2 }}>
                            <h3 style={{ fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E8F76', marginTop: 0 }}>Na Planta</h3>
                            <ul style={{ fontSize: 14, lineHeight: 2, color: '#333', paddingLeft: 20, margin: 0 }}>
                            <li>Parcelas menores durante a obra</li>
                            <li>Possibilidade de personalizacao do acabamento</li>
                            <li>Sem aprovacao bancaria (financiamento direto)</li>
                            <li>Preco de lancamento geralmente menor</li>
                            </ul>
                            </div>
                            <div style={{ background: '#F0F0F0', padding: 24, borderRadius: 2 }}>
                            <h3 style={{ fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginTop: 0 }}>Pronto</h3>
                            <ul style={{ fontSize: 14, lineHeight: 2, color: '#333', paddingLeft: 20, margin: 0 }}>
                            <li>Disponivel para morar ou alugar imediatamente</li>
                            <li>Acabamento ja concluido, sem risco de atraso de obra</li>
                            <li>Permite financiamento bancario com uso de FGTS</li>
                            <li>Entrada pode ser menor, conforme o empreendimento (ex: 15% no Pavia Residencial)</li>
                            </ul>
                            </div>
                            </div>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Qual escolher?</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            Quem busca parcelas menores durante um periodo mais longo, quer personalizar o acabamento ou nao tem FGTS disponivel pode se beneficiar de comprar na planta, como no Lavis Residencial ou no Fidenza Residencial. Quem quer morar ou alugar imediatamente, ou prefere usar o FGTS no financiamento, pode considerar um imovel pronto, como o Pavia Residencial. O Thiene Residencial, quase pronto, e uma opcao intermediaria para quem quer um prazo de entrega mais curto com condicoes especiais de desconto. Fale com Stiven Allan, CRECI 60.275, para avaliar qual estagio se encaixa melhor no seu momento de vida e planejamento financeiro.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            Vale lembrar que o prazo de entrega e as condicoes de pagamento sao definidos em contrato e podem mudar conforme o empreendimento escolhido. Antes de decidir entre planta, quase pronto ou pronto, vale simular o valor total de cada opcao, incluindo entrada, parcelas, reforcos e eventual saldo pos-chaves, para comparar o esforco financeiro real de cada alternativa ao longo do tempo. Essa comparacao ajuda a evitar surpresas no fluxo de caixa e a escolher a opcao mais alinhada ao seu momento de vida, seja para moradia, veraneio ou diversificacao de patrimonio.
                            </p>
                            

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Perguntas Frequentes</h2>

                            {FAQ_SCHEMA.mainEntity.map((item, i) => (
                            <details key={i} style={{ borderTop: '1px solid rgba(0,0,0,0.10)', padding: '20px 0' }}>
                            <summary style={{ cursor: 'pointer', fontSize: 16, fontWeight: 500, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {item.name}
                            <span style={{ fontSize: 20, color: '#1E8F76', marginLeft: 16, flexShrink: 0 }}>+</span>
                            </summary>
                            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#555', marginTop: 12, marginBottom: 0 }}>{item.acceptedAnswer.text}</p>
                            </details>
                            ))}
                            <div style={{ borderTop: '1px solid rgba(0,0,0,0.10)' }} />

                            <p style={{ fontSize: 14, lineHeight: 1.8, color: '#666', marginTop: 32 }}>
                            Veja tambem: <Link href="/guia/comprar-apartamento-na-planta-criciuma" style={{ color: '#1E8F76' }}>Como Comprar Apartamento na Planta em Criciuma</Link> e <Link href="/guia/financiamento-direto-vs-bancario" style={{ color: '#1E8F76' }}>Financiamento Direto vs. Bancario</Link>.
                            </p>

                            {/* CTA */}
                            <div style={{ background: '#0F2621', color: '#E4F2EE', borderRadius: 2, padding: 'clamp(32px,5vw,56px)', marginTop: 64, textAlign: 'center' }}>
                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,28px)', margin: 0 }}>Encontre o estagio ideal para voce</h2>
                            <p style={{ color: 'rgba(228,242,238,0.8)', marginTop: 16, marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
                            Empreendimentos em obra, quase prontos e prontos disponiveis em Criciuma e regiao. Stiven Allan, CRECI 60.275.
                            </p>
                            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#E4F2EE', border: '1px solid rgba(228,242,238,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
                            Falar no WhatsApp
                            </a>
                            <Link href="/empreendimentos" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#E4F2EE', border: '1px solid rgba(228,242,238,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
                            Ver Empreendimentos
                            </Link>
                            </div>
                            </div>
                            </article>

                            {/* FOOTER */}
                            <footer style={{ background: '#111', color: 'rgba(255,255,255,0.4)', padding: 'clamp(32px,5vh,56px) clamp(18px,5vw,64px)', textAlign: 'center', fontSize: 12 }}>
                            <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} Stiven Allan - CRECI 60.275 - Imoveis em Criciuma e Sul de SC</p>
                            <p style={{ margin: '8px 0 0' }}>
                            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Inicio</Link>
                            <Link href="/empreendimentos" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Empreendimentos</Link>
                            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>WhatsApp</a>
                            </p>
                            </footer>
                            </main>
                            )
                            }
