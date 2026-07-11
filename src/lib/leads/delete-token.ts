import { createHmac, timingSafeEqual } from 'node:crypto'

// Token HMAC-SHA256(secret, "delete:"+lead_id), truncado em 32 hex chars = 128 bits.
// Reusa UNSUBSCRIBE_SECRET mas com prefixo de propósito distinto — assim um link de
// descadastro vazado (enviado em todo e-mail da régua) NUNCA é um token de exclusão válido,
// mesmo usando o mesmo secret. Determinístico: mesmo lead → mesmo token.

const TOKEN_LEN = 32
const PURPOSE = 'delete'

export function generateDeleteToken(leadId: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET
  if (!secret) {
    throw new Error('UNSUBSCRIBE_SECRET não configurado')
  }
  return createHmac('sha256', secret).update(`${PURPOSE}:${leadId}`).digest('hex').slice(0, TOKEN_LEN)
}

export function verifyDeleteToken(leadId: string, provided: string | null | undefined): boolean {
  if (typeof provided !== 'string' || provided.length !== TOKEN_LEN) return false
  try {
    const expected = generateDeleteToken(leadId)
    return timingSafeEqual(Buffer.from(expected), Buffer.from(provided))
  } catch {
    return false
  }
}
