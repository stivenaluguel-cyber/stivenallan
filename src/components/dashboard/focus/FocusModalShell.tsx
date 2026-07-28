'use client'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { D } from './tokens'

const FOCAVEIS = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

// Casca compartilhada pelos modais do Modo Foco (FollowUp, Visita, Perdido,
// Adiar, Mudança de etapa). Além do visual, concentra o comportamento de
// acessibilidade que antes não existia em nenhum deles: foco preso dentro do
// modal, foco inicial no primeiro campo, devolução do foco ao elemento que
// abriu, e trava de scroll do fundo.
export function FocusModalShell({ title, onClose, children, maxWidth = 440 }: { title: string; onClose: () => void; children: React.ReactNode; maxWidth?: number }) {
  const painelRef = useRef<HTMLDivElement>(null)
  const origemFocoRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    origemFocoRef.current = document.activeElement as HTMLElement | null

    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Foco inicial no primeiro campo interativo (não no botão fechar) — quem
    // usa teclado ou leitor de tela começa onde a ação está.
    const primeiro = painelRef.current?.querySelector<HTMLElement>(FOCAVEIS)
    primeiro?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const focaveis = painelRef.current?.querySelectorAll<HTMLElement>(FOCAVEIS)
      if (!focaveis || focaveis.length === 0) return
      const primeiroEl = focaveis[0]
      const ultimoEl = focaveis[focaveis.length - 1]
      // Tab no último volta pro primeiro (e Shift+Tab no primeiro vai pro
      // último) — sem isso o foco escapa pro fundo da página.
      if (!e.shiftKey && document.activeElement === ultimoEl) { e.preventDefault(); primeiroEl.focus() }
      else if (e.shiftKey && document.activeElement === primeiroEl) { e.preventDefault(); ultimoEl.focus() }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflowAnterior
      origemFocoRef.current?.focus?.()
    }
  }, [onClose])

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ width: '100%', maxWidth, maxHeight: '88vh', overflowY: 'auto', background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid ' + D.line }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: D.ink }}>{title}</h2>
          <button onClick={onClose} aria-label="Fechar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: D.muted, display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  )
}

export const inputCss: React.CSSProperties = {
  width: '100%', border: '1.5px solid rgba(26,24,21,0.14)', borderRadius: 8, padding: '10px 12px',
  fontSize: 14, color: D.ink, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}
export const labelCss: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, marginTop: 14,
}
