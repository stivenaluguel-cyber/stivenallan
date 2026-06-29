'use client'
import { useState, useEffect, useCallback } from 'react'

interface Proposta {
  id: string
  valor_proposto: number
  entrada?: number
  parcelas_qtd?: number
  parcelas_valor?: number
  status: string
  created_at: string
  leads?: { nome: string }
  empreendimentos?: { nome: string }
  recebido?: number
  a_receber?: number
}

interface RegistroCub {
  competencia: string
  competencia_label: string
  valor_m2: number
  atualizado_em: string
}

// Stub isolado para futura automacao via API SINDUSCON-SC
function getCubValue(historico: RegistroCub[]): RegistroCub | null {
  if (!historico.length) return null
  return [...historico].sort((a, b) => b.competencia.localeCompare(a.competencia))[0]
}

function fmtMoeda(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function fmtData(s: string) { return new Date(s).toLocaleDateString('pt-BR') }
function fmtDateTime(s: string) { return new Date(s).toLocaleString('pt-BR') }

export default function FinanceiroPage() {
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [loading, setLoading] = useState(true)
  const [percComissao, setPercComissao] = useState(3)
  const [cubHistorico, setCubHistorico] = useState<RegistroCub[]>([])
  const [modalCub, setModalCub] = useState(false)
  const [cubInputValor, setCubInputValor] = useState('')
  const [cubSalvando, setCubSalvando] = useState(false)
  const [cubCompLabel, setCubCompLabel] = useState('')
  const [cubCompKey, setCubCompKey] = useState('')
  const [cubStatus, setCubStatus] = useState('')
  const [modalVenda, setModalVenda] = useState(false)
  const [vendaSalvando, setVendaSalvando] = useState(false)
  const [vendaRecebido, setVendaRecebido] = useState('')
  const [vendaAReceber, setVendaAReceber] = useState('')
  const [modalEditar, setModalEditar] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [confirmarExcluir, setConfirmarExcluir] = useState<string | null>(null)
  const [vendaCliente, setVendaCliente] = useState('')
  const [vendaEmpreendimento, setVendaEmpreendimento] = useState('')
  const [vendaValor, setVendaValor] = useState('')
  const [vendaEntrada, setVendaEntrada] = useState('')
  const [vendaParcelasQtd, setVendaParcelasQtd] = useState('')
  const [vendaParcelasValor, setVendaParcelasValor] = useState('')
  const [vendaData, setVendaData] = useState(new Date().toISOString().slice(0,10))

  useEffect(() => {
    const stored = localStorage.getItem('cub_historico')
    if (stored) setCubHistorico(JSON.parse(stored))
  }, [])

  const loadPropostas = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/propostas?limit=100')
      if (!res.ok) throw new Error()
      const json = await res.json()
      const apiData = json.data || []
        // merge with any vendas registradas manualmente (localStorage fallback)
        const localRaw = localStorage.getItem('propostas_local')
        const local: any[] = localRaw ? JSON.parse(localRaw).filter((p:any) => !apiData.find((a:any)=>a.id===p.id)) : []
        setPropostas([...apiData, ...local])
    } catch {
      const stored = localStorage.getItem('propostas_local')
      setPropostas(stored ? JSON.parse(stored) : [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadPropostas() }, [loadPropostas])

  async function salvarVenda() {
    const valor = parseFloat(vendaValor.replace(/[^\d,]/g,'').replace(',','.'))
    if (!vendaCliente.trim() || !valor || isNaN(valor)) return
    setVendaSalvando(true)
    try {
      const payload: any = {
        status: 'aceita',
        valor_proposto: valor,
        entrada: vendaEntrada ? parseFloat(vendaEntrada.replace(/[^\d,]/g,'').replace(',','.')) : undefined,
        parcelas_qtd: vendaParcelasQtd ? parseInt(vendaParcelasQtd) : undefined,
        parcelas_valor: vendaParcelasValor ? parseFloat(vendaParcelasValor.replace(/[^\d,]/g,'').replace(',','.')) : undefined,
        recebido: vendaRecebido ? parseFloat(vendaRecebido.replace(/[^\d,]/g,'').replace(',','.')) : 0,
        a_receber: vendaAReceber ? parseFloat(vendaAReceber.replace(/[^\d,]/g,'').replace(',','.')) : 0,
        created_at: vendaData || new Date().toISOString(),
        leads: { nome: vendaCliente.trim() },
        empreendimentos: { nome: vendaEmpreendimento.trim() || '—' },
      }
      if (editandoId) {
        setPropostas(prev => prev.map(p => p.id === editandoId ? { ...p, ...payload, id: editandoId } : p))
        const arrE = JSON.parse(localStorage.getItem('propostas_local') || '[]')
        localStorage.setItem('propostas_local', JSON.stringify(arrE.map((p: any) => p.id === editandoId ? { ...p, ...payload } : p)))
        try { await fetch('/api/admin/propostas/' + editandoId, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }) } catch {}
      } else {
        try {
          const res = await fetch('/api/admin/propostas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          if (res.ok) { await loadPropostas() } else { throw new Error('api') }
        } catch {
          const id = crypto.randomUUID()
          const nova = { id, ...payload }
          const arr = JSON.parse(localStorage.getItem('propostas_local') || '[]')
          arr.unshift(nova); localStorage.setItem('propostas_local', JSON.stringify(arr))
          setPropostas(prev => [nova as any, ...prev])
        }
      }
      setVendaCliente(''); setVendaEmpreendimento(''); setVendaValor('')
      setVendaEntrada(''); setVendaParcelasQtd(''); setVendaParcelasValor('')
      setVendaRecebido(''); setVendaAReceber('')
      setVendaData(new Date().toISOString().slice(0,10))
      setEditandoId(null); setModalEditar(false); setModalVenda(false)
    } finally { setVendaSalvando(false) }
  }

  function abrirEditar(p: Proposta) {
    setEditandoId(p.id)
    setVendaCliente(p.leads?.nome || '')
    setVendaEmpreendimento(p.empreendimentos?.nome || '')
    setVendaValor(p.valor_proposto ? String(p.valor_proposto) : '')
    setVendaEntrada(p.entrada ? String(p.entrada) : '')
    setVendaParcelasQtd(p.parcelas_qtd ? String(p.parcelas_qtd) : '')
    setVendaParcelasValor(p.parcelas_valor ? String(p.parcelas_valor) : '')
    setVendaRecebido(p.recebido ? String(p.recebido) : '')
    setVendaAReceber(p.a_receber ? String(p.a_receber) : '')
    setVendaData(p.created_at?.slice(0,10) || new Date().toISOString().slice(0,10))
    setModalEditar(true)
  }

  function excluirVenda(id: string) {
    setPropostas(prev => prev.filter(p => p.id !== id))
    const arr = JSON.parse(localStorage.getItem('propostas_local') || '[]')
    localStorage.setItem('propostas_local', JSON.stringify(arr.filter((p: any) => p.id !== id)))
    try { fetch('/api/admin/propostas/' + id, { method: 'DELETE' }) } catch {}
    setConfirmarExcluir(null)
  }

    async function atualizarCub() {
    setCubSalvando(true)
    try {
      const res = await fetch('/api/cub', { cache: 'no-store' })
      if (!res.ok) throw new Error('Falha ao consultar o SINDUSCON')
      const data = await res.json()
      // competencia vem da fonte oficial (mes "para ser usado em")
      const fallbackAgora = new Date().toISOString().slice(0, 7)
      const competencia = data.competencia || fallbackAgora
      const labelBruto = data.competencia_label || new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      const competencia_label = labelBruto.charAt(0).toUpperCase() + labelBruto.slice(1)
      const novo: RegistroCub = {
        competencia,
        competencia_label,
        valor_m2: Number(data.valor_m2),
        atualizado_em: new Date().toISOString(),
      }
      // upsert: nao duplica a mesma competencia
      const hist = cubHistorico.filter(c => c.competencia !== competencia)
      hist.unshift(novo)
      setCubHistorico(hist)
      localStorage.setItem('cub_historico', JSON.stringify(hist))
      setCubStatus(data.online
        ? 'Atualizado pelo SINDUSCON (' + competencia_label + ')'
        : 'SINDUSCON indisponivel — usando ultimo valor conhecido (' + competencia_label + ')')
    } catch (e) {
      setCubStatus('Nao foi possivel atualizar agora. Tente novamente em instantes.')
    } finally {
      setCubSalvando(false)
    }
  }

  function salvarCub() {
    const valor = parseFloat(cubInputValor.replace(/[^\d,]/g, '').replace(',', '.'))
    if (!valor || isNaN(valor)) return
    setCubSalvando(true)
    const novo: RegistroCub = {
      competencia: cubCompKey,
      competencia_label: cubCompLabel,
      valor_m2: valor,
      atualizado_em: new Date().toISOString(),
    }
    const hist = cubHistorico.filter(c => c.competencia !== cubCompKey)
    hist.unshift(novo)
    setCubHistorico(hist)
    localStorage.setItem('cub_historico', JSON.stringify(hist))
    setCubSalvando(false)
    setModalCub(false)
  }

  const cubAtual = getCubValue([...cubHistorico])
  const aceitas = propostas.filter(p => p.status === 'aceita')
  const pendentes = propostas.filter(p => p.status === 'pendente' || p.status === 'em_analise')
  const totalVendas = aceitas.reduce((s, p) => s + (p.valor_proposto || 0), 0)
  const totalEntradas = aceitas.reduce((s, p) => s + (p.entrada || 0), 0)
  const totalComissoes = totalVendas * (percComissao / 100)
  const totalPendente = pendentes.reduce((s, p) => s + (p.valor_proposto || 0), 0)

  const porMes: Record<string, number> = {}
  aceitas.forEach(p => {
    const mes = p.created_at.slice(0,7)
    porMes[mes] = (porMes[mes] || 0) + p.valor_proposto
  })
  const meses = Object.keys(porMes).sort().slice(-6)
  const maxVal = Math.max(...meses.map(m => porMes[m]), 1)

  const inp: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1.5px solid #e5e7eb', fontSize: 14, background: '#f9fafb',
    boxSizing: 'border-box', color: '#111827',
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>Financeiro</h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>Fluxo de caixa e comissões</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>% Comissão:</label>
          <input type="number" min={1} max={6} step={0.5} value={percComissao} onChange={e => setPercComissao(Number(e.target.value))} style={{ width: '70px', padding: '0.4rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', textAlign: 'center' }} />
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Vendido', value: fmtMoeda(totalVendas), cor: '#22c55e', desc: aceitas.length + ' venda' + (aceitas.length!==1?'s':'') },
          { label: 'Entradas Recebidas', value: fmtMoeda(totalEntradas), cor: '#3b82f6', desc: 'soma das entradas' },
          { label: 'Comissões (' + percComissao + '%)', value: fmtMoeda(totalComissoes), cor: '#D24E22', desc: 'sobre vendas aceitas' },
          { label: 'Pipeline Pendente', value: fmtMoeda(totalPendente), cor: '#f59e0b', desc: pendentes.length + ' proposta' + (pendentes.length!==1?'s':'') },
        ].map((k, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', borderTop: '3px solid ' + k.cor }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{k.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: k.cor, marginBottom: '0.25rem' }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{k.desc}</div>
          </div>
        ))}
      </div>

      {/* CUB/SC Card */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', borderTop: '3px solid #8b5cf6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>CUB/SC Vigente</div>
            {cubAtual ? (
              <>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8b5cf6' }}>R$ {cubAtual.valor_m2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<span style={{ fontSize: 14, color: '#9ca3af', fontWeight: 400 }}>/m²</span></div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Competência: <strong>{cubAtual.competencia_label}</strong></div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Atualizado em {fmtDateTime(cubAtual.atualizado_em)}</div>
              </>
            ) : (
              <div style={{ fontSize: 14, color: '#9ca3af', fontStyle: 'italic' }}>Sem CUB cadastrado — clique em Atualizar</div>
            )}
          </div>
          <button onClick={atualizarCub} disabled={cubSalvando} style={{ background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>{cubSalvando ? 'Atualizando...' : 'Atualizar CUB'}</button>
        </div>
        {cubStatus && (
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#16a34a', fontStyle: 'italic' }}>{cubStatus}</p>
        )}
        {cubHistorico.length > 1 && (
          <div style={{ marginTop: 16, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' }}>Histórico</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {cubHistorico.slice(0, 6).map(c => (
                <div key={c.competencia} style={{ background: '#f5f3ff', borderRadius: 6, padding: '4px 10px', fontSize: 12 }}>
                  <span style={{ color: '#8b5cf6', fontWeight: 700 }}>R$ {c.valor_m2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span style={{ color: '#9ca3af', marginLeft: 4 }}>· {c.competencia_label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Calculadora */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', color: '#111827' }}>Calculadora de Comissão</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', fontSize: '0.875rem' }}>
          {[1, 1.5, 2, 2.5, 3, 4, 5, 6].map(p => (
            <div key={p} style={{ background: p === percComissao ? '#D24E22' : '#f9fafb', borderRadius: '8px', padding: '0.75rem', cursor: 'pointer', border: '1px solid ' + (p===percComissao?'#D24E22':'#e5e7eb') }} onClick={() => setPercComissao(p)}>
              <div style={{ fontWeight: 700, color: p===percComissao?'#fff':'#111827' }}>{p}%</div>
              <div style={{ color: p===percComissao?'rgba(255,255,255,0.8)':'#6b7280', fontSize: '0.8rem' }}>{fmtMoeda(totalVendas * p/100)}</div>
            </div>
          ))}
        </div>
      </div>

      {meses.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', color: '#111827' }}>Vendas por Mês</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '120px' }}>
            {meses.map(mes => {
              const val = porMes[mes]
              const h = Math.max(8, (val / maxVal) * 100)
              const [ano, m] = mes.split('-')
              const mLabel = new Date(Number(ano), Number(m)-1).toLocaleDateString('pt-BR', { month: 'short' })
              return (
                <div key={mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ fontSize: '0.65rem', color: '#666', fontWeight: 600 }}>{(val/1000).toFixed(0)}k</div>
                  <div style={{ width: '100%', background: '#D24E22', borderRadius: '4px 4px 0 0', height: h + 'px', transition: 'height 0.3s' }} />
                  <div style={{ fontSize: '0.7rem', color: '#666' }}>{mLabel}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>Vendas Concluídas</span>
          <button
            onClick={() => setModalVenda(true)}
            style={{ background: '#ea580c', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            ＋ Registrar Venda
          </button>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Carregando...</div>
        ) : aceitas.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💼</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Nenhuma venda concluída</div>
            <div style={{ fontSize: 14 }}>As propostas aceitas aparecerão aqui</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Lead','Empreendimento','Valor Venda','Entrada','Recebido','A Receber','Comissão','Data','Ações'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: h==='Lead'||h==='Empreendimento'||h==='Data'?'left':'right', fontWeight: 600, color: '#374151', fontSize: '0.8rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {aceitas.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i<aceitas.length-1?'1px solid #f3f4f6':'none' }}>
                <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#111' }}>{p.leads?.nome || '—'}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#374151' }}>{p.empreendimentos?.nome || '—'}</td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#22c55e' }}>{fmtMoeda(p.valor_proposto)}</td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#374151' }}>{p.entrada ? fmtMoeda(p.entrada) : '—'}</td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>{(p.recebido||0)>0 ? fmtMoeda(p.recebido!) : <span style={{color:'#9ca3af'}}>—</span>}</td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600, color: (p.a_receber||0)>0 ? '#ea580c' : '#9ca3af' }}>{(p.a_receber||0)>0 ? fmtMoeda(p.a_receber!) : <span style={{color:'#9ca3af'}}>—</span>}</td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#D24E22' }}>{fmtMoeda(p.valor_proposto * (percComissao / 100))}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#6b7280', fontSize: '0.8rem' }}>{fmtData(p.created_at)}</td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <button onClick={() => abrirEditar(p)} title="Editar" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, padding: '2px 5px' }}>✏️</button>
                  <button onClick={() => setConfirmarExcluir(p.id)} title="Excluir" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, padding: '2px 5px' }}>🗑️</button>
                </td>
              </tr>
                ))}
              </tbody>
              <tfoot>
              <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb', fontWeight: 700 }}>
                <td colSpan={2} style={{ padding: '0.75rem', color: '#374151' }}>TOTAL ({aceitas.length} venda{aceitas.length !== 1 ? 's' : ''})</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#22c55e' }}>{fmtMoeda(totalVendas)}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#374151' }}>{fmtMoeda(totalEntradas)}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#16a34a' }}>{fmtMoeda(aceitas.reduce((s,p)=>s+(p.recebido||0),0))}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#ea580c' }}>{fmtMoeda(aceitas.reduce((s,p)=>s+(p.a_receber||0),0))}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', color: '#D24E22' }}>{fmtMoeda(totalComissoes)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal Registrar Venda */}
      {(modalVenda || modalEditar) && (
        <div onClick={() => setModalVenda(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>{editandoId ? '✏️ Editar Venda' : '✅ Registrar Venda Concluída'}</h2>
              <button onClick={() => { setModalVenda(false); setModalEditar(false); setEditandoId(null) }} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4, textTransform: 'uppercase' }}>Cliente / Lead *</label>
                <input
                  type="text" value={vendaCliente} onChange={e => setVendaCliente(e.target.value)}
                  placeholder="Nome do cliente"
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4, textTransform: 'uppercase' }}>Empreendimento</label>
                <input
                  type="text" value={vendaEmpreendimento} onChange={e => setVendaEmpreendimento(e.target.value)}
                  placeholder="Nome do empreendimento"
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4, textTransform: 'uppercase' }}>Valor da Venda (R$) *</label>
                  <input
                    type="text" value={vendaValor} onChange={e => setVendaValor(e.target.value)}
                    placeholder="Ex: 350.000,00"
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4, textTransform: 'uppercase' }}>Entrada (R$)</label>
                  <input
                    type="text" value={vendaEntrada} onChange={e => setVendaEntrada(e.target.value)}
                    placeholder="Ex: 70.000,00"
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4, textTransform: 'uppercase' }}>Parcelas (qtd)</label>
                  <input
                    type="number" value={vendaParcelasQtd} onChange={e => setVendaParcelasQtd(e.target.value)}
                    placeholder="Ex: 120"
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4, textTransform: 'uppercase' }}>Valor Parcela (R$)</label>
                  <input
                    type="text" value={vendaParcelasValor} onChange={e => setVendaParcelasValor(e.target.value)}
                    placeholder="Ex: 2.333,33"
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 4, textTransform: 'uppercase' }}>✅ Recebido (R$)</label>
                  <input type="text" value={vendaRecebido} onChange={e => setVendaRecebido(e.target.value)} placeholder="Valor já recebido" style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#ea580c', marginBottom: 4, textTransform: 'uppercase' }}>⏳ A Receber (R$)</label>
                  <input type="text" value={vendaAReceber} onChange={e => setVendaAReceber(e.target.value)} placeholder="Valor pendente" style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              </div>
                            <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4, textTransform: 'uppercase' }}>Data da Venda</label>
                <input
                  type="date" value={vendaData} onChange={e => setVendaData(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => { setModalVenda(false); setModalEditar(false); setEditandoId(null) }} style={{ padding: '9px 18px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button
                onClick={salvarVenda}
                disabled={vendaSalvando || !vendaCliente.trim() || !vendaValor}
                style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: vendaSalvando || !vendaCliente.trim() || !vendaValor ? '#d1d5db' : '#ea580c', color: '#fff', fontWeight: 700, cursor: vendaSalvando || !vendaCliente.trim() || !vendaValor ? 'not-allowed' : 'pointer' }}
              >
                {vendaSalvando ? 'Salvando...' : editandoId ? '💾 Salvar Alterações' : '✅ Confirmar Venda'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar Exclusão */}
      {confirmarExcluir && (
        <div onClick={() => setConfirmarExcluir(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#111827' }}>🗑️ Excluir venda?</h3>
            <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: 14 }}>Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmarExcluir(null)} style={{ padding: '9px 18px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => excluirVenda(confirmarExcluir as string)} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Sim, excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal CUB */}
      {modalCub && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if(e.target===e.currentTarget) setModalCub(false) }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Atualizar CUB/SC</h2>
              <button onClick={() => setModalCub(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>
            <div style={{ background: '#f5f3ff', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>Competência (calculada automaticamente)</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#8b5cf6', marginTop: 4 }}>{cubCompLabel}</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>Valor do CUB (R$/m²) — fonte: SINDUSCON-SC</label>
              <input style={inp} type="text" value={cubInputValor} onChange={e => setCubInputValor(e.target.value)} placeholder="Ex: 2.154,32" autoFocus />
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>* Informe o valor do CUB/SC publicado pelo SINDUSCON-SC para {cubCompLabel}.</div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setModalCub(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={salvarCub} disabled={cubSalvando || !cubInputValor} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#8b5cf6', color: '#fff', fontWeight: 700, cursor: cubInputValor ? 'pointer' : 'not-allowed', opacity: cubInputValor ? 1 : 0.6 }}>{cubSalvando ? 'Salvando...' : 'Salvar CUB'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}
