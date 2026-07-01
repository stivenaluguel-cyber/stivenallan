'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  propertyId: string
  propertyName: string
  propertyDisplayName?: string
  bookPdfUrl: string | null
  autoOpen?: boolean
  buttonClassName?: string
}

function maskPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

export function LeadCaptureModal({ propertyId, propertyName, propertyDisplayName, bookPdfUrl, autoOpen = false, buttonClassName = '' }: Props) {
  const [open, setOpen] = useState(autoOpen)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const backdropRef = useRef<HTMLDivElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const supabase = createClient()
    const { error } = await supabase.from('leads').insert({
      nome: name,
      whatsapp: phone.replace(/\D/g, ''),
      email: email || null,
      property_id: propertyId,
      property_name: propertyName,
      origem: 'Site',
      estagio_funil: 'primeiro_contato',
      source: 'book_download',
    })
    if (error) { setStatus('error'); return }
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: name, whatsapp: phone.replace(/\D/g, ''), property_name: propertyName, email: email || null }),
    }).catch(() => {})
    setStatus('done')
    setTimeout(() => {
      if (bookPdfUrl) window.open(bookPdfUrl, '_blank', 'noopener,noreferrer')
      setOpen(false)
      setStatus('idle')
      setName('')
      setPhone('')
      setEmail('')
    }, 800)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`w-full bg-zinc-900 text-white py-3 px-6 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors ${buttonClassName}`}
      >
        Baixar Catálogo & Plantas
      </button>

      {open && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-0 sm:px-4"
          onClick={(e) => { if (e.target === backdropRef.current) setOpen(false) }}
        >
          <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="bg-zinc-900 px-6 pt-6 pb-5">
              <p className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Material exclusivo</p>
              <h2 className="text-white text-xl font-bold leading-tight">
                {propertyDisplayName || propertyName}
              </h2>
              <p className="text-zinc-400 text-sm mt-1">Catálogo completo + plantas baixas</p>
            </div>

            {status === 'done' ? (
              <div className="px-6 py-10 text-center">
                <p className="text-2xl mb-2">✓</p>
                <p className="text-lg font-semibold text-zinc-900">Pronto! Download iniciando...</p>
                <p className="text-sm text-zinc-500 mt-1">Em instantes você recebe o material.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">

                <div>
                  <label htmlFor="lcm-nome" className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wide">
                    Nome completo
                  </label>
                  <input
                    id="lcm-nome"
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full border border-zinc-300 rounded-lg px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 bg-white outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="lcm-phone" className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wide">
                    WhatsApp
                  </label>
                  <input
                    id="lcm-phone"
                    type="tel"
                    name="tel"
                    autoComplete="tel-national"
                    required
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    placeholder="(48) 99999-9999"
                    inputMode="numeric"
                    className="w-full border border-zinc-300 rounded-lg px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 bg-white outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="lcm-email" className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wide">
                    E-mail <span className="text-zinc-400 font-normal normal-case">(opcional)</span>
                  </label>
                  <input
                    id="lcm-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full border border-zinc-300 rounded-lg px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 bg-white outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                    Erro ao salvar. Tente novamente.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-zinc-900 text-white py-3.5 rounded-lg text-sm font-semibold hover:bg-zinc-700 disabled:opacity-50 transition-colors mt-2"
                >
                  {status === 'loading' ? 'Aguarde...' : 'Receber material gratuitamente'}
                </button>

                <p className="text-center text-xs text-zinc-400">
                  Seus dados são protegidos. Sem spam.
                </p>
              </form>
            )}

            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors text-lg leading-none"
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
