import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'

const CANONICAL = `${SITE_URL}/imprensa`
// contato@stivenallan.com.br NÃO é usado aqui: o domínio stivenallan.com.br
// não tem registro MX (confirmado via dig em 2026-07-24) — só existe
// infraestrutura de ENVIO (Resend/SES) no subdomínio send., não de recebimento
// no domínio raiz. Publicar esse endereço como contato de imprensa faria
// qualquer resposta de jornalista bater e retornar (bounce). WhatsApp é o
// único canal de contato confirmado funcional nesta página.
const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1%20Stiven%2C%20sou%20jornalista%2Feditor%20e%20gostaria%20de%20falar%20sobre%20uma%20pauta.'

export const metadata: Metadata = {
  title: 'Imprensa',
  description: 'Informações para imprensa: quem é Stiven Allan, áreas sobre as quais pode comentar, contato editorial e política de correção dos conteúdos publicados neste site.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Imprensa | Stiven Allan',
    description: 'Informações para imprensa, contato editorial e política de correção de conteúdo.',
    url: CANONICAL,
    type: 'profile',
  },
  twitter: { card: 'summary_large_image', title: 'Imprensa | Stiven Allan' },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  url: CANONICAL,
  mainEntity: {
    '@type': 'Person',
    name: 'Stiven Allan',
    url: SITE_URL,
    jobTitle: 'Corretor de imóveis',
    // hasCredential (schema estruturado) removido: Gate B (validação
    // oficial do CRECI) aberto. O texto simples "CRECI 60.275" ainda
    // aparece em outras páginas do site (não é apagado automaticamente) —
    // Gate B permanece aberto até validação oficial e padronização
    // completa. Ver PR #17.
    sameAs: ['https://www.instagram.com/stivenallan.ofc'],
    knowsAbout: [
      'Financiamento direto com construtora',
      'Mercado imobiliário de Criciúma e Sul de Santa Catarina',
      'Compra de apartamento na planta',
      'Imóveis de alto padrão',
    ],
  },
}

export default function ImprensaPage() {
  return (
    <main style={{ background: '#FAFAF8', color: '#1A1A1A', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

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
          <p style={{ fontSize: 11, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(245,242,237,0.55)', marginBottom: 20 }}>Imprensa</p>
          <h1 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 'clamp(28px,5vw,52px)', lineHeight: 1.1, margin: 0 }}>
            Informações para imprensa
          </h1>
          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(245,242,237,0.75)', marginTop: 24, lineHeight: 1.6 }}>
            Quem escreve os guias deste site, sobre o que pode comentar, como entrar em contato e como funciona a correção de erros.
          </p>
        </div>
      </section>

      {/* CONTEÚDO */}
      <article style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vh,96px) clamp(18px,5vw,64px)' }}>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 0, marginBottom: 16 }}>Quem é</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          <strong>Stiven Allan</strong>, corretor de imóveis. Atua na intermediação de empreendimentos na planta e de alto padrão das construtoras Fontana e Eraldo no Sul de Santa Catarina — o catálogo completo está em <Link href="/empreendimentos" style={{ color: '#1A5C3A' }}>/empreendimentos</Link>.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: '#666', marginTop: 12 }}>
          Este site ainda não publica números de anos de atuação, quantidade de clientes atendidos ou vínculos institucionais formais (associações, sindicatos, conselhos) nesta página, porque não temos comprovação documental pronta para citar de forma verificável. Quando essa documentação existir, ela será publicada aqui com a fonte.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Sobre o que posso comentar</h2>
        <ul style={{ fontSize: 15, lineHeight: 2, color: '#333', paddingLeft: 24 }}>
          <li>Financiamento direto com construtora (mecânica, comparação com financiamento bancário, correção de parcelas)</li>
          <li>Mercado imobiliário de Criciúma e do Sul de Santa Catarina</li>
          <li>Compra de apartamento na planta (processo, riscos, documentação)</li>
          <li>Imóveis de alto padrão na região</li>
        </ul>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Contato editorial</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          Para pauta, entrevista ou verificação de dado publicado nos guias deste site, o canal confirmado é o <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: '#1A5C3A' }}>WhatsApp</a>.
        </p>

        <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,30px)', marginTop: 48, marginBottom: 16 }}>Política de correção</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
          Os guias deste site (<Link href="/guia" style={{ color: '#1A5C3A' }}>/guia</Link>) trazem dados comerciais — condições de financiamento, valores, prazos, índices — que mudam conforme a tabela vigente de cada empreendimento e conforme índices oficiais como o CUB/SC. Encontrou algo desatualizado, incorreto ou sem fonte? Mande o link da página e o trecho em questão pelo <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ color: '#1A5C3A' }}>WhatsApp</a>. Correções factuais são aplicadas assim que verificadas; a data de &quot;Atualizado em&quot; de cada guia reflete a última alteração de conteúdo publicada, não a data de build do site.
        </p>

        {/* CTA */}
        <div style={{ background: '#1A5C3A', color: '#fff', borderRadius: 2, padding: 'clamp(32px,5vw,56px)', marginTop: 64, textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 'clamp(20px,3vw,28px)', margin: 0 }}>Falar com Stiven</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 16, marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
            Pauta, entrevista ou verificação de dado publicado.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WPP} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#fff', border: '1px solid rgba(255,255,255,0.55)', padding: '14px 28px', textDecoration: 'none' }}>
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </article>

      {/* FOOTER */}
      <footer style={{ background: '#111', color: 'rgba(255,255,255,0.4)', padding: 'clamp(32px,5vh,56px) clamp(18px,5vw,64px)', textAlign: 'center', fontSize: 12 }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Stiven Allan - CRECI 60.275 - Imoveis em Criciuma e Sul de SC</p>
        <p style={{ margin: '8px 0 0' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Início</Link>
          <Link href="/sobre" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginRight: 16 }}>Sobre</Link>
          <Link href="/empreendimentos" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Empreendimentos</Link>
        </p>
      </footer>
    </main>
  )
}
