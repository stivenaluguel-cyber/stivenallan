import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pagina nao encontrada — Stiven Allan Corretor de Imoveis',
  description: 'A pagina que voce procura nao existe. Explore os lancamentos imobiliarios em Criciuma com Stiven Allan, CRECI/RS 60.275.',
}

export default function NotFound() {
  const wppUrl = 'https://wa.me/5548991642332?text=Ola%20Stiven!%20Preciso%20de%20ajuda.'
  return (
    <main style={{ background: '#121315', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 560 }}>
        <div style={{ fontSize: 80, fontWeight: 900, color: '#c9a24b', lineHeight: 1, marginBottom: 8, opacity: 0.3 }}>404</div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: 16 }}>
          Pagina nao encontrada
        </h1>
        <p style={{ fontSize: 16, color: '#a7adb4', lineHeight: 1.7, marginBottom: 40 }}>
          A pagina que voce procura nao existe ou foi removida. Mas temos varios lancamentos incriveis esperando por voce!
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#c9a24b', color: '#121315', fontWeight: 700, fontSize: 15, padding: '14px 28px', borderRadius: 8, textDecoration: 'none' }}>
            Ir para o inicio
          </Link>
          <Link href="/empreendimentos" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1.5px solid #c9a24b', color: '#c9a24b', fontWeight: 700, fontSize: 15, padding: '14px 28px', borderRadius: 8, textDecoration: 'none' }}>
            Ver lancamentos
          </Link>
        </div>
        <div style={{ marginTop: 48, padding: '24px', background: '#202327', borderRadius: 12, border: '1px solid #2e3338' }}>
          <p style={{ fontSize: 14, color: '#a7adb4', marginBottom: 12 }}>Precisa de ajuda? Fale direto com o corretor:</p>
          <a href={wppUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
            WhatsApp (48) 99164-2332
          </a>
        </div>
      </div>
    </main>
  )
}
