'use client'
import { useState } from 'react'
import { D } from './tokens'
import { FocusModalShell, inputCss, labelCss } from './FocusModalShell'
import { formatSaoPauloDateTime } from '@/lib/dashboard/timezone-sp'

export type AgendarVisitaPayload = { data: string; horario: string; local: string; observacao: string }
export type VisitaRef = { id: string; titulo: string; inicio: string }

type Mode = 'agendar' | 'concluir' | 'nao_ocorreu'

type Props = {
  // Só uma visita cujo horário JÁ PASSOU pode ser marcada como realizada.
  visitaVencida: VisitaRef | null
  // Visita ainda por acontecer: aparece como contexto ("já existe visita
  // marcada para X"), nunca como algo a confirmar como realizado.
  visitaFutura: VisitaRef | null
  onClose: () => void
  onAgendar: (payload: AgendarVisitaPayload) => Promise<void>
  onConcluir: (agendaId: string) => Promise<void>
  onNaoOcorreu: (agendaId: string) => Promise<void>
  localSugerido?: string
  observacaoSugerida?: string
  dataPadrao: string
}

export function VisitModal({ visitaVencida, visitaFutura, onClose, onAgendar, onConcluir, onNaoOcorreu, localSugerido, observacaoSugerida, dataPadrao }: Props) {
  const [mode, setMode] = useState<Mode>(visitaVencida ? 'concluir' : 'agendar')
  const [data, setData] = useState(dataPadrao)
  const [horario, setHorario] = useState('14:00')
  const [local, setLocal] = useState(localSugerido ?? '')
  const [observacao, setObservacao] = useState(observacaoSugerida ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // As abas de concluir/não-ocorreu só existem quando há visita VENCIDA —
  // uma visita futura não pode ser confirmada como realizada por engano.
  const tabs: { key: Mode; label: string }[] = [
    { key: 'agendar', label: 'Agendar nova' },
    ...(visitaVencida ? [{ key: 'concluir' as Mode, label: 'Marcar realizada' }, { key: 'nao_ocorreu' as Mode, label: 'Não ocorreu' }] : []),
  ]

  async function confirmar() {
    setSalvando(true); setErro('')
    try {
      if (mode === 'agendar') {
        if (!data || !horario) { setErro('Informe data e horário.'); setSalvando(false); return }
        await onAgendar({ data, horario, local: local.trim(), observacao: observacao.trim() })
      } else if (mode === 'concluir' && visitaVencida) {
        await onConcluir(visitaVencida.id)
      } else if (mode === 'nao_ocorreu' && visitaVencida) {
        await onNaoOcorreu(visitaVencida.id)
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

      {mode === 'agendar' && visitaFutura && (
        <p style={{ fontSize: 12.5, color: D.muted, background: '#F8FAFC', border: '1px solid ' + D.line, borderRadius: 8, padding: '8px 10px', margin: '8px 0 0' }}>
          Já existe uma visita marcada para {formatSaoPauloDateTime(visitaFutura.inicio)}. Como ela ainda não aconteceu, não pode ser registrada como realizada.
        </p>
      )}

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

      {mode === 'concluir' && visitaVencida && (
        <p style={{ fontSize: 13.5, color: D.ink, margin: '4px 0 0' }}>
          Confirmar que a visita <strong>{visitaVencida.titulo}</strong>, marcada para {formatSaoPauloDateTime(visitaVencida.inicio)}, foi realizada?
        </p>
      )}

      {mode === 'nao_ocorreu' && visitaVencida && (
        <p style={{ fontSize: 13.5, color: D.ink, margin: '4px 0 0' }}>
          Registrar que a visita <strong>{visitaVencida.titulo}</strong> não ocorreu? Isso não conta pontos, mas fica no histórico do lead.
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
