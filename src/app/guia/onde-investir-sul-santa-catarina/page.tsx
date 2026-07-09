import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

const SLUG = 'onde-investir-sul-santa-catarina'
const CANONICAL = `${SITE_URL}/guia/${SLUG}`
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20quero%20saber%20mais%20sobre%20as%20regi%C3%B5es%20com%20empreendimentos%20no%20Sul%20de%20SC.'

export const metadata: Metadata = {
  title: 'Onde Investir no Sul de Santa Catarina: Guia por Região',
    description: 'Conheca as cidades com empreendimentos Fontana ativos no Sul de Santa Catarina: Criciuma, Balneario Rincao, Laguna, Icara, Sideropolis, Balneario Picarras e Bom Jardim da Serra.',
      alternates: { canonical: CANONICAL },
        openGraph: {
            title: 'Onde Investir no Sul de Santa Catarina | Stiven Allan',
                description: 'Perfil real de cada regiao com lancamentos ativos: cidade, praia ou serra.',
                    url: CANONICAL,
                        type: 'article',
                          },
                            twitter: { card: 'summary_large_image', title: 'Onde Investir no Sul de Santa Catarina | Stiven Allan' },
                            }

                            const SCHEMA = {
                            '@context': 'https://schema.org',
                            '@type': 'Article',
                            headline: 'Onde Investir no Sul de Santa Catarina: Guia por Região',
                            description: 'Guia regional factual das cidades com empreendimentos ativos da Construtora Fontana no Sul de Santa Catarina.',
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
                            { '@type': 'ListItem', position: 3, name: 'Onde Investir no Sul de Santa Catarina', item: CANONICAL },
                            ],
                            }

                            const FAQ_SCHEMA = {
                            '@context': 'https://schema.org',
                            '@type': 'FAQPage',
                            mainEntity: [
                            {
                            '@type': 'Question',
                            name: 'Quais cidades tem empreendimentos Fontana disponiveis hoje?',
                            acceptedAnswer: { '@type': 'Answer', text: 'A Construtora Fontana tem empreendimentos ativos em Criciuma, Balneario Rincao, Laguna, Icara, Sideropolis, Balneario Picarras e Bom Jardim da Serra.' },
                            },
                            {
                            '@type': 'Question',
                            name: 'Qual bairro concentra os lancamentos em Criciuma?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Os bairros Centro, Cruzeiro do Sul, Santa Barbara, Comerciario, Michel, Rio Maina e Grande Prospera concentram os lancamentos Fontana em Criciuma.' },
                            },
                            {
                            '@type': 'Question',
                            name: 'Existe empreendimento de frente mar na regiao?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Sim, o Aguas de Marano Residencial em Balneario Picarras tem a frase de marketing "Frente mar", assim como os empreendimentos Mar di Arienzo, Mar di Atrani e Mar Positano em Balneario Rincao e Mar di Licata e Mar di Nizza em Laguna.' },
                            },
                            {
                            '@type': 'Question',
                            name: 'Ha empreendimento na serra catarinense?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Sim, o Campos da Montanha Residencial fica em Bom Jardim da Serra, com a frase de marketing "Sinta o bem-estar da serra em todos os seus dias".' },
                            },
                            {
                            '@type': 'Question',
                            name: 'Qual a diferenca entre os empreendimentos de Balneario Rincao e Laguna?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Balneario Rincao concentra o Mar di Arienzo, o Mar di Atrani, o Mar Positano no bairro Centro, alem do Villammare Residencial. Laguna concentra o Mar di Licata e o Mar di Nizza, ambos no bairro Mar Grosso.' },
                            },
                            ],
                            }

                            export default function GuiaOndeInvestirSulSCPage() {
                            return (
                            <main style={{ background: '#FAFAF8', color: '#1A1A1A', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
                            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
                            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
                            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />

                            {/* HEADER */}
                            <header style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '16px clamp(18px,5vw,64px)' }}>
                            <nav style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Link href="/" style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 400, letterSpacing: '0.22em', fontSize: 15, color: '#1A1A1A', textDecoration: 'none', textTransform: 'uppercase' }}>Stiven Allan</Link>
                            <Link href="/empreendimentos" style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#B89B5E', textDecoration: 'none' }}>Ver Empreendimentos</Link>
                            </nav>
                            </header>

                            {/* HERO */}
                            <section style={{ background: '#1A1814', color: '#F5F1EA', padding: 'clamp(64px,12vh,120px) clamp(18px,5vw,64px)' }}>
                            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                            <p style={{ fontSize: 11, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(245,241,234,0.55)', marginBottom: 20 }}>Guia - Regioes</p>
                            <h1 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 'clamp(28px,5vw,52px)', lineHeight: 1.1, margin: 0 }}>
                            Onde Investir no Sul de Santa Catarina
                            </h1>
                            <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(245,241,234,0.75)', marginTop: 24, lineHeight: 1.6 }}>
                            Conheca as cidades onde a Construtora Fontana tem empreendimentos ativos hoje, com o perfil real de cada regiao.
                            </p>
                            </div>
                            </section>

                            {/* CONTEUDO */}
                            <article style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vh,96px) clamp(18px,5vw,64px)' }}>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Criciuma - o polo urbano central</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            Criciuma e o maior polo economico do sul catarinense e concentra o maior numero de lancamentos Fontana da regiao, distribuidos pelos bairros Centro, Cruzeiro do Sul, Santa Barbara, Comerciario, Michel, Rio Maina e Grande Prospera. E a cidade certa para quem busca vida urbana, comercio, servicos e proximidade do trabalho.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            Entre os empreendimentos ativos em Criciuma estao o <Link href="/empreendimento/fontana/monte-leone-centro-criciuma-sc" style={{ color: '#B89B5E' }}>Monte Leone Residencial</Link> e o <Link href="/empreendimento/fontana/lavis-residencial-centro-criciuma-sc" style={{ color: '#B89B5E' }}>Lavis Residencial</Link>, ambos no Centro, o Fidenza Residencial no Cruzeiro do Sul, o Parco Savello Residencial em Santa Barbara, o Bellante Residencial no Comerciario, o Calalzo Di Cadore Residencial no Michel, o <Link href="/empreendimento/fontana/pavia-rio-maina-criciuma-sc" style={{ color: '#B89B5E' }}>Pavia Residencial</Link> em Rio Maina e o Villaggio Verde Residenziale em Grande Prospera. Tambem estao ativos na cidade o Tremezzo Residencial e o Thiene Residencial, ambos no Centro, o Bosco Del Montello Residencial, tambem no Centro, e o Pineto Residencial, no mesmo bairro, alem do Calliano Residencial e do Due Fratelli Residencial, ja entregues no Centro.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Balneario Rincao - vida litoranea</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            Balneario Rincao e um municipio litoraneo, com empreendimentos concentrados no bairro Centro, proximos a orla. E a opcao para quem busca um imovel de veraneio ou moradia com acesso direto a praia.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            Os lancamentos ativos sao o Mar di Arienzo Residencial, o Mar di Atrani Residencial, o Mar Positano Residencial e o Villammare Residencial. Os proprios nomes e frases de marketing desses empreendimentos, como "Onde o mar habita, estar perto e o melhor destino", reforcam o posicionamento litoraneo da regiao.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Laguna - litoral no bairro Mar Grosso</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            Laguna e outro municipio litoraneo do Sul de Santa Catarina, com os lancamentos Fontana concentrados no bairro Mar Grosso. Os empreendimentos ativos sao o Mar di Licata Residencial e o Mar di Nizza Residencial, ambos com apelo de veraneio junto ao litoral.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Icara - cidade vizinha a Criciuma</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            Icara e um municipio vizinho a Criciuma, com os lancamentos Fontana concentrados no bairro Centro. E uma opcao para quem busca proximidade com o polo economico regional em um municipio proprio.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            Os empreendimentos ativos em Icara sao o Castellano Residencial, o Pianezze Residencial e o Piazza Castello Residencial, este ultimo com apenas 2 apartamentos por andar, segundo sua propria frase de marketing.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Sideropolis - cidade do interior</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            Sideropolis e um municipio do interior proximo a Criciuma, com lancamentos concentrados no bairro Centro. Os empreendimentos ativos sao o Avezzano Residencial e o Rocca Pietore Residencial.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Balneario Picarras - frente mar</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            Balneario Picarras e um municipio litoraneo de Santa Catarina onde a Fontana tem um lancamento no bairro Centro: o <Link href="/empreendimento/fontana/aguas-de-marano-frente-mar-balneario-picarras-sc" style={{ color: '#B89B5E' }}>Aguas de Marano Residencial</Link>, com a propria frase de marketing "Frente mar - mergulhe em cada detalhe", reforcando a proximidade direta com a praia.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Bom Jardim da Serra - natureza e serra</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            Bom Jardim da Serra e o unico municipio de serra com lancamento Fontana ativo: o Campos da Montanha Residencial, cuja propria frase de marketing e "Sinta o bem-estar da serra em todos os seus dias". E a opcao para quem busca contato com a natureza e um ritmo de vida diferente do litoral ou do centro urbano.
                            </p>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Resumo das regioes</h2>
                            <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                            <tr style={{ background: '#B89B5E', color: '#1A1814' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Cidade</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Perfil</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500 }}>Empreendimentos ativos</th>
                            </tr>
                            </thead>
                            <tbody>
                            {[
                            ['Criciuma', 'Centro urbano', '14 lancamentos em 7 bairros'],
                            ['Balneario Rincao', 'Litoral', '4 lancamentos'],
                            ['Laguna', 'Litoral', '2 lancamentos no Mar Grosso'],
                            ['Icara', 'Cidade vizinha', '3 lancamentos no Centro'],
                            ['Sideropolis', 'Interior', '2 lancamentos no Centro'],
                            ['Balneario Picarras', 'Litoral', '1 lancamento no Centro'],
                            ['Bom Jardim da Serra', 'Serra', '1 lancamento'],
                            ].map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#F5EFE0' : '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                            {row.map((cell, j) => (
                            <td key={j} style={{ padding: '12px 16px', color: '#333' }}>{cell}</td>
                            ))}
                            </tr>
                            ))}
                            </tbody>
                            </table>
                            </div>

                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Como escolher a regiao certa</h2>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                            A escolha da regiao depende do objetivo de cada comprador. Para vida urbana e proximidade de comercio e servicos, Criciuma concentra a maior variedade de lancamentos. Para quem busca um imovel de veraneio ou moradia junto a praia, Balneario Rincao, Laguna e Balneario Picarras sao as opcoes litoraneas. Para quem prefere contato com a natureza e clima de serra, Bom Jardim da Serra e a unica opcao disponivel hoje. Ja Icara e Sideropolis oferecem alternativas em municipios vizinhos a Criciuma, com lancamentos proprios no bairro Centro.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            Fale com Stiven Allan, CRECI 60.275, para conhecer os detalhes de cada empreendimento e encontrar a regiao mais alinhada ao seu objetivo, seja moradia, veraneio ou diversificacao de patrimonio.
                            </p>
                            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
                            Cada regiao tem sua propria dinamica: Criciuma reune a maior diversidade de bairros e tipologias, enquanto as cidades litoraneas concentram empreendimentos voltados a segunda residencia e a valorizacao de longo prazo junto ao mar. Ja Icara e Sideropolis funcionam como extensao natural do polo criciumense, com opcoes de bom custo-beneficio em municipios proprios. Bom Jardim da Serra, por sua vez, atende quem busca algo bem diferente do litoral e do centro urbano, com clima ameno e paisagem de montanha. Antes de decidir, vale considerar nao apenas o perfil da regiao, mas tambem o estagio do empreendimento (planta, quase pronto ou pronto) e as condicoes de pagamento de cada lancamento.
                            </p>

