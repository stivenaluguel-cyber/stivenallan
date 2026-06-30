'use client';
import { useState } from 'react';

interface GalleryItem { src: string; alt: string; }

export default function GalleryWithLightbox({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item, i) => (
          <figure key={i} className="relative overflow-hidden rounded-lg cursor-pointer group aspect-[4/3]" onClick={() => setActive(i)}>
            <img src={item.src} alt={item.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            <figcaption className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">{item.alt}</figcaption>
          </figure>
        ))}
      </div>
      {active !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <button className="absolute top-4 right-4 text-white text-3xl leading-none">&times;</button>
          <img src={items[active].src} alt={items[active].alt} className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" />
          <p className="absolute bottom-6 text-white text-sm">{items[active].alt}</p>
        </div>
      )}
    </>
  );
}
