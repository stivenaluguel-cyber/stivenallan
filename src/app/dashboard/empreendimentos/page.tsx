'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512',
  bronze: '#D24E22', orange: '#FF6A3D', muted: '#6B655B',
  line: 'rgba(26,24,21,0.08)', green: '#22c55e', red: '#ef4444', amber: '#f59e0b',
}

type Empreendimento = {
  id: string; nome: string; construtora: string; cidade: string; uf: string
  bairro?: string | null
  slug: string; status_obra: string; status_venda: string
  preco_a_partir: number | null; created_at: string
}

const TODOS = ''

/** Ordena com acento tratado como letra normal: "Águas" antes de "Avezzano". */
const porNome = (a: Empreendimento, b: Empreendimento) =>
  (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' })

/** Valores distintos de um campo, já ordenados, para alimentar um <select>. */
function opcoes(lista: Empreendimento[], campo: (e: Empreendimento) => string | null | undefined) {
  const vistos = new Set<string>()
  for (const e of lista) {
    const v = (campo(e) || '').trim()
    if (v) vistos.add(v)
  }
  return [...vistos].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }))
}

const STATUS_OBRA_LABEL: Record<string, string> = { lancamento: 'Lancamento', em_obras: 'Em Obras', pronto: 'Pronto' }
const STATUS_VENDA_LABEL: Record<string, string> = { ativo: 'Ativo', pausado: 'Pausado', encerrado: 'Encerrado' }
const STATUS_VENDA_COLOR: Record<string, string> = { ativo: D.green, pausado: D.amber, encerrado: D.red }

