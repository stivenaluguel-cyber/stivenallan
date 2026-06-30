'use client';
import { useState } from 'react';

interface GalleryImage { src: string; alt: string; }

export default function GalleryWithLightbox({ images, accent }: { images: GalleryImage[]; accent: string }) {
const [open, setOpen] = useState<number | null>(null);

return (
<>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
{images.map((img, i) => (
<figure key={i} onClick={() => setOpen(i)}
style={{ margin: 0, cursor: 'pointer', overflow: 'hidden', position: 'relative', aspectRatio: '16/10', background: '#222' }}>
<img src={img.src} alt={img.alt}
style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
<figcaption style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 0.75rem' }}>
{img.alt}
</figcaption>
</figure>
))}
</div>

{open !== null && (
<div onClick={() => setOpen(null)}
style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
<button onClick={() => setOpen(null)}
style={{ position: 'absolute', top: '1rem', right: '1.25rem', background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', lineHeight: 1 }}>
×
</button>
{open > 0 && (
<button onClick={e => { e.stopPropagation(); setOpen(open - 1); }}
style={{ position: 'absolute', left: '1rem', background: 'none', border: `1px solid ${accent}`, color: '#fff', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '2px' }}>
‹
</button>
)}
<img src={images[open].src} alt={images[open].alt}
style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '2px' }} />
{open < images.length - 1 && (
<button onClick={e => { e.stopPropagation(); setOpen(open + 1); }}
style={{ position: 'absolute', right: '1rem', background: 'none', border: `1px solid ${accent}`, color: '#fff', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '2px' }}>
›
</button>
)}
<p style={{ position: 'absolute', bottom: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
{images[open].alt}
</p>
</div>
)}
</>
);
}
