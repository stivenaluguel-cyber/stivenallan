'use client'
import { D } from './tokens'
import { FocusModalShell } from './FocusModalShell'
import { ESTAGIOS_FUNIL } from '@/lib/dashboard/estagios'

// Mostrado depois de concluir uma visita. As opções são só as etapas REAIS
// do funil (ESTAGIOS_FUNIL) que fazem sentido após uma visita — não existe
// uma etapa "Visita Realizada" no banco (o CHECK constraint de
// leads.estagio_funil não permite), então o registro de "visita realizada"
// já ficou marcado na Agenda (crm_agenda.status='concluido'); aqui só
// perguntamos se o estágio no funil deve avançar.
const OPCOES = ['proposta_enviada', 'negociacao'] as const

export function StageChangePrompt({ estagioAtual, onClose, onEscolher }: { estagioAtual: string; onClose: () => void; onEscolher: (novoEstagio: string) => void }) {
  return (
    <FocusModalShell title="Mover o lead de etapa?" onClose={onClose} maxWidth={400}>
      <p style={{ fontSize: 13.5, color: D.muted, margin: '0 0 16px' }}>Visita registrada. Quer avançar o lead no funil agora?</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {OPCOES.map((key) => {
          const e = ESTAGIOS_FUNIL.find((x) => x.key === key)!
          return (
            <button
              key={key}
              onClick={() => onEscolher(key)}
              style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 10, border: '1px solid ' + e.cor, background: e.cor + '10', color: e.cor, fontWeight: 700, fontSize: 14, cursor: 'pointer', minHeight: 44 }}
            >
              {e.label}
            </button>
          )
        })}
        <button
          onClick={onClose}
          style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 10, border: '1px solid ' + D.line, background: '#fff', color: D.muted, fontWeight: 600, fontSize: 14, cursor: 'pointer', minHeight: 44 }}
        >
          Manter etapa atual ({ESTAGIOS_FUNIL.find((x) => x.key === estagioAtual)?.label ?? estagioAtual})
        </button>
      </div>
    </FocusModalShell>
  )
}
