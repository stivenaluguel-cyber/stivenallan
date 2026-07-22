'use client'
import { openConsentPreferences } from '@/lib/consent'

// Link do rodapé que reabre o gerenciador de consentimento (revogação LGPD).
// Client component mínimo pra manter o Footer como server component.
export function CookiePreferencesLink({ style }: { style?: React.CSSProperties }) {
  return (
    <button
      type="button"
      onClick={openConsentPreferences}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        font: 'inherit',
        cursor: 'pointer',
        textDecoration: 'underline',
        ...style,
      }}
    >
      Preferências de cookies
    </button>
  )
}
