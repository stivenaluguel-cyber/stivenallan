'use client'
import { useState, useEffect, useCallback } from 'react'

interface Proposta {
  id: string
  valor_proposto: number
  entrada?: number
  parcelas_qtd?: number
  parcelas_valor?: number
  reforcos?: number
  reforcos_valor?: number
  chaves_valor?: number
  status: string
  versao: number
  observacoes?: string
  created_at: string
  leads?: { nome: string; telefone: string }
  empreendimentos?: { nome: string; slug: string }
}

interface NovaPropostaForm {
  lead_nome: string
  lead_telefone: string
  empreendimento_nome: string
  valor_proposto: string
  entrada: string
  parcelas_qtd: string
  parcelas_valor: string
  reforcos: string
  reforcos_valor: string
  chaves_valor: string
  status: string
  observacoes: string
}

const STATUS_COR: Record<string, { bg: string; cor: string; label: string }> = {
  pendente: { bg: '#fef9c3', cor: '#ca8a04', label: 'Pendente' },
  em_analise: { bg: '#dbeafe', cor: '#2563eb', label: 'Em Análise' },
  aceita: { bg: '#dcfce7', cor: '#16a34a', label: 'Aceita' },
  recusada: { bg: '#fee2e2', cor: '#dc2626', label: 'Recusada' },
  cancelada: { bg: '#f3f4f6', cor: '#6b7280', label: 'Cancelada' },
}

const defaultNova: NovaPropostaForm = {
  lead_nome: '', lead_telefone: '', empreendimento_nome: '',
  valor_proposto: '', entrada: '', parcelas_qtd: '', parcelas_valor: '',
  reforcos: '', reforcos_valor: '', chaves_valor: '',
  status: 'pendente', observacoes: '',
}

