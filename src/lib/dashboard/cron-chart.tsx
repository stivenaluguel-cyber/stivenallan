'use client'

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DayBucket } from './cron-stats'

// Recharts é client-only. Este wrapper isola o import pra que o server component
// (page.tsx) não precise virar client component inteiro.

const COLORS = {
  ok: '#16a34a',
  skipped: '#d97706',
  error: '#dc2626',
  running: '#71717a',
}

export function CronTimelineChart({ data }: { data: DayBucket[] }) {
  // Rótulo mais curto no eixo X: só DD/MM
  const formatted = data.map((d) => ({
    ...d,
    label: d.day.slice(5).replace('-', '/'),
  }))

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={formatted} margin={{ top: 12, right: 12, bottom: 4, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis dataKey="label" fontSize={11} tick={{ fill: '#71717a' }} axisLine={{ stroke: '#e4e4e7' }} />
          <YAxis fontSize={11} tick={{ fill: '#71717a' }} axisLine={{ stroke: '#e4e4e7' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 12 }}
            cursor={{ fill: 'rgba(210,78,34,0.05)' }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey="ok" name="ok" stackId="a" fill={COLORS.ok} radius={[0, 0, 0, 0]} />
          <Bar dataKey="skipped" name="skipped" stackId="a" fill={COLORS.skipped} />
          <Bar dataKey="errors" name="error" stackId="a" fill={COLORS.error} />
          <Bar dataKey="running" name="running" stackId="a" fill={COLORS.running} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
