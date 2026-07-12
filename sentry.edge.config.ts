import * as Sentry from '@sentry/nextjs'

// Edge runtime = middleware.ts + qualquer rota com `runtime: 'edge'`.
// Sem edge routes hoje, mas Sentry precisa dessa config pro middleware ser instrumentado.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
})
