'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { enderecoResumido } from '@/lib/prospeccao/formatacao'
import { pareceCelularBR } from '@/lib/leads/normalize'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512', bronze: '#D24E22',
  muted: '#6B655B', line: 'rgba(26,24,21,0.08)', green: '#22c55e', red: '#ef4444', blue: '#3b82f6',
}

const CLASSIFICACAO_COR: Record<string, string> = {
  EXCELENTE: D.green, 'MUITO FORTE': D.green, FORTE: D.blue, BOM: '#f59e0b', FRACO: D.muted,
}

type Campanha = {
  id: string; nome: string; alvo: string | null; localizacao: string | null
  leads_solicitados: number; leads_entregues: number
}

type ProspeccaoLead = {
  id: string; place_id: string; nome: string; endereco: string | null
  telefone: string | null; site: string | null; rating: number | null; rating_count: number | null
  score: number | null; classificacao: string | null; contexto_ia: string | null
  status: string; lead_id: string | null
}

const QUANTIDADES = [10, 20, 30, 50]

function linkWhatsapp(telefone: string | null): string | null {
  const digitos = telefone?.replace(/\D/g, '') ?? ''
  if (!pareceCelularBR(digitos)) return null
  return 'https://wa.me/55' + digitos
}

function linkBuscaCnpj(nome: string, endereco: string | null): string {
  const termo = nome + ' CNPJ' + (endereco ? ' ' + endereco : '')
  return 'https://www.google.com/search?q=' + encodeURIComponent(termo)
}

