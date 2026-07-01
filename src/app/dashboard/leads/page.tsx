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
  lead_score?: number; requer_atencao?: boolean; origem?: string
  orcamento_max?: number; perfil?: string; email?: string
  empreendimentos?: { nome?: string; cidade?: string } | null
anotacoes?: string | null; created_at?: string; property_name?: string | null
}

const ESTAGIOS = [
  { key: 'primeiro_contato', label: 'Novo Contato', cor: '#6b7280' },
  { key: 'qualificado', label: 'Qualificado', cor: '#3b82f6' },
  { key: 'interessado', label: 'Interessado', cor: '#8b5cf6' },
  { key: 'proposta_enviada', label: 'Proposta Enviada', cor: '#f59e0b' },
  { key: 'visita_agendada', label: 'Visita Agendada', cor: '#ec4899' },
  { key: 'negociacao', label: 'Em Negociação', cor: '#D24E22' },
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

  async function salvar() {
    if (!whatsapp.trim()) { setErro('Informe o WhatsApp do lead.'); return }
    setSaving(true); setErro('')
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim() || null,
          whatsapp: whatsapp.replace(/\D/g, ''),
          email: email.trim() || null,
          origem,
          orcamento_max: orcamento ? Number(orcamento.replace(/\D/g, '')) : null,
          estagio_funil: estagio,
        }),
      })
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error || 'Falha ao salvar') }
      onSaved()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar lead')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontSize: 14, outline: 'none' }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: D.muted, marginBottom: 6, marginTop: 14 }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: D.surface, borderRadius: 16, width: '100%', maxWidth: 440, padding: 24, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: D.ink }}>Novo Lead</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: D.muted, lineHeight: 1 }}>×</button>
        </div>

        <label style={labelStyle}>Nome</label>
        <input style={inputStyle} value={nome} onChange={(e) => setNome(e.target.value)} placeholder='Nome do lead' />

        <label style={labelStyle}>WhatsApp *</label>
        <input style={inputStyle} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder='(48) 99999-9999' />

        <label style={labelStyle}>E-mail</label>
        <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder='email@exemplo.com' />

        <label style={labelStyle}>Origem</label>
        <select style={inputStyle} value={origem} onChange={(e) => setOrigem(e.target.value)}>
          {ORIGENS.map((o) => (<option key={o} value={o}>{o}</option>))}
        </select>

        <label style={labelStyle}>Orçamento máximo (R$)</label>
        <input style={inputStyle} value={orcamento} onChange={(e) => setOrcamento(e.target.value)} placeholder='Ex: 350000' />

        <label style={labelStyle}>Estágio inicial</label>
        <select style={inputStyle} value={estagio} onChange={(e) => setEstagio(e.target.value)}>
          {ESTAGIOS.map((s) => (<option key={s.key} value={s.key}>{s.label}</option>))}
        </select>

        {erro && <p style={{ color: D.red, fontSize: 13, marginTop: 14 }}>{erro}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 16px', borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={salvar} disabled={saving} style={{ flex: 1, padding: '11px 16px', borderRadius: 8, border: 'none', background: D.bronze, color: '#fff', fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Salvando...' : 'Salvar lead'}</button>
        </div>
      </div>
    </div>
  )
}

function LeadCard({ lead, onDragStart, onToggleAtencao }: { lead: Lead; onDragStart: (id: string) => void; onToggleAtencao: (lead: Lead) => void }) {
  const whatsappLink = 'https://wa.me/' + (lead.whatsapp || '').replace(/\D/g, '')
  return (
    <div
      draggable
      onDragStart={() => onDragStart(lead.id)}
      style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 12, padding: 12, marginBottom: 10, cursor: 'grab', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: D.ink }}>{lead.nome || 'Sem nome'}</span>
        <button onClick={() => onToggleAtencao(lead)} title='Requer atenção' style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, lineHeight: 1, color: lead.requer_atencao ? D.orange : D.line }}>★</button>
      </div>
      {lead.empreendimentos?.nome && (
        <div style={{ fontSize: 12, color: D.muted, marginTop: 3 }}>{lead.empreendimentos.nome}</div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {lead.origem && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: D.bg, color: D.muted }}>{lead.origem}</span>}
        {typeof lead.orcamento_max === 'number' && lead.orcamento_max > 0 && (
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: D.bg, color: D.muted }}>{fmt(lead.orcamento_max)}</span>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <span style={{ fontSize: 11, color: D.muted }}>Score: {lead.lead_score ?? 0}</span>
        <a href={whatsappLink} target='_blank' rel='noopener noreferrer' style={{ fontSize: 12, fontWeight: 600, color: D.green, textDecoration: 'none' }}>WhatsApp →</a>
      </div>
    </div>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)
