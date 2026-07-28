import type { Metadata } from 'next'
import Image from 'next/image'
import FormContato from '@/app/empreendimento/[construtora]/[slug]/FormContato'

// LP de tráfego pago (Google Search) para o ângulo "financiamento direto, sem
// banco" — o diferencial que atravessa TODOS os empreendimentos, em vez de
// apostar em um prédio só.
//
// Por que uma página separada e não a home ou o guia:
// - a home apresenta o negócio inteiro e dispersa quem veio de um anúncio;
// - /guia/financiamento-direto-construtora foi escrito para SEO (informar em
//   profundidade), e converte pior que uma página de uma oferta e uma ação.
//
// noindex de propósito: é destino de anúncio. Se fosse indexável, competiria
// com o guia pelas mesmas buscas e canibalizaria o orgânico que já existe.
//
// Rota estática: tem precedência sobre /lp/[slug], que só resolve slugs de
// empreendimento de @/data/imoveis.

const HERO_IMG =
  'https://xpkznaqgctfkoonqpcye.supabase.co/storage/v1/object/public/imoveis/capas/monte-leone-centro-criciuma-sc.jpg'

export const metadata: Metadata = {
  title: 'Apartamento na planta em Criciúma sem depender do banco',
  description:
    'Financiamento direto com a construtora: negociação sem intermediação bancária, para quem é autônomo, empresário ou não tem renda formal comprovável. Receba as condições pelo WhatsApp.',
  robots: { index: false, follow: false },
}

// Números conferidos no banco (36 empreendimentos ativos em 8 cidades).
// Se virarem texto desatualizado, é melhor remover do que exibir errado.
const PROVAS = [
  { n: '36', label: 'empreendimentos ativos' },
  { n: '8', label: 'cidades no Sul de SC' },
  { n: '2', label: 'construtoras parceiras' },
]

const PARA_QUEM = [
  'Você é autônomo, empresário ou MEI e o banco complica na comprovação de renda',
  'Você tem entrada, mas não quer passar por análise bancária para começar',
  'Você quer comprar na planta e pagar durante a obra, no seu ritmo',
]

const PASSOS = [
  {
    n: '01',
    titulo: 'Você conta seu momento',
    desc: 'Quanto tem de entrada, quanto cabe por mês e em que região quer morar. Sem formulário longo e sem consulta ao seu CPF.',
  },
  {
    n: '02',
    titulo: 'Eu monto as opções reais',
    desc: 'Comparo os empreendimentos que cabem no seu plano e te mostro as condições vigentes de cada um — inclusive o que não vale a pena.',
  },
  {
    n: '03',
    titulo: 'Contrato direto com a construtora',
    desc: 'A negociação é feita com a construtora, sem intermediação bancária. Ela pode fazer a própria análise cadastral, conforme as políticas dela.',
  },
]

