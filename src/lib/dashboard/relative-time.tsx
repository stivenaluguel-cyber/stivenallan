'use client'

import { useEffect, useState } from 'react'

// Wrapper de Intl.RelativeTimeFormat que auto-atualiza a cada 30s.
// Inicial render é vazio para evitar hydration mismatch (server/client podem
// diferir por alguns ms e o texto formatado mudaria); o useEffect popula
// imediatamente após montar.

const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

function format(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now()
  const abs = Math.abs(diffMs)
  if (abs < 60_000) return rtf.format(Math.round(diffMs / 1000), 'second')
  if (abs < 3_600_000) return rtf.format(Math.round(diffMs / 60_000), 'minute')
  if (abs < 86_400_000) return rtf.format(Math.round(diffMs / 3_600_000), 'hour')
  return rtf.format(Math.round(diffMs / 86_400_000), 'day')
}

export function RelativeTime({ iso }: { iso: string }) {
  const [text, setText] = useState('')

  useEffect(() => {
    setText(format(iso))
    const t = setInterval(() => setText(format(iso)), 30_000)
    return () => clearInterval(t)
  }, [iso])

  return (
    <time dateTime={iso} title={new Date(iso).toLocaleString('pt-BR')}>
      {text || '…'}
    </time>
  )
}
