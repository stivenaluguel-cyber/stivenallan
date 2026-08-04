'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512', bronze: '#D24E22',
  muted: '#6B655B', line: 'rgba(26,24,21,0.08)', green: '#22c55e',
}

type Campanha = {
  id: string
  nome: string
  alvo: string | null
  localizacao: string | null
  leads_solicitados: number
  leads_entregues: number
  created_at: string
}

export default function ProspeccaoPage() {
  const router = useRouter()
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/prospeccao/campanhas')
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Falha ao carregar campanhas.'); return }
      setCampanhas(data.campanhas ?? [])
    } catch {
      setErro('Falha ao conectar.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div style={{ minHeight: '100vh', background: D.bg, padding: '24px 20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: D.ink }}>Prospecção</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: D.muted }}>
            Busca ativa de empresas no Google Maps, qualificadas por IA — pra quando o lead precisa ser procurado, não esperado.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/prospeccao/nova')}
          style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          + Nova campanha
        </button>
      </div>

      {erro && <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 16 }}>{erro}</p>}

      {loading ? (
        <p style={{ color: D.muted, fontSize: 14 }}>Carregando...</p>
      ) : campanhas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: D.surface, border: '1px solid ' + D.line, borderRadius: 12 }}>
          <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>Nenhuma campanha de prospecção ainda.</p>
          <p style={{ fontSize: 13, color: D.muted, margin: 0 }}>Descreva o que você vende e quem costuma comprar, e a IA monta o alvo e sai procurando.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {campanhas.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push('/dashboard/prospeccao/' + c.id)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', gap: 12, width: '100%' }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: D.ink }}>{c.nome}</div>
                <div style={{ fontSize: 12, color: D.muted, marginTop: 2 }}>
                  {c.localizacao ? c.localizacao + ' · ' : ''}{new Date(c.created_at).toLocaleString('pt-BR')}
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: D.green, background: D.green + '18', padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                {c.leads_entregues} lead{c.leads_entregues === 1 ? '' : 's'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
