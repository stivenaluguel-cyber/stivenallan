'use client'
import { useState } from 'react'
import { ESTAGIOS_FUNIL as ESTAGIOS } from '@/lib/dashboard/estagios'

const D = {
  surface: '#FAFAF7', ink: '#161512', bronze: '#D24E22',
  muted: '#6B655B', line: 'rgba(26,24,21,0.08)', red: '#ef4444',
}

const ORIGENS = ['Instagram', 'Indicacao', 'Portal', 'Anuncio', 'Evento', 'Site', 'Whatsapp', 'Outro']

export function NovoLeadModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
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