export default function ProspeccaoDetalhePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const [campanha, setCampanha] = useState<Campanha | null>(null)
  const [leads, setLeads] = useState<ProspeccaoLead[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  const [garimpando, setGarimpando] = useState(false)
  const [quantidadeExtra, setQuantidadeExtra] = useState(20)
  const [promovendo, setPromovendo] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true); setErro('')
    try {
      const res = await fetch('/api/admin/prospeccao/campanhas/' + id)
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Falha ao carregar a campanha.'); return }
      setCampanha(data.campanha)
      setLeads(data.leads ?? [])
    } catch {
      setErro('Falha ao conectar.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  async function garimparMais() {
    if (garimpando) return
    setGarimpando(true); setErro('')
    try {
      const res = await fetch('/api/admin/prospeccao/campanhas/' + id + '/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade: quantidadeExtra }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Falha ao garimpar mais leads.'); return }
      await carregar()
    } catch {
      setErro('Falha ao conectar.')
    } finally {
      setGarimpando(false)
    }
  }

  async function promover(leadProspeccaoId: string) {
    setPromovendo(leadProspeccaoId); setErro('')
    try {
      const res = await fetch('/api/admin/prospeccao/leads/' + leadProspeccaoId + '/promover', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Falha ao promover.'); return }
      setLeads((prev) => prev.map((l) => (l.id === leadProspeccaoId ? { ...l, lead_id: data.lead_id, status: 'promovido' } : l)))
    } catch {
      setErro('Falha ao conectar.')
    } finally {
      setPromovendo(null)
    }
  }

  async function mudarStatus(leadProspeccaoId: string, status: string) {
    setLeads((prev) => prev.map((l) => (l.id === leadProspeccaoId ? { ...l, status } : l)))
    await fetch('/api/admin/prospeccao/leads/' + leadProspeccaoId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {})
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: D.muted }}>Carregando...</div>
  if (!campanha) return <div style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>{erro || 'Campanha não encontrada.'}</div>

  return (
    <div style={{ minHeight: '100vh', background: D.bg, padding: '24px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <button onClick={() => router.push('/dashboard/prospeccao')} style={{ background: 'none', border: 'none', color: D.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '4px 0', marginBottom: 8 }}>
          ← Campanhas
        </button>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: D.ink }}>{campanha.nome}</h1>
            {campanha.alvo && <p style={{ margin: '4px 0 0', fontSize: 13, color: D.muted, maxWidth: 560 }}>{campanha.alvo}</p>}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={quantidadeExtra} onChange={(e) => setQuantidadeExtra(Number(e.target.value))} style={{ border: '1.5px solid ' + D.line, borderRadius: 8, padding: '9px 10px', fontSize: 13, background: '#fff' }}>
              {QUANTIDADES.map((q) => <option key={q} value={q}>{q} leads</option>)}
            </select>
            <button
              onClick={garimparMais}
              disabled={garimpando}
              style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: garimpando ? 'default' : 'pointer', opacity: garimpando ? 0.6 : 1, whiteSpace: 'nowrap' }}
            >
              {garimpando ? 'Garimpando...' : 'Garimpar mais'}
            </button>
          </div>
        </div>

        {erro && <p role="alert" style={{ color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{erro}</p>}

        <p style={{ fontSize: 12.5, color: D.muted, marginBottom: 12 }}>
          {leads.length} lead{leads.length === 1 ? '' : 's'} nesta campanha · {campanha.leads_solicitados} solicitados no total
        </p>

        {leads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: D.surface, border: '1px solid ' + D.line, borderRadius: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: D.ink }}>Nenhum lead ainda — clique em &quot;Garimpar mais&quot;.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                promovendo={promovendo === lead.id}
                onPromover={() => promover(lead.id)}
                onMudarStatus={(s) => mudarStatus(lead.id, s)}
                onAbrirNoCrm={() => lead.lead_id && router.push('/dashboard/crm?lead=' + lead.lead_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LeadCard({
  lead, promovendo, onPromover, onMudarStatus, onAbrirNoCrm,
}: {
  lead: ProspeccaoLead
  promovendo: boolean
  onPromover: () => void
  onMudarStatus: (status: string) => void
  onAbrirNoCrm: () => void
}) {
  const cor = CLASSIFICACAO_COR[lead.classificacao ?? ''] ?? D.muted
  const wa = linkWhatsapp(lead.telefone)

  return (
    <div style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 12, padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
      <div style={{ width: 44, textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: cor }}>{lead.score ?? '—'}</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: cor, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{lead.classificacao ?? ''}</div>
      </div>

      <div style={{ flex: '1 1 260px', minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: D.ink }}>{lead.nome}</div>
        <div style={{ fontSize: 12, color: D.muted, marginTop: 2 }}>{enderecoResumido(lead.endereco)}</div>
        {lead.contexto_ia && <div style={{ fontSize: 12, color: D.muted, marginTop: 4, lineHeight: 1.4 }}>{lead.contexto_ia}</div>}
      </div>

      <select
        value={lead.status}
        onChange={(e) => onMudarStatus(e.target.value)}
        disabled={lead.status === 'promovido'}
        style={{ border: '1.5px solid ' + D.line, borderRadius: 6, padding: '6px 8px', fontSize: 12, background: '#fff', flexShrink: 0 }}
      >
        <option value="novo">Novo</option>
        <option value="contatado">Contatado</option>
        <option value="ignorado">Ignorado</option>
        {lead.status === 'promovido' && <option value="promovido">Promovido</option>}
      </select>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', borderRadius: 6, padding: '7px 10px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            WhatsApp
          </a>
        )}
        {lead.telefone && (
          <a href={'tel:' + lead.telefone.replace(/\D/g, '')} style={{ background: 'none', border: '1px solid ' + D.line, color: D.ink, borderRadius: 6, padding: '7px 10px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            Ligar
          </a>
        )}
        {lead.site && (
          <a href={lead.site} target="_blank" rel="noopener noreferrer" style={{ background: 'none', border: '1px solid ' + D.line, color: D.ink, borderRadius: 6, padding: '7px 10px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            Site
          </a>
        )}
        <a href={linkBuscaCnpj(lead.nome, lead.endereco)} target="_blank" rel="noopener noreferrer" style={{ background: 'none', border: '1px solid ' + D.line, color: D.ink, borderRadius: 6, padding: '7px 10px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
          Buscar CNPJ
        </a>
        {lead.lead_id ? (
          <button onClick={onAbrirNoCrm} style={{ background: D.ink, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            Ver no CRM
          </button>
        ) : (
          <button
            onClick={onPromover}
            disabled={promovendo}
            style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 10px', fontSize: 12, fontWeight: 700, cursor: promovendo ? 'default' : 'pointer', opacity: promovendo ? 0.6 : 1 }}
          >
            {promovendo ? 'Promovendo...' : 'Promover'}
          </button>
        )}
      </div>
    </div>
  )
}
