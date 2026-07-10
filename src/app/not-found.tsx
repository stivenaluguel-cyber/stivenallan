import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pagina nao encontrada — Stiven Allan Corretor de Imoveis',
  description: 'A pagina que você procura nao existe. Explore os lançamentos imobiliarios em Criciuma com Stiven Allan, CRECI 60.275.',
}

export default function NotFound() {
  const wppUrl = 'https://wa.me/5548991642332?text=Ola%20Stiven!%20Preciso%20de%20ajuda.'
  return (
    <main style={{ background: '#F3F2EE', minHeight: '100vh', color: '#161512', fontFamily: "'Hanken Grotesk',system-ui,sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 560 }}>
        <div style={{ fontSize: 80, fontWeight: 900, color: '#D24E22', lineHeight: 1, marginBottom: 8, opacity: 0.2 }}>404</div>
        <h1 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 800, marginBottom: 16, color: '#161512' }}>
          Pagina nao encontrada
        </h1>
        <p style={{ fontSize: 15, color: '#6B655B', lineHeight: 1.7, marginBottom: 40 }}>
          A pagina que você procura nao existe ou foi removida. Mas temos varios lançamentos incriveis esperando por você!
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#D24E22', color: '#fff', fontWeight: 700, fontSize: 14, padding: '13px 26px', borderRadius: 3, textDecoration: 'none', minHeight: 44 }}>
            Ir para o inicio
          </Link>
          <Link href="/empreendimentos" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid rgba(26,24,21,0.25)', color: '#161512', fontWeight: 600, fontSize: 14, padding: '13px 26px', borderRadius: 3, textDecoration: 'none', minHeight: 44 }}>
            Ver lançamentos
          </Link>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#131211', color: '#F3F2EE', fontWeight: 600, fontSize: 14, padding: '13px 26px', borderRadius: 3, textDecoration: 'none', minHeight: 44 }}>
            Painel CRM
          </Link>
        </div>
        <div style={{ marginTop: 48, padding: '20px 24px', background: '#FAFAF7', borderRadius: 3, border: '1px solid rgba(26,24,21,0.08)' }}>
          <p style={{ fontSize: 13, color: '#6B655B', marginBottom: 12 }}>Precisa de ajuda? Fale direto com o corretor:</p>
          <a href={wppUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 3, textDecoration: 'none', minHeight: 40 }}>
            WhatsApp (48) 99164-2332
          </a>
        </div>
      </div>
    </main>
  )
}
