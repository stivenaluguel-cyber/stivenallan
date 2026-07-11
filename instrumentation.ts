import * as Sentry from '@sentry/nextjs'

// Next 15 entry-point de instrumentação — chamado uma vez por runtime.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// Captura erros do App Router (route handlers, server components, actions).
// Sem essa export, esses erros passam batido pela SDK.
export const onRequestError = Sentry.captureRequestError
