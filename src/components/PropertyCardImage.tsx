'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

const FALLBACK_SRC = '/images/placeholder-imovel.jpg'

type Props = Omit<ImageProps, 'src' | 'alt'> & {
  src: string | null | undefined
  alt: string
  aspectRatio?: 'video' | 'square' | 'portrait'
}

const aspectMap = {
  video: 'aspect-video',
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
}

export function PropertyCardImage({
  src,
  alt,
  aspectRatio = 'video',
  className = '',
  ...props
}: Props) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_SRC)

  return (
    <div className={`relative overflow-hidden bg-zinc-100 ${aspectMap[aspectRatio]} ${className}`}>
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTRlNGU3Ii8+PC9zdmc+"
        onError={() => setImgSrc(FALLBACK_SRC)}
        // Stopgap: cota de Image Optimization Transformations da Vercel (Hobby) no teto —
        // serve o arquivo original direto do Supabase/Estilo Fontana, sem passar pelo
        // otimizador. Reverter (remover essa linha) se/quando o plano cobrir a demanda.
        unoptimized
        {...props}
      />
    </div>
  )
}
