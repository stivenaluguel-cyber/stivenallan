'use client'
import { useState } from 'react'

type FaqItem = { pergunta: string; resposta: string }

export function PropertyFAQ({ items, accent = '#18181b' }: { items: FaqItem[]; accent?: string }) {
  const [open, setOpen] = useState<number | null>(null)
  if (!items.length) return null
  return (
    <section style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '28px', color: '#18181b' }}>
        Perguntas frequentes
      </h2>
      {items.map((item, i) => (
        <div key={i} style={{ borderBottom: '1px solid #e4e4e7' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{ width: '100%', textAlign: 'left', padding: '18px 8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 600, color: '#18181b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontFamily: 'inherit' }}
          >
            {item.pergunta}
            <span style={{ color: accent, fontSize: '18px', flexShrink: 0 }}>{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <p style={{ padding: '0 8px 18px', fontSize: '14px', lineHeight: 1.7, color: '#52525b', margin: 0 }}>
              {item.resposta}
            </p>
          )}
        </div>
      ))}
    </section>
  )
}
