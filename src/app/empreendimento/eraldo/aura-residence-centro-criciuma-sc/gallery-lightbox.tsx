'use client'
import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'

type GalItem = { src: string; alt: string; label: string }

function Lightbox({ images, startIndex, onClose }: { images: GalItem[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex)
  const [scale, setScale] = useState(1)
  const prev = useCallback(() => { setIdx(i => (i - 1 + images.length) % images.length); setScale(1) }, [images.length])
  const next = useCallback(() => { setIdx(i => (i + 1) % images.length); setScale(1) }, [images.length])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose, prev, next])
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setScale(s => Math.min(4, Math.max(1, s + (e.deltaY < 0 ? 0.15 : -0.15))))
  }
  return (
    <div
      role="dialog" aria-modal="true" aria-label="Galeria de imagens"
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.94)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ position: 'absolute', top: 16, right: 20, display: 'flex', gap: 16, zIndex: 2 }}>
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, letterSpacing: '0.1em', paddingTop: 4 }}>{idx + 1} / {images.length}</span>
        <button onClick={onClose} aria-label="Fechar galeria" style={{ background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>&#215;</button>
      </div>
      <button onClick={prev} aria-label="Anterior" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 4, color: '#fff', fontSize: 22, cursor: 'pointer', padding: '10px 16px', zIndex: 2 }}>&#8249;</button>
      <div
        onWheel={handleWheel}
        style={{ position: 'relative', width: '90vw', maxWidth: 1080, aspectRatio: '4/3', overflow: 'hidden', borderRadius: 4, cursor: scale > 1 ? 'zoom-out' : 'zoom-in' }}
      >
        <Image unoptimized
          src={images[idx].src} alt={images[idx].alt} fill
          style={{ objectFit: 'contain', transform: `scale(${scale})`, transition: 'transform .2s ease' }}
          sizes="90vw" priority
        />
      </div>
      <button onClick={next} aria-label="Próximo" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 4, color: '#fff', fontSize: 22, cursor: 'pointer', padding: '10px 16px', zIndex: 2 }}>&#8250;</button>
      <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.65)', fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{images[idx].label}</p>
    </div>
  )
}

export default function GalleryWithLightbox({ galeria, prefix, gradient, badge }: {
  galeria: GalItem[]
  prefix: string
  gradient: string
  badge?: string
}) {
  const [lb, setLb] = useState({ open: false, index: 0 })
  const open = (i: number) => setLb({ open: true, index: i })
  const close = () => setLb({ open: false, index: 0 })
  return (
    <>
      {lb.open && <Lightbox images={galeria} startIndex={lb.index} onClose={close} />}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {galeria.map((item, i) => (
          <figure
            key={i}
            className={`${prefix}-gcard`}
            style={{ margin: 0, aspectRatio: '4/3', position: 'relative', overflow: 'hidden', borderRadius: 6, cursor: 'zoom-in' }}
            role="button" tabIndex={0} aria-label={`Ampliar: ${item.label}`}
            onClick={() => open(i)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && open(i)}
          >
            <Image unoptimized src={item.src} alt={item.alt} fill style={{ objectFit: 'cover' }} sizes="(min-width:1024px) 33vw,50vw" />
            <div style={{ position: 'absolute', inset: 0, background: gradient }} />
            <figcaption style={{ position: 'absolute', bottom: 12, left: 14, right: 14, color: '#fff', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-hanken), system-ui, sans-serif' }}>{item.label}</figcaption>
            {badge && (
              <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(156,95,46,0.88)', borderRadius: 2, padding: '4px 10px', fontFamily: 'var(--font-hanken), system-ui, sans-serif', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff' }}>{badge}</div>
            )}
          </figure>
        ))}
      </div>
    </>
  )
}
