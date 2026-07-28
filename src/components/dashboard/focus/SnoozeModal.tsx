'use client'
import { useState } from 'react'
import { D } from './tokens'
import { FocusModalShell, inputCss, labelCss } from './FocusModalShell'
import { addDaysSaoPauloDateString, endOfSaoPauloDayISOString } from '@/lib/dashboard/timezone-sp'

export type SnoozePayload = { snoozedUntil: string; motivo: string }

// Presets calculados no calendário de São Paulo — "amanhã" às 22h de SP não
// pode virar depois de amanhã só porque o servidor está em UTC.
function presets(agora: Date = new Date()) {
  return [
    { key: 'amanha', label: 'Amanhã', data: addDaysSaoPauloDateString(agora, 1) },
    { key: 'tres_dias', label: 'Em 3 dias', data: addDaysSaoPauloDateString(agora, 3) },
    { key: 'semana', label: 'Próxima semana', data: addDaysSaoPauloDateString(agora, 7) },
  ]
}

export function SnoozeModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (payload: SnoozePayload) => Promise<void> }) {
  const opcoes = presets()
  const [data, setData] = useState(opcoes[0].data)
  const [motivo, setMotivo] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function confirmar() {
    if (!data) { setErro('Escolha uma data.'); return }
    setSalvando(true); setErro('')
    try {
      // Fim do dia escolhido: o lead volta pra fila no dia marcado, não à
      // meia-noite dele.
      await onConfirm({ snoozedUntil: endOfSaoPauloDayISOString(data), motivo: motivo.trim() })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao adiar')
      setSalvando(false)
    }
  }

  return (
    <FocusModalShell title="Adiar lead" onClose={onClose}>
      <p style={{ fontSize: 13.5, color: D.muted, margin: '0 0 14px' }}>
        O lead sai da fila desta sessão e volta a aparecer na data escolhida. Isso fica registrado no histórico dele.
      </p>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
        {opcoes.map((p) => {
          const ativo = data === p.data
          return (
            <button
              key={p.key}
              onClick={() => setData(p.data)}
              aria-pressed={ativo}
              style={{
                flex: '1 1 auto', padding: '10px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', minHeight: 44,
                border: '1.5px solid ' + (ativo ? D.bronze : D.line),
                background: ativo ? D.bronze + '14' : '#fff',
                color: ativo ? D.bronze : D.ink,
              }}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      <label htmlFor="snooze-data" style={labelCss}>Ou escolha a data</label>
      <input id="snooze-data" type="date" value={data} onChange={(e) => setData(e.target.value)} style={{ ...inputCss, minHeight: 44 }} />

      <label htmlFor="snooze-motivo" style={labelCss}>Motivo (opcional)</label>
      <input
        id="snooze-motivo"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Ex.: cliente pediu para retomar depois"
        style={{ ...inputCss, minHeight: 44 }}
      />

      {erro && <p role="alert" style={{ color: D.red, fontSize: 13, marginTop: 12 }}>{erro}</p>}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '11px 16px', borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}>Cancelar</button>
        <button onClick={confirmar} disabled={salvando} style={{ flex: 1, padding: '11px 16px', borderRadius: 8, border: 'none', background: D.bronze, color: '#fff', fontWeight: 700, cursor: salvando ? 'default' : 'pointer', opacity: salvando ? 0.6 : 1, minHeight: 44 }}>
          {salvando ? 'Adiando...' : 'Adiar'}
        </button>
      </div>
    </FocusModalShell>
  )
}
