'use client'
import { CalendarClock, MapPin, SkipForward, XCircle } from 'lucide-react'
import { D } from './tokens'

type Props = {
  disabled?: boolean
  recommendedAction?: 'followup' | 'visita' | 'whatsapp' | 'atualizar_etapa'
  onPerdido: () => void
  onPular: () => void
  onFollowUp: () => void
  onVisita: () => void
}

// As 4 ações que avançam a fila. Fixas na base no mobile (área de toque
// ≥44px, requisito do briefing), em linha normal no desktop. Cada botão tem
// ícone + texto + atalho de teclado indicado no title (os atalhos de fato
// são tratados no componente pai, pra funcionar mesmo com o foco fora
// destes botões).
export function FocusPrimaryActions({ disabled, recommendedAction, onPerdido, onPular, onFollowUp, onVisita }: Props) {
  const base: React.CSSProperties = {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    padding: '10px 6px', minHeight: 56, borderRadius: 10, border: '1px solid ' + D.line,
    background: '#fff', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1,
    fontSize: 12, fontWeight: 700,
  }
  return (
    <div className="focus-primary-actions" style={{ display: 'flex', gap: 8, padding: '10px clamp(14px,3vw,28px)', background: D.surface, borderTop: '1px solid ' + D.line }}>
      <button disabled={disabled} onClick={onPerdido} title="Perdido (P)" aria-label="Marcar lead como perdido" style={{ ...base, color: D.red }}>
        <XCircle size={20} />
        Perdido
      </button>
      <button disabled={disabled} onClick={onPular} title="Pular (Espaço)" aria-label="Pular este lead" style={{ ...base, color: D.muted }}>
        <SkipForward size={20} />
        Pular
      </button>
      <button disabled={disabled} onClick={onFollowUp} title="Follow-up (F)" aria-label="Agendar follow-up" style={{ ...base, color: D.blue, borderColor: recommendedAction === 'followup' ? D.blue : D.line, boxShadow: recommendedAction === 'followup' ? '0 0 0 2px rgba(59,130,246,0.14)' : 'none' }}>
        <CalendarClock size={20} />
        {recommendedAction === 'followup' ? 'Follow-up · recomendado' : 'Follow-up'}
      </button>
      <button disabled={disabled} onClick={onVisita} title="Visita (V)" aria-label="Registrar visita" style={{ ...base, color: D.green, borderColor: recommendedAction === 'visita' ? D.green : D.line, boxShadow: recommendedAction === 'visita' ? '0 0 0 2px rgba(34,197,94,0.14)' : 'none' }}>
        <MapPin size={20} />
        {recommendedAction === 'visita' ? 'Visita · recomendada' : 'Visita'}
      </button>
      <style>{`
        @media (max-width: 640px) {
          .focus-primary-actions { position: sticky; bottom: 0; z-index: 10; box-shadow: 0 -2px 10px rgba(0,0,0,0.06); }
        }
      `}</style>
    </div>
  )
}
