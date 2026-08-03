'use client'
import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import {
  linkWhatsapp, PAPEIS_ENVOLVIDO, ROTULO_ENVOLVIDO,
} from '@/lib/leads/envolvidos'

/**
 * As outras pessoas do negócio, com o WhatsApp certo a um toque.
 *
 * O lead tem um telefone: o do comprador. O negócio anda com mais gente —
 * correspondente da Caixa, contato da construtora, despachante, cônjuge que
 * assina junto. Cada um vive numa conversa solta, e na hora de destravar o
 * negócio o corretor caça o número no histórico do WhatsApp.
 */

const D = {
  ink: '#161512', muted: '#6B655B', line: 'rgba(26,24,21,0.12)',
  bronze: '#D24E22', bg: '#F3F2EE', verde: '#25d366', erro: '#DC2626',
}

type Envolvido = {
  id: string
  nome: string
  papel: string
  whatsapp: string | null
  email: string | null
  observacoes: string | null
}

const campo: React.CSSProperties = {
  width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid ' + D.line,
  background: '#fff', color: D.ink, fontSize: 13, minHeight: 40, boxSizing: 'border-box',
}
const rotulo: React.CSSProperties = {
  display: 'block', fontSize: 10, color: D.muted, textTransform: 'uppercase',
  letterSpacing: '0.06em', marginBottom: 3,
}

const FORM_VAZIO = { nome: '', papel: 'correspondente', whatsapp: '', email: '', observacoes: '' }

export function EnvolvidosLead({ leadId }: { leadId: string }) {
  const [lista, setLista] = useState<Envolvido[]>([])
  const [form, setForm] = useState(FORM_VAZIO)
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/envolvidos`)
      const json = await res.json()
      if (res.ok) setLista(json.data ?? [])
    } catch { /* silencioso: a ficha do lead não pode quebrar por isto */ }
  }, [leadId])

  useEffect(() => { carregar() }, [carregar])

  async function adicionar() {
    setSalvando(true); setErro('')
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/envolvidos`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao salvar')
      setLista((p) => [...p, json.data])
      setForm(FORM_VAZIO)
      setAberto(false)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao salvar')
    } finally { setSalvando(false) }
  }

  async function remover(id: string) {
    if (!confirm('Remover este envolvido do negócio?')) return
    // Some da tela na hora e volta se o servidor recusar — esperar o
    // round-trip para sumir com uma linha dá sensação de travado.
    const antes = lista
    setLista((p) => p.filter((e) => e.id !== id))
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/envolvidos?envolvidoId=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
    } catch {
      setLista(antes)
      setErro('Não foi possível remover.')
    }
  }

  return (
    <div>
      {lista.length === 0 && !aberto && (
        <p style={{ fontSize: 13, color: D.muted, margin: '0 0 8px' }}>
          Ninguém cadastrado além do cliente. Construtora, correspondente da Caixa, despachante
          e cônjuge entram aqui.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lista.map((e) => {
          const link = linkWhatsapp(e.whatsapp)
          return (
            <div key={e.id} style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: D.ink }}>{e.nome}</div>
                <div style={{ fontSize: 11, color: D.muted, marginTop: 1 }}>
                  {ROTULO_ENVOLVIDO[e.papel] ?? e.papel}
                  {e.observacoes ? ' · ' + e.observacoes : ''}
                </div>
              </div>
              {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: D.verde, color: '#fff', borderRadius: 6, padding: '7px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none', minHeight: 36 }}>
                  WhatsApp
                </a>
              ) : (
                <span style={{ fontSize: 11, color: D.muted }}>sem WhatsApp</span>
              )}
              <button type="button" onClick={() => remover(e.id)} aria-label={'Remover ' + e.nome}
                style={{ background: 'none', border: '1px solid ' + D.line, borderRadius: 6, padding: '7px 9px', cursor: 'pointer', color: D.muted, minHeight: 36 }}>
                <Trash2 size={13} aria-hidden />
              </button>
            </div>
          )
        })}
      </div>

      {erro && <p style={{ fontSize: 12, color: D.erro, margin: '8px 0 0' }}>{erro}</p>}

      {aberto ? (
        <div style={{ background: D.bg, borderRadius: 10, padding: 12, marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong style={{ fontSize: 12.5, color: D.ink }}>Novo envolvido</strong>
            <button type="button" onClick={() => { setAberto(false); setErro('') }} aria-label="Cancelar"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: D.muted, padding: 4 }}>
              <X size={15} aria-hidden />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <label><span style={rotulo}>Nome</span>
              <input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ana — Caixa" style={campo} /></label>
            <label><span style={rotulo}>Papel</span>
              <select value={form.papel} onChange={(e) => setForm((f) => ({ ...f, papel: e.target.value }))} style={campo}>
                {PAPEIS_ENVOLVIDO.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select></label>
          </div>
          <label style={{ display: 'block', marginTop: 8 }}><span style={rotulo}>WhatsApp</span>
            <input value={form.whatsapp} inputMode="tel"
              onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
              placeholder="(48) 99999-8888" style={campo} /></label>
          <label style={{ display: 'block', marginTop: 8 }}><span style={rotulo}>Observação</span>
            <input value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              placeholder="Analisa o crédito" style={campo} /></label>
          <button type="button" onClick={adicionar} disabled={salvando || !form.nome.trim()}
            style={{ marginTop: 10, width: '100%', background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: salvando || !form.nome.trim() ? 0.6 : 1, minHeight: 42 }}>
            {salvando ? 'Salvando...' : 'Adicionar'}
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setAberto(true)}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, width: '100%', background: 'none', border: '1px dashed ' + D.line, borderRadius: 8, padding: '10px 12px', fontSize: 12.5, fontWeight: 700, color: D.bronze, cursor: 'pointer', minHeight: 42 }}>
          <Plus size={14} aria-hidden /> Adicionar envolvido
        </button>
      )}
    </div>
  )
}
