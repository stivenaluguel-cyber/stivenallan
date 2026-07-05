import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { EMPREENDIMENTOS } from '@/lib/empreendimentos'
import { getVitrineEmpreendimentos } from '@/lib/vitrine'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Empreendimentos em Criciúma SC e região',
  description: 'Todos os empreendimentos da Fontana Construtora em Criciúma e região SC. Apartamentos e terrenos com financiamento direto. Atendimento exclusivo com Stiven Allan.',
  alternates: { canonical: 'https://stivenallan.vercel.app/empreendimentos' },
  openGraph: {
    title: 'Empreendimentos em Criciúma SC e região | Stiven Allan',
    description: 'Descubra os empreendimentos da Fontana Construtora em Criciúma SC. Financiamento direto, sem banco.',
    url: 'https://stivenallan.vercel.app/empreendimentos',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Empreendimentos em Criciúma SC e região | Stiven Allan' },
  robots: { index: true, follow: true },
}

const WHATSAPP = 'https://api.whatsapp.com/send?phone=5548991642332&text=Ol%C3%A1%20Stiven%2C%20gostaria%20de%20conhecer%20os%20empreendimentos%20Fontana!'

export default async function EmpreendimentosPage() {
  const listaEmp = await getVitrineEmpreendimentos();
  const lista = listaEmp.filter((e) => !e.oculto)

  return (
    <main style={{ background: '#121315', color: '#e8eaed', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh' }}>

      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(18,19,21,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,162,75,0.2)', padding: '0 clamp(1rem,4vw,2rem)' }}>
        <nav style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <Link href="/" style={{ color: '#c9a24b', fontWeight: 700, fontSize: 'clamp(0.9rem,2vw,1.1rem)', textDecoration: 'none', letterSpacing: '0.05em' }}>STIVEN ALLAN</Link>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={{ background: '#c9a24b', color: '#121315', padding: '0.5rem 1.25rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>FALAR COM CORRETOR</a>
        </nav>
      </header>

      <section style={{ padding: 'calc(64px + clamp(3rem,8vw,5rem)) clamp(1rem,4vw,2rem) clamp(2rem,5vw,4rem)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <nav aria-label="breadcrumb" style={{ marginBottom: '1.5rem' }}>
            <ol style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0, fontSize: '0.78rem', color: '#a7adb4' }}>
              <li><Link href="/" style={{ color: '#a7adb4', textDecoration: 'none' }}>Início</Link></li>
              <li style={{ color: '#c9a24b' }}>›</li>
              <li style={{ color: '#c9a24b' }}>Empreendimentos</li>
            </ol>
          </nav>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.1 }}>
            Empreendimentos em<span style={{ display: 'block', color: '#c9a24b' }}>Criciúma e região</span>
          </h1>
          <p style={{ color: '#a7adb4', fontSize: 'clamp(0.95rem,2.2vw,1.1rem)', maxWidth: '600px', margin: '0 0 2rem', lineHeight: 1.7 }}>
            {lista.length} empreendimentos da Fontana Construtora. Financiamento direto com a construtora, sem banco, sem burocracia.
          </p>
        </div>
      </section>

      <section style={{ padding: '0 clamp(1rem,4vw,2rem) clamp(3rem,8vw,6rem)', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
          {lista.map((emp) => {
            const href = '/empreendimento/' + emp.construtoraSlug + '/' + emp.slug
            const loc = emp.bairro ? emp.bairro + ' · ' + emp.cidade + '/' + emp.uf : emp.cidade + '/' + emp.uf
            return (
              <Link key={emp.slug} href={href} style={{ textDecoration: 'none', display: 'block' }}>
                <article style={{ background: '#202327', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(201,162,75,0.1)' }}>
                  <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                    <Image src={emp.imagem} alt={'Fachada ' + emp.nome + ' — ' + emp.cidade + '/SC'} fill sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(18,19,21,0.6) 0%, transparent 50%)' }} />
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.72rem', color: '#c9a24b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Fontana Construtora</p>
                    <h2 style={{ margin: '0 0 0.4rem', fontSize: 'clamp(1rem,2vw,1.15rem)', fontWeight: 700, color: '#e8eaed', lineHeight: 1.2 }}>{emp.nome}</h2>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#a7adb4' }}>{loc}</p>
                  </div>
                  <div style={{ padding: '0 1.25rem 1.25rem' }}>
                    <span style={{ display: 'inline-block', background: 'rgba(201,162,75,0.12)', border: '1px solid rgba(201,162,75,0.3)', color: '#c9a24b', padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>VER DETALHES →</span>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      </section>

      <section style={{ background: '#202327', borderTop: '1px solid rgba(201,162,75,0.1)', padding: 'clamp(3rem,8vw,5rem) clamp(1rem,4vw,2rem)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem,4vw,2.5rem)', fontWeight: 900, margin: '0 0 1rem' }}>Não sabe qual escolher?</h2>
        <p style={{ color: '#a7adb4', lineHeight: 1.8, margin: '0 auto 2rem', maxWidth: '580px' }}>Stiven Allan é especialista nos empreendimentos da Fontana em Criciúma e região. CRECI 60.275.</p>
        <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={{ background: '#c9a24b', color: '#121315', padding: '0.9rem 2rem', borderRadius: '8px', fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>FALAR COM STIVEN — WHATSAPP</a>
        <div style={{ marginTop: '1.25rem', color: '#6b7280', fontSize: '0.8rem' }}>CRECI 60.275 · (48) 99164-2332 · Criciúma SC</div>
      </section>

      <footer style={{ background: '#0d0e10', borderTop: '1px solid rgba(201,162,75,0.2)', padding: 'clamp(2rem,5vw,3rem) clamp(1rem,4vw,2rem)', textAlign: 'center' }}>
        <div style={{ color: '#c9a24b', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>STIVEN ALLAN</div>
        <div style={{ color: '#a7adb4', fontSize: '0.8rem' }}>CRECI 60.275 · Criciúma e região SC</div>
        <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.4rem' }}>© {new Date().getFullYear()} Stiven Allan. Todos os direitos reservados.</div>
      </footer>
    </main>
  )
}
