'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const inp: React.CSSProperties = {
  background: '#2a2d31', border: '1px solid #3a3d41', borderRadius: 8,
  color: '#fff', padding: '10px 14px', fontSize: 14, width: '100%',
  boxSizing: 'border-box', outline: 'none',
}
const lbl: React.CSSProperties = { display: 'block', color: '#a7adb4', fontSize: 13, fontWeight: 600, marginBottom: 6 }
const card: React.CSSProperties = { background: '#202327', borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid #2a2d31' }

type Tipologia = { dormitorios: number; suites: number; vagas: number; area_privativa_m2: number; area_total_m2: number; preco_a_partir_de: number; preco_ate: number }
type Diferencial = { icone: string; descricao: string; categoria: string }

export default function NovoEmpreendimentoPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nome: '', construtora: '', cidade: '', uf: 'SC', slug: '',
    bairro: '', endereco: '', descricao_curta: '', descricao_completa: '',
    status_obra: 'lancamento', status_venda: 'ativo',
    preco_a_partir: '', whatsapp: '5548991642332',
    imagens_urls: '', video_url: '',
  })
  const [tipologias, setTipologias] = useState<Tipologia[]>([
    { dormitorios: 2, suites: 1, vagas: 1, area_privativa_m2: 60, area_total_m2: 70, preco_a_partir_de: 0, preco_ate: 0 }
  ])
  const [diferenciais, setDiferenciais] = useState<Diferencial[]>([
    { icone: '🏊', descricao: 'Piscina', categoria: 'lazer' }
  ])

  function setField(field: string, value: string) {
    setForm(prev => {
      const updated = { ...prev, [field]: value }
      if (field === 'nome' || field === 'cidade' || field === 'uf') {
        const n = field === 'nome' ? value : prev.nome
        const c = field === 'cidade' ? value : prev.cidade
        const u = field === 'uf' ? value : prev.uf
        updated.slug = (n + ' ' + c + ' ' + u).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      }
      return updated
    })
  }

  function addTip() { setTipologias(p => [...p, { dormitorios: 2, suites: 1, vagas: 1, area_privativa_m2: 60, area_total_m2: 70, preco_a_partir_de: 0, preco_ate: 0 }]) }
  function updTip(i: number, f: string, v: string) { setTipologias(p => p.map((t, j) => j === i ? { ...t, [f]: Number(v) } : t)) }
  function remTip(i: number) { setTipologias(p => p.filter((_, j) => j !== i)) }
  function addDif() { setDiferenciais(p => [...p, { icone: '⭐', descricao: '', categoria: 'lazer' }]) }
  function updDif(i: number, f: string, v: string) { setDiferenciais(p => p.map((d, j) => j === i ? { ...d, [f]: v } : d)) }
  function remDif(i: number) { setDiferenciais(p => p.filter((_, j) => j !== i)) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const imgs = form.imagens_urls.split('\n').map(u => u.trim()).filter(Boolean)
      const res = await fetch('/api/admin/empreendimentos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
      router.push('/dashboard/empreendimentos')
    } catch (err: any) {
      setError(err.message)
    } finally { setSaving(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#121315', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#202327', borderBottom: '1px solid #2a2d31', padding: '0 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', height: 64, gap: 12 }}>
          <a href="/dashboard/empreendimentos" style={{ color: '#a7adb4', textDecoration: 'none', fontSize: 14 }}>{'← Empreendimentos'}</a>
          <span style={{ color: '#a7adb4' }}>›</span>
          <span style={{ fontWeight: 600 }}>Novo Empreendimento</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
        {error && <div style={{ background: '#ef444422', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 16px', borderRadius: 8, marginBottom: 24 }}>{error}</div>}

        {/* Informações Básicas */}
        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, marginTop: 0, color: '#c9a24b' }}>📋 Informações Básicas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={lbl}>Nome do Empreendimento *</label><input required style={inp} value={form.nome} onChange={e => setField('nome', e.target.value)} placeholder="Ex: Monte Leone" /></div>
            <div><label style={lbl}>Construtora *</label><input required style={inp} value={form.construtora} onChange={e => setField('construtora', e.target.value)} placeholder="Ex: Fontana" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={lbl}>Cidade *</label><input required style={inp} value={form.cidade} onChange={e => setField('cidade', e.target.value)} placeholder="Ex: Criciúma" /></div>
            <div><label style={lbl}>UF</label>
              <select style={inp} value={form.uf} onChange={e => setField('uf', e.target.value)}>
                {['SC','RS','PR','SP','RJ','MG','ES','GO','DF','BA','CE','PE','RN','PB','MA'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Bairro</label><input style={inp} value={form.bairro} onChange={e => setField('bairro', e.target.value)} placeholder="Ex: Centro" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={lbl}>Endereço</label><input style={inp} value={form.endereco} onChange={e => setField('endereco', e.target.value)} /></div>
            <div><label style={lbl}>Slug (URL)</label><input style={{ ...inp, color: '#a7adb4' }} value={form.slug} onChange={e => setField('slug', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={lbl} htmlFor="novo-status-obra">Status Obra</label>
              <select id="novo-status-obra" style={inp} value={form.status_obra} onChange={e => setField('status_obra', e.target.value)}>
                <option value="lancamento">Lançamento</option>
                <option value="em_obras">Em Obras</option>
                <option value="pronto">Pronto</option>
              </select>
            </div>
            <div><label style={lbl} htmlFor="novo-status-venda">Status Venda</label>
              <select id="novo-status-venda" style={inp} value={form.status_venda} onChange={e => setField('status_venda', e.target.value)}>
                <option value="ativo">Ativo</option>
                <option value="pausado">Pausado</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </div>
            <div><label style={lbl}>Preço a partir (R$)</label><input type="number" style={inp} value={form.preco_a_partir} onChange={e => setField('preco_a_partir', e.target.value)} placeholder="350000" /></div>
          </div>
          <div><label style={lbl}>WhatsApp (DDI+DDD)</label><input required style={inp} value={form.whatsapp} onChange={e => setField('whatsapp', e.target.value)} /></div>
        </div>

        {/* Descrição */}
        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, marginTop: 0, color: '#c9a24b' }}>📝 Descrição</h2>
          <div style={{ marginBottom: 16 }}><label style={lbl}>Descrição Curta</label><input style={inp} value={form.descricao_curta} onChange={e => setField('descricao_curta', e.target.value)} /></div>
          <div><label style={lbl}>Descrição Completa</label><textarea rows={5} style={{ ...inp, resize: 'vertical' } as React.CSSProperties} value={form.descricao_completa} onChange={e => setField('descricao_completa', e.target.value)} /></div>
        </div>

        {/* Imagens */}
        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, marginTop: 0, color: '#c9a24b' }}>🖼️ Imagens e Vídeo</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>URLs das Imagens (uma por linha)</label>
            <textarea rows={4} style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 } as React.CSSProperties} value={form.imagens_urls} onChange={e => setField('imagens_urls', e.target.value)} placeholder="https://drive.google.com/uc?export=view&id=..." />
          </div>
          <div><label style={lbl}>URL do Vídeo</label><input style={inp} value={form.video_url} onChange={e => setField('video_url', e.target.value)} placeholder="https://youtube.com/embed/..." /></div>
        </div>

        {/* Tipologias */}
        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, marginTop: 0, color: '#c9a24b' }}>🏠 Tipologias</h2>
          {tipologias.map((t, idx) => (
            <div key={idx} style={{ background: '#2a2d31', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Tipologia {idx + 1}</span>
                {tipologias.length > 1 && <button type="button" onClick={() => remTip(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18 }}>✕</button>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 }}>
                {[['Dormitórios','dormitorios'],['Suítes','suites'],['Vagas','vagas']].map(([l,f]) => (
                  <div key={f}><label style={{ ...lbl, fontSize: 12 }}>{l}</label><input type="number" min="0" style={{ ...inp, padding: '8px' }} value={(t as any)[f]} onChange={e => updTip(idx, f, e.target.value)} /></div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {[['Área Priv (m²)','area_privativa_m2'],['Área Total (m²)','area_total_m2'],['Preço Partir (R$)','preco_a_partir_de'],['Preço Até (R$)','preco_ate']].map(([l,f]) => (
                  <div key={f}><label style={{ ...lbl, fontSize: 12 }}>{l}</label><input type="number" min="0" style={{ ...inp, padding: '8px' }} value={(t as any)[f]} onChange={e => updTip(idx, f, e.target.value)} /></div>
                ))}
              </div>
            </div>
          ))}
          <button type="button" onClick={addTip} style={{ background: 'none', border: '1px dashed #c9a24b', color: '#c9a24b', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', width: '100%' }}>+ Adicionar Tipologia</button>
        </div>

        {/* Diferenciais */}
        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, marginTop: 0, color: '#c9a24b' }}>⭐ Diferenciais</h2>
          {diferenciais.map((d, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 140px 36px', gap: 10, marginBottom: 10, alignItems: 'end' }}>
              <div><label style={{ ...lbl, fontSize: 12 }}>Ícone</label><input style={{ ...inp, textAlign: 'center', fontSize: 20 } as React.CSSProperties} value={d.icone} onChange={e => updDif(idx, 'icone', e.target.value)} /></div>
              <div><label style={{ ...lbl, fontSize: 12 }}>Descrição</label><input style={inp} value={d.descricao} onChange={e => updDif(idx, 'descricao', e.target.value)} /></div>
              <div><label style={{ ...lbl, fontSize: 12 }}>Categoria</label>
                <select style={inp} value={d.categoria} onChange={e => updDif(idx, 'categoria', e.target.value)}>
                  {['lazer','seguranca','servicos','infraestrutura','sustentabilidade'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button type="button" onClick={() => remDif(idx)} style={{ background: '#ef444422', border: '1px solid #ef444433', color: '#ef4444', borderRadius: 8, cursor: 'pointer', height: 38, fontSize: 16 }}>✕</button>
            </div>
          ))}
          <button type="button" onClick={addDif} style={{ background: 'none', border: '1px dashed #c9a24b', color: '#c9a24b', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', width: '100%' }}>+ Adicionar Diferencial</button>
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => router.push('/dashboard/empreendimentos')} style={{ background: '#2a2d31', color: '#a7adb4', border: 'none', borderRadius: 8, padding: '12px 24px', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
          <button type="submit" disabled={saving} style={{ background: saving ? '#a07a30' : '#c9a24b', color: '#000', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 15 }}>
            {saving ? 'Salvando...' : '✓ Salvar Empreendimento'}
          </button>
        </div>
      </form>
    </div>
  )
}
