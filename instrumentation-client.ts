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
  // Ruído de terceiros, não-acionável: o próprio fbevents.js (Meta Pixel) tenta
  // usar a bridge window.webkit.messageHandlers quando a página abre dentro do
  // navegador in-app do Facebook/Instagram no iOS. Não é código nosso e não
  // impede a captação do lead (confirmado via inserção real na tabela `leads`
  // com UTM completo durante tráfego pago em /casa-guaiba-park) — só teto de
  // alerta falso-positivo no Sentry.
  ignoreErrors: [/window\.webkit\.messageHandlers/i],
})

// Rastreia transições do App Router — Sentry pede pra vincular exceções ao route
// que estava sendo montado quando explodiu. Sem esse export, spans de navegação
// não são gerados e stack traces perdem o contexto de rota.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
