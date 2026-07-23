'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ESTAGIOS_FUNIL } from '@/lib/dashboard/estagios'
import { statsParaGrafico, type CampanhaStats } from '@/lib/dashboard/campanhas-stats'
import { CampanhaChart } from '@/lib/dashboard/campanhas-chart'
import { ESTADOS_CAMPANHA, podeAgendar, podeCancelar, type StatusCampanha } from '@/lib/campanhas/estados'

type Empreendimento = { id: string; nome: string; slug: string; construtora: string | null; imagem_capa_url: string | null; ativo: boolean; oculto: boolean }

// Bloco de imagem+texto no mesmo estilo visual da moldura de e-mail
// (montarHtml em src/lib/cron/email-followup-helpers.ts) — link sempre
// absoluto pro stivenallan.com.br, já que o e-mail é lido fora do site.
function blocoEmpreendimentoHtml(emp: Empreendimento): string {
  const link = `https://stivenallan.com.br/empreendimento/${emp.construtora ?? ''}/${emp.slug}`
  const imagem = emp.imagem_capa_url
    ? `<img src="${emp.imagem_capa_url}" alt="${emp.nome}" style="width:100%;max-width:480px;border-radius:12px;display:block;margin:0 auto" />`
    : ''
  return `\n<div style="margin:20px 0;text-align:center">\n  ${imagem}\n  <p style="font-weight:700;margin:12px 0 4px">${emp.nome}</p>\n  <p style="margin:0"><a href="${link}" style="color:#1A5C3A;font-weight:700">Ver ${emp.nome} →</a></p>\n</div>\n`
}

function blocoImagemTextoHtml(url: string, texto: string): string {
  const imagem = url
    ? `<img src="${url}" alt="${texto || ''}" style="width:100%;max-width:480px;border-radius:12px;display:block;margin:0 auto" />`
    : ''
  const paragrafo = texto ? `<p style="margin:12px 0 0">${texto}</p>` : ''
  return `\n<div style="margin:20px 0;text-align:center">\n  ${imagem}\n  ${paragrafo}\n</div>\n`
}

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512', bronze: '#D24E22',
  muted: '#6B655B', line: 'rgba(26,24,21,0.08)', green: '#22c55e', red: '#ef4444', blue: '#3b82f6',
}

const TEMPERATURAS = [
  { v: 1, label: 'Frio' },
  { v: 2, label: 'Morno' },
  { v: 3, label: 'Quente' },
]

const ORIGENS = ['Instagram', 'Indicacao', 'Portal', 'Anuncio', 'Evento', 'Site', 'Whatsapp', 'Outro']

type Segmento = {
  estagio_funil?: string[]
  temperatura?: number[]
  origem?: string[]
  cidade_interesse?: string[]
}

type Campanha = {
  id: string; titulo: string; assunto: string; corpo_html: string
  segmento: Segmento; status: string; agendada_para: string | null
}

// Resumo curto do segmento pra confirmação de envio — "todos os leads com
// e-mail" deixa explícito quando nenhum filtro foi aplicado (sem isso a
// confirmação ficava vazia/ambígua nesse caso).
function resumoSegmento(s: Segmento): string {
  const partes: string[] = []
  if (s.estagio_funil?.length) partes.push(`estágio: ${s.estagio_funil.join(', ')}`)
  if (s.temperatura?.length) partes.push(`temperatura: ${s.temperatura.join(', ')}`)
  if (s.origem?.length) partes.push(`origem: ${s.origem.join(', ')}`)
  if (s.cidade_interesse?.length) partes.push(`cidade: ${s.cidade_interesse.join(', ')}`)
  return partes.length > 0 ? partes.join(' · ') : 'todos os leads com e-mail (sem filtro)'
}

