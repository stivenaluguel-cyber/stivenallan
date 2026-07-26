'use client'
import { AlarmClock, CalendarClock, Clock, Sparkles, Star } from 'lucide-react'
import { D } from './tokens'
import type { FocusQueueItem } from '@/lib/dashboard/use-focus-queue'

type Badge = { key: string; label: string; icon: React.ReactNode; bg: string; fg: string }

function isHoje(iso: string): boolean {
  const d = new Date(iso)
  const agora = new Date()
  return d.toDateString() === agora.toDateString()
}

// Nunca depende só de cor (requisito de acessibilidade do briefing) — cada
// badge tem ícone + texto explícito, a cor é só reforço visual.
export function buildLeadBadges(item: Pick<FocusQueueItem, 'followupVencido' | 'requerAtencao' | 'nuncaContatado' | 'diasSemContato' | 'proximoEvento'>): Badge[] {
  const badges: Badge[] = []

  if (item.followupVencido) {
    badges.push({ key: 'followup', label: 'Follow-up vencido', icon: <AlarmClock size={12} />, bg: 'rgba(239,68,68,0.12)', fg: D.red })
  }
  if (item.proximoEvento && isHoje(item.proximoEvento.inicio)) {
    const label = item.proximoEvento.tipo === 'visita' ? 'Visita hoje' : 'Compromisso hoje'
    badges.push({ key: 'hoje', label, icon: <CalendarClock size={12} />, bg: 'rgba(245,158,11,0.14)', fg: D.amber })
  }
  if (item.requerAtencao) {
    badges.push({ key: 'atencao', label: 'Requer atenção', icon: <Star size={12} />, bg: 'rgba(210,78,34,0.12)', fg: D.bronze })
  }
  if (item.nuncaContatado) {
    const dias = item.diasSemContato ?? 0
    const label = dias <= 2 ? 'Novo lead' : `Sem ação há ${dias} dias`
    const icon = dias <= 2 ? <Sparkles size={12} /> : <Clock size={12} />
    badges.push({ key: 'sem-acao', label, icon, bg: 'rgba(59,130,246,0.12)', fg: D.blue })
  }

  return badges
}

export function LeadAttentionBadges({ item }: { item: FocusQueueItem }) {
  const badges = buildLeadBadges(item)
  if (badges.length === 0) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {badges.map((b) => (
        <span
          key={b.key}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
            background: b.bg, color: b.fg,
          }}
        >
          {b.icon}
          {b.label}
        </span>
      ))}
    </div>
  )
}
