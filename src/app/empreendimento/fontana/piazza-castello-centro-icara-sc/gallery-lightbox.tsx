'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface GalleryItem { src: string; alt: string }
interface Props { galeria: GalleryItem[]; prefix: string; gradient: string }

export default function GalleryWithLightbox({ galeria, prefix, gradient }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const fechar = useCallback(() => setLightbox(null), [])
  const anterior = useCallback(() => setLightbox(i => i !== null ? (i - 1 + galeria.length) % galeria.length : null), [galeria.length])
  const proximo = useCallback(() => setLightbox(i => i !== null ? (i + 1) % galeria.length : null), [galeria.length])

  useEffect(() => {
    if (lightbox === null) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar()
      if (e.key === 'ArrowLeft') anterior()
      if (e.key === 'ArrowRight') proximo()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [lightbox, fechar, anterior, proximo])

  return (
    <>
      <style>{`
        .${prefix}-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
        .${prefix}-thumb{position:relative;aspect-ratio:4/3;cursor:pointer;overflow:hidden}
        .${prefix}-thumb img{transition:transform .3s}
        .${prefix}-thumb:hover img{transform:scale(1.05)}
        .${prefix}-lb{position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;display:flex;align-items:center;justify-content:center}
        .${prefix}-lb-img{position:relative;width:min(90vw,1200px);height:min(80vh,800px)}
        .${prefix}-lb-btn{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.15);border:none;color:#fff;font-size:2rem;padding:.5rem 1rem;cursor:pointer;z-index:10;border-radius:4px}
        .${prefix}-lb-prev{left:1rem}
        .${prefix}-lb-next{right:1rem}
        .${prefix}-lb-close{position:absolute;top:1rem;right:1rem;background:none;border:none;color:#fff;font-size:2rem;cursor:pointer;z-index:10}
        @media(max-width:640px){.${prefix}-grid{grid-template-columns:repeat(2,1fr)}}
      `}</style>
      <div className={`${prefix}-grid`}>
        {galeria.map((item, i) => (
          <div key={i} className={`${prefix}-thumb`} onClick={() => setLightbox(i)}>
            <Image src={item.src} alt={item.alt} fill sizes="(max-width:640px) 50vw,33vw" style={{objectFit:'cover'}} />
            <div style={{position:'absolute',inset:0,background:gradient,opacity:.2}} />
          </div>
        ))}
      </div>
      {lightbox !== null && (
        <div className={`${prefix}-lb`} onClick={fechar}>
          <div className={`${prefix}-lb-img`} onClick={e => e.stopPropagation()}>
            <Image src={galeria[lightbox].src} alt={galeria[lightbox].alt} fill sizes="90vw" style={{objectFit:'contain'}} />
          </div>
          <button className={`${prefix}-lb-btn ${prefix}-lb-prev`} onClick={e=>{e.stopPropagation();anterior()}}>‹</button>
          <button className={`${prefix}-lb-btn ${prefix}-lb-next`} onClick={e=>{e.stopPropagation();proximo()}}>›</button>
          <button className={`${prefix}-lb-close`} onClick={fechar}>×</button>
        </div>
      )}
    </>
  )
}
