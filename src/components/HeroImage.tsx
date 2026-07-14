'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

// Wrapper de <Image fill /> com fallback gracioso: se o Vercel Image
// Optimization falhar (ex.: 402 em rajada de otimizações simultâneas — visto
// em produção na home, que dispara ~29 imagens de card ao mesmo tempo), o alt
// text do <img> nativo NUNCA fica sobreposto ao header/menu. Em vez disso vira
// um fundo escuro liso, preservando o alt como aria-label pra leitor de tela.
// Antes de desistir, tenta de novo: hosts de terceiros (ex. Estilo Fontana)
// falham de forma transitória em conexões mais lentas, e uma nova tentativa
// costuma resolver sem precisar do fallback.

type Props = ImageProps

const MAX_RETRIES = 2

export function HeroImage({ alt, style, ...props }: Props) {
  const [retries, setRetries] = useState(0)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #1a1814 0%, #26221c 100%)',
          ...(style as React.CSSProperties),
        }}
      />
    )
  }

  // Stopgap: cota de Image Optimization Transformations da Vercel (Hobby) no teto —
  // serve o arquivo original direto do Supabase/Estilo Fontana, sem passar pelo
  // otimizador. Reverter (remover `unoptimized`) se/quando o plano cobrir a demanda.
  return (
    <Image
      key={retries}
      alt={alt}
      style={style}
      onError={() => (retries < MAX_RETRIES ? setRetries((r) => r + 1) : setFailed(true))}
      unoptimized
      {...props}
    />
  )
}
