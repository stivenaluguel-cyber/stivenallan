'use client';
import { useState, useEffect, useRef } from 'react';
import { trackPlantaOpen } from '@/lib/tracking'
import { useFocusTrapModal } from '@/lib/a11y/useFocusTrapModal'

type PlantaItem = { src: string; alt: string; label: string; quartos?: number; suites?: number; area?: number }

function fichaTecnica(item: PlantaItem): string | null {
  const partes: string[] = []
  if (item.area) partes.push(`${item.area} m²`)
  if (item.quartos) partes.push(`${item.quartos} dorm.`)
  if (item.suites) partes.push(`${item.suites} suíte${item.suites > 1 ? 's' : ''}`)
  return partes.length ? partes.join(' · ') : null
}

export default function PlantasLightbox({ plantas, accent, trackPlantas }: {
  plantas: PlantaItem[]
  accent: string
  trackPlantas?: { empreendimento: string; content_name: string }
}) {
  const [open, setOpen] = useState<number | null>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useFocusTrapModal(dialogRef, {
    open: open !== null,
    onClose: () => setOpen(null),
    openerRef,
    initialFocusRef: closeBtnRef,
  })

  useEffect(() => {
    if (open === null) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setOpen(i => (i !== null && i > 0 ? i - 1 : i))
      if (e.key === 'ArrowRight') setOpen(i => (i !== null && i < plantas.length - 1 ? i + 1 : i))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, plantas.length])

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {plantas.map((p, i) => {
          const ficha = fichaTecnica(p)
          return (
            <figure key={i} onClick={(e) => { openerRef.current = e.currentTarget; setOpen(i); if (trackPlantas) trackPlantaOpen(p.label, trackPlantas) }}
              role="button" tabIndex={0} aria-label={`Ampliar: ${p.label}`}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openerRef.current = e.currentTarget; setOpen(i); if (trackPlantas) trackPlantaOpen(p.label, trackPlantas) } }}
              style={{ margin: 0, cursor: 'pointer', overflow: 'hidden', position: 'relative', aspectRatio: '4/3', background: '#222' }}>
              <img src={p.src} alt={p.alt}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
              <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', borderRadius: 2, padding: '4px 10px', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff' }}>Planta oficial</div>
              <figcaption style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 0.75rem' }}>
                {p.label}
                {ficha && <span style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.04em', opacity: 0.75, marginTop: 3, textTransform: 'none' }}>{ficha}</span>}
              </figcaption>
            </figure>
          )
        })}
      </div>

      {open !== null && (
        <div ref={dialogRef} onClick={() => setOpen(null)}
          role="dialog" aria-modal="true" aria-label={`Plantas — ${plantas[open].label}`}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <button ref={closeBtnRef} onClick={() => setOpen(null)} aria-label="Fechar galeria"
            style={{ position: 'absolute', top: '1rem', right: '1.25rem', background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', lineHeight: 1 }}>
            ×
          </button>
          {open > 0 && (
            <button onClick={e => { e.stopPropagation(); setOpen(open - 1); }} aria-label="Imagem anterior"
              style={{ position: 'absolute', left: '1rem', background: 'none', border: `1px solid ${accent}`, color: '#fff', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '2px' }}>
              ‹
            </button>
          )}
          <img src={plantas[open].src} alt={plantas[open].alt}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '2px' }} />
          {open < plantas.length - 1 && (
            <button onClick={e => { e.stopPropagation(); setOpen(open + 1); }} aria-label="Próxima imagem"
              style={{ position: 'absolute', right: '1rem', background: 'none', border: `1px solid ${accent}`, color: '#fff', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '2px' }}>
              ›
            </button>
          )}
          <p style={{ position: 'absolute', bottom: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {plantas[open].label}
          </p>
        </div>
      )}
    </>
  )
}
