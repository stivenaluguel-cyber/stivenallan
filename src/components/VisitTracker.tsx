'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const KEY_VISITAS = 'sa_visitas'
const KEY_ANON = 'sa_anon_id'

export function getAnonId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(KEY_ANON)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY_ANON, id)
  }
  return id
}

export function getVisitas(): { slug: string; ts: string }[] {
  try { return JSON.parse(localStorage.getItem(KEY_VISITAS) ?? '[]') } catch { return [] }
}

// Rastreador de visitas por empreendimento
export function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const m = pathname?.match(/^\/empreendimento\/[^\/]+\/([^\/]+)\//)
    if (!m) return
    const slug = m[1]
    const visitas = getVisitas()
    const last = [...visitas].reverse().find(v => v.slug === slug)
    if (last && Date.now() - new Date(last.ts).getTime() < 30 * 60 * 1000) return
    visitas.push({ slug, ts: new Date().toISOString() })
    localStorage.setItem(KEY_VISITAS, JSON.stringify(visitas.slice(-100)))
  }, [pathname])

  return null
}
