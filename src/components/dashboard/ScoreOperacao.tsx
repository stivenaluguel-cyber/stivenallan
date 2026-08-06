'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { ResultadoScoreOperacao, Faixa } from '@/lib/score/operacao'

// Paleta local, igual à de src/app/dashboard/page.tsx — cada tela do
// dashboard mantém seu próprio `const D`, convenção já estabelecida em
// src/components/dashboard/focus/tokens.ts.
const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', sidebar: '#131211', ink: '#161512',
  bronze: '#D24E22', muted: '#6B655B', line: 'rgba(26,24,21,0.08)',
  green: '#22c55e', red: '#ef4444', blue: '#3b82f6', amber: '#f59e0b',
}

const FAIXA_COR: Record<Faixa, string> = {
  frio: D.blue,
  morno: D.amber,
  aquecido: '#f97316',
  quente: D.red,
}

const FAIXA_ORDEM: Faixa[] = ['frio', 'morno', 'aquecido', 'quente']

export function ScoreOperacao() {
  const router = useRouter()
  const [dados, setDados] = useState<ResultadoScoreOperacao | null>(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch('/api/admin/score-operacao')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar o score de operação')
      setDados(json)
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar o score de operação')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div className="score-operacao-card" style={{ marginBottom: 24 }}>
      {carregando && <ScoreSkeleton />}

      {!carregando && erro && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px' }}>
          <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#991B1B' }}>{erro}</p>
          <button onClick={carregar} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', minHeight: 44 }}>
            Tentar de novo
          </button>
        </div>
      )}

      {!carregando && !erro && dados?.contaNova && (
        <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase', color: D.muted, marginBottom: 6 }}>Score de Operação</div>
          <p style={{ margin: 0, fontSize: 14, color: D.muted, lineHeight: 1.5 }}>
            Sem dados suficientes ainda. O score aparece assim que a operação tiver leads e unidades cadastradas.
          </p>
        </div>
      )}

      {!carregando && !erro && dados && !dados.contaNova && (
        <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase', color: D.muted, marginBottom: 6 }}>Score de Operação</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 44, fontWeight: 800, color: FAIXA_COR[dados.faixa], lineHeight: 1 }}>
                  {dados.total}
                </span>
                <span style={{ fontSize: 14, color: D.muted }}>/100</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'inline-block', background: FAIXA_COR[dados.faixa], color: '#fff', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
                {dados.faixaLabel}
              </span>
              <p style={{ margin: '8px 0 0', fontSize: 12.5, color: D.muted }}>
                {dados.faltamProximaFaixa === null
                  ? 'Operação no ritmo'
                  : `+${dados.faltamProximaFaixa} pontos para ${dados.proximaFaixaLabel}`}
              </p>
            </div>
          </div>

          <FaixaBar total={dados.total} faixaAtual={dados.faixa} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, margin: '20px 0 4px' }}>
            {dados.componentes.map((c) => (
              <div key={c.chave}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <span style={{ fontSize: 12.5, color: D.ink, fontWeight: 600 }}>{c.label}</span>
                  <span style={{ fontSize: 12, color: D.muted, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {c.pontos === null ? 'N/D' : `${c.pontos}/${c.maximo}`}
                  </span>
                </div>
                <div role="progressbar"
                  aria-valuenow={c.pontos ?? undefined}
                  aria-valuemin={0} aria-valuemax={c.maximo} aria-label={c.label}
                  style={{ height: 6, borderRadius: 999, background: D.line, overflow: 'hidden' }}>
                  <div style={{
                    width: c.pontos === null ? '100%' : `${Math.round((c.pontos / c.maximo) * 100)}%`,
                    height: '100%',
                    background: c.pontos === null ? D.line : (c.pontos >= c.maximo ? D.green : D.bronze),
                    backgroundImage: c.pontos === null ? `repeating-linear-gradient(45deg, ${D.line}, ${D.line} 4px, transparent 4px, transparent 8px)` : undefined,
                  }} />
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: D.muted }}>{c.detalhe}</p>
              </div>
            ))}
          </div>

          <p style={{ margin: '14px 0 0', fontSize: 10.5, color: D.muted }}>
            Perfil (foto, CRECI, WhatsApp, bio, Instagram) não entra no cálculo — esses dados ainda não têm um cadastro editável no sistema.
          </p>

          <MissoesOperacao missoes={dados.missoes} onIr={(href) => router.push(href)} />
        </div>
      )}

      <style>{`
        .score-operacao-card { width: 100%; }
        @media (min-width: 1024px) { .score-operacao-card { max-width: calc(33.333% - 8px); } }
      `}</style>
    </div>
  )
}

function FaixaBar({ total, faixaAtual }: { total: number; faixaAtual: Faixa }) {
  const larguras: Record<Faixa, number> = { frio: 30, morno: 30, aquecido: 25, quente: 15 }
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', gap: 2 }}>
        {FAIXA_ORDEM.map((f) => (
          <div key={f} style={{ flex: larguras[f], background: FAIXA_COR[f], opacity: f === faixaAtual ? 1 : 0.35 }} />
        ))}
      </div>
      <div
        aria-hidden
        style={{
          position: 'absolute', top: -3, left: `calc(${Math.min(Math.max(total, 0), 100)}% - 6px)`,
          width: 0, height: 0,
          borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
          borderTop: `8px solid ${D.sidebar}`,
        }}
      />
    </div>
  )
}

function MissoesOperacao({ missoes, onIr }: { missoes: ResultadoScoreOperacao['missoes']; onIr: (href: string) => void }) {
  if (missoes.length === 0) {
    return (
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid ' + D.line, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Sparkles size={16} color={D.green} />
        <span style={{ fontSize: 13, color: D.ink, fontWeight: 600 }}>Nenhuma melhoria crítica agora — operação redonda.</span>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid ' + D.line }}>
      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: D.muted, marginBottom: 10 }}>
        Pra subir agora
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {missoes.map((m) => (
          <button
            key={m.chave}
            onClick={() => onIr(m.href)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              background: '#fff', border: '1px solid ' + D.line, borderRadius: 10, padding: '10px 12px',
              textAlign: 'left', cursor: 'pointer', minHeight: 44,
            }}
          >
            <span style={{ fontSize: 13, color: D.ink, lineHeight: 1.35 }}>{m.texto}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: D.bronze, whiteSpace: 'nowrap' }}>+{m.ganhoEstimado} pts</span>
              <ArrowRight size={14} color={D.muted} />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ScoreSkeleton() {
  return (
    <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '20px 22px' }}>
      <div style={{ width: 140, height: 11, borderRadius: 4, background: D.line, marginBottom: 14 }} />
      <div style={{ width: 90, height: 40, borderRadius: 6, background: D.line, marginBottom: 18 }} />
      <div style={{ width: '100%', height: 10, borderRadius: 999, background: D.line, marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <div style={{ width: '70%', height: 10, borderRadius: 4, background: D.line, marginBottom: 6 }} />
            <div style={{ width: '100%', height: 6, borderRadius: 999, background: D.line }} />
          </div>
        ))}
      </div>
    </div>
  )
}
