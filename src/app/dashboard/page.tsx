'use client'
import { useState, useEffect, useCallback } from 'react'
import { competenciaDoMes } from '@/lib/unidades/tabela-precos'
import { useRouter } from 'next/navigation'
import { ESTAGIOS_FUNIL as ESTAGIOS } from '@/lib/dashboard/estagios'
import { MetasDiarias } from '@/components/dashboard/MetasDiarias'
import { CalendarioMetas } from '@/components/dashboard/CalendarioMetas'
import { ProjecaoMeta } from '@/components/dashboard/ProjecaoMeta'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', sidebar: '#131211', ink: '#161512',
  bronze: '#D24E22', muted: '#6B655B', line: 'rgba(26,24,21,0.08)',
  green: '#22c55e', red: '#ef4444', blue: '#3b82f6', amber: '#f59e0b',
  onDark: '#F3F2EE', onDarkMuted: 'rgba(245,241,234,0.65)',
}
const fmt = (n: number) => 'R$\u00a0' + Math.round(n).toLocaleString('pt-BR')

/**
 * CUB com os centavos.
 *
 * `fmt` arredonda para o real inteiro, o que serve para VGV e pipeline mas
 * mente no CUB: R$ 3.121,62/m² virava "R$ 3.122". Não é detalhe estético — o
 * CUB multiplica a quantidade de CUBs de cada unidade (o Pineto vai de 210 a
 * 264), então 38 centavos de erro viram até R$ 100 de diferença no valor do
 * apartamento. É um índice publicado, tem que aparecer como o Sinduscon publica.
 */
const fmtCub = (n: number) =>
  'R$\u00a0' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })


