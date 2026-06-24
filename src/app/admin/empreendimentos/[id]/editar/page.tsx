'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Construtora {
  id: string
  nome: string
  slug: string
}

interface Empreendimento {
  id: string
  nome: string
  slug: string
  descricao: string | null
  cidade: string
  bairro: string | null
  uf: string
  tipo: string
  status: string
  preco_min: number | null
  preco_max: number | null
  area_min: number | null
  area_max: number | null
  quartos_min: number | null
  quartos_max: number | null
  vagas: number | null
  construtora_id: string
  destaque: boolean
  fotos: string[]
  video_url: string | null
  meta_title: string | null
  meta_description: string | null
}

const CIDADES = [
  { value: 'criciuma', label: 'Criciúma', uf: 'SC' },
  { value: 'icara', label: 'Içara', uf: 'SC' },
  { value: 'nova-veneza', label: 'Nova Veneza', uf: 'SC' },
  { value: 'forquilhinha', label: 'Forquilhinha', uf: 'SC' },
  { value: 'cocal-do-sul', label: 'Cocal do Sul', uf: 'SC' },
]

const TIPOS = ['Apartamento', 'Casa', 'Terreno', 'Comercial', 'Cobertura', 'Studio']
const STATUS = ['lancamento', 'em_obras', 'pronto', 'breve_lancamento']
const STATUS_LABELS: Record<string, string> = {
  lancamento: 'Lançamento',
  em_obras: 'Em Obras',
  pronto: 'Pronto para Morar',
  breve_lancamento: 'Breve Lançamento',
}

