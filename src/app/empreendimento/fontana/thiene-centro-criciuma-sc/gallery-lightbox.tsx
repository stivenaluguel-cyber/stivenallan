'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

type GalItem = { src: string; alt: string; label: string }

function Lightbox({ images, startIndex, onClose }: { images: GalItem[]; startIndex: number; onClose: () => void }) {
const [idx, setIdx] = useState(startIndex)
const [zoom, setZoom] = useState(1)
const [offset, setOffset] = useState({ x: 0, y: 0 })
const [dragging, setDragging] = useState(false)
const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
const [pinchDist, setPinchDist] = useState<number | null>(null)
const prev = useCallback(() => { setIdx(i => (i - 1 + images.length) % images.length); setZoom(1); setOffset({ x: 0, y: 0 }) }, [images.length])
const next = useCallback(() => { setIdx(i => (i + 1) % images.length); setZoom(1); setOffset({ x: 0, y: 0 }) }, [images.length])
useEffect(() => {
document.body.style.overflow = 'hidden'
const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next() }
window.addEventListener('keydown', k)
return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
}, [onClose, prev, next])
const img = images[idx]
return (
<div role="dialog" aria-modal="true" aria-label={"Lightbox — " + img.label} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
<div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 0 }} aria-hidden="true" />
<button onClick={onClose} aria-label="Fechar lightbox" style={{ position: 'absolute', top: 18, right: 22, zIndex: 3, background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer', lineHeight: 1, padding: '4px 10px', fontWeight: 300 }}>&#x2715;</button>
{images.length > 1 && <button onClick={e => { e.stopPropagation(); prev() }} aria-label="Imagem anterior" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 3, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: 28, cursor: 'pointer', padding: '12px 18px', lineHeight: 1, borderRadius: 2 }}>&#8249;</button>}
{images.length > 1 && <button onClick={e => { e.stopPropagation(); next() }} aria-label="Próxima imagem" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 3, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: 28, cursor: 'pointer', padding: '12px 18px', lineHeight: 1, borderRadius: 2 }}>&#8250;</button>}
<div
onWheel={e => { e.preventDefault(); setZoom(z => Math.min(4, Math.max(1, z - e.deltaY * 0.002))) }}
onMouseDown={e => { if (zoom > 1) { setDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }) } }}
onMouseMove={e => { if (dragging) setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }) }}
onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)}
onTouchStart={e => { if (e.touches.length === 2) { const dx = e.touches[0].clientX - e.touches[1].clientX; const dy = e.touches[0].clientY - e.touches[1].clientY; setPinchDist(Math.sqrt(dx * dx + dy * dy)) } }}
onTouchMove={e => { if (e.touches.length === 2 && pinchDist !== null) { const dx = e.touches[0].clientX - e.touches[1].clientX; const dy = e.touches[0].clientY - e.touches[1].clientY; const d = Math.sqrt(dx * dx + dy * dy); setZoom(z => Math.min(4, Math.max(1, z * (d / pinchDist)))); setPinchDist(d) } }}
onTouchEnd={() => setPinchDist(null)}
style={{ position: 'relative', zIndex: 2, maxWidth: '90vw', maxHeight: '80vh', cursor: zoom > 1 ? 'grab' : 'zoom-in', transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`, transformOrigin: 'center center', transition: dragging ? 'none' : 'transform 0.1s ease' }}
>
<img src={img.src} alt={img.alt} style={{ maxWidth: '90vw', maxHeight: '80vh', display: 'block', userSelect: 'none', pointerEvents: 'none', objectFit: 'contain' }} />
</div>
<div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, textAlign: 'center', zIndex: 3, color: 'rgba(255,255,255,0.85)', fontSize: 12, letterSpacing: '0.26em', textTransform: 'uppercase' }}>
{img.label}{images.length > 1 && <span style={{ marginLeft: 14, opacity: 0.55 }}>{idx + 1} / {images.length}</span>}
</div>
</div>
)
}

export default function GalleryWithLightbox({ galeria, prefix, gradient }: {
galeria: GalItem[]
prefix: string
gradient: string
}) {
const [lb, setLb] = useState({ open: false, index: 0 })
const openLb = useCallback((i: number) => setLb({ open: true, index: i }), [])
const closeLb = useCallback(() => setLb(s => ({ ...s, open: false })), [])
return (
<>
{galeria.map((g, i) => (
<figure key={i} className={`${prefix}-gcard`} style={{ margin: 0, aspectRatio: '4 / 3', position: 'relative', overflow: 'hidden', cursor: 'zoom-in' }} role="button" tabIndex={0} aria-label={`Ampliar: ${g.label}`} onClick={() => openLb(i)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && openLb(i)}>
<img src={g.src} alt={g.alt} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .8s ease' }} />
<div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${gradient}, rgba(0,0,0,0) 45%)` }} />
<figcaption className={`${prefix}-onimg`} style={{ position: 'absolute', left: 18, bottom: 16, color: '#fff', fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase' }}>{g.label}</figcaption>
</figure>
))}
{lb.open && <Lightbox images={galeria} startIndex={lb.index} onClose={closeLb} />}
</>
)
}

export function LightboxPhoto({ src, alt, label, cardClass, imgSizes }: {
src: string; alt: string; label: string; cardClass: string; imgSizes: string
}) {
const [open, setOpen] = useState(false)
return (
<>
<div className={cardClass} style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', cursor: 'zoom-in' }} role="button" tabIndex={0} aria-label={`Ampliar: ${label}`} onClick={() => setOpen(true)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(true)}>
<Image src={src} alt={alt} fill loading="lazy" sizes={imgSizes} style={{ objectFit: 'cover' }} unoptimized />
</div>
{open && <Lightbox images={[{ src, alt, label }]} startIndex={0} onClose={() => setOpen(false)} />}
</>
)
}
