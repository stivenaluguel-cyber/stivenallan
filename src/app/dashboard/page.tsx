import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ESTAGIOS = [
  { key: 'primeiro_contato', label: 'Novo Contato', cor: '#6b7280' },
  { key: 'qualificado', label: 'Qualificado', cor: '#3b82f6' },
  { key: 'interessado', label: 'Interessado', cor: '#8b5cf6' },
  { key: 'proposta_enviada', label: 'Proposta Enviada', cor: '#f59e0b' },
  { key: 'visita_agendada', label: 'Visita Agendada', cor: '#ec4899' },
  { key: 'negociacao', label: 'Em Negociação', cor: '#D24E22' },
  { key: 'fechado', label: 'Fechado', cor: '#22c55e' },
]

async function getLeads() {
  const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(200)
  return data ?? []
}

async function getStats() {
  const { data: leads } = await supabase.from('leads').select('lead_score, estagio_funil, requer_atencao, created_at')
  const total = leads?.length ?? 0
  const atencao = leads?.filter((l: any) => l.requer_atencao).length ?? 0
  const scoreMedia = leads?.length ? Math.round((leads as any[]).reduce((acc: number, l: any) => acc + (l.lead_score ?? 0), 0) / leads.length) : 0
  const fechados = leads?.filter((l: any) => l.estagio_funil === 'fechado').length ?? 0
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const novosHoje = leads?.filter((l: any) => new Date(l.created_at) >= hoje).length ?? 0
  return { total, atencao, scoreMedia, fechados, novosHoje }
}

async function getInsights() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://stivenallan.vercel.app'
    const res = await fetch(baseUrl + '/api/insights', { cache: 'no-store' })
    if (res.ok) return res.json()
  } catch {}
  return null
}

async function getEmpreendimentos() {
  const { data } = await supabase.from('empreendimentos').select('id, nome, status_venda, status_obra').eq('status_venda', 'ativo').limit(20)
  return data ?? []
}

