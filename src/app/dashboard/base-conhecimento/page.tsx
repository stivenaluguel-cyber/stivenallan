'use client'
import { useState, useEffect, useCallback } from 'react'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512', bronze: '#D24E22',
  muted: '#6B655B', line: 'rgba(26,24,21,0.08)', green: '#22c55e', red: '#ef4444',
}

type Entrada = {
  id: string
  pergunta: string
  resposta: string
  origem: 'manual' | 'ia_sugerida'
  aprovado: boolean
  ativo: boolean
  lead_id_origem: string | null
  created_at: string
}

export default function BaseConhecimentoPage() {
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [loading, setLoading] = useState(true)
  const [nova, setNova] = useState({ pergunta: '', resposta: '' })
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')
  const [editando, setEditando] = useState<Record<string, { pergunta: string; resposta: string }>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetch('/api/admin/base-conhecimento').then(r => r.json())
      setEntradas(data.entradas ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function criar() {
    if (!nova.pergunta.trim() || !nova.resposta.trim()) { setMsg('Preencha pergunta e resposta.'); return }
    setSalvando(true); setMsg('')
    try {
      const res = await fetch('/api/admin/base-conhecimento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nova),
      })
      const data = await res.json()
      if (!res.ok) { setMsg(data.error || 'Erro ao salvar.'); return }
      setMsg('Entrada criada.')
      setNova({ pergunta: '', resposta: '' })
      await load()
    } catch {
      setMsg('Falha ao conectar.')
    } finally {
      setSalvando(false)
    }
  }

  async function patch(id: string, campos: Record<string, unknown>) {
    setEntradas(prev => prev.map(e => e.id === id ? { ...e, ...campos } as Entrada : e))
    await fetch('/api/admin/base-conhecimento', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...campos }),
    })
  }

  async function apagar(id: string) {
    if (!confirm('Apagar essa entrada?')) return
    setEntradas(prev => prev.filter(e => e.id !== id))
    await fetch('/api/admin/base-conhecimento?id=' + id, { method: 'DELETE' })
  }

  function iniciarEdicao(e: Entrada) {
    setEditando(prev => ({ ...prev, [e.id]: { pergunta: e.pergunta, resposta: e.resposta } }))
  }

  async function salvarEdicao(id: string) {
    const valores = editando[id]
    if (!valores) return
    await patch(id, valores)
    setEditando(prev => { const cp = { ...prev }; delete cp[id]; return cp })
  }

  if (loading) {
    return <div style={{ padding: 32, color: D.muted, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>Carregando...</div>
  }

  const pendentes = entradas.filter(e => e.origem === 'ia_sugerida' && !e.aprovado)
  const aprovadas = entradas.filter(e => e.aprovado)

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(20px,2.5vw,36px) clamp(16px,3vw,32px)' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, margin: 0 }}>Base de Conhecimento</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: D.muted }}>
            O Allan IA consulta essas entradas (aprovadas e ativas) antes de responder no WhatsApp. Conversas que terminam em visita agendada ou fechamento viram sugestão pendente aqui automaticamente — 1x por dia.
          </p>
        </div>

        {pendentes.length > 0 && (
          <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20, marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>
              Sugestões pendentes ({pendentes.length})
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: D.muted }}>Geradas pela IA a partir de conversas resolvidas — revise antes de aprovar.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendentes.map(e => (
                <div key={e.id} style={{ border: '1px solid ' + D.line, borderRadius: 10, padding: 14 }}>
                  {editando[e.id] ? (
                    <>
                      <input value={editando[e.id].pergunta} onChange={ev => setEditando(prev => ({ ...prev, [e.id]: { ...prev[e.id], pergunta: ev.target.value } }))}
                        style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, marginBottom: 8, boxSizing: 'border-box', fontWeight: 700 }} />
                      <textarea value={editando[e.id].resposta} onChange={ev => setEditando(prev => ({ ...prev, [e.id]: { ...prev[e.id], resposta: ev.target.value } }))} rows={3}
                        style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{e.pergunta}</div>
                      <div style={{ fontSize: 13, color: D.muted }}>{e.resposta}</div>
                    </>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {editando[e.id] ? (
                      <button onClick={() => salvarEdicao(e.id)} style={{ border: 'none', background: D.bronze, color: '#fff', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Salvar edição</button>
                    ) : (
                      <button onClick={() => iniciarEdicao(e)} style={{ border: '1px solid ' + D.line, background: 'transparent', color: D.ink, borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Editar</button>
                    )}
                    <button onClick={() => patch(e.id, { aprovado: true })} style={{ border: 'none', background: D.green, color: '#fff', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Aprovar</button>
                    <button onClick={() => apagar(e.id)} style={{ border: 'none', background: 'transparent', color: D.red, borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Rejeitar</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20, marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Nova entrada manual</h2>
          <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Pergunta</label>
          <input value={nova.pergunta} onChange={e => setNova(p => ({ ...p, pergunta: e.target.value }))}
            placeholder="Ex: Aceita permuta por imóvel usado?"
            style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, marginBottom: 10, boxSizing: 'border-box' }} />
          <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Resposta</label>
          <textarea value={nova.resposta} onChange={e => setNova(p => ({ ...p, resposta: e.target.value }))} rows={3}
            style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', marginBottom: 10, boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={criar} disabled={salvando}
              style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: salvando ? 'default' : 'pointer', opacity: salvando ? 0.6 : 1 }}>
              {salvando ? 'Salvando...' : 'Adicionar'}
            </button>
            {msg && <span style={{ fontSize: 13, color: msg.includes('criada') ? D.green : D.red }}>{msg}</span>}
          </div>
        </section>

        <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>
            Entradas aprovadas ({aprovadas.length})
          </h2>
          {aprovadas.length === 0 ? (
            <p style={{ fontSize: 13, color: D.muted, margin: 0 }}>Nenhuma entrada aprovada ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {aprovadas.map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, border: '1px solid ' + D.line, borderRadius: 8, padding: 12, opacity: e.ativo ? 1 : 0.5 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {e.pergunta}
                      {e.origem === 'ia_sugerida' && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: D.bronze, color: '#fff' }}>SUGERIDA PELA IA</span>}
                      {!e.ativo && <span style={{ marginLeft: 6, color: D.muted, fontWeight: 400 }}>(inativa)</span>}
                    </div>
                    <div style={{ fontSize: 12, color: D.muted, marginTop: 2 }}>{e.resposta}</div>
                  </div>
                  <button onClick={() => patch(e.id, { ativo: !e.ativo })} style={{ border: '1px solid ' + D.line, background: 'transparent', color: D.ink, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {e.ativo ? 'Desativar' : 'Reativar'}
                  </button>
                  <button onClick={() => apagar(e.id)} style={{ border: 'none', background: 'none', color: D.red, cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
