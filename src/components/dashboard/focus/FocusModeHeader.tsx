'use client'
import { Crosshair, X } from 'lucide-react'
import { D } from './tokens'
import { FocusProgress } from './FocusProgress'

export function FocusModeHeader({
  posicaoAtual,
  total,
  sessionPoints,
  monthPoints,
  onClose,
}: {
  posicaoAtual: number
  total: number
  sessionPoints: number
  monthPoints: number
  onClose: () => void
}) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 10, background: D.sidebar, borderBottom: '1px solid ' + D.lineDark, padding: '14px clamp(14px,3vw,28px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 9, background: 'rgba(210,78,34,0.18)', color: D.bronze, flexShrink: 0 }}>
          <Crosshair size={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 16, fontWeight: 800, color: D.onDark }}>Modo Foco</div>
          <div style={{ fontSize: 12, color: D.onDarkMuted }}>{total > 0 ? `${Math.min(posicaoAtual, total)} de ${total}` : 'Nenhum lead na fila'}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: D.onDarkMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sessão</div>
            <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 15, fontWeight: 800, color: D.orange }}>{sessionPoints} pts</div>
          </div>
          <div style={{ textAlign: 'right', display: 'none' }} className="focus-month-points">
            <div style={{ fontSize: 10, color: D.onDarkMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mês</div>
            <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 15, fontWeight: 800, color: D.onDark }}>{monthPoints} pts</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Sair do Modo Foco e continuar depois"
            title="Sair e continuar depois"
            style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(245,241,234,0.1)', border: 'none', cursor: 'pointer', color: D.onDark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>
      </div>
      <FocusProgress current={Math.min(posicaoAtual, total)} total={total} />
      <style>{`
        @media (min-width: 560px) { .focus-month-points { display: block !important; } }
      `}</style>
    </header>
  )
}
