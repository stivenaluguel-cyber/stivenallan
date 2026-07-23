'use client'
import { useState, useEffect, useCallback } from 'react'
import { validarCadenciaWhatsapp, validarCadenciaEmail } from '@/lib/automacoes/validacao'
import { MENSAGENS_FOLLOWUP_FALLBACK, INTERVALOS_FALLBACK, ETAPAS_EMAIL_FALLBACK } from '@/lib/cron/fallback-defaults'

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
type ConfigAutomacao = {
  pausado: boolean
  horario_inicio: string
  horario_fim: string
  limite_diario: number | null
  migracao_pendente?: boolean
}

const CONFIRMA_REMOCAO = 'Remover isso? O conteúdo será perdido ao salvar.'

// Preview visível pro corretor ANTES de salvar — mesmos placeholders que o
// cron substitui de verdade (nome do lead / nome do empreendimento).
function preencherPreview(txt: string): string {
  return txt.replace(/{nome}/g, 'João').replace(/{empreendimento}/g, 'Monte Leone')
}

// Conversores fallback (fallback-defaults.ts, formato "de cron") → formato de
// estado usado pelo editor (mesmo shape das linhas do banco).
function fallbackParaIntervalos(): IntervaloRow[] {
  return INTERVALOS_FALLBACK.map((dias, ordem) => ({ ordem, dias }))
}
function fallbackParaMensagens(): MensagemRow[] {
  const linhas: MensagemRow[] = []
  for (const [estagio_funil, textos] of Object.entries(MENSAGENS_FOLLOWUP_FALLBACK)) {
    textos.forEach((mensagem, ordem) => linhas.push({ estagio_funil, ordem, mensagem }))
  }
  return linhas
}
function fallbackParaPassosEmail(): PassoEmail[] {
  return ETAPAS_EMAIL_FALLBACK.map((e, ordem) => ({ ordem, dias_minimos: e.diasMinimos, assunto: e.assunto, corpo_html: e.corpoHtml }))
}

