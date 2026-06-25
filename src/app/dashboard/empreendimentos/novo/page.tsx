'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const input = (extra?: object) => ({
  background: '#2a2d31',
  border: '1px solid #3a3d41',
  borderRadius: 8,
  color: '#fff',
  padding: '10px 14px',
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box' as const,
  outline: 'none',
  ...extra,
})

const label = { display: 'block', color: '#a7adb4', fontSize: 13, fontWeight: 600, marginBottom: 6 }

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
    preco_a_partir: '', whatsapp: '5548916423321',
    imagens_urls: '',
    video_url: '',
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
      // Auto-gera slug
      if (field === 'nome' || field === 'cidade' || field === 'uf') {
        const base = `${field === 'nome' ? value : prev.nome} ${field === 'cidade' ? value : prev.cidade} ${field === 'uf' ? value : prev.uf}`
        updated.slug = base.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      }
      return updated
    })
  }

  function addTipologia() {
    setTipologias(prev => [...prev, { dormitorios: 2, suites: 1, vagas: 1, area_privativa_m2: 60, area_total_m2: 70, preco_a_partir_de: 0, preco_ate: 0 }])
  }

  function updateTipologia(idx: number, field: string, value: string) {
    setTipologias(prev => prev.map((t, i) => i === idx ? { ...t, [field]: Number(value) } : t))
  }

  function removeTipologia(idx: number) {
    setTipologias(prev => prev.filter((_, i) => i !== idx))
  }

  function addDiferencial() {
    setDiferenciais(prev => [...prev, { icone: '⭐', descricao: '', categoria: 'lazer' }])
  }

  function updateDiferencial(idx: number, field: string, value: string) {
    setDiferenciais(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d))
  }

  function removeDiferencial(idx: number) {
    setDiferenciais(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const imagens = form.imagens_urls.split('\n').map(u => u.trim()).filter(Boolean)
      const payload = {
        ...form,
        preco_a_partir: form.preco_a_partir ? Number(form.preco_a_partir) : null,
        imagens_urls: imagens,
        tipologias: tipologias.filter(t => t.area_privativa_m2 > 0),
        diferenciais: diferenciais.filter(d => d.descricao.trim()),
      }
      const res = await fetch('/api/admin/empreendimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar')
      router.push('/dashboard/empreendimentos')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ background: '#202327', borderRadius: 12, padding: '24px', marginBottom: 24, border: '1px solid #2a2d31' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, marginTop: 0, color: '#c9a24b' }}>{title}</h2>
      {children}
    </div>
  )

  const row2 = (children: React.ReactNode) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>{children}</div>
  )

  const row3 = (children: React.ReactNode) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>{children}</div>
  )

  const field = (lbl: string, children: React.ReactNode) => (
    <div><label style={label}>{lbl}</label>{children}</div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#121315', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#202327', borderBottom: '1px solid #2a2d31', padding: '0 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="/dashboard/empreendimentos" style={{ color: '#a7adb4', textDecoration: 'none', fontSize: 14 }}>← Empreendimentos</a>
            <span style={{ color: '#a7adb4' }}>›</span>
            <span style={{ fontWeight: 600 }}>Novo Empreendimento</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 900, margin: '0 auto', padding: '32px' }}>
        {error && (
          <div style={{ background: '#ef444422', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 16px', borderRadius: 8, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {section('📋 Informações Básicas',
          <>
            {row2(
              <>
                {field('Nome do Empreendimento *', <input required style={input()} value={form.nome} onChange={e => setField('nome', e.target.value)} placeholder="Ex: Monte Leone" />)}
                {field('Construtora *', <input required style={input()} value={form.construtora} onChange={e => setField('construtora', e.target.value)} placeholder="Ex: Fontana" />)}
              </>
            )}
            {row3(
              <>
                {field('Cidade *', <input required style={input()} value={form.cidade} onChange={e => setField('cidade', e.target.value)} placeholder="Ex: Criciúma" />)}
                {field('UF', <select style={input()} value={form.uf} onChange={e => setField('uf', e.target.value)}>
                  {['SC','RS','PR','SP','RJ','MG','ES','GO','DF','BA','CE','PE','RN','PB','MA','PI','AL','SE','AM','PA','MT','MS','RO','AC','AP','RR','TO'].map(s => <option key={s}>{s}</option>)}
                </select>)}
                {field('Bairro', <input style={input()} value={form.bairro} onChange={e => setField('bairro', e.target.value)} placeholder="Ex: Centro" />)}
              </>
            )}
            {row2(
              <>
                {field('Endereço', <input style={input()} value={form.endereco} onChange={e => setField('endereco', e.target.value)} placeholder="Rua, número" />)}
                {field('Slug (URL) — gerado automaticamente', <input style={input({ color: '#a7adb4' })} value={form.slug} onChange={e => setField('slug', e.target.value)} placeholder="monte-leone-centro-criciuma-sc" />)}
              </>
            )}
            {row3(
              <>
                {field('Status da Obra', <select style={input()} value={form.status_obra} onChange={e => setField('status_obra', e.target.value)}>
                  <option value="lancamento">Lançamento</option>
                  <option value="em_obras">Em Obras</option>
                  <option value="pronto">Pronto</option>
                </select>)}
                {field('Status de Venda', <select style={input()} value={form.status_venda} onChange={e => setField('status_venda', e.target.value)}>
                  <option value="ativo">Ativo</option>
                  <option value="pausado">Pausado</option>
                  <option value="encerrado">Encerrado</option>
                </select>)}
                {field('Preço a partir de (R$)', <input type="number" style={input()} value={form.preco_a_partir} onChange={e => setField('preco_a_partir', e.target.value)} placeholder="Ex: 350000" />)}
              </>
            )}
            <div style={{ marginBottom: 16 }}>
              {field('WhatsApp (com DDI+DDD)', <input required style={input()} value={form.whatsapp} onChange={e => setField('whatsapp', e.target.value)} placeholder="5548916423321" />)}
            </div>
          </>
        )}

        {section('📝 Descrição',
          <>
            <div style={{ marginBottom: 16 }}>
              {field('Descrição Curta (aparece na listagem)', <input style={input()} value={form.descricao_curta} onChange={e => setField('descricao_curta', e.target.value)} placeholder="Breve apresentação do empreendimento" />)}
            </div>
            <div>
              {field('Descrição Completa', <textarea rows={5} style={{ ...input(), resize: 'vertical' }} value={form.descricao_completa} onChange={e => setField('descricao_completa', e.target.value)} placeholder="Descrição detalhada do empreendimento..." />)}
            </div>
          </>
        )}

        {section('🖼️ Imagens e Vídeo',
          <>
            <div style={{ marginBottom: 16 }}>
              {field('URLs das Imagens (uma por linha)', <textarea rows={5} style={{ ...input(), resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} value={form.imagens_urls} onChange={e => setField('imagens_urls', e.target.value)} placeholder={'https://drive.google.com/uc?export=view&id=...
https://...\nhttps://...'} />)}
              <p style={{ color: '#a7adb4', fontSize: 12, margin: '6px 0 0' }}>Cole os links do Google Drive ou qualquer URL pública de imagem</p>
            </div>
            <div>
              {field('URL do Vídeo (YouTube/Vimeo)', <input style={input()} value={form.video_url} onChange={e => setField('video_url', e.target.value)} placeholder="https://youtube.com/embed/..." />)}
            </div>
          </>
        )}

        {section('🏠 Tipologias',
          <>
            {tipologias.map((t, idx) => (
              <div key={idx} style={{ background: '#2a2d31', borderRadius: 8, padding: 16, marginBottom: 12, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Tipologia {idx + 1}</span>
                  {tipologias.length > 1 && (
                    <button type="button" onClick={() => removeTipologia(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18 }}>✕</button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
                  {[
                    ['Dormitórios', 'dormitorios'],
                    ['Suítes', 'suites'],
                    ['Vagas', 'vagas'],
                  ].map(([lbl, fld]) => (
                    <div key={fld}>
                      <label style={{ ...label, fontSize: 12 }}>{lbl}</label>
                      <input type="number" min="0" style={input({ padding: '8px 12px' })} value={t[fld as keyof Tipologia]} onChange={e => updateTipologia(idx, fld, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {[
                    ['Área Privativa (m²)', 'area_privativa_m2'],
                    ['Área Total (m²)', 'area_total_m2'],
                    ['Preço a partir (R$)', 'preco_a_partir_de'],
                    ['Preço até (R$)', 'preco_ate'],
                  ].map(([lbl, fld]) => (
                    <div key={fld}>
                      <label style={{ ...label, fontSize: 12 }}>{lbl}</label>
                      <input type="number" min="0" style={input({ padding: '8px 12px' })} value={t[fld as keyof Tipologia]} onChange={e => updateTipologia(idx, fld, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button type="button" onClick={addTipologia} style={{ background: 'none', border: '1px dashed #c9a24b', color: '#c9a24b', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', width: '100%' }}>
              + Adicionar Tipologia
            </button>
          </>
        )}

        {section('⭐ Diferenciais / Amenidades',
          <>
            {diferenciais.map((d, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 140px 36px', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                <div>
                  <label style={{ ...label, fontSize: 12 }}>Ícone</label>
                  <input style={input({ textAlign: 'center', fontSize: 20 })} value={d.icone} onChange={e => updateDiferencial(idx, 'icone', e.target.value)} placeholder="🏊" />
                </div>
                <div>
                  <label style={{ ...label, fontSize: 12 }}>Descrição</label>
                  <input style={input()} value={d.descricao} onChange={e => updateDiferencial(idx, 'descricao', e.target.value)} placeholder="Ex: Piscina adulto" />
                </div>
                <div>
                  <label style={{ ...label, fontSize: 12 }}>Categoria</label>
                  <select style={input()} value={d.categoria} onChange={e => updateDiferencial(idx, 'categoria', e.target.value)}>
                    <option value="lazer">Lazer</option>
                    <option value="seguranca">Segurança</option>
                    <option value="servicos">Serviços</option>
                    <option value="infraestrutura">Infraestrutura</option>
                    <option value="sustentabilidade">Sustentabilidade</option>
                  </select>
                </div>
                <button type="button" onClick={() => removeDiferencial(idx)} style={{ background: '#ef444422', border: '1px solid #ef444433', color: '#ef4444', borderRadius: 8, cursor: 'pointer', height: 38, fontSize: 16 }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={addDiferencial} style={{ background: 'none', border: '1px dashed #c9a24b', color: '#c9a24b', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', width: '100%' }}>
              + Adicionar Diferencial
            </button>
          </>
        )}

        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => router.push('/dashboard/empreendimentos')} style={{ background: '#2a2d31', color: '#a7adb4', border: 'none', borderRadius: 8, padding: '12px 24px', cursor: 'pointer', fontWeight: 600 }}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} style={{ background: saving ? '#a07a30' : '#c9a24b', color: '#000', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 15 }}>
            {saving ? 'Salvando...' : '✓ Salvar Empreendimento'}
          </button>
        </div>
      </form>
    </div>
  )
}