export default function LpFinanciamentoDireto() {
  return (
    <main style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', background: '#faf7f1', color: '#1a1a1a', minHeight: '100svh' }}>
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '52svh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: '#111', overflow: 'hidden' }}>
        <Image unoptimized src={HERO_IMG} alt="" aria-hidden="true" fill priority sizes="100vw" style={{ objectFit: 'cover', opacity: 0.8 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 65%)' }} />
        <div style={{ position: 'relative', padding: '56px 20px 32px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#e2c275', margin: '0 0 12px' }}>
            Criciúma e Sul de Santa Catarina
          </p>
          <h1 style={{ fontSize: 'clamp(28px,7vw,46px)', lineHeight: 1.08, color: '#fff', margin: 0, fontWeight: 700 }}>
            Apartamento na planta sem depender da aprovação do banco
          </h1>
          <p style={{ fontSize: 'clamp(15px,2.2vw,18px)', color: 'rgba(255,255,255,0.88)', margin: '16px 0 0', lineHeight: 1.6 }}>
            O financiamento é negociado direto com a construtora. Para quem tem renda,
            mas não tem a papelada que o banco pede.
          </p>
          <a
            href="#form"
            style={{ display: 'inline-block', marginTop: 26, background: '#e2c275', color: '#1a1a1a', fontWeight: 700, fontSize: 15, padding: '15px 30px', borderRadius: 10, textDecoration: 'none' }}
          >
            Ver as condições para o meu caso
          </a>
        </div>
      </section>

      {/* PROVA */}
      <section style={{ background: '#fff', borderBottom: '1px solid #eee5d5' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '22px 20px', display: 'flex', justifyContent: 'space-around', gap: 12, textAlign: 'center' }}>
          {PROVAS.map((p) => (
            <div key={p.label}>
              <div style={{ fontSize: 'clamp(22px,5vw,30px)', fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>{p.n}</div>
              <div style={{ fontSize: 12, color: '#71717a', marginTop: 6, lineHeight: 1.35 }}>{p.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PARA QUEM É */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px 8px' }}>
        <h2 style={{ fontSize: 'clamp(20px,3.6vw,26px)', fontWeight: 700, margin: '0 0 18px' }}>
          Isso faz sentido para você se…
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {PARA_QUEM.map((b) => (
            <li key={b} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', fontSize: 15.5, lineHeight: 1.55 }}>
              <span aria-hidden="true" style={{ color: '#2a7d4f', fontWeight: 700, flexShrink: 0 }}>✓</span>
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '36px 20px 8px' }}>
        <h2 style={{ fontSize: 'clamp(20px,3.6vw,26px)', fontWeight: 700, margin: '0 0 20px' }}>Como funciona</h2>
        <div style={{ display: 'grid', gap: 18 }}>
          {PASSOS.map((p) => (
            <div key={p.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 26, fontWeight: 300, color: '#c9a24b', lineHeight: 1, flexShrink: 0, minWidth: 38 }}>{p.n}</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 5px' }}>{p.titulo}</h3>
                <p style={{ fontSize: 14.5, color: '#52525b', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* O QUE ESPERAR — honestidade que filtra lead ruim antes de virar conversa */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '36px 20px 8px' }}>
        <div style={{ background: '#fffaf0', border: '1px solid #e7d9b8', borderRadius: 12, padding: '20px 20px' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 12px' }}>Para não perder o seu tempo</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10, fontSize: 14, color: '#52525b', lineHeight: 1.6 }}>
            <li>• Existe entrada. Ela varia por empreendimento e costuma partir de 8% a 20% do valor.</li>
            <li>• As parcelas da obra são corrigidas mensalmente pelo CUB/SC — o índice da construção civil.</li>
            <li>• A construtora pode fazer a própria análise cadastral e de capacidade de pagamento. A aprovação não é automática.</li>
            <li>• Os valores mudam conforme a fase da obra e a tabela vigente de cada empreendimento.</li>
          </ul>
        </div>
      </section>

      {/* FORM */}
      <section id="form" style={{ maxWidth: 680, margin: '0 auto', padding: '36px 20px 48px', scrollMarginTop: 20 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e7e0d2', borderRadius: 14, padding: '24px 18px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px', textAlign: 'center' }}>
            Receba as opções que cabem no seu plano
          </h2>
          <p style={{ fontSize: 13.5, color: '#71717a', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
            Me conte seu momento e eu retorno pelo WhatsApp com os empreendimentos que
            fazem sentido — e as condições reais de cada um.
          </p>
          <FormContato
            empreendimento="Financiamento direto"
            propertySlug="lp-financiamento-direto"
            waMessage="Olá Stiven! Vim pelo anúncio de financiamento direto e quero entender as condições para o meu caso."
          />
        </div>
        <p style={{ fontSize: 12, color: '#a1a1aa', textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
          Stiven Allan · Corretor de imóveis · CRECI/SC 60.275
        </p>
      </section>
    </main>
  )
}
