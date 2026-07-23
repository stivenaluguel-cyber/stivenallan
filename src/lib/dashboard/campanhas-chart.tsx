'use client'

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// Recharts é client-only — mesmo padrão de funil-chart.tsx/cron-chart.tsx.

export function CampanhaChart({ data }: { data: { key: string; label: string; total: number; cor: string }[] }) {
  const resumoTexto = data.length > 0
    ? `Engajamento da campanha: ${data.map((d) => `${d.label} ${d.total}`).join(', ')}.`
    : 'Sem dados de engajamento para exibir.'

  return (
    <div style={{ width: '100%', height: 220 }}>
      <p style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>{resumoTexto}</p>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis dataKey="label" fontSize={11} tick={{ fill: '#71717a' }} axisLine={{ stroke: '#e4e4e7' }} />
          <YAxis fontSize={11} tick={{ fill: '#71717a' }} axisLine={{ stroke: '#e4e4e7' }} allowDecimals={false} />
          <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'rgba(210,78,34,0.05)' }} />
          <Bar dataKey="total" name="eventos" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.key} fill={d.cor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
