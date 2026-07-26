'use client'
import { useState } from 'react'
import { D } from './tokens'
import { FocusModalShell, inputCss, labelCss } from './FocusModalShell'

export type FollowUpPayload = { data: string; horario: string; canal: string; observacao: string }

const CANAIS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'ligacao', label: 'Ligação' },
  { value: 'email', label: 'E-mail' },
  { value: 'outro', label: 'Outro' },
]

export function FollowUpModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (payload: FollowUpPayload) => Promise<void> }) {
  const amanha = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
  const [data, setData] = useState(amanha)
  const [horario, setHorario] = useState('09:00')
  const [canal, setCanal] = useState('whatsapp')
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function salvar() {
    if (!data || !horario) { setErro('Informe data e horário.'); return }
    setSalvando(true); setErro('')
    try {
      await onSubmit({ data, horario, canal, observacao: observacao.trim() })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao agendar follow-up')
      setSalvando(false)
    }
  }

  return (
    <FocusModalShell title="Agendar follow-up" onClose={onClose}>
      <label style={{ ...labelCss, marginTop: 0 }}>Data</label>
      <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={inputCss} />

      <label style={labelCss}>Horário</label>
      <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} style={inputCss} />

      <label style={labelCss}>Canal</label>
      <select value={canal} onChange={(e) => setCanal(e.target.value)} style={inputCss}>
        {CANAIS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>

      <label style={labelCss}>Observação</label>
      <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={3} style={{ ...inputCss, resize: 'vertical' }} placeholder="O que lembrar na hora do contato..." />

      {erro && <p style={{ color: D.red, fontSize: 13, marginTop: 12 }}>{erro}</p>}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '11px 16px', borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}>Cancelar</button>
        <button onClick={salvar} disabled={salvando} style={{ flex: 1, padding: '11px 16px', borderRadius: 8, border: 'none', background: D.bronze, color: '#fff', fontWeight: 700, cursor: salvando ? 'default' : 'pointer', opacity: salvando ? 0.6 : 1, minHeight: 44 }}>
          {salvando ? 'Agendando...' : 'Agendar'}
        </button>
      </div>
    </FocusModalShell>
  )
}
