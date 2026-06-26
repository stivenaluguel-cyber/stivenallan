'use client'
import { useState, useEffect, useCallback } from 'react'

interface Proposta {
  id: string
  valor_proposto: number
  entrada?: number
  parcelas_qtd?: number
  parcelas_valor?: number
  status: string
  versao: number
  observacoes?: string
  created_at: string
  leads?: { nome: string; telefone: string }
  empreendimentos?: { nome: string; slug: string }
}

const STATUS_COR: Record<string, { bg: string; cor: string; label: string }> = {
  pendente:   { bg: '#fef9c3', cor: '#ca8a04', label: 'Pendente' },
  em_analise: { bg: '#dbeafe', cor: '#2563eb', label: 'Em Análise' },
  aceita:     { bg: '#dcfce7', cor: '#16a34a', label: 'Aceita' },
  recusada:   { bg: '#fee2e2', cor: '#dc2626', label: 'Recusada' },
  cancelada:  { bg: '#f3f4f6', cor: '#6b7280', label: 'Cancelada' },
}

export default function PropostasPage() {
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [pagina, setPagina] = useState(1)
  const [total, setTotal] = useState(0)
  const [modalAberto, setModalAberto] = useState(false)
  const [propostaSel, setPropostaSel] = useState<Proposta | null>(null)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const buscar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(pagina), limit: '20' })
      if (filtroStatus) params.set('status', filtroStatus)
      const res = await fetch('/api/admin/propostas?' + params)
      const json = await res.json()
      setPropostas(json.data || [])
      setTotal(json.count || 0)
    } catch { setErro('Erro ao carregar') }
    setLoading(false)
  }, [filtroStatus, pagina])

  useEffect(() => { buscar() }, [buscar])

  async function mudarStatus(id: string, status: string) {
    setSalvando(true)
    await fetch('/api/admin/propostas', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    setSalvando(false)
    buscar()
  }

  function fmtMoeda(v?: number) { return v != null ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—' }
  function fmtData(s: string) { return new Date(s).toLocaleDateString('pt-BR') }

  const totalPags = Math.ceil(total / 20)

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', margin: 0 }}>Propostas e Vendas</h1>
          <p style={{ color: '#666', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>{total} proposta{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Resumo por status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {Object.entries(STATUS_COR).map(([key, s]) => (
          <button key={key} onClick={() => { setFiltroStatus(filtroStatus === key ? '' : key); setPagina(1) }} style={{ background: filtroStatus === key ? s.bg : '#fff', border: '2px solid ' + (filtroStatus === key ? s.cor : '#e5e7eb'), borderRadius: '8px', padding: '0.75rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: s.cor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Carregando...</div>
        ) : propostas.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Nenhuma proposta encontrada</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
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
                              <button onClick={() => mudarStatus(p.id, 'aceita')} disabled={salvando} style={{ background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>✓ Aceitar</button>
                              <button onClick={() => mudarStatus(p.id, 'recusada')} disabled={salvando} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Recusar</button>
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
                          <button onClick={() => { setPropostaSel(p); setModalAberto(true) }} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>Detalhes</button>
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

      {/* Modal detalhes */}
      {modalAberto && propostaSel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => { if (e.target===e.currentTarget) setModalAberto(false) }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Detalhes da Proposta</h2>
              <button onClick={() => setModalAberto(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[['Lead', propostaSel.leads?.nome || '—'],['Empreendimento', propostaSel.empreendimentos?.nome || '—'],['Valor', fmtMoeda(propostaSel.valor_proposto)],['Entrada', fmtMoeda(propostaSel.entrada)],['Parcelas', propostaSel.parcelas_qtd ? propostaSel.parcelas_qtd + 'x ' + fmtMoeda(propostaSel.parcelas_valor) : '—'],['Versão', '#' + propostaSel.versao],['Status', STATUS_COR[propostaSel.status]?.label || propostaSel.status],['Data', fmtData(propostaSel.created_at)]].map(([k,v]) => (
                  <div key={k}><div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{k}</div><div style={{ fontWeight: 600, color: '#111' }}>{v}</div></div>
                ))}
              </div>
              {propostaSel.observacoes && (
                <div><div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Observações</div><div style={{ color: '#374151', lineHeight: 1.6 }}>{propostaSel.observacoes}</div></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
