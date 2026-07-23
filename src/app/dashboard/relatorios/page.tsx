import { createClient } from '@supabase/supabase-js'
import {
  snapshotPorEstagio,
  tempoMedioPorEstagio,
  type LeadStageRow,
  type StageTransitionRow,
} from '@/lib/dashboard/funil-stats'
import { FunilChart } from '@/lib/dashboard/funil-chart'

export const dynamic = 'force-dynamic'

// Paleta consistente com o resto do dashboard (mesmo padrão de dashboard/cron/page.tsx)
const T = {
  bronze: '#D24E22',
  bronzeSoft: 'rgba(210,78,34,0.08)',
  cream: '#F3F2EE',
  ink: '#1a1a1a',
  mutedInk: '#71717a',
  border: '#e4e4e7',
} as const

async function fetchDados(): Promise<
  | { kind: 'error'; message: string }
  | { kind: 'ok'; leads: LeadStageRow[]; transicoes: StageTransitionRow[] }
> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { kind: 'error', message: 'Configuração Supabase incompleta.' }

  const supabase = createClient(url, key)
  const [{ data: leads, error: leadsErr }, { data: transicoes, error: transErr }] = await Promise.all([
    supabase.from('leads').select('id, estagio_funil'),
    supabase
      .from('leads_interacoes')
      .select('lead_id, estagio_de, estagio_para, created_at')
      .not('estagio_para', 'is', null)
      .order('created_at', { ascending: true }),
  ])

  if (leadsErr) return { kind: 'error', message: leadsErr.message }
  if (transErr) return { kind: 'error', message: transErr.message }

  return {
    kind: 'ok',
    leads: (leads ?? []) as LeadStageRow[],
    transicoes: (transicoes ?? []) as StageTransitionRow[],
  }
}

export default async function RelatoriosPage() {
  const result = await fetchDados()

  return (
    <div style={{ padding: '32px clamp(16px,4vw,40px)', background: '#fff', minHeight: '100vh' }}>
      <header style={{ maxWidth: 1200, margin: '0 auto 28px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: T.ink, margin: 0 }}>Relatório de conversão por etapa</h1>
        <p style={{ fontSize: 14, color: T.mutedInk, margin: '6px 0 0' }}>
          Distribuição atual do funil + tempo médio por etapa (histórico de transição só existe a partir de {' '}
          <a href="#nota-historico" style={{ color: T.bronze }}>agora — veja a nota abaixo</a>).
        </p>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto' }}>
        {result.kind === 'error' && <ErrorState message={result.message} />}
        {result.kind === 'ok' && <Populated leads={result.leads} transicoes={result.transicoes} />}
      </main>
    </div>
  )
}

function Populated({ leads, transicoes }: { leads: LeadStageRow[]; transicoes: StageTransitionRow[] }) {
  const snapshot = snapshotPorEstagio(leads)
  const tempos = tempoMedioPorEstagio(transicoes)
  const total = leads.length

  return (
    <>
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Metric label="Total de leads" value={String(total)} />
        {snapshot.filter((s) => s.key !== 'outros').map((s) => (
          <Metric key={s.key} label={s.label} value={`${s.total} (${s.pct}%)`} />
        ))}
      </section>

      <section
        style={{
          background: '#fff',
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: '20px 22px',
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.mutedInk, fontWeight: 600, marginBottom: 12 }}>
          Distribuição atual por etapa
        </div>
        <FunilChart data={snapshot} />
      </section>

      <section style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: T.ink, color: T.cream }}>
              <Th>Etapa</Th>
              <Th align="right">Leads hoje</Th>
              <Th align="right">% do total</Th>
              <Th align="right">Cascata (chegou até aqui)</Th>
              <Th align="right">Tempo médio na etapa</Th>
              <Th align="right">Amostras</Th>
            </tr>
          </thead>
          <tbody>
            {snapshot.map((s, i) => {
              const t = tempos.find((x) => x.estagio === s.key)
              return (
                <tr key={s.key} style={{ background: i % 2 === 0 ? '#fff' : T.bronzeSoft }}>
                  <Td>{s.label}</Td>
                  <Td align="right" mono>{s.total}</Td>
                  <Td align="right" mono>{s.pct}%</Td>
                  <Td align="right" mono>{s.key === 'outros' ? '—' : `${s.cascataPct}%`}</Td>
                  <Td align="right" mono>{t?.mediaDias != null ? `${t.mediaDias}d` : '—'}</Td>
                  <Td align="right" mono muted>{t?.amostras ?? 0}</Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <p id="nota-historico" style={{ fontSize: 12, color: T.mutedInk, maxWidth: 720, lineHeight: 1.6 }}>
        <strong>Nota sobre os dados:</strong> "Cascata" é a % de leads que estão nesta etapa ou além, calculada a
        partir do snapshot de hoje — não é uma taxa de conversão de coorte real (não temos histórico de todas as
        transições passadas). "Tempo médio na etapa" vem do log de mudança de estágio, que só passou a existir a
        partir do momento em que o Kanban (arrastar-e-soltar) começou a registrar transições — os números vão
        ficando mais confiáveis com o tempo. Leads com estágio fora dos 7 conhecidos aparecem em "Outros".
      </p>
    </>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px 22px' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.mutedInk, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: T.ink, marginTop: 6, lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: align }}>
      {children}
    </th>
  )
}

function Td({
  children,
  align = 'left',
  mono = false,
  muted = false,
}: {
  children: React.ReactNode
  align?: 'left' | 'right'
  mono?: boolean
  muted?: boolean
}) {
  return (
    <td style={{ padding: '10px 16px', textAlign: align, fontFamily: mono ? 'ui-monospace,SFMono-Regular,Menlo,monospace' : 'inherit', color: muted ? T.mutedInk : T.ink }}>
      {children}
    </td>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ padding: '32px 28px', background: 'rgba(220,38,38,0.08)', border: '1px solid #dc2626', borderRadius: 12 }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#dc2626', margin: '0 0 8px' }}>Erro ao carregar relatório</p>
      <p style={{ fontSize: 13, color: T.ink, margin: 0, fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace' }}>{message}</p>
    </div>
  )
}
