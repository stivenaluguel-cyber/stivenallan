import * as Sentry from '@sentry/nextjs'

// Log estruturado: emite uma linha JSON por evento.
// Consumível por Vercel Log Viewer, Log Drain (Datadog/Logtail/Axiom) e grep local.
// Convenção: nunca inclua PII (email/telefone/nome) — só ids opacos + status/counts.
//
// Erros também são enviados pro Sentry via logError (Pilha E4). Sem SENTRY_DSN
// configurada, a captura vira no-op silencioso (design da SDK).

type Level = 'info' | 'warn' | 'error'
type Ctx = Record<string, unknown>

function normalizeError(err: unknown): unknown {
  if (err === undefined || err === null) return undefined
  if (err instanceof Error) {
    return err.stack ? { message: err.message, stack: err.stack } : { message: err.message }
  }
  // Objetos plain (ex: erro do supabase-js com {code, message, hint, details}) — preserva shape.
  if (typeof err === 'object') {
    try {
      return JSON.parse(JSON.stringify(err))
    } catch {
      return String(err)
    }
  }
  return String(err)
}

function emit(level: Level, source: string, message: string, ctx?: Ctx, err?: unknown): void {
  // Reserved keys ganham do ctx — evita que caller sobrescreva source/level/ts por engano.
  const errorField = err !== undefined ? { error: normalizeError(err) } : {}
  const line = JSON.stringify({
    ...(ctx ?? {}),
    ...errorField,
    level,
    source,
    message,
    ts: new Date().toISOString(),
  })
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export function logInfo(source: string, message: string, ctx?: Ctx): void {
  emit('info', source, message, ctx)
}

export function logWarn(source: string, message: string, ctx?: Ctx): void {
  emit('warn', source, message, ctx)
}

export function logError(source: string, message: string, err?: unknown, ctx?: Ctx): void {
  emit('error', source, message, ctx, err)
  // Sentry: canal adicional pra erros. Structured JSON log continua sendo verdade primária.
  try {
    if (err !== undefined && err !== null) {
      Sentry.captureException(err, {
        tags: { source },
        extra: { message, ...(ctx ?? {}) },
      })
    } else {
      Sentry.captureMessage(message, {
        level: 'error',
        tags: { source },
        extra: ctx ?? {},
      })
    }
  } catch {
    // Sentry SDK falhou (bug interno, sem transporte): structured log já foi.
  }
}
