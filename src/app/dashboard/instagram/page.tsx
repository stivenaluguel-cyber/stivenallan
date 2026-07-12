import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { METAS_INSTAGRAM } from '@/lib/dashboard/instagram-metas'
import { InstagramWeeklyForm } from '@/lib/dashboard/instagram-weekly-form'
import { InstagramAlerts, type AlertaRow } from '@/lib/dashboard/instagram-alerts'
import type { WeeklyMetric } from '@/lib/dashboard/instagram-gates'

export const dynamic = 'force-dynamic'

const T = {
  bronze: '#D24E22',
  dark: '#131211',
  cream: '#F3F2EE',
  ink: '#1a1a1a',
  mutedInk: '#71717a',
  border: '#e4e4e7',
}

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function isMissingTable(err: { code?: string; message?: string }): boolean {
  if (err.code === '42P01') return true
  return /does not exist|not found/i.test(err.message ?? '')
}

async function fetchOverview() {
  const supabase = sb()
  if (!supabase) return { kind: 'error' as const, message: 'Configuração Supabase incompleta.' }

  const [metricasRes, alertasRes] = await Promise.all([
    supabase.from('ig_metricas_semanais').select('*').order('semana_inicio', { ascending: false }).limit(12),
    supabase
      .from('crm_notificacoes')
      .select('id, titulo, corpo, metadata, created_at')
      .eq('tipo', 'instagram_gate')
      .eq('lida', false)
      .order('created_at', { ascending: false }),
  ])

  if (metricasRes.error) {
    if (isMissingTable(metricasRes.error)) return { kind: 'missing_table' as const }
    return { kind: 'error' as const, message: metricasRes.error.message }
  }

  return {
    kind: 'ok' as const,
    semanas: (metricasRes.data ?? []) as (WeeklyMetric & { id: string })[],
    alertas: (alertasRes.data ?? []) as AlertaRow[],
  }
}

export default async function InstagramOverviewPage() {
  const result = await fetchOverview()

  if (result.kind === 'missing_table') {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ padding: 16, border: `1px solid ${T.border}`, borderRadius: 10, background: '#fff', color: T.mutedInk, fontSize: 13.5 }}>
          Tabelas do Instagram ainda não existem no banco — rode a migração <code>0008_instagram_growth.sql</code>.
        </div>
      </div>
    )
  }
  if (result.kind === 'error') {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ padding: 16, border: '1px solid #fecaca', borderRadius: 10, background: '#fef2f2', color: '#991b1b', fontSize: 13.5 }}>
          Erro ao carregar dados: {result.message}
        </div>
      </div>
    )
  }

  const { semanas, alertas } = result
  const ultima = semanas[0] ?? null

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: T.ink, margin: 0 }}>Instagram — @stivenallan.ofc</h1>
          <p style={{ fontSize: 13, color: T.mutedInk, margin: '4px 0 0' }}>
            Metas 30/60/90 dias, snapshot semanal e gatilhos de decisão do plano de growth.
          </p>
        </div>
        <Link
          href="/dashboard/instagram/calendario"
          style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: T.bronze, padding: '9px 16px', borderRadius: 8, textDecoration: 'none' }}
        >
          Ver calendário de conteúdo
        </Link>
      </div>

      <section>
        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.mutedInk, marginBottom: 10 }}>
          Gatilhos ativos
        </h2>
        <InstagramAlerts alertas={alertas} />
      </section>

      <section>
        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.mutedInk, marginBottom: 10 }}>
          Snapshot da semana
        </h2>
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 18, background: '#fff' }}>
          <InstagramWeeklyForm ultimaSemana={ultima} />
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.mutedInk, marginBottom: 10 }}>
          Metas 30 / 60 / 90 dias
        </h2>
        <div style={{ overflowX: 'auto', border: `1px solid ${T.border}`, borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: T.cream }}>
                {['Métrica', 'Baseline', '30 dias', '60 dias', '90 dias'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '9px 12px', fontWeight: 700, color: T.mutedInk, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METAS_INSTAGRAM.map((m) => (
                <tr key={m.metrica} style={{ borderTop: `1px solid ${T.border}` }}>
                  <td style={{ padding: '9px 12px', fontWeight: 600, color: T.ink }}>{m.metrica}</td>
                  <td style={{ padding: '9px 12px', color: T.mutedInk }}>{m.baseline}</td>
                  <td style={{ padding: '9px 12px', color: T.ink }}>{m.meta30}</td>
                  <td style={{ padding: '9px 12px', color: T.ink }}>{m.meta60}</td>
                  <td style={{ padding: '9px 12px', color: T.ink }}>{m.meta90}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.mutedInk, marginBottom: 10 }}>
          Histórico semanal
        </h2>
        {semanas.length === 0 ? (
          <div style={{ padding: 16, border: `1px solid ${T.border}`, borderRadius: 10, color: T.mutedInk, fontSize: 13 }}>
            Nenhum snapshot registrado ainda.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', border: `1px solid ${T.border}`, borderRadius: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: T.cream }}>
                  {['Semana', 'Seguidores', 'Novos', '% locais', 'Alcance', 'Engaj.', 'Visitas perfil', 'Cliques bio', 'Leads'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '9px 12px', fontWeight: 700, color: T.mutedInk, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {semanas.map((s) => {
                  const pctLocal =
                    s.novos_seguidores && s.novos_seguidores > 0 && s.novos_seguidores_locais != null
                      ? `${Math.round((s.novos_seguidores_locais / s.novos_seguidores) * 100)}%`
                      : '—'
                  return (
                    <tr key={s.semana_inicio} style={{ borderTop: `1px solid ${T.border}` }}>
                      <td style={{ padding: '9px 12px', fontWeight: 600, color: T.ink, whiteSpace: 'nowrap' }}>{s.semana_inicio}</td>
                      <td style={{ padding: '9px 12px' }}>{s.seguidores ?? '—'}</td>
                      <td style={{ padding: '9px 12px' }}>{s.novos_seguidores ?? '—'}</td>
                      <td style={{ padding: '9px 12px' }}>{pctLocal}</td>
                      <td style={{ padding: '9px 12px' }}>{s.alcance ?? '—'}</td>
                      <td style={{ padding: '9px 12px' }}>{s.taxa_engajamento != null ? `${s.taxa_engajamento}%` : '—'}</td>
                      <td style={{ padding: '9px 12px' }}>{s.visitas_perfil ?? '—'}</td>
                      <td style={{ padding: '9px 12px' }}>{s.cliques_bio ?? '—'}</td>
                      <td style={{ padding: '9px 12px' }}>{s.leads_qualificados ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
