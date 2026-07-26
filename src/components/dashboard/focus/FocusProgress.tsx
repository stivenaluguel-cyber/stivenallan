'use client'
import { D } from './tokens'

export function FocusProgress({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progresso do Modo Foco: ${current} de ${total}`}
      style={{ height: 6, borderRadius: 999, background: D.lineDark, overflow: 'hidden', width: '100%' }}
    >
      <div
        style={{
          height: '100%', width: pct + '%', background: D.bronze, borderRadius: 999,
          transition: 'width .25s ease',
        }}
      />
    </div>
  )
}
