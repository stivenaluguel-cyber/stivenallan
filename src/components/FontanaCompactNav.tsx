'use client'
import { useEffect, useState } from 'react'

// Nav compartilhado pelo template compacto Fontana (Avezzano, Bellante).
// Links e âncoras são fixos porque as duas páginas usam exatamente as mesmas seções.
const LINKS = [
  { label: 'O Residencial', href: '#o-residencial' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'As Residências', href: '#as-residencias' },
  { label: 'Lazer', href: '#lazer' },
  { label: 'Localização', href: '#localizacao' },
  { label: 'Financiamento', href: '#financiamento' },
]

export function FontanaCompactNav({ title, accent, wa }: { title: string; accent: string; wa: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
      <style>{`
        .fcn-bar { display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; height: 64px; }
        .fcn-title { color: #fff; font-weight: 700; font-size: 1rem; letter-spacing: 0.05em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
        .fcn-desktop-links { display: flex; gap: 1.5rem; align-items: center; flex-shrink: 0; }
        .fcn-burger-btn { display: none; }
        .fcn-mobile-menu { display: none; }
        @media (max-width: 860px) {
          .fcn-bar { padding: 0 1.1rem; }
          .fcn-title { font-size: 0.85rem; }
          .fcn-desktop-links { display: none !important; }
          .fcn-burger-btn { display: flex !important; align-items: center; justify-content: center; flex-shrink: 0; background: none; border: none; color: #fff; font-size: 1.6rem; line-height: 1; cursor: pointer; padding: 0.4rem; min-width: 44px; min-height: 44px; }
          .fcn-mobile-menu.fcn-open { display: flex; }
        }
      `}</style>
      <div className="fcn-bar">
        <span className="fcn-title">{title}</span>
        <div className="fcn-desktop-links">
          {LINKS.map(({ label, href }) => (
            <a key={label} href={href} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {label}
            </a>
          ))}
          <a href={wa} target="_blank" rel="noopener" style={{ background: accent, color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '2px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em' }}>
            FALAR COM STIVEN
          </a>
        </div>
        <button
          type="button"
          className="fcn-burger-btn"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>
      <div className={`fcn-mobile-menu${open ? ' fcn-open' : ''}`} style={{ flexDirection: 'column', padding: '0.5rem 1.1rem 1.25rem', gap: 2, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}>
        {LINKS.map(({ label, href }) => (
          <a key={label} href={href} onClick={() => setOpen(false)}
            style={{ color: 'rgba(255,255,255,0.88)', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.9rem 0.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', minHeight: 44, display: 'flex', alignItems: 'center' }}>
            {label}
          </a>
        ))}
        <a href={wa} target="_blank" rel="noopener" onClick={() => setOpen(false)}
          style={{ background: accent, color: '#fff', padding: '0.9rem 1.25rem', borderRadius: '2px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.08em', textAlign: 'center', marginTop: '0.75rem', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          FALAR COM STIVEN
        </a>
      </div>
    </nav>
  )
}

export default FontanaCompactNav
