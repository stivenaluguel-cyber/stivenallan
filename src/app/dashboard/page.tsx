'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', sidebar: '#131211', ink: '#161512',
  bronze: '#D24E22', muted: '#6B655B', line: 'rgba(26,24,21,0.08)',
  green: '#22c55e', red: '#ef4444', blue: '#3b82f6',
  onDark: '#F3F2EE', onDarkMuted: 'rgba(245,241,234,0.65)',
}
const fmt = (n: number) => 'R$\u00a0' + Math.round(n).toLocaleString('pt-BR')

type Lead = {
  id: string; nome?: string; whatsapp: string; estagio_funil: string
  lead_score?: number; requer_atencao?: boolean; temperatura?: number
  orcamento_max?: number; origem?: string; created_at?: string
}
type Cub = { valor_m2: number; mes_referencia: string; variacao_mensal?: number }
type Insights = { insights: string; resumo?: { score_medio: number; requer_atencao: number; total: number } }

const ESTAGIOS = [
  { key: 'primeiro_contato', label: 'Novo Contato', cor: '#6b7280' },
  { key: 'qualificado', label: 'Qualificado', cor: '#3b82f6' },
  { key: 'interessado', label: 'Interessado', cor: '#8b5cf6' },
  { key: 'proposta_enviada', label: 'Proposta Enviada', cor: '#f59e0b' },
  { key: 'visita_agendada', label: 'Visita Agendada', cor: '#ec4899' },
  { key: 'negociacao', label: 'Em Negociação', cor: '#D24E22' },
  { key: 'fechado', label: 'Fechado', cor: '#22c55e' },
]

const ATALHOS = [
  { href: '/dashboard/crm', label: 'Abrir CRM', icon: '🗂️' },
  { href: '/dashboard/leads', label: 'Ver Leads', icon: '🎯' },
  { href: '/dashboard/empreendimentos', label: 'Empreendimentos', icon: '🏢' },
  { href: '/dashboard/simulador', label: 'Simulador', icon: '🧮' },
  { href: '/dashboard/propostas', label: 'Propostas', icon: '📄' },
  { href: '/dashboard/financeiro', label: 'Financeiro', icon: '💰' },
]

export default function DashboardHome() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [cub, setCub] = useState<Cub | null>(null)
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<Insights | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsErro, setInsightsErro] = useState('')

  const gerarInsights = useCallback(async () => {
    setInsightsLoading(true); setInsightsErro('')
    try {
      const res = await fetch('/api/admin/insights')
      const data = await res.json()
      if (!res.ok) { setInsightsErro(data.erro || 'Nao foi possivel gerar insights agora.'); return }
      setInsights(data)
    } catch {
      setInsightsErro('Falha ao conectar com o servico de insights.')
    } finally {
      setInsightsLoading(false)
    }
  }, [])

  const load = useCallback(async () => {
    try {
      const [lRes, cRes] = await Promise.all([
        fetch('/api/admin/leads').then(r => r.json()),
        fetch('/api/admin/cub').then(r => r.json()).catch(() => ({})),
      ])
      setLeads(Array.isArray(lRes) ? lRes : (lRes.data ?? []))
      setCub(cRes.vigente ?? null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const total = leads.length
  const quentes = leads.filter(l => l.temperatura === 3).length
  const negociacao = leads.filter(l => l.estagio_funil === 'negociacao').length
  const fechados = leads.filter(l => l.estagio_funil === 'fechado').length
  const atencao = leads.filter(l => l.requer_atencao).length
  const pipeline = leads
    .filter(l => l.estagio_funil !== 'fechado')
    .reduce((s, l) => s + (l.orcamento_max ?? 0), 0)

  const KPIS = [
    { l: 'Total de Leads', v: String(total), cor: D.blue },
    { l: 'Leads Quentes', v: String(quentes), cor: D.red },
    { l: 'Em Negociação', v: String(negociacao), cor: D.bronze },
    { l: 'Fechados', v: String(fechados), cor: D.green },
    { l: 'Requer Atenção', v: String(atencao), cor: '#f59e0b' },
    { l: 'Pipeline Estimado', v: fmt(pipeline), cor: D.ink },
  ]

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(20px,2.5vw,36px) clamp(16px,3vw,32px)' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, margin: 0, color: D.ink }}>Painel · SA Imóveis</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: D.muted }}>Visão geral da sua operação de vendas.</p>
        </div>

        <div style={{ background: D.sidebar, borderRadius: 12, padding: '16px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: D.onDarkMuted, marginBottom: 4 }}>CUB/SC Vigente · SINDUSCON-SC</div>
            <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: D.bronze }}>
              {cub ? fmt(cub.valor_m2) + '/m²' : (loading ? '—' : 'Sem CUB cadastrado')}
            </div>
          </div>
          <button onClick={() => router.push('/dashboard/crm')}
            style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Ir para o CRM
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 28 }}>
          {KPIS.map(({ l, v, cor }) => (
            <div key={l} style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '16px 18px', borderTop: '3px solid ' + cor }}>
              <div style={{ fontSize: 11, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{l}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 26, fontWeight: 800, color: cor }}>{loading ? '—' : v}</div>
            </div>
          ))}
        </div>

        <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 16, fontWeight: 700, margin: 0, color: D.ink }}>Funil de Vendas</h2>
            <button onClick={() => router.push('/dashboard/crm')} style={{ background: 'none', border: 'none', color: D.bronze, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Ver Kanban</button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ESTAGIOS.map(e => {
              const n = leads.filter(l => l.estagio_funil === e.key).length
              return (
                <div key={e.key} onClick={() => router.push('/dashboard/crm')}
                  style={{ flex: '1 1 130px', minWidth: 120, background: D.bg, borderRadius: 10, padding: '12px 14px', borderLeft: '3px solid ' + e.cor, cursor: 'pointer' }}>
                  <div style={{ fontSize: 12, color: D.muted, marginBottom: 6 }}>{e.label}</div>
                  <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 22, fontWeight: 800, color: e.cor }}>{loading ? '—' : n}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: insights || insightsErro ? 16 : 0, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 16, fontWeight: 700, margin: 0, color: D.ink }}>Insights de IA</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: D.muted }}>Análise executiva do pipeline gerada sob demanda.</p>
            </div>
            <button onClick={gerarInsights} disabled={insightsLoading}
              style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 13, cursor: insightsLoading ? 'default' : 'pointer', opacity: insightsLoading ? 0.6 : 1, whiteSpace: 'nowrap' }}>
              {insightsLoading ? 'Gerando...' : (insights ? 'Gerar novamente' : 'Gerar análise')}
            </button>
          </div>
          {insightsErro && <p style={{ margin: 0, fontSize: 13, color: D.red }}>{insightsErro}</p>}
          {insights && (
            <div>
              {insights.resumo && (
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14, fontSize: 12, color: D.muted }}>
                  <span>Total: <strong style={{ color: D.ink }}>{insights.resumo.total}</strong></span>
                  <span>Score médio: <strong style={{ color: D.ink }}>{insights.resumo.score_medio}/100</strong></span>
                  <span>Requer atenção: <strong style={{ color: D.ink }}>{insights.resumo.requer_atencao}</strong></span>
                </div>
              )}
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: D.ink, whiteSpace: 'pre-wrap' }}>{insights.insights}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
          {ATALHOS.map(a => (
            <button key={a.href} onClick={() => router.push(a.href)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '16px 18px', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: D.ink }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
