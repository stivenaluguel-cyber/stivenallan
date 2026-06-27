'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

const inp: React.CSSProperties = {
  background: '#e5e7eb', border: '1px solid #3a3d41', borderRadius: 3,
  color: '#161512', padding: '10px 14px', fontSize: 14, width: '100%',
  boxSizing: 'border-box', outline: 'none',
}
const lbl: React.CSSProperties = { display: 'block', color: '#6B655B', fontSize: 13, fontWeight: 600, marginBottom: 6 }
const card: React.CSSProperties = { background: '#FAFAF7', borderRadius: 3, padding: 24, marginBottom: 24, border: '1px solid #2a2d31' }

type Tipologia = { id?: string; dormitorios: number; suites: number; vagas: number; area_privativa_m2: number; area_total_m2: number; preco_a_partir_de: number; preco_ate: number }
type Diferencial = { id?: string; icone: string; descricao: string; categoria: string }

export default function EditarEmpreendimentoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    nome: '', construtora: '', cidade: '', uf: 'SC', slug: '',
    bairro: '', endereco: '', descricao_curta: '', descricao_completa: '',
    status_obra: 'lancamento', status_venda: 'ativo',
    preco_a_partir: '', whatsapp: '', imagens_urls: '', video_url: '',
  })
  const [tipologias, setTipologias] = useState<Tipologia[]>([])
  const [diferenciais, setDiferenciais] = useState<Diferencial[]>([])

  useEffect(() => {
    if (!id) return
    fetch(`/api/admin/empreendimentos/${id}`)
      .then(r => r.json())
      .then(json => {
        if (!json.data) return
        const d = json.data
        setForm({
          nome: d.nome || '', construtora: d.construtora || '',
          cidade: d.cidade || '', uf: d.uf || 'SC', slug: d.slug || '',
          bairro: d.bairro || '', endereco: d.endereco || '',
          descricao_curta: d.descricao_curta || '', descricao_completa: d.descricao_completa || '',
          status_obra: d.status_obra || 'lancamento', status_venda: d.status_venda || 'ativo',
          preco_a_partir: d.preco_a_partir ? String(d.preco_a_partir) : '',
          whatsapp: d.whatsapp || '', video_url: d.video_url || '',
          imagens_urls: Array.isArray(d.imagens_urls) ? d.imagens_urls.join('\n') : (d.imagens_urls || ''),
        })
        setTipologias(d.tipologias || [])
        setDiferenciais(d.diferenciais_empreendimento || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  function setField(f: string, v: string) { setForm(p => ({ ...p, [f]: v })) }
  function addTip() { setTipologias(p => [...p, { dormitorios: 2, suites: 1, vagas: 1, area_privativa_m2: 60, area_total_m2: 70, preco_a_partir_de: 0, preco_ate: 0 }]) }
  function updTip(i: number, f: string, v: string) { setTipologias(p => p.map((t, j) => j === i ? { ...t, [f]: Number(v) } : t)) }
  function remTip(i: number) { setTipologias(p => p.filter((_, j) => j !== i)) }
  function addDif() { setDiferenciais(p => [...p, { icone: '⭐', descricao: '', categoria: 'lazer' }]) }
  function updDif(i: number, f: string, v: string) { setDiferenciais(p => p.map((d, j) => j === i ? { ...d, [f]: v } : d)) }
  function remDif(i: number) { setDiferenciais(p => p.filter((_, j) => j !== i)) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess(false)
    try {
      const imgs = form.imagens_urls.split('\n').map(u => u.trim()).filter(Boolean)
      const res = await fetch(`/api/admin/empreendimentos/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          preco_a_partir: form.preco_a_partir ? Number(form.preco_a_partir) : null,
          imagens_urls: imgs,
          tipologias: tipologias.filter(t => t.area_privativa_m2 > 0),
          diferenciais: diferenciais.filter(d => d.descricao.trim()),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar')
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/empreendimentos'), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F3F2EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #2a2d31', borderTopColor: '#D24E22', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F3F2EE', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#FAFAF7', borderBottom: '1px solid #2a2d31', padding: '0 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', height: 64, gap: 12 }}>
          <a href="/dashboard/empreendimentos" style={{ color: '#6B655B', textDecoration: 'none', fontSize: 14 }}>{'← Empreendimentos'}</a>
          <span style={{ color: '#6B655B' }}>›</span>
          <span style={{ fontWeight: 600 }}>Editar: {form.nome}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
        {error && <div style={{ background: '#ef444422', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 16px', borderRadius: 3, marginBottom: 24 }}>{error}</div>}
        {success && <div style={{ background: '#22c55e22', border: '1px solid #22c55e', color: '#22c55e', padding: '12px 16px', borderRadius: 3, marginBottom: 24 }}>✓ Salvo com sucesso!</div>}

        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, marginTop: 0, color: '#D24E22' }}>📋 Informa��es B�sicas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={lbl}>Nome *</label><input required style={inp} value={form.nome} onChange={e => setField('nome', e.target.value)} /></div>
            <div><label style={lbl}>Construtora *</label><input required style={inp} value={form.construtora} onChange={e => setField('construtora', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={lbl}>Cidade *</label><input required style={inp} value={form.cidade} onChange={e => setField('cidade', e.target.value)} /></div>
            <div><label style={lbl}>UF</label>
              <select style={inp} value={form.uf} onChange={e => setField('uf', e.target.value)}>
                {['SC','RS','PR','SP','RJ','MG','GO','DF','BA','CE'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Bairro</label><input style={inp} value={form.bairro} onChange={e => setField('bairro', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={lbl}>Endere�o</label><input style={inp} value={form.endereco} onChange={e => setField('endereco', e.target.value)} /></div>
            <div><label style={lbl}>Slug (URL)</label><input style={inp} value={form.slug} onChange={e => setField('slug', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={lbl}>Status Obra</label>
              <select style={inp} value={form.status_obra} onChange={e => setField('status_obra', e.target.value)}>
                <option value="lancamento">Lan�amento</option>
                <option value="em_obras">Em Obras</option>
                <option value="pronto">Pronto</option>
              </select>
            </div>
            <div><label style={lbl}>Status Venda</label>
              <select style={inp} value={form.status_venda} onChange={e => setField('status_venda', e.target.value)}>
                <option value="ativo">Ativo</option>
                <option value="pausado">Pausado</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </div>
            <div><label style={lbl}>Pre�o a partir (R$)</label><input type="number" style={inp} value={form.preco_a_partir} onChange={e => setField('preco_a_partir', e.target.value)} /></div>
          </div>
          <div><label style={lbl}>WhatsApp</label><input style={inp} value={form.whatsapp} onChange={e => setField('whatsapp', e.target.value)} /></div>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, marginTop: 0, color: '#D24E22' }}>📝 Descri��o</h2>
          <div style={{ marginBottom: 16 }}><label style={lbl}>Descri��o Curta</label><input style={inp} value={form.descricao_curta} onChange={e => setField('descricao_curta', e.target.value)} /></div>
          <div><label style={lbl}>Descri��o Completa</label><textarea rows={5} style={{ ...inp, resize: 'vertical' } as React.CSSProperties} value={form.descricao_completa} onChange={e => setField('descricao_completa', e.target.value)} /></div>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, marginTop: 0, color: '#D24E22' }}>🖼️ Imagens e V�deo</h2>
          <div style={{ marginBottom: 16 }}><label style={lbl}>URLs das Imagens (uma por linha)</label><textarea rows={4} style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 } as React.CSSProperties} value={form.imagens_urls} onChange={e => setField('imagens_urls', e.target.value)} /></div>
          <div><label style={lbl}>URL do V�deo</label><input style={inp} value={form.video_url} onChange={e => setField('video_url', e.target.value)} /></div>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, marginTop: 0, color: '#D24E22' }}>🏠 Tipologias</h2>
          {tipologias.map((t, idx) => (
            <div key={idx} style={{ background: '#e5e7eb', borderRadius: 3, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Tipologia {idx + 1}</span>
                <button type="button" onClick={() => remTip(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 }}>
                {[['Dormit�rios','dormitorios'],['Su�tes','suites'],['Vagas','vagas']].map(([l,f]) => (
                  <div key={f}><label style={{ ...lbl, fontSize: 12 }}>{l}</label><input type="number" min="0" style={{ ...inp, padding: '3px' }} value={(t as any)[f]} onChange={e => updTip(idx, f, e.target.value)} /></div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {[['�rea Priv (m�)','area_privativa_m2'],['�rea Total (m�)','area_total_m2'],['Pre�o Partir (R$)','preco_a_partir_de'],['Pre�o At� (R$)','preco_ate']].map(([l,f]) => (
                  <div key={f}><label style={{ ...lbl, fontSize: 12 }}>{l}</label><input type="number" min="0" style={{ ...inp, padding: '3px' }} value={(t as any)[f]} onChange={e => updTip(idx, f, e.target.value)} /></div>
                ))}
              </div>
            </div>
          ))}
          <button type="button" onClick={addTip} style={{ background: 'none', border: '1px dashed #D24E22', color: '#D24E22', borderRadius: 3, padding: '8px 16px', cursor: 'pointer', width: '100%' }}>+ Adicionar Tipologia</button>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, marginTop: 0, color: '#D24E22' }}>⭐ Diferenciais</h2>
          {diferenciais.map((d, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 140px 36px', gap: 10, marginBottom: 10, alignItems: 'end' }}>
              <div><label style={{ ...lbl, fontSize: 12 }}>�cone</label><input style={{ ...inp, textAlign: 'center' } as React.CSSProperties} value={d.icone} onChange={e => updDif(idx, 'icone', e.target.value)} /></div>
              <div><label style={{ ...lbl, fontSize: 12 }}>Descri��o</label><input style={inp} value={d.descricao} onChange={e => updDif(idx, 'descricao', e.target.value)} /></div>
              <div><label style={{ ...lbl, fontSize: 12 }}>Categoria</label>
                <select style={inp} value={d.categoria} onChange={e => updDif(idx, 'categoria', e.target.value)}>
                  {['lazer','seguranca','servicos','infraestrutura','sustentabilidade'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button type="button" onClick={() => remDif(idx)} style={{ background: '#ef444422', border: '1px solid #ef444433', color: '#ef4444', borderRadius: 3, cursor: 'pointer', height: 38, fontSize: 16 }}>✕</button>
            </div>
          ))}
          <button type="button" onClick={addDif} style={{ background: 'none', border: '1px dashed #D24E22', color: '#D24E22', borderRadius: 3, padding: '8px 16px', cursor: 'pointer', width: '100%' }}>+ Adicionar Diferencial</button>
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => router.push('/dashboard/empreendimentos')} style={{ background: '#e5e7eb', color: '#6B655B', border: 'none', borderRadius: 3, padding: '12px 24px', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
          <button type="submit" disabled={saving} style={{ background: saving ? '#a07a30' : '#D24E22', color: '#000', border: 'none', borderRadius: 3, padding: '12px 32px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 15 }}>
            {saving ? 'Salvando...' : '✓ Salvar Altera��es'}
          </button>
        </div>
      </form>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )
}