const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
const [notes, setNotes] = useState('')
const [savingNotes, setSavingNotes] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true); setErro('')
    try {
      const res = await fetch('/api/admin/leads')
      if (!res.ok) throw new Error('Falha ao carregar leads')
      const data = await res.json()
      setLeads(Array.isArray(data) ? data : (data.data ?? []))
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function moverLead(id: string, novoEstagio: string) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, estagio_funil: novoEstagio } : l)))
    try {
      await fetch('/api/admin/leads/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estagio_funil: novoEstagio }),
      })
    } catch {
      carregar()
    }
  }

  async function toggleAtencao(lead: Lead) {
    const novo = !lead.requer_atencao
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, requer_atencao: novo } : l)))
    try {
      await fetch('/api/admin/leads/' + lead.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requer_atencao: novo }),
      })
    } catch {
      carregar()
    }
  }

  function onDrop(estagio: string) {
    if (dragId) { moverLead(dragId, estagio); setDragId(null) }
  }

  const termo = busca.trim().toLowerCase()
  const filtrados = termo
    ? leads.filter((l) => (l.nome || '').toLowerCase().includes(termo) || (l.whatsapp || '').includes(termo))
    : leads

  function exportCSV() {
    const rows = [
      ['Nome', 'WhatsApp', 'Empreendimento', 'Estágio', 'Origem', 'Score', 'Data'],
      ...leads.map((l: Lead) => [
        l.nome ?? '',
        l.whatsapp ?? '',
        (l.empreendimentos as { nome?: string } | null)?.nome ?? '',
        l.estagio_funil ?? '',
        l.origem ?? '',
        l.lead_score ?? '',
        new Date((l as any).created_at).toLocaleDateString('pt-BR'),
      ])
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ minHeight: '100vh', background: D.bg, padding: '24px 20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: D.ink }}>Pipeline de Leads</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: D.muted }}>{filtrados.length} lead(s){busca ? ' encontrados' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder='Buscar nome ou WhatsApp...' style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontSize: 14, outline: 'none', minWidth: 220 }} />
          <button onClick={exportCSV} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', color: D.ink, fontWeight: 600, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>Exportar CSV</button>
        <button onClick={() => setModalAberto(true)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: D.bronze, color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Novo Lead</button>
        </div>
      </div>

      {erro && <p style={{ color: D.red, fontSize: 14, marginBottom: 16 }}>{erro}</p>}

      {loading ? (
        <p style={{ color: D.muted, fontSize: 14 }}>Carregando leads...</p>
      ) : (
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
          {ESTAGIOS.map((estagio) => {
            const doEstagio = filtrados.filter((l) => l.estagio_funil === estagio.key)
            return (
              <div
                key={estagio.key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(estagio.key)}
                style={{ flex: '0 0 280px', width: 280, background: D.surface, borderRadius: 14, padding: 12, border: '1px solid ' + D.line }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: estagio.cor, display: 'inline-block' }} />
                  <span style={{ fontWeight: 700, fontSize: 13, color: D.ink }}>{estagio.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: D.muted, background: D.bg, borderRadius: 999, padding: '1px 8px' }}>{doEstagio.length}</span>
                </div>
                {doEstagio.length === 0 ? (
                  <p style={{ fontSize: 12, color: D.muted, textAlign: 'center', padding: '18px 0' }}>Arraste leads para cá</p>
                ) : (
                  doEstagio.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} onDragStart={setDragId} onToggleAtencao={toggleAtencao} onSelect={(l) => { setSelectedLead(l); setNotes(l.anotacoes ?? '') }} />
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}

      {modalAberto && (
<NovoLeadModal onClose={() => setModalAberto(false)} onSaved={() => { setModalAberto(false); carregar() }} />
)}

{selectedLead && (
<div
onClick={(e) => { if (e.target === e.currentTarget) setSelectedLead(null) }}
style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '16px' }}
>
<div style={{ position: 'relative', width: '100%', maxWidth: '520px', maxHeight: '85vh', overflowY: 'auto', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
<div style={{ background: '#D24E22', padding: '20px 24px', borderRadius: '16px 16px 0 0' }}>
<h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0 }}>{selectedLead.nome ?? 'Sem nome'}</h2>
<p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: '4px 0 0' }}>
{selectedLead.estagio_funil?.replace(/_/g, ' ')} · {selectedLead.origem ?? 'origem desconhecida'}
</p>
</div>
<button
onClick={() => setSelectedLead(null)}
aria-label="Fechar"
style={{ position: 'absolute', top: '14px', right: '14px', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '18px', lineHeight: 1 }}
>×</button>
<div style={{ padding: '24px' }}>
<table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
<tbody>
<tr>
<td style={{ color: '#8a8a85', padding: '8px 0', borderBottom: '1px solid #F3F2EE', fontSize: '13px', width: '38%' }}>WhatsApp</td>
<td style={{ padding: '8px 0', borderBottom: '1px solid #F3F2EE', fontSize: '14px', fontWeight: 600 }}>
<a href={`https://wa.me/55${selectedLead.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none' }}>
{selectedLead.whatsapp} ↗
</a>
</td>
</tr>
<tr>
<td style={{ color: '#8a8a85', padding: '8px 0', borderBottom: '1px solid #F3F2EE', fontSize: '13px' }}>E-mail</td>
<td style={{ padding: '8px 0', borderBottom: '1px solid #F3F2EE', fontSize: '14px', fontWeight: 600 }}>
{selectedLead.email ? <a href={`mailto:${selectedLead.email}`} style={{ color: '#D24E22', textDecoration: 'none' }}>{selectedLead.email}</a> : '—'}
</td>
</tr>
<tr>
<td style={{ color: '#8a8a85', padding: '8px 0', borderBottom: '1px solid #F3F2EE', fontSize: '13px' }}>Empreendimento</td>
<td style={{ padding: '8px 0', borderBottom: '1px solid #F3F2EE', fontSize: '14px', fontWeight: 600 }}>
{selectedLead.empreendimentos?.nome ?? selectedLead.property_name ?? '—'}
</td>
</tr>
<tr>
<td style={{ color: '#8a8a85', padding: '8px 0', borderBottom: '1px solid #F3F2EE', fontSize: '13px' }}>Origem</td>
<td style={{ padding: '8px 0', borderBottom: '1px solid #F3F2EE', fontSize: '14px', fontWeight: 600 }}>{selectedLead.origem ?? '—'}</td>
</tr>
<tr>
<td style={{ color: '#8a8a85', padding: '8px 0', borderBottom: '1px solid #F3F2EE', fontSize: '13px' }}>Score</td>
<td style={{ padding: '8px 0', borderBottom: '1px solid #F3F2EE', fontSize: '14px', fontWeight: 600 }}>{selectedLead.lead_score ?? '—'}</td>
</tr>
<tr>
<td style={{ color: '#8a8a85', padding: '8px 0', fontSize: '13px' }}>Recebido em</td>
<td style={{ padding: '8px 0', fontSize: '14px', fontWeight: 600 }}>
{selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleString('pt-BR') : '—'}
</td>
</tr>
</tbody>
</table>
<label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
Anotações
</label>
<textarea
value={notes}
onChange={(e) => setNotes(e.target.value)}
placeholder="Anote aqui o histórico de contato, preferências do cliente, próximos passos..."
rows={5}
style={{ width: '100%', border: '1.5px solid #e4e4e7', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', color: '#18181b', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
/>
<div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
<button
onClick={async () => {
setSavingNotes(true)
await fetch(`/api/admin/leads/${selectedLead.id}`, {
method: 'PATCH',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ anotacoes: notes }),
})
setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, anotacoes: notes } : l))
setSavingNotes(false)
setSelectedLead(null)
}}
disabled={savingNotes}
style={{ flex: 1, background: '#D24E22', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: savingNotes ? 'not-allowed' : 'pointer', opacity: savingNotes ? 0.6 : 1 }}
>
{savingNotes ? 'Aguarde...' : 'Salvar anotações'}
</button>
<a
href={`https://wa.me/55${selectedLead.whatsapp}`}
target="_blank"
rel="noopener noreferrer"
style={{ flex: 1, background: '#25D366', color: '#fff', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}
>
Chamar no WhatsApp
</a>
</div>
</div>
</div>
</div>
)}
</div>
)
}
