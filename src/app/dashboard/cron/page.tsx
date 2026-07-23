import { createClient } from '@supabase/supabase-js'
import {
  aggregate,
  aggregateByDay,
  filterLast7Days,
  formatDuration,
  type CronRunRow,
  type CronRunStatus,
} from '@/lib/dashboard/cron-stats'
import { RelativeTime } from '@/lib/dashboard/relative-time'
import { CronTimelineChart } from '@/lib/dashboard/cron-chart'
import { CronFilter } from '@/lib/dashboard/cron-filter'
import { CronRowButton } from '@/lib/dashboard/cron-details-modal'

// searchParams marca a página como dynamic per-request → sempre dados frescos.
// Sem revalidate (dashboard admin, F5 é o "auto-refresh").
export const dynamic = 'force-dynamic'

// Paleta consistente com o resto do dashboard (dashboard/layout.tsx)
const T = {
  bronze: '#D24E22',
  bronzeSoft: 'rgba(210,78,34,0.08)',
  dark: '#131211',
  cream: '#F3F2EE',
  ink: '#1a1a1a',
  mutedInk: '#71717a',
  border: '#e4e4e7',
  ok: '#16a34a',
  okSoft: 'rgba(22,163,74,0.12)',
  partial: '#ea580c',
  partialSoft: 'rgba(234,88,12,0.12)',
  skipped: '#d97706',
  skippedSoft: 'rgba(217,119,6,0.12)',
  error: '#dc2626',
  errorSoft: 'rgba(220,38,38,0.12)',
  running: '#71717a',
  runningSoft: 'rgba(113,113,122,0.12)',
} as const

const STATUS_STYLE: Record<CronRunStatus, { color: string; bg: string; label: string }> = {
  ok: { color: T.ok, bg: T.okSoft, label: 'sucesso' },
  partial: { color: T.partial, bg: T.partialSoft, label: 'parcial' },
  skipped: { color: T.skipped, bg: T.skippedSoft, label: 'ignorado' },
  error: { color: T.error, bg: T.errorSoft, label: 'falhou' },
  running: { color: T.running, bg: T.runningSoft, label: 'em andamento' },
}

function isMissingTable(err: { code?: string; message?: string }): boolean {
  if (err.code === '42P01') return true
  return /relation .*cron_runs.*does not exist|table .*cron_runs.*not found/i.test(err.message ?? '')
}

async function fetchCronRuns(): Promise<
  | { kind: 'missing_table' }
  | { kind: 'error'; message: string }
  | { kind: 'ok'; rows: CronRunRow[] }
> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { kind: 'error', message: 'Configuração Supabase incompleta.' }

  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from('cron_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(30)

  if (error) {
    if (isMissingTable(error)) return { kind: 'missing_table' }
    return { kind: 'error', message: error.message }
  }
  return { kind: 'ok', rows: (data ?? []) as CronRunRow[] }
}

export default async function CronDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cron?: string }>
}) {
  const params = await searchParams
  const currentFilter = params.cron ?? null
  const result = await fetchCronRuns()

  return (
    <div style={{ padding: '32px clamp(16px,4vw,40px)', background: '#fff', minHeight: '100vh' }}>
      <header style={{ maxWidth: 1200, margin: '0 auto 28px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: T.ink, margin: 0 }}>Histórico dos crons</h1>
        <p style={{ fontSize: 14, color: T.mutedInk, margin: '6px 0 0' }}>
          Últimas 30 execuções persistidas em <code style={{ background: T.cream, padding: '2px 6px', borderRadius: 4 }}>cron_runs</code>.
        </p>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {result.kind === 'missing_table' && <MissingMigration />}
        {result.kind === 'error' && <ErrorState message={result.message} />}
        {result.kind === 'ok' && result.rows.length === 0 && <EmptyState />}
        {result.kind === 'ok' && result.rows.length > 0 && (
          <Populated rows={result.rows} currentFilter={currentFilter} />
        )}
      </div>
    </div>
  )
}

function Populated({ rows, currentFilter }: { rows: CronRunRow[]; currentFilter: string | null }) {
  // Nomes únicos de cron pra dropdown (sempre extraídos de TODOS os rows, não da view filtrada)
  const cronNames = Array.from(new Set(rows.map((r) => r.cron_name))).sort()
  const filtered = currentFilter ? rows.filter((r) => r.cron_name === currentFilter) : rows
  const last7d = filterLast7Days(filtered)
  const stats = aggregate(last7d)
  const chartData = aggregateByDay(last7d, 7)

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
        <Metric label="Runs (7d)" value={String(stats.total)} />
        <Metric
          label="Taxa de sucesso (execução)"
          value={`${stats.successRate}%`}
          hint={`${stats.ok} sucesso / ${stats.partial} parcial / ${stats.errors} falhou / ${stats.skipped} ignorado`}
        />
        <Metric
          label="Taxa de entrega (mensagens)"
          value={`${stats.taxaEntrega}%`}
          hint={`${stats.totalEnviados} enviada(s) de ${stats.totalEnviados + stats.totalErrosEnvio} tentativa(s)`}
          accent
        />
        <Metric label="Erros de envio (7d)" value={String(stats.totalErrosEnvio)} />
      </section>
      <p style={{ fontSize: 12, color: T.mutedInk, margin: '-14px 0 24px', maxWidth: 1200 }}>
        As duas taxas medem coisas diferentes: <strong>sucesso de execução</strong> é o job ter terminado sem
        nenhum erro; <strong>taxa de entrega</strong> é quantas mensagens realmente saíram, mesmo numa run parcial.
      </p>

      <section
        style={{
          background: '#fff',
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: '20px 22px',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.mutedInk, fontWeight: 600 }}>
            Últimos 7 dias por status
          </div>
          <CronFilter crons={cronNames} current={currentFilter} />
        </div>
        <CronTimelineChart data={chartData} />
      </section>

      <section style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
          <thead>
            <tr style={{ background: T.dark, color: T.cream }}>
              <Th>Cron</Th>
              <Th>Quando</Th>
              <Th>Duração</Th>
              <Th>Status</Th>
              <Th align="right">Enviados</Th>
              <Th align="right">Erros</Th>
              <Th>Motivo</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : T.bronzeSoft }}>
                <td colSpan={7} style={{ padding: 0, borderTop: `1px solid ${T.border}` }}>
                  <CronRowButton row={r}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <Td mono>{r.cron_name}</Td>
                          <Td>
                            <RelativeTime iso={r.started_at} />
                          </Td>
                          <Td mono>{formatDuration(r.duration_ms)}</Td>
                          <Td>
                            <StatusBadge status={r.status} />
                          </Td>
                          <Td align="right" mono>
                            {r.enviados ?? '—'}
                          </Td>
                          <Td align="right" mono>
                            {r.erros_envio ?? '—'}
                          </Td>
                          <Td muted title={r.motivo ?? undefined}>
                            {truncate(r.motivo, 60) ?? '—'}
                          </Td>
                        </tr>
                      </tbody>
                    </table>
                  </CronRowButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>
    </>
  )
}

