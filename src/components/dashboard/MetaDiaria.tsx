'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flame, ListChecks } from 'lucide-react'
import type { ResultadoMetaDiaria } from '@/lib/metas/diaria'

// Mesma paleta de src/components/dashboard/ScoreOperacao.tsx — os dois
// cards vivem lado a lado no topo do dashboard e precisam ler como um
// sistema só.
const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512', bronze: '#D24E22',
  muted: '#6B655B', line: 'rgba(26,24,21,0.08)', green: '#22c55e',
  amber: '#f59e0b', red: '#ef4444',
}

const ESTADO_TEXTO: Record<ResultadoMetaDiaria['progressoHoje']['estado'], string> = {
  nao_iniciado: 'Nenhum follow-up registrado hoje ainda',
  em_andamento: 'Em andamento',
  meta_batida: 'Meta batida hoje',
}

const ESTADO_COR: Record<ResultadoMetaDiaria['progressoHoje']['estado'], string> = {
  nao_iniciado: D.muted,
  em_andamento: D.bronze,
  meta_batida: D.green,
}

export function MetaDiaria() {
  const router = useRouter()
  const [dados, setDados] = useState<ResultadoMetaDiaria | null>(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await fetch('/api/admin/meta-diaria')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar a meta diária')
      setDados(json)
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar a meta diária')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div className="meta-diaria-card">
      {carregando && <MetaSkeleton />}

      {!carregando && erro && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '16px 20px', height: '100%' }}>
          <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#991B1B' }}>{erro}</p>
          <button onClick={carregar} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', minHeight: 44 }}>
            Tentar de novo
          </button>
        </div>
      )}

      {!carregando && !erro && dados && (
        <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '20px 22px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase', color: D.muted, marginBottom: 6 }}>Meta Diária</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 44, fontWeight: 800, color: ESTADO_COR[dados.progressoHoje.estado], lineHeight: 1 }}>
                  {dados.progressoHoje.feitos}
                </span>
                <span style={{ fontSize: 20, color: D.muted, fontWeight: 700 }}>/{dados.progressoHoje.meta}</span>
                <span style={{ fontSize: 13, color: D.muted, marginLeft: 4 }}>follow-ups hoje</span>
              </div>
            </div>
            {dados.streak > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#FFF7ED', border: '1px solid #FDBA74', color: '#C2410C', borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 700 }}>
                <Flame size={14} /> {dados.streak} dia{dados.streak === 1 ? '' : 's'}
              </span>
            )}
          </div>

          <div role="progressbar" aria-valuenow={dados.progressoHoje.percentual} aria-valuemin={0} aria-valuemax={100}
            style={{ height: 10, borderRadius: 999, background: D.line, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: `${dados.progressoHoje.percentual}%`, height: '100%', background: ESTADO_COR[dados.progressoHoje.estado], transition: 'width .25s ease' }} />
          </div>
          <p style={{ margin: '0 0 18px', fontSize: 12.5, color: ESTADO_COR[dados.progressoHoje.estado], fontWeight: 600 }}>
            {ESTADO_TEXTO[dados.progressoHoje.estado]}
          </p>

          <FitaSemanal fita={dados.fita} />

          <div style={{ marginTop: 'auto', paddingTop: 18 }}>
            <button
              onClick={() => router.push('/dashboard/crm/parados')}
              style={{
                width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13,
                fontWeight: 700, cursor: 'pointer', minHeight: 44,
              }}
            >
              <ListChecks size={15} /> Ver fila de leads parados
            </button>
          </div>
        </div>
      )}

      <style>{`
        .meta-diaria-card { width: 100%; }
        @media (min-width: 1024px) { .meta-diaria-card { flex: 1 1 380px; } }
      `}</style>
    </div>
  )
}

function FitaSemanal({ fita }: { fita: ResultadoMetaDiaria['fita'] }) {
  return (
    <div>
      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: D.muted, marginBottom: 8 }}>
        Semana
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
        {fita.dias.map((d) => (
          <div key={d.data} style={{ textAlign: 'center', minWidth: 0 }}>
            <div style={{ fontSize: 10, color: d.ehHoje ? D.ink : D.muted, fontWeight: d.ehHoje ? 800 : 600, marginBottom: 4 }}>
              {d.diaSemanaLabel}
            </div>
            <div
              style={{
                height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
                background: d.metaBatida ? D.green : (d.ehFuturo ? 'transparent' : D.line),
                color: d.metaBatida ? '#fff' : (d.ehFuturo ? D.muted : D.ink),
                border: d.ehHoje ? `2px solid ${D.bronze}` : (d.ehFuturo ? `1px dashed ${D.line}` : '1px solid transparent'),
                opacity: d.ehFuturo ? 0.6 : 1,
              }}
            >
              {d.feitos === null ? '—' : d.feitos}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MetaSkeleton() {
  return (
    <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '20px 22px', height: '100%' }}>
      <div style={{ width: 100, height: 11, borderRadius: 4, background: D.line, marginBottom: 14 }} />
      <div style={{ width: 130, height: 40, borderRadius: 6, background: D.line, marginBottom: 18 }} />
      <div style={{ width: '100%', height: 10, borderRadius: 999, background: D.line, marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6, marginBottom: 20 }}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ height: 34, borderRadius: 8, background: D.line }} />
        ))}
      </div>
      <div style={{ width: '100%', height: 44, borderRadius: 8, background: D.line }} />
    </div>
  )
}
