'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const WPP = 'https://wa.me/5548991642332?text=Ol%C3%A1+Stiven!+Vi+seu+site+e+gostaria+de+conhecer+os+lan%C3%A7amentos.'

  const navItems = [
    { href: '/#empreendimentos', label: 'Empreendimentos' },
    { href: '/lancamentos/criciuma-sc', label: 'Lançamentos' },
    { href: '/#sobre', label: 'Sobre' },
    { href: '/#contato', label: 'Contato' },
  ]

  return (
    <>
      <style>{`
        .nav-link {
          color: rgba(244,244,244,0.65);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.3px;
          text-decoration: none;
          transition: color 0.2s;
          padding: 6px 0;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, #c9a24b, #e2c275);
          transform: scaleX(0);
          transition: transform 0.25s ease;
        }
        .nav-link:hover {
          color: #f4f4f4;
        }
        .nav-link:hover::after {
          transform: scaleX(1);
        }
        .mobile-menu {
          display: none;
        }
        .hamburger-btn {
          display: none;
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .mobile-menu { display: block; }
        }
        .mobile-nav-link {
          display: block;
          color: rgba(244,244,244,0.75);
          font-size: 18px;
          font-weight: 600;
          text-decoration: none;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: color 0.2s;
        }
        .mobile-nav-link:hover {
          color: #c9a24b;
        }
      `}</style>

      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        transition: 'all 0.35s ease',
        background: scrolled
          ? 'rgba(10,11,14,0.95)'
          : 'rgba(10,11,14,0.3)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled
          ? '1px solid rgba(255,255,255,0.06)'
          : '1px solid transparent',
        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* LOGO */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{
              fontSize: '18px', fontWeight: 900,
              letterSpacing: '2px',
              color: '#f4f4f4',
            }}>
              <span style={{
                background: 'linear-gradient(90deg, #c9a24b, #e2c275)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>STIVEN</span>
              <span style={{ color: '#f4f4f4' }}>ALLAN</span>
            </span>
            <span style={{
              fontSize: '8px', color: 'rgba(244,244,244,0.35)',
              letterSpacing: '3px', fontWeight: 600,
              textTransform: 'uppercase', marginTop: '3px',
            }}>
              CORRETOR DE IMÓVEIS
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="desktop-nav" style={{
            display: 'flex', alignItems: 'center', gap: '36px',
          }}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT: WPP + HAMBURGUER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <a
              href={WPP}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #c9a24b, #e2c275)',
                color: '#1a1305', fontWeight: 800,
                padding: '10px 24px', borderRadius: '50px',
                fontSize: '13px', textDecoration: 'none',
                letterSpacing: '0.3px',
                boxShadow: '0 4px 16px rgba(201,162,75,0.3)',
              }}
            >
              WhatsApp
            </a>
            {/* HAMBURGUER */}
            <button
              className="hamburger-btn"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                width: '40px', height: '40px',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexDirection: 'column',
                gap: '5px',
                padding: '10px',
              }}
            >
              <span style={{
                display: 'block', width: '18px', height: '1.5px',
                background: '#f4f4f4',
                transition: 'transform 0.25s, opacity 0.25s',
                transform: open ? 'translateY(6.5px) rotate(45deg)' : 'none',
              }} />
              <span style={{
                display: 'block', width: '18px', height: '1.5px',
                background: '#f4f4f4',
                opacity: open ? 0 : 1,
                transition: 'opacity 0.25s',
              }} />
              <span style={{
                display: 'block', width: '18px', height: '1.5px',
                background: '#f4f4f4',
                transition: 'transform 0.25s, opacity 0.25s',
                transform: open ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
              }} />
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="mobile-menu" style={{
            background: 'rgba(10,11,14,0.97)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '20px 24px 32px',
          }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="mobile-nav-link"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={WPP}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: 'linear-gradient(135deg, #c9a24b, #e2c275)',
                color: '#1a1305', fontWeight: 800,
                padding: '14px', borderRadius: '14px',
                fontSize: '15px', textDecoration: 'none',
                textAlign: 'center', marginTop: '20px',
              }}
            >
              WhatsApp
            </a>
          </div>
        )}
      </header>
    </>
  )
}