export default function CampanhaDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [campanha, setCampanha] = useState<Campanha | null>(null)
  const [destinatarios, setDestinatarios] = useState({ pendente: 0, enviado: 0, erro: 0 })
  const [stats, setStats] = useState<CampanhaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [titulo, setTitulo] = useState('')
  const [assunto, setAssunto] = useState('')
  const [corpoHtml, setCorpoHtml] = useState('')
  const [cidades, setCidades] = useState('')
  const [segmento, setSegmento] = useState<Segmento>({})
  const [audiencia, setAudiencia] = useState<{ total: number; preview: { id: string; nome?: string; email: string }[]; remetente: string | null } | null>(null)
  const [buscandoAudiencia, setBuscandoAudiencia] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState('')
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
  const enviandoLock = useRef(false) // trava síncrona contra clique duplo, além do disabled do state

  const [emailTeste, setEmailTeste] = useState('')
  const [enviandoTeste, setEnviandoTeste] = useState(false)
  const [msgTeste, setMsgTeste] = useState('')

  const [preview, setPreview] = useState<'desktop' | 'mobile' | null>(null)

  const [agendarPara, setAgendarPara] = useState('')
  const [agendando, setAgendando] = useState(false)

  const corpoRef = useRef<HTMLTextAreaElement>(null)
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([])
  const [mostrarPickerEmp, setMostrarPickerEmp] = useState(false)
  const [empSelecionado, setEmpSelecionado] = useState('')
  const [mostrarPickerImagem, setMostrarPickerImagem] = useState(false)
  const [imgUrl, setImgUrl] = useState('')
  const [imgTexto, setImgTexto] = useState('')
  const [enviandoImagem, setEnviandoImagem] = useState(false)
  const [erroImagem, setErroImagem] = useState('')

  // Reaproveita o mesmo endpoint de upload que a tela de Empreendimentos já
  // usa (Supabase Storage, bucket "midias") — empreendimentoId é só um
  // prefixo de pasta ali dentro, então passar o id da campanha funciona sem
  // precisar de rota nova.
  async function anexarImagem(file: File) {
    setEnviandoImagem(true); setErroImagem('')
    try {
      const fd = new FormData()
      fd.append('empreendimentoId', 'campanhas/' + id)
      fd.append('files', file)
      fd.append('perfil', 'email')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.urls?.[0]) { setErroImagem(data.error || 'Falha ao enviar imagem.'); return }
      setImgUrl(data.urls[0])
    } catch {
      setErroImagem('Falha ao conectar.')
    } finally {
      setEnviandoImagem(false)
    }
  }

  useEffect(() => {
    fetch('/api/admin/empreendimentos')
      .then((r) => r.json())
      .then((d) => setEmpreendimentos((d.data ?? []).filter((e: Empreendimento) => e.ativo && !e.oculto)))
      .catch(() => setEmpreendimentos([]))
  }, [])

  // Insere no cursor (ou no fim, se o textarea nunca ganhou foco) em vez de
  // só concatenar — evita quebrar o texto se o corretor já estava editando
  // no meio do corpo.
  function inserirNoCorpo(html: string) {
    const el = corpoRef.current
    setCorpoHtml((atual) => {
      if (!el) return atual + html
      const inicio = el.selectionStart ?? atual.length
      const fim = el.selectionEnd ?? atual.length
      return atual.slice(0, inicio) + html + atual.slice(fim)
    })
  }

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/campanhas/' + id)
      const data = await res.json()
      if (!res.ok) { setMsg(data.error || 'Erro ao carregar'); return }
      const c: Campanha = data.data
      setCampanha(c)
      setDestinatarios(data.destinatarios ?? { pendente: 0, enviado: 0, erro: 0 })
      setStats(data.stats ?? null)
      setTitulo(c.titulo)
      setAssunto(c.assunto)
      setCorpoHtml(c.corpo_html)
      setSegmento(c.segmento ?? {})
      setCidades((c.segmento?.cidade_interesse ?? []).join(', '))
      setAgendarPara(c.agendada_para ? c.agendada_para.slice(0, 16) : '')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  // Carrega a contagem de público assim que a página abre — sem isso o botão
  // "Enviar agora" não tinha como saber se o público é zero antes do usuário
  // clicar manualmente em "Atualizar contagem".
  useEffect(() => { buscarAudiencia() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  function segmentoAtual(): Segmento {
    return {
      ...segmento,
      cidade_interesse: cidades.split(',').map((s) => s.trim()).filter(Boolean),
    }
  }

  function toggleLista(campo: 'estagio_funil' | 'origem', valor: string) {
    setSegmento((prev) => {
      const atual = prev[campo] ?? []
      const novo = atual.includes(valor) ? atual.filter((v) => v !== valor) : [...atual, valor]
      return { ...prev, [campo]: novo }
    })
  }

  function toggleTemperatura(v: number) {
    setSegmento((prev) => {
      const atual = prev.temperatura ?? []
      const novo = atual.includes(v) ? atual.filter((x) => x !== v) : [...atual, v]
      return { ...prev, temperatura: novo }
    })
  }

  async function buscarAudiencia() {
    setBuscandoAudiencia(true)
    try {
      const q = encodeURIComponent(JSON.stringify(segmentoAtual()))
      const res = await fetch('/api/admin/campanhas/' + id + '/audiencia?segmento=' + q)
      const data = await res.json()
      if (res.ok) setAudiencia(data)
    } finally {
      setBuscandoAudiencia(false)
    }
  }

  async function salvar() {
    setSalvando(true); setMsg('')
    try {
      const res = await fetch('/api/admin/campanhas/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, assunto, corpo_html: corpoHtml, segmento: segmentoAtual() }),
      })
      const data = await res.json()
      setMsg(res.ok ? 'Salvo.' : (data.error || 'Erro ao salvar.'))
      if (res.ok) setCampanha(data.data)
    } finally {
      setSalvando(false)
    }
  }

  async function enviar() {
    // Trava síncrona: além do disabled={enviando} (que só se aplica depois
    // do próximo render), essa ref bloqueia um segundo clique que chegue
    // antes do React re-renderizar o botão.
    if (enviandoLock.current) return
    enviandoLock.current = true
    setEnviando(true); setMsg(''); setMostrarConfirmacao(false)
    try {
      const res = await fetch('/api/admin/campanhas/' + id + '/enviar', { method: 'POST' })
      const data = await res.json()
      setMsg(res.ok ? (data.mensagem || 'Envio processado.') : (data.error || 'Erro ao enviar.'))
      await carregar()
    } finally {
      setEnviando(false)
      enviandoLock.current = false
    }
  }

  async function enviarTeste() {
    setEnviandoTeste(true); setMsgTeste('')
    try {
      const res = await fetch('/api/admin/campanhas/' + id + '/teste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTeste, assunto, corpo_html: corpoHtml }),
      })
      const data = await res.json()
      setMsgTeste(res.ok ? `Teste enviado para ${emailTeste}.` : (data.error || 'Erro ao enviar teste.'))
    } finally {
      setEnviandoTeste(false)
    }
  }

  async function agendar() {
    if (!agendarPara) return
    setAgendando(true); setMsg('')
    try {
      const iso = new Date(agendarPara).toISOString()
      const res = await fetch('/api/admin/campanhas/' + id + '/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agendada_para: iso }),
      })
      const data = await res.json()
      setMsg(res.ok ? 'Envio agendado.' : (data.error || 'Erro ao agendar.'))
      if (res.ok) await carregar()
    } finally {
      setAgendando(false)
    }
  }

  async function desagendar() {
    setAgendando(true); setMsg('')
    try {
      const res = await fetch('/api/admin/campanhas/' + id + '/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agendada_para: null }),
      })
      const data = await res.json()
      setMsg(res.ok ? 'Agendamento removido — voltou pra rascunho.' : (data.error || 'Erro ao desagendar.'))
      if (res.ok) await carregar()
    } finally {
      setAgendando(false)
    }
  }

  async function cancelarCampanha() {
    if (!confirm('Cancelar esta campanha? Ela não poderá mais ser enviada (mas continua registrada no histórico).')) return
    setMsg('')
    try {
      const res = await fetch('/api/admin/campanhas/' + id + '/cancelar', { method: 'POST' })
      const data = await res.json()
      setMsg(res.ok ? 'Campanha cancelada.' : (data.error || 'Erro ao cancelar.'))
      if (res.ok) await carregar()
    } catch {
      setMsg('Falha ao conectar.')
    }
  }

  if (loading) return <div style={{ padding: 32, color: D.muted }}>Carregando...</div>
  if (!campanha) return <div style={{ padding: 32, color: D.red }}>{msg || 'Campanha não encontrada.'}</div>

  const editavel = campanha.status === 'rascunho'
  const temPendentes = destinatarios.pendente > 0

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(20px,2.5vw,36px) clamp(16px,3vw,32px)' }}>
        <button onClick={() => router.push('/dashboard/campanhas')} style={{ background: 'none', border: 'none', color: D.muted, fontSize: 13, cursor: 'pointer', marginBottom: 12, padding: 0 }}>← Campanhas</button>

        <h1 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.4rem,3vw,1.8rem)', fontWeight: 800, margin: '0 0 4px' }}>{titulo || 'Campanha'}</h1>
        <p style={{ fontSize: 13, color: D.muted, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.05em',
            color: ESTADOS_CAMPANHA[campanha.status as StatusCampanha]?.cor ?? D.muted,
            background: ESTADOS_CAMPANHA[campanha.status as StatusCampanha]?.corSoft ?? D.bg,
          }}>
            {ESTADOS_CAMPANHA[campanha.status as StatusCampanha]?.label ?? campanha.status}
          </span>
          {campanha.status === 'agendada' && campanha.agendada_para && (
            <span>para {new Date(campanha.agendada_para).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
          )}
        </p>

        <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <label htmlFor="campanha-titulo" style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Título (interno)</label>
          <input id="campanha-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} disabled={!editavel}
            style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, marginBottom: 12, boxSizing: 'border-box' }} />

          <label htmlFor="campanha-assunto" style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Assunto do e-mail</label>
          <input id="campanha-assunto" value={assunto} onChange={(e) => setAssunto(e.target.value)} disabled={!editavel}
            style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, marginBottom: 12, boxSizing: 'border-box' }} />

          <label htmlFor="campanha-corpo-html" style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Corpo HTML (use {'{nome}'} / {'{empreendimento}'} como placeholders)</label>

          {editavel && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => { setMostrarPickerEmp((v) => !v); setMostrarPickerImagem(false) }}
                style={{ border: '1px dashed ' + D.line, background: mostrarPickerEmp ? D.bg : '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: D.bronze, cursor: 'pointer' }}>
                + Empreendimento
              </button>
              <button type="button" onClick={() => { setMostrarPickerImagem((v) => !v); setMostrarPickerEmp(false) }}
                style={{ border: '1px dashed ' + D.line, background: mostrarPickerImagem ? D.bg : '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: D.bronze, cursor: 'pointer' }}>
                + Imagem/Texto
              </button>
            </div>
          )}

          {mostrarPickerEmp && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap', background: D.bg, borderRadius: 8, padding: 10 }}>
              <select value={empSelecionado} onChange={(e) => setEmpSelecionado(e.target.value)} aria-label="Selecionar empreendimento para inserir no corpo do e-mail"
                style={{ flex: '1 1 220px', border: '1px solid ' + D.line, borderRadius: 6, padding: 7, fontSize: 13 }}>
                <option value="">Selecione um empreendimento...</option>
                {empreendimentos.map((e) => (
                  <option key={e.id} value={e.id}>{e.nome}</option>
                ))}
              </select>
              <button type="button" disabled={!empSelecionado} onClick={() => {
                const emp = empreendimentos.find((e) => e.id === empSelecionado)
                if (!emp) return
                inserirNoCorpo(blocoEmpreendimentoHtml(emp))
                setMostrarPickerEmp(false); setEmpSelecionado('')
              }} style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: empSelecionado ? 1 : 0.5 }}>
                Inserir
              </button>
            </div>
          )}

          {mostrarPickerImagem && (
            <div style={{ marginBottom: 10, background: D.bg, borderRadius: 8, padding: 10 }}>
              <label htmlFor="campanha-imagem-arquivo" style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Anexar imagem do computador</label>
              <input id="campanha-imagem-arquivo" type="file" accept="image/*" disabled={enviandoImagem}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) anexarImagem(f) }}
                style={{ width: '100%', fontSize: 13, marginBottom: 8 }} />
              {enviandoImagem && <p role="status" style={{ fontSize: 12, color: D.muted, margin: '0 0 8px' }}>Enviando imagem...</p>}
              {erroImagem && <p role="alert" style={{ fontSize: 12, color: D.red, margin: '0 0 8px' }}>{erroImagem}</p>}

              <label htmlFor="campanha-imagem-url" style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>ou cole a URL de uma imagem já hospedada</label>
              <input id="campanha-imagem-url" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://..."
                style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 7, fontSize: 13, marginBottom: 6, boxSizing: 'border-box' }} />
              {imgUrl && (
                <img src={imgUrl} alt="Pré-visualização" style={{ maxWidth: '100%', maxHeight: 140, borderRadius: 6, display: 'block', marginBottom: 8 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              )}
              <input value={imgTexto} onChange={(e) => setImgTexto(e.target.value)} placeholder="Texto/legenda (opcional)" aria-label="Texto ou legenda da imagem (opcional)"
                style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 7, fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }} />
              <button type="button" disabled={!imgUrl.trim() || enviandoImagem} onClick={() => {
                inserirNoCorpo(blocoImagemTextoHtml(imgUrl.trim(), imgTexto.trim()))
                setMostrarPickerImagem(false); setImgUrl(''); setImgTexto(''); setErroImagem('')
              }} style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: imgUrl.trim() ? 1 : 0.5 }}>
                Inserir
              </button>
            </div>
          )}

          <textarea id="campanha-corpo-html" ref={corpoRef} value={corpoHtml} onChange={(e) => setCorpoHtml(e.target.value)} disabled={!editavel} rows={10}
            style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 12, fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace', resize: 'vertical', boxSizing: 'border-box' }} />

          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setPreview(preview === 'desktop' ? null : 'desktop')}
              style={{ border: '1px solid ' + D.line, background: preview === 'desktop' ? D.bronze : '#fff', color: preview === 'desktop' ? '#fff' : D.ink, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Pré-visualizar desktop
            </button>
            <button type="button" onClick={() => setPreview(preview === 'mobile' ? null : 'mobile')}
              style={{ border: '1px solid ' + D.line, background: preview === 'mobile' ? D.bronze : '#fff', color: preview === 'mobile' ? '#fff' : D.ink, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Pré-visualizar mobile
            </button>
          </div>

          {preview && (
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', background: D.bg, borderRadius: 8, padding: 16 }}>
              <iframe
                title="Pré-visualização do e-mail"
                srcDoc={corpoHtml}
                style={{
                  width: preview === 'desktop' ? 600 : 320,
                  height: 480,
                  maxWidth: '100%',
                  border: '1px solid ' + D.line,
                  borderRadius: 8,
                  background: '#fff',
                }}
              />
            </div>
          )}

          <div style={{ marginTop: 16, borderTop: '1px solid ' + D.line, paddingTop: 14 }}>
            <label htmlFor="campanha-email-teste" style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Enviar e-mail de teste pra conferir antes</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input id="campanha-email-teste" type="email" value={emailTeste} onChange={(e) => setEmailTeste(e.target.value)} placeholder="seu@email.com"
                style={{ flex: '1 1 220px', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, boxSizing: 'border-box' }} />
              <button type="button" onClick={enviarTeste} disabled={!emailTeste.trim() || enviandoTeste}
                style={{ border: '1px solid ' + D.line, background: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: emailTeste.trim() ? 1 : 0.5 }}>
                {enviandoTeste ? 'Enviando...' : 'Enviar teste'}
              </button>
            </div>
            {msgTeste && <p role={msgTeste.includes('Erro') ? 'alert' : 'status'} style={{ fontSize: 12, color: msgTeste.includes('Erro') ? D.red : D.green, marginTop: 6 }}>{msgTeste}</p>}
          </div>
        </section>

        <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Público (segmento)</h2>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: D.muted, marginBottom: 6 }}>Estágio do funil</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ESTAGIOS_FUNIL.map((e) => (
                <label key={e.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: D.bg, borderRadius: 8, padding: '5px 10px', cursor: editavel ? 'pointer' : 'default' }}>
                  <input type="checkbox" disabled={!editavel} checked={(segmento.estagio_funil ?? []).includes(e.key)} onChange={() => toggleLista('estagio_funil', e.key)} />
                  {e.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: D.muted, marginBottom: 6 }}>Temperatura</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TEMPERATURAS.map((t) => (
                <label key={t.v} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: D.bg, borderRadius: 8, padding: '5px 10px', cursor: editavel ? 'pointer' : 'default' }}>
                  <input type="checkbox" disabled={!editavel} checked={(segmento.temperatura ?? []).includes(t.v)} onChange={() => toggleTemperatura(t.v)} />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: D.muted, marginBottom: 6 }}>Origem</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ORIGENS.map((o) => (
                <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: D.bg, borderRadius: 8, padding: '5px 10px', cursor: editavel ? 'pointer' : 'default' }}>
                  <input type="checkbox" disabled={!editavel} checked={(segmento.origem ?? []).includes(o)} onChange={() => toggleLista('origem', o)} />
                  {o}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="campanha-cidades" style={{ fontSize: 12, fontWeight: 700, color: D.muted, display: 'block', marginBottom: 6 }}>Cidade de interesse (separadas por vírgula)</label>
            <input id="campanha-cidades" value={cidades} onChange={(e) => setCidades(e.target.value)} disabled={!editavel} placeholder="Criciúma, Içara"
              style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={buscarAudiencia} disabled={buscandoAudiencia}
              style={{ border: '1px solid ' + D.line, background: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {buscandoAudiencia ? 'Contando...' : 'Atualizar contagem'}
            </button>
            {audiencia && (
              <span style={{ fontSize: 13, fontWeight: 700, color: audiencia.total === 0 ? D.red : D.bronze }}>
                {audiencia.total} lead(s) correspondem
              </span>
            )}
          </div>
          {audiencia && audiencia.total === 0 && (
            <p role="status" style={{ fontSize: 12, color: D.red, marginTop: 8 }}>
              Nenhum lead corresponde a este segmento hoje — ajuste os filtros antes de enviar.
            </p>
          )}
          {audiencia && audiencia.preview.length > 0 && (
            <p style={{ fontSize: 12, color: D.muted, marginTop: 8 }}>
              Ex: {audiencia.preview.slice(0, 5).map((l) => l.nome || l.email).join(', ')}{audiencia.total > 5 ? '...' : ''}
            </p>
          )}
        </section>

        {editavel && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button onClick={salvar} disabled={salvando}
              style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: salvando ? 0.6 : 1 }}>
              {salvando ? 'Salvando...' : 'Salvar rascunho'}
            </button>
          </div>
        )}

        {podeAgendar(campanha.status) && (
          <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Agendamento</h2>
            <p style={{ fontSize: 12, color: D.muted, margin: '0 0 10px' }}>Horário de Brasília (America/Sao_Paulo, o fuso do servidor).</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="datetime-local" value={agendarPara} onChange={(e) => setAgendarPara(e.target.value)} aria-label="Data e hora para agendar o envio"
                style={{ border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13 }} />
              <button onClick={agendar} disabled={!agendarPara || agendando}
                style={{ border: '1px solid ' + D.line, background: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: agendarPara ? 1 : 0.5 }}>
                {agendando ? 'Salvando...' : campanha.status === 'agendada' ? 'Alterar agendamento' : 'Agendar envio'}
              </button>
              {campanha.status === 'agendada' && (
                <button onClick={desagendar} disabled={agendando}
                  style={{ border: 'none', background: 'none', color: D.muted, fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                  Remover agendamento
                </button>
              )}
            </div>
          </section>
        )}

        <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Envio</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: D.muted, marginBottom: 14 }}>
            <span>Pendentes: <strong style={{ color: D.ink }}>{destinatarios.pendente}</strong></span>
            <span>Enviados: <strong style={{ color: D.ink }}>{destinatarios.enviado}</strong></span>
            <span>Erros: <strong style={{ color: D.ink }}>{destinatarios.erro}</strong></span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {(campanha.status === 'rascunho' || temPendentes) && (
              <button
                onClick={() => (temPendentes ? enviar() : setMostrarConfirmacao(true))}
                disabled={enviando || (!temPendentes && (!audiencia || audiencia.total === 0))}
                title={!temPendentes && audiencia?.total === 0 ? 'Nenhum lead corresponde ao segmento — ajuste os filtros acima' : undefined}
                style={{
                  background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px',
                  fontWeight: 700, fontSize: 14,
                  cursor: (enviando || (!temPendentes && (!audiencia || audiencia.total === 0))) ? 'not-allowed' : 'pointer',
                  opacity: (enviando || (!temPendentes && (!audiencia || audiencia.total === 0))) ? 0.5 : 1,
                }}>
                {enviando ? 'Enviando...' : temPendentes ? `Continuar envio (${destinatarios.pendente} restantes)` : 'Enviar agora'}
              </button>
            )}
            {podeCancelar(campanha.status) && (
              <button onClick={cancelarCampanha}
                style={{ border: '1px solid ' + D.red, background: '#fff', color: D.red, borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Cancelar campanha
              </button>
            )}
          </div>
          {msg && <p role={msg.includes('Erro') || msg.includes('error') ? 'alert' : 'status'} style={{ fontSize: 13, color: msg.includes('Erro') || msg.includes('error') ? D.red : D.green, marginTop: 12 }}>{msg}</p>}
        </section>

        {stats && (destinatarios.enviado > 0) && (
          <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20, marginTop: 20 }}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Engajamento</h2>
            <CampanhaChart data={statsParaGrafico(stats)} />
          </section>
        )}
      </div>

      {mostrarConfirmacao && audiencia && (
        <div role="dialog" aria-modal="true" aria-label="Confirmar envio da campanha"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setMostrarConfirmacao(false)}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 440, width: '100%' }}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 17, fontWeight: 800, margin: '0 0 14px' }}>Confirmar envio</h2>
            <ul style={{ fontSize: 13, color: D.ink, margin: '0 0 18px', paddingLeft: 18, lineHeight: 1.8 }}>
              <li><strong>{audiencia.total}</strong> destinatário(s)</li>
              <li>Assunto: <strong>{assunto || '(vazio)'}</strong></li>
              <li>Remetente: <strong>{audiencia.remetente ?? 'não configurado (RESEND_FROM ausente)'}</strong></li>
              <li>Segmento: {resumoSegmento(segmentoAtual())}</li>
            </ul>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setMostrarConfirmacao(false)}
                style={{ border: '1px solid ' + D.line, background: '#fff', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={enviar} disabled={enviando}
                style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: enviando ? 0.6 : 1 }}>
                {enviando ? 'Enviando...' : 'Confirmar e enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
