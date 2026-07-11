import type { NextRequest } from 'next/server'

// Nome do campo honeypot — escolhido para NÃO parecer campo real (evita autofill de
// password managers). Renderizado invisível no client; se vier preenchido, é bot.
export const HONEYPOT_FIELD = 'hp_url'

export function isBotSubmission(body: unknown): boolean {
  if (body === null || typeof body !== 'object') return false
  const v = (body as Record<string, unknown>)[HONEYPOT_FIELD]
  return typeof v === 'string' && v.trim() !== ''
}

// Extrai o IP do cliente respeitando a cadeia de proxies do Vercel.
// x-forwarded-for pode vir com múltiplos IPs "cliente, proxy1, proxy2" — o primeiro é o cliente real.
export function extractIp(req: NextRequest | { headers: Headers }): string {
  const headers = req.headers
  const xff = headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = headers.get('x-real-ip')?.trim()
  if (realIp) return realIp
  return 'unknown'
}
