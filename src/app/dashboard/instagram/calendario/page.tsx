import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { InstagramCalendarBoard, type CalendarRow } from '@/lib/dashboard/instagram-calendar-board'

export const dynamic = 'force-dynamic'

const T = { bronze: '#D24E22', ink: '#1a1a1a', mutedInk: '#71717a', border: '#e4e4e7' }

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

async function fetchCalendario() {
  const supabase = sb()
  if (!supabase) return { kind: 'error' as const, message: 'Configuração Supabase incompleta.' }

  const { data, error } = await supabase
    .from('ig_content_calendar')
    .select('*')
    .order('data', { ascending: true, nullsFirst: false })

  if (error) {
    if (isMissingTable(error)) return { kind: 'missing_table' as const }
    return { kind: 'error' as const, message: error.message }
  }
  return { kind: 'ok' as const, rows: (data ?? []) as CalendarRow[] }
}

export default async function InstagramCalendarioPage() {
  const result = await fetchCalendario()

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

  const publicados = result.rows.filter((r) => r.status === 'publicado').length

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: T.ink, margin: 0 }}>Calendário de conteúdo — Instagram</h1>
          <p style={{ fontSize: 13, color: T.mutedInk, margin: '4px 0 0' }}>
            {result.rows.length} peças no ciclo · {publicados} publicadas. Clique numa linha pra ver o roteiro completo.
          </p>
        </div>
        <Link href="/dashboard/instagram" style={{ fontSize: 13, fontWeight: 700, color: T.bronze, textDecoration: 'none' }}>
          ← Voltar pra visão geral
        </Link>
      </div>

      <InstagramCalendarBoard rows={result.rows} />
    </div>
  )
}
