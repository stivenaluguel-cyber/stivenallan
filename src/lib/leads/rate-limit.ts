// In-memory rate limiter — fixed-window por (identifier + IP), escopo do processo.
//
// Ciente das limitações:
// - Multi-região: cada lambda warm tem seu próprio Map → contadores separados por região.
//   Combina com o honeypot no server pra formar defesa em duas camadas contra abuso barato.
// - Cold start reseta o estado. Vercel mantém lambdas warm ~5min, então burst ataca o mesmo
//   Map por vários minutos antes de resetar — suficiente pra bloquear a maioria dos scripts.
// - Se um dia migrar pra Redis/Upstash, este arquivo é o único ponto de troca.

export type RateLimitConfig = {
  identifier: string
  limit: number
  windowSeconds: number
}

export type RateLimitResult = {
  allowed: boolean
  retryAfter?: number // segundos até o reset — só quando bloqueado
}

type Bucket = { count: number; resetAt: number }

const MAX_BUCKETS = 5000

const buckets = new Map<string, Bucket>()

function evictIfCrowded(now: number): void {
  if (buckets.size < MAX_BUCKETS) return
  // 1º passo: elimina buckets já expirados
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k)
  }
  if (buckets.size < MAX_BUCKETS) return
  // 2º passo: ainda cheio → remove o mais próximo do reset (menor perda de precisão)
  let oldestK: string | null = null
  let oldestReset = Infinity
  for (const [k, v] of buckets) {
    if (v.resetAt < oldestReset) {
      oldestReset = v.resetAt
      oldestK = k
    }
  }
  if (oldestK !== null) buckets.delete(oldestK)
}

export function checkRateLimit(ip: string, cfg: RateLimitConfig): RateLimitResult {
  // Sem IP confiável não dá pra rate-limit; honeypot no server cobre esse caso.
  if (ip === 'unknown') return { allowed: true }

  const now = Date.now()
  const key = `${cfg.identifier}:${ip}`
  const windowMs = cfg.windowSeconds * 1000

  let bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    evictIfCrowded(now)
    bucket = { count: 0, resetAt: now + windowMs }
    buckets.set(key, bucket)
  }
  bucket.count++

  if (bucket.count > cfg.limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }
  return { allowed: true }
}

// Hook exclusivo pra testes — limpa o Map global entre casos.
export function __resetForTests(): void {
  buckets.clear()
}
