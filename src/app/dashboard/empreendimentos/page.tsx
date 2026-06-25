'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Empreendimento = {
  id: string
  nome: string
  construtora: string
  cidade: string
  uf: string
  slug: string
  status_obra: string
  status_venda: string
  preco_a_partir: number | null
  created_at: string
}

const STATUS_OBRA_LABEL: Record<string, string> = {
  lancamento: 'Lançamento',
  em_obras: 'Em Obras',
  pronto: 'Pronto',
}

const STATUS_VENDA_LABEL: Record<string, string> = {
  ativo: 'Ativo',
  pausado: 'Pausado',
  encerrado: 'Encerrado',
}

const STATUS_VENDA_COLOR: Record<string, string> = {
  ativo: '#22c55e',
  pausado: '#f59e0b',
  encerrado: '#ef4444',
}

export default function EmpreendimentosPage() {
  const router = useRouter()
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchEmpreendimentos()
  }, [])

  async function fetchEmpreendimentos() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/empreendimentos')
      if (res.status === 401) { router.push('/dashboard/login'); return }
      const json = await res.json()
      setEmpreendimentos(json.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"? Esta ação não pode ser desfeita.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/empreendimentos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setEmpreendimentos(prev => prev.filter(e => e.id !== id))
      } else {
        alert('Erro ao excluir empreendimento')
      }
    } catch (e) {
      alert('Erro ao excluir empreendimento')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleStatusVenda(id: string, novoStatus: string) {
    try {
      await fetch(`/api/admin/empreendimentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_venda: novoStatus }),
      })
      setEmpreendimentos(prev => prev.map(e => e.id === id ? { ...e, status_venda: novoStatus } : e))
    } catch (e) {
      alert('Erro ao atualizar status')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#121315', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#202327', borderBottom: '1px solid #2a2d31', padding: '0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="/dashboard" style={{ color: '#c9a24b', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>SA Imóveis</a>
            <span style={{ color: '#a7adb4' }}>›</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>Empreendimentos</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <a href="/dashboard" style={{ color: '#a7adb4', textDecoration: 'none', fontSize: 14 }}>Dashboard</a>
            <a href="/dashboard/leads" style={{ color: '#a7adb4', textDecoration: 'none', fontSize: 14 }}>Leads</a>
            <button
              onClick={() => router.push('/dashboard/empreendimentos/novo')}
              style={{ background: '#c9a24b', color: '#000', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
            >
              + Novo Empreendimento
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Empreendimentos</h1>
          <p style={{ color: '#a7adb4', margin: '4px 0 0' }}>{empreendimentos.length} empreendimento{empreendimentos.length !== 1 ? 's' : ''} cadastrado{empreendimentos.length !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
            <div style={{ width: 40, height: 40, border: '3px solid #2a2d31', borderTopColor: '#c9a24b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : empreendimentos.length === 0 ? (
          <div style={{ background: '#202327', borderRadius: 12, padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
            <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Nenhum empreendimento cadastrado</h3>
            <p style={{ color: '#a7adb4', marginBottom: 24 }}>Cadastre seu primeiro empreendimento para exibi-lo no site.</p>
            <button
              onClick={() => router.push('/dashboard/empreendimentos/novo')}
              style={{ background: '#c9a24b', color: '#000', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, cursor: 'pointer' }}
            >
              + Cadastrar Empreendimento
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {empreendimentos.map(emp => (
              <div key={emp.id} style={{ background: '#202327', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #2a2d31' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{emp.nome}</h3>
                    <span style={{ fontSize: 12, background: '#2a2d31', padding: '2px 10px', borderRadius: 20, color: '#a7adb4' }}>
                      {STATUS_OBRA_LABEL[emp.status_obra] || emp.status_obra}
                    </span>
                    <span style={{ fontSize: 12, background: STATUS_VENDA_COLOR[emp.status_venda] + '22', color: STATUS_VENDA_COLOR[emp.status_venda], padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>
                      {STATUS_VENDA_LABEL[emp.status_venda] || emp.status_venda}
                    </span>
                  </div>
                  <p style={{ color: '#a7adb4', margin: 0, fontSize: 14 }}>
                    {emp.construtora} · {emp.cidade}/{emp.uf}
                    {emp.preco_a_partir ? ` · A partir de R$ ${emp.preco_a_partir.toLocaleString('pt-BR')}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <a
                    href={`/empreendimento/${emp.construtora?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}/${emp.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#2a2d31', color: '#a7adb4', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, textDecoration: 'none' }}
                  >
                    👁️ Ver
                  </a>
                  <button
                    onClick={() => router.push(`/dashboard/empreendimentos/${emp.id}/editar`)}
                    style={{ background: '#2a2d31', color: '#c9a24b', border: '1px solid #c9a24b33', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}
                  >
                    ✏️ Editar
                  </button>
                  <select
                    value={emp.status_venda}
                    onChange={e => handleStatusVenda(emp.id, e.target.value)}
                    style={{ background: '#2a2d31', color: '#fff', border: '1px solid #3a3d41', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', fontSize: 13 }}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="pausado">Pausado</option>
                    <option value="encerrado">Encerrado</option>
                  </select>
                  <button
                    onClick={() => handleDelete(emp.id, emp.nome)}
                    disabled={deletingId === emp.id}
                    style={{ background: '#ef444422', color: '#ef4444', border: '1px solid #ef444433', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}
                  >
                    {deletingId === emp.id ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{
        '@keyframes spin { to { transform: rotate(360deg) } }'
      }</style>
    </div>
  )
}