export default async function DashboardPage() {
  const [leads, stats, insights, empreendimentos] = await Promise.all([getLeads(), getStats(), getInsights(), getEmpreendimentos()])
  const leadsByEstagio = ESTAGIOS.map(e => ({ ...e, leads: (leads as any[]).filter((l: any) => l.estagio_funil === e.key) }))

  const D = {
    bg: '#F3F2EE', surface: '#FAFAF7', sidebar: '#131211', ink: '#161512',
    bronze: '#D24E22', orange: '#FF6A3D', muted: '#6B655B',
    line: 'rgba(26,24,21,0.08)', lineDark: 'rgba(245,241,234,0.14)',
    onDark: '#F3F2EE', onDarkMuted: 'rgba(245,241,234,0.65)',
  }

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>

      <div style={{ padding: 'clamp(20px,3vw,32px)', maxWidth: 1600, margin: '0 auto' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Leads', value: stats.total, cor: '#3b82f6' },
            { label: 'Novos Hoje', value: stats.novosHoje, cor: '#22c55e' },
            { label: 'Precisam Atenção', value: stats.atencao, cor: '#D24E22' },
            { label: 'Score Médio', value: stats.scoreMedia + '/100', cor: '#f59e0b' },
            { label: 'Fechados', value: stats.fechados, cor: '#8b5cf6' },
          ].map((s, i) => (
            <div key={i} style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 3, padding: '18px 20px', borderTop: `3px solid ${s.cor}` }}>
              <div style={{ fontSize: 11, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque',system-ui,sans-serif", fontSize: 28, fontWeight: 800, color: s.cor, letterSpacing: '-0.02em' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* EMPREENDIMENTOS ATIVOS */}
        {empreendimentos.length > 0 && (
          <div style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 3, padding: '14px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: D.bronze }}>Empreendimentos Ativos ({empreendimentos.length})</span>
              <a href="/dashboard/empreendimentos" style={{ color: D.bronze, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>Ver todos →</a>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {(empreendimentos as any[]).map((emp: any) => (
                <a key={emp.id} href={`/dashboard/empreendimentos/${emp.id}/editar`} style={{ background: D.bg, border: `1px solid ${D.line}`, borderRadius: 2, padding: '7px 14px', textDecoration: 'none', color: D.ink, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{emp.nome}</span>
                  <span style={{ color: D.muted, marginLeft: 8, fontSize: 11 }}>{emp.status_obra?.replace(/_/g,' ')}</span>
                </a>
              ))}
              <a href="/dashboard/empreendimentos/novo" style={{ background: 'transparent', border: `1px dashed ${D.bronze}`, borderRadius: 2, padding: '7px 14px', textDecoration: 'none', color: D.bronze, fontSize: 13, fontWeight: 600 }}>+ Novo</a>
            </div>
          </div>
        )}

        {/* KANBAN + SIDEBAR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

          {/* KANBAN */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontFamily: "'Bricolage Grotesque',system-ui,sans-serif", fontSize: 16, fontWeight: 700, color: D.ink }}>Pipeline de Leads</div>
              <a href="/dashboard/crm" style={{ color: D.bronze, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Ver CRM completo →</a>
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 12 }}>
              {leadsByEstagio.map(col => (
                <div key={col.key} style={{ minWidth: 200, flex: '0 0 200px' }}>
                  <div style={{ background: D.surface, borderRadius: 3, border: `1px solid ${D.line}`, overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', background: col.cor + '18', borderBottom: `2px solid ${col.cor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: col.cor }}>{col.label}</span>
                      <span style={{ background: col.cor, color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{col.leads.length}</span>
                    </div>
                    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 500, overflowY: 'auto' }}>
                      {col.leads.length === 0 ? (
                        <div style={{ textAlign: 'center', color: D.muted, fontSize: 12, padding: '16px 0' }}>Vazio</div>
                      ) : col.leads.map((lead: any) => (
                        <div key={lead.id} style={{ background: D.bg, borderRadius: 2, padding: '9px 11px', border: lead.requer_atencao ? `1px solid ${D.bronze}` : `1px solid ${D.line}` }}>
                          {lead.requer_atencao && <div style={{ fontSize: 10, color: D.bronze, fontWeight: 700, marginBottom: 3 }}>ATENÇÃO</div>}
                          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: D.ink }}>{lead.nome ?? '+' + lead.whatsapp}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: D.muted }}>{lead.perfil !== 'indefinido' ? lead.perfil : lead.origem}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: lead.lead_score >= 60 ? '#22c55e' : lead.lead_score >= 30 ? '#f59e0b' : D.muted }}>{lead.lead_score ?? 0}pts</span>
                          </div>
                          {lead.orcamento_max && <div style={{ fontSize: 10, color: D.muted, marginTop: 3 }}>R$ {Number(lead.orcamento_max).toLocaleString('pt-BR')}</div>}
                          <a href={'https://wa.me/' + lead.whatsapp} target='_blank' style={{ display: 'block', marginTop: 8, background: '#25d366', color: '#fff', borderRadius: 2, padding: '4px 8px', fontSize: 11, textAlign: 'center', textDecoration: 'none', fontWeight: 700 }}>WhatsApp</a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ATENCAO */}
            <div style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 3 }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.line}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: D.ink }}>Precisam de Atenção</span>
                {stats.atencao > 0 && <span style={{ background: D.bronze, color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 700, marginLeft: 'auto' }}>{stats.atencao}</span>}
              </div>
              <div style={{ padding: 10, maxHeight: 260, overflowY: 'auto' }}>
                {(leads as any[]).filter((l: any) => l.requer_atencao).length === 0 ? (
                  <div style={{ color: D.muted, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Nenhum no momento</div>
                ) : (leads as any[]).filter((l: any) => l.requer_atencao).map((lead: any) => (
                  <div key={lead.id} style={{ background: D.bg, border: `1px solid ${D.bronze}22`, borderRadius: 2, padding: '9px', marginBottom: 7 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: D.ink }}>{lead.nome ?? '+' + lead.whatsapp}</div>
                    <div style={{ fontSize: 11, color: D.bronze, marginTop: 3 }}>{lead.motivacao ?? lead.estagio_funil}</div>
                    <a href={'https://wa.me/' + lead.whatsapp} target='_blank' style={{ display: 'inline-block', marginTop: 7, background: D.bronze, color: '#fff', borderRadius: 2, padding: '4px 10px', fontSize: 11, textDecoration: 'none', fontWeight: 700 }}>Atender agora</a>
                  </div>
                ))}
              </div>
            </div>

            {/* INSIGHTS IA */}
            <div style={{ background: D.sidebar, borderRadius: 3 }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.lineDark}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: D.onDark }}>Insights da IA</span>
                <span style={{ fontSize: 10, color: D.bronze, marginLeft: 'auto', fontWeight: 700, letterSpacing: '0.05em' }}>GROQ</span>
              </div>
              <div style={{ padding: 16 }}>
                {insights ? (
                  <div style={{ fontSize: 13, color: D.onDarkMuted, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{insights.texto}</div>
                ) : (
                  <div style={{ color: D.onDarkMuted, fontSize: 13 }}>Analisando pipeline...</div>
                )}
              </div>
            </div>

            {/* TOP LEADS */}
            <div style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 3 }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.line}` }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: D.ink }}>Top Leads por Score</span>
              </div>
              <div style={{ padding: '0 12px' }}>
                {(leads as any[]).sort((a: any, b: any) => (b.lead_score ?? 0) - (a.lead_score ?? 0)).slice(0, 5).map((lead: any, i: number) => (
                  <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < 4 ? `1px solid ${D.line}` : 'none' }}>
                    <div style={{ width: 26, height: 26, background: i === 0 ? D.bronze : D.bg, border: `1px solid ${D.line}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i === 0 ? '#fff' : D.muted, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: D.ink }}>{lead.nome ?? '+' + lead.whatsapp}</div>
                      <div style={{ fontSize: 11, color: D.muted }}>{lead.estagio_funil?.replace(/_/g,' ')}</div>
                    </div>
                    <div style={{ fontFamily: "'Bricolage Grotesque',system-ui,sans-serif", fontSize: 16, fontWeight: 800, color: D.bronze, flexShrink: 0 }}>{lead.lead_score ?? 0}</div>
                  </div>
                ))}
                {leads.length === 0 && <div style={{ color: D.muted, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Nenhum lead ainda</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
      }
