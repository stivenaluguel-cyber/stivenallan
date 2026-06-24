'use client'

import { useState, useEffect, useCallback } from 'react'

interface Lead {
  id: string
  nome: string
  email: string | null
  telefone: string
  mensagem: string | null
  status: string
  origem: string | null
  created_at: string
  atendido_em: string | null
  anotacoes: string | null
  empreendimentos: { nome: string; slug: string; cidade: string } | null
}

const STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'em_contato', label: 'Em Contato', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { value: 'negociando', label: 'Negociando', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { value: 'ganho', label: 'Ganho', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'perdido', label: 'Perdido', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
]

const getStatusStyle = (status: string) => {
  return STATUS_OPTIONS.find(s => s.value === status)?.color ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'
}

const getStatusLabel = (status: string) => {
  return STATUS_OPTIONS.find(s => s.value === status)?.label ?? status
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('todos')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [anotacoes, setAnotacoes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const url = filterStatus === 'todos'
        ? '/api/admin/leads'
        : `/api/admin/leads?status=${filterStatus}`
      const res = await fetch(url)
      const data = await res.json()
      setLeads(Array.isArray(data) ? data : [])
    } catch {
      setError('Erro ao carregar leads')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Erro ao atualizar')
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
      if (selectedLead?.id === leadId) setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null)
    } catch {
      setError('Erro ao atualizar status')
    }
  }

  const handleSaveAnotacoes = async () => {
    if (!selectedLead) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anotacoes }),
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, anotacoes } : l))
      setSelectedLead(prev => prev ? { ...prev, anotacoes } : null)
    } catch {
      setError('Erro ao salvar anotações')
    } finally {
      setSaving(false)
    }
  }

  const openLead = (lead: Lead) => {
    setSelectedLead(lead)
    setAnotacoes(lead.anotacoes || '')
  }

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s.value] = leads.filter(l => l.status === s.value).length
    return acc
  }, {} as Record<string, number>)

  const filtered = filterStatus === 'todos' ? leads : leads.filter(l => l.status === filterStatus)

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">CRM / Leads</h1>
          <p className="text-[#a7adb4] text-sm mt-1">{leads.length} lead{leads.length !== 1 ? 's' : ''} no total</p>
        </div>
        <button
          onClick={fetchLeads}
          className="px-4 py-2 bg-white/5 text-[#a7adb4] rounded-lg hover:bg-white/10 transition-colors text-sm"
        >
          Atualizar
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterStatus('todos')}
          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${filterStatus === 'todos' ? 'bg-[#c9a24b]/10 text-[#c9a24b] border-[#c9a24b]/20' : 'bg-white/5 text-[#a7adb4] border-white/10 hover:bg-white/10'}`}
        >
          Todos ({leads.length})
        </button>
        {STATUS_OPTIONS.map(s => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${filterStatus === s.value ? s.color : 'bg-white/5 text-[#a7adb4] border-white/10 hover:bg-white/10'}`}
          >
            {s.label} ({counts[s.value] || 0})
          </button>
        ))}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Lead List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-[#c9a24b] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-[#a7adb4]">Nenhum lead encontrado.</div>
          ) : (
            filtered.map(lead => (
              <div
                key={lead.id}
                onClick={() => openLead(lead)}
                className={`bg-[#202327] rounded-xl p-4 border cursor-pointer transition-colors ${selectedLead?.id === lead.id ? 'border-[#c9a24b]/40' : 'border-white/5 hover:border-white/10'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-sm truncate">{lead.nome}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusStyle(lead.status)}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </div>
                    {lead.empreendimentos && (
                      <p className="text-[#c9a24b] text-xs mb-1 truncate">{lead.empreendimentos.nome}</p>
                    )}
                    <div className="flex items-center gap-3 text-[#a7adb4] text-xs">
                      <span>{lead.telefone}</span>
                      {lead.email && <span className="truncate">{lead.email}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[#a7adb4] text-xs">{formatDate(lead.created_at)}</p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
                  <select
                    value={lead.status}
                    onChange={e => handleStatusChange(lead.id, e.target.value)}
                    className="bg-[#121315] border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-[#c9a24b]/50"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <a
                    href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs hover:bg-green-500/20 transition-colors"
                  >
                    WhatsApp
                  </a>
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs hover:bg-blue-500/20 transition-colors"
                    >
                      E-mail
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Lead Detail Panel */}
        {selectedLead && (
          <div className="w-80 shrink-0 bg-[#202327] rounded-xl border border-white/5 p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Detalhes</h3>
              <button onClick={() => setSelectedLead(null)} className="text-[#a7adb4] hover:text-white text-lg leading-none">×</button>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <p className="text-xs text-[#a7adb4] mb-0.5">Nome</p>
                <p className="text-white text-sm font-medium">{selectedLead.nome}</p>
              </div>
              <div>
                <p className="text-xs text-[#a7adb4] mb-0.5">Telefone</p>
                <p className="text-white text-sm">{selectedLead.telefone}</p>
              </div>
              {selectedLead.email && (
                <div>
                  <p className="text-xs text-[#a7adb4] mb-0.5">E-mail</p>
                  <p className="text-white text-sm">{selectedLead.email}</p>
                </div>
              )}
              {selectedLead.empreendimentos && (
                <div>
                  <p className="text-xs text-[#a7adb4] mb-0.5">Interesse</p>
                  <p className="text-[#c9a24b] text-sm">{selectedLead.empreendimentos.nome}</p>
                </div>
              )}
              {selectedLead.mensagem && (
                <div>
                  <p className="text-xs text-[#a7adb4] mb-0.5">Mensagem</p>
                  <p className="text-white text-sm">{selectedLead.mensagem}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-[#a7adb4] mb-0.5">Recebido em</p>
                <p className="text-white text-sm">{formatDate(selectedLead.created_at)}</p>
              </div>
              {selectedLead.atendido_em && (
                <div>
                  <p className="text-xs text-[#a7adb4] mb-0.5">Primeiro contato</p>
                  <p className="text-white text-sm">{formatDate(selectedLead.atendido_em)}</p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs text-[#a7adb4] mb-1.5">Status</label>
              <select
                value={selectedLead.status}
                onChange={e => handleStatusChange(selectedLead.id, e.target.value)}
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-[#a7adb4] mb-1.5">Anotações</label>
              <textarea
                value={anotacoes}
                onChange={e => setAnotacoes(e.target.value)}
                rows={4}
                placeholder="Adicione notas sobre o atendimento..."
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50 resize-none"
              />
              <button
                onClick={handleSaveAnotacoes}
                disabled={saving}
                className="w-full mt-2 py-2 bg-[#c9a24b] text-[#121315] rounded-lg text-sm font-medium hover:bg-[#b8923f] transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Anotações'}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={`https://wa.me/55${selectedLead.telefone.replace(/\D/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm text-center hover:bg-green-500/20 transition-colors"
              >
                Abrir no WhatsApp
              </a>
              {selectedLead.email && (
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-sm text-center hover:bg-blue-500/20 transition-colors"
                >
                  Enviar E-mail
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
