import { createHmac, timingSafeEqual } from 'node:crypto'

// Token HMAC-SHA256(secret, lead_id), truncado em 32 hex chars = 128 bits.
// Determinístico: mesmo lead → mesmo token → link idempotente em qualquer re-envio.
// NUNCA rotacionar UNSUBSCRIBE_SECRET em prod sem antes suportar fallback secundário,
// senão TODOS os links de e-mails já enviados param de funcionar (compliance!).

const TOKEN_LEN = 32

export function generateUnsubscribeToken(leadId: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET
  if (!secret) {
    throw new Error('UNSUBSCRIBE_SECRET não configurado')
  }
  return createHmac('sha256', secret).update(leadId).digest('hex').slice(0, TOKEN_LEN)
}

export function verifyUnsubscribeToken(
  leadId: string,
  provided: string | null | undefined,
): boolean {
  if (typeof provided !== 'string' || provided.length !== TOKEN_LEN) return false
  try {
    const expected = generateUnsubscribeToken(leadId)
    // timingSafeEqual exige buffers do mesmo tamanho — checagem de comprimento acima garante.
    return timingSafeEqual(Buffer.from(expected), Buffer.from(provided))
  } catch {
    return false
  }
}
