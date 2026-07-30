'use client'
import { useEffect, useState } from 'react'
import { competenciaDoMes, competenciaLabel, tabelaVencida } from '@/lib/unidades/tabela-precos'
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

type TabelaPreco = {
  id: string; competencia: string; nome_arquivo: string
  tamanho_bytes: number | null; cub_valor_m2: number | null
  observacao: string | null; url: string | null
}

/**
 * PDF da tabela de preços do empreendimento.
 *
 * Existe porque a Fontana tira os arquivos do Drive no meio do mês: sem uma
 * cópia aqui, a condição que foi passada ao cliente na semana anterior fica
 * sem documento que a comprove.
 */
function PainelTabela({ slug, nome, onFechar }: { slug: string; nome: string; onFechar: () => void }) {
  const [tabelas, setTabelas] = useState<TabelaPreco[]>([])
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [competencia, setCompetencia] = useState(() => competenciaDoMes(new Date()).slice(0, 7))
  const [cub, setCub] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)

  const carregar = async () => {
    setCarregando(true)
    try {
      const r = await fetch('/api/admin/empreendimentos/tabela?slug=' + encodeURIComponent(slug))
      const j = await r.json()
      setTabelas(j.data ?? [])
    } catch { setErro('Falha ao carregar') } finally { setCarregando(false) }
  }
  useEffect(() => { carregar() }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!arquivo) { setErro('Escolha o PDF da tabela'); return }
    setEnviando(true); setErro('')
    try {
      const fd = new FormData()
      fd.append('slug', slug); fd.append('competencia', competencia)
      fd.append('file', arquivo); if (cub) fd.append('cub', cub)
      const r = await fetch('/api/admin/empreendimentos/tabela', { method: 'POST', body: fd })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Falha ao enviar')
      setArquivo(null); setCub('')
      await carregar()
    } catch (e: unknown) { setErro(e instanceof Error ? e.message : 'Falha ao enviar') }
    finally { setEnviando(false) }
  }

  async function excluir(id: string) {
    await fetch('/api/admin/empreendimentos/tabela?id=' + id, { method: 'DELETE' })
    carregar()
  }

  const rotulo = (t: TabelaPreco) => competenciaLabel(t.competencia)
  const agora = new Date()

  return (
    <div style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 3, padding: '16px 20px', marginTop: -4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 10, flexWrap: 'wrap' }}>
        <strong style={{ fontSize: 14, color: D.ink }}>Tabela de preços · {nome}</strong>
        <button onClick={onFechar} style={{ background: 'none', border: 'none', color: D.muted, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>fechar</button>
      </div>

      {carregando ? (
        <p style={{ margin: 0, fontSize: 13, color: D.muted }}>Carregando…</p>
      ) : tabelas.length === 0 ? (
        <p style={{ margin: '0 0 14px', fontSize: 13, color: D.muted }}>Nenhuma tabela guardada ainda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {tabelas.map(t => {
            const vencida = tabelaVencida(t.competencia, agora)
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', border: '1px solid ' + D.line, borderRadius: 3, padding: '9px 12px' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: vencida ? D.muted : D.ink }}>{rotulo(t)}</span>
                {vencida
                  ? <span style={{ fontSize: 11, background: 'rgba(26,24,21,0.06)', color: D.muted, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>vencida</span>
                  : <span style={{ fontSize: 11, background: D.green + '22', color: '#15803d', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>vigente</span>}
                {t.cub_valor_m2 ? <span style={{ fontSize: 12, color: D.muted }}>CUB R$ {Number(t.cub_valor_m2).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> : null}
                <span style={{ fontSize: 12, color: D.muted, flex: 1, minWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.nome_arquivo}</span>
                {t.url && (
                  <a href={t.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 13, color: D.bronze, fontWeight: 700, textDecoration: 'none' }}>abrir PDF</a>
                )}
                <button onClick={() => excluir(t.id)} style={{ background: 'none', border: 'none', color: D.red, fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>excluir</button>
              </div>
            )
          })}
        </div>
      )}

      <form onSubmit={enviar} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={{ display: 'grid', gap: 4, fontSize: 12, color: D.muted }}>
          Mês da tabela
          <input type="month" value={competencia} onChange={e => setCompetencia(e.target.value)} required
            style={{ padding: '8px 10px', border: '1px solid ' + D.line, borderRadius: 3, fontSize: 13, font: 'inherit', minHeight: 38 }} />
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 12, color: D.muted }}>
          CUB impresso <span style={{ fontWeight: 400 }}>(opcional)</span>
          <input value={cub} onChange={e => setCub(e.target.value)} placeholder="3121,62" inputMode="decimal"
            style={{ padding: '8px 10px', border: '1px solid ' + D.line, borderRadius: 3, fontSize: 13, width: 110, minHeight: 38 }} />
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 12, color: D.muted, flex: '1 1 200px' }}>
          PDF da tabela
          <input type="file" accept="application/pdf" onChange={e => setArquivo(e.target.files?.[0] ?? null)}
            style={{ fontSize: 12, minHeight: 38 }} />
        </label>
        <button type="submit" disabled={enviando}
          style={{ padding: '9px 18px', border: 'none', borderRadius: 3, background: enviando ? D.muted : D.bronze, color: '#fff', fontWeight: 700, fontSize: 13, cursor: enviando ? 'default' : 'pointer', minHeight: 38 }}>
          {enviando ? 'Enviando…' : 'Guardar tabela'}
        </button>
      </form>
      {erro && <p style={{ margin: '10px 0 0', fontSize: 13, color: D.red }}>{erro}</p>}
    </div>
  )
}

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
  const [painelSlug, setPainelSlug] = useState<string | null>(null)
  const [tabelaPorSlug, setTabelaPorSlug] = useState<Record<string, string>>({})

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

  // Qual a competência da tabela mais recente de cada prédio, para o botão
  // dizer "julho de 2026" em vez de só "PDF".
  useEffect(() => { recarregarTabelas() }, [])

  function recarregarTabelas() {
    fetch('/api/admin/empreendimentos/tabela')
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.recentePorSlug) setTabelaPorSlug(j.recentePorSlug) })
      .catch(() => {})
  }

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

  // Quem está vendendo e não tem a tabela deste mês guardada.
  //
  // O PDF só protege o que foi enviado — o sistema guarda cópia, não busca no
  // Drive. Sem este aviso, a proteção depende de alguém lembrar todo mês, que
  // é exatamente como se perdeu a tabela de Águas de Marano em julho/2026.
  const mesAtual = competenciaDoMes(new Date())
  const semTabelaDoMes = empreendimentos.filter(
    e => e.status_venda === 'ativo' && (tabelaPorSlug[e.slug] ?? '') < mesAtual,
  )

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
        {!loading && semTabelaDoMes.length > 0 && (
          <div style={{ background: '#FEF3C7', border: '1px solid #F5C542', borderRadius: 3, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#8A5A00' }}>
                {semTabelaDoMes.length} empreendimento{semTabelaDoMes.length !== 1 ? 's' : ''} sem a tabela de {competenciaLabel(mesAtual)} guardada
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8A5A00', lineHeight: 1.5 }}>
                A construtora pode tirar o PDF do Drive a qualquer momento — foi o que aconteceu com Águas de Marano.
                Guarde pelo botão <strong>PDF</strong> de cada um: {semTabelaDoMes.slice(0, 6).map(e => e.nome).join(', ')}
                {semTabelaDoMes.length > 6 ? ` e mais ${semTabelaDoMes.length - 6}` : ''}.
              </p>
            </div>
          </div>
        )}

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
              <div key={emp.id}>
              <div style={{ background: D.surface, borderRadius: 3, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid ' + D.line, gap: 12, flexWrap: 'wrap' }}>
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
                  <button onClick={() => setPainelSlug(painelSlug === emp.slug ? null : emp.slug)}
                    title={tabelaPorSlug[emp.slug] ? `Tabela de ${competenciaLabel(tabelaPorSlug[emp.slug])}` : 'Nenhum PDF guardado'}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: D.bg, color: tabelaPorSlug[emp.slug] ? D.ink : D.muted, border: '1px solid ' + (painelSlug === emp.slug ? D.bronze : D.line), borderRadius: 3, padding: '8px 12px', fontSize: 13, cursor: 'pointer', minHeight: 36 }}>
                    PDF
                    {tabelaPorSlug[emp.slug] && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: tabelaVencida(tabelaPorSlug[emp.slug], new Date()) ? D.amber : D.green }}>
                        {tabelaVencida(tabelaPorSlug[emp.slug], new Date()) ? 'vencida' : 'ok'}
                      </span>
                    )}
                  </button>
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
              {painelSlug === emp.slug && (
                <PainelTabela slug={emp.slug} nome={emp.nome}
                  onFechar={() => { setPainelSlug(null); recarregarTabelas() }} />
              )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