export default function AutomacoesPage() {
  const [config, setConfig] = useState<ConfigAutomacao>({ pausado: false, horario_inicio: '08:00', horario_fim: '20:00', limite_diario: null })
  const [intervalos, setIntervalos] = useState<IntervaloRow[]>([])
  const [mensagens, setMensagens] = useState<MensagemRow[]>([])
  const [passosEmail, setPassosEmail] = useState<PassoEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [salvandoConfig, setSalvandoConfig] = useState(false)
  const [salvandoWpp, setSalvandoWpp] = useState(false)
  const [salvandoEmail, setSalvandoEmail] = useState(false)
  const [msgConfig, setMsgConfig] = useState('')
  const [msgWpp, setMsgWpp] = useState('')
  const [msgEmail, setMsgEmail] = useState('')

  const [testeWppNumero, setTesteWppNumero] = useState('')
  const [enviandoTesteWpp, setEnviandoTesteWpp] = useState(false)
  const [msgTesteWpp, setMsgTesteWpp] = useState('')

  const [testeEmailEndereco, setTesteEmailEndereco] = useState('')
  const [enviandoTesteEmail, setEnviandoTesteEmail] = useState<Record<number, boolean>>({})
  const [msgTesteEmail, setMsgTesteEmail] = useState<Record<number, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [wpp, email, cfg] = await Promise.all([
        fetch('/api/admin/automacoes/whatsapp').then(r => r.json()),
        fetch('/api/admin/automacoes/email').then(r => r.json()),
        fetch('/api/admin/automacoes/config').then(r => r.json()),
      ])
      setIntervalos(wpp.intervalos ?? [])
      setMensagens(wpp.mensagens ?? [])
      setPassosEmail(email.passos ?? [])
      setConfig({
        pausado: Boolean(cfg.pausado),
        horario_inicio: cfg.horario_inicio ?? '08:00',
        horario_fim: cfg.horario_fim ?? '20:00',
        limite_diario: cfg.limite_diario ?? null,
        migracao_pendente: cfg.migracao_pendente,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function salvarConfig() {
    setSalvandoConfig(true); setMsgConfig('')
    try {
      const res = await fetch('/api/admin/automacoes/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pausado: config.pausado,
          horario_inicio: config.horario_inicio,
          horario_fim: config.horario_fim,
          limite_diario: config.limite_diario,
        }),
      })
      const data = await res.json()
      setMsgConfig(res.ok ? 'Configurações salvas.' : (data.error || 'Erro ao salvar.'))
    } catch {
      setMsgConfig('Falha ao conectar.')
    } finally {
      setSalvandoConfig(false)
    }
  }

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
    const alvo = mensagens.find(m => m.estagio_funil === estagio && m.ordem === ordem)
    if (alvo?.mensagem.trim() && !confirm(CONFIRMA_REMOCAO)) return
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
    // Intervalos sempre têm um número (nunca "vazios") — o risco real de
    // perda é esvaziar a cadência inteira, por isso só confirmamos quando é
    // o último restante.
    if (intervalos.length === 1 && !confirm(CONFIRMA_REMOCAO)) return
    setIntervalos(prev => prev
      .filter(i => i.ordem !== ordem)
      .map(i => i.ordem > ordem ? { ...i, ordem: i.ordem - 1 } : i))
  }

  function restaurarPadroesWpp() {
    if (!confirm('Isso substitui o que está na tela pelos valores padrão de fábrica (ainda não salva — você pode revisar antes de clicar em Salvar). Continuar?')) return
    setIntervalos(fallbackParaIntervalos())
    setMensagens(fallbackParaMensagens())
    setMsgWpp('')
  }

  async function salvarWpp() {
    const erros = validarCadenciaWhatsapp(intervalos, mensagens)
    if (erros.length > 0) {
      setMsgWpp(erros.join(' '))
      return
    }
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

  async function enviarTesteWpp() {
    const numero = testeWppNumero.trim()
    const primeira = mensagensDoEstagio('primeiro_contato')[0]
    if (!numero) {
      setMsgTesteWpp('Informe um número de teste.')
      return
    }
    if (!primeira || !primeira.mensagem.trim()) {
      setMsgTesteWpp('Cadastre ao menos 1 mensagem em "Novo Contato" antes de testar.')
      return
    }
    setEnviandoTesteWpp(true); setMsgTesteWpp('')
    try {
      const res = await fetch('/api/admin/automacoes/whatsapp/teste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero, mensagem: primeira.mensagem }),
      })
      const data = await res.json()
      setMsgTesteWpp(res.ok ? 'Mensagem de teste enviada.' : (data.error || 'Erro ao enviar teste.'))
    } catch {
      setMsgTesteWpp('Falha ao conectar.')
    } finally {
      setEnviandoTesteWpp(false)
    }
  }

  function setPassoEmail(ordem: number, campo: keyof PassoEmail, valor: string | number) {
    setPassosEmail(prev => prev.map(p => p.ordem === ordem ? { ...p, [campo]: valor } : p))
  }

  function addPassoEmail() {
    setPassosEmail(prev => [...prev, { ordem: prev.length, dias_minimos: (prev[prev.length - 1]?.dias_minimos ?? 0) + 5, assunto: '', corpo_html: '' }])
  }

  function removerPassoEmail(ordem: number) {
    const alvo = passosEmail.find(p => p.ordem === ordem)
    const temConteudo = Boolean(alvo?.assunto.trim() || alvo?.corpo_html.trim())
    if (temConteudo && !confirm(CONFIRMA_REMOCAO)) return
    setPassosEmail(prev => prev
      .filter(p => p.ordem !== ordem)
      .map(p => p.ordem > ordem ? { ...p, ordem: p.ordem - 1 } : p))
  }

  function restaurarPadroesEmail() {
    if (!confirm('Isso substitui o que está na tela pelos valores padrão de fábrica (ainda não salva — você pode revisar antes de clicar em Salvar). Continuar?')) return
    setPassosEmail(fallbackParaPassosEmail())
    setMsgEmail('')
  }

  async function salvarEmail() {
    const erros = validarCadenciaEmail(passosEmail)
    if (erros.length > 0) {
      setMsgEmail(erros.join(' '))
      return
    }
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

  async function enviarTesteEmail(passo: PassoEmail) {
    const email = testeEmailEndereco.trim()
    if (!email) {
      setMsgTesteEmail(prev => ({ ...prev, [passo.ordem]: 'Informe um e-mail de teste.' }))
      return
    }
    setEnviandoTesteEmail(prev => ({ ...prev, [passo.ordem]: true }))
    setMsgTesteEmail(prev => ({ ...prev, [passo.ordem]: '' }))
    try {
      const res = await fetch('/api/admin/automacoes/email/teste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, assunto: passo.assunto, corpo_html: passo.corpo_html }),
      })
      const data = await res.json()
      setMsgTesteEmail(prev => ({ ...prev, [passo.ordem]: res.ok ? 'E-mail de teste enviado.' : (data.error || 'Erro ao enviar teste.') }))
    } catch {
      setMsgTesteEmail(prev => ({ ...prev, [passo.ordem]: 'Falha ao conectar.' }))
    } finally {
      setEnviandoTesteEmail(prev => ({ ...prev, [passo.ordem]: false }))
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
            Edite a cadência sem precisar de deploy. Nenhum campo pode ficar vazio — o formulário valida antes de salvar, e o cron nunca envia mensagem/e-mail em branco.
          </p>
        </div>

        {/* Configurações gerais */}
        <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20, marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Configurações gerais</h2>

          <div style={{ marginBottom: 18 }}>
            <button
              onClick={() => setConfig(c => ({ ...c, pausado: !c.pausado }))}
              style={{
                border: '1px solid ' + (config.pausado ? D.red : D.green),
                background: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 14, fontWeight: 700,
                color: config.pausado ? D.red : D.green, cursor: 'pointer',
              }}
            >
              {config.pausado ? 'Automações PAUSADAS — clique para ativar' : 'Automações ATIVAS — clique para pausar'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <label htmlFor="config-horario-inicio" style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Início da janela permitida</label>
              <input id="config-horario-inicio" type="time" value={config.horario_inicio} onChange={e => setConfig(c => ({ ...c, horario_inicio: e.target.value }))}
                style={{ border: '1px solid ' + D.line, borderRadius: 6, padding: 6, fontSize: 13 }} />
            </div>
            <div>
              <label htmlFor="config-horario-fim" style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Fim da janela permitida</label>
              <input id="config-horario-fim" type="time" value={config.horario_fim} onChange={e => setConfig(c => ({ ...c, horario_fim: e.target.value }))}
                style={{ border: '1px solid ' + D.line, borderRadius: 6, padding: 6, fontSize: 13 }} />
            </div>
            <div>
              <label htmlFor="config-limite-diario" style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Limite diário de envios (vazio = sem limite)</label>
              <input id="config-limite-diario" type="number" min={1} placeholder="Sem limite" value={config.limite_diario ?? ''}
                onChange={e => setConfig(c => ({ ...c, limite_diario: e.target.value === '' ? null : Number(e.target.value) }))}
                style={{ width: 120, border: '1px solid ' + D.line, borderRadius: 6, padding: 6, fontSize: 13 }} />
            </div>
          </div>
          <p style={{ fontSize: 12, color: D.muted, margin: '0 0 18px' }}>Horário de Brasília.</p>

          {config.migracao_pendente && (
            <p role="alert" style={{ fontSize: 12, color: D.red, margin: '0 0 12px' }}>
              A migration de segurança (0015) ainda não foi aplicada no banco — os valores acima são o padrão e podem não salvar até ela rodar.
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={salvarConfig} disabled={salvandoConfig}
              style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: salvandoConfig ? 'default' : 'pointer', opacity: salvandoConfig ? 0.6 : 1 }}>
              {salvandoConfig ? 'Salvando...' : 'Salvar configurações'}
            </button>
            {msgConfig && <span role={msgConfig.includes('salvas') ? 'status' : 'alert'} style={{ fontSize: 13, color: msgConfig.includes('salvas') ? D.green : D.red }}>{msgConfig}</span>}
          </div>
        </section>

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
                    aria-label={`Dias do passo ${i.ordem}`}
                    style={{ width: 50, border: 'none', background: 'transparent', fontWeight: 700, fontSize: 13 }} />
                  <span style={{ fontSize: 12, color: D.muted }}>dias</span>
                  <button onClick={() => removerIntervalo(i.ordem)} aria-label={`Remover passo ${i.ordem} do intervalo`}
                    style={{ border: 'none', background: 'none', color: D.red, cursor: 'pointer', fontSize: 14 }}>×</button>
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
                  <div style={{ flex: 1 }}>
                    <textarea value={m.mensagem} onChange={e => setMensagemTexto(est.key, m.ordem, e.target.value)} rows={2}
                      aria-label={`Mensagem ${m.ordem} de ${est.label}`}
                      style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 8, padding: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                    <div style={{ fontSize: 11, color: D.muted, marginTop: 4, padding: '6px 8px', background: D.bg, borderRadius: 6 }}>
                      Preview: {m.mensagem.trim() ? preencherPreview(m.mensagem) : '(vazio)'}
                    </div>
                  </div>
                  <button onClick={() => removerMensagem(est.key, m.ordem)} aria-label={`Remover mensagem ${m.ordem} de ${est.label}`}
                    style={{ border: 'none', background: 'none', color: D.red, cursor: 'pointer', fontSize: 16, marginTop: 6 }}>×</button>
                </div>
              ))}
              <button onClick={() => addMensagem(est.key)} style={{ border: '1px dashed ' + D.line, background: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: D.bronze, cursor: 'pointer' }}>+ mensagem</button>
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            <button onClick={salvarWpp} disabled={salvandoWpp}
              style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: salvandoWpp ? 'default' : 'pointer', opacity: salvandoWpp ? 0.6 : 1 }}>
              {salvandoWpp ? 'Salvando...' : 'Salvar cadência WhatsApp'}
            </button>
            <button onClick={restaurarPadroesWpp}
              style={{ border: '1px solid ' + D.line, background: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, fontSize: 13, color: D.muted, cursor: 'pointer' }}>
              Restaurar padrões
            </button>
            {msgWpp && <span role={msgWpp.includes('salva') ? 'status' : 'alert'} style={{ fontSize: 13, color: msgWpp.includes('salva') ? D.green : D.red }}>{msgWpp}</span>}
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid ' + D.line }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: D.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Testar envio (Evolution API)
            </div>
            <p style={{ fontSize: 12, color: D.muted, margin: '0 0 8px' }}>Envia a primeira mensagem de &quot;Novo Contato&quot; pro número informado.</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="tel" placeholder="48999999999" value={testeWppNumero} onChange={e => setTesteWppNumero(e.target.value)}
                aria-label="Número de WhatsApp para teste"
                style={{ border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, width: 180 }} />
              <button onClick={enviarTesteWpp} disabled={enviandoTesteWpp}
                style={{ border: '1px solid ' + D.line, background: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: enviandoTesteWpp ? 'default' : 'pointer', opacity: enviandoTesteWpp ? 0.6 : 1 }}>
                {enviandoTesteWpp ? 'Enviando...' : 'Enviar teste'}
              </button>
              {msgTesteWpp && <span role={msgTesteWpp.includes('enviada') ? 'status' : 'alert'} style={{ fontSize: 13, color: msgTesteWpp.includes('enviada') ? D.green : D.red }}>{msgTesteWpp}</span>}
            </div>
          </div>
        </section>

        {/* Cadência E-mail */}
        <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Cadência E-mail</h2>

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="config-email-teste" style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>E-mail de teste (usado pelos botões &quot;Enviar teste&quot; abaixo)</label>
            <input id="config-email-teste" type="email" placeholder="voce@exemplo.com" value={testeEmailEndereco} onChange={e => setTesteEmailEndereco(e.target.value)}
              style={{ border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, width: 260 }} />
          </div>

          {passosEmail.sort((a, b) => a.ordem - b.ordem).map(p => (
            <div key={p.ordem} style={{ border: '1px solid ' + D.line, borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Passo {p.ordem}</span>
                <button onClick={() => removerPassoEmail(p.ordem)} aria-label={`Remover passo ${p.ordem} de e-mail`}
                  style={{ border: 'none', background: 'none', color: D.red, cursor: 'pointer', fontSize: 16 }}>×</button>
              </div>
              <label htmlFor={`passo-email-dias-${p.ordem}`} style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Dias mínimos desde o cadastro do lead</label>
              <input id={`passo-email-dias-${p.ordem}`} type="number" min={0} value={p.dias_minimos} onChange={e => setPassoEmail(p.ordem, 'dias_minimos', Number(e.target.value))}
                style={{ width: 80, border: '1px solid ' + D.line, borderRadius: 6, padding: 6, fontSize: 13, marginBottom: 10 }} />
              <label htmlFor={`passo-email-assunto-${p.ordem}`} style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Assunto (use {'{nome}'} / {'{empreendimento}'} como placeholders)</label>
              <input id={`passo-email-assunto-${p.ordem}`} value={p.assunto} onChange={e => setPassoEmail(p.ordem, 'assunto', e.target.value)}
                style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, marginBottom: 10, boxSizing: 'border-box' }} />
              <label htmlFor={`passo-email-corpo-${p.ordem}`} style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Corpo HTML</label>
              <textarea id={`passo-email-corpo-${p.ordem}`} value={p.corpo_html} onChange={e => setPassoEmail(p.ordem, 'corpo_html', e.target.value)} rows={6}
                style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 12, fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace', resize: 'vertical', boxSizing: 'border-box' }} />

              <div style={{ fontSize: 11, color: D.muted, margin: '6px 0 10px' }}>Preview (assunto + corpo):</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{p.assunto.trim() ? preencherPreview(p.assunto) : '(sem assunto)'}</div>
              <div style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 8, padding: 12, marginBottom: 10 }}
                dangerouslySetInnerHTML={{ __html: p.corpo_html.trim() ? preencherPreview(p.corpo_html) : '<p style="color:#999">(sem corpo)</p>' }} />

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => enviarTesteEmail(p)} disabled={Boolean(enviandoTesteEmail[p.ordem])}
                  style={{ border: '1px solid ' + D.line, background: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 12, cursor: enviandoTesteEmail[p.ordem] ? 'default' : 'pointer', opacity: enviandoTesteEmail[p.ordem] ? 0.6 : 1 }}>
                  {enviandoTesteEmail[p.ordem] ? 'Enviando...' : 'Enviar teste'}
                </button>
                {msgTesteEmail[p.ordem] && (
                  <span role={msgTesteEmail[p.ordem].includes('enviado') ? 'status' : 'alert'} style={{ fontSize: 12, color: msgTesteEmail[p.ordem].includes('enviado') ? D.green : D.red }}>{msgTesteEmail[p.ordem]}</span>
                )}
              </div>
            </div>
          ))}
          <button onClick={addPassoEmail} style={{ border: '1px dashed ' + D.line, background: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: D.bronze, cursor: 'pointer', marginBottom: 12 }}>+ passo de e-mail</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={salvarEmail} disabled={salvandoEmail}
              style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: salvandoEmail ? 'default' : 'pointer', opacity: salvandoEmail ? 0.6 : 1 }}>
              {salvandoEmail ? 'Salvando...' : 'Salvar cadência de e-mail'}
            </button>
            <button onClick={restaurarPadroesEmail}
              style={{ border: '1px solid ' + D.line, background: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, fontSize: 13, color: D.muted, cursor: 'pointer' }}>
              Restaurar padrões
            </button>
            {msgEmail && <span role={msgEmail.includes('salva') ? 'status' : 'alert'} style={{ fontSize: 13, color: msgEmail.includes('salva') ? D.green : D.red }}>{msgEmail}</span>}
          </div>
        </section>
      </div>
    </div>
  )
}
