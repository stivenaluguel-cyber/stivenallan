import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // 10% pra ficar dentro do free tier — Server-side gera spans de todas as
  // route handlers, então até 10% dá boa visibilidade de latência das APIs.
  tracesSampleRate: 0.1,
  debug: false,
})
