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

const inputStyle: React.CSSProperties = {
  padding: '7px 10px',
  border: `1px solid ${T.border}`,
  borderRadius: 7,
  fontSize: 12.5,
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
}

function formatarData(data: string | null): string {
  if (!data) return 'Sem data (reserva)'
  const [y, m, d] = data.split('-')
  const dias = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
  const diaSemana = dias[new Date(`${data}T12:00:00`).getDay()]
  return `${diaSemana} ${d}/${m}/${y}`
}

type FormValues = {
  data: string
  tipo: string
  linha: string
  titulo: string
  roteiro: string
  observacoes: string
}

function rowToForm(row: CalendarRow): FormValues {
  return {
    data: row.data ?? '',
    tipo: row.tipo,
    linha: row.linha,
    titulo: row.titulo,
    roteiro: row.roteiro ?? '',
    observacoes: row.observacoes ?? '',
  }
}

function EntryFields({ values, onChange }: { values: FormValues; onChange: (v: FormValues) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: T.mutedInk }}>Data (vazio = reserva)</label>
          <input
            type="date"
            value={values.data}
            onChange={(e) => onChange({ ...values, data: e.target.value })}
            style={{ ...inputStyle, marginTop: 4 }}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: T.mutedInk }}>Tipo</label>
          <select value={values.tipo} onChange={(e) => onChange({ ...values, tipo: e.target.value })} style={{ ...inputStyle, marginTop: 4 }}>
            {Object.entries(TIPO_LABEL).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: T.mutedInk }}>Linha</label>
          <select value={values.linha} onChange={(e) => onChange({ ...values, linha: e.target.value })} style={{ ...inputStyle, marginTop: 4 }}>
            {Object.entries(LINHA_LABEL).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: T.mutedInk }}>Título</label>
        <input
          type="text"
          value={values.titulo}
          onChange={(e) => onChange({ ...values, titulo: e.target.value })}
          style={{ ...inputStyle, marginTop: 4 }}
        />
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: T.mutedInk }}>Roteiro</label>
        <textarea
          value={values.roteiro}
          onChange={(e) => onChange({ ...values, roteiro: e.target.value })}
          rows={6}
          style={{ ...inputStyle, marginTop: 4, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: T.mutedInk }}>Observações</label>
        <textarea
          value={values.observacoes}
          onChange={(e) => onChange({ ...values, observacoes: e.target.value })}
          rows={2}
          style={{ ...inputStyle, marginTop: 4, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>
    </div>
  )
}

function NewEntryForm({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [values, setValues] = useState<FormValues>({ data: '', tipo: 'reel_educativo', linha: 'fontana', titulo: '', roteiro: '', observacoes: '' })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar() {
    if (!values.titulo.trim()) {
      setErro('Título é obrigatório.')
      return
    }
    setSaving(true)
    setErro(null)
    const res = await fetch('/api/admin/instagram/calendario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, data: values.data || null }),
    })
    setSaving(false)
    if (res.ok) {
      router.refresh()
      onClose()
    } else {
      const err = await res.json().catch(() => ({}))
      setErro(err.error ?? 'Falha ao salvar.')
    }
  }

  return (
    <div style={{ border: `1px solid ${T.bronze}`, borderRadius: 10, padding: 16, background: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Novo conteúdo</div>
      <EntryFields values={values} onChange={setValues} />
      {erro && <div style={{ fontSize: 12, color: '#dc2626' }}>{erro}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={salvar}
          disabled={saving}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: T.bronze, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Salvando…' : 'Criar'}
        </button>
        <button
          onClick={onClose}
          style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: T.mutedInk, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

function Row({ row }: { row: CalendarRow }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [status, setStatus] = useState(row.status)
  const [values, setValues] = useState<FormValues>(() => rowToForm(row))
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

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
  }

  async function salvarEdicao() {
    if (!values.titulo.trim()) {
      setErro('Título é obrigatório.')
      return
    }
    setSaving(true)
    setErro(null)
    const res = await fetch('/api/admin/instagram/calendario', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id, ...values, data: values.data || null }),
    })
    setSaving(false)
    if (res.ok) {
      router.refresh()
      setEditing(false)
    } else {
      const err = await res.json().catch(() => ({}))
      setErro(err.error ?? 'Falha ao salvar.')
    }
  }

  async function excluir() {
    if (!confirm(`Excluir "${row.titulo}"? Essa ação não pode ser desfeita.`)) return
    setSaving(true)
    await fetch(`/api/admin/instagram/calendario?id=${row.id}`, { method: 'DELETE' })
    router.refresh()
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

      {open && !editing && (
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
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  setValues(rowToForm(row))
                  setEditing(true)
                }}
                style={{ fontSize: 11.5, fontWeight: 600, padding: '5px 10px', borderRadius: 6, border: `1px solid ${T.border}`, background: '#fff', color: T.ink, cursor: 'pointer' }}
              >
                Editar
              </button>
              <button
                onClick={excluir}
                disabled={saving}
                style={{ fontSize: 11.5, fontWeight: 600, padding: '5px 10px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', cursor: saving ? 'default' : 'pointer' }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {open && editing && (
        <div style={{ padding: '14px 16px', borderTop: `1px solid ${T.border}`, background: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <EntryFields values={values} onChange={setValues} />
          {erro && <div style={{ fontSize: 12, color: '#dc2626' }}>{erro}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={salvarEdicao}
              disabled={saving}
              style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: T.bronze, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
            <button
              onClick={() => {
                setEditing(false)
                setErro(null)
              }}
              style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: T.mutedInk, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function InstagramCalendarBoard({ rows }: { rows: CalendarRow[] }) {
  const [filtroLinha, setFiltroLinha] = useState<string>('')
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [criando, setCriando] = useState(false)

  const filtradas = useMemo(
    () =>
      rows.filter((r) => (!filtroLinha || r.linha === filtroLinha) && (!filtroStatus || r.status === filtroStatus)),
    [rows, filtroLinha, filtroStatus]
  )

  const comData = filtradas.filter((r) => r.data)
  const reserva = filtradas.filter((r) => !r.data)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
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
        {!criando && (
          <button
            onClick={() => setCriando(true)}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: T.bronze, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
          >
            + Novo conteúdo
          </button>
        )}
      </div>

      {criando && <NewEntryForm onClose={() => setCriando(false)} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {comData.map((r) => (
          <Row key={r.id} row={r} />
        ))}
      </div>

      {reserva.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.mutedInk, marginBottom: 8 }}>
            Roteiros de reserva
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reserva.map((r) => (
              <Row key={r.id} row={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
