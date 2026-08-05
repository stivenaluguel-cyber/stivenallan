import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { InstagramAutomacoesClient, type Automacao } from '@/lib/dashboard/instagram-automacoes-client'

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

export default async function InstagramAutomacoesPage() {
  const supabase = sb()
  if (!supabase) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ padding: 16, border: `1px solid ${T.border}`, borderRadius: 10, background: '#fff', color: T.mutedInk, fontSize: 13.5 }}>
          Configuração Supabase incompleta.
        </div>
      </div>
    )
  }

  const { data, error } = await supabase.from('ig_comment_automacoes').select('*').order('created_at', { ascending: false })

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: T.ink, margin: 0 }}>Automações de comentário → DM</h1>
          <p style={{ fontSize: 13, color: T.mutedInk, margin: '4px 0 0' }}>
            Comentário com palavra-chave num post responde publicamente e manda DM automática, estilo ManyChat.
          </p>
        </div>
        <Link href="/dashboard/instagram" style={{ fontSize: 13, fontWeight: 700, color: T.bronze, textDecoration: 'none' }}>
          ← Voltar
        </Link>
      </div>

      {error && isMissingTable(error) ? (
        <div style={{ padding: 16, border: `1px solid ${T.border}`, borderRadius: 10, background: '#fff', color: T.mutedInk, fontSize: 13.5 }}>
          Tabela ainda não existe no banco — rode a migração <code>ig_comment_automacoes.sql</code>.
        </div>
      ) : error ? (
        <div style={{ padding: 16, border: '1px solid #fecaca', borderRadius: 10, background: '#fef2f2', color: '#991b1b', fontSize: 13.5 }}>
          Erro ao carregar dados: {error.message}
        </div>
      ) : (
        <InstagramAutomacoesClient automacoesIniciais={(data ?? []) as Automacao[]} />
      )}
    </div>
  )
}
