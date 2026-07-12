'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function CronFilter({ crons, current }: { crons: string[]; current: string | null }) {
  const router = useRouter()
  const params = useSearchParams()

  function onChange(value: string) {
    const q = new URLSearchParams(params.toString())
    if (value) q.set('cron', value)
    else q.delete('cron')
    const qs = q.toString()
    router.push(`/dashboard/cron${qs ? `?${qs}` : ''}`)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <label
        htmlFor="cron-filter"
        style={{
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#71717a',
          fontWeight: 600,
        }}
      >
        Filtrar por cron
      </label>
      <select
        id="cron-filter"
        value={current ?? ''}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '8px 12px',
          border: '1px solid #e4e4e7',
          borderRadius: 8,
          fontSize: 13,
          color: '#1a1a1a',
          background: '#fff',
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        <option value="">Todos</option>
        {crons.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  )
}
