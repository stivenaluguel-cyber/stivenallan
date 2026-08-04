'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { enderecoResumido } from '@/lib/prospeccao/formatacao'
import { linkWhatsappProspeccao } from '@/lib/prospeccao/whatsapp'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512', bronze: '#D24E22',
  muted: '#6B655B', line: 'rgba(26,24,21,0.08)', green: '#22c55e', red: '#ef4444', blue: '#3b82f6',
}

const CLASSIFICACAO_COR: Record<string, string> = {
  EXCELENTE: D.green, 'MUITO FORTE': D.green, FORTE: D.blue, BOM: '#f59e0b', FRACO: D.muted,
}

const STATUS_LABEL: Record<string, string> = {
  novo: 'Novo', contatado: 'Contatado', ignorado: 'Ignorado', promovido: 'Promovido',
}

// Colunas do Kanban — mesmo padrão de arrastar-e-soltar de /dashboard/leads,
// pra Prospecção não parecer um módulo à parte do resto do dashboard.
// 'promovido' não aceita ARRASTE (ver onDropNaColuna) — só o botão
// "Promover" cria o lead de verdade, e sempre com confirmação: soltar um
// card ali sem querer não pode virar cliente no CRM sozinho.
const COLUNAS = [
  { key: 'novo', label: 'Novo', cor: D.muted },
  { key: 'contatado', label: 'Contatado', cor: D.blue },
  { key: 'ignorado', label: 'Ignorado', cor: D.red },
  { key: 'promovido', label: 'Promovido', cor: D.green },
] as const

type Campanha = {
  id: string; nome: string; alvo: string | null; localizacao: string | null; produto: string
  leads_solicitados: number; leads_entregues: number
}

type Socio = { nome: string; cargo: string | null }

type ProspeccaoLead = {
  id: string; place_id: string; nome: string; endereco: string | null
  telefone: string | null; site: string | null; rating: number | null; rating_count: number | null
  tipos: string[]
  score: number | null; score_fit: number | null; score_potencial: number | null; score_acessibilidade: number | null
  classificacao: string | null; contexto_ia: string | null
  status: string; lead_id: string | null
  cnpj: string | null; razao_social: string | null; situacao_cnpj: string | null; socios: Socio[] | null
}

const QUANTIDADES = [10, 20, 30, 50]

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
  const [leadAberto, setLeadAberto] = useState<ProspeccaoLead | null>(null)

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

  // Sem confirm() nativo de propósito: trava a renderização (inclusive
  // testes automatizados e, em navegador embutido/PWA, pode nem aparecer
  // direito) e o resto do dashboard já resolve confirmação de ação
  // irreversível com um passo a mais na própria UI (ver "Excluir" em
  // /dashboard/leads). Quem chama já pediu essa confirmação antes de
  // invocar promover — ver `confirmando` em LeadCard/LeadDetalheModal.
  async function promover(lead: ProspeccaoLead) {
    setPromovendoId(lead.id); setErro('')
    try {
      const res = await fetch('/api/admin/prospeccao/leads/' + lead.id + '/promover', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Falha ao promover.'); return }
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, lead_id: data.lead_id, status: 'promovido' } : l)))
      setLeadAberto((prev) => (prev?.id === lead.id ? { ...prev, lead_id: data.lead_id, status: 'promovido' } : prev))
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
    // Arraste nunca promove sozinho — cai de volta na coluna atual até o
    // corretor confirmar pelo botão "Promover" (no card ou na ficha).
    if (colunaKey === 'promovido') return
    mudarStatus(lead.id, colunaKey)
  }

  function abrirNoCrm(leadId: string) {
    router.push('/dashboard/crm?lead=' + leadId)
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
        {leads.length} lead{leads.length === 1 ? '' : 's'} nesta campanha · {campanha.leads_solicitados} solicitados no total · clique num card pra ver a ficha completa
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
                  <p style={{ fontSize: 12, color: D.muted, textAlign: 'center', padding: '18px 0' }}>
                    {coluna.key === 'promovido' ? 'Use o botão Promover no card' : 'Arraste leads para cá'}
                  </p>
                ) : (
                  doColuna.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      produto={campanha.produto}
                      promovendo={promovendoId === lead.id}
                      onDragStart={setDragId}
                      onAbrir={() => setLeadAberto(lead)}
                      onPromover={() => promover(lead)}
                      onAbrirNoCrm={() => lead.lead_id && abrirNoCrm(lead.lead_id)}
                    />
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}

      {leadAberto && (
        <LeadDetalheModal
          lead={leadAberto}
          produto={campanha.produto}
          promovendo={promovendoId === leadAberto.id}
          onClose={() => setLeadAberto(null)}
          onPromover={() => promover(leadAberto)}
          onAbrirNoCrm={() => leadAberto.lead_id && abrirNoCrm(leadAberto.lead_id)}
        />
      )}
    </div>
  )
}

