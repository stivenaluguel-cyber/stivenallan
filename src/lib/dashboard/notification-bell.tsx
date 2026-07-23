'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Notificacao = {
  id: string
  tipo: string
  titulo: string
  corpo: string
  link: string | null
  created_at: string
}

const T = { bronze: '#D24E22', border: '#e4e4e7', ink: '#1a1a1a', mutedInk: '#71717a' }

const POLL_MS = 60_000

function tempoRelativo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export function NotificationBell({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const router = useRouter()
  const [items, setItems] = useState<Notificacao[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  async function carregar() {
    try {
      const res = await fetch('/api/admin/notificacoes?lida=false')
      if (!res.ok) return
      const { data } = await res.json()
      setItems(data ?? [])
    } catch {
      // silencioso — o sininho não deve quebrar a navegação do dashboard
    }
  }

  useEffect(() => {
    carregar()
    const id = setInterval(carregar, POLL_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  async function marcarLida(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id))
    await fetch('/api/admin/notificacoes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, lida: true }),
    })
  }

  async function abrir(n: Notificacao) {
    await marcarLida(n.id)
    setOpen(false)
    if (n.link) router.push(n.link)
  }

  const iconColor = variant === 'dark' ? 'rgba(245,241,234,0.85)' : T.mutedInk

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notificações"
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: iconColor, display: 'flex' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {items.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              minWidth: 15,
              height: 15,
              borderRadius: 8,
              background: T.bronze,
              color: '#fff',
              fontSize: 9.5,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              border: '2px solid ' + (variant === 'dark' ? '#131211' : '#fff'),
            }}
          >
            {items.length > 9 ? '9+' : items.length}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            width: 340,
            maxHeight: 420,
            overflowY: 'auto',
            background: '#fff',
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 100,
          }}
        >
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, fontSize: 12.5, fontWeight: 700, color: T.ink }}>
            Notificações {items.length > 0 && `(${items.length})`}
          </div>
          {items.length === 0 ? (
            <div style={{ padding: '18px 14px', fontSize: 12.5, color: T.mutedInk }}>Nenhuma notificação nova.</div>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, display: 'flex', gap: 8, alignItems: 'flex-start' }}
              >
                <button
                  onClick={() => abrir(n)}
                  style={{ all: 'unset', cursor: n.link ? 'pointer' : 'default', flex: 1, minWidth: 0 }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink, marginBottom: 2 }}>{n.titulo}</div>
                  <div style={{ fontSize: 12, color: T.mutedInk, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {n.corpo}
                  </div>
                  <div style={{ fontSize: 10.5, color: T.mutedInk, marginTop: 4 }}>{tempoRelativo(n.created_at)}</div>
                </button>
                <button
                  onClick={() => marcarLida(n.id)}
                  title="Marcar como lida"
                  aria-label={`Marcar "${n.titulo}" como lida`}
                  style={{ flexShrink: 0, background: 'none', border: `1px solid ${T.border}`, borderRadius: 6, width: 22, height: 22, cursor: 'pointer', color: T.mutedInk, fontSize: 12, lineHeight: 1 }}
                >
                  <span aria-hidden="true">✓</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
