'use client'
import { CalendarClock, CheckCircle2, MessageCircle, Repeat, SkipForward, Sparkles, Timer, TrendingDown, Trophy } from 'lucide-react'
import { D } from './tokens'
import type { FocusSession } from '@/lib/dashboard/use-focus-session'

export type FocusSessionBreakdown = {
  followupsAgendados: number
  visitas: number
  mudancasDeEtapa: number
  perdidos: number
  propostas: number
  contatosConfirmados: number
}

function duracao(inicio: string, fim: string | null): string {
  const ms = new Date(fim ?? new Date()).getTime() - new Date(inicio).getTime()
  const min = Math.round(ms / 60_000)
  if (min < 1) return '< 1 min'
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)}h ${min % 60}min`
}

export function FocusSessionSummary({
  session,
  breakdown,
  onVoltarCrm,
  onNovaSessao,
}: {
  session: FocusSession
  breakdown: FocusSessionBreakdown
  onVoltarCrm: () => void
  onNovaSessao: () => void
}) {
  const itens = [
    { label: 'Leads processados', valor: session.processed_leads, icon: <CheckCircle2 size={16} />, cor: D.green },
    { label: 'Pulados', valor: session.skipped_leads, icon: <SkipForward size={16} />, cor: D.muted },
    { label: 'Follow-ups agendados', valor: breakdown.followupsAgendados, icon: <CalendarClock size={16} />, cor: D.blue },
    { label: 'Contatos confirmados', valor: breakdown.contatosConfirmados, icon: <MessageCircle size={16} />, cor: D.green },
    { label: 'Visitas', valor: breakdown.visitas, icon: <Sparkles size={16} />, cor: D.amber },
    { label: 'Mudanças de etapa', valor: breakdown.mudancasDeEtapa, icon: <Repeat size={16} />, cor: D.bronze },
    { label: 'Perdidos', valor: breakdown.perdidos, icon: <TrendingDown size={16} />, cor: D.red },
    { label: 'Propostas enviadas', valor: breakdown.propostas, icon: <Sparkles size={16} />, cor: D.bronze },
  ]

  return (
    <div style={{ minHeight: '100vh', background: D.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 560, background: '#fff', borderRadius: 16, border: '1px solid ' + D.line, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ background: D.sidebar, padding: '28px 28px 24px', textAlign: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: '50%', background: 'rgba(210,78,34,0.18)', color: D.orange, marginBottom: 12 }}>
            <Trophy size={26} />
          </span>
          <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 22, fontWeight: 800, color: D.onDark }}>Sessão concluída</div>
          <div style={{ fontSize: 13, color: D.onDarkMuted, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Timer size={13} /> {duracao(session.started_at, session.finished_at)} · {session.earned_points} pontos conquistados
          </div>
        </div>

        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
          {itens.map((it) => (
            <div key={it.label} style={{ border: '1px solid ' + D.line, borderRadius: 10, padding: '12px 14px', borderTop: '3px solid ' + it.cor }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: it.cor, marginBottom: 6 }}>{it.icon}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 22, fontWeight: 800, color: D.ink }}>{it.valor}</div>
              <div style={{ fontSize: 11.5, color: D.muted, marginTop: 2 }}>{it.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
          <button onClick={onVoltarCrm} style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontWeight: 700, cursor: 'pointer', minHeight: 46 }}>
            Voltar ao CRM
          </button>
          <button onClick={onNovaSessao} style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none', background: D.bronze, color: '#fff', fontWeight: 700, cursor: 'pointer', minHeight: 46 }}>
            Iniciar nova sessão
          </button>
        </div>
      </div>
    </div>
  )
}
