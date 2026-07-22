'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CONSENT_OPEN_EVENT,
  acceptAllConsent,
  getConsent,
  rejectNonEssentialConsent,
  saveConsent,
} from '@/lib/consent'

// Paleta do rodapé — banner segue a identidade escura do site.
const C = {
  bg: '#0d0e10',
  card: '#1a1c1f',
  accent: '#c9a24b',
  muted: '#a7adb4',
  border: '#2c3035',
  text: '#f4f4f4',
}

const btnBase: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  border: `1px solid ${C.border}`,
  background: 'transparent',
  color: C.text,
  whiteSpace: 'nowrap',
}

// Banner de cookies LGPD: "Aceitar todos" / "Rejeitar não essenciais" /
// "Gerenciar preferências" (necessários sempre ativos + analytics + marketing).
// Aparece quando não há decisão salva; reabre pelo link do rodapé
// (openConsentPreferences → CONSENT_OPEN_EVENT). Nada de GA4/Pixel dispara
// antes da decisão — o gate real fica em AnalyticsScripts + lib/tracking.
export function CookieConsent() {
  const [view, setView] = useState<'hidden' | 'banner' | 'prefs'>('hidden')
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(true)

  useEffect(() => {
    const stored = getConsent()
    if (!stored) {
      setView('banner')
    } else {
      setAnalytics(stored.categories.analytics)
      setMarketing(stored.categories.marketing)
    }
    const onOpen = () => {
      const current = getConsent()
      if (current) {
        setAnalytics(current.categories.analytics)
        setMarketing(current.categories.marketing)
      }
      setView('prefs')
    }
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen)
  }, [])

  if (view === 'hidden') return null

  function close() {
    setView('hidden')
  }

  return (
    <div
      role="dialog"
      aria-label="Preferências de cookies"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: C.bg,
        borderTop: `1px solid ${C.border}`,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.45)',
        padding: '18px 20px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {view === 'banner' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
            <p style={{ flex: '1 1 320px', margin: 0, color: C.muted, fontSize: 13, lineHeight: 1.6 }}>
              Usamos cookies para medir o desempenho do site e das campanhas (Google Analytics e Meta).
              Você escolhe o que permitir — os essenciais ao funcionamento não dependem de aceite.{' '}
              <Link href="/politica-de-privacidade" style={{ color: C.accent, textDecoration: 'underline' }}>
                Política de Privacidade
              </Link>
              .
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <button
                type="button"
                onClick={() => setView('prefs')}
                style={{ ...btnBase, color: C.muted }}
              >
                Gerenciar preferências
              </button>
              <button
                type="button"
                onClick={() => {
                  rejectNonEssentialConsent()
                  close()
                }}
                style={btnBase}
              >
                Rejeitar não essenciais
              </button>
              <button
                type="button"
                onClick={() => {
                  acceptAllConsent()
                  close()
                }}
                style={{ ...btnBase, background: C.accent, border: `1px solid ${C.accent}`, color: '#141414' }}
              >
                Aceitar todos
              </button>
            </div>
          </div>
        )}

        {view === 'prefs' && (
          <div>
            <p style={{ margin: '0 0 14px', color: C.text, fontSize: 14, fontWeight: 700 }}>
              Preferências de cookies
            </p>
            <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
              <label
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, background: C.card,
                  border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px',
                }}
              >
                <input type="checkbox" checked disabled aria-label="Cookies necessários (sempre ativos)" style={{ marginTop: 2 }} />
                <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
                  <strong style={{ color: C.text }}>Necessários</strong> (sempre ativos) — funcionamento do site,
                  envio dos formulários e continuidade do seu atendimento.
                </span>
              </label>
              <label
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, background: C.card,
                  border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  aria-label="Cookies de análise"
                  style={{ marginTop: 2 }}
                />
                <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
                  <strong style={{ color: C.text }}>Análise</strong> — Google Analytics, para entender uso do site
                  e melhorar o conteúdo. Sem identificação pessoal.
                </span>
              </label>
              <label
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, background: C.card,
                  border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  aria-label="Cookies de marketing"
                  style={{ marginTop: 2 }}
                />
                <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
                  <strong style={{ color: C.text }}>Marketing</strong> — Meta (Facebook/Instagram) e Google Ads,
                  para medir campanhas e evitar anúncios repetidos.
                </span>
              </label>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  rejectNonEssentialConsent()
                  close()
                }}
                style={{ ...btnBase, color: C.muted }}
              >
                Rejeitar não essenciais
              </button>
              <button
                type="button"
                onClick={() => {
                  saveConsent({ analytics, marketing })
                  close()
                }}
                style={{ ...btnBase, background: C.accent, border: `1px solid ${C.accent}`, color: '#141414' }}
              >
                Salvar preferências
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
