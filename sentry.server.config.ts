import * as Sentry from '@sentry/nextjs'
import { scrubSentryEvent } from './src/lib/sentry-scrub'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // 10% pra ficar dentro do free tier — Server-side gera spans de todas as
  // route handlers, então até 10% dá boa visibilidade de latência das APIs.
  tracesSampleRate: 0.1,
  debug: false,
  // Sem isto, `cookies` NÃO resolve para false: vira um objeto com deny-list
  // ({deny:['forwarded','-ip','remote-','via','-user']}), e o
  // requestDataIntegration anexa todos os cookies ao evento — a regra é
  // `include.cookies = dataCollection.cookies !== false`. Conferido no SDK
  // instalado (@sentry/core 10.65.0), não presumido.
  dataCollection: { cookies: false },
  // O `cookies:false` acima remove o dicionário parseado, mas não o header
  // `Cookie` cru em request.headers: no caminho de EVENTO os headers são
  // copiados sem passar por deny-list nenhuma (a filtragem existe só no
  // caminho de span). Ver src/lib/sentry-scrub.ts.
  beforeSend: scrubSentryEvent,
})
