'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CIDADES_SC = [
  { value: 'Criciúma', label: 'Criciúma' },
  { value: 'Içara', label: 'Içara' },
  { value: 'Nova Veneza', label: 'Nova Veneza' },
  { value: 'Forquilhinha', label: 'Forquilhinha' },
  { value: 'Cocal do Sul', label: 'Cocal do Sul' },
]

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function NovoEmpreendimentoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [construtoras, setConstrutoras] = useState<{ id: string; nome: string; slug: string }[]>([])

  const [form, setForm] = useState({
    nome: '',
    slug: '',
    construtora_id: '',
    cidade: 'Criciúma',
    uf: 'SC',
    bairro: '',
    endereco: '',
    descricao: '',
    status: 'lancamento',
    dorms_min: '',
    dorms_max: '',
    area_min: '',
    area_max: '',
    preco_a_partir: '',
    preco_min: '',
    destaque: false,
    publicado: true,
  })

  useEffect(() => {
    async function fetchConstrutoras() {
      try {
        const res = await fetch('/api/admin/construtoras')
        const data = await res.json()
        setConstrutoras(data || [])
      } catch {}
    }
    fetchConstrutoras()
  }, [])

  // Auto-gerar slug a partir do nome + cidade
  useEffect(() => {
    if (form.nome && form.cidade) {
      const cidadeSlug = slugify(form.cidade)
      const nomeSlug = slugify(form.nome)
      setForm(prev => ({ ...prev, slug: `${nomeSlug}-${cidadeSlug}-sc` }))
    }
  }, [form.nome, form.cidade])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/empreendimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dorms_min: form.dorms_min ? Number(form.dorms_min) : null,
          dorms_max: form.dorms_max ? Number(form.dorms_max) : null,
          area_min: form.area_min ? Number(form.area_min) : null,
          area_max: form.area_max ? Number(form.area_max) : null,
          preco_a_partir: form.preco_a_partir ? Number(form.preco_a_partir) : null,
          preco_min: form.preco_min ? Number(form.preco_min) : null,
          construtora_id: form.construtora_id || null,
          ativo: form.publicado,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Erro ao salvar empreendimento.')
        return
      }

      router.push('/admin/empreendimentos')
      router.refresh()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full bg-[#1a1c1f] border border-[#2c3035] rounded-xl px-4 py-2.5 text-[#f4f4f4] placeholder:text-[#4a5058] focus:outline-none focus:border-[#c9a24b] transition-colors text-sm'
  const labelClass = 'block text-sm text-[#a7adb4] mb-1.5'

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/empreendimentos" className="text-[#a7adb4] hover:text-[#f4f4f4] transition-colors">
          ← Voltar
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold">Novo Empreendimento</h1>
          <p className="text-[#a7adb4] text-sm mt-0.5">Preencha os dados do empreendimento</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção: Identificação */}
        <div className="bg-[#202327] border border-[#2c3035] rounded-2xl p-6">
          <h2 className="font-bold mb-5 text-[#c9a24b]">📋 Identificação</h2>
          <div className="grid gap-4">
            <div>
              <label className={labelClass}>Nome do Empreendimento *</label>
              <input name="nome" value={form.nome} onChange={handleChange} required className={inputClass} placeholder="Ex: Residencial Porto Alegre" />
            </div>
            <div>
              <label className={labelClass}>Slug (URL) *</label>
              <input name="slug" value={form.slug} onChange={handleChange} required className={inputClass} placeholder="residencial-porto-alegre-criciuma-sc" />
              <p className="text-xs text-[#4a5058] mt-1">URL: /empreendimento/construtora/<strong>{form.slug || '...'}</strong></p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Construtora</label>
                <select name="construtora_id" value={form.construtora_id} onChange={handleChange} className={inputClass}>
                  <option value="">Selecione...</option>
                  {construtoras.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Status *</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                  <option value="lancamento">Lançamento</option>
                  <option value="em_obras">Em Obras</option>
                  <option value="pronto">Pronto</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Seção: Localização */}
        <div className="bg-[#202327] border border-[#2c3035] rounded-2xl p-6">
          <h2 className="font-bold mb-5 text-[#c9a24b]">📍 Localização</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Cidade *</label>
                <select name="cidade" value={form.cidade} onChange={handleChange} className={inputClass}>
                  {CIDADES_SC.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Bairro</label>
                <input name="bairro" value={form.bairro} onChange={handleChange} className={inputClass} placeholder="Ex: Centro" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Endereço</label>
              <input name="endereco" value={form.endereco} onChange={handleChange} className={inputClass} placeholder="Rua, número" />
            </div>
          </div>
        </div>

        {/* Seção: Características */}
        <div className="bg-[#202327] border border-[#2c3035] rounded-2xl p-6">
          <h2 className="font-bold mb-5 text-[#c9a24b]">🏠 Características</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Dorms. Mín.</label>
              <input type="number" name="dorms_min" value={form.dorms_min} onChange={handleChange} className={inputClass} placeholder="1" min="0" />
            </div>
            <div>
              <label className={labelClass}>Dorms. Máx.</label>
              <input type="number" name="dorms_max" value={form.dorms_max} onChange={handleChange} className={inputClass} placeholder="4" min="0" />
            </div>
            <div>
              <label className={labelClass}>Área Mín. (m²)</label>
              <input type="number" name="area_min" value={form.area_min} onChange={handleChange} className={inputClass} placeholder="45" min="0" step="0.01" />
            </div>
            <div>
              <label className={labelClass}>Área Máx. (m²)</label>
              <input type="number" name="area_max" value={form.area_max} onChange={handleChange} className={inputClass} placeholder="120" min="0" step="0.01" />
            </div>
            <div>
              <label className={labelClass}>Preço a partir de (R$)</label>
              <input type="number" name="preco_a_partir" value={form.preco_a_partir} onChange={handleChange} className={inputClass} placeholder="300000" min="0" />
            </div>
            <div>
              <label className={labelClass}>Preço Máx. (R$)</label>
              <input type="number" name="preco_min" value={form.preco_min} onChange={handleChange} className={inputClass} placeholder="600000" min="0" />
            </div>
          </div>
        </div>

        {/* Seção: Descrição */}
        <div className="bg-[#202327] border border-[#2c3035] rounded-2xl p-6">
          <h2 className="font-bold mb-5 text-[#c9a24b]">📝 Descrição</h2>
          <textarea
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            rows={4}
            className={inputClass}
            placeholder="Descreva o empreendimento, diferenciais, infraestrutura..."
          />
        </div>

        {/* Configurações */}
        <div className="bg-[#202327] border border-[#2c3035] rounded-2xl p-6">
          <h2 className="font-bold mb-5 text-[#c9a24b]">⚙️ Configurações</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="destaque" checked={form.destaque} onChange={handleChange} className="w-4 h-4 accent-[#c9a24b]" />
              <span className="text-sm">⭐ Exibir em destaque na homepage</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="publicado" checked={form.publicado} onChange={handleChange} className="w-4 h-4 accent-[#c9a24b]" />
              <span className="text-sm">🌐 Publicado (visível no site)</span>
            </label>
          </div>
        </div>

        {/* Botões */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#c9a24b] text-[#1a1305] font-bold px-8 py-3 rounded-xl hover:bg-[#e2c275] transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Empreendimento'}
          </button>
          <Link href="/admin/empreendimentos" className="text-[#a7adb4] hover:text-[#f4f4f4] transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
