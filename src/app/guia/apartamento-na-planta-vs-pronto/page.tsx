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
                description: 'Entrada, desconto à vista, tempo de espera e personalização: as diferenças reais entre comprar em obra e comprar pronto.',
                    url: CANONICAL,
                        type: 'article',
                          },
                            twitter: { card: 'summary_large_image', title: 'Apartamento na Planta vs. Pronto | Stiven Allan' },
                            }

                            const SCHEMA = {
                            '@context': 'https://schema.org',
                            '@type': 'Article',
                            headline: 'Apartamento na Planta vs. Pronto: Vantagens e Diferenças Reais',
                            description: 'Comparação factual entre comprar um apartamento na planta e um imóvel pronto na região Sul de Santa Catarina.',
                            url: CANONICAL,
                            author: { '@type': 'Person', name: 'Stiven Allan', url: SITE_URL },
                            publisher: { '@type': 'Organization', name: 'Stiven Allan Imoveis', url: SITE_URL },
                            }

                            const BREADCRUMB_SCHEMA = {
                            '@context': 'https://schema.org',
                            '@type': 'BreadcrumbList',
                            itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
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
                            name: 'Qual a diferença de entrada entre um plano de obra e um imóvel pronto?',
                            acceptedAnswer: { '@type': 'Answer', text: 'No plano padrão de obra da Fontana, a entrada é de 20% do valor do imóvel. Já em imóveis prontos, a entrada varia por empreendimento: no Pavia Residencial, por exemplo, a entrada é de 15%.' },
                            },
                            {
                            '@type': 'Question',
                            name: 'Existe desconto à vista maior comprando um imóvel pronto?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Varia por empreendimento. No plano padrão de obra, o desconto à vista costuma ser de 15%. No Pavia Residencial, já pronto, o desconto à vista é de 5%. Em outros imóveis prontos sem previsão de entrega, pode não haver desconto à vista específico.' },
                            },
                            {
                            '@type': 'Question',
                            name: 'Posso personalizar o acabamento comprando na planta?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Sim, comprar na planta costuma permitir personalização do acabamento durante a obra. Em um imóvel já pronto, o acabamento já está definido e concluído.' },
                            },
                            {
                            '@type': 'Question',
                            name: 'Como funciona o financiamento de um imóvel já pronto?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Em imóveis prontos, o saldo após a entrada pode ser financiado diretamente com a construtora, corrigido por IGPM + 0,75% a.m., em prazos de ate 180 ou 240 meses, ou por financiamento bancário convencional com uso de FGTS.' },
                            },
                            {
                            '@type': 'Question',
                            name: 'O que é o modelo quase pronto, como o Thiene Residencial?',
                            acceptedAnswer: { '@type': 'Answer', text: 'O Thiene Residencial tem entrada reduzida de 10% e uma condição especial de 10% de desconto adicional pagando 40% do valor ate a entrega das chaves, com saldo em ate 180 meses corrigido por IGPM + 0,75% a.m.' },
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
                            Compare condições de pagamento, prazos e personalização entre comprar em obra e comprar um imóvel já pronto na região Sul de Santa Catarina.
                            </p>
                            </div>
                            </section>

                            {/* CONTEÚDO */}
                            <article style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vh,96px) clamp(18px,5vw,64px)' }}>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Os estágios reais dos empreendimentos da região</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            Os empreendimentos da Construtora Fontana na região Sul de Santa Catarina se dividem em estágios de pagamento distintos: <strong>obra</strong> (em construção, com plano de parcelas durante a obra), <strong>quase pronto</strong> (obra em fase final, com condições especiais) e <strong>pronto</strong> (imóvel já concluído). Cada estágio tem um plano de pagamento próprio.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            Exemplos reais de empreendimentos em obra são o <Link href="/empreendimento/fontana/lavis-residencial-centro-criciuma-sc" style={{ color: '#1E8F76' }}>Lavis Residencial</Link>, o Fidenza Residencial e o Mar di Nizza Residencial. O <Link href="/empreendimento/fontana/thiene-centro-criciuma-sc" style={{ color: '#1E8F76' }}>Thiene Residencial</Link> está classificado como quase pronto. Já o <Link href="/empreendimento/fontana/pavia-rio-maina-criciuma-sc" style={{ color: '#1E8F76' }}>Pavia Residencial</Link> e o Avezzano Residencial são exemplos de imóveis prontos, com plano de pagamento diferente dos empreendimentos ainda em obra.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Condições de pagamento por estágio</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            As condições de entrada e desconto à vista variam conforme o estágio e o empreendimento. Veja exemplos reais:
                            </p>
                            <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                            <tr style={{ background: '#1E8F76', color: '#fff' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Empreendimento</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Estágio</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Entrada</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Desconto à vista</th>
                            </tr>
                            </thead>
                            <tbody>
                            {[
                            ['Lavis Residencial (padrão obra)', 'Obra', '20%', '15%'],
                            ['Thiene Residencial', 'Quase pronto', '10%', '15% + 10% extra'],
                            ['Pavia Residencial', 'Pronto', '15%', '5%'],
                            ['Avezzano Residencial', 'Pronto', '20%', 'Não informado'],
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
                            No Thiene Residencial, além do desconto à vista padrão de 15%, há uma condição especial: 10% de desconto adicional para quem paga 40% do valor ate a entrega das chaves, com ato mínimo de 10% e saldo em ate 180 meses. Já no plano padrão de obra da Fontana, o saldo é dividido em ate 72 parcelas mensais e ate 6 reforços anuais, corrigidos pelo CUB/SC.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Tempo de espera e personalização</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            Comprar na planta significa aguardar a conclusão da obra, com prazos que variam conforme o empreendimento e o cronograma da construtora. Em compensacao, comprar na planta costuma permitir personalização do acabamento durante a obra. Já um imóvel pronto, como o Pavia Residencial ou o Avezzano Residencial, pode ser habitado ou alugado imediatamente após a compra, mas o acabamento já está definido e concluído, sem espaço para personalização.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            O Thiene Residencial, classificado como quase pronto, representa um meio-termo: a obra está em fase final, o que reduz o tempo de espera em relação a um lançamento recém-iniciado, mas ainda permite condições de entrada reduzida e desconto adicional para quem antecipa parte do pagamento.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Financiamento disponível em cada fase</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            Durante a obra, o financiamento é direto com a construtora, sem uso de FGTS, com parcelas mensais e reforços anuais corrigidos pelo CUB/SC. Em imóveis prontos, o saldo após a entrada pode ser financiado diretamente com a construtora, corrigido por IGPM + 0,75% a.m., em prazos de ate 180 ou 240 meses conforme o empreendimento, ou por financiamento bancário convencional, que permite o uso do FGTS.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            No Pavia Residencial, o saldo direto pós-entrada é financiado em ate 240 meses. Já no Thiene Residencial, o saldo após o pagamento inicial é financiado em ate 180 meses, ambos corrigidos por IGPM + 0,75% a.m.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Vantagens de cada opção</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 24, marginTop: 16 }}>
                            <div style={{ background: '#E9F5F1', padding: 24, borderRadius: 2 }}>
                            <h3 style={{ fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E8F76', marginTop: 0 }}>Na Planta</h3>
                            <ul style={{ fontSize: 14, lineHeight: 2, color: '#333', paddingLeft: 20, margin: 0 }}>
                            <li>Parcelas menores durante a obra</li>
                            <li>Possibilidade de personalização do acabamento</li>
                            <li>Sem aprovação bancária (financiamento direto)</li>
                            <li>Preco de lançamento geralmente menor</li>
                            </ul>
                            </div>
                            <div style={{ background: '#F0F0F0', padding: 24, borderRadius: 2 }}>
                            <h3 style={{ fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginTop: 0 }}>Pronto</h3>
                            <ul style={{ fontSize: 14, lineHeight: 2, color: '#333', paddingLeft: 20, margin: 0 }}>
                            <li>Disponível para morar ou alugar imediatamente</li>
                            <li>Acabamento já concluído, sem risco de atraso de obra</li>
                            <li>Permite financiamento bancário com uso de FGTS</li>
                            <li>Entrada pode ser menor, conforme o empreendimento (ex: 15% no Pavia Residencial)</li>
                            </ul>
                            </div>
                            </div>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Qual escolher?</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            Quem busca parcelas menores durante um período mais longo, quer personalizar o acabamento ou não tem FGTS disponível pode se beneficiar de comprar na planta, como no Lavis Residencial ou no Fidenza Residencial. Quem quer morar ou alugar imediatamente, ou prefere usar o FGTS no financiamento, pode considerar um imóvel pronto, como o Pavia Residencial. O Thiene Residencial, quase pronto, é uma opção intermediaria para quem quer um prazo de entrega mais curto com condições especiais de desconto. Fale com Stiven Allan, CRECI 60.275, para avaliar qual estágio se encaixa melhor no seu momento de vida e planejamento financeiro.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            Vale lembrar que o prazo de entrega e as condições de pagamento são definidos em contrato e podem mudar conforme o empreendimento escolhido. Antes de decidir entre planta, quase pronto ou pronto, vale simular o valor total de cada opção, incluindo entrada, parcelas, reforços e eventual saldo pós-chaves, para comparar o esforço financeiro real de cada alternativa ao longo do tempo. Essa comparação ajuda a evitar surpresas no fluxo de caixa e a escolher a opção mais alinhada ao seu momento de vida, seja para moradia, veraneio ou diversificacao de patrimônio.
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
                            Veja também: <Link href="/guia/comprar-apartamento-na-planta-criciuma" style={{ color: '#1E8F76' }}>Como Comprar Apartamento na Planta em Criciuma</Link> e <Link href="/guia/financiamento-direto-vs-bancario" style={{ color: '#1E8F76' }}>Financiamento Direto vs. Bancário</Link>.
                            </p>

                            {/* CTA */}
                            <div style={{ background: '#0F2621', color: '#E4F2EE', borderRadius: 2, padding: 'clamp(32px,5vw,56px)', marginTop: 64, textAlign: 'center' }}>
                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,28px)', margin: 0 }}>Encontre o estágio ideal para você</h2>
                            <p style={{ color: 'rgba(228,242,238,0.8)', marginTop: 16, marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
                            Empreendimentos em obra, quase prontos e prontos disponíveis em Criciuma e região. Stiven Allan, CRECI 60.275.
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
                            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Início</Link>
                            <Link href="/empreendimentos" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Empreendimentos</Link>
                            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>WhatsApp</a>
                            </p>
                            </footer>
                            </main>
                            )
                            }
