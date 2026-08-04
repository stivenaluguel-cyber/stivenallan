'use client'
import { useState, type CSSProperties } from 'react'

type Props = {
  nome: string
  texto?: string
  className?: string
  style?: CSSProperties
}

// Compartilhamento nativo (Web Share API) — hoje o único jeito de um
// visitante repassar um imóvel é o link wa.me do WhatsApp. Isso abre o
// menu do sistema (iMessage, e-mail, AirDrop, outro WhatsApp, etc.) em
// quem suporta; navegadores sem suporte (a maioria dos desktops) caem no
// fallback de copiar o link.
export default function ShareButton({ nome, texto, className, style }: Props) {
  const [feedback, setFeedback] = useState<string | null>(null)

  async function compartilhar() {
    const url = window.location.href
    const dados = {
      title: nome,
      text: texto ?? `Dá uma olhada nesse imóvel: ${nome}`,
      url,
    }

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(dados)
      } catch (err) {
        // AbortError = usuário fechou o menu sem escolher nada — comportamento
        // normal, não é falha.
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('[ShareButton] navigator.share falhou', err)
        }
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setFeedback('Link copiado!')
    } catch {
      setFeedback('Não foi possível copiar o link.')
    } finally {
      setTimeout(() => setFeedback(null), 2500)
    }
  }

  return (
    <button type="button" onClick={compartilhar} className={className} style={style} aria-label={`Compartilhar ${nome}`}>
      {feedback ?? 'Compartilhar'}
    </button>
  )
}
