'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { WeeklyMetric } from './instagram-gates'

const T = { bronze: '#D24E22', border: '#e4e4e7', ink: '#1a1a1a', mutedInk: '#71717a' }

const FIELDS: { key: keyof WeeklyMetric; label: string; step?: string }[] = [
  { key: 'seguidores', label: 'Seguidores' },
  { key: 'novos_seguidores', label: 'Novos seguidores' },
  { key: 'novos_seguidores_locais', label: 'Novos seguidores locais' },
  { key: 'alcance', label: 'Alcance total' },
  { key: 'alcance_educativo', label: 'Alcance educativo' },
  { key: 'alcance_imovel', label: 'Alcance imóvel/anúncio' },
  { key: 'taxa_engajamento', label: 'Taxa de engajamento (%)', step: '0.01' },
  { key: 'visitas_perfil', label: 'Visitas ao perfil' },
  { key: 'cliques_bio', label: 'Cliques no link da bio' },
  { key: 'leads_qualificados', label: 'Leads qualificados' },
  { key: 'custo_por_visita', label: 'Custo/visita do criativo ativo (R$)', step: '0.01' },
  { key: 'tempo_resposta_medio_min', label: 'Tempo médio de resposta (min)', step: '0.1' },
]

function segundaFeiraAtual(): string {
  const hoje = new Date()
  const dia = hoje.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  const segunda = new Date(hoje)
  segunda.setDate(hoje.getDate() + diff)
  return segunda.toISOString().slice(0, 10)
}

export function InstagramWeeklyForm({ ultimaSemana }: { ultimaSemana: WeeklyMetric | null }) {
  const router = useRouter()
  const semanaSugerida = segundaFeiraAtual()
  const editandoSemanaAtual = ultimaSemana?.semana_inicio === semanaSugerida

  const [values, setValues] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = { semana_inicio: semanaSugerida }
    if (editandoSemanaAtual && ultimaSemana) {
      for (const f of FIELDS) {
        const v = ultimaSemana[f.key]
        base[f.key] = v == null ? '' : String(v)
      }
    }
    return base
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  function set(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)

    const payload: Record<string, unknown> = { semana_inicio: values.semana_inicio }
    for (const f of FIELDS) {
      const raw = values[f.key]
      payload[f.key] = raw === '' || raw == null ? null : Number(raw)
    }

    const method = editandoSemanaAtual ? 'PATCH' : 'POST'
    const body = editandoSemanaAtual ? { id: (ultimaSemana as WeeklyMetric & { id: string }).id, ...payload } : payload

    const res = await fetch('/api/admin/instagram/metricas', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (res.ok) {
      setMsg('Semana salva. Gatilhos recalculados.')
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      setMsg(`Erro: ${err.error ?? 'falha ao salvar'}`)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.mutedInk }}>
          Semana (segunda-feira)
        </label>
        <input
          type="date"
          value={values.semana_inicio}
          onChange={(e) => set('semana_inicio', e.target.value)}
          style={{ display: 'block', marginTop: 4, padding: '8px 10px', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, width: 180 }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label style={{ fontSize: 11.5, color: T.mutedInk, fontWeight: 600 }}>{f.label}</label>
            <input
              type="number"
              step={f.step ?? '1'}
              value={values[f.key] ?? ''}
              onChange={(e) => set(f.key, e.target.value)}
              style={{ display: 'block', marginTop: 4, padding: '8px 10px', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, width: '100%' }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '9px 18px',
            borderRadius: 8,
            border: 'none',
            background: T.bronze,
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: saving ? 'default' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Salvando…' : editandoSemanaAtual ? 'Atualizar semana' : 'Salvar semana'}
        </button>
        {msg && <span style={{ fontSize: 12.5, color: T.mutedInk }}>{msg}</span>}
      </div>
    </form>
  )
}
