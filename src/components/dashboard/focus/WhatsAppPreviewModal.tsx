'use client'
import { useState } from 'react'
import { D } from './tokens'
import { FocusModalShell, inputCss, labelCss } from './FocusModalShell'

// Preview editável antes de abrir o WhatsApp: o corretor lê e ajusta a
// mensagem em vez de ela ir pronta pra conversa. Abrir a conversa NUNCA
// registra contato — isso continua sendo uma confirmação explícita depois.
export function WhatsAppPreviewModal({
  nomeLead, mensagemSugerida, onClose, onEnviar,
}: {
  nomeLead: string
  mensagemSugerida: string
  onClose: () => void
  onEnviar: (texto: string) => { popupBloqueado: boolean }
}) {
  const [texto, setTexto] = useState(mensagemSugerida)
  const [popupBloqueado, setPopupBloqueado] = useState(false)

  function abrir() {
    const r = onEnviar(texto.trim())
    setPopupBloqueado(r.popupBloqueado)
    if (!r.popupBloqueado) onClose()
  }

  return (
    <FocusModalShell title={'Mensagem para ' + nomeLead} onClose={onClose}>
      <label htmlFor="wa-texto" style={{ ...labelCss, marginTop: 0 }}>Revise antes de abrir a conversa</label>
      <textarea
        id="wa-texto"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={5}
        style={{ ...inputCss, resize: 'vertical', minHeight: 120, lineHeight: 1.5 }}
      />
      <p style={{ fontSize: 12, color: D.muted, margin: '8px 0 0' }}>
        Abrir a conversa não marca o contato como feito — você confirma isso depois de enviar.
      </p>

      {popupBloqueado && (
        <p role="alert" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, marginTop: 12 }}>
          O navegador bloqueou a abertura da janela. Libere pop-ups para este site e tente de novo.
        </p>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '11px 16px', borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}>Cancelar</button>
        <button onClick={abrir} disabled={!texto.trim()} style={{ flex: 1, padding: '11px 16px', borderRadius: 8, border: 'none', background: texto.trim() ? '#16A34A' : '#CBD5E1', color: '#fff', fontWeight: 700, cursor: texto.trim() ? 'pointer' : 'not-allowed', minHeight: 44 }}>
          Abrir no WhatsApp
        </button>
      </div>
    </FocusModalShell>
  )
}
