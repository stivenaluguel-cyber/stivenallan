'use client'
import { CalendarClock, Clock, MapPin, SkipForward, XCircle } from 'lucide-react'
import { D } from './tokens'

type Props = {
  disabled?: boolean
  recommendedAction?: 'followup' | 'visita' | 'whatsapp' | 'atualizar_etapa'
  onPerdido: () => void
  onPular: () => void
  onAdiar: () => void
  onFollowUp: () => void
  onVisita: () => void
}

// Hierarquia visual explícita: a ação recomendada em destaque, Pular e
// Adiar como secundárias neutras, e Perdido (destrutiva, irreversível na
// prática) com o menor peso visual — antes ela dividia o mesmo destaque das
// demais e era o primeiro botão da linha.
//
// Não existe "desfazer": nenhuma dessas ações tem operação de reversão real
// no backend, e um botão de desfazer que não desfaz seria pior que nenhum.
export function FocusPrimaryActions({ disabled, recommendedAction, onPerdido, onPular, onAdiar, onFollowUp, onVisita }: Props) {
  const base: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
    padding: '10px 6px', minHeight: 56, borderRadius: 10, border: '1px solid ' + D.line,
    background: '#fff', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    fontSize: 12, fontWeight: 700,
  }
  const destaque = (acao: 'followup' | 'visita', cor: string): React.CSSProperties =>
    recommendedAction === acao
      ? { borderColor: cor, borderWidth: 2, boxShadow: '0 0 0 3px ' + cor + '22', background: cor + '0d' }
      : {}

  return (
    <div className="focus-primary-actions" style={{ display: 'flex', gap: 8, padding: '10px clamp(14px,3vw,28px) calc(10px + env(safe-area-inset-bottom))', background: D.surface, borderTop: '1px solid ' + D.line }}>
      <button disabled={disabled} onClick={onFollowUp} title="Follow-up (F)" aria-label="Agendar follow-up" style={{ ...base, flex: 1.3, color: D.blue, ...destaque('followup', D.blue) }}>
        <CalendarClock size={20} />
        {recommendedAction === 'followup' ? 'Follow-up ·  recomendado' : 'Follow-up'}
      </button>
      <button disabled={disabled} onClick={onVisita} title="Visita (V)" aria-label="Registrar visita" style={{ ...base, flex: 1.3, color: D.green, ...destaque('visita', D.green) }}>
        <MapPin size={20} />
        {recommendedAction === 'visita' ? 'Visita ·  recomendada' : 'Visita'}
      </button>
      <button disabled={disabled} onClick={onAdiar} title="Adiar (A)" aria-label="Adiar este lead" style={{ ...base, flex: 1, color: D.muted }}>
        <Clock size={20} />
        Adiar
      </button>
      <button disabled={disabled} onClick={onPular} title="Pular (Espaço)" aria-label="Pular este lead" style={{ ...base, flex: 1, color: D.muted }}>
        <SkipForward size={20} />
        Pular
      </button>
      <button disabled={disabled} onClick={onPerdido} title="Perdido (P)" aria-label="Marcar lead como perdido" style={{ ...base, flex: 0.85, color: D.red, background: 'transparent', borderColor: 'transparent', fontWeight: 600 }}>
        <XCircle size={18} />
        Perdido
      </button>
      <style>{`
        @media (max-width: 640px) {
          .focus-primary-actions { position: sticky; bottom: 0; z-index: 10; box-shadow: 0 -2px 10px rgba(0,0,0,0.06); }
        }
        @media (max-width: 380px) {
          .focus-primary-actions { flex-wrap: wrap; }
          .focus-primary-actions > button { flex: 1 1 30% !important; }
        }
      `}</style>
    </div>
  )
}
