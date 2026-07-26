'use client'
import { useState } from 'react'
import { D } from './tokens'
import { FocusModalShell, inputCss, labelCss } from './FocusModalShell'

export const MOTIVOS_PERDA = [
  { value: 'sem_interesse', label: 'Sem interesse' },
  { value: 'sem_retorno', label: 'Sem retorno' },
  { value: 'orcamento_incompativel', label: 'Orçamento incompatível' },
  { value: 'comprou_com_outro', label: 'Comprou com outro corretor' },
  { value: 'cadastro_invalido', label: 'Cadastro inválido' },
  { value: 'outro', label: 'Outro' },
] as const

export type LostReasonPayload = { motivo: string; detalhe: string }

export function LostReasonModal({ nomeLead, onClose, onConfirm }: { nomeLead: string; onClose: () => void; onConfirm: (payload: LostReasonPayload) => Promise<void> }) {
  const [motivo, setMotivo] = useState('')
  const [detalhe, setDetalhe] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function confirmar() {
    if (!motivo) { setErro('Selecione um motivo.'); return }
    if (motivo === 'outro' && !detalhe.trim()) { setErro('Descreva o motivo.'); return }
    setSalvando(true); setErro('')
    try {
      await onConfirm({ motivo, detalhe: detalhe.trim() })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao marcar como perdido')
      setSalvando(false)
    }
  }

  return (
    <FocusModalShell title="Marcar lead como perdido" onClose={onClose}>
      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 12 }}>
        <p style={{ margin: 0, fontSize: 13.5, color: '#991B1B' }}>
          <strong>{nomeLead}</strong> sairá do funil ativo. O histórico e as anotações continuam preservados — essa ação pode ser revertida depois abrindo o lead e trocando a etapa manualmente.
        </p>
      </div>

      <label style={{ ...labelCss, marginTop: 16 }}>Motivo *</label>
      <select value={motivo} onChange={(e) => setMotivo(e.target.value)} style={inputCss}>
        <option value="">Selecione...</option>
        {MOTIVOS_PERDA.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>

      {motivo === 'outro' && (
        <>
          <label style={labelCss}>Descreva o motivo *</label>
          <textarea value={detalhe} onChange={(e) => setDetalhe(e.target.value)} rows={3} style={{ ...inputCss, resize: 'vertical' }} />
        </>
      )}

      {erro && <p style={{ color: D.red, fontSize: 13, marginTop: 12 }}>{erro}</p>}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '11px 16px', borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}>Cancelar</button>
        <button onClick={confirmar} disabled={salvando} style={{ flex: 1, padding: '11px 16px', borderRadius: 8, border: 'none', background: D.red, color: '#fff', fontWeight: 700, cursor: salvando ? 'default' : 'pointer', opacity: salvando ? 0.6 : 1, minHeight: 44 }}>
          {salvando ? 'Confirmando...' : 'Confirmar perda'}
        </button>
      </div>
    </FocusModalShell>
  )
}
