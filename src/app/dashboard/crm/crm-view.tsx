'use client'
import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ConversaPanel } from '@/components/dashboard/ConversaPanel'
import { ESTAGIOS_FUNIL as ESTAGIOS } from '@/lib/dashboard/estagios'
import { competenciaLabelFromChave, formatarCubValor, statusAtualizacaoCub } from '@/lib/dashboard/cub-fonte-unica'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', sidebar: '#131211', ink: '#161512',
  bronze: '#D24E22', orange: '#FF6A3D', muted: '#6B655B',
  line: 'rgba(26,24,21,0.08)', lineDark: 'rgba(245,241,234,0.14)',
  green: '#22c55e', red: '#ef4444', blue: '#3b82f6',
  onDark: '#F3F2EE', onDarkMuted: 'rgba(245,241,234,0.65)',
}
const fmt = (n: number) => 'R$\u00a0' + Math.round(n).toLocaleString('pt-BR')

type Lead = {
  id: string; nome?: string; whatsapp: string; estagio_funil: string
  lead_score?: number; requer_atencao?: boolean; origem?: string
  orcamento_max?: number | null; perfil?: string; email?: string | null
  temperatura?: number; anotacoes?: string | null; created_at?: string
  empreendimentos?: { nome?: string; cidade?: string } | null
  property_name?: string | null; visitas?: number; downloads?: number
}
type Unidade = { id: string; unidade: string; bloco?: string; metragem: number; dormitorios?: number; disponivel: boolean; situacao?: string; valor_tabela?: number; valor_promocional?: number; condicoes_negociacao?: string }

// `situacao` (migration 0018) é a fonte de verdade quando presente; cai de
// volta pro booleano `disponivel` antigo se a unidade ainda não tiver
// `situacao` preenchida (dado antigo, ou migration ainda não aplicada).
function unidadeDisponivel(u: Unidade): boolean {
  return u.situacao ? u.situacao === 'disponivel' : u.disponivel
}
type Emp = { id: string; nome: string; status_venda: string; status_obra?: string }
type Cub = { id: string; mes_referencia: string; valor_m2: number; variacao_mensal?: number; fonte?: string }
type Evento = { tipo: string; slug?: string; descricao?: string; created_at: string }


const TEMPERATURAS = [
  { v: 3, label: 'Quente', cor: '#ef4444', emoji: '🔥' },
  { v: 2, label: 'Morno', cor: '#f59e0b', emoji: '🌤️' },
  { v: 1, label: 'Frio', cor: '#3b82f6', emoji: '❄️' },
]
const tempInfo = (t?: number) => TEMPERATURAS.find(x => x.v === t) ?? TEMPERATURAS[2]