function fmtMoeda(v?: number) { return v != null ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—' }
function fmtData(s: string) { return new Date(s).toLocaleDateString('pt-BR') }
function parseMoeda(s: string) { return parseFloat(s.replace(/[^d,]/g, '').replace(',', '.')) || 0 }

export default function PropostasPage() {
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [pagina, setPagina] = useState(1)
  const [total, setTotal] = useState(0)
  const [modalDetalhe, setModalDetalhe] = useState(false)
  const [propostaSel, setPropostaSel] = useState<Proposta | null>(null)
  const [modalNova, setModalNova] = useState(false)
  const [novaForm, setNovaForm] = useState<NovaPropostaForm>(defaultNova)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const buscar = useCallback(async () => {
    setLoading(true)
    try {
      // Tenta API; cai em localStorage se falhar
      const params = new URLSearchParams({ page: String(pagina), limit: '20' })
      if (filtroStatus) params.set('status', filtroStatus)
      const res = await fetch('/api/admin/propostas?' + params)
      if (!res.ok) throw new Error('api_off')
      const json = await res.json()
      setPropostas(json.data || [])
      setTotal(json.count || 0)
    } catch {
      // Fallback localStorage
      const stored = localStorage.getItem('propostas_local')
      const all: Proposta[] = stored ? JSON.parse(stored) : []
      const filtered = filtroStatus ? all.filter(p => p.status === filtroStatus) : all
      setPropostas(filtered.slice((pagina - 1) * 20, pagina * 20))
      setTotal(filtered.length)
    }
    setLoading(false)
  }, [filtroStatus, pagina])

  useEffect(() => { buscar() }, [buscar])

  async function mudarStatus(id: string, status: string) {
    setSalvando(true)
    try {
      const res = await fetch('/api/admin/propostas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      if (!res.ok) throw new Error()
    } catch {
      // Fallback localStorage
      const stored = localStorage.getItem('propostas_local')
      const all: Proposta[] = stored ? JSON.parse(stored) : []
      const idx = all.findIndex(p => p.id === id)
      if (idx >= 0) { all[idx].status = status; localStorage.setItem('propostas_local', JSON.stringify(all)) }
    }
    setSalvando(false)
    buscar()
  }

  async function criarProposta() {
    if (!novaForm.lead_nome.trim() || !novaForm.valor_proposto) {
      setErro('Nome do lead e valor são obrigatórios.')
      return
    }
    setSalvando(true); setErro('')
    const novaProposta: Proposta = {
      id: crypto.randomUUID(),
      valor_proposto: parseMoeda(novaForm.valor_proposto),
      entrada: parseMoeda(novaForm.entrada) || undefined,
      parcelas_qtd: Number(novaForm.parcelas_qtd) || undefined,
      parcelas_valor: parseMoeda(novaForm.parcelas_valor) || undefined,
      reforcos: Number(novaForm.reforcos) || undefined,
      reforcos_valor: parseMoeda(novaForm.reforcos_valor) || undefined,
      chaves_valor: parseMoeda(novaForm.chaves_valor) || undefined,
      status: novaForm.status,
      versao: 1,
      observacoes: novaForm.observacoes || undefined,
      created_at: new Date().toISOString(),
      leads: { nome: novaForm.lead_nome, telefone: novaForm.lead_telefone },
      empreendimentos: novaForm.empreendimento_nome
        ? { nome: novaForm.empreendimento_nome, slug: '' }
        : undefined,
    }
    try {
      const res = await fetch('/api/admin/propostas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaProposta)
      })
      if (!res.ok) throw new Error()
    } catch {
      // Fallback localStorage
      const stored = localStorage.getItem('propostas_local')
      const all: Proposta[] = stored ? JSON.parse(stored) : []
      all.unshift(novaProposta)
      localStorage.setItem('propostas_local', JSON.stringify(all))
    }
    setSalvando(false)
    setModalNova(false)
    setNovaForm(defaultNova)
    buscar()
  }

  const totalPags = Math.ceil(total / 20)

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1.5px solid #e5e7eb', fontSize: 14, background: '#f9fafb',
    boxSizing: 'border-box', color: '#111827',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: '#6b7280', marginBottom: 4, textTransform: 'uppercase',
  }

  const contadores = Object.fromEntries(
    Object.keys(STATUS_COR).map(k => [k, propostas.filter(p => p.status === k).length])
  )

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>Propostas e Vendas</h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>{total} proposta{total !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setModalNova(true); setErro('') }}
          style={{ background: '#D24E22', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          + Nova Proposta
        </button>
      </div>

      {/* Resumo por status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {Object.entries(STATUS_COR).map(([key, s]) => (
          <button key={key} onClick={() => { setFiltroStatus(filtroStatus === key ? '' : key); setPagina(1) }} style={{ background: filtroStatus === key ? s.bg : '#fff', border: '2px solid ' + (filtroStatus === key ? s.cor : '#e5e7eb'), borderRadius: '8px', padding: '0.75rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: s.cor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginTop: 4 }}>{contadores[key] || 0}</div>
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Carregando...</div>
        ) : propostas.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Nenhuma proposta encontrada</div>
            <div style={{ fontSize: 14, marginBottom: 20 }}>Crie a primeira proposta para começar</div>
            <button onClick={() => setModalNova(true)} style={{ background: '#D24E22', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>+ Nova Proposta</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>Propostas e vendas cadastradas</caption>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Lead</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Empreendimento</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Valor</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Entrada</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Parcelas</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Data</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {propostas.map((p, i) => {
                  const st = STATUS_COR[p.status] || STATUS_COR.pendente
                  return (
                    <tr key={p.id} style={{ borderBottom: i < propostas.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#111' }}>{p.leads?.nome || '—'}</div>
                        {p.leads?.telefone && (
                          <a href={'https://wa.me/55' + p.leads.telefone.replace(/\D/g,'')} target="_blank" rel="noreferrer" style={{ color: '#16a34a', fontSize: '0.75rem', textDecoration: 'none' }}>WhatsApp</a>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#374151' }}>{p.empreendimentos?.nome || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#111' }}>{fmtMoeda(p.valor_proposto)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#374151' }}>{fmtMoeda(p.entrada)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#374151' }}>
                        {p.parcelas_qtd ? p.parcelas_qtd + 'x ' + fmtMoeda(p.parcelas_valor) : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', background: st.bg, color: st.cor, fontSize: '0.75rem', fontWeight: 700 }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.8rem' }}>{fmtData(p.created_at)}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {p.status === 'pendente' && (
                            <>
                              <button onClick={() => mudarStatus(p.id, 'aceita')} disabled={salvando} style={{ background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>✓</button>
                              <button onClick={() => mudarStatus(p.id, 'recusada')} disabled={salvando} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>✗</button>
                              <button onClick={() => mudarStatus(p.id, 'em_analise')} disabled={salvando} style={{ background: '#dbeafe', color: '#2563eb', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>Análise</button>
                            </>
                          )}
                          {p.status === 'em_analise' && (
                            <>
                              <button onClick={() => mudarStatus(p.id, 'aceita')} disabled={salvando} style={{ background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>✓ Aceitar</button>
                              <button onClick={() => mudarStatus(p.id, 'recusada')} disabled={salvando} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>Recusar</button>
                            </>
                          )}
                          {(p.status === 'aceita' || p.status === 'recusada') && (
                            <button onClick={() => mudarStatus(p.id, 'cancelada')} disabled={salvando} style={{ background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>Cancelar</button>
                          )}
                          <button onClick={() => { setPropostaSel(p); setModalDetalhe(true) }} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', color: '#374151' }}>Ver</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginacao */}
      {totalPags > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={() => setPagina(p => Math.max(1,p-1))} disabled={pagina===1} style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer', color: '#374151' }}>←</button>
          <span style={{ padding: '0.5rem 1rem', color: '#666' }}>{pagina} / {totalPags}</span>
          <button onClick={() => setPagina(p => Math.min(totalPags,p+1))} disabled={pagina===totalPags} style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer', color: '#374151' }}>→</button>
        </div>
      )}

      {/* Modal Detalhes */}
      {modalDetalhe && propostaSel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => { if (e.target===e.currentTarget) setModalDetalhe(false) }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Detalhes da Proposta</h2>
              <button onClick={() => setModalDetalhe(false)} aria-label="Fechar" style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
              {[
                ['Lead', propostaSel.leads?.nome || '—'],
                ['Empreendimento', propostaSel.empreendimentos?.nome || '—'],
                ['Valor', fmtMoeda(propostaSel.valor_proposto)],
                ['Entrada', fmtMoeda(propostaSel.entrada)],
                ['Parcelas', propostaSel.parcelas_qtd ? propostaSel.parcelas_qtd + 'x ' + fmtMoeda(propostaSel.parcelas_valor) : '—'],
                ['Reforços', propostaSel.reforcos ? propostaSel.reforcos + 'x ' + fmtMoeda(propostaSel.reforcos_valor) : '—'],
                ['Parcela Chaves', fmtMoeda(propostaSel.chaves_valor)],
                ['Versão', '#' + propostaSel.versao],
                ['Status', STATUS_COR[propostaSel.status]?.label || propostaSel.status],
                ['Data', fmtData(propostaSel.created_at)],
              ].map(([k,v]) => (
                <div key={k}><div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{k}</div><div style={{ fontWeight: 600, color: '#111827' }}>{v}</div></div>
              ))}
            </div>
            {propostaSel.observacoes && (
              <div style={{ marginTop: 12 }}><div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Observações</div><div style={{ color: '#374151', lineHeight: 1.6 }}>{propostaSel.observacoes}</div></div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nova Proposta */}
      {modalNova && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => { if (e.target===e.currentTarget) setModalNova(false) }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Nova Proposta</h2>
              <button onClick={() => setModalNova(false)} aria-label="Fechar" style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>×</button>
            </div>

            {erro && <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#DC2626', fontSize: 13 }}>⚠️ {erro}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lbl} htmlFor="proposta-lead-nome">Nome do Lead *</label><input id="proposta-lead-nome" style={inp} value={novaForm.lead_nome} onChange={e => setNovaForm(f => ({...f, lead_nome: e.target.value}))} placeholder="Ex: João Silva" /></div>
                <div><label style={lbl} htmlFor="proposta-lead-telefone">Telefone/WhatsApp</label><input id="proposta-lead-telefone" style={inp} value={novaForm.lead_telefone} onChange={e => setNovaForm(f => ({...f, lead_telefone: e.target.value}))} placeholder="(48) 99999-9999" /></div>
              </div>
              <div><label style={lbl} htmlFor="proposta-empreendimento">Empreendimento</label><input id="proposta-empreendimento" style={inp} value={novaForm.empreendimento_nome} onChange={e => setNovaForm(f => ({...f, empreendimento_nome: e.target.value}))} placeholder="Nome do empreendimento" /></div>

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12, marginTop: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#D24E22', marginBottom: 12, textTransform: 'uppercase' }}>Plano de Pagamento (Financiamento Direto)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={lbl} htmlFor="proposta-valor">Valor do Imóvel (R$) *</label><input id="proposta-valor" style={inp} value={novaForm.valor_proposto} onChange={e => setNovaForm(f => ({...f, valor_proposto: e.target.value}))} placeholder="R$ 0,00" /></div>
                  <div><label style={lbl} htmlFor="proposta-entrada">Entrada/Sinal (R$)</label><input id="proposta-entrada" style={inp} value={novaForm.entrada} onChange={e => setNovaForm(f => ({...f, entrada: e.target.value}))} placeholder="R$ 0,00" /></div>
                  <div><label style={lbl} htmlFor="proposta-parcelas-qtd">Qtd. Parcelas Mensais</label><input id="proposta-parcelas-qtd" type="number" style={inp} value={novaForm.parcelas_qtd} onChange={e => setNovaForm(f => ({...f, parcelas_qtd: e.target.value}))} placeholder="Ex: 36" min="0" /></div>
                  <div><label style={lbl} htmlFor="proposta-parcelas-valor">Valor da Parcela (R$)</label><input id="proposta-parcelas-valor" style={inp} value={novaForm.parcelas_valor} onChange={e => setNovaForm(f => ({...f, parcelas_valor: e.target.value}))} placeholder="R$ 0,00" /></div>
                  <div><label style={lbl} htmlFor="proposta-reforcos">Qtd. Reforços</label><input id="proposta-reforcos" type="number" style={inp} value={novaForm.reforcos} onChange={e => setNovaForm(f => ({...f, reforcos: e.target.value}))} placeholder="Ex: 2" min="0" /></div>
                  <div><label style={lbl} htmlFor="proposta-reforcos-valor">Valor do Reforço (R$)</label><input id="proposta-reforcos-valor" style={inp} value={novaForm.reforcos_valor} onChange={e => setNovaForm(f => ({...f, reforcos_valor: e.target.value}))} placeholder="R$ 0,00" /></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={lbl} htmlFor="proposta-chaves-valor">Parcela das Chaves (R$)</label><input id="proposta-chaves-valor" style={inp} value={novaForm.chaves_valor} onChange={e => setNovaForm(f => ({...f, chaves_valor: e.target.value}))} placeholder="Saldo na entrega das chaves" /></div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl} htmlFor="proposta-status">Status</label>
                  <select id="proposta-status" style={inp} value={novaForm.status} onChange={e => setNovaForm(f => ({...f, status: e.target.value}))}>
                    {Object.entries(STATUS_COR).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div><label style={lbl} htmlFor="proposta-observacoes">Observações</label><textarea id="proposta-observacoes" rows={3} style={{ ...inp, resize: 'vertical' } as React.CSSProperties} value={novaForm.observacoes} onChange={e => setNovaForm(f => ({...f, observacoes: e.target.value}))} placeholder="Condições especiais, notas..." /></div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => setModalNova(false)} style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={criarProposta} disabled={salvando} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: salvando ? '#f97316' : '#D24E22', color: '#fff', fontWeight: 700, cursor: salvando ? 'not-allowed' : 'pointer' }}>
                {salvando ? 'Salvando...' : '+ Criar Proposta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
