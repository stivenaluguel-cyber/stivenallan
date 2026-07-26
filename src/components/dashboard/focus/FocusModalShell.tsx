'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { D } from './tokens'

// Casca compartilhada pelos 4 modais do Modo Foco (FollowUp, Visita, Perdido,
// Mudança de etapa) — mesmo overlay/tamanho/botão fechar usado no restante
// do dashboard (LeadModal em crm/page.tsx), só que factorado porque aqui
// são 4 modais em vez de 1.
export function FocusModalShell({ title, onClose, children, maxWidth = 440 }: { title: string; onClose: () => void; children: React.ReactNode; maxWidth?: number }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div style={{ width: '100%', maxWidth, maxHeight: '88vh', overflowY: 'auto', background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid ' + D.line }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: D.ink }}>{title}</h2>
          <button onClick={onClose} aria-label="Fechar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: D.muted, display: 'flex' }}>
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
