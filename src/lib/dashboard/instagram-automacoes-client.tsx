'use client'

import { useState } from 'react'

const T = { bronze: '#D24E22', cream: '#F3F2EE', ink: '#1a1a1a', mutedInk: '#71717a', border: '#e4e4e7' }

export type DmButton = { title: string; url?: string; payload?: string }

export type Automacao = {
  id: string
  nome: string
  ativo: boolean
  media_id: string | null
  keywords: string[]
  match_type: 'any' | 'contains' | 'exact'
  only_once_per_user: boolean
  public_reply: string | null
  dm_message: string | null
  dm_buttons: DmButton[]
  require_follow: boolean
  follow_prompt: string | null
}

type Metrica = {
  execucoes: number
  dms_enviados: number
  aguardando_seguir: number
  erros: number
  cliques: number
  ctr: number | null
}

const FORM_VAZIO: Omit<Automacao, 'id'> = {
  nome: '',
  ativo: true,
  media_id: '',
  keywords: [],
  match_type: 'contains',
  only_once_per_user: true,
  public_reply: '',
  dm_message: '',
  dm_buttons: [],
  require_follow: false,
  follow_prompt: '',
}

const inputStyle: React.CSSProperties = { display: 'block', marginTop: 4, padding: '8px 10px', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, width: '100%' }
const labelStyle: React.CSSProperties = { fontSize: 11.5, color: T.mutedInk, fontWeight: 600 }

