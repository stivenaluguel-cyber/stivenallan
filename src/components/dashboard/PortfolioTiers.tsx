'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { ResultadoPortfolioTiers } from '@/lib/portfolio/tiers'

// Mesma paleta de src/components/dashboard/ScoreOperacao.tsx e
// MetaDiaria.tsx (branch feat/score-operacao-dashboard) — os três cards
// vivem juntos no topo do dashboard quando as branches se juntarem.
const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512', bronze: '#D24E22',
  muted: '#6B655B', line: 'rgba(26,24,21,0.08)', green: '#22c55e',
  amber: '#f59e0b', red: '#ef4444',
}

const fmtMil = (n: number) => {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1).replace('.0', '')}mi`
  return `R$ ${Math.round(n / 1000)}mil`
}

export function PortfolioTiers() {
  const router = useRouter()
  const [dados, setDados] = useState<ResultadoPortfolioTiers | null>(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch('/api/admin/portfolio-tiers')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar a distribuição do portfólio')
      setDados(json)
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar a distribuição do portfólio')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div className="portfolio-tiers-card">
      {carregando && <Skeleton />}

      {!carregando && erro && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px', height: '100%' }}>
          <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#991B1B' }}>{erro}</p>
          <button onClick={carregar} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', minHeight: 44 }}>
            Tentar de novo
          </button>
        </div>
      )}

      {!carregando && !erro && dados && !dados.aplicavel && (
        <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '20px 22px', height: '100%' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase', color: D.muted, marginBottom: 6 }}>
            Portfólio por Faixa de Preço
          </div>
          <p style={{ margin: 0, fontSize: 14, color: D.muted, lineHeight: 1.5 }}>
            Sem dados suficientes ainda. {dados.motivo}
          </p>
        </div>
      )}

      {!carregando && !erro && dados && dados.aplicavel && (
        <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '20px 22px', height: '100%' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase', color: D.muted, marginBottom: 6 }}>
              Portfólio por Faixa de Preço
            </div>
            {dados.temGap ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={16} color={D.amber} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>Faixa com estoque parado, sem nenhum imóvel ativo</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} color={D.green} />
                <span style={{ fontSize: 13, fontWeight: 700, color: D.ink }}>Divulgação cobre todas as faixas de preço</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dados.tiers.map((t) => (
              <div
                key={t.tier}
                onClick={() => router.push('/dashboard/empreendimentos')}
                style={{
                  border: '1px solid ' + (t.gap ? '#FDE68A' : D.line),
                  background: t.gap ? '#FFFBEB' : '#fff',
                  borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: D.ink }}>{t.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: t.gap ? '#92400E' : D.ink }}>
                    {t.ativos} de {t.total} ativo{t.total === 1 ? '' : 's'}
                  </span>
                </div>
                {t.total === 0 ? (
                  <p style={{ margin: 0, fontSize: 11.5, color: D.muted }}>Sem empreendimento nessa faixa hoje.</p>
                ) : (
                  <>
                    <div role="progressbar" aria-valuenow={t.ativos} aria-valuemin={0} aria-valuemax={t.total} aria-label={t.label}
                      style={{ height: 6, borderRadius: 999, background: D.line, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{
                        width: `${Math.round((t.ativos / t.total) * 100)}%`, height: '100%',
                        background: t.gap ? D.red : D.bronze,
                      }} />
                    </div>
                    <p style={{ margin: 0, fontSize: 11.5, color: D.muted }}>
                      {t.precoMin !== null && t.precoMax !== null ? `${fmtMil(t.precoMin)} – ${fmtMil(t.precoMax)}` : ''}
                      {t.gap && <span style={{ color: '#92400E', fontWeight: 700 }}> · nenhum ativo nessa faixa</span>}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .portfolio-tiers-card { width: 100%; }
        @media (min-width: 1024px) { .portfolio-tiers-card { flex: 1 1 380px; } }
      `}</style>
    </div>
  )
}

function Skeleton() {
  return (
    <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '20px 22px', height: '100%' }}>
      <div style={{ width: 160, height: 11, borderRadius: 4, background: D.line, marginBottom: 14 }} />
      <div style={{ width: 220, height: 16, borderRadius: 4, background: D.line, marginBottom: 20 }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ height: 54, borderRadius: 10, background: D.line, marginBottom: 10 }} />
      ))}
    </div>
  )
}
