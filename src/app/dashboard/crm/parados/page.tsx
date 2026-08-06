'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ESTAGIOS_FUNIL } from '@/lib/dashboard/estagios'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512', bronze: '#D24E22',
  muted: '#6B655B', line: 'rgba(26,24,21,0.08)', red: '#ef4444',
}

type LeadParado = {
  lead_id: string
  nome: string | null
  whatsapp: string
  estagio_funil: string
  origem: string | null
  lead_score: number
  ultima_movimentacao: string
  dias_parado: number
}

function estagioLabel(key: string): string {
  return ESTAGIOS_FUNIL.find((e) => e.key === key)?.label ?? key
}

export default function LeadsParadosPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<LeadParado[] | null>(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch('/api/admin/leads/parados')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar a fila')
      setLeads(json.data)
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar a fila')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(20px,2.5vw,36px) clamp(16px,3vw,32px)' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.4rem,3vw,1.8rem)', fontWeight: 800, margin: 0 }}>
            Leads parados
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: D.muted }}>
            Leads em aberto ordenados por maior tempo sem interação — o topo da lista é quem mais precisa de um follow-up agora.
          </p>
        </div>

        {carregando && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ height: 64, borderRadius: 10, background: D.surface, border: '1px solid ' + D.line }} />
            ))}
          </div>
        )}

        {!carregando && erro && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#991B1B' }}>{erro}</p>
            <button onClick={carregar} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', minHeight: 44 }}>
              Tentar de novo
            </button>
          </div>
        )}

        {!carregando && !erro && leads && leads.length === 0 && (
          <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '20px 22px' }}>
            <p style={{ margin: 0, fontSize: 14, color: D.muted }}>
              Nenhum lead parado há 3 dias ou mais. Fila vazia — operação em dia.
            </p>
          </div>
        )}

        {!carregando && !erro && leads && leads.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leads.map((l) => (
              <button
                key={l.lead_id}
                onClick={() => router.push(`/dashboard/crm?lead=${l.lead_id}`)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  background: D.surface, border: '1px solid ' + D.line, borderRadius: 10, padding: '12px 16px',
                  textAlign: 'left', cursor: 'pointer', minHeight: 44, width: '100%',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: D.ink }}>{l.nome || l.whatsapp}</div>
                  <div style={{ fontSize: 12, color: D.muted, marginTop: 2 }}>{estagioLabel(l.estagio_funil)}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: l.dias_parado >= 7 ? D.red : D.bronze }}>
                    {l.dias_parado} dia{l.dias_parado === 1 ? '' : 's'}
                  </div>
                  <div style={{ fontSize: 11, color: D.muted }}>sem interação</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
