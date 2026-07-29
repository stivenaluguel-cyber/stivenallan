'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react'
import { D } from '@/components/dashboard/focus/tokens'

// Formato gravado em leads.lead_score_detalhe (ver detalheParaPersistir).
export type DetalheScore = {
  classificacao?: 'quente' | 'morno' | 'frio'
  dimensoes?: { chave: string; pontos: number; maximo: number }[]
  positivos?: { rotulo: string; pontos: number }[]
  negativos?: string[]
  proxima_acao?: string | null
  calculado_em?: string
}

const ROTULO_DIMENSAO: Record<string, string> = {
  perfil: 'Perfil',
  engajamento: 'Engajamento',
  comportamento: 'Comportamento',
  timing: 'Timing',
}

const CLASSIFICACAO: Record<string, { label: string; cor: string; fundo: string }> = {
  quente: { label: 'Quente', cor: '#b91c1c', fundo: 'rgba(239,68,68,0.12)' },
  morno: { label: 'Morno', cor: '#b45309', fundo: 'rgba(245,158,11,0.14)' },
  frio: { label: 'Frio', cor: '#1d4ed8', fundo: 'rgba(59,130,246,0.12)' },
}

const corDoScore = (n: number) => (n >= 70 ? D.green : n >= 40 ? D.amber : D.muted)

/**
 * Painel que abre a conta do score.
 *
 * Um "87" sozinho não muda o que o corretor faz. O que muda é ver que o lead
 * tem perfil mas nunca recebeu simulação, ou que sumiu há 12 dias. Por isso o
 * painel mostra as quatro dimensões, o que somou, o que está faltando e — no
 * topo — a única próxima ação que importa.
 */
export function PainelScore({ score, detalhe, compacto }: {
  score: number
  detalhe?: DetalheScore | null
  compacto?: boolean
}) {
  const [aberto, setAberto] = useState(!compacto)
  const d = detalhe ?? {}
  const classe = CLASSIFICACAO[d.classificacao ?? ''] ?? null
  const temDetalhe = (d.dimensoes?.length ?? 0) > 0

  return (
    <div style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 10, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: corDoScore(score), lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 12, color: D.muted }}>/100</span>
        </div>
        {classe && (
          <span style={{ fontSize: 11, fontWeight: 700, color: classe.cor, background: classe.fundo, padding: '3px 9px', borderRadius: 999 }}>
            {classe.label}
          </span>
        )}
        {temDetalhe && (
          <button onClick={() => setAberto((v) => !v)} aria-expanded={aberto}
            style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: D.muted, fontSize: 12, cursor: 'pointer', minHeight: 34 }}>
            {aberto ? 'Ocultar' : 'Ver a conta'}
            {aberto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {d.proxima_acao && (
        <div style={{ marginTop: 10, background: 'rgba(210,78,34,0.08)', border: '1px solid rgba(210,78,34,0.22)', borderRadius: 8, padding: '9px 11px' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: D.bronze, letterSpacing: '0.06em' }}>PRÓXIMA AÇÃO</span>
          <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 600, color: D.ink }}>{d.proxima_acao}</p>
        </div>
      )}

      {!temDetalhe && (
        <p style={{ fontSize: 12, color: D.muted, margin: '10px 0 0' }}>
          Score ainda não calculado para este lead.
        </p>
      )}

      {aberto && temDetalhe && (
        <>
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'grid', gap: 7 }}>
            {d.dimensoes!.map((dim) => (
              <li key={dim.chave} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12 }}>
                <span style={{ width: 104, color: D.ink }}>{ROTULO_DIMENSAO[dim.chave] ?? dim.chave}</span>
                <span style={{ flex: 1, height: 6, borderRadius: 3, background: D.line, overflow: 'hidden' }}>
                  <span style={{
                    display: 'block', height: '100%',
                    width: Math.round((dim.pontos / Math.max(1, dim.maximo)) * 100) + '%',
                    background: dim.pontos >= dim.maximo * 0.7 ? D.green : dim.pontos > 0 ? D.amber : D.line,
                  }} />
                </span>
                <span style={{ width: 46, textAlign: 'right', color: D.muted, fontVariantNumeric: 'tabular-nums' }}>
                  {dim.pontos}/{dim.maximo}
                </span>
              </li>
            ))}
          </ul>

          {(d.positivos?.length ?? 0) > 0 && (
            <Bloco titulo="A favor" cor={D.green}>
              {d.positivos!.map((p, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: D.ink }}>
                  <Plus size={12} color={D.green} aria-hidden />
                  <span style={{ flex: 1 }}>{p.rotulo}</span>
                  <span style={{ color: D.muted, fontVariantNumeric: 'tabular-nums' }}>+{p.pontos}</span>
                </li>
              ))}
            </Bloco>
          )}

          {(d.negativos?.length ?? 0) > 0 && (
            <Bloco titulo="Contra" cor={D.red}>
              {d.negativos!.map((n, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: D.muted }}>
                  <Minus size={12} color={D.red} aria-hidden />
                  <span>{n}</span>
                </li>
              ))}
            </Bloco>
          )}
        </>
      )}
    </div>
  )
}

function Bloco({ titulo, cor, children }: { titulo: string; cor: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 11 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: cor, letterSpacing: '0.06em' }}>{titulo.toUpperCase()}</span>
      <ul style={{ listStyle: 'none', padding: 0, margin: '5px 0 0', display: 'grid', gap: 4 }}>{children}</ul>
    </div>
  )
}
