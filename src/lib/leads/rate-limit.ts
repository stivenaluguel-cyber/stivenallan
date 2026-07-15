// Rate limiter por (identifier + IP).
//
// Usa @upstash/ratelimit (Redis, sliding window global) quando UPSTASH_REDIS_REST_URL
// e UPSTASH_REDIS_REST_TOKEN estão configuradas — resolve a falha estrutural do modo
// in-memory (cada lambda/edge da Vercel tem seu próprio contador, então o limite não
// era realmente global entre regiões/instâncias).
//
// Sem as envs (ou se o Upstash falhar/timeout), cai automaticamente pro fallback
// in-memory abaixo — nunca bloqueia lead real por falta de infra opcional.

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { logWarn } from '@/lib/log'

export type RateLimitConfig = {
  identifier: string
  limit: number
  windowSeconds: number
}

export type RateLimitResult = {
  allowed: boolean
  retryAfter?: number // segundos até o reset — só quando bloqueado
}

// --- Upstash (Redis) ---------------------------------------------------

let upstashRedis: Redis | null | undefined // undefined = ainda não checado, null = envs ausentes

function getUpstashRedis(): Redis | null {
  if (upstashRedis !== undefined) return upstashRedis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  upstashRedis = url && token ? new Redis({ url, token }) : null
  return upstashRedis
}

const upstashLimiters = new Map<string, Ratelimit>()

function getUpstashLimiter(cfg: RateLimitConfig): Ratelimit | null {
  const redis = getUpstashRedis()
  if (!redis) return null

  const key = `${cfg.identifier}:${cfg.limit}:${cfg.windowSeconds}`
  let limiter = upstashLimiters.get(key)
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(cfg.limit, `${cfg.windowSeconds} s`),
      prefix: `ratelimit:${cfg.identifier}`,
    })
    upstashLimiters.set(key, limiter)
  }
  return limiter
}

async function checkRateLimitUpstash(
  limiter: Ratelimit,
  ip: string,
): Promise<RateLimitResult> {
  const { success, reset } = await limiter.limit(ip)
  if (success) return { allowed: true }
  return { allowed: false, retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) }
}

// --- Fallback in-memory (fixed-window, escopo do processo) -------------
//
// Ciente das limitações: cold start reseta o estado, e cada instância/região tem
// seu próprio Map. Combina com o honeypot no server pra formar defesa em duas
// camadas contra abuso barato mesmo sem Upstash configurado.

const MAX_BUCKETS = 5000

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

function evictIfCrowded(now: number): void {
  if (buckets.size < MAX_BUCKETS) return
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k)
  }
  if (buckets.size < MAX_BUCKETS) return
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

function checkRateLimitInMemory(ip: string, cfg: RateLimitConfig): RateLimitResult {
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

// --- Entry point ---------------------------------------------------------

export async function checkRateLimit(ip: string, cfg: RateLimitConfig): Promise<RateLimitResult> {
  // Sem IP confiável não dá pra rate-limit; honeypot no server cobre esse caso.
  if (ip === 'unknown') return { allowed: true }

  const limiter = getUpstashLimiter(cfg)
  if (limiter) {
    try {
      return await checkRateLimitUpstash(limiter, ip)
    } catch (err) {
      // Upstash fora do ar/timeout: falha aberta pro in-memory em vez de bloquear leads reais.
      logWarn('rate-limit', 'upstash indisponível, usando fallback in-memory', {
        identifier: cfg.identifier,
        err: err instanceof Error ? err.message : String(err),
      })
      return checkRateLimitInMemory(ip, cfg)
    }
  }

  return checkRateLimitInMemory(ip, cfg)
}

// Hook exclusivo pra testes — limpa o Map global entre casos (só afeta o fallback in-memory;
// os testes não configuram envs do Upstash, então sempre exercem esse caminho).
export function __resetForTests(): void {
  buckets.clear()
}
