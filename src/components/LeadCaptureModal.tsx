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
        className={`w-full bg-zinc-900 text-white py-3 px-6 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors ${buttonClassName ?? ''}`}
      >
        Baixar Catálogo & Plantas
      </button>

      {open && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={(e) => { if (e.target === backdropRef.current) setOpen(false) }}
        >
          <div
            className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#ffffff', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
          >
            {/* Botão fechar */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              style={{
                position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '18px', lineHeight: 1,
              }}
            >×</button>

            {/* Header */}
            <div style={{ background: '#18181b', padding: '24px 24px 20px' }}>
              <p style={{ color: '#a1a1aa', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                Material exclusivo
              </p>
              <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', margin: '0 0 4px', lineHeight: 1.2 }}>
                {propertyDisplayName || propertyName}
              </h2>
              <p style={{ color: '#71717a', fontSize: '13px', margin: 0 }}>
                Catálogo completo + plantas baixas
              </p>
            </div>

            {/* Corpo */}
            <div style={{
              padding: '24px',
              backgroundColor: '#ffffff',
              isolation: 'isolate',
              position: 'relative',
            }}>
              {status === 'done' ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>✓</div>
                  <p style={{ fontWeight: '600', color: '#18181b', fontSize: '16px', margin: '0 0 4px' }}>Pronto! Download iniciando...</p>
                  <p style={{ color: '#71717a', fontSize: '13px', margin: 0 }}>Em instantes você recebe o material.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="lcm-nome" style={{ fontSize: '11px', fontWeight: '600', color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
                      style={{ width: '100%', border: '1.5px solid #d4d4d8', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#18181b', backgroundColor: '#ffffff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', appearance: 'none', WebkitAppearance: 'none' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#18181b')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#d4d4d8')}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="lcm-phone" style={{ fontSize: '11px', fontWeight: '600', color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
                      style={{ width: '100%', border: '1.5px solid #d4d4d8', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#18181b', backgroundColor: '#ffffff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', appearance: 'none', WebkitAppearance: 'none' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#18181b')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#d4d4d8')}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="lcm-email" style={{ fontSize: '11px', fontWeight: '600', color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      E-mail <span style={{ color: '#a1a1aa', fontWeight: '400', textTransform: 'none', fontSize: '11px' }}>(opcional)</span>
                    </label>
                    <input
                      id="lcm-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      style={{ width: '100%', border: '1.5px solid #d4d4d8', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#18181b', backgroundColor: '#ffffff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', appearance: 'none', WebkitAppearance: 'none' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#18181b')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#d4d4d8')}
                    />
                  </div>

                  {status === 'error' && (
                    <p style={{ fontSize: '12px', color: '#ef4444', background: '#fef2f2', padding: '8px 12px', borderRadius: '8px', margin: 0 }}>
                      Erro ao salvar. Tente novamente.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    style={{ width: '100%', background: '#18181b', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: '600', cursor: status === 'loading' ? 'not-allowed' : 'pointer', opacity: status === 'loading' ? 0.6 : 1, fontFamily: 'inherit' }}
                  >
                    {status === 'loading' ? 'Aguarde...' : 'Receber material gratuitamente'}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '11px', color: '#a1a1aa', margin: 0 }}>
                    Seus dados são protegidos. Sem spam.
                  </p>
                </form>
              )}
            </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
