'use client'

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { VgvStage } from './funil-stats'

// Mesmo padrão de wrapper client-only de funil-chart.tsx.

const fmt = (n: number) => 'R$ ' + Math.round(n).toLocaleString('pt-BR')
const fmtCompacto = (n: number) => {
  if (n >= 1_000_000) return 'R$' + (n / 1_000_000).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1_000) return 'R$' + Math.round(n / 1_000) + 'k'
  return fmt(n)
}

export function VgvChart({ data }: { data: VgvStage[] }) {
  const formatted = data.map((d) => ({ ...d, label: d.label.length > 14 ? d.label.slice(0, 13) + '…' : d.label }))

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={formatted} margin={{ top: 12, right: 12, bottom: 24, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis dataKey="label" fontSize={11} tick={{ fill: '#71717a' }} axisLine={{ stroke: '#e4e4e7' }} angle={-20} textAnchor="end" height={50} />
          <YAxis fontSize={11} tick={{ fill: '#71717a' }} axisLine={{ stroke: '#e4e4e7' }} tickFormatter={fmtCompacto} />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 12 }}
            cursor={{ fill: 'rgba(210,78,34,0.05)' }}
            formatter={((value: number, _name: unknown, item: { payload: { pct: number; label: string } }) => [`${fmt(value)} (${item.payload.pct}%)`, item.payload.label]) as never}
          />
          <Bar dataKey="vgv" name="vgv" radius={[4, 4, 0, 0]}>
            {formatted.map((d) => (
              <Cell key={d.key} fill={d.cor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