export function InstagramAutomacoesClient({ automacoesIniciais }: { automacoesIniciais: Automacao[] }) {
  const [automacoes, setAutomacoes] = useState<Automacao[]>(automacoesIniciais)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Automacao, 'id'>>(FORM_VAZIO)
  const [keywordsTexto, setKeywordsTexto] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [metricas, setMetricas] = useState<Record<string, Metrica>>({})
  const [criando, setCriando] = useState(false)

  function abrirNova() {
    setEditandoId(null)
    setForm(FORM_VAZIO)
    setKeywordsTexto('')
    setCriando(true)
    setMsg(null)
  }

  function abrirEdicao(a: Automacao) {
    setEditandoId(a.id)
    setForm({ ...a, media_id: a.media_id ?? '', public_reply: a.public_reply ?? '', dm_message: a.dm_message ?? '', follow_prompt: a.follow_prompt ?? '' })
    setKeywordsTexto((a.keywords ?? []).join(', '))
    setCriando(true)
    setMsg(null)
  }

  function fechar() {
    setCriando(false)
    setEditandoId(null)
  }

  function setBotao(i: number, patch: Partial<DmButton>) {
    setForm((prev) => {
      const botoes = [...prev.dm_buttons]
      botoes[i] = { ...botoes[i], ...patch }
      return { ...prev, dm_buttons: botoes }
    })
  }

  function addBotao() {
    if (form.dm_buttons.length >= 3) return
    setForm((prev) => ({ ...prev, dm_buttons: [...prev.dm_buttons, { title: '', url: '' }] }))
  }

  function removerBotao(i: number) {
    setForm((prev) => ({ ...prev, dm_buttons: prev.dm_buttons.filter((_, idx) => idx !== i) }))
  }

  async function salvar() {
    if (!form.nome.trim()) {
      setMsg('Erro: nome é obrigatório')
      return
    }
    setSalvando(true)
    setMsg(null)

    const keywords = keywordsTexto.split(',').map((k) => k.trim()).filter(Boolean)
    const payload = { ...form, keywords, media_id: form.media_id?.trim() || null }

    const res = await fetch('/api/instagram/automacoes', {
      method: editandoId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editandoId ? { id: editandoId, ...payload } : payload),
    })
    setSalvando(false)

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setMsg(`Erro: ${err.error ?? 'falha ao salvar'}`)
      return
    }
    const { data } = await res.json()
    setAutomacoes((prev) => (editandoId ? prev.map((a) => (a.id === editandoId ? data : a)) : [data, ...prev]))
    fechar()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta automação?')) return
    const res = await fetch(`/api/instagram/automacoes?id=${id}`, { method: 'DELETE' })
    if (res.ok) setAutomacoes((prev) => prev.filter((a) => a.id !== id))
  }

  async function alternarAtivo(a: Automacao) {
    const res = await fetch('/api/instagram/automacoes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: a.id, ativo: !a.ativo }),
    })
    if (res.ok) {
      const { data } = await res.json()
      setAutomacoes((prev) => prev.map((x) => (x.id === a.id ? data : x)))
    }
  }

  async function carregarMetrica(id: string) {
    if (metricas[id]) return
    const res = await fetch(`/api/instagram/automacoes/${id}/metrica`)
    if (res.ok) {
      const { data } = await res.json()
      setMetricas((prev) => ({ ...prev, [id]: data }))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!criando && (
        <button
          onClick={abrirNova}
          style={{ alignSelf: 'flex-start', padding: '9px 16px', borderRadius: 8, border: 'none', background: T.bronze, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          + Nova automação
        </button>
      )}

      {criando && (
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 18, background: '#fff', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nome</label>
            <input style={inputStyle} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Lançamento Fontana — palavra TABELA" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Palavras-chave (separadas por vírgula)</label>
              <input style={inputStyle} value={keywordsTexto} onChange={(e) => setKeywordsTexto(e.target.value)} placeholder="tabela, preço, valor" />
            </div>
            <div>
              <label style={labelStyle}>Tipo de match</label>
              <select style={inputStyle} value={form.match_type} onChange={(e) => setForm({ ...form, match_type: e.target.value as Automacao['match_type'] })}>
                <option value="contains">Contém a palavra</option>
                <option value="exact">Comentário igual à palavra</option>
                <option value="any">Qualquer comentário</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>ID do post (opcional — vazio dispara em qualquer post)</label>
            <input style={inputStyle} value={form.media_id ?? ''} onChange={(e) => setForm({ ...form, media_id: e.target.value })} placeholder="17..." />
          </div>

          <div>
            <label style={labelStyle}>Resposta pública no comentário (opcional)</label>
            <input style={inputStyle} value={form.public_reply ?? ''} onChange={(e) => setForm({ ...form, public_reply: e.target.value })} placeholder="Te chamei no DM! 📩" />
          </div>

          <div>
            <label style={labelStyle}>Mensagem da DM</label>
            <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' as const }} value={form.dm_message ?? ''} onChange={(e) => setForm({ ...form, dm_message: e.target.value })} />
          </div>

          <div>
            <label style={labelStyle}>Botões da DM (até 3, com link)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              {form.dm_buttons.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...inputStyle, marginTop: 0 }} placeholder="Texto do botão" value={b.title} onChange={(e) => setBotao(i, { title: e.target.value })} />
                  <input style={{ ...inputStyle, marginTop: 0 }} placeholder="https://..." value={b.url ?? ''} onChange={(e) => setBotao(i, { url: e.target.value })} />
                  <button onClick={() => removerBotao(i)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: 13 }}>
                    remover
                  </button>
                </div>
              ))}
              {form.dm_buttons.length < 3 && (
                <button onClick={addBotao} style={{ alignSelf: 'flex-start', border: 'none', background: 'transparent', color: T.bronze, cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>
                  + adicionar botão
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.ink }}>
              <input type="checkbox" checked={form.only_once_per_user} onChange={(e) => setForm({ ...form, only_once_per_user: e.target.checked })} />
              Só 1 DM por pessoa
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.ink }}>
              <input type="checkbox" checked={form.require_follow} onChange={(e) => setForm({ ...form, require_follow: e.target.checked })} />
              Exigir seguir antes de liberar a DM
            </label>
          </div>

          {form.require_follow && (
            <div>
              <label style={labelStyle}>Texto do gate de "me segue primeiro"</label>
              <input style={inputStyle} value={form.follow_prompt ?? ''} onChange={(e) => setForm({ ...form, follow_prompt: e.target.value })} placeholder="Me segue primeiro pra liberar o link 🔒" />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={salvar}
              disabled={salvando}
              style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: T.bronze, color: '#fff', fontSize: 13, fontWeight: 700, cursor: salvando ? 'default' : 'pointer', opacity: salvando ? 0.7 : 1 }}
            >
              {salvando ? 'Salvando…' : editandoId ? 'Atualizar automação' : 'Criar automação'}
            </button>
            <button onClick={fechar} style={{ padding: '9px 18px', borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', color: T.mutedInk, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Cancelar
            </button>
            {msg && <span style={{ fontSize: 12.5, color: T.mutedInk }}>{msg}</span>}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {automacoes.length === 0 && (
          <div style={{ padding: 16, border: `1px solid ${T.border}`, borderRadius: 10, color: T.mutedInk, fontSize: 13 }}>Nenhuma automação criada ainda.</div>
        )}
        {automacoes.map((a) => {
          const m = metricas[a.id]
          return (
            <div key={a.id} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, background: '#fff' }} onMouseEnter={() => carregarMetrica(a.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {a.nome}
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: a.ativo ? '#dcfce7' : T.cream, color: a.ativo ? '#166534' : T.mutedInk }}>
                      {a.ativo ? 'ativa' : 'pausada'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: T.mutedInk, marginTop: 4 }}>
                    {a.keywords.length > 0 ? `palavras: ${a.keywords.join(', ')}` : 'qualquer comentário'}
                    {a.media_id ? ` · post ${a.media_id}` : ' · todos os posts'}
                    {a.require_follow ? ' · exige seguir' : ''}
                  </div>
                  {m && (
                    <div style={{ fontSize: 12, color: T.mutedInk, marginTop: 6 }}>
                      {m.execucoes} execuções · {m.dms_enviados} DMs enviadas · {m.cliques} cliques
                      {m.ctr != null ? ` · CTR ${m.ctr}%` : ''}
                      {m.erros > 0 ? ` · ${m.erros} erros` : ''}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                  <button onClick={() => alternarAtivo(a)} style={{ border: 'none', background: 'transparent', color: T.bronze, cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>
                    {a.ativo ? 'pausar' : 'ativar'}
                  </button>
                  <button onClick={() => abrirEdicao(a)} style={{ border: 'none', background: 'transparent', color: T.ink, cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>
                    editar
                  </button>
                  <button onClick={() => excluir(a.id)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>
                    excluir
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
