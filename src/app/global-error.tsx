'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

// Captura erros no boundary raiz do App Router — segundo Sentry docs, sem esse
// componente, exceções durante o render do React tree passam batido pela SDK.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body style={{ margin: 0, background: '#F3F2EE', fontFamily: 'system-ui, sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#18181b', marginBottom: 12 }}>Algo deu errado</h1>
          <p style={{ fontSize: 15, color: '#71717a', margin: 0 }}>
            Recarregue a página. Se persistir, entre em contato pelo WhatsApp.
          </p>
        </div>
      </body>
    </html>
  )
}
