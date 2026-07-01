'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  propertyId: string
  propertyName: string
  bookPdfUrl: string | null
}

function maskPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

export function LeadCaptureModal({ propertyId, propertyName, bookPdfUrl }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const backdropRef = useRef<HTMLDivElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const supabase = createClient()
    const { error } = await supabase.from('leads').insert({
      name,
      phone: phone.replace(/\D/g, ''),
      property_id: propertyId,
      property_name: propertyName,
      source: 'book_download',
    })
    if (error) { setStatus('error'); return }
    setStatus('done')
    setTimeout(() => {
      if (bookPdfUrl) window.open(bookPdfUrl, '_blank', 'noopener,noreferrer')
      setOpen(false)
      setStatus('idle')
      setName('')
      setPhone('')
    }, 800)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-zinc-900 text-white py-3 px-6 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
      >
        Baixar Book e Plantas
      </button>

      {open && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => { if (e.target === backdropRef.current) setOpen(false) }}
        >
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">
            {status === 'done' ? (
              <div className="text-center py-4">
                <p className="text-lg font-semibold text-zinc-900">Enviando material...</p>
                <p className="text-sm text-zinc-500 mt-1">O download vai iniciar em instantes.</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-zinc-900 mb-1">Book + Plantas</h2>
                <p className="text-sm text-zinc-500 mb-6">{propertyName} — acesso imediato após confirmar.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Nome</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(maskPhone(e.target.value))}
                      placeholder="(48) 99999-9999"
                      className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-900 transition-colors"
                    />
                  </div>
                  {status === 'error' && (
                    <p className="text-xs text-red-500">Erro ao salvar. Tente novamente.</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-zinc-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                  >
                    {status === 'loading' ? 'Aguarde...' : 'Receber material'}
                  </button>
                </form>
              </>
            )}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 text-xl leading-none"
              aria-label="Fechar"
            >×</button>
          </div>
        </div>
      )}
    </>
  )
}
