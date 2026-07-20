'use client'
import { useState } from 'react'
import { LeadCaptureModal } from '@/components/LeadCaptureModal'
import { createBrowserClient } from '@supabase/ssr'
import { trackCatalogClick } from '@/lib/tracking'

type Props = {
  slug: string
  construtora_slug: string
  className?: string
  label?: string
  propertyDisplayName?: string
}

export function LeadCaptureButton({
  slug,
  construtora_slug,
  className = 'ml-cta ml-cta-light',
  label = 'Baixar Catálogo & Plantas',
  propertyDisplayName,
}: Props) {
  const [data, setData] = useState<{ id: string; bookPdfUrl: string | null } | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchAndOpen() {
    if (data) return
    trackCatalogClick({ empreendimento: slug, content_name: propertyDisplayName || slug, form_type: 'catalog_modal' })
    setLoading(true)
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

    setData({ id: row?.id ?? '', bookPdfUrl: row?.book_pdf_url ?? null })
    setLoading(false)
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
    <button onClick={fetchAndOpen} className={className} disabled={loading}>
      {loading ? 'Aguarde...' : label}
    </button>
  )
}