function WidgetCub({ cub, onSaved }: { cub: Cub | null; onSaved: () => void }) {
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  async function atualizarCub() {
    setSaving(true); setStatus('')
    try {
      const res = await fetch('/api/cub', { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao consultar SINDUSCON (' + res.status + ')')
      const data = await res.json()
      await fetch('/api/admin/cub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mes_referencia: (data.competencia ?? new Date().toISOString().slice(0, 7)) + '-01',
          valor_m2: Number(data.valor_m2),
          variacao_mensal: null,
        }),
      })
      const label = data.competencia_label ?? data.usar_em_label ?? ''
      const labelCap = label.charAt(0).toUpperCase() + label.slice(1)
      setStatus(data.online ? 'Atualizado pelo SINDUSCON — ' + labelCap : 'SINDUSCON indisponível — valor de referência aplicado (' + labelCap + ')')
      onSaved()
    } catch {
      setStatus('Não foi possível atualizar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: D.sidebar, border: '1px solid ' + D.lineDark, borderRadius: 12, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: D.onDarkMuted, marginBottom: 4 }}>CUB/SC VIGENTE · SINDUSCON-SC</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: D.bronze }}>
            {cub ? formatarCubValor(cub.valor_m2) + '/m²' : 'Sem CUB cadastrado'}
          </span>
          {cub?.variacao_mensal && (
            <span style={{ fontSize: 13, color: cub.variacao_mensal > 0 ? D.green : D.red, fontWeight: 600 }}>
              {cub.variacao_mensal > 0 ? '+' : ''}{cub.variacao_mensal.toFixed(2)}% mês
            </span>
          )}
        </div>
        {cub && (
          <span style={{ fontSize: 12, color: D.onDarkMuted }}>
            {/* competência calculada por parse de string, NUNCA por new Date(mes_referencia) —
               new Date('2026-07-01') formatado no fuso do Brasil dá "junho" em vez de "julho" */}
            {competenciaLabelFromChave(cub.mes_referencia)}
            {statusAtualizacaoCub(cub.mes_referencia) === 'desatualizado' && (
              <strong style={{ color: '#f59e0b' }}> · pode estar desatualizado</strong>
            )}
          </span>
        )}
        {status && <p role="status" style={{ margin: '6px 0 0', fontSize: 12, color: D.onDarkMuted, fontStyle: 'italic' }}>{status}</p>}
      </div>
      <button onClick={atualizarCub} disabled={saving}
        style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 2, padding: '9px 20px', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Atualizando...' : 'Atualizar CUB'}
      </button>
    </div>
  )
}

function SimuladorFluxo({ cub }: { cub: Cub | null }) {
  const [valorImovel, setValorImovel] = useState(400000)
  const [entrada, setEntrada] = useState(80000)
  const [prazo, setPrazo] = useState(120)
  const [balao, setBalao] = useState(20000)
  const [freq, setFreq] = useState<'anual' | 'semestral'>('anual')
  const saldo = Math.max(0, valorImovel - entrada)
  const nBaloes = freq === 'anual' ? Math.floor(prazo / 12) : Math.floor(prazo / 6)
  const totalBaloes = Math.min(saldo, nBaloes * balao)
  const saldoParc = Math.max(0, saldo - totalBaloes)
  const parcela = prazo > 0 ? saldoParc / prazo : 0
  const cubAjuste = cub ? cub.valor_m2 : 0

  return (
    <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 3 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid ' + D.line, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontWeight: 700, fontSize: 14, color: D.ink }}>Simulador de Fluxo Direto</span>
        {cub && <span style={{ fontSize: 11, color: D.muted }}>CUB: {fmt(cub.valor_m2)}/m²</span>}
      </div>
      <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ display: 'grid', gap: 14 }}>
          {[
            { label: 'Valor do Imóvel', value: valorImovel, set: setValorImovel, min: 50000, max: 5000000, step: 10000 },
            { label: 'Entrada', value: entrada, set: setEntrada, min: 0, max: valorImovel * 0.8, step: 5000 },
            { label: 'Prazo (meses)', value: prazo, set: setPrazo, min: 12, max: 240, step: 12 },
            { label: 'Valor do Balão', value: balao, set: setBalao, min: 0, max: 100000, step: 2500 },
          ].map(({ label, value, set, min, max, step }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: D.muted }}>{label}</span>
                <strong style={{ color: D.ink }}>{label.includes('Prazo') ? value + ' meses' : fmt(value)}</strong>
              </div>
              <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(Number(e.target.value))} aria-label={label} aria-valuetext={label.includes('Prazo') ? value + ' meses' : fmt(value)} style={{ width: '100%', accentColor: D.bronze, height: 4 }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            {(['anual', 'semestral'] as const).map(f => (
              <button key={f} onClick={() => setFreq(f)} style={{ flex: 1, padding: '7px 0', borderRadius: 2, border: '1px solid ' + (freq === f ? D.bronze : D.line), background: freq === f ? D.bronze : 'transparent', color: freq === f ? '#fff' : D.ink, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Balão {f}
              </button>
            ))}
          </div>
        </div>
        <div style={{ background: D.sidebar, borderRadius: 3, padding: 20, color: D.onDark }}>
          <div style={{ fontSize: 11, color: D.onDarkMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Parcela mensal estimada</div>
          <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, color: D.orange, margin: '8px 0', letterSpacing: '-0.025em' }}>{fmt(parcela)}</div>
          <div style={{ display: 'grid', gap: 8, marginTop: 16, fontSize: 13 }}>
            {[['Entrada', entrada, D.orange], ['Total balões (' + freq + ')', totalBaloes, '#8a6f49'], ['Saldo parcelado', saldoParc, '#5c5446']].map(([l, v, cor]) => (
              <div key={String(l)} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: D.onDarkMuted }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: String(cor) }} />{String(l)}
                </span>
                <strong>{fmt(Number(v))}</strong>
              </div>
            ))}
            {cubAjuste > 0 && (
              <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(210,78,34,0.12)', borderRadius: 2, fontSize: 12 }}>
                <div style={{ color: D.bronze, fontWeight: 600 }}>Reajuste CUB estimado</div>
                <div style={{ color: D.onDarkMuted }}>{fmt(parcela * (1 + (cub?.variacao_mensal ?? 0) / 100))}/mês após reajuste anual</div>
              </div>
            )}
          </div>
          <a href={'https://api.whatsapp.com/send?phone=5548991642332&text=Ol%C3%A1!%20Simulei%20e%20cabe%20' + encodeURIComponent(fmt(parcela)) + '%20por%20m%C3%AAs.%20Quero%20saber%20mais!'} target="_blank" rel="noopener noreferrer"
            style={{ marginTop: 20, background: '#25d366', color: '#fff', borderRadius: 2, padding: '11px', textAlign: 'center', textDecoration: 'none', fontWeight: 700, fontSize: 14, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Enviar simulação p/ cliente
          </a>
        </div>
      </div>
    </div>
  )
}

function TabelaUnidades({ emp, cub }: { emp: Emp; cub: Cub | null }) {
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todas' | 'disponiveis'>('disponiveis')

  useEffect(() => {
    fetch('/api/admin/unidades?empreendimento_id=' + emp.id)
      .then(r => r.json()).then(d => { setUnidades(d.data ?? []); setLoading(false) })
  }, [emp.id])

  const lista = filtro === 'disponiveis' ? unidades.filter(unidadeDisponivel) : unidades
  const disponiveis = unidades.filter(unidadeDisponivel).length
  // Distinguir "nunca importei o estoque desse empreendimento" (array vazio)
  // de "esgotado de verdade" (tem unidades cadastradas, nenhuma disponível)
  // — antes as duas situações mostravam a mesma "0 disponíveis" ambígua.
  const estoqueNaoImportado = unidades.length === 0

  async function toggleDisp(u: Unidade) {
    const novoDisponivel = !unidadeDisponivel(u)
    await fetch('/api/admin/unidades', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, disponivel: novoDisponivel, situacao: novoDisponivel ? 'disponivel' : 'vendida' }) })
    setUnidades(prev => prev.map(x => x.id === u.id ? { ...x, disponivel: novoDisponivel, situacao: novoDisponivel ? 'disponivel' : 'vendida' } : x))
  }

  const msg = (u: Unidade) => encodeURIComponent('Olá! Tenho interesse na Unidade ' + u.unidade + ' do ' + emp.nome + ' — ' + u.metragem + 'm², R$' + (u.valor_tabela?.toLocaleString('pt-BR') ?? '?'))
  const wppUrl = (u: Unidade) => 'https://api.whatsapp.com/send?phone=5548991642332&text=' + msg(u)

  return (
    <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 3 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid ' + D.line, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <span style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontWeight: 700, fontSize: 14, color: D.ink }}>{emp.nome}</span>
          {estoqueNaoImportado ? (
            <span style={{ marginLeft: 10, fontSize: 12, color: D.muted, fontWeight: 600 }}>Estoque não importado</span>
          ) : (
            <span style={{ marginLeft: 10, fontSize: 12, color: D.green, fontWeight: 600 }}>{disponiveis} disponíveis</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {(['todas', 'disponiveis'] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{ padding: '6px 14px', borderRadius: 2, border: '1px solid ' + (filtro === f ? D.bronze : D.line), background: filtro === f ? D.bronze : 'transparent', color: filtro === f ? '#fff' : D.ink, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {f === 'todas' ? 'Todas' : 'Disponíveis'}
            </button>
          ))}
        </div>
      </div>
      {loading ? <div style={{ padding: 32, textAlign: 'center', color: D.muted }}>Carregando...</div> : lista.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: D.muted }}>Nenhuma unidade{filtro === 'disponiveis' ? ' disponível' : ''}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>Unidades disponíveis do empreendimento {emp.nome}</caption>
            <thead><tr style={{ background: D.bg }}>
              {['Unidade', 'Metragem', 'Dorms', 'Valor Tabela', 'Promoção', 'Condições', 'Status', 'Ação'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.06em', color: D.muted, fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid ' + D.line }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {lista.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: '1px solid ' + D.line, background: i % 2 === 0 ? D.surface : D.bg }}>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: D.ink }}>{u.bloco ? u.bloco + ' · ' : ''}{u.unidade}</td>
                  <td style={{ padding: '10px 16px', color: D.ink }}>{u.metragem}m²</td>
                  <td style={{ padding: '10px 16px', color: D.ink }}>{u.dormitorios ?? '—'}</td>
                  <td style={{ padding: '10px 16px', color: D.ink, fontWeight: 600 }}>{u.valor_tabela ? fmt(u.valor_tabela) : '—'}</td>
                  <td style={{ padding: '10px 16px', color: D.green, fontWeight: 600 }}>{u.valor_promocional ? fmt(u.valor_promocional) : '—'}</td>
                  <td style={{ padding: '10px 16px', color: D.muted, maxWidth: 200, fontSize: 12 }}>{u.condicoes_negociacao ?? '—'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <button onClick={() => toggleDisp(u)} style={{ background: unidadeDisponivel(u) ? '#22c55e22' : '#ef444422', color: unidadeDisponivel(u) ? D.green : D.red, border: '1px solid ' + (unidadeDisponivel(u) ? D.green : D.red) + '44', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 28 }}>
                      {unidadeDisponivel(u) ? 'Disponível' : 'Vendida'}
                    </button>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <a href={wppUrl(u)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#25d366', color: '#fff', borderRadius: 2, padding: '6px 12px', fontSize: 12, textDecoration: 'none', fontWeight: 700, minHeight: 32, whiteSpace: 'nowrap' }}>
                      WhatsApp
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function LeadCard({ lead, onDragStart, onSelect }: { lead: Lead; onDragStart: (id: string) => void; onSelect: (lead: Lead) => void }) {
  const t = tempInfo(lead.temperatura)
  const score = lead.lead_score ?? 0
  const diasDesde = lead.created_at ? Math.floor((Date.now() - new Date(lead.created_at).getTime()) / 86400000) : 0
  const esfriando = diasDesde > 14 && lead.estagio_funil !== 'fechado' && score < 40

  return (
    <div draggable onDragStart={(e) => { e.stopPropagation(); onDragStart(lead.id) }} onClick={() => onSelect(lead)}
      style={{ background: '#fff', borderRadius: 8, padding: '10px 11px', marginBottom: 8, border: '1px solid ' + D.line, borderLeft: '4px solid ' + t.cor, cursor: 'grab', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: D.ink, lineHeight: 1.25 }}>{lead.nome || '+' + lead.whatsapp}</span>
        <span title={t.label} style={{ fontSize: 11, fontWeight: 700, color: t.cor, whiteSpace: 'nowrap' }}>{t.emoji}</span>
      </div>
      {lead.empreendimentos?.nome && <div style={{ fontSize: 11, color: D.muted, marginTop: 3 }}>{lead.empreendimentos.nome}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
        {lead.origem && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: D.bg, color: D.muted }}>{lead.origem}</span>}
        {typeof lead.orcamento_max === 'number' && lead.orcamento_max > 0 && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: D.bg, color: D.muted }}>{fmt(lead.orcamento_max)}</span>}
        {esfriando && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: '#EFF6FF', color: '#1D4ED8', fontWeight: 700 }}>❄ esfriando</span>}
        {lead.requer_atencao && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'rgba(210,78,34,0.12)', color: D.bronze, fontWeight: 700 }}>★ atenção</span>}
      </div>
      <div style={{ marginTop: 9 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: D.muted, marginBottom: 3 }}>
          <span>Score</span><span style={{ fontWeight: 700, color: score >= 60 ? D.green : score >= 30 ? '#f59e0b' : D.muted }}>{score}pts</span>
        </div>
        <div style={{ height: 4, borderRadius: 999, background: D.line, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: Math.min(100, score) + '%', background: score >= 60 ? D.green : score >= 30 ? '#f59e0b' : D.muted, borderRadius: 999 }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5, marginTop: 9 }}>
        <a href={'https://wa.me/55' + (lead.whatsapp || '').replace(/\D/g, '')} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
          style={{ flex: 1, background: '#25d366', color: '#fff', borderRadius: 6, padding: '5px 0', fontSize: 11, textAlign: 'center', textDecoration: 'none', fontWeight: 700, minHeight: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>WhatsApp</a>
        <button onClick={(e) => { e.stopPropagation(); onSelect(lead) }} style={{ flex: 1, background: D.bg, color: D.ink, border: '1px solid ' + D.line, borderRadius: 6, padding: '5px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 26 }}>Abrir</button>
      </div>
    </div>
  )
}

function Kanban({ leads, dragId, onDragStart, onDrop, onSelect }: { leads: Lead[]; dragId: string | null; onDragStart: (id: string) => void; onDrop: (estagio: string) => void; onSelect: (lead: Lead) => void }) {
  const [hoverCol, setHoverCol] = useState<string | null>(null)
  return (
    <div style={{ overflowX: 'auto', paddingBottom: 12 }}>
      <div style={{ display: 'flex', gap: 12, minWidth: 'max-content', alignItems: 'flex-start' }}>
        {ESTAGIOS.map(col => {
          const colLeads = leads.filter(l => l.estagio_funil === col.key)
          const isHover = hoverCol === col.key
          return (
            <div key={col.key} onDragOver={(e) => { e.preventDefault(); setHoverCol(col.key) }} onDragLeave={() => setHoverCol(h => h === col.key ? null : h)} onDrop={() => { onDrop(col.key); setHoverCol(null) }}
              style={{ width: 250, flexShrink: 0, background: D.surface, border: '1px solid ' + (isHover ? col.cor : D.line), borderRadius: 12, padding: 10, boxShadow: isHover ? '0 0 0 2px ' + col.cor + '55' : 'none', transition: 'box-shadow .12s, border-color .12s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: '2px solid ' + col.cor }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: col.cor }} />
                <span style={{ fontWeight: 700, fontSize: 12, color: D.ink }}>{col.label}</span>
                <span style={{ marginLeft: 'auto', background: col.cor, color: '#fff', borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{colLeads.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 560, overflowY: 'auto' }}>
                {colLeads.length === 0 ? (
                  <div style={{ color: D.muted, fontSize: 12, textAlign: 'center', padding: '20px 0' }}>{isHover ? 'Solte aqui' : 'Arraste leads para cá'}</div>
                ) : colLeads.map(lead => (
                  <div key={lead.id} style={{ opacity: dragId === lead.id ? 0.4 : 1 }}>
                    <LeadCard lead={lead} onDragStart={onDragStart} onSelect={onSelect} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LeadModal({ lead, onClose, onUpdated, onDeleted }: { lead: Lead; onClose: () => void; onUpdated: (l: Lead) => void; onDeleted: (id: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [novaNota, setNovaNota] = useState('')
  const [temp, setTemp] = useState<number>(lead.temperatura ?? 1)
  const [form, setForm] = useState({ nome: lead.nome ?? '', whatsapp: lead.whatsapp ?? '', email: lead.email ?? '', origem: lead.origem ?? 'Site', orcamento_max: lead.orcamento_max != null ? String(lead.orcamento_max) : '' })

  const parseNotas = (raw?: string | null): { data: string; texto: string }[] => {
    if (!raw) return []
    try { const j = JSON.parse(raw); if (Array.isArray(j)) return j } catch {}
    return raw.trim() ? [{ data: '', texto: raw }] : []
  }
  const [notas, setNotas] = useState(parseNotas(lead.anotacoes))

  useEffect(() => {
    fetch('/api/admin/leads/' + lead.id + '/eventos').then(r => r.json()).then(d => setEventos(d.eventos ?? [])).catch(() => setEventos([]))
  }, [lead.id])

  const timeline = [
    ...notas.map(n => ({ kind: 'nota' as const, data: n.data, texto: n.texto })),
    ...eventos.map(e => ({ kind: 'evento' as const, data: e.created_at, texto: e.descricao || (e.tipo === 'download' ? 'Baixou catálogo' : e.tipo === 'visita' ? 'Visitou página' : (e.slug || e.tipo || '').replace(/-/g, ' ')) })),
  ].sort((a, b) => (b.data || '').localeCompare(a.data || ''))

  async function salvarTemp(v: number) {
    setTemp(v)
    await fetch('/api/admin/leads/' + lead.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ temperatura: v }) })
    onUpdated({ ...lead, temperatura: v })
  }

  async function adicionarNota() {
    if (!novaNota.trim()) return
    setSaving(true)
    const nova = { data: new Date().toISOString(), texto: novaNota.trim() }
    const atual = [nova, ...notas]
    const res = await fetch('/api/admin/leads/' + lead.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ anotacoes: JSON.stringify(atual) }) })
    setSaving(false)
    if (res.ok) { setNotas(atual); setNovaNota(''); onUpdated({ ...lead, anotacoes: JSON.stringify(atual) }) }
  }

  async function salvarEdicao() {
    setSaving(true)
    const payload = { nome: form.nome, whatsapp: form.whatsapp, email: form.email || null, origem: form.origem, orcamento_max: form.orcamento_max ? Number(form.orcamento_max) : null }
    const res = await fetch('/api/admin/leads/' + lead.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    if (res.ok) { const upd = { ...lead, ...payload }; onUpdated(upd); setEditing(false) }
  }

  async function excluir() {
    await fetch('/api/admin/leads/' + lead.id, { method: 'DELETE' })
    onDeleted(lead.id)
  }

  const est = ESTAGIOS.find(e => e.key === lead.estagio_funil)
  const t = tempInfo(temp)
  const inputCss = { width: '100%', border: '1.5px solid #e4e4e7', borderRadius: 8, padding: '9px 11px', fontSize: 14, color: '#18181b', background: '#fff', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' }
  const labelCss = { display: 'block', fontSize: 11, fontWeight: 700, color: '#52525b', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 5, marginTop: 14 }

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose() }} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: 16 }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 560, maxHeight: '88vh', overflowY: 'auto', background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ background: est?.cor ?? D.bronze, padding: '18px 22px', borderRadius: '16px 16px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div>
              <h2 style={{ color: '#fff', fontSize: 19, fontWeight: 800, margin: 0 }}>{lead.nome || '+' + lead.whatsapp}</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, margin: '4px 0 0' }}>{est?.label ?? lead.estagio_funil} · {lead.origem ?? 'origem desconhecida'}</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => { setEditing(true); setConfirmDelete(false) }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Editar</button>
              <button onClick={() => { setConfirmDelete(true); setEditing(false) }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FCA5A5', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Excluir</button>
              <button onClick={onClose} aria-label="Fechar" style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
          </div>
        </div>

        <div style={{ padding: 22 }}>
          {confirmDelete && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <p style={{ margin: '0 0 10px', fontSize: 14, color: '#991B1B', fontWeight: 600 }}>Excluir este lead permanentemente? Essa ação não pode ser desfeita.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={excluir} style={{ flex: 1, background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Sim, excluir</button>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              </div>
            </div>
          )}

          <label style={labelCss}>Qualificação</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {TEMPERATURAS.map(x => (
              <button key={x.v} onClick={() => salvarTemp(x.v)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1.5px solid ' + (temp === x.v ? x.cor : D.line), background: temp === x.v ? x.cor + '18' : '#fff', color: temp === x.v ? x.cor : D.muted, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {x.emoji} {x.label}
              </button>
            ))}
          </div>

          {editing ? (
            <div style={{ marginTop: 6 }}>
              <label style={labelCss} htmlFor="crm-lead-nome">Nome</label>
              <input id="crm-lead-nome" style={inputCss} value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
              <label style={labelCss} htmlFor="crm-lead-whatsapp">WhatsApp</label>
              <input id="crm-lead-whatsapp" style={inputCss} value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} />
              <label style={labelCss} htmlFor="crm-lead-email">E-mail</label>
              <input id="crm-lead-email" style={inputCss} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              <label style={labelCss} htmlFor="crm-lead-origem">Origem</label>
              <select id="crm-lead-origem" style={inputCss} value={form.origem} onChange={e => setForm(p => ({ ...p, origem: e.target.value }))}>
                {['Site', 'Instagram', 'Indicacao', 'Portal', 'Anuncio', 'Evento', 'Whatsapp', 'Outro'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <label style={labelCss} htmlFor="crm-lead-orcamento">Orçamento máx (R$)</label>
              <input id="crm-lead-orcamento" type="number" style={inputCss} value={form.orcamento_max} onChange={e => setForm(p => ({ ...p, orcamento_max: e.target.value }))} />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={salvarEdicao} disabled={saving} style={{ flex: 1, background: D.bronze, color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
                <button onClick={() => setEditing(false)} style={{ flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
              <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>Detalhes do lead selecionado</caption>
              <tbody>
                {[
                  ['WhatsApp', <a key="w" href={'https://wa.me/55' + (lead.whatsapp || '').replace(/\D/g, '')} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none' }}>{lead.whatsapp} ↗</a>],
                  ['E-mail', lead.email ? <a key="e" href={'mailto:' + lead.email} style={{ color: D.bronze, textDecoration: 'none' }}>{lead.email}</a> : '—'],
                  ['Empreendimento', lead.empreendimentos?.nome ?? lead.property_name ?? '—'],
                  ['Orçamento', lead.orcamento_max ? fmt(lead.orcamento_max) : '—'],
                  ['Score', lead.lead_score ?? '—'],
                  ['Recebido em', lead.created_at ? new Date(lead.created_at).toLocaleString('pt-BR') : '—'],
                ].map(([k, v], i) => (
                  <tr key={i}>
                    <td style={{ color: '#8a8a85', padding: '8px 0', borderBottom: '1px solid #F3F2EE', fontSize: 13, width: '38%' }}>{k}</td>
                    <td style={{ padding: '8px 0', borderBottom: '1px solid #F3F2EE', fontSize: 14, fontWeight: 600 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <label style={labelCss}>Linha do tempo</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input value={novaNota} onChange={e => setNovaNota(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') adicionarNota() }} placeholder="Adicionar anotação..." aria-label="Nova anotação da linha do tempo" style={{ ...inputCss, marginTop: 0 }} />
            <button onClick={adicionarNota} disabled={saving || !novaNota.trim()} style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: (saving || !novaNota.trim()) ? 0.5 : 1, whiteSpace: 'nowrap' }}>
              {saving ? '...' : 'Salvar'}
            </button>
          </div>
          {timeline.length === 0 ? (
            <p style={{ fontSize: 13, color: '#8a8a85', margin: 0 }}>Nenhuma atividade ainda. Adicione a primeira anotação acima.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxHeight: 240, overflowY: 'auto', borderLeft: '2px solid ' + D.line, paddingLeft: 14, marginLeft: 4 }}>
              {timeline.map((item, i) => (
                <div key={i} style={{ position: 'relative', paddingBottom: 14 }}>
                  <span style={{ position: 'absolute', left: -21, top: 3, width: 10, height: 10, borderRadius: '50%', background: item.kind === 'nota' ? D.bronze : D.blue, border: '2px solid #fff' }} />
                  <div style={{ fontSize: 13, color: D.ink, lineHeight: 1.4 }}>{item.texto}</div>
                  <div style={{ fontSize: 11, color: '#8a8a85', marginTop: 2 }}>{item.kind === 'nota' ? '📝 ' : '👁 '}{item.data ? new Date(item.data).toLocaleString('pt-BR') : ''}</div>
                </div>
              ))}
            </div>
          )}

          <label style={labelCss}>Conversa WhatsApp</label>
          <ConversaPanel leadId={lead.id} />

          <a href={'https://wa.me/55' + (lead.whatsapp || '').replace(/\D/g, '')} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 18, background: '#25D366', color: '#fff', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
            Abrir no WhatsApp (app)
          </a>
        </div>
      </div>
    </div>
  )
}

type Tab = 'funil' | 'disponibilidade' | 'simulador' | 'clientes'

const TABS_VALIDAS: Tab[] = ['funil', 'disponibilidade', 'simulador', 'clientes']

export default function CrmPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [leads, setLeads] = useState<Lead[]>([])
  const [emps, setEmps] = useState<Emp[]>([])
  const [cub, setCub] = useState<Cub | null>(null)
  const [empSel, setEmpSel] = useState<Emp | null>(null)
  const [tab, setTab] = useState<Tab>(() => {
    const t = searchParams.get('tab')
    return (TABS_VALIDAS as string[]).includes(t ?? '') ? (t as Tab) : 'funil'
  })
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Lead | null>(null)

  // Sincroniza aba e lead aberto na URL — bookmark/reload/voltar-avançar do
  // navegador preservam a tela, em vez de sempre reabrir na aba "Funil".
  function mudarTab(novaTab: Tab) {
    setTab(novaTab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', novaTab)
    router.push(pathname + '?' + params.toString(), { scroll: false })
  }

  function abrirLead(lead: Lead) {
    setSelected(lead)
    const params = new URLSearchParams(searchParams.toString())
    params.set('leadId', lead.id)
    router.push(pathname + '?' + params.toString(), { scroll: false })
  }

  function fecharLead() {
    setSelected(null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('leadId')
    const query = params.toString()
    router.push(pathname + (query ? '?' + query : ''), { scroll: false })
  }

  // Restaura o lead aberto a partir de ?leadId= assim que a lista carregar.
  useEffect(() => {
    if (selected || leads.length === 0) return
    const leadId = searchParams.get('leadId')
    if (!leadId) return
    const lead = leads.find((l) => l.id === leadId)
    if (lead) setSelected(lead)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads])

  const load = useCallback(async () => {
    const [lRes, eRes, cRes] = await Promise.all([
      fetch('/api/admin/leads').then(r => r.json()),
      fetch('/api/admin/empreendimentos').then(r => r.json()),
      fetch('/api/admin/cub').then(r => r.json()),
    ])
    setLeads(Array.isArray(lRes) ? lRes : (lRes.data ?? []))
    const empList = eRes.data ?? []
    setEmps(empList)
    setEmpSel(prev => prev ?? (empList.length > 0 ? empList[0] : null))
    setCub(cRes.vigente ?? null)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function moverLead(id: string, estagio: string) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, estagio_funil: estagio } : l))
    try {
      await fetch('/api/admin/leads/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estagio_funil: estagio }) })
    } catch { load() }
  }

  function onDrop(estagio: string) {
    if (dragId) { moverLead(dragId, estagio); setDragId(null) }
  }

  const termo = busca.trim().toLowerCase()
  const leadsFiltrados = termo ? leads.filter(l => (l.nome || '').toLowerCase().includes(termo) || (l.whatsapp || '').includes(termo)) : leads

  const TABS: { key: Tab; label: string }[] = [
    { key: 'funil', label: 'Funil de Leads' },
    { key: 'disponibilidade', label: 'Disponibilidade' },
    { key: 'simulador', label: 'Simulador Direto' },
    { key: 'clientes', label: 'Clientes' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: 'clamp(16px,2vw,28px) clamp(16px,3vw,32px)' }}>
        <div style={{ marginBottom: 20 }}>
          <WidgetCub cub={cub} onSaved={load} />
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', borderBottom: '1px solid ' + D.line }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => mudarTab(t.key)} style={{ padding: '10px 20px', border: 'none', background: 'transparent', fontSize: 14, fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? D.bronze : D.muted, borderBottom: '2px solid ' + (tab === t.key ? D.bronze : 'transparent'), cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44 }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 48, color: D.muted }}>Carregando...</div>}

        {!loading && tab === 'funil' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 18 }}>
              {[
                { l: 'Total Leads', v: leads.length, cor: D.blue },
                { l: 'Novos', v: leads.filter(l => l.estagio_funil === 'primeiro_contato').length, cor: '#6b7280' },
                { l: 'Em Negociação', v: leads.filter(l => l.estagio_funil === 'negociacao').length, cor: D.bronze },
                { l: 'Fechados', v: leads.filter(l => l.estagio_funil === 'fechado').length, cor: D.green },
                { l: 'Quentes', v: leads.filter(l => l.temperatura === 3).length, cor: D.red },
              ].map(({ l, v, cor }) => (
                <div key={l} style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 10, padding: '14px 16px', borderTop: '3px solid ' + cor }}>
                  <div style={{ fontSize: 10, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{l}</div>
                  <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 24, fontWeight: 800, color: cor }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar nome ou WhatsApp..." aria-label="Buscar lead por nome ou WhatsApp" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontSize: 14, outline: 'none', minWidth: 260 }} />
            </div>

            <Kanban leads={leadsFiltrados} dragId={dragId} onDragStart={setDragId} onDrop={onDrop} onSelect={abrirLead} />
          </div>
        )}

        {!loading && tab === 'disponibilidade' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {emps.map(e => (
                <button key={e.id} onClick={() => setEmpSel(e)} style={{ padding: '8px 16px', borderRadius: 2, border: '1px solid ' + (empSel?.id === e.id ? D.bronze : D.line), background: empSel?.id === e.id ? D.bronze : 'transparent', color: empSel?.id === e.id ? '#fff' : D.ink, fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 40 }}>
                  {e.nome}
                </button>
              ))}
            </div>
            {empSel && <TabelaUnidades emp={empSel} cub={cub} />}
          </div>
        )}

        {!loading && tab === 'simulador' && <SimuladorFluxo cub={cub} />}

        {!loading && tab === 'clientes' && (
          <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 10, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 18, fontWeight: 700, margin: 0, color: D.ink }}>Módulo de Clientes</h2>
              <a href="/dashboard/clientes" style={{ background: D.bronze, color: '#fff', borderRadius: 2, padding: '9px 20px', textDecoration: 'none', fontWeight: 700, fontSize: 13, minHeight: 40, display: 'inline-flex', alignItems: 'center' }}>Acessar completo</a>
            </div>
            <p style={{ color: D.muted, fontSize: 14, margin: 0 }}>Gerencie clientes, proprietários e parceiros. Acesse o módulo completo para CRUD, busca avançada e histórico de interações.</p>
          </div>
        )}
      </div>

      {selected && (
        <LeadModal lead={selected} onClose={fecharLead} onUpdated={(l) => { setLeads(prev => prev.map(x => x.id === l.id ? l : x)); setSelected(l) }} onDeleted={(id) => { setLeads(prev => prev.filter(x => x.id !== id)); fecharLead() }} />
      )}
    </div>
  )
}
