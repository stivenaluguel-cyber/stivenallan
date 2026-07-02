import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contato - Stiven Allan Corretor de Imoveis | WhatsApp (48) 99164-2332',
  description: 'Entre em contato com Stiven Allan, corretor de imoveis CRECI 60.275 em Criciuma SC. Atendimento via WhatsApp e Instagram.',
  alternates: { canonical: 'https://stivenallan.vercel.app/contato' },
  openGraph: {
    title: 'Contato - Stiven Allan Corretor de Imoveis',
    description: 'Fale com Stiven via WhatsApp (48) 99164-2332. CRECI 60.275.',
    url: 'https://stivenallan.vercel.app/contato',
    type: 'website',
  },
}

const faqs = [
  { q: 'Qual o horario de atendimento?', a: 'Seg-Sex 8h-19h, Sabado 8h-13h. Via WhatsApp respondo sempre que possivel.' },
  { q: 'Atendo em quais cidades?', a: 'Criciuma, Icara, Ararangua, Tubarao e toda a regiao sul catarinense.' },
  { q: 'Cobro taxa de consultoria?', a: 'Nao. Minha remuneracao e paga pela construtora.' },
  { q: 'Trabalho com financiamento?', a: 'Sim! Caixa, MCMV e financiamento direto. Faco toda a analise.' },
]

export default function ContatoPage() {
  const wppUrl = 'https://wa.me/5548991642332?text=Ola%20Stiven!%20Quero%20saber%20mais.'
  return (
    <main style={{ background: '#121315', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <section style={{ padding: '80px 24px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <nav style={{ marginBottom: 40 }}>
          <ol style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0, fontSize: 14, color: '#a7adb4' }}>
            <li><Link href="/" style={{ color: '#a7adb4', textDecoration: 'none' }}>Inicio</Link></li>
            <li style={{ color: '#c9a24b' }}>&rsaquo;</li>
            <li style={{ color: '#fff' }}>Contato</li>
          </ol>
        </nav>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontSize: 13, letterSpacing: '0.12em', color: '#c9a24b', textTransform: 'uppercase', marginBottom: 16 }}>Atendimento personalizado</p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: 16 }}>Fale com o Corretor</h1>
          <p style={{ fontSize: 17, color: '#a7adb4', lineHeight: 1.7 }}>Escolha o canal de atendimento. Respondo com agilidade.</p>
        </div>
      </section>

      <section style={{ padding: '0 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {[
            { titulo: 'WhatsApp', desc: 'Canal principal. Resposta em minutos.', label: '(48) 99164-2332', href: wppUrl, cor: '#25D366', cta: 'Enviar mensagem' },
            { titulo: 'Instagram', desc: 'Lancamentos e novidades.', label: '@stivenallan.ofc', href: 'https://instagram.com/stivenallan.ofc', cor: '#E1306C', cta: 'Ver Instagram' },
            { titulo: 'Telefone', desc: 'Prefere falar? Ligue diretamente.', label: '(48) 99164-2332', href: 'tel:+5548991642332', cor: '#c9a24b', cta: 'Ligar agora' },
          ].map((c, i) => (
            <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#202327', borderRadius: 16, padding: '32px 24px', border: '1px solid #2e3338', textDecoration: 'none', color: '#fff' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: c.cor }}>{c.titulo}</h2>
              <p style={{ fontSize: 14, color: '#a7adb4', marginBottom: 12, lineHeight: 1.5 }}>{c.desc}</p>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>{c.label}</p>
              <span style={{ display: 'inline-block', background: c.cor, color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 18px', borderRadius: 8 }}>{c.cta}</span>
            </a>
          ))}
        </div>
      </section>

      <section style={{ background: '#1a1c1f', padding: '80px 24px', borderTop: '1px solid #2e3338' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48 }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 28 }}>Informacoes de contato</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                ['Localizacao', 'Criciuma, Santa Catarina'],
                ['WhatsApp', '(48) 99164-2332'],
                ['Instagram', '@stivenallan.ofc'],
                ['Horario', 'Seg-Sex 8h-19h / Sab 8h-13h'],
                ['Empresa', 'SA Imoveis Exclusivos'],
                ['CRECI', 'RS 60.275'],
              ].map(([titulo, valor], i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 6, height: 6, minWidth: 6, borderRadius: '50%', background: '#c9a24b', marginTop: 7 }} />
                  <div>
                    <div style={{ fontSize: 11, color: '#a7adb4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{titulo}</div>
                    <div style={{ fontSize: 15 }}>{valor}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: '#202327', borderRadius: 16, padding: 36, border: '1px solid #2e3338', textAlign: 'center' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Pronto para comprar seu imovel?</h3>
            <p style={{ fontSize: 15, color: '#a7adb4', lineHeight: 1.6, marginBottom: 28 }}>Atendimento personalizado do primeiro contato a entrega das chaves.</p>
            <a href={wppUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 16, padding: '14px 24px', borderRadius: 10, textDecoration: 'none', textAlign: 'center' }}>
              Iniciar conversa no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px', maxWidth: 760, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>Perguntas frequentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: '#202327', borderRadius: 12, padding: '22px 26px', border: '1px solid #2e3338' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#c9a24b' }}>{f.q}</h3>
              <p style={{ fontSize: 14, color: '#a7adb4', lineHeight: 1.65, margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
