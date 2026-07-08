import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { imoveis } from '@/data/imoveis'
import FormContato from '@/app/empreendimento/[construtora]/[slug]/FormContato'

// LP enxuta para tráfego pago frio: 1 oferta + 1 ação, sem navegação.
// Variante de teste contra a página completa — noindex, só entra quem clica no anúncio.

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return imoveis.filter((i) => i.ativo).map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const imovel = imoveis.find((i) => i.slug === slug)
  if (!imovel) return { title: 'Empreendimento' }
  return {
    title: `${imovel.nome} — condições direto com a construtora`,
    description: `${imovel.nome}, ${imovel.bairro ? imovel.bairro + ', ' : ''}${imovel.cidade}/${imovel.uf}. Financiamento direto, sem banco. Receba plantas e condições.`,
    robots: { index: false, follow: false },
  }
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params
  const imovel = imoveis.find((i) => i.slug === slug)
  if (!imovel) notFound()

  const local = [imovel.bairro, `${imovel.cidade}/${imovel.uf}`].filter(Boolean).join(' · ')

  return (
    <main style={{ fontFamily: 'var(--font-hanken), system-ui, sans-serif', background: '#faf7f1', color: '#1a1a1a', minHeight: '100svh' }}>
      <section style={{ position: 'relative', minHeight: '46svh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: '#111', overflow: 'hidden' }}>
        {imovel.img && (
          <Image src={imovel.img} alt={imovel.nome} fill priority sizes="100vw" style={{ objectFit: 'cover', opacity: 0.85 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.25) 60%)' }} />
        <div style={{ position: 'relative', padding: '48px 20px 28px', maxWidth: 640, margin: '0 auto', width: '100%' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#e2c275', margin: '0 0 10px' }}>
            {imovel.status} · financiamento direto com a construtora
          </p>
          <h1 style={{ fontSize: 'clamp(28px,7vw,44px)', lineHeight: 1.08, color: '#fff', margin: 0, fontWeight: 700 }}>{imovel.nome}</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', margin: '10px 0 0' }}>{local}</p>
        </div>
      </section>

      <section style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px 8px' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          {[
            'Sem banco e sem aprovação bancária: contrato direto com a Construtora Fontana',
            'Entrada de 20% e parcelas durante a obra — condições reveladas na conversa',
            'A tabela sobe a cada fase da obra: quem entra antes, entra melhor',
          ].map((b) => (
            <li key={b} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15, lineHeight: 1.5 }}>
              <span aria-hidden="true" style={{ color: '#2a7d4f', fontWeight: 700 }}>✓</span>
              {b}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 48px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e7e0d2', borderRadius: 14, padding: '22px 18px' }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, margin: '0 0 6px', textAlign: 'center' }}>Receba as condições no WhatsApp</h2>
          <p style={{ fontSize: 13, color: '#71717a', textAlign: 'center', margin: '0 0 18px' }}>
            Plantas, valores e disponibilidade do {imovel.nome} — resposta rápida, sem compromisso.
          </p>
          <FormContato empreendimento={imovel.nome} propertySlug={imovel.slug} />
        </div>
        <p style={{ fontSize: 12, color: '#a1a1aa', textAlign: 'center', marginTop: 24 }}>
          Stiven Allan · Corretor CRECI 60.275 · Atendimento exclusivo
        </p>
      </section>
    </main>
  )
}
