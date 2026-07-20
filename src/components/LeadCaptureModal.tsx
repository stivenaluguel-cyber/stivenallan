'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getAnonId, getVisitas } from '@/components/VisitTracker'
import { getAttribution, trackLeadEvent, sendLeadToCapi, trackFormOpen, trackFormStart, trackFormSubmit } from '@/lib/tracking'

type Props = {
  propertyId: string
  propertyName: string
  propertyDisplayName?: string
  bookPdfUrl: string | null
  autoOpen?: boolean
}

const KEY_LEAD = 'sa_lead'

function maskPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

export function LeadCaptureModal({ propertyId, propertyName, propertyDisplayName, bookPdfUrl, autoOpen = false }: Props) {
  const [open, setOpen] = useState(autoOpen)
  const storedLead = typeof window !== 'undefined' ? localStorage.getItem(KEY_LEAD) : null
  const returningLead: { id: string; nome: string } | null = storedLead ? JSON.parse(storedLead) : null
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [hp, setHp] = useState('') // honeypot: usuário real nunca vê, bot preenche → server responde 400
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const backdropRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)
  const funilParams = { empreendimento: propertyName, content_name: propertyDisplayName || propertyName, form_type: 'catalog_modal' as const }

  // Cada abertura do modal (inclui autoOpen no mount e reaberturas depois de fechar)
  // dispara form_open uma vez e reabre a janela do form_start — sem isso, fechar e
  // reabrir o mesmo modal nunca mais contaria um novo "início de preenchimento".
  useEffect(() => {
    if (!open) return
    trackFormOpen(funilParams)
    startedRef.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function markStarted() {
    if (startedRef.current) return
    startedRef.current = true
    trackFormStart(funilParams)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    let leadId: string | null = null
    // Aba aberta ainda dentro do gesto de clique — Safari bloqueia window.open() chamado após um await
    const pdfTab = bookPdfUrl ? window.open('', '_blank') : null
    try {
      const res = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: name,
          whatsapp: phone.replace(/\D/g, ''),
          email: email || null,
          property_id: propertyId,
          property_name: propertyName,
          hp_url: hp,
          ...getAttribution(),
        }),
      })
      if (!res.ok) { pdfTab?.close(); setStatus('error'); return }
      const json = await res.json()
      leadId = json?.id ?? null
      const eventId = crypto.randomUUID()
      trackLeadEvent(`Catálogo ${propertyName}`, eventId, { email: email || null, telefone: phone, nome: name })
      sendLeadToCapi({ event_id: eventId, nome: name, telefone: phone.replace(/\D/g, ''), email: email || null, content_name: `Catálogo ${propertyName}` })
      trackFormSubmit(funilParams)
    } catch {
      pdfTab?.close()
      setStatus('error')
      return
    }
  try {
    if (leadId) {
      localStorage.setItem(KEY_LEAD, JSON.stringify({ id: leadId, nome: name }))
      const supabase = createClient()
      const visitas = getVisitas()
      if (visitas.length) {
        await supabase.from('lead_eventos').insert(
          visitas.map(v => ({ lead_id: leadId, anon_id: getAnonId(), tipo: 'visita', slug: v.slug, created_at: v.ts }))
        )
      }
      await supabase.from('lead_eventos').insert({ lead_id: leadId, anon_id: getAnonId(), tipo: 'download', slug: propertyName })
    }
  } catch {}
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: name, whatsapp: phone.replace(/\D/g, ''), property_name: propertyName, email: email || null }),
    }).catch(() => {})
    setStatus('done')
    if (pdfTab && bookPdfUrl) pdfTab.location.href = bookPdfUrl
    setTimeout(() => {
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
        style={{ width: '100%', background: '#18181b', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Baixar Catálogo & Plantas
      </button>

      {open && (
        <div
          ref={backdropRef}
          onClick={(e) => { if (e.target === backdropRef.current) setOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: 0 }}
        >
          <div style={{ position: 'relative', width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.3)', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

            {/* Fechar */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 10, width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
            >×</button>

            {/* Header */}
            <div style={{ background: '#18181b', padding: '28px 24px 20px', textAlign: 'center' }}>
              <p style={{ color: '#a1a1aa', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 8px', fontWeight: 500 }}>Material exclusivo</p>
              <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '700', margin: '0 0 6px', lineHeight: 1.2 }}>
                {propertyDisplayName || propertyName}
              </h2>
              <p style={{ color: '#71717a', fontSize: '13px', margin: 0 }}>Catálogo completo + plantas baixas</p>
            </div>

            {/* Corpo */}
            <div style={{ padding: '24px', backgroundColor: '#ffffff' }}>
              {returningLead && status === 'idle' ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>👋</div>
                  <p style={{ fontWeight: '700', color: '#18181b', fontSize: '17px', margin: '0 0 6px', fontFamily: 'inherit' }}>
                    Olá, {returningLead.nome.split(' ')[0]}!
                  </p>
                  <p style={{ color: '#71717a', fontSize: '13px', margin: '0 0 20px', fontFamily: 'inherit' }}>
                    Seu acesso já está liberado.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      // Abre já no clique (URL já conhecida) — evita bloqueio de popup do Safari por causa do await abaixo
                      if (bookPdfUrl) window.open(bookPdfUrl, '_blank', 'noopener,noreferrer')
                      setOpen(false)
                      const supabase = createClient()
                      supabase.from('lead_eventos').insert({ lead_id: returningLead.id, anon_id: getAnonId(), tipo: 'download', slug: propertyName }).then(() => {})
                    }}
                    style={{ width: '100%', background: '#18181b', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '12px' }}
                  >
                    Baixar material
                  </button>
                  <button
                    type="button"
                    onClick={() => { localStorage.removeItem(KEY_LEAD); window.location.reload() }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#a1a1aa', textDecoration: 'underline', fontFamily: 'inherit' }}
                  >
                    Não é você? Cadastrar outro contato
                  </button>
                </div>
              ) : status === 'done' ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px', color: '#22c55e' }}>✓</div>
                  <p style={{ fontWeight: '700', color: '#18181b', fontSize: '17px', margin: '0 0 6px', fontFamily: 'inherit' }}>Pronto! Download iniciando...</p>
                  <p style={{ color: '#71717a', fontSize: '13px', margin: 0, fontFamily: 'inherit' }}>Em instantes você recebe o material.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>

                  {/* Honeypot invisível: bots preenchem, humanos não veem. */}
                  <div
                    aria-hidden="true"
                    style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}
                  >
                    <input
                      type="text"
                      name="hp_url"
                      tabIndex={-1}
                      autoComplete="off"
                      value={hp}
                      onChange={(e) => setHp(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label htmlFor="lcm-nome" style={{ display: 'block', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'inherit' }}>
                      Nome completo
                    </label>
                    <input
                      id="lcm-nome" type="text" name="name" autoComplete="name" required
                      value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      style={{ display: 'block', width: '100%', border: '1.5px solid #e4e4e7', borderRadius: '10px', padding: '12px 14px', fontSize: '15px', color: '#18181b', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', WebkitAppearance: 'none' }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#18181b'; markStarted() }}
                      onBlur={e => (e.currentTarget.style.borderColor = '#e4e4e7')}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label htmlFor="lcm-phone" style={{ display: 'block', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'inherit' }}>
                      WhatsApp
                    </label>
                    <input
                      id="lcm-phone" type="tel" name="tel" autoComplete="tel-national" required
                      value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))}
                      placeholder="(48) 99999-9999" inputMode="numeric"
                      style={{ display: 'block', width: '100%', border: '1.5px solid #e4e4e7', borderRadius: '10px', padding: '12px 14px', fontSize: '15px', color: '#18181b', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', WebkitAppearance: 'none' }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#18181b'; markStarted() }}
                      onBlur={e => (e.currentTarget.style.borderColor = '#e4e4e7')}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label htmlFor="lcm-email" style={{ display: 'block', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'inherit' }}>
                      E-mail <span style={{ fontWeight: '400', textTransform: 'none', color: '#a1a1aa' }}>(opcional)</span>
                    </label>
                    <input
                      id="lcm-email" type="email" name="email" autoComplete="email"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      style={{ display: 'block', width: '100%', border: '1.5px solid #e4e4e7', borderRadius: '10px', padding: '12px 14px', fontSize: '15px', color: '#18181b', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', WebkitAppearance: 'none' }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#18181b'; markStarted() }}
                      onBlur={e => (e.currentTarget.style.borderColor = '#e4e4e7')}
                    />
                  </div>

                  {status === 'error' && (
                    <p style={{ fontSize: '12px', color: '#ef4444', background: '#fef2f2', padding: '8px 12px', borderRadius: '8px', margin: 0, fontFamily: 'inherit' }}>
                      Erro ao salvar. Tente novamente.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    style={{ width: '100%', background: '#18181b', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: status === 'loading' ? 'not-allowed' : 'pointer', opacity: status === 'loading' ? 0.6 : 1, fontFamily: 'inherit', marginTop: '4px' }}
                  >
                    {status === 'loading' ? 'Aguarde...' : 'Receber material gratuitamente'}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '11px', color: '#a1a1aa', margin: 0, fontFamily: 'inherit', lineHeight: 1.5 }}>
                    Usamos seus dados só para retornar seu contato sobre {propertyDisplayName || propertyName} pelo WhatsApp ou e-mail.{' '}
                    <Link href="/politica-de-privacidade" style={{ color: '#71717a', textDecoration: 'underline' }}>
                      Política de Privacidade
                    </Link>
                    .
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
