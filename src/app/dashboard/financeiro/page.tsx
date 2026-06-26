'use client'
import { useState, useEffect } from 'react'

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
}

export default function FinanceiroPage() {
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [loading, setLoading] = useState(true)
  const [percComissao, setPercComissao] = useState(3)
  const [cub, setCub] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const [pRes, cubRes] = await Promise.all([
          fetch('/api/admin/propostas?limit=100'),
          fetch('/api/admin/cub')
        ])
        const pJson = await pRes.json()
        const cubJson = await cubRes.json()
        setPropostas(pJson.data || [])
        setCub(cubJson.data?.valor_m2 || 0)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const aceitas = propostas.filter(p => p.status === 'aceita')
  const pendentes = propostas.filter(p => p.status === 'pendente' || p.status === 'em_analise')
  const totalVendas = aceitas.reduce((s, p) => s + (p.valor_proposto || 0), 0)
  const totalEntradas = aceitas.reduce((s, p) => s + (p.entrada || 0), 0)
  const totalComissoes = totalVendas * (percComissao / 100)
  const totalPendente = pendentes.reduce((s, p) => s + (p.valor_proposto || 0), 0)

  function fmtMoeda(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
  function fmtData(s: string) { return new Date(s).toLocaleDateString('pt-BR') }

  // Agrupar vendas por mes
  const porMes: Record<string, number> = {}
  aceitas.forEach(p => {
    const mes = p.created_at.slice(0,7)
    porMes[mes] = (porMes[mes] || 0) + p.valor_proposto
  })
  const meses = Object.keys(porMes).sort().slice(-6)
  const maxVal = Math.max(...meses.map(m => porMes[m]), 1)

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', margin: 0 }}>Financeiro</h1>
          <p style={{ color: '#666', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>Fluxo de caixa e comissões</p>
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
          { label: 'CUB/SC Vigente', value: cub ? 'R$ ' + cub.toLocaleString('pt-BR') + '/m²' : 'N/A', cor: '#8b5cf6', desc: 'SINDUSCON-SC' },
        ].map((k, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', borderTop: '3px solid ' + k.cor }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{k.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: k.cor, marginBottom: '0.25rem' }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#999' }}>{k.desc}</div>
          </div>
        ))}
      </div>

      {/* Calculadora de comissao */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem' }}>Calculadora de Comissão</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', fontSize: '0.875rem' }}>
          {[1, 1.5, 2, 2.5, 3, 4, 5, 6].map(p => (
            <div key={p} style={{ background: p === percComissao ? '#111' : '#f9fafb', borderRadius: '8px', padding: '0.75rem', cursor: 'pointer', border: '1px solid ' + (p===percComissao?'#111':'#e5e7eb') }} onClick={() => setPercComissao(p)}>
              <div style={{ fontWeight: 700, color: p===percComissao?'#fff':'#111' }}>{p}%</div>
              <div style={{ color: p===percComissao?'#ccc':'#666', fontSize: '0.8rem' }}>{fmtMoeda(totalVendas * p/100)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grafico de barras por mes */}
      {meses.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem' }}>Vendas por Mês</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '120px' }}>
            {meses.map(mes => {
              const val = porMes[mes]
              const h = Math.max(8, (val / maxVal) * 100)
              const [ano, m] = mes.split('-')
              const mLabel = new Date(Number(ano), Number(m)-1).toLocaleDateString('pt-BR', { month: 'short' })
              return (
                <div key={mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ fontSize: '0.65rem', color: '#666', fontWeight: 600 }}>{fmtMoeda(val).replace('R$ ','R$').slice(0,-3)}k</div>
                  <div style={{ width: '100%', background: '#D24E22', borderRadius: '4px 4px 0 0', height: h + 'px', transition: 'height 0.3s' }} />
                  <div style={{ fontSize: '0.7rem', color: '#666' }}>{mLabel}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tabela de vendas */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '1rem' }}>Vendas Concluídas</div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Carregando...</div>
        ) : aceitas.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Nenhuma venda concluída</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Lead','Empreendimento','Valor Venda','Entrada','Parcelas','Comissão','Data'].map(h => (
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
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#374151' }}>{fmtMoeda(p.entrada||0)}</td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#374151' }}>{p.parcelas_qtd ? p.parcelas_qtd+'x '+fmtMoeda(p.parcelas_valor||0) : '—'}</td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#D24E22' }}>{fmtMoeda(p.valor_proposto * percComissao/100)}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#6b7280', fontSize: '0.8rem' }}>{fmtData(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb', fontWeight: 700 }}>
                  <td colSpan={2} style={{ padding: '0.75rem', color: '#374151' }}>TOTAL ({aceitas.length} vendas)</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#22c55e' }}>{fmtMoeda(totalVendas)}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#374151' }}>{fmtMoeda(totalEntradas)}</td>
                  <td style={{ padding: '0.75rem' }}></td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#D24E22' }}>{fmtMoeda(totalComissoes)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
