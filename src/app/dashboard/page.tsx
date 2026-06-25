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
  { key: 'negociacao', label: 'Em Negociação', cor: '#ef4444' },
  { key: 'fechado', label: 'Fechado', cor: '#10b981' },
]

async function getLeads() {
  const { data } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  return data ?? []
}

async function getStats() {
  const { data: leads } = await supabase.from('leads').select('lead_score, estagio_funil, requer_atencao, created_at')
  const total = leads?.length ?? 0
  const atencao = leads?.filter((l: any) => l.requer_atencao).length ?? 0
  const scoreMedia = leads?.length ? Math.round((leads as any[]).reduce((acc: number, l: any) => acc + (l.lead_score ?? 0), 0) / leads.length) : 0
  const fechados = leads?.filter((l: any) => l.estagio_funil === 'fechado').length ?? 0
  const hoje = new Date(); hoje.setHours(0,0,0,0)
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

export default async function DashboardPage() {
  const [leads, stats, insights] = await Promise.all([getLeads(), getStats(), getInsights()])
  const leadsByEstagio = ESTAGIOS.map(e => ({
    ...e,
    leads: (leads as any[]).filter((l: any) => l.estagio_funil === e.key)
  }))

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', padding: '0' }}>
      {/* Header */}
      <div style={{ background: '#1a1d27', borderBottom: '1px solid #2d3748', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#c9a24b,#f0c060)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#000' }}>S</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Stiven Allan CRM</div>
            <div style={{ fontSize: 12, color: '#718096' }}>CRECI/RS 60.275</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#718096' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 1800, margin: '0 auto' }}>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Leads', value: stats.total, icon: '👥', cor: '#3b82f6' },
            { label: 'Novos Hoje', value: stats.novosHoje, icon: '🆕', cor: '#10b981' },
            { label: 'Precisam Atenção', value: stats.atencao, icon: '🔥', cor: '#ef4444' },
            { label: 'Score Médio', value: stats.scoreMedia + '/100', icon: '⭐', cor: '#c9a24b' },
            { label: 'Fechados', value: stats.fechados, icon: '✅', cor: '#8b5cf6' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#1a1d27', border: '1px solid #2d3748', borderRadius: 12, padding: '20px', borderTop: '3px solid ' + s.cor }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#718096', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.cor }}>{s.value}</div>
                </div>
                <div style={{ fontSize: 28 }}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Layout Principal: Kanban + Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

          {/* KANBAN PIPELINE */}
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#f0c060' }}>Pipeline de Leads</div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
              {leadsByEstagio.map(col => (
                <div key={col.key} style={{ minWidth: 220, flex: '0 0 220px' }}>
                  <div style={{ background: '#1a1d27', borderRadius: 10, border: '1px solid #2d3748', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 14px', background: col.cor + '22', borderBottom: '2px solid ' + col.cor, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: col.cor }}>{col.label}</span>
                      <span style={{ background: col.cor, color: '#fff', borderRadius: 12, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{col.leads.length}</span>
                    </div>
                    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 520, overflowY: 'auto' }}>
                      {col.leads.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#4a5568', fontSize: 12, padding: '20px 0' }}>Vazio</div>
                      ) : col.leads.map((lead: any) => (
                        <div key={lead.id} style={{ background: '#0f1117', borderRadius: 8, padding: '10px 12px', border: lead.requer_atencao ? '1px solid #ef4444' : '1px solid #2d3748' }}>
                          {lead.requer_atencao && <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 700, marginBottom: 4 }}>🔥 ATENÇÃO NECESSÁRIA</div>}
                          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{lead.nome ?? '+' + lead.whatsapp}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: '#718096' }}>
                              {lead.perfil !== 'indefinido' ? lead.perfil : lead.origem}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: lead.lead_score >= 60 ? '#10b981' : lead.lead_score >= 30 ? '#f59e0b' : '#6b7280' }}>
                              {lead.lead_score ?? 0}pts
                            </span>
                          </div>
                          {lead.orcamento_max && <div style={{ fontSize: 10, color: '#718096', marginTop: 4 }}>R$ {Number(lead.orcamento_max).toLocaleString('pt-BR')}</div>}
                          {lead.ultimo_contato && <div style={{ fontSize: 10, color: '#4a5568', marginTop: 2 }}>Último: {new Date(lead.ultimo_contato).toLocaleDateString('pt-BR')}</div>}
                          <a href={'https://wa.me/' + lead.whatsapp} target='_blank' style={{ display: 'block', marginTop: 8, background: '#25d366', color: '#fff', borderRadius: 6, padding: '4px 8px', fontSize: 11, textAlign: 'center', textDecoration: 'none', fontWeight: 600 }}>WhatsApp</a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR: Insights + Atenção */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Leads que precisam de atenção */}
            <div style={{ background: '#1a1d27', border: '1px solid #2d3748', borderRadius: 12 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #2d3748', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🔥</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Precisam de Atenção</span>
                {stats.atencao > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '2px 7px', fontSize: 11, fontWeight: 700, marginLeft: 'auto' }}>{stats.atencao}</span>}
              </div>
              <div style={{ padding: 12, maxHeight: 280, overflowY: 'auto' }}>
                {(leads as any[]).filter((l: any) => l.requer_atencao).length === 0 ? (
                  <div style={{ color: '#4a5568', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Nenhum no momento ✓</div>
                ) : (leads as any[]).filter((l: any) => l.requer_atencao).map((lead: any) => (
                  <div key={lead.id} style={{ background: '#0f1117', border: '1px solid #ef444466', borderRadius: 8, padding: '10px', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.nome ?? '+' + lead.whatsapp}</div>
                    <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{lead.motivacao ?? lead.estagio_funil}</div>
                    <a href={'https://wa.me/' + lead.whatsapp} target='_blank' style={{ display: 'inline-block', marginTop: 8, background: '#ef4444', color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, textDecoration: 'none', fontWeight: 600 }}>Atender agora</a>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights IA */}
            <div style={{ background: 'linear-gradient(135deg, #1a1d27, #1e1b2e)', border: '1px solid #c9a24b44', borderRadius: 12 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #2d3748', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>✨</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Insights da IA</span>
                <span style={{ fontSize: 10, color: '#c9a24b', marginLeft: 'auto', fontWeight: 600 }}>Claude API</span>
              </div>
              <div style={{ padding: '16px' }}>
                {insights ? (
                  <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{insights.texto}</div>
                ) : (
                  <div style={{ color: '#718096', fontSize: 13 }}>
                    <div style={{ marginBottom: 8 }}>Configure ANTHROPIC_API_KEY nas env vars do Vercel para ativar insights com Claude.</div>
                    <div style={{ color: '#4a5568', fontSize: 12 }}>Os insights analisam o pipeline completo e sugerem ações prioritárias.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Leads por Score */}
            <div style={{ background: '#1a1d27', border: '1px solid #2d3748', borderRadius: 12 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #2d3748' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>⭐ Top Leads por Score</span>
              </div>
              <div style={{ padding: 12 }}>
                {(leads as any[]).sort((a: any, b: any) => (b.lead_score ?? 0) - (a.lead_score ?? 0)).slice(0, 5).map((lead: any, i: number) => (
                  <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 4 ? '1px solid #1a2030' : 'none' }}>
                    <div style={{ width: 26, height: 26, background: i === 0 ? '#c9a24b' : '#2d3748', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i === 0 ? '#000' : '#718096', flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.nome ?? '+' + lead.whatsapp}</div>
                      <div style={{ fontSize: 11, color: '#718096' }}>{lead.estagio_funil?.replace(/_/g, ' ')}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#c9a24b', flexShrink: 0 }}>{lead.lead_score ?? 0}</div>
                  </div>
                ))}
                {leads.length === 0 && <div style={{ color: '#4a5568', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Nenhum lead ainda</div>}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
