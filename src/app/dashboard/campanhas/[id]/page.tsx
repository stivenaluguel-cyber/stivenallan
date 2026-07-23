'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ESTAGIOS_FUNIL } from '@/lib/dashboard/estagios'
import { statsParaGrafico, type CampanhaStats } from '@/lib/dashboard/campanhas-stats'
import { CampanhaChart } from '@/lib/dashboard/campanhas-chart'

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
  segmento: Segmento; status: string
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
  const [audiencia, setAudiencia] = useState<{ total: number; preview: { id: string; nome?: string; email: string }[] } | null>(null)
  const [buscandoAudiencia, setBuscandoAudiencia] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState('')

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
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { carregar() }, [carregar])

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
    setEnviando(true); setMsg('')
    try {
      const res = await fetch('/api/admin/campanhas/' + id + '/enviar', { method: 'POST' })
      const data = await res.json()
      setMsg(res.ok ? (data.mensagem || 'Envio processado.') : (data.error || 'Erro ao enviar.'))
      await carregar()
    } finally {
      setEnviando(false)
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
        <p style={{ fontSize: 13, color: D.muted, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status: {campanha.status}</p>

        <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Título (interno)</label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} disabled={!editavel}
            style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, marginBottom: 12, boxSizing: 'border-box' }} />

          <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Assunto do e-mail</label>
          <input value={assunto} onChange={(e) => setAssunto(e.target.value)} disabled={!editavel}
            style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, marginBottom: 12, boxSizing: 'border-box' }} />

          <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Corpo HTML (use {'{nome}'} / {'{empreendimento}'} como placeholders)</label>

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
              <select value={empSelecionado} onChange={(e) => setEmpSelecionado(e.target.value)}
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
              <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>Anexar imagem do computador</label>
              <input type="file" accept="image/*" disabled={enviandoImagem}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) anexarImagem(f) }}
                style={{ width: '100%', fontSize: 13, marginBottom: 8 }} />
              {enviandoImagem && <p style={{ fontSize: 12, color: D.muted, margin: '0 0 8px' }}>Enviando imagem...</p>}
              {erroImagem && <p style={{ fontSize: 12, color: D.red, margin: '0 0 8px' }}>{erroImagem}</p>}

              <label style={{ fontSize: 11, color: D.muted, display: 'block', marginBottom: 4 }}>ou cole a URL de uma imagem já hospedada</label>
              <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://..."
                style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 7, fontSize: 13, marginBottom: 6, boxSizing: 'border-box' }} />
              {imgUrl && (
                <img src={imgUrl} alt="Pré-visualização" style={{ maxWidth: '100%', maxHeight: 140, borderRadius: 6, display: 'block', marginBottom: 8 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              )}
              <input value={imgTexto} onChange={(e) => setImgTexto(e.target.value)} placeholder="Texto/legenda (opcional)"
                style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 7, fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }} />
              <button type="button" disabled={!imgUrl.trim() || enviandoImagem} onClick={() => {
                inserirNoCorpo(blocoImagemTextoHtml(imgUrl.trim(), imgTexto.trim()))
                setMostrarPickerImagem(false); setImgUrl(''); setImgTexto(''); setErroImagem('')
              }} style={{ background: D.bronze, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: imgUrl.trim() ? 1 : 0.5 }}>
                Inserir
              </button>
            </div>
          )}

          <textarea ref={corpoRef} value={corpoHtml} onChange={(e) => setCorpoHtml(e.target.value)} disabled={!editavel} rows={10}
            style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 12, fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace', resize: 'vertical', boxSizing: 'border-box' }} />
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
            <label style={{ fontSize: 12, fontWeight: 700, color: D.muted, display: 'block', marginBottom: 6 }}>Cidade de interesse (separadas por vírgula)</label>
            <input value={cidades} onChange={(e) => setCidades(e.target.value)} disabled={!editavel} placeholder="Criciúma, Içara"
              style={{ width: '100%', border: '1px solid ' + D.line, borderRadius: 6, padding: 8, fontSize: 13, boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={buscarAudiencia} disabled={buscandoAudiencia}
              style={{ border: '1px solid ' + D.line, background: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {buscandoAudiencia ? 'Contando...' : 'Atualizar contagem'}
            </button>
            {audiencia && <span style={{ fontSize: 13, fontWeight: 700, color: D.bronze }}>{audiencia.total} leads correspondem</span>}
          </div>
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

        <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Envio</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: D.muted, marginBottom: 14 }}>
            <span>Pendentes: <strong style={{ color: D.ink }}>{destinatarios.pendente}</strong></span>
            <span>Enviados: <strong style={{ color: D.ink }}>{destinatarios.enviado}</strong></span>
            <span>Erros: <strong style={{ color: D.ink }}>{destinatarios.erro}</strong></span>
          </div>
          {(campanha.status === 'rascunho' || temPendentes) && (
            <button onClick={enviar} disabled={enviando}
              style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: enviando ? 0.6 : 1 }}>
              {enviando ? 'Enviando...' : temPendentes ? `Continuar envio (${destinatarios.pendente} restantes)` : 'Enviar agora'}
            </button>
          )}
          {msg && <p style={{ fontSize: 13, color: msg.includes('Erro') || msg.includes('error') ? D.red : D.green, marginTop: 12 }}>{msg}</p>}
        </section>

        {stats && (destinatarios.enviado > 0) && (
          <section style={{ background: D.surface, border: '1px solid ' + D.line, borderRadius: 12, padding: 20, marginTop: 20 }}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Engajamento</h2>
            <CampanhaChart data={statsParaGrafico(stats)} />
          </section>
        )}
      </div>
    </div>
  )
}
