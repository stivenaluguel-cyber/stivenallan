'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

type GalItem = { src: string; alt: string; label: string }

function Lightbox({ images, startIndex, onClose }: { images: GalItem[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex)
  const [zoom, setZoom] = useState(false)
  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length])
  useEffect(() => {
    setIdx(startIndex)
    setZoom(false)
  }, [startIndex])
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose, prev, next])
  const cur = images[idx]
  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.92)', display:'flex', alignItems:'center', justifyContent:'center' }}
    >
      <button onClick={e => { e.stopPropagation(); prev() }} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', fontSize:28, borderRadius:8, width:48, height:48, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
      <div onClick={e => e.stopPropagation()} style={{ position:'relative', maxWidth:'90vw', maxHeight:'88vh', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div
          onClick={() => setZoom(z => !z)}
          style={{ position:'relative', width: zoom ? '90vw' : 'min(800px,88vw)', height: zoom ? '85vh' : 'min(560px,60vh)', cursor: zoom ? 'zoom-out' : 'zoom-in', transition:'all 0.3s' }}
        >
          <Image src={cur.src} alt={cur.alt} fill style={{ objectFit:'contain' }} sizes="90vw" priority />
        </div>
        <span style={{ marginTop:10, color:'rgba(255,255,255,0.75)', fontSize:13, letterSpacing:1 }}>{cur.label}</span>
        <span style={{ marginTop:4, color:'rgba(255,255,255,0.45)', fontSize:12 }}>{idx + 1} / {images.length}</span>
      </div>
      <button onClick={e => { e.stopPropagation(); next() }} style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', fontSize:28, borderRadius:8, width:48, height:48, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
      <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', fontSize:20, borderRadius:8, width:40, height:40, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
    </div>
  )
}

export default function GalleryWithLightbox({ galeria, prefix, gradient }: { galeria: GalItem[]; prefix: string; gradient: string }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <>
      {open !== null && <Lightbox images={galeria} startIndex={open} onClose={() => setOpen(null)} />}
      <div className={`${prefix}gal-grid`}>
        {galeria.map((item, i) => (
          <button key={i} className={`${prefix}gal-item`} onClick={() => setOpen(i)} aria-label={`Ver ${item.label}`}>
            <div className={`${prefix}gal-img-wrap`}>
              <Image src={item.src} alt={item.alt} fill style={{ objectFit:'cover' }} sizes="(max-width:600px) 50vw,(max-width:900px) 33vw,25vw" />
              <div className={`${prefix}gal-overlay`} style={{ background: gradient }} />
            </div>
            <span className={`${prefix}gal-label`}>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  )
}

export function LightboxPhoto({ src, alt, label, cardClass, imgSizes }: { src: string; alt: string; label: string; cardClass: string; imgSizes: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      {open && <Lightbox images={[{ src, alt, label }]} startIndex={0} onClose={() => setOpen(false)} />}
      <button className={cardClass} onClick={() => setOpen(true)} aria-label={`Ver ${label}`} style={{ border:'none', background:'none', padding:0, cursor:'pointer', display:'block', width:'100%' }}>
        <div style={{ position:'relative', width:'100%', height:'100%' }}>
          <Image src={src} alt={alt} fill style={{ objectFit:'cover' }} sizes={imgSizes} />
        </div>
      </button>
    </>
  )
}
