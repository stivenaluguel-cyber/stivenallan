'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Copy, ExternalLink, Plus, X } from 'lucide-react'
import {
  META_DIARIA_ABORDAGENS,
  ORIGENS_ATIVACAO,
  PLAYBOOKS,
  renderPlaybook,
  type OrigemAtivacao,
} from '@/lib/instagram/playbooks'
import {
  COLUNAS_ATIVACAO,
  contarAbordagensHoje,
  type Ativacao,
  type StatusAtivacao,
} from '@/lib/instagram/ativacoes'

// Fila de ativação manual do Instagram — funil "Instagram → DM → Kanban".
// O operador registra aqui quem viu nas listas do app (novos seguidores,
// curtidas, comentários, stories), copia o playbook renderizado e manda o DM
// à mão. A Meta não fornece essas listas via API — a fila é 100% manual.

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512',
  bronze: '#D24E22', muted: '#6B655B', line: 'rgba(26,24,21,0.08)',
}

export default function AtivacaoPage() {
  const [itens, setItens] = useState<Ativacao[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)
  const [aberto, setAberto] = useState<Ativacao | null>(null)
  const [modalNovo, setModalNovo] = useState(false)
  const [copiadoId, setCopiadoId] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true); setErro('')
    try {
      const res = await fetch('/api/admin/ativacoes')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao carregar')
      setItens(json.data ?? [])
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const abordagensHoje = useMemo(() => contarAbordagensHoje(itens), [itens])

  async function mover(id: string, status: StatusAtivacao) {
    // Otimista: o cartão anda na hora. Se a API falhar, recarrega e volta.
    const agora = new Date().toISOString()
    setItens((p) => p.map((i) => (i.id === id ? { ...i, status, abordado_em: status === 'abordado' ? agora : i.abordado_em } : i)))
    try {
      const res = await fetch('/api/admin/ativacoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error('falhou')
    } catch {
      carregar()
    }
  }

  // Copia o playbook renderizado. Se faltar variável (ex.: curtida sem
  // contexto do post), renderPlaybook devolve null e a gente avisa em vez de
  // copiar texto com {placeholder} cru.
  async function copiarPlaybook(a: Ativacao) {
    const texto = renderPlaybook(a.origem, { nome: a.nome || a.username, assunto: a.contexto })
    if (!texto) {
      setErro(`Falta contexto pra montar a abordagem de @${a.username} — abra o card e preencha "${PLAYBOOKS[a.origem].variaveis.join('" e "')}".`)
      return
    }
    try {
      await navigator.clipboard.writeText(texto)
      setErro('')
      setCopiadoId(a.id)
      setTimeout(() => setCopiadoId((c) => (c === a.id ? null : c)), 2000)
    } catch {
      setErro('Não consegui copiar — copie manualmente pelo card.')
    }
  }

  const KPIS = [
    { l: 'Na fila', v: String(itens.filter((i) => i.status === 'pendente').length) },
    { l: 'Abordagens hoje', v: `${abordagensHoje} / ${META_DIARIA_ABORDAGENS}` },
    { l: 'Responderam', v: String(itens.filter((i) => i.status === 'respondeu').length) },
    { l: 'Viraram lead', v: String(itens.filter((i) => i.status === 'virou_lead').length) },
  ]

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(20px,2.5vw,36px) clamp(16px,3vw,32px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, margin: 0 }}>
              Ativação Instagram
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: D.muted, maxWidth: 640, lineHeight: 1.5 }}>
              Quem interagiu no Instagram e ainda não recebeu DM. Copie a abordagem, mande à mão
              e arraste o card. Meta do dia: {META_DIARIA_ABORDAGENS} abordagens — devagar pra não bloquear a conta.
            </p>
          </div>
          <button onClick={() => setModalNovo(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Plus size={16} /> Adicionar à fila
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
          {KPIS.map((k) => (
            <div key={k.l} style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: D.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{k.l}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 24, fontWeight: 800 }}>{loading ? '—' : k.v}</div>
            </div>
          ))}
        </div>

        {erro && <p style={{ color: '#b91c1c', fontSize: 14, marginBottom: 16 }}>{erro}</p>}

        {loading ? (
          <p style={{ color: D.muted }}>Carregando…</p>
        ) : itens.length === 0 ? (
          <div style={{ background: D.surface, border: '1px dashed ' + D.line, borderRadius: 12, padding: '40px 24px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 15, color: D.muted, lineHeight: 1.6 }}>
              Fila vazia. Abra o Instagram, olhe novos seguidores, curtidas e comentários
              recentes e adicione aqui quem vale abordar.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
            {COLUNAS_ATIVACAO.map((col) => {
              const doStatus = itens.filter((i) => i.status === col.key)
              return (
                <div key={col.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (dragId) { mover(dragId, col.key); setDragId(null) } }}
                  style={{ flex: '0 0 260px', width: 260, background: D.surface, borderRadius: 14, padding: 12, border: '1px solid ' + D.line }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: col.cor }} />
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{col.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: D.muted, background: D.bg, borderRadius: 999, padding: '1px 8px' }}>{doStatus.length}</span>
                  </div>
                  {doStatus.length === 0 ? (
                    <p style={{ fontSize: 12, color: D.muted, textAlign: 'center', padding: '16px 0' }}>—</p>
                  ) : doStatus.map((a) => (
                    <div key={a.id} draggable
                      onDragStart={() => setDragId(a.id)}
                      onClick={() => setAberto(a)}
                      style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 10, padding: 11, marginBottom: 9, cursor: 'grab' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis' }}>@{a.username}</span>
                        <a href={'https://instagram.com/' + a.username} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()} title="Abrir perfil no Instagram"
                          style={{ color: D.muted, flexShrink: 0, display: 'flex' }}>
                          <ExternalLink size={14} />
                        </a>
                      </div>
                      <div style={{ fontSize: 11.5, color: D.muted, marginTop: 4 }}>
                        {PLAYBOOKS[a.origem].label}
                        {a.contexto ? ' · ' + a.contexto : ''}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); copiarPlaybook(a) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, width: '100%', justifyContent: 'center', background: copiadoId === a.id ? '#DCFCE7' : D.bg, color: copiadoId === a.id ? '#166534' : D.ink, border: '1px solid ' + D.line, borderRadius: 8, padding: '6px 8px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        {copiadoId === a.id ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar abordagem</>}
                      </button>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {aberto && (
        <ModalDetalhe
          ativacao={aberto}
          onClose={() => setAberto(null)}
          onChanged={() => { setAberto(null); carregar() }}
        />
      )}

      {modalNovo && <ModalNovo onClose={() => setModalNovo(false)} onSaved={() => { setModalNovo(false); carregar() }} />}
    </div>
  )
}

function ModalDetalhe({ ativacao, onClose, onChanged }: { ativacao: Ativacao; onClose: () => void; onChanged: () => void }) {
  const [nome, setNome] = useState(ativacao.nome ?? '')
  const [contexto, setContexto] = useState(ativacao.contexto ?? '')
  const [anotacoes, setAnotacoes] = useState(ativacao.anotacoes ?? '')
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  const previa = renderPlaybook(ativacao.origem, { nome: nome || ativacao.username, assunto: contexto })

  async function salvar() {
    setSaving(true); setErro('')
    try {
      const res = await fetch('/api/admin/ativacoes', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ativacao.id, nome: nome.trim() || null, contexto: contexto.trim() || null, anotacoes: anotacoes.trim() || null }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Falha ao salvar')
      onChanged()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro')
    } finally { setSaving(false) }
  }

  const inp = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid ' + D.line, fontSize: 14, marginBottom: 12, background: '#fff', color: D.ink } as const

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>
        <div style={{ background: D.bronze, padding: '20px 56px 20px 24px', borderRadius: '16px 16px 0 0' }}>
          <h2 style={{ color: '#fff', fontSize: 19, fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{ativacao.username}</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: '4px 0 0' }}>{PLAYBOOKS[ativacao.origem].label}</p>
        </div>
        <button onClick={onClose} aria-label="Fechar"
          style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', color: '#fff' }}>
          <X size={16} />
        </button>
        <div style={{ padding: 24 }}>
          <input style={inp} placeholder="Nome (pra abordagem sair pessoal)" value={nome} onChange={(e) => setNome(e.target.value)} />
          <input style={inp} placeholder="Contexto (qual post curtiu, qual story…)" value={contexto} onChange={(e) => setContexto(e.target.value)} />
          <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} placeholder="Anotações" value={anotacoes} onChange={(e) => setAnotacoes(e.target.value)} />

          <div style={{ background: D.bg, border: '1px solid ' + D.line, borderRadius: 10, padding: 12, fontSize: 13.5, lineHeight: 1.6, color: previa ? D.ink : '#b91c1c' }}>
            {previa ?? 'Preencha o contexto acima pra montar a abordagem — sem ele o texto sairia com lacuna.'}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <a href={'https://instagram.com/' + ativacao.username} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 11, borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', fontWeight: 600, fontSize: 14, color: D.ink, textDecoration: 'none' }}>
              <ExternalLink size={14} /> Abrir perfil
            </a>
            <button onClick={salvar} disabled={saving}
              style={{ flex: 1, padding: 11, borderRadius: 8, border: 'none', background: D.bronze, color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
          {erro && <p style={{ color: '#b91c1c', fontSize: 13, margin: '12px 0 0' }}>{erro}</p>}
        </div>
      </div>
    </div>
  )
}

function ModalNovo({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  // Um username por linha — é como o operador copia do app do Instagram.
  const [lista, setLista] = useState('')
  const [origem, setOrigem] = useState<OrigemAtivacao>('novo_seguidor')
  const [contexto, setContexto] = useState('')
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const inp = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid ' + D.line, fontSize: 14, marginBottom: 12, background: '#fff', color: D.ink } as const

  async function salvar() {
    const usernames = lista.split('\n').map((l) => l.trim()).filter(Boolean)
    if (usernames.length === 0) { setErro('Cole ao menos um @ (um por linha).'); return }
    setSaving(true); setErro('')
    try {
      const res = await fetch('/api/admin/ativacoes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens: usernames.map((username) => ({ username, origem, contexto: contexto.trim() || null })) }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Falha ao salvar')
      onSaved()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro')
    } finally { setSaving(false) }
  }

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>Adicionar à fila</h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: D.muted, lineHeight: 1.5 }}>
          Cole os @ (um por linha). Quem já está na fila com a mesma origem é ignorado — não perde o status.
        </p>
        <textarea style={{ ...inp, minHeight: 110, resize: 'vertical' }} placeholder={'@maria_sc\n@joao.criciuma'} value={lista} onChange={(e) => setLista(e.target.value)} />
        <select style={inp} value={origem} onChange={(e) => setOrigem(e.target.value as OrigemAtivacao)}>
          {ORIGENS_ATIVACAO.map((o) => <option key={o} value={o}>{PLAYBOOKS[o].label}</option>)}
        </select>
        <input style={inp} placeholder="Contexto comum (ex.: post do Guaíba Park)" value={contexto} onChange={(e) => setContexto(e.target.value)} />
        {erro && <p style={{ color: '#b91c1c', fontSize: 13, margin: '0 0 12px' }}>{erro}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 11, borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={salvar} disabled={saving} style={{ flex: 1, padding: 11, borderRadius: 8, border: 'none', background: D.bronze, color: '#fff', fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Salvando…' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}
