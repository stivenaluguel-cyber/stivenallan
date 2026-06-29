'use client'
import { useState, useEffect, useCallback } from 'react'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', sidebar: '#131211', ink: '#161512',
  bronze: '#D24E22', orange: '#FF6A3D', muted: '#6B655B',
  line: 'rgba(26,24,21,0.08)', lineDark: 'rgba(245,241,234,0.14)',
  green: '#22c55e', red: '#ef4444', blue: '#3b82f6',
  onDark: '#F3F2EE', onDarkMuted: 'rgba(245,241,234,0.65)',
}
const ff = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const fmt = (n: number) => 'R$\u00a0' + Math.round(n).toLocaleString('pt-BR')

type Lead = { id: string; nome?: string; whatsapp: string; estagio_funil: string; lead_score: number; requer_atencao: boolean; origem?: string; orcamento_max?: number; perfil?: string }
type Unidade = { id: string; unidade: string; bloco?: string; metragem: number; dormitorios?: number; disponivel: boolean; valor_tabela?: number; valor_promocional?: number; condicoes_negociacao?: string }
type Emp = { id: string; nome: string; status_venda: string; status_obra?: string }
type Cub = { id: string; mes_referencia: string; valor_m2: number; variacao_mensal?: number; fonte?: string }

const ESTAGIOS = [
  { key: 'primeiro_contato', label: 'Novo', cor: '#6b7280' },
  { key: 'qualificado', label: 'Qualificado', cor: '#3b82f6' },
  { key: 'interessado', label: 'Interessado', cor: '#8b5cf6' },
  { key: 'proposta_enviada', label: 'Proposta', cor: '#f59e0b' },
  { key: 'visita_agendada', label: 'Visita', cor: '#ec4899' },
  { key: 'negociacao', label: 'Negociação', cor: '#D24E22' },
  { key: 'fechado', label: 'Fechado', cor: '#22c55e' },
]

