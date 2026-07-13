'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

// Wrapper de <Image fill /> com fallback gracioso: se o Vercel Image
// Optimization falhar (ex.: 402 em rajada de otimizações simultâneas — visto
// em produção na home, que dispara ~29 imagens de card ao mesmo tempo), o alt
// text do <img> nativo NUNCA fica sobreposto ao header/menu. Em vez disso vira
// um fundo escuro liso, preservando o alt como aria-label pra leitor de tela.

type Props = ImageProps

export function HeroImage({ alt, style, ...props }: Props) {
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
  return <Image alt={alt} style={style} onError={() => setFailed(true)} unoptimized {...props} />
}
