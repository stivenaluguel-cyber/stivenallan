import * as Sentry from '@sentry/nextjs'

// Sem DSN → Sentry.init vira no-op silencioso (design da SDK).
// Zero risco em dev-local sem env.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // 10% de sample rate — ~100 transações/dia no free tier caem tranquilo dentro.
  // Sobe se precisar de granularidade maior ou drop se estourar cota.
  tracesSampleRate: 0.1,
  // Rotas + hosts externos que a gente quer que o trace atravesse.
  // Sentry adiciona sentry-trace/baggage headers nesses fetches, permitindo
  // ver o span end-to-end (client → nossa API → Supabase / Meta CAPI).
  tracePropagationTargets: [
    /^\/api\//,
    /supabase\.co/,
    /graph\.facebook\.com/,
    /api\.resend\.com/,
  ],
  // Session Replay continua desligado — adiciona ~50KB gzip + risco de PII.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  debug: false,
})

// Rastreia transições do App Router — Sentry pede pra vincular exceções ao route
// que estava sendo montado quando explodiu. Sem esse export, spans de navegação
// não são gerados e stack traces perdem o contexto de rota.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
