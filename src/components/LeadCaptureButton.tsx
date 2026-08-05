'use client'
import { useState } from 'react'
import { LeadCaptureModal } from '@/components/LeadCaptureModal'
import { createBrowserClient } from '@supabase/ssr'
import { trackCatalogClick, getAttribution } from '@/lib/tracking'
import { useLeadAccessContext } from '@/components/lead-gate/LeadSessionProvider'

type Props = {
  slug: string
  construtora_slug: string
  className?: string
  label?: string
  propertyDisplayName?: string
  // Default false: as 35 páginas fora do piloto do lead gate continuam
  // exatamente com o comportamento de hoje (modal leve, sem esse desvio).
  gateEnabled?: boolean
}

export function LeadCaptureButton({
  slug,
  construtora_slug,
  className = 'ml-cta ml-cta-light',
  label = 'Baixar Catálogo & Plantas',
  propertyDisplayName,
  gateEnabled = false,
}: Props) {
  const access = useLeadAccessContext()
  const [data, setData] = useState<{ id: string; bookPdfUrl: string | null } | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchProperty() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: row } = await supabase
      .from('properties')
      .select('id, book_pdf_url')
      .eq('slug', slug)
      .eq('construtora_slug', construtora_slug)
      .single()
    return { id: row?.id ?? '', bookPdfUrl: row?.book_pdf_url ?? null }
  }

  async function handleClick() {
    // Cadastro único: numa página com o gate ainda travado, este botão NUNCA
    // abre o modal leve (nome/whatsapp/e-mail, sem os 3 selects) — isso
    // criaria um segundo cadastro paralelo, não sincronizado com o
    // resolve_lead_for_gate. Leva pro MESMO formulário do gate.
    if (gateEnabled && access.status !== 'unlocked') {
      access.requestUnlock()
      return
    }

    if (data) return
    trackCatalogClick({ empreendimento: slug, content_name: propertyDisplayName || slug, form_type: 'catalog_modal' })
    setLoading(true)
    const row = await fetchProperty()
    setLoading(false)

    if (gateEnabled) {
      // Já desbloqueado nesta página: sem fricção nenhuma — abre o PDF
      // direto e só registra o marco de interesse.
      if (row.bookPdfUrl) window.open(row.bookPdfUrl, '_blank', 'noopener,noreferrer')
      if (row.id) {
        const attribution = getAttribution()
        fetch('/api/lead-track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          keepalive: true,
          body: JSON.stringify({
            propertyId: row.id,
            propertySlug: slug,
            eventType: 'catalog_download',
            source: typeof window !== 'undefined' ? window.location.pathname : null,
            utm_source: attribution.utm_source ?? null,
            utm_medium: attribution.utm_medium ?? null,
            utm_campaign: attribution.utm_campaign ?? null,
            gclid: attribution.gclid ?? null,
            fbclid: attribution.fbclid ?? null,
            clientEventId: crypto.randomUUID(),
          }),
        }).catch(() => {})
      }
      return
    }

    setData(row)
  }

  if (data) {
    return (
      <LeadCaptureModal
        propertyId={data.id}
        propertyName={slug}
        propertyDisplayName={propertyDisplayName}
        bookPdfUrl={data.bookPdfUrl}
        autoOpen
      />
    )
  }

  return (
    <button onClick={handleClick} className={className} disabled={loading}>
      {loading ? 'Aguarde...' : label}
    </button>
  )
}
