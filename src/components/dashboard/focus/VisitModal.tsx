'use client'
import { useState } from 'react'
import { D } from './tokens'
import { FocusModalShell, inputCss, labelCss } from './FocusModalShell'

export type AgendarVisitaPayload = { data: string; horario: string; local: string; observacao: string }

type Mode = 'agendar' | 'concluir' | 'nao_ocorreu'

type Props = {
  proximaVisita: { id: string; titulo: string; inicio: string } | null
  onClose: () => void
  onAgendar: (payload: AgendarVisitaPayload) => Promise<void>
  onConcluir: (agendaId: string) => Promise<void>
  onNaoOcorreu: (agendaId: string) => Promise<void>
  localSugerido?: string
  observacaoSugerida?: string
}

export function VisitModal({ proximaVisita, onClose, onAgendar, onConcluir, onNaoOcorreu, localSugerido, observacaoSugerida }: Props) {
  const [mode, setMode] = useState<Mode>(proximaVisita ? 'concluir' : 'agendar')
  const amanha = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
  const [data, setData] = useState(amanha)
  const [horario, setHorario] = useState('14:00')
  const [local, setLocal] = useState(localSugerido ?? '')
  const [observacao, setObservacao] = useState(observacaoSugerida ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const tabs: { key: Mode; label: string }[] = [
    { key: 'agendar', label: 'Agendar nova' },
    ...(proximaVisita ? [{ key: 'concluir' as Mode, label: 'Marcar realizada' }, { key: 'nao_ocorreu' as Mode, label: 'Não ocorreu' }] : []),
  ]

  async function confirmar() {
    setSalvando(true); setErro('')
    try {
      if (mode === 'agendar') {
        if (!data || !horario) { setErro('Informe data e horário.'); setSalvando(false); return }
        await onAgendar({ data, horario, local: local.trim(), observacao: observacao.trim() })
      } else if (mode === 'concluir' && proximaVisita) {
        await onConcluir(proximaVisita.id)
      } else if (mode === 'nao_ocorreu' && proximaVisita) {
        await onNaoOcorreu(proximaVisita.id)
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao registrar visita')
      setSalvando(false)
    }
  }

  return (
    <FocusModalShell title="Visita" onClose={onClose}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setMode(tb.key)}
            style={{ flex: 1, padding: '8px 6px', borderRadius: 8, border: '1px solid ' + (mode === tb.key ? D.bronze : D.line), background: mode === tb.key ? D.bronze : '#fff', color: mode === tb.key ? '#fff' : D.ink, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {mode === 'agendar' && (
        <>
          <label style={labelCss}>Data</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={inputCss} />
          <label style={labelCss}>Horário</label>
          <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} style={inputCss} />
          <label style={labelCss}>Local</label>
          <input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Estande, empreendimento..." style={inputCss} />
          <label style={labelCss}>Observação</label>
          <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={2} style={{ ...inputCss, resize: 'vertical' }} />
        </>
      )}

      {mode === 'concluir' && proximaVisita && (
        <p style={{ fontSize: 13.5, color: D.ink, margin: '4px 0 0' }}>
          Confirmar que a visita <strong>{proximaVisita.titulo}</strong>, marcada para {new Date(proximaVisita.inicio).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}, foi realizada?
        </p>
      )}

      {mode === 'nao_ocorreu' && proximaVisita && (
        <p style={{ fontSize: 13.5, color: D.ink, margin: '4px 0 0' }}>
          Registrar que a visita <strong>{proximaVisita.titulo}</strong> não ocorreu? Isso não conta pontos, mas fica no histórico do lead.
        </p>
      )}

      {erro && <p style={{ color: D.red, fontSize: 13, marginTop: 12 }}>{erro}</p>}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '11px 16px', borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}>Cancelar</button>
        <button onClick={confirmar} disabled={salvando} style={{ flex: 1, padding: '11px 16px', borderRadius: 8, border: 'none', background: D.bronze, color: '#fff', fontWeight: 700, cursor: salvando ? 'default' : 'pointer', opacity: salvando ? 0.6 : 1, minHeight: 44 }}>
          {salvando ? 'Salvando...' : 'Confirmar'}
        </button>
      </div>
    </FocusModalShell>
  )
}
