const JWT_SECRET_MIN_LENGTH = 32

/**
 * Segredo compartilhado por login, middleware e rotas administrativas.
 *
 * Nunca há fallback conhecido: sem configuração válida, o dashboard fecha
 * com segurança em vez de assinar ou aceitar tokens com uma chave pública.
 */
export function getJwtSecret(): Uint8Array | null {
  const value = process.env.JWT_SECRET?.trim()
  if (!value || value.length < JWT_SECRET_MIN_LENGTH) return null
  return new TextEncoder().encode(value)
}

export function requireJwtSecret(): Uint8Array {
  const secret = getJwtSecret()
  if (!secret) {
    throw new Error(`JWT_SECRET deve ter pelo menos ${JWT_SECRET_MIN_LENGTH} caracteres`)
  }
  return secret
}
