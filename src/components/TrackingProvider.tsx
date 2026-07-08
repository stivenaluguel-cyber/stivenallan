'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { captureAttribution, trackSpaPageView, trackViewContent } from '@/lib/tracking'

// Atribuição (UTMs/gclid/fbclid) + page_view em navegação SPA + ViewContent nas págs de empreendimento
export function TrackingProvider() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    captureAttribution()
  }, [])

  useEffect(() => {
    if (!pathname) return
    if (isFirstRender.current) {
      // o primeiro PageView já é disparado pelos snippets do layout
      isFirstRender.current = false
    } else {
      trackSpaPageView(pathname)
    }
    const m = pathname.match(/^\/empreendimento\/[^/]+\/([^/]+)/)
    if (m) trackViewContent(m[1])
  }, [pathname])

  return null
}
