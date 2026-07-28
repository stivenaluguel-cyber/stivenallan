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
//
// O card já mostra a razão PRINCIPAL da fila no bloco "Por que está aqui"
// (focus-guidance.ts) — repetir essa mesma razão aqui como badge seria
// informação duplicada concorrendo no topo do card. Por isso só vira badge
// o sinal que NÃO é o motivo já explicado ali (ex.: um lead com follow-up
// vencido E requer_atencao mostra "Follow-up vencido" no bloco principal e
// só "Requer atenção" como badge secundário). "Compromisso/visita hoje" é
// sempre mostrado: é uma informação de agenda complementar, não uma
// duplicata textual de nenhuma das mensagens de prioridade.
export function buildLeadBadges(item: Pick<FocusQueueItem, 'followupVencido' | 'requerAtencao' | 'nuncaContatado' | 'diasSemContato' | 'proximoEvento' | 'prioridade'>): Badge[] {
  const badges: Badge[] = []
  const motivoPrincipal = item.prioridade?.title

  if (item.followupVencido && motivoPrincipal !== 'Follow-up vencido') {
    badges.push({ key: 'followup', label: 'Follow-up vencido', icon: <AlarmClock size={12} />, bg: 'rgba(239,68,68,0.12)', fg: D.red })
  }
  if (item.proximoEvento && isHoje(item.proximoEvento.inicio)) {
    const label = item.proximoEvento.tipo === 'visita' ? 'Visita hoje' : 'Compromisso hoje'
    badges.push({ key: 'hoje', label, icon: <CalendarClock size={12} />, bg: 'rgba(245,158,11,0.14)', fg: D.amber })
  }
  if (item.requerAtencao && motivoPrincipal !== 'Requer atenção') {
    badges.push({ key: 'atencao', label: 'Requer atenção', icon: <Star size={12} />, bg: 'rgba(210,78,34,0.12)', fg: D.bronze })
  }
  if (item.nuncaContatado && motivoPrincipal !== 'Ainda sem contato') {
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
