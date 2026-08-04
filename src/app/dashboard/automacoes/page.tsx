'use client'
import { useState, useEffect, useCallback } from 'react'
import { ESTAGIOS_FUNIL } from '@/lib/dashboard/estagios'

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512', bronze: '#D24E22',
  muted: '#6B655B', line: 'rgba(26,24,21,0.08)', green: '#22c55e', red: '#ef4444',
}

const ESTAGIOS_COM_FOLLOWUP = [
  { key: 'primeiro_contato', label: 'Novo Contato' },
  { key: 'qualificado', label: 'Qualificado' },
  { key: 'interessado', label: 'Interessado' },
  { key: 'proposta_enviada', label: 'Proposta Enviada' },
  { key: 'visita_agendada', label: 'Visita Agendada' },
]

type MensagemRow = { estagio_funil: string; ordem: number; mensagem: string }
type IntervaloRow = { ordem: number; dias: number }
type PassoEmail = { ordem: number; dias_minimos: number; assunto: string; corpo_html: string }

type GatilhoTipo = 'estagio_parado_dias' | 'score_acima' | 'sem_resposta_dias'
type AcaoTipo = 'mover_estagio' | 'notificar_stiven' | 'enviar_whatsapp'
type RegraRow = {
  id: string
  nome: string
  ativo: boolean
  gatilho_tipo: GatilhoTipo
  gatilho_params: Record<string, unknown>
  filtro_estagio: string[] | null
  acao_tipo: AcaoTipo
  acao_params: Record<string, unknown>
}

const LABEL_GATILHO: Record<GatilhoTipo, string> = {
  estagio_parado_dias: 'Parado no estágio há X dias',
  score_acima: 'Score acima de X',
  sem_resposta_dias: 'Sem resposta há X dias',
}
const LABEL_ACAO: Record<AcaoTipo, string> = {
  mover_estagio: 'Mover para outro estágio',
  notificar_stiven: 'Notificar Stiven no WhatsApp',
  enviar_whatsapp: 'Enviar mensagem de WhatsApp',
}