export default function EditarEmpreendimentoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [construtoras, setConstrutoras] = useState<Construtora[]>([])
  const [uploadingFotos, setUploadingFotos] = useState(false)

  const [form, setForm] = useState<Empreendimento>({
    id: '',
    nome: '',
    slug: '',
    descricao: '',
    cidade: 'criciuma',
    bairro: '',
    uf: 'SC',
    tipo: 'Apartamento',
    status: 'lancamento',
    preco_min: null,
    preco_max: null,
    area_min: null,
    area_max: null,
    quartos_min: null,
    quartos_max: null,
    vagas: null,
    construtora_id: '',
    destaque: false,
    fotos: [],
    video_url: '',
    meta_title: '',
    meta_description: '',
  })

  const fetchData = useCallback(async () => {
    try {
      const [empRes, constRes] = await Promise.all([
        fetch(`/api/admin/empreendimentos/${id}`),
        fetch('/api/admin/construtoras'),
      ])
      if (!empRes.ok) throw new Error('Empreendimento não encontrado')
      const [emp, constData] = await Promise.all([empRes.json(), constRes.json()])
      setForm(emp)
      setConstrutoras(constData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else if (['preco_min','preco_max','area_min','area_max','quartos_min','quartos_max','vagas'].includes(name)) {
      setForm(prev => ({ ...prev, [name]: value === '' ? null : Number(value) }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleUploadFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingFotos(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('empreendimentoId', id)
      Array.from(files).forEach(file => formData.append('files', file))
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Erro no upload')
      const { urls } = await res.json()
      setForm(prev => ({ ...prev, fotos: [...prev.fotos, ...urls] }))
      setSuccess('Fotos enviadas com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload')
    } finally {
      setUploadingFotos(false)
      e.target.value = ''
    }
  }

  const handleRemoveFoto = (idx: number) => {
    setForm(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== idx) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/empreendimentos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao salvar')
      }
      setSuccess('Empreendimento atualizado com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este empreendimento? Esta ação não pode ser desfeita.')) return
    setDeleting(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/empreendimentos/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao excluir')
      }
      router.push('/admin/empreendimentos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir')
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#c9a24b] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/empreendimentos" className="text-[#a7adb4] hover:text-white text-sm mb-2 inline-block">
            ← Voltar para lista
          </Link>
          <h1 className="text-2xl font-bold text-white">Editar Empreendimento</h1>
          <p className="text-[#a7adb4] text-sm mt-1">ID: {id}</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm disabled:opacity-50"
        >
          {deleting ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-[#202327] rounded-xl p-6 border border-white/5">
          <h2 className="text-white font-semibold mb-4">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-[#a7adb4] mb-1">Nome do Empreendimento *</label>
              <input
                type="text" name="nome" value={form.nome} onChange={handleChange} required
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a7adb4] mb-1">Slug (URL) *</label>
              <input
                type="text" name="slug" value={form.slug} onChange={handleChange} required
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a7adb4] mb-1">Construtora *</label>
              <select
                name="construtora_id" value={form.construtora_id} onChange={handleChange} required
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              >
                <option value="">Selecione...</option>
                {construtoras.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#a7adb4] mb-1">Tipo *</label>
              <select
                name="tipo" value={form.tipo} onChange={handleChange}
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              >
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#a7adb4] mb-1">Status *</label>
              <select
                name="status" value={form.status} onChange={handleChange}
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              >
                {STATUS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#a7adb4] mb-1">Cidade *</label>
              <select
                name="cidade" value={form.cidade} onChange={handleChange}
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              >
                {CIDADES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#a7adb4] mb-1">Bairro</label>
              <input
                type="text" name="bairro" value={form.bairro || ''} onChange={handleChange}
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-[#a7adb4] mb-1">Descrição</label>
              <textarea
                name="descricao" value={form.descricao || ''} onChange={handleChange} rows={4}
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50 resize-none"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <input
                type="checkbox" name="destaque" id="destaque" checked={form.destaque} onChange={handleChange}
                className="w-4 h-4 accent-[#c9a24b]"
              />
              <label htmlFor="destaque" className="text-sm text-[#a7adb4]">Destaque na página inicial</label>
            </div>
          </div>
        </div>

        {/* Valores e Características */}
        <div className="bg-[#202327] rounded-xl p-6 border border-white/5">
          <h2 className="text-white font-semibold mb-4">Valores e Características</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-[#a7adb4] mb-1">Preço Mín (R$)</label>
              <input
                type="number" name="preco_min" value={form.preco_min ?? ''} onChange={handleChange}
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a7adb4] mb-1">Preço Máx (R$)</label>
              <input
                type="number" name="preco_max" value={form.preco_max ?? ''} onChange={handleChange}
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a7adb4] mb-1">Área Mín (m²)</label>
              <input
                type="number" name="area_min" value={form.area_min ?? ''} onChange={handleChange}
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a7adb4] mb-1">Área Máx (m²)</label>
              <input
                type="number" name="area_max" value={form.area_max ?? ''} onChange={handleChange}
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a7adb4] mb-1">Quartos Mín</label>
              <input
                type="number" name="quartos_min" value={form.quartos_min ?? ''} onChange={handleChange}
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a7adb4] mb-1">Quartos Máx</label>
              <input
                type="number" name="quartos_max" value={form.quartos_max ?? ''} onChange={handleChange}
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a7adb4] mb-1">Vagas</label>
              <input
                type="number" name="vagas" value={form.vagas ?? ''} onChange={handleChange}
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              />
            </div>
          </div>
        </div>

        {/* Fotos */}
        <div className="bg-[#202327] rounded-xl p-6 border border-white/5">
          <h2 className="text-white font-semibold mb-4">Fotos</h2>
          {form.fotos.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
              {form.fotos.map((url, idx) => (
                <div key={idx} className="relative group aspect-video bg-[#121315] rounded-lg overflow-hidden">
                  <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveFoto(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >×</button>
                </div>
              ))}
            </div>
          )}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="file" multiple accept="image/*" onChange={handleUploadFotos} className="hidden"
              disabled={uploadingFotos}
            />
            <span className="px-4 py-2 bg-[#c9a24b]/10 text-[#c9a24b] border border-[#c9a24b]/20 rounded-lg text-sm hover:bg-[#c9a24b]/20 transition-colors">
              {uploadingFotos ? 'Enviando...' : '+ Adicionar Fotos'}
            </span>
            <span className="text-[#a7adb4] text-xs">JPG, PNG, WebP — máx 10MB por arquivo</span>
          </label>
        </div>

        {/* Vídeo */}
        <div className="bg-[#202327] rounded-xl p-6 border border-white/5">
          <h2 className="text-white font-semibold mb-4">Vídeo</h2>
          <div>
            <label className="block text-sm text-[#a7adb4] mb-1">URL do Vídeo (YouTube ou Vimeo)</label>
            <input
              type="url" name="video_url" value={form.video_url || ''} onChange={handleChange}
              placeholder="https://www.youtube.com/embed/..."
              className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
            />
          </div>
        </div>

        {/* SEO */}
        <div className="bg-[#202327] rounded-xl p-6 border border-white/5">
          <h2 className="text-white font-semibold mb-4">SEO</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#a7adb4] mb-1">Meta Title (máx 60 caracteres)</label>
              <input
                type="text" name="meta_title" value={form.meta_title || ''} onChange={handleChange} maxLength={60}
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50"
              />
              <p className="text-xs text-[#a7adb4] mt-1">{(form.meta_title || '').length}/60 caracteres</p>
            </div>
            <div>
              <label className="block text-sm text-[#a7adb4] mb-1">Meta Description (máx 160 caracteres)</label>
              <textarea
                name="meta_description" value={form.meta_description || ''} onChange={handleChange} maxLength={160} rows={3}
                className="w-full bg-[#121315] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a24b]/50 resize-none"
              />
              <p className="text-xs text-[#a7adb4] mt-1">{(form.meta_description || '').length}/160 caracteres</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit" disabled={saving}
            className="flex-1 py-3 bg-[#c9a24b] text-[#121315] rounded-lg font-semibold hover:bg-[#b8923f] transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          <Link
            href="/admin/empreendimentos"
            className="px-6 py-3 bg-white/5 text-[#a7adb4] rounded-lg hover:bg-white/10 transition-colors text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
