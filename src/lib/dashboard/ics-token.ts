import { timingSafeEqual } from 'node:crypto'

// Token estático (não é por-entidade como o de unsubscribe) — o feed .ics é
// um recurso só, público-mas-secreto: apps de calendário não sabem enviar
// o cookie dashboard_token, então a URL carrega o segredo.

export function verifyIcsToken(provided: string | null | undefined): boolean {
  const secret = process.env.ICS_FEED_TOKEN
  if (!secret || typeof provided !== 'string' || provided.length !== secret.length) return false
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(secret))
  } catch {
    return false
  }
}
