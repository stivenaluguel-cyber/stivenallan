'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ESTADOS_CAMPANHA, type StatusCampanha } from '@/lib/campanhas/estados'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512', bronze: '#D24E22',
  muted: '#6B655B', line: 'rgba(26,24,21,0.08)', green: '#22c55e', red: '#ef4444', blue: '#3b82f6',
}

type Campanha = { id: string; titulo: string; status: string; criado_em: string; enviada_em?: string | null }

export default function CampanhasPage() {
  const router = useRouter()
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [loading, setLoading] = useState(true)
  const [criando, setCriando] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/campanhas')
      const data = await res.json()
      setCampanhas(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function novaCampanha() {
    setCriando(true)
    try {
      const res = await fetch('/api/admin/campanhas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Nova campanha',
          assunto: 'Assunto da campanha',
          corpo_html: '<p>Olá {nome},</p>\n<p>Escreva aqui o conteúdo da campanha.</p>',
          segmento: {},
        }),
      })
      const data = await res.json()
      if (res.ok && data.data?.id) router.push('/dashboard/campanhas/' + data.data.id)
    } finally {
      setCriando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(20px,2.5vw,36px) clamp(16px,3vw,32px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, margin: 0 }}>Campanhas de E-mail</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: D.muted }}>Envios avulsos pra segmentos de leads — diferente da régua automática.</p>
          </div>
          <button onClick={novaCampanha} disabled={criando}
            style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: criando ? 'default' : 'pointer', opacity: criando ? 0.6 : 1, whiteSpace: 'nowrap' }}>
            {criando ? 'Criando...' : '+ Nova campanha'}
          </button>
        </div>

        {loading ? (
          <p style={{ color: D.muted, fontSize: 14 }}>Carregando...</p>
        ) : campanhas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: D.surface, border: '1px solid ' + D.line, borderRadius: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>Nenhuma campanha ainda.</p>
            <p style={{ fontSize: 13, color: D.muted, margin: 0 }}>Clique em "Nova campanha" pra começar.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {campanhas.map((c) => {
              const s = ESTADOS_CAMPANHA[c.status as StatusCampanha] ?? { label: c.status, cor: D.muted }
              return (
                <button key={c.id} onClick={() => router.push('/dashboard/campanhas/' + c.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{c.titulo}</div>
                    <div style={{ fontSize: 12, color: D.muted, marginTop: 2 }}>{new Date(c.criado_em).toLocaleString('pt-BR')}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: s.cor, background: s.cor + '18', padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                    {s.label}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
