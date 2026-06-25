'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

const input = (extra?: object) => ({
  background: '#2a2d31', border: '1px solid #3a3d41', borderRadius: 8,
  color: '#fff', padding: '10px 14px', fontSize: 14, width: '100%',
  boxSizing: 'border-box' as const, outline: 'none', ...extra,
})
const label = { display: 'block', color: '#a7adb4', fontSize: 13, fontWeight: 600, marginBottom: 6 }

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

  function setField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function addTipologia() { setTipologias(prev => [...prev, { dormitorios: 2, suites: 1, vagas: 1, area_privativa_m2: 60, area_total_m2: 70, preco_a_partir_de: 0, preco_ate: 0 }]) }
  function updateTipologia(idx: number, field: string, value: string) { setTipologias(prev => prev.map((t, i) => i === idx ? { ...t, [field]: Number(value) } : t)) }
  function removeTipologia(idx: number) { setTipologias(prev => prev.filter((_, i) => i !== idx)) }
  function addDiferencial() { setDiferenciais(prev => [...prev, { icone: '⭐', descricao: '', categoria: 'lazer' }]) }
  function updateDiferencial(idx: number, field: string, value: string) { setDiferenciais(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d)) }
  function removeDiferencial(idx: number) { setDiferenciais(prev => prev.filter((_, i) => i !== idx)) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess(false)
    try {
      const imagens = form.imagens_urls.split('\n').map(u => u.trim()).filter(Boolean)
      const payload = {
        ...form,
        preco_a_partir: form.preco_a_partir ? Number(form.preco_a_partir) : null,
        imagens_urls: imagens,
        tipologias: tipologias.filter(t => t.area_privativa_m2 > 0),
        diferenciais: diferenciais.filter(d => d.descricao.trim()),
      }
      const res = await fetch(`/api/admin/empreendimentos/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar')
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/empreendimentos'), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#121315', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #2a2d31', borderTopColor: '#c9a24b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ background: '#202327', borderRadius: 12, padding: '24px', marginBottom: 24, border: '1px solid #2a2d31' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, marginTop: 0, color: '#c9a24b' }}>{title}</h2>
      {children}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#121315', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#202327', borderBottom: '1px solid #2a2d31', padding: '0 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', height: 64, gap: 12 }}>
          <a href="/dashboard/empreendimentos" style={{ color: '#a7adb4', textDecoration: 'none', fontSize: 14 }}>← Empreendimentos</a>
          <span style={{ color: '#a7adb4' }}>›</span>
          <span style={{ fontWeight: 600 }}>Editar: {form.nome}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 900, margin: '0 auto', padding: '32px' }}>
        {error && <div style={{ background: '#ef444422', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 16px', borderRadius: 8, marginBottom: 24 }}>{error}</div>}
        {success && <div style={{ background: '#22c55e22', border: '1px solid #22c55e', color: '#22c55e', padding: '12px 16px', borderRadius: 8, marginBottom: 24 }}>✓ Salvo com sucesso! Redirecionando...</div>}

        {section('📋 Informações Básicas',
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div><label style={label}>Nome *</label><input required style={input()} value={form.nome} onChange={e => setField('nome', e.target.value)} /></div>
              <div><label style={label}>Construtora *</label><input required style={input()} value={form.construtora} onChange={e => setField('construtora', e.target.value)} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: 16, marginBottom: 16 }}>
              <div><label style={label}>Cidade *</label><input required style={input()} value={form.cidade} onChange={e => setField('cidade', e.target.value)} /></div>
              <div><label style={label}>UF</label>
                <select style={input()} value={form.uf} onChange={e => setField('uf', e.target.value)}>
                  {['SC','RS','PR','SP','RJ','MG','GO','DF','BA','CE'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label style={label}>Bairro</label><input style={input()} value={form.bairro} onChange={e => setField('bairro', e.target.value)} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div><label style={label}>Endereço</label><input style={input()} value={form.endereco} onChange={e => setField('endereco', e.target.value)} /></div>
              <div><label style={label}>Slug (URL)</label><input style={input()} value={form.slug} onChange={e => setField('slug', e.target.value)} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div><label style={label}>Status Obra</label>
                <select style={input()} value={form.status_obra} onChange={e => setField('status_obra', e.target.value)}>
                  <option value="lancamento">Lançamento</option>
                  <option value="em_obras">Em Obras</option>
                  <option value="pronto">Pronto</option>
                </select>
              </div>
              <div><label style={label}>Status Venda</label>
                <select style={input()} value={form.status_venda} onChange={e => setField('status_venda', e.target.value)}>
                  <option value="ativo">Ativo</option>
                  <option value="pausado">Pausado</option>
                  <option value="encerrado">Encerrado</option>
                </select>
              </div>
              <div><label style={label}>Preço a partir (R$)</label><input type="number" style={input()} value={form.preco_a_partir} onChange={e => setField('preco_a_partir', e.target.value)} /></div>
            </div>
            <div><label style={label}>WhatsApp</label><input style={input()} value={form.whatsapp} onChange={e => setField('whatsapp', e.target.value)} /></div>
          </>
        )}

        {section('📝 Descrição',
          <>
            <div style={{ marginBottom: 16 }}><label style={label}>Descrição Curta</label><input style={input()} value={form.descricao_curta} onChange={e => setField('descricao_curta', e.target.value)} /></div>
            <div><label style={label}>Descrição Completa</label><textarea rows={5} style={{ ...input(), resize: 'vertical' }} value={form.descricao_completa} onChange={e => setField('descricao_completa', e.target.value)} /></div>
          </>
        )}

        {section('🖼️ Imagens e Vídeo',
          <>
            <div style={{ marginBottom: 16 }}><label style={label}>URLs das Imagens (uma por linha)</label><textarea rows={4} style={{ ...input(), resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} value={form.imagens_urls} onChange={e => setField('imagens_urls', e.target.value)} /></div>
            <div><label style={label}>URL do Vídeo</label><input style={input()} value={form.video_url} onChange={e => setField('video_url', e.target.value)} /></div>
          </>
        )}

        {section('🏠 Tipologias',
          <>
            {tipologias.map((t, idx) => (
              <div key={idx} style={{ background: '#2a2d31', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Tipologia {idx + 1}</span>
                  <button type="button" onClick={() => removeTipologia(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18 }}>✕</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 }}>
                  {[['Dormitórios','dormitorios'],['Suítes','suites'],['Vagas','vagas']].map(([l,f]) => (
                    <div key={f}><label style={{ ...label, fontSize: 12 }}>{l}</label><input type="number" min="0" style={input({ padding: '8px' })} value={t[f as keyof Tipologia]} onChange={e => updateTipologia(idx, f, e.target.value)} /></div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  {[['Área Priv. (m²)','area_privativa_m2'],['Área Total (m²)','area_total_m2'],['Preço Partir (R$)','preco_a_partir_de'],['Preço Até (R$)','preco_ate']].map(([l,f]) => (
                    <div key={f}><label style={{ ...label, fontSize: 12 }}>{l}</label><input type="number" min="0" style={input({ padding: '8px' })} value={t[f as keyof Tipologia]} onChange={e => updateTipologia(idx, f, e.target.value)} /></div>
                  ))}
                </div>
              </div>
            ))}
            <button type="button" onClick={addTipologia} style={{ background: 'none', border: '1px dashed #c9a24b', color: '#c9a24b', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', width: '100%' }}>+ Adicionar Tipologia</button>
          </>
        )}

        {section('⭐ Diferenciais',
          <>
            {diferenciais.map((d, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 140px 36px', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                <div><label style={{ ...label, fontSize: 12 }}>Ícone</label><input style={input({ textAlign: 'center' })} value={d.icone} onChange={e => updateDiferencial(idx, 'icone', e.target.value)} /></div>
                <div><label style={{ ...label, fontSize: 12 }}>Descrição</label><input style={input()} value={d.descricao} onChange={e => updateDiferencial(idx, 'descricao', e.target.value)} /></div>
                <div><label style={{ ...label, fontSize: 12 }}>Categoria</label>
                  <select style={input()} value={d.categoria} onChange={e => updateDiferencial(idx, 'categoria', e.target.value)}>
                    {['lazer','seguranca','servicos','infraestrutura','sustentabilidade'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <button type="button" onClick={() => removeDiferencial(idx)} style={{ background: '#ef444422', border: '1px solid #ef444433', color: '#ef4444', borderRadius: 8, cursor: 'pointer', height: 38, fontSize: 16 }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={addDiferencial} style={{ background: 'none', border: '1px dashed #c9a24b', color: '#c9a24b', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', width: '100%' }}>+ Adicionar Diferencial</button>
          </>
        )}

        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => router.push('/dashboard/empreendimentos')} style={{ background: '#2a2d31', color: '#a7adb4', border: 'none', borderRadius: 8, padding: '12px 24px', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
          <button type="submit" disabled={saving} style={{ background: saving ? '#a07a30' : '#c9a24b', color: '#000', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 15 }}>
            {saving ? 'Salvando...' : '✓ Salvar Alterações'}
          </button>
        </div>
      </form>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )
}
