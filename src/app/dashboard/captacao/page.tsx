'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import {
  ESTAGIOS_CAPTACAO,
  calcularMetricasCaptacao,
  type EstagioCaptacao,
} from '@/lib/proprietarios/pipeline'

// Kanban de CAPTAÇÃO DE IMÓVEIS — proprietários que querem vender ou alugar.
// Separado do CRM de compradores de propósito: são negócios diferentes e
// misturá-los arruína a leitura de métrica (ver src/lib/proprietarios/pipeline.ts).

const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512',
  bronze: '#D24E22', muted: '#6B655B', line: 'rgba(26,24,21,0.08)',
}

const fmt = (v: number | null) =>
  v == null ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

type Proprietario = {
  id: string
  nome: string
  whatsapp: string
  email: string | null
  intencao: string
  tipo_imovel: string | null
  cidade: string | null
  bairro: string | null
  endereco: string | null
  metragem: string | null
  dormitorios: string | null
  valor_pretendido: number | null
  valor_acordado: number | null
  estagio: EstagioCaptacao
  autorizacao: boolean
  exclusividade: boolean
  anotacoes: string | null
  origem: string | null
  created_at: string
}

export default function CaptacaoPage() {
  const [itens, setItens] = useState<Proprietario[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)
  const [aberto, setAberto] = useState<Proprietario | null>(null)
  const [modalNovo, setModalNovo] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true); setErro('')
    try {
      const res = await fetch('/api/admin/proprietarios')
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

  const m = useMemo(() => calcularMetricasCaptacao(itens), [itens])

  async function mover(id: string, estagio: EstagioCaptacao) {
    // Otimista: o cartão anda na hora. Se a API falhar, recarrega e volta.
    setItens((p) => p.map((i) => (i.id === id ? { ...i, estagio } : i)))
    try {
      const res = await fetch('/api/admin/proprietarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estagio }),
      })
      if (!res.ok) throw new Error('falhou')
    } catch {
      carregar()
    }
  }

  async function alternarAutorizacao(p: Proprietario) {
    const novo = !p.autorizacao
    setItens((prev) => prev.map((i) => (i.id === p.id ? { ...i, autorizacao: novo } : i)))
    setAberto((a) => (a && a.id === p.id ? { ...a, autorizacao: novo } : a))
    try {
      await fetch('/api/admin/proprietarios', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, autorizacao: novo }),
      })
    } catch { carregar() }
  }

  const KPIS = [
    { l: 'Proprietários', v: String(m.total) },
    { l: 'Em andamento', v: String(m.emAndamento) },
    { l: 'Taxa de contato', v: m.taxaContato + '%' },
    { l: 'Avaliações feitas', v: String(m.avaliacoesRealizadas) },
    { l: 'Captados', v: String(m.captados) },
    { l: 'Publicados', v: String(m.publicados) },
  ]

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.ink, fontFamily: "'Hanken Grotesk',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(20px,2.5vw,36px) clamp(16px,3vw,32px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque',system-ui", fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, margin: 0 }}>
              Captação de Imóveis
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: D.muted, maxWidth: 620, lineHeight: 1.5 }}>
              Proprietários que querem vender ou alugar. Funil separado do CRM de compradores —
              aqui a meta é aumentar a carteira, não fechar venda.
            </p>
          </div>
          <button onClick={() => setModalNovo(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: D.bronze, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Plus size={16} /> Novo proprietário
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
              Nenhum proprietário ainda. Eles entram por aqui quando você cadastra manualmente
              ou quando a campanha de captação começa a gerar contatos.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
            {ESTAGIOS_CAPTACAO.map((col) => {
              const doEstagio = itens.filter((i) => i.estagio === col.key)
              return (
                <div key={col.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (dragId) { mover(dragId, col.key); setDragId(null) } }}
                  style={{ flex: '0 0 260px', width: 260, background: D.surface, borderRadius: 14, padding: 12, border: '1px solid ' + D.line }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: col.cor }} />
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{col.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: D.muted, background: D.bg, borderRadius: 999, padding: '1px 8px' }}>{doEstagio.length}</span>
                  </div>
                  {doEstagio.length === 0 ? (
                    <p style={{ fontSize: 12, color: D.muted, textAlign: 'center', padding: '16px 0' }}>—</p>
                  ) : doEstagio.map((p) => (
                    <div key={p.id} draggable
                      onDragStart={() => setDragId(p.id)}
                      onClick={() => setAberto(p)}
                      style={{ background: '#fff', border: '1px solid ' + D.line, borderRadius: 10, padding: 11, marginBottom: 9, cursor: 'grab' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5 }}>{p.nome}</span>
                        {p.autorizacao && (
                          <span title="Autorização assinada" style={{ fontSize: 10, background: '#DCFCE7', color: '#166534', borderRadius: 999, padding: '2px 6px', fontWeight: 700, whiteSpace: 'nowrap' }}>AUT</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: D.muted, marginTop: 4 }}>
                        {p.intencao === 'alugar' ? 'Alugar' : 'Vender'}
                        {p.tipo_imovel ? ' · ' + p.tipo_imovel : ''}
                        {p.cidade ? ' · ' + p.cidade : ''}
                      </div>
                      {p.valor_pretendido != null && (
                        <div style={{ fontSize: 12, marginTop: 6, fontWeight: 600 }}>{fmt(p.valor_pretendido)}</div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {aberto && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setAberto(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ background: D.bronze, padding: '20px 56px 20px 24px', borderRadius: '16px 16px 0 0' }}>
              <h2 style={{ color: '#fff', fontSize: 19, fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aberto.nome}</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: '4px 0 0' }}>
                {aberto.intencao === 'alugar' ? 'Quer alugar' : 'Quer vender'}
                {aberto.cidade ? ' · ' + aberto.cidade : ''}
              </p>
            </div>
            <button onClick={() => setAberto(null)} aria-label="Fechar"
              style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', color: '#fff' }}>
              <X size={16} />
            </button>
            <div style={{ padding: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <tbody>
                  {[
                    ['WhatsApp', aberto.whatsapp],
                    ['E-mail', aberto.email || '—'],
                    ['Tipo', aberto.tipo_imovel || '—'],
                    ['Bairro', aberto.bairro || '—'],
                    ['Endereço', aberto.endereco || '—'],
                    ['Metragem', aberto.metragem || '—'],
                    ['Dormitórios', aberto.dormitorios || '—'],
                    ['Valor pretendido', fmt(aberto.valor_pretendido)],
                    ['Valor acordado', fmt(aberto.valor_acordado)],
                    ['Origem', aberto.origem || '—'],
                  ].map(([k, v]) => (
                    <tr key={String(k)}>
                      <td style={{ color: D.muted, padding: '7px 0', borderBottom: '1px solid ' + D.line, width: '42%' }}>{k}</td>
                      <td style={{ padding: '7px 0', borderBottom: '1px solid ' + D.line, fontWeight: 600 }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={aberto.autorizacao} onChange={() => alternarAutorizacao(aberto)} />
                <span>
                  Autorização assinada
                  <span style={{ display: 'block', fontSize: 12, color: D.muted, marginTop: 2 }}>
                    Sem isso a captação não conta como concluída — é o que permite anunciar.
                  </span>
                </span>
              </label>

              {aberto.anotacoes && (
                <p style={{ marginTop: 16, fontSize: 13.5, color: '#444', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{aberto.anotacoes}</p>
              )}

              <a href={'https://wa.me/55' + aberto.whatsapp.replace(/\D/g, '')} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', marginTop: 20, background: '#25D366', color: '#fff', borderRadius: 10, padding: 12, fontWeight: 700, textAlign: 'center', textDecoration: 'none', fontSize: 14 }}>
                Chamar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {modalNovo && <ModalNovo onClose={() => setModalNovo(false)} onSaved={() => { setModalNovo(false); carregar() }} />}
    </div>
  )
}

function ModalNovo({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ nome: '', whatsapp: '', intencao: 'vender', tipo_imovel: 'apartamento', cidade: '', bairro: '', valor_pretendido: '' })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const inp = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid ' + D.line, fontSize: 14, marginBottom: 12, background: '#fff', color: D.ink } as const

  async function salvar() {
    if (!f.nome.trim() || !f.whatsapp.trim()) { setErro('Nome e WhatsApp são obrigatórios.'); return }
    setSaving(true); setErro('')
    try {
      const res = await fetch('/api/admin/proprietarios', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, valor_pretendido: f.valor_pretendido ? Number(f.valor_pretendido.replace(/\D/g, '')) : null }),
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
        <h2 style={{ margin: '0 0 18px', fontSize: 18, fontWeight: 700 }}>Novo proprietário</h2>
        <input style={inp} placeholder="Nome *" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} />
        <input style={inp} placeholder="WhatsApp *" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} />
        <select style={inp} value={f.intencao} onChange={(e) => setF({ ...f, intencao: e.target.value })}>
          <option value="vender">Quer vender</option>
          <option value="alugar">Quer alugar</option>
        </select>
        <select style={inp} value={f.tipo_imovel} onChange={(e) => setF({ ...f, tipo_imovel: e.target.value })}>
          {['apartamento', 'casa', 'terreno', 'comercial', 'outro'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input style={inp} placeholder="Cidade" value={f.cidade} onChange={(e) => setF({ ...f, cidade: e.target.value })} />
        <input style={inp} placeholder="Bairro" value={f.bairro} onChange={(e) => setF({ ...f, bairro: e.target.value })} />
        <input style={inp} placeholder="Valor pretendido (R$)" value={f.valor_pretendido} onChange={(e) => setF({ ...f, valor_pretendido: e.target.value })} />
        {erro && <p style={{ color: '#b91c1c', fontSize: 13, margin: '0 0 12px' }}>{erro}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 11, borderRadius: 8, border: '1px solid ' + D.line, background: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={salvar} disabled={saving} style={{ flex: 1, padding: 11, borderRadius: 8, border: 'none', background: D.bronze, color: '#fff', fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