type Lead = {
  id: string; nome?: string; whatsapp: string; estagio_funil: string
  lead_score?: number; requer_atencao?: boolean; temperatura?: number
  orcamento_max?: number; origem?: string; created_at?: string
}
type Cub = { valor_m2: number; mes_referencia: string; variacao_mensal?: number }
type Insights = { insights: string; resumo?: { score_medio: number; requer_atencao: number; total: number } }
type ResumoComissoes = { previsto: number; confirmado: number; recebido: number; totalVendas: number; quantidade: number }
// Scraping do Sinduscon usado no site público (/indicadores e home) — distinto
// do CUB/SC acima (configuracoes_cub, mantido manualmente pra correção de
// contrato). online:false significa que o scraping falhou e a página pública
// está mostrando um valor de fallback (pode estar desatualizado).
type CubScraper = { valor_m2: number; usar_em_label: string; online: boolean }

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
  const [cubScraper, setCubScraper] = useState<CubScraper | null>(null)
  // Quantos empreendimentos ativos estão sem a tabela deste mês guardada.
  const [semTabela, setSemTabela] = useState(0)
  const [loading, setLoading] = useState(true)
  const [comissoes, setComissoes] = useState<ResumoComissoes | null>(null)
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
      const [lRes, cRes, cubScraperRes, comissoesRes] = await Promise.all([
        fetch('/api/admin/leads').then(r => r.json()),
        fetch('/api/admin/cub').then(r => r.json()).catch(() => ({})),
        fetch('/api/cub').then(r => r.json()).catch(() => null),
        fetch('/api/admin/comissoes').then(r => r.json()).catch(() => null),
      ])
      setLeads(Array.isArray(lRes) ? lRes : (lRes.data ?? []))
      setCub(cRes.vigente ?? null)
      setCubScraper(cubScraperRes)
      setComissoes(comissoesRes?.resumo ?? null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // O aviso mora aqui porque é a tela onde ele entra. Descobrir que a tabela
  // sumiu na hora de precisar dela é tarde: a construtora já apagou.
  useEffect(() => {
    Promise.all([
      fetch('/api/admin/empreendimentos').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/empreendimentos/tabela').then(r => r.ok ? r.json() : null),
    ]).then(([emps, tabs]) => {
      if (!emps?.data) return
      const mes = competenciaDoMes(new Date())
      const porSlug: Record<string, string> = tabs?.recentePorSlug ?? {}
      setSemTabela(emps.data.filter((e: { slug: string; status_venda?: string }) =>
        (e.status_venda ?? 'ativo') === 'ativo' && (porSlug[e.slug] ?? '') < mes,
      ).length)
    }).catch(() => {})
  }, [])

  const total = leads.length
  const quentes = leads.filter(l => l.temperatura === 3).length
  const negociacao = leads.filter(l => l.estagio_funil === 'negociacao').length
  const fechados = leads.filter(l => l.estagio_funil === 'fechado').length
  const atencao = leads.filter(l => l.requer_atencao).length
  const pipeline = leads
    .filter(l => l.estagio_funil !== 'fechado')
    .reduce((s, l) => s + (l.orcamento_max ?? 0), 0)

  // "A receber" junta prevista + confirmada (ainda não caiu na conta, mas já
  // é esperado); "recebida" é o que já entrou de fato. Mesmos três status de
  // src/lib/comissoes/calcular.ts, só reagrupados pro headline da home —
  // antes esses números só apareciam enterrados em /dashboard/comissoes.
  const comissaoAReceber = (comissoes?.previsto ?? 0) + (comissoes?.confirmado ?? 0)
  const comissaoRecebida = comissoes?.recebido ?? 0

  const KPIS = [
    { l: 'Total de Leads', v: String(total), cor: D.blue, href: '/dashboard/crm' },
    { l: 'Leads Quentes', v: String(quentes), cor: D.red, href: '/dashboard/crm' },
    { l: 'Em Negociação', v: String(negociacao), cor: D.bronze, href: '/dashboard/crm' },
    { l: 'Fechados', v: String(fechados), cor: D.green, href: '/dashboard/crm' },
    { l: 'Requer Atenção', v: String(atencao), cor: '#f59e0b', href: '/dashboard/crm/foco' },
    { l: 'Pipeline Estimado', v: fmt(pipeline), cor: D.ink, href: '/dashboard/crm' },
    { l: 'Comissão a Receber', v: fmt(comissaoAReceber), cor: D.amber, href: '/dashboard/comissoes' },
    { l: 'Comissão Recebida', v: fmt(comissaoRecebida), cor: D.green, href: '/dashboard/comissoes' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(20px,2.5vw,36px) clamp(16px,3vw,32px)' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, margin: 0, color: D.ink }}>Painel · SA Imóveis</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: D.muted }}>Visão geral da sua operação de vendas.</p>
        </div>

        <MetasDiarias />

        <div style={{ marginBottom: 24 }}>
          <CalendarioMetas />
        </div>

        <ProjecaoMeta />

        {semTabela > 0 && (
          <div style={{ background: '#FEF3C7', border: '1px solid #F5C542', borderRadius: 10, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#8A5A00' }}>
                {semTabela} empreendimento{semTabela !== 1 ? 's' : ''} sem a tabela deste mês guardada
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8A5A00', lineHeight: 1.5 }}>
                A construtora tira o PDF do Drive sem avisar. Guarde uma cópia em{' '}
                <a href="/dashboard/empreendimentos" style={{ color: '#8A5A00', textDecoration: 'underline', fontWeight: 600 }}>Empreendimentos</a>.
              </p>
            </div>
          </div>
        )}

        {cubScraper && !cubScraper.online && (
          <div style={{ background: '#FEF3C7', border: '1px solid #F5C542', borderRadius: 10, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#8A5A00' }}>CUB/SC do site público pode estar desatualizado</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8A5A00', lineHeight: 1.5, overflowWrap: 'break-word' }}>
                O scraping automático do Sinduscon (usado em /indicadores e na home) falhou nesta checagem. O site está mostrando um valor de fallback ({fmtCub(cubScraper.valor_m2)}/m², ref. {cubScraper.usar_em_label}) — confira manualmente em{' '}
                <a href="https://sinduscon-fpolis.org.br/" target="_blank" rel="noopener noreferrer" style={{ color: '#8A5A00', textDecoration: 'underline' }}>sinduscon-fpolis.org.br</a>.
              </p>
            </div>
          </div>
        )}

        <div style={{ background: D.sidebar, borderRadius: 12, padding: '16px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: D.onDarkMuted, marginBottom: 4 }}>CUB/SC Vigente · SINDUSCON-SC</div>
            <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: D.bronze }}>
              {cub ? fmtCub(cub.valor_m2) + '/m²' : (loading ? '—' : 'Sem CUB cadastrado')}
            </div>
          </div>
          <button onClick={() => router.push('/dashboard/crm')}
            style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Ir para o CRM
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 28 }}>
          {KPIS.map(({ l, v, cor, href }) => (
            <button key={l} onClick={() => router.push(href)} style={{ textAlign: 'left', background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '16px 18px', borderTop: '3px solid ' + cor, cursor: 'pointer' }}>
              <div style={{ fontSize: 11, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{l}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 26, fontWeight: 800, color: cor }}>{loading ? '—' : v}</div>
            </button>
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
