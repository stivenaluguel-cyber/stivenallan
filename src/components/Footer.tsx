import Link from 'next/link'

const C = {
  bg: '#0d0e10',
  accent: '#c9a24b',
  muted: '#a7adb4',
  border: '#2c3035',
  green: '#1f9d55',
  text: '#f4f4f4',
}

export default function Footer() {
  const lancamentos = [
    { href: '/lancamentos/criciuma', label: 'Criciúma/SC' },
    { href: '/lancamentos/icara', label: 'Içara/SC' },
    { href: '/lancamentos/nova-veneza', label: 'Nova Veneza/SC' },
    { href: '/lancamentos/forquilhinha', label: 'Forquilhinha/SC' },
    { href: '/lancamentos/cocal-do-sul', label: 'Cocal do Sul/SC' },
  ]

  return (
    <footer style={{
      background: C.bg,
      borderTop: `1px solid ${C.border}`,
      padding: '64px 24px 32px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '40px',
          marginBottom: '48px',
        }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ textDecoration: 'none', display: 'block', marginBottom: '12px' }}>
              <span style={{ fontWeight: 900, fontSize: '22px', letterSpacing: '3px', color: C.text }}>
                STIVEN<span style={{ color: C.accent }}>ALLAN</span>
              </span>
            </Link>
            <p style={{ color: C.muted, fontSize: '11px', letterSpacing: '3px', marginBottom: '20px' }}>
              CRECI 60.275 · CORRETOR DE IMÓVEIS
            </p>
            <p style={{ color: C.muted, fontSize: '13px', lineHeight: 1.7, maxWidth: '320px' }}>
              Especialista em lançamentos e empreendimentos de construtoras em Criciúma e região do Sul Catarinense.
            </p>
          </div>

          {/* Lançamentos */}
          <div>
            <h3 style={{
              fontWeight: 700, fontSize: '11px',
              textTransform: 'uppercase', letterSpacing: '3px',
              color: C.accent, marginBottom: '20px',
            }}>Lançamentos</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lancamentos.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} style={{
                    color: C.muted, textDecoration: 'none',
                    fontSize: '13px', lineHeight: 1,
                  }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 style={{
              fontWeight: 700, fontSize: '11px',
              textTransform: 'uppercase', letterSpacing: '3px',
              color: C.accent, marginBottom: '20px',
            }}>Contato</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a
                  href="https://wa.me/5548991642332"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: C.muted, textDecoration: 'none',
                    fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={C.green}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  (48) 99164-2332
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/stivenallan.ofc"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: C.muted, textDecoration: 'none',
                    fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                  @stivenallan.ofc
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          paddingTop: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p style={{ color: C.muted, fontSize: '12px' }}>
            © {new Date().getFullYear()} Stiven Allan. CRECI 60.275. Todos os direitos reservados.
          </p>
          <p style={{ color: C.muted, fontSize: '12px' }}>
            Criciúma, Santa Catarina
          </p>
        </div>
      </div>
    </footer>
  )
}