export default function AutomacoesPage() {
  const [intervalos, setIntervalos] = useState<IntervaloRow[]>([])
  const [mensagens, setMensagens] = useState<MensagemRow[]>([])
  const [passosEmail, setPassosEmail] = useState<PassoEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [salvandoWpp, setSalvandoWpp] = useState(false)
  const [salvandoEmail, setSalvandoEmail] = useState(false)
  const [msgWpp, setMsgWpp] = useState('')
  const [msgEmail, setMsgEmail] = useState('')

  const [regras, setRegras] = useState<RegraRow[]>([])
  const [novaRegra, setNovaRegra] = useState({
    nome: '', gatilho_tipo: 'estagio_parado_dias' as GatilhoTipo, valorGatilho: 3,
    filtro_estagio: [] as string[], acao_tipo: 'notificar_stiven' as AcaoTipo,
    estagioDestino: '', mensagem: '',
  })
  const [salvandoRegra, setSalvandoRegra] = useState(false)
  const [msgRegra, setMsgRegra] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [wpp, email, regrasResp] = await Promise.all([
        fetch('/api/admin/automacoes/whatsapp').then(r => r.json()),
        fetch('/api/admin/automacoes/email').then(r => r.json()),
        fetch('/api/admin/automacoes/regras').then(r => r.json()),
      ])
      setIntervalos(wpp.intervalos ?? [])
      setMensagens(wpp.mensagens ?? [])
      setPassosEmail(email.passos ?? [])
      setRegras(regrasResp.regras ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function mensagensDoEstagio(estagio: string) {
    return mensagens.filter(m => m.estagio_funil === estagio).sort((a, b) => a.ordem - b.ordem)
  }

  function setMensagemTexto(estagio: string, ordem: number, texto: string) {
    setMensagens(prev => prev.map(m => (m.estagio_funil === estagio && m.ordem === ordem) ? { ...m, mensagem: texto } : m))
  }

  function addMensagem(estagio: string) {
    const proximaOrdem = mensagensDoEstagio(estagio).length
    setMensagens(prev => [...prev, { estagio_funil: estagio, ordem: proximaOrdem, mensagem: '' }])
  }

  function removerMensagem(estagio: string, ordem: number) {
    setMensagens(prev => prev
      .filter(m => !(m.estagio_funil === estagio && m.ordem === ordem))
      .map(m => m.estagio_funil === estagio && m.ordem > ordem ? { ...m, ordem: m.ordem - 1 } : m))
  }

  function setDiasIntervalo(ordem: number, dias: number) {
    setIntervalos(prev => prev.map(i => i.ordem === ordem ? { ...i, dias } : i))
  }

  function addIntervalo() {
    setIntervalos(prev => [...prev, { ordem: prev.length, dias: (prev[prev.length - 1]?.dias ?? 1) + 7 }])
  }

  function removerIntervalo(ordem: number) {
    setIntervalos(prev => prev
      .filter(i => i.ordem !== ordem)
      .map(i => i.ordem > ordem ? { ...i, ordem: i.ordem - 1 } : i))
  }

  async function salvarWpp() {
    setSalvandoWpp(true); setMsgWpp('')
    try {
      const res = await fetch('/api/admin/automacoes/whatsapp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalos, mensagens }),
      })
      const data = await res.json()
      setMsgWpp(res.ok ? 'Cadência de WhatsApp salva.' : (data.error || 'Erro ao salvar.'))
    } catch {
      setMsgWpp('Falha ao conectar.')
    } finally {
      setSalvandoWpp(false)
    }
  }

  function setPassoEmail(ordem: number, campo: keyof PassoEmail, valor: string | number) {
    setPassosEmail(prev => prev.map(p => p.ordem === ordem ? { ...p, [campo]: valor } : p))
  }

  function addPassoEmail() {
    setPassosEmail(prev => [...prev, { ordem: prev.length, dias_minimos: (prev[prev.length - 1]?.dias_minimos ?? 0) + 5, assunto: '', corpo_html: '' }])
  }

  function removerPassoEmail(ordem: number) {
    setPassosEmail(prev => prev
      .filter(p => p.ordem !== ordem)
      .map(p => p.ordem > ordem ? { ...p, ordem: p.ordem - 1 } : p))
  }

  async function salvarEmail() {
    setSalvandoEmail(true); setMsgEmail('')
    try {
      const res = await fetch('/api/admin/automacoes/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passos: passosEmail }),
      })
      const data = await res.json()
      setMsgEmail(res.ok ? 'Cadência de e-mail salva.' : (data.error || 'Erro ao salvar.'))
    } catch {
      setMsgEmail('Falha ao conectar.')
    } finally {
      setSalvandoEmail(false)
    }
  }

  function gatilhoParamsDe(tipo: GatilhoTipo, valor: number): Record<string, unknown> {
    return tipo === 'score_acima' ? { score: valor } : { dias: valor }
  }

  async function criarRegra() {
    if (!novaRegra.nome.trim()) { setMsgRegra('Dê um nome pra regra.'); return }
    if (novaRegra.acao_tipo === 'mover_estagio' && !novaRegra.estagioDestino) { setMsgRegra('Escolha o estágio de destino.'); return }
    if (novaRegra.acao_tipo === 'enviar_whatsapp' && !novaRegra.mensagem.trim()) { setMsgRegra('Escreva a mensagem a enviar.'); return }

    setSalvandoRegra(true); setMsgRegra('')
    try {
      const res = await fetch('/api/admin/automacoes/regras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novaRegra.nome.trim(),
          gatilho_tipo: novaRegra.gatilho_tipo,
          gatilho_params: gatilhoParamsDe(novaRegra.gatilho_tipo, novaRegra.valorGatilho),
          filtro_estagio: novaRegra.filtro_estagio,
          acao_tipo: novaRegra.acao_tipo,
          acao_params: novaRegra.acao_tipo === 'mover_estagio'
            ? { estagio_funil: novaRegra.estagioDestino }
            : novaRegra.acao_tipo === 'enviar_whatsapp'
              ? { mensagem: novaRegra.mensagem.trim() }
              : {},
        }),
      })
      const data = await res.json()
      if (!res.ok) { setMsgRegra(data.error || 'Erro ao criar regra.'); return }
      setMsgRegra('Regra criada — pausada por padrão, ative quando revisar.')
      setNovaRegra({ nome: '', gatilho_tipo: 'estagio_parado_dias', valorGatilho: 3, filtro_estagio: [], acao_tipo: 'notificar_stiven', estagioDestino: '', mensagem: '' })
      await load()
    } catch {
      setMsgRegra('Falha ao conectar.')
    } finally {
      setSalvandoRegra(false)
    }
  }

  async function alternarAtivoRegra(id: string, ativo: boolean) {
    setRegras(prev => prev.map(r => r.id === id ? { ...r, ativo } : r))
    await fetch('/api/admin/automacoes/regras', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo }),
    })
  }

  async function apagarRegra(id: string) {
    if (!confirm('Apagar essa regra?')) return
    setRegras(prev => prev.filter(r => r.id !== id))
    await fetch('/api/admin/automacoes/regras?id=' + id, { method: 'DELETE' })
  }

  function descreverGatilho(r: RegraRow): string {
    const valor = r.gatilho_tipo === 'score_acima' ? r.gatilho_params.score : r.gatilho_params.dias
    return LABEL_GATILHO[r.gatilho_tipo].replace('X', String(valor ?? '?'))
  }

  function descreverAcao(r: RegraRow): string {
    if (r.acao_tipo === 'mover_estagio') {
      const destino = ESTAGIOS_FUNIL.find(e => e.key === r.acao_params.estagio_funil)?.label ?? String(r.acao_params.estagio_funil ?? '?')
      return `Mover para "${destino}"`
    }
    if (r.acao_tipo === 'enviar_whatsapp') return `Enviar: "${String(r.acao_params.mensagem ?? '').slice(0, 60)}${String(r.acao_params.mensagem ?? '').length > 60 ? '…' : ''}"`
    return LABEL_ACAO[r.acao_tipo]
  }

  if (loading) {
    return <div style={{ padding: 32, color: D.muted, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>Carregando...</div>
  }

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(20px,2.5vw,36px) clamp(16px,3vw,32px)' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, margin: 0 }}>Automações de Follow-up</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: D.muted }}>
            Edite a cadência sem precisar de deploy. Se algo ficar vazio, o cron usa os valores padrão de fábrica em vez de parar de enviar.
          </p>
        </div>

        {/* Cadência WhatsApp */}
        <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20, marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Cadência WhatsApp</h2>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: D.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dias entre passos</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {intervalos.sort((a, b) => a.ordem - b.ordem).map(i => (
                <div key={i.ordem} style={{ display: 'flex', alignItems: 'center', gap: 6, background: D.bg, borderRadius: 8, padding: '6px 10px' }}>
                  <span style={{ fontSize: 12, color: D.muted }}>Passo {i.ordem}:</span>
                  <input type="number" min={1} value={i.dias} onChange={e => setDiasIntervalo(i.ordem, Number(e.target.value))}
                    style={{ width: 50, border: 'none', background: 'transparent', fontWeight: 700, fontSize: 13 }} />
                  <span style={{ fontSize: 12, color: D.muted }}>dias</span>
                  <button onClick={() => removerIntervalo(i.ordem)} style={{ border: 'none', background: 'none', color: D.red, cursor: 'pointer', fontSize: 14 }}>×</button>
                </div>
              ))}
              <button onClick={addIntervalo} style={{ border: '1px dashed ' + D.line, background: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: D.bronze, cursor: 'pointer' }}>+ passo</button>
            </div>
          </div>

          {ESTAGIOS_COM_FOLLOWUP.map(est => (
            <div key={est.key} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{est.label}</div>
              {mensagensDoEstagio(est.key).map(m => (
                <div key={m.ordem} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 11, color: D.muted, marginTop: 8, minWidth: 16 }}>{m.ordem}</span>
                  <textarea value={m.mensagem} onChange={e => setMensagemTexto(est.key, m.ordem, e.target.value)} rows={2}
                    style={{ flex: 1, border: '1px solid ' + D.line, borderRadius: 8, padding: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
                  <button onClick={() => removerMensagem(est.key, m.ordem)} style={{ border: 'none', background: 'none', color: D.red, cursor: 'pointer', fontSize: 16, marginTop: 6 }}>×</button>
                </div>
              ))}
              <button onClick={() => addMensagem(est.key)} style={{ border: '1px dashed ' + D.line, background: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: D.bronze, cursor: 'pointer' }}>+ mensagem</button>
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <button onClick={salvarWpp} disabled={salvandoWpp}
              style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: salvandoWpp ? 'default' : 'pointer', opacity: salvandoWpp ? 0.6 : 1 }}>
              {salvandoWpp ? 'Salvando...' : 'Salvar cadência WhatsApp'}
            </button>
            {msgWpp && <span style={{ fontSize: 13, color: msgWpp.includes('salva') ? D.green : D.red }}>{msgWpp}</span>}
          </div>
        </section>

        {/* Cadência E-mail */}
        <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Cadência E-mail</h2>

          {passosEmail.sort((a, b) => a.ordem - b.ordem).map(p => (
            <div key={p.ordem} style={{ border: '1px solid ' + D.line, borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Passo {p.ordem}</span>
                <button onClick={() => removerPassoEmail(p.ordem)} style={{ border: 'none', background: 'none', color: D.red, cursor: 'pointer', fontSize: 16 }}>×</button>
              </div>
              <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Dias mínimos desde o cadastro do lead</label>
              <input type="number" min={0} value={p.dias_minimos} onChange={e => setPassoEmail(p.ordem, 'dias_minimos', Number(e.target.value))}
                style={{ width: 80, border: '1px solid ' + D.line, borderRadius: 6, padding: 6, fontSize: 13, marginBottom: 10 }} />
              <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Assunto (use {'{nome}'} / {'{empreendimento}'} como placeholders)</label>
              <input value={p.assunto} onChange={e => setPassoEmail(p.ordem, 'assunto', e.target.value)}
                style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, marginBottom: 10, boxSizing: 'border-box' }} />
              <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Corpo HTML</label>
              <textarea value={p.corpo_html} onChange={e => setPassoEmail(p.ordem, 'corpo_html', e.target.value)} rows={6}
                style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 12, fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button onClick={addPassoEmail} style={{ border: '1px dashed ' + D.line, background: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: D.bronze, cursor: 'pointer', marginBottom: 12 }}>+ passo de e-mail</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={salvarEmail} disabled={salvandoEmail}
              style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: salvandoEmail ? 'default' : 'pointer', opacity: salvandoEmail ? 0.6 : 1 }}>
              {salvandoEmail ? 'Salvando...' : 'Salvar cadência de e-mail'}
            </button>
            {msgEmail && <span style={{ fontSize: 13, color: msgEmail.includes('salva') ? D.green : D.red }}>{msgEmail}</span>}
          </div>
        </section>

        {/* Regras SE/ENTÃO */}
        <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20, marginTop: 28 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>Regras SE/ENTÃO</h2>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: D.muted }}>
            Além da cadência fixa por tempo acima. Roda 1x/dia junto com o cron de follow-up. Toda regra nova nasce pausada.
          </p>

          {regras.length === 0 ? (
            <p style={{ fontSize: 13, color: D.muted, margin: '0 0 16px' }}>Nenhuma regra criada ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {regras.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid ' + D.line, borderRadius: 8, padding: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={r.ativo} onChange={e => alternarAtivoRegra(r.id, e.target.checked)} />
                  </label>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{r.nome} {!r.ativo && <span style={{ color: D.muted, fontWeight: 400 }}>(pausada)</span>}</div>
                    <div style={{ fontSize: 12, color: D.muted, marginTop: 2 }}>SE {descreverGatilho(r)} ENTÃO {descreverAcao(r)}</div>
                  </div>
                  <button onClick={() => apagarRegra(r.id)} style={{ border: 'none', background: 'none', color: D.red, cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ border: '1px dashed ' + D.line, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Nova regra</div>

            <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Nome</label>
            <input value={novaRegra.nome} onChange={e => setNovaRegra(p => ({ ...p, nome: e.target.value }))}
              placeholder="Ex: Escalar lead quente parado"
              style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, marginBottom: 10, boxSizing: 'border-box' }} />

            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>SE</label>
                <select value={novaRegra.gatilho_tipo} onChange={e => setNovaRegra(p => ({ ...p, gatilho_tipo: e.target.value as GatilhoTipo }))}
                  style={{ border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13 }}>
                  {(Object.keys(LABEL_GATILHO) as GatilhoTipo[]).map(g => <option key={g} value={g}>{LABEL_GATILHO[g]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Valor (X)</label>
                <input type="number" min={0} value={novaRegra.valorGatilho} onChange={e => setNovaRegra(p => ({ ...p, valorGatilho: Number(e.target.value) }))}
                  style={{ width: 80, border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13 }} />
              </div>
            </div>

            <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Restringir a estágios (opcional — vazio = todos)</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {ESTAGIOS_FUNIL.map(e => {
                const marcado = novaRegra.filtro_estagio.includes(e.key)
                return (
                  <button key={e.key} type="button"
                    onClick={() => setNovaRegra(p => ({ ...p, filtro_estagio: marcado ? p.filtro_estagio.filter(k => k !== e.key) : [...p.filtro_estagio, e.key] }))}
                    style={{ border: '1px solid ' + (marcado ? D.bronze : D.line), background: marcado ? D.bronze : 'transparent', color: marcado ? '#fff' : D.ink, borderRadius: 999, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                    {e.label}
                  </button>
                )
              })}
            </div>

            <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>ENTÃO</label>
            <select value={novaRegra.acao_tipo} onChange={e => setNovaRegra(p => ({ ...p, acao_tipo: e.target.value as AcaoTipo }))}
              style={{ border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, marginBottom: 10 }}>
              {(Object.keys(LABEL_ACAO) as AcaoTipo[]).map(a => <option key={a} value={a}>{LABEL_ACAO[a]}</option>)}
            </select>

            {novaRegra.acao_tipo === 'mover_estagio' && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Novo estágio</label>
                <select value={novaRegra.estagioDestino} onChange={e => setNovaRegra(p => ({ ...p, estagioDestino: e.target.value }))}
                  style={{ border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13 }}>
                  <option value="">Selecione...</option>
                  {ESTAGIOS_FUNIL.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
                </select>
              </div>
            )}

            {novaRegra.acao_tipo === 'enviar_whatsapp' && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Mensagem (use {'{nome}'} como placeholder)</label>
                <textarea value={novaRegra.mensagem} onChange={e => setNovaRegra(p => ({ ...p, mensagem: e.target.value }))} rows={3}
                  style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
              <button onClick={criarRegra} disabled={salvandoRegra}
                style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: salvandoRegra ? 'default' : 'pointer', opacity: salvandoRegra ? 0.6 : 1 }}>
                {salvandoRegra ? 'Criando...' : 'Criar regra (pausada)'}
              </button>
              {msgRegra && <span style={{ fontSize: 13, color: msgRegra.includes('criada') ? D.green : D.red }}>{msgRegra}</span>}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
