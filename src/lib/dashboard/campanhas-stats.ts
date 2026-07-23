// Agregação pura sobre campanha_eventos — mesmo padrão de cron-stats.ts/funil-stats.ts.

export type CampanhaEventoRow = {
  tipo: string
}

export type CampanhaStats = {
  entregue: number
  aberto: number
  clicado: number
  bounce: number
  reclamado: number
}

const TIPOS_CONHECIDOS: (keyof CampanhaStats)[] = ['entregue', 'aberto', 'clicado', 'bounce', 'reclamado']

export function aggregateCampanhaEventos(rows: CampanhaEventoRow[]): CampanhaStats {
  const stats: CampanhaStats = { entregue: 0, aberto: 0, clicado: 0, bounce: 0, reclamado: 0 }
  for (const r of rows) {
    if ((TIPOS_CONHECIDOS as string[]).includes(r.tipo)) {
      stats[r.tipo as keyof CampanhaStats]++
    }
  }
  return stats
}

export function statsParaGrafico(stats: CampanhaStats): { key: string; label: string; total: number; cor: string }[] {
  return [
    { key: 'entregue', label: 'Entregues', total: stats.entregue, cor: '#16a34a' },
    { key: 'aberto', label: 'Abertos', total: stats.aberto, cor: '#3b82f6' },
    { key: 'clicado', label: 'Clicados', total: stats.clicado, cor: '#D24E22' },
    { key: 'bounce', label: 'Bounces', total: stats.bounce, cor: '#dc2626' },
    { key: 'reclamado', label: 'Reclamações', total: stats.reclamado, cor: '#71717a' },
  ]
}