function Metric({ label, value, hint, accent = false }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: '20px 22px',
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.mutedInk, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: accent ? T.bronze : T.ink, marginTop: 6, lineHeight: 1 }}>
        {value}
      </div>
      {hint && <div style={{ fontSize: 12, color: T.mutedInk, marginTop: 8 }}>{hint}</div>}
    </div>
  )
}

function StatusBadge({ status }: { status: CronRunStatus }) {
  const s = STATUS_STYLE[status]
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: s.color,
        background: s.bg,
      }}
    >
      {s.label}
    </span>
  )
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      style={{
        padding: '12px 16px',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        textAlign: align,
      }}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  align = 'left',
  mono = false,
  muted = false,
  title,
}: {
  children: React.ReactNode
  align?: 'left' | 'right'
  mono?: boolean
  muted?: boolean
  title?: string
}) {
  return (
    <td
      title={title}
      style={{
        padding: '10px 16px',
        textAlign: align,
        fontFamily: mono ? 'ui-monospace,SFMono-Regular,Menlo,monospace' : 'inherit',
        color: muted ? T.mutedInk : T.ink,
      }}
    >
      {children}
    </td>
  )
}

function truncate(s: string | null, n: number): string | null {
  if (!s) return s
  if (s.length <= n) return s
  return s.slice(0, n - 1) + '…'
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '64px 24px',
        background: T.cream,
        borderRadius: 12,
      }}
    >
      <div style={{ fontSize: 40 }}>⏱</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.ink, margin: '12px 0 6px' }}>
        Nenhuma execução registrada ainda.
      </p>
      <p style={{ fontSize: 13, color: T.mutedInk, margin: 0 }}>
        O primeiro run do cron aparece aqui automaticamente.
      </p>
    </div>
  )
}

function MissingMigration() {
  return (
    <div
      style={{
        padding: '32px 28px',
        background: T.skippedSoft,
        border: `1px solid ${T.skipped}`,
        borderRadius: 12,
      }}
    >
      <p style={{ fontSize: 15, fontWeight: 700, color: T.ink, margin: '0 0 10px' }}>
        Migration 0006 pendente.
      </p>
      <p style={{ fontSize: 13, color: T.mutedInk, margin: '0 0 14px' }}>
        A tabela <code>cron_runs</code> ainda não existe. Rode no SQL Editor do Supabase:
      </p>
      <pre
        style={{
          background: T.dark,
          color: T.cream,
          padding: '16px 20px',
          borderRadius: 8,
          fontSize: 12,
          overflow: 'auto',
          margin: 0,
        }}
      >
        {`-- supabase/migrations/0006_cron_runs.sql
-- (arquivo completo no repo; idempotente, aditivo)`}
      </pre>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: '32px 28px',
        background: T.errorSoft,
        border: `1px solid ${T.error}`,
        borderRadius: 12,
      }}
    >
      <p style={{ fontSize: 15, fontWeight: 700, color: T.error, margin: '0 0 8px' }}>
        Erro ao carregar histórico
      </p>
      <p style={{ fontSize: 13, color: T.ink, margin: 0, fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace' }}>
        {message}
      </p>
    </div>
  )
}
