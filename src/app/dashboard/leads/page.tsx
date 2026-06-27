'use client'
import { useState, useEffect, useCallback } from 'react'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512',
  bronze: '#D24E22', orange: '#FF6A3D', muted: '#6B655B',
  line: 'rgba(26,24,21,0.08)', green: '#22c55e', red: '#ef4444', blue: '#3b82f6',
}
const fmt = (n: number) => 'R$\u00a0' + Math.round(n).toLocaleString('pt-BR')

type Lead = {
  id: string; nome?: string; whatsapp: string; estagio_funil: string
  lead_score: number; requer_atencao: boolean; origem?: string
  orcamento_max?: number; perfil?: string; email?: string
}

const ESTAGIOS = [
  { key: 'primeiro_contato', label: 'Novo Contato', cor: '#6b7280' },
  { key: 'qualificado', label: 'Qualificado', cor: '#3b82f6' },
  { key: 'interessado', label: 'Interessado', cor: '#8b5cf6' },
  { key: 'proposta_enviada', label: 'Proposta Enviada', cor: '#f59e0b' },
  { key: 'visita_agendada', label: 'Visita Agendada', cor: '#ec4899' },
  { key: 'negociacao', label: 'Em Negociacao', cor: '#D24E22' },
  { key: 'fechado', label: 'Fechado', cor: '#22c55e' },
]

const ORIGENS = ['Instagram', 'Indicacao', 'Portal', 'Anuncio', 'Evento', 'Site', 'Whatsapp', 'Outro']

function NovoLeadModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [origem, setOrigem] = useState('Instagram')
  const [orcamento, setOrcamento] = useState('')
  const [estagio, setEstagio] = useState('primeiro_contato')
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  const fmtWpp = (v: string) => v.replace(/\D/g, '').replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')

  async function salvar() {
    if (!whatsapp.replace(/\D/g, '')) { setErro('Telefone obrigatorio'); return }
    setSaving(true)
    setErro('')
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome || undefined,
          whatsapp: whatsapp.replace(/\D/g, ''),
          email: email || undefined,
          origem,
          orcamento_max: orcamento ? parseFloat(orcamento.replace(/\D/g, '')) / 100 : undefined,
          estagio_funil: estagio,
          lead_score: 30,
          requer_atencao: false,
        }),
      })
      if (!res.ok) { const d = await res.json(); setErro(d.error ?? 'Erro ao salvar'); return }
      onSaved()
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: D.surface, borderRadius: 4, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: D.ink }}>+ Novo Lead</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: D.muted }}>x</button>
        </div>
        {erro && <div style={{ background: '#fee', border: '1px solid #fcc', borderRadius: 3, padding: '8px 12px', marginBottom: 14, color: D.red, fontSize: 13 }}>{erro}</div>}
        <div style={{ display: 'grid', gap: 14 }}>
          {[
            { label: 'Nome (opcional)', value: nome, set: setNome, type: 'text', placeholder: 'Nome do lead' },
            { label: 'WhatsApp *', value: whatsapp, set: (v: string) => setWhatsapp(fmtWpp(v)), type: 'tel', placeholder: '(48) 99999-9999' },
            { label: 'E-mail (opcional)', value: email, set: setEmail, type: 'email', placeholder: 'email@exemplo.com' },
          ].map(({ label, value, set, type, placeholder }) => (
            <label key={label}>
              <div style={{ fontSize: 12, color: D.muted, marginBottom: 5, fontWeight: 600 }}>{label}</div>
              <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid ' + D.line, borderRadius: 3, fontSize: 14, background: '#fff', boxSizing: 'border-box', outline: 'none', font: 'inherit' }} />
            </label>
          ))}
          <label>
            <div style={{ fontSize: 12, color: D.muted, marginBottom: 5, fontWeight: 600 }}>Origem</div>
            <select value={origem} onChange={e => setOrigem(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid ' + D.line, borderRadius: 3, fontSize: 14, background: '#fff', font: 'inherit', cursor: 'pointer' }}>
              {ORIGENS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label>
            <div style={{ fontSize: 12, color: D.muted, marginBottom: 5, fontWeight: 600 }}>Estagio inicial</div>
            <select value={estagio} onChange={e => setEstagio(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid ' + D.line, borderRadius: 3, fontSize: 14, background: '#fff', font: 'inherit', cursor: 'pointer' }}>
              {ESTAGIOS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
            </select>
          </label>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', border: '1px solid ' + D.line, borderRadius: 3, background: 'transparent', cursor: 'pointer', fontSize: 14, color: D.ink }}>Cancelar</button>
          <button onClick={salvar} disabled={saving} style={{ padding: '10px 22px', border: 'none', borderRadius: 3, background: D.bronze, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', minHeight: 42 }}>
            {saving ? 'Salvando...' : 'Salvar Lead'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<string>('todos')
  const [busca, setBusca] = useState('')
  const [novoModal, setNovoModal] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/leads?limit=500')
      const d = await res.json()
      setLeads(d.data ?? [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function moverEstagio(id: string, estagio: string) {
    await fetch('/api/admin/leads/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estagio_funil: estagio }) })
    setLeads(prev => prev.map(l => l.id === id ? { ...l, estagio_funil: estagio } : l))
  }

  const leadsFiltrados = leads.filter(l => {
    const passaFiltro = filtro === 'todos' || l.estagio_funil === filtro || (filtro === 'atencao' && l.requer_atencao)
    const passaBusca = !busca || (l.nome ?? '').toLowerCase().includes(busca.toLowerCase()) || l.whatsapp.includes(busca)
    return passaFiltro && passaBusca
  })

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      {novoModal && <NovoLeadModal onClose={() => setNovoModal(false)} onSaved={carregar} />}
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(16px,3vw,32px)' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, letterSpacing: '-0.02em', color: D.ink }}>Gestao de Leads</h1>
            <p style={{ margin: '4px 0 0', color: D.muted, fontSize: 14 }}>{leads.length} leads no total</p>
          </div>
          <button onClick={() => setNovoModal(true)}
            style={{ padding: '11px 22px', border: 'none', borderRadius: 3, background: D.bronze, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center', gap: 8 }}>
            + Novo Lead
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { l: 'Total', v: leads.length, cor: D.blue },
            { l: 'Novos', v: leads.filter(l => l.estagio_funil === 'primeiro_contato').length, cor: '#6b7280' },
            { l: 'Interessados', v: leads.filter(l => l.estagio_funil === 'interessado').length, cor: '#8b5cf6' },
            { l: 'Negociacao', v: leads.filter(l => l.estagio_funil === 'negociacao').length, cor: D.bronze },
            { l: 'Fechados', v: leads.filter(l => l.estagio_funil === 'fechado').length, cor: D.green },
            { l: 'Precisam Atencao', v: leads.filter(l => l.requer_atencao).length, cor: D.red },
          ].map(({ l, v, cor }) => (
            <div key={l} onClick={() => setFiltro(l === 'Precisam Atencao' ? 'atencao' : l === 'Total' ? 'todos' : ESTAGIOS.find(e => e.label.toLowerCase().includes(l.toLowerCase()))?.key ?? 'todos')}
              style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 3, padding: '14px 16px', borderTop: '3px solid ' + cor, cursor: 'pointer' }}>
              <div style={{ fontSize: 10, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{l}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 24, fontWeight: 800, color: cor }}>{v}</div>
            </div>
          ))}
        </div>

        {/* BUSCA + FILTRO */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou telefone..."
            style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: '1px solid ' + D.line, borderRadius: 3, fontSize: 14, background: '#fff', font: 'inherit', outline: 'none' }} />
          <select value={filtro} onChange={e => setFiltro(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid ' + D.line, borderRadius: 3, fontSize: 14, background: '#fff', font: 'inherit', cursor: 'pointer' }}>
            <option value="todos">Todos os estagios</option>
            {ESTAGIOS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
            <option value="atencao">Precisam Atencao</option>
          </select>
        </div>

        {/* KANBAN */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 64, color: D.muted, fontSize: 16 }}>Carregando leads...</div>
        ) : (
          <div style={{ overflowX: 'auto', paddingBottom: 12 }}>
            <div style={{ display: 'flex', gap: 12, minWidth: 'max-content' }}>
              {ESTAGIOS.map(col => {
                const colLeads = leadsFiltrados.filter(l => l.estagio_funil === col.key)
                return (
                  <div key={col.key} style={{ width: 220, flexShrink: 0 }}>
                    <div style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', borderBottom: '2px solid ' + col.cor, background: col.cor + '14', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: col.cor }}>{col.label}</span>
                        <span style={{ background: col.cor, color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{colLeads.length}</span>
                      </div>
                      <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 520, overflowY: 'auto' }}>
                        {colLeads.length === 0 ? (
                          <div style={{ color: D.muted, fontSize: 12, textAlign: 'center', padding: '20px 0' }}>Vazio</div>
                        ) : colLeads.map(lead => (
                          <div key={lead.id} style={{ background: D.bg, borderRadius: 3, padding: '10px 12px', border: '1px solid ' + (lead.requer_atencao ? D.bronze : D.line) }}>
                            {lead.requer_atencao && <div style={{ fontSize: 10, color: D.bronze, fontWeight: 700, marginBottom: 4 }}>ATENCAO</div>}
                            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: D.ink }}>{lead.nome ?? '+' + lead.whatsapp}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ fontSize: 11, color: D.muted }}>{lead.origem ?? '—'}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: lead.lead_score >= 60 ? D.green : lead.lead_score >= 30 ? '#f59e0b' : D.muted }}>{lead.lead_score}pts</span>
                            </div>
                            {lead.orcamento_max && <div style={{ fontSize: 11, color: D.muted, marginBottom: 6 }}>{fmt(lead.orcamento_max)}</div>}
                            <div style={{ display: 'flex', gap: 5 }}>
                              <a href={'https://wa.me/' + lead.whatsapp.replace(/\D/g, '')} target="_blank" rel="noopener noreferrer"
                                style={{ flex: 1, background: '#25d366', color: '#fff', borderRadius: 2, padding: '5px 0', fontSize: 11, textAlign: 'center', textDecoration: 'none', fontWeight: 700, minHeight: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>WPP</a>
                              <select value={lead.estagio_funil} onChange={e => moverEstagio(lead.id, e.target.value)}
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
        )}
      </div>
    </div>
  )
}
