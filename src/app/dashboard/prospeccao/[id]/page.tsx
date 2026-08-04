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

// Colunas do Kanban — mesmo padrão de arrastar-e-soltar de /dashboard/leads,
// pra Prospecção não parecer um módulo à parte do resto do dashboard.
// 'promovido' não é um valor aceito por PATCH /leads/[id] (ver STATUS_VALIDOS
// na rota) — soltar um card ali dispara o POST /promover de verdade, não um
// PATCH de status.
const COLUNAS = [
  { key: 'novo', label: 'Novo', cor: D.muted },
  { key: 'contatado', label: 'Contatado', cor: D.blue },
  { key: 'ignorado', label: 'Ignorado', cor: D.red },
  { key: 'promovido', label: 'Promovido', cor: D.green },
] as const

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
  const [dragId, setDragId] = useState<string | null>(null)
  const [promovendoId, setPromovendoId] = useState<string | null>(null)

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

  // Otimista com rollback: mesmo padrão de moverLead() em
  // /dashboard/leads — atualiza a tela na hora, e só desfaz se o PATCH
  // falhar de verdade.
  async function mudarStatus(leadProspeccaoId: string, status: string) {
    const anterior = leads.find((l) => l.id === leadProspeccaoId)?.status
    setLeads((prev) => prev.map((l) => (l.id === leadProspeccaoId ? { ...l, status } : l)))
    try {
      const res = await fetch('/api/admin/prospeccao/leads/' + leadProspeccaoId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setLeads((prev) => prev.map((l) => (l.id === leadProspeccaoId ? { ...l, status: anterior ?? l.status } : l)))
      setErro('Não deu pra mudar o status — tente de novo.')
    }
  }

  async function promover(leadProspeccaoId: string) {
    setPromovendoId(leadProspeccaoId); setErro('')
    try {
      const res = await fetch('/api/admin/prospeccao/leads/' + leadProspeccaoId + '/promover', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Falha ao promover.'); return }
      setLeads((prev) => prev.map((l) => (l.id === leadProspeccaoId ? { ...l, lead_id: data.lead_id, status: 'promovido' } : l)))
    } catch {
      setErro('Falha ao conectar.')
    } finally {
      setPromovendoId(null)
    }
  }

  function onDropNaColuna(colunaKey: string) {
    if (!dragId) return
    const lead = leads.find((l) => l.id === dragId)
    setDragId(null)
    if (!lead || lead.status === colunaKey) return
    if (colunaKey === 'promovido') promover(lead.id)
    else mudarStatus(lead.id, colunaKey)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: D.muted }}>Carregando...</div>
  if (!campanha) return <div style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>{erro || 'Campanha não encontrada.'}</div>

  return (
    <div style={{ minHeight: '100vh', background: D.bg, padding: '24px 20px' }}>
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
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
          {COLUNAS.map((coluna) => {
            const doColuna = leads.filter((l) => l.status === coluna.key).sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
            return (
              <div
                key={coluna.key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropNaColuna(coluna.key)}
                style={{ flex: '0 0 300px', width: 300, background: D.surface, borderRadius: 14, padding: 12, border: '1px solid ' + D.line }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: coluna.cor, display: 'inline-block' }} />
                  <span style={{ fontWeight: 700, fontSize: 13, color: D.ink }}>{coluna.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: D.muted, background: D.bg, borderRadius: 999, padding: '1px 8px' }}>{doColuna.length}</span>
                </div>
                {doColuna.length === 0 ? (
                  <p style={{ fontSize: 12, color: D.muted, textAlign: 'center', padding: '18px 0' }}>Arraste leads para cá</p>
                ) : (
                  doColuna.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      promovendo={promovendoId === lead.id}
                      onDragStart={setDragId}
                      onPromover={() => promover(lead.id)}
                      onAbrirNoCrm={() => lead.lead_id && router.push('/dashboard/crm?lead=' + lead.lead_id)}
                    />
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function LeadCard({
  lead, promovendo, onDragStart, onPromover, onAbrirNoCrm,
}: {
  lead: ProspeccaoLead
  promovendo: boolean
  onDragStart: (id: string) => void
  onPromover: () => void
  onAbrirNoCrm: () => void
}) {
  const cor = CLASSIFICACAO_COR[lead.classificacao ?? ''] ?? D.muted
  const wa = linkWhatsapp(lead.telefone)
  const arrastavel = lead.status !== 'promovido'

  return (
    <div
      draggable={arrastavel}
      onDragStart={(e) => { if (!arrastavel) { e.preventDefault(); return } e.stopPropagation(); onDragStart(lead.id) }}
      style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 10, padding: '10px 12px', marginBottom: 8, cursor: arrastavel ? 'grab' : 'default' }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: cor }}>{lead.score ?? '—'}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: cor, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{lead.classificacao ?? ''}</span>
      </div>

      <div style={{ fontSize: 13.5, fontWeight: 700, color: D.ink }}>{lead.nome}</div>
      <div style={{ fontSize: 11.5, color: D.muted, marginTop: 2 }}>{enderecoResumido(lead.endereco)}</div>
      {lead.contexto_ia && <div style={{ fontSize: 11.5, color: D.muted, marginTop: 4, lineHeight: 1.4 }}>{lead.contexto_ia}</div>}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
            WhatsApp
          </a>
        )}
        {lead.telefone && (
          <a href={'tel:' + lead.telefone.replace(/\D/g, '')} style={{ background: 'none', border: '1px solid ' + D.line, color: D.ink, borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
            Ligar
          </a>
        )}
        {lead.site && (
          <a href={lead.site} target="_blank" rel="noopener noreferrer" style={{ background: 'none', border: '1px solid ' + D.line, color: D.ink, borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
            Site
          </a>
        )}
        <a href={linkBuscaCnpj(lead.nome, lead.endereco)} target="_blank" rel="noopener noreferrer" style={{ background: 'none', border: '1px solid ' + D.line, color: D.ink, borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
          Buscar CNPJ
        </a>
        {lead.lead_id ? (
          <button onClick={onAbrirNoCrm} style={{ background: D.ink, color: '#fff', border: 'none', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            Ver no CRM
          </button>
        ) : (
          <button
            onClick={onPromover}
            disabled={promovendo}
            style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700, cursor: promovendo ? 'default' : 'pointer', opacity: promovendo ? 0.6 : 1 }}
          >
            {promovendo ? 'Promovendo...' : 'Promover'}
          </button>
        )}
      </div>
    </div>
  )
}
