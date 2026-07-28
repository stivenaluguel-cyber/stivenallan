'use client'
import { CalendarClock, CheckCircle2, MessageCircle, Repeat, SkipForward, Sparkles, Timer, TrendingDown, Trophy } from 'lucide-react'
import { D } from './tokens'
import type { FocusSession } from '@/lib/dashboard/use-focus-session'
import type { FocusSessionResumo } from '@/lib/dashboard/focus-summary'

function duracao(minutos: number | null): string {
  if (minutos === null) return '—'
  if (minutos < 1) return '< 1 min'
  if (minutos < 60) return `${Math.round(minutos)} min`
  return `${Math.floor(minutos / 60)}h ${Math.round(minutos % 60)}min`
}

export function FocusSessionSummary({
  session,
  resumo,
  onVoltarCrm,
  onNovaSessao,
}: {
  session: FocusSession
  resumo: FocusSessionResumo
  onVoltarCrm: () => void
  onNovaSessao: () => void
}) {
  // Cada tipo de visita é uma linha própria — agendar e realizar a MESMA
  // visita não pode somar como se fossem duas.
  const itens = [
    { label: 'Leads tratados', valor: resumo.leadsProcessadosUnicos, icon: <CheckCircle2 size={16} />, cor: D.green },
    { label: 'Follow-ups agendados', valor: resumo.followupsAgendados, icon: <CalendarClock size={16} />, cor: D.blue },
    { label: 'Contatos confirmados', valor: resumo.contatosConfirmados, icon: <MessageCircle size={16} />, cor: D.green },
    { label: 'Visitas agendadas', valor: resumo.visitasAgendadas, icon: <CalendarClock size={16} />, cor: D.amber },
    { label: 'Visitas realizadas', valor: resumo.visitasRealizadas, icon: <Sparkles size={16} />, cor: D.green },
    { label: 'Visitas não ocorridas', valor: resumo.visitasNaoOcorreram, icon: <TrendingDown size={16} />, cor: D.muted },
    { label: 'Mudanças de etapa', valor: resumo.mudancasDeEtapa, icon: <Repeat size={16} />, cor: D.bronze },
    { label: 'Propostas enviadas', valor: resumo.propostas, icon: <Sparkles size={16} />, cor: D.bronze },
    { label: 'Anotações', valor: resumo.anotacoes, icon: <MessageCircle size={16} />, cor: D.muted },
    { label: 'Adiados', valor: resumo.adiados, icon: <Timer size={16} />, cor: D.muted },
    { label: 'Pulados', valor: resumo.pulados, icon: <SkipForward size={16} />, cor: D.muted },
    { label: 'Perdidos', valor: resumo.perdidos, icon: <TrendingDown size={16} />, cor: D.red },
  ]

  return (
    <div style={{ minHeight: '100vh', background: D.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 560, background: '#fff', borderRadius: 16, border: '1px solid ' + D.line, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ background: D.sidebar, padding: '28px 28px 24px', textAlign: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: '50%', background: 'rgba(210,78,34,0.18)', color: D.orange, marginBottom: 12 }}>
            <Trophy size={26} />
          </span>
          <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 22, fontWeight: 800, color: D.onDark }}>
            {session.status === 'concluida' ? 'Sessão concluída' : 'Sessão encerrada'}
          </div>
          <div style={{ fontSize: 13, color: D.onDarkMuted, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Timer size={13} /> {duracao(resumo.duracaoMinutos)} · {resumo.pontos} pontos
            {resumo.percentualDaFila !== null && <> · {resumo.percentualDaFila}% da fila</>}
            {resumo.itensPorMinuto !== null && resumo.itensPorMinuto > 0 && <> · {resumo.itensPorMinuto}/min</>}
          </div>
        </div>

        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
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
