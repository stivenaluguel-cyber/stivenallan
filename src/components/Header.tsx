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
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'background 0.3s, box-shadow 0.3s',
      background: scrolled
        ? C.bg
        : 'linear-gradient(to bottom, rgba(18,19,21,0.9) 0%, rgba(18,19,21,0) 100%)',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.5)' : 'none',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <nav style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '20px 0',
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
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
          <ul style={{
            display: 'flex', gap: '32px',
            listStyle: 'none', margin: 0, padding: 0,
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

          {/* CTA WhatsApp */}
          <a
            href="https://wa.me/5548991642332"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: C.green, color: '#fff',
              fontSize: '13px', fontWeight: 700,
              padding: '10px 22px', borderRadius: '50px',
              textDecoration: 'none', letterSpacing: '0.3px',
            }}
          >
            WhatsApp
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            style={{
              display: 'none', // escondido no desktop via CSS media
              background: 'transparent', border: 'none',
              cursor: 'pointer', color: C.text,
              padding: '8px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
            padding: '12px 0 20px',
          }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block', padding: '12px 16px',
                  color: C.text, textDecoration: 'none',
                  fontSize: '14px',
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
                display: 'block', margin: '12px 16px 0',
                background: C.green, color: '#fff',
                fontSize: '14px', fontWeight: 700,
                padding: '12px', borderRadius: '50px',
                textDecoration: 'none', textAlign: 'center',
              }}
            >
              Falar no WhatsApp
            </a>
          </div>
        )}
      </div>
    </header>
  )
}
