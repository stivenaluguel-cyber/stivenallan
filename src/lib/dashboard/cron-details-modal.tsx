'use client'

import { useEffect, useState } from 'react'
import type { CronRunRow } from './cron-stats'

// Wrapper client que expõe cada row como botão. Click abre modal com
// details jsonb pretty-printed. Isola a interatividade do resto do server
// component sem transformar a tabela inteira em client.

export function CronRowButton({ row, children }: { row: CronRunRow; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          all: 'unset',
          cursor: 'pointer',
          width: '100%',
          display: 'block',
        }}
        title="Ver detalhes"
      >
        {children}
      </button>

      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div style={{ background: '#fff', borderRadius: 12, maxWidth: 720, width: '100%', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e4e4e7' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
                  {row.cron_name} — {row.status}
                </h2>
                <p style={{ fontSize: 12, color: '#71717a', margin: '4px 0 0', fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace' }}>
                  {row.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#71717a', padding: '0 8px' }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '16px 20px', overflow: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 20 }}>
                <tbody>
                  <RowKV label="started_at" value={row.started_at} />
                  <RowKV label="ended_at" value={row.ended_at ?? '—'} />
                  <RowKV label="duration_ms" value={row.duration_ms == null ? '—' : String(row.duration_ms)} />
                  <RowKV label="processados" value={row.processados == null ? '—' : String(row.processados)} />
                  <RowKV label="enviados" value={row.enviados == null ? '—' : String(row.enviados)} />
                  <RowKV label="pulados" value={row.pulados == null ? '—' : String(row.pulados)} />
                  <RowKV label="erros_envio" value={row.erros_envio == null ? '—' : String(row.erros_envio)} />
                  {row.motivo && <RowKV label="motivo" value={row.motivo} />}
                </tbody>
              </table>

              <div>
                <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a', fontWeight: 600, margin: '0 0 8px' }}>
                  details (jsonb)
                </p>
                <pre style={{ background: '#131211', color: '#F3F2EE', padding: '14px 16px', borderRadius: 8, fontSize: 12, overflow: 'auto', margin: 0, maxHeight: 240, fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace' }}>
                  {row.details ? JSON.stringify(row.details, null, 2) : '—'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function RowKV({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{ padding: '6px 12px 6px 0', color: '#71717a', width: 140, fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace', fontSize: 12 }}>{label}</td>
      <td style={{ padding: '6px 0', color: '#1a1a1a', fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace', fontSize: 12, wordBreak: 'break-all' }}>{value}</td>
    </tr>
  )
}