function LeadCard({
  lead, produto, promovendo, onDragStart, onAbrir, onPromover, onAbrirNoCrm,
}: {
  lead: ProspeccaoLead
  produto: string
  promovendo: boolean
  onDragStart: (id: string) => void
  onAbrir: () => void
  onPromover: () => void
  onAbrirNoCrm: () => void
}) {
  const [confirmando, setConfirmando] = useState(false)
  const cor = CLASSIFICACAO_COR[lead.classificacao ?? ''] ?? D.muted
  const wa = linkWhatsappProspeccao(lead.telefone, lead.nome, produto)
  const arrastavel = lead.status !== 'promovido'
  const parar = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <div
      draggable={arrastavel}
      onDragStart={(e) => { if (!arrastavel) { e.preventDefault(); return } e.stopPropagation(); onDragStart(lead.id) }}
      onClick={onAbrir}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onAbrir() }}
      style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 10, padding: '10px 12px', marginBottom: 8, cursor: arrastavel ? 'grab' : 'pointer' }}
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
          <a href={wa} target="_blank" rel="noopener noreferrer" onClick={parar} style={{ background: '#25D366', color: '#fff', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
            WhatsApp
          </a>
        )}
        {lead.telefone && (
          <a href={'tel:' + lead.telefone.replace(/\D/g, '')} onClick={parar} style={{ background: 'none', border: '1px solid ' + D.line, color: D.ink, borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
            Ligar
          </a>
        )}
        {lead.site && (
          <a href={lead.site} target="_blank" rel="noopener noreferrer" onClick={parar} style={{ background: 'none', border: '1px solid ' + D.line, color: D.ink, borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
            Site
          </a>
        )}
        <a href={linkBuscaCnpj(lead.nome, lead.endereco)} target="_blank" rel="noopener noreferrer" onClick={parar} style={{ background: 'none', border: '1px solid ' + D.line, color: D.ink, borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
          Buscar CNPJ
        </a>
        {lead.lead_id ? (
          <button onClick={(e) => { parar(e); onAbrirNoCrm() }} style={{ background: D.ink, color: '#fff', border: 'none', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            Ver no CRM
          </button>
        ) : confirmando ? (
          <>
            <button
              onClick={(e) => { parar(e); setConfirmando(false); onPromover() }}
              disabled={promovendo}
              style={{ background: D.red, color: '#fff', border: 'none', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700, cursor: promovendo ? 'default' : 'pointer', opacity: promovendo ? 0.6 : 1 }}
            >
              {promovendo ? 'Promovendo...' : 'Confirma?'}
            </button>
            <button onClick={(e) => { parar(e); setConfirmando(false) }} style={{ background: 'none', border: '1px solid ' + D.line, color: D.muted, borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              Cancelar
            </button>
          </>
        ) : (
          <button onClick={(e) => { parar(e); setConfirmando(true) }} style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            Promover
          </button>
        )}
      </div>
    </div>
  )
}

function BarraScore({ label, valor }: { label: string; valor: number | null }) {
  const v = valor ?? 0
  const cor = v >= 80 ? D.green : v >= 55 ? '#f59e0b' : D.red
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: D.muted, marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color: cor }}>{valor ?? '—'}</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: D.line, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: Math.min(100, v) + '%', background: cor, borderRadius: 999 }} />
      </div>
    </div>
  )
}

function LeadDetalheModal({
  lead, produto, promovendo, onClose, onPromover, onAbrirNoCrm,
}: {
  lead: ProspeccaoLead
  produto: string
  promovendo: boolean
  onClose: () => void
  onPromover: () => void
  onAbrirNoCrm: () => void
}) {
  const [confirmando, setConfirmando] = useState(false)
  const [cnpjInfo, setCnpjInfo] = useState<{ cnpj: string; razaoSocial: string; situacao: string | null; socios: Socio[] } | null>(
    lead.cnpj ? { cnpj: lead.cnpj, razaoSocial: lead.razao_social ?? lead.nome, situacao: lead.situacao_cnpj, socios: lead.socios ?? [] } : null,
  )
  const [buscandoCnpj, setBuscandoCnpj] = useState(false)
  const [erroCnpj, setErroCnpj] = useState('')
  const cor = CLASSIFICACAO_COR[lead.classificacao ?? ''] ?? D.muted
  const wa = linkWhatsappProspeccao(lead.telefone, lead.nome, produto)

  async function buscarCnpjAutomatico() {
    if (buscandoCnpj) return
    setBuscandoCnpj(true); setErroCnpj('')
    try {
      const res = await fetch('/api/admin/prospeccao/leads/' + lead.id + '/cnpj', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setErroCnpj(data.error || 'Falha ao buscar CNPJ.'); return }
      setCnpjInfo({ cnpj: data.cnpj, razaoSocial: data.razaoSocial, situacao: data.situacao, socios: data.socios ?? [] })
    } catch {
      setErroCnpj('Falha ao conectar.')
    } finally {
      setBuscandoCnpj(false)
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 16 }}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto', background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ background: D.bronze, padding: '20px 60px 20px 24px', borderRadius: '16px 16px 0 0' }}>
          <h2 style={{ color: '#fff', fontSize: 19, fontWeight: 700, margin: 0 }}>{lead.nome}</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12.5, margin: '4px 0 0' }}>
            {lead.score ?? '—'} pts · {lead.classificacao ?? 'sem classificação'} · {STATUS_LABEL[lead.status] ?? lead.status}
          </p>
        </div>
        <button onClick={onClose} aria-label="Fechar" style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 18, lineHeight: 1 }}>×</button>

        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contato & canais</span>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <tbody>
                <tr>
                  <td style={{ color: D.muted, padding: '6px 0', borderBottom: '1px solid ' + D.line, fontSize: 13, width: '32%' }}>Endereço</td>
                  <td style={{ padding: '6px 0', borderBottom: '1px solid ' + D.line, fontSize: 13.5, fontWeight: 600 }}>{lead.endereco ?? '—'}</td>
                </tr>
                <tr>
                  <td style={{ color: D.muted, padding: '6px 0', borderBottom: '1px solid ' + D.line, fontSize: 13 }}>Telefone</td>
                  <td style={{ padding: '6px 0', borderBottom: '1px solid ' + D.line, fontSize: 13.5, fontWeight: 600 }}>{lead.telefone ?? '—'}</td>
                </tr>
                <tr>
                  <td style={{ color: D.muted, padding: '6px 0', borderBottom: '1px solid ' + D.line, fontSize: 13 }}>Site</td>
                  <td style={{ padding: '6px 0', borderBottom: '1px solid ' + D.line, fontSize: 13.5, fontWeight: 600 }}>
                    {lead.site ? <a href={lead.site} target="_blank" rel="noopener noreferrer" style={{ color: D.bronze, textDecoration: 'none' }}>{lead.site} ↗</a> : '—'}
                  </td>
                </tr>
                <tr>
                  <td style={{ color: D.muted, padding: '6px 0', borderBottom: '1px solid ' + D.line, fontSize: 13 }}>Avaliação Google</td>
                  <td style={{ padding: '6px 0', borderBottom: '1px solid ' + D.line, fontSize: 13.5, fontWeight: 600 }}>
                    {lead.rating ? '★ ' + lead.rating.toFixed(1) + ' (' + (lead.rating_count ?? 0) + ' avaliações)' : '—'}
                  </td>
                </tr>
                <tr>
                  <td style={{ color: D.muted, padding: '6px 0', fontSize: 13 }}>Categorias</td>
                  <td style={{ padding: '6px 0', fontSize: 12.5 }}>
                    {lead.tipos?.length ? lead.tipos.slice(0, 4).join(', ').replace(/_/g, ' ') : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {lead.contexto_ia && (
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Por que a IA achou esse fit</span>
              <p style={{ fontSize: 13.5, color: D.ink, lineHeight: 1.5, margin: '8px 0 0' }}>{lead.contexto_ia}</p>
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qualificação</span>
            <div style={{ marginTop: 10 }}>
              <BarraScore label="Fit de nicho" valor={lead.score_fit} />
              <BarraScore label="Potencial do negócio" valor={lead.score_potencial} />
              <BarraScore label="Acessibilidade" valor={lead.score_acessibilidade} />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CNPJ & sócios</span>
            {cnpjInfo ? (
              <div style={{ marginTop: 8, background: D.bg, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: D.ink }}>{cnpjInfo.cnpj}</div>
                <div style={{ fontSize: 12.5, color: D.muted, marginTop: 2 }}>
                  {cnpjInfo.razaoSocial}{cnpjInfo.situacao ? ' · ' + cnpjInfo.situacao : ''}
                </div>
                {cnpjInfo.socios.length > 0 ? (
                  <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12.5, color: D.ink, lineHeight: 1.6 }}>
                    {cnpjInfo.socios.map((s, i) => (
                      <li key={i}>{s.nome}{s.cargo ? ' — ' + s.cargo : ''}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: 12, color: D.muted, margin: '8px 0 0' }}>Nenhum sócio retornado nessa consulta.</p>
                )}
                <p style={{ fontSize: 10.5, color: D.muted, margin: '8px 0 0' }}>
                  CPF do sócio não vem completo — a Receita Federal mascara por lei (LGPD) em qualquer fonte, mesmo paga.
                </p>
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={buscarCnpjAutomatico}
                  disabled={buscandoCnpj}
                  style={{ background: D.ink, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 12px', fontSize: 12.5, fontWeight: 700, cursor: buscandoCnpj ? 'default' : 'pointer', opacity: buscandoCnpj ? 0.6 : 1 }}
                >
                  {buscandoCnpj ? 'Buscando...' : 'Buscar CNPJ automático'}
                </button>
                {erroCnpj && <p role="alert" style={{ fontSize: 11.5, color: '#dc2626', margin: '8px 0 0' }}>{erroCnpj}</p>}
                <p style={{ fontSize: 10.5, color: D.muted, margin: '8px 0 0' }}>
                  Puxa CNPJ, razão social e sócios pelo nome da empresa (cnpja.com). CPF nunca vem completo — protegido por lei em qualquer fonte.
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" style={{ flex: '1 1 120px', background: '#25D366', color: '#fff', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
                WhatsApp
              </a>
            )}
            {lead.telefone && (
              <a href={'tel:' + lead.telefone.replace(/\D/g, '')} style={{ flex: '1 1 100px', background: 'none', border: '1px solid ' + D.line, color: D.ink, borderRadius: 8, padding: '10px 12px', fontSize: 13, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
                Ligar
              </a>
            )}
            <a href={linkBuscaCnpj(lead.nome, lead.endereco)} target="_blank" rel="noopener noreferrer" style={{ flex: '1 1 120px', background: 'none', border: '1px solid ' + D.line, color: D.ink, borderRadius: 8, padding: '10px 12px', fontSize: 13, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
              Buscar CNPJ
            </a>
            {lead.lead_id ? (
              <button onClick={onAbrirNoCrm} style={{ flex: '1 1 140px', background: D.ink, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Ver no CRM
              </button>
            ) : confirmando ? (
              <>
                <button
                  onClick={() => { setConfirmando(false); onPromover() }}
                  disabled={promovendo}
                  style={{ flex: '1 1 140px', background: D.red, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontWeight: 700, cursor: promovendo ? 'default' : 'pointer', opacity: promovendo ? 0.6 : 1 }}
                >
                  {promovendo ? 'Promovendo...' : 'Confirma? Cria lead de verdade'}
                </button>
                <button onClick={() => setConfirmando(false)} style={{ flex: '1 1 100px', background: 'none', border: '1px solid ' + D.line, color: D.muted, borderRadius: 8, padding: '10px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmando(true)}
                style={{ flex: '1 1 140px', background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Promover para o CRM
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
