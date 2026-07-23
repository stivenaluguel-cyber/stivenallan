'use client'
import { useState, useEffect, useCallback } from 'react'

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

export default function AutomacoesPage() {
  const [intervalos, setIntervalos] = useState<IntervaloRow[]>([])
  const [mensagens, setMensagens] = useState<MensagemRow[]>([])
  const [passosEmail, setPassosEmail] = useState<PassoEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [salvandoWpp, setSalvandoWpp] = useState(false)
  const [salvandoEmail, setSalvandoEmail] = useState(false)
  const [msgWpp, setMsgWpp] = useState('')
  const [msgEmail, setMsgEmail] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [wpp, email] = await Promise.all([
        fetch('/api/admin/automacoes/whatsapp').then(r => r.json()),
        fetch('/api/admin/automacoes/email').then(r => r.json()),
      ])
      setIntervalos(wpp.intervalos ?? [])
      setMensagens(wpp.mensagens ?? [])
      setPassosEmail(email.passos ?? [])
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
      </div>
    </div>
  )
}
