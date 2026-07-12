'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { LINHA_LABEL, STATUS_LABEL, TIPO_LABEL } from './instagram-metas'

export type CalendarRow = {
  id: string
  data: string | null
  tipo: string
  linha: string
  titulo: string
  roteiro: string | null
  status: string
  post_url: string | null
  alcance: number | null
  interacoes: number | null
  compartilhamentos: number | null
  watch_time_seg: number | null
  observacoes: string | null
}

const T = {
  bronze: '#D24E22',
  border: '#e4e4e7',
  ink: '#1a1a1a',
  mutedInk: '#71717a',
  fontanaBg: 'rgba(19,18,17,0.06)',
  oportunidadeBg: 'rgba(210,78,34,0.08)',
}

const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  planejado: { color: '#71717a', bg: 'rgba(113,113,122,0.12)' },
  a_gravar: { color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
  gravado: { color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  editado: { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  publicado: { color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
}

function formatarData(data: string | null): string {
  if (!data) return 'Sem data (reserva)'
  const [y, m, d] = data.split('-')
  const dias = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
  const diaSemana = dias[new Date(`${data}T12:00:00`).getDay()]
  return `${diaSemana} ${d}/${m}/${y}`
}

function Row({ row, onChanged }: { row: CalendarRow; onChanged: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(row.status)
  const [saving, setSaving] = useState(false)

  async function updateStatus(novoStatus: string) {
    setStatus(novoStatus)
    setSaving(true)
    await fetch('/api/admin/instagram/calendario', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id, status: novoStatus }),
    })
    setSaving(false)
    router.refresh()
    onChanged()
  }

  const sc = STATUS_COLOR[status] ?? STATUS_COLOR.planejado

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          all: 'unset',
          cursor: 'pointer',
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          gap: 10,
          padding: '11px 14px',
          background: row.linha === 'fontana' ? T.fontanaBg : T.oportunidadeBg,
        }}
      >
        <span style={{ fontSize: 11.5, fontWeight: 700, color: T.mutedInk, width: 78, flexShrink: 0 }}>
          {formatarData(row.data)}
        </span>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: T.mutedInk,
            border: `1px solid ${T.border}`,
            borderRadius: 5,
            padding: '2px 6px',
            flexShrink: 0,
          }}
        >
          {TIPO_LABEL[row.tipo] ?? row.tipo}
        </span>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: row.linha === 'fontana' ? T.ink : T.bronze, flexShrink: 0 }}>
          {LINHA_LABEL[row.linha] ?? row.linha}
        </span>
        <span style={{ fontSize: 13, color: T.ink, flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.titulo}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: sc.color, background: sc.bg, borderRadius: 6, padding: '3px 8px', flexShrink: 0 }}>
          {STATUS_LABEL[status] ?? status}
        </span>
      </button>

      {open && (
        <div style={{ padding: '14px 16px', borderTop: `1px solid ${T.border}`, background: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {row.roteiro && (
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 12.5, lineHeight: 1.6, color: '#3f3f46', margin: 0 }}>
              {row.roteiro}
            </pre>
          )}
          {row.observacoes && <div style={{ fontSize: 12, color: T.mutedInk, fontStyle: 'italic' }}>{row.observacoes}</div>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: T.mutedInk }}>Status:</label>
            <select
              value={status}
              disabled={saving}
              onChange={(e) => updateStatus(e.target.value)}
              style={{ padding: '6px 10px', border: `1px solid ${T.border}`, borderRadius: 7, fontSize: 12.5, fontFamily: 'inherit' }}
            >
              {Object.entries(STATUS_LABEL).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
            {(row.alcance != null || row.interacoes != null || row.watch_time_seg != null) && (
              <span style={{ fontSize: 11.5, color: T.mutedInk }}>
                {row.alcance != null && `alcance ${row.alcance} · `}
                {row.interacoes != null && `interações ${row.interacoes} · `}
                {row.watch_time_seg != null && `watch time ${row.watch_time_seg}s`}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function InstagramCalendarBoard({ rows }: { rows: CalendarRow[] }) {
  const [filtroLinha, setFiltroLinha] = useState<string>('')
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [, forceTick] = useState(0)

  const filtradas = useMemo(
    () =>
      rows.filter((r) => (!filtroLinha || r.linha === filtroLinha) && (!filtroStatus || r.status === filtroStatus)),
    [rows, filtroLinha, filtroStatus]
  )

  const comData = filtradas.filter((r) => r.data)
  const reserva = filtradas.filter((r) => !r.data)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select
          value={filtroLinha}
          onChange={(e) => setFiltroLinha(e.target.value)}
          style={{ padding: '7px 10px', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12.5, fontFamily: 'inherit' }}
        >
          <option value="">Todas as linhas</option>
          {Object.entries(LINHA_LABEL).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          style={{ padding: '7px 10px', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12.5, fontFamily: 'inherit' }}
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABEL).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {comData.map((r) => (
          <Row key={r.id} row={r} onChanged={() => forceTick((t) => t + 1)} />
        ))}
      </div>

      {reserva.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.mutedInk, marginBottom: 8 }}>
            Roteiros de reserva
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reserva.map((r) => (
              <Row key={r.id} row={r} onChanged={() => forceTick((t) => t + 1)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
