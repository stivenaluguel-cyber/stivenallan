import { randomBytes, createHash, timingSafeEqual } from 'node:crypto'

// Sessão de acesso global do cadastro único: token opaco aleatório (não HMAC
// determinístico como unsubscribe-token.ts) porque precisa ser revogável —
// um token derivado de uma fórmula não pode "parar de funcionar" sem trocar
// o secret pra todo mundo. Só o HASH vai pro banco (lead_access_sessions.token_hash);
// o token em claro só existe no cookie do navegador do visitante.

export const SESSION_COOKIE_NAME = 'sa_session'
export const SESSION_TTL_DAYS = 180
const TOKEN_BYTES = 32 // 256 bits de entropia

export function generateSessionToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url')
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// Comparação por índice único no banco já é o mecanismo de verificação aqui
// (diferente de unsubscribe-token.ts, que compara contra um HMAC recalculado
// no próprio processo) — mas ainda usamos timingSafeEqual ao comparar o hash
// recebido com o hash esperado dentro da mesma requisição, nunca string ===,
// por hábito defensivo caso a query algum dia passe a comparar em memória.
export function tokensMatch(hashA: string, hashB: string): boolean {
  const bufA = Buffer.from(hashA)
  const bufB = Buffer.from(hashB)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export function sessionExpiresAt(fromDate: Date = new Date()): Date {
  return new Date(fromDate.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
}

export function sessionCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/' as const,
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  }
}
