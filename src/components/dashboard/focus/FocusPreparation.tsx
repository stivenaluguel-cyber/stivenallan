'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { D, tempInfo } from './tokens'
import { ESTAGIOS_FUNIL } from '@/lib/dashboard/estagios'
import { PRESETS_FOCO } from '@/lib/dashboard/focus-filters'
import type { FocusQueueFilters } from '@/lib/dashboard/focus-queue'

const TEMPS: { value: NonNullable<FocusQueueFilters['temperatura']>; v: number }[] = [
  { value: 'quente', v: 3 }, { value: 'morno', v: 2 }, { value: 'frio', v: 1 },
]

// Estimativa de duração: ~90s por lead é o ritmo observado de um atendimento
// curto (abrir, decidir, registrar). É rotulado como estimativa na tela — não
// é uma promessa nem um dado medido do corretor.
const SEGUNDOS_POR_LEAD = 90

export function FocusPreparation({
  filtros, onFiltrosChange, onIniciar, iniciando, erro,
}: {
  filtros: FocusQueueFilters
  onFiltrosChange: (f: FocusQueueFilters) => void
  onIniciar: () => void
  iniciando: boolean
  erro?: string
}) {
  const [estimativa, setEstimativa] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(false)
  const seqRef = useRef(0)

  const contar = useCallback(async () => {
    const seq = ++seqRef.current
    setCarregando(true)
    try {
      const params = new URLSearchParams()
      if (filtros.temperatura) params.set('temperatura', filtros.temperatura)
      if (filtros.estagioFunil) params.set('estagioFunil', filtros.estagioFunil)
      if (filtros.origem) params.set('origem', filtros.origem)
      if (filtros.apenasFollowupVencido) params.set('apenasFollowupVencido', 'true')
      if (typeof filtros.semAcaoDias === 'number') params.set('semAcaoDias', String(filtros.semAcaoDias))
      const res = await fetch('/api/admin/leads/foco?' + params.toString())
      const json = await res.json()
      if (seq !== seqRef.current) return
      setEstimativa(res.ok ? (json.total ?? 0) : null)
    } catch {
      if (seq === seqRef.current) setEstimativa(null)
    } finally {
      if (seq === seqRef.current) setCarregando(false)
    }
  }, [filtros])

  useEffect(() => { contar() }, [contar])

  const minutos = estimativa ? Math.max(1, Math.round((estimativa * SEGUNDOS_POR_LEAD) / 60)) : null
  const temFiltro = Object.keys(filtros).length > 0
  const podeIniciar = !iniciando && (estimativa ?? 0) > 0

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px clamp(14px,3vw,24px) 48px' }}>
      <h1 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(20px,4vw,26px)', fontWeight: 800, color: D.ink, margin: '0 0 6px' }}>
        Modo Foco
      </h1>
      <p style={{ fontSize: 14, color: D.muted, margin: '0 0 24px' }}>
        Escolha o recorte da fila antes de começar. Depois de iniciar, os filtros ficam travados até o fim da sessão.
      </p>

      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 20px' }}>
        <legend style={{ fontSize: 12.5, fontWeight: 800, color: D.ink, textTransform: 'uppercase', letterSpacing: .4, padding: 0, marginBottom: 8 }}>
          Atalhos
        </legend>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8 }}>
          {PRESETS_FOCO.map((p) => {
            const ativo = JSON.stringify(p.filtros) === JSON.stringify(filtros)
            return (
              <button
                key={p.key}
                onClick={() => onFiltrosChange(p.filtros)}
                aria-pressed={ativo}
                style={{
                  textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', minHeight: 44,
                  border: '1.5px solid ' + (ativo ? D.bronze : D.line),
                  background: ativo ? D.bronze + '12' : '#fff',
                }}
              >
                <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: ativo ? D.bronze : D.ink }}>{p.label}</span>
                <span style={{ display: 'block', fontSize: 11.5, color: D.muted, marginTop: 2 }}>{p.descricao}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <fieldset style={{ border: 'none', padding: 0, margin: '0 0 14px' }}>
          <legend style={{ fontSize: 12.5, fontWeight: 700, color: D.ink, padding: 0, marginBottom: 8 }}>Temperatura</legend>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TEMPS.map(({ value, v }) => {
              const info = tempInfo(v)
              const ativo = filtros.temperatura === value
              return (
                <button
                  key={value}
                  onClick={() => onFiltrosChange({ ...filtros, temperatura: ativo ? undefined : value })}
                  aria-pressed={ativo}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 999, padding: '9px 14px',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', minHeight: 44,
                    border: '1.5px solid ' + (ativo ? info.cor : D.line),
                    background: ativo ? info.cor + '1c' : '#fff',
                    color: ativo ? info.cor : D.ink,
                  }}
                >
                  {info.icon} {info.label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <label htmlFor="foco-etapa" style={labelStyle}>Etapa do funil</label>
        <select
          id="foco-etapa"
          value={filtros.estagioFunil ?? ''}
          onChange={(e) => onFiltrosChange({ ...filtros, estagioFunil: e.target.value || undefined })}
          style={campoStyle}
        >
          <option value="">Todas as etapas</option>
          {ESTAGIOS_FUNIL.map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
        </select>

        <label htmlFor="foco-origem" style={labelStyle}>Origem</label>
        <input
          id="foco-origem"
          value={filtros.origem ?? ''}
          onChange={(e) => onFiltrosChange({ ...filtros, origem: e.target.value || undefined })}
          placeholder="Ex.: Meta Ads, Site, Instagram DM"
          style={campoStyle}
        />

        <label htmlFor="foco-dias" style={labelStyle}>Sem ação há (dias)</label>
        <input
          id="foco-dias"
          type="number"
          min={0}
          value={filtros.semAcaoDias ?? ''}
          onChange={(e) => onFiltrosChange({ ...filtros, semAcaoDias: e.target.value ? Number(e.target.value) : undefined })}
          style={campoStyle}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: D.ink, marginTop: 14, minHeight: 44, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!filtros.apenasFollowupVencido}
            onChange={(e) => onFiltrosChange({ ...filtros, apenasFollowupVencido: e.target.checked || undefined })}
            style={{ width: 18, height: 18 }}
          />
          Somente follow-ups vencidos
        </label>

        {temFiltro && (
          <button
            onClick={() => onFiltrosChange({})}
            style={{ marginTop: 12, background: 'none', border: 'none', color: D.bronze, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '10px 0', minHeight: 44 }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div aria-live="polite" style={{ background: '#F8FAFC', border: '1px solid ' + D.line, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
        {carregando ? (
          <span style={{ fontSize: 13.5, color: D.muted }}>Calculando quantos leads entram...</span>
        ) : estimativa === null ? (
          <span style={{ fontSize: 13.5, color: D.red }}>Não foi possível calcular a fila agora.</span>
        ) : estimativa === 0 ? (
          <span style={{ fontSize: 13.5, color: D.ink }}>Nenhum lead entra com estes filtros. Ajuste o recorte para começar.</span>
        ) : (
          <span style={{ fontSize: 14, color: D.ink }}>
            <strong>{estimativa}</strong> {estimativa === 1 ? 'lead entra' : 'leads entram'} nesta sessão
            {minutos !== null && <> · estimativa de <strong>~{minutos} min</strong></>}
          </span>
        )}
      </div>

      {erro && (
        <p role="alert" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
          {erro}
        </p>
      )}

      <button
        onClick={onIniciar}
        disabled={!podeIniciar}
        style={{
          width: '100%', background: podeIniciar ? D.bronze : '#CBD5E1', color: '#fff', border: 'none',
          borderRadius: 10, padding: '14px 20px', fontSize: 15, fontWeight: 800,
          cursor: podeIniciar ? 'pointer' : 'not-allowed', minHeight: 52,
        }}
      >
        {iniciando ? 'Iniciando sessão...' : 'Iniciar sessão'}
      </button>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 700, color: D.ink, marginTop: 14, marginBottom: 6 }
const campoStyle: React.CSSProperties = { width: '100%', padding: '11px 12px', borderRadius: 8, border: '1px solid ' + D.line, fontSize: 14, minHeight: 44, background: '#fff', color: D.ink }