export default function EmpreendimentosPage() {
  const router = useRouter()
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [comEspelho, setComEspelho] = useState<Record<string, number>>({})
  const [fCidade, setFCidade] = useState(TODOS)
  const [fBairro, setFBairro] = useState(TODOS)
  const [fConstrutora, setFConstrutora] = useState(TODOS)
  const [busca, setBusca] = useState('')

  useEffect(() => { fetchEmpreendimentos() }, [])

  // Quantas unidades cada prédio tem no espelho — casado por slug, porque a
  // listagem vem de `properties` e as unidades vivem em `empreendimentos`.
  useEffect(() => {
    fetch('/api/admin/espelho')
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (!j?.empreendimentos) return
        const porSlug: Record<string, number> = {}
        for (const e of j.empreendimentos) porSlug[e.slug] = e.unidades ?? 0
        setComEspelho(porSlug)
      })
      .catch(() => {})
  }, [])

  async function fetchEmpreendimentos() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/empreendimentos')
      if (res.status === 401) { router.push('/dashboard/login'); return }
      const json = await res.json()
      setEmpreendimentos([...(json.data || [])].sort(porNome))
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm('Tem certeza que deseja excluir "' + nome + '"? Esta acao nao pode ser desfeita.')) return
    setDeletingId(id)
    try {
      const res = await fetch('/api/admin/empreendimentos/' + id, { method: 'DELETE' })
      if (res.ok) { setEmpreendimentos(prev => prev.filter(e => e.id !== id)) }
      else { alert('Erro ao excluir empreendimento') }
    } catch { alert('Erro ao excluir empreendimento') } finally { setDeletingId(null) }
  }

  async function handleStatusVenda(id: string, novoStatus: string) {
    try {
      await fetch('/api/admin/empreendimentos/' + id, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_venda: novoStatus }),
      })
      setEmpreendimentos(prev => prev.map(e => e.id === id ? { ...e, status_venda: novoStatus } : e))
    } catch { alert('Erro ao atualizar status') }
  }

  // Bairro depende da cidade escolhida: oferecer bairro de outra cidade
  // devolveria lista vazia sem explicar o motivo.
  const baseBairro = fCidade ? empreendimentos.filter(e => e.cidade === fCidade) : empreendimentos
  const cidades = opcoes(empreendimentos, e => e.cidade)
  const bairros = opcoes(baseBairro, e => e.bairro)
  const construtoras = opcoes(empreendimentos, e => e.construtora)

  const termo = busca.trim().toLowerCase()
  const lista = empreendimentos.filter(e =>
    (!fCidade || e.cidade === fCidade) &&
    (!fBairro || (e.bairro || '') === fBairro) &&
    (!fConstrutora || e.construtora === fConstrutora) &&
    (!termo || (e.nome || '').toLowerCase().includes(termo))
  )
  const filtrando = Boolean(fCidade || fBairro || fConstrutora || termo)

  const selectStyle = { background: '#fff', color: D.ink, border: '1px solid ' + D.line, borderRadius: 3, padding: '9px 10px', fontSize: 13, font: 'inherit', minHeight: 40, cursor: 'pointer' } as const

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(16px,3vw,32px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, color: D.ink }}>Empreendimentos</h1>
            <p style={{ margin: '4px 0 0', color: D.muted, fontSize: 14 }}>
              {filtrando ? `${lista.length} de ${empreendimentos.length}` : `${empreendimentos.length} cadastrado${empreendimentos.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={() => router.push('/dashboard/empreendimentos/novo')}
            style={{ padding: '11px 22px', border: 'none', borderRadius: 3, background: D.bronze, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', minHeight: 44 }}>
            + Novo Empreendimento
          </button>
        </div>
        {!loading && empreendimentos.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar pelo nome..."
              style={{ ...selectStyle, cursor: 'text', minWidth: 200, flex: '1 1 200px' }} />
            <select value={fCidade} onChange={e => { setFCidade(e.target.value); setFBairro(TODOS) }} style={selectStyle}>
              <option value={TODOS}>Todas as cidades</option>
              {cidades.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={fBairro} onChange={e => setFBairro(e.target.value)} style={selectStyle} disabled={bairros.length === 0}>
              <option value={TODOS}>{bairros.length === 0 ? 'Sem bairro cadastrado' : 'Todos os bairros'}</option>
              {bairros.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={fConstrutora} onChange={e => setFConstrutora(e.target.value)} style={selectStyle}>
              <option value={TODOS}>Todas as construtoras</option>
              {construtoras.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {filtrando && (
              <button onClick={() => { setFCidade(TODOS); setFBairro(TODOS); setFConstrutora(TODOS); setBusca('') }}
                style={{ background: 'none', border: 'none', color: D.bronze, fontSize: 13, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', minHeight: 40 }}>
                limpar filtros
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} style={{ background: D.surface, borderRadius: 3, height: 80, border: '1px solid ' + D.line, opacity: 0.5 }} />)}
          </div>
        ) : empreendimentos.length === 0 ? (
          <div style={{ background: D.surface, borderRadius: 3, padding: 48, textAlign: 'center', border: '1px solid ' + D.line }}>
            <h3 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontWeight: 700, marginBottom: 8, color: D.ink }}>Nenhum empreendimento cadastrado</h3>
            <p style={{ color: D.muted, marginBottom: 24, fontSize: 14 }}>Cadastre seu primeiro empreendimento.</p>
            <button onClick={() => router.push('/dashboard/empreendimentos/novo')}
              style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 3, padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              + Cadastrar Empreendimento
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lista.map(emp => (
              <div key={emp.id} style={{ background: D.surface, borderRadius: 3, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid ' + D.line, gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: D.ink }}>{emp.nome}</h3>
                    <span style={{ fontSize: 11, background: 'rgba(26,24,21,0.06)', padding: '2px 10px', borderRadius: 20, color: D.muted, fontWeight: 600 }}>{STATUS_OBRA_LABEL[emp.status_obra] || emp.status_obra}</span>
                    <span style={{ fontSize: 11, background: (STATUS_VENDA_COLOR[emp.status_venda] ?? D.muted) + '22', color: STATUS_VENDA_COLOR[emp.status_venda] ?? D.muted, padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>{STATUS_VENDA_LABEL[emp.status_venda] || emp.status_venda}</span>
                  </div>
                  <p style={{ color: D.muted, margin: 0, fontSize: 13 }}>
                    {[emp.construtora, [emp.bairro, `${emp.cidade}/${emp.uf}`].filter(Boolean).join(' · ')].filter(Boolean).join(' · ')}
                    {emp.preco_a_partir ? ' · A partir de R$ ' + emp.preco_a_partir.toLocaleString('pt-BR') : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                  <a href={'/dashboard/espelho?emp=' + emp.slug}
                    title={comEspelho[emp.slug] ? `${comEspelho[emp.slug]} unidades na tabela` : 'Nenhuma tabela importada ainda'}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: comEspelho[emp.slug] ? D.bronze : D.bg, color: comEspelho[emp.slug] ? '#fff' : D.muted, border: '1px solid ' + (comEspelho[emp.slug] ? D.bronze : D.line), borderRadius: 3, padding: '8px 14px', fontSize: 13, fontWeight: comEspelho[emp.slug] ? 700 : 400, textDecoration: 'none', minHeight: 36 }}>
                    Tabela de vendas
                    {comEspelho[emp.slug] ? (
                      <span style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{comEspelho[emp.slug]}</span>
                    ) : null}
                  </a>
                  <a href={'/empreendimento/' + emp.construtora?.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '/' + emp.slug}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', background: D.bg, color: D.muted, border: '1px solid ' + D.line, borderRadius: 3, padding: '8px 14px', fontSize: 13, textDecoration: 'none', minHeight: 36 }}>Ver</a>
                  <button onClick={() => router.push('/dashboard/empreendimentos/' + emp.id + '/editar')}
                    style={{ background: D.bg, color: D.bronze, border: '1px solid ' + D.bronze + '44', borderRadius: 3, padding: '8px 14px', cursor: 'pointer', fontSize: 13, minHeight: 36 }}>Editar</button>
                  <select value={emp.status_venda} onChange={e => handleStatusVenda(emp.id, e.target.value)}
                    style={{ background: '#fff', color: D.ink, border: '1px solid ' + D.line, borderRadius: 3, padding: '8px 10px', cursor: 'pointer', fontSize: 13, font: 'inherit', minHeight: 36 }}>
                    <option value="ativo">Ativo</option>
                    <option value="pausado">Pausado</option>
                    <option value="encerrado">Encerrado</option>
                  </select>
                  <button onClick={() => handleDelete(emp.id, emp.nome)} disabled={deletingId === emp.id}
                    style={{ background: '#fee2e2', color: D.red, border: '1px solid #fecaca', borderRadius: 3, padding: '8px 14px', cursor: 'pointer', fontSize: 13, minHeight: 36 }}>
                    {deletingId === emp.id ? '...' : 'Excluir'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
