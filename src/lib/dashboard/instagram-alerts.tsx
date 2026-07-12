'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type AlertaRow = {
  id: string
  titulo: string
  corpo: string
  metadata: { gate?: string; severidade?: 'alerta' | 'info' } | null
  created_at: string
}

const T = {
  alerta: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
  info: { color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  border: '#e4e4e7',
}

export function InstagramAlerts({ alertas }: { alertas: AlertaRow[] }) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  async function marcarLida(id: string) {
    setDismissed((prev) => new Set(prev).add(id))
    await fetch('/api/admin/notificacoes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, lida: true }),
    })
    router.refresh()
  }

  const visiveis = alertas.filter((a) => !dismissed.has(a.id))

  if (visiveis.length === 0) {
    return (
      <div style={{ padding: 16, borderRadius: 10, border: `1px solid ${T.border}`, color: '#71717a', fontSize: 13 }}>
        Nenhum gatilho ativo no momento.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {visiveis.map((a) => {
        const sev = a.metadata?.severidade === 'info' ? T.info : T.alerta
        return (
          <div
            key={a.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 10,
              border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${sev.color}`,
              background: sev.bg,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 3 }}>{a.titulo}</div>
              <div style={{ fontSize: 12.5, color: '#3f3f46', lineHeight: 1.5 }}>{a.corpo}</div>
            </div>
            <button
              onClick={() => marcarLida(a.id)}
              style={{
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 600,
                padding: '5px 10px',
                borderRadius: 6,
                border: `1px solid ${T.border}`,
                background: '#fff',
                color: '#71717a',
                cursor: 'pointer',
              }}
            >
              Marcar lida
            </button>
          </div>
        )
      })}
    </div>
  )
}