// ========================= WIDGET CUB ========================= //
function WidgetCub({ cub, onSaved }: { cub: Cub | null; onSaved: () => void }) {
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  async function atualizarCub() {
    setSaving(true)
    setStatus('')
    try {
      // 1. Busca o valor atual do SINDUSCON via nossa API route
      const res = await fetch('/api/cub', { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao consultar SINDUSCON (' + res.status + ')')
      const data = await res.json()

      // 2. Persiste no backend (Supabase via /api/admin/cub)
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
      setStatus(data.online
        ? 'Atualizado pelo SINDUSCON — ' + labelCap
        : 'SINDUSCON indisponível — valor de referência aplicado (' + labelCap + ')')
      onSaved()
    } catch (e: unknown) {
      setStatus('Não foi possível atualizar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  function fmt(v: number) {
    return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  }

  return (
    <div style={{ background: D.sidebar, border: '1px solid ' + D.lineDark, borderRadius: 12, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: D.onDarkMuted, marginBottom: 4 }}>
          CUB/SC VIGENTE · SINDUSCON-SC
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: D.bronze }}>
            {cub ? fmt(cub.valor_m2) + '/m²' : 'Sem CUB cadastrado'}
          </span>
          {cub?.variacao_mensal && (
            <span style={{ fontSize: 13, color: cub.variacao_mensal > 0 ? D.green : D.red, fontWeight: 600 }}>
              {cub.variacao_mensal > 0 ? '+' : ''}{cub.variacao_mensal.toFixed(2)}% mês
            </span>
          )}
        </div>
        {cub && (
          <span style={{ fontSize: 12, color: D.onDarkMuted }}>
            {new Date(cub.mes_referencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
        )}
        {status && (
          <p style={{ margin: '6px 0 0', fontSize: 12, color: D.onDarkMuted, fontStyle: 'italic' }}>
            {status}
          </p>
        )}
      </div>
      <button
        onClick={atualizarCub}
        disabled={saving}
        style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 2, padding: '9px 20px', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
      >
        {saving ? 'Atualizando...' : 'Atualizar CUB'}
      </button>
    </div>
  )
}


// ================= SIMULADOR FLUXO DIRETO =================
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
              <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => set(Number(e.target.value))}
                style={{ width: '100%', accentColor: D.bronze, height: 4 }} />
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
            {[['Entrada', entrada, D.orange],['Total balões (' + freq + ')', totalBaloes, '#8a6f49'],['Saldo parcelado', saldoParc, '#5c5446']].map(([l, v, cor]) => (
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
          <a href={'https://api.whatsapp.com/send?phone=5548991455522&text=Ol%C3%A1!%20Simul ei%20e%20cabe%20' + encodeURIComponent(fmt(parcela)) + '%20por%20m%C3%AAs.%20Quero%20saber%20mais!'}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', marginTop: 20, background: '#25d366', color: '#fff', borderRadius: 2, padding: '11px', textAlign: 'center', textDecoration: 'none', fontWeight: 700, fontSize: 14, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Enviar simulação p/ cliente
          </a>
        </div>
      </div>
    </div>
  )
}
// ================= TABELA DE UNIDADES =================
function TabelaUnidades({ emp, cub }: { emp: Emp; cub: Cub | null }) {
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todas' | 'disponiveis'>('disponiveis')

  useEffect(() => {
    fetch('/api/admin/unidades?empreendimento_id=' + emp.id)
      .then(r => r.json()).then(d => { setUnidades(d.data ?? []); setLoading(false) })
  }, [emp.id])

  const lista = filtro === 'disponiveis' ? unidades.filter(u => u.disponivel) : unidades
  const disponiveis = unidades.filter(u => u.disponivel).length

  async function toggleDisp(u: Unidade) {
    await fetch('/api/admin/unidades', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, disponivel: !u.disponivel }) })
    setUnidades(prev => prev.map(x => x.id === u.id ? { ...x, disponivel: !x.disponivel } : x))
  }

  const msg = (u: Unidade) => encodeURIComponent('Olá! Tenho interesse na Unidade ' + u.unidade + ' do ' + emp.nome + ' â ' + u.metragem + 'm², R$' + (u.valor_tabela?.toLocaleString('pt-BR') ?? '?'))
  const wppUrl = (u: Unidade) => 'https://api.whatsapp.com/send?phone=5548991455522&text=' + msg(u)

  return (
    <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 3 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid ' + D.line, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <span style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontWeight: 700, fontSize: 14, color: D.ink }}>{emp.nome}</span>
          <span style={{ marginLeft: 10, fontSize: 12, color: D.green, fontWeight: 600 }}>{disponiveis} disponíveis</span>
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
            <thead><tr style={{ background: D.bg }}>
              {['Unidade','Metragem','Dorms','Valor Tabela','Promoção','Condições','Status','Ação'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.06em', color: D.muted, fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid ' + D.line }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {lista.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: '1px solid ' + D.line, background: i % 2 === 0 ? D.surface : D.bg }}>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: D.ink }}>{u.bloco ? u.bloco + ' · ' : ''}{u.unidade}</td>
                  <td style={{ padding: '10px 16px', color: D.ink }}>{u.metragem}m²</td>
                  <td style={{ padding: '10px 16px', color: D.ink }}>{u.dormitorios ?? 'â'}</td>
                  <td style={{ padding: '10px 16px', color: D.ink, fontWeight: 600 }}>{u.valor_tabela ? fmt(u.valor_tabela) : 'â'}</td>
                  <td style={{ padding: '10px 16px', color: D.green, fontWeight: 600 }}>{u.valor_promocional ? fmt(u.valor_promocional) : 'â'}</td>
                  <td style={{ padding: '10px 16px', color: D.muted, maxWidth: 200, fontSize: 12 }}>{u.condicoes_negociacao ?? 'â'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <button onClick={() => toggleDisp(u)} style={{ background: u.disponivel ? '#22c55e22' : '#ef444422', color: u.disponivel ? D.green : D.red, border: '1px solid ' + (u.disponivel ? D.green : D.red) + '44', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 28 }}>
                      {u.disponivel ? 'Disponível' : 'Vendida'}
                    </button>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <a href={wppUrl(u)} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#25d366', color: '#fff', borderRadius: 2, padding: '6px 12px', fontSize: 12, textDecoration: 'none', fontWeight: 700, minHeight: 32, whiteSpace: 'nowrap' }}>
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
// ================= KANBAN =================
function Kanban({ leads, onMove }: { leads: Lead[]; onMove: (id: string, estagio: string) => void }) {
  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
      <div style={{ display: 'flex', gap: 10, minWidth: 'max-content' }}>
        {ESTAGIOS.map(col => {
          const colLeads = leads.filter(l => l.estagio_funil === col.key)
          return (
            <div key={col.key} style={{ width: 200, flexShrink: 0 }}>
              <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '2px solid ' + col.cor, background: col.cor + '14', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: col.cor }}>{col.label}</span>
                  <span style={{ background: col.cor, color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{colLeads.length}</span>
                </div>
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 460, overflowY: 'auto' }}>
                  {colLeads.length === 0 ? (
                    <div style={{ color: D.muted, fontSize: 12, textAlign: 'center', padding: '16px 0' }}>Vazio</div>
                  ) : colLeads.map(lead => (
                    <div key={lead.id} style={{ background: D.bg, borderRadius: 2, padding: '9px 11px', border: '1px solid ' + (lead.requer_atencao ? D.bronze : D.line) }}>
                      {lead.requer_atencao && <div style={{ fontSize: 10, color: D.bronze, fontWeight: 700, marginBottom: 3 }}>ATENÇÃO</div>}
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: D.ink }}>{lead.nome ?? '+' + lead.whatsapp}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: D.muted }}>{lead.perfil !== 'indefinido' ? lead.perfil : lead.origem}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: lead.lead_score >= 60 ? D.green : lead.lead_score >= 30 ? '#f59e0b' : D.muted }}>{lead.lead_score}pts</span>
                      </div>
                      {lead.orcamento_max && <div style={{ fontSize: 10, color: D.muted, marginBottom: 6 }}>{fmt(lead.orcamento_max)}</div>}
                      <div style={{ display: 'flex', gap: 4 }}>
                        <a href={'https://wa.me/' + lead.whatsapp} target="_blank" rel="noopener noreferrer"
                          style={{ flex: 1, background: '#25d366', color: '#fff', borderRadius: 2, padding: '4px 0', fontSize: 11, textAlign: 'center', textDecoration: 'none', fontWeight: 700, minHeight: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>WPP</a>
                        <select value={lead.estagio_funil} onChange={e => onMove(lead.id, e.target.value)}
                          style={{ flex: 1, background: D.surface, border: '1px solid ' + D.line, borderRadius: 2, fontSize: 10, padding: '4px', cursor: 'pointer', color: D.ink }}>
                          {ESTAGIOS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ================= PÁGINA PRINCIPAL =================
type Tab = 'funil' | 'disponibilidade' | 'simulador' | 'clientes'

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [emps, setEmps] = useState<Emp[]>([])
  const [cub, setCub] = useState<Cub | null>(null)
  const [empSel, setEmpSel] = useState<Emp | null>(null)
  const [tab, setTab] = useState<Tab>('funil')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [lRes, eRes, cRes] = await Promise.all([
      fetch('/api/admin/leads?limit=200').then(r => r.json()),
      fetch('/api/admin/empreendimentos').then(r => r.json()),
      fetch('/api/admin/cub').then(r => r.json()),
    ])
    setLeads(lRes.data ?? [])
    const empList = eRes.data ?? []
    setEmps(empList)
    if (empList.length > 0 && !empSel) setEmpSel(empList[0])
    setCub(cRes.vigente ?? null)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function moveEstagio(id: string, estagio: string) {
    await fetch('/api/admin/leads/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estagio_funil: estagio }) })
    setLeads(prev => prev.map(l => l.id === id ? { ...l, estagio_funil: estagio } : l))
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'funil', label: 'Funil de Leads' },
    { key: 'disponibilidade', label: 'Disponibilidade' },
    { key: 'simulador', label: 'Simulador Direto' },
    { key: 'clientes', label: 'Clientes' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: 'clamp(16px,2vw,28px) clamp(16px,3vw,32px)' }}>
        {/* WIDGET CUB */}
        <div style={{ marginBottom: 20 }}>
          <WidgetCub cub={cub} onSaved={load} />
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', borderBottom: '1px solid ' + D.line, paddingBottom: 0 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '10px 20px', border: 'none', background: 'transparent', fontSize: 14, fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? D.bronze : D.muted, borderBottom: '2px solid ' + (tab === t.key ? D.bronze : 'transparent'), cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44 }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 48, color: D.muted }}>Carregando...</div>}

        {!loading && tab === 'funil' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 20 }}>
              {[
                { l: 'Total Leads', v: leads.length, cor: D.blue },
                { l: 'Novos', v: leads.filter(l => l.estagio_funil === 'primeiro_contato').length, cor: '#6b7280' },
                { l: 'Em Negociação', v: leads.filter(l => l.estagio_funil === 'negociacao').length, cor: D.bronze },
                { l: 'Fechados', v: leads.filter(l => l.estagio_funil === 'fechado').length, cor: D.green },
                { l: 'Atenção', v: leads.filter(l => l.requer_atencao).length, cor: D.red },
              ].map(({ l, v, cor }) => (
                <div key={l} style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 3, padding: '14px 16px', borderTop: '3px solid ' + cor }}>
                  <div style={{ fontSize: 10, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{l}</div>
                  <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 24, fontWeight: 800, color: cor }}>{v}</div>
                </div>
              ))}
            </div>
            <Kanban leads={leads} onMove={moveEstagio} />
          </div>
        )}

        {!loading && tab === 'disponibilidade' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {emps.map(e => (
                <button key={e.id} onClick={() => setEmpSel(e)}
                  style={{ padding: '8px 16px', borderRadius: 2, border: '1px solid ' + (empSel?.id === e.id ? D.bronze : D.line), background: empSel?.id === e.id ? D.bronze : 'transparent', color: empSel?.id === e.id ? '#fff' : D.ink, fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 40 }}>
                  {e.nome}
                </button>
              ))}
            </div>
            {empSel && <TabelaUnidades emp={empSel} cub={cub} />}
          </div>
        )}

        {!loading && tab === 'simulador' && <SimuladorFluxo cub={cub} />}

        {!loading && tab === 'clientes' && (
          <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 3, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 18, fontWeight: 700, margin: 0, color: D.ink }}>Módulo de Clientes</h2>
              <a href="/dashboard/clientes" style={{ background: D.bronze, color: '#fff', borderRadius: 2, padding: '9px 20px', textDecoration: 'none', fontWeight: 700, fontSize: 13, minHeight: 40, display: 'inline-flex', alignItems: 'center' }}>Acessar completo</a>
            </div>
            <p style={{ color: D.muted, fontSize: 14, margin: 0 }}>Gerencie clientes, proprietários e parceiros. Acesse o módulo completo para CRUD, busca avançada e histórico de interações.</p>
          </div>
        )}
      </div>
    </div>
  )
}
