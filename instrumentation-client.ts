import * as Sentry from '@sentry/nextjs'

// Sem DSN → Sentry.init vira no-op silencioso (design da SDK).
// Zero risco em dev-local sem env.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Sem performance monitoring — reserva pra Pilha F se justificar custo Vercel.
  tracesSampleRate: 0,
  // Sem session replay — ~50KB gzip extra que não pagamos ainda.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  debug: false,
})

// Rastreia transições do App Router — Sentry pede pra vincular exceções ao route
// que estava sendo montado quando explodiu. Sem esse export, spans de navegação
// não são gerados e stack traces perdem o contexto de rota.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
