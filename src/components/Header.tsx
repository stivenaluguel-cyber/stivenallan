'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const C = {
  bg: '#121315',
  bg2: '#1a1c1f',
  accent: '#c9a24b',
  muted: '#a7adb4',
  border: '#2c3035',
  green: '#1f9d55',
  text: '#f4f4f4',
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/#empreendimentos', label: 'Empreendimentos' },
    { href: '/lancamentos/criciuma-sc', label: 'Lançamentos' },
    { href: '/#sobre', label: 'Sobre' },
    { href: '/#contato', label: 'Contato' },
  ]

  return (
    <>
      <style>{`
        .header-nav-desktop { display: flex; }
        .header-wpp-desktop { display: flex; }
        .header-hamburger { display: none; }
        @media (max-width: 768px) {
          .header-nav-desktop { display: none !important; }
          .header-wpp-desktop { display: none !important; }
          .header-hamburger { display: flex !important; }
        }
      `}</style>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'background 0.3s, box-shadow 0.3s',
        background: scrolled
          ? C.bg
          : 'linear-gradient(to bottom, rgba(18,19,21,0.9) 0%, rgba(18,19,21,0) 100%)',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.5)' : 'none',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <nav style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '18px 0',
          }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <span style={{
                fontWeight: 900, fontSize: '18px',
                letterSpacing: '3px', color: C.text,
              }}>
                STIVEN<span style={{ color: C.accent }}>ALLAN</span>
              </span>
              <small style={{
                display: 'block', fontSize: '9px', letterSpacing: '4px',
                color: C.muted, fontWeight: 400, marginTop: '1px',
              }}>CORRETOR DE IMÓVEIS</small>
            </Link>

            {/* Nav desktop */}
            <ul className="header-nav-desktop" style={{
              gap: '32px', listStyle: 'none', margin: 0, padding: 0,
            }}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} style={{
                    color: C.text, textDecoration: 'none',
                    fontSize: '13px', fontWeight: 500,
                    letterSpacing: '0.5px',
                  }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* CTA WhatsApp desktop */}
            <a
              className="header-wpp-desktop"
              href="https://wa.me/5548991642332"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                alignItems: 'center',
                background: C.green, color: '#fff',
                fontSize: '13px', fontWeight: 700,
                padding: '10px 22px', borderRadius: '50px',
                textDecoration: 'none', letterSpacing: '0.3px',
              }}
            >
              WhatsApp
            </a>

            {/* Hamburguer mobile */}
            <button
              className="header-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              style={{
                alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: 'none',
                cursor: 'pointer', color: C.text,
                padding: '8px', borderRadius: '8px',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {menuOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </nav>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div style={{
              background: C.bg2,
              borderTop: `1px solid ${C.border}`,
              padding: '8px 0 20px',
              borderRadius: '0 0 16px 16px',
            }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block', padding: '14px 20px',
                    color: C.text, textDecoration: 'none',
                    fontSize: '15px', fontWeight: 500,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="https://wa.me/5548991642332"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '16px 20px 0',
                  background: C.green, color: '#fff',
                  fontSize: '15px', fontWeight: 700,
                  padding: '14px', borderRadius: '50px',
                  textDecoration: 'none', gap: '8px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Falar no WhatsApp
              </a>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
