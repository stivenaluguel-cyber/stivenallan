'use client'
import { useState, FormEvent } from 'react'

type Props = { empreendimentoSlug: string; empreendimentoNome: string }

export default function LeadForm({ empreendimentoSlug, empreendimentoNome }: Props) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = e.currentTarget
    const nome = (form.elements.namedItem('nome') as HTMLInputElement).value
    const telefone = (form.elements.namedItem('telefone') as HTMLInputElement).value
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const mensagem = (form.elements.namedItem('mensagem') as HTMLTextAreaElement).value
    const canal = (form.elements.namedItem('canal') as HTMLSelectElement).value
    try {
      const resp = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, telefone, email, mensagem, canal_preferido: canal, empreendimento_slug: empreendimentoSlug, pagina_origem: window.location.href }),
      })
      if (resp.ok) { setSuccess(true); form.reset() }
      else setError('Erro ao enviar. Tente pelo WhatsApp.')
    } catch { setError('Erro ao enviar. Tente pelo WhatsApp.') }
    finally { setLoading(false) }
  }

  if (success) return (
    <div className="bg-[#202327] border border-[#1f9d55] rounded-2xl p-6 text-center">
      <div className="text-4xl mb-3">✅</div>
      <h3 className="font-bold text-lg mb-2">Mensagem enviada!</h3>
      <p className="text-[#a7adb4] text-sm">Stiven entrará em contato em breve.</p>
    </div>
  )

  return (
    <div className="bg-[#202327] border border-[#2c3035] rounded-2xl p-6">
      <h3 className="font-bold text-lg mb-1">Quer saber mais?</h3>
      <p className="text-[#a7adb4] text-sm mb-5">Sobre {empreendimentoNome}</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="nome" type="text" placeholder="Seu nome" required className="w-full bg-[#121315] border border-[#2c3035] text-[#f4f4f4] px-4 py-3 rounded-xl text-sm placeholder-[#a7adb4] focus:outline-none focus:border-[#c9a24b] transition-colors" />
        <input name="telefone" type="tel" placeholder="Telefone / WhatsApp" required className="w-full bg-[#121315] border border-[#2c3035] text-[#f4f4f4] px-4 py-3 rounded-xl text-sm placeholder-[#a7adb4] focus:outline-none focus:border-[#c9a24b] transition-colors" />
        <input name="email" type="email" placeholder="E-mail (opcional)" className="w-full bg-[#121315] border border-[#2c3035] text-[#f4f4f4] px-4 py-3 rounded-xl text-sm placeholder-[#a7adb4] focus:outline-none focus:border-[#c9a24b] transition-colors" />
        <select name="canal" className="w-full bg-[#121315] border border-[#2c3035] text-[#f4f4f4] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a24b] transition-colors">
          <option value="whatsapp">Prefiro WhatsApp</option>
          <option value="telefone">Prefiro Telefone</option>
          <option value="email">Prefiro E-mail</option>
        </select>
        <textarea name="mensagem" placeholder="Mensagem" rows={3} className="w-full bg-[#121315] border border-[#2c3035] text-[#f4f4f4] px-4 py-3 rounded-xl text-sm placeholder-[#a7adb4] focus:outline-none focus:border-[#c9a24b] transition-colors resize-none" />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-[#c9a24b] text-[#1a1305] font-bold py-3.5 rounded-xl hover:bg-[#e2c275] transition-colors disabled:opacity-50">
          {loading ? 'Enviando...' : 'Enviar mensagem'}
        </button>
      </form>
    </div>
  )
}
