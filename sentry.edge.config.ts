import * as Sentry from '@sentry/nextjs'
import { scrubSentryEvent } from './src/lib/sentry-scrub'

// Edge runtime = middleware.ts + qualquer rota com `runtime: 'edge'`.
// Sem edge routes hoje, mas Sentry precisa dessa config pro middleware ser instrumentado.
//
// O middleware é justamente quem LÊ o cookie de sessão do admin, então este
// runtime é o mais exposto ao vazamento — mesma correção do server config.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  dataCollection: { cookies: false },
  beforeSend: scrubSentryEvent,
})
