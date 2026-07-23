'use client'

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { StageSnapshot } from './funil-stats'

// Recharts é client-only. Wrapper fino isola o import — mesmo padrão de
// src/lib/dashboard/cron-chart.tsx — pra o server component (relatorios/page.tsx)
// não precisar virar client component inteiro.

export function FunilChart({ data }: { data: StageSnapshot[] }) {
  const formatted = data.map((d) => ({ ...d, label: d.label.length > 14 ? d.label.slice(0, 13) + '…' : d.label }))
  const resumoTexto = data.length > 0
    ? `Distribuição do funil: ${data.map((d) => `${d.label} ${d.total} (${d.pct}%)`).join(', ')}.`
    : 'Sem dados de funil para exibir.'

  return (
    <div style={{ width: '100%', height: 280 }}>
      <p style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>{resumoTexto}</p>
      <ResponsiveContainer>
        <BarChart data={formatted} margin={{ top: 12, right: 12, bottom: 24, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis dataKey="label" fontSize={11} tick={{ fill: '#71717a' }} axisLine={{ stroke: '#e4e4e7' }} angle={-20} textAnchor="end" height={50} />
          <YAxis fontSize={11} tick={{ fill: '#71717a' }} axisLine={{ stroke: '#e4e4e7' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 12 }}
            cursor={{ fill: 'rgba(210,78,34,0.05)' }}
            formatter={((value: number, _name: unknown, item: { payload: { pct: number; label: string } }) => [`${value} leads (${item.payload.pct}%)`, item.payload.label]) as never}
          />
          <Bar dataKey="total" name="leads" radius={[4, 4, 0, 0]}>
            {formatted.map((d) => (
              <Cell key={d.key} fill={d.cor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
