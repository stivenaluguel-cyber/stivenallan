'use client'
import { useState, useEffect, useCallback } from 'react'

interface Cliente {
  id: string
  nome: string
  telefone: string
  email?: string
  cpf?: string
  cidade?: string
  perfil_busca?: string
  renda_mensal?: number
  estado_civil?: string
  tem_fgts?: boolean
  notas?: string
  created_at: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', cpf: '', cidade: '', perfil_busca: '', renda_mensal: '', estado_civil: 'solteiro', tem_fgts: false, notas: '' })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [pagina, setPagina] = useState(1)
  const [total, setTotal] = useState(0)

  const buscarClientes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(pagina), limit: '20' })
      if (busca) params.set('busca', busca)
      const res = await fetch('/api/admin/clientes?' + params)
      const json = await res.json()
      setClientes(json.data || [])
      setTotal(json.count || 0)
    } catch { setErro('Erro ao carregar clientes') }
    setLoading(false)
  }, [busca, pagina])

  useEffect(() => { buscarClientes() }, [buscarClientes])

  function abrirModal(c?: Cliente) {
    if (c) {
      setClienteSelecionado(c)
      setForm({ nome: c.nome, telefone: c.telefone, email: c.email || '', cpf: c.cpf || '', cidade: c.cidade || '', perfil_busca: c.perfil_busca || '', renda_mensal: c.renda_mensal ? String(c.renda_mensal) : '', estado_civil: c.estado_civil || 'solteiro', tem_fgts: c.tem_fgts || false, notas: c.notas || '' })
    } else {
      setClienteSelecionado(null)
      setForm({ nome: '', telefone: '', email: '', cpf: '', cidade: '', perfil_busca: '', renda_mensal: '', estado_civil: 'solteiro', tem_fgts: false, notas: '' })
    }
    setModalAberto(true)
    setErro('')
  }

  async function salvarCliente(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      const payload = { ...form, renda_mensal: form.renda_mensal ? Number(form.renda_mensal) : null }
      let res: Response
      if (clienteSelecionado) {
        res = await fetch('/api/admin/clientes', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: clienteSelecionado.id, ...payload }) })
      } else {
        res = await fetch('/api/admin/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      }
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || 'Erro') }
      setModalAberto(false)
      buscarClientes()
    } catch (e: unknown) { setErro(e instanceof Error ? e.message : 'Erro ao salvar') }
    setSalvando(false)
  }

  function formatTel(t: string) { return t.replace(/\D/g,'').replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3') }
  function formatData(d: string) { return new Date(d).toLocaleDateString('pt-BR') }
  function formatRenda(r?: number) { return r ? r.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—' }

  const totalPags = Math.ceil(total / 20)

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', margin: 0 }}>Clientes</h1>
          <p style={{ color: '#666', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>{total} cliente{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => abrirModal()} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.625rem 1.25rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          + Novo Cliente
        </button>
      </div>

      {/* Busca */}
      <div style={{ marginBottom: '1rem' }}>
        <input value={busca} onChange={e => { setBusca(e.target.value); setPagina(1) }} placeholder="Buscar por nome, telefone ou email..." style={{ width: '100%', padding: '0.625rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Tabela */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Carregando...</div>
        ) : clientes.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Nenhum cliente encontrado</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Nome</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Telefone</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Cidade</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Renda</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>FGTS</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Cadastro</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < clientes.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#111' }}>{c.nome}</div>
                      {c.email && <div style={{ color: '#666', fontSize: '0.8rem' }}>{c.email}</div>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#374151' }}>
                      <a href={'https://wa.me/55' + c.telefone.replace(/\D/g,'')} target="_blank" rel="noreferrer" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 500 }}>
                        {formatTel(c.telefone)}
                      </a>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#374151' }}>{c.cidade || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#374151' }}>{formatRenda(c.renda_mensal)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: c.tem_fgts ? '#dcfce7' : '#f3f4f6', color: c.tem_fgts ? '#16a34a' : '#6b7280' }}>
                        {c.tem_fgts ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.8rem' }}>{formatData(c.created_at)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button onClick={() => abrirModal(c)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', color: '#374151' }}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginacao */}
      {totalPags > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: pagina === 1 ? '#f9fafb' : '#fff', cursor: pagina === 1 ? 'default' : 'pointer', color: '#374151' }}>
            ← Anterior
          </button>
          <span style={{ padding: '0.5rem 1rem', color: '#666', fontSize: '0.875rem' }}>{pagina} / {totalPags}</span>
          <button onClick={() => setPagina(p => Math.min(totalPags, p + 1))} disabled={pagina === totalPags} style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: pagina === totalPags ? '#f9fafb' : '#fff', cursor: pagina === totalPags ? 'default' : 'pointer', color: '#374151' }}>
            Próxima →
          </button>
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => { if (e.target === e.currentTarget) setModalAberto(false) }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{clienteSelecionado ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button onClick={() => setModalAberto(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666', lineHeight: 1 }}>×</button>
            </div>
            {erro && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>{erro}</div>}
            <form onSubmit={salvarCliente} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Nome *</label>
                  <input required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Telefone *</label>
                  <input required value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(48) 99999-9999" style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>CPF</label>
                  <input value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Cidade</label>
                  <input value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Estado Civil</label>
                  <select value={form.estado_civil} onChange={e => setForm(f => ({ ...f, estado_civil: e.target.value }))} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }}>
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                    <option value="uniao_estavel">União Estável</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Renda Mensal (R$)</label>
                  <input type="number" value={form.renda_mensal} onChange={e => setForm(f => ({ ...f, renda_mensal: e.target.value }))} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                    <input type="checkbox" checked={form.tem_fgts} onChange={e => setForm(f => ({ ...f, tem_fgts: e.target.checked }))} style={{ width: '1rem', height: '1rem' }} />
                    Possui FGTS
                  </label>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Perfil de Busca</label>
                <input value={form.perfil_busca} onChange={e => setForm(f => ({ ...f, perfil_busca: e.target.value }))} placeholder="Ex: Apto 2 quartos, até R$ 400k, Criciúma" style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Notas</label>
                <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={3} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                <button type="button" onClick={() => setModalAberto(false)} style={{ padding: '0.625rem 1.25rem', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', color: '#374151' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} style={{ padding: '0.625rem 1.25rem', border: 'none', borderRadius: '6px', background: salvando ? '#9ca3af' : '#111', color: '#fff', cursor: salvando ? 'default' : 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                  {salvando ? 'Salvando...' : clienteSelecionado ? 'Salvar' : 'Criar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
