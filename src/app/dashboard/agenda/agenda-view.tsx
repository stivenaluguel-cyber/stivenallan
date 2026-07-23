'use client'
import { useState, useEffect, useCallback } from 'react'

interface Evento {
  id: string
  titulo: string
  data_hora: string
  tipo: string
  local?: string
  descricao?: string
  status: string
  lembrete_min?: number
  leads?: { nome: string; telefone: string; whatsapp: string }
}

const TIPOS = [
  { value: 'visita', label: 'Visita', cor: '#8b5cf6' },
  { value: 'reuniao', label: 'Reunião', cor: '#3b82f6' },
  { value: 'ligacao', label: 'Ligação', cor: '#22c55e' },
  { value: 'assinatura', label: 'Assinatura', cor: '#D24E22' },
  { value: 'outro', label: 'Outro', cor: '#6b7280' },
]

export default function AgendaPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [dataSel, setDataSel] = useState(new Date().toISOString().slice(0,10))
  const [modalAberto, setModalAberto] = useState(false)
  const [eventoSel, setEventoSel] = useState<Evento | null>(null)
  const [form, setForm] = useState({ titulo: '', data_hora: '', tipo: 'reuniao', local: '', descricao: '', lembrete_min: 30 })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const buscarEventos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/agenda?data_ini=' + dataSel + '&data_fim=' + dataSel)
      const json = await res.json()
      setEventos(json.data || [])
    } catch { setErro('Erro ao carregar') }
    setLoading(false)
  }, [dataSel])

  useEffect(() => { buscarEventos() }, [buscarEventos])

  function abrirModal(e?: Evento) {
    if (e) {
      setEventoSel(e)
      setForm({ titulo: e.titulo, data_hora: e.data_hora.slice(0,16), tipo: e.tipo, local: e.local || '', descricao: e.descricao || '', lembrete_min: e.lembrete_min ?? 30 })
    } else {
      setEventoSel(null)
      setForm({ titulo: '', data_hora: dataSel + 'T09:00', tipo: 'reuniao', local: '', descricao: '', lembrete_min: 30 })
    }
    setModalAberto(true)
    setErro('')
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      let res: Response
      if (eventoSel) {
        res = await fetch('/api/admin/agenda', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: eventoSel.id, ...form }) })
      } else {
        res = await fetch('/api/admin/agenda', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      }
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || 'Erro') }
      setModalAberto(false)
      buscarEventos()
    } catch (e: unknown) { setErro(e instanceof Error ? e.message : 'Erro') }
    setSalvando(false)
  }

  async function concluir(id: string) {
    await fetch('/api/admin/agenda', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'concluido' }) })
    buscarEventos()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este evento?')) return
    await fetch('/api/admin/agenda?id=' + id, { method: 'DELETE' })
    buscarEventos()
  }

  function navDia(d: number) {
    const dt = new Date(dataSel + 'T12:00:00')
    dt.setDate(dt.getDate() + d)
    setDataSel(dt.toISOString().slice(0,10))
  }

  function getTipo(t: string) { return TIPOS.find(x => x.value === t) || TIPOS[4] }
  function formatHora(s: string) { return new Date(s).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
  function formatDataLabel(s: string) {
    const d = new Date(s + 'T12:00:00')
    const hoje = new Date(); hoje.setHours(0,0,0,0)
    const sel = new Date(d); sel.setHours(0,0,0,0)
    const diff = (sel.getTime() - hoje.getTime()) / 86400000
    if (diff === 0) return 'Hoje'
    if (diff === 1) return 'Amanhã'
    if (diff === -1) return 'Ontem'
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', margin: 0 }}>Agenda</h1>
          <p style={{ color: '#666', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>{eventos.length} evento{eventos.length !== 1 ? 's' : ''} para {formatDataLabel(dataSel)}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={() => navDia(-1)} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '1rem' }}>←</button>
          <input type="date" value={dataSel} onChange={e => setDataSel(e.target.value)} aria-label="Selecionar data da agenda" style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem' }} />
          <button onClick={() => navDia(1)} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '1rem' }}>→</button>
          <button onClick={() => { setDataSel(new Date().toISOString().slice(0,10)) }} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>Hoje</button>
          <button onClick={() => abrirModal()} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>+ Evento</button>
        </div>
      </div>

      {/* Lista de eventos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Carregando...</div>
        ) : eventos.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
            <div style={{ color: '#666', fontSize: '0.875rem' }}>Nenhum evento para este dia</div>
            <button onClick={() => abrirModal()} style={{ marginTop: '1rem', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem' }}>+ Adicionar evento</button>
          </div>
        ) : eventos.map(ev => {
          const tipo = getTipo(ev.tipo)
          const concluido = ev.status === 'concluido'
          return (
            <div key={ev.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', opacity: concluido ? 0.6 : 1, borderLeft: '4px solid ' + tipo.cor }}>
              <div style={{ textAlign: 'center', minWidth: '3rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: tipo.cor }}>{formatHora(ev.data_hora)}</div>
                <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.2rem' }}>{ev.lembrete_min}min antes</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 700, color: '#111', fontSize: '1rem', textDecoration: concluido ? 'line-through' : 'none' }}>{ev.titulo}</span>
                  <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', background: tipo.cor + '20', color: tipo.cor, fontSize: '0.7rem', fontWeight: 700 }}>{tipo.label}</span>
                  {concluido && <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700 }}>Concluído</span>}
                </div>
                {ev.local && <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: '0.2rem' }}>📍 {ev.local}</div>}
                {ev.descricao && <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: '0.2rem' }}>{ev.descricao}</div>}
                {ev.leads && (
                  <a href={'https://wa.me/55' + ev.leads.whatsapp?.replace(/\D/g,'')} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}>
                    👤 {ev.leads.nome}
                  </a>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {!concluido && (
                  <button onClick={() => concluir(ev.id)} style={{ background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>✓</button>
                )}
                <button onClick={() => abrirModal(ev)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem' }}>Editar</button>
                <button onClick={() => excluir(ev.id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => { if (e.target === e.currentTarget) setModalAberto(false) }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{eventoSel ? 'Editar Evento' : 'Novo Evento'}</h2>
              <button onClick={() => setModalAberto(false)} aria-label="Fechar" style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>×</button>
            </div>
            {erro && <div role="alert" style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>{erro}</div>}
            <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="agenda-titulo" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Título *</label>
                <input id="agenda-titulo" required value={form.titulo} onChange={e => setForm(f=>({...f, titulo: e.target.value}))} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label htmlFor="agenda-data-hora" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Data e Hora *</label>
                  <input id="agenda-data-hora" type="datetime-local" required value={form.data_hora} onChange={e => setForm(f=>({...f, data_hora: e.target.value}))} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label htmlFor="agenda-tipo" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Tipo</label>
                  <select id="agenda-tipo" value={form.tipo} onChange={e => setForm(f=>({...f, tipo: e.target.value}))} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }}>
                    {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="agenda-local" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Local</label>
                <input id="agenda-local" value={form.local} onChange={e => setForm(f=>({...f, local: e.target.value}))} placeholder="Ex: Estande do empreendimento" style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label htmlFor="agenda-descricao" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Descrição</label>
                <textarea id="agenda-descricao" value={form.descricao} onChange={e => setForm(f=>({...f, descricao: e.target.value}))} rows={2} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div>
                <label htmlFor="agenda-lembrete" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Lembrete (minutos antes)</label>
                <select id="agenda-lembrete" value={form.lembrete_min} onChange={e => setForm(f=>({...f, lembrete_min: Number(e.target.value)}))} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem' }}>
                  <option value={0}>Sem lembrete</option>
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={120}>2 horas</option>
                  <option value={1440}>1 dia antes</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalAberto(false)} style={{ padding: '0.625rem 1.25rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.875rem' }}>Cancelar</button>
                <button type="submit" disabled={salvando} style={{ padding: '0.625rem 1.25rem', border: 'none', borderRadius: '6px', background: salvando ? '#9ca3af' : '#111', color: '#fff', cursor: salvando ? 'default' : 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>{salvando ? 'Salvando...' : eventoSel ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