<p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginTop: 16 }}>
O estagio de obra tambem varia por regiao. Em Icara, os tres estagios convivem: o Castellano Residencial esta em obras, enquanto o Pianezze Residencial e o Piazza Castello Residencial ja estao prontos. Em Sideropolis, o Avezzano Residencial e o Rocca Pietore Residencial estao na planta. Ja em Balneario Rincao e em Laguna, os lancamentos ativos estao concentrados na fase de obras, assim como o Aguas de Marano Residencial em Balneario Picarras e o Campos da Montanha Residencial em Bom Jardim da Serra. Essa diversidade de estagios entre as regioes reforca a importancia de conversar com Stiven Allan antes de decidir, para alinhar o momento da compra ao perfil de cada empreendimento.
</p>


                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Perguntas Frequentes</h2>

                            {FAQ_SCHEMA.mainEntity.map((item, i) => (
                            <details key={i} style={{ borderTop: '1px solid rgba(0,0,0,0.10)', padding: '20px 0' }}>
                            <summary style={{ cursor: 'pointer', fontSize: 16, fontWeight: 500, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {item.name}
                            <span style={{ fontSize: 20, color: '#B89B5E', marginLeft: 16, flexShrink: 0 }}>+</span>
                            </summary>
                            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#555', marginTop: 12, marginBottom: 0 }}>{item.acceptedAnswer.text}</p>
                            </details>
                            ))}
                            <div style={{ borderTop: '1px solid rgba(0,0,0,0.10)' }} />

                            <p style={{ fontSize: 14, lineHeight: 1.8, color: '#666', marginTop: 32 }}>
                            Veja tambem: <Link href="/guia/comprar-apartamento-na-planta-criciuma" style={{ color: '#B89B5E' }}>Como Comprar Apartamento na Planta em Criciuma</Link> e <Link href="/guia/apartamento-na-planta-vs-pronto" style={{ color: '#B89B5E' }}>Apartamento na Planta vs. Pronto</Link>.
                            </p>

                            {/* CTA */}
                            <div style={{ background: '#1A1814', color: '#F5F1EA', borderRadius: 2, padding: 'clamp(32px,5vw,56px)', marginTop: 64, textAlign: 'center' }}>
                            <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,28px)', margin: 0 }}>Encontre a regiao ideal</h2>
                            <p style={{ color: 'rgba(245,241,234,0.8)', marginTop: 16, marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
                            Empreendimentos Fontana disponiveis em 7 cidades do Sul de Santa Catarina. Stiven Allan, CRECI 60.275.
                            </p>
                            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#F5F1EA', border: '1px solid rgba(245,241,234,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
                            Falar no WhatsApp
                            </a>
                            <Link href="/empreendimentos" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#F5F1EA', border: '1px solid rgba(245,241,234,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
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
